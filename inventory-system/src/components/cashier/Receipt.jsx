import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './css/receipt.css';

const Receipt = ({ items, total, onClose, onPrint }) => {
  const { user } = useAuth();
  const receiptRef = useRef();
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [cashReceived, setCashReceived] = useState(total);
  const [isProcessing, setIsProcessing] = useState(false);
  const [printSuccess, setPrintSuccess] = useState(false);
  const [processingStep, setProcessingStep] = useState('');

  const receiptNumber = `RCP-${Date.now().toString().slice(-8)}`;
  const currentDate = new Date();
  const change = paymentMethod === 'cash' ? Math.max(0, cashReceived - total) : 0;

  // Update product inventory by deducting sold quantities
  const updateProductInventory = async () => {
    try {
      console.log('📦 Updating product inventory after sale...');
      
      for (const item of items) {
        try {
          // First, get the current product data
          const productResponse = await fetch(`/api/products/barcode/${item.barcode}`);
          if (!productResponse.ok) {
            console.warn(`⚠️ Could not find product with barcode: ${item.barcode}`);
            continue;
          }
          
          const productResult = await productResponse.json();
          const product = productResult.data || productResult;
          
          // Calculate new stock quantity
          const newStockQuantity = Math.max(0, product.stockQuantity - item.quantity);
          
          console.log(`📦 Updating ${product.name}: ${product.stockQuantity} → ${newStockQuantity} (sold: ${item.quantity})`);
          
          // Update the product inventory
          const updateResponse = await fetch(`/api/products/${product.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...product,
              stockQuantity: newStockQuantity
            })
          });
          
          if (updateResponse.ok) {
            console.log(`✅ Successfully updated inventory for ${product.name}`);
          } else {
            console.error(`❌ Failed to update inventory for ${product.name}:`, updateResponse.status);
          }
          
        } catch (error) {
          console.error(`❌ Error updating inventory for barcode ${item.barcode}:`, error);
        }
      }
      
      console.log('✅ Inventory update process completed');
      
      // Dispatch event to refresh product lists in other components
      window.dispatchEvent(new CustomEvent('inventoryUpdated', { 
        detail: { 
          updatedProducts: items.map(item => ({
            barcode: item.barcode,
            quantitySold: item.quantity
          }))
        }
      }));
      
    } catch (error) {
      console.error('❌ Error during inventory update:', error);
    }
  };

  // Save transaction to database
  const saveTransactionToDatabase = async () => {
    try {
      // First, we need to get product IDs from barcodes
      const itemsWithProductIds = await Promise.all(
        items.map(async (item) => {
          try {
            // Find product by barcode to get the correct product ID
            const productResponse = await fetch(`/api/products/barcode/${item.barcode}`);
            if (productResponse.ok) {
              const productResult = await productResponse.json();
              const product = productResult.data || productResult;
              
              return {
                productId: product.id, // Use the actual product ID from database
                quantity: item.quantity,
                unitPrice: item.price,
                totalPrice: item.price * item.quantity
              };
            } else {
              console.warn(`⚠️ Product not found for barcode: ${item.barcode}`);
              // Skip this item if product not found
              return null;
            }
          } catch (error) {
            console.error(`❌ Error finding product for barcode ${item.barcode}:`, error);
            return null;
          }
        })
      );

      // Filter out null items (products not found)
      const validItems = itemsWithProductIds.filter(item => item !== null);

      if (validItems.length === 0) {
        console.error('❌ No valid products found for transaction items');
        return;
      }

      const transactionData = {
        transactionId: receiptNumber,
        totalAmount: total,
        subtotalAmount: total,
        taxAmount: 0,
        discountAmount: 0,
        paymentMethod: paymentMethod,
        status: 'completed',
        cashierId: null,
        items: validItems
      };

      console.log('💾 Saving transaction to database:', transactionData);

      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Transaction saved successfully:', result);
        
        // Dispatch a custom event to refresh transaction history
        window.dispatchEvent(new CustomEvent('transactionSaved', { 
          detail: result.data 
        }));
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to save transaction:', response.status, errorText);
      }
    } catch (error) {
      console.error('❌ Error saving transaction:', error);
    }
  };

  const handlePrint = async () => {
    setIsProcessing(true);
    setProcessingStep('Saving transaction...');
    
    try {
      // Save transaction to database first
      await saveTransactionToDatabase();
      
      setProcessingStep('Updating inventory...');
      // Update product inventory by deducting sold quantities
      await updateProductInventory();
      
      setProcessingStep('Finalizing sale...');
      // Call the onPrint function to clear cart
      if (onPrint) {
        await onPrint();
      }
      
      // Add a small delay to ensure the success alert is shown first
      setTimeout(() => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
          alert('Please allow pop-ups to print the receipt');
          setIsProcessing(false);
          return;
        }
        
        const receiptHTML = receiptRef.current.innerHTML;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${receiptNumber}</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              margin: 0;
              padding: 20px;
              background: white;
            }
            .receipt-container {
              max-width: 300px;
              margin: 0 auto;
              background: white;
              padding: 0;
            }
            .receipt-header {
              text-align: center;
              border-bottom: 1px dashed #000;
              padding-bottom: 10px;
              margin-bottom: 15px;
            }
            .shop-name {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .shop-details {
              font-size: 12px;
              line-height: 1.3;
            }
            .receipt-title {
              text-align: center;
              font-weight: bold;
              margin: 15px 0;
              font-size: 14px;
            }
            .receipt-items {
              border-top: 1px dashed #000;
              border-bottom: 1px dashed #000;
              padding: 10px 0;
              margin: 15px 0;
            }
            .item-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 3px;
              font-size: 12px;
            }
            .item-name {
              flex: 1;
            }
            .item-qty {
              margin: 0 10px;
            }
            .item-price {
              text-align: right;
              min-width: 40px;
            }
            .receipt-totals {
              border-bottom: 1px dashed #000;
              padding-bottom: 10px;
              margin-bottom: 15px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 3px;
              font-size: 12px;
            }
            .total-row.final {
              font-weight: bold;
              font-size: 14px;
              border-top: 1px solid #000;
              padding-top: 5px;
              margin-top: 5px;
            }
            .receipt-payment {
              border-bottom: 1px dashed #000;
              padding-bottom: 10px;
              margin-bottom: 15px;
              font-size: 12px;
            }
            .receipt-footer {
              text-align: center;
              font-size: 12px;
            }
            .barcode {
              text-align: center;
              font-family: 'Libre Barcode 128', monospace;
              font-size: 24px;
              margin: 10px 0;
              letter-spacing: 1px;
            }
            @media print {
              body { margin: 0; padding: 10px; }
              .receipt-container { max-width: none; }
            }
          </style>
        </head>
        <body>
          ${receiptHTML}
        </body>
      </html>
    `);
    
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
        
        setIsProcessing(false);
        setProcessingStep('');
        setPrintSuccess(true);
        
        // Show success message briefly, then auto-close
        setTimeout(() => {
          console.log('✅ Receipt printed successfully, closing modal...');
          if (onClose) {
            onClose();
          }
        }, 1500); // Close modal 1.5 seconds after print to allow user to see success
        
      }, 1000); // 1 second delay
      
    } catch (error) {
      console.error('Error during print process:', error);
      setIsProcessing(false);
      setProcessingStep('');
      alert('Error processing sale. Please try again.');
    }
  };

  return (
    <div className="receipt-modal">
      <div className="receipt-modal-content">
        <div className="receipt-actions">
          <h3>Receipt Preview</h3>
          <div className="payment-section">
            <h4>💰 Cash Payment</h4>
            <div className="cash-input">
              <label>Cash Received:</label>
              <input
                type="number"
                value={cashReceived}
                onChange={(e) => setCashReceived(parseFloat(e.target.value) || 0)}
                min={total}
                step="0.01"
                placeholder={`Minimum: ₱${total.toFixed(2)}`}
              />
              {change > 0 && (
                <div className="change-display">
                  <strong>Change: ₱{change.toFixed(2)}</strong>
                </div>
              )}
            </div>
          </div>

          <div className="action-buttons">
            <button 
              onClick={handlePrint} 
              className={`print-btn ${printSuccess ? 'success' : ''}`}
              disabled={isProcessing || printSuccess}
            >
              {isProcessing ? (
                <>
                  <i className="bi-arrow-clockwise loading-spin"></i> 
                  {processingStep || 'Processing Sale...'}
                </>
              ) : printSuccess ? (
                <>
                  <i className="bi-check-circle"></i> 
                  Print Successful!
                </>
              ) : (
                <>
                  <i className="bi-printer"></i> 
                  Print Receipt
                </>
              )}
            </button>
            <button 
              onClick={onClose} 
              className="close-btn"
              disabled={isProcessing}
            >
              <i className="bi-x-circle"></i> 
            </button>
          </div>
        </div>

        <div className="receipt-preview">
          <div ref={receiptRef} className="receipt-container">
            <div className="receipt-header">
              <div className="shop-name">SHOP NAME</div>
              <div className="shop-details">
                Address: Lorem Ipsum, 23-10<br/>
                Telp. 11223344
              </div>
            </div>

            <div className="receipt-title">
              ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★<br/>
              CASH RECEIPT<br/>
              ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★
            </div>

            <div className="receipt-info">
              <div style={{ fontSize: '11px', marginBottom: '10px' }}>
                Receipt #: {receiptNumber}<br/>
                Date: {currentDate.toLocaleDateString()}<br/>
                Time: {currentDate.toLocaleTimeString()}<br/>
                Cashier: {user?.name || 'System'}
              </div>
            </div>

            <div className="receipt-items">
              <div className="item-row" style={{ fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '3px', marginBottom: '5px' }}>
                <span className="item-name">Description</span>
                <span className="item-qty">Qty</span>
                <span className="item-price">Price</span>
              </div>
              {items.map((item, index) => (
                <div key={index} className="item-row">
                  <span className="item-name">{item.name}</span>
                  <span className="item-qty">{item.quantity}</span>
                  <span className="item-price">₱{(item.price * item.quantity).toFixed(1)}</span>
                </div>
              ))}
            </div>

            <div className="receipt-totals">
              <div className="total-row final">
                <span>Total</span>
                <span>₱{total.toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Cash</span>
                <span>₱{cashReceived.toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Change</span>
                <span>₱{change.toFixed(2)}</span>
              </div>
            </div>

            <div className="receipt-footer">
              <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>
                THANK YOU!
              </div>
              <div className="barcode">
                ||||| |||| | || |||| | ||||| ||||
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Receipt;
