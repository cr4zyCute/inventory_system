# 📚 Inventory Management System - User Guide

## Table of Contents
1. [Introduction & Getting Started](#introduction--getting-started)
2. [System Requirements & Installation](#system-requirements--installation)
3. [Login & Authentication](#login--authentication)
4. [Dashboard Overview](#dashboard-overview)
5. [Feature Guides](#feature-guides)
6. [Common Tasks & Workflows](#common-tasks--workflows)
7. [Troubleshooting & FAQs](#troubleshooting--faqs)
8. [Best Practices](#best-practices)
9. [Keyboard Shortcuts & Tips](#keyboard-shortcuts--tips)
10. [Glossary of Terms](#glossary-of-terms)

---

## 1. Introduction & Getting Started

### Welcome to the Inventory Management System

This modern point-of-sale and inventory management system is designed to streamline your business operations with powerful features including:
- **Real-time inventory tracking**
- **Mobile barcode scanning**
- **Role-based access control**
- **Comprehensive reporting**
- **Multi-device support**

### System Architecture
- **Frontend**: React 19 with TypeScript
- **Backend**: NestJS with Prisma ORM
- **Database**: PostgreSQL
- **Barcode Scanner**: html5-qrcode library

### User Roles
The system supports three distinct user roles:
1. **Admin** - Complete system control
2. **Manager** - Inventory and operational management
3. **Cashier** - Point of sale operations

---

## 2. System Requirements & Installation

### Minimum Requirements

#### Hardware
- **Computer**: 
  - Processor: Dual-core 2.0 GHz or higher
  - RAM: 4GB minimum (8GB recommended)
  - Storage: 2GB free space
  - Camera: Built-in or USB webcam for barcode scanning

- **Mobile Device** (for scanner):
  - iOS 11+ or Android 5.0+
  - Camera with autofocus
  - Active internet connection

#### Software
- **Operating System**: Windows 10+, macOS 10.14+, or Ubuntu 18.04+
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Network**: Stable internet connection

### Installation Steps

#### Backend Setup
1. **Install PostgreSQL**
   ```bash
   # Download from https://www.postgresql.org/download/
   ```

2. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd inventory-system/backend
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Configure database**
   ```bash
   # Create .env file with:
   DATABASE_URL="postgresql://username:password@localhost:5432/inventory_db"
   ```

5. **Run migrations**
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

6. **Start backend server**
   ```bash
   npm run start:dev
   # Server runs on http://localhost:3000
   ```

#### Frontend Setup
1. **Navigate to frontend directory**
   ```bash
   cd ../inventory-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   # Application runs on http://localhost:5173
   ```

> 💡 **Tip**: Keep both backend and frontend servers running for full functionality.

---

## 3. Login & Authentication

### Accessing the System

1. **Open your browser** and navigate to `http://localhost:5173`
2. **Enter credentials**:
   - Email address
   - Password
3. **Click "Login"** to access the system

### First-Time Login
> ⚠️ **Important**: Change your default password immediately after first login.

1. Navigate to **Settings** → **Account Settings**
2. Click **Change Password**
3. Enter current password and new password
4. Click **Update Password**

### Session Management
- Sessions expire after **24 hours** of inactivity
- System automatically saves your work before logout
- Use **"Remember Me"** for convenience (not recommended on shared computers)

### Logout Process
1. Click your **profile icon** in the top-right corner
2. Select **Logout**
3. Confirm logout when prompted

> 🔒 **Security Tip**: Always logout when using shared computers.

---

## 4. Dashboard Overview

### Admin Dashboard

The Admin Dashboard provides complete system oversight:

#### Key Metrics Display
- **Total Revenue**: Current month and year-to-date
- **Active Users**: Currently logged-in users
- **Inventory Value**: Total stock value
- **Low Stock Alerts**: Products below minimum levels
- **Recent Transactions**: Last 10 transactions
- **System Health**: Server and database status

#### Navigation Menu
- **Dashboard**: Overview and analytics
- **User Management**: Manage system users
- **Inventory Management**: Product control
- **Product Categories**: Category organization
- **Reports & Analytics**: Comprehensive reporting
- **Transaction History**: All transactions
- **Settings**: System configuration

### Manager Dashboard

The Manager Dashboard focuses on operational metrics:

#### Key Metrics Display
- **Daily Sales**: Today's revenue and transactions
- **Inventory Status**: Stock levels and alerts
- **Category Performance**: Sales by category
- **Staff Performance**: Cashier metrics
- **Recent Activities**: Latest inventory changes

#### Navigation Menu
- **Dashboard**: Operational overview
- **Inventory Management**: Product control
- **Product Categories**: Category management
- **Reports & Analytics**: Operational reports
- **Transaction History**: Transaction review
- **Settings**: Management preferences

### Cashier Dashboard

The Cashier Dashboard emphasizes transaction processing:

#### Key Metrics Display
- **Today's Sales**: Personal sales total
- **Transaction Count**: Number of completed sales
- **Average Transaction**: Average sale value
- **Last Transaction**: Most recent sale details
- **Quick Actions**: Fast access to POS features

#### Navigation Menu
- **Dashboard**: Personal performance
- **Point of Sale**: Transaction processing
- **Scanner**: Barcode scanning tools
- **Transaction Display**: Current transaction
- **Transaction History**: Personal transactions
- **Reports**: Personal performance reports
- **Settings**: Cashier preferences

---

## 5. Feature Guides

## 5.1 User Management (Admin Only)

### Creating a New User

1. Navigate to **User Management** from the sidebar
2. Click **"+ Add New User"** button
3. Fill in the required fields:
   - **First Name**: User's first name
   - **Last Name**: User's last name
   - **Email**: Valid email address (used for login)
   - **Username**: Unique username
   - **Password**: Strong password (min 8 characters)
   - **Role**: Select ADMIN, MANAGER, or CASHIER
4. Toggle **"Active"** to enable immediate access
5. Click **"Create User"**

> 📝 **Note**: Users receive email notifications with login credentials.

### Editing User Information

1. Find the user in the list
2. Click the **three-dot menu** (⋮) next to their name
3. Select **"Edit"**
4. Modify the necessary fields
5. Click **"Update User"**

### Deactivating/Activating Users

1. Locate the user
2. Click the **toggle switch** in the Status column
3. Confirm the action

> ⚠️ **Warning**: Deactivated users cannot log in but their data is preserved.

### Deleting Users

1. Click the **three-dot menu** (⋮)
2. Select **"Delete"**
3. Type **"DELETE"** to confirm
4. Click **"Confirm Delete"**

> 🚨 **Caution**: This action is irreversible. Consider deactivating instead.

---

## 5.2 Product Management (Admin & Manager)

### Adding a New Product

1. Navigate to **Inventory Management**
2. Click **"+ Add Product"** button
3. Enter product details:
   - **Barcode**: Unique product barcode (or scan using camera)
   - **Product Name**: Descriptive name
   - **Description**: Optional product details
   - **Category**: Select from dropdown
   - **Price**: Selling price
   - **Cost**: Purchase cost (optional)
   - **Stock Quantity**: Current inventory count
   - **Minimum Stock Level**: Alert threshold
4. Toggle **"Active"** to make available for sale
5. Click **"Save Product"**

### Using Barcode Scanner for Products

1. Click **"Scan Barcode"** button
2. Allow camera permissions when prompted
3. Position barcode in camera view
4. System auto-fills barcode field upon successful scan
5. Complete remaining product details

### Editing Products

1. Find product using search or filters
2. Click **"Edit"** button
3. Modify necessary fields
4. Click **"Update Product"**

### Managing Stock Levels

#### Quick Stock Adjustment
1. Click **stock quantity** directly in the table
2. Enter new quantity
3. Press Enter to save

#### Bulk Stock Update
1. Select multiple products using checkboxes
2. Click **"Bulk Actions"** → **"Update Stock"**
3. Enter adjustment value (+/- amount)
4. Click **"Apply"**

### Product Filters and Search

- **Search Bar**: Search by name, barcode, or description
- **Status Filter**: All, Active, Inactive
- **Stock Filter**: All, In Stock, Low Stock, Out of Stock
- **Category Filter**: Filter by product category
- **Price Range**: Set minimum and maximum price

---

## 5.3 Category Management (Admin & Manager)

### Creating Categories

1. Navigate to **Product Categories**
2. Click **"+ New Category"**
3. Enter:
   - **Category Name**: Unique name
   - **Description**: Optional details
4. Click **"Create Category"**

### Viewing Category Products

1. Click on any category name
2. View all products in that category
3. Use **search** to find specific products
4. Click **"Back"** to return to categories

### Editing Categories

1. Click **"Edit"** next to category
2. Modify name or description
3. Click **"Save Changes"**

### Deleting Categories

> ⚠️ **Note**: Cannot delete categories with assigned products.

1. Ensure category has no products
2. Click **"Delete"**
3. Confirm deletion

---

## 5.4 Point of Sale (Cashier)

### Starting a Transaction

1. Navigate to **Point of Sale**
2. System displays empty cart
3. Choose scanning method:
   - **Barcode Scanner**: Click "Start Scanner"
   - **Manual Entry**: Type barcode and press Enter

### Scanning Products

#### Desktop Camera Scanning
1. Click **"Start Scanner"**
2. Allow camera permissions
3. Hold product barcode to camera
4. Product automatically adds to cart

#### Mobile Phone Scanning
1. Open browser on phone
2. Navigate to same network address
3. Click **"Phone Scanner"**
4. Allow camera permissions
5. Scan products with phone
6. Items appear on desktop screen

> 💡 **Tip**: Mobile scanning is more reliable than desktop cameras.

### Managing Cart Items

#### Adjusting Quantities
- Click **"+"** to increase quantity
- Click **"-"** to decrease quantity
- Click quantity number to manually enter amount

#### Removing Items
- Click **"Remove"** or trash icon
- Confirm removal if prompted

#### Applying Discounts
1. Click **"Add Discount"**
2. Choose discount type:
   - Percentage (%)
   - Fixed amount ($)
3. Enter discount value
4. Click **"Apply"**

### Processing Payment

1. Review cart total
2. Click **"Checkout"**
3. Select payment method:
   - **Cash**
   - **Credit Card**
   - **Debit Card**
4. For cash payments:
   - Enter amount received
   - System calculates change
5. For card payments:
   - Enter last 4 digits
   - Enter approval code (if required)
6. Click **"Complete Transaction"**
7. Print or email receipt

### Handling Returns

1. Click **"Return/Exchange"**
2. Enter original transaction ID
3. Select items to return
4. Choose refund method
5. Process refund

---

## 5.5 Mobile Barcode Scanner Setup

### Network Configuration

1. **Ensure same network**:
   - Computer and phone on same Wi-Fi
   - Note computer's IP address

2. **Access from phone**:
   ```
   http://[computer-ip]:5173
   Example: http://192.168.1.100:5173
   ```

3. **Allow permissions**:
   - Camera access
   - Network access

### Scanner Features

#### Camera Controls
- **Torch**: Toggle flashlight on/off
- **Zoom**: Pinch to zoom in/out
- **Focus**: Tap to focus on specific area
- **Switch Camera**: Front/back camera toggle

#### Supported Formats
- UPC-A, UPC-E
- EAN-13, EAN-8
- Code 128, Code 39
- QR Codes
- Data Matrix

### Troubleshooting Scanner Issues

| Issue | Solution |
|-------|----------|
| Camera not working | Check browser permissions, restart browser |
| Scan not detecting | Improve lighting, clean camera lens |
| Network connection lost | Verify same network, check firewall |
| Slow scanning | Reduce camera resolution in settings |

---

## 5.6 Transaction History

### Viewing Transactions

1. Navigate to **Transaction History**
2. Default view shows recent transactions
3. Each row displays:
   - Transaction ID
   - Date/Time
   - Cashier name
   - Total amount
   - Payment method
   - Status

### Filtering Transactions

#### Date Range
1. Click **date picker**
2. Select start and end dates
3. Click **"Apply"**

#### Other Filters
- **Payment Method**: Cash, Credit, Debit, All
- **Cashier**: Select specific cashier (Admin/Manager)
- **Status**: Completed, Pending, Cancelled
- **Amount Range**: Set min/max values

### Transaction Details

1. Click on any transaction row
2. View detailed information:
   - All items purchased
   - Individual prices
   - Quantities
   - Discounts applied
   - Tax information
   - Payment details
3. Options available:
   - **Print Receipt**: Generate receipt copy
   - **Email Receipt**: Send to customer
   - **Void** (Admin only): Cancel transaction

### Exporting Transactions

1. Apply desired filters
2. Click **"Export"** button
3. Choose format:
   - CSV
   - Excel
   - PDF
4. Select columns to include
5. Click **"Download"**

---

## 5.7 Reports & Analytics

### Available Reports by Role

#### Admin Reports
- **Sales Summary**: Comprehensive sales analysis
- **Transaction Report**: Detailed transaction breakdown
- **Inventory Overview**: Stock status and movements
- **User Activity**: User login and action logs
- **Financial Report**: Revenue, costs, profits

#### Manager Reports
- **Sales Summary**: Daily/weekly/monthly sales
- **Transaction Report**: Transaction analysis
- **Inventory Overview**: Stock management insights
- **Financial Report**: Operational finances

#### Cashier Reports
- **My Transaction Report**: Personal sales record
- **Daily Transactions**: Daily performance summary

### Generating Reports

1. Navigate to **Reports & Analytics**
2. Select report type from dropdown
3. Set date range:
   - Today
   - This Week
   - This Month
   - Custom Range
4. Click **"Generate Report"**
5. View report on screen

### Report Features

#### Interactive Charts
- Hover for detailed values
- Click legend to show/hide data
- Zoom in/out for detail

#### Data Tables
- Sort by any column
- Search within results
- Paginate through records

#### Export Options
1. Click **"Export"** button
2. Choose format:
   - **PDF**: For printing/sharing
   - **Excel**: For further analysis
   - **CSV**: For data import
3. Configure options:
   - Include charts
   - Include summary
   - Page orientation
4. Click **"Download"**

### Scheduling Reports (Admin)

1. Click **"Schedule Report"**
2. Select:
   - Report type
   - Frequency (Daily, Weekly, Monthly)
   - Recipients (email addresses)
   - Time of delivery
3. Click **"Save Schedule"**

---

## 5.8 Settings

### Account Settings (All Users)

#### Updating Profile
1. Navigate to **Settings** → **Account Settings**
2. Update:
   - First Name
   - Last Name
   - Email (requires verification)
   - Phone Number
3. Click **"Save Changes"**

#### Changing Password
1. Click **"Change Password"**
2. Enter:
   - Current password
   - New password (min 8 characters)
   - Confirm new password
3. Click **"Update Password"**

#### Notification Preferences
- **Email Notifications**: Toggle on/off
- **Low Stock Alerts**: Set threshold
- **Daily Reports**: Enable/disable
- **Transaction Alerts**: Configure amount threshold

### System Settings (Admin Only)

#### General Configuration
- **Business Name**: Company name for receipts
- **Business Address**: Physical address
- **Tax Rate**: Default tax percentage
- **Currency**: System currency
- **Time Zone**: Local time zone

#### Backup Settings
1. Click **"Backup Settings"**
2. Configure:
   - **Auto Backup**: Enable/disable
   - **Backup Frequency**: Daily, Weekly
   - **Backup Time**: Preferred time
   - **Retention Period**: Days to keep backups
3. **Manual Backup**: Click "Backup Now"

#### Security Settings
- **Session Timeout**: Set inactivity timeout
- **Password Policy**: Configure requirements
- **Two-Factor Authentication**: Enable/disable
- **IP Whitelisting**: Restrict access by IP

### Management Settings (Manager)

#### Operational Preferences
- **Default View**: Dashboard or specific section
- **Report Defaults**: Preferred date ranges
- **Inventory Alerts**: Custom thresholds
- **Staff Notifications**: Team communication settings

### Cashier Settings (Cashier)

#### POS Preferences
- **Scanner Mode**: Auto-start on/off
- **Sound Effects**: Enable/disable beeps
- **Receipt Options**: Auto-print settings
- **Quick Keys**: Customize shortcuts

#### Display Settings
- **Theme**: Light/Dark mode
- **Font Size**: Adjust for readability
- **Grid View**: Products per row
- **Decimal Places**: Price display format

---

## 6. Common Tasks & Workflows

### Daily Opening Procedures

#### For Managers
1. **Check Dashboard** for overnight alerts
2. **Review Low Stock** items
3. **Verify Staff Schedule** in system
4. **Check Previous Day's Report**
5. **Address Any Pending Issues**

#### For Cashiers
1. **Login** to system
2. **Check Register** setup
3. **Test Scanner** functionality
4. **Review Daily Promotions**
5. **Open POS** for transactions

### End of Day Procedures

#### For Managers
1. **Generate Daily Report**
2. **Review Transaction Summary**
3. **Check Inventory Discrepancies**
4. **Approve Any Pending Actions**
5. **Set Next Day Preparations**

#### For Cashiers
1. **Complete Final Transaction**
2. **Print Transaction Report**
3. **Count Register** (if applicable)
4. **Submit Daily Summary**
5. **Logout** from system

### Inventory Management Workflow

#### Receiving New Stock
1. Navigate to **Inventory Management**
2. Click **"Receive Stock"**
3. Scan or enter product barcodes
4. Enter quantities received
5. Verify against purchase order
6. Click **"Confirm Receipt"**
7. System updates stock levels

#### Conducting Stock Count
1. Click **"Stock Count"**
2. Select counting method:
   - **Full Count**: All products
   - **Cycle Count**: Selected categories
3. Print count sheets or use mobile device
4. Enter actual quantities
5. Review discrepancies
6. Click **"Finalize Count"**
7. System adjusts inventory

### Processing Customer Orders

#### Standard Sale
1. Scan/enter products
2. Verify quantities
3. Apply discounts if applicable
4. Process payment
5. Provide receipt

#### Special Orders
1. Click **"Special Order"**
2. Add customer information
3. Add products to order
4. Set pickup/delivery date
5. Process deposit if required
6. Print order confirmation

### Handling Refunds/Exchanges

1. Click **"Return/Exchange"**
2. Enter original transaction ID
3. Verify customer and items
4. Select return reason:
   - Defective
   - Wrong item
   - Customer changed mind
   - Other
5. Process refund or exchange
6. Update inventory
7. Provide receipt

---

## 7. Troubleshooting & FAQs

### Common Issues and Solutions

#### Login Problems

**Issue**: Cannot log in
- **Solution 1**: Verify email and password are correct
- **Solution 2**: Check if account is active
- **Solution 3**: Clear browser cache and cookies
- **Solution 4**: Contact administrator for password reset

**Issue**: Session expires frequently
- **Solution**: Check system settings for session timeout
- **Solution**: Ensure stable internet connection

#### Scanner Issues

**Issue**: Barcode not scanning
- **Solution 1**: Clean camera lens
- **Solution 2**: Improve lighting conditions
- **Solution 3**: Check barcode quality (not damaged)
- **Solution 4**: Try manual entry as alternative

**Issue**: Mobile scanner not connecting
- **Solution 1**: Verify same network connection
- **Solution 2**: Check firewall settings
- **Solution 3**: Restart both devices
- **Solution 4**: Use correct IP address

#### Inventory Discrepancies

**Issue**: Stock levels incorrect
- **Solution 1**: Perform stock count
- **Solution 2**: Check recent transactions
- **Solution 3**: Review adjustment history
- **Solution 4**: Verify no pending receipts

#### Report Generation

**Issue**: Reports not loading
- **Solution 1**: Check date range validity
- **Solution 2**: Ensure sufficient data exists
- **Solution 3**: Clear browser cache
- **Solution 4**: Try different browser

### Frequently Asked Questions

**Q: How do I reset my password?**
A: Click "Forgot Password" on login screen or contact your administrator.

**Q: Can I access the system from home?**
A: Yes, if your administrator has enabled remote access. Use the provided URL.

**Q: How often should I perform stock counts?**
A: Full counts monthly, cycle counts weekly for high-value items.

**Q: What happens if the internet goes down?**
A: The system requires internet. Keep manual backup procedures ready.

**Q: Can I undo a completed transaction?**
A: Only administrators can void transactions. Contact them immediately.

**Q: How do I add a new product category?**
A: Managers and Admins can add categories in Product Categories section.

**Q: Is my data backed up?**
A: Yes, automatic backups run daily. Admins can also trigger manual backups.

**Q: Can I customize receipt format?**
A: Admins can modify receipt templates in System Settings.

**Q: How do I export data to Excel?**
A: Use the Export button in any data table and select Excel format.

**Q: What browsers are supported?**
A: Chrome, Firefox, Safari, and Edge (latest versions).

---

## 8. Best Practices

### Security Best Practices

#### Password Management
- ✅ Use strong passwords (min 8 characters, mixed case, numbers, symbols)
- ✅ Change passwords every 90 days
- ✅ Never share login credentials
- ✅ Use different passwords for different systems
- ❌ Don't write passwords on sticky notes
- ❌ Don't use personal information in passwords

#### Access Control
- ✅ Log out when leaving workstation
- ✅ Report suspicious activity immediately
- ✅ Verify user identity before password resets
- ❌ Don't share user accounts
- ❌ Don't leave system unattended while logged in

### Inventory Management Best Practices

#### Stock Control
- ✅ Perform regular cycle counts
- ✅ Investigate discrepancies immediately
- ✅ Set appropriate minimum stock levels
- ✅ Review slow-moving inventory monthly
- ✅ Document all adjustments with reasons

#### Product Management
- ✅ Use consistent naming conventions
- ✅ Keep product descriptions updated
- ✅ Assign products to appropriate categories
- ✅ Regularly review and update prices
- ✅ Maintain accurate cost information

### Transaction Processing Best Practices

#### Cash Handling
- ✅ Count change twice before giving to customer
- ✅ Keep large bills under till tray
- ✅ Announce amount received and change given
- ✅ Complete each transaction before starting next

#### Customer Service
- ✅ Greet customers promptly
- ✅ Verify items before scanning
- ✅ Offer receipt to every customer
- ✅ Handle returns professionally
- ✅ Escalate issues when needed

### Data Management Best Practices

#### Regular Maintenance
- ✅ Review and clean duplicate entries
- ✅ Archive old transactions annually
- ✅ Update customer information regularly
- ✅ Verify data accuracy in reports

#### Backup Procedures
- ✅ Verify backup completion daily
- ✅ Test restore procedures monthly
- ✅ Keep offsite backup copies
- ✅ Document backup procedures

---

## 9. Keyboard Shortcuts & Tips

### Global Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + S` | Save current form |
| `Ctrl + N` | New item (context-sensitive) |
| `Ctrl + F` | Focus search bar |
| `Ctrl + P` | Print current view |
| `Esc` | Close modal/dialog |
| `F1` | Open help |
| `F5` | Refresh data |
| `Alt + D` | Go to Dashboard |

### POS Shortcuts

| Shortcut | Action |
|----------|--------|
| `F2` | Start scanner |
| `F3` | Manual barcode entry |
| `F4` | Apply discount |
| `F8` | Void line item |
| `F9` | Suspend transaction |
| `F10` | Process payment |
| `+` | Increase quantity |
| `-` | Decrease quantity |
| `Delete` | Remove item |
| `Enter` | Confirm action |

### Navigation Shortcuts

| Shortcut | Action |
|----------|--------|
| `Alt + 1` | Dashboard |
| `Alt + 2` | Products/POS |
| `Alt + 3` | Transactions |
| `Alt + 4` | Reports |
| `Alt + 5` | Settings |
| `Tab` | Next field |
| `Shift + Tab` | Previous field |
| `Page Up/Down` | Navigate lists |

### Pro Tips

#### Efficiency Tips
- 💡 Use tab key to quickly move between fields
- 💡 Learn common product codes for manual entry
- 💡 Set up quick keys for frequent items
- 💡 Use filters to narrow large lists
- 💡 Bookmark frequently used reports

#### Scanner Tips
- 💡 Hold barcode 6-8 inches from camera
- 💡 Ensure good lighting (avoid shadows)
- 💡 Keep barcodes flat and unwrinkled
- 💡 Use mobile scanner for difficult codes
- 💡 Clean camera lens regularly

#### Report Tips
- 💡 Save common report configurations
- 💡 Schedule recurring reports
- 💡 Export to Excel for custom analysis
- 💡 Use date presets for quick selection
- 💡 Compare periods for trends

---

## 10. Glossary of Terms

### A-C

**Active Status**: Product or user available for transactions/login

**Adjustment**: Manual change to inventory quantity

**API**: Application Programming Interface - how systems communicate

**Audit Trail**: Record of all system actions and changes

**Barcode**: Machine-readable product identifier

**Bulk Actions**: Operations performed on multiple items simultaneously

**Category**: Product grouping for organization

**Cost**: Purchase price of product from supplier

**CSV**: Comma-Separated Values file format

**Cycle Count**: Partial inventory count of specific items

### D-I

**Dashboard**: Main overview screen with key metrics

**Deactivate**: Temporarily disable without deleting

**Discount**: Price reduction on products

**EAN**: European Article Number barcode format

**Export**: Save data to external file format

**FIFO**: First In, First Out inventory method

**Gross Profit**: Revenue minus cost of goods

**Inventory**: Stock of products available for sale

**Invoice**: Detailed bill for products/services

### J-P

**KPI**: Key Performance Indicator

**Low Stock Alert**: Warning when inventory below minimum

**Margin**: Difference between cost and selling price

**Modal**: Pop-up dialog window

**NestJS**: Backend framework used by system

**Override**: Admin action to bypass restrictions

**Pagination**: Dividing data into pages

**Payment Gateway**: Service processing card payments

**POS**: Point of Sale system

**Prisma**: Database toolkit used by system

### Q-S

**Query**: Database search request

**Receipt**: Proof of purchase document

**Refund**: Return of payment to customer

**Report**: Formatted data presentation

**Role**: User permission level (Admin/Manager/Cashier)

**Scanner**: Device/camera reading barcodes

**Session**: Active login period

**SKU**: Stock Keeping Unit - unique product identifier

**Stock Count**: Physical inventory verification

### T-Z

**Transaction**: Completed sale record

**Transaction ID**: Unique sale identifier

**Two-Factor Authentication**: Extra security layer

**UPC**: Universal Product Code barcode format

**User Management**: System for controlling user accounts

**Void**: Cancel completed transaction

**Webhook**: Automated data sending between systems

**Workflow**: Sequence of steps to complete task

---

## Quick Reference Card

### Emergency Contacts
- **System Administrator**: [Contact Info]
- **Technical Support**: [Contact Info]
- **Manager on Duty**: [Contact Info]

### System URLs
- **Production**: https://[your-domain].com
- **Development**: http://localhost:5173
- **Backend API**: http://localhost:3000

### Default Credentials (Change Immediately!)
- **Admin Demo**: admin@example.com
- **Manager Demo**: manager@example.com
- **Cashier Demo**: cashier@example.com

### Business Hours Support
- **Monday-Friday**: 9:00 AM - 6:00 PM
- **Saturday**: 10:00 AM - 4:00 PM
- **Sunday**: Closed
- **Emergency**: 24/7 on-call available

---

## Appendix: Network Setup for Mobile Scanner

### Finding Your Computer's IP Address

#### Windows
1. Open Command Prompt
2. Type `ipconfig`
3. Look for "IPv4 Address"

#### macOS
1. Open Terminal
2. Type `ifconfig`
3. Look for "inet" under active connection

#### Linux
1. Open Terminal
2. Type `ip addr show`
3. Look for "inet" address

### Firewall Configuration

#### Windows Firewall
1. Open Windows Defender Firewall
2. Click "Allow an app"
3. Add Node.js
4. Check both Private and Public

#### macOS Firewall
1. System Preferences → Security & Privacy
2. Firewall Options
3. Add application
4. Allow incoming connections

### Router Settings
- Ensure devices on same subnet
- Disable AP isolation
- Enable local network communication

---

## Version History

- **Version 1.0.0** - Initial release
- **Version 1.1.0** - Added mobile scanner support
- **Version 1.2.0** - Enhanced reporting features
- **Version 1.3.0** - Improved user management

---

## Legal Notice

This software is provided "as is" without warranty of any kind. Always maintain proper backups and follow security best practices.

---

**Last Updated**: November 2024
**Document Version**: 1.3.0
**System Version**: 1.3.0

---

*Thank you for using the Inventory Management System. For additional support, please contact your system administrator.*
