import React, { useState, useEffect, useRef } from 'react';
import { hotels, Hotel } from '../data/hotels';
import { HANDLING_TIERS, HANDLING_CONSTANTS } from '../data/handlingSaudi';
import { transportData } from '../data/transport';
import { equipmentData } from '../data/equipment';
import { visaData } from '../data/visa';
import { maskapaiData } from '../data/maskapai';
import { handlingDomestikData } from '../data/handlingDomestik';
import { manasikData } from '../data/manasik';
import { ziarahData } from '../data/ziarah';
import { keretaCepatData } from '../data/keretaCepat';
import { Download, FileSpreadsheet, Image as ImageIcon, FileText } from 'lucide-react';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { ProfessionalOffering } from './ProfessionalOffering';

const getQuadPrice = (hotel: Hotel, dateStr: string) => {
  let targetSeason = hotel.seasons[0];
  if (dateStr) {
    const date = new Date(dateStr);
    const foundSeason = hotel.seasons.find(season => {
      const parts = season.range.split(' TO ');
      if (parts.length !== 2) return false;
      const start = new Date(parts[0]);
      const end = new Date(parts[1]);
      return date >= start && date <= end;
    });
    if (foundSeason) {
      targetSeason = foundSeason;
    } else {
      return null;
    }
  }
  
  const quadPriceEntry = targetSeason?.prices.find(p => p.roomType.toLowerCase() === 'quad');
  return quadPriceEntry ? quadPriceEntry.price : null;
};

import { AIPromptInput } from './AIPromptInput';

