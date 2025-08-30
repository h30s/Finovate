import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Expense from '@/models/Expense';
import Bill from '@/models/Bill';
import ReportsService from '@/lib/reports';
import { startOfYear, endOfYear, subYears, format } from 'date-fns';

// GET /api/reports - Generate comprehensive reports
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'expenses' | 'bills' | 'both' || 'both';
    const period = searchParams.get('period') as 'monthly' | 'yearly' || 'monthly';
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : new Date().getFullYear();
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : undefined;
    const categories = searchParams.get('categories')?.split(',') || undefined;

    // Date ranges for current and previous periods
    let currentStart: Date, currentEnd: Date, previousStart: Date, previousEnd: Date;
    
    if (period === 'monthly') {
      const currentDate = new Date(year, month || new Date().getMonth());
      const previousDate = new Date(year - 1, month || new Date().getMonth());
      
      currentStart = startOfYear(currentDate);
      currentEnd = endOfYear(currentDate);
      previousStart = startOfYear(previousDate);
      previousEnd = endOfYear(previousDate);
    } else {
      currentStart = startOfYear(new Date(year, 0));
      currentEnd = endOfYear(new Date(year, 0));
      previousStart = startOfYear(subYears(new Date(year, 0), 1));
      previousEnd = endOfYear(subYears(new Date(year, 0), 1));
    }

    const results: any = {};

    // Process expenses if requested
    if (type === 'expenses' || type === 'both') {
      // Build expense filter
      const expenseFilter: any = { 
        userId: session.user.id,
        date: { $gte: currentStart, $lte: currentEnd }
      };
      
      if (categories) {
        expenseFilter.category = { $in: categories };
      }

      // Get current period expenses
      const currentExpenses = await Expense.find(expenseFilter).lean();
      
      // Get previous period expenses for comparison
      const previousExpenseFilter = {
        ...expenseFilter,
        date: { $gte: previousStart, $lte: previousEnd }
      };
      const previousExpenses = await Expense.find(previousExpenseFilter).lean();

      // Process expense data
      const expensesByCategory = ReportsService.processExpensesByCategory(
        currentExpenses.map(item => ({ category: item.category, amount: item.amount }))
      );
      const monthlyComparison = ReportsService.generateMonthlyComparison(
        currentExpenses.map(item => ({ date: item.date, amount: item.amount })),
        previousExpenses.map(item => ({ date: item.date, amount: item.amount }))
      );
      
      // Calculate totals and trends
      const currentTotal = currentExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      const previousTotal = previousExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      const expenseTrend = ReportsService.calculateTrend(
        [currentTotal],
        [previousTotal]
      );

      results.expenses = {
        categoryBreakdown: expensesByCategory,
        monthlyComparison: period === 'monthly' ? monthlyComparison : undefined,
        totals: {
          current: currentTotal,
          previous: previousTotal,
          growth: currentTotal - previousTotal,
          growthPercentage: expenseTrend.changePercentage,
          trend: expenseTrend.trend
        },
        transactionCount: currentExpenses.length,
        averageTransaction: currentExpenses.length > 0 ? currentTotal / currentExpenses.length : 0,
        rawData: currentExpenses
      };
    }

    // Process bills if requested
    if (type === 'bills' || type === 'both') {
      // Build bill filter
      const billFilter: any = { 
        userId: session.user.id,
        dueDate: { $gte: currentStart, $lte: currentEnd }
      };
      
      if (categories) {
        billFilter.category = { $in: categories };
      }

      // Get current period bills
      const currentBills = await Bill.find(billFilter).lean();
      
      // Get previous period bills for comparison
      const previousBillFilter = {
        ...billFilter,
        dueDate: { $gte: previousStart, $lte: previousEnd }
      };
      const previousBills = await Bill.find(previousBillFilter).lean();

      // Process bill data
      const billsByCategory = ReportsService.processBillsByCategory(
        currentBills.map(item => ({ category: item.category, amount: item.amount, status: item.status }))
      );
      const monthlyBillComparison = ReportsService.generateMonthlyComparison(
        currentBills.map(item => ({ dueDate: item.dueDate, amount: item.amount })),
        previousBills.map(item => ({ dueDate: item.dueDate, amount: item.amount }))
      );
      
      // Calculate totals and trends
      const currentBillTotal = currentBills.reduce((sum, bill) => sum + bill.amount, 0);
      const previousBillTotal = previousBills.reduce((sum, bill) => sum + bill.amount, 0);
      const billTrend = ReportsService.calculateTrend(
        [currentBillTotal],
        [previousBillTotal]
      );

      // Status breakdown
      const statusBreakdown = currentBills.reduce((acc, bill) => {
        acc[bill.status] = (acc[bill.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      results.bills = {
        categoryBreakdown: billsByCategory,
        monthlyComparison: period === 'monthly' ? monthlyBillComparison : undefined,
        totals: {
          current: currentBillTotal,
          previous: previousBillTotal,
          growth: currentBillTotal - previousBillTotal,
          growthPercentage: billTrend.changePercentage,
          trend: billTrend.trend
        },
        statusBreakdown,
        billCount: currentBills.length,
        averageBill: currentBills.length > 0 ? currentBillTotal / currentBills.length : 0,
        rawData: currentBills
      };
    }

    return NextResponse.json({
      success: true,
      period,
      year,
      month,
      generatedAt: new Date().toISOString(),
      ...results
    });

  } catch (error) {
    console.error('Error generating reports:', error);
    return NextResponse.json(
      { error: 'Failed to generate reports' },
      { status: 500 }
    );
  }
}
