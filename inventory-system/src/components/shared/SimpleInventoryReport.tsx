import React from 'react';
import { useInventoryActivity } from '../../hooks/useInventoryActivity';

const SimpleInventoryReport: React.FC = () => {
  const { activities, logActivity, clearActivities } = useInventoryActivity();

  console.log('🔥 SimpleInventoryReport - activities:', activities);

  const addTestActivity = () => {
    logActivity({
      type: 'SCAN_ADD',
      productName: 'Test Product',
      productBarcode: '1234567890',
      details: { quantityAdded: 1, oldStock: 10, newStock: 11 },
      user: 'Test User',
      method: 'SCAN'
    });
  };

  return (
    <div style={{ padding: '20px', background: 'white', borderRadius: '8px' }}>
      <h2>Simple Inventory Activity Report</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button onClick={addTestActivity} style={{ marginRight: '10px', padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
          Add Test Activity
        </button>
        <button onClick={clearActivities} style={{ padding: '10px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}>
          Clear Activities
        </button>
      </div>

      <div>
        <h3>Activities Count: {activities.length}</h3>
        
        {activities.length === 0 ? (
          <p>No activities found. Click "Add Test Activity" to create one.</p>
        ) : (
          <div>
            {activities.map((activity, index) => (
              <div key={activity.id} style={{ 
                border: '1px solid #ddd', 
                padding: '10px', 
                margin: '10px 0', 
                borderRadius: '4px',
                background: '#f8f9fa'
              }}>
                <strong>#{index + 1}</strong> - {activity.type} - {activity.productName} - {activity.user} - {activity.method}
                <br />
                <small>{new Date(activity.timestamp).toLocaleString()}</small>
                {activity.details.quantityAdded && (
                  <div>Quantity Added: {activity.details.quantityAdded}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleInventoryReport;
