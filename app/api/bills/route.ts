import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Bill from '@/models/Bill';

// GET /api/bills - List bills with optional filters
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
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: Record<string, unknown> = { userId: session.user.id };
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (startDate || endDate) {
      filter.dueDate = {} as any;
      if (startDate) (filter.dueDate as any).$gte = new Date(startDate);
      if (endDate) (filter.dueDate as any).$lte = new Date(endDate);
    }

    const [bills, total] = await Promise.all([
      Bill.find(filter)
        .sort({ dueDate: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Bill.countDocuments(filter)
    ]);

    // Get summary statistics
    const summary = await Bill.aggregate([
      { $match: { userId: session.user.id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const summaryMap = summary.reduce((acc, item) => {
      acc[item._id] = { count: item.count, totalAmount: item.totalAmount };
      return acc;
    }, {});

    return NextResponse.json({
      bills,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: total,
        limit
      },
      summary: summaryMap
    });
  } catch (error) {
    console.error('Error fetching bills:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bills' },
      { status: 500 }
    );
  }
}

// POST /api/bills - Create new bill
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { title, amount, dueDate, category, description, isRecurring, recurringPeriod } = body;

    // Validate required fields
    if (!title || !amount || !dueDate || !category) {
      return NextResponse.json(
        { error: 'Title, amount, due date, and category are required' },
        { status: 400 }
      );
    }

    // Validate amount is positive
    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Validate due date is not in the past (optional - you might want to allow past dates)
    const dueDateObj = new Date(dueDate);
    if (dueDateObj < new Date(new Date().setHours(0, 0, 0, 0))) {
      return NextResponse.json(
        { error: 'Due date cannot be in the past' },
        { status: 400 }
      );
    }

    const bill = await Bill.create({
      userId: session.user.id,
      title,
      amount: parseFloat(amount),
      dueDate: dueDateObj,
      category,
      description: description || '',
      isRecurring: isRecurring || false,
      recurringPeriod: isRecurring ? recurringPeriod : undefined
    });

    return NextResponse.json({ bill }, { status: 201 });
  } catch (error) {
    console.error('Error creating bill:', error);
    return NextResponse.json(
      { error: 'Failed to create bill' },
      { status: 500 }
    );
  }
}
