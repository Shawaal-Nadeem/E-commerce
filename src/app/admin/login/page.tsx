import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/auth/auth-actions';
import { AdminLoginForm } from '@/auth/admin-login-form';

export const metadata = {
  title: 'Admin Login | Arif Jewellers',
  description: 'Admin login page',
};

export default async function AdminLoginPage() {
  // If already authenticated, redirect to admin dashboard
  const isAuthenticated = await isAdminAuthenticated();
  
  if (isAuthenticated) {
    redirect('/admin');
  }

  return <AdminLoginForm />;
}
