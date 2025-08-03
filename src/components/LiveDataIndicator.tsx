import React from 'react';
import { Activity } from 'lucide-react';

interface LiveDataIndicatorProps {
  label?: string;
  className?: string;
}

export const LiveDataIndicator: React.FC<LiveDataIndicatorProps> = ({ 
  label = "实时数据", 
  className = "" 
}) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="relative">
        <Activity className="h-4 w-4 text-green-400" />
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
      </div>
      <span className="text-xs text-green-400 font-medium">{label}</span>
    </div>
  );
};