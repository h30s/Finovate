'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

interface CategoryData {
  category: string;
  total: number;
  count: number;
  avgAmount: number;
}

interface CategoryExpenseChartProps {
  data: CategoryData[];
  type?: 'pie' | 'bar';
}

const CATEGORY_COLORS = {
  food: '#FF6B6B',
  transportation: '#4ECDC4',
  utilities: '#45B7D1',
  entertainment: '#F7DC6F',
  healthcare: '#BB8FCE',
  shopping: '#85C1E9',
  education: '#58D68D',
  other: '#F8C471',
};

const CategoryExpenseChart: React.FC<CategoryExpenseChartProps> = ({ 
  data, 
  type = 'pie' 
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
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 capitalize">{data.category}</p>
          <p className="text-blue-600">
            <span className="font-medium">Total:</span> {formatCurrency(data.total)}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Transactions:</span> {data.count}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Average:</span> {formatCurrency(data.avgAmount)}
          </p>
        </div>
      );
    }
    return null;
  };

  const PieLabelContent = (entry: any) => {
    const percent = ((entry.total / data.reduce((sum, item) => sum + item.total, 0)) * 100).toFixed(1);
    return `${percent}%`;
  };

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Expense Categories</h3>
          <p className="text-sm text-gray-600">
            Your expenses broken down by category
          </p>
        </div>
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-gray-600">No expense data available</p>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'bar') {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Expenses by Category</h3>
          <p className="text-sm text-gray-600">
            Your spending breakdown across different categories
          </p>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="category" 
                axisLine={false}
                tickLine={false}
                className="text-sm text-gray-600"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tickFormatter={formatCurrency}
                className="text-sm text-gray-600"
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="total" 
                radius={[4, 4, 0, 0]}
                className="hover:opacity-80 transition-opacity"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={CATEGORY_COLORS[entry.category as keyof typeof CATEGORY_COLORS] || '#8884d8'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Expense Categories</h3>
        <p className="text-sm text-gray-600">
          Your expenses broken down by category
        </p>
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
                label={PieLabelContent}
                outerRadius={120}
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
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 mb-4">Categories</h4>
          {data.map((item) => (
            <div key={item.category} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ 
                    backgroundColor: CATEGORY_COLORS[item.category as keyof typeof CATEGORY_COLORS] || '#8884d8'
                  }}
                />
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {item.category}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-900">
                  {formatCurrency(item.total)}
                </div>
                <div className="text-xs text-gray-500">
                  {item.count} transactions
                </div>
              </div>
            </div>
          ))}
          
          {/* Total */}
          <div className="border-t border-gray-200 pt-3 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900">Total</span>
              <div className="text-right">
                <div className="text-sm font-bold text-gray-900">
                  {formatCurrency(data.reduce((sum, item) => sum + item.total, 0))}
                </div>
                <div className="text-xs text-gray-500">
                  {data.reduce((sum, item) => sum + item.count, 0)} transactions
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryExpenseChart;
