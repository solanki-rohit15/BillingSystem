import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BillEntry, FacultyDetails } from '@/types/billing';
import { Receipt, Calculator, Clock, IndianRupee } from 'lucide-react';
import { toast } from 'sonner';

interface BillFormProps {
  faculty: FacultyDetails[];
  ratePerHour: number;
  onSubmit: (bill: BillEntry) => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const BillForm = ({ faculty, ratePerHour, onSubmit }: BillFormProps) => {
  const [formData, setFormData] = useState({
    facultyId: '',
    className: '',
    subject: '',
    dates: '',
    totalHours: '',
    month: '',
    year: new Date().getFullYear().toString(),
  });

  const [calculatedAmount, setCalculatedAmount] = useState(0);

  useEffect(() => {
    const hours = parseFloat(formData.totalHours) || 0;
    setCalculatedAmount(hours * ratePerHour);
  }, [formData.totalHours, ratePerHour]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.facultyId) return 'Please select a faculty member';
    if (!formData.className.trim()) return 'Class name is required';
    if (!formData.subject.trim()) return 'Subject is required';
    if (!formData.dates.trim()) return 'Lecture dates are required';
    if (!formData.totalHours || parseFloat(formData.totalHours) <= 0) return 'Valid total hours required';
    if (!formData.month) return 'Please select a month';
    if (!formData.year) return 'Year is required';
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }

    const selectedFaculty = faculty.find((f) => f.id === formData.facultyId);
    if (!selectedFaculty) {
      toast.error('Faculty not found');
      return;
    }

    const bill: BillEntry = {
      id: crypto.randomUUID(),
      facultyId: formData.facultyId,
      facultyName: selectedFaculty.name,
      className: formData.className,
      subject: formData.subject,
      dates: formData.dates.split(',').map((d) => d.trim()),
      totalHours: parseFloat(formData.totalHours),
      ratePerHour,
      totalAmount: calculatedAmount,
      month: formData.month,
      year: parseInt(formData.year),
      status: 'pending',
      createdAt: new Date(),
    };

    onSubmit(bill);
    setFormData({
      facultyId: '',
      className: '',
      subject: '',
      dates: '',
      totalHours: '',
      month: '',
      year: new Date().getFullYear().toString(),
    });
    toast.success('Bill created successfully!');
  };

  return (
    <Card className="glass-card animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-primary" />
          Create Bill
        </CardTitle>
        <CardDescription>
          Enter lecture details to generate a bill automatically
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Faculty Selection */}
          <div className="space-y-2">
            <Label>Select Faculty</Label>
            <Select
              value={formData.facultyId}
              onValueChange={(value) => handleSelectChange('facultyId', value)}
            >
              <SelectTrigger className="input-field">
                <SelectValue placeholder="Choose faculty member" />
              </SelectTrigger>
              <SelectContent>
                {faculty.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No faculty registered
                  </SelectItem>
                ) : (
                  faculty.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Class Details */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="className">Class Name</Label>
              <Input
                id="className"
                name="className"
                placeholder="e.g., B.Tech CSE 3rd Year"
                value={formData.className}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                name="subject"
                placeholder="e.g., Data Structures"
                value={formData.subject}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>

          {/* Dates and Hours */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dates">Lecture Dates (comma separated)</Label>
              <Input
                id="dates"
                name="dates"
                placeholder="e.g., 1st, 5th, 10th, 15th, 20th"
                value={formData.dates}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="totalHours" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Total Hours
                </Label>
                <Input
                  id="totalHours"
                  name="totalHours"
                  type="number"
                  step="0.5"
                  min="0"
                  placeholder="e.g., 10"
                  value={formData.totalHours}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div className="space-y-2">
                <Label>Month</Label>
                <Select
                  value={formData.month}
                  onValueChange={(value) => handleSelectChange('month', value)}
                >
                  <SelectTrigger className="input-field">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((month) => (
                      <SelectItem key={month} value={month}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  name="year"
                  type="number"
                  min="2020"
                  max="2030"
                  value={formData.year}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Calculation Preview */}
          <div className="rounded-lg bg-accent/10 border border-accent/20 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calculator className="h-5 w-5" />
                <span>Calculated Amount</span>
              </div>
              <div className="flex items-center gap-1 text-2xl font-bold text-accent">
                <IndianRupee className="h-6 w-6" />
                {calculatedAmount.toLocaleString('en-IN')}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {formData.totalHours || 0} hours × ₹{ratePerHour}/hour
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={faculty.length === 0}>
            {faculty.length === 0 ? 'Register Faculty First' : 'Create Bill'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
