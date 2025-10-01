import { Card, CardContent } from '@/components/ui/card';

interface ResultCardProps {
  title: string;
  value: string;
  subtitle?: string;
  highlight?: boolean;
}

export function ResultCard({ title, value, subtitle, highlight = false }: ResultCardProps) {
  return (
    <Card className="bg-nesso-card rounded-2xl ring-1 ring-black/5 shadow-sm">
      <CardContent className="p-6 text-center">
        <h3 className="text-sm font-medium text-nesso-ink/80 mb-3">
          {title}
        </h3>
        <div className={`text-3xl md:text-4xl font-bold tracking-tight mb-2 ${
          highlight
            ? 'bg-gradient-to-r from-nesso-peach to-nesso-orange bg-clip-text text-transparent'
            : 'text-nesso-navy'
        }`}>
          {value}
        </div>
        {subtitle && (
          <p className="text-sm text-nesso-ink/60">
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}