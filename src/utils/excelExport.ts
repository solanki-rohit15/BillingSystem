import * as XLSX from 'xlsx';
import { BillEntry, FacultyDetails } from '@/types/billing';

const TAX_RATE = 0.10; // 10% tax deduction

export const exportBillsToExcel = (
  bills: BillEntry[],
  faculty: FacultyDetails[]
) => {
  // Group bills by faculty
  const groupedBills = bills.reduce((acc, bill) => {
    const key = `${bill.facultyId}-${bill.subject}-${bill.className}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(bill);
    return acc;
  }, {} as Record<string, BillEntry[]>);

  // Create rows in the required format
  const rows: any[][] = [];
  
  // Header rows
  rows.push(['DAVV, Indore']);
  rows.push(['B.Voc.']);
  rows.push([`Visiting Faculty Salary Bill ${new Date().getFullYear()}`]);
  rows.push([]);
  rows.push(['S.No.', 'Name/Class', 'Month', 'No. of Lectures', 'Rate', 'Amount', 'PAN No.', '10% Tax Deduction', 'Total Pay Amount', 'Bills ref. page']);

  let serialNo = 1;
  let pageRef = 1;

  Object.entries(groupedBills).forEach(([key, groupBills]) => {
    const firstBill = groupBills[0];
    const facultyDetails = faculty.find((f) => f.id === firstBill.facultyId);
    
    groupBills.forEach((bill, index) => {
      const taxDeduction = Math.round(bill.totalAmount * TAX_RATE);
      const totalPayAmount = bill.totalAmount - taxDeduction;
      const monthYear = `${bill.month.substring(0, 3)}-${String(bill.year).substring(2)}`;
      
      if (index === 0) {
        // First row with serial number and name
        rows.push([
          serialNo,
          firstBill.facultyName,
          monthYear,
          bill.totalHours,
          bill.ratePerHour,
          bill.totalAmount,
          facultyDetails?.panNumber || '',
          taxDeduction,
          totalPayAmount,
          pageRef++
        ]);
      } else if (index === 1) {
        // Second row with subject and class type
        rows.push([
          '',
          `${firstBill.subject}`,
          monthYear,
          bill.totalHours,
          bill.ratePerHour,
          bill.totalAmount,
          '',
          Math.round(bill.totalAmount * TAX_RATE),
          bill.totalAmount - Math.round(bill.totalAmount * TAX_RATE),
          pageRef++
        ]);
      } else if (index === 2) {
        // Third row with Theory/Practical
        rows.push([
          '',
          firstBill.className,
          monthYear,
          bill.totalHours,
          bill.ratePerHour,
          bill.totalAmount,
          '',
          Math.round(bill.totalAmount * TAX_RATE),
          bill.totalAmount - Math.round(bill.totalAmount * TAX_RATE),
          pageRef++
        ]);
      } else {
        // Subsequent rows
        rows.push([
          '',
          '',
          monthYear,
          bill.totalHours,
          bill.ratePerHour,
          bill.totalAmount,
          '',
          Math.round(bill.totalAmount * TAX_RATE),
          bill.totalAmount - Math.round(bill.totalAmount * TAX_RATE),
          pageRef++
        ]);
      }
    });

    // Add subtotal row
    const totalHours = groupBills.reduce((sum, b) => sum + b.totalHours, 0);
    const totalAmount = groupBills.reduce((sum, b) => sum + b.totalAmount, 0);
    const totalTax = Math.round(totalAmount * TAX_RATE);
    const totalPay = totalAmount - totalTax;

    rows.push(['', '', '', totalHours, '', totalAmount, '', totalTax, totalPay, '']);
    rows.push([]); // Empty row between faculty entries

    serialNo++;
  });

  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Bills');

  // Set column widths
  worksheet['!cols'] = [
    { wch: 6 },  // S.No.
    { wch: 25 }, // Name/Class
    { wch: 10 }, // Month
    { wch: 15 }, // No. of Lectures
    { wch: 8 },  // Rate
    { wch: 10 }, // Amount
    { wch: 15 }, // PAN No.
    { wch: 18 }, // 10% Tax Deduction
    { wch: 18 }, // Total Pay Amount
    { wch: 15 }, // Bills ref. page
  ];

  // Merge cells for header
  worksheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } }, // DAVV, Indore
    { s: { r: 1, c: 0 }, e: { r: 1, c: 9 } }, // B.Voc.
    { s: { r: 2, c: 0 }, e: { r: 2, c: 9 } }, // Title
  ];

  XLSX.writeFile(workbook, `VF_Bills_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportMonthlySummary = (
  bills: BillEntry[],
  faculty: FacultyDetails[],
  month: string,
  year: number
) => {
  const filteredBills = bills.filter(
    (bill) => bill.month === month && bill.year === year
  );

  // Group bills by faculty
  const groupedBills = filteredBills.reduce((acc, bill) => {
    const key = `${bill.facultyId}-${bill.subject}-${bill.className}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(bill);
    return acc;
  }, {} as Record<string, BillEntry[]>);

  const rows: any[][] = [];
  
  // Header rows
  rows.push(['DAVV, Indore']);
  rows.push(['B.Voc.']);
  rows.push([`Visiting Faculty Salary Bill ${month} ${year}`]);
  rows.push([]);
  rows.push(['S.No.', 'Name/Class', 'Month', 'No. of Lectures', 'Rate', 'Amount', 'PAN No.', '10% Tax Deduction', 'Total Pay Amount', 'Bills ref. page']);

  let serialNo = 1;
  let pageRef = 1;

  Object.entries(groupedBills).forEach(([key, groupBills]) => {
    const firstBill = groupBills[0];
    const facultyDetails = faculty.find((f) => f.id === firstBill.facultyId);
    
    groupBills.forEach((bill, index) => {
      const taxDeduction = Math.round(bill.totalAmount * TAX_RATE);
      const totalPayAmount = bill.totalAmount - taxDeduction;
      const monthYear = `${bill.month.substring(0, 3)}-${String(bill.year).substring(2)}`;
      
      if (index === 0) {
        rows.push([
          serialNo,
          firstBill.facultyName,
          monthYear,
          bill.totalHours,
          bill.ratePerHour,
          bill.totalAmount,
          facultyDetails?.panNumber || '',
          taxDeduction,
          totalPayAmount,
          pageRef++
        ]);
      } else if (index === 1) {
        rows.push([
          '',
          `${firstBill.subject}`,
          monthYear,
          bill.totalHours,
          bill.ratePerHour,
          bill.totalAmount,
          '',
          Math.round(bill.totalAmount * TAX_RATE),
          bill.totalAmount - Math.round(bill.totalAmount * TAX_RATE),
          pageRef++
        ]);
      } else if (index === 2) {
        rows.push([
          '',
          firstBill.className,
          monthYear,
          bill.totalHours,
          bill.ratePerHour,
          bill.totalAmount,
          '',
          Math.round(bill.totalAmount * TAX_RATE),
          bill.totalAmount - Math.round(bill.totalAmount * TAX_RATE),
          pageRef++
        ]);
      } else {
        rows.push([
          '',
          '',
          monthYear,
          bill.totalHours,
          bill.ratePerHour,
          bill.totalAmount,
          '',
          Math.round(bill.totalAmount * TAX_RATE),
          bill.totalAmount - Math.round(bill.totalAmount * TAX_RATE),
          pageRef++
        ]);
      }
    });

    // Subtotal row
    const totalHours = groupBills.reduce((sum, b) => sum + b.totalHours, 0);
    const totalAmount = groupBills.reduce((sum, b) => sum + b.totalAmount, 0);
    const totalTax = Math.round(totalAmount * TAX_RATE);
    const totalPay = totalAmount - totalTax;

    rows.push(['', '', '', totalHours, '', totalAmount, '', totalTax, totalPay, '']);
    rows.push([]);

    serialNo++;
  });

  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Monthly Summary');

  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 25 },
    { wch: 10 },
    { wch: 15 },
    { wch: 8 },
    { wch: 10 },
    { wch: 15 },
    { wch: 18 },
    { wch: 18 },
    { wch: 15 },
  ];

  worksheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 9 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 9 } },
  ];

  XLSX.writeFile(workbook, `VF_Monthly_Summary_${month}_${year}.xlsx`);
};

export const exportAllFacultyToExcel = (faculty: FacultyDetails[]) => {
  const data = faculty.map((f) => ({
    'Name': f.name,
    'Email': f.email,
    'Phone': f.phone,
    'Bank Account': f.bankAccountNumber,
    'IFSC Code': f.ifscCode,
    'Bank Name': f.bankName,
    'PAN Number': f.panNumber,
    'Aadhar Number': f.aadharNumber,
    'Registered On': new Date(f.createdAt).toLocaleDateString(),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Faculty List');

  const maxWidth = 20;
  const colWidths = Object.keys(data[0] || {}).map(() => ({ wch: maxWidth }));
  worksheet['!cols'] = colWidths;

  XLSX.writeFile(workbook, 'Faculty_List.xlsx');
};

// Personal Summary - Faculty-wise honorarium summary
export const exportPersonalSummary = (
  bills: BillEntry[],
  faculty: FacultyDetails[],
  startMonth: string,
  endMonth: string,
  year: number
) => {
  const rows: any[][] = [];
  
  // Header rows
  rows.push(['DEEN DAYAL UPADHYAY KAUSHAL KENDRA, D.A.V.V., Indore']);
  rows.push(['Summary of Honorarium of Visiting Faculty']);
  rows.push([`for the Period of ${startMonth} - ${endMonth} ${year}`]);
  rows.push(['State Bank of India']);
  rows.push([]);
  rows.push(['S.No', 'Name of Faculty', 'Bank Details', 'PAN Number', 'Amount Paid (in Rupees)', 'TAX Deduction (10%)', 'Total Pay Amount']);

  // Get month indices for filtering
  const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const startIdx = monthOrder.indexOf(startMonth);
  const endIdx = monthOrder.indexOf(endMonth);
  
  // Filter bills by period
  const filteredBills = bills.filter(bill => {
    if (bill.year !== year) return false;
    const billMonthIdx = monthOrder.indexOf(bill.month);
    return billMonthIdx >= startIdx && billMonthIdx <= endIdx;
  });

  // Group bills by faculty
  const facultyTotals = new Map<string, { faculty: FacultyDetails; total: number }>();
  
  filteredBills.forEach(bill => {
    const fac = faculty.find(f => f.id === bill.facultyId);
    if (!fac) return;
    
    const existing = facultyTotals.get(bill.facultyId);
    if (existing) {
      existing.total += bill.totalAmount;
    } else {
      facultyTotals.set(bill.facultyId, { faculty: fac, total: bill.totalAmount });
    }
  });

  let serialNo = 1;
  let grandTotalAmount = 0;
  let grandTotalTax = 0;
  let grandTotalPay = 0;

  facultyTotals.forEach(({ faculty: fac, total }) => {
    const taxDeduction = Math.round(total * TAX_RATE);
    const totalPay = total - taxDeduction;
    
    grandTotalAmount += total;
    grandTotalTax += taxDeduction;
    grandTotalPay += totalPay;

    rows.push([
      serialNo++,
      fac.name.toUpperCase(),
      1, // Bank details reference
      fac.panNumber,
      total,
      taxDeduction,
      totalPay
    ]);
  });

  // Add total row
  rows.push(['TOTAL', '', '', '', `${grandTotalAmount}/-`, `${grandTotalTax}/-`, `${grandTotalPay}/-`]);

  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Personal Summary');

  worksheet['!cols'] = [
    { wch: 8 },   // S.No
    { wch: 25 },  // Name of Faculty
    { wch: 15 },  // Bank Details
    { wch: 15 },  // PAN Number
    { wch: 22 },  // Amount Paid
    { wch: 20 },  // TAX Deduction
    { wch: 18 },  // Total Pay Amount
  ];

  worksheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 6 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: 6 } },
  ];

  XLSX.writeFile(workbook, `Personal_Summary_VF_${startMonth}_${endMonth}_${year}.xlsx`);
};

// Get personal summary data for display
export const getPersonalSummaryData = (
  bills: BillEntry[],
  faculty: FacultyDetails[],
  startMonth: string,
  endMonth: string,
  year: number
) => {
  const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const startIdx = monthOrder.indexOf(startMonth);
  const endIdx = monthOrder.indexOf(endMonth);
  
  const filteredBills = bills.filter(bill => {
    if (bill.year !== year) return false;
    const billMonthIdx = monthOrder.indexOf(bill.month);
    return billMonthIdx >= startIdx && billMonthIdx <= endIdx;
  });

  const facultyTotals = new Map<string, { faculty: FacultyDetails; total: number }>();
  
  filteredBills.forEach(bill => {
    const fac = faculty.find(f => f.id === bill.facultyId);
    if (!fac) return;
    
    const existing = facultyTotals.get(bill.facultyId);
    if (existing) {
      existing.total += bill.totalAmount;
    } else {
      facultyTotals.set(bill.facultyId, { faculty: fac, total: bill.totalAmount });
    }
  });

  const summaryRows: Array<{
    sno: number;
    name: string;
    bankDetails: string;
    panNumber: string;
    amount: number;
    tax: number;
    totalPay: number;
  }> = [];

  let sno = 1;
  facultyTotals.forEach(({ faculty: fac, total }) => {
    const tax = Math.round(total * TAX_RATE);
    summaryRows.push({
      sno: sno++,
      name: fac.name.toUpperCase(),
      bankDetails: fac.bankName,
      panNumber: fac.panNumber,
      amount: total,
      tax: tax,
      totalPay: total - tax
    });
  });

  const totals = summaryRows.reduce((acc, row) => ({
    amount: acc.amount + row.amount,
    tax: acc.tax + row.tax,
    totalPay: acc.totalPay + row.totalPay
  }), { amount: 0, tax: 0, totalPay: 0 });

  return { rows: summaryRows, totals };
};
