import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FacultyDetails } from '@/types/billing';
import { exportAllFacultyToExcel } from '@/utils/excelExport';
import { Users, FileSpreadsheet, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface FacultyListProps {
  faculty: FacultyDetails[];
  onDelete: (id: string) => void;
}

export const FacultyList = ({ faculty, onDelete }: FacultyListProps) => {
  const handleExport = () => {
    if (faculty.length === 0) {
      toast.error('No faculty to export');
      return;
    }
    exportAllFacultyToExcel(faculty);
    toast.success('Faculty list exported successfully!');
  };

  const maskNumber = (num: string, visibleDigits: number = 4) => {
    if (num.length <= visibleDigits) return num;
    return '●'.repeat(num.length - visibleDigits) + num.slice(-visibleDigits);
  };

  return (
    <Card className="glass-card animate-fade-in">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Registered Faculty
            </CardTitle>
            <CardDescription>
              {faculty.length} faculty member(s) registered
            </CardDescription>
          </div>
          <Button onClick={handleExport} variant="outline" className="gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Export List
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {faculty.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No faculty registered yet</p>
            <p className="text-sm text-muted-foreground/70">
              Register a faculty member to get started
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Bank Account</TableHead>
                  <TableHead>PAN</TableHead>
                  <TableHead>Aadhar</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {faculty.map((f) => (
                  <TableRow key={f.id} className="animate-slide-in">
                    <TableCell className="font-medium">{f.name}</TableCell>
                    <TableCell>{f.email}</TableCell>
                    <TableCell>{f.phone}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {maskNumber(f.bankAccountNumber)}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {maskNumber(f.panNumber, 4)}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {maskNumber(f.aadharNumber)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          onDelete(f.id);
                          toast.success('Faculty removed');
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
