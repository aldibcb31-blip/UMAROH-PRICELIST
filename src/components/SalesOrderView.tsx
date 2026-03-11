import React, { useState, useEffect } from 'react';
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

export const SalesOrderView: React.FC = () => {
  const [namaPaket, setNamaPaket] = useState('');
  const [tglKeberangkatan, setTglKeberangkatan] = useState('');
  const [programHari, setProgramHari] = useState('');
  const [jumlahPax, setJumlahPax] = useState(20);
  const [tl, setTl] = useState(0);
  const [room, setRoom] = useState('');
  const [pic, setPic] = useState('RUSMAN');
  const [hargaVisaUpdate, setHargaVisaUpdate] = useState(135);
  const [hargaTransportasiUpdate, setHargaTransportasiUpdate] = useState(2500);
  const [hargaMutawwifUpdate, setHargaMutawwifUpdate] = useState(250);
  const [kursSaudi, setKursSaudi] = useState(4600);
  const [kursUsd, setKursUsd] = useState(16000);
  const [malamMadinah, setMalamMadinah] = useState(3);
  const [malamMakkah, setMalamMakkah] = useState(4);

  // Selections
  const [selectedHotelMadinah, setSelectedHotelMadinah] = useState(hotels.find(h => h.city === 'Madinah')?.id || '');
  const [selectedHotelMakkah, setSelectedHotelMakkah] = useState(hotels.find(h => h.city === 'Makkah')?.id || '');
  const [selectedHandling, setSelectedHandling] = useState(HANDLING_TIERS[0]?.minPax.toString() || '');
  const [selectedEquipment, setSelectedEquipment] = useState(equipmentData[0]?.id || '');
  const [selectedVisa, setSelectedVisa] = useState(visaData[0]?.id || '');
  const [selectedTransport, setSelectedTransport] = useState(`${transportData[0]?.id}|0` || '');
  const [selectedMaskapai, setSelectedMaskapai] = useState('');
  const [selectedHandlingDomestik, setSelectedHandlingDomestik] = useState(handlingDomestikData[0]?.id || '');
  const [selectedManasik, setSelectedManasik] = useState(manasikData[0]?.id || '');
  const [selectedZiarah, setSelectedZiarah] = useState('');
  const [selectedKeretaCepat, setSelectedKeretaCepat] = useState('');

  // Prices and Margins
  const [maskapaiHargaApk, setMaskapaiHargaApk] = useState(16000000);
  const [maskapaiHargaVendor, setMaskapaiHargaVendor] = useState(15200000);
  
  const [asuransiHargaApk, setAsuransiHargaApk] = useState(65000);
  const [asuransiHargaVendor, setAsuransiHargaVendor] = useState(65000);
  
  const [manasikHargaApk, setManasikHargaApk] = useState(50000);
  const [manasikHargaVendor, setManasikHargaVendor] = useState(0);
  
  const [handlingDomestikHargaApk, setHandlingDomestikHargaApk] = useState(200000);
  const [handlingDomestikHargaVendor, setHandlingDomestikHargaVendor] = useState(135000);

  const [ziarahHargaApk, setZiarahHargaApk] = useState(0);
  const [ziarahHargaVendor, setZiarahHargaVendor] = useState(0);

  const [keretaCepatHargaApk, setKeretaCepatHargaApk] = useState(0);
  const [keretaCepatHargaVendor, setKeretaCepatHargaVendor] = useState(0);

  const [komisiMitra, setKomisiMitra] = useState(3000000);
  const komisiUmarohPercent = 10;
  const komisiUmaroh = komisiMitra * (komisiUmarohPercent / 100);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Helper to calculate row values
  const calculateRow = (hargaApk: number, hargaVendor: number, jamaahBayar: number, jamaahBeli: number) => {
    const estMargin = hargaApk - hargaVendor;
    const pctMargin = hargaApk > 0 ? estMargin / hargaApk : 0;
    const totalHrgJual = hargaApk * jamaahBayar;
    const totalHargaBeli = hargaVendor * jamaahBeli;
    const totalMargin = totalHrgJual - totalHargaBeli;
    return { estMargin, pctMargin, totalHrgJual, totalHargaBeli, totalMargin };
  };

  const jamaahBayar = jumlahPax;
  const jamaahBeli = jumlahPax + tl;

  const availableMadinahHotels = hotels.filter(h => h.city === 'Madinah' && getQuadPrice(h, tglKeberangkatan) !== null);
  const availableMakkahHotels = hotels.filter(h => h.city === 'Makkah' && getQuadPrice(h, tglKeberangkatan) !== null);

  const availableMaskapai = maskapaiData.filter(m => {
    let matchDate = true;
    if (tglKeberangkatan) {
      const selectedDate = new Date(tglKeberangkatan);
      const start = new Date(m.tanggalKeberangkatan);
      const end = new Date(m.tanggalKepulangan);
      
      // Check if selected date is between start and end date of the maskapai
      matchDate = selectedDate >= start && selectedDate <= end;
    }
    const matchDays = programHari ? m.programDays.toString() === programHari : true;
    return matchDate && matchDays;
  });

  useEffect(() => {
    if (selectedHotelMadinah && !availableMadinahHotels.find(h => h.id === selectedHotelMadinah)) {
      setSelectedHotelMadinah('');
    }
    if (selectedHotelMakkah && !availableMakkahHotels.find(h => h.id === selectedHotelMakkah)) {
      setSelectedHotelMakkah('');
    }
    if (selectedMaskapai && !availableMaskapai.find(m => m.id === selectedMaskapai)) {
      setSelectedMaskapai('');
    }
  }, [tglKeberangkatan, programHari]);

  useEffect(() => {
    const maskapai = maskapaiData.find(m => m.id === selectedMaskapai);
    if (maskapai) {
      setMaskapaiHargaApk(maskapai.hargaJual);
      setMaskapaiHargaVendor(maskapai.hargaBeli);
    }
  }, [selectedMaskapai]);

  useEffect(() => {
    const tier = HANDLING_TIERS.find(h => jumlahPax >= h.minPax && jumlahPax <= h.maxPax) || HANDLING_TIERS[HANDLING_TIERS.length - 1];
    if (tier) {
      setSelectedHandling(tier.minPax.toString());
    }
  }, [jumlahPax]);

  useEffect(() => {
    const handlingDomestik = handlingDomestikData.find(h => h.id === selectedHandlingDomestik);
    if (handlingDomestik) {
      setHandlingDomestikHargaApk(handlingDomestik.hargaJual);
      setHandlingDomestikHargaVendor(handlingDomestik.hargaBeli);
    }
  }, [selectedHandlingDomestik]);

  useEffect(() => {
    const manasik = manasikData.find(m => m.id === selectedManasik);
    if (manasik) {
      setManasikHargaApk(manasik.hargaJual);
      setManasikHargaVendor(manasik.hargaBeli);
    }
  }, [selectedManasik]);

  useEffect(() => {
    const ziarah = ziarahData.find(z => z.id === selectedZiarah);
    if (ziarah) {
      setZiarahHargaApk(ziarah.hargaJual);
      setZiarahHargaVendor(ziarah.hargaBeli);
    } else {
      setZiarahHargaApk(0);
      setZiarahHargaVendor(0);
    }
  }, [selectedZiarah]);

  useEffect(() => {
    const keretaCepat = keretaCepatData.find(k => k.id === selectedKeretaCepat);
    if (keretaCepat) {
      setKeretaCepatHargaApk(keretaCepat.hargaJual);
      setKeretaCepatHargaVendor(keretaCepat.hargaBeli);
    } else {
      setKeretaCepatHargaApk(0);
      setKeretaCepatHargaVendor(0);
    }
  }, [selectedKeretaCepat]);

  // Row calculations
  const maskapaiObj = maskapaiData.find(m => m.id === selectedMaskapai);
  const maskapai = calculateRow(maskapaiHargaApk, maskapaiHargaVendor, jamaahBayar, jamaahBeli);
  
  // Hotel Madinah
  const hotelMadinahObj = hotels.find(h => h.id === selectedHotelMadinah);
  const hotelMadinahHargaVendor = hotelMadinahObj ? ((getQuadPrice(hotelMadinahObj, tglKeberangkatan) || 0) * kursSaudi * malamMadinah) / 4 : 0;
  const hotelMadinahHargaApk = hotelMadinahHargaVendor * 1.12; // Example 12% markup
  const hotelMadinah = calculateRow(hotelMadinahHargaApk, hotelMadinahHargaVendor, jamaahBayar, jamaahBeli);

  // Hotel Makkah
  const hotelMakkahObj = hotels.find(h => h.id === selectedHotelMakkah);
  const hotelMakkahHargaVendor = hotelMakkahObj ? ((getQuadPrice(hotelMakkahObj, tglKeberangkatan) || 0) * kursSaudi * malamMakkah) / 4 : 0;
  const hotelMakkahHargaApk = hotelMakkahHargaVendor * 1.07; // Example 7% markup
  const hotelMakkah = calculateRow(hotelMakkahHargaApk, hotelMakkahHargaVendor, jamaahBayar, jamaahBeli);

  // Handling
  const handlingObj = HANDLING_TIERS.find(h => h.minPax.toString() === selectedHandling);
  const handlingHargaVendor = handlingObj ? (handlingObj.hpp + HANDLING_CONSTANTS.adminFee) * kursUsd : 0;
  const handlingHargaApk = handlingHargaVendor * (1 + HANDLING_CONSTANTS.defaultMarginPercent / 100);
  const handling = calculateRow(handlingHargaApk, handlingHargaVendor, jamaahBayar, jamaahBeli);

  // Equipment
  const equipmentObj = equipmentData.find(e => e.id === selectedEquipment);
  const equipmentHargaVendor = equipmentObj ? equipmentObj.basePrice : 0;
  const equipmentHargaApk = equipmentObj ? equipmentObj.roundedPrice : 0;
  const perlengkapan = calculateRow(equipmentHargaApk, equipmentHargaVendor, jamaahBayar, jamaahBeli);

  // Visa
  const visaObj = visaData.find(v => v.id === selectedVisa);
  const visaHargaVendor = visaObj ? visaObj.vendorPrice : 2301600;
  const visaHargaApk = visaObj ? visaObj.sellingPrice : 2531760;
  const visaRow = calculateRow(visaHargaApk, visaHargaVendor, jamaahBayar, jamaahBeli);

  // Transport
  const [transportId, routeIndexStr] = selectedTransport.split('|');
  const transportObj = transportData.find(t => t.id === transportId);
  const transportRoute = transportObj?.routes[Number(routeIndexStr)];
  const transportHargaVendor = transportRoute ? (transportRoute.price * kursSaudi) / (jumlahPax > 0 ? jumlahPax : 1) : 0;
  const transportHargaApk = transportHargaVendor * 1.29; // Example 29% markup
  const transportRow = calculateRow(transportHargaApk, transportHargaVendor, jamaahBayar, jamaahBeli);

  const asuransi = calculateRow(asuransiHargaApk, asuransiHargaVendor, jamaahBayar, jamaahBeli);
  const manasik = calculateRow(manasikHargaApk, manasikHargaVendor, jamaahBayar, jamaahBeli);
  const ziarah = calculateRow(ziarahHargaApk, ziarahHargaVendor, jamaahBayar, jamaahBeli);
  const keretaCepat = calculateRow(keretaCepatHargaApk, keretaCepatHargaVendor, jamaahBayar, jamaahBeli);
  const handlingDomestik = calculateRow(handlingDomestikHargaApk, handlingDomestikHargaVendor, jamaahBayar, jamaahBeli);

  // Tour Leader
  const subtotalHargaVendor = maskapaiHargaVendor + hotelMadinahHargaVendor + hotelMakkahHargaVendor + handlingHargaVendor + equipmentHargaVendor + visaHargaVendor + transportHargaVendor + asuransiHargaVendor + manasikHargaVendor + ziarahHargaVendor + keretaCepatHargaVendor + handlingDomestikHargaVendor;
  const tlHargaApk = (jumlahPax > 0 && tl > 0) ? (subtotalHargaVendor * tl) / jumlahPax : 0;
  const tlHargaVendor = 0;
  const tlRow = calculateRow(tlHargaApk, tlHargaVendor, jamaahBayar, 0); // TL doesn't have jamaah beli cost here usually, or it's distributed

  // Totals
  const totalHargaApk = maskapaiHargaApk + hotelMadinahHargaApk + hotelMakkahHargaApk + handlingHargaApk + equipmentHargaApk + visaHargaApk + transportHargaApk + asuransiHargaApk + manasikHargaApk + ziarahHargaApk + keretaCepatHargaApk + handlingDomestikHargaApk + tlHargaApk;
  const totalHargaVendor = subtotalHargaVendor + tlHargaVendor;
  const totalEstMargin = totalHargaApk - totalHargaVendor;
  const totalHrgJual = maskapai.totalHrgJual + hotelMadinah.totalHrgJual + hotelMakkah.totalHrgJual + handling.totalHrgJual + perlengkapan.totalHrgJual + visaRow.totalHrgJual + transportRow.totalHrgJual + asuransi.totalHrgJual + manasik.totalHrgJual + ziarah.totalHrgJual + keretaCepat.totalHrgJual + handlingDomestik.totalHrgJual + tlRow.totalHrgJual;
  const totalHargaBeliAll = maskapai.totalHargaBeli + hotelMadinah.totalHargaBeli + hotelMakkah.totalHargaBeli + handling.totalHargaBeli + perlengkapan.totalHargaBeli + visaRow.totalHargaBeli + transportRow.totalHargaBeli + asuransi.totalHargaBeli + manasik.totalHargaBeli + ziarah.totalHargaBeli + keretaCepat.totalHargaBeli + handlingDomestik.totalHargaBeli + tlRow.totalHargaBeli;
  const totalMarginAll = totalHrgJual - totalHargaBeliAll;

  const hargaQuadDewasa = totalHargaApk + komisiMitra + komisiUmaroh;
  const hargaTripleDewasa = 32500000;
  const hargaDoubleDewasa = 34000000;

  return (
    <div className="container mx-auto px-4 py-8 max-w-full overflow-x-auto">
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Sales Order / Quotation</h2>
          <div className="flex gap-4">
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

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-[1200px]">
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
              <tr className="bg-gray-100 border-b border-gray-400">
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
                <td className="border-r border-gray-300 p-2"></td>
                <td className="border-r border-gray-300 p-2"></td>
                <td colSpan={3} className="border-r border-gray-300 p-2 font-bold text-right italic text-gray-600">HARGA MUTAWWIF UPDATE</td>
                <td className="p-2 font-bold text-gray-600 italic">SAR{hargaMutawwifUpdate}</td>
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
                <td className="border-r border-gray-300 p-2 text-center"></td>
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
