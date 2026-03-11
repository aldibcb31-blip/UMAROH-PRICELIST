import React from 'react';
import { Phone, Mail, MapPin, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white mt-12 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-emerald-400">Indonesia Contact</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="font-semibold">Mr. Khalid</p>
                  <p className="text-gray-400 text-sm">WA: +966 536 258 731</p>
                  <p className="text-gray-400 text-sm">HP: +62 813 8987 9800</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="font-semibold">Mrs. Finyta</p>
                  <p className="text-gray-400 text-sm">WA: +62 823 3203 6100</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="font-semibold">Mr. Arya</p>
                  <p className="text-gray-400 text-sm">WA: +62 819 9994 8912</p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-1" />
              <p className="text-gray-400 text-sm">
                Gedung Citra Tower lt. 2 Unit K1<br />
                Jl. Benyamin Sueb Kab A.6<br />
                Kemayoran, Jakarta Pusat
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4 text-emerald-400">Madinah Contact</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="font-semibold">Mr. Abdul Aziz</p>
                  <p className="text-gray-400 text-sm">WA: +966 565901892</p>
                  <p className="text-gray-400 text-sm">HP: +966 536258731</p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-1" />
              <p className="text-gray-400 text-sm">
                Al-Medinah, Al-Aziziyah District<br />
                Thabet Ibn Al-Numan Street<br />
                In Front of King Abdulaziz Park (K,S,A)
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-500" />
            <a href="https://www.ptalharmain.com" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">
              www.ptalharmain.com
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-emerald-500" />
            <a href="mailto:info@ptalharmain.com" className="hover:text-emerald-400 transition-colors">
              info@ptalharmain.com
            </a>
          </div>
          <p className="text-gray-500 text-sm">
            © 2025 Alharmain Hotels Management
          </p>
        </div>
      </div>
    </footer>
  );
};
