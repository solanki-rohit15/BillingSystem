import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BillEntry, FacultyDetails } from '@/types/billing';
import { exportBillsToExcel } from '@/utils/excelExport';
import { FileSpreadsheet, IndianRupee, Calendar, Filter } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface BillsListProps {
  bills: BillEntry[];
  faculty: FacultyDetails[];
  onUpdateStatus: (billId: string, status: BillEntry['status']) => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const BillsList = ({ bills, faculty, onUpdateStatus }: BillsListProps) => {
  const currentDate = new Date();
  const [filterMonth, setFilterMonth] = useState(MONTHS[currentDate.getMonth()]);
  const [filterYear, setFilterYear] = useState(currentDate.getFullYear().toString());

  const filteredBills = bills.filter(
    (bill) => bill.month === filterMonth && bill.year === parseInt(filterYear)
  );

  const totalAmount = filteredBills.reduce((sum, bill) => sum + bill.totalAmount, 0);

  const handleExport = () => {
    if (filteredBills.length === 0) {
      toast.error('No bills to export for selected period');
      return;
    }
    exportBillsToExcel(filteredBills, faculty);
    toast.success('Excel file downloaded successfully!');
  };

  const getStatusBadge = (status: BillEntry['status']) => {
    const variants = {
      pending: 'bg-warning/10 text-warning border-warning/20',
      approved: 'bg-primary/10 text-primary border-primary/20',
      paid: 'bg-success/10 text-success border-success/20',
    };
    return (
      <Badge variant="outline" className={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <Card className="glass-card animate-fade-in">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              Bills Overview
            </CardTitle>
            <CardDescription>
              View and export monthly payment receipts
            </CardDescription>
          </div>
          <Button onClick={handleExport} variant="outline" className="gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Export to Excel
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filter:</span>
          </div>
          <Select value={filterMonth} onValueChange={setFilterMonth}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((month) => (
                <SelectItem key={month} value={month}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2023, 2024, 2025, 2026].map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Summary Card */}
        <div className="mb-6 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Total for {filterMonth} {filterYear}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {filteredBills.length} bill(s)
              </p>
            </div>
            <div className="flex items-center gap-1 text-3xl font-bold">
              <IndianRupee className="h-7 w-7" />
              {totalAmount.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Bills Table */}
        {filteredBills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No bills for selected period</p>
            <p className="text-sm text-muted-foreground/70">
              Create a bill to see it here
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Faculty</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead className="text-center">Hours</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBills.map((bill) => (
                  <TableRow key={bill.id} className="animate-slide-in">
                    <TableCell className="font-medium">{bill.facultyName}</TableCell>
                    <TableCell>{bill.className}</TableCell>
                    <TableCell>{bill.subject}</TableCell>
                    <TableCell className="text-center">{bill.totalHours}</TableCell>
                    <TableCell className="text-right font-medium">
                      ₹{bill.totalAmount.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(bill.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Select
                        value={bill.status}
                        onValueChange={(value) =>
                          onUpdateStatus(bill.id, value as BillEntry['status'])
                        }
                      >
                        <SelectTrigger className="w-[100px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
