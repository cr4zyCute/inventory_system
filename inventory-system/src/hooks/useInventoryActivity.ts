import { useState, useEffect } from 'react';

export interface InventoryActivity {
  id: string;
  timestamp: string;
  type: 'ADD_NEW' | 'ADD_STOCK' | 'EDIT_PRODUCT' | 'SCAN_ADD' | 'MANUAL_ADD';
  productName: string;
  productBarcode: string;
  details: {
    quantityAdded?: number;
    oldStock?: number;
    newStock?: number;
    changes?: Record<string, { old: any; new: any }>;
  };
  user: string;
  method: 'SCAN' | 'MANUAL';
}

const STORAGE_KEY = 'inventory_activity_log';

export const useInventoryActivity = () => {
  const [activities, setActivities] = useState<InventoryActivity[]>([]);

  // Load activities from localStorage on mount
  useEffect(() => {
    console.log('🔥 Loading activities from localStorage...');
    const stored = localStorage.getItem(STORAGE_KEY);
    console.log('🔥 Stored data:', stored);
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        console.log('🔥 Parsed activities:', parsed);
        setActivities(parsed);
      } catch (error) {
        console.error('Failed to parse inventory activity log:', error);
        setActivities([]);
      }
    } else {
      console.log('🔥 No stored activities found');
    }
  }, []);

  // Save to localStorage whenever activities change
  useEffect(() => {
    console.log('🔥 Saving activities to localStorage, count:', activities.length);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
    console.log('🔥 Saved to localStorage successfully');
  }, [activities]);

  const logActivity = (activity: Omit<InventoryActivity, 'id' | 'timestamp'>) => {
    console.log('🔥 logActivity called with:', activity);
    
    const newActivity: InventoryActivity = {
      ...activity,
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };

    console.log('🔥 New activity created:', newActivity);
    
    setActivities(prev => {
      const updated = [newActivity, ...prev].slice(0, 1000);
      console.log('🔥 Activities updated, total count:', updated.length);
      return updated;
    });
    
    console.log('📝 Logged inventory activity:', newActivity);
  };

  const clearActivities = () => {
    setActivities([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const getActivitiesByDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return activities.filter(activity => {
      const activityDate = new Date(activity.timestamp);
      return activityDate >= start && activityDate <= end;
    });
  };

  const getActivitiesByType = (type: InventoryActivity['type']) => {
    return activities.filter(activity => activity.type === type);
  };

  const getActivitiesByProduct = (productBarcode: string) => {
    return activities.filter(activity => activity.productBarcode === productBarcode);
  };

  return {
    activities,
    logActivity,
    clearActivities,
    getActivitiesByDateRange,
    getActivitiesByType,
    getActivitiesByProduct,
  };
};
