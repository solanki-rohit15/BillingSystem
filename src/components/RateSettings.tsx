import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, IndianRupee, Save } from 'lucide-react';
import { toast } from 'sonner';

interface RateSettingsProps {
  ratePerHour: number;
  onUpdateRate: (rate: number) => void;
}

export const RateSettings = ({ ratePerHour, onUpdateRate }: RateSettingsProps) => {
  const [rate, setRate] = useState(ratePerHour.toString());

  const handleSave = () => {
    const newRate = parseFloat(rate);
    if (isNaN(newRate) || newRate <= 0) {
      toast.error('Please enter a valid rate');
      return;
    }
    onUpdateRate(newRate);
    toast.success('Rate updated successfully!');
  };

  return (
    <Card className="glass-card animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          Rate Configuration
        </CardTitle>
        <CardDescription>
          Set the hourly rate for visiting faculty payments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-4">
          <div className="flex-1 space-y-2">
            <Label htmlFor="rate" className="flex items-center gap-2">
              <IndianRupee className="h-4 w-4" /> Rate per Hour
            </Label>
            <Input
              id="rate"
              type="number"
              min="0"
              step="50"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="input-field text-lg font-medium"
            />
          </div>
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save
          </Button>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Current rate: ₹{ratePerHour.toLocaleString('en-IN')} per hour
        </p>
      </CardContent>
    </Card>
  );
};
