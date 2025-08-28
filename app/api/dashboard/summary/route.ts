import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Expense from '@/models/Expense';
import Bill from '@/models/Bill';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const userId = session.user.id;
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    // Get total expenses for current month
    const totalExpensesResult = await Expense.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth },
          status: { $ne: 'rejected' }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const totalExpenses = totalExpensesResult[0]?.total || 0;

    // Get upcoming bills (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const upcomingBillsResult = await Bill.aggregate([
      {
        $match: {
          userId: userId,
          dueDate: { $gte: currentDate, $lte: thirtyDaysFromNow },
          status: 'upcoming'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const upcomingBills = {
      total: upcomingBillsResult[0]?.total || 0,
      count: upcomingBillsResult[0]?.count || 0
    };

    // Get pending approvals
    const pendingApprovalsResult = await Expense.aggregate([
      {
        $match: {
          userId: userId,
          status: 'pending'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const pendingApprovals = {
      total: pendingApprovalsResult[0]?.total || 0,
      count: pendingApprovalsResult[0]?.count || 0
    };

    // Get monthly expenses for chart (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyExpenses = await Expense.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: sixMonthsAgo },
          status: { $ne: 'rejected' }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1
        }
      }
    ]);

    // Format monthly data for recharts
    const chartData = monthlyExpenses.map(item => ({
      month: new Date(item._id.year, item._id.month - 1).toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      }),
      amount: item.total,
      count: item.count
    }));

    return NextResponse.json({
      totalExpenses,
      upcomingBills,
      pendingApprovals,
      monthlyExpenses: chartData,
      period: {
        from: firstDayOfMonth.toISOString(),
        to: lastDayOfMonth.toISOString()
      }
    });

  } catch (error) {
    console.error('Dashboard summary error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard summary' },
      { status: 500 }
    );
  }
}
