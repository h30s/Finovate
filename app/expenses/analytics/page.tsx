'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Sidebar from '@/components/Sidebar';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CategoryExpenseChart from '@/components/dashboard/CategoryExpenseChart';
import ExpensesChart from '@/components/dashboard/ExpensesChart';

interface ExpenseStats {
  categoryStats: Array<{
    category: string;
    total: number;
    count: number;
    avgAmount: number;
  }>;
  monthlyStats: Array<{
    month: string;
    amount: number;
    count: number;
  }>;
  totalStats: {
    totalAmount: number;
    totalCount: number;
    avgAmount: number;
  };
}

export default function ExpenseAnalyticsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ExpenseStats | null>(null);

  // Date filter for analytics
  const [dateFilters, setDateFilters] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    if (session?.user?.id) {
      fetchStats();
    }
  }, [session, dateFilters]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      if (dateFilters.startDate) queryParams.set('startDate', dateFilters.startDate);
      if (dateFilters.endDate) queryParams.set('endDate', dateFilters.endDate);

      const response = await fetch(`/api/expenses/stats?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch expense statistics');
      }
      
      const statsData = await response.json();
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleDateFilterChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setDateFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatMonthlyData = (monthlyStats: ExpenseStats['monthlyStats']) => {
    return monthlyStats.map(item => ({
      month: new Date(item.month + '-01').toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      }),
      amount: item.amount,
      count: item.count
    }));
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session) {
    router.push('/auth/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Expense Analytics</h1>
            <p className="text-gray-600">Analyze your spending patterns and trends</p>
          </div>

          {/* Date Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <Input
                    name="startDate"
                    type="date"
                    value={dateFilters.startDate}
                    onChange={handleDateFilterChange}
                    placeholder="Start Date"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <Input
                    name="endDate"
                    type="date"
                    value={dateFilters.endDate}
                    onChange={handleDateFilterChange}
                    placeholder="End Date"
                  />
                </div>
                <div className="flex-1">
                  <button
                    onClick={() => setDateFilters({ startDate: '', endDate: '' })}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {error && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">{error}</p>
                  <button
                    onClick={fetchStats}
                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-96 bg-gray-200 rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : stats ? (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-center">Total Spent</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {formatCurrency(stats.totalStats.totalAmount)}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {stats.totalStats.totalCount} transactions
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-center">Average Expense</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {formatCurrency(stats.totalStats.avgAmount)}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        per transaction
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-center">Top Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      {stats.categoryStats.length > 0 ? (
                        <>
                          <div className="text-xl font-bold text-purple-600 capitalize">
                            {stats.categoryStats[0].category}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {formatCurrency(stats.categoryStats[0].total)}
                          </p>
                        </>
                      ) : (
                        <div className="text-gray-500">No data</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Category Breakdown */}
              <CategoryExpenseChart 
                data={stats.categoryStats} 
                type="pie"
              />

              {/* Category Bar Chart */}
              <CategoryExpenseChart 
                data={stats.categoryStats} 
                type="bar"
              />

              {/* Monthly Trend */}
              {stats.monthlyStats.length > 0 && (
                <ExpensesChart
                  data={formatMonthlyData(stats.monthlyStats)}
                  type="line"
                />
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No expense data found</h3>
                  <p className="text-gray-600 mb-4">Add some expenses to see analytics.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
