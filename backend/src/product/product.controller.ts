import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { Prisma } from '@prisma/client';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async findAll() {
    try {
      const products = await this.productService.findAll();
      return {
        success: true,
        data: products,
        message: 'Products retrieved successfully',
      };
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve products',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('test')
  async testEndpoint() {
    return {
      success: true,
      message: 'Product controller is working!',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('scan')
  async scanProduct(@Body() scanDto: { barcode: string }) {
    try {
      const product = await this.productService.findByBarcode(scanDto.barcode);
      if (!product) {
        return {
          success: false,
          data: null,
          message: 'Product not found',
        };
      }
      return {
        success: true,
        data: product,
        message: 'Product scanned successfully',
      };
    } catch (error) {
      throw new HttpException(
        'Failed to scan product',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Simple in-memory storage for real-time scans (in production, use Redis or database)
  private static realtimeScans: Map<string, any[]> = new Map();

  @Post('scan-realtime')
  async scanRealtime(@Body() scanDto: { 
    barcode: string; 
    timestamp: string; 
    deviceType: string; 
    sessionId: string; 
  }) {
    try {
      console.log('📡 Backend: Received real-time scan:', scanDto);
      
      // Store the scan data for the session
      const sessionScans = ProductController.realtimeScans.get(scanDto.sessionId) || [];
      sessionScans.push({
        ...scanDto,
        id: Date.now().toString(),
        receivedAt: new Date().toISOString()
      });
      
      // Keep only last 50 scans per session
      if (sessionScans.length > 50) {
        sessionScans.splice(0, sessionScans.length - 50);
      }
      
      ProductController.realtimeScans.set(scanDto.sessionId, sessionScans);
      
      console.log('📡 Backend: Stored scan data for session:', scanDto.sessionId);
      
      return {
        success: true,
        message: 'Scan data received and stored',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new HttpException(
        'Failed to process real-time scan',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('scans-realtime/:sessionId')
  async getRealtimeScans(@Param('sessionId') sessionId: string) {
    try {
      const scans = ProductController.realtimeScans.get(sessionId) || [];
      return {
        success: true,
        data: scans,
        message: 'Real-time scans retrieved successfully'
      };
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve real-time scans',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('barcode/:barcode')
  async findByBarcode(@Param('barcode') barcode: string) {
    try {
      const product = await this.productService.findByBarcode(barcode);
      if (!product) {
        throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
      }
      return {
        success: true,
        data: product,
        message: 'Product retrieved successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to retrieve product',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const product = await this.productService.findOne(id);
      if (!product) {
        throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
      }
      return {
        success: true,
        data: product,
        message: 'Product retrieved successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to retrieve product',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  async create(@Body() createProductDto: Prisma.ProductCreateInput) {
    try {
      const product = await this.productService.create(createProductDto);
      return {
        success: true,
        data: product,
        message: 'Product created successfully',
      };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new HttpException(
          'Product with this barcode already exists',
          HttpStatus.CONFLICT,
        );
      }
      throw new HttpException(
        'Failed to create product',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: Prisma.ProductUpdateInput,
  ) {
    try {
      const product = await this.productService.update(id, updateProductDto);
      return {
        success: true,
        data: product,
        message: 'Product updated successfully',
      };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
      }
      if (error.code === 'P2002') {
        throw new HttpException(
          'Product with this barcode already exists',
          HttpStatus.CONFLICT,
        );
      }
      throw new HttpException(
        'Failed to update product',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() statusDto: { isActive: boolean },
  ) {
    try {
      const product = await this.productService.updateStatus(id, statusDto.isActive);
      return {
        success: true,
        data: product,
        message: 'Product status updated successfully',
      };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        'Failed to update product status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const product = await this.productService.remove(id);
      return {
        success: true,
        data: product,
        message: 'Product deleted successfully',
      };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        'Failed to delete product',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
