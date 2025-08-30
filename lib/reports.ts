import { startOfMonth, endOfMonth, startOfYear, endOfYear, format } from 'date-fns';

export interface ExpenseReportData {
  category: string;
  total: number;
  count: number;
  avgAmount: number;
  percentage: number;
}

export interface BillReportData {
  category: string;
  total: number;
  count: number;
  avgAmount: number;
  percentage: number;
  paidCount: number;
  pendingCount: number;
  overdueCount: number;
}

export interface MonthlyComparisonData {
  month: string;
  currentYear: number;
  previousYear: number;
  growth: number;
  growthPercentage: number;
}

export interface YearlyComparisonData {
  year: string;
  total: number;
  growth: number;
  growthPercentage: number;
}

export interface ReportFilters {
  startDate?: Date;
  endDate?: Date;
  categories?: string[];
  type: 'expenses' | 'bills';
  period: 'monthly' | 'yearly';
}

export class ReportsService {
  /**
   * Process expense data for category-wise breakdown
   */
  static processExpensesByCategory(expenses: Array<{ category: string; amount: number }>): ExpenseReportData[] {
    const categoryMap = new Map<string, { total: number; count: number }>();
    
    expenses.forEach(expense => {
      const existing = categoryMap.get(expense.category) || { total: 0, count: 0 };
      categoryMap.set(expense.category, {
        total: existing.total + expense.amount,
        count: existing.count + 1
      });
    });

    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    return Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      total: data.total,
      count: data.count,
      avgAmount: data.total / data.count,
      percentage: totalAmount > 0 ? (data.total / totalAmount) * 100 : 0
    })).sort((a, b) => b.total - a.total);
  }

  /**
   * Process bill data for category-wise breakdown
   */
  static processBillsByCategory(bills: Array<{ category: string; amount: number; status: string }>): BillReportData[] {
    const categoryMap = new Map<string, { total: number; count: number; paid: number; pending: number; overdue: number }>();
    
    bills.forEach(bill => {
      const existing = categoryMap.get(bill.category) || { total: 0, count: 0, paid: 0, pending: 0, overdue: 0 };
      categoryMap.set(bill.category, {
        total: existing.total + bill.amount,
        count: existing.count + 1,
        paid: existing.paid + (bill.status === 'paid' ? 1 : 0),
        pending: existing.pending + (bill.status === 'pending' ? 1 : 0),
        overdue: existing.overdue + (bill.status === 'overdue' ? 1 : 0)
      });
    });

    const totalAmount = bills.reduce((sum, bill) => sum + bill.amount, 0);
    
    return Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      total: data.total,
      count: data.count,
      avgAmount: data.total / data.count,
      percentage: totalAmount > 0 ? (data.total / totalAmount) * 100 : 0,
      paidCount: data.paid,
      pendingCount: data.pending,
      overdueCount: data.overdue
    })).sort((a, b) => b.total - a.total);
  }

  /**
   * Generate monthly comparison data for the current year vs previous year
   */
  static generateMonthlyComparison(currentYearData: Array<{ date?: Date; dueDate?: Date; amount: number }>, previousYearData: Array<{ date?: Date; dueDate?: Date; amount: number }>): MonthlyComparisonData[] {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const currentYearByMonth = this.groupDataByMonth(currentYearData);
    const previousYearByMonth = this.groupDataByMonth(previousYearData);

    return months.map((month, index) => {
      const currentYear = currentYearByMonth[index] || 0;
      const previousYear = previousYearByMonth[index] || 0;
      const growth = currentYear - previousYear;
      const growthPercentage = previousYear > 0 ? (growth / previousYear) * 100 : 0;

      return {
        month,
        currentYear,
        previousYear,
        growth,
        growthPercentage
      };
    });
  }

  /**
   * Generate yearly comparison data
   */
  static generateYearlyComparison(yearlyData: { [year: string]: number }): YearlyComparisonData[] {
    const years = Object.keys(yearlyData).sort();
    
    return years.map((year, index) => {
      const total = yearlyData[year];
      const previousYearTotal = index > 0 ? yearlyData[years[index - 1]] : 0;
      const growth = total - previousYearTotal;
      const growthPercentage = previousYearTotal > 0 ? (growth / previousYearTotal) * 100 : 0;

      return {
        year,
        total,
        growth,
        growthPercentage
      };
    });
  }

  /**
   * Group data by month (0-11 for Jan-Dec)
   */
  private static groupDataByMonth(data: Array<{ date?: Date; dueDate?: Date; amount: number }>): number[] {
    const monthTotals = new Array(12).fill(0);
    
    data.forEach(item => {
      const date = new Date(item.date || item.dueDate || new Date());
      const month = date.getMonth();
      monthTotals[month] += item.amount;
    });

    return monthTotals;
  }

  /**
   * Get date range for filtering
   */
  static getDateRange(period: 'monthly' | 'yearly', year?: number, month?: number) {
    const targetDate = new Date();
    if (year) targetDate.setFullYear(year);
    if (month !== undefined) targetDate.setMonth(month);

    if (period === 'monthly') {
      return {
        start: startOfMonth(targetDate),
        end: endOfMonth(targetDate)
      };
    } else {
      return {
        start: startOfYear(targetDate),
        end: endOfYear(targetDate)
      };
    }
  }

  /**
   * Format data for CSV export
   */
  static formatForCSV(data: Array<Record<string, unknown>>, type: 'expenses' | 'bills'): Array<Record<string, unknown>> {
    if (type === 'expenses') {
      return data.map(item => ({
        Date: format(new Date(item.date as string), 'yyyy-MM-dd'),
        Category: item.category,
        Amount: item.amount,
        Note: item.note || '',
        'Created At': format(new Date(item.createdAt as string), 'yyyy-MM-dd HH:mm:ss')
      }));
    } else {
      return data.map(item => ({
        Title: item.title,
        Amount: item.amount,
        'Due Date': format(new Date(item.dueDate as string), 'yyyy-MM-dd'),
        Category: item.category,
        Status: item.status,
        Description: item.description || '',
        'Is Recurring': item.isRecurring ? 'Yes' : 'No',
        'Recurring Period': item.recurringPeriod || '',
        'Created At': format(new Date(item.createdAt as string), 'yyyy-MM-dd HH:mm:ss')
      }));
    }
  }

  /**
   * Calculate trend analysis
   */
  static calculateTrend(currentData: number[], previousData: number[]): {
    trend: 'up' | 'down' | 'stable';
    changePercentage: number;
  } {
    const currentTotal = currentData.reduce((sum, val) => sum + val, 0);
    const previousTotal = previousData.reduce((sum, val) => sum + val, 0);
    
    if (previousTotal === 0) {
      return { trend: 'stable', changePercentage: 0 };
    }
    
    const changePercentage = ((currentTotal - previousTotal) / previousTotal) * 100;
    
    return {
      trend: changePercentage > 5 ? 'up' : changePercentage < -5 ? 'down' : 'stable',
      changePercentage
    };
  }
}

export default ReportsService;
