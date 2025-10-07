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

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
