'use client';

import { useState, useEffect } from 'react';
import { Settings, Type, Eye, Keyboard, X, Plus, Minus } from 'lucide-react';

interface AccessibilitySettings {
  fontSize: number;
  highContrast: boolean;
  largeCursor: boolean;
  underlineLinks: boolean;
}

export default function AccessibilityWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: 100,
    highContrast: false,
    largeCursor: false,
    underlineLinks: false,
  });

  useEffect(() => {
    // Load saved settings from localStorage
    const saved = localStorage.getItem('accessibility-settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings(parsed);
        applySettings(parsed);
      } catch (e) {
        console.error('Failed to load accessibility settings', e);
      }
    } else {
      // Apply default settings on first load
      applySettings(settings);
    }
  }, []);

  const applySettings = (newSettings: AccessibilitySettings) => {
    const root = document.documentElement;
    
    // Font size
    root.style.fontSize = `${newSettings.fontSize}%`;
    
    // High contrast
    if (newSettings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Large cursor
    if (newSettings.largeCursor) {
      root.classList.add('large-cursor');
    } else {
      root.classList.remove('large-cursor');
    }
    
    // Underline links
    if (newSettings.underlineLinks) {
      root.classList.add('underline-links');
    } else {
      root.classList.remove('underline-links');
    }
  };

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    applySettings(newSettings);
    localStorage.setItem('accessibility-settings', JSON.stringify(newSettings));
  };

  const increaseFontSize = () => {
    const newSize = Math.min(settings.fontSize + 10, 200);
    updateSetting('fontSize', newSize);
  };

  const decreaseFontSize = () => {
    const newSize = Math.max(settings.fontSize - 10, 70);
    updateSetting('fontSize', newSize);
  };

  const resetSettings = () => {
    const defaultSettings: AccessibilitySettings = {
      fontSize: 100,
      highContrast: false,
      largeCursor: false,
      underlineLinks: false,
    };
    setSettings(defaultSettings);
    applySettings(defaultSettings);
    localStorage.setItem('accessibility-settings', JSON.stringify(defaultSettings));
  };

  return (
    <>
      {/* Widget Button - Always visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="accessibility-widget-button"
        aria-label="פתח תפריט נגישות"
        aria-expanded={isOpen}
        title="נגישות"
        style={{ 
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          right: 'auto',
          zIndex: 99999,
          display: 'flex',
          visibility: 'visible',
          opacity: 1
        }}
      >
        <Settings size={24} />
      </button>

      {/* Widget Panel */}
      {isOpen && (
        <div className="accessibility-widget-panel" role="dialog" aria-labelledby="accessibility-title">
          <div className="accessibility-widget-header">
            <h2 id="accessibility-title" className="accessibility-widget-title">
              נגישות
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="accessibility-widget-close"
              aria-label="סגור"
            >
              <X size={20} />
            </button>
          </div>

          <div className="accessibility-widget-content">
            {/* Font Size Control */}
            <div className="accessibility-control-group">
              <div className="accessibility-control-label">
                <Type size={18} />
                <span>גודל טקסט</span>
              </div>
              <div className="accessibility-control-actions">
                <button
                  onClick={decreaseFontSize}
                  className="accessibility-control-btn"
                  aria-label="הקטן טקסט"
                  disabled={settings.fontSize <= 70}
                >
                  <Minus size={16} />
                </button>
                <span className="accessibility-control-value">{settings.fontSize}%</span>
                <button
                  onClick={increaseFontSize}
                  className="accessibility-control-btn"
                  aria-label="הגדל טקסט"
                  disabled={settings.fontSize >= 200}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* High Contrast */}
            <div className="accessibility-control-group">
              <div className="accessibility-control-label">
                <Eye size={18} />
                <span>ניגודיות גבוהה</span>
              </div>
              <button
                onClick={() => updateSetting('highContrast', !settings.highContrast)}
                className={`accessibility-toggle ${settings.highContrast ? 'active' : ''}`}
                aria-pressed={settings.highContrast}
              >
                <span className="accessibility-toggle-slider"></span>
              </button>
            </div>

            {/* Large Cursor */}
            <div className="accessibility-control-group">
              <div className="accessibility-control-label">
                <Keyboard size={18} />
                <span>סמן גדול</span>
              </div>
              <button
                onClick={() => updateSetting('largeCursor', !settings.largeCursor)}
                className={`accessibility-toggle ${settings.largeCursor ? 'active' : ''}`}
                aria-pressed={settings.largeCursor}
              >
                <span className="accessibility-toggle-slider"></span>
              </button>
            </div>

            {/* Underline Links */}
            <div className="accessibility-control-group">
              <div className="accessibility-control-label">
                <span>קו תחתון לקישורים</span>
              </div>
              <button
                onClick={() => updateSetting('underlineLinks', !settings.underlineLinks)}
                className={`accessibility-toggle ${settings.underlineLinks ? 'active' : ''}`}
                aria-pressed={settings.underlineLinks}
              >
                <span className="accessibility-toggle-slider"></span>
              </button>
            </div>

            {/* Reset Button */}
            <button
              onClick={resetSettings}
              className="accessibility-reset-btn"
            >
              איפוס הגדרות
            </button>
          </div>
        </div>
      )}

      {/* Overlay */}
      {isOpen && (
        <div
          className="accessibility-widget-overlay"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}

