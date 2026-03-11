import React from 'react';
import { Database, FileSpreadsheet, ShoppingCart } from 'lucide-react';

export type TabType = 'database' | 'templates' | 'sales-order';

interface NavbarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange }) => {
  const navItems: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: 'database', label: 'Database', icon: Database },
    { id: 'templates', label: 'Templates', icon: FileSpreadsheet },
    { id: 'sales-order', label: 'Sales Order', icon: ShoppingCart },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center min-h-[4rem] py-2 overflow-visible">
          <div className="flex flex-wrap gap-2 w-full justify-center items-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap
                    ${isActive 
                      ? 'bg-amber-50 text-amber-700 shadow-sm ring-1 ring-amber-600/20' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-600' : 'text-gray-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

