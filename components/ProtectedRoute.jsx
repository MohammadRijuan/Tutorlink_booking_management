"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const granted = sessionStorage.getItem('tutorlink-access') === 'granted';
    if (!granted) {
      router.replace('/');
      return;
    }

    setAuthorized(true);
  }, [router]);

  if (!authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="flex items-center gap-2 text-slate-300">
          <Loader2 className="h-5 w-5 animate-spin" /> Checking access...
        </div>
      </div>
    );
  }

  return children;
}
