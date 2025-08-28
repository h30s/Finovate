'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus, DollarSign, Receipt, CreditCard, AlertCircle } from 'lucide-react';

interface FinancialSummaryProps {
  expenseData?: {
    total: number;
    count: number;
    average: number;
    trend: 'up' | 'down' | 'stable';
    growth: number;
    growthPercentage: number;
  };
  billData?: {
    total: number;
    count: number;
    average: number;
    trend: 'up' | 'down' | 'stable';
    growth: number;
    growthPercentage: number;
    statusBreakdown: {
      paid?: number;
      pending?: number;
      overdue?: number;
    };
  };
  period: string;
}

const FinancialSummaryWidget: React.FC<FinancialSummaryProps> = ({
  expenseData,
  billData,
  period
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      default:
        return <Minus className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Expense Summary */}
      {expenseData && (
        <>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Total Expenses</h3>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(expenseData.total)}</p>
                </div>
              </div>
              {getTrendIcon(expenseData.trend)}
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{period} comparison</span>
              <span className={`font-medium ${getTrendColor(expenseData.trend)}`}>
                {expenseData.growthPercentage > 0 ? '+' : ''}{expenseData.growthPercentage.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Receipt className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">Expense Transactions</h3>
                <p className="text-2xl font-bold text-gray-900">{expenseData.count}</p>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <span>Average: {formatCurrency(expenseData.average)}</span>
            </div>
          </div>
        </>
      )}

      {/* Bill Summary */}
      {billData && (
        <>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CreditCard className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Total Bills</h3>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(billData.total)}</p>
                </div>
              </div>
              {getTrendIcon(billData.trend)}
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{period} comparison</span>
              <span className={`font-medium ${getTrendColor(billData.trend)}`}>
                {billData.growthPercentage > 0 ? '+' : ''}{billData.growthPercentage.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">Bill Status</h3>
                <div className="flex items-center gap-4 mt-2">
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-700">{billData.statusBreakdown.paid || 0}</p>
                    <p className="text-xs text-gray-600">Paid</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-yellow-600">{billData.statusBreakdown.pending || 0}</p>
                    <p className="text-xs text-gray-600">Pending</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-red-600">{billData.statusBreakdown.overdue || 0}</p>
                    <p className="text-xs text-gray-600">Overdue</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FinancialSummaryWidget;
