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
