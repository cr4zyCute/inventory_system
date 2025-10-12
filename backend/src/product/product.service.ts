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

  async search(query: string): Promise<Product[]> {
    console.log('🔍 ProductService.search called with:', query);
    
    const result = await this.prisma.product.findMany({
      where: {
        AND: [
          { isActive: true },
          {
            OR: [
              {
                name: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
              {
                barcode: {
                  contains: query,
                },
              },
              {
                description: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
            ],
          },
        ],
      },
      orderBy: [
        {
          name: 'asc',
        },
      ],
      take: 20, // Limit to 20 results
    });
    
    console.log('✅ ProductService.search found:', result.length, 'products');
    return result;
  }
}
