import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Expense from '@/models/Expense';
import Bill from '@/models/Bill';
import ReportsService from '@/lib/reports';
import { format } from 'date-fns';

// GET /api/reports/export - Export reports as CSV or trigger PDF generation
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'expenses' | 'bills';
    const format_type = searchParams.get('format') as 'csv' | 'pdf';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    // Handle empty categories parameter properly
    const categoriesParam = searchParams.get('categories');
    const categories = categoriesParam && categoriesParam.trim() !== '' 
      ? categoriesParam.split(',').filter(cat => cat.trim() !== '')
      : undefined;

    if (!type || !format_type) {
      return NextResponse.json(
        { error: 'Type and format parameters are required' },
        { status: 400 }
      );
    }

    // Build filter
    const filter: any = { userId: session.user.id };
    
    if (categories) {
      filter.category = { $in: categories };
    }
    
    if (startDate || endDate) {
      const dateField = type === 'expenses' ? 'date' : 'dueDate';
      filter[dateField] = {};
      if (startDate) filter[dateField].$gte = new Date(startDate);
      if (endDate) filter[dateField].$lte = new Date(endDate);
    }

    // Fetch data
    let data;
    if (type === 'expenses') {
      data = await Expense.find(filter).sort({ date: -1 }).lean();
    } else {
      data = await Bill.find(filter).sort({ dueDate: -1 }).lean();
    }

    if (format_type === 'csv') {
      // Define headers based on type to ensure consistency
      let headers: string[];
      if (type === 'expenses') {
        headers = ['Date', 'Category', 'Amount', 'Note', 'Created At'];
      } else {
        headers = ['Title', 'Amount', 'Due Date', 'Category', 'Status', 'Description', 'Is Recurring', 'Recurring Period', 'Created At'];
      }
      
      // Check if there's data to export
      if (!data || data.length === 0) {
        // Generate sample CSV with headers and example data
        let sampleContent: string;
        
        if (type === 'expenses') {
          sampleContent = headers.join(',') + '\n' +
            '# No actual data found. Below are example entries to show the format:\n' +
            `${format(new Date(), 'yyyy-MM-dd')},Food,50.00,Lunch at restaurant,${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}\n` +
            `${format(new Date(), 'yyyy-MM-dd')},Transportation,20.00,Uber ride,${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}\n` +
            `${format(new Date(), 'yyyy-MM-dd')},Shopping,150.00,Groceries,${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`;
        } else {
          sampleContent = headers.join(',') + '\n' +
            '# No actual data found. Below are example entries to show the format:\n' +
            `Electricity Bill,120.00,${format(new Date(), 'yyyy-MM-dd')},utilities,pending,Monthly electricity bill,Yes,monthly,${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}\n` +
            `Internet Service,60.00,${format(new Date(), 'yyyy-MM-dd')},utilities,paid,Broadband internet,Yes,monthly,${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}\n` +
            `Rent Payment,1500.00,${format(new Date(), 'yyyy-MM-dd')},rent,pending,Monthly rent,Yes,monthly,${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`;
        }
        
        // Always return a CSV file with sample data when no data exists
        console.log(`No ${type} data found for export. Returning sample CSV template.`);
        
        return new Response(sampleContent, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="${type}_sample_${format(new Date(), 'yyyy-MM-dd')}.csv"`
          }
        });
      }

      // Format data for CSV
      const csvData = ReportsService.formatForCSV(data, type);
      
      // Convert to CSV string
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => 
          headers.map(header => {
            const value = row[header];
            // Escape commas and quotes in CSV values
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value || ''; // Handle undefined/null values
          }).join(',')
        )
      ].join('\n');

      // Return CSV response
      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${type}_report_${format(new Date(), 'yyyy-MM-dd')}.csv"`
        }
      });
    } else {
      // For PDF, return data for client-side generation
      const processedData = type === 'expenses' 
        ? ReportsService.processExpensesByCategory(data.map(item => ({ category: item.category, amount: item.amount })))
        : ReportsService.processBillsByCategory(data.map(item => ({ category: item.category, amount: item.amount, status: item.status })));

      return NextResponse.json({
        success: true,
        type,
        data: processedData,
        rawData: data,
        summary: {
          totalAmount: data.reduce((sum, item) => sum + item.amount, 0),
          totalCount: data.length,
          dateRange: {
            start: startDate || 'All time',
            end: endDate || 'All time'
          },
          categories: categories || 'All categories'
        }
      });
    }

  } catch (error) {
    console.error('Error exporting report:', error);
    return NextResponse.json(
      { error: 'Failed to export report' },
      { status: 500 }
    );
  }
}
