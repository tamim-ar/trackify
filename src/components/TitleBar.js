import React from 'react';
import {
  XMarkIcon,
  MinusIcon,
  Square2StackIcon
} from '@heroicons/react/24/outline';

const TitleBar = () => {
  const handleClose = () => window.close();
  const handleMinimize = () => window.minimize();
  const handleMaximize = () => {
    const window = require('@electron/remote').getCurrentWindow();
    if (window.isMaximized()) {
      window.unmaximize();
    } else {
      window.maximize();
    }
  };

  return (
    <div className="fixed top-0 right-0 h-9 flex items-center justify-end bg-app-dark draggable">
      <div className="window-controls flex h-full">
        <button 
          onClick={handleMinimize}
          className="window-control flex items-center justify-center w-12 h-full hover:bg-app-hover transition-colors"
        >
          <MinusIcon className="w-4 h-4 text-gray-400" />
        </button>
        <button 
          onClick={handleMaximize}
          className="window-control flex items-center justify-center w-12 h-full hover:bg-app-hover transition-colors"
        >
          <Square2StackIcon className="w-4 h-4 text-gray-400" />
        </button>
        <button 
          onClick={handleClose}
          className="window-control flex items-center justify-center w-12 h-full hover:bg-red-500 transition-colors"
        >
          <XMarkIcon className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </div>
  );
};

export default TitleBar;
