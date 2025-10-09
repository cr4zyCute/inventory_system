import { Controller, Get, Post, Body, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { TransactionService } from './transaction.service';

@Controller('api/transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  async createTransaction(@Body() transactionData: any) {
    try {
      console.log('📝 Creating transaction:', transactionData);
      const transaction = await this.transactionService.createTransaction(transactionData);
      return {
        success: true,
        data: transaction,
        message: 'Transaction created successfully'
      };
    } catch (error) {
      console.error('❌ Error creating transaction:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to create transaction',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get()
  async getTransactions(@Query('limit') limit?: string, @Query('offset') offset?: string) {
    try {
      const transactions = await this.transactionService.getTransactions(
        limit ? parseInt(limit) : undefined,
        offset ? parseInt(offset) : undefined
      );
      return {
        success: true,
        data: transactions,
        message: 'Transactions retrieved successfully'
      };
    } catch (error) {
      console.error('❌ Error getting transactions:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get transactions',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id')
  async getTransactionById(@Param('id') id: string) {
    try {
      const transaction = await this.transactionService.getTransactionById(id);
      if (!transaction) {
        throw new HttpException(
          {
            success: false,
            message: 'Transaction not found'
          },
          HttpStatus.NOT_FOUND
        );
      }
      return {
        success: true,
        data: transaction,
        message: 'Transaction retrieved successfully'
      };
    } catch (error) {
      console.error('❌ Error getting transaction:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get transaction',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
