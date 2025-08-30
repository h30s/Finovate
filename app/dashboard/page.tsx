'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import OverviewCards from '@/components/dashboard/OverviewCards';
import ExpensesChart from '@/components/dashboard/ExpensesChart';
import BillReminder from '@/components/bills/BillReminder';
import { IBill } from '@/models/Bill';

interface DashboardData {
  totalExpenses: number;
  upcomingBills: {
    total: number;
    count: number;
  };
  pendingApprovals: {
    total: number;
    count: number;
  };
  monthlyExpenses: Array<{
    month: string;
    amount: number;
    count: number;
  }>;
  period: {
    from: string;
    to: string;
  };
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [upcomingBills, setUpcomingBills] = useState<IBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetchDashboardData();
      fetchUpcomingBills();
    }
  }, [session]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/summary');
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingBills = async () => {
    try {
      const response = await fetch('/api/bills/upcoming?days=7&limit=10');
      
      if (response.ok) {
        const data = await response.json();
        setUpcomingBills(data.bills || []);
      }
    } catch (err) {
      console.error('Error fetching upcoming bills:', err);
    }
  };

  const handleMarkBillAsPaid = async (billId: string) => {
    try {
      const response = await fetch(`/api/bills/${billId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'paid' }),
      });

      if (response.ok) {
        // Refresh upcoming bills
        await fetchUpcomingBills();
      }
    } catch (err) {
      console.error('Error marking bill as paid:', err);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session) {
    redirect('/auth/login?callbackUrl=/dashboard');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 lg:ml-64">
          <div className="p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-xl p-6 h-32">
                    <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
                    <div className="h-8 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/3"></div>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-xl p-6 h-96">
                <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
                <div className="h-80 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 lg:ml-64">
          <div className="p-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">Error: {error}</p>
              <button
                onClick={fetchDashboardData}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {session.user.name}! 👋
            </h1>
            <p className="text-gray-600">
              Here's an overview of your expenses and financial activity
            </p>
          </div>

          {/* Bill Reminders - Show first for urgent bills */}
          {upcomingBills.length > 0 && (
            <div className="mb-8">
              <BillReminder
                bills={upcomingBills}
                onMarkAsPaid={handleMarkBillAsPaid}
              />
            </div>
          )}

          {/* Overview Cards */}
          {dashboardData && (
            <div className="mb-8">
              <OverviewCards
                totalExpenses={dashboardData.totalExpenses}
                upcomingBills={dashboardData.upcomingBills}
                pendingApprovals={dashboardData.pendingApprovals}
              />
            </div>
          )}

          {/* Monthly Expenses Chart */}
          {dashboardData && (
            <div className="mb-8">
              <ExpensesChart
                data={dashboardData.monthlyExpenses}
                type="line"
              />
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/expenses/add" className="p-4 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Add Expense</h4>
                <p className="text-sm text-gray-600">Record a new expense</p>
              </Link>
              
              <Link href="/expenses" className="p-4 text-left border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mb-2">
                  <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  </svg>
                </div>
                <h4 className="font-medium text-gray-900 mb-1">All Expenses</h4>
                <p className="text-sm text-gray-600">View and manage expenses</p>
              </Link>
              
              <Link href="/expenses/analytics" className="p-4 text-left border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Analytics</h4>
                <p className="text-sm text-gray-600">View detailed analytics</p>
              </Link>
              
              <Link href="/bills" className="p-4 text-left border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Bills</h4>
                <p className="text-sm text-gray-600">Manage upcoming bills</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
