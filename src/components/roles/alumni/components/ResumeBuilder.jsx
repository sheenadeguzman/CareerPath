import React from 'react';
import { 
  Check, 
  Download, 
  Printer 
} from 'lucide-react';

export default function ResumeBuilder({
  selectedTemplate,
  setSelectedTemplate,
  cvOptions,
  setCvOptions,
  handleDownloadCV,
  handlePrintCV
}) {
  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-6 space-y-5 h-fit no-print-resume">
      <h3 className="text-xs font-extrabold text-[#7c191e] uppercase tracking-wider border-b border-slate-100 pb-2">
        Resume Builder Options
      </h3>
      
      {/* Pagpipilian ng Template (Template Selector) */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-505 uppercase tracking-wider">Select Style Template</label>
        <div className="grid grid-cols-1 gap-2">
          <button
            onClick={() => setSelectedTemplate('modern')}
            className={`w-full py-2.5 px-4 text-left rounded-lg text-xs font-bold transition flex items-center justify-between cursor-pointer ${
              selectedTemplate === 'modern' ? 'bg-[#7c191e] text-white' : 'bg-slate-50 text-slate-700 border border-slate-150 hover:bg-slate-100'
            }`}
          >
            <span>Modern Professional (Maroon Accent)</span>
            {selectedTemplate === 'modern' && <Check className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setSelectedTemplate('gold')}
            className={`w-full py-2.5 px-4 text-left rounded-lg text-xs font-bold transition flex items-center justify-between cursor-pointer ${
              selectedTemplate === 'gold' ? 'bg-[#7c191e] text-white' : 'bg-slate-50 text-slate-700 border border-slate-150 hover:bg-slate-100'
            }`}
          >
            <span>Gold Minimalist (Elegant Borders)</span>
            {selectedTemplate === 'gold' && <Check className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setSelectedTemplate('classic')}
            className={`w-full py-2.5 px-4 text-left rounded-lg text-xs font-bold transition flex items-center justify-between cursor-pointer ${
              selectedTemplate === 'classic' ? 'bg-[#7c191e] text-white' : 'bg-slate-50 text-slate-700 border border-slate-150 hover:bg-slate-100'
            }`}
          >
            <span>Classic Executive (Serif Typography)</span>
            {selectedTemplate === 'classic' && <Check className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Pagtatago o pagpapakita ng personal na impormasyon (Personal Info visibility) */}
      <div className="space-y-3 pt-3 border-t border-slate-100 text-xs font-semibold text-slate-655">
        <label className="block text-xs font-bold text-slate-505 uppercase tracking-wider">Customize Sections</label>
        
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input 
            type="checkbox"
            checked={cvOptions.showPhone}
            onChange={(e) => setCvOptions({ ...cvOptions, showPhone: e.target.checked })}
            className="rounded border-slate-300 text-[#7c191e] focus:ring-[#7c191e] w-4 h-4 cursor-pointer"
          />
          <span>Include Contact Phone Number</span>
        </label>

        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input 
            type="checkbox"
            checked={cvOptions.showCivilStatus}
            onChange={(e) => setCvOptions({ ...cvOptions, showCivilStatus: e.target.checked })}
            className="rounded border-slate-300 text-[#7c191e] focus:ring-[#7c191e] w-4 h-4 cursor-pointer"
          />
          <span>Include Civil Status</span>
        </label>

        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input 
            type="checkbox"
            checked={cvOptions.showSkills}
            onChange={(e) => setCvOptions({ ...cvOptions, showSkills: e.target.checked })}
            className="rounded border-slate-300 text-[#7c191e] focus:ring-[#7c191e] w-4 h-4 cursor-pointer"
          />
          <span>Include Skills and Certifications</span>
        </label>

        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input 
            type="checkbox"
            checked={cvOptions.showDescription}
            onChange={(e) => setCvOptions({ ...cvOptions, showDescription: e.target.checked })}
            className="rounded border-slate-300 text-[#7c191e] focus:ring-[#7c191e] w-4 h-4 cursor-pointer"
          />
          <span>Include Job Task Description</span>
        </label>

        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input 
            type="checkbox"
            checked={cvOptions.showSalary}
            onChange={(e) => setCvOptions({ ...cvOptions, showSalary: e.target.checked })}
            className="rounded border-slate-300 text-[#7c191e] focus:ring-[#7c191e] w-4 h-4 cursor-pointer"
          />
          <span>Include Monthly Income Bracket</span>
        </label>
      </div>

      {/* Button para sa pag-download at pag-print ng PDF */}
      <div className="pt-4 border-t border-slate-100 space-y-2">
        <button
          onClick={handleDownloadCV}
          className="w-full py-2.5 bg-[#cca43b] hover:bg-[#cca43b]/90 text-slate-900 font-extrabold uppercase text-xs rounded-lg transition inline-flex items-center justify-center gap-1.5 shadow-md cursor-pointer select-none"
        >
          <Download className="w-4 h-4" /> Download Resume PDF
        </button>
        <button
          onClick={handlePrintCV}
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-extrabold uppercase text-xs rounded-lg transition inline-flex items-center justify-center gap-1.5 shadow-md cursor-pointer select-none"
        >
          <Printer className="w-4 h-4" /> Open Print Settings
        </button>
      </div>
    </div>
  );
}
