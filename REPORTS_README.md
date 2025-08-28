# Reports & Analytics System

This document describes the comprehensive Reports & Analytics system built for Finovate, providing detailed financial insights, data visualization, and export capabilities.

## Features

### ✅ Core Requirements Implemented

1. **Generate Reports for Expenses & Bills**
   - Category-wise breakdown and analysis
   - Detailed transaction and bill data
   - Comprehensive filtering options

2. **Monthly/Yearly Comparison**
   - Current vs previous period analysis
   - Growth percentage calculations
   - Trend indicators (up/down/stable)

3. **Pie Chart (Category-wise Spending)**
   - Interactive pie charts with hover tooltips
   - Detailed category breakdowns with percentages
   - Support for both expenses and bills

4. **Export to CSV/PDF**
   - CSV export for raw data analysis
   - PDF generation with charts and tables
   - Professional formatting

5. **Print Option**
   - Print-optimized layouts
   - Proper page breaks and formatting
   - Black and white compatibility

## Architecture

### API Endpoints

#### `/api/reports`
**GET** - Generate comprehensive reports
- **Parameters:**
  - `type`: 'expenses' | 'bills' | 'both'
  - `period`: 'monthly' | 'yearly'
  - `year`: Target year (default: current year)
  - `month`: Target month (optional)
  - `categories`: Comma-separated category list (optional)

**Response:**
```json
{
  "success": true,
  "period": "monthly",
  "year": 2024,
  "expenses": {
    "categoryBreakdown": [...],
    "monthlyComparison": [...],
    "totals": {
      "current": 1500,
      "previous": 1200,
      "growth": 300,
      "growthPercentage": 25,
      "trend": "up"
    },
    "transactionCount": 45,
    "averageTransaction": 33.33,
    "rawData": [...]
  },
  "bills": {
    "categoryBreakdown": [...],
    "monthlyComparison": [...],
    "totals": {...},
    "statusBreakdown": {
      "paid": 8,
      "pending": 3,
      "overdue": 1
    },
    "billCount": 12,
    "averageBill": 125,
    "rawData": [...]
  }
}
```

#### `/api/reports/export`
**GET** - Export reports in CSV or PDF format
- **Parameters:**
  - `type`: 'expenses' | 'bills'
  - `format`: 'csv' | 'pdf'
  - `startDate`: Filter start date (optional)
  - `endDate`: Filter end date (optional)
  - `categories`: Comma-separated categories (optional)

**CSV Response:** Direct file download
**PDF Response:** JSON data for client-side PDF generation

### Components

#### Core Components
- **`ReportsPage`** (`/app/reports/page.tsx`)
  - Main reports interface
  - Filter controls and chart type toggles
  - Export and print functionality

#### Chart Components
- **`EnhancedPieChart`** (`/components/reports/EnhancedPieChart.tsx`)
  - Interactive pie charts with detailed tooltips
  - Category breakdown with statistics
  - Support for both expenses and bills

- **`ComparisonChart`** (`/components/reports/ComparisonChart.tsx`)
  - Line, area, and bar chart support
  - Period-over-period comparison
  - Trend analysis visualization

- **`DataTable`** (`/components/reports/DataTable.tsx`)
  - Sortable and searchable data tables
  - Detailed transaction/bill listings
  - Export-friendly formatting

- **`FinancialSummaryWidget`** (`/components/reports/FinancialSummaryWidget.tsx`)
  - Summary statistics cards
  - Trend indicators
  - Key metrics display

### Utility Libraries

#### `ReportsService` (`/lib/reports.ts`)
- Data processing and aggregation
- Category-wise breakdown calculations
- Monthly/yearly comparison logic
- Trend analysis algorithms

#### `ExportUtils` (`/lib/exportUtils.ts`)
- CSV export functionality
- PDF generation from HTML
- Print optimization
- File download utilities

## Usage

### Accessing Reports
1. Navigate to `/reports` from the sidebar
2. Use filters to customize the report scope
3. Toggle between different chart types
4. Export or print as needed

