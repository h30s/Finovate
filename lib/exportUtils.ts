'use client';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';

export class ExportUtils {
  /**
   * Export data to CSV format
   */
  static async exportToCSV(
    type: 'expenses' | 'bills', 
    filters: {
      startDate?: string;
      endDate?: string;
      categories?: string[];
    }
  ) {
    try {
      const queryParams = new URLSearchParams({
        type,
        format: 'csv',
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.categories && { categories: filters.categories.join(',') })
      });

      const response = await fetch(`/api/reports/export?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to export CSV');
      }

      // Get the CSV content
      const csvContent = await response.text();
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${type}_report_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      console.error('Error exporting CSV:', error);
      throw error;
    }
  }

  /**
   * Simple PDF generation using browser print
   */
  static async generateSimplePDF(elementId: string, filename: string) {
    try {
      console.log('Using simple PDF generation method...');
      
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Element with ID '${elementId}' not found`);
      }

      // Open print dialog which can save as PDF
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Failed to open print window. Please allow pop-ups.');
      }

      // Clone the element
      const clonedElement = element.cloneNode(true) as HTMLElement;
      
      // Add print-friendly styles
      const printStyles = `
        <style>
          @media print {
            body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
            .no-print { display: none !important; }
            .print-header { margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
          }
          @page { margin: 1in; }
        </style>
      `;

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${filename}</title>
          <meta charset="utf-8">
          ${printStyles}
        </head>
        <body>
          <div class="print-header">
            <h1>Finovate Financial Report</h1>
            <p>Generated on: ${format(new Date(), 'MMMM dd, yyyy HH:mm')}</p>
          </div>
          ${clonedElement.outerHTML}
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                // Don't auto-close to let user save as PDF
              }, 500);
            };
          </script>
        </body>
        </html>
      `);

      printWindow.document.close();
      
      return { success: true };
    } catch (error) {
      console.error('Simple PDF generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate PDF from HTML element
   */
  static async generatePDF(
    elementId: string, 
    filename: string,
    options: {
      orientation?: 'portrait' | 'landscape';
      format?: string;
      title?: string;
    } = {}
  ) {
    try {
      console.log('Starting PDF generation for element:', elementId);
      
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Element with ID '${elementId}' not found`);
      }

      console.log('Element found, preparing for capture...');
      
      // Store original styles
      const originalStyles = {
        display: element.style.display,
        visibility: element.style.visibility,
        position: element.style.position,
        left: element.style.left,
        top: element.style.top
      };

      // Temporarily make element visible and positioned for capture
      element.style.display = 'block';
      element.style.visibility = 'visible';
      element.style.position = 'relative';
      element.style.left = 'auto';
      element.style.top = 'auto';

      // Wait a moment for rendering
      await new Promise(resolve => setTimeout(resolve, 100));

      console.log('Capturing element as canvas...');
      
      // Capture the element as canvas with better options
      const canvas = await html2canvas(element, {
        scale: 1.5, // Good balance between quality and performance
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        width: element.scrollWidth,
        height: element.scrollHeight,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        scrollX: 0,
        scrollY: 0,
        foreignObjectRendering: true
      });

      console.log('Canvas created, size:', canvas.width, 'x', canvas.height);

      // Restore original styles
      Object.assign(element.style, originalStyles);

      // Create PDF
      const pdf = new jsPDF({
        orientation: options.orientation || 'portrait',
        unit: 'mm',
        format: options.format || 'a4',
        compress: true
      });

      // Calculate dimensions
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 10; // 10mm margin
      const availableWidth = pdfWidth - (2 * margin);
      const availableHeight = pdfHeight - (2 * margin);

      // Calculate image dimensions to fit on page
      const imgAspectRatio = canvas.width / canvas.height;
      let imgWidth = availableWidth;
      let imgHeight = imgWidth / imgAspectRatio;

      // If image is too tall, scale it down
      if (imgHeight > availableHeight) {
        imgHeight = availableHeight;
        imgWidth = imgHeight * imgAspectRatio;
      }

      let yPosition = margin;

      // Add title if provided
      if (options.title) {
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.text(options.title, margin, yPosition + 10);
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Generated on: ${format(new Date(), 'MMMM dd, yyyy HH:mm')}`, margin, yPosition + 20);
        
        yPosition += 30;
      }

      console.log('Adding image to PDF...');
      
      // Convert canvas to image and add to PDF
      const imgData = canvas.toDataURL('image/jpeg', 0.85); // Use JPEG with compression
      
      // Calculate how many pages we need
      const totalHeight = canvas.height * (imgWidth / canvas.width);
      const pageContentHeight = pdfHeight - yPosition - margin;
      
      if (totalHeight <= pageContentHeight) {
        // Fits on one page
        pdf.addImage(imgData, 'JPEG', margin, yPosition, imgWidth, imgHeight);
      } else {
        // Multiple pages needed
        let sourceY = 0;
        const sourceHeight = canvas.height * (pageContentHeight / totalHeight);
        
        while (sourceY < canvas.height) {
          // Create a temporary canvas for this page
          const tempCanvas = document.createElement('canvas');
          const tempCtx = tempCanvas.getContext('2d');
          tempCanvas.width = canvas.width;
          tempCanvas.height = Math.min(sourceHeight, canvas.height - sourceY);
          
          tempCtx?.drawImage(
            canvas,
            0, sourceY, canvas.width, tempCanvas.height,
            0, 0, canvas.width, tempCanvas.height
          );
          
          const pageImgData = tempCanvas.toDataURL('image/jpeg', 0.85);
          const pageImgHeight = (tempCanvas.height * imgWidth) / tempCanvas.width;
          
          pdf.addImage(pageImgData, 'JPEG', margin, yPosition, imgWidth, pageImgHeight);
          
          sourceY += tempCanvas.height;
          
          if (sourceY < canvas.height) {
            pdf.addPage();
            yPosition = margin;
          }
        }
      }

      console.log('Saving PDF...');
      
      // Save the PDF
      pdf.save(filename);
      
      console.log('PDF saved successfully');

      return { success: true };
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Provide more specific error messages
      let errorMessage = 'Failed to generate PDF';
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          errorMessage = 'Could not find the reports content to export';
        } else if (error.message.includes('canvas')) {
          errorMessage = 'Failed to capture the page content';
        } else {
          errorMessage = error.message;
        }
      }
      throw new Error(errorMessage);
    }
  }

  /**
   * Print the report
   */
  static async printReport(elementId: string) {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Element with ID '${elementId}' not found`);
      }

      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Failed to open print window');
      }

      // Clone the element
      const clonedElement = element.cloneNode(true) as HTMLElement;
      
      // Create print styles
      const printStyles = `
        <style>
          @media print {
            body {
              margin: 0;
              padding: 20px;
              font-family: Arial, sans-serif;
              line-height: 1.4;
            }
            
            .no-print {
              display: none !important;
            }
            
            .print-break {
              page-break-before: always;
            }
            
            .chart-container {
              break-inside: avoid;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            
            th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            
            .page-header {
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
            }
            
            .summary-box {
              border: 1px solid #ddd;
              padding: 15px;
              margin-bottom: 20px;
              background-color: #f9f9f9;
            }
          }
          
          @page {
            margin: 2cm;
          }
        </style>
      `;

      // Write to print window
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Financial Report - ${format(new Date(), 'MMMM dd, yyyy')}</title>
          ${printStyles}
        </head>
        <body>
          <div class="page-header">
            <h1>Financial Report</h1>
            <p>Generated on: ${format(new Date(), 'MMMM dd, yyyy HH:mm')}</p>
          </div>
          ${clonedElement.outerHTML}
        </body>
        </html>
      `);

      printWindow.document.close();
      
      // Wait for content to load, then print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      };

      return { success: true };
    } catch (error) {
      console.error('Error printing report:', error);
      throw error;
    }
  }

  /**
   * Download JSON data as file
   */
  static downloadJSONData(data: any, filename: string) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: 'application/json' 
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Format filters for display
   */
  static formatFiltersForDisplay(filters: any): string {
    const parts = [];
    
    if (filters.startDate && filters.endDate) {
      parts.push(`Period: ${format(new Date(filters.startDate), 'MMM dd, yyyy')} - ${format(new Date(filters.endDate), 'MMM dd, yyyy')}`);
    } else if (filters.startDate) {
      parts.push(`From: ${format(new Date(filters.startDate), 'MMM dd, yyyy')}`);
    } else if (filters.endDate) {
      parts.push(`Until: ${format(new Date(filters.endDate), 'MMM dd, yyyy')}`);
    }
    
    if (filters.categories && filters.categories.length > 0) {
      parts.push(`Categories: ${filters.categories.join(', ')}`);
    }
    
    return parts.length > 0 ? parts.join(' | ') : 'All data';
  }
}

export default ExportUtils;
