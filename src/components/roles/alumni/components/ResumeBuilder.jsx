import React, { useState } from 'react';
import { 
  Check, 
  Download, 
  FileText, 
  Image,
  Sparkles,
  RefreshCw,
  Copy,
  CheckCheck,
  X
} from 'lucide-react';
import { aiOptimizeSummary, aiGenerateCoverLetter } from '../../../../services/api';

export default function ResumeBuilder({
  selectedTemplate,
  setSelectedTemplate,
  cvOptions,
  setCvOptions,
  paperSize,
  setPaperSize,
  handleDownloadPDF,
  handleDownloadWord,
  selfEditForm,
  setSelfEditForm
}) {
  // AI State variables
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [aiSummaryResult, setAiSummaryResult] = useState('');
  const [aiSummaryError, setAiSummaryError] = useState('');
  const [showSummaryResult, setShowSummaryResult] = useState(false);

  // Cover Letter Modal states
  const [showCoverLetterModal, setShowCoverLetterModal] = useState(false);
  const [aiLetterLoading, setAiLetterLoading] = useState(false);
  const [aiLetterResult, setAiLetterResult] = useState('');
  const [aiLetterError, setAiLetterError] = useState('');
  const [targetJobTitle, setTargetJobTitle] = useState('');
  const [targetCompanyName, setTargetCompanyName] = useState('');
  const [targetJobDesc, setTargetJobDesc] = useState('');
  const [letterCopied, setLetterCopied] = useState(false);

  // Handlers
  const handleOptimizeSummary = async () => {
    setAiSummaryLoading(true);
    setAiSummaryError('');
    setAiSummaryResult('');
    setShowSummaryResult(true);
    try {
      const token = sessionStorage.getItem('careerpath_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };
      const data = await aiOptimizeSummary(selfEditForm, headers);
      if (data.success) {
        setAiSummaryResult(data.summary);
      } else {
        setAiSummaryError(data.message || 'Failed to optimize summary.');
      }
    } catch (err) {
      console.error(err);
      setAiSummaryError(err.message || 'Error occurred while communicating with Gemini.');
    } finally {
      setAiSummaryLoading(false);
    }
  };

  const applySummaryToProfile = () => {
    if (!aiSummaryResult || !setSelfEditForm) return;
    setSelfEditForm(prev => ({
      ...prev,
      aboutMe: aiSummaryResult
    }));
    setShowSummaryResult(false);
  };

  const handleGenerateCoverLetter = async (e) => {
    e.preventDefault();
    if (!targetJobTitle || !targetJobDesc) return;
    setAiLetterLoading(true);
    setAiLetterError('');
    setAiLetterResult('');
    try {
      const token = sessionStorage.getItem('careerpath_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };
      const mockJob = {
        jobTitle: targetJobTitle,
        employerName: targetCompanyName || 'Prospective Employer',
        description: targetJobDesc,
        requirements: []
      };
      const data = await aiGenerateCoverLetter(selfEditForm, mockJob, headers);
      if (data.success) {
        setAiLetterResult(data.coverLetter);
      } else {
        setAiLetterError(data.message || 'Failed to generate cover letter.');
      }
    } catch (err) {
      console.error(err);
      setAiLetterError(err.message || 'Error communicating with Gemini.');
    } finally {
      setAiLetterLoading(false);
    }
  };

  const copyCoverLetter = () => {
    if (!aiLetterResult) return;
    navigator.clipboard.writeText(aiLetterResult);
    setLetterCopied(true);
    setTimeout(() => setLetterCopied(false), 2000);
  };

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
          <button
            onClick={() => setSelectedTemplate('emerald')}
            className={`w-full py-2.5 px-4 text-left rounded-lg text-xs font-bold transition flex items-center justify-between cursor-pointer ${
              selectedTemplate === 'emerald' ? 'bg-[#7c191e] text-white' : 'bg-slate-50 text-slate-700 border border-slate-150 hover:bg-slate-100'
            }`}
          >
            <span>Emerald Corporate (Deep Green Accents)</span>
            {selectedTemplate === 'emerald' && <Check className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setSelectedTemplate('midnight')}
            className={`w-full py-2.5 px-4 text-left rounded-lg text-xs font-bold transition flex items-center justify-between cursor-pointer ${
              selectedTemplate === 'midnight' ? 'bg-[#7c191e] text-white' : 'bg-slate-50 text-slate-700 border border-slate-150 hover:bg-slate-100'
            }`}
          >
            <span>Midnight Minimal (Slate Blue Theme)</span>
            {selectedTemplate === 'midnight' && <Check className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setSelectedTemplate('charcoal')}
            className={`w-full py-2.5 px-4 text-left rounded-lg text-xs font-bold transition flex items-center justify-between cursor-pointer ${
              selectedTemplate === 'charcoal' ? 'bg-[#7c191e] text-white' : 'bg-slate-50 text-slate-700 border border-slate-150 hover:bg-slate-100'
            }`}
          >
            <span>Charcoal Clean (Modernist Layout)</span>
            {selectedTemplate === 'charcoal' && <Check className="w-4 h-4" />}
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

      {/* NEW: Gemini AI Career Assistant Section */}
      <div className="pt-4 border-t border-slate-100 space-y-3 font-sans text-left">
        <label className="block text-xs font-bold text-slate-550 uppercase tracking-wider mb-1 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          Gemini AI Career Assistant
        </label>
        
        <div className="space-y-2">
          {/* AI Optimize Profile Summary */}
          <button
            onClick={handleOptimizeSummary}
            disabled={aiSummaryLoading}
            className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white font-bold text-[10px] uppercase tracking-wide rounded-lg transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer select-none border-0"
          >
            {aiSummaryLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            AI Write "About Me" Profile
          </button>

          {/* AI Profile Summary rewrite panel */}
          {showSummaryResult && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2 mt-2">
              <div className="flex justify-between items-center text-[9px] font-extrabold text-[#7c191e] uppercase">
                <span>Suggested AI Profile Summary</span>
                <button onClick={() => setShowSummaryResult(false)} className="text-slate-400 hover:text-slate-600 border-0 bg-transparent cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </div>
              {aiSummaryLoading ? (
                <p className="text-[11px] text-slate-400 italic animate-pulse">Writing a professional profile summary for you...</p>
              ) : aiSummaryError ? (
                <p className="text-[11px] text-rose-600">{aiSummaryError}</p>
              ) : (
                <>
                  <p className="text-[11px] text-slate-600 leading-relaxed italic">"{aiSummaryResult}"</p>
                  <button
                    onClick={applySummaryToProfile}
                    className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[9.5px] font-extrabold uppercase rounded transition cursor-pointer border-0"
                  >
                    Apply to Resume &amp; Profile
                  </button>
                </>
              )}
            </div>
          )}

          {/* AI Cover Letter Generator Launcher */}
          <button
            onClick={() => setShowCoverLetterModal(true)}
            className="w-full py-2 bg-gradient-to-r from-[#7c191e] to-rose-700 hover:from-[#7c191e]/90 hover:to-rose-800 text-white font-bold text-[10px] uppercase tracking-wide rounded-lg transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer select-none border-0"
          >
            <FileText className="w-3.5 h-3.5" />
            AI Cover Letter Generator
          </button>
        </div>
      </div>

      {/* Cover Letter Builder Modal */}
      {showCoverLetterModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in no-print-resume font-sans">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-4 relative overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">AI Cover Letter Generator</h3>
              </div>
              <button onClick={() => setShowCoverLetterModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer border-0 bg-transparent">
                <X className="w-5 h-5" />
              </button>
            </div>

            {!aiLetterResult && !aiLetterLoading && (
              <form onSubmit={handleGenerateCoverLetter} className="space-y-3.5 overflow-y-auto pr-1 text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase">Target Job Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Junior Frontend Developer"
                      value={targetJobTitle}
                      onChange={(e) => setTargetJobTitle(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase">Company Name</label>
                    <input
                      type="text"
                      placeholder="e.g. TechBatanes Inc."
                      value={targetCompanyName}
                      onChange={(e) => setTargetCompanyName(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase">Job Description / Requirements</label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Paste the job description or skills required here..."
                    value={targetJobDesc}
                    onChange={(e) => setTargetJobDesc(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={aiLetterLoading}
                  className="w-full py-2.5 bg-[#7c191e] hover:bg-[#7c191e]/90 disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider rounded-lg transition flex items-center justify-center gap-2 cursor-pointer border-0"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate Custom Cover Letter
                </button>
              </form>
            )}

            {aiLetterLoading && (
              <div className="text-center py-10 space-y-3.5 flex-1 flex flex-col justify-center">
                <RefreshCw className="w-8 h-8 text-rose-700 animate-spin mx-auto" />
                <p className="text-xs text-slate-500 font-semibold animate-pulse">Drafting a tailored cover letter based on your credentials...</p>
              </div>
            )}

            {aiLetterError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs font-semibold leading-relaxed text-left">
                {aiLetterError}
              </div>
            )}

            {aiLetterResult && (
              <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
                <div className="flex-1 p-4 bg-slate-50 border border-slate-150 rounded-xl overflow-y-auto whitespace-pre-wrap text-xs text-slate-650 leading-relaxed font-sans text-left font-normal select-text">
                  {aiLetterResult}
                </div>
                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={() => setAiLetterResult('')}
                    className="text-xs text-[#7c191e] font-extrabold uppercase hover:underline cursor-pointer flex items-center gap-1 border-0 bg-transparent"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Start Over
                  </button>
                  <button
                    onClick={copyCoverLetter}
                    className="py-2 px-5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow border-0"
                  >
                    {letterCopied ? <CheckCheck className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    {letterCopied ? 'Copied!' : 'Copy Cover Letter'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
