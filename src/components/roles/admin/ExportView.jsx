/**
 * @file ExportView.jsx
 * @description Admin page component para sa pag-export ng graduate database registry.
 * Nire-compute nito ang live database statistics (total profiles, tracer response count, placement rate)
 * at nag-ge-generate ng madodownload na files sa CSV at JSON formats.
 */

import React, { useState } from 'react';
import { Download, FileSpreadsheet, Layers, PieChart, Users, Check } from 'lucide-react';
import { BSC_PROGRAMS } from '../../../bscData';

/**
 * ExportView Component
 * Para sa pagpapakita at pag-export ng mga records ng graduates.
 * @param {Object} props
 * @param {Array} props.alumniList - Listahan ng lahat ng graduates na nasa system.
 */
export default function ExportView({ alumniList = [] }) {
  // Piliin kung anong format ang gagamitin sa pag-export ng data (csv o json)
  const [exportFormat, setExportFormat] = useState('csv');
  // State para sa pagpapakita ng notification/toast kapag nag-trigger ang download
  const [showToast, setShowToast] = useState(false);
  // Mensahe na ipapakita sa loob ng toast notification
  const [toastMessage, setToastMessage] = useState('');

  // Dito ginagawa ang mga kalkulasyon at statistical aggregations para sa dashboard cards
  const totalAlumniCount = alumniList.length;
  
  // Sinasala ang mga graduate na may email, registered na, o may trabaho para makuha ang active tracer responses
  const registeredAlumni = alumniList.filter(a => a.isRegistered || a.employmentStatus !== 'Unemployed' || a.email);
  const totalRegistered = registeredAlumni.length;
  
  // Binibilang ang mga graduates na may trabaho base sa kanilang employment status
  const employedCount = alumniList.filter(a => 
    a.employmentStatus === 'Employed' || 
    a.employmentStatus === 'Freelance' || 
    a.employmentStatus === 'Self-Employed'
  ).length;

  // Kinukuha ang porsyento ng mga may trabaho o employment rate, ginagawang 1 decimal place ang format
  const employmentRate = totalAlumniCount > 0 
    ? ((employedCount / totalAlumniCount) * 100).toFixed(1) 
    : '0.0';

  // Listahan ng mga degree programs na inaalok sa Batanes State College (BSC)
  const programs = BSC_PROGRAMS;

  // Kinakalkula ang bilang ng mga graduates kada degree program para sa progress indicators
  const programCounts = programs.map(prog => {
    const count = alumniList.filter(a => a.program === prog).length;
    return { name: prog, count };
  });

  /**
   * Nag-ge-generate ng file blob base sa napiling format (JSON/CSV),
   * gumagawa ng temporary na anchor link, tinritrigger ang click para mag-download,
   * at tinatanggal din ang link pagkatapos.
   */
  const handleExportData = () => {
    // Kapag JSON ang piniling format ng user
    if (exportFormat === 'json') {
      // Ina-convert ang buong alumniList sa pre-formatted JSON string
      const jsonContent = JSON.stringify(alumniList, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      // Gumagawa ng tagong link elements sa DOM para sa auto-download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'BSC_Graduate_Tracer_Registry_2026.json');
      document.body.appendChild(link);
      link.click(); // Auto-click para magsimula ang download
      document.body.removeChild(link); // Nililinis ang DOM pagkatapos mag-download

      // Nagpapakita ng success toast notification
      setToastMessage('SUCCESS! Downloaded database registry as JSON.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000); // Mawawala ang toast pagkatapos ng 4 na segundo
    } else if (exportFormat === 'ched-gts') {
      // Direct CHED GTS columns matching typical Commission on Higher Education guidelines
      let csvHeader = 'No.,Student_ID,Last_Name,First_Name,Middle_Name,Email_Address,Contact_Number,Address,Location_Region,Degree_Completed,Year_Graduated,License_Passed,Employment_Status,Employment_Type,Job_Title,Employer_Name,Sector,Monthly_Income,Is_Job_Related_To_Course,Time_To_First_Job,Skills\n';
      
      let csvContent = alumniList.map((a, idx) => {
        const first = a.firstName || a.name?.split(' ')[0] || '';
        const last = a.lastName || a.name?.split(' ').slice(1).join(' ') || '';
        const middle = ''; // Fallback for Middle Name
        const skillsStr = (a.skills || []).join('; ');
        
        return `${idx + 1},"${a.studentId}","${last}","${first}","${middle}","${a.email || ''}","${a.phone || ''}","${a.address || 'Basco, Batanes'}","${a.locationRegion || 'Local (Batanes)'}","${a.program || ''}",${a.yearGraduated || 2026},"${a.professionalExamPassed || 'None'}","${a.employmentStatus || 'Unemployed'}","${a.employmentType || 'None'}","${a.jobTitle || ''}","${a.employerName || ''}","${a.sector || 'N/A'}","${a.monthlyIncome || ''}","${a.jobRelatedToCourse || 'No'}","${a.timeToFirstJob || ''}","${skillsStr}"`;
      }).join('\n');

      const blob = new Blob([csvHeader + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'BSC_GTS_Tracer_Report_2026.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Nagpapakita ng success toast notification para sa CHED GTS
      setToastMessage('SUCCESS! Downloaded official GTS Tracer Packet.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    } else {
      // Kapag naman CSV ang napiling format
      // Gumagawa ng header para sa CSV format
      let csvHeader = 'StudentID,FirstName,LastName,Email,Program,YearGraduated,EmploymentStatus,Company,JobTitle\n';
      // Binabasa ang bawat alumni record at ginagawang CSV row entry
      let csvContent = alumniList.map(a => {
        const first = a.firstName || a.name?.split(' ')[0] || '';
        const last = a.lastName || a.name?.split(' ').slice(1).join(' ') || '';
        return `"${a.studentId}","${first}","${last}","${a.email || ''}","${a.program || ''}",${a.yearGraduated || 2026},"${a.employmentStatus || 'Unemployed'}","${a.employerName || ''}","${a.jobTitle || ''}"`;
      }).join('\n');

      const blob = new Blob([csvHeader + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      // Gumagawa ng temporary link sa DOM para sa CSV download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'BSC_Graduate_Tracer_Registry_2026.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Nagpapakita ng success toast notification para sa CSV
      setToastMessage('SUCCESS! Downloaded database registry as CSV.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Toast popup notification para sa download feedback */}
      {showToast && (
        <div role="alert" className="p-4 bg-emerald-50 text-emerald-950 border border-emerald-250 rounded-xl text-xs font-bold flex items-center gap-2 animate-bounce">
          <span className="p-1 bg-[#1e4620] text-emerald-50 rounded-full"><Check className="w-3" /></span>
          {toastMessage}
        </div>
      )}

      {/* Intro banner na naglalarawan sa gamit ng page */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-100">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Export Database Registry</h2>
        <p className="text-[11px] text-slate-400 mt-0.5">Download full graduate reports and tracer registers. Select output formats and review real-time database scopes before extraction.</p>
      </div>

      {/* Hilera ng mga kard para sa live stats (Total Registered, Responses, Placement Rate) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-5 rounded-xl border border-emerald-150 flex items-center justify-between shadow-xs hover:shadow-sm transition">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-800">Total Registered Profiles</span>
            <span className="block text-2xl font-black text-slate-900">{totalAlumniCount}</span>
          </div>
          <Users className="w-8 h-8 text-emerald-700 opacity-60" />
        </div>

        <div className="bg-gradient-to-br from-[#7c191e]/5 to-[#7c191e]/10 p-5 rounded-xl border border-[#7c191e]/15 flex items-center justify-between shadow-xs hover:shadow-sm transition">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#7c191e]">Active Tracer Response</span>
            <span className="block text-2xl font-black text-slate-900">{totalRegistered}</span>
          </div>
          <Layers className="w-8 h-8 text-[#7c191e] opacity-60" />
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 p-5 rounded-xl border border-amber-150 flex items-center justify-between shadow-xs hover:shadow-sm transition">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-800">Overall Placement Rate</span>
            <span className="block text-2xl font-black text-slate-900">{employmentRate}%</span>
          </div>
          <PieChart className="w-8 h-8 text-amber-700 opacity-60" />
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Kard na nagpapakita ng dami ng graduate kada degree program gamit ang progress bar */}
        <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-100 md:col-span-2 space-y-4">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Program Database Volumes</span>
          
          <div className="space-y-3.5">
            {programCounts.map((prog, idx) => {
              const pct = totalAlumniCount > 0 ? (prog.count / totalAlumniCount) * 100 : 0;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center text-[11px] font-bold text-slate-650">
                    <span>{prog.name}</span>
                    <span>{prog.count} graduates ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#7c191e] h-full rounded-full transition-all duration-550"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Kard para sa pagpili ng format at action button para mag-download ng registry */}
        <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-100 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="text-xs font-bold text-[#7c191e] uppercase tracking-wider block">Export Parameters</span>
            
            <div className="space-y-2">
              <label htmlFor="format-select" className="block text-[10px] font-bold uppercase text-slate-400">File Output Format</label>
              <select
                id="format-select"
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-750 focus:outline-none focus:border-[#7c191e]"
              >
                <option value="csv">Standard CSV Table Spreadsheet (.csv)</option>
                <option value="json">Structured JSON Document (.json)</option>
                <option value="ched-gts">Direct CHED GTS Template (Spreadsheet) (.csv)</option>
              </select>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-150 text-[10px] font-semibold text-slate-500 space-y-1.5">
              <span className="font-extrabold uppercase text-slate-600 block">Output Specifications:</span>
              <p>• File name: <span className="font-mono text-slate-800 font-bold">{
                exportFormat === 'json' 
                  ? 'BSC_Graduate_Tracer_Registry.json' 
                  : exportFormat === 'ched-gts'
                    ? 'BSC_CHED_GTS_Tracer_Report.csv'
                    : 'BSC_Graduate_Tracer_Registry.csv'
              }</span></p>
              <p>• Comma separated variables encoding</p>
              <p>• Clean UTF-8 text formatting for compatibility with MS Excel & Google Sheets</p>
              <p>• Includes full demographic metrics and tracer statuses</p>
            </div>
          </div>

          <button
            onClick={handleExportData}
            className="w-full py-3 bg-[#7c191e] hover:bg-[#7c191e]/90 text-white font-extrabold text-xs rounded-lg transition uppercase flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
          >
            <Download className="w-4 h-4" /> Download Registry File
          </button>
        </div>

      </div>

    </div>
  );
}
