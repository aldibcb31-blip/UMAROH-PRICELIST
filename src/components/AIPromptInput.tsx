import React, { useState } from 'react';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface AIPromptInputProps {
  onApply: (data: any) => void;
  currentData: any;
  context: string;
  masterData?: any;
}

export const AIPromptInput: React.FC<AIPromptInputProps> = ({ onApply, currentData, context, masterData }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const currentDate = new Date().toISOString().split('T')[0];
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `
          Context: You are an assistant for a travel agency app called "Umaroh".
          Current Date: ${currentDate}
          Task: Modify the current ${context} data based on the user's prompt.
          
          Current Data (State): ${JSON.stringify(currentData)}
          
          ${masterData ? `Available Master Data (Database): ${JSON.stringify(masterData)}` : ''}
          
          User Prompt: "${prompt}"
          
          Instructions:
          1. Use the "Available Master Data" to find correct IDs, names, or values if the user refers to them.
          2. If the user mentions a month (e.g., "Juni", "Juli", "June", "July"), pick a representative date in that month (e.g., the 15th) and update the corresponding date field in the state (e.g., "selectedDate" or "tglKeberangkatan").
          3. If the user asks to "show data" or "tampilkan data" for a specific time/month, you should:
             a. Set the date field to that month (e.g., "selectedDate" or "tglKeberangkatan").
             b. If the context is "Hotel Template", populate the rows with relevant items from the master data for the current city.
             c. If the context is "Sales Order" or "Price UST" (Quotation), select appropriate hotels for BOTH Madinah and Makkah. For "Price UST", populate the "rows" array with pairs of Madinah and Makkah hotels from the master data.
          4. IMPORTANT: When picking a date for a month, look at the "seasons" ranges in the master data. Pick a date that falls within a valid season range for as many items as possible. If the database has data for the middle of the month, use that date.
          5. Return ONLY a JSON object representing the updated data. Do not include any other text or markdown formatting.
          6. Ensure the structure matches the "Current Data" exactly.
        `,
      });
      
      const text = response.text;
      if (!text) throw new Error('No response from AI');
      
      const cleanedText = text.replace(/```json|```/g, '').trim();
      const updatedData = JSON.parse(cleanedText);
      onApply(updatedData);
      setPrompt('');
    } catch (error) {
      console.error('AI Error:', error);
      alert('Gagal memproses prompt. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 shadow-sm print:hidden">
      <div className="flex items-center gap-2 mb-3 text-amber-800 font-bold">
        <Sparkles className="w-5 h-5" />
        <span>AI Assistant - {context}</span>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={`Contoh: "Set hotel Madinah ke Hilton" atau "Ubah pax ke 40"...`}
          className="flex-grow bg-white border border-amber-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !prompt.trim()}
          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          <span className="hidden sm:inline">Kirim</span>
        </button>
      </div>
    </div>
  );
};
