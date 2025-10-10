import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  HttpException, 
  HttpStatus 
} from '@nestjs/common';
import { CategoryService } from './category.service';
import type { CreateCategoryDto, UpdateCategoryDto } from './category.service';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    try {
      const category = await this.categoryService.create(createCategoryDto);
      return {
        success: true,
        data: category,
        message: 'Category created successfully'
      };
    } catch (error) {
      console.error('Create category error:', error);
      throw new HttpException(
        error.message || 'Failed to create category',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get()
  async findAll() {
    try {
      const categories = await this.categoryService.findAll();
      return {
        success: true,
        data: categories
      };
    } catch (error) {
      console.error('Get categories error:', error);
      throw new HttpException(
        'Failed to fetch categories',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const category = await this.categoryService.findOne(id);
      return {
        success: true,
        data: category
      };
    } catch (error) {
      console.error('Get category error:', error);
      throw new HttpException(
        error.message || 'Failed to fetch category',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    try {
      const category = await this.categoryService.update(id, updateCategoryDto);
      return {
        success: true,
        data: category,
        message: 'Category updated successfully'
      };
    } catch (error) {
      console.error('Update category error:', error);
      throw new HttpException(
        error.message || 'Failed to update category',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const result = await this.categoryService.remove(id);
      return {
        success: true,
        data: result,
        message: 'Category removed successfully'
      };
    } catch (error) {
      console.error('Delete category error:', error);
      throw new HttpException(
        error.message || 'Failed to delete category',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id/products')
  async getProductsByCategory(@Param('id') id: string) {
    try {
      const products = await this.categoryService.getProductsByCategory(id);
      return {
        success: true,
        data: products
      };
    } catch (error) {
      console.error('Get products by category error:', error);
      throw new HttpException(
        error.message || 'Failed to fetch products',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
