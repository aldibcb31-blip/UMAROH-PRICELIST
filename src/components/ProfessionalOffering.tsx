import React from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface ProfessionalOfferingProps {
  data: {
    tanggalPembuatan: Date;
    namaTravel: string;
    namaMitra: string;
    jumlahPax: number;
    tourLeaderCount: number;
    jadwalKeberangkatan: string;
    program: string;
    prices: {
      maskapai: number;
      hotelMadinah: number;
      hotelMakkah: number;
      handlingSaudi: number;
      mutawif: number;
      aksesoris: number;
      addOn: number;
      visa: number;
      asuransi: number;
      handlingDomestik: number;
      tl: number;
      hargaHpp: number;
      komisiMitra: number;
      komisiUmaroh: number;
      hargaQuad: number;
      hargaTriple: number;
      hargaDouble: number;
    };
    details: {
      hotelMadinahName: string;
      hotelMakkahName: string;
      maskapaiName: string;
    };
  };
}

const formatIDR = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('Rp', 'Rp ');
};

export const ProfessionalOffering: React.FC<ProfessionalOfferingProps> = ({ data }) => {
  return (
    <div id="professional-offering" className="bg-white p-0 leading-tight text-black" style={{ width: '210mm', minHeight: '297mm', fontFamily: 'Arial, sans-serif' }}>
      {/* PAGE 1 */}
      <div className="page-1 relative p-12" style={{ height: '297mm' }}>
        {/* Header Logo */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#b59410] flex items-center justify-center text-white font-bold text-2xl border-4 border-black">
              U
            </div>
            <span className="text-4xl font-bold tracking-tight">Umaroh</span>
          </div>
          <div className="w-24 h-24 absolute top-0 right-0 overflow-hidden">
             <div className="bg-[#facc15] w-32 h-8 rotate-45 translate-x-12 -translate-y-4"></div>
             <div className="bg-[#facc15] w-32 h-4 rotate-45 translate-x-16 translate-y-2"></div>
          </div>
        </div>

        {/* Info Table */}
        <table className="w-full border-collapse border border-black mb-6 text-sm">
          <tbody>
            <tr>
              <td className="border border-black p-1 font-bold w-1/3 uppercase">Tanggal Pembuatan</td>
              <td className="border border-black p-1 font-bold">{format(data.tanggalPembuatan, 'd MMMM yyyy', { locale: id })}</td>
            </tr>
            <tr>
              <td className="border border-black p-1 font-bold uppercase">Nama Travel</td>
              <td className="border border-black p-1 font-bold uppercase">{data.namaTravel}</td>
            </tr>
            <tr>
              <td className="border border-black p-1 font-bold uppercase">Nama Mitra</td>
              <td className="border border-black p-1 font-bold uppercase">{data.namaMitra}</td>
            </tr>
            <tr>
              <td className="border border-black p-1 font-bold uppercase">Jumlah Pax</td>
              <td className="border border-black p-1 font-bold uppercase">{data.jumlahPax} PAX</td>
            </tr>
            <tr>
              <td className="border border-black p-1 font-bold uppercase">Tour Leader</td>
              <td className="border border-black p-1 font-bold uppercase">{data.tourLeaderCount} PAX</td>
            </tr>
            <tr>
              <td className="border border-black p-1 font-bold uppercase">Jadwal Keberangkatan</td>
              <td className="border border-black p-1 font-bold uppercase">{data.jadwalKeberangkatan}</td>
            </tr>
            <tr>
              <td className="border border-black p-1 font-bold uppercase">Program</td>
              <td className="border border-black p-1 font-bold uppercase">
                {data.program}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Cost Table */}
        <table className="w-full border-collapse border border-black text-sm">
          <tbody>
            <tr>
              <td className="border border-black p-2 font-bold uppercase">MASKAPAI {data.details.maskapaiName}</td>
              <td className="border border-black p-2 text-right font-medium">{formatIDR(data.prices.maskapai)}</td>
            </tr>
            <tr>
              <td className="border border-black p-2 font-bold uppercase">HOTEL MADINAH : {data.details.hotelMadinahName}</td>
              <td className="border border-black p-2 text-right font-medium">{formatIDR(data.prices.hotelMadinah)}</td>
            </tr>
            <tr>
              <td className="border border-black p-2 font-bold uppercase">HOTEL MAKKAH : {data.details.hotelMakkahName}</td>
              <td className="border border-black p-2 text-right font-medium">{formatIDR(data.prices.hotelMakkah)}</td>
            </tr>
            <tr>
              <td className="border border-black p-2 font-bold uppercase">HANDLING SAUDI FULL</td>
              <td className="border border-black p-2 text-right font-medium">{formatIDR(data.prices.handlingSaudi)}</td>
            </tr>
            <tr>
              <td className="border border-black p-2 font-bold uppercase">MUTAWIF 8 HARI</td>
              <td className="border border-black p-2 text-right font-medium">{formatIDR(data.prices.mutawif)}</td>
            </tr>
            <tr className="bg-[#f4b084]">
              <td className="border border-black p-2 font-bold uppercase">AKSESORIS</td>
              <td className="border border-black p-2 text-right font-medium">{formatIDR(data.prices.aksesoris)}</td>
            </tr>
            <tr className="bg-[#f4b084]">
              <td className="border border-black p-2 font-bold uppercase">ADD ON MUKENA /IHRAM</td>
              <td className="border border-black p-2 text-right font-medium">{formatIDR(data.prices.addOn)}</td>
            </tr>
            <tr>
              <td className="border border-black p-2 font-bold uppercase">VISA UMROH + TRANSPORTASI</td>
              <td className="border border-black p-2 text-right font-medium">{formatIDR(data.prices.visa)}</td>
            </tr>
            <tr>
              <td className="border border-black p-2 font-bold uppercase">ASURANSI ZURICH BASIC</td>
              <td className="border border-black p-2 text-right font-medium">{formatIDR(data.prices.asuransi)}</td>
            </tr>
            <tr>
              <td className="border border-black p-2 font-bold uppercase italic">HANDLING DOMESTIK FREE SNACK</td>
              <td className="border border-black p-2 text-right font-medium italic">{formatIDR(data.prices.handlingDomestik)}</td>
            </tr>
            <tr className="bg-[#00b0f0] text-black">
              <td className="border border-black p-2 font-bold uppercase">TOUR LEADER (TL)</td>
              <td className="border border-black p-2 text-right font-bold">{formatIDR(data.prices.tl)}</td>
            </tr>
            <tr className="bg-[#ffff00]">
              <td className="border border-black p-2 font-bold uppercase italic">HARGA DEWASA SEBELUM ADA KOMISI</td>
              <td className="border border-black p-2 text-right font-bold italic">{formatIDR(data.prices.hargaHpp)}</td>
            </tr>
            <tr>
              <td className="border border-black p-2 font-bold uppercase italic">KOMISI MITRA</td>
              <td className="border border-black p-2 text-right font-bold italic">{formatIDR(data.prices.komisiMitra)}</td>
            </tr>
            <tr>
              <td className="border border-black p-2 font-bold uppercase italic">KOMISI UMAROH</td>
              <td className="border border-black p-2 text-right font-bold italic">{formatIDR(data.prices.komisiUmaroh)}</td>
            </tr>
            <tr className="bg-[#ffff00]">
              <td className="border border-black p-2 font-bold uppercase italic">HARGA QUAD DEWASA SETELAH ADA KOMISI</td>
              <td className="border border-black p-2 text-right font-bold italic">{formatIDR(data.prices.hargaQuad)}</td>
            </tr>
            <tr className="bg-[#ffff00]">
              <td className="border border-black p-2 font-bold uppercase italic">HARGA TRIPLE DEWASA SETELAH ADA KOMISI</td>
              <td className="border border-black p-2 text-right font-bold italic">{formatIDR(data.prices.hargaTriple)}</td>
            </tr>
            <tr className="bg-[#ffff00]">
              <td className="border border-black p-2 font-bold uppercase italic">HARGA DOUBLE DEWASA SETELAH ADA KOMISI</td>
              <td className="border border-black p-2 text-right font-bold italic">{formatIDR(data.prices.hargaDouble)}</td>
            </tr>
          </tbody>
        </table>

        {/* Footer Watermark */}
        <div className="absolute bottom-12 left-0 right-0 flex justify-center opacity-10 pointer-events-none">
          <span className="text-8xl font-bold">Umaroh.com</span>
        </div>
      </div>

      {/* PAGE 2 */}
      <div className="page-2 relative p-12" style={{ height: '297mm' }}>
        {/* Header Logo */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#b59410] flex items-center justify-center text-white font-bold text-2xl border-4 border-black">
              U
            </div>
            <span className="text-4xl font-bold tracking-tight">Umaroh</span>
          </div>
          <div className="w-24 h-24 absolute top-0 right-0 overflow-hidden">
             <div className="bg-[#facc15] w-32 h-8 rotate-45 translate-x-12 -translate-y-4"></div>
             <div className="bg-[#facc15] w-32 h-4 rotate-45 translate-x-16 translate-y-2"></div>
          </div>
        </div>

        <div className="space-y-4 text-sm">
          <h2 className="font-bold text-lg uppercase">KETENTUAN</h2>

          <div className="border border-black overflow-hidden rounded">
            <div className="bg-[#f4b084] p-2 font-bold uppercase border-b border-black">BIAYA BELUM TERMASUK</div>
            <div className="p-4 space-y-1">
              <p>1. Passport</p>
              <p>2. Buku kuning / Suntik Meningitis</p>
              <p>3. Vaksin polio</p>
              <p>4. Perlengkapan Pribadi</p>
              <p>5. Kegiatan tambahan diluar program</p>
              <p>6. Perlengkapan full +Rp 1.000.000</p>
            </div>
          </div>

          <div className="border border-black overflow-hidden rounded">
            <div className="bg-[#f4b084] p-2 font-bold uppercase border-b border-black">KETENTUAN PAKET</div>
            <div className="p-4 space-y-1">
              <p>1. Harga Paket merupakan harga HPP minimal PAX</p>
              <p>2. Jika ada pengurangan pax, maka harga akan menyesuaikan</p>
              <p>3. Batas waktu pendaftaran Jamaah maksimal 45 hari sebelum keberangkatan</p>
              <p>4. Mitra wajib memberikan konfirmasi Margin yang akan diambil</p>
              <p>5. Jika ada kegiatan tambahan yang akan diambil diluar paket, maka Mitra wajib memberikan informasi kepada Umaroh</p>
            </div>
          </div>

          <div className="border border-black overflow-hidden rounded">
            <div className="bg-[#f4b084] p-2 font-bold uppercase border-b border-black">INFORMASI & BOOKING</div>
            <div className="p-4 space-y-2">
              <div className="flex flex-col">
                <span className="font-bold">- ILHAM FICHRI 0889-7673-6991</span>
                <span className="font-bold">- KHARINA AYU 0811-4441-592</span>
              </div>
              <p>1. Pendaftaran dapat dilakukan melalui WhatsApp kepada team Mitra Development</p>
              <p>2. Mitra wajib melakukan DP dan mengirimkan berkas Jamaah</p>
              <p>3. Semua prosedur hingga keberangkatan InsyaAllah mudah dan sudah menjadi tugas Umaroh dalam melayani Mitra dan Jamaah</p>
              <div className="mt-2">
                <span className="font-bold uppercase block">TEKNIS</span>
                <p>- Mitra mengirimkan Paspor dan dokumen pendukung milik Jamaah kepada PIC operational</p>
                <p>- Aksesoris akan dikirimkan ke kantor Mitra atau langsung ke alamat jamaah</p>
                <p>- Manasik dapat dilakukan secara online</p>
              </div>
            </div>
          </div>

          <div className="border border-black overflow-hidden rounded">
            <div className="bg-white p-2 font-bold uppercase border-b border-black">PEMBAYARAN</div>
            <div className="p-4 space-y-1">
              <p className="font-bold">PT. NAWAITUL UMRAH HAJI</p>
              <p>BANK BCA - 738 0989 918</p>
              <p>BANK BSI - 557 7775 003</p>
              <p>BANK BRI - 5951 01 000011 566</p>
              <p className="mt-4 font-bold italic">Dengan mendaftar program ini, mitra dianggap setuju dengan semua syarat dan ketentuan yang berlaku.</p>
            </div>
          </div>

          <div className="mt-8">
            <p>Prepared by : Operational</p>
          </div>
        </div>

        {/* Footer Watermark */}
        <div className="absolute bottom-12 left-0 right-0 flex justify-center opacity-10 pointer-events-none">
          <span className="text-8xl font-bold">Umaroh.com</span>
        </div>
      </div>
    </div>
  );
};
