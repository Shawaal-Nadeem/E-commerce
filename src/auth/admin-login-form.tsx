'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAdmin } from './auth-actions';
import { Button } from '@/common/button';
import { Lock, User } from 'lucide-react';
import Image from 'next/image';

export function AdminLoginForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await loginAdmin(formData);

    if (result.success) {
      router.push('/admin');
      router.refresh();
    } else {
      setError(result.error || 'Login failed');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 via-yellow-50/20 to-stone-100 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-yellow-200/50 dark:border-stone-800 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-8 py-10 text-center">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <div className="absolute inset-0 bg-white rounded-full blur-xl opacity-30"></div>
              <div className="relative w-full h-full flex items-center justify-center bg-white rounded-full">
                <Image 
                  src="/images/logo.png" 
                  alt="Arif Jewellers Logo"
                  width={80}
                  height={80}
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <h1 className="text-3xl font-serif font-bold text-white">
              Admin Login
            </h1>
            <p className="text-yellow-100 mt-2 text-sm">
              Enter your credentials to access the dashboard
            </p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            {error && (
              <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-200 rounded-xl border border-rose-200 dark:border-rose-800 text-sm">
                <strong className="font-bold">Error:</strong> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2"
                >
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-stone-400" />
                  </div>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    required
                    autoComplete="username"
                    placeholder="Enter your username"
                    className="w-full pl-12 pr-4 py-3 border border-yellow-200 dark:border-stone-700 rounded-xl bg-white dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-stone-400" />
                  </div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className="w-full pl-12 pr-4 py-3 border border-yellow-200 dark:border-stone-700 rounded-xl bg-white dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-stone-950 font-bold py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center text-xs text-stone-500 dark:text-stone-400">
              Protected area - Authorized personnel only
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-sm text-stone-600 dark:text-stone-400 hover:text-yellow-600 dark:hover:text-yellow-500 transition-colors"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
