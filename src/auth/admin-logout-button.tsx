'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { logoutAdmin } from './auth-actions';
import { Button } from '@/common/button';
import { LogOut } from 'lucide-react';

export function AdminLogoutButton() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logoutAdmin();
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <Button
      onClick={handleLogout}
      disabled={isLoggingOut}
      variant="outlined"
      size="small"
      className="flex items-center gap-2 border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-bold"
    >
      <LogOut className="w-4 h-4" />
      {isLoggingOut ? 'Logging out...' : 'Logout'}
    </Button>
  );
}
