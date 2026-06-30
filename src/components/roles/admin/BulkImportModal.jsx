/**
 * @file BulkImportModal.jsx
 * @description Modal dialog component para sa bulk import ng alumni records gamit ang CSV o JSON files.
 * May kasamang validation engine para i-audit ang data integrity (tulad ng duplicate checks sa DB/sheet, format checks).
 * Nag-ge-generate din ito ng temporary login credentials (temporary password na katugma ng studentId) para sa imported records.
 */

import React, { useState, useRef } from 'react';
import { FileSpreadsheet, Upload, RefreshCw, Check, X, AlertTriangle } from 'lucide-react';

/**
 * BulkImportModal Component
 * @param {Object} props
 * @param {Array} props.alumniList - Kasalukuyang roster ng alumni sa database para sa duplicate detection.
 * @param {Function} props.onImportAlumni - Callback trigger para i-save ang bulk arrays sa database.
 * @param {Function} props.setShowImportModal - State mutator para isara ang modal.
 * @param {Function} props.triggerToast - Trigger para sa pagpapakita ng toast notification.
 */
export default function BulkImportModal({ alumniList = [], onImportAlumni, setShowImportModal, triggerToast }) {
  // State para pamahalaan ang loading indicator habang isinasagawa ang import
  const [isImporting, setIsImporting] = useState(false);
  // Naglalaman ng mga parsed, formatted, at validated rows para sa table preview
  const [importPreview, setImportPreview] = useState([]);
  // Nag-a-imbak ng error messages na natagpuan habang binabasa o pino-proseso ang file
  const [importError, setImportError] = useState('');
  // Ref para sa nakatagong file input element
  const fileInputRef = useRef(null);

  /**
   * Nagpapatunay sa isang parsed row base sa syntax rules at records sa existing database.
   * @param {Object} row - Ang data ng row na naglalaman ng mga detalye ng mag-aaral.
   * @param {number} index - Index ng row sa loob ng parsed list.
   * @param {Array} listSoFar - Buong array ng parsed rows mula sa kasalukuyang file.
   * @param {Array} existingAlumni - Kasalukuyang records sa database.
   * @returns {Array} Listahan ng mga alert na may error/warning types at kaukulang mensahe.
   */
  const validateRow = (row, index, listSoFar, existingAlumni) => {
    const alerts = [];
    
    // 1. Email format check gamit ang standard email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!row.email || !emailRegex.test(row.email)) {
      alerts.push({ type: 'error', message: 'Invalid email address format' });
    }
    
    // 2. Duplicate Student ID check sa loob mismo ng uploaded sheet
    const duplicateInSheet = listSoFar.some((item, idx) => item.studentId.trim().toLowerCase() === row.studentId.trim().toLowerCase() && idx !== index);
    if (duplicateInSheet) {
      alerts.push({ type: 'error', message: 'Duplicate Student ID in this sheet' });
    }
    
    // 3. Duplicate Student ID check laban sa main database ng system
    const duplicateInDb = existingAlumni.some(al => al.studentId.trim().toLowerCase() === row.studentId.trim().toLowerCase());
    if (duplicateInDb) {
      alerts.push({ type: 'error', message: 'Student ID already exists in database' });
    }

    // 4. Duplicate Email check laban sa database (tinuturing na warning imbes na critical error)
    const emailInDb = existingAlumni.some(al => al.email.trim().toLowerCase() === row.email.trim().toLowerCase());
    if (emailInDb) {
      alerts.push({ type: 'warning', message: 'Email address already exists in database' });
    }

    // 5. Degree program validation laban sa mga pre-defined allowed lists ng BSC (kasama ang mga majors)
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
   * Event handler para sa mga file upload. Inaalam ang file format (.json o .csv),
   * binabasa ang content nang asynchronous, pino-proseso ang records, at ina-update ang preview list.
   * @param {Event} e - Input change event
   */
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError('');
    setImportPreview([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        
        let formatted = [];

        // Sumusuporta sa parehong JSON at CSV files
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) {
            // Ina-map ang mga JSON property sa mga standard field ng database
            formatted = parsed.map((item, idx) => {
              const studentId = item.studentId || item.student_id || `BSC-2026-${120 + idx}`;
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
                firstName: first,
                lastName: last,
                email: item.email || `${studentId.toLowerCase()}@gmail.com`,
                program: item.program || item.degree || 'BS Information Technology',
                yearGraduated: parseInt(item.yearGraduated || item.graduated || item.year) || 2026,
                employmentStatus: item.employmentStatus || item.status || 'Unemployed'
              };
            });
          } else {
            throw new Error('Selected JSON is not lists/array format []');
          }
        } else {
          // Pino-proseso ang mga linya ng CSV text
          const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
          if (lines.length < 2) {
            throw new Error('CSV file possesses no records or is improperly formatted');
          }

          // Nililinis ang mga header sa pamamagitan ng pagtanggal ng nakapaligid na quotes
          const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
          
          // Inaalam ang mga index ng column gamit ang case-insensitive regex tests
          const studentIdIdx = headers.findIndex(h => /student_?id|student/i.test(h));
          const firstNameIdx = headers.findIndex(h => /first_?name|first/i.test(h));
          const lastNameIdx = headers.findIndex(h => /last_?name|last/i.test(h));
          const nameIdx = headers.findIndex(h => /^name$|full_?name/i.test(h));
          const emailIdx = headers.findIndex(h => /email|mail/i.test(h));
          const programIdx = headers.findIndex(h => /program|course|degree/i.test(h));
          const yearIdx = headers.findIndex(h => /year_?graduated|year|graduated/i.test(h));
          const statusIdx = headers.findIndex(h => /employment_?status|status/i.test(h));

          // Umiikot (iterate) sa mga linya ng CSV (nilalampasan ang header)
          for (let i = 1; i < lines.length; i++) {
            const cols = [];
            let current = '';
            let inQuotes = false;
            const line = lines[i];
            
            // Pag-parse character-by-character para suportahan ang mga may quoted commas
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
              // Nag-a-apply ng fallback defaults kapag may kulang na columns
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
          if (formatted.length === 0) {
            throw new Error('Unable to extract any data rows from the CSV file.');
          }
        }

        // Pinapatakbo ang integrity validation rules para sa lahat ng loaded records
        const validatedRows = formatted.map((row, idx) => ({
          ...row,
          alerts: validateRow(row, idx, formatted, alumniList)
        }));

        setImportPreview(validatedRows);

      } catch (err) {
        console.error(err);
        setImportError(err?.message || 'Error occurred while loading/parsing the selected file.');
      }
    };
    reader.readAsText(file);
  };

  /**
   * Sine-save ang validated list ng alumni sa database.
   * Humihinto agad kung may mga hindi pa nareresolbang critical errors.
   */
  const executeBulkImport = async () => {
    if (importPreview.length === 0 || !onImportAlumni) return;
    
    // Safety check: hinaharangan ang import kung may kahit isang row na naglalaman ng critical validation error
    const hasErrors = importPreview.some(row => (row.alerts || []).some(a => a.type === 'error'));
    if (hasErrors) {
      alert('Roster cannot be imported. Please resolve all critical validation errors first.');
      return;
    }

    setIsImporting(true);
    try {
      // Tinatanggal ang temporary UI alerts field bago ipadala ang payload sa API
      const rowsToImport = importPreview.map(({ alerts, ...rest }) => rest);
      await onImportAlumni(rowsToImport);
      triggerToast(`SUCCESS! Batch imported ${importPreview.length} alumni profiles. Initial temporal accounts have been activated.`);
      setShowImportModal(false);
      setImportPreview([]);
    } catch (err) {
      alert('Error saving imported records. Please re-check the formatting.');
    } finally {
      setIsImporting(false);
    }
  };

  // Mga helper variable para bilangin ang kabuuang errors at warnings sa in-upload na dokumento
  const hasErrors = importPreview.some(row => (row.alerts || []).some(a => a.type === 'error'));
  const errorCount = importPreview.reduce((acc, row) => acc + (row.alerts || []).filter(a => a.type === 'error').length, 0);
  const warningCount = importPreview.reduce((acc, row) => acc + (row.alerts || []).filter(a => a.type === 'warning').length, 0);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in font-sans">
      <div className="bg-white w-full max-w-3xl h-full max-h-[90vh] md:h-[600px] shadow-2xl rounded-2xl overflow-hidden flex flex-col border border-slate-100 relative">
        
        {/* FIXED MODAL HEADER - Header ng modal na nakapako sa itaas */}
        <div className="sticky top-0 bg-white border-b border-slate-150 px-6 py-4 flex items-center justify-between z-10 no-print-resume">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#cca43b]" />
            <div>
              <h2 className="text-sm font-extrabold text-[#7c191e] uppercase tracking-wide">Import Alumni Roster with Integrity Validator</h2>
              <span className="block text-[10px] text-slate-400 font-bold mt-0.5">Bulk-register student credentials with automatic duplicate checks and email validation</span>
            </div>
          </div>
          <button 
            onClick={() => {
              setShowImportModal(false);
              setImportPreview([]);
              setImportError('');
            }}
            className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-lg transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SCROLLABLE MODAL BODY - Katawan ng modal na pwedeng i-scroll */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs font-semibold">
          {/* Explanatory Banner (Mga detalye tungkol sa security at credentials) */}
          <div className="bg-[#7c191e]/5 border-2 border-[#7c191e]/15 text-slate-800 p-4 rounded-xl space-y-1.5">
            <span className="font-extrabold uppercase tracking-wider text-[#7c191e] block">⚠️ Security &amp; Credentials Notice</span>
            <p className="leading-relaxed font-semibold">
              Each successfully imported graduate will be issued a temporal account. Their initial temporary login password will automatically be set to <code>bsc123</code>. They will be forced to configure their security credentials on their very first portal entrance.
            </p>
          </div>

          {/* Upload Box at File Selector */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-[#7c191e] bg-slate-50 hover:bg-[#7c191e]/5 rounded-xl p-6 text-center cursor-pointer transition space-y-2 group"
          >
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv,.json"
              className="hidden"
            />
            <Upload className="w-8 h-8 text-slate-400 group-hover:text-[#7c191e] mx-auto animate-bounce" />
            <span className="block text-slate-700 font-bold">Click to browse or drop alumni roster file here</span>
            <span className="block text-[10px] text-slate-400 font-semibold">Supports .CSV and .JSON file logs containing graduate lists</span>
          </div>

          {/* Mensahe ng Error (Error Notification) */}
          {importError && (
            <div className="p-3 bg-rose-50 text-rose-700 border border-rose-100 rounded-lg font-bold">
              {importError}
            </div>
          )}

          {/* Gabay sa inaasahang Format ng Template */}
          {importPreview.length === 0 && (
            <div className="space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-150">
              <span className="font-bold text-slate-650 block uppercase tracking-wider text-[10px]">Expected Column Fields (CSV Header):</span>
              <code className="block bg-white p-2.5 rounded border border-slate-200 text-slate-505 font-mono text-[10px] break-all select-all">
                studentId,name,email,program,yearGraduated
              </code>
              
              <div className="pt-2 flex justify-between items-center text-[10px] text-slate-400">
                <span>💡 Tip: Click below to load specimen data to preview immediately!</span>
                <button
                  type="button"
                  onClick={() => {
                    const dummy = [
                      { studentId: 'BSC-2026-191', firstName: 'Juan', lastName: 'Dela Cruz', email: 'juan.delacruz@gmail.com', program: 'BS Information Technology', yearGraduated: 2026 },
                      { studentId: 'BSC-2026-192', firstName: 'Patricia', lastName: 'Castillo', email: 'p.castillo@gmail.com', program: 'BS Hospitality Management', yearGraduated: 2026 },
                      { studentId: 'BSC-2026-193', firstName: 'Kiko', lastName: 'Basco', email: 'kiko.basco@gmail.com', program: 'BS Agriculture', yearGraduated: 2026 },
                      { studentId: 'BSC-2026-101', firstName: 'Duplicate', lastName: 'User', email: 'duplicate@gmail.com', program: 'BS Information Technology', yearGraduated: 2026 } // duplicate SID database demo
                    ];
                    // Nagdaragdag ng mga validation sa specimen data
                    const dummyValidated = dummy.map((row, idx) => ({
                      ...row,
                      alerts: validateRow(row, idx, dummy, alumniList)
                    }));
                    setImportPreview(dummyValidated);
                  }}
                  className="text-[#7c191e] hover:underline font-bold cursor-pointer"
                >
                  Load specimen data
                </button>
              </div>
            </div>
          )}

          {/* Live Table Preview at Validation Indicators */}
          {importPreview.length > 0 && (
            <div className="space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-650 block uppercase tracking-wider">
                  📋 Roster Preview ({importPreview.length} records):
                </span>
                
                <div className="flex gap-2">
                  {errorCount > 0 && (
                    <span className="bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                      <AlertTriangle className="w-3 h-3 text-rose-600" /> {errorCount} Critical Errors
                    </span>
                  )}
                  {warningCount > 0 && (
                    <span className="bg-amber-100 text-amber-805 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-605" /> {warningCount} Warnings
                    </span>
                  )}
                  {errorCount === 0 && warningCount === 0 && (
                    <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      ✔️ All Records Valid
                    </span>
                  )}

                  <button
                    onClick={() => setImportPreview([])}
                    className="text-rose-650 hover:underline text-[10px] font-bold ml-2 cursor-pointer"
                  >
                    Clear roster
                  </button>
                </div>
              </div>

              <div className="border border-slate-150 rounded-lg overflow-hidden bg-white max-h-[220px] overflow-y-auto">
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
                      const rowErrors = (row.alerts || []).filter(a => a.type === 'error');
                      const rowWarnings = (row.alerts || []).filter(a => a.type === 'warning');
                      const hasRowErrors = rowErrors.length > 0;
                      
                      return (
                        <tr key={rIdx} className={`hover:bg-slate-50/50 ${hasRowErrors ? 'bg-rose-50/20' : ''}`}>
                          <td className="p-2.5 pl-4">
                            <span className="block text-slate-800 font-extrabold">{row.firstName} {row.lastName}</span>
                            <span className="block text-[9px] text-[#7c191e] font-mono">{row.studentId}</span>
                          </td>
                          <td className="p-2.5 font-medium truncate max-w-[140px]" title={row.email}>{row.email}</td>
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
                              <span className="text-emerald-700 text-[10px] font-bold">✔️ Clean</span>
                            )}
                          </td>
                          <td className="p-2.5 pr-4 text-right font-extrabold text-slate-800">{row.yearGraduated}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* FIXED MODAL FOOTER - Footer ng modal na nakapako sa ibaba */}
        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-between z-10 no-print-resume">
          <div className="text-[10px] text-slate-400 font-bold max-w-sm">
            {hasErrors && (
              <span className="text-rose-650 flex items-center gap-1">
                ⚠️ Import Blocked: Resolve critical database duplicates or format errors before continuing.
              </span>
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setShowImportModal(false);
                setImportPreview([]);
                setImportError('');
              }}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-350 text-slate-700 font-bold rounded-lg transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={importPreview.length === 0 || isImporting || hasErrors}
              onClick={executeBulkImport}
              className={`px-4 py-2 text-white font-extrabold rounded-lg transition inline-flex items-center gap-1.5 cursor-pointer ${
                importPreview.length === 0 || hasErrors
                  ? 'bg-slate-300 cursor-not-allowed text-slate-400' 
                  : 'bg-[#7c191e] hover:bg-[#7c191e]/90 text-white shadow-md'
              }`}
            >
              {isImporting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Processing Credentials...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" /> Import &amp; Activate Temporal Accounts
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
