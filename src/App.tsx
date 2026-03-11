/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Footer } from './components/Footer';
import { Navbar, TabType } from './components/Navbar';
import { DatabaseView } from './components/DatabaseView';
import { TemplatesView } from './components/TemplatesView';
import { SalesOrderView } from './components/SalesOrderView';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('sales-order');

  const renderContent = () => {
    switch (activeTab) {
      case 'database':
        return <DatabaseView />;
      case 'templates':
        return <TemplatesView />;
      case 'sales-order':
        return <SalesOrderView />;
      default:
        return <DatabaseView />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      {/* Hero Section */}
      <header className="bg-emerald-900 text-white py-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1565552629477-ff1459552245?q=80&w=2565&auto=format&fit=crop')] bg-cover bg-center" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center text-center">
            <div className="bg-white/10 p-3 rounded-full mb-4 backdrop-blur-sm">
              {/* Replace with your uploaded logo file path, e.g., /logo.png */}
              <img 
                src="https://placehold.co/200x200/fbbf24/000000?text=U" 
                alt="UMAROH Logo" 
                className="w-16 h-16 object-contain rounded-full"
              />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">
              UMAROH
            </h1>
            <p className="text-emerald-200 text-lg max-w-2xl">
              Hotel Pricelist • New Seasons Market
            </p>
            <div className="mt-6 inline-block bg-red-600 text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg transform -rotate-2">
              Min Order (3 Room)
            </div>
          </div>
        </div>
      </header>

      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <main className="flex-grow bg-gray-50">
        {renderContent()}
      </main>

      <Footer />
    </div>
  );
}

export default App;

