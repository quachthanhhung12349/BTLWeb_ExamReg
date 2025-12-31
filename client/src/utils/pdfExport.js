import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import autoTable from 'jspdf-autotable';

/**
 * Export an HTML element to PDF
 * @param {HTMLElement} element - The DOM element to export
 * @param {string} filename - Name of the PDF file
 * @param {string} title - Title for the PDF document
 */
export const exportElementToPDF = async (element, filename, title) => {
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    const pdf = new jsPDF('p', 'mm', 'a4');
    let position = 0;

    // Add title if provided
    if (title) {
      pdf.setFontSize(16);
      pdf.text(title, 15, 15);
      position = 25;
    }

    // Add image
    while (heightLeft > 0) {
      const pageHeight = 277; // Adjusted for margins
      if (heightLeft < pageHeight) {
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth - 20, imgHeight);
        heightLeft -= pageHeight;
      } else {
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth - 20, pageHeight);
        heightLeft -= pageHeight;
        position = 0;
        pdf.addPage();
      }
    }

    pdf.save(filename);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw new Error('Lỗi khi xuất PDF: ' + error.message);
  }
};

/**
 * Export table data to PDF with better formatting
 * @param {Array} data - Array of objects representing table rows
 * @param {Array} columns - Array of column definitions {header, key, width?}
 * @param {string} filename - Name of the PDF file
 * @param {string} title - Title for the PDF document
 */
export const exportTableToPDF = async (data, columns, filename, title) => {
  try {
    const pdf = new jsPDF('l', 'mm', 'a4'); // landscape mode for better width
    
    // Prepare table columns and rows for autoTable
    const tableColumns = columns.map(col => col.header);
    const tableRows = data.map(row => columns.map(col => row[col.key] || ''));

    // Add title
    let yPosition = 10;
    if (title) {
      pdf.setFontSize(14);
      pdf.setFont('times', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text(title, 10, yPosition);
      yPosition += 8;
    }

    // Add date
    pdf.setFontSize(10);
    pdf.setFont('times', 'normal');
    pdf.setTextColor(80, 80, 80);
    pdf.text(`Ngay xuat: ${new Date().toLocaleDateString('vi-VN')}`, 10, yPosition);
    yPosition += 4;

    // Use autoTable to generate the table with better Vietnamese text support
    autoTable(pdf, {
      startY: yPosition,
      head: [tableColumns],
      body: tableRows,
      theme: 'grid',
      styles: {
        font: 'times',
        fontSize: 10,
        cellPadding: 4,
        overflow: 'linebreak',
        halign: 'center',
        valign: 'middle',
        lineColor: [150, 150, 150],
        lineWidth: 0.1
      },
      headStyles: {
        fillColor: [60, 60, 60],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
        fontSize: 11,
        cellPadding: 5
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      columnStyles: columns.reduce((acc, col, index) => {
        const colStyle = {
          cellWidth: col.width || 'auto',
          halign: col.align || 'center'
        };
        // Special alignment for certain columns
        if (col.key === 'index' || col.key === 'studentId') {
          colStyle.halign = 'center';
        } else if (col.key === 'name') {
          colStyle.halign = 'left';
        }
        acc[index] = colStyle;
        return acc;
      }, {}),
      margin: { top: 10, left: 10, right: 10, bottom: 10 },
      didParseCell: function(data) {
        // Ensure proper text rendering
        if (data.cell.raw) {
          data.cell.text = [String(data.cell.raw)];
        }
      }
    });

    pdf.save(filename);
  } catch (error) {
    console.error('Error exporting table to PDF:', error);
    throw new Error('Lỗi khi xuất PDF: ' + error.message);
  }
};
