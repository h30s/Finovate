'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

interface ChartData {
  month: string;
  amount: number;
  count: number;
}

interface ExpensesChartProps {
  data: ChartData[];
  type?: 'line' | 'bar';
}

const ExpensesChart: React.FC<ExpensesChartProps> = ({ data, type = 'line' }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          <p className="text-blue-600">
            <span className="font-medium">Amount:</span> {formatCurrency(payload[0].value)}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Transactions:</span> {payload[0].payload.count}
          </p>
        </div>
      );
    }
    return null;
  };

  if (type === 'bar') {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Monthly Expenses</h3>
          <p className="text-sm text-gray-600">
            Track your spending patterns over the last 6 months
          </p>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                className="text-sm text-gray-600"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tickFormatter={formatCurrency}
                className="text-sm text-gray-600"
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="amount" 
                fill="#3B82F6"
                radius={[4, 4, 0, 0]}
                className="hover:opacity-80 transition-opacity"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Monthly Expenses Trend</h3>
        <p className="text-sm text-gray-600">
          Track your spending patterns over the last 6 months
        </p>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              className="text-sm text-gray-600"
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tickFormatter={formatCurrency}
              className="text-sm text-gray-600"
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#3B82F6"
              strokeWidth={3}
              dot={{ 
                fill: '#3B82F6', 
                strokeWidth: 2, 
                r: 6,
                className: 'hover:r-8 transition-all duration-200'
              }}
              activeDot={{ 
                r: 8, 
                fill: '#1D4ED8',
                stroke: '#ffffff',
                strokeWidth: 2
              }}
              className="drop-shadow-sm"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ExpensesChart;
