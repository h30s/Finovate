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
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Element with ID '${elementId}' not found`);
      }

      // Temporarily show the element if it's hidden
      const originalDisplay = element.style.display;
      element.style.display = 'block';

      // Capture the element as canvas
      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Restore original display
      element.style.display = originalDisplay;

      // Create PDF
      const pdf = new jsPDF({
        orientation: options.orientation || 'portrait',
        unit: 'mm',
        format: options.format || 'a4'
      });

      // Calculate dimensions to fit the canvas
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Add title if provided
      if (options.title) {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(options.title, 20, 20);
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Generated on: ${format(new Date(), 'MMMM dd, yyyy')}`, 20, 30);
        
        position = 40;
        heightLeft -= 40;
      }

      // Add the captured image
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add new pages if content is longer than one page
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Save the PDF
      pdf.save(filename);

      return { success: true };
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
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
