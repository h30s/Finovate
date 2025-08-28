"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IBill } from '@/models/Bill';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CheckCircle, XCircle, Clock, AlertTriangle, Trash2, Edit } from 'lucide-react';

interface BillCardProps {
  bill: IBill;
  onStatusToggle?: (billId: string, newStatus: 'paid' | 'pending') => void;
  onDelete?: (billId: string) => void;
  onEdit?: (billId: string) => void;
  showActions?: boolean;
}

export default function BillCard({ 
  bill, 
  onStatusToggle, 
  onDelete, 
  onEdit,
  showActions = true 
}: BillCardProps) {
  const getStatusIcon = () => {
    switch (bill.status) {
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'overdue':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (bill.status) {
      case 'paid':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'overdue':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const isOverdue = bill.status === 'overdue';
  const isDue = new Date(bill.dueDate) <= new Date() && bill.status === 'pending';

  return (
    <Card className={`transition-all hover:shadow-md ${isOverdue ? 'border-red-200' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{bill.title}</CardTitle>
            <CardDescription className="mt-1">
              <span className="capitalize">{bill.category}</span>
              {bill.description && ` • ${bill.description}`}
            </CardDescription>
          </div>
          {showActions && (
            <CardAction>
              <div className="flex gap-1">
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(bill._id)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(bill._id)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardAction>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {/* Amount */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Amount:</span>
            <span className="text-lg font-semibold">{formatCurrency(bill.amount)}</span>
          </div>

          {/* Due Date */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Due Date:</span>
            <span className={`text-sm ${isDue || isOverdue ? 'text-red-600 font-medium' : ''}`}>
              {formatDate(bill.dueDate)}
            </span>
          </div>

          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status:</span>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor()}`}>
              {getStatusIcon()}
              <span className="capitalize">{bill.status}</span>
            </div>
          </div>

          {/* Recurring Info */}
          {bill.isRecurring && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Recurring:</span>
              <span className="text-sm capitalize">{bill.recurringPeriod}</span>
            </div>
          )}
        </div>
      </CardContent>

      {showActions && onStatusToggle && bill.status !== 'paid' && (
        <CardFooter className="pt-0">
          <Button
            onClick={() => onStatusToggle(bill._id, 'paid')}
            className="w-full"
            variant="default"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark as Paid
          </Button>
        </CardFooter>
      )}

      {showActions && onStatusToggle && bill.status === 'paid' && (
        <CardFooter className="pt-0">
          <Button
            onClick={() => onStatusToggle(bill._id, 'pending')}
            className="w-full"
            variant="outline"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Mark as Unpaid
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
