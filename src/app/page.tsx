'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to /plan page
    router.push('/plan');
  }, [router]);

  return (
    <div className="min-h-screen bg-nesso-bg flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-nesso-peach/20 border-t-nesso-peach rounded-full animate-spin"></div>
        <p className="text-nesso-ink/60">Redirecting...</p>
      </div>
    </div>
  );
}
