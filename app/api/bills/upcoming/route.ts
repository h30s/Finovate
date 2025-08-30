import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Bill from '@/models/Bill';

// GET /api/bills/upcoming - Get upcoming bills for dashboard
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Update overdue bills first
    await (Bill as any).updateOverdueBills();

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7'); // Default to 7 days
    const limit = parseInt(searchParams.get('limit') || '10');

    // Calculate date range
    const today = new Date();
    const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);

    // Get bills that are overdue or due within specified days
    const upcomingBills = await Bill.find({
      userId: session.user.id,
      $or: [
        { status: 'overdue' },
        {
          status: 'pending',
          dueDate: { $lte: futureDate }
        }
      ]
    })
    .sort({ dueDate: 1 })
    .limit(limit)
    .lean();

    // Get counts for different urgency levels
    const overdueBills = await Bill.countDocuments({
      userId: session.user.id,
      status: 'overdue'
    });

    const dueTodayBills = await Bill.countDocuments({
      userId: session.user.id,
      status: 'pending',
      dueDate: {
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lte: new Date(today.setHours(23, 59, 59, 999))
      }
    });

    const dueSoonBills = await Bill.countDocuments({
      userId: session.user.id,
      status: 'pending',
      dueDate: {
        $gt: today,
        $lte: futureDate
      }
    });

    return NextResponse.json({
      bills: upcomingBills,
      summary: {
        overdue: overdueBills,
        dueToday: dueTodayBills,
        dueSoon: dueSoonBills,
        total: upcomingBills.length
      }
    });
  } catch (error) {
    console.error('Error fetching upcoming bills:', error);
    return NextResponse.json(
      { error: 'Failed to fetch upcoming bills' },
      { status: 500 }
    );
  }
}
