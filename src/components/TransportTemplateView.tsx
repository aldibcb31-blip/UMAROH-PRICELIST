import React, { useState, useRef, useEffect } from 'react';
import { Calendar, RefreshCw, Download, MapPin, DollarSign, Bus } from 'lucide-react';
import html2canvas from 'html2canvas';
import { transportData, TransportVehicle } from '../data/transport';

export const TransportTemplateView: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('gmc');
  const [kurs, setKurs] = useState<number>(4700);
  const [marginPercent, setMarginPercent] = useState<number>(40);
  const [currency, setCurrency] = useState<'SAR' | 'IDR'>('IDR');
  const printRef = useRef<HTMLDivElement>(null);

  const [tableRows, setTableRows] = useState(Array(15).fill({ harga: '', rute: '' }));

  const formatPrice = (amount: number) => {
    if (currency === 'IDR') {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    } else {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'SAR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    }
  };

  const autoFillData = () => {
    const vehicle = transportData.find(v => v.id === selectedVehicleId);
    if (!vehicle) return;

    const newRows = vehicle.routes.map(route => {
      // Calculate selling price
      let basePrice = route.price;
      
      // Add margin
      basePrice = basePrice * (1 + marginPercent / 100);
      
      // Convert to IDR if needed
      if (currency === 'IDR') {
        basePrice = basePrice * kurs;
      }

      return {
        harga: formatPrice(Math.round(basePrice)),
        rute: route.route
      };
    });

    // Pad with empty rows if needed to maintain a consistent look
    const paddedRows = [...newRows];
    while (paddedRows.length < 15) {
      paddedRows.push({ harga: '', rute: '' });
    }

    setTableRows(paddedRows);
  };

  // Auto-fill on mount and when dependencies change
  useEffect(() => {
    autoFillData();
  }, [selectedVehicleId, kurs, marginPercent, currency]);

  const handleRowChange = (index: number, field: 'harga' | 'rute', value: string) => {
    const newRows = [...tableRows];
    newRows[index] = { ...newRows[index], [field]: value };
    setTableRows(newRows);
  };

  const handleDownloadImage = async () => {
    if (!printRef.current) return;
    
    setIsGeneratingImage(true);
    
    const originalElement = printRef.current;
    const originalInputs = originalElement.querySelectorAll('input, textarea, select');
    originalInputs.forEach((el: any) => {
      if (el.tagName === 'INPUT') {
        el.setAttribute('value', el.value);
      } else if (el.tagName === 'TEXTAREA') {
        el.innerHTML = el.value;
      }
    });

    const clone = originalElement.cloneNode(true) as HTMLElement;
    
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    clone.style.top = '0';
    clone.style.width = `${originalElement.offsetWidth}px`;
    document.body.appendChild(clone);

    try {
      const cloneInputs = clone.querySelectorAll('input, textarea, select');
      cloneInputs.forEach((el: any) => {
        const div = document.createElement('div');
        div.className = el.className;
        div.style.cssText = el.style.cssText;
        
        const computedStyle = window.getComputedStyle(el);
        div.style.textAlign = computedStyle.textAlign;
        div.style.display = 'flex';
        div.style.alignItems = 'center';
        if (computedStyle.textAlign === 'center') {
            div.style.justifyContent = 'center';
        } else if (computedStyle.textAlign === 'right') {
            div.style.justifyContent = 'flex-end';
        } else {
            div.style.justifyContent = 'flex-start';
        }
        
        div.innerText = el.value || el.getAttribute('value') || '';
        
        if (el.parentNode) {
          el.parentNode.replaceChild(div, el);
        }
      });

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      } as any);

      const image = canvas.toDataURL('image/jpeg', 0.9);
      const link = document.createElement('a');
      link.href = image;
      
      const vehicleName = transportData.find(v => v.id === selectedVehicleId)?.name || 'Transport';
      link.download = `PriceList_${vehicleName}_${selectedDate || 'Draft'}.jpg`;
      link.click();

    } catch (error) {
      console.error('Image generation failed:', error);
      alert('Failed to generate image. Please try again.');
    } finally {
      document.body.removeChild(clone);
      setIsGeneratingImage(false);
    }
  };

  const selectedVehicleName = transportData.find(v => v.id === selectedVehicleId)?.name || '';

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center gap-6 print:p-0 print:bg-white print:block">
      
      {/* Controls */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 w-full max-w-[210mm] flex flex-col gap-4 print:hidden">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Bus className="text-gray-500 w-5 h-5" />
            <span className="font-medium text-gray-700">Kendaraan:</span>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              {transportData.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="text-gray-500 w-5 h-5" />
            <span className="font-medium text-gray-700">Periode:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none w-36"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <DollarSign className="text-gray-500 w-5 h-5" />
            <span className="font-medium text-gray-700">Currency:</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as 'SAR' | 'IDR')}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="SAR">SAR</option>
              <option value="IDR">IDR</option>
            </select>
          </div>

          {currency === 'IDR' && (
            <div className="flex items-center gap-2">
              <RefreshCw className="text-gray-500 w-5 h-5" />
              <span className="font-medium text-gray-700">Kurs:</span>
              <input
                type="number"
                value={kurs}
                onChange={(e) => setKurs(Number(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none w-28"
              />
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <DollarSign className="text-gray-500 w-5 h-5" />
            <span className="font-medium text-gray-700">Margin (%):</span>
            <input
              type="number"
              value={marginPercent}
              onChange={(e) => setMarginPercent(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none w-20"
            />
          </div>
        </div>
        
        <div className="flex justify-end">
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
      <div ref={printRef} className="w-[210mm] min-h-[297mm] bg-[#FDB913] shadow-2xl relative text-gray-900 font-sans flex flex-col print:shadow-none print:m-0 border-4 border-purple-500 p-8">
        
        {/* Background Pattern (Subtle) */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        </div>

        {/* Header */}
        <div className="flex justify-between items-start relative z-10 mb-8">
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
            <h2 className="text-2xl font-bold leading-tight mb-2">Transportasi</h2>
            <div className="border-b-2 border-gray-900 w-full mb-2"></div>
            <h3 className="text-xl font-bold">
              {selectedDate ? new Date(selectedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Periode'}
            </h3>
          </div>
        </div>

        {/* Vehicle Title */}
        <div className="relative z-10 mb-2">
          <h2 className="text-2xl font-bold uppercase">{selectedVehicleName}</h2>
        </div>

        {/* Table Section */}
        <div className="relative z-10 flex-grow">
          <table className="w-full border-collapse bg-white">
            <thead>
              <tr className="bg-gray-900 text-[#FDB913] text-center font-bold uppercase text-sm tracking-wider">
                <th className="p-3 border-r border-gray-700 w-1/3">HARGA</th>
                <th className="p-3 w-2/3">RUTE</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, index) => (
                <tr key={index} className="border-b border-gray-200 text-center">
                  <td className="border-r border-gray-200 p-0 h-10">
                    <input
                      type="text"
                      className="w-full h-full bg-transparent text-center outline-none font-medium text-sm"
                      value={row.harga}
                      onChange={(e) => handleRowChange(index, 'harga', e.target.value)}
                    />
                  </td>
                  <td className="p-0 h-10 px-4">
                    <input
                      type="text"
                      className="w-full h-full bg-transparent outline-none font-medium text-sm text-left"
                      value={row.rute}
                      onChange={(e) => handleRowChange(index, 'rute', e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Contact Bar */}
        <div className="mt-8 pt-6 flex justify-between items-end relative z-10">
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
