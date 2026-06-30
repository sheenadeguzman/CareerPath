/**
 * @file ImportView.jsx
 * @description Admin page component para sa bulk import ng alumni records.
 * Nagbibigay ng drag-and-drop container para sa CSV/JSON spreadsheets at raw CSV text parser.
 * May kasamang integrity validation engine para i-audit ang rows para sa mga duplicate ID, maling email, at hindi pre-defined na program.
 */

import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, RefreshCw, Check, AlertTriangle } from 'lucide-react';
import { BSC_PROGRAMS } from '../../../bscData';

// Default na CSV template helper text na ipinapakita sa copy-paste box
const SAMPLE_CSV = `studentId,name,email,program,yearGraduated
BSC-2026-101,Ronaldo Vilas,ronaldo.vilas@example.com,Bachelor of Science in Information Technology,2026
BSC-2026-102,Sonia Lara,sonia.lara@example.com,Bachelor of Science in Hospitality Management,2026
BSC-2026-103,Manny Pac,manny.pac@example.com,Bachelor of Science in Agriculture,2026`;

/**
 * ImportView Component
 * @param {Object} props
 * @param {Function} props.onImportAlumni - Callback trigger para i-save ang bulk arrays sa database.
 * @param {Array} props.alumniList - Kasalukuyang roster ng alumni sa database para sa duplicate detection.
 */
