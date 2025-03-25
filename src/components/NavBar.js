import React from 'react';
import {
  BoltIcon,
  CalendarDaysIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const NavBar = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'tasks', icon: BoltIcon, label: 'Tasks' },
    { id: 'calendar', icon: CalendarDaysIcon, label: 'Calendar' },
    { id: 'stats', icon: ChartBarIcon, label: 'Analytics' }
  ];

  return (
    <nav className="fixed left-0 top-0 h-screen w-16 sm:w-20 flex flex-col justify-center bg-app-dark border-r border-app-light">
      <div className="flex flex-col items-center gap-6">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group relative w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200
                ${activeTab === tab.id 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-gray-400 hover:text-white hover:bg-app-hover'}`}
              title={tab.label}
            >
              <Icon className="w-5 h-5" />
              <div className={`absolute left-0 -translate-x-[2px] top-1/2 -translate-y-1/2 w-1 h-1/2 rounded-r-full bg-primary transition-all duration-200 
                ${activeTab === tab.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`} />
              <span className="absolute left-full ml-2 py-1 px-2 bg-app-base text-white text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default NavBar;
