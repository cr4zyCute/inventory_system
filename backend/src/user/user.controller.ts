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
import { UserService } from './user.service';
import { Prisma } from '@prisma/client';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll() {
    try {
      const users = await this.userService.findAll();
      return {
        success: true,
        data: users,
        message: 'Users retrieved successfully',
      };
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve users',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const user = await this.userService.findOne(id);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return {
        success: true,
        data: user,
        message: 'User retrieved successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to retrieve user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  async create(@Body() createUserDto: Prisma.UserCreateInput) {
    try {
      console.log('📝 Creating user with data:', createUserDto);
      const user = await this.userService.create(createUserDto);
      console.log('✅ User created successfully:', user.id);
      return {
        success: true,
        data: user,
        message: 'User created successfully',
      };
    } catch (error) {
      console.error('❌ Error creating user:', error);
      
      if (error.code === 'P2002') {
        const field = error.meta?.target?.[0] || 'field';
        throw new HttpException(
          {
            success: false,
            message: `User with this ${field} already exists`,
            error: error.message
          },
          HttpStatus.CONFLICT,
        );
      }
      
      throw new HttpException(
        {
          success: false,
          message: 'Failed to create user',
          error: error.message || 'Unknown error'
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: Prisma.UserUpdateInput,
  ) {
    try {
      const user = await this.userService.update(id, updateUserDto);
      return {
        success: true,
        data: user,
        message: 'User updated successfully',
      };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      if (error.code === 'P2002') {
        throw new HttpException(
          'User with this email or username already exists',
          HttpStatus.CONFLICT,
        );
      }
      throw new HttpException(
        'Failed to update user',
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
      const user = await this.userService.updateStatus(id, statusDto.isActive);
      return {
        success: true,
        data: user,
        message: 'User status updated successfully',
      };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        'Failed to update user status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id/change-password')
  async changePassword(
    @Param('id') id: string,
    @Body() passwordDto: { currentPassword: string; newPassword: string },
  ) {
    try {
      const result = await this.userService.changePassword(
        id,
        passwordDto.currentPassword,
        passwordDto.newPassword,
      );
      return {
        success: true,
        message: 'Password updated successfully',
      };
    } catch (error) {
      if (error.message === 'Invalid current password') {
        throw new HttpException(
          'Current password is incorrect',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (error.code === 'P2025') {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        'Failed to update password',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const user = await this.userService.remove(id);
      return {
        success: true,
        data: user,
        message: 'User deleted successfully',
      };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        'Failed to delete user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