### Filter Options
- **Report Type**: Expenses only, Bills only, or Both
- **Period**: Monthly or Yearly comparison
- **Year**: Select target year for analysis
- **Chart Type**: Pie, Bar, Line, or Area charts

### Export Options
- **CSV Export**: Raw data in spreadsheet format
- **PDF Export**: Visual reports with charts and tables
- **Print**: Browser-optimized printing with proper formatting

## Chart Types

### Pie Charts
- Category-wise spending breakdown
- Interactive tooltips with detailed information
- Percentage calculations
- Color-coded categories

### Comparison Charts
- **Bar Charts**: Side-by-side period comparison
- **Line Charts**: Trend visualization over time
- **Area Charts**: Filled trend visualization with emphasis on volume

### Data Tables
- Sortable columns (date, category, amount, status)
- Search functionality
- Pagination for large datasets
- Summary statistics

## Data Processing

### Category Breakdown
```typescript
{
  category: string,
  total: number,
  count: number,
  avgAmount: number,
  percentage: number,
  // Bills only:
  paidCount: number,
  pendingCount: number,
  overdueCount: number
}
```

### Monthly Comparison
```typescript
{
  month: string,
  currentYear: number,
  previousYear: number,
  growth: number,
  growthPercentage: number
}
```

### Trend Analysis
- **Up**: Growth > 5%
- **Down**: Decline > 5%
- **Stable**: Change between -5% and +5%

## Print Styling

The system includes comprehensive print CSS (`/styles/print.css`) that ensures:
- Proper page breaks
- Black and white compatibility
- Professional formatting
- Chart preservation
- Table optimization

## Dependencies

### Added Packages
- `jspdf`: PDF generation
- `html2canvas`: HTML to canvas conversion
- `csv-writer`: CSV file generation
- `date-fns`: Date manipulation and formatting
- `@types/jspdf`: TypeScript definitions

### Existing Dependencies
- `recharts`: Chart visualization library
- `lucide-react`: Icon components
- `next`: React framework
- `mongoose`: MongoDB ODM

## File Structure

```
├── app/
│   ├── api/
│   │   └── reports/
│   │       ├── route.ts              # Main reports API
│   │       └── export/
│   │           └── route.ts          # Export API
│   └── reports/
│       └── page.tsx                  # Reports page
├── components/
│   └── reports/
│       ├── ComparisonChart.tsx       # Trend comparison charts
│       ├── EnhancedPieChart.tsx      # Category pie charts
│       ├── DataTable.tsx             # Data table component
│       └── FinancialSummaryWidget.tsx # Summary widgets
├── lib/
│   ├── reports.ts                    # Data processing utilities
│   └── exportUtils.ts                # Export utilities
└── styles/
    └── print.css                     # Print-specific styles
```

## Future Enhancements

### Potential Improvements
1. **Advanced Filters**
   - Date range picker
   - Multi-select category filters
   - Amount range filters

2. **Additional Chart Types**
   - Donut charts
   - Stacked bar charts
   - Heat maps for spending patterns

3. **Enhanced Analytics**
   - Predictive spending analysis
   - Budget vs actual comparisons
   - Seasonal spending patterns

4. **Export Enhancements**
   - Excel format support
   - Email report delivery
   - Scheduled report generation

5. **Interactive Features**
   - Drill-down capabilities
   - Real-time data updates
   - Dashboard widgets

## Security Considerations

- All reports are user-scoped (userId filtering)
- Authentication required for all endpoints
- Data validation on all inputs
- Secure file generation and download

## Performance Optimizations

- Database indexes on frequently queried fields
- Lean queries for data retrieval
- Client-side data processing where appropriate
- Lazy loading for large datasets

## Testing

### Manual Testing
1. Create some expense and bill records
2. Navigate to `/reports`
3. Test different filter combinations
4. Verify chart type toggles work
5. Test export functionality (CSV/PDF)
6. Test print functionality

### Key Test Cases
- Empty data state handling
- Large dataset performance
- Export file generation
- Print formatting
- Responsive design
- Error state handling
