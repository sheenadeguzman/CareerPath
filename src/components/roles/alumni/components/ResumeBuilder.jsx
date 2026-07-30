import React from 'react';
import { 
  Check, 
  Download, 
  FileText, 
  Image 
} from 'lucide-react';

export default function ResumeBuilder({
  selectedTemplate,
  setSelectedTemplate,
  cvOptions,
  setCvOptions,
  paperSize,
  setPaperSize,
  handleDownloadPDF,
  handleDownloadWord,
  selfEditForm
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
            checked={cvOptions.showPhoto}
            onChange={(e) => setCvOptions({ ...cvOptions, showPhoto: e.target.checked })}
            className="rounded border-slate-300 text-[#7c191e] focus:ring-[#7c191e] w-4 h-4 cursor-pointer"
          />
          <span>Include Profile Photo</span>
        </label>

        {cvOptions.showPhoto && !selfEditForm?.avatar && (
          <p className="text-[10px] text-amber-700 font-bold bg-amber-50 p-2 rounded-md border border-amber-200 leading-normal animate-pulse">
            ⚠️ No profile photo found. Please upload one in the "Tracer Intake Sheet" tab.
          </p>
        )}
        
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
            checked={cvOptions.showAboutMe}
            onChange={(e) => setCvOptions({ ...cvOptions, showAboutMe: e.target.checked })}
            className="rounded border-slate-300 text-[#7c191e] focus:ring-[#7c191e] w-4 h-4 cursor-pointer"
          />
          <span>Include About Me / Summary</span>
        </label>

        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input 
            type="checkbox"
            checked={cvOptions.showLanguages}
            onChange={(e) => setCvOptions({ ...cvOptions, showLanguages: e.target.checked })}
            className="rounded border-slate-300 text-[#7c191e] focus:ring-[#7c191e] w-4 h-4 cursor-pointer"
          />
          <span>Include Languages</span>
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

      {/* Pagpipilian ng Paper Size (Bond Paper Selector) */}
      <div className="space-y-2 pt-3 border-t border-slate-100">
        <label className="block text-xs font-bold text-slate-505 uppercase tracking-wider">Bond Paper Size</label>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setPaperSize('letter')}
            className={`py-2 px-1 text-center rounded-lg text-[10px] font-extrabold transition cursor-pointer select-none border ${
              paperSize === 'letter' 
                ? 'bg-[#7c191e] border-[#7c191e] text-white shadow-xs' 
                : 'bg-slate-50 text-slate-655 border-slate-150 hover:bg-slate-100'
            }`}
          >
            <div className="font-bold">Letter</div>
            <div className="text-[9px] opacity-75 font-normal">8.5" x 11"</div>
          </button>
          <button
            onClick={() => setPaperSize('a4')}
            className={`py-2 px-1 text-center rounded-lg text-[10px] font-extrabold transition cursor-pointer select-none border ${
              paperSize === 'a4' 
                ? 'bg-[#7c191e] border-[#7c191e] text-white shadow-xs' 
                : 'bg-slate-50 text-slate-655 border-slate-150 hover:bg-slate-100'
            }`}
          >
            <div className="font-bold">A4</div>
            <div className="text-[9px] opacity-75 font-normal">8.27" x 11.69"</div>
          </button>
          <button
            onClick={() => setPaperSize('legal')}
            className={`py-2 px-1 text-center rounded-lg text-[10px] font-extrabold transition cursor-pointer select-none border ${
              paperSize === 'legal' 
                ? 'bg-[#7c191e] border-[#7c191e] text-white shadow-xs' 
                : 'bg-slate-50 text-slate-655 border-slate-150 hover:bg-slate-100'
            }`}
          >
            <div className="font-bold">Legal</div>
            <div className="text-[9px] opacity-75 font-normal">8.5" x 14"</div>
          </button>
        </div>
      </div>

      {/* Mga Opsyon sa Pag-download (Download Formats Grid) */}
      <div className="pt-4 border-t border-slate-100 space-y-2">
        <label className="block text-xs font-bold text-slate-505 uppercase tracking-wider mb-1">Download Format</label>
        
        <div className="grid grid-cols-2 gap-2">
          {/* PDF Download Button */}
          <button
            onClick={handleDownloadPDF}
            className="py-2.5 bg-[#7c191e] hover:bg-[#7c191e]/90 text-white font-bold uppercase text-[10px] tracking-wide rounded-lg transition inline-flex items-center justify-center gap-1.5 shadow-xs cursor-pointer select-none border border-[#7c191e]"
          >
            <Download className="w-3.5 h-3.5" /> Export PDF
          </button>

          {/* Word Download Button */}
          <button
            onClick={handleDownloadWord}
            className="py-2.5 bg-[#7c191e] hover:bg-[#7c191e]/90 text-white font-bold uppercase text-[10px] tracking-wide rounded-lg transition inline-flex items-center justify-center gap-1.5 shadow-xs cursor-pointer select-none border border-[#7c191e]"
          >
            <FileText className="w-3.5 h-3.5" /> Export Word
          </button>
        </div>
      </div>
    </div>
  );
}
