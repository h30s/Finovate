"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import BillForm, { BillFormData } from '@/components/bills/BillForm';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AddBillPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    router.push('/auth/login');
    return null;
  }

  const handleSubmit = async (billData: BillFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/bills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(billData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create bill');
      }

      // Successfully created, redirect to bills list
      router.push('/bills?success=created');
    } catch (err: unknown) {
      setError((err as Error).message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/bills');
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <div className="container mx-auto px-6 py-8">
          {/* Header with Back Button */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <Link href="/bills">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Bills
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add New Bill</h1>
              <p className="text-gray-600 mt-1">Create a new bill to track your upcoming payments</p>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 font-medium">Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Bill Form */}
          <BillForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
          />

          {/* Help Text */}
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2">Tips for Adding Bills</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Use descriptive titles to easily identify your bills</li>
                <li>• Set accurate due dates to get timely reminders</li>
                <li>• Enable recurring for monthly/quarterly bills to track future payments</li>
                <li>• Use categories to organize and analyze your bill spending patterns</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
