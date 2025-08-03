import React, { useState, useEffect } from 'react';
import { Bell, X, TrendingUp, TrendingDown } from 'lucide-react';

interface PriceAlertProps {
  currentPrice: number;
  symbol: string;
}

export const PriceAlert: React.FC<PriceAlertProps> = ({ currentPrice, symbol }) => {
  const [alerts, setAlerts] = useState<Array<{
    id: string;
    price: number;
    type: 'above' | 'below';
    triggered: boolean;
  }>>([]);
  const [showAlert, setShowAlert] = useState<{
    price: number;
    type: 'above' | 'below';
  } | null>(null);

  useEffect(() => {
    alerts.forEach(alert => {
      if (!alert.triggered) {
        const shouldTrigger = 
          (alert.type === 'above' && currentPrice >= alert.price) ||
          (alert.type === 'below' && currentPrice <= alert.price);
        
        if (shouldTrigger) {
          setShowAlert({ price: alert.price, type: alert.type });
          setAlerts(prev => prev.map(a => 
            a.id === alert.id ? { ...a, triggered: true } : a
          ));
          
          // 3秒后自动隐藏提醒
          setTimeout(() => setShowAlert(null), 3000);
        }
      }
    });
  }, [currentPrice, alerts]);

  if (!showAlert) return null;

  return (
    <div className="fixed top-20 right-6 bg-yellow-500 text-black px-4 py-3 rounded-lg shadow-lg z-50 animate-bounce">
      <div className="flex items-center space-x-2">
        <Bell className="h-4 w-4" />
        <span className="font-medium">
          价格提醒: {symbol} {showAlert.type === 'above' ? '突破' : '跌破'} ${showAlert.price.toLocaleString()}
        </span>
        {showAlert.type === 'above' ? 
          <TrendingUp className="h-4 w-4" /> : 
          <TrendingDown className="h-4 w-4" />
        }
        <button 
          onClick={() => setShowAlert(null)}
          className="ml-2 hover:bg-yellow-600 rounded p-1"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};