import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

/**
 * Capture an element on screen and download it as a PDF.
 * @param {string} elementId - The ID of the HTML element to capture.
 * @param {string} filename - The target filename of the downloaded PDF.
 */
export async function exportToPDF(elementId, filename = 'BSC_Report.pdf') {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found.`);
    return;
  }

  // Save original style properties to restore them afterward
  const originalHeight = element.style.height;
  const originalOverflow = element.style.overflow;
  const originalMaxHeight = element.style.maxHeight;

  // Temporarily set to full scroll heights to render everything
  element.style.height = 'auto';
  element.style.overflow = 'visible';
  element.style.maxHeight = 'none';

  // Temporarily disable scrollbars using dynamic CSS style tag
  const styleOverride = document.createElement('style');
  styleOverride.id = 'pdf-export-scrollbar-override';
  styleOverride.innerHTML = `
    * {
      scrollbar-width: none !important;
      -ms-overflow-style: none !important;
    }
    *::-webkit-scrollbar {
      display: none !important;
    }
  `;
  document.head.appendChild(styleOverride);

  // Temporarily expand overflow scroll containers to visible so columns/tables don't cut off
  const scrollContainers = element.querySelectorAll('.overflow-x-auto, .overflow-y-auto, .overflow-auto');
  const originalScrolls = [];
  scrollContainers.forEach((el, idx) => {
    originalScrolls[idx] = {
      overflowX: el.style.overflowX,
      overflowY: el.style.overflowY,
      width: el.style.width,
      maxWidth: el.style.maxWidth
    };
    el.style.overflowX = 'visible';
    el.style.overflowY = 'visible';
    el.style.width = 'auto';
    el.style.maxWidth = 'none';
  });

  // Find all elements with no-print class and hide them
  const noPrintElements = document.querySelectorAll('.no-print');
  const originalDisplays = [];
  noPrintElements.forEach((el, idx) => {
    originalDisplays[idx] = el.style.display;
    el.style.setProperty('display', 'none', 'important');
  });

  try {
    const canvas = await html2canvas(element, {
      scale: 1.5, // Balance file size and text crispness
      useCORS: true,
      logging: false,
      backgroundColor: '#f8fafc',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 page height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
  } catch (error) {
    console.error('PDF export error:', error);
  } finally {
    // Remove temporary scrollbar styling overrides
    const styleOverrideTag = document.getElementById('pdf-export-scrollbar-override');
    if (styleOverrideTag) {
      styleOverrideTag.remove();
    }

    // Restore original styles of scroll containers
    scrollContainers.forEach((el, idx) => {
      const orig = originalScrolls[idx];
      if (orig) {
        el.style.overflowX = orig.overflowX;
        el.style.overflowY = orig.overflowY;
        el.style.width = orig.width;
        el.style.maxWidth = orig.maxWidth;
      }
    });

    // Restore original styles
    element.style.height = originalHeight;
    element.style.overflow = originalOverflow;
    element.style.maxHeight = originalMaxHeight;

    noPrintElements.forEach((el, idx) => {
      el.style.display = originalDisplays[idx];
    });
  }
}
