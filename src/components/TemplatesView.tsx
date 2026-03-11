import React, { useState } from 'react';
import { QuotationView } from './QuotationView';
import { HandlingTemplateView } from './HandlingTemplateView';
import { HotelTemplateView } from './HotelTemplateView';
import { TransportTemplateView } from './TransportTemplateView';
import { MutawifTemplateView } from './MutawifTemplateView';
import { MaskapaiTemplateView } from './MaskapaiTemplateView';
import { FileSpreadsheet, LayoutTemplate, Building2, Bus, Users, PlaneTakeoff } from 'lucide-react';

type TemplateTab = 'quotation' | 'handling' | 'hotel' | 'transport' | 'mutawif' | 'maskapai';

export const TemplatesView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TemplateTab>('quotation');

  const tabs = [
    { id: 'quotation', label: 'Quotation', icon: FileSpreadsheet },
    { id: 'handling', label: 'Handling', icon: LayoutTemplate },
    { id: 'hotel', label: 'Hotel', icon: Building2 },
    { id: 'maskapai', label: 'Maskapai', icon: PlaneTakeoff },
    { id: 'transport', label: 'Transportasi', icon: Bus },
    { id: 'mutawif', label: 'Mutawif', icon: Users },
  ] as const;

  const renderContent = () => {
    switch (activeTab) {
      case 'quotation': return <QuotationView />;
      case 'handling': return <HandlingTemplateView />;
      case 'hotel': return <HotelTemplateView />;
      case 'maskapai': return <MaskapaiTemplateView />;
      case 'transport': return <TransportTemplateView />;
      case 'mutawif': return <MutawifTemplateView />;
      default: return <QuotationView />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Sub-navigation */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 print:hidden shadow-sm">
        <div className="container mx-auto flex flex-wrap gap-2 justify-center">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                  isActive 
                    ? 'bg-amber-100 text-amber-800 shadow-sm ring-1 ring-amber-600/20' 
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-700' : 'text-gray-500'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-grow">
        {renderContent()}
      </div>
    </div>
  );
};
