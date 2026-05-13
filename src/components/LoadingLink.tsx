'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader } from 'lucide-react';

interface LoadingLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export default function LoadingLink({ href, children, className }: LoadingLinkProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (isLoading) {
      e.preventDefault();
      return;
    }
    setIsLoading(true);
    router.push(href);
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-2 h-full">
          <Loader className="w-4 h-4 animate-spin" />
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}
