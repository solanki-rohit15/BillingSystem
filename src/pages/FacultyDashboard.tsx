import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { BillEntry, FacultyDetails } from '@/types/billing';
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
  GraduationCap, LogOut, Plus, FileText, User, Clock, 
  IndianRupee, Calendar, BookOpen
} from 'lucide-react';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const FacultyDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, getFacultyDetails } = useAuth();
  const [bills, setBills] = useState<BillEntry[]>([]);
  const [ratePerHour, setRatePerHour] = useState(500);
  const [facultyDetails, setFacultyDetails] = useState<FacultyDetails | null>(null);
  
  const [formData, setFormData] = useState({
    className: '',
    subject: '',
    dates: '',
    totalHours: '',
    month: '',
    year: new Date().getFullYear().toString()
  });

  useEffect(() => {
    if (!user || user.role !== 'faculty') {
      navigate('/login');
      return;
    }

    const details = getFacultyDetails();
    setFacultyDetails(details);

    const savedBills = localStorage.getItem('bills');
    if (savedBills) {
      const allBills: BillEntry[] = JSON.parse(savedBills);
      setBills(allBills.filter(b => b.facultyId === user.id));
    }

    const savedRate = localStorage.getItem('ratePerHour');
    if (savedRate) setRatePerHour(Number(savedRate));
  }, [user, navigate, getFacultyDetails]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !facultyDetails) return;

    const newBill: BillEntry = {
      id: `BILL-${Date.now()}`,
      facultyId: user.id,
      facultyName: user.name,
      className: formData.className,
      subject: formData.subject,
      dates: formData.dates.split(',').map(d => d.trim()),
      totalHours: Number(formData.totalHours),
      ratePerHour,
      totalAmount: Number(formData.totalHours) * ratePerHour,
      month: formData.month,
      year: Number(formData.year),
      status: 'pending',
      createdAt: new Date()
    };

    const allBills: BillEntry[] = JSON.parse(localStorage.getItem('bills') || '[]');
    allBills.push(newBill);
    localStorage.setItem('bills', JSON.stringify(allBills));
    
    setBills([...bills, newBill]);
    setFormData({
      className: '',
      subject: '',
      dates: '',
      totalHours: '',
      month: '',
      year: new Date().getFullYear().toString()
    });

    toast({ title: 'Bill Submitted!', description: 'Your bill entry has been submitted for approval' });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const totalEarnings = bills.reduce((sum, b) => sum + b.totalAmount, 0);
  const pendingBills = bills.filter(b => b.status === 'pending').length;
  const paidBills = bills.filter(b => b.status === 'paid').length;

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
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display font-bold text-foreground">Faculty Portal</h1>
              <p className="text-sm text-muted-foreground">Welcome, {user?.name}</p>
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
                  <IndianRupee className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                  <p className="text-xl font-bold text-foreground">₹{totalEarnings.toLocaleString()}</p>
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
                  <p className="text-sm text-muted-foreground">Pending Bills</p>
                  <p className="text-xl font-bold text-foreground">{pendingBills}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Paid Bills</p>
                  <p className="text-xl font-bold text-foreground">{paidBills}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rate/Hour</p>
                  <p className="text-xl font-bold text-foreground">₹{ratePerHour}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="new-entry" className="space-y-6">
          <TabsList>
            <TabsTrigger value="new-entry" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Entry
            </TabsTrigger>
            <TabsTrigger value="my-bills" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              My Bills
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="new-entry">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Submit New Bill Entry
                </CardTitle>
                <CardDescription>Fill in your lecture details for billing</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="className">Class Name *</Label>
                      <Input
                        id="className"
                        placeholder="e.g., BCA 3rd Year"
                        value={formData.className}
                        onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        placeholder="e.g., Data Structures"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dates">Lecture Dates *</Label>
                      <Input
                        id="dates"
                        placeholder="e.g., 1, 3, 5, 8, 10"
                        value={formData.dates}
                        onChange={(e) => setFormData({ ...formData, dates: e.target.value })}
                        required
                      />
                      <p className="text-xs text-muted-foreground">Enter dates separated by commas</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="totalHours">Total Hours *</Label>
                      <Input
                        id="totalHours"
                        type="number"
                        min="1"
                        placeholder="Enter total hours"
                        value={formData.totalHours}
                        onChange={(e) => setFormData({ ...formData, totalHours: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="month">Month *</Label>
                      <Select
                        value={formData.month}
                        onValueChange={(value) => setFormData({ ...formData, month: value })}
                      >
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
                      <Label htmlFor="year">Year *</Label>
                      <Input
                        id="year"
                        type="number"
                        min="2020"
                        max="2030"
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {formData.totalHours && (
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Calculated Amount:</span>
                          <span className="text-2xl font-bold text-primary">
                            ₹{(Number(formData.totalHours) * ratePerHour).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formData.totalHours} hours × ₹{ratePerHour}/hour
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  <Button type="submit" className="w-full" size="lg">
                    <Plus className="w-4 h-4 mr-2" />
                    Submit Bill Entry
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="my-bills">
            <Card>
              <CardHeader>
                <CardTitle>My Bill History</CardTitle>
                <CardDescription>View all your submitted bills and their status</CardDescription>
              </CardHeader>
              <CardContent>
                {bills.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No bills submitted yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Bill ID</TableHead>
                          <TableHead>Class</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Month/Year</TableHead>
                          <TableHead>Hours</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bills.map((bill) => (
                          <TableRow key={bill.id}>
                            <TableCell className="font-mono text-sm">{bill.id}</TableCell>
                            <TableCell>{bill.className}</TableCell>
                            <TableCell>{bill.subject}</TableCell>
                            <TableCell>{bill.month} {bill.year}</TableCell>
                            <TableCell>{bill.totalHours}</TableCell>
                            <TableCell className="font-semibold">₹{bill.totalAmount.toLocaleString()}</TableCell>
                            <TableCell>{getStatusBadge(bill.status)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>My Profile</CardTitle>
                <CardDescription>Your registered details</CardDescription>
              </CardHeader>
              <CardContent>
                {facultyDetails && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold border-b pb-2">Personal Information</h3>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-medium">{facultyDetails.name}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{facultyDetails.email}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{facultyDetails.phone}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-semibold border-b pb-2">Bank Details</h3>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Bank Name</p>
                        <p className="font-medium">{facultyDetails.bankName}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Account Number</p>
                        <p className="font-medium font-mono">
                          ****{facultyDetails.bankAccountNumber.slice(-4)}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">IFSC Code</p>
                        <p className="font-medium font-mono">{facultyDetails.ifscCode}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default FacultyDashboard;
