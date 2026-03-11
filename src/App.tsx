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
      <header className="bg-white text-gray-900 py-12 relative overflow-hidden border-b border-gray-100">
        <div className="absolute inset-0 opacity-5 bg-[url('https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-amber-500 p-2 rounded-full shadow-md">
                <div className="w-10 h-10 border-4 border-black rounded-full flex items-center justify-center font-bold text-black text-xl">U</div>
              </div>
              <span className="text-4xl font-bold tracking-tighter text-black">umaroh</span>
            </div>
            <p className="text-gray-500 text-lg max-w-2xl font-medium">
              Platform Digital Penyedia Layanan Satu Atap Bisnis Perjalanan Umrah
            </p>
            <div className="mt-6 flex gap-4">
              <div className="bg-amber-500 text-black px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider shadow-sm">
                Hotel Pricelist
              </div>
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

