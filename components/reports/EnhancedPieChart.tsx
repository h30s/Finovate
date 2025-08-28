'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

interface PieChartData {
  category: string;
  total: number;
  count: number;
  percentage: number;
  avgAmount?: number;
  paidCount?: number;
  pendingCount?: number;
  overdueCount?: number;
}

interface EnhancedPieChartProps {
  data: PieChartData[];
  type: 'expenses' | 'bills';
  title: string;
  subtitle?: string;
  showLegend?: boolean;
  showPercentages?: boolean;
}

const CATEGORY_COLORS = {
  // Expense categories
  food: '#FF6B6B',
  transportation: '#4ECDC4',
  utilities: '#45B7D1',
  entertainment: '#F7DC6F',
  healthcare: '#BB8FCE',
  shopping: '#85C1E9',
  education: '#58D68D',
  other: '#F8C471',
  
  // Bill categories
  rent: '#FF8A80',
  insurance: '#81C784',
  subscriptions: '#64B5F6',
  loan: '#FFB74D',
};

const EnhancedPieChart: React.FC<EnhancedPieChartProps> = ({
  data,
  type,
  title,
  subtitle,
  showLegend = true,
  showPercentages = true
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg min-w-[200px]">
          <p className="font-semibold text-gray-900 capitalize mb-2">{data.category}</p>
          <div className="space-y-1">
            <p className="text-blue-600 text-sm">
              <span className="font-medium">Total:</span> {formatCurrency(data.total)}
            </p>
            <p className="text-gray-600 text-sm">
              <span className="font-medium">Count:</span> {data.count} {type.slice(0, -1)}s
            </p>
            {data.avgAmount && (
              <p className="text-gray-600 text-sm">
                <span className="font-medium">Average:</span> {formatCurrency(data.avgAmount)}
              </p>
            )}
            <p className="text-purple-600 text-sm">
              <span className="font-medium">Percentage:</span> {data.percentage.toFixed(1)}%
            </p>
            {type === 'bills' && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <p className="text-green-600 text-xs">
                  <span className="font-medium">Paid:</span> {data.paidCount || 0}
                </p>
                <p className="text-yellow-600 text-xs">
                  <span className="font-medium">Pending:</span> {data.pendingCount || 0}
                </p>
                <p className="text-red-600 text-xs">
                  <span className="font-medium">Overdue:</span> {data.overdueCount || 0}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = (entry: any) => {
    if (!showPercentages) return '';
    return `${entry.percentage.toFixed(1)}%`;
  };

  const totalAmount = data.reduce((sum, item) => sum + item.total, 0);
  const totalCount = data.reduce((sum, item) => sum + item.count, 0);

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          {subtitle && (
            <p className="text-sm text-gray-600">{subtitle}</p>
          )}
        </div>
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-gray-600">No {type} data available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        {subtitle && (
          <p className="text-sm text-gray-600">{subtitle}</p>
        )}
        
        {/* Summary stats */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">Total Amount</p>
            <p className="text-lg font-bold text-blue-900">{formatCurrency(totalAmount)}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-xs text-green-600 font-medium uppercase tracking-wide">Total {type.charAt(0).toUpperCase() + type.slice(1)}</p>
            <p className="text-lg font-bold text-green-900">{totalCount}</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={showPercentages ? renderCustomLabel : false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="total"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={CATEGORY_COLORS[entry.category as keyof typeof CATEGORY_COLORS] || '#8884d8'}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              {showLegend && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Category Details */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 mb-4">Category Breakdown</h4>
          <div className="max-h-64 overflow-y-auto">
            {data.map((item) => (
              <div key={item.category} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ 
                      backgroundColor: CATEGORY_COLORS[item.category as keyof typeof CATEGORY_COLORS] || '#8884d8'
                    }}
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {item.category}
                    </span>
                    {type === 'bills' && (
                      <div className="flex gap-2 mt-1">
                        {item.paidCount! > 0 && (
                          <span className="text-xs text-green-600">
                            {item.paidCount} paid
                          </span>
                        )}
                        {item.pendingCount! > 0 && (
                          <span className="text-xs text-yellow-600">
                            {item.pendingCount} pending
                          </span>
                        )}
                        {item.overdueCount! > 0 && (
                          <span className="text-xs text-red-600">
                            {item.overdueCount} overdue
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    {formatCurrency(item.total)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {item.percentage.toFixed(1)}% • {item.count} items
                  </div>
                  {item.avgAmount && (
                    <div className="text-xs text-gray-400">
                      Avg: {formatCurrency(item.avgAmount)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Total */}
          <div className="border-t border-gray-200 pt-3 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900">Total</span>
              <div className="text-right">
                <div className="text-sm font-bold text-gray-900">
                  {formatCurrency(totalAmount)}
                </div>
                <div className="text-xs text-gray-500">
                  {totalCount} {type}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedPieChart;
