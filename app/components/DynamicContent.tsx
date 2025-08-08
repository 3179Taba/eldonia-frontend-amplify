'use client';

import { useEffect, useState } from 'react';

interface DynamicContentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function DynamicContent({ children, fallback }: DynamicContentProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return fallback || (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return <>{children}</>;
} 