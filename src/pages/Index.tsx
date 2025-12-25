import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FacultyForm } from '@/components/FacultyForm';
import { FacultyList } from '@/components/FacultyList';
import { BillForm } from '@/components/BillForm';
import { BillsList } from '@/components/BillsList';
import { RateSettings } from '@/components/RateSettings';
import { FacultyDetails, BillEntry } from '@/types/billing';
import { Receipt, Users, FileSpreadsheet, Settings, GraduationCap } from 'lucide-react';

const Index = () => {
  const [faculty, setFaculty] = useState<FacultyDetails[]>(() => {
    const saved = localStorage.getItem('faculty');
    return saved ? JSON.parse(saved) : [];
  });

  const [bills, setBills] = useState<BillEntry[]>(() => {
    const saved = localStorage.getItem('bills');
    return saved ? JSON.parse(saved) : [];
  });

  const [ratePerHour, setRatePerHour] = useState(() => {
    const saved = localStorage.getItem('ratePerHour');
    return saved ? parseFloat(saved) : 500;
  });

  useEffect(() => {
    localStorage.setItem('faculty', JSON.stringify(faculty));
  }, [faculty]);

  useEffect(() => {
    localStorage.setItem('bills', JSON.stringify(bills));
  }, [bills]);

  useEffect(() => {
    localStorage.setItem('ratePerHour', ratePerHour.toString());
  }, [ratePerHour]);

  const handleAddFaculty = (newFaculty: FacultyDetails) => {
    setFaculty((prev) => [...prev, newFaculty]);
  };

  const handleDeleteFaculty = (id: string) => {
    setFaculty((prev) => prev.filter((f) => f.id !== id));
  };

  const handleAddBill = (newBill: BillEntry) => {
    setBills((prev) => [...prev, newBill]);
  };

  const handleUpdateBillStatus = (billId: string, status: BillEntry['status']) => {
    setBills((prev) =>
      prev.map((bill) => (bill.id === billId ? { ...bill, status } : bill))
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Faculty Billing Portal</h1>
              <p className="text-sm text-muted-foreground">
                Manage visiting faculty payments
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="bills" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4 mx-auto">
            <TabsTrigger value="bills" className="gap-2">
              <Receipt className="h-4 w-4" />
              <span className="hidden sm:inline">Bills</span>
            </TabsTrigger>
            <TabsTrigger value="faculty" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Faculty</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Bills Tab */}
          <TabsContent value="bills" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <BillForm
                faculty={faculty}
                ratePerHour={ratePerHour}
                onSubmit={handleAddBill}
              />
              <div className="space-y-6">
                <RateSettings
                  ratePerHour={ratePerHour}
                  onUpdateRate={setRatePerHour}
                />
              </div>
            </div>
          </TabsContent>

          {/* Faculty Tab */}
          <TabsContent value="faculty" className="space-y-6">
            <FacultyForm onSubmit={handleAddFaculty} />
            <FacultyList faculty={faculty} onDelete={handleDeleteFaculty} />
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <BillsList
              bills={bills}
              faculty={faculty}
              onUpdateStatus={handleUpdateBillStatus}
            />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="max-w-xl">
            <RateSettings
              ratePerHour={ratePerHour}
              onUpdateRate={setRatePerHour}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Faculty Billing Portal • Manage visiting faculty payments efficiently</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
