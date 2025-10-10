import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getSalesReport(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include the entire end date

    // Get total sales and transactions
    const salesData = await this.prisma.transaction.aggregate({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        status: 'completed',
      },
      _sum: {
        totalAmount: true,
      },
      _count: {
        id: true,
      },
    });

    // Get average transaction amount
    const averageTransaction = salesData._count.id > 0 
      ? (salesData._sum.totalAmount || 0) / salesData._count.id 
      : 0;

    // Get top products by sales
    const topProducts = await this.prisma.transactionItem.groupBy({
      by: ['productId'],
      where: {
        transaction: {
          createdAt: {
            gte: start,
            lte: end,
          },
          status: 'completed',
        },
      },
      _sum: {
        totalPrice: true,
        quantity: true,
      },
      orderBy: {
        _sum: {
          totalPrice: 'desc',
        },
      },
      take: 10,
    });

    // Get product details for top products
    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId },
        });
        return {
          name: product?.name || 'Unknown Product',
          sales: item._sum.totalPrice || 0,
          units: item._sum.quantity || 0,
        };
      })
    );

    return {
      totalSales: salesData._sum.totalAmount || 0,
      totalTransactions: salesData._count.id,
      averageTransaction,
      topProducts: topProductsWithDetails,
    };
  }

  async getInventoryReport() {
    // Get total products count
    const totalProducts = await this.prisma.product.count({
      where: { isActive: true },
    });

    // Get low stock items using raw query since we need to compare two columns
    const lowStockItemsResult = await this.prisma.$queryRaw<[{count: bigint}]>`
      SELECT COUNT(*) as count FROM products 
      WHERE "isActive" = true AND "stockQuantity" <= "minStockLevel"
    `;
    const lowStockItems = Number(lowStockItemsResult[0]?.count || 0);

    // Get out of stock items
    const outOfStockItems = await this.prisma.product.count({
      where: {
        AND: [
          { isActive: true },
          { stockQuantity: 0 },
        ],
      },
    });

    // Calculate total inventory value
    const products = await this.prisma.product.findMany({
      where: { isActive: true },
      select: {
        price: true,
        stockQuantity: true,
      },
    });

    const totalValue = products.reduce(
      (sum, product) => sum + (product.price * product.stockQuantity),
      0
    );

    // Get low stock products details using raw query
    const lowStockProducts = await this.prisma.$queryRaw<Array<{
      name: string;
      stockQuantity: number;
      minStockLevel: number;
      categoryId: string | null;
    }>>`
      SELECT name, "stockQuantity", "minStockLevel", "categoryId"
      FROM products 
      WHERE "isActive" = true AND "stockQuantity" <= "minStockLevel"
      ORDER BY "stockQuantity" ASC
      LIMIT 10
    `;

    const lowStockProductsFormatted = lowStockProducts.map(product => ({
      name: product.name,
      current: product.stockQuantity,
      minimum: product.minStockLevel,
      category: product.categoryId || 'Uncategorized',
    }));

    return {
      totalProducts,
      lowStockItems,
      outOfStockItems,
      totalValue,
      lowStockProducts: lowStockProductsFormatted,
    };
  }

  async getUserSalesReport(userId: string, startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Get user's sales data
    const userSales = await this.prisma.transaction.aggregate({
      where: {
        cashierId: userId,
        createdAt: {
          gte: start,
          lte: end,
        },
        status: 'completed',
      },
      _sum: {
        totalAmount: true,
      },
      _count: {
        id: true,
      },
    });

    // Get today's sales
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todaySales = await this.prisma.transaction.aggregate({
      where: {
        cashierId: userId,
        createdAt: {
          gte: today,
          lte: todayEnd,
        },
        status: 'completed',
      },
      _sum: {
        totalAmount: true,
      },
      _count: {
        id: true,
      },
    });

    // Get this week's sales
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekSales = await this.prisma.transaction.aggregate({
      where: {
        cashierId: userId,
        createdAt: {
          gte: weekStart,
          lte: todayEnd,
        },
        status: 'completed',
      },
      _sum: {
        totalAmount: true,
      },
    });

    // Get recent transactions
    const recentTransactions = await this.prisma.transaction.findMany({
      where: {
        cashierId: userId,
        status: 'completed',
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    const recentTransactionsFormatted = recentTransactions.map(transaction => ({
      id: transaction.id,
      time: transaction.createdAt.toLocaleTimeString(),
      amount: transaction.totalAmount,
      items: transaction.items.length,
    }));

    return {
      totalSales: userSales._sum.totalAmount || 0,
      totalTransactions: userSales._count.id,
      todaySales: todaySales._sum.totalAmount || 0,
      todayTransactions: todaySales._count.id,
      weekSales: weekSales._sum.totalAmount || 0,
      recentTransactions: recentTransactionsFormatted,
    };
  }

  async getDailyTransactionsReport(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Get daily transactions
    const transactions = await this.prisma.transaction.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        status: 'completed',
      },
      include: {
        items: true,
        cashier: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate totals
    const totalSales = transactions.reduce((sum, t) => sum + t.totalAmount, 0);
    const totalTransactions = transactions.length;

    // Get today's data
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayTransactions = transactions.filter(
      t => t.createdAt >= today && t.createdAt <= todayEnd
    );

    const todaySales = todayTransactions.reduce((sum, t) => sum + t.totalAmount, 0);

    // Get this week's data
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekTransactions = transactions.filter(
      t => t.createdAt >= weekStart
    );

    const weekSales = weekTransactions.reduce((sum, t) => sum + t.totalAmount, 0);

    // Format recent transactions
    const recentTransactions = transactions.slice(0, 10).map(transaction => ({
      id: transaction.id,
      time: transaction.createdAt.toLocaleTimeString(),
      amount: transaction.totalAmount,
      items: transaction.items.length,
      cashier: transaction.cashier ? `${transaction.cashier.firstName} ${transaction.cashier.lastName}` : 'Unknown',
    }));

    return {
      totalSales,
      totalTransactions,
      todaySales,
      todayTransactions: todayTransactions.length,
      weekSales,
      recentTransactions,
    };
  }

  async getDashboardAnalytics() {
    // Get current date ranges
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    // Get total revenue (this month)
    const monthlyRevenue = await this.prisma.transaction.aggregate({
      where: {
        createdAt: {
          gte: monthStart,
        },
        status: 'completed',
      },
      _sum: {
        totalAmount: true,
      },
    });

    // Get total orders (this month)
    const monthlyOrders = await this.prisma.transaction.count({
      where: {
        createdAt: {
          gte: monthStart,
        },
        status: 'completed',
      },
    });

    // Get active customers (unique cashiers this month)
    const activeCustomers = await this.prisma.transaction.groupBy({
      by: ['cashierId'],
      where: {
        createdAt: {
          gte: monthStart,
        },
        status: 'completed',
      },
    });

    // Get products sold (this month)
    const productsSold = await this.prisma.transactionItem.aggregate({
      where: {
        transaction: {
          createdAt: {
            gte: monthStart,
          },
          status: 'completed',
        },
      },
      _sum: {
        quantity: true,
      },
    });

    // Get sales trend for last 7 days
    const salesTrend: Array<{ date: string; sales: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const dateEnd = new Date(date);
      dateEnd.setHours(23, 59, 59, 999);

      const daySales = await this.prisma.transaction.aggregate({
        where: {
          createdAt: {
            gte: date,
            lte: dateEnd,
          },
          status: 'completed',
        },
        _sum: {
          totalAmount: true,
        },
      });

      salesTrend.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        sales: daySales._sum.totalAmount || 0,
      });
    }

    return {
      totalRevenue: monthlyRevenue._sum.totalAmount || 0,
      totalOrders: monthlyOrders,
      activeCustomers: activeCustomers.length,
      productsSold: productsSold._sum.quantity || 0,
      salesTrend,
    };
  }

  // async getUserActivityReport(startDate?: string, endDate?: string) {
  //   const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  //   const end = endDate ? new Date(endDate) : new Date();
  //   end.setHours(23, 59, 59, 999);

  //   // Get all active users with their last login and transaction counts
  //   const users = await this.prisma.user.findMany({
  //     where: { isActive: true },
  //     include: {
  //       transactions: {
  //         where: {
  //           createdAt: {
  //             gte: start,
  //             lte: end,
  //           },
  //           status: 'completed',
  //         },
  //       },
  //     },
  //     orderBy: { lastLogin: 'desc' },
  //   });

  //   // Calculate user metrics
  //   const totalUsers = users.length;
  //   const activeUsers = users.filter(user => user.lastLogin && user.lastLogin >= start).length;
  //   const totalTransactions = users.reduce((sum, user) => sum + user.transactions.length, 0);
  //   const totalSales = await this.prisma.transaction.aggregate({
  //     where: {
  //       createdAt: { gte: start, lte: end },
  //       status: 'completed',
  //     },
  //     _sum: { totalAmount: true },
  //   });

  //   // Get top performers by transaction count
  //   const topPerformers = users
  //     .map(user => ({
  //       id: user.id,
  //       name: `${user.firstName} ${user.lastName}`,
  //       role: user.role,
  //       email: user.email,
  //       transactionCount: user.transactions.length,
  //       totalSales: user.transactions.reduce((sum, t) => sum + t.totalAmount, 0),
  //       lastLogin: user.lastLogin,
  //       isActive: user.isActive,
  //     }))
  //     .sort((a, b) => b.transactionCount - a.transactionCount)
  //     .slice(0, 10);

  //   // Get recent user activities (transactions)
  //   const recentTransactions = await this.prisma.transaction.findMany({
  //     where: {
  //       createdAt: { gte: start, lte: end },
  //       status: 'completed',
  //     },
  //     include: {
  //       cashier: true,
  //     },
  //     orderBy: { createdAt: 'desc' },
  //     take: 20,
  //   });

  //   const recentActivities = recentTransactions.map(transaction => ({
  //     id: transaction.id,
  //     type: 'transaction',
  //     description: `Processed transaction ${transaction.transactionId}`,
  //     user: transaction.cashier ? `${transaction.cashier.firstName} ${transaction.cashier.lastName}` : transaction.cashierName,
  //     userRole: transaction.cashier?.role || 'CASHIER',
  //     amount: transaction.totalAmount,
  //     timestamp: transaction.createdAt,
  //   }));

  //   // Get last login data for all users
  //   const lastLoginData = users
  //     .filter(user => user.lastLogin)
  //     .sort((a, b) => new Date(b.lastLogin!).getTime() - new Date(a.lastLogin!).getTime())
  //     .slice(0, 10)
  //     .map(user => ({
  //       id: user.id,
  //       name: `${user.firstName} ${user.lastName}`,
  //       role: user.role,
  //       lastLogin: user.lastLogin,
  //     }));

  //   // Get daily activity trend for the last 7 days
  //   const activityTrend: Array<{
  //     date: string;
  //     transactions: number;
  //     logins: number;
  //     totalActivity: number;
  //   }> = [];
  //   for (let i = 6; i >= 0; i--) {
  //     const date = new Date();
  //     date.setDate(date.getDate() - i);
  //     date.setHours(0, 0, 0, 0);
  //     const nextDay = new Date(date);
  //     nextDay.setDate(nextDay.getDate() + 1);

  //     const dayTransactions = await this.prisma.transaction.count({
  //       where: {
  //         createdAt: { gte: date, lt: nextDay },
  //         status: 'completed',
  //       },
  //     });

  //     const dayLogins = users.filter(user => 
  //       user.lastLogin && 
  //       user.lastLogin >= date && 
  //       user.lastLogin < nextDay
  //     ).length;

  //     activityTrend.push({
  //       date: date.toLocaleDateString('en-US', { weekday: 'short' }),
  //       transactions: dayTransactions,
  //       logins: dayLogins,
  //       totalActivity: dayTransactions + dayLogins,
  //     });
  //   }

  //   // Get role distribution
  //   const roleDistribution = await this.prisma.user.groupBy({
  //     by: ['role'],
  //     where: { isActive: true },
  //     _count: { role: true },
  //   });

  //   const roleStats = roleDistribution.map(role => ({
  //     role: role.role,
  //     count: role._count.role,
  //     percentage: ((role._count.role / totalUsers) * 100).toFixed(1),
  //   }));

  //   return {
  //     summary: {
  //       totalUsers,
  //       activeUsers,
  //       totalTransactions,
  //       totalSales: totalSales._sum.totalAmount || 0,
  //       activityRate: totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : '0',
  //     },
  //     topPerformers,
  //     recentActivities,
  //     lastLoginData,
  //     activityTrend,
  //     roleStats,
  //     dateRange: {
  //       start: start.toISOString(),
  //       end: end.toISOString(),
  //     },
  //   };
  // }
}
