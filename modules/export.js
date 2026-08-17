/**
 * Smart Expense Tracker - Data Export & Backup Module
 * Supports Excel (.xlsx), CSV (.csv), PDF Report (.pdf), and JSON Backup
 */

const FinanceExporter = {
  /**
   * Export transactions to Excel (.xlsx)
   */
  exportToExcel(transactions, categories, wallets, profile) {
    if (!window.XLSX) {
      alert('ไม่พบไลบรารี XLSX กำลังเปลี่ยนเป็นดาวน์โหลด CSV แทน');
      this.exportToCSV(transactions, categories, wallets);
      return;
    }

    const catMap = this.buildCategoryMap(categories);
    const walletMap = this.buildWalletMap(wallets);

    const rows = transactions.map(t => ({
      'วันที่': t.date,
      'เวลา': t.time || '',
      'ประเภท': t.type === 'expense' ? 'รายจ่าย' : (t.type === 'income' ? 'รายรับ' : 'โอนเงิน'),
      'หมวดหมู่': catMap[t.categoryId] || 'อื่นๆ',
      'กระเป๋าเงิน/บัญชี': walletMap[t.walletId] || 'บัญชีหลัก',
      'จำนวนเงิน (บาท)': Number(t.amount),
      'บันทึกช่วยจำ': t.note || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'รายการรายรับรายจ่าย');

    const fileName = `SmartFinance_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  },

  /**
   * Export transactions to standard CSV
   */
  exportToCSV(transactions, categories, wallets) {
    const catMap = this.buildCategoryMap(categories);
    const walletMap = this.buildWalletMap(wallets);

    let csvContent = '\uFEFF'; // UTF-8 BOM for Excel Thai language support
    csvContent += 'วันที่,เวลา,ประเภท,หมวดหมู่,กระเป๋าเงิน,จำนวนเงิน,บันทึกช่วยจำ\r\n';

    transactions.forEach(t => {
      const typeStr = t.type === 'expense' ? 'รายจ่าย' : (t.type === 'income' ? 'รายรับ' : 'โอนเงิน');
      const catStr = `"${(catMap[t.categoryId] || 'อื่นๆ').replace(/"/g, '""')}"`;
      const walletStr = `"${(walletMap[t.walletId] || 'บัญชีหลัก').replace(/"/g, '""')}"`;
      const noteStr = `"${(t.note || '').replace(/"/g, '""')}"`;

      csvContent += `${t.date},${t.time || ''},${typeStr},${catStr},${walletStr},${t.amount},${noteStr}\r\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SmartFinance_Transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Export beautiful PDF Financial Statement Report
   */
  exportToPDF(transactions, categories, wallets, profile) {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      alert('กำลังเตรียมดาวน์โหลดรายงาน...');
      window.print();
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const catMap = this.buildCategoryMap(categories);
    const walletMap = this.buildWalletMap(wallets);

    // Title & Header
    doc.setFontSize(20);
    doc.text('SmartFinance Monthly Report', 14, 22);

    doc.setFontSize(10);
    doc.text(`User: ${profile.name || 'Lucas Scott'} | Date: ${new Date().toLocaleDateString('th-TH')}`, 14, 30);

    // Calculate Totals
    let totalIncome = 0;
    let totalExpense = 0;
    transactions.forEach(t => {
      if (t.type === 'income') totalIncome += Number(t.amount);
      if (t.type === 'expense') totalExpense += Number(t.amount);
    });

    doc.setFontSize(11);
    doc.text(`Total Income: THB ${totalIncome.toLocaleString()}  |  Total Expense: THB ${totalExpense.toLocaleString()}  |  Net: THB ${(totalIncome - totalExpense).toLocaleString()}`, 14, 38);

    // Table Data
    const tableRows = transactions.slice(0, 35).map(t => [
      t.date,
      t.type === 'expense' ? 'Expense' : (t.type === 'income' ? 'Income' : 'Transfer'),
      catMap[t.categoryId] || 'General',
      walletMap[t.walletId] || 'Wallet',
      `${Number(t.amount).toLocaleString()} THB`,
      t.note || ''
    ]);

    if (doc.autoTable) {
      doc.autoTable({
        startY: 44,
        head: [['Date', 'Type', 'Category', 'Account', 'Amount', 'Note']],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [22, 163, 74] }
      });
    }

    doc.save(`SmartFinance_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  },

  /**
   * Backup all app data to JSON file
   */
  backupJSON(appData) {
    const dataStr = JSON.stringify(appData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SmartFinance_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Restore app data from JSON file
   */
  restoreJSON(file, onSuccess, onError) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (parsed && parsed.profile && parsed.transactions) {
          if (onSuccess) onSuccess(parsed);
        } else {
          if (onError) onError('โครงสร้างไฟล์สำรองข้อมูลไม่ถูกต้อง');
        }
      } catch (err) {
        if (onError) onError('ไม่สามารถอ่านไฟล์ JSON ได้: ' + err.message);
      }
    };
    reader.readAsText(file);
  },

  buildCategoryMap(categories) {
    const map = {};
    if (categories.expense) categories.expense.forEach(c => { map[c.id] = c.name; });
    if (categories.income) categories.income.forEach(c => { map[c.id] = c.name; });
    return map;
  },

  buildWalletMap(wallets) {
    const map = {};
    wallets.forEach(w => { map[w.id] = w.name; });
    return map;
  }
};
