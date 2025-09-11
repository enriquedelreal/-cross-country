'use client';

import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, ExternalLink } from 'lucide-react';

interface AthleticCalendarProps {
  schoolId?: string;
  season?: string;
  className?: string;
}

export function AthleticCalendar({ 
  schoolId = "16117", 
  season = "2025",
  className = ""
}: AthleticCalendarProps) {
  const scriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create script element
    const script = document.createElement('script');
    script.src = `https://www.athletic.net/api/1/RemoteHTML.ashx?Report=XCCalendar1&Style=1&SchoolID=${schoolId}&Season=${season}&t=zsnyv`;
    script.type = 'text/javascript';
    script.async = true;

    // Add error handling
    script.onerror = () => {
      console.error('Failed to load Athletic.net calendar');
      if (scriptRef.current) {
        scriptRef.current.innerHTML = `
          <div class="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p>Unable to load Athletic.net calendar</p>
            <p class="text-sm mt-2">
              <a 
                href="https://www.athletic.net/CrossCountry/School.aspx?SchoolID=${schoolId}" 
                target="_blank" 
                rel="noopener noreferrer"
                class="text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1"
              >
                View on Athletic.net <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>
        `;
      }
    };

    // Append script to the ref element
    if (scriptRef.current) {
      scriptRef.current.appendChild(script);
    }

    // Cleanup function
    return () => {
      if (scriptRef.current && scriptRef.current.contains(script)) {
        scriptRef.current.removeChild(script);
      }
    };
  }, [schoolId, season]);

  return (
    <Card className={`shadow-sm border-blue-200 ${className}`}>
      <CardHeader className="bg-blue-50 border-b border-blue-200">
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Calendar className="h-5 w-5 text-blue-600" />
          Athletic.net Calendar - {season} Season
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div 
          ref={scriptRef}
          className="min-h-[400px] flex items-center justify-center"
        >
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p>Loading Athletic.net calendar...</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
