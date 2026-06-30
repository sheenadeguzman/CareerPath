/**
 * @file EmploymentView.jsx
 * @description Dedicated view component for employment tracer analytics and employed graduate roster.
 * Nag-uugnay sa EmploymentAnalytics at EmploymentDirectory sub-components.
 */

import React, { useState } from 'react';
import { 
  Download, 
  Search 
} from 'lucide-react';
import { BSC_PROGRAMS, DEPARTMENT_TO_PROGRAMS } from '../../bscData';
import EmploymentAnalytics from './components/EmploymentAnalytics';
import EmploymentDirectory from './components/EmploymentDirectory';

export default function EmploymentView({ alumniList = [], activeUser }) {
  // --- MGA FILTERS AT SEARCH STATES ---
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedProgram, setSelectedProgram] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedRelatedness, setSelectedRelatedness] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Tinitiyak kung ang logged-in user ay Department Chairperson para i-restrict ang scope sa program nila
  const isChairperson = activeUser?.role === 'Department Chairperson';
  const chairProgram = activeUser?.program || '';

  // Awtomatikong nililimitahan ang program kung chairperson ang naka-login
  const effectiveProgram = isChairperson ? chairProgram : selectedProgram;

  // Kunin ang mga natatanging taon ng pagtatapos (Class Year) mula sa alumni list para sa dropdown options
  const graduationYears = Array.from(new Set(alumniList.map(a => a.yearGraduated.toString()))).sort();

  // --- FILTERS LOGIC ---
  const filteredAlumni = alumniList.filter(a => {
    if (!a.program) return false;
    const normalizedAl = a.program.toLowerCase();

    // 1. Kung chairperson, ipakita lang ang graduates ng kanilang departamento
    let matchesDept = true;
    if (isChairperson) {
      const normalizedChair = chairProgram.toLowerCase();
      if (normalizedAl === normalizedChair || normalizedAl.includes(normalizedChair) || normalizedChair.includes(normalizedAl)) {
        matchesDept = true;
      } else {
        const allowed = DEPARTMENT_TO_PROGRAMS[chairProgram] || [];
        matchesDept = allowed.some(allowedProg => {
          const normalizedAllowed = allowedProg.toLowerCase();
          return normalizedAl.includes(normalizedAllowed) || normalizedAllowed.includes(normalizedAl);
        });
      }
    }

    // 2. Iba pang interactive dashboard filters
    const matchesYear = selectedYear === 'All' || a.yearGraduated.toString() === selectedYear;
    const matchesProgram = isChairperson || effectiveProgram === 'All' || (
      normalizedAl === effectiveProgram.toLowerCase() ||
      normalizedAl.includes(effectiveProgram.toLowerCase()) ||
      effectiveProgram.toLowerCase().includes(normalizedAl)
    );
    
    // Status match (Employed vs Unemployed at specific types)
    let matchesStatus = true;
    if (selectedStatus === 'Employed') {
      matchesStatus = a.isRegistered && ['Employed', 'Freelance', 'Self-Employed'].includes(a.employmentStatus);
    } else if (selectedStatus === 'Unemployed') {
      matchesStatus = !a.isRegistered || a.employmentStatus === 'Unemployed';
    } else if (selectedStatus !== 'All') {
      matchesStatus = a.isRegistered && a.employmentStatus === selectedStatus;
    }

    // Relatedness match
    const matchesRelated = selectedRelatedness === 'All' || 
      (a.isRegistered && a.jobRelatedToCourse === selectedRelatedness);

    // Search query match (Pangalan, Kumpanya, Trabaho, o studentId)
    const fullName = `${a.firstName || ''} ${a.middleName || ''} ${a.lastName || ''} ${a.suffix || ''}`.toLowerCase();
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      fullName.includes(searchLower) ||
      (a.jobTitle || '').toLowerCase().includes(searchLower) ||
      (a.employerName || '').toLowerCase().includes(searchLower) ||
      a.studentId.toLowerCase().includes(searchLower);

    return matchesDept && matchesYear && matchesProgram && matchesStatus && matchesRelated && matchesSearch;
  });

  const totalInScope = filteredAlumni.length;

  // --- CSV DATA EXPORT HANDLER ---
  const handleExportCSV = () => {
    let csvHeader = 'No.,Student_ID,Full_Name,Degree_Program,Year_Graduated,Employment_Status,Job_Title,Employer_Company,Monthly_Income,Course_Relatedness,Time_To_First_Job\n';
    let csvContent = filteredAlumni.map((a, idx) => {
      const first = a.firstName || a.name?.split(' ')[0] || '';
      const last = a.lastName || a.name?.split(' ').slice(1).join(' ') || '';
      const middle = a.middleName || '';
      const suffix = a.suffix || '';
      const fullName = `${last}, ${first} ${middle} ${suffix}`.replace(/\s+/g, ' ').trim();
      const name = `"${fullName}"`;
      const isEmployed = a.isRegistered && ['Employed', 'Freelance', 'Self-Employed'].includes(a.employmentStatus);
      return `${idx + 1},"${a.studentId}",${name},"${a.program}",${a.yearGraduated},"${isEmployed ? a.employmentStatus : 'Unemployed'}","${a.jobTitle || 'N/A'}","${a.employerName || 'N/A'}","${a.monthlyIncome || 'N/A'}","${a.jobRelatedToCourse || 'N/A'}","${a.timeToFirstJob || 'N/A'}"`;
    }).join('\n');

    const blob = new Blob([csvHeader + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `BSC_Employment_Tracer_Report_${isChairperson ? (chairProgram || 'Department').replace(/\s+/g, '_') : 'BSC'}_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert(`EXPORT SUCCESS! Prepared specialized employment report spreadsheet comprising ${filteredAlumni.length} graduates.`);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. Header and Quick Actions Section */}
      <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="p-1 bg-[#7c191e]/10 text-[#7c191e] rounded text-[9px] font-extrabold uppercase tracking-widest">
              Employability Monitoring Module
            </span>
            {isChairperson && (
              <span className="p-1 bg-amber-100 text-amber-900 rounded text-[9px] font-bold uppercase tracking-wider">
                {chairProgram} Specialization Roster
              </span>
            )}
          </div>
          <h2 className="text-base font-extrabold text-slate-800 uppercase tracking-tight mt-1">Graduate Employment Analytics</h2>
          <p className="text-[11px] text-slate-450 mt-0.5">
            Actively tracking placement rates, wage indicators, and skills relevance across {totalInScope} {totalInScope <= 1 ? 'graduate' : 'graduates'}.
          </p>
        </div>
        
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-[#7c191e] hover:bg-[#6b1418] text-white font-extrabold text-xs rounded-lg transition inline-flex items-center gap-1.5 uppercase shadow-xs cursor-pointer select-none"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* 2. Filter Bar with Dynamic Inputs */}
      <div className="bg-slate-100/60 border border-slate-200/60 p-4 rounded-xl space-y-3 shadow-3xs">
        <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-700">
          
          {/* Interactive Class Year Filter */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <span className="shrink-0 text-[10px] uppercase tracking-wider text-slate-400">Class Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-white border border-slate-200 text-xs font-bold p-1.5 rounded-lg text-slate-800 cursor-pointer w-full sm:w-auto"
            >
              <option value="All">All Years</option>
              {graduationYears.map(yr => (
                <option key={yr} value={yr}>Class {yr}</option>
              ))}
            </select>
          </div>

          {/* Interactive Program Filter (Hidden for Chairperson since their view is restricted) */}
          {!isChairperson && (
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <span className="shrink-0 text-[10px] uppercase tracking-wider text-slate-400">Program:</span>
              <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="bg-white border border-slate-200 text-xs font-bold p-1.5 rounded-lg text-slate-800 cursor-pointer w-full sm:w-auto"
              >
                <option value="All">All Course Programs</option>
                {BSC_PROGRAMS.map(prog => (
                  <option key={prog} value={prog}>{prog}</option>
                ))}
              </select>
            </div>
          )}

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <span className="shrink-0 text-[10px] uppercase tracking-wider text-slate-400">Employment Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-white border border-slate-200 text-xs font-bold p-1.5 rounded-lg text-slate-800 cursor-pointer w-full sm:w-auto"
            >
              <option value="All">All Statuses</option>
              <option value="Employed">Employed (Active Placement)</option>
              <option value="Freelance">Freelance Contractual</option>
              <option value="Self-Employed">Self-Employed (Entrepreneurs)</option>
              <option value="Further Studies">Further Studies (Grad school)</option>
              <option value="Unemployed">Unemployed / No Response</option>
            </select>
          </div>

          {/* Relatedness Filter */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <span className="shrink-0 text-[10px] uppercase tracking-wider text-slate-400">Relevancy:</span>
            <select
              value={selectedRelatedness}
              onChange={(e) => setSelectedRelatedness(e.target.value)}
              className="bg-white border border-slate-200 text-xs font-bold p-1.5 rounded-lg text-slate-800 cursor-pointer w-full sm:w-auto"
            >
              <option value="All">All Alignments</option>
              <option value="Yes">Course Related</option>
              <option value="Partially">Partially Aligned</option>
              <option value="No">Non-Related Jobs</option>
            </select>
          </div>
        </div>

        {/* Search bar inside filter block */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search alumni names, job positions, corporate companies, or student IDs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200/80 rounded-lg text-xs text-slate-800 font-bold focus:ring-1 focus:ring-[#7c191e] focus:bg-white placeholder-slate-400"
          />
        </div>
      </div>

      <EmploymentAnalytics filteredAlumni={filteredAlumni} />
      <EmploymentDirectory filteredAlumni={filteredAlumni} />

    </div>
  );
}
