import React, { useState } from 'react';

const CashierSettings: React.FC = () => {
  const [displaySettings, setDisplaySettings] = useState({
    fontSize: 'medium',
    showPrices: true,
    compactMode: false,
    theme: 'light'
  });

  const [scannerSettings, setScannerSettings] = useState({
    soundEnabled: true,
    vibrationEnabled: true,
    autoFocus: true,
    scanDelay: '500'
  });

  const handleDisplayChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setDisplaySettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleScannerChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setScannerSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const saveDisplaySettings = () => {
    // Save to localStorage for now
    localStorage.setItem('cashierDisplaySettings', JSON.stringify(displaySettings));
    alert('Display settings saved!');
  };

  const saveScannerSettings = () => {
    // Save to localStorage for now
    localStorage.setItem('cashierScannerSettings', JSON.stringify(scannerSettings));
    alert('Scanner settings saved!');
  };

  return (
    <div className="cashier-settings">
      {/* Display Settings */}
      <div className="settings-card">
        <div className="card-header">
          <h3 className="card-title">
            <i className="bi bi-display"></i>
            Display Settings
          </h3>
          <p className="card-description">Customize your display preferences for better usability</p>
        </div>

        <div className="settings-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fontSize" className="form-label">Font Size</label>
              <select
                id="fontSize"
                name="fontSize"
                value={displaySettings.fontSize}
                onChange={handleDisplayChange}
                className="form-input"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
                <option value="extra-large">Extra Large</option>
              </select>
              <small className="form-help">Choose a comfortable font size for reading</small>
            </div>

            <div className="form-group">
              <label htmlFor="theme" className="form-label">Theme</label>
              <select
                id="theme"
                name="theme"
                value={displaySettings.theme}
                onChange={handleDisplayChange}
                className="form-input"
              >
                <option value="light">Light Theme</option>
                <option value="dark">Dark Theme</option>
                <option value="high-contrast">High Contrast</option>
              </select>
              <small className="form-help">Select theme for better visibility</small>
            </div>
          </div>

          <div className="checkbox-section">
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="showPrices"
                name="showPrices"
                checked={displaySettings.showPrices}
                onChange={handleDisplayChange}
                className="form-checkbox"
              />
              <label htmlFor="showPrices" className="checkbox-label">
                <strong>Show Prices on Display</strong>
                <span>Display product prices prominently during transactions</span>
              </label>
            </div>

            <div className="checkbox-group">
              <input
                type="checkbox"
                id="compactMode"
                name="compactMode"
                checked={displaySettings.compactMode}
                onChange={handleDisplayChange}
                className="form-checkbox"
              />
              <label htmlFor="compactMode" className="checkbox-label">
                <strong>Compact Mode</strong>
                <span>Use smaller spacing to fit more information on screen</span>
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={saveDisplaySettings}
              className="btn btn-primary"
            >
              <i className="bi bi-check"></i>
              Save Display Settings
            </button>
          </div>
        </div>
      </div>

      {/* Scanner Settings */}
      <div className="settings-card">
        <div className="card-header">
          <h3 className="card-title">
            <i className="bi bi-upc-scan"></i>
            Scanner Settings
          </h3>
          <p className="card-description">Configure barcode scanner behavior and feedback</p>
        </div>

        <div className="settings-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="scanDelay" className="form-label">Scan Delay</label>
              <select
                id="scanDelay"
                name="scanDelay"
                value={scannerSettings.scanDelay}
                onChange={handleScannerChange}
                className="form-input"
              >
                <option value="0">No delay</option>
                <option value="250">250ms (Fast)</option>
                <option value="500">500ms (Normal)</option>
                <option value="1000">1 second (Slow)</option>
              </select>
              <small className="form-help">Delay between consecutive scans to prevent duplicates</small>
            </div>
          </div>

          <div className="checkbox-section">
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="soundEnabled"
                name="soundEnabled"
                checked={scannerSettings.soundEnabled}
                onChange={handleScannerChange}
                className="form-checkbox"
              />
              <label htmlFor="soundEnabled" className="checkbox-label">
                <strong>Sound Feedback</strong>
                <span>Play beep sound when barcode is successfully scanned</span>
              </label>
            </div>

            <div className="checkbox-group">
              <input
                type="checkbox"
                id="vibrationEnabled"
                name="vibrationEnabled"
                checked={scannerSettings.vibrationEnabled}
                onChange={handleScannerChange}
                className="form-checkbox"
              />
              <label htmlFor="vibrationEnabled" className="checkbox-label">
                <strong>Vibration Feedback</strong>
                <span>Vibrate device when barcode is successfully scanned (mobile only)</span>
              </label>
            </div>

            <div className="checkbox-group">
              <input
                type="checkbox"
                id="autoFocus"
                name="autoFocus"
                checked={scannerSettings.autoFocus}
                onChange={handleScannerChange}
                className="form-checkbox"
              />
              <label htmlFor="autoFocus" className="checkbox-label">
                <strong>Auto-Focus Camera</strong>
                <span>Automatically focus camera for better barcode recognition</span>
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={saveScannerSettings}
              className="btn btn-primary"
            >
              <i className="bi bi-check"></i>
              Save Scanner Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashierSettings;
