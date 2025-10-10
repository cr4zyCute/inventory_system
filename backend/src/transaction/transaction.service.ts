import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TransactionService {
  constructor(private prisma: PrismaService) {}

  async createTransaction(transactionData: any) {
    try {
      console.log('💾 Creating transaction in database:', transactionData);

      // Auto-assign cashier if missing
      if (!transactionData.cashierId || !transactionData.cashierName || transactionData.cashierName === 'Unknown') {
        console.log('🔧 Auto-assigning cashier for transaction...');
        
        // Find any active cashier to assign
        const availableCashier = await this.prisma.user.findFirst({
          where: {
            role: 'CASHIER',
            isActive: true
          }
        });
        
        if (availableCashier) {
          transactionData.cashierId = availableCashier.id;
          transactionData.cashierName = `${availableCashier.firstName} ${availableCashier.lastName}`;
          console.log(`✅ Auto-assigned cashier: ${transactionData.cashierName}`);
        }
      }

      // Check for potential duplicates (same amount and cashier within last minute)
      if (transactionData.totalAmount && transactionData.cashierId) {
        const oneMinuteAgo = new Date(Date.now() - 60000);
        const existingTransaction = await this.prisma.transaction.findFirst({
          where: {
            totalAmount: transactionData.totalAmount,
            cashierId: transactionData.cashierId,
            createdAt: {
              gte: oneMinuteAgo
            }
          },
          include: {
            items: {
              include: {
                product: true
              }
            },
            cashier: true
          }
        });
        
        if (existingTransaction) {
          console.log('⚠️ Potential duplicate transaction detected, returning existing transaction');
          return existingTransaction;
        }
      }

      // Create the transaction with items
      const transaction = await this.prisma.transaction.create({
        data: {
          transactionId: transactionData.transactionId || `TXN-${Date.now()}`,
          totalAmount: transactionData.totalAmount,
          paymentMethod: transactionData.paymentMethod || 'cash',
          status: transactionData.status || 'completed',
          cashierId: transactionData.cashierId,
          cashierName: transactionData.cashierName || 'Unknown',
          cashReceived: transactionData.cashReceived,
          changeAmount: transactionData.changeAmount,
          cardLastFour: transactionData.cardLastFour,
          cardApprovalCode: transactionData.cardApprovalCode,
          items: {
            create: transactionData.items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity || 1, // Add the missing quantity field
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice
            }))
          }
        },
        include: {
          items: {
            include: {
              product: true
            }
          },
          cashier: true
        }
      });

      console.log('✅ Transaction created successfully:', transaction.id);
      return transaction;
    } catch (error) {
      console.error('❌ Error creating transaction:', error);
      throw error;
    }
  }

  async getTransactions(limit = 50, offset = 0, cashierId?: string) {
    try {
      // Build where clause based on cashierId filter
      const whereClause: any = {};
      if (cashierId) {
        whereClause.cashierId = cashierId;
      }

      const transactions = await this.prisma.transaction.findMany({
        where: whereClause,
        take: limit,
        skip: offset,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          items: {
            include: {
              product: true
            }
          },
          cashier: true
        }
      });

      console.log(`Retrieved ${transactions.length} transactions${cashierId ? ` for cashier ${cashierId}` : ''}`);
      return transactions;
    } catch (error) {
      console.error('Error getting transactions:', error);
      throw error;
    }
  }

  async getTransactionById(id: string) {
    try {
      const transaction = await this.prisma.transaction.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              product: true
            }
          },
          cashier: true
        }
      });

      return transaction;
    } catch (error) {
      console.error('❌ Error getting transaction by ID:', error);
      throw error;
    }
  }

  async getTransactionsByDateRange(startDate: Date, endDate: Date) {
    try {
      const transactions = await this.prisma.transaction.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          items: {
            include: {
              product: true
            }
          },
          cashier: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return transactions;
    } catch (error) {
      console.error('❌ Error getting transactions by date range:', error);
      throw error;
    }
  }

  async getTransactionStats() {
    try {
      const totalTransactions = await this.prisma.transaction.count();
      const totalRevenue = await this.prisma.transaction.aggregate({
        _sum: {
          totalAmount: true
        }
      });

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const todayTransactions = await this.prisma.transaction.count({
        where: {
          createdAt: {
            gte: todayStart,
            lte: todayEnd
          }
        }
      });

      const todayRevenue = await this.prisma.transaction.aggregate({
        where: {
          createdAt: {
            gte: todayStart,
            lte: todayEnd
          }
        },
        _sum: {
          totalAmount: true
        }
      });

      return {
        totalTransactions,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        todayTransactions,
        todayRevenue: todayRevenue._sum.totalAmount || 0
      };
    } catch (error) {
      console.error('❌ Error getting transaction stats:', error);
      throw error;
    }
  }

  async fixCashierLinks() {
    try {
      console.log('🔧 Starting to fix cashier links...');
      
      // Get all transactions that don't have cashierId or have "Unknown" cashierName
      const transactionsToFix = await this.prisma.transaction.findMany({
        where: {
          OR: [
            { cashierId: null },
            { cashierId: '' },
            { cashierName: 'Unknown' }
          ]
        }
      });

      console.log(`📋 Found ${transactionsToFix.length} transactions to fix`);

      // Get all users to match against
      const users = await this.prisma.user.findMany();
      console.log(`👥 Found ${users.length} users in database`);

      let fixedCount = 0;
      let updatedTransactions: any[] = [];

      for (const transaction of transactionsToFix) {
        let matchedUser: any = null;

        // Try to match by cashierName
        if (transaction.cashierName && transaction.cashierName !== 'Unknown') {
          // Try to match by full name (firstName + lastName)
          matchedUser = users.find(user => 
            `${user.firstName} ${user.lastName}` === transaction.cashierName
          ) || null;

          // If not found, try to match by username
          if (!matchedUser) {
            matchedUser = users.find(user => 
              user.username === transaction.cashierName
            ) || null;
          }

          // If not found, try to match by firstName only
          if (!matchedUser) {
            matchedUser = users.find(user => 
              user.firstName === transaction.cashierName
            ) || null;
          }
        }

        // If still no match, try to assign to a default cashier user
        if (!matchedUser) {
          matchedUser = users.find(user => user.role === 'CASHIER') || null;
        }

        if (matchedUser) {
          // Update the transaction with the matched user
          const updatedTransaction = await this.prisma.transaction.update({
            where: { id: transaction.id },
            data: {
              cashierId: matchedUser.id,
              cashierName: `${matchedUser.firstName} ${matchedUser.lastName}`
            }
          });

          updatedTransactions.push({
            transactionId: transaction.transactionId,
            oldCashierName: transaction.cashierName,
            newCashierName: `${matchedUser.firstName} ${matchedUser.lastName}`,
            matchedUserId: matchedUser.id
          });

          fixedCount++;
          console.log(`✅ Fixed transaction ${transaction.transactionId}: ${transaction.cashierName} -> ${matchedUser.firstName} ${matchedUser.lastName}`);
        } else {
          console.log(`⚠️ Could not find user for transaction ${transaction.transactionId} with cashier: ${transaction.cashierName}`);
        }
      }

      console.log(`🎉 Fixed ${fixedCount} out of ${transactionsToFix.length} transactions`);

      return {
        totalTransactions: transactionsToFix.length,
        fixedCount,
        updatedTransactions
      };
    } catch (error) {
      console.error('❌ Error fixing cashier links:', error);
      throw error;
    }
  }
}
