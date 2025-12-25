import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { BillEntry, FacultyDetails } from '@/types/billing';
import { exportBillsToExcel, exportMonthlySummary, exportPersonalSummary, getPersonalSummaryData } from '@/utils/excelExport';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { 
  Shield, LogOut, Search, FileSpreadsheet, Users, FileText, 
  Settings, IndianRupee, Clock, CheckCircle, Download, Eye, Trash2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [bills, setBills] = useState<BillEntry[]>([]);
  const [faculty, setFaculty] = useState<FacultyDetails[]>([]);
  const [ratePerHour, setRatePerHour] = useState(500);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [startMonth, setStartMonth] = useState('January');
  const [endMonth, setEndMonth] = useState('May');
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyDetails | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }

    loadData();
  }, [user, navigate]);

  const loadData = () => {
    const savedBills = localStorage.getItem('bills');
    if (savedBills) setBills(JSON.parse(savedBills));

    const savedFaculty = localStorage.getItem('faculty');
    if (savedFaculty) setFaculty(JSON.parse(savedFaculty));

    const savedRate = localStorage.getItem('ratePerHour');
    if (savedRate) setRatePerHour(Number(savedRate));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleUpdateStatus = (billId: string, newStatus: 'pending' | 'approved' | 'paid') => {
    const updatedBills = bills.map(bill =>
      bill.id === billId ? { ...bill, status: newStatus } : bill
    );
    setBills(updatedBills);
    localStorage.setItem('bills', JSON.stringify(updatedBills));
    toast({ title: 'Status Updated', description: `Bill status changed to ${newStatus}` });
  };

  const handleUpdateRate = () => {
    localStorage.setItem('ratePerHour', ratePerHour.toString());
    toast({ title: 'Rate Updated', description: `Rate per hour set to ₹${ratePerHour}` });
  };

  const handleDeleteFaculty = (facultyId: string) => {
    const updatedFaculty = faculty.filter(f => f.id !== facultyId);
    setFaculty(updatedFaculty);
    localStorage.setItem('faculty', JSON.stringify(updatedFaculty));
    
    // Also delete their bills
    const updatedBills = bills.filter(b => b.facultyId !== facultyId);
    setBills(updatedBills);
    localStorage.setItem('bills', JSON.stringify(updatedBills));
    
    toast({ title: 'Faculty Deleted', description: 'Faculty and their bills have been removed' });
  };

  const handleExportBills = () => {
    const filteredBills = getFilteredBills();
    if (filteredBills.length === 0) {
      toast({ title: 'No Bills', description: 'No bills to export', variant: 'destructive' });
      return;
    }
    exportBillsToExcel(filteredBills, faculty);
    toast({ title: 'Export Complete', description: 'Excel file downloaded successfully' });
  };

  const handleExportSummary = () => {
    if (!selectedMonth || !selectedYear) {
      toast({ title: 'Select Period', description: 'Please select month and year', variant: 'destructive' });
      return;
    }
    exportMonthlySummary(bills, faculty, selectedMonth, Number(selectedYear));
    toast({ title: 'Summary Exported', description: 'Monthly summary downloaded' });
  };

  const handleExportPersonalSummary = () => {
    if (!startMonth || !endMonth || !selectedYear) {
      toast({ title: 'Select Period', description: 'Please select start month, end month, and year', variant: 'destructive' });
      return;
    }
    exportPersonalSummary(bills, faculty, startMonth, endMonth, Number(selectedYear));
    toast({ title: 'Summary Exported', description: 'Personal summary downloaded' });
  };

  const personalSummaryData = getPersonalSummaryData(bills, faculty, startMonth, endMonth, Number(selectedYear));

  // Filter faculty by search query
  const filteredFaculty = faculty.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get filtered bills
  const getFilteredBills = () => {
    return bills.filter(bill => {
      const matchesMonth = !selectedMonth || bill.month === selectedMonth;
      const matchesYear = !selectedYear || bill.year === Number(selectedYear);
      const matchesSearch = !searchQuery || 
        bill.facultyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bill.facultyId.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesMonth && matchesYear && matchesSearch;
    });
  };

  // Get faculty bills for detail view
  const getFacultyBills = (facultyId: string) => {
    return bills.filter(b => b.facultyId === facultyId);
  };

  const totalRevenue = bills.reduce((sum, b) => sum + b.totalAmount, 0);
  const pendingAmount = bills.filter(b => b.status === 'pending').reduce((sum, b) => sum + b.totalAmount, 0);
  const paidAmount = bills.filter(b => b.status === 'paid').reduce((sum, b) => sum + b.totalAmount, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-accent text-accent-foreground">Approved</Badge>;
      case 'paid':
        return <Badge className="bg-success text-success-foreground">Paid</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Manage faculty & billing</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Faculty</p>
                  <p className="text-xl font-bold text-foreground">{faculty.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <IndianRupee className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-xl font-bold text-foreground">₹{totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-xl font-bold text-foreground">₹{pendingAmount.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Paid</p>
                  <p className="text-xl font-bold text-foreground">₹{paidAmount.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search faculty by name, ID, or email..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  {MONTHS.map((month) => (
                    <SelectItem key={month} value={month}>{month}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="Year"
                className="w-full md:w-24"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="faculty" className="space-y-6">
          <TabsList>
            <TabsTrigger value="faculty" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Faculty
            </TabsTrigger>
            <TabsTrigger value="bills" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Bills
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="faculty">
            <Card>
              <CardHeader>
                <CardTitle>Registered Faculty</CardTitle>
                <CardDescription>View and manage all registered faculty members</CardDescription>
              </CardHeader>
              <CardContent>
                {filteredFaculty.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No faculty found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Total Bills</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredFaculty.map((f) => (
                          <TableRow key={f.id}>
                            <TableCell className="font-mono text-sm">{f.id}</TableCell>
                            <TableCell className="font-medium">{f.name}</TableCell>
                            <TableCell>{f.email}</TableCell>
                            <TableCell>{f.phone}</TableCell>
                            <TableCell>{getFacultyBills(f.id).length}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => setSelectedFaculty(f)}
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
                                    <DialogHeader>
                                      <DialogTitle>Faculty Details - {f.name}</DialogTitle>
                                      <DialogDescription>Complete profile and billing history</DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-6">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <p className="text-sm text-muted-foreground">Email</p>
                                          <p className="font-medium">{f.email}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-muted-foreground">Phone</p>
                                          <p className="font-medium">{f.phone}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-muted-foreground">Bank</p>
                                          <p className="font-medium">{f.bankName}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-muted-foreground">Account</p>
                                          <p className="font-medium font-mono">****{f.bankAccountNumber.slice(-4)}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-muted-foreground">PAN</p>
                                          <p className="font-medium font-mono">{f.panNumber}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-muted-foreground">Aadhar</p>
                                          <p className="font-medium font-mono">****{f.aadharNumber.slice(-4)}</p>
                                        </div>
                                      </div>
                                      <div>
                                        <h4 className="font-semibold mb-3">Billing History</h4>
                                        {getFacultyBills(f.id).length === 0 ? (
                                          <p className="text-muted-foreground">No bills yet</p>
                                        ) : (
                                          <Table>
                                            <TableHeader>
                                              <TableRow>
                                                <TableHead>Month</TableHead>
                                                <TableHead>Class</TableHead>
                                                <TableHead>Hours</TableHead>
                                                <TableHead>Amount</TableHead>
                                                <TableHead>Status</TableHead>
                                              </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                              {getFacultyBills(f.id).map((bill) => (
                                                <TableRow key={bill.id}>
                                                  <TableCell>{bill.month} {bill.year}</TableCell>
                                                  <TableCell>{bill.className}</TableCell>
                                                  <TableCell>{bill.totalHours}</TableCell>
                                                  <TableCell>₹{bill.totalAmount.toLocaleString()}</TableCell>
                                                  <TableCell>{getStatusBadge(bill.status)}</TableCell>
                                                </TableRow>
                                              ))}
                                            </TableBody>
                                          </Table>
                                        )}
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => handleDeleteFaculty(f.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bills">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>All Bills</CardTitle>
                  <CardDescription>Manage and update bill statuses</CardDescription>
                </div>
                <Button onClick={handleExportBills}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Bills
                </Button>
              </CardHeader>
              <CardContent>
                {getFilteredBills().length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No bills found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Bill ID</TableHead>
                          <TableHead>Faculty</TableHead>
                          <TableHead>Class</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Month/Year</TableHead>
                          <TableHead>Hours</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getFilteredBills().map((bill) => (
                          <TableRow key={bill.id}>
                            <TableCell className="font-mono text-sm">{bill.id}</TableCell>
                            <TableCell className="font-medium">{bill.facultyName}</TableCell>
                            <TableCell>{bill.className}</TableCell>
                            <TableCell>{bill.subject}</TableCell>
                            <TableCell>{bill.month} {bill.year}</TableCell>
                            <TableCell>{bill.totalHours}</TableCell>
                            <TableCell className="font-semibold">₹{bill.totalAmount.toLocaleString()}</TableCell>
                            <TableCell>{getStatusBadge(bill.status)}</TableCell>
                            <TableCell>
                              <Select
                                value={bill.status}
                                onValueChange={(value: 'pending' | 'approved' | 'paid') => 
                                  handleUpdateStatus(bill.id, value)
                                }
                              >
                                <SelectTrigger className="w-28">
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
          </TabsContent>

          <TabsContent value="reports">
            <div className="space-y-6">
              {/* Monthly Summary Export */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Summary Report</CardTitle>
                  <CardDescription>Export detailed monthly bill reports</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Month</Label>
                      <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select month" />
                        </SelectTrigger>
                        <SelectContent>
                          {MONTHS.map((month) => (
                            <SelectItem key={month} value={month}>{month}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Year</Label>
                      <Input
                        type="number"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={handleExportSummary} className="w-full">
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        Export Monthly Summary
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Personal Summary - Faculty Honorarium */}
              <Card>
                <CardHeader>
                  <CardTitle>Personal Summary - Faculty Honorarium</CardTitle>
                  <CardDescription>Summary of honorarium for visiting faculty by period</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Start Month</Label>
                      <Select value={startMonth} onValueChange={setStartMonth}>
                        <SelectTrigger>
                          <SelectValue placeholder="Start month" />
                        </SelectTrigger>
                        <SelectContent>
                          {MONTHS.map((month) => (
                            <SelectItem key={month} value={month}>{month}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>End Month</Label>
                      <Select value={endMonth} onValueChange={setEndMonth}>
                        <SelectTrigger>
                          <SelectValue placeholder="End month" />
                        </SelectTrigger>
                        <SelectContent>
                          {MONTHS.map((month) => (
                            <SelectItem key={month} value={month}>{month}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Year</Label>
                      <Input
                        type="number"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={handleExportPersonalSummary} className="w-full">
                        <Download className="w-4 h-4 mr-2" />
                        Download Summary
                      </Button>
                    </div>
                  </div>

                  {/* Summary Preview Table */}
                  <div className="mt-6">
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-muted/50 p-4 text-center space-y-1">
                        <h3 className="font-bold text-lg">DEEN DAYAL UPADHYAY KAUSHAL KENDRA, D.A.V.V., Indore</h3>
                        <p className="text-muted-foreground">Summary of Honorarium of Visiting Faculty</p>
                        <p className="text-sm text-muted-foreground">for the Period of {startMonth} - {endMonth} {selectedYear}</p>
                        <p className="text-sm text-muted-foreground">State Bank of India</p>
                      </div>
                      
                      {personalSummaryData.rows.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No bills found for this period</p>
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-16">S.No</TableHead>
                              <TableHead>Name of Faculty</TableHead>
                              <TableHead>Bank Details</TableHead>
                              <TableHead>PAN Number</TableHead>
                              <TableHead className="text-right">Amount Paid</TableHead>
                              <TableHead className="text-right">TAX Deduction (10%)</TableHead>
                              <TableHead className="text-right">Total Pay Amount</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {personalSummaryData.rows.map((row) => (
                              <TableRow key={row.sno}>
                                <TableCell>{row.sno}</TableCell>
                                <TableCell className="font-medium">{row.name}</TableCell>
                                <TableCell>{row.bankDetails}</TableCell>
                                <TableCell className="font-mono">{row.panNumber}</TableCell>
                                <TableCell className="text-right">₹{row.amount.toLocaleString()}</TableCell>
                                <TableCell className="text-right text-destructive">₹{row.tax.toLocaleString()}</TableCell>
                                <TableCell className="text-right font-semibold text-success">₹{row.totalPay.toLocaleString()}</TableCell>
                              </TableRow>
                            ))}
                            <TableRow className="bg-muted/50 font-bold">
                              <TableCell colSpan={4} className="text-right">TOTAL</TableCell>
                              <TableCell className="text-right">₹{personalSummaryData.totals.amount.toLocaleString()}/-</TableCell>
                              <TableCell className="text-right text-destructive">₹{personalSummaryData.totals.tax.toLocaleString()}/-</TableCell>
                              <TableCell className="text-right text-success">₹{personalSummaryData.totals.totalPay.toLocaleString()}/-</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Billing Settings</CardTitle>
                <CardDescription>Configure billing rates and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-w-md space-y-2">
                  <Label htmlFor="rate">Rate Per Hour (₹)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="rate"
                      type="number"
                      value={ratePerHour}
                      onChange={(e) => setRatePerHour(Number(e.target.value))}
                    />
                    <Button onClick={handleUpdateRate}>
                      Save
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This rate will be used for all new bill calculations
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
