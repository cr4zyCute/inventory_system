import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateCategoryDto {
  name: string;
  description?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  isActive?: boolean;
}

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    try {
      return await this.prisma.category.create({
        data: createCategoryDto,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Category name already exists');
      }
      throw error;
    }
  }

  async findAll() {
    return await this.prisma.category.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        products: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            price: true,
            stockQuantity: true,
            minStockLevel: true
          }
        },
        _count: {
          select: { products: true }
        }
      }
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    try {
      const category = await this.prisma.category.update({
        where: { id },
        data: updateCategoryDto,
      });
      return category;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Category not found');
      }
      if (error.code === 'P2002') {
        throw new ConflictException('Category name already exists');
      }
      throw error;
    }
  }

  async remove(id: string) {
    // Check if category has products
    const categoryWithProducts = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    if (!categoryWithProducts) {
      throw new NotFoundException('Category not found');
    }

    if (categoryWithProducts._count.products > 0) {
      // Soft delete - just mark as inactive
      return await this.prisma.category.update({
        where: { id },
        data: { isActive: false }
      });
    } else {
      // Hard delete if no products
      return await this.prisma.category.delete({
        where: { id }
      });
    }
  }

  async getProductsByCategory(categoryId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        products: {
          where: { isActive: true },
          orderBy: { name: 'asc' }
        }
      }
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category.products;
  }
}
