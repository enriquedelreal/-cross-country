'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function SkeletonCard() {
  return (
    <Card className="border-blue-200">
      <CardHeader className="pb-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SkeletonTable() {
  return (
    <Card className="border-blue-200">
      <CardHeader>
        <div className="h-5 bg-gray-200 rounded animate-pulse"></div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="h-4 w-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 flex-1 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function SkeletonChart() {
  return (
    <Card className="border-blue-200">
      <CardHeader>
        <div className="h-5 bg-gray-200 rounded animate-pulse"></div>
      </CardHeader>
      <CardContent>
        <div className="h-64 bg-gray-100 rounded animate-pulse flex items-center justify-center">
          <div className="text-gray-400">Loading chart...</div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SkeletonRunnerPicker() {
  return (
    <Card className="border-blue-200">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="text-center">
            <div className="h-5 bg-gray-200 rounded animate-pulse mx-auto w-32 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-48"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
