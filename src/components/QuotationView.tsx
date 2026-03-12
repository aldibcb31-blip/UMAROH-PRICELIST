import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Star, MapPin, Calendar, Printer, Users, Briefcase, RefreshCw, Download, Sparkles } from 'lucide-react';
import { hotels, Hotel } from '../data/hotels';
import { isDateInRange } from '../utils/dateUtils';
import { HANDLING_TIERS } from '../data/handlingSaudi';
import { visaData } from '../data/visa';
import html2canvas from 'html2canvas';
import { AIPromptInput } from './AIPromptInput';

interface QuotationRow {
  madinah?: Partial<Hotel>;
  makkah?: Partial<Hotel>;
  priceDouble?: number | string;
  priceTriple?: number | string;
  priceQuad?: number | string;
}

export const QuotationView: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [paxCount, setPaxCount] = useState<number>(35);
  const [includeHandling, setIncludeHandling] = useState<boolean>(false);
  const [includeMutawif, setIncludeMutawif] = useState<boolean>(false);
  const [includeVisa, setIncludeVisa] = useState<boolean>(false);
  const [currency, setCurrency] = useState<'SAR' | 'USD' | 'IDR'>('IDR');
  const [kurs, setKurs] = useState<number>(4600);
  const [kursUsd, setKursUsd] = useState<number>(17000);
  const [rows, setRows] = useState<QuotationRow[]>(Array(14).fill({}));
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Helper to format currency
  const formatCurrency = (amount: number | string) => {
    if (typeof amount === 'string') return amount;
    
    let currencyCode = 'IDR';
    let locale = 'id-ID';
    
    if (currency === 'SAR') {
      currencyCode = 'SAR';
      locale = 'en-US';
    } else if (currency === 'USD') {
      currencyCode = 'USD';
      locale = 'en-US';
    }

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: currency === 'IDR' ? 0 : 2,
      maximumFractionDigits: currency === 'IDR' ? 0 : 2,
    }).format(amount);
  };

  // Helper to calculate price for a single hotel
  const getHotelPrice = (hotel: Hotel, dateStr: string, type: string): number => {
    const checkDate = new Date(dateStr);
    const season = hotel.seasons.find(s => isDateInRange(checkDate, s.range));
    const prices = season?.prices || [];
    const priceEntry = prices.find(p => p.roomType.toLowerCase().includes(type.toLowerCase()));
    
    if (!priceEntry) return 0;

    // Base price with 15% markup
    const basePrice = Math.round(priceEntry.price * 1.15);
    
    // Calculate per pax based on room type
    let divider = 1;
    if (type === 'Double') divider = 2;
    if (type === 'Triple') divider = 3;
    if (type === 'Quad') divider = 4;

    return Math.round(basePrice / divider);
  };

  // Get handling price per pax in SAR
  const getHandlingPriceSAR = (): number => {
    if (!includeHandling) return 0;
    
    const tier = HANDLING_TIERS.find(t => paxCount >= t.minPax && paxCount <= t.maxPax);
    const hppUSD = tier ? tier.hpp : 0;
    
    // Convert USD to SAR (Assuming 1 USD = 3.75 SAR)
    return Math.round(hppUSD * 3.75);
  };

  // Get visa price per pax in IDR based on pax count
  const getVisaPriceIDR = (): number => {
    if (!includeVisa) return 0;
    const visa = visaData.find(v => {
      const range = v.paxRange.split(' ')[0];
      const [min, max] = range.split('-').map(Number);
      return paxCount >= min && paxCount <= max;
    }) || visaData[0];
    return visa.sellingPrice;
  };

  // Get mutawwif price per pax in SAR
  const getMutawwifPriceSAR = (): number => {
    if (!includeMutawif) return 0;
    return 250; // Default selling price in SAR
  };

  // Update rows when date, paxCount, includeHandling, includeMutawif, includeVisa, currency, or kurs changes
  useEffect(() => {
    if (!selectedDate) {
      setRows(Array(14).fill({}));
      return;
    }

    const checkDate = new Date(selectedDate);
    const availableMadinahHotels = hotels.filter(hotel => {
      if (hotel.city !== 'Madinah') return false;
      const season = hotel.seasons.find(s => isDateInRange(checkDate, s.range));
      return season && season.prices && season.prices.length > 0;
    });

    const availableMakkahHotels = hotels.filter(hotel => {
      if (hotel.city !== 'Makkah') return false;
      const season = hotel.seasons.find(s => isDateInRange(checkDate, s.range));
      return season && season.prices && season.prices.length > 0;
    });

    const handlingSAR = getHandlingPriceSAR();
    const mutawwifSAR = getMutawwifPriceSAR();
    const visaIDR = getVisaPriceIDR();

    // Update existing rows with new prices if both hotels are present
    setRows(prevRows => {
      // If prevRows is empty (initial state), fill with Madinah and Makkah hotels
      if (prevRows.every(r => !r.madinah && !r.makkah)) {
        return Array.from({ length: 14 }, (_, i) => {
          const madinahHotel = availableMadinahHotels[i];
          const makkahHotel = availableMakkahHotels[i];
          return {
            madinah: madinahHotel || {},
            makkah: makkahHotel || {},
            priceDouble: '-',
            priceTriple: '-',
            priceQuad: '-',
          };
        });
      }

      // Otherwise, update prices for existing rows
      return prevRows.map(row => {
        if (row.madinah?.name && row.makkah?.name) {
          let pDoubleMadinah = 0, pTripleMadinah = 0, pQuadMadinah = 0;
          let pDoubleMakkah = 0, pTripleMakkah = 0, pQuadMakkah = 0;

          if (row.madinah?.id) {
            pDoubleMadinah = getHotelPrice(row.madinah as Hotel, selectedDate, 'Double');
            pTripleMadinah = getHotelPrice(row.madinah as Hotel, selectedDate, 'Triple');
            pQuadMadinah = getHotelPrice(row.madinah as Hotel, selectedDate, 'Quad');
          }
          
          if (row.makkah?.id) {
            pDoubleMakkah = getHotelPrice(row.makkah as Hotel, selectedDate, 'Double');
            pTripleMakkah = getHotelPrice(row.makkah as Hotel, selectedDate, 'Triple');
            pQuadMakkah = getHotelPrice(row.makkah as Hotel, selectedDate, 'Quad');
          }

          // Check if both hotels have prices. If Madinah has no price but Makkah has, don't show.
          // We check Quad as a proxy for having a price entry.
          if (pQuadMadinah === 0 || pQuadMakkah === 0) {
            return {
              ...row,
              priceDouble: '-',
              priceTriple: '-',
              priceQuad: '-',
            };
          }

          const totalDoubleSAR = pDoubleMadinah + pDoubleMakkah + handlingSAR + mutawwifSAR;
          const totalTripleSAR = pTripleMadinah + pTripleMakkah + handlingSAR + mutawwifSAR;
          const totalQuadSAR = pQuadMadinah + pQuadMakkah + handlingSAR + mutawwifSAR;

          // Convert to target currency
          const convert = (sarAmount: number) => {
            const idrAmount = (sarAmount * kurs) + visaIDR;
            if (currency === 'IDR') return idrAmount;
            if (currency === 'SAR') return idrAmount / kurs;
            if (currency === 'USD') return idrAmount / kursUsd;
            return idrAmount;
          };

          return {
            ...row,
            priceDouble: convert(totalDoubleSAR),
            priceTriple: convert(totalTripleSAR),
            priceQuad: convert(totalQuadSAR),
          };
        }
        return {
          ...row,
          priceDouble: '-',
          priceTriple: '-',
          priceQuad: '-',
        };
      });
    });
  }, [selectedDate, paxCount, includeHandling, includeMutawif, includeVisa, kurs, kursUsd, currency]);

  const handleHotelChange = (index: number, type: 'madinah' | 'makkah', name: string) => {
    const newRows = [...rows];
    const currentRow = { ...newRows[index] };
    
    // Find hotel in full list
    const matchedHotel = hotels.find(h => h.name.toLowerCase() === name.toLowerCase());

    if (type === 'madinah') {
      currentRow.madinah = matchedHotel ? { ...matchedHotel } : { name };
    } else {
      currentRow.makkah = matchedHotel ? { ...matchedHotel } : { name };
    }

    // Recalculate prices if we have a date and BOTH hotels are selected
    if (selectedDate && currentRow.madinah?.name && currentRow.makkah?.name) {
      const handlingSAR = getHandlingPriceSAR();
      const mutawwifSAR = getMutawwifPriceSAR();
      const visaIDR = getVisaPriceIDR();
      
      let pDoubleMadinah = 0, pTripleMadinah = 0, pQuadMadinah = 0;
      let pDoubleMakkah = 0, pTripleMakkah = 0, pQuadMakkah = 0;

      if (currentRow.madinah?.id) {
        pDoubleMadinah = getHotelPrice(currentRow.madinah as Hotel, selectedDate, 'Double');
        pTripleMadinah = getHotelPrice(currentRow.madinah as Hotel, selectedDate, 'Triple');
        pQuadMadinah = getHotelPrice(currentRow.madinah as Hotel, selectedDate, 'Quad');
      }
      
      if (currentRow.makkah?.id) {
        pDoubleMakkah = getHotelPrice(currentRow.makkah as Hotel, selectedDate, 'Double');
        pTripleMakkah = getHotelPrice(currentRow.makkah as Hotel, selectedDate, 'Triple');
        pQuadMakkah = getHotelPrice(currentRow.makkah as Hotel, selectedDate, 'Quad');
      }

      // Check if both hotels have prices
      if (pQuadMadinah === 0 || pQuadMakkah === 0) {
        currentRow.priceDouble = '-';
        currentRow.priceTriple = '-';
        currentRow.priceQuad = '-';
      } else {
        const totalDoubleSAR = pDoubleMadinah + pDoubleMakkah + handlingSAR + mutawwifSAR;
        const totalTripleSAR = pTripleMadinah + pTripleMakkah + handlingSAR + mutawwifSAR;
        const totalQuadSAR = pQuadMadinah + pQuadMakkah + handlingSAR + mutawwifSAR;

        const convert = (sarAmount: number) => {
          const idrAmount = (sarAmount * kurs) + visaIDR;
          if (currency === 'IDR') return idrAmount;
          if (currency === 'SAR') return idrAmount / kurs;
          if (currency === 'USD') return idrAmount / kursUsd;
          return idrAmount;
        };

        currentRow.priceDouble = convert(totalDoubleSAR);
        currentRow.priceTriple = convert(totalTripleSAR);
        currentRow.priceQuad = convert(totalQuadSAR);
      }
    } else {
      // If either hotel is missing, reset prices to '-'
      currentRow.priceDouble = '-';
      currentRow.priceTriple = '-';
      currentRow.priceQuad = '-';
    }

    newRows[index] = currentRow;
    setRows(newRows);
  };

  const handleRowChange = (index: number, field: keyof QuotationRow, value: string | number) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], [field]: value };
    setRows(newRows);
  };

  const handleStarChange = (index: number, type: 'madinah' | 'makkah', value: string) => {
    const newRows = [...rows];
    const currentRow = { ...newRows[index] };
    if (type === 'madinah') {
      currentRow.madinah = { ...currentRow.madinah, stars: parseInt(value) || undefined };
    } else {
      currentRow.makkah = { ...currentRow.makkah, stars: parseInt(value) || undefined };
    }
    setRows(newRows);
  };

  const handleDownloadImage = async () => {
    if (!printRef.current) return;
    
    setIsGeneratingImage(true);
    
    // Helper to convert modern color spaces (oklch, oklab) to RGB/HEX
    const convertToRgb = (color: string) => {
      if (!color || (!color.includes('oklch') && !color.includes('oklab'))) return color;
      
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      if (!ctx) return '#000000';
      
      try {
        ctx.fillStyle = color;
        const result = ctx.fillStyle;
        
        // If the browser still returns oklab/oklch (modern browsers might), force a fallback
        if (result.includes('oklch') || result.includes('oklab')) {
          return '#000000'; // Safe fallback
        }
        return result;
      } catch (e) {
        return '#000000';
      }
    };

    // Sync input values to attributes so cloneNode copies them correctly
    const originalElement = printRef.current;
    const originalInputs = originalElement.querySelectorAll('input, textarea, select');
    originalInputs.forEach((el: any) => {
      if (el.tagName === 'INPUT') {
        if (el.type === 'checkbox' || el.type === 'radio') {
          if (el.checked) el.setAttribute('checked', 'checked');
          else el.removeAttribute('checked');
        } else {
          el.setAttribute('value', el.value);
        }
      } else if (el.tagName === 'TEXTAREA') {
        el.innerHTML = el.value;
      } else if (el.tagName === 'SELECT') {
        const options = el.querySelectorAll('option');
        options.forEach((opt: any) => {
          if (opt.selected) opt.setAttribute('selected', 'selected');
          else opt.removeAttribute('selected');
        });
      }
    });

    // Create a clone to sanitize
    const clone = originalElement.cloneNode(true) as HTMLElement;
    
    // We must append the clone to the DOM for html2canvas to work correctly
    // Position it off-screen so it's not visible
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    clone.style.top = '0';
    clone.style.width = `${originalElement.offsetWidth}px`; // Maintain width
    document.body.appendChild(clone);

    try {
      // Remove excluded elements from clone
      const excludedElements = clone.querySelectorAll('[data-pdf-exclude]');
      excludedElements.forEach(el => el.remove());

      // Replace inputs with divs in the clone so html2canvas renders them perfectly
      const cloneInputs = clone.querySelectorAll('input, textarea, select');
      cloneInputs.forEach((el: any) => {
        const div = document.createElement('div');
        div.className = el.className;
        div.style.cssText = el.style.cssText;
        
        // Ensure text alignment matches
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
        
        if (el.tagName === 'SELECT') {
          const selected = el.querySelector('option[selected]');
          div.innerText = selected ? selected.text : (el.options && el.options[0] ? el.options[0].text : '');
        } else {
          div.innerText = el.value || el.getAttribute('value') || '';
        }
        
        if (el.tagName === 'TEXTAREA') {
          div.style.whiteSpace = 'pre-wrap';
          div.style.alignItems = 'flex-start';
        }

        if (el.parentNode) {
          el.parentNode.replaceChild(div, el);
        }
      });

      // Sanitize colors in the clone
      // We need to match elements by traversing both trees simultaneously
      // because querySelectorAll('*') will be out of sync if elements were removed.
      // However, since we removed elements from the clone, we can just iterate over the clone's elements
      // and find the corresponding original element to get computed styles.
      // Actually, an easier way is to apply computed styles BEFORE removing excluded elements,
      // but we already removed them. Let's just apply styles to the clone based on the clone's current elements.
      // Wait, getComputedStyle needs to be called on the original element to get the correct styles.
      // Since we can't easily map them now, let's just use a simpler approach:
      // We will iterate over all original elements, and if they have a data-pdf-exclude attribute, we skip them.
      // But what about their children? They are also removed.
      
      // Let's just re-implement the color sanitization by applying it to the original elements BEFORE cloning!
      // No, we can't modify the original DOM's styles directly because it would trigger re-renders or visual glitches.
      
      // Let's do it right: find elements by path or just accept that the previous loop was broken.
      // Actually, we can just get all elements from the clone, and for each, we don't need the original element's computed style
      // if we just check the clone's computed style! Wait, the clone is in the DOM, so window.getComputedStyle(cloned) works!
      const allClones = clone.querySelectorAll('*');

      // Helper to apply sanitized styles
      const sanitizeNode = (cloned: HTMLElement) => {
        const computed = window.getComputedStyle(cloned);
        
        const propsToCheck = [
          'color', 'background-color', 'border-color', 
          'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
          'outline-color', 'text-decoration-color', 
          'fill', 'stroke', 'stop-color', 'flood-color', 'lighting-color',
          'caret-color', 'column-rule-color',
          'box-shadow', 'filter', 'backdrop-filter', 'background-image'
        ];

        propsToCheck.forEach(prop => {
            const val = computed.getPropertyValue(prop);
            if (val && (val.includes('oklch') || val.includes('oklab'))) {
                if (prop === 'box-shadow' || prop === 'filter' || prop === 'backdrop-filter' || prop === 'background-image') {
                    cloned.style.setProperty(prop, 'none', 'important');
                } else {
                    const rgb = convertToRgb(val);
                    cloned.style.setProperty(prop, rgb, 'important');
                }
            }
        });
      };

      // Sanitize root
      sanitizeNode(clone);

      // Sanitize children
      for (let i = 0; i < allClones.length; i++) {
        sanitizeNode(allClones[i] as HTMLElement);
      }

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff' // Ensure white background
      } as any);

      const image = canvas.toDataURL('image/jpeg', 0.9);
      const link = document.createElement('a');
      link.href = image;
      link.download = `Quotation_${selectedDate || 'Draft'}.jpg`;
      link.click();

    } catch (error) {
      console.error('Image generation failed:', error);
      alert('Failed to generate image. Please try again.');
    } finally {
      // Cleanup
      document.body.removeChild(clone);
      setIsGeneratingImage(false);
    }
  };

  const madinahHotels = useMemo(() => {
    if (!selectedDate) return hotels.filter(h => h.city === 'Madinah');
    const checkDate = new Date(selectedDate);
    return hotels.filter(h => {
      if (h.city !== 'Madinah') return false;
      const season = h.seasons.find(s => isDateInRange(checkDate, s.range));
      return season && season.prices && season.prices.length > 0;
    });
  }, [selectedDate]);

  const makkahHotels = useMemo(() => {
    if (!selectedDate) return hotels.filter(h => h.city === 'Makkah');
    const checkDate = new Date(selectedDate);
    return hotels.filter(h => {
      if (h.city !== 'Makkah') return false;
      const season = h.seasons.find(s => isDateInRange(checkDate, s.range));
      return season && season.prices && season.prices.length > 0;
    });
  }, [selectedDate]);

  const handleAIApply = (data: any) => {
    if (data.selectedDate !== undefined) setSelectedDate(data.selectedDate);
    if (data.paxCount !== undefined) setPaxCount(data.paxCount);
    if (data.includeHandling !== undefined) setIncludeHandling(data.includeHandling);
    if (data.includeMutawif !== undefined) setIncludeMutawif(data.includeMutawif);
    if (data.includeVisa !== undefined) setIncludeVisa(data.includeVisa);
    if (data.currency !== undefined) setCurrency(data.currency);
    if (data.kurs !== undefined) setKurs(data.kurs);
    if (data.kursUsd !== undefined) setKursUsd(data.kursUsd);
    if (data.rows !== undefined) setRows(data.rows);
  };

  const currentAIData = {
    selectedDate,
    paxCount,
    includeHandling,
    includeMutawif,
    includeVisa,
    currency,
    kurs,
    kursUsd,
    rows
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center gap-6 print:p-0 print:bg-white print:block">
      
      {/* AI Prompt Input */}
      <div className="w-full max-w-[210mm] print:hidden">
        <AIPromptInput 
          context="Price UST (Quotation)" 
          currentData={currentAIData} 
          onApply={handleAIApply} 
          masterData={{
            hotels,
            HANDLING_TIERS,
            visaData
          }}
        />
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 w-full max-w-[210mm] flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar className="text-gray-500 w-5 h-5" />
            <span className="font-medium text-gray-700">Select Period:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Users className="text-gray-500 w-5 h-5" />
            <span className="font-medium text-gray-700">Pax:</span>
            <input
              type="number"
              min="1"
              max="50"
              value={paxCount}
              onChange={(e) => setPaxCount(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 w-20 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <RefreshCw className="text-gray-500 w-5 h-5" />
            <span className="font-medium text-gray-700">Currency:</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as 'SAR' | 'USD' | 'IDR')}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="IDR">IDR (Rupiah)</option>
              <option value="SAR">SAR (Real)</option>
              <option value="USD">USD (Dollar)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <RefreshCw className="text-gray-500 w-5 h-5" />
            <span className="font-medium text-gray-700">Kurs SAR:</span>
            <input
              type="number"
              value={kurs}
              onChange={(e) => setKurs(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 w-24 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <RefreshCw className="text-gray-500 w-5 h-5" />
            <span className="font-medium text-gray-700">Kurs USD:</span>
            <input
              type="number"
              value={kursUsd}
              onChange={(e) => setKursUsd(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 w-24 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Briefcase className="text-gray-500 w-5 h-5" />
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeHandling}
                  onChange={(e) => setIncludeHandling(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <span className="font-medium text-gray-700">Handling</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeMutawif}
                  onChange={(e) => setIncludeMutawif(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <span className="font-medium text-gray-700">Mutawif</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeVisa}
                  onChange={(e) => setIncludeVisa(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <span className="font-medium text-gray-700">Visa</span>
              </label>
            </div>
          </div>
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

      {/* Datalists */}
      <datalist id="madinah-list">
        {madinahHotels.map(h => (
          <option key={h.id} value={h.name} />
        ))}
      </datalist>
      <datalist id="makkah-list">
        {makkahHotels.map(h => (
          <option key={h.id} value={h.name} />
        ))}
      </datalist>

      {/* A4 Aspect Ratio Container */}
      <div className="w-full overflow-x-auto pb-8 flex justify-center">
        <div ref={printRef} className="w-[210mm] min-h-[297mm] bg-amber-400 shadow-2xl relative text-gray-900 font-sans flex flex-col print:shadow-none print:m-0 shrink-0">
        
        {/* Background Pattern (Subtle) */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        </div>

        {/* Header */}
        <div className="p-2 pb-4 flex justify-between items-start relative z-10">
          <div className="flex flex-col">
             {/* Logo */}
            <div className="flex items-center gap-3 mb-2">
               <img src="https://umaroh.com/assets/logo-light-D4UzTX0_.png" alt="umaroh logo" className="h-16 w-auto" referrerPolicy="no-referrer" />
            </div>
            <p className="text-[10px] italic font-semibold ml-1 tracking-wide">Platform Digital Umrah & Haji Pertama di Indonesia</p>
          </div>
          
          <div className="border-l-2 border-gray-900 pl-6 py-1 pdf-header-content">
            <h1 className="text-2xl font-bold leading-tight">Price UST</h1>
            <h2 className="text-2xl font-bold leading-tight mb-3">Hotel Madinah / Makkah</h2>
            <div className="border-b-2 border-gray-900 w-32 mb-2"></div>
            <h3 className="text-xl font-bold">
              {selectedDate ? new Date(selectedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Periode'}
            </h3>
          </div>
        </div>

        {/* Table Section */}
        <div className="px-2 py-4 flex-grow relative z-10">
          <div className="bg-white border-[3px] border-purple-600 rounded-sm overflow-hidden">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-900 text-amber-400 text-center font-bold uppercase text-xs tracking-wider">
                  <th className="p-2 border-r border-amber-400/50 w-6">No</th>
                  <th className="p-2 border-r border-amber-400/50">Madinah</th>
                  <th className="p-2 border-r border-amber-400/50 w-6"><Star className="w-3 h-3 mx-auto fill-current" /></th>
                  <th className="p-2 border-r border-amber-400/50">Makkah</th>
                  <th className="p-2 border-r border-amber-400/50 w-6"><Star className="w-3 h-3 mx-auto fill-current" /></th>
                  <th className="p-2 border-r border-amber-400/50 w-22">Quad ({currency})</th>
                  <th className="p-2 border-r border-amber-400/50 w-22">Triple ({currency})</th>
                  <th className="p-2 w-22">Double ({currency})</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={index} className="border-b border-gray-200 text-center hover:bg-gray-50 group">
                    <td className="border-r border-gray-200 font-bold bg-gray-50 text-gray-700">{index + 1}</td>
                    
                    {/* Madinah Hotel */}
                    <td className="border-r border-gray-200 text-left px-2 font-medium relative py-2">
                      <div className="flex flex-col">
                        <input
                          type="text"
                          list="madinah-list"
                          className="w-full bg-transparent px-2 outline-none placeholder-gray-300 focus:placeholder-gray-400"
                          placeholder="Select Madinah..."
                          value={row.madinah?.name || ''}
                          onChange={(e) => handleHotelChange(index, 'madinah', e.target.value)}
                        />
                        <span className="px-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">Madinah</span>
                      </div>
                    </td>
                    <td className="border-r border-gray-200 font-bold text-xs p-0">
                      <input
                        type="text"
                        className="w-full h-full bg-transparent text-center outline-none"
                        value={row.madinah?.stars || ''}
                        onChange={(e) => handleStarChange(index, 'madinah', e.target.value)}
                      />
                    </td>

                    {/* Makkah Hotel */}
                    <td className="border-r border-gray-200 text-left px-2 font-medium relative py-2">
                      <div className="flex flex-col">
                        <input
                          type="text"
                          list="makkah-list"
                          className="w-full bg-transparent px-2 outline-none placeholder-gray-300 focus:placeholder-gray-400"
                          placeholder="Select Makkah..."
                          value={row.makkah?.name || ''}
                          onChange={(e) => handleHotelChange(index, 'makkah', e.target.value)}
                        />
                        <span className="px-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">Makkah</span>
                      </div>
                    </td>
                    <td className="border-r border-gray-200 font-bold text-xs p-0">
                      <input
                        type="text"
                        className="w-full h-full bg-transparent text-center outline-none"
                        value={row.makkah?.stars || ''}
                        onChange={(e) => handleStarChange(index, 'makkah', e.target.value)}
                      />
                    </td>

                    {/* Prices */}
                    <td className="border-r border-gray-200 font-mono text-xs p-0">
                      <input
                        type="text"
                        className="w-full h-full bg-transparent text-center outline-none"
                        value={formatCurrency(row.priceQuad || '')}
                        onChange={(e) => handleRowChange(index, 'priceQuad', e.target.value)}
                      />
                    </td>
                    <td className="border-r border-gray-200 font-mono text-xs p-0">
                      <input
                        type="text"
                        className="w-full h-full bg-transparent text-center outline-none"
                        value={formatCurrency(row.priceTriple || '')}
                        onChange={(e) => handleRowChange(index, 'priceTriple', e.target.value)}
                      />
                    </td>
                    <td className="font-mono text-xs p-0">
                      <input
                        type="text"
                        className="w-full h-full bg-transparent text-center outline-none"
                        value={formatCurrency(row.priceDouble || '')}
                        onChange={(e) => handleRowChange(index, 'priceDouble', e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Info */}
        <div className="px-2 mt-2 flex justify-between items-start relative z-10">
            {/* Include Section */}
            <div className="w-[60%]">
                <h3 className="text-sm font-bold mb-1 uppercase tracking-wide border-b-2 border-gray-900 inline-block">HANDLING SAUDI ARABIA ( ECONOMY )</h3>
                <ol className="list-decimal list-outside ml-4 text-[10px] font-bold space-y-0.5 leading-tight">
                    {includeVisa && <li>Visa Umrah</li>}
                    {includeMutawif && <li>Mutawif / Guide</li>}
                    <li>Handling Kedatangan Bandara Madinah / Jeddah</li>
                    <li>Handling kepulangan di Bandara Jeddah / Madinah</li>
                    <li>Biaya Porter Bandara Madinah & Jeddah</li>
                    <li>Handling Check in dan Check out Hotel Madinah dan Makkah</li>
                    <li>Biaya Tips Bellboy hotel Makkah dan Madinah</li>
                    <li>Biaya Tips Driver selama perjalanan</li>
                    <li>Air Mineral selama perjalanan</li>
                    <li>Snacks box ( makanan Ringan saat perjalanan Madinah - Makkah )</li>
                    <li>Snacks box ( makanan Ringan selama program ziarah )</li>
                    <li>Snacks box ( makanan Ringan saat perjalanan Makkah – Jeddah kepulangan )</li>
                    <li>Makan siang / makan malam saat kedatangan</li>
                    <li>Makan siang / makan malam saat kepulangan</li>
                    <li>Air Zamzam 05 Liter ( Apabila Diizinkan )</li>
                </ol>
            </div>

            {/* Base On Section */}
            <div className="w-[40%] text-right">
                <h3 className="text-2xl font-bold uppercase tracking-wide mb-[-10px]">Base On</h3>
                <div className="text-[100px] font-bold leading-none tracking-tighter">{paxCount}</div>
                <div className="text-6xl font-bold uppercase tracking-widest mt-[-10px]">Pax</div>
            </div>
        </div>

        {/* Bottom Contact Bar */}
        <div className="mt-auto p-2 pb-12 flex justify-between items-end relative z-10">
            <div>
                <h4 className="font-bold text-xl uppercase mb-1">Call Us Now</h4>
                <div className="font-bold text-lg tracking-wide">+62 812-6006-6304</div>
            </div>
            
            <div className="text-center px-4">
                <h4 className="font-bold text-xl uppercase mb-1">Yusuf</h4>
                <div className="font-bold text-lg tracking-wide">+62 823-8200-8748</div>
            </div>

            <div className="text-right max-w-[250px] text-[10px] font-bold leading-tight">
                <div className="flex items-start justify-end gap-2">
                    <MapPin className="w-6 h-6 flex-shrink-0 fill-gray-900 text-amber-400" />
                    <p>Jl. Tangkuban Prahu No.7, RT.01/RW.03, Babakan, Kecamatan Bogor Tengah, Kota Bogor, Jawa Barat 16128</p>
                </div>
            </div>
        </div>
        </div>
      </div>
    </div>
  );
};
