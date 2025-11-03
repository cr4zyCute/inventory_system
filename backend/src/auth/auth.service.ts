import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, UserRole } from '@prisma/client';

interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

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

  async register(data: RegisterData): Promise<User> {
    try {
      // In production, you should hash the password
      // For now, storing as plain text to match existing setup
      const user = await this.prisma.user.create({
        data: {
          email: data.email,
          username: data.username,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
          isActive: true,
        },
      });

      return user;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }
}
