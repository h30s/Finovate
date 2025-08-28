"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import BillForm, { BillFormData } from '@/components/bills/BillForm';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IBill } from '@/models/Bill';

interface EditBillPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditBillPage({ params }: EditBillPageProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [bill, setBill] = useState<IBill | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchingBill, setFetchingBill] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [billId, setBillId] = useState<string | null>(null);

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setBillId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  const fetchBill = async (id: string) => {
    try {
      setFetchingBill(true);
      const response = await fetch(`/api/bills/${id}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch bill');
      }

      setBill(result.bill);
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to fetch bill');
    } finally {
      setFetchingBill(false);
    }
  };

  useEffect(() => {
    if (billId && session?.user?.id) {
      fetchBill(billId);
    }
  }, [billId, session?.user?.id]);

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
      const response = await fetch(`/api/bills/${billId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(billData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update bill');
      }

      // Successfully updated, redirect to bills list
      router.push('/bills?success=updated');
    } catch (err: unknown) {
      setError((err as Error).message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/bills');
  };

  if (fetchingBill) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 lg:ml-64">
          <div className="container mx-auto px-6 py-8">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading bill...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !bill) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 lg:ml-64">
          <div className="container mx-auto px-6 py-8">
            <div className="flex items-center gap-4 mb-6">
              <Button variant="outline" size="sm" asChild>
                <Link href="/bills">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Bills
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Bill</h1>
                <p className="text-gray-600 mt-1">Update bill information</p>
              </div>
            </div>

            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 font-medium">Error</p>
              <p className="text-red-600 text-sm">{error}</p>
              <Button
                variant="outline"
                onClick={fetchBill}
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              <h1 className="text-3xl font-bold text-gray-900">Edit Bill</h1>
              <p className="text-gray-600 mt-1">Update bill information and due dates</p>
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
          {bill && (
            <BillForm
              bill={bill}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
}
