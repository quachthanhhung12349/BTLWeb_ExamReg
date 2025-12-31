import * as XLSX from 'xlsx';

/**
 * Export table data to Excel (XLSX)
 * @param {Array} data - Array of objects representing table rows
 * @param {Array} columns - Array of column definitions {header, key}
 * @param {string} filename - Name of the Excel file
 * @param {string} sheetName - Name of the worksheet
 * @param {string} title - Title for the Excel document
 */
export const exportTableToExcel = (data, columns, filename, sheetName = 'Sheet1', title = '') => {
  try {
    // Prepare worksheet data
    const wsData = [];
    
    // Add title row if provided
    if (title) {
      wsData.push([title]);
      wsData.push([]); // Empty row for spacing
    }
    
    // Add date row
    wsData.push([`Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`]);
    wsData.push([]); // Empty row for spacing
    
    // Add header row
    const headers = columns.map(col => col.header);
    wsData.push(headers);
    
    // Add data rows
    data.forEach(row => {
      const rowData = columns.map(col => row[col.key] || '');
      wsData.push(rowData);
    });
    
    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Set column widths
    const colWidths = columns.map(col => ({
      wch: col.width ? col.width / 3 : 15 // Convert mm to approximate character width
    }));
    ws['!cols'] = colWidths;
    
    // Style the title row if it exists
    if (title) {
      const titleCell = ws['A1'];
      if (titleCell) {
        titleCell.s = {
          font: { bold: true, sz: 14 },
          alignment: { horizontal: 'left', vertical: 'center' }
        };
      }
    }
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    
    // Save file
    XLSX.writeFile(wb, filename);
    
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error('Lỗi khi xuất Excel: ' + error.message);
  }
};
