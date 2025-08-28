'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration.';
      case 'AccessDenied':
        return 'Access denied. You may not have permission to sign in.';
      case 'Verification':
        return 'The verification token has expired or has already been used.';
      case 'Default':
        return 'An unexpected error occurred during authentication.';
      default:
        if (error?.includes('ECONNREFUSED')) {
          return 'Database connection failed. Please try again later or contact support.';
        }
        return error || 'An unexpected error occurred during authentication.';
    }
  };

  const getErrorTitle = (error: string | null) => {
    if (error?.includes('ECONNREFUSED')) {
      return 'Service Temporarily Unavailable';
    }
    return 'Authentication Error';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg border p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {getErrorTitle(error)}
          </h2>
          
          <p className="text-gray-600 mb-8">
            {getErrorMessage(error)}
          </p>

          {error?.includes('ECONNREFUSED') && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> This appears to be a database connectivity issue. 
                The authentication process worked, but we couldn't save your session.
              </p>
            </div>
          )}
          
          <div className="space-y-4">
            <Link 
              href="/auth/login"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Link>
            
            <Link 
              href="/"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Link>
          </div>

          {process.env.NODE_ENV === 'development' && error && (
            <details className="mt-6 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                Technical Details
              </summary>
              <pre className="mt-2 text-xs text-gray-600 bg-gray-50 p-3 rounded border overflow-auto">
                {error}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}
