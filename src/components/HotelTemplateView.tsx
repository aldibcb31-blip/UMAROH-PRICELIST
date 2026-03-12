import React, { useState, useRef, useEffect } from 'react';
import { Calendar, RefreshCw, Download, MapPin, DollarSign, Building2, Sparkles } from 'lucide-react';
import html2canvas from 'html2canvas';
import { hotels, Hotel } from '../data/hotels';
import { isDateInRange } from '../utils/dateUtils';
import { AIPromptInput } from './AIPromptInput';

type HotelRow = {
  hotelName: string;
  quad: string;
  triple: string;
  double: string;
};

type StarSection = {
  star: number;
  rows: HotelRow[];
};

export const HotelTemplateView: React.FC = () => {
  const [city, setCity] = useState<'Madinah' | 'Makkah'>('Madinah');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [kurs, setKurs] = useState<number>(4700);
  const [marginPercent, setMarginPercent] = useState<number>(15);
  const [currency, setCurrency] = useState<'SAR' | 'IDR'>('SAR');
  const printRef = useRef<HTMLDivElement>(null);

  const initialSections: StarSection[] = [
    { star: 3, rows: Array(3).fill({ hotelName: '', quad: '', triple: '', double: '' }) },
    { star: 4, rows: Array(3).fill({ hotelName: '', quad: '', triple: '', double: '' }) },
    { star: 5, rows: Array(3).fill({ hotelName: '', quad: '', triple: '', double: '' }) },
  ];

  const [sections, setSections] = useState<StarSection[]>(initialSections);

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

  const getHotelPrice = (hotel: Hotel, dateStr: string, type: string): number => {
    const checkDate = new Date(dateStr);
    const season = hotel.seasons.find(s => isDateInRange(checkDate, s.range));
    const prices = season?.prices || [];
    const priceEntry = prices.find(p => p.roomType.toLowerCase().includes(type.toLowerCase()));
    
    if (!priceEntry) return 0;

    // Base price per room in SAR
    let basePrice = priceEntry.price;
    
    // Add margin
    basePrice = basePrice * (1 + marginPercent / 100);
    
    // Convert to IDR if needed
    if (currency === 'IDR') {
      basePrice = basePrice * kurs;
    }

    return Math.round(basePrice);
  };

  const handleRowChange = (sectionIndex: number, rowIndex: number, field: keyof HotelRow, value: string) => {
    const newSections = [...sections];
    const newRows = [...newSections[sectionIndex].rows];
    const currentRow = { ...newRows[rowIndex], [field]: value };

    // Auto-fill prices if hotel name changes and date is selected
    if (field === 'hotelName' && selectedDate) {
      const matchedHotel = hotels.find(h => h.name.toLowerCase() === value.toLowerCase() && h.city === city);
      if (matchedHotel) {
        const pQuad = getHotelPrice(matchedHotel, selectedDate, 'Quad');
        const pTriple = getHotelPrice(matchedHotel, selectedDate, 'Triple');
        const pDouble = getHotelPrice(matchedHotel, selectedDate, 'Double');

        currentRow.quad = pQuad ? formatPrice(pQuad) : '-';
        currentRow.triple = pTriple ? formatPrice(pTriple) : '-';
        currentRow.double = pDouble ? formatPrice(pDouble) : '-';
      }
    }

    newRows[rowIndex] = currentRow;
    newSections[sectionIndex].rows = newRows;
    setSections(newSections);
  };

  // Recalculate all prices when date, margin, kurs, or currency changes
  useEffect(() => {
    if (!selectedDate) return;

    const newSections = sections.map(section => ({
      ...section,
      rows: section.rows.map(row => {
        if (!row.hotelName) return row;
        const matchedHotel = hotels.find(h => h.name.toLowerCase() === row.hotelName.toLowerCase() && h.city === city);
        if (matchedHotel) {
          const pQuad = getHotelPrice(matchedHotel, selectedDate, 'Quad');
          const pTriple = getHotelPrice(matchedHotel, selectedDate, 'Triple');
          const pDouble = getHotelPrice(matchedHotel, selectedDate, 'Double');
          return {
            ...row,
            quad: pQuad ? formatPrice(pQuad) : '-',
            triple: pTriple ? formatPrice(pTriple) : '-',
            double: pDouble ? formatPrice(pDouble) : '-',
          };
        }
        return row;
      })
    }));
    setSections(newSections);
  }, [selectedDate, marginPercent, kurs, currency, city]);

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
      link.download = `PriceList_Hotel_${city}_${selectedDate || 'Draft'}.jpg`;
      link.click();

    } catch (error) {
      console.error('Image generation failed:', error);
      alert('Failed to generate image. Please try again.');
    } finally {
      document.body.removeChild(clone);
      setIsGeneratingImage(false);
    }
  };

  const filteredHotels = hotels.filter(h => h.city === city);

  const handleAIApply = (data: any) => {
    if (data.city !== undefined) setCity(data.city);
    if (data.selectedDate !== undefined) setSelectedDate(data.selectedDate);
    if (data.kurs !== undefined) setKurs(data.kurs);
    if (data.marginPercent !== undefined) setMarginPercent(data.marginPercent);
    if (data.currency !== undefined) setCurrency(data.currency);
    if (data.sections !== undefined) setSections(data.sections);
  };

  const currentAIData = {
    city,
    selectedDate,
    kurs,
    marginPercent,
    currency,
    sections
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center gap-6 print:p-0 print:bg-white print:block">
      
      {/* AI Prompt Input */}
      <div className="w-full max-w-[210mm] print:hidden">
        <AIPromptInput 
          context="Hotel Template" 
          currentData={currentAIData} 
          onApply={handleAIApply} 
          masterData={{
            hotels
          }}
        />
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 w-full max-w-[210mm] flex flex-col gap-4 print:hidden">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Building2 className="text-gray-500 w-5 h-5" />
            <span className="font-medium text-gray-700">City:</span>
            <select
              value={city}
              onChange={(e) => {
                setCity(e.target.value as 'Madinah' | 'Makkah');
                setSections(initialSections); // Reset rows on city change
              }}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="Madinah">Madinah</option>
              <option value="Makkah">Makkah</option>
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

      {[3, 4, 5].map(star => (
        <datalist key={`hotel-list-${star}`} id={`hotel-list-${star}`}>
          {filteredHotels.filter(h => h.stars === star).map(h => (
            <option key={h.id} value={h.name} />
          ))}
        </datalist>
      ))}

      {/* A4 Aspect Ratio Container */}
      <div className="w-full overflow-x-auto pb-8 flex justify-center">
        <div ref={printRef} className="w-[210mm] min-h-[297mm] bg-[#FDB913] shadow-2xl relative text-gray-900 font-sans flex flex-col print:shadow-none print:m-0 border-4 border-purple-500 p-8 shrink-0">
        
        {/* Background Pattern (Subtle) */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        </div>

        {/* Header */}
        <div className="flex justify-between items-start relative z-10 mb-10">
          <div className="flex flex-col">
             {/* Logo */}
            <div className="flex items-center gap-3 mb-2">
               <img src="https://umaroh.com/assets/logo-light-D4UzTX0_.png" alt="umaroh logo" className="h-16 w-auto" referrerPolicy="no-referrer" />
            </div>
            <p className="text-[10px] italic font-semibold ml-1 tracking-wide">Platform Digital Umrah & Haji Pertama di Indonesia</p>
          </div>
          
          <div className="border-l-2 border-gray-900 pl-6 py-1">
            <h1 className="text-2xl font-bold leading-tight">Price List</h1>
            <h2 className="text-2xl font-bold leading-tight mb-2">Hotel {city}</h2>
            <div className="border-b-2 border-gray-900 w-full mb-2"></div>
            <h3 className="text-xl font-bold">
              {selectedDate ? new Date(selectedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Periode'}
            </h3>
          </div>
        </div>

        {/* Tables Section */}
        <div className="relative z-10 flex-grow space-y-6">
          {sections.map((section, sIndex) => (
            <div key={section.star} className="bg-white overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-900 text-[#FDB913] text-center font-bold uppercase text-xs tracking-wider">
                    <th className="p-2 border-r border-gray-700 w-2/5 text-left pl-4">BINTANG {section.star}</th>
                    <th className="p-2 border-r border-gray-700 w-1/5">QUAD</th>
                    <th className="p-2 border-r border-gray-700 w-1/5">TRIPLE</th>
                    <th className="p-2 w-1/5">DOUBLE</th>
                  </tr>
                </thead>
                <tbody>
                  {section.rows.map((row, rIndex) => (
                    <tr key={rIndex} className="border-b border-gray-200 text-center">
                      <td className="border-r border-gray-200 p-0 h-8">
                        <input
                          type="text"
                          list={`hotel-list-${section.star}`}
                          className="w-full h-full bg-transparent px-4 outline-none font-medium text-xs text-left"
                          placeholder="Nama Hotel..."
                          value={row.hotelName}
                          onChange={(e) => handleRowChange(sIndex, rIndex, 'hotelName', e.target.value)}
                        />
                      </td>
                      <td className="border-r border-gray-200 p-0 h-8">
                        <input
                          type="text"
                          className="w-full h-full bg-transparent text-center outline-none font-medium text-xs"
                          value={row.quad}
                          onChange={(e) => handleRowChange(sIndex, rIndex, 'quad', e.target.value)}
                        />
                      </td>
                      <td className="border-r border-gray-200 p-0 h-8">
                        <input
                          type="text"
                          className="w-full h-full bg-transparent text-center outline-none font-medium text-xs"
                          value={row.triple}
                          onChange={(e) => handleRowChange(sIndex, rIndex, 'triple', e.target.value)}
                        />
                      </td>
                      <td className="p-0 h-8">
                        <input
                          type="text"
                          className="w-full h-full bg-transparent text-center outline-none font-medium text-xs"
                          value={row.double}
                          onChange={(e) => handleRowChange(sIndex, rIndex, 'double', e.target.value)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

          {/* Note */}
          <div className="mt-4 text-sm font-bold text-gray-900 italic">
            * Harga di atas hanya untuk harga room kamar bukan per pax
          </div>
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
    </div>
  );
};
