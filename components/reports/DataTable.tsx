'use client';

import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Search, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface DataTableProps {
  data: any[];
  type: 'expenses' | 'bills';
  title: string;
  showSearch?: boolean;
  maxHeight?: string;
}

const DataTable: React.FC<DataTableProps> = ({
  data,
  type,
  title,
  showSearch = true,
  maxHeight = '400px'
}) => {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = () => {
    let filteredData = data;

    // Apply search filter
    if (searchTerm) {
      filteredData = data.filter(item => {
        const searchFields = type === 'expenses' 
          ? [item.category, item.note]
          : [item.title, item.category, item.description];
        
        return searchFields.some(field => 
          field?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    // Apply sorting
    if (sortConfig) {
      filteredData = [...filteredData].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredData;
  };

  const getSortIcon = (columnKey: string) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return null;
    }
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />;
  };

  const renderExpenseTable = (data: any[]) => (
    <table className="w-full">
      <thead className="bg-gray-50 border-b">
        <tr>
          <th 
            className="text-left p-3 font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
            onClick={() => handleSort('date')}
          >
            <div className="flex items-center gap-2">
              Date
              {getSortIcon('date')}
            </div>
          </th>
          <th 
            className="text-left p-3 font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
            onClick={() => handleSort('category')}
          >
            <div className="flex items-center gap-2">
              Category
              {getSortIcon('category')}
            </div>
          </th>
          <th 
            className="text-right p-3 font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
            onClick={() => handleSort('amount')}
          >
            <div className="flex items-center justify-end gap-2">
              Amount
              {getSortIcon('amount')}
            </div>
          </th>
          <th className="text-left p-3 font-medium text-gray-600">Note</th>
        </tr>
      </thead>
      <tbody>
        {data.map((expense, index) => (
          <tr key={expense._id || index} className="border-b hover:bg-gray-50">
            <td className="p-3 text-sm text-gray-900">
              {format(new Date(expense.date), 'MMM dd, yyyy')}
            </td>
            <td className="p-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                {expense.category}
              </span>
            </td>
            <td className="p-3 text-sm font-semibold text-gray-900 text-right">
              {formatCurrency(expense.amount)}
            </td>
            <td className="p-3 text-sm text-gray-600">
              {expense.note || '-'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderBillTable = (data: any[]) => (
    <table className="w-full">
      <thead className="bg-gray-50 border-b">
        <tr>
          <th 
            className="text-left p-3 font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
            onClick={() => handleSort('title')}
          >
            <div className="flex items-center gap-2">
              Title
              {getSortIcon('title')}
            </div>
          </th>
          <th 
            className="text-left p-3 font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
            onClick={() => handleSort('dueDate')}
          >
            <div className="flex items-center gap-2">
              Due Date
              {getSortIcon('dueDate')}
            </div>
          </th>
          <th 
            className="text-right p-3 font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
            onClick={() => handleSort('amount')}
          >
            <div className="flex items-center justify-end gap-2">
              Amount
              {getSortIcon('amount')}
            </div>
          </th>
          <th 
            className="text-left p-3 font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
            onClick={() => handleSort('category')}
          >
            <div className="flex items-center gap-2">
              Category
              {getSortIcon('category')}
            </div>
          </th>
          <th 
            className="text-left p-3 font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
            onClick={() => handleSort('status')}
          >
            <div className="flex items-center gap-2">
              Status
              {getSortIcon('status')}
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        {data.map((bill, index) => (
          <tr key={bill._id || index} className="border-b hover:bg-gray-50">
            <td className="p-3 text-sm font-medium text-gray-900">
              {bill.title}
            </td>
            <td className="p-3 text-sm text-gray-900">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                {format(new Date(bill.dueDate), 'MMM dd, yyyy')}
              </div>
            </td>
            <td className="p-3 text-sm font-semibold text-gray-900 text-right">
              {formatCurrency(bill.amount)}
            </td>
            <td className="p-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                {bill.category}
              </span>
            </td>
            <td className="p-3">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                bill.status === 'paid' ? 'bg-green-100 text-green-800' :
                bill.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {bill.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const sortedData = getSortedData();

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <div className="text-sm text-gray-600">
            {sortedData.length} {sortedData.length === 1 ? 'item' : 'items'}
          </div>
        </div>
        
        {showSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${type}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      <div 
        className="overflow-auto"
        style={{ maxHeight }}
      >
        {sortedData.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 text-gray-400" />
            </div>
            <p>No {type} found{searchTerm && ' matching your search'}</p>
          </div>
        ) : (
          <>
            {type === 'expenses' ? renderExpenseTable(sortedData) : renderBillTable(sortedData)}
          </>
        )}
      </div>
      
      {sortedData.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Total: {formatCurrency(sortedData.reduce((sum, item) => sum + item.amount, 0))}
            </span>
            <span>
              Average: {formatCurrency(sortedData.reduce((sum, item) => sum + item.amount, 0) / sortedData.length)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
