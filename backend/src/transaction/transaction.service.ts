import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TransactionService {
  constructor(private prisma: PrismaService) {}

  async createTransaction(transactionData: any) {
    try {
      console.log('💾 Creating transaction in database:', transactionData);

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
              quantity: item.quantity,
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

  async getTransactions(limit = 50, offset = 0) {
    try {
      const transactions = await this.prisma.transaction.findMany({
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

      return transactions;
    } catch (error) {
      console.error('❌ Error getting transactions:', error);
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
}
