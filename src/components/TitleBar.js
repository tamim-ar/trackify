import React from 'react';
import {
  XMarkIcon,
  MinusIcon,
  Square2StackIcon
} from '@heroicons/react/24/outline';

const TitleBar = () => {
  const handleClose = () => {
    window.electronAPI.windowControls.close();
  };
  
  const handleMinimize = () => {
    window.electronAPI.windowControls.minimize();
  };
  
  const handleMaximize = () => {
    window.electronAPI.windowControls.maximize();
  };

  return (
    <div className="fixed top-0 left-0 right-0 h-8 flex items-center justify-between bg-app-dark draggable z-50">
      <div className="px-4 text-gray-400 text-sm">Trackify</div>
      <div className="window-controls flex h-full">
        <button 
          onClick={handleMinimize}
          className="window-control flex items-center justify-center w-12 h-full hover:bg-app-hover/50 transition-colors"
        >
          <MinusIcon className="w-4 h-4 text-gray-400" />
        </button>
        <button 
          onClick={handleMaximize}
          className="window-control flex items-center justify-center w-12 h-full hover:bg-app-hover/50 transition-colors"
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