export default function ImportView({ onImportAlumni, alumniList = [] }) {
  // Mga state sa UI para sa dragging highlight at file parsing processes
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Mensahe ng status at table preview records para sa validated lists
  const [importReport, setImportReport] = useState('');
  const [importPreview, setImportPreview] = useState([]);
  
  // Error container at textbox values
  const [importError, setImportError] = useState('');
  const [pastedText, setPastedText] = useState(SAMPLE_CSV);
  const [toastSuccess, setToastSuccess] = useState(false);
  
  // Reference hook para ma-access ang nakatagong native file input
  const fileInputRef = useRef(null);

  /** Drag and Drop Event Handlers (Mga Namamahala sa Drag/Drop Events) **/
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      simulateParsing(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      simulateParsing(files[0]);
    }
  };

  /**
   * Nagpapatunay sa isang parsed data row laban sa integrity constraints.
   * Sinusuri ang valid email regex, mga duplicate ID sa sheet o database, at mga valid na program sa BSC.
   * @param {Object} row - Parsed alumni record
   * @param {number} index - Index sa kasalukuyang upload batch
   * @param {Array} listSoFar - Buong array ng parsed rows mula sa kasalukuyang file
   * @param {Array} existingAlumni - Kasalukuyang records sa database
   * @returns {Array} Listahan ng mga warning o error alerts
   */
  const validateRow = (row, index, listSoFar, existingAlumni) => {
    const alerts = [];
    
    // 1. Email syntax check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!row.email || !emailRegex.test(row.email)) {
      alerts.push({ type: 'error', message: 'Invalid email address format' });
    }
    
    // 2. Duplicate Student ID check within current file list
    const duplicateInSheet = listSoFar.some((item, idx) => item.studentId.trim().toLowerCase() === row.studentId.trim().toLowerCase() && idx !== index);
    if (duplicateInSheet) {
      alerts.push({ type: 'error', message: 'Duplicate Student ID in this sheet' });
    }
    
    // 3. Duplicate Student ID check against database records
    const duplicateInDb = existingAlumni.some(al => al.studentId.trim().toLowerCase() === row.studentId.trim().toLowerCase());
    if (duplicateInDb) {
      alerts.push({ type: 'error', message: 'Student ID already exists in database' });
    }

    // 4. Duplicate Email check against database (warning only)
    const emailInDb = existingAlumni.some(al => al.email.trim().toLowerCase() === row.email.trim().toLowerCase());
    if (emailInDb) {
      alerts.push({ type: 'warning', message: 'Email address already exists in database' });
    }

    // 5. Degree program validation against predefined allowed list (allowing majors and abbreviations)
    const allowedPrograms = [
      'BS Information Technology', 'Bachelor of Science in Information Technology',
      'BS Hospitality Management', 'Bachelor of Science in Hospitality Management',
      'BS Elementary Education', 'Bachelor of Elementary Education',
      'BS Secondary Education', 'Bachelor of Secondary Education',
      'BS Agriculture', 'Bachelor of Science in Agriculture',
      'BS Tourism Management', 'Bachelor of Science in Tourism Management',
      'BS Industrial Technology', 'Bachelor of Science in Industrial Technology'
    ];
    const isProgramValid = allowedPrograms.some(allowed => 
      row.program && (
        row.program.trim().toLowerCase().startsWith(allowed.toLowerCase()) ||
        row.program.trim().toLowerCase().includes(allowed.toLowerCase()) ||
        allowed.toLowerCase().includes(row.program.trim().toLowerCase())
      )
    );
    if (!isProgramValid) {
      alerts.push({ type: 'warning', message: `Program is not in default BSC degree list` });
    }

    return alerts;
  };

  /**
   * Helper function para i-parse ang raw CSV string data.
   * Hinahati ang rows, nililinis ang headers, at ina-map ang mga index ng column para bumuo ng standard schema.
   * @param {string} text - Raw comma-separated values text
   * @returns {Array} Parsed object rows na tumutugma sa schema ng database
   */
  const parseCSVText = (text) => {
    // Hinahati ang teksto sa bawat linya at tinatanggal ang mga walang laman na linya
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) {
      throw new Error('CSV text has no records.');
    }

    // Nililinis ang mga header sa pamamagitan ng pagtanggal ng nakapaligid na quotes
    const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
    
    // Ina-map ang mga index ng column gamit ang regex filters
    const studentIdIdx = headers.findIndex(h => /student_?id|student/i.test(h));
    const firstNameIdx = headers.findIndex(h => /first_?name|first/i.test(h));
    const lastNameIdx = headers.findIndex(h => /last_?name|last/i.test(h));
    const nameIdx = headers.findIndex(h => /^name$|full_?name/i.test(h));
    const emailIdx = headers.findIndex(h => /email|mail/i.test(h));
    const programIdx = headers.findIndex(h => /program|course|degree/i.test(h));
    const yearIdx = headers.findIndex(h => /year_?graduated|year|graduated/i.test(h));
    const statusIdx = headers.findIndex(h => /employment_?status|status/i.test(h));

    const formatted = [];
    // Umiikot sa mga linya ng nilalaman (content lines)
    for (let i = 1; i < lines.length; i++) {
      const cols = [];
      let current = '';
      let inQuotes = false;
      const line = lines[i];
      
      // Pino-proseso ang mga column habang sinusuportahan ang quoted fields na may mga koma
      for (let cidx = 0; cidx < line.length; cidx++) {
        const char = line[cidx];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          cols.push(current.trim().replace(/^["']|["']$/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      cols.push(current.trim().replace(/^["']|["']$/g, ''));

      if (cols.length > 0 && cols[0] !== '') {
        const rowStudentId = studentIdIdx !== -1 && cols[studentIdIdx] ? cols[studentIdIdx] : `BSC-2026-${120 + i}`;
        
        const rowName = nameIdx !== -1 && cols[nameIdx] ? cols[nameIdx] : '';
        let rowFirst = firstNameIdx !== -1 && cols[firstNameIdx] ? cols[firstNameIdx] : '';
        let rowLast = lastNameIdx !== -1 && cols[lastNameIdx] ? cols[lastNameIdx] : '';

        if (rowName && !rowFirst && !rowLast) {
          const parts = rowName.trim().split(/\s+/);
          rowFirst = parts[0] || 'First';
          rowLast = parts.slice(1).join(' ') || 'Last';
        } else {
          if (!rowFirst) rowFirst = 'First';
          if (!rowLast) rowLast = 'Last';
        }

        const rowEmail = emailIdx !== -1 && cols[emailIdx] ? cols[emailIdx] : `${rowStudentId.toLowerCase()}@gmail.com`;
        const rowProg = programIdx !== -1 && cols[programIdx] ? cols[programIdx] : 'BS Information Technology';
        const rowYear = yearIdx !== -1 && cols[yearIdx] ? parseInt(cols[yearIdx]) || 2026 : 2026;
        const rowStatus = statusIdx !== -1 && cols[statusIdx] ? cols[statusIdx] : 'Unemployed';

        formatted.push({
          studentId: rowStudentId.trim(),
          firstName: rowFirst.trim(),
          lastName: rowLast.trim(),
          email: rowEmail.trim(),
          program: rowProg.trim(),
          yearGraduated: rowYear,
          employmentStatus: rowStatus.trim()
        });
      }
    }
    return formatted;
  };

  /**
   * Binabasa ang mga CSV/JSON spreadsheets, nagpapatakbo ng mga validation, at nilalagyan ang preview tables.
   * @param {File} file - Napiling file object
   */
  const simulateParsing = (file) => {
    setIsProcessing(true);
    setImportError('');
    setImportPreview([]);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result;
        let formatted = [];

        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) {
            formatted = parsed.map((item, idx) => {
              const studentId = (item.studentId || item.student_id || `BSC-2026-${120 + idx}`).trim();
              const fullNameVal = item.name || item.fullName || item.full_name || '';
              let first = item.firstName || item.first_name || '';
              let last = item.lastName || item.last_name || '';

              if (fullNameVal && !first && !last) {
                const parts = fullNameVal.trim().split(/\s+/);
                first = parts[0] || 'First';
                last = parts.slice(1).join(' ') || 'Last';
              } else {
                if (!first) first = 'First';
                if (!last) last = 'Last';
              }

              return {
                studentId,
                firstName: first.trim(),
                lastName: last.trim(),
                email: (item.email || `${studentId.toLowerCase()}@gmail.com`).trim(),
                program: (item.program || item.degree || 'BS Information Technology').trim(),
                yearGraduated: parseInt(item.yearGraduated || item.graduated || item.year) || 2026,
                employmentStatus: (item.employmentStatus || item.status || 'Unemployed').trim()
              };
            });
          } else {
            throw new Error('Selected JSON is not an array format []');
          }
        } else {
          formatted = parseCSVText(text);
        }

        // Naglalapat ng rules-based validation logic
        const dummyValidated = formatted.map((row, idx) => ({
          ...row,
          alerts: validateRow(row, idx, formatted, alumniList)
        }));

        setImportPreview(dummyValidated);
        setImportReport(`Loaded ${formatted.length} records from ${file.name}. Review integrity audit below and submit.`);
      } catch (err) {
        setImportError(err.message || 'Error occurred while loading file.');
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsText(file);
  };

  /**
   * Nag-fo-format at nagpapatunay ng teksto na direktang na-paste sa loob ng CSV input textarea
   */
  const handlePasteSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setImportError('');
    setImportPreview([]);

    // Maikling timeout para i-simulate ang parsing thread delay para sa UX feedback
    setTimeout(async () => {
      try {
        const textToParse = pastedText.trim() || SAMPLE_CSV;
        const formatted = parseCSVText(textToParse);

        const dummyValidated = formatted.map((row, idx) => ({
          ...row,
          alerts: validateRow(row, idx, formatted, alumniList)
        }));

        setImportPreview(dummyValidated);
        setImportReport(`Parsed ${formatted.length} records from pasted text. Review integrity audit below and submit.`);
      } catch (err) {
        setImportError(err.message || 'CSV Text parse failed.');
      } finally {
        setIsProcessing(false);
      }
    }, 500);
  };

  // Mga pre-calculated stats para sa validation UI indicators
  const hasErrors = importPreview.some(row => (row.alerts || []).some(a => a.type === 'error'));
  const errorCount = importPreview.reduce((acc, row) => acc + (row.alerts || []).filter(a => a.type === 'error').length, 0);
  const warningCount = importPreview.reduce((acc, row) => acc + (row.alerts || []).filter(a => a.type === 'warning').length, 0);

  return (
    <div className="space-y-6 font-sans">
      
      {/* Popup ng Toast Notification para sa tagumpay */}
      {toastSuccess && (
        <div role="alert" className="p-4 bg-emerald-50 text-emerald-950 border border-emerald-250 rounded-xl text-xs font-bold flex items-center gap-2">
          <span className="p-1 bg-[#1e4620] text-emerald-50 rounded-full"><Check className="w-3" /></span>
          {importReport}
        </div>
      )}

      {/* Mensahe ng Error (Error notification) */}
      {importError && (
        <div role="alert" className="p-4 bg-rose-50 text-rose-950 border border-rose-250 rounded-xl text-xs font-bold flex items-center gap-2 animate-pulse">
          <span className="p-1 bg-rose-800 text-rose-50 rounded-full"><AlertTriangle className="w-3 h-3" /></span>
          {importError}
        </div>
      )}

      {/* Banner ng Pagpapakilala (Intro banner) */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-100 flex flex-col justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Bulk Import Alumni Roster</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">Upload institutional spreadsheets or paste CSV values to trigger batch registration of graduates with login passwords pre-configured to their Student IDs.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Drag and Drop Container - upload section */}
        <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-100 space-y-4">
          <span className="text-xs font-bold text-[#7c191e] uppercase tracking-wider block">Excel / CSV File Upload</span>
          
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`h-56 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition ${
              isDragging ? 'bg-[#7c191e]/10 border-[#7c191e]' : 'bg-slate-50 border-slate-200 hover:bg-slate-100/50'
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".csv,.json"
              className="hidden" 
            />

            {isProcessing ? (
              <div className="space-y-3">
                <RefreshCw className="w-10 h-10 text-[#cca43b] animate-spin mx-auto" />
                <div>
                  <span className="block text-xs font-bold text-slate-700">Analyzing File Schema...</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Validating student emails and account duplicates...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <Upload className="w-10 h-10 text-slate-400 mx-auto animate-bounce" />
                <div>
                  <p className="font-bold text-slate-700">Drag &amp; drop alumni spreadsheet here</p>
                  <p className="text-slate-400 text-[10px] my-1">or click to browse local folders</p>
                </div>
                <span className="text-[9px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded font-mono font-bold uppercase">
                  Supports .CSV, .JSON
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Copy-paste Area - input section */}
        <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-100 space-y-4 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-[#7c191e] uppercase tracking-wider block">Raw Text CSV Simulation Input</span>
            <span className="block text-[10px] text-slate-450 mt-1">Alternatively, paste CSV text rows directly below:</span>
          </div>

          <div className="space-y-3">
            <textarea
              rows={6}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="studentId,firstName,lastName,email,program,yearGraduated..."
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-mono text-slate-700 focus:outline-none focus:border-[#7c191e] resize-y"
            />

            <button
              onClick={handlePasteSubmit}
              disabled={isProcessing}
              className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg transition uppercase flex items-center justify-center gap-1 shrink-0 cursor-pointer"
            >
              Parse CSV Text Rows
            </button>
          </div>
        </div>

      </div>

      {/* Live Table Preview at Button para sa Kumpirmasyon */}
      {importPreview.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-100 space-y-4 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-650 block uppercase tracking-wider">
              📋 Discovered {importPreview.length} graduate profiles:
            </span>
            
            <div className="flex items-center gap-2">
              {errorCount > 0 && (
                <span className="bg-rose-100 text-rose-805 border border-rose-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                  <AlertTriangle className="w-3 h-3 text-rose-600" /> {errorCount} Critical Errors
                </span>
              )}
              {warningCount > 0 && (
                <span className="bg-amber-100 text-amber-805 border border-amber-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-605" /> {warningCount} Warnings
                </span>
              )}
              {errorCount === 0 && warningCount === 0 && (
                <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  ✔️ All Records Valid
                </span>
              )}
              <button
                onClick={() => {
                  setImportPreview([]);
                  setImportReport('');
                }}
                className="text-rose-600 hover:underline text-[10px] font-bold ml-2 cursor-pointer"
              >
                Clear Preview
              </button>
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-hidden bg-white max-h-[260px] overflow-y-auto">
            <table className="w-full text-left text-[11px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 font-bold text-slate-400 uppercase tracking-widest text-[9px]">
                  <th className="p-2.5 pl-4">Student ID / Name</th>
                  <th className="p-2.5">Email Coordinate</th>
                  <th className="p-2.5">Degree Program</th>
                  <th className="p-2.5">Validation Audit</th>
                  <th className="p-2.5 pr-4 text-right">Grad Year</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-650">
                {importPreview.map((row, rIdx) => {
                  const hasRowErrors = (row.alerts || []).some(a => a.type === 'error');
                  return (
                    <tr key={rIdx} className={`hover:bg-slate-50/50 ${hasRowErrors ? 'bg-rose-50/20' : ''}`}>
                      <td className="p-2.5 pl-4">
                        <span className="block text-slate-800 font-extrabold">{row.firstName} {row.lastName}</span>
                        <span className="block text-[9px] text-[#7c191e] font-mono">{row.studentId}</span>
                      </td>
                      <td className="p-2.5 font-medium truncate max-w-[145px]">{row.email}</td>
                      <td className="p-2.5 font-medium break-all">{row.program}</td>
                      <td className="p-2.5">
                        {row.alerts && row.alerts.length > 0 ? (
                          <div className="space-y-0.5">
                            {row.alerts.map((alert, aIdx) => (
                              <span 
                                key={aIdx} 
                                className={`block text-[9px] px-1.5 py-0.5 rounded font-extrabold leading-tight ${
                                  alert.type === 'error' 
                                    ? 'bg-rose-50 border border-rose-100 text-rose-700' 
                                    : 'bg-amber-50 border border-amber-100 text-amber-700'
                                }`}
                              >
                                {alert.message}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-emerald-750 text-[10px] font-bold">✔️ Clean</span>
                        )}
                      </td>
                      <td className="p-2.5 pr-4 text-right font-extrabold text-slate-800">{row.yearGraduated}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="text-[10px] text-slate-400 font-bold max-w-sm">
              {hasErrors && (
                <span className="text-rose-650 flex items-center gap-1">
                  ⚠️ Import Blocked: Resolve critical database duplicates or format errors before continuing.
                </span>
              )}
            </span>
            <button
              onClick={async () => {
                if (hasErrors) {
                  alert('Roster cannot be imported. Please resolve all critical validation errors first.');
                  return;
                }
                setIsProcessing(true);
                try {
                  const cleanedRows = importPreview.map(({ alerts, ...rest }) => rest);
                  await onImportAlumni(cleanedRows);
                  setToastSuccess(true);
                  setImportReport(`SUCCESS! Batch imported ${cleanedRows.length} alumni profiles.`);
                  setTimeout(() => setToastSuccess(false), 5000);
                  setImportPreview([]);
                } catch (err) {
                  setImportError('Error saving imported records. Please re-check formatting.');
                } finally {
                  setIsProcessing(false);
                }
              }}
              disabled={hasErrors}
              className={`px-5 py-2.5 font-extrabold text-xs rounded-lg transition shadow-md uppercase cursor-pointer ${
                hasErrors 
                  ? 'bg-slate-350 text-slate-500 cursor-not-allowed shadow-none' 
                  : 'bg-[#cca43b] hover:bg-[#cca43b]/90 text-slate-900'
              }`}
            >
              Confirm Roster Import ({importPreview.length} Rows)
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
