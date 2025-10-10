import { Injectable } from '@nestjs/common';

export interface ScanData {
  barcode: string;
  timestamp: string;
  deviceType: string;
  sessionId?: string;
}

@Injectable()
export class ScanQueueService {
  private latestScan: ScanData | null = null;
  private lastRetrievedTimestamp: string | null = null;

  addScan(scanData: ScanData) {
    console.log('Backend: Received scan data:', scanData);
    this.latestScan = scanData;
    return { success: true, data: scanData };
  }

  getLatestScan() {
    // Only return scan if it hasn't been retrieved yet
    if (this.latestScan && this.latestScan.timestamp !== this.lastRetrievedTimestamp) {
      this.lastRetrievedTimestamp = this.latestScan.timestamp;
      console.log('Backend: Sending scan to computer:', this.latestScan);
      return { success: true, data: this.latestScan };
    }
    return { success: true, data: null };
  }
}
