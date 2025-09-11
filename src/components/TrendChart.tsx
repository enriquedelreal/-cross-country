'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Dot } from 'recharts';
import { formatTime } from '@/lib/format';

interface TrendChartProps {
  data: Array<{
    date: string;
    value: number;
    raceName?: string;
    rawTime?: string;
    distance?: number;
  }>;
  title?: string;
  yAxisLabel?: string;
  className?: string;
}

export function TrendChart({ 
  data, 
  title = "Performance Trend", 
  className = '' 
}: TrendChartProps) {
  
  const formatXAxisLabel = (tickItem: string) => {
    const date = new Date(tickItem);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatYAxisLabel = (value: number) => {
    return formatTime(value);
  };

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ payload: { raceName?: string; rawTime?: string; distance?: number; value: number } }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{data.raceName || 'Race'}</p>
          <p className="text-sm text-gray-600">
            {label ? new Date(label).toLocaleDateString() : 'Unknown'}
          </p>
          <p className="text-sm">
            <span className="font-medium">3-mi Equiv:</span> {formatTime(data.value)}
          </p>
          {data.rawTime && (
            <p className="text-sm">
              <span className="font-medium">Raw Time:</span> {data.rawTime}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomDot = (props: {
    cx?: number;
    cy?: number;
    payload?: { raceName?: string; rawTime?: string; distance?: number };
  }) => {
    const { cx, cy } = props;
    return (
      <Dot
        cx={cx}
        cy={cy}
        r={4}
        fill="#3b82f6"
        stroke="#ffffff"
        strokeWidth={2}
      />
    );
  };

  if (data.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 text-gray-500 ${className}`}>
        No data available for chart
      </div>
    );
  }

  return (
    <div className={className}>
      {title && (
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
      )}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
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
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={<CustomDot />}
              activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
