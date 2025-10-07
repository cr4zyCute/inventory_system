import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return null;
      }

      // In production, you should hash passwords and compare hashes
      // For now, we're doing plain text comparison as per your current setup
      if (user.password === password) {
        return user;
      }

      return null;
    } catch (error) {
      console.error('Error validating user:', error);
      return null;
    }
  }

  async updateLastLogin(userId: string): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { lastLogin: new Date() },
      });
    } catch (error) {
      console.error('Error updating last login:', error);
      // Don't throw error for last login update failure
    }
  }
}
