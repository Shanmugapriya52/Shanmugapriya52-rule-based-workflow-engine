import { useState, useEffect } from 'react';
import { XMarkIcon, BellIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function Toast({ message, type = 'info', onClose, duration = 5000 }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // Allow for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    info: <BellIcon className="w-5 h-5 text-blue-500" />,
    success: <CheckCircleIcon className="w-5 h-5 text-green-500" />,
    warning: <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />,
    error: <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />,
    approval_required: <BellIcon className="w-5 h-5 text-purple-500" />
  };

  const bgColors = {
    info: 'bg-blue-50 border-blue-200',
    success: 'bg-green-50 border-green-200',
    warning: 'bg-amber-50 border-amber-200',
    error: 'bg-red-50 border-red-200',
    approval_required: 'bg-purple-50 border-purple-200'
  };

  return (
    <div className={`fixed bottom-4 right-4 z-[9999] transition-all duration-300 transform ${visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}>
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${bgColors[type] || bgColors.info} min-w-[300px]`}>
        <div className="flex-shrink-0">
          {icons[type] || icons.info}
        </div>
        <div className="flex-1 text-sm font-medium text-gray-800">
          {message}
        </div>
        <button 
          onClick={() => { setVisible(false); setTimeout(onClose, 300); }}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
