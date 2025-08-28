import mongoose, { Schema, Document } from 'mongoose';

export interface IBill extends Document {
  userId: string;
  title: string;
  amount: number;
  dueDate: Date;
  category: string;
  status: 'upcoming' | 'paid' | 'overdue';
  description?: string;
  isRecurring: boolean;
  recurringPeriod?: 'monthly' | 'quarterly' | 'yearly';
  createdAt: Date;
  updatedAt: Date;
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
    enum: ['upcoming', 'paid', 'overdue'],
    default: 'upcoming',
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

export default mongoose.models.Bill || mongoose.model<IBill>('Bill', BillSchema);
