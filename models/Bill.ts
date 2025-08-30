import mongoose, { Schema, Document } from 'mongoose';

export interface IBill extends Document {
  userId: string;
  title: string;
  amount: number;
  dueDate: Date;
  category: string;
  status: 'pending' | 'paid' | 'overdue';
  description?: string;
  isRecurring: boolean;
  recurringPeriod?: 'monthly' | 'quarterly' | 'yearly';
  createdAt: Date;
  updatedAt: Date;
}

export interface IBillModel {
  updateOverdueBills(): Promise<unknown>;
}

const BillSchema: Schema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['utilities', 'rent', 'insurance', 'subscriptions', 'loan', 'other'],
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue'],
    default: 'pending',
  },
  description: {
    type: String,
    trim: true,
  },
  isRecurring: {
    type: Boolean,
    default: false,
  },
  recurringPeriod: {
    type: String,
    enum: ['monthly', 'quarterly', 'yearly'],
  },
}, {
  timestamps: true,
});

// Create indexes for better query performance
BillSchema.index({ userId: 1, dueDate: 1 });
BillSchema.index({ userId: 1, status: 1 });
BillSchema.index({ userId: 1, dueDate: 1, status: 1 });

// Pre-save middleware to update status based on due date
BillSchema.pre('save', function(next) {
  const bill = this as unknown as IBill;
  if (bill.status === 'pending' && bill.dueDate < new Date()) {
    bill.status = 'overdue';
  }
  next();
});

// Static method to update overdue bills
BillSchema.statics.updateOverdueBills = async function() {
  const currentDate = new Date();
  return this.updateMany(
    {
      status: 'pending',
      dueDate: { $lt: currentDate }
    },
    {
      $set: { status: 'overdue' }
    }
  );
};

export default mongoose.models.Bill || mongoose.model<IBill>('Bill', BillSchema);
