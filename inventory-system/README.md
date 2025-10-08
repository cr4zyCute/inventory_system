# 🏪 Inventory Management System

A modern point-of-sale and inventory management system built with React, TypeScript, and Vite. Features a mobile-friendly barcode scanner that works over the network using your phone's camera.

## 📱 Features

- **Mobile Barcode Scanner**: Scan barcodes using your phone camera over the network
- **Real-time Cart Management**: Add, remove, and modify items in the shopping cart
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modern UI**: Beautiful, intuitive interface with smooth animations
- **TypeScript Support**: Full type safety and better development experience

## 🚀 Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser** and navigate to the local development URL (usually `http://localhost:5173`)

4. **Access from mobile**: Use your phone's browser to visit the same URL on your network

## 📱 Using the Barcode Scanner

### Desktop Setup:
1. Click "Open Cashier System" from the home page
2. Click "Start Scanner" to activate the barcode scanner
3. The scanner will attempt to use your computer's camera

### Mobile Setup (Recommended):
1. Ensure your phone and computer are on the same network
2. Open your phone's browser and navigate to your development server URL
3. Click "Open Cashier System"
4. Click "Start Scanner" - your phone will request camera permissions
5. Allow camera access when prompted
6. Point your phone camera at barcodes to scan them

### Scanner Features:
- **Auto-focus**: The scanner automatically focuses on barcodes
- **Torch support**: Use the flashlight button for low-light scanning
- **Zoom controls**: Adjust zoom for better scanning
- **Multiple format support**: Supports various barcode formats (UPC, EAN, Code128, etc.)

## 🛠 Technical Details

### Dependencies:
- **html5-qrcode**: Powers the barcode scanning functionality
- **React 19**: Latest React with concurrent features
- **TypeScript**: Full type safety
- **Vite**: Fast development and build tool

### Browser Compatibility:
- **Chrome/Edge**: Full support with all features
- **Safari**: Full support on iOS 11+
- **Firefox**: Full support with camera permissions

### Network Requirements:
- Both devices must be on the same local network
- HTTPS is required for camera access in production
- For development, localhost works fine

## 🔧 Development

### Available Scripts:
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Project Structure:
```
src/
├── components/
│   └── cashier/
│       ├── BarcodeScanner.tsx    # Main scanner component
│       ├── BarcodeScanner.css    # Scanner styles
│       ├── CashierPage.tsx       # Cashier interface
│       ├── CashierPage.css       # Cashier styles
│       ├── types.ts              # TypeScript definitions
│       └── index.ts              # Export barrel
├── App.tsx                       # Main app component
├── App.css                       # App styles
└── main.tsx                      # App entry point
```

### Adding Products:
Currently uses mock data. To add real products, modify the `mockProducts` array in `CashierPage.tsx` or integrate with your backend API.

### Customization:
- **Scanner settings**: Modify `config` object in `BarcodeScanner.tsx`
- **Styling**: Update CSS files for custom themes
- **Product data**: Replace mock data with API calls

##   Notes

- The scanner works best with good lighting conditions
- For production deployment, ensure HTTPS is configured for camera access
- Test barcode formats: `1234567890123`, `9876543210987`, `5555555555555`
- Mobile browsers may require user interaction before camera access

## 🤝 Contributing

Feel free to submit issues and enhancement requests!
