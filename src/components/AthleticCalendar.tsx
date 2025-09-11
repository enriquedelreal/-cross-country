'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, ExternalLink, Globe } from 'lucide-react';

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
  const [useIframe, setUseIframe] = useState(false);

  useEffect(() => {
    // Create script element
    const script = document.createElement('script');
    script.src = `https://www.athletic.net/api/1/RemoteHTML.ashx?Report=XCCalendar1&Style=1&SchoolID=${schoolId}&Season=${season}&t=zsnyv`;
    script.type = 'text/javascript';
    script.async = true;

    // Add timeout to show fallback if script doesn't load
    const timeout = setTimeout(() => {
      if (scriptRef.current && scriptRef.current.innerHTML.includes('Loading Athletic.net calendar...')) {
        console.warn('Athletic.net calendar took too long to load, showing fallback');
        if (scriptRef.current) {
          scriptRef.current.innerHTML = `
            <div class="text-center py-8 text-gray-500">
              <Calendar class="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p class="text-lg font-medium mb-2">Athletic.net Calendar</p>
              <p class="text-sm mb-4">The calendar is taking longer than expected to load.</p>
              <div class="space-y-2">
                <a 
                  href="https://www.athletic.net/CrossCountry/School.aspx?SchoolID=${schoolId}" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Globe class="h-4 w-4" />
                  View on Athletic.net
                </a>
                <p class="text-xs text-gray-400">
                  School ID: ${schoolId} | Season: ${season}
                </p>
              </div>
            </div>
          `;
        }
      }
    }, 10000); // 10 second timeout

    // Add error handling
    script.onerror = () => {
      console.error('Failed to load Athletic.net calendar');
      clearTimeout(timeout);
      if (scriptRef.current) {
        scriptRef.current.innerHTML = `
          <div class="text-center py-8 text-gray-500">
            <Calendar class="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p class="text-lg font-medium mb-2">Unable to load Athletic.net calendar</p>
            <p class="text-sm mb-4">This might be due to network restrictions or CORS policies.</p>
            <div class="space-y-2">
              <a 
                href="https://www.athletic.net/CrossCountry/School.aspx?SchoolID=${schoolId}" 
                target="_blank" 
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Globe class="h-4 w-4" />
                View on Athletic.net
              </a>
              <p class="text-xs text-gray-400">
                School ID: ${schoolId} | Season: ${season}
              </p>
            </div>
          </div>
        `;
      }
    };

    // Add success handler
    script.onload = () => {
      clearTimeout(timeout);
      console.log('Athletic.net calendar loaded successfully');
    };

    // Append script to the ref element
    if (scriptRef.current) {
      scriptRef.current.appendChild(script);
    }

    // Cleanup function
    return () => {
      clearTimeout(timeout);
      if (scriptRef.current && scriptRef.current.contains(script)) {
        scriptRef.current.removeChild(script);
      }
    };
  }, [schoolId, season]);

  return (
    <Card className={`shadow-sm border-blue-200 ${className}`}>
      <CardHeader className="bg-blue-50 border-b border-blue-200">
        <CardTitle className="flex items-center justify-between text-blue-900">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Athletic.net Calendar - {season} Season
          </div>
          <button
            onClick={() => setUseIframe(!useIframe)}
            className="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded text-blue-700 transition-colors"
          >
            {useIframe ? 'Use Script' : 'Use Iframe'}
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {useIframe ? (
          <iframe
            src={`https://www.athletic.net/api/1/RemoteHTML.ashx?Report=XCCalendar1&Style=1&SchoolID=${schoolId}&Season=${season}&t=zsnyv`}
            className="w-full h-[600px] border-0"
            title="Athletic.net Calendar"
            onError={() => {
              console.error('Iframe failed to load');
            }}
          />
        ) : (
          <div 
            ref={scriptRef}
            className="min-h-[400px] flex items-center justify-center"
          >
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p>Loading Athletic.net calendar...</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
