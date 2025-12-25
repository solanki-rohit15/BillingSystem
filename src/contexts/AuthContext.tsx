import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, FacultyDetails, AdminUser } from '@/types/billing';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, role: 'faculty' | 'admin') => Promise<boolean>;
  register: (facultyData: Omit<FacultyDetails, 'id' | 'createdAt'> & { password: string }) => Promise<boolean>;
  logout: () => void;
  getFacultyDetails: () => FacultyDetails | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default admin credentials
const DEFAULT_ADMIN: AdminUser = {
  id: 'admin-001',
  email: 'admin@billing.com',
  name: 'Admin',
  password: 'admin123',
  role: 'admin'
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role: 'faculty' | 'admin'): Promise<boolean> => {
    if (role === 'admin') {
      // Check admin credentials
      const admins: AdminUser[] = JSON.parse(localStorage.getItem('admins') || '[]');
      const allAdmins = [DEFAULT_ADMIN, ...admins];
      const admin = allAdmins.find(a => a.email === email && a.password === password);
      
      if (admin) {
        const loggedInUser: User = {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: 'admin'
        };
        setUser(loggedInUser);
        localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
        return true;
      }
      return false;
    } else {
      // Check faculty credentials
      const faculty: FacultyDetails[] = JSON.parse(localStorage.getItem('faculty') || '[]');
      const foundFaculty = faculty.find(f => f.email === email && f.password === password);
      
      if (foundFaculty) {
        const loggedInUser: User = {
          id: foundFaculty.id,
          email: foundFaculty.email,
          name: foundFaculty.name,
          role: 'faculty'
        };
        setUser(loggedInUser);
        localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
        return true;
      }
      return false;
    }
  };

  const register = async (facultyData: Omit<FacultyDetails, 'id' | 'createdAt'> & { password: string }): Promise<boolean> => {
    const faculty: FacultyDetails[] = JSON.parse(localStorage.getItem('faculty') || '[]');
    
    // Check if email already exists
    if (faculty.some(f => f.email === facultyData.email)) {
      return false;
    }

    const newFaculty: FacultyDetails = {
      ...facultyData,
      id: `FAC-${Date.now()}`,
      createdAt: new Date()
    };

    faculty.push(newFaculty);
    localStorage.setItem('faculty', JSON.stringify(faculty));

    // Auto login after registration
    const loggedInUser: User = {
      id: newFaculty.id,
      email: newFaculty.email,
      name: newFaculty.name,
      role: 'faculty'
    };
    setUser(loggedInUser);
    localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
    
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const getFacultyDetails = (): FacultyDetails | null => {
    if (!user || user.role !== 'faculty') return null;
    
    const faculty: FacultyDetails[] = JSON.parse(localStorage.getItem('faculty') || '[]');
    return faculty.find(f => f.id === user.id) || null;
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, getFacultyDetails }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
