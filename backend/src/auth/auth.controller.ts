import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'MANAGER' | 'CASHIER';
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    try {
      const user = await this.authService.register(registerDto);
      
      // Return user data without password
      const { password, ...userWithoutPassword } = user;
      
      return {
        success: true,
        data: {
          user: userWithoutPassword,
          message: 'Registration successful'
        }
      };
    } catch (error) {
      if (error.code === 'P2002') {
        const field = error.meta?.target?.[0] || 'field';
        throw new HttpException(
          `User with this ${field} already exists`,
          HttpStatus.CONFLICT,
        );
      }
      throw new HttpException(
        'Registration failed. Please try again.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    try {
      const user = await this.authService.validateUser(loginDto.email, loginDto.password);
      
      if (!user) {
        throw new HttpException(
          'Invalid email or password',
          HttpStatus.UNAUTHORIZED,
        );
      }

      if (!user.isActive) {
        throw new HttpException(
          'Account is deactivated. Please contact administrator.',
          HttpStatus.FORBIDDEN,
        );
      }

      // Update last login time
      await this.authService.updateLastLogin(user.id);

      // Return user data without password
      const { password, ...userWithoutPassword } = user;
      
      return {
        success: true,
        data: {
          user: userWithoutPassword,
          message: 'Login successful'
        }
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Login failed. Please try again.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
