import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDelta, formatImprovementPct } from '@/lib/format';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  delta?: number; // in seconds
  improvementPct?: number;
  showTrend?: boolean;
  className?: string;
  onClick?: () => void;
  clickable?: boolean;
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  delta, 
  improvementPct,
  showTrend = true,
  className = '',
  onClick,
  clickable = false
}: StatCardProps) {
  const getTrendIcon = () => {
    if (!showTrend || delta === undefined) return null;
    
    if (delta < 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (delta > 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getDeltaBadge = () => {
    if (delta === undefined) return null;
    
    const { text, isPositive } = formatDelta(delta);
    return (
      <Badge variant={isPositive ? "destructive" : "default"} className="text-xs">
        {text}
      </Badge>
    );
  };

  const getImprovementBadge = () => {
    if (improvementPct === undefined) return null;
    
    const isPositive = improvementPct > 0;
    return (
      <Badge variant={isPositive ? "default" : "secondary"} className="text-xs">
        {formatImprovementPct(improvementPct)}
      </Badge>
    );
  };

  return (
    <Card 
      className={`transition-all duration-200 ${clickable ? 'hover:shadow-lg cursor-pointer hover:scale-105' : 'hover:shadow-md'} ${className}`}
      onClick={clickable ? onClick : undefined}
    >
      <CardHeader className="pb-1">
        <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
          {title}
          {clickable && (
            <span className="text-xs text-blue-600 opacity-70">Click to explore</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            {subtitle && (
              <div className="text-sm text-gray-500 mt-1">{subtitle}</div>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            {getTrendIcon()}
            {getDeltaBadge()}
            {getImprovementBadge()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
