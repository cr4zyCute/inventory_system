import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface ScanData {
  barcode: string;
  timestamp: string;
  deviceType: string;
  sessionId?: string;
}

interface ScanResponse {
  success: boolean;
  data: ScanData | null;
}

const API_BASE_URL = '';

// API functions
const addScanToQueue = async (barcode: string): Promise<ScanResponse> => {
  const scanData = {
    barcode,
    timestamp: new Date().toISOString(),
    deviceType: 'phone',
    sessionId: 'product-management'
  };
  
  const response = await fetch(`${API_BASE_URL}/api/scan-queue`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(scanData),
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

const getLatestScan = async (): Promise<ScanResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/scan-queue/latest`);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

// Custom hooks
export const useAddScanToQueue = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: addScanToQueue,
    onSuccess: () => {
      // Invalidate to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['latestScan'] });
    },
  });
};

export const useLatestScan = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['latestScan'],
    queryFn: getLatestScan,
    refetchInterval: enabled ? 1000 : false, // Poll every 1 second when enabled
    enabled,
  });
};
