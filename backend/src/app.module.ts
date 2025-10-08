import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ProductModule } from './product/product.module';
import { ReportsModule } from './reports/reports.module';
import { ScanQueueModule } from './scan-queue/scan-queue.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [UserModule, AuthModule, ProductModule, ReportsModule, ScanQueueModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
