"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { IBill } from '@/models/Bill';
import { formatDateForInput } from '@/lib/utils';

interface BillFormProps {
  bill?: IBill;
  onSubmit: (billData: BillFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export interface BillFormData {
  title: string;
  amount: number;
  dueDate: string;
  category: string;
  description?: string;
  isRecurring: boolean;
  recurringPeriod?: string;
}

const categories = [
  { value: 'utilities', label: 'Utilities' },
  { value: 'rent', label: 'Rent' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'subscriptions', label: 'Subscriptions' },
  { value: 'loan', label: 'Loan' },
  { value: 'other', label: 'Other' },
];

const recurringPeriods = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

export default function BillForm({ bill, onSubmit, onCancel, isLoading }: BillFormProps) {
  const [formData, setFormData] = useState<BillFormData>({
    title: bill?.title || '',
    amount: bill?.amount || 0,
    dueDate: bill?.dueDate ? formatDateForInput(new Date(bill.dueDate)) : '',
    category: bill?.category || '',
    description: bill?.description || '',
    isRecurring: bill?.isRecurring || false,
    recurringPeriod: bill?.recurringPeriod || 'monthly',
  });

  const [errors, setErrors] = useState<Partial<BillFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<BillFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 0; // Use 0 to indicate error for number field
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof BillFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{bill ? 'Edit Bill' : 'Add New Bill'}</CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Bill Title *</Label>
            <Input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Electricity Bill, Netflix Subscription"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Amount and Due Date Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount || ''}
                onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className={errors.amount !== undefined ? 'border-red-500' : ''}
              />
              {errors.amount !== undefined && (
                <p className="text-sm text-red-500">Amount must be greater than 0</p>
              )}
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                className={errors.dueDate ? 'border-red-500' : ''}
              />
              {errors.dueDate && (
                <p className="text-sm text-red-500">{errors.dueDate}</p>
              )}
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className={errors.category ? 'border-red-500' : ''}
            >
              <option value="" disabled>Select a category</option>
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </Select>
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              type="text"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Additional notes about this bill"
            />
          </div>

          {/* Recurring Options */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                id="isRecurring"
                type="checkbox"
                checked={formData.isRecurring}
                onChange={(e) => handleInputChange('isRecurring', e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="isRecurring">This is a recurring bill</Label>
            </div>

            {formData.isRecurring && (
              <div className="space-y-2">
                <Label htmlFor="recurringPeriod">Recurring Period</Label>
                <Select
                  value={formData.recurringPeriod}
                  onChange={(e) => handleInputChange('recurringPeriod', e.target.value)}
                >
                  {recurringPeriods.map((period) => (
                    <option key={period.value} value={period.value}>
                      {period.label}
                    </option>
                  ))}
                </Select>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex gap-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Saving...' : bill ? 'Update Bill' : 'Add Bill'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
