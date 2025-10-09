import React, { useEffect, useState } from 'react';
import type { Transaction, TransactionStatus, PaymentFilter } from './types';
// @ts-ignore - Receipt.jsx is a JavaScript file
import Receipt from './Receipt.jsx';
import './css/TransactionRecord.css';

// API functions for transactions
const fetchTransactions = async (): Promise<Transaction[]> => {
  try {
    const response = await fetch('/api/transactions');
    if (!response.ok) {
      throw new Error('Failed to fetch transactions');
    }
    const result = await response.json();
    
    // The backend returns { success: true, data: [...] } format
    const transactions = result.data || result;
    
    // Transform database data to match our Transaction interface
    return transactions.map((dbTransaction: any) => ({
      id: dbTransaction.transactionId,
      date: new Date(dbTransaction.createdAt).toLocaleDateString(),
      time: new Date(dbTransaction.createdAt).toLocaleTimeString(),
      cashier: dbTransaction.cashierName,
      items: dbTransaction.items?.length || 0,
      total: dbTransaction.totalAmount,
      paymentMethod: dbTransaction.paymentMethod,
      status: dbTransaction.status === 'completed' ? 'Completed' : 
              dbTransaction.status === 'refunded' ? 'Refunded' : 'Pending',
      lineItems: dbTransaction.items?.map((item: any) => ({
        name: item.product?.name || 'Unknown Product',
        quantity: item.quantity,
        price: item.unitPrice
      })) || []
    }));
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
};

const deleteTransaction = async (transactionId: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/transactions/${transactionId}`, {
      method: 'DELETE',
    });
    return response.ok;
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return false;
  }
};

const TransactionHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'TXN001',
      date: '2024-01-15',
      time: '10:30 AM',
      cashier: 'John Doe',
      items: 5,
      total: 125.50,
      paymentMethod: 'Cash',
      status: 'Completed',
      lineItems: [
        { name: 'Milk Tea', quantity: 2, price: 35.25 },
        { name: 'Brown Sugar Cake', quantity: 1, price: 45.0 },
        { name: 'Bottled Water', quantity: 2, price: 5.0 }
      ]
    },
    {
      id: 'TXN002',
      date: '2024-01-15',
      time: '11:15 AM',
      cashier: 'Jane Smith',
      items: 3,
      total: 89.25,
      paymentMethod: 'Card',
      status: 'Completed',
      lineItems: [
        { name: 'Frozen Yogurt', quantity: 2, price: 28.0 },
        { name: 'Granola Bar', quantity: 1, price: 33.25 }
      ]
    },
    {
      id: 'TXN003',
      date: '2024-01-15',
      time: '02:45 PM',
      cashier: 'Mike Johnson',
      items: 8,
      total: 234.75,
      paymentMethod: 'Cash',
      status: 'Completed',
      lineItems: [
        { name: 'Assorted Snacks', quantity: 4, price: 20.5 },
        { name: 'Bottled Soda', quantity: 4, price: 15.19 }
      ]
    },
    {
      id: 'TXN004',
      date: '2024-01-15',
      time: '03:20 PM',
      cashier: 'Sarah Wilson',
      items: 2,
      total: 45.00,
      paymentMethod: 'Card',
      status: 'Refunded',
      lineItems: [
        { name: 'Gift Card', quantity: 1, price: 25.0 },
        { name: 'Canvas Tote', quantity: 1, price: 20.0 }
      ]
    },
    {
      id: 'TXN005',
      date: '2024-01-15',
      time: '04:10 PM',
      cashier: 'John Doe',
      items: 6,
      total: 178.90,
      paymentMethod: 'Cash',
      status: 'Completed',
      lineItems: [
        { name: 'Notebook Set', quantity: 3, price: 25.3 },
        { name: 'Gel Pen Pack', quantity: 3, price: 14.0 }
      ]
    }
  ]);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<TransactionStatus>('All');
  const [filterPayment, setFilterPayment] = useState<PaymentFilter>('All');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; right: number } | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showReceiptPreview, setShowReceiptPreview] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load transactions on component mount
  useEffect(() => {
    const loadTransactions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchTransactions();
        setTransactions(data);
      } catch (err) {
        setError('Failed to load transactions');
        console.error('Error loading transactions:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTransactions();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown && !(event.target as Element).closest('.action-dropdown')) {
        setActiveDropdown(null);
        setDropdownPosition(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown]);

  // Filter transactions based on search and filters
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.cashier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || transaction.status === filterStatus;
    const matchesPayment = filterPayment === 'All' || transaction.paymentMethod === filterPayment;
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const getStatusClass = (status: Transaction['status']): string => {
    switch (status) {
      case 'Completed': return 'status-completed';
      case 'Refunded': return 'status-refunded';
      case 'Pending': return 'status-pending';
      default: return '';
    }
  };

  const handleRowClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowReceiptPreview(true);
  };

  const closeReceiptPreview = () => {
    setSelectedTransaction(null);
    setShowReceiptPreview(false);
  };

  const handlePrintReceipt = (transaction: Transaction) => {
    // Convert transaction to receipt format and print
    const receiptItems = transaction.lineItems || [
      {
        name: `Transaction ${transaction.id}`,
        quantity: transaction.items,
        price: transaction.total / Math.max(transaction.items, 1),
        barcode: 'N/A'
      }
    ];
    
    // Create a temporary receipt component for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups to print the receipt');
      return;
    }
    
    const receiptHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${transaction.id}</title>
          <style>
            body { font-family: 'Courier New', monospace; margin: 0; padding: 20px; background: white; }
            .receipt-container { max-width: 300px; margin: 0 auto; background: white; padding: 0; }
            .receipt-header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 15px; }
            .shop-name { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
            .shop-details { font-size: 12px; line-height: 1.3; }
            .receipt-title { text-align: center; font-weight: bold; margin: 15px 0; font-size: 14px; }
            .receipt-items { border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 10px 0; margin: 15px 0; }
            .item-row { display: flex; justify-content: space-between; margin-bottom: 3px; font-size: 12px; }
            .item-name { flex: 1; }
            .item-qty { margin: 0 10px; }
            .item-price { text-align: right; min-width: 40px; }
            .receipt-totals { border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 15px; }
            .total-row { display: flex; justify-content: space-between; margin-bottom: 3px; font-size: 12px; }
            .total-row.final { font-weight: bold; font-size: 14px; border-top: 1px solid #000; padding-top: 5px; margin-top: 5px; }
            .receipt-footer { text-align: center; font-size: 12px; }
            @media print { body { margin: 0; padding: 10px; } .receipt-container { max-width: none; } }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="receipt-header">
              <div class="shop-name">TINDAHAN STORE</div>
              <div class="shop-details">Address: Lorem Ipsum, 23-10<br/>Telp. 0922ayawugtoo</div>
            </div>
            <div class="receipt-title">★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★<br/>CASH RECEIPT<br/>★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★</div>
            <div class="receipt-info">
              <div style="font-size: 11px; margin-bottom: 10px;">
                Receipt #: ${transaction.id}<br/>
                Date: ${transaction.date}<br/>
                Time: ${transaction.time}<br/>
                Cashier: ${transaction.cashier}
              </div>
            </div>
            <div class="receipt-items">
              <div class="item-row" style="font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 3px; margin-bottom: 5px;">
                <span class="item-name">Description</span>
                <span class="item-qty">Qty</span>
                <span class="item-price">Price</span>
              </div>
              ${receiptItems.map(item => `
                <div class="item-row">
                  <span class="item-name">${item.name}</span>
                  <span class="item-qty">${item.quantity}</span>
                  <span class="item-price">₱${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              `).join('')}
            </div>
            <div class="receipt-totals">
              <div class="total-row final">
                <span>Total</span>
                <span>₱${transaction.total.toFixed(2)}</span>
              </div>
              <div class="total-row">
                <span>Payment</span>
                <span>${transaction.paymentMethod}</span>
              </div>
            </div>
            <div class="receipt-footer">
              <div style="font-weight: bold; margin-bottom: 10px;">THANK YOU!</div>
            </div>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
    
    setActiveDropdown(null);
    setDropdownPosition(null);
  };

  const handleDeleteTransaction = async (transaction: Transaction) => {
    if (confirm(`Are you sure you want to delete transaction ${transaction.id}?`)) {
      setIsLoading(true);
      const success = await deleteTransaction(transaction.id);
      
      if (success) {
        // Remove transaction from local state
        setTransactions(prev => prev.filter(t => t.id !== transaction.id));
        alert('Transaction deleted successfully');
      } else {
        alert('Failed to delete transaction');
      }
      
      setActiveDropdown(null);
      setDropdownPosition(null);
      setIsLoading(false);
    }
  };

  const refreshTransactions = async () => {
    setIsLoading(true);
    try {
      const data = await fetchTransactions();
      setTransactions(data);
    } catch (err) {
      setError('Failed to refresh transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const renderReceiptPreview = () => {
    if (!selectedTransaction || !showReceiptPreview) {
      return null;
    }

    const receiptItems = selectedTransaction.lineItems?.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      barcode: 'N/A'
    })) || [
      {
        name: `Transaction ${selectedTransaction.id}`,
        quantity: selectedTransaction.items,
        price: selectedTransaction.total / Math.max(selectedTransaction.items, 1),
        barcode: 'N/A'
      }
    ];

    return (
      <div className="receipt-modal-transaction">
        <div className="receipt-modal-content-transaction">
          <button className="receipt-close-btn-transaction" onClick={closeReceiptPreview}>×</button>
          <div className="receipt-container">
            <div className="receipt-header">
              <div className="shop-name">TINDAHAN STORE</div>
              <div className="shop-details">
                Address: sa puso mo, 23-10<br/>
                Telp. 0922ayawugtoo
              </div>
            </div>

            <div className="receipt-title">
              ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★<br/>
              CASH RECEIPT<br/>
              ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★
            </div>

            <div className="receipt-info">
              <div style={{ fontSize: '11px', marginBottom: '10px' }}>
                Receipt #: {selectedTransaction.id}<br/>
                Date: {selectedTransaction.date}<br/>
                Time: {selectedTransaction.time}<br/>
                Cashier: {selectedTransaction.cashier}
              </div>
            </div>

            <div className="receipt-items">
              <div className="item-row" style={{ fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '3px', marginBottom: '5px' }}>
                <span className="item-name">Description</span>
                <span className="item-qty">Qty</span>
                <span className="item-price">Price</span>
              </div>
              {receiptItems.map((item, index) => (
                <div key={index} className="item-row">
                  <span className="item-name">{item.name}</span>
                  <span className="item-qty">{item.quantity}</span>
                  <span className="item-price">₱{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="receipt-totals">
              <div className="total-row final">
                <span>Total</span>
                <span>₱{selectedTransaction.total.toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Payment</span>
                <span>{selectedTransaction.paymentMethod}</span>
              </div>
            </div>

            <div className="receipt-footer">
              <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>
                THANK YOU!
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="transaction-record-container">
      <div className="transaction-record-header">
        <div>
          <h2 className="transaction-record-title">
            <i className="bi-receipt"></i> Transaction History
          </h2>
          <p className="transaction-record-subtitle">View and manage transaction records</p>
        </div>
        <div className="transaction-stats">
          <div className="stat-card">
            <span className="stat-number">{transactions.length}</span>
            <span className="stat-label">Total Transactions</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">
              ₱{transactions.reduce((sum, t) => sum + t.total, 0).toFixed(2)}
            </span>
            <span className="stat-label">Total Sales</span>
          </div>
        </div>
      </div>

      <div className="controls-container">
        <button 
          onClick={refreshTransactions}
          disabled={isLoading}
          className="refresh-button"
        >
          <i className={`bi-arrow-clockwise ${isLoading ? 'spinning' : ''}`}></i>
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as TransactionStatus)}
          className="filter-select"
        >
          <option value="All">All Status</option>
          <option value="Completed">Completed</option>
          <option value="Refunded">Refunded</option>
          <option value="Pending">Pending</option>
        </select>

        <select
          value={filterPayment}
          onChange={(e) => setFilterPayment(e.target.value as PaymentFilter)}
          className="filter-select"
        >
          <option value="All">All Payment Methods</option>
          <option value="Cash">Cash</option>
          <option value="Card">Card</option>
        </select>
        
        <div className="search-container">
          <i className="bi-search search-icon"></i>
          <input
            type="text"
            placeholder="Search by Transaction ID or Cashier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <div className="search-results-count">
              {filteredTransactions.length} result{filteredTransactions.length !== 1 ? 's' : ''}
            </div>
          )}
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="search-clear-button"
              title="Clear search"
            >
              <i className="bi-x"></i>
            </button>
          )}
        </div>
      </div>

      <div className="table-container">
        <table className="transactions-table">
          <thead>
            <tr className="table-header">
              <th className="table-header-cell">Transaction ID</th>
              <th className="table-header-cell">Date & Time</th>
              <th className="table-header-cell">Cashier</th>
              <th className="table-header-cell">Items</th>
              <th className="table-header-cell">Total</th>
              <th className="table-header-cell">Payment</th>
              <th className="table-header-cell">Status</th>
              <th className="table-header-cell">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="loading-state">
                  <i className="bi-arrow-repeat spinning"></i>
                  <span>Loading transactions...</span>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={8} className="error-state">
                  <i className="bi-exclamation-triangle"></i>
                  <span>{error}</span>
                  <button onClick={refreshTransactions} className="retry-button">
                    Retry
                  </button>
                </td>
              </tr>
            ) : filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="table-row"
                  onClick={() => handleRowClick(transaction)}
                  style={{ cursor: 'pointer' }}
                >
                  <td className="table-cell">
                    <code className="transaction-id">{transaction.id}</code>
                  </td>
                  <td className="table-cell">
                    <div className="transaction-datetime">
                      <div className="date">{transaction.date}</div>
                      <div className="time">{transaction.time}</div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className="cashier-name">{transaction.cashier}</span>
                  </td>
                  <td className="table-cell">
                    <span className="items-badge">{transaction.items} items</span>
                  </td>
                  <td className="table-cell">
                    <span className="transaction-total">₱{transaction.total.toFixed(2)}</span>
                  </td>
                  <td className="table-cell">
                    <span className={`payment-badge payment-${transaction.paymentMethod.toLowerCase()}`}>
                      {transaction.paymentMethod}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className={`status-badge ${getStatusClass(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="action-dropdown">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const rect = e.currentTarget.getBoundingClientRect();
                          const isLastRow = filteredTransactions.indexOf(transaction) === filteredTransactions.length - 1;
                          
                          if (activeDropdown === transaction.id) {
                            setActiveDropdown(null);
                            setDropdownPosition(null);
                          } else {
                            setActiveDropdown(transaction.id);
                            setDropdownPosition({
                              top: isLastRow ? rect.top - 80 : rect.bottom + 4,
                              right: window.innerWidth - rect.right
                            });
                          }
                        }}
                        className="dropdown-toggle"
                        title="More actions"
                      >
                        <i className="bi-three-dots-vertical"></i>
                      </button>
                      {activeDropdown === transaction.id && dropdownPosition && (
                        <div 
                          className="dropdown-menu" 
                          style={{
                            position: 'fixed',
                            top: `${dropdownPosition.top}px`,
                            right: `${dropdownPosition.right}px`
                          }}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePrintReceipt(transaction);
                            }}
                            className="dropdown-item"
                          >
                            <i className="bi-printer"></i>
                            Print Receipt
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTransaction(transaction);
                            }}
                            className="dropdown-item delete"
                          >
                            <i className="bi-trash"></i>
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="empty-state">
                  <i className="bi-inbox empty-state-icon"></i>
                  <span>No transactions found matching your criteria</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <div className="results-info">
          Showing {filteredTransactions.length} of {transactions.length} transactions
        </div>
        <div className="pagination">
          <button className="pagination-btn" disabled>Previous</button>
          <span className="page-info">Page 1 of 1</span>
          <button className="pagination-btn" disabled>Next</button>
        </div>
      </div>
      {renderReceiptPreview()}
    </div>
  );
};

export default TransactionHistory;