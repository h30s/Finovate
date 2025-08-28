import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Bill from '@/models/Bill';
import mongoose from 'mongoose';

// PUT /api/bills/[id] - Update bill (mainly for status changes)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid bill ID' }, { status: 400 });
    }

    await dbConnect();

    const body = await request.json();
    const { title, amount, dueDate, category, status, description, isRecurring, recurringPeriod } = body;

    // Find the bill and verify ownership
    const existingBill = await Bill.findOne({
      _id: id,
      userId: session.user.id
    });

    if (!existingBill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }

    // Prepare update object
    const updateData: Record<string, unknown> = {};

    if (title !== undefined) updateData.title = title;
    if (amount !== undefined) {
      if (amount <= 0) {
        return NextResponse.json(
          { error: 'Amount must be greater than 0' },
          { status: 400 }
        );
      }
      updateData.amount = parseFloat(amount);
    }
    if (dueDate !== undefined) updateData.dueDate = new Date(dueDate);
    if (category !== undefined) updateData.category = category;
    if (status !== undefined) updateData.status = status;
    if (description !== undefined) updateData.description = description;
    if (isRecurring !== undefined) updateData.isRecurring = isRecurring;
    if (recurringPeriod !== undefined) updateData.recurringPeriod = recurringPeriod;

    const bill = await Bill.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    return NextResponse.json({ bill });
  } catch (error) {
    console.error('Error updating bill:', error);
    return NextResponse.json(
      { error: 'Failed to update bill' },
      { status: 500 }
    );
  }
}

// DELETE /api/bills/[id] - Delete bill
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid bill ID' }, { status: 400 });
    }

    await dbConnect();

    // Find and delete the bill, ensuring user ownership
    const bill = await Bill.findOneAndDelete({
      _id: id,
      userId: session.user.id
    });

    if (!bill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Bill deleted successfully' });
  } catch (error) {
    console.error('Error deleting bill:', error);
    return NextResponse.json(
      { error: 'Failed to delete bill' },
      { status: 500 }
    );
  }
}

// GET /api/bills/[id] - Get specific bill
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid bill ID' }, { status: 400 });
    }

    await dbConnect();

    const bill = await Bill.findOne({
      _id: id,
      userId: session.user.id
    });

    if (!bill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }

    return NextResponse.json({ bill });
  } catch (error) {
    console.error('Error fetching bill:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bill' },
      { status: 500 }
    );
  }
}
