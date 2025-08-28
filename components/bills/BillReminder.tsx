"use client";

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IBill } from '@/models/Bill';
import { formatCurrency, formatDate } from '@/lib/utils';
import { AlertTriangle, Clock, DollarSign, Calendar, ArrowRight } from 'lucide-react';

interface BillReminderProps {
  bills: IBill[];
  onMarkAsPaid?: (billId: string) => void;
}

export default function BillReminder({ bills, onMarkAsPaid }: BillReminderProps) {
  if (!bills || bills.length === 0) {
    return null;
  }

  const overdueBills = bills.filter(bill => bill.status === 'overdue');
  const dueSoonBills = bills.filter(bill => {
    const dueDate = new Date(bill.dueDate);
    const today = new Date();
    const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return bill.status === 'pending' && daysDiff <= 7 && daysDiff >= 0;
  });

  const totalUpcomingAmount = [...overdueBills, ...dueSoonBills].reduce(
    (sum, bill) => sum + bill.amount, 0
  );

  return (
    <Card className="border-orange-200 bg-orange-50/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          <CardTitle className="text-orange-700">Bill Reminders</CardTitle>
        </div>
        <CardDescription>
          {overdueBills.length > 0 && (
            <span className="text-red-600 font-medium">
              {overdueBills.length} overdue bill{overdueBills.length > 1 ? 's' : ''}
            </span>
          )}
          {overdueBills.length > 0 && dueSoonBills.length > 0 && ' • '}
          {dueSoonBills.length > 0 && (
            <span className="text-orange-600 font-medium">
              {dueSoonBills.length} due within 7 days
            </span>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Total Amount Summary */}
        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
          <DollarSign className="w-5 h-5 text-orange-500" />
          <div>
            <p className="text-sm text-muted-foreground">Total Upcoming</p>
            <p className="font-semibold text-lg">{formatCurrency(totalUpcomingAmount)}</p>
          </div>
        </div>

        {/* Overdue Bills */}
        {overdueBills.length > 0 && (
          <div>
            <h4 className="font-medium text-red-700 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Overdue Bills
            </h4>
            <div className="space-y-2">
              {overdueBills.slice(0, 3).map((bill) => (
                <div
                  key={bill._id}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200"
                >
                  <div className="flex-1">
                    <p className="font-medium text-red-800">{bill.title}</p>
                    <p className="text-sm text-red-600">
                      Due: {formatDate(bill.dueDate)} • {formatCurrency(bill.amount)}
                    </p>
                  </div>
                  {onMarkAsPaid && (
                    <Button
                      size="sm"
                      onClick={() => onMarkAsPaid(bill._id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Pay Now
                    </Button>
                  )}
                </div>
              ))}
              {overdueBills.length > 3 && (
                <p className="text-sm text-red-600 text-center">
                  +{overdueBills.length - 3} more overdue bills
                </p>
              )}
            </div>
          </div>
        )}

        {/* Due Soon Bills */}
        {dueSoonBills.length > 0 && (
          <div>
            <h4 className="font-medium text-orange-700 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Due Soon
            </h4>
            <div className="space-y-2">
              {dueSoonBills.slice(0, 3).map((bill) => {
                const daysUntilDue = Math.ceil(
                  (new Date(bill.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                );
                
                return (
                  <div
                    key={bill._id}
                    className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-orange-800">{bill.title}</p>
                      <p className="text-sm text-orange-600">
                        Due in {daysUntilDue} day{daysUntilDue !== 1 ? 's' : ''} • {formatCurrency(bill.amount)}
                      </p>
                    </div>
                    {onMarkAsPaid && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onMarkAsPaid(bill._id)}
                        className="border-orange-300 text-orange-700 hover:bg-orange-100"
                      >
                        Pay Now
                      </Button>
                    )}
                  </div>
                );
              })}
              {dueSoonBills.length > 3 && (
                <p className="text-sm text-orange-600 text-center">
                  +{dueSoonBills.length - 3} more due soon
                </p>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="pt-2 border-t">
          <div className="flex gap-3">
            <Button asChild variant="outline" size="sm" className="flex-1">
              <Link href="/bills">
                <Calendar className="w-4 h-4 mr-2" />
                View All Bills
              </Link>
            </Button>
            <Button asChild size="sm" className="flex-1">
              <Link href="/bills/add">
                Add New Bill
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
