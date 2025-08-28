'use client';

import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ComparisonData {
  month?: string;
  year?: string;
  currentYear?: number;
  previousYear?: number;
  current?: number;
  previous?: number;
  growth?: number;
  growthPercentage?: number;
}

interface ComparisonChartProps {
  data: ComparisonData[];
  type: 'line' | 'area' | 'bar';
  period: 'monthly' | 'yearly';
  title: string;
  subtitle?: string;
}

const ComparisonChart: React.FC<ComparisonChartProps> = ({
  data,
  type,
  period,
  title,
  subtitle
}) => {
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
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm">
                {entry.dataKey === 'currentYear' ? 'Current Year' : 
                 entry.dataKey === 'previousYear' ? 'Previous Year' :
                 entry.dataKey === 'current' ? 'Current' : 'Previous'}: 
                <span className="font-medium ml-1">
                  {formatCurrency(entry.value)}
                </span>
              </span>
            </div>
          ))}
          {payload[0]?.payload?.growthPercentage && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-1 text-sm">
                {payload[0].payload.growthPercentage > 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : payload[0].payload.growthPercentage < 0 ? (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                ) : (
                  <Minus className="w-4 h-4 text-gray-500" />
                )}
                <span className={`font-medium ${
                  payload[0].payload.growthPercentage > 0 ? 'text-green-600' : 
                  payload[0].payload.growthPercentage < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {payload[0].payload.growthPercentage.toFixed(1)}%
                </span>
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    };

    const xAxisProps = {
      dataKey: period === 'monthly' ? 'month' : 'year',
      axisLine: false,
      tickLine: false,
      className: 'text-sm text-gray-600'
    };

    const yAxisProps = {
      axisLine: false,
      tickLine: false,
      tickFormatter: formatCurrency,
      className: 'text-sm text-gray-600'
    };

    switch (type) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey={period === 'monthly' ? 'currentYear' : 'current'}
              stroke="#3B82F6"
              strokeWidth={3}
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              name="Current Period"
            />
            <Line
              type="monotone"
              dataKey={period === 'monthly' ? 'previousYear' : 'previous'}
              stroke="#94A3B8"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#94A3B8', strokeWidth: 2, r: 4 }}
              name="Previous Period"
            />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey={period === 'monthly' ? 'currentYear' : 'current'}
              stackId="1"
              stroke="#3B82F6"
              fill="#3B82F6"
              fillOpacity={0.3}
              name="Current Period"
            />
            <Area
              type="monotone"
              dataKey={period === 'monthly' ? 'previousYear' : 'previous'}
              stackId="2"
              stroke="#94A3B8"
              fill="#94A3B8"
              fillOpacity={0.3}
              name="Previous Period"
            />
          </AreaChart>
        );

      case 'bar':
      default:
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey={period === 'monthly' ? 'currentYear' : 'current'}
              fill="#3B82F6"
              radius={[4, 4, 0, 0]}
              name="Current Period"
            />
            <Bar
              dataKey={period === 'monthly' ? 'previousYear' : 'previous'}
              fill="#94A3B8"
              radius={[4, 4, 0, 0]}
              name="Previous Period"
            />
          </BarChart>
        );
    }
  };

  const calculateOverallTrend = () => {
    const currentTotal = data.reduce((sum, item) => 
      sum + (item.currentYear || item.current || 0), 0);
    const previousTotal = data.reduce((sum, item) => 
      sum + (item.previousYear || item.previous || 0), 0);
    
    if (previousTotal === 0) return { trend: 'stable', percentage: 0 };
    
    const percentage = ((currentTotal - previousTotal) / previousTotal) * 100;
    return {
      trend: percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'stable',
      percentage
    };
  };

  const overallTrend = calculateOverallTrend();

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
            <p className="text-gray-600">No comparison data available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            {subtitle && (
              <p className="text-sm text-gray-600">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {overallTrend.trend === 'up' && (
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-medium">
                  +{overallTrend.percentage.toFixed(1)}%
                </span>
              </div>
            )}
            {overallTrend.trend === 'down' && (
              <div className="flex items-center gap-1 text-red-600">
                <TrendingDown className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {overallTrend.percentage.toFixed(1)}%
                </span>
              </div>
            )}
            {overallTrend.trend === 'stable' && (
              <div className="flex items-center gap-1 text-gray-600">
                <Minus className="w-5 h-5" />
                <span className="text-sm font-medium">No change</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ComparisonChart;
