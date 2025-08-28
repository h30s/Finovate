"use client";

import React from "react";
import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="hidden lg:block w-64 h-[calc(100vh-4rem)] sticky top-16 bg-background border-r">
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Links</h2>
        <nav className="space-y-2">
          <Link
            href="/dashboard"
            className="block px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/expenses"
            className="block px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            All Expenses
          </Link>
          <Link
            href="/expenses/add"
            className="block px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Add Expense
          </Link>
          <Link
            href="/expenses/analytics"
            className="block px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Analytics
          </Link>
          <Link
            href="/bills"
            className="block px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            All Bills
          </Link>
          <Link
            href="/bills/add"
            className="block px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Add Bill
          </Link>
          <Link
            href="/reports"
            className="block px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Reports & Analytics
          </Link>
        </nav>

        <div className="mt-8">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Progress Overview
          </h3>
          <div className="space-y-2">
            <div className="bg-muted rounded-md p-3">
              <p className="text-sm font-medium">Learning Progress</p>
              <div className="mt-2 w-full bg-background rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '30%' }}></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">3/10 modules completed</p>
            </div>
            <div className="bg-muted rounded-md p-3">
              <p className="text-sm font-medium">Investment Score</p>
              <p className="text-2xl font-bold text-primary">720</p>
              <p className="text-xs text-muted-foreground">Intermediate level</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
