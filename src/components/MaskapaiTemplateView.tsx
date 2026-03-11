import React, { useState, useRef } from 'react';
import { PlaneTakeoff, Download, RefreshCw, MapPin, Search } from 'lucide-react';
import html2canvas from 'html2canvas';
import { maskapaiData, Maskapai } from '../data/maskapai';

export const MaskapaiTemplateView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [creationDate, setCreationDate] = useState(new Date().toISOString().split('T')[0]);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const filteredData = [...maskapaiData]
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.originCityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.destinationCityName.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    })
    .sort((a, b) => {
      if (!creationDate) return 0;
      const dateA = new Date(a.tanggalKeberangkatan).getTime();
      const dateB = new Date(b.tanggalKeberangkatan).getTime();
      const targetDate = new Date(creationDate).getTime();
      
      return Math.abs(dateA - targetDate) - Math.abs(dateB - targetDate);
    })
    .slice(0, 10); // Limit to 10 for the template

  const handleDownloadImage = async () => {
    if (!printRef.current) return;
    
    setIsGeneratingImage(true);
    
    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#FDB913'
      } as any);

      const image = canvas.toDataURL('image/jpeg', 0.9);
      const link = document.createElement('a');
      link.href = image;
      link.download = `PriceList_Maskapai_${new Date().toISOString().split('T')[0]}.jpg`;
      link.click();

    } catch (error) {
      console.error('Image generation failed:', error);
      alert('Failed to generate image. Please try again.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center gap-6 print:p-0 print:bg-white print:block">
      
      {/* Controls */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 w-full max-w-[210mm] flex flex-col gap-4 print:hidden">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-grow relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari maskapai atau rute..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700 whitespace-nowrap">Tanggal Cetak:</span>
            <input
              type="date"
              value={creationDate}
              onChange={(e) => setCreationDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>
          
          <button 
            onClick={handleDownloadImage}
            disabled={isGeneratingImage}
            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeneratingImage ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {isGeneratingImage ? 'Generating JPG...' : 'Download JPG'}
          </button>
        </div>
      </div>

      {/* A4 Aspect Ratio Container */}
      <div ref={printRef} className="w-[210mm] min-h-[297mm] bg-[#FDB913] shadow-2xl relative text-gray-900 font-sans flex flex-col print:shadow-none print:m-0 border-4 border-gray-900 p-8">
        
        {/* Background Pattern (Subtle) */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        </div>

        {/* Header */}
        <div className="flex justify-between items-start relative z-10 mb-10">
          <div className="flex flex-col">
             {/* Logo */}
            <div className="flex items-center gap-3 mb-2">
               <div className="bg-gray-900 text-[#FDB913] w-14 h-14 rounded-full flex items-center justify-center font-bold text-3xl border-2 border-[#FDB913] shadow-sm">
                 U
               </div>
               <span className="text-5xl font-bold tracking-tighter text-gray-900 lowercase">umaroh</span>
            </div>
            <p className="text-[10px] italic font-semibold ml-1 tracking-wide">Platform Digital Umrah & Haji Pertama di Indonesia</p>
          </div>
          
          <div className="border-l-2 border-gray-900 pl-6 py-1">
            <h1 className="text-2xl font-bold leading-tight">Price List</h1>
            <h2 className="text-2xl font-bold leading-tight mb-2">Tiket Pesawat</h2>
            <div className="border-b-2 border-gray-900 w-full mb-2"></div>
            <h3 className="text-xl font-bold">
              {creationDate ? new Date(creationDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
            </h3>
          </div>
        </div>

        {/* Tables Section */}
        <div className="relative z-10 flex-grow">
          <div className="bg-white overflow-hidden rounded-lg border-2 border-gray-900">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-900 text-[#FDB913] text-center font-bold uppercase text-xs tracking-wider">
                  <th className="p-3 border-r border-gray-700 text-left pl-4">MASKAPAI & RUTE</th>
                  <th className="p-3 border-r border-gray-700 w-40">PERIODE</th>
                  <th className="p-3 border-r border-gray-700 w-24">PROGRAM</th>
                  <th className="p-3 w-40">HARGA JUAL</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => (
                  <tr key={item.id} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="border-r border-gray-200 p-3">
                      <div className="font-bold text-sm text-gray-900">{item.name}</div>
                      <div className="text-[10px] text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {item.originCityName} → {item.destinationCityName}
                      </div>
                    </td>
                    <td className="border-r border-gray-200 p-3 text-center">
                      <div className="text-[10px] font-bold text-gray-700">
                        {new Date(item.tanggalKeberangkatan).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="text-[10px] text-gray-400">s/d</div>
                      <div className="text-[10px] font-bold text-gray-700">
                        {new Date(item.tanggalKepulangan).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="border-r border-gray-200 p-3 text-center font-bold text-sm">
                      {item.programDays}D
                    </td>
                    <td className="p-3 text-right font-bold text-base text-amber-600">
                      {formatCurrency(item.hargaJual)}
                    </td>
                  </tr>
                ))}
                {/* Fill empty rows to maintain height if needed */}
                {Array.from({ length: Math.max(0, 10 - filteredData.length) }).map((_, i) => (
                  <tr key={`empty-${i}`} className="border-b border-gray-200 h-16">
                    <td className="border-r border-gray-200"></td>
                    <td className="border-r border-gray-200"></td>
                    <td className="border-r border-gray-200"></td>
                    <td></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Note */}
          <div className="mt-6 p-4 bg-gray-900 text-[#FDB913] rounded-lg">
            <h4 className="font-bold text-sm mb-2 uppercase">Syarat & Ketentuan:</h4>
            <ul className="text-[10px] space-y-1 list-disc list-inside font-medium">
              <li>Harga dapat berubah sewaktu-waktu sesuai ketersediaan seat</li>
              <li>Harga sudah termasuk tax & fuel surcharge (jika ada)</li>
              <li>Konfirmasi ketersediaan seat sebelum melakukan booking</li>
              <li>Data by actual vendor & update berkala</li>
            </ul>
          </div>
        </div>

        {/* Bottom Contact Bar */}
        <div className="mt-8 pt-6 flex justify-between items-end relative z-10 border-t-2 border-gray-900">
            <div>
                <h4 className="font-bold text-xl uppercase mb-1">Call Us Now</h4>
                <div className="font-bold text-lg tracking-wide">+62 812-6006-6304</div>
            </div>
            
            <div className="text-center px-4">
                <h4 className="font-bold text-xl uppercase mb-1">Yusup</h4>
                <div className="font-bold text-lg tracking-wide">+62 823-8200-8748</div>
            </div>

            <div className="text-left max-w-[250px] text-[10px] font-bold leading-tight">
                <div className="flex items-start gap-2">
                    <MapPin className="w-6 h-6 flex-shrink-0 fill-gray-900 text-[#FDB913]" />
                    <p>Jl. Tangkuban Prahu No.7, RT.01/RW.05, Babakan, Kecamatan Bogor Tengah, Kota Bogor, Jawa Barat 16128</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
