'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Download, Printer, FileText, BarChart3, PieChart, LineChart, TrendingUp, Filter } from 'lucide-react';
import EnhancedPieChart from '@/components/reports/EnhancedPieChart';
import ComparisonChart from '@/components/reports/ComparisonChart';
import DataTable from '@/components/reports/DataTable';
import FinancialSummaryWidget from '@/components/reports/FinancialSummaryWidget';
import ExportUtils from '@/lib/exportUtils';
import { format, startOfYear, endOfYear, startOfMonth, endOfMonth } from 'date-fns';

interface ReportData {
  expenses?: {
    categoryBreakdown: any[];
    monthlyComparison: any[];
    totals: any;
    transactionCount: number;
    averageTransaction: number;
    rawData: any[];
  };
  bills?: {
    categoryBreakdown: any[];
    monthlyComparison: any[];
    totals: any;
    statusBreakdown: any;
    billCount: number;
    averageBill: number;
    rawData: any[];
  };
}

const ReportsPage = () => {
  const [reportData, setReportData] = useState<ReportData>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    type: 'both' as 'expenses' | 'bills' | 'both',
    period: 'monthly' as 'monthly' | 'yearly',
    year: new Date().getFullYear(),
    month: undefined as number | undefined,
    startDate: format(startOfYear(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfYear(new Date()), 'yyyy-MM-dd'),
    categories: [] as string[]
  });

  // UI states
  const [chartType, setChartType] = useState<'pie' | 'bar' | 'line' | 'area'>('pie');
  const [showFilters, setShowFilters] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Available categories
  const expenseCategories = ['food', 'transportation', 'utilities', 'entertainment', 'healthcare', 'shopping', 'education', 'other'];
  const billCategories = ['utilities', 'rent', 'insurance', 'subscriptions', 'loan', 'other'];

  useEffect(() => {
    fetchReports();
  }, [filters.type, filters.period, filters.year, filters.month]);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        type: filters.type,
        period: filters.period,
        year: filters.year.toString(),
        ...(filters.month !== undefined && { month: filters.month.toString() }),
        ...(filters.categories.length > 0 && { categories: filters.categories.join(',') })
      });

      const response = await fetch(`/api/reports?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }

      const data = await response.json();
      setReportData(data);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async (type: 'expenses' | 'bills') => {
    setExporting(true);
    try {
      await ExportUtils.exportToCSV(type, {
        startDate: filters.startDate,
        endDate: filters.endDate,
        categories: filters.categories
      });
    } catch (error) {
      console.error('Export failed:', error);
      setError('Failed to export CSV');
    } finally {
      setExporting(false);
    }
  };

  const handleExportPDF = async () => {
    setExporting(true);
    setError(null); // Clear any previous errors
    
    try {
      // Check if reports container exists and has content
      const reportsContainer = document.getElementById('reports-container');
      if (!reportsContainer) {
        throw new Error('Reports container not found');
      }
      
      // Check if there's any data to export
      if (!reportData.expenses && !reportData.bills) {
        throw new Error('No data available to export. Please load some reports first.');
      }
      
      console.log('Starting PDF export...');
      
      const filename = `finovate_financial_report_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      
      try {
        // Try advanced PDF generation first
        await ExportUtils.generatePDF(
          'reports-container',
          filename,
          {
            title: 'Finovate Financial Report',
            orientation: 'portrait'
          }
        );
        console.log('Advanced PDF export completed successfully');
      } catch (advancedError) {
        console.log('Advanced PDF failed, trying simple method:', advancedError);
        
        // Fallback to simple print-based PDF generation
        await ExportUtils.generateSimplePDF('reports-container', filename);
        console.log('Simple PDF export completed successfully');
      }
      
    } catch (error) {
      console.error('PDF export failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to export PDF';
      setError(`PDF Export Error: ${errorMessage}. Try using the Print button as an alternative.`);
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = async () => {
    try {
      await ExportUtils.printReport('reports-container');
    } catch (error) {
      console.error('Print failed:', error);
      setError('Failed to print report');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const renderSummaryCards = () => {
    const cards = [];

    if (reportData.expenses) {
      cards.push(
        <div key="expenses" className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-sm text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Expenses</p>
              <p className="text-2xl font-bold">{formatCurrency(reportData.expenses.totals.current)}</p>
              <p className="text-blue-100 text-sm mt-1">
                {reportData.expenses.transactionCount} transactions • Avg: {formatCurrency(reportData.expenses.averageTransaction)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className={`w-6 h-6 ${reportData.expenses.totals.trend === 'up' ? 'text-green-200' : 
                reportData.expenses.totals.trend === 'down' ? 'text-red-200' : 'text-blue-200'}`} />
              <span className="text-sm font-medium">
                {reportData.expenses.totals.growthPercentage > 0 ? '+' : ''}{reportData.expenses.totals.growthPercentage.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      );
    }

    if (reportData.bills) {
      cards.push(
        <div key="bills" className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-sm text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Bills</p>
              <p className="text-2xl font-bold">{formatCurrency(reportData.bills.totals.current)}</p>
              <p className="text-green-100 text-sm mt-1">
                {reportData.bills.billCount} bills • Avg: {formatCurrency(reportData.bills.averageBill)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className={`w-6 h-6 ${reportData.bills.totals.trend === 'up' ? 'text-green-200' : 
                reportData.bills.totals.trend === 'down' ? 'text-red-200' : 'text-green-200'}`} />
              <span className="text-sm font-medium">
                {reportData.bills.totals.growthPercentage > 0 ? '+' : ''}{reportData.bills.totals.growthPercentage.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      );
    }

    return cards;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
            <p className="text-gray-600">
              Comprehensive financial insights and data analysis
            </p>
          </div>
          
          {/* Export Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
            
            <div className="flex items-center gap-2">
              {(filters.type === 'expenses' || filters.type === 'both') && (
                <button
                  onClick={() => handleExportCSV('expenses')}
                  disabled={exporting}
                  className="flex items-center gap-2 px-4 py-2 text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  CSV (Expenses)
                </button>
              )}
              
              {(filters.type === 'bills' || filters.type === 'both') && (
                <button
                  onClick={() => handleExportCSV('bills')}
                  disabled={exporting}
                  className="flex items-center gap-2 px-4 py-2 text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  CSV (Bills)
                </button>
              )}
              
              <button
                onClick={handleExportPDF}
                disabled={exporting}
                className="flex items-center gap-2 px-4 py-2 text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-50"
              >
                {exporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-600 border-t-transparent" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    PDF
                  </>
                )}
              </button>
              
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="both">Both</option>
                  <option value="expenses">Expenses Only</option>
                  <option value="bills">Bills Only</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
                <select
                  value={filters.period}
                  onChange={(e) => setFilters(prev => ({ ...prev, period: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                <select
                  value={filters.year}
                  onChange={(e) => setFilters(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Chart Type</label>
                <select
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pie">Pie Chart</option>
                  <option value="bar">Bar Chart</option>
                  <option value="line">Line Chart</option>
                  <option value="area">Area Chart</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <button
                onClick={fetchReports}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="w-4 h-4 text-red-400 mr-3">⚠</div>
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Generating reports...</span>
        </div>
      )}

      {/* Reports Container */}
      <div id="reports-container">
        {!loading && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {renderSummaryCards()}
            </div>

            {/* Chart Type Toggle */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1">
                <button
                  onClick={() => setChartType('pie')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    chartType === 'pie' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <PieChart className="w-4 h-4" />
                  Pie
                </button>
                <button
                  onClick={() => setChartType('bar')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    chartType === 'bar' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  Bar
                </button>
                <button
                  onClick={() => setChartType('line')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    chartType === 'line' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <LineChart className="w-4 h-4" />
                  Line
                </button>
                <button
                  onClick={() => setChartType('area')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    chartType === 'area' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  Area
                </button>
              </div>
            </div>

            {/* Charts */}
            <div className="space-y-8">
              {/* Expense Reports */}
              {reportData.expenses && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Expense Analysis</h2>
                  
                  {/* Category Breakdown */}
                  {chartType === 'pie' ? (
                    <EnhancedPieChart
                      data={reportData.expenses.categoryBreakdown}
                      type="expenses"
                      title="Expenses by Category"
                      subtitle={`Breakdown for ${filters.year}${filters.month !== undefined ? ` - ${format(new Date(filters.year, filters.month), 'MMMM')}` : ''}`}
                    />
                  ) : (
                    reportData.expenses.monthlyComparison && (
                      <ComparisonChart
                        data={reportData.expenses.monthlyComparison}
                        type={chartType as 'bar' | 'line' | 'area'}
                        period={filters.period}
                        title="Expense Trends"
                        subtitle="Current year vs previous year comparison"
                      />
                    )
                  )}
                  
                  {/* Detailed Expense Data */}
                  {reportData.expenses.rawData && reportData.expenses.rawData.length > 0 && (
                    <DataTable
                      data={reportData.expenses.rawData}
                      type="expenses"
                      title={`Detailed Expense Data (${reportData.expenses.rawData.length} transactions)`}
                    />
                  )}
                </div>
              )}

              {/* Bill Reports */}
              {reportData.bills && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Bill Analysis</h2>
                  
                  {/* Status Overview */}
                  {reportData.bills.statusBreakdown && (
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Bill Status Overview</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-green-50 rounded-lg p-4 text-center">
                          <p className="text-2xl font-bold text-green-700">
                            {reportData.bills.statusBreakdown.paid || 0}
                          </p>
                          <p className="text-sm text-green-600">Paid Bills</p>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-4 text-center">
                          <p className="text-2xl font-bold text-yellow-700">
                            {reportData.bills.statusBreakdown.pending || 0}
                          </p>
                          <p className="text-sm text-yellow-600">Pending Bills</p>
                        </div>
                        <div className="bg-red-50 rounded-lg p-4 text-center">
                          <p className="text-2xl font-bold text-red-700">
                            {reportData.bills.statusBreakdown.overdue || 0}
                          </p>
                          <p className="text-sm text-red-600">Overdue Bills</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Category Breakdown */}
                  {chartType === 'pie' ? (
                    <EnhancedPieChart
                      data={reportData.bills.categoryBreakdown}
                      type="bills"
                      title="Bills by Category"
                      subtitle={`Breakdown for ${filters.year}${filters.month !== undefined ? ` - ${format(new Date(filters.year, filters.month), 'MMMM')}` : ''}`}
                    />
                  ) : (
                    reportData.bills.monthlyComparison && (
                      <ComparisonChart
                        data={reportData.bills.monthlyComparison}
                        type={chartType as 'bar' | 'line' | 'area'}
                        period={filters.period}
                        title="Bill Trends"
                        subtitle="Current year vs previous year comparison"
                      />
                    )
                  )}
                  
                  {/* Detailed Bill Data */}
                  {reportData.bills.rawData && reportData.bills.rawData.length > 0 && (
                    <DataTable
                      data={reportData.bills.rawData}
                      type="bills"
                      title={`Detailed Bill Data (${reportData.bills.rawData.length} bills)`}
                    />
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-12 text-center text-sm text-gray-500 no-print">
        <p>Report generated on {format(new Date(), 'MMMM dd, yyyy HH:mm')}</p>
        <p className="mt-1">Data filtered: {ExportUtils.formatFiltersForDisplay(filters)}</p>
      </div>
    </div>
  );
};

export default ReportsPage;
