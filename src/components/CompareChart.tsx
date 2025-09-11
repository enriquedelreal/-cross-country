'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Dot } from 'recharts';
import { formatTime } from '@/lib/format';

interface CompareChartProps {
  data: Array<{
    date?: string;
    raceIndex?: number;
    [key: string]: string | number | null | undefined;
  }>;
  runners: string[];
  title?: string;
  yAxisLabel?: string;
  className?: string;
  viewMode?: 'date' | 'raceIndex';
}

const COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // yellow
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#84cc16', // lime
];

export function CompareChart({ 
  data, 
  runners,
  title = "Runner Comparison", 
  className = '',
  viewMode = 'date'
}: CompareChartProps) {
  
  const formatXAxisLabel = (tickItem: string) => {
    if (viewMode === 'raceIndex') {
      return `Race ${tickItem}`;
    }
    const date = new Date(tickItem);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatYAxisLabel = (value: number) => {
    return formatTime(value);
  };


  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ dataKey: string; value: number; color: string }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">
            {viewMode === 'raceIndex' ? `Race ${label}` : label ? new Date(label).toLocaleDateString() : 'Unknown'}
          </p>
          {payload.map((entry: { dataKey: string; value: number; color: string }, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              <span className="font-medium">{entry.dataKey}:</span> {formatTime(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomDot = (props: {
    cx?: number;
    cy?: number;
    fill?: string;
  }) => {
    const { cx, cy, fill } = props;
    if (cx === undefined || cy === undefined) return null;
    
    return (
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill={fill}
        stroke="#ffffff"
        strokeWidth={2}
      />
    );
  };

  if (data.length === 0 || runners.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 text-gray-500 ${className}`}>
        No data available for comparison
      </div>
    );
  }

  return (
    <div className={className}>
      {title && (
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
      )}
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey={viewMode === 'date' ? 'date' : 'raceIndex'}
              tickFormatter={formatXAxisLabel}
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              tickFormatter={formatYAxisLabel}
              stroke="#6b7280"
              fontSize={12}
              domain={['dataMin - 30', 'dataMax + 30']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {runners.map((runner, index) => (
              <Line
                key={runner}
                type="monotone"
                dataKey={runner}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={2}
                dot={CustomDot}
                activeDot={{ r: 6, stroke: COLORS[index % COLORS.length], strokeWidth: 2 }}
                name={runner}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
