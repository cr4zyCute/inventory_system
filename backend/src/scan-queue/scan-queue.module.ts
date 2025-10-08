import { Module } from '@nestjs/common';
import { ScanQueueController } from './scan-queue.controller';
import { ScanQueueService } from './scan-queue.service';

@Module({
  controllers: [ScanQueueController],
  providers: [ScanQueueService],
  exports: [ScanQueueService],
})
export class ScanQueueModule {}
