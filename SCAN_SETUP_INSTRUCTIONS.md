
# Cross-Device Barcode Scanning Setup

## How It Works
1. **Phone**: Scan barcode → Sends to backend
2. **Backend**: Stores latest scan
3. **Computer**: Polls backend every 1 second → Receives scan → Opens product form automatically

## Setup Steps

### 1. Start Backend
```bash
cd backend
npm run start:dev
```
Backend should start on `http://localhost:3000`

### 2. Start Frontend
```bash
cd inventory-system
npm run dev
```
Frontend should start on `http://localhost:5173`

### 3. Test the Flow

#### On Computer:
1. Open browser to `http://localhost:5173`
2. Login as admin
3. Go to **Product Management** page
4. **Keep this page open** (it's polling for scans)

#### On Phone:
1. Open browser to `http://localhost:5173` (or your network IP)
2. Login as admin
3. Go to **Product Management** page
4. Click **"Scan Product Barcode"** button
5. Allow camera access
6. Scan a barcode

#### Expected Result:
- Phone shows: "Barcode sent! Open the computer to add product details."
- Computer: Product form modal **automatically pops up** with barcode pre-filled
- You can now type the product name, price, stock, etc. on the computer

## API Endpoints Created

### Backend (`/api/scan-queue`)
- **POST** `/api/scan-queue` - Phone sends scanned barcode
- **GET** `/api/scan-queue/latest` - Computer polls for latest scan

### Files Modified/Created

#### Backend:
- `backend/src/scan-queue/scan-queue.module.ts` (NEW)
- `backend/src/scan-queue/scan-queue.controller.ts` (NEW)
- `backend/src/scan-queue/scan-queue.service.ts` (NEW)
- `backend/src/app.module.ts` (UPDATED - added ScanQueueModule)

#### Frontend:
- `inventory-system/src/hooks/useScanQueue.ts` (NEW)
- `inventory-system/src/components/admin/ProductManagement.tsx` (UPDATED)
- `inventory-system/src/components/admin/ProductForm.tsx` (UPDATED - added initialBarcode prop)

## Troubleshooting

### 404 Error on `/api/scan-queue/latest`
- **Cause**: Backend not running or module not registered
- **Fix**: 
  1. Make sure backend is running: `cd backend && npm run start:dev`
  2. Check console for errors
  3. Verify `ScanQueueModule` is imported in `app.module.ts`

### Modal doesn't pop up on computer
- **Cause**: Computer not on Product Management page or polling disabled
- **Fix**: 
  1. Make sure you're on the Product Management page
  2. Check browser console for errors
  3. Verify backend is responding to `/api/scan-queue/latest`

### Phone scan doesn't send to backend
- **Cause**: Network issue or backend not accessible
- **Fix**:
  1. Check phone and computer are on same network
  2. Use computer's local IP instead of localhost on phone
  3. Check backend CORS settings in `main.ts`

## Network Setup (Phone + Computer)

If phone and computer are on different devices:

1. Find your computer's local IP:
   - Windows: `ipconfig` (look for IPv4)
   - Mac/Linux: `ifconfig` or `ip addr`

2. On phone, access: `http://YOUR_COMPUTER_IP:5173`
   - Example: `http://192.168.1.100:5173`

3. Make sure backend CORS allows your phone's origin (already configured in `main.ts`)

## Polling Configuration

Current polling interval: **1 second**

To change, edit `inventory-system/src/hooks/useScanQueue.ts`:
```typescript
refetchInterval: enabled ? 1000 : false, // Change 1000 to desired milliseconds
```
