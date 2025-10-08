import { Controller, Post, Get, Body } from '@nestjs/common';
import { ScanQueueService, ScanData } from './scan-queue.service';

@Controller('scan-queue')
export class ScanQueueController {
  constructor(private readonly scanQueueService: ScanQueueService) {}

  @Post()
  addScan(@Body() body: { barcode: string; timestamp?: string; deviceType?: string; sessionId?: string }): { success: boolean; data: ScanData } {
    const scanData: ScanData = {
      barcode: body.barcode,
      timestamp: body.timestamp || new Date().toISOString(),
      deviceType: body.deviceType || 'phone',
      sessionId: body.sessionId
    };
    return this.scanQueueService.addScan(scanData);
  }

  @Get('latest')
  getLatestScan(): { success: boolean; data: ScanData | null } {
    return this.scanQueueService.getLatestScan();
  }
}
