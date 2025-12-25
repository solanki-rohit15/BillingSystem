import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FacultyDetails } from '@/types/billing';
import { User, Building2, CreditCard, FileText, Fingerprint } from 'lucide-react';
import { toast } from 'sonner';

interface FacultyFormProps {
  onSubmit: (faculty: FacultyDetails) => void;
}

export const FacultyForm = ({ onSubmit }: FacultyFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bankAccountNumber: '',
    ifscCode: '',
    bankName: '',
    panNumber: '',
    aadharNumber: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Name is required';
    if (!formData.email.includes('@')) return 'Valid email is required';
    if (formData.phone.length < 10) return 'Valid phone number is required';
    if (formData.bankAccountNumber.length < 9) return 'Valid bank account number is required';
    if (formData.ifscCode.length !== 11) return 'IFSC code must be 11 characters';
    if (!formData.bankName.trim()) return 'Bank name is required';
    if (formData.panNumber.length !== 10) return 'PAN number must be 10 characters';
    if (formData.aadharNumber.length !== 12) return 'Aadhar number must be 12 digits';
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }

    const faculty: FacultyDetails = {
      id: crypto.randomUUID(),
      ...formData,
      createdAt: new Date(),
    };

    onSubmit(faculty);
    setFormData({
      name: '',
      email: '',
      phone: '',
      bankAccountNumber: '',
      ifscCode: '',
      bankName: '',
      panNumber: '',
      aadharNumber: '',
    });
    toast.success('Faculty registered successfully!');
  };

  return (
    <Card className="glass-card animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Faculty Registration
        </CardTitle>
        <CardDescription>
          Enter faculty details and bank information for payment processing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <User className="h-4 w-4" /> Personal Information
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Dr. John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john.doe@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4" /> Bank Details
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="bankAccountNumber">Account Number</Label>
                <Input
                  id="bankAccountNumber"
                  name="bankAccountNumber"
                  placeholder="1234567890123"
                  value={formData.bankAccountNumber}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ifscCode">IFSC Code</Label>
                <Input
                  id="ifscCode"
                  name="ifscCode"
                  placeholder="SBIN0001234"
                  value={formData.ifscCode}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  name="bankName"
                  placeholder="State Bank of India"
                  value={formData.bankName}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* ID Documents */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" /> Identification Documents
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="panNumber" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" /> PAN Number
                </Label>
                <Input
                  id="panNumber"
                  name="panNumber"
                  placeholder="ABCDE1234F"
                  value={formData.panNumber}
                  onChange={handleChange}
                  className="input-field uppercase"
                  maxLength={10}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aadharNumber" className="flex items-center gap-2">
                  <Fingerprint className="h-4 w-4" /> Aadhar Number
                </Label>
                <Input
                  id="aadharNumber"
                  name="aadharNumber"
                  placeholder="123456789012"
                  value={formData.aadharNumber}
                  onChange={handleChange}
                  className="input-field"
                  maxLength={12}
                />
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full">
            Register Faculty
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
