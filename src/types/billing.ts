export interface FacultyDetails {
  id: string;
  name: string;
  email: string;
  phone: string;
  bankAccountNumber: string;
  ifscCode: string;
  bankName: string;
  panNumber: string;
  aadharNumber: string;
  password?: string;
  createdAt: Date;
}

export interface BillEntry {
  id: string;
  facultyId: string;
  facultyName: string;
  className: string;
  subject: string;
  dates: string[];
  totalHours: number;
  ratePerHour: number;
  totalAmount: number;
  month: string;
  year: number;
  status: 'pending' | 'approved' | 'paid';
  createdAt: Date;
}

export interface BillingConfig {
  ratePerHour: number;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  password: string;
  role: 'admin';
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'faculty' | 'admin';
}