export const SalesOrderView: React.FC = () => {
  const [namaPaket, setNamaPaket] = useState('');
  const [namaTravel, setNamaTravel] = useState('Umaroh.com');
  const [namaMitra, setNamaMitra] = useState('');
  const [tglKeberangkatan, setTglKeberangkatan] = useState('');
  const [programHari, setProgramHari] = useState('9');
  const [jumlahPax, setJumlahPax] = useState(45);
  const [tl, setTl] = useState(1);
  const [room, setRoom] = useState('QUAD');
  const [pic, setPic] = useState('Operational');
  const [kursSaudi, setKursSaudi] = useState(4300);
  const [kursUsd, setKursUsd] = useState(15800);
  const [malamMadinah, setMalamMadinah] = useState(3);
  const [malamMakkah, setMalamMakkah] = useState(4);
  const [selectedHotelMadinah, setSelectedHotelMadinah] = useState('');
  const [selectedHotelMakkah, setSelectedHotelMakkah] = useState('');
  const [selectedHandling, setSelectedHandling] = useState('45');
  const [selectedEquipment, setSelectedEquipment] = useState('eq-1');
  const [selectedVisa, setSelectedVisa] = useState('v-1');
  const [selectedTransport, setSelectedTransport] = useState('none|0');
  const [selectedMaskapai, setSelectedMaskapai] = useState('');
  const [selectedHandlingDomestik, setSelectedHandlingDomestik] = useState('');
  const [selectedManasik, setSelectedManasik] = useState('');
  const [selectedZiarah, setSelectedZiarah] = useState('');
  const [selectedKeretaCepat, setSelectedKeretaCepat] = useState('');
  const [asuransiHargaApk, setAsuransiHargaApk] = useState(185000);
  const [asuransiHargaVendor, setAsuransiHargaVendor] = useState(185000);
  const [komisiMitra, setKomisiMitra] = useState(1000000);
  const [isGenerating, setIsGenerating] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tglKeberangkatan && !selectedHotelMadinah && !selectedHotelMakkah) {
      const madinah = hotels.find(h => h.city === 'Madinah');
      const makkah = hotels.find(h => h.city === 'Makkah');
      if (madinah) setSelectedHotelMadinah(madinah.id);
      if (makkah) setSelectedHotelMakkah(makkah.id);
    }
  }, [tglKeberangkatan, selectedHotelMadinah, selectedHotelMakkah]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount).replace('Rp', 'Rp ');
  };

  const formatPercent = (val: number) => `${(val * 100).toFixed(2)}%`;

  const jamaahBayar = jumlahPax;
  const jamaahBeli = jumlahPax;

  const availableMaskapai = maskapaiData.filter(m => m.programDays === Number(programHari));
  const maskapaiObj = maskapaiData.find(m => m.id === selectedMaskapai);
  const maskapaiHargaApk = maskapaiObj?.hargaJual || 0;
  const maskapaiHargaVendor = maskapaiObj?.hargaBeli || 0;
  const maskapai = {
    estMargin: maskapaiHargaApk - maskapaiHargaVendor,
    pctMargin: maskapaiHargaApk > 0 ? (maskapaiHargaApk - maskapaiHargaVendor) / maskapaiHargaApk : 0,
    totalHrgJual: maskapaiHargaApk * jamaahBayar,
    totalHargaBeli: maskapaiHargaVendor * jamaahBeli,
    totalMargin: (maskapaiHargaApk * jamaahBayar) - (maskapaiHargaVendor * jamaahBeli)
  };

  const availableMadinahHotels = hotels.filter(h => h.city === 'Madinah');
  const hotelMadinahObj = hotels.find(h => h.id === selectedHotelMadinah);
  const hotelMadinahPriceSAR = hotelMadinahObj ? (getQuadPrice(hotelMadinahObj, tglKeberangkatan) || 0) : 0;
  const hotelMadinahHargaApk = (hotelMadinahPriceSAR * kursSaudi / 4) * malamMadinah;
  const hotelMadinahHargaVendor = (hotelMadinahPriceSAR * kursSaudi / 4) * malamMadinah;
  const hotelMadinah = {
    estMargin: hotelMadinahHargaApk - hotelMadinahHargaVendor,
    pctMargin: 0,
    totalHrgJual: hotelMadinahHargaApk * jamaahBayar,
    totalHargaBeli: hotelMadinahHargaVendor * jamaahBeli,
    totalMargin: 0
  };

  const availableMakkahHotels = hotels.filter(h => h.city === 'Makkah');
  const hotelMakkahObj = hotels.find(h => h.id === selectedHotelMakkah);
  const hotelMakkahPriceSAR = hotelMakkahObj ? (getQuadPrice(hotelMakkahObj, tglKeberangkatan) || 0) : 0;
  const hotelMakkahHargaApk = (hotelMakkahPriceSAR * kursSaudi / 4) * malamMakkah;
  const hotelMakkahHargaVendor = (hotelMakkahPriceSAR * kursSaudi / 4) * malamMakkah;
  const hotelMakkah = {
    estMargin: hotelMakkahHargaApk - hotelMakkahHargaVendor,
    pctMargin: 0,
    totalHrgJual: hotelMakkahHargaApk * jamaahBayar,
    totalHargaBeli: hotelMakkahHargaVendor * jamaahBeli,
    totalMargin: 0
  };

  const handlingTier = HANDLING_TIERS.find(t => t.minPax.toString() === selectedHandling);
  const handlingHargaApk = (handlingTier?.hpp || 0) * kursSaudi;
  const handlingHargaVendor = (handlingTier?.hpp || 0) * kursSaudi;
  const handling = {
    estMargin: 0,
    pctMargin: 0,
    totalHrgJual: handlingHargaApk * jamaahBayar,
    totalHargaBeli: handlingHargaVendor * jamaahBeli,
    totalMargin: 0
  };

  const equipmentObj = equipmentData.find(e => e.id === selectedEquipment);
  const equipmentHargaApk = equipmentObj?.roundedPrice || 0;
  const equipmentHargaVendor = equipmentObj?.roundedPrice || 0;
  const perlengkapan = {
    estMargin: 0,
    pctMargin: 0,
    totalHrgJual: equipmentHargaApk * jamaahBayar,
    totalHargaBeli: equipmentHargaVendor * jamaahBeli,
    totalMargin: 0
  };

  const visaObj = visaData.find(v => v.id === selectedVisa);
  const visaHargaApk = (visaObj?.foreignPriceUsd || 0) * kursUsd;
  const visaHargaVendor = (visaObj?.foreignPriceUsd || 0) * kursUsd;
  const visaRow = {
    estMargin: 0,
    pctMargin: 0,
    totalHrgJual: visaHargaApk * jamaahBayar,
    totalHargaBeli: visaHargaVendor * jamaahBeli,
    totalMargin: 0
  };

  const [transportId, routeIdx] = selectedTransport.split('|');
  const transportObj = transportData.find(t => t.id === transportId);
  const transportRoute = transportObj?.routes[parseInt(routeIdx)];
  const transportHargaApk = ((transportRoute?.price || 0) * kursSaudi) / (jumlahPax || 1);
  const transportHargaVendor = ((transportRoute?.price || 0) * kursSaudi) / (jumlahPax || 1);
  const transportRow = {
    estMargin: 0,
    pctMargin: 0,
    totalHrgJual: transportHargaApk * jamaahBayar,
    totalHargaBeli: transportHargaVendor * jamaahBeli,
    totalMargin: 0
  };

  const asuransi = {
    estMargin: asuransiHargaApk - asuransiHargaVendor,
    pctMargin: asuransiHargaApk > 0 ? (asuransiHargaApk - asuransiHargaVendor) / asuransiHargaApk : 0,
    totalHrgJual: asuransiHargaApk * jamaahBayar,
    totalHargaBeli: asuransiHargaVendor * jamaahBeli,
    totalMargin: (asuransiHargaApk * jamaahBayar) - (asuransiHargaVendor * jamaahBeli)
  };

  const manasikObj = manasikData.find(m => m.id === selectedManasik);
  const manasikHargaApk = manasikObj?.hargaJual || 0;
  const manasikHargaVendor = manasikObj?.hargaBeli || 0;
  const manasik = {
    estMargin: 0,
    pctMargin: 0,
    totalHrgJual: manasikHargaApk * jamaahBayar,
    totalHargaBeli: manasikHargaVendor * jamaahBeli,
    totalMargin: 0
  };

  const ziarahObj = ziarahData.find(z => z.id === selectedZiarah);
  const ziarahHargaApk = ziarahObj?.hargaJual || 0;
  const ziarahHargaVendor = ziarahObj?.hargaBeli || 0;
  const ziarah = {
    estMargin: 0,
    pctMargin: 0,
    totalHrgJual: ziarahHargaApk * jamaahBayar,
    totalHargaBeli: ziarahHargaVendor * jamaahBeli,
    totalMargin: 0
  };

  const keretaCepatObj = keretaCepatData.find(k => k.id === selectedKeretaCepat);
  const keretaCepatHargaApk = keretaCepatObj?.hargaJual || 0;
  const keretaCepatHargaVendor = keretaCepatObj?.hargaBeli || 0;
  const keretaCepat = {
    estMargin: 0,
    pctMargin: 0,
    totalHrgJual: keretaCepatHargaApk * jamaahBayar,
    totalHargaBeli: keretaCepatHargaVendor * jamaahBeli,
    totalMargin: 0
  };

  const handlingDomestikObj = handlingDomestikData.find(h => h.id === selectedHandlingDomestik);
  const handlingDomestikHargaApk = handlingDomestikObj?.hargaJual || 0;
  const handlingDomestikHargaVendor = handlingDomestikObj?.hargaBeli || 0;
  const handlingDomestik = {
    estMargin: 0,
    pctMargin: 0,
    totalHrgJual: handlingDomestikHargaApk * jamaahBayar,
    totalHargaBeli: handlingDomestikHargaVendor * jamaahBeli,
    totalMargin: 0
  };

  const tlHargaApk = (15000000 / (jumlahPax || 1));
  const tlHargaVendor = (15000000 / (jumlahPax || 1));
  const tlRow = {
    totalHrgJual: tlHargaApk * tl
  };

  const totalHargaApk = maskapaiHargaApk + hotelMadinahHargaApk + hotelMakkahHargaApk + handlingHargaApk + equipmentHargaApk + visaHargaApk + transportHargaApk + asuransiHargaApk + manasikHargaApk + ziarahHargaApk + keretaCepatHargaApk + handlingDomestikHargaApk + (tl > 0 ? tlHargaApk * tl / jamaahBayar : 0);
  const totalHargaVendor = maskapaiHargaVendor + hotelMadinahHargaVendor + hotelMakkahHargaVendor + handlingHargaVendor + equipmentHargaVendor + visaHargaVendor + transportHargaVendor + asuransiHargaVendor + manasikHargaVendor + ziarahHargaVendor + keretaCepatHargaVendor + handlingDomestikHargaVendor + (tl > 0 ? tlHargaVendor * tl / jamaahBeli : 0);
  const totalEstMargin = totalHargaApk - totalHargaVendor;
  const totalHrgJual = totalHargaApk * jamaahBayar;
  const totalHargaBeliAll = totalHargaVendor * jamaahBeli;
  const totalMarginAll = totalHrgJual - totalHargaBeliAll;

  const komisiUmarohPercent = 5;
  const komisiUmaroh = Math.round(totalHargaApk * komisiUmarohPercent / 100);

  const hargaQuadDewasa = totalHargaApk + komisiMitra + komisiUmaroh;
  const hargaTripleDewasa = hargaQuadDewasa + (500 * kursSaudi / 4);
  const hargaDoubleDewasa = hargaQuadDewasa + (1000 * kursSaudi / 4);

  const hargaVisaUpdate = visaObj?.foreignPriceUsd || 0;
  const hargaTransportasiUpdate = transportRoute?.price || 0;
  const hargaMutawwifUpdate = 0; // Placeholder

  const handleDownloadJpg = async () => {
    setIsGenerating(true);
    try {
      const element = document.getElementById('professional-offering');
      if (element) {
        // @ts-ignore
        const canvas = await html2canvas(element, { scale: 2 });
        const link = document.createElement('a');
        link.download = `Offering-${namaPaket || 'Umrah'}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.9);
        link.click();
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadExcel = () => {
    const ws = XLSX.utils.table_to_sheet(tableRef.current!);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sales Order");
    XLSX.writeFile(wb, `SalesOrder-${namaPaket || 'Umrah'}.xlsx`);
  };

  const handleDownloadPdf = () => {
    const element = document.getElementById('professional-offering');
    const opt = {
      margin: 0,
      filename: `Offering-${namaPaket || 'Umrah'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().from(element).set(opt).save();
  };

  const handleAIApply = (data: any) => {
    if (data.namaPaket !== undefined) setNamaPaket(data.namaPaket);
    if (data.namaTravel !== undefined) setNamaTravel(data.namaTravel);
    if (data.namaMitra !== undefined) setNamaMitra(data.namaMitra);
    if (data.tglKeberangkatan !== undefined) setTglKeberangkatan(data.tglKeberangkatan);
    if (data.programHari !== undefined) setProgramHari(data.programHari);
    if (data.jumlahPax !== undefined) setJumlahPax(data.jumlahPax);
    if (data.tl !== undefined) setTl(data.tl);
    if (data.room !== undefined) setRoom(data.room);
    if (data.pic !== undefined) setPic(data.pic);
    if (data.kursSaudi !== undefined) setKursSaudi(data.kursSaudi);
    if (data.kursUsd !== undefined) setKursUsd(data.kursUsd);
    if (data.malamMadinah !== undefined) setMalamMadinah(data.malamMadinah);
    if (data.malamMakkah !== undefined) setMalamMakkah(data.malamMakkah);
    if (data.selectedHotelMadinah !== undefined) setSelectedHotelMadinah(data.selectedHotelMadinah);
    if (data.selectedHotelMakkah !== undefined) setSelectedHotelMakkah(data.selectedHotelMakkah);
    if (data.selectedHandling !== undefined) setSelectedHandling(data.selectedHandling);
    if (data.selectedEquipment !== undefined) setSelectedEquipment(data.selectedEquipment);
    if (data.selectedVisa !== undefined) setSelectedVisa(data.selectedVisa);
    if (data.selectedTransport !== undefined) setSelectedTransport(data.selectedTransport);
    if (data.selectedMaskapai !== undefined) setSelectedMaskapai(data.selectedMaskapai);
    if (data.selectedHandlingDomestik !== undefined) setSelectedHandlingDomestik(data.selectedHandlingDomestik);
    if (data.selectedManasik !== undefined) setSelectedManasik(data.selectedManasik);
    if (data.selectedZiarah !== undefined) setSelectedZiarah(data.selectedZiarah);
    if (data.selectedKeretaCepat !== undefined) setSelectedKeretaCepat(data.selectedKeretaCepat);
  };

  const currentAIData = {
    namaPaket, namaTravel, namaMitra, tglKeberangkatan, programHari, jumlahPax, tl, room, pic,
    kursSaudi, kursUsd, malamMadinah, malamMakkah,
    selectedHotelMadinah, selectedHotelMakkah, selectedHandling, selectedEquipment,
    selectedVisa, selectedTransport, selectedMaskapai, selectedHandlingDomestik,
    selectedManasik, selectedZiarah, selectedKeretaCepat
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-full overflow-x-auto">
      <AIPromptInput 
        context="Sales Order" 
        currentData={currentAIData} 
        onApply={handleAIApply} 
        masterData={{
          hotels,
          maskapaiData,
          transportData,
          equipmentData,
          visaData,
          manasikData,
          ziarahData,
          keretaCepatData,
          handlingDomestikData,
          HANDLING_TIERS
        }}
      />
      {/* Hidden PDF Template */}

      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-lg md:text-xl font-bold text-gray-800">Sales Order / Quotation</h2>
          <div className="flex flex-wrap gap-2 md:gap-4 items-center justify-center">
            <button 
              onClick={handleDownloadJpg}
              disabled={isGenerating}
              className="flex items-center gap-2 bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors text-sm disabled:opacity-50"
            >
              <ImageIcon className="w-4 h-4" />
              {isGenerating ? 'Generating...' : 'Offering (JPG)'}
            </button>
            <button 
              onClick={handleDownloadExcel}
              className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Excel
            </button>
            <button 
              onClick={handleDownloadPdf}
              className="flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              <FileText className="w-4 h-4" />
              PDF
            </button>
            <div className="h-6 w-px bg-gray-300 mx-2"></div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-600">Kurs SAR:</label>
              <input type="number" value={kursSaudi} onChange={e => setKursSaudi(Number(e.target.value))} className="border rounded px-2 py-1 w-24 text-sm" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-600">Kurs USD:</label>
              <input type="number" value={kursUsd} onChange={e => setKursUsd(Number(e.target.value))} className="border rounded px-2 py-1 w-24 text-sm" />
            </div>
          </div>
        </div>

        <div ref={tableRef} className="overflow-x-auto bg-white">
          <table className="w-full text-[10px] md:text-sm border-collapse min-w-[1000px] md:min-w-[1200px]">
            <tbody>
              {/* Header Rows */}
              <tr className="bg-gray-100 border-b border-gray-300">
                <td colSpan={2} className="border-r border-gray-300 p-2 font-bold text-center">NAMA PAKET</td>
                <td colSpan={2} className="border-r border-gray-300 p-2">
                  <input type="text" value={namaPaket} onChange={e => setNamaPaket(e.target.value)} className="w-full bg-white border border-gray-300 rounded px-2 py-1" />
                </td>
                <td className="border-r border-gray-300 p-2 font-bold">JUMLAH PAX</td>
                <td className="border-r border-gray-300 p-2 text-center bg-gray-200">
                  <input type="number" value={jumlahPax} onChange={e => setJumlahPax(Number(e.target.value))} className="w-16 bg-white border border-gray-300 rounded px-1 py-1 text-center" />
                </td>
                <td className="border-r border-gray-300 p-2 font-bold text-center">PIC</td>
                <td className="border-r border-gray-300 p-2 text-center">
                  <input type="text" value={pic} onChange={e => setPic(e.target.value)} className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-center" />
                </td>
                <td colSpan={3} className="border-r border-gray-300 p-2 font-bold text-right italic text-gray-600">HARGA VISA UPDATE</td>
                <td className="p-2 font-bold text-gray-600 italic">${hargaVisaUpdate}/pax</td>
              </tr>
              <tr className="bg-gray-100 border-b border-gray-300">
                <td colSpan={2} className="border-r border-gray-300 p-2 font-bold text-center">TGL DAN BULAN KEBERANGKATAN</td>
                <td colSpan={2} className="border-r border-gray-300 p-2">
                  <input type="date" value={tglKeberangkatan} onChange={e => setTglKeberangkatan(e.target.value)} className="w-full bg-white border border-gray-300 rounded px-2 py-1" />
                </td>
                <td className="border-r border-gray-300 p-2 font-bold">+ TL</td>
                <td className="border-r border-gray-300 p-2 text-center bg-gray-200">
                  <input type="number" value={tl} onChange={e => setTl(Number(e.target.value))} className="w-16 bg-white border border-gray-300 rounded px-1 py-1 text-center" />
                </td>
                <td className="border-r border-gray-300 p-2"></td>
                <td className="border-r border-gray-300 p-2"></td>
                <td colSpan={3} className="border-r border-gray-300 p-2 font-bold text-right italic text-gray-600">HARGA TRANSPORTASI UPDATE</td>
                <td className="p-2 font-bold text-gray-600 italic">SAR{hargaTransportasiUpdate}</td>
              </tr>
              <tr className="bg-gray-100 border-b border-gray-300">
                <td colSpan={2} className="border-r border-gray-300 p-2 font-bold text-center">PROGRAM HARI</td>
                <td colSpan={2} className="border-r border-gray-300 p-2">
                  <select value={programHari} onChange={e => setProgramHari(e.target.value)} className="w-full bg-white border border-gray-300 rounded px-2 py-1">
                    <option value="">Pilih Hari</option>
                    {Array.from({ length: 22 }, (_, i) => i + 9).map(day => (
                      <option key={day} value={day}>{day} Hari</option>
                    ))}
                  </select>
                </td>
                <td className="border-r border-gray-300 p-2 font-bold">ROOM</td>
                <td className="border-r border-gray-300 p-2">
                  <input type="text" value={room} onChange={e => setRoom(e.target.value)} className="w-full bg-white border border-gray-300 rounded px-2 py-1" />
                </td>
                <td className="border-r border-gray-300 p-2 font-bold">NAMA TRAVEL</td>
                <td className="border-r border-gray-300 p-2">
                  <input type="text" value={namaTravel} onChange={e => setNamaTravel(e.target.value)} className="w-full bg-white border border-gray-300 rounded px-2 py-1" />
                </td>
                <td colSpan={3} className="border-r border-gray-300 p-2 font-bold text-right italic text-gray-600">HARGA MUTAWWIF UPDATE</td>
                <td className="p-2 font-bold text-gray-600 italic">SAR{hargaMutawwifUpdate}</td>
              </tr>
              <tr className="bg-gray-100 border-b border-gray-400">
                <td colSpan={2} className="border-r border-gray-300 p-2 font-bold text-center">NAMA MITRA</td>
                <td colSpan={2} className="border-r border-gray-300 p-2">
                  <input type="text" value={namaMitra} onChange={e => setNamaMitra(e.target.value)} className="w-full bg-white border border-gray-300 rounded px-2 py-1" />
                </td>
                <td colSpan={8} className="border-r border-gray-300 p-2"></td>
              </tr>

              {/* Column Headers */}
              <tr className="bg-gray-200 border-b-2 border-gray-400 font-bold text-center">
                <td className="border-r border-gray-300 p-2 min-w-[400px]">DESK</td>
                <td className="border-r border-gray-300 p-2 w-32">VENDOR</td>
                <td className="border-r border-gray-300 p-2 w-32">HARGA APK</td>
                <td className="border-r border-gray-300 p-2 w-32">HARGA VENDOR</td>
                <td className="border-r border-gray-300 p-2 w-32">EST. MARGIN</td>
                <td className="border-r border-gray-300 p-2 w-20">% MARGIN</td>
                <td className="border-r border-gray-300 p-2 w-20 bg-green-100">JAMAAH BAYAR</td>
                <td className="border-r border-gray-300 p-2 w-32 bg-green-100">TOTAL HRG JUAL</td>
                <td className="border-r border-gray-300 p-2 w-20 bg-green-100">JAMAAH BELI</td>
                <td className="border-r border-gray-300 p-2 w-32 bg-green-100">TOTAL HARGA BELI</td>
                <td className="border-r border-gray-300 p-2 w-32 bg-green-100">TOTAL MARGIN</td>
                <td className="p-2 w-24">REFF.</td>
              </tr>

              {/* Data Rows */}
              <tr className="border-b border-gray-300 hover:bg-gray-50">
                <td className="border-r border-gray-300 p-2 font-medium italic">
                  <select value={selectedMaskapai} onChange={e => setSelectedMaskapai(e.target.value)} className="w-full bg-transparent font-medium italic outline-none">
                    <option value="">Pilih Maskapai...</option>
                    {availableMaskapai.map(m => (
                      <option key={m.id} value={m.id}>{m.name} - {m.programDays} Hari - {m.tanggalKeberangkatan} s/d {m.tanggalKepulangan}</option>
                    ))}
                  </select>
                </td>
                <td className="border-r border-gray-300 p-2 text-center">{maskapaiObj?.namaVendor || ''}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(maskapaiHargaApk)}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(maskapaiHargaVendor)}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(maskapai.estMargin)}</td>
                <td className="border-r border-gray-300 p-2 text-center">{formatPercent(maskapai.pctMargin)}</td>
                <td className="border-r border-gray-300 p-2 text-center">{jamaahBayar}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(maskapai.totalHrgJual)}</td>
                <td className="border-r border-gray-300 p-2 text-center">{jamaahBeli}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(maskapai.totalHargaBeli)}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(maskapai.totalMargin)}</td>
                <td className="p-2 text-center text-xs">CONFIRMED</td>
              </tr>

              <tr className="border-b border-gray-300 hover:bg-gray-50">
                <td className="border-r border-gray-300 p-2 font-medium italic">
                  <div className="flex items-center gap-2">
                    <select value={selectedHotelMadinah} onChange={e => setSelectedHotelMadinah(e.target.value)} className="w-full bg-transparent font-medium italic outline-none">
                      <option value="">Pilih Hotel Madinah...</option>
                      {availableMadinahHotels.map(h => (
                        <option key={h.id} value={h.id}>HOTEL MADINAH: {h.name} {h.mealPlan} (SAR {getQuadPrice(h, tglKeberangkatan)})</option>
                      ))}
                    </select>
                    {selectedHotelMadinah && (
                      <div className="flex items-center gap-1 shrink-0 bg-white border border-gray-300 rounded px-1">
                        <input type="number" value={malamMadinah} onChange={e => setMalamMadinah(Number(e.target.value))} className="w-10 text-center outline-none bg-transparent" min="1" title="Jumlah Malam" />
                        <span className="text-xs text-gray-500 pr-1">Malam</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="border-r border-gray-300 p-2 text-center">{hotelMadinahObj?.vendor || ''}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(hotelMadinahHargaApk)}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(hotelMadinahHargaVendor)}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(hotelMadinah.estMargin)}</td>
                <td className="border-r border-gray-300 p-2 text-center">{formatPercent(hotelMadinah.pctMargin)}</td>
                <td className="border-r border-gray-300 p-2 text-center">{jamaahBayar}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(hotelMadinah.totalHrgJual)}</td>
                <td className="border-r border-gray-300 p-2 text-center">{jamaahBeli}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(hotelMadinah.totalHargaBeli)}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(hotelMadinah.totalMargin)}</td>
                <td className="p-2 text-center text-xs">UPDATE RATE</td>
              </tr>

              <tr className="border-b border-gray-300 hover:bg-gray-50">
                <td className="border-r border-gray-300 p-2 font-medium italic">
                  <div className="flex items-center gap-2">
                    <select value={selectedHotelMakkah} onChange={e => setSelectedHotelMakkah(e.target.value)} className="w-full bg-transparent font-medium italic outline-none">
                      <option value="">Pilih Hotel Makkah...</option>
                      {availableMakkahHotels.map(h => (
                        <option key={h.id} value={h.id}>HOTEL MAKKAH: {h.name} {h.mealPlan} (SAR {getQuadPrice(h, tglKeberangkatan)})</option>
                      ))}
                    </select>
                    {selectedHotelMakkah && (
                      <div className="flex items-center gap-1 shrink-0 bg-white border border-gray-300 rounded px-1">
                        <input type="number" value={malamMakkah} onChange={e => setMalamMakkah(Number(e.target.value))} className="w-10 text-center outline-none bg-transparent" min="1" title="Jumlah Malam" />
                        <span className="text-xs text-gray-500 pr-1">Malam</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="border-r border-gray-300 p-2 text-center">{hotelMakkahObj?.vendor || ''}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(hotelMakkahHargaApk)}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(hotelMakkahHargaVendor)}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(hotelMakkah.estMargin)}</td>
                <td className="border-r border-gray-300 p-2 text-center">{formatPercent(hotelMakkah.pctMargin)}</td>
                <td className="border-r border-gray-300 p-2 text-center">{jamaahBayar}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(hotelMakkah.totalHrgJual)}</td>
                <td className="border-r border-gray-300 p-2 text-center">{jamaahBeli}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(hotelMakkah.totalHargaBeli)}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(hotelMakkah.totalMargin)}</td>
                <td className="p-2 text-center text-xs">UPDATE RATE</td>
              </tr>

              <tr className="border-b border-gray-300 hover:bg-gray-50">
                <td className="border-r border-gray-300 p-2 font-medium">
                  <select value={selectedHandling} onChange={e => setSelectedHandling(e.target.value)} className="w-full bg-transparent font-medium outline-none">
                    <option value="">Pilih Handling...</option>
                    {HANDLING_TIERS.map(h => (
                      <option key={h.minPax.toString()} value={h.minPax.toString()}>Handling {h.minPax}-{h.maxPax} Pax</option>
                    ))}
                  </select>
                </td>
                <td className="border-r border-gray-300 p-2 text-center">TFA</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(handlingHargaApk)}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(handlingHargaVendor)}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(handling.estMargin)}</td>
                <td className="border-r border-gray-300 p-2 text-center">{formatPercent(handling.pctMargin)}</td>
                <td className="border-r border-gray-300 p-2 text-center">{jamaahBayar}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(handling.totalHrgJual)}</td>
                <td className="border-r border-gray-300 p-2 text-center">{jamaahBeli}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(handling.totalHargaBeli)}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(handling.totalMargin)}</td>
                <td className="p-2 text-center text-xs">UPDATE</td>
              </tr>

              <tr className="border-b border-gray-300 hover:bg-gray-50">
                <td className="border-r border-gray-300 p-2 font-medium">
                  <select value={selectedEquipment} onChange={e => setSelectedEquipment(e.target.value)} className="w-full bg-transparent font-medium outline-none">
                    <option value="">Pilih Perlengkapan...</option>
                    {equipmentData.map(e => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                </td>
                <td className="border-r border-gray-300 p-2 text-center">UMAROH</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(equipmentHargaApk)}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(equipmentHargaVendor)}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(perlengkapan.estMargin)}</td>
                <td className="border-r border-gray-300 p-2 text-center">{formatPercent(perlengkapan.pctMargin)}</td>
                <td className="border-r border-gray-300 p-2 text-center">{jamaahBayar}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(perlengkapan.totalHrgJual)}</td>
                <td className="border-r border-gray-300 p-2 text-center">{jamaahBeli}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(perlengkapan.totalHargaBeli)}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(perlengkapan.totalMargin)}</td>
                <td className="p-2 text-center text-xs">GUDANG OK</td>
              </tr>

              <tr className="border-b border-gray-300 hover:bg-gray-50">
                <td className="border-r border-gray-300 p-2 font-medium">
                  <select value={selectedVisa} onChange={e => setSelectedVisa(e.target.value)} className="w-full bg-transparent font-medium outline-none">
                    <option value="">Pilih Visa...</option>
                    {visaData.map(v => (
                      <option key={v.id} value={v.id}>VISA {v.paxRange}</option>
                    ))}
                  </select>
                </td>
                <td className="border-r border-gray-300 p-2 text-center">TFA</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(visaHargaApk)}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(visaHargaVendor)}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(visaRow.estMargin)}</td>
                <td className="border-r border-gray-300 p-2 text-center">{formatPercent(visaRow.pctMargin)}</td>
                <td className="border-r border-gray-300 p-2 text-center">{jamaahBayar}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(visaRow.totalHrgJual)}</td>
                <td className="border-r border-gray-300 p-2 text-center">{jamaahBeli}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(visaRow.totalHargaBeli)}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(visaRow.totalMargin)}</td>
                <td className="p-2 text-center text-xs">UPDATE</td>
              </tr>

              <tr className="border-b border-gray-300 hover:bg-gray-50">
                <td className="border-r border-gray-300 p-2 font-medium">
                  <select value={selectedTransport} onChange={e => setSelectedTransport(e.target.value)} className="w-full bg-transparent font-medium outline-none">
                    <option value="none|0">Tanpa Transportasi</option>
                    {transportData.map(t => (
                      <optgroup key={t.id} label={t.name}>
                        {t.routes.map((r, i) => (
                          <option key={`${t.id}-${i}`} value={`${t.id}|${i}`}>
                            {t.name} - {r.route} (SAR {r.price})
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </td>
                <td className="border-r border-gray-300 p-2 text-center">{transportObj?.namaVendor || ''}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(transportHargaApk)}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(transportHargaVendor)}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(transportRow.estMargin)}</td>
                <td className="border-r border-gray-300 p-2 text-center">{formatPercent(transportRow.pctMargin)}</td>
                <td className="border-r border-gray-300 p-2 text-center">{jamaahBayar}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(transportRow.totalHrgJual)}</td>
                <td className="border-r border-gray-300 p-2 text-center">{jamaahBeli}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(transportRow.totalHargaBeli)}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(transportRow.totalMargin)}</td>
                <td className="p-2 text-center text-xs"></td>
              </tr>

              <tr className="border-b border-gray-300 hover:bg-gray-50">
                <td className="border-r border-gray-300 p-2 font-medium">ASURANSI ZURICH BASIC</td>
                <td className="border-r border-gray-300 p-2 text-center">ZURICH</td>
                <td className="border-r border-gray-300 p-2 text-right">
                  <input type="number" value={asuransiHargaApk} onChange={e => setAsuransiHargaApk(Number(e.target.value))} className="w-full text-right bg-transparent" />
                </td>
                <td className="border-r border-gray-300 p-2 text-right">
                  <input type="number" value={asuransiHargaVendor} onChange={e => setAsuransiHargaVendor(Number(e.target.value))} className="w-full text-right bg-transparent" />
                </td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(asuransi.estMargin)}</td>
                <td className="border-r border-gray-300 p-2 text-center">{formatPercent(asuransi.pctMargin)}</td>
                <td className="border-r border-gray-300 p-2 text-center">{jamaahBayar}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(asuransi.totalHrgJual)}</td>
                <td className="border-r border-gray-300 p-2 text-center">{jamaahBeli}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(asuransi.totalHargaBeli)}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(asuransi.totalMargin)}</td>
                <td className="p-2 text-center text-xs">UPDATE</td>
              </tr>

              <tr className="border-b border-gray-300 hover:bg-gray-50">
                <td className="border-r border-gray-300 p-2 font-medium">
                  <select value={selectedManasik} onChange={e => setSelectedManasik(e.target.value)} className="w-full bg-transparent font-medium outline-none">
                    <option value="">Pilih Manasik...</option>
                    {manasikData.map(m => (
                      <option key={m.id} value={m.id}>MANASIK {m.item}</option>
                    ))}
                  </select>
                </td>
                <td className="border-r border-gray-300 p-2 text-center"></td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(manasikHargaApk)}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(manasikHargaVendor)}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(manasik.estMargin)}</td>
                <td className="border-r border-gray-300 p-2 text-center">{formatPercent(manasik.pctMargin)}</td>
                <td className="border-r border-gray-300 p-2 text-center">{jamaahBayar}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(manasik.totalHrgJual)}</td>
                <td className="border-r border-gray-300 p-2 text-center">{jamaahBeli}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(manasik.totalHargaBeli)}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(manasik.totalMargin)}</td>
                <td className="p-2 text-center text-xs"></td>
              </tr>

              <tr className="border-b border-gray-300 hover:bg-gray-50">
                <td className="border-r border-gray-300 p-2 font-medium">
                  <select value={selectedZiarah} onChange={e => setSelectedZiarah(e.target.value)} className="w-full bg-transparent font-medium outline-none">
                    <option value="">Tanpa Ziarah Tambahan</option>
                    {ziarahData.map(z => (
                      <option key={z.id} value={z.id}>{z.item}</option>
                    ))}
                  </select>
                </td>
                <td className="border-r border-gray-300 p-2 text-center"></td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(ziarahHargaApk)}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(ziarahHargaVendor)}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(ziarah.estMargin)}</td>
                <td className="border-r border-gray-300 p-2 text-center">{formatPercent(ziarah.pctMargin)}</td>
                <td className="border-r border-gray-300 p-2 text-center">{jamaahBayar}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(ziarah.totalHrgJual)}</td>
                <td className="border-r border-gray-300 p-2 text-center">{jamaahBeli}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(ziarah.totalHargaBeli)}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(ziarah.totalMargin)}</td>
                <td className="p-2 text-center text-xs"></td>
              </tr>

              <tr className="border-b border-gray-300 hover:bg-gray-50">
                <td className="border-r border-gray-300 p-2 font-medium">
                  <select value={selectedKeretaCepat} onChange={e => setSelectedKeretaCepat(e.target.value)} className="w-full bg-transparent font-medium outline-none">
                    <option value="">Tanpa Kereta Cepat</option>
                    {keretaCepatData.map(k => (
                      <option key={k.id} value={k.id}>{k.item}</option>
                    ))}
                  </select>
                </td>
                <td className="border-r border-gray-300 p-2 text-center"></td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(keretaCepatHargaApk)}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(keretaCepatHargaVendor)}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(keretaCepat.estMargin)}</td>
                <td className="border-r border-gray-300 p-2 text-center">{formatPercent(keretaCepat.pctMargin)}</td>
                <td className="border-r border-gray-300 p-2 text-center">{jamaahBayar}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(keretaCepat.totalHrgJual)}</td>
                <td className="border-r border-gray-300 p-2 text-center">{jamaahBeli}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(keretaCepat.totalHargaBeli)}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(keretaCepat.totalMargin)}</td>
                <td className="p-2 text-center text-xs"></td>
              </tr>

              <tr className="border-b border-gray-300 hover:bg-gray-50">
                <td className="border-r border-gray-300 p-2 font-medium">
                  <select value={selectedHandlingDomestik} onChange={e => setSelectedHandlingDomestik(e.target.value)} className="w-full bg-transparent font-medium outline-none">
                    <option value="">Pilih Handling Domestik...</option>
                    {handlingDomestikData.map(h => (
                      <option key={h.id} value={h.id}>{h.item}</option>
                    ))}
                  </select>
                </td>
                <td className="border-r border-gray-300 p-2 text-center">BOWO</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(handlingDomestikHargaApk)}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(handlingDomestikHargaVendor)}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(handlingDomestik.estMargin)}</td>
                <td className="border-r border-gray-300 p-2 text-center">{formatPercent(handlingDomestik.pctMargin)}</td>
                <td className="border-r border-gray-300 p-2 text-center">{jamaahBayar}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(handlingDomestik.totalHrgJual)}</td>
                <td className="border-r border-gray-300 p-2 text-center">{jamaahBeli}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(handlingDomestik.totalHargaBeli)}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(handlingDomestik.totalMargin)}</td>
                <td className="p-2 text-center text-xs">UPDATE</td>
              </tr>

              <tr className="border-b border-gray-300 bg-cyan-400 font-bold">
                <td className="border-r border-gray-300 p-2">TOUR LEADER (TL)</td>
                <td className="border-r border-gray-300 p-2"></td>
                <td className="border-r border-gray-300 p-2 text-right">{tl > 0 ? formatCurrency(tlHargaApk) : ''}</td>
                <td className="border-r border-gray-300 p-2 text-right">{tl > 0 ? formatCurrency(tlHargaVendor) : ''}</td>
                <td className="border-r border-gray-300 p-2 text-right"></td>
                <td className="border-r border-gray-300 p-2 text-center">{tl > 0 ? '0%' : ''}</td>
                <td className="border-r border-gray-300 p-2 text-center">{tl > 0 ? jamaahBayar : ''}</td>
                <td className="border-r border-gray-300 p-2 text-right">{tl > 0 ? formatCurrency(tlRow.totalHrgJual) : ''}</td>
                <td className="border-r border-gray-300 p-2"></td>
                <td className="border-r border-gray-300 p-2"></td>
                <td className="border-r border-gray-300 p-2 text-right">{tl > 0 ? formatCurrency(tlRow.totalHrgJual) : ''}</td>
                <td className="p-2"></td>
              </tr>

              <tr className="border-b border-gray-300 bg-yellow-300 font-bold italic">
                <td colSpan={2} className="border-r border-gray-300 p-2 text-center">HARGA DEWASA SEBELUM ADA KOMISI</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(totalHargaApk)}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(totalHargaVendor)}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(totalEstMargin)}</td>
                <td className="border-r border-gray-300 p-2 text-center">{formatPercent(totalEstMargin / totalHargaApk)}</td>
                <td className="border-r border-gray-300 p-2"></td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(totalHrgJual)}</td>
                <td className="border-r border-gray-300 p-2"></td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(totalHargaBeliAll)}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(totalMarginAll)}</td>
                <td className="p-2"></td>
              </tr>

              <tr className="border-b border-gray-300 hover:bg-gray-50">
                <td colSpan={2} className="border-r border-gray-300 p-2 font-medium">KOMISI MITRA</td>
                <td className="border-r border-gray-300 p-2 text-right">
                  <input type="number" value={komisiMitra} onChange={e => setKomisiMitra(Number(e.target.value))} className="w-full text-right bg-transparent" />
                </td>
                <td className="border-r border-gray-300 p-2"></td>
                <td className="border-r border-gray-300 p-2"></td>
                <td className="border-r border-gray-300 p-2"></td>
                <td className="border-r border-gray-300 p-2"></td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(komisiMitra * jamaahBayar)}</td>
                <td className="border-r border-gray-300 p-2"></td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(komisiMitra * jamaahBayar)}</td>
                <td className="border-r border-gray-300 p-2"></td>
                <td className="p-2"></td>
              </tr>

              <tr className="border-b border-gray-300 hover:bg-gray-50">
                <td colSpan={2} className="border-r border-gray-300 p-2 font-medium">KOMISI UMAROH</td>
                <td className="border-r border-gray-300 p-2 text-right">
                  {formatCurrency(komisiUmaroh)}
                </td>
                <td className="border-r border-gray-300 p-2"></td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(komisiUmaroh)}</td>
                <td className="border-r border-gray-300 p-2 text-center bg-yellow-300 font-bold">{komisiUmarohPercent}%</td>
                <td className="border-r border-gray-300 p-2"></td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(komisiUmaroh * jamaahBayar)}</td>
                <td className="border-r border-gray-300 p-2"></td>
                <td className="border-r border-gray-300 p-2"></td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(komisiUmaroh * jamaahBayar)}</td>
                <td className="p-2"></td>
              </tr>

              <tr className="border-b border-gray-300 bg-yellow-300 font-bold italic">
                <td colSpan={2} className="border-r border-gray-300 p-2 text-center">HARGA QUAD DEWASA SETELAH ADA KOMISI</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(hargaQuadDewasa)}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(hargaQuadDewasa)}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(totalEstMargin + komisiUmaroh)}</td>
                <td className="border-r border-gray-300 p-2"></td>
                <td className="border-r border-gray-300 p-2"></td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(totalHrgJual + (komisiMitra * jamaahBayar) + (komisiUmaroh * jamaahBayar))}</td>
                <td className="border-r border-gray-300 p-2"></td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(totalHargaBeliAll + (komisiMitra * jamaahBayar))}</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(totalMarginAll + (komisiUmaroh * jamaahBayar))}</td>
                <td className="p-2"></td>
              </tr>

              <tr className="border-b border-gray-300 bg-yellow-300 font-bold italic">
                <td colSpan={2} className="border-r border-gray-300 p-2 text-center">HARGA TRIPLE DEWASA SETELAH ADA KOMISI</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(hargaTripleDewasa)}</td>
                <td className="border-r border-gray-300 p-2 text-center">1</td>
                <td className="border-r border-gray-300 p-2"></td>
                <td className="border-r border-gray-300 p-2"></td>
                <td className="border-r border-gray-300 p-2"></td>
                <td className="border-r border-gray-300 p-2"></td>
                <td className="border-r border-gray-300 p-2"></td>
                <td className="border-r border-gray-300 p-2"></td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(totalMarginAll + (komisiUmaroh * jamaahBayar))}</td>
                <td className="p-2"></td>
              </tr>

              <tr className="border-b border-gray-300 bg-yellow-300 font-bold italic">
                <td colSpan={2} className="border-r border-gray-300 p-2 text-center">HARGA DOUBLE DEWASA SETELAH ADA KOMISI</td>
                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(hargaDoubleDewasa)}</td>
                <td className="border-r border-gray-300 p-2"></td>
                <td colSpan={2} className="border-r border-gray-300 p-2 text-center text-blue-600">Kurs Saudi</td>
                <td className="border-r border-gray-300 p-2 text-blue-600 text-right">{formatCurrency(kursSaudi)}</td>
                <td className="border-r border-gray-300 p-2 text-center">948</td>
                <td className="border-r border-gray-300 p-2"></td>
                <td className="border-r border-gray-300 p-2"></td>
                <td className="border-r border-gray-300 p-2 text-right">7,34%</td>
                <td className="p-2"></td>
              </tr>

            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
