import React from 'react';
import { Phone, Mail, MapPin, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 text-gray-800 mt-12 py-16 border-t border-gray-200">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Left Side: Logo & Description */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-amber-500 p-1.5 rounded-full">
                <div className="w-6 h-6 border-2 border-black rounded-full flex items-center justify-center font-bold text-black text-xs">U</div>
              </div>
              <span className="text-2xl font-bold tracking-tight text-black">umaroh</span>
            </div>
            <p className="text-gray-600 leading-relaxed max-w-md mb-8">
              Umaroh adalah platform digital penyedia layanan satu atap untuk bisnis perjalanan umrah. 
              Kami mengelola seluruh operasional, perjalanan, jamaah, hingga ujroh secara end-to-end 
              melalui sistem digital yang otomatis dan transparan.
            </p>
            <div className="flex flex-wrap gap-4 text-sm font-medium text-gray-700">
              <a href="#" className="hover:text-amber-600 transition-colors">Beranda</a>
              <a href="#" className="hover:text-amber-600 transition-colors">Tentang</a>
              <a href="#" className="hover:text-amber-600 transition-colors">Kemitraan</a>
              <a href="#" className="hover:text-amber-600 transition-colors">Berita</a>
              <a href="#" className="hover:text-amber-600 transition-colors">Galeri</a>
              <a href="#" className="hover:text-amber-600 transition-colors">Kontak</a>
              <a href="#" className="hover:text-amber-600 transition-colors">ULC</a>
            </div>
          </div>

          {/* Right Side: Newsletter & Addresses */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-black">Dapatkan Informasi Terbaru</h3>
            <p className="text-gray-600 text-sm mb-6">
              Bergabunglah dalam newsletter kami untuk update berita, promo, dan peluang kemitraan dari Umaroh.
            </p>
            <div className="flex gap-2 mb-8">
              <input 
                type="email" 
                placeholder="Masukkan email anda" 
                className="flex-grow bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-2 rounded-lg text-sm shadow-md transition-all">
                Subscribe
              </button>
            </div>

            <div className="space-y-4 text-sm text-gray-700">
              <div>
                <p className="font-bold text-black">Alamat Kantor (Bogor):</p>
                <p>Jl. Tangkuban Prahu No.7, RT.01/RW.03, Babakan, Kec.Bogor Tengah, Kota Bogor, Jawa Barat 16128</p>
              </div>
              <div>
                <p className="font-bold text-black">Alamat Kantor (Makassar):</p>
                <p>Jl. Andi Djemma, Metropolitan Residence Blok B3, Kel.Banta-Bantaeng, Kec.Rappocini, Kota Makassar, Sulawesi Selatan 90223</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Details from Second Image */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-t border-gray-200 mb-8">
          <div>
            <h4 className="text-emerald-600 font-bold mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4" /> Indonesia Contact
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-bold">Mr. Khalid</p>
                <p className="text-gray-500">WA: +966 536 258 731</p>
                <p className="text-gray-500">HP: +62 813 8987 9800</p>
              </div>
              <div>
                <p className="font-bold">Mrs. Finyta</p>
                <p className="text-gray-500">WA: +62 823 3203 6100</p>
              </div>
              <div>
                <p className="font-bold">Mr. Arya</p>
                <p className="text-gray-500">WA: +62 819 9994 8912</p>
              </div>
              <div className="sm:col-span-2 mt-2">
                <p className="text-gray-500 italic">Gedung Citra Tower lt. 2 Unit K1, Jl. Benyamin Sueb Kab A.6, Kemayoran, Jakarta Pusat</p>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-emerald-600 font-bold mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4" /> Madinah Contact
            </h4>
            <div className="text-sm">
              <p className="font-bold">Mr. Abdul Aziz</p>
              <p className="text-gray-500">WA: +966 565901892</p>
              <p className="text-gray-500">HP: +966 536258731</p>
              <p className="text-gray-500 mt-2 italic">Al-Medinah, Al-Aziziyah District, Thabet Ibn Al-Numan Street, In Front of King Abdulaziz Park (K,S,A)</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-amber-500" />
              <a href="https://www.ptalharmain.com" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-amber-600 transition-colors">
                www.ptalharmain.com
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-amber-500" />
              <a href="mailto:info@ptalharmain.com" className="text-sm hover:text-amber-600 transition-colors">
                info@ptalharmain.com
              </a>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 cursor-pointer transition-colors">
                <span className="text-xs font-bold">IG</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 cursor-pointer transition-colors">
                <span className="text-xs font-bold">YT</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 cursor-pointer transition-colors">
                <span className="text-xs font-bold">FB</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 cursor-pointer transition-colors">
                <span className="text-xs font-bold">WA</span>
              </div>
            </div>
            <p className="text-gray-500 text-xs">
              © 2026 Umaroh All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
