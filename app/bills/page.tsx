"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import BillCard from '@/components/bills/BillCard';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { IBill } from '@/models/Bill';
import { formatCurrency } from '@/lib/utils';
import { Plus, Search, Filter, AlertTriangle, CheckCircle, Clock, Calendar } from 'lucide-react';

interface BillsResponse {
  bills: IBill[];
  pagination: {
    current: number;
    total: number;
    count: number;
    limit: number;
  };
  summary: {
    [key: string]: {
      count: number;
      totalAmount: number;
    };
  };
}

export default function BillsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const [bills, setBills] = useState<IBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    count: 0,
    limit: 10
  });
  const [summary, setSummary] = useState<Record<string, { count: number; totalAmount: number }>>({});

  // Filters
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || 'all');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  // Success message
  const [successMessage, setSuccessMessage] = useState<string | null>(() => {
    const success = searchParams.get('success');
    if (success === 'created') return 'Bill created successfully!';
    if (success === 'updated') return 'Bill updated successfully!';
    return null;
  });

  const fetchBills = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (categoryFilter !== 'all') params.set('category', categoryFilter);
      if (searchQuery) params.set('search', searchQuery);
      params.set('limit', '20');

      const response = await fetch(`/api/bills?${params.toString()}`);
      const result: BillsResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch bills');
      }

      setBills(result.bills);
      setPagination(result.pagination);
      setSummary(result.summary);
      setError(null);
    } catch (err: unknown) {
      setError((err as Error).message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchBills();
    }
  }, [statusFilter, categoryFilter, searchQuery, session?.user?.id]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

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


  const handleStatusToggle = async (billId: string, newStatus: 'paid' | 'pending') => {
    try {
      const response = await fetch(`/api/bills/${billId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update bill status');
      }

      // Refresh bills list
      await fetchBills();
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to update bill status');
    }
  };

  const handleDeleteBill = async (billId: string) => {
    if (!confirm('Are you sure you want to delete this bill?')) return;

    try {
      const response = await fetch(`/api/bills/${billId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete bill');
      }

      // Refresh bills list
      await fetchBills();
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to delete bill');
    }
  };

  const handleEditBill = (billId: string) => {
    router.push(`/bills/edit/${billId}`);
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'rent', label: 'Rent' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'subscriptions', label: 'Subscriptions' },
    { value: 'loan', label: 'Loan' },
    { value: 'other', label: 'Other' },
  ];

  const getStatusStats = (status: string) => {
    return summary[status] || { count: 0, totalAmount: 0 };
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bills</h1>
              <p className="text-gray-600 mt-1">Manage your bill payments and due dates</p>
            </div>
            <Button asChild>
              <Link href="/bills/add">
                <Plus className="w-4 h-4 mr-2" />
                Add New Bill
              </Link>
            </Button>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 font-medium">{successMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 font-medium">Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="border-red-200 bg-red-50/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Overdue</p>
                    <p className="text-2xl font-bold text-red-600">
                      {getStatusStats('overdue').count}
                    </p>
                    <p className="text-xs text-red-600">
                      {formatCurrency(getStatusStats('overdue').totalAmount)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-yellow-200 bg-yellow-50/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-8 h-8 text-yellow-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {getStatusStats('pending').count}
                    </p>
                    <p className="text-xs text-yellow-600">
                      {formatCurrency(getStatusStats('pending').totalAmount)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Paid</p>
                    <p className="text-2xl font-bold text-green-600">
                      {getStatusStats('paid').count}
                    </p>
                    <p className="text-xs text-green-600">
                      {formatCurrency(getStatusStats('paid').totalAmount)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search Bills</label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search by title or description..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                  </Select>
                </div>

                {/* Category Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bills List */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading bills...</p>
            </div>
          ) : bills.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {bills.map((bill) => (
                  <BillCard
                    key={bill._id}
                    bill={bill}
                    onStatusToggle={handleStatusToggle}
                    onDelete={handleDeleteBill}
                    onEdit={handleEditBill}
                    showActions={true}
                  />
                ))}
              </div>

              {/* Pagination Info */}
              {pagination.total > 1 && (
                <div className="mt-8 text-center text-sm text-muted-foreground">
                  Showing {bills.length} of {pagination.count} bills
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Bills Found</h3>
              <p className="text-gray-600 mb-6">
                {statusFilter === 'all' && categoryFilter === 'all' && !searchQuery
                  ? "You haven't added any bills yet."
                  : "No bills match your current filters."
                }
              </p>
              <div className="flex gap-3 justify-center">
                {statusFilter !== 'all' || categoryFilter !== 'all' || searchQuery ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStatusFilter('all');
                      setCategoryFilter('all');
                      setSearchQuery('');
                    }}
                  >
                    Clear Filters
                  </Button>
                ) : null}
                <Button asChild>
                  <Link href="/bills/add">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Bill
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
