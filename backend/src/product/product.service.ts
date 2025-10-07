import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Product, Prisma } from '@prisma/client';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Product[]> {
    return this.prisma.product.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<Product | null> {
    return this.prisma.product.findUnique({
      where: { id },
    });
  }

  async create(data: Prisma.ProductCreateInput): Promise<Product> {
    return this.prisma.product.create({
      data,
    });
  }

  async update(id: string, data: Prisma.ProductUpdateInput): Promise<Product> {
    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  async updateStatus(id: string, isActive: boolean): Promise<Product> {
    return this.prisma.product.update({
      where: { id },
      data: { isActive },
    });
  }

  async remove(id: string): Promise<Product> {
    return this.prisma.product.delete({
      where: { id },
    });
  }

  async findByBarcode(barcode: string): Promise<Product | null> {
    return this.prisma.product.findUnique({
      where: { barcode },
    });
  }

  async findLowStock(): Promise<Product[]> {
    return this.prisma.product.findMany({
      where: {
        AND: [
          { isActive: true },
          {
            stockQuantity: {
              lte: this.prisma.product.fields.minStockLevel,
            },
          },
        ],
      },
      orderBy: {
        stockQuantity: 'asc',
      },
    });
  }
}
