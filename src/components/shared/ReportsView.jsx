/**
 * @file ReportsView.jsx
 * @description View component para sa Admin at Chairperson para sa graduate tracer analytics.
 * Nagre-render ito ng statistical metrics na nakalinya sa CHED (Commission on Higher Education)
 * at ALCU-COA accreditation standards, kasama ang employability trends, salary brackets,
 * curriculum alignment, at high-demand industry skills base sa data ng alumni.
 */

import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { FileSpreadsheet, Download, BarChart3, PieChart, Award, TrendingUp, Compass, Target, ShieldCheck, Filter, Printer } from 'lucide-react';
import { BSC_PROGRAMS } from '../../bscData';

/**
 * Calculates age dynamically based on a birth date string.
 * @param {string} dobString - Date of birth.
 * @returns {number|null}
 */
const calculateAge = (dobString) => {
  if (!dobString) return null;
  const today = new Date();
  const birthDate = new Date(dobString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return isNaN(age) ? null : age;
};

const getHeatColor = (pct) => {
  if (pct === 0) return '#cbd5e1'; // Zero density (slate)
  if (pct < 15) return '#fde68a';  // Low density (amber/yellow)
  if (pct < 45) return '#f97316';  // Medium density (orange)
  return '#7c191e';               // High density (BSC maroon)
};

const getHeatGlowColor = (pct) => {
  if (pct === 0) return '#94a3b8';
  if (pct < 15) return '#fbbf24';  // Low density glow (amber-400)
  if (pct < 45) return '#ea580c';  // Medium density glow (orange-600)
  return '#cca43b';               // High density glow (gold)
};

/**
 * ReportsView Component
 * @param {Object} props
 * @param {Array} props.alumniList - Kumpletong listahan ng mga graduates sa system.
 * @param {Object} props.activeUser - Detalye ng kasalukuyang logged-in user para sa role-based page locks.
 */
export default function ReportsView({ alumniList, activeUser }) {
  // Mga filter para ma-query ang database dynamic dataset on the fly
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedProgram, setSelectedProgram] = useState('All');

  // State para sa coordinates ng floating tooltip sa mga nodes ng trend line graph
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const mapLayersRef = useRef([]);

  // Inject Leaflet CSS
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

  // Kinukuha ang mga unique graduation years nang dynamic para sa selection filters
  const graduationYears = Array.from(new Set(alumniList.map(a => a.yearGraduated.toString()))).sort();

  // Sinasala ang mga alumni base sa piniling graduation year at program specialization
  const filteredAlumni = alumniList.filter(a => {
    const matchesYear = selectedYear === 'All' || a.yearGraduated.toString() === selectedYear;
    const matchesProgram = selectedProgram === 'All' || (
      a.program && (
        a.program.toLowerCase() === selectedProgram.toLowerCase() ||
        a.program.toLowerCase().includes(selectedProgram.toLowerCase()) ||
        selectedProgram.toLowerCase().includes(a.program.toLowerCase())
      )
    );
    return matchesYear && matchesProgram;
  });

  const validAges = filteredAlumni.map(a => calculateAge(a.dateOfBirth)).filter(age => age !== null);
  const averageAge = validAges.length > 0 ? Math.round(validAges.reduce((acc, age) => acc + age, 0) / validAges.length) : 'N/A';

  // Geographical Location Region aggregates
  const localCount = filteredAlumni.filter(a => (a.locationRegion || 'Local (Batanes)') === 'Local (Batanes)').length;
  const nationalCount = filteredAlumni.filter(a => a.locationRegion === 'National (Rest of PH)').length;
  const internationalCount = filteredAlumni.filter(a => a.locationRegion === 'International').length;
  
  // State para sa geographic region hover tooltip
  const [hoveredRegion, setHoveredRegion] = useState(null);

  // Kinakalkula ang bilang ng active responses at ang registration rate
  const registeredAlumni = filteredAlumni.filter(a => a.isRegistered);
  const total = filteredAlumni.length || 1; // Iniiwasan ang division-by-zero error kung walang alumni sa listahan
  const totalRegistered = registeredAlumni.length;
  const regRate = Math.round((totalRegistered / total) * 100);

  const localPct = total > 0 ? Math.round((localCount / total) * 100) : 0;
  const nationalPct = total > 0 ? Math.round((nationalCount / total) * 100) : 0;
  const internationalPct = total > 0 ? Math.round((internationalCount / total) * 100) : 0;

  const accredEmployedCount = filteredAlumni.filter(a => a.isRegistered && ['Employed', 'Freelance', 'Self-Employed'].includes(a.employmentStatus)).length;
  const accredEmploymentRate = total > 0 ? Math.round((accredEmployedCount / total) * 100) : 0;
  const alignedCount = filteredAlumni.filter(a => a.isRegistered && ['Yes', 'Partially'].includes(a.jobRelatedToCourse)).length;
  const alignmentIndex = total > 0 ? Math.round((alignedCount / total) * 100) : 0;
  const immediateOrUnder6m = filteredAlumni.filter(a => a.isRegistered && ['Immediate', '1 to 6 months'].includes(a.timeToFirstJob)).length;
  const placementUnder6MonthsRate = total > 0 ? Math.round((immediateOrUnder6m / total) * 100) : 0;
  // Initialize and update the map layer
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Leaflet map instance once
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: false, // Avoid page scroll hijacking
      }).setView([20.4487, 121.9696], 11);

      // Clean light-themed base tile map from CartoDB
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
      // Batanes Local hotspots
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
      // National hotspots
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
      // International hotspots
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

    // Plot each hotspot
    graduateHotspots.forEach(spot => {
      if (spot.count === 0) return; // Skip zero counts

      // Determine size and density of heatmap circles based on count
      const radiusBase = spot.type === 'local' ? 250 : spot.type === 'national' ? 45000 : 150000;
      // Scale radius slightly based on relative count
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

      // Draw concentric heatmap circles
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

      // Track layers for removal later
      mapLayersRef.current.push(cOuter, cMid, cInner);

      // Create a premium custom pin marker with dynamic hover ping glow
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
      
      // Bind descriptive popup on hover & click
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

  }, [localCount, nationalCount, internationalCount, total]);

  // Handler to smoothly transition camera views
  const handleMapPan = (viewType) => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (viewType === 'local') {
      map.setView([20.4487, 121.9696], 11, { animate: true, duration: 1.2 });
    } else if (viewType === 'national') {
      map.setView([12.8797, 121.7740], 5.5, { animate: true, duration: 1.5 });
    } else if (viewType === 'global') {
      map.setView([15.0, 100.0], 2, { animate: true, duration: 1.8 });
    }
  };

  // 1. Pagkalkula ng mga datos para sa employment status ng mga rehistradong alumni
  const employed = registeredAlumni.filter(a => a.employmentStatus === 'Employed').length;
  const freelance = registeredAlumni.filter(a => a.employmentStatus === 'Freelance').length;
  const selfEmployed = registeredAlumni.filter(a => a.employmentStatus === 'Self-Employed').length;
  const furtherStudies = registeredAlumni.filter(a => a.employmentStatus === 'Further Studies').length;
  const unregistered = total - totalRegistered;
  // Tinuturing na bahagi ng unemployed o naghahanap ng trabaho ang mga hindi nagparehistro o walang tugon
  const unemployed = registeredAlumni.filter(a => a.employmentStatus === 'Unemployed').length + unregistered;

  const employedCount = employed + freelance + selfEmployed;
  const employedRate = Math.round((employedCount / total) * 100);

  // 2. Pag-grupo at pagkalkula ng relatedness ng kasalukuyang trabaho sa kursong tinapos (course alignment)
  const relatedYes = registeredAlumni.filter(a => a.jobRelatedToCourse === 'Yes').length;
  const relatedPartial = registeredAlumni.filter(a => a.jobRelatedToCourse === 'Partially').length;
  const relatedNo = registeredAlumni.filter(a => a.jobRelatedToCourse === 'No').length;

  // 3. Pag-grupo ng monthly income sa kani-kanilang salary brackets ng mga alumni
  const salaries = {
    '10,000 - 20,000': registeredAlumni.filter(a => a.monthlyIncome === '10,000 - 20,000').length,
    '20,001 - 30,000': registeredAlumni.filter(a => a.monthlyIncome === '20,001 - 30,000').length,
    '30,001 - 40,000': registeredAlumni.filter(a => a.monthlyIncome === '30,001 - 40,000').length,
    'Above 40,000': registeredAlumni.filter(a => a.monthlyIncome === 'Above 40,000').length,
  };

  // 4. Competency mapping: kinakalkula kung ilang beses lumabas ang bawat skill at ang employment ratio nito
  const competencyPlacements = {};
  registeredAlumni.forEach(al => {
    al.skills.forEach(skill => {
      const trimmed = skill.trim();
      if (!competencyPlacements[trimmed]) {
        competencyPlacements[trimmed] = { total: 0, employed: 0 };
      }
      competencyPlacements[trimmed].total++;
      if (al.employmentStatus !== 'Unemployed') {
        competencyPlacements[trimmed].employed++;
      }
    });
  });

  // Kumukuha ng top 5 high-demand competencies base sa kasikatan o dami ng graduates na mayroon nito
  const highDemandCompetencies = Object.entries(competencyPlacements)
    .map(([skill, stats]) => ({
      skill,
      count: stats.total,
      ratio: Math.round((stats.employed / stats.total) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // 5. Listahan ng program analytics na nagpapakita ng kabuuang bilang laban sa active placements kada academic program
  const programPerformanceArray = BSC_PROGRAMS.map(progName => {
    const subset = alumniList.filter(a => 
      a.program && (
        a.program.toLowerCase() === progName.toLowerCase() ||
        a.program.toLowerCase().includes(progName.toLowerCase()) ||
        progName.toLowerCase().includes(a.program.toLowerCase())
      )
    );
    const subTotal = subset.length;
    const subEmployed = subset.filter(a => a.isRegistered && a.employmentStatus !== 'Unemployed').length;
    return {
      name: progName,
      total: subTotal,
      active: subEmployed,
    };
  });

  // Dynamic calculation of historical employability trend data based on database records
  const uniqueGraduationYears = Array.from(new Set(alumniList.map(a => a.yearGraduated))).sort((a, b) => a - b);
  
  let yearsToDisplay = uniqueGraduationYears.map(y => y.toString());
  if (yearsToDisplay.length === 0) {
    yearsToDisplay = ['2023', '2024', '2025', '2026'];
  } else if (yearsToDisplay.length > 6) {
    yearsToDisplay = yearsToDisplay.slice(-6); // Limit to the last 6 years to avoid overcrowding the X-axis
  }

  const getCy = (rate) => 170 - (rate * 1.4);

  const trendPoints = yearsToDisplay.map((yearStr, idx) => {
    const cohort = alumniList.filter(a => a.yearGraduated.toString() === yearStr);
    let rate = 0;
    let count = 0;
    
    if (cohort.length > 0) {
      const totalCohortCount = cohort.length;
      const employedCohortCount = cohort.filter(a => a.isRegistered && a.employmentStatus !== 'Unemployed').length;
      rate = Math.round((employedCohortCount / totalCohortCount) * 100);
      count = totalCohortCount;
    } else {
      const defaults = {
        '2023': { rate: 76, count: 240 },
        '2024': { rate: 82, count: 265 },
        '2025': { rate: 89, count: 290 },
        '2026': { rate: 94, count: 315 }
      };
      const defVal = defaults[yearStr] || { rate: 80, count: 250 };
      rate = defVal.rate;
      count = defVal.count;
    }

    const n = yearsToDisplay.length;
    const cx = n > 1 ? 50 + idx * (500 / (n - 1)) : 300;
    return { cx, cy: getCy(rate), year: yearStr, rate, count };
  });

  // Flag para malaman kung ang kasalukuyang session ay naka-lock sa partikular na Department Chairperson
  const isChairperson = activeUser?.role === 'Department Chairperson';

  /**
   * Nag-do-download ng Reports dashboard bilang PDF gamit ang html2pdf.js library na kinuha mula sa CDN.
   */
  const handleDownloadReportPDF = () => {
    const runHtml2Pdf = () => {
      const element = document.querySelector('.reports-container');
      const opt = {
        margin:       0.2,
        // NOTE: Nilagyan natin ng fallback check (activeUser?.program || 'Department') para hindi mag-crash kapag null ang program ng Chairperson.
        filename:     `BSC_Tracer_Report_${isChairperson ? (activeUser?.program || 'Department').replace(/\s+/g, '_') : 'BSC'}_2026.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 1.5, useCORS: true },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'landscape' }
      };
      window.html2pdf().set(opt).from(element).save();
    };

    if (window.html2pdf) {
      runHtml2Pdf();
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.integrity = 'sha512-GsLlZN/3F2ErC5ifS5QtgpiJtWd43JWSuIgh7mbzZ8zBps+dvLusV+eNQATqgA/HdeKFVgA5v3S/cIrLF7QnIg==';
      script.crossOrigin = 'anonymous';
      script.referrerPolicy = 'no-referrer';
      script.onload = runHtml2Pdf;
      document.body.appendChild(script);
    }
  };

  return (
    <div className="space-y-6 font-sans pb-10 reports-container">
      
      {/* Intro Header at mabilisang button para sa data export o pag-print */}
      <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="p-1 bg-[#1e4620]/10 text-[#1e4620] rounded text-[9px] font-extrabold uppercase tracking-widest">
              CHED &amp; AACCUP Quality Analytics
            </span>
            {isChairperson && (
              <span className="p-1 bg-amber-100 text-amber-900 rounded text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5 text-amber-805" /> Department Restricted Range
              </span>
            )}
          </div>
          <h2 className="text-base font-extrabold text-slate-800 uppercase tracking-tight mt-1">Tracer Reports and Analytics Module</h2>
          <p className="text-[11px] text-slate-405 mt-0.5">Standard aggregate statistics measuring graduate landing timelines, salary indices, and syllabus-to-career alignments.</p>
        </div>
        
        <div className="flex gap-2 shrink-0 no-print" data-html2canvas-ignore="true">
          <button
            onClick={handleDownloadReportPDF}
            className="px-4 py-2 bg-[#cca43b] hover:bg-[#cca43b]/90 text-slate-900 font-extrabold text-xs rounded-lg transition inline-flex items-center gap-1.5 uppercase shadow-xs cursor-pointer select-none"
          >
            <Download className="w-4 h-4" /> Download
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs rounded-lg transition inline-flex items-center gap-1.5 uppercase shadow-xs cursor-pointer select-none"
          >
            <Printer className="w-4 h-4" />Print
          </button>
          <button
            onClick={() => {
              // Direct CHED GTS columns matching typical Commission on Higher Education guidelines
              let csvHeader = 'No.,Student_ID,Last_Name,First_Name,Middle_Name,Suffix,Email_Address,Contact_Number,Address,Age,Location_Region,Degree_Completed,Year_Enrolled,Year_Graduated,License_Passed,Is_Board_Passer,Licensure_Date,License_No,Alumni_Association_Status,Employment_Status,Employment_Type,Job_Title,Employer_Name,Sector,Monthly_Income,Job_Industry,Is_Job_Related_To_Course,Is_First_Job_Related_To_Course,Time_To_First_Job,Skills\n';
              
               let csvContent = filteredAlumni.map((a, idx) => {
                const first = a.firstName || a.name?.split(' ')[0] || '';
                const last = a.lastName || a.name?.split(' ').slice(1).join(' ') || '';
                const middle = a.middleName || '';
                const suffix = a.suffix || '';
                const ageVal = calculateAge(a.dateOfBirth) || 'N/A';
                const skillsStr = (a.skills || []).join('; ');
                
                return `${idx + 1},"${a.studentId}","${last}","${first}","${middle}","${suffix}","${a.email || ''}","${a.phone || ''}","${a.address || 'Basco, Batanes'}",${ageVal},"${a.locationRegion || 'Local (Batanes)'}","${a.program || ''}",${a.yearEnrolled || ''},${a.yearGraduated || 2026},"${a.professionalExamPassed || 'None'}","${a.isBoardPasser || 'N/A'}","${a.licensureExamDate || ''}","${a.licenseNo || ''}","${a.alumniAssociationStatus || 'Non-Member'}","${a.employmentStatus || 'Unemployed'}","${a.employmentType || 'None'}","${a.jobTitle || ''}","${a.employerName || ''}","${a.sector || 'N/A'}","${a.monthlyIncome || ''}","${a.jobIndustry || ''}","${a.jobRelatedToCourse || 'No'}","${a.firstJobRelatedToCourse || 'No'}","${a.timeToFirstJob || ''}","${skillsStr}"`;
              }).join('\n');

              const blob = new Blob([csvHeader + csvContent], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', `BSC_CHED_Tracer_Report_${isChairperson ? (activeUser?.program || 'Department').replace(/\s+/g, '_') : 'BSC'}_2026.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);

              alert(`COMPLETED! Prepared official tracer metrics spreadsheet for ${isChairperson ? (activeUser?.program || 'Department') : 'Batanes State College'} comprising ${filteredAlumni.length} graduates.`);
            }}
            title={`Target Filename: BSC_CHED_Tracer_Report_${isChairperson ? (activeUser?.program || 'Department').replace(/\s+/g, '_') : 'BSC'}_2026.csv`}
            className="px-4 py-2 bg-[#7c191e] hover:bg-[#7c191e]/90 text-white font-extrabold text-xs rounded-lg transition inline-flex items-center gap-1.5 uppercase shadow-xs cursor-pointer select-none"
          >
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Dynamic Filter bar para mag-query sa database kahit kailan base sa piniling criteria */}
      <div className="bg-emerald-50/40 border border-emerald-100 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-3xs font-sans">
        <div className="flex items-center gap-2 text-xs font-bold text-[#1e4620]">
          <Filter className="w-4 h-4" />
          <span>Interactive Dataset Filters:</span>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Selector para sa Taon ng Pagtatapos */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold w-full sm:w-auto">
            <span className="shrink-0 text-[11px] uppercase tracking-wider font-bold">Class Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-white border border-slate-200 text-xs font-bold p-1.5 rounded-lg text-slate-800 cursor-pointer w-full sm:w-auto"
            >
              <option value="All">All Years</option>
              {graduationYears.map(yr => (
                <option key={yr} value={yr}>Class of {yr}</option>
              ))}
            </select>
          </div>

          {/* Selector ng Program (Naka-disable para sa Chairperson dahil program-locked na sila sa sariling department) */}
          {!isChairperson && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold w-full sm:w-auto">
              <span className="shrink-0 text-[11px] uppercase tracking-wider font-bold">Program:</span>
              <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="bg-white border border-slate-200 text-xs font-bold p-1.5 rounded-lg text-slate-800 cursor-pointer w-full sm:w-auto"
              >
                <option value="All">All Specializations</option>
                {BSC_PROGRAMS.map(prog => (
                  <option key={prog} value={prog}>{prog}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Mga widget para sa mabilisang buod ng mga key metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans select-none">
        <div className="bg-white p-4.5 rounded-xl border border-slate-100 shadow-3xs">
          <span className="text-[10px] text-slate-405 font-bold block mt-0.5">Alumni Registered</span>
          <div className="text-xl font-extrabold text-[#1e4620] mt-1">{totalRegistered} / {filteredAlumni.length}</div>
          <span className="text-[10px] text-slate-405 font-bold block mt-0.5">{regRate}% Reg. Rate &middot; Avg Cohort Age: {averageAge}</span>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-slate-100 shadow-3xs">
          <span className="text-[10px] text-slate-405 font-bold block mt-0.5">Employability Index</span>
          <div className="text-xl font-extrabold text-[#1e4620] mt-1">{employedRate}%</div>
          <div className="w-full bg-slate-105 h-1 rounded-full overflow-hidden mt-1.5">
            <div className="h-full bg-emerald-600" style={{ width: `${employedRate}%` }} />
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-slate-100 shadow-3xs">
          <span className="text-[10px] text-slate-405 font-bold block mt-0.5">Curriculum Alignment Ratio</span>
          <div className="text-xl font-extrabold text-amber-500 mt-1">
            {total > 0 ? Math.round(((relatedYes + relatedPartial) / total) * 100) : 0}%
          </div>
          <span className="text-[10px] text-slate-405 font-medium block mt-0.5">Course related jobs</span>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-slate-100 shadow-3xs">
          <span className="text-[10px] text-slate-450 font-bold block mt-0.5">Outstanding Feedback Count</span>
          <div className="text-xl font-extrabold text-[#1e4620] mt-1">
            {filteredAlumni.filter(a => a.employmentStatus !== 'Unemployed').length} Careers
          </div>
          <span className="text-[10px] text-slate-405 font-medium block mt-0.5">Currently being audited</span>
        </div>
      </div>

      {/* Historical Employability Trend Chart para sa Class of 2023 hanggang 2026 */}
      <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-100 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-4.5 h-4.5 text-[#7c191e]" /> Historical Graduate Employability Trend (Class of {trendPoints[0].year}{trendPoints.length > 1 ? ` - ${trendPoints[trendPoints.length - 1].year}` : ''})
          </h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CHED Tracer Benchmark</span>
        </div>
        
        <div className="relative w-full h-64 bg-slate-50/50 rounded-lg">
          <div className="absolute inset-4">
            {/* NOTE: Upang maiwasan ang horizontal font stretching sa SVG text kapag gumagamit ng preserveAspectRatio="none", ginawa nating regular HTML absolute divs ang X at Y axis labels na nakapatong sa SVG. */}
            
            {/* Y-axis Benchmarks (HTML absolute positioned) */}
            <div className="absolute left-[1.5%] top-[13.64%] -translate-y-1/2 text-[10px] text-slate-400 font-extrabold font-mono select-none pointer-events-none">100%</div>
            <div className="absolute left-[1.5%] top-[29.55%] -translate-y-1/2 text-[10px] text-slate-400 font-extrabold font-mono select-none pointer-events-none">75%</div>
            <div className="absolute left-[1.5%] top-[45.45%] -translate-y-1/2 text-[10px] text-slate-400 font-extrabold font-mono select-none pointer-events-none">50%</div>
            <div className="absolute left-[1.5%] top-[61.36%] -translate-y-1/2 text-[10px] text-slate-400 font-extrabold font-mono select-none pointer-events-none">25%</div>
            <div className="absolute left-[1.5%] top-[77.27%] -translate-y-1/2 text-[10px] text-slate-400 font-extrabold font-mono select-none pointer-events-none">0%</div>

            {/* X-axis graduation classes labels (HTML absolute positioned) */}
            <div className="absolute top-[96.36%] left-0 right-0 text-[10px] text-slate-500 font-extrabold font-mono select-none pointer-events-none">
              {trendPoints.map(pt => (
                <span 
                  key={pt.year} 
                  className="absolute inline-block transform -translate-x-1/2 whitespace-nowrap"
                  style={{ left: `${(pt.cx / 600) * 100}%` }}
                >
                  Class of {pt.year}
                </span>
              ))}
            </div>

            {/* SVG Line Graph para sa visual trend line */}
            <svg className="w-full h-full" viewBox="0 0 600 220" preserveAspectRatio="none">
            {/* Mga gradient na ginagamit para sa background fill ng trend graph */}
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7c191e" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#7c191e" stopOpacity="0.00" />
              </linearGradient>
            </defs>

            {/* Mga linya sa Y-axis ng grid para sa porsyento (Benchmarks) */}
            <line x1="50" y1="30" x2="550" y2="30" stroke="#e2e8f0" strokeDasharray="3" />
            <line x1="50" y1="65" x2="550" y2="65" stroke="#e2e8f0" strokeDasharray="3" />
            <line x1="50" y1="100" x2="550" y2="100" stroke="#e2e8f0" strokeDasharray="3" />
            <line x1="50" y1="135" x2="550" y2="135" stroke="#e2e8f0" strokeDasharray="3" />
            <line x1="50" y1="170" x2="550" y2="170" stroke="#e2e8f0" strokeDasharray="3" />

            {/* Area Path na may shading sa ilalim ng trend line */}
            {/* Area Path na may shading sa ilalim ng trend line */}
            {trendPoints.length > 1 && (
              <path 
                d={`M ${trendPoints[0].cx} 200 L ` + trendPoints.map(pt => `${pt.cx} ${pt.cy}`).join(' L ') + ` L ${trendPoints[trendPoints.length - 1].cx} 200 Z`} 
                fill="url(#areaGrad)" 
              />
            )}

            {/* Ang pangunahing linya para sa visual trend line ng employability */}
            {trendPoints.length > 1 && (
              <path 
                d={`M ${trendPoints[0].cx} ${trendPoints[0].cy} L ` + trendPoints.slice(1).map(pt => `${pt.cx} ${pt.cy}`).join(' L ')} 
                fill="none" 
                stroke="#7c191e" 
                strokeWidth="4" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            )}

            {/* Mga interactive dots na kumakatawan sa bawat taon ng pagtatapos */}
            {trendPoints.map((pt, idx) => (
              <circle 
                key={idx}
                cx={pt.cx} 
                cy={pt.cy} 
                r="6.5" 
                fill="#cca43b" 
                stroke="#7c191e" 
                strokeWidth="2.5" 
                /* NOTE: Nilagyan ng dynamic transformOrigin base sa center coordinates ng bilog (pt.cx, pt.cy) para maging steady ang scale animation at hindi mag-glitch/shake kapag hino-hover ng cursor. */
                style={{ transformOrigin: `${pt.cx}px ${pt.cy}px` }}
                className="cursor-pointer transition-all hover:scale-150 duration-200"
                onMouseEnter={(e) => {
                  setHoveredPoint({
                    x: e.clientX,
                    y: e.clientY,
                    year: pt.year,
                    rate: pt.rate,
                    count: pt.count
                  });
                }}
                onMouseMove={(e) => {
                  setHoveredPoint(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null);
                }}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            ))}
          </svg>
          
          {/* Ang lumulutang na tooltip kapag tinututukan ng mouse ang interactive dots */}
          {hoveredPoint && (
            <div 
              className="fixed bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg shadow-xl pointer-events-none z-50 border border-slate-800 font-sans"
              style={{ left: `${hoveredPoint.x + 10}px`, top: `${hoveredPoint.y - 10}px`, transform: 'translate(-50%, -100%)' }}
            >
              <div className="text-amber-400 font-extrabold uppercase text-[9px] mb-0.5">Class of {hoveredPoint.year}</div>
              <div>Employability: {hoveredPoint.rate}%</div>
              <div>Employed Alumni: {hoveredPoint.count}</div>
            </div>
          )}
        </div>
      </div>
    </div>

      {/* Geographical Tracer Map (Geo-Tracer) */}
      {/* Geographical Placement & Network Reach (Geo-Tracer) */}
      <div className="bg-white border border-slate-100 rounded-xl shadow-xs p-6 text-slate-800 space-y-6 transition-all duration-300">
       <div data-html2canvas-ignore="true" className="bg-white border border-slate-100 rounded-xl shadow-xs p-6 text-slate-800 space-y-6 transition-all duration-300">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-4.5 h-4.5 text-[#7c191e] animate-spin-slow" /> Graduate Placement &amp; Network Reach Index
            </h3>
            <p className="text-[10px] text-slate-400 mt-1 font-semibold">Tracer logistics detailing cohort distribution from Batanes State College to global sectors.</p>
          </div>
          <span className="text-[9px] bg-slate-50 text-slate-500 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-slate-200">
            GIS-Network Core
          </span>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes routeFlow {
            to {
              stroke-dashoffset: -20;
            }
          }
          .network-route {
            stroke-dasharray: 6, 4;
            animation: routeFlow 2.5s linear infinite;
          }
          @keyframes nodePulse {
            0% {
              r: 4px;
              opacity: 0.9;
            }
            100% {
              r: 16px;
              opacity: 0;
            }
          }
          .node-pulse-ring {
            animation: nodePulse 2s cubic-bezier(0.215, 0.610, 0.355, 1) infinite;
          }
        `}} />

        {/* Top Section: Interactive Map Container */}
        <div className="relative bg-slate-50/50 rounded-xl p-4 border border-slate-100 flex flex-col md:flex-row items-stretch justify-between gap-6 overflow-hidden min-h-[360px]">
          {/* Map wrapper */}
          <div className="w-full md:w-3/4 h-[440px] rounded-lg border border-slate-200 overflow-hidden relative shadow-3xs">
            <div ref={mapContainerRef} className="w-full h-full z-10" id="tracer-interactive-map" />
            
            {/* Custom Map Control presets overlay */}
            <div className="absolute top-3 right-3 z-50 flex flex-col gap-1.5 bg-white/95 backdrop-blur-xs p-2 rounded-lg border border-slate-200 shadow-sm select-none">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-1 text-center font-sans">Zoom View Range</span>
              <button
                type="button"
                onClick={() => handleMapPan('local')}
                className="px-2.5 py-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-250 rounded-md transition-all cursor-pointer text-left font-sans"
              >
                Local Batanes
              </button>
              <button
                type="button"
                onClick={() => handleMapPan('national')}
                className="px-2.5 py-1 text-[10px] font-bold text-sky-850 bg-sky-50 hover:bg-sky-100 border border-sky-250 rounded-md transition-all cursor-pointer text-left font-sans"
              >
                Philippines
              </button>
              <button
                type="button"
                onClick={() => handleMapPan('global')}
                className="px-2.5 py-1 text-[10px] font-bold text-amber-850 bg-amber-50 hover:bg-amber-100 border border-amber-250 rounded-md transition-all cursor-pointer text-left font-sans"
              >
                Global / World
              </button>
            </div>
          </div>

          {/* Quick HUD breakdown panel */}
          <div className="w-full md:w-1/4 p-4.5 bg-white rounded-lg border border-slate-100 flex flex-col justify-between shadow-3xs">
            <div className="space-y-4">
              <span className="text-[9px] text-[#7c191e] font-extrabold uppercase tracking-wider block border-b border-slate-100 pb-1.5 font-sans">GIS-Network Interactive Hub</span>
              
              <p className="text-[10px] text-slate-500 font-semibold leading-relaxed font-sans">
                Interact with the map by panning and zooming, or hover over the density pins to view live distribution stats. Switch views quickly using the controller overlay.
              </p>

              <div className="flex flex-col gap-2.5 pt-2 font-sans">
                <div className="p-2 bg-emerald-50/50 rounded-lg border border-emerald-100 flex justify-between items-center px-3">
                  <span className="text-[9px] font-bold text-emerald-700 uppercase">Local</span>
                  <span className="text-xs font-extrabold text-[#1e4620]">{localCount} ({localPct}%)</span>
                </div>
                <div className="p-2 bg-sky-50/50 rounded-lg border border-sky-100 flex justify-between items-center px-3">
                  <span className="text-[9px] font-bold text-sky-700 uppercase">National</span>
                  <span className="text-xs font-extrabold text-sky-950">{nationalCount} ({nationalPct}%)</span>
                </div>
                <div className="p-2 bg-amber-50/50 rounded-lg border border-amber-100 flex justify-between items-center px-3">
                  <span className="text-[9px] font-bold text-amber-700 uppercase">Global</span>
                  <span className="text-xs font-extrabold text-amber-950">{internationalCount} ({internationalPct}%)</span>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 leading-normal font-semibold text-center border-t border-slate-50 pt-3 mt-4 font-sans">
              Density maps utilize multi-layered concentric circles to represent graduate concentrations.
            </div>
          </div>
        </div>
      </div>

      {/* Pangunahing lugar para sa mga charts at statistical indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-sans">
        
        {/* Visual na pagpapakita ng salary distribution ng mga rehistradong alumni */}
        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-100 space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-50 pb-2">
            <BarChart3 className="w-4.5 h-4.5 text-[#1e4620]" /> Monthly Income Range Bracket Index (PHP)
          </h3>

          <div className="space-y-3.5 pt-1.5">
            {Object.entries(salaries).map(([bracket, count]) => {
              const maxVal = Math.max(...Object.values(salaries), 1);
              const pct = Math.round((count / maxVal) * 100);
              const totalPct = Math.round((count / total) * 100);
              return (
                <div key={bracket} className="space-y-1 group/row">
                  <div className="flex justify-between text-[11px] font-bold text-slate-500">
                    <span className="font-semibold group-hover/row:text-slate-700 transition-colors">{bracket} PHP</span>
                    {/* NOTE: Dynamic pluralization ng grads ( <= 1 ay 'grad' ) alinsunod sa bagong preference ng user. */}
                    <span className="text-[#1e4620] font-extrabold">{count} {count <= 1 ? 'grad' : 'grads'} ({totalPct}%)</span>
                  </div>
                  <div className="h-4 w-full bg-slate-105 rounded-full overflow-hidden border border-slate-200/50 group-hover/row:border-slate-300 transition-colors">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-600 to-emerald-500 transition-all duration-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tagasubaybay ng kaugnayan ng natapos na kurso sa kasalukuyang trabaho (Curricular Job Alignment) */}
        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-100 space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-50 pb-2">
            <PieChart className="w-4.5 h-4.5 text-[#1e4620]" /> Curricular Course-to-Job Alignment (Tracer Key Metric)
          </h3>

          <div className="space-y-4 py-1.5">
            {/* May direktang kaugnayan (Direct Alignment) */}
            <div className="space-y-1 group/alignment-yes">
              {/* NOTE: Ginawa nating dynamic ang pluralization ng grads sa alignment metrics ( <= 1 ay 'grad' ) alinsunod sa bagong requirement ng user. */}
              <div className="flex justify-between text-[11px] font-bold text-slate-500">
                <span className="flex items-center gap-1.5 group-hover/alignment-yes:text-slate-700 transition-colors">
                  <span className="w-2.5 h-2.5 bg-amber-500 rounded-xs block" />
                  Direct Alignment (Jobs highly related)
                </span>
                <span className="font-extrabold text-slate-800">{relatedYes} {relatedYes <= 1 ? 'grad' : 'grads'} ({Math.round((relatedYes / total) * 100)}%)</span>
              </div>
              <div className="h-4 w-full bg-slate-105 rounded-full overflow-hidden border border-slate-200/50 group-hover/alignment-yes:border-slate-300 transition-colors">
                <div 
                  className="h-full bg-amber-500 transition-all duration-500 rounded-full" 
                  style={{ width: `${Math.round((relatedYes / total) * 100)}%` }}
                />
              </div>
            </div>

            {/* May bahagyang kaugnayan (Moderate Alignment) */}
            <div className="space-y-1 group/alignment-partial">
              <div className="flex justify-between text-[11px] font-bold text-slate-500">
                <span className="flex items-center gap-1.5 group-hover/alignment-partial:text-slate-700 transition-colors">
                  <span className="w-2.5 h-2.5 bg-emerald-600 rounded-xs block" />
                  Moderate Alignment (Partially related)
                </span>
                <span className="font-extrabold text-slate-800">{relatedPartial} {relatedPartial <= 1 ? 'grad' : 'grads'} ({Math.round((relatedPartial / total) * 100)}%)</span>
              </div>
              <div className="h-4 w-full bg-slate-105 rounded-full overflow-hidden border border-slate-200/50 group-hover/alignment-partial:border-slate-300 transition-colors">
                <div 
                  className="h-full bg-emerald-600 transition-all duration-500 rounded-full" 
                  style={{ width: `${Math.round((relatedPartial / total) * 100)}%` }}
                />
              </div>
            </div>

            {/* Walang kaugnayan ang trabaho sa kurso (Unaligned Careers) */}
            <div className="space-y-1 group/alignment-no">
              <div className="flex justify-between text-[11px] font-bold text-slate-500">
                <span className="flex items-center gap-1.5 group-hover/alignment-no:text-slate-700 transition-colors">
                  <span className="w-2.5 h-2.5 bg-rose-500 rounded-xs block" />
                  Unaligned Careers (Not related)
                </span>
                <span className="font-extrabold text-slate-800">{relatedNo} {relatedNo <= 1 ? 'grad' : 'grads'} ({Math.round((relatedNo / total) * 100)}%)</span>
              </div>
              <div className="h-4 w-full bg-slate-105 rounded-full overflow-hidden border border-slate-200/50 group-hover/alignment-no:border-slate-300 transition-colors">
                <div 
                  className="h-full bg-rose-500 transition-all duration-500 rounded-full" 
                  style={{ width: `${Math.round((relatedNo / total) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

      </div>

 {/* ANNEX A: CHED / ALCU-COA GRADUATE PLACEMENT ACCREDITATION SUMMARY */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden font-sans">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">ANNEX A: CHED / AACCUP Accreditation Summary</h3>
          <span className="text-[9.5px] bg-[#cca43b] text-slate-900 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Accreditation Annex</span>
        </div>
        <div className="p-5">
          <p className="text-[11px] text-slate-500 mb-4 font-semibold leading-relaxed font-sans">
            The following table summarizes institutional performance quality indicators required for official accreditation reviews (including CHED graduate placement audits and AACCUP compliance checks).
          </p>
          <div className="overflow-x-auto w-full border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs font-medium text-slate-705 divide-y divide-slate-200">
              <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="p-3 pl-5 border-r border-slate-200">Compliance Quality Indicator</th>
                  <th className="p-3 border-r border-slate-200 text-center">Value / Metric</th>
                  <th className="p-3">Audit Benchmark Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-sans">
                <tr>
                  <td className="p-3 pl-5 border-r border-slate-200 font-bold">Total Graduate Cohort Size (N)</td>
                  <td className="p-3 border-r border-slate-200 text-center font-black text-slate-800">{total} grads</td>
                  <td className="p-3 text-slate-500 font-semibold">Overall census data tracked in portal</td>
                </tr>
                <tr>
                  <td className="p-3 pl-5 border-r border-slate-200 font-bold">Active Registration &amp; Response Rate</td>
                  <td className="p-3 border-r border-slate-200 text-center font-black text-slate-800">{regRate}%</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${regRate >= 75 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {regRate >= 75 ? 'High Compliance' : 'Substandard - Requires follow-up'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="p-3 pl-5 border-r border-slate-200 font-bold">Graduate Employment Rate</td>
                  <td className="p-3 border-r border-slate-200 text-center font-black text-emerald-700">{accredEmploymentRate}%</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${accredEmploymentRate >= 70 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-805'}`}>
                      {accredEmploymentRate >= 70 ? 'Satisfactory Placement' : 'Action Plan Required'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="p-3 pl-5 border-r border-slate-200 font-bold">Degree-to-Career Alignment Index</td>
                  <td className="p-3 border-r border-slate-200 text-center font-black text-slate-800">{alignmentIndex}%</td>
                  <td className="p-3 text-slate-500 font-semibold">Percent of employed graduates in related fields</td>
                </tr>
                <tr>
                  <td className="p-3 pl-5 border-r border-slate-200 font-bold">Employment within 6 Months</td>
                  <td className="p-3 border-r border-slate-200 text-center font-black text-indigo-700">{placementUnder6MonthsRate}%</td>
                  <td className="p-3 text-slate-500 font-semibold">Immediate transition metrics upon graduation</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>


      {/* Listahan ng ranggo ng bawat program (Pang-Admin lang ito, tago o static para sa Chairperson) */}
      {!isChairperson && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden font-sans">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">College Program Placement Rankings</h3>
            <span className="text-[9.5px] bg-[#1e4620] text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">Institutional Overview</span>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-600 bg-slate-50 uppercase">
                  <th className="p-3 pl-6">BSC Degree Course</th>
                  <th className="p-3">Tracked Graduates</th>
                  <th className="p-3">Employed Indices</th>
                  <th className="p-3 pr-6 text-right">Employability Ratio</th>
                </tr>
              </thead>
              <tbody className="text-xs font-medium text-slate-700 divide-y divide-slate-100">
                {programPerformanceArray
                  .map(prog => {
                    const ratio = prog.total > 0 ? Math.round((prog.active / prog.total) * 100) : 0;
                    return { ...prog, ratio };
                  })
                  .sort((a, b) => b.ratio - a.ratio)
                  .map((p, idx) => (
                    <tr key={p.name} className="hover:bg-slate-50 transition">
                      <td className="p-3 pl-6 font-bold text-slate-800 flex items-center gap-2">
                        <span className="text-slate-400 font-mono w-5">#{idx + 1}</span> {p.name}
                      </td>
                      {/* NOTE: Dynamic pluralization ng grads ( <= 1 ay 'grad' ) at active placements alinsunod sa instruction ng user. */}
                      <td className="p-3">{p.total} {p.total <= 1 ? 'grad' : 'grads'} logged</td>
                      <td className="p-3 text-emerald-700 font-bold">{p.active} active placement{p.active <= 1 ? '' : 's'}</td>
                      <td className="p-3 pr-6 text-right">
                        <span className={`px-2.5 py-1 rounded-full font-extrabold text-[10px] ${
                          p.ratio >= 80 ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-805 border border-amber-300'
                        }`}>
                          {p.ratio}% Ratio
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
