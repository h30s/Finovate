'use client';

import React from 'react';
import { DollarSign, Calendar, Clock } from 'lucide-react';

interface OverviewCardsProps {
  totalExpenses: number;
  upcomingBills: {
    total: number;
    count: number;
  };
  pendingApprovals: {
    total: number;
    count: number;
  };
}

const OverviewCards: React.FC<OverviewCardsProps> = ({
  totalExpenses,
  upcomingBills,
  pendingApprovals,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total Expenses Card */}
      <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">This Month</p>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Total Expenses</h3>
          <p className="text-3xl font-bold text-blue-600 mb-1">
            {formatCurrency(totalExpenses)}
          </p>
          <p className="text-sm text-gray-500">
            Monthly spending
          </p>
        </div>
      </div>

      {/* Upcoming Bills Card */}
      <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <Calendar className="w-6 h-6 text-orange-600" />
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Next 30 Days</p>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Upcoming Bills</h3>
          <p className="text-3xl font-bold text-orange-600 mb-1">
            {formatCurrency(upcomingBills.total)}
          </p>
          <p className="text-sm text-gray-500">
            {upcomingBills.count} {upcomingBills.count === 1 ? 'bill' : 'bills'} due
          </p>
        </div>
      </div>

      {/* Pending Approvals Card */}
      <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Awaiting Review</p>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Pending Approvals</h3>
          <p className="text-3xl font-bold text-yellow-600 mb-1">
            {formatCurrency(pendingApprovals.total)}
          </p>
          <p className="text-sm text-gray-500">
            {pendingApprovals.count} {pendingApprovals.count === 1 ? 'expense' : 'expenses'} pending
          </p>
        </div>
      </div>
    </div>
  );
};

export default OverviewCards;
