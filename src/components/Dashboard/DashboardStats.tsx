import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/analytics';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  gradient: string;
  iconBg: string;
  format?: 'currency' | 'number';
}

export const StatCard = ({ title, value, icon: Icon, gradient, iconBg, format = 'currency' }: StatCardProps) => {
  const formattedValue = typeof value === 'number'
    ? format === 'currency'
      ? formatCurrency(value)
      : formatNumber(value)
    : value;

  return (
    <Card className={`rounded-2xl shadow-sm border-0 bg-gradient-to-br ${gradient} backdrop-blur-sm overflow-hidden relative`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{formattedValue}</p>
          </div>
          <div className={`p-3 rounded-xl ${iconBg} bg-opacity-10`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface QuickActionProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  iconColor: string;
}

export const QuickAction = ({ title, description, icon: Icon, onClick, iconColor }: QuickActionProps) => {
  return (
    <Card 
      className="rounded-2xl shadow-sm border hover:shadow-md transition-all cursor-pointer bg-card/50 backdrop-blur-sm"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${iconColor} bg-opacity-10`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-base">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
