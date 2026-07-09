/**
 * @file EmploymentView.jsx
 * @description Dedicated view component for employment tracer analytics and employed graduate roster.
 * Nag-uugnay sa EmploymentAnalytics at EmploymentDirectory sub-components.
 */

import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { 
  Download, 
  Search,
  Compass
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

  // Ref hooks para sa pagpapakita ng Leaflet Map
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const mapLayersRef = useRef([]);

  // Tinitiyak kung ang logged-in user ay Department Chairperson para i-restrict ang scope sa program nila
  const isChairperson = activeUser?.role === 'Department Chairperson';
const isAdminOrChair = activeUser?.role === 'Administrator' || activeUser?.role === 'Super Admin' || activeUser?.role === 'Department Chairperson';


  // Awtomatikong nililimitahan ang program kung chairperson ang naka-login
  const effectiveProgram = isChairperson ? chairProgram : selectedProgram;

  // Kunin ang mga natatanging taon ng pagtatapos (Class Year) mula sa alumni list para sa dropdown options
  const graduationYears = Array.from(new Set(alumniList.map(a => a.yearGraduated.toString()))).sort();

   // Inject Leaflet CSS dynamically
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, []);
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

  
  const total = filteredAlumni.length || 1;
  const localCount = filteredAlumni.filter(a => (a.locationRegion || 'Local (Batanes)') === 'Local (Batanes)').length;
  const nationalCount = filteredAlumni.filter(a => a.locationRegion === 'National (Rest of PH)').length;
  const internationalCount = filteredAlumni.filter(a => a.locationRegion === 'International').length;

  // Initialize and update the map layers dynamically
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Leaflet map instance once
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: false,
      }).setView([20.4487, 121.9696], 11);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;

    // Clear old layers/markers
    mapLayersRef.current.forEach(layer => map.removeLayer(layer));
    mapLayersRef.current = [];

    // Coordinates and data for graduate nodes
    const graduateHotspots = [
      {
        name: 'Basco (Capital Area)',
        coords: [20.4487, 121.9696],
        count: Math.round(localCount * 0.65),
        pct: localCount > 0 ? Math.round((Math.round(localCount * 0.65) / total) * 100) : 0,
        type: 'local'
      },
      {
        name: 'Mahatao Municipality',
        coords: [20.4167, 121.9500],
        count: Math.round(localCount * 0.15),
        pct: localCount > 0 ? Math.round((Math.round(localCount * 0.15) / total) * 100) : 0,
        type: 'local'
      },
      {
        name: 'Ivana & Uyugan',
        coords: [20.3667, 121.9167],
        count: Math.round(localCount * 0.12),
        pct: localCount > 0 ? Math.round((Math.round(localCount * 0.12) / total) * 100) : 0,
        type: 'local'
      },
      {
        name: 'Sabtang Island',
        coords: [20.3333, 121.8667],
        count: Math.round(localCount * 0.05),
        pct: localCount > 0 ? Math.round((Math.round(localCount * 0.05) / total) * 100) : 0,
        type: 'local'
      },
      {
        name: 'Itbayat Island',
        coords: [20.7833, 121.8333],
        count: Math.round(localCount * 0.03),
        pct: localCount > 0 ? Math.round((Math.round(localCount * 0.03) / total) * 100) : 0,
        type: 'local'
      },
      {
        name: 'Luzon Main (incl. NCR)',
        coords: [14.5995, 120.9842],
        count: Math.round(nationalCount * 0.60),
        pct: nationalCount > 0 ? Math.round((Math.round(nationalCount * 0.60) / total) * 100) : 0,
        type: 'national'
      },
      {
        name: 'Visayas Regions (Cebu)',
        coords: [10.3157, 123.8854],
        count: Math.round(nationalCount * 0.25),
        pct: nationalCount > 0 ? Math.round((Math.round(nationalCount * 0.25) / total) * 100) : 0,
        type: 'national'
      },
      {
        name: 'Mindanao Provinces (Davao)',
        coords: [7.1907, 125.4553],
        count: Math.round(nationalCount * 0.15),
        pct: nationalCount > 0 ? Math.round((Math.round(nationalCount * 0.15) / total) * 100) : 0,
        type: 'national'
      },
      {
        name: 'ASEAN Sector (Singapore)',
        coords: [1.3521, 103.8198],
        count: Math.round(internationalCount * 0.50),
        pct: internationalCount > 0 ? Math.round((Math.round(internationalCount * 0.50) / total) * 100) : 0,
        type: 'international'
      },
      {
        name: 'Middle East Hubs (UAE)',
        coords: [25.2048, 55.2708],
        count: Math.round(internationalCount * 0.30),
        pct: internationalCount > 0 ? Math.round((Math.round(internationalCount * 0.30) / total) * 100) : 0,
        type: 'international'
      },
      {
        name: 'North America & Europe (US/EU)',
        coords: [37.0902, -95.7129],
        count: Math.round(internationalCount * 0.20),
        pct: internationalCount > 0 ? Math.round((Math.round(internationalCount * 0.20) / total) * 100) : 0,
        type: 'international'
      }
    ];

    graduateHotspots.forEach(spot => {
      if (spot.count === 0) return;

      const radiusBase = spot.type === 'local' ? 250 : spot.type === 'national' ? 45000 : 150000;
      const countWeight = Math.min(spot.count / 10, 1.5);
      
      const outerRad = radiusBase * (1.6 + countWeight);
      const midRad = radiusBase * (1.1 + countWeight);
      const cRad = radiusBase * (0.6 + countWeight);

      let outerCol = '#a7f3d0';
      let midCol = '#34d399';
      let innerCol = '#059669';

      if (spot.type === 'national') {
        outerCol = '#bae6fd';
        midCol = '#38bdf8';
        innerCol = '#0284c7';
      } else if (spot.type === 'international') {
        outerCol = '#fde68a';
        midCol = '#fbbf24';
        innerCol = '#d97706';
      }

      const cOuter = L.circle(spot.coords, {
        radius: outerRad,
        color: 'transparent',
        fillColor: outerCol,
        fillOpacity: 0.12
      }).addTo(map);

      const cMid = L.circle(spot.coords, {
        radius: midRad,
        color: 'transparent',
        fillColor: midCol,
        fillOpacity: 0.22
      }).addTo(map);

      const cInner = L.circle(spot.coords, {
        radius: cRad,
        color: 'transparent',
        fillColor: innerCol,
        fillOpacity: 0.45
      }).addTo(map);

      mapLayersRef.current.push(cOuter, cMid, cInner);

      const pinColor = spot.type === 'local' ? '#059669' : spot.type === 'national' ? '#0284c7' : '#d97706';
      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="position: relative; width: 20px; height: 20px; transform: translate(-50%, -50%);">
            <span style="position: absolute; width: 20px; height: 20px; border-radius: 50%; background: ${pinColor}; opacity: 0.4; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;" class="animate-ping"></span>
            <span style="position: absolute; left: 5px; top: 5px; width: 10px; height: 10px; border-radius: 50%; background: ${pinColor}; border: 1.5px solid #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></span>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const marker = L.marker(spot.coords, { icon: customIcon }).addTo(map);
      
      const popupContent = `
        <div style="font-family: sans-serif; font-size: 11px; padding: 4px; color: #1e293b; line-height: 1.4;">
          <strong style="color: ${pinColor}; font-size: 12px; display: block; margin-bottom: 2px;">${spot.name}</strong>
          <div>Category: <span style="text-transform: capitalize; font-weight: bold;">${spot.type} Placement</span></div>
          <div>Graduates: <strong>${spot.count} ${spot.count === 1 ? 'grad' : 'grads'}</strong> (${spot.pct}% of cohort)</div>
        </div>
      `;
      marker.bindPopup(popupContent, { closeButton: false });
      
      marker.on('mouseover', function () {
        this.openPopup();
      });
      marker.on('mouseout', function () {
        this.closePopup();
      });

      mapLayersRef.current.push(marker);
    });

  }, [filteredAlumni, localCount, nationalCount, internationalCount, total]);
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
        
         {isAdminOrChair && (
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-[#7c191e] hover:bg-[#6b1418] text-white font-extrabold text-xs rounded-lg transition inline-flex items-center gap-1.5 uppercase shadow-xs cursor-pointer select-none"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
            )}
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
      
      {/* Dynamic Geographical Map Hotspots Card */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-5 space-y-4 font-sans">
        <div className="flex justify-between items-center border-b border-slate-50 pb-2">
          <div>
            <span className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              Interactive Geographical Hotspot Locator
            </span>
            <span className="block text-[10px] text-slate-400 font-bold mt-0.5">
              Live mapping of {filteredAlumni.length} graduates showing regional placement density.
            </span>
          </div>
          <span className="text-[9.5px] bg-[#7c191e]/10 text-[#7c191e] px-2.5 py-1 rounded font-bold uppercase tracking-wider">
            Placement Density Map
          </span>
        </div>
        
        {/* Leaflet Map Div Container */}
        <div 
          ref={mapContainerRef} 
          className="h-80 w-full rounded-xl border border-slate-100/80 shadow-inner bg-slate-50 relative overflow-hidden z-10"
        />
      </div>

      <EmploymentAnalytics filteredAlumni={filteredAlumni} />
      <EmploymentDirectory filteredAlumni={filteredAlumni} />

    </div>
  );
}
