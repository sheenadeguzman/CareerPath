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
    // Restore original styles
    element.style.height = originalHeight;
    element.style.overflow = originalOverflow;
    element.style.maxHeight = originalMaxHeight;

    noPrintElements.forEach((el, idx) => {
      el.style.display = originalDisplays[idx];
    });
  }
}
