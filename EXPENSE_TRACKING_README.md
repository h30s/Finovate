# Expense Tracking System

A comprehensive expense tracking system built with Next.js 15, TypeScript, MongoDB, and NextAuth for authentication.

## Features

### ✅ Core Requirements Implemented

1. **Expense Model**: `{ userId, category, amount, date, note }`
2. **Add Expense Page**: Form to create new expenses
3. **List Expenses Page**: Table with search and filter functionality
4. **Edit/Delete Expenses**: Full CRUD operations
5. **Category-wise Charts**: Visual analytics with pie and bar charts

### 📊 Pages & Routes

#### Pages
- `/expenses` - List all expenses with search/filter
- `/expenses/add` - Add new expense form
- `/expenses/edit/[id]` - Edit existing expense
- `/expenses/analytics` - Comprehensive analytics with charts

#### API Routes
- `GET /api/expenses` - List expenses with pagination and filters
- `POST /api/expenses` - Create new expense
- `GET /api/expenses/[id]` - Get single expense
- `PUT /api/expenses/[id]` - Update expense
- `DELETE /api/expenses/[id]` - Delete expense
- `GET /api/expenses/stats` - Get expense statistics and analytics

## 🏗️ Architecture

### Database Model (MongoDB/Mongoose)

```typescript
interface IExpense {
  userId: string;
  category: string; // Required
  amount: number; // Required, minimum 0.01
  date: Date; // Required
  note?: string; // Optional
  createdAt: Date; // Auto-generated
  updatedAt: Date; // Auto-generated
}
```

**Categories**: food, transportation, utilities, entertainment, healthcare, shopping, education, other

**Indexes**: 
- `{ userId: 1, date: -1 }` for efficient user queries
- `{ userId: 1, category: 1 }` for category filtering

### API Features

#### Expense CRUD
- **Authentication**: All routes require user authentication via NextAuth
- **Authorization**: Users can only access their own expenses
- **Validation**: Server-side validation for required fields and data types
- **Error Handling**: Comprehensive error responses with appropriate HTTP status codes

#### Search & Filter
- **Text Search**: Search in note and category fields (case-insensitive)
- **Category Filter**: Filter by specific expense category
- **Date Range**: Filter expenses by date range
- **Pagination**: Configurable page size with pagination metadata

#### Analytics
- **Category Stats**: Aggregated spending by category with totals and averages
- **Monthly Trends**: Time-series data for spending patterns
- **Summary Stats**: Total amount, transaction count, average expense

### UI Components

#### Form Components
- `Input` - Styled input fields
- `Select` - Dropdown selectors
- `Textarea` - Multi-line text input
- `Label` - Form labels
- `Button` - Action buttons with variants

#### Layout Components
- `Card` - Container components
- `Table` - Data tables with proper styling
- `Sidebar` - Navigation menu

#### Chart Components
- `ExpensesChart` - Line/Bar charts for monthly trends
- `CategoryExpenseChart` - Pie/Bar charts for category breakdown

## 🎨 UI Features

### Responsive Design
- Mobile-first responsive layout
- Adaptive grid layouts
- Touch-friendly interface

### User Experience
- Loading states and skeletons
- Success/error feedback
- Confirmation dialogs for destructive actions
- Form validation with error messages

### Visual Analytics
- **Pie Charts**: Category distribution with percentages
- **Bar Charts**: Category comparison and monthly trends
- **Color-coded Categories**: Consistent color scheme across charts
- **Interactive Tooltips**: Detailed information on hover

## 🔐 Security Features

- **Authentication**: NextAuth integration with session management
- **Authorization**: User-scoped data access
- **Input Validation**: Server-side validation for all inputs
- **XSS Protection**: Proper data sanitization
- **CSRF Protection**: NextAuth built-in CSRF protection

## 📱 Features Breakdown

### Add Expense
- Category selection (dropdown)
- Amount input (decimal support)
- Date picker (defaults to today)
- Optional note field
- Form validation with real-time feedback

### List Expenses
- Paginated table view
- Real-time search (note and category)
- Category filtering
- Date range filtering
- Edit/Delete actions per expense
- Empty state handling

### Edit Expense
- Pre-populated form with existing data
- Same validation as add form
- Cancel functionality
- Success confirmation

### Analytics Dashboard
- Summary statistics cards
- Category breakdown (pie chart)
- Category comparison (bar chart)
- Monthly trend analysis
- Date range filtering for analytics
- No-data states

## 🚀 Getting Started

1. **Prerequisites**: MongoDB, Node.js, NextAuth configuration

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Access the application**:
   - Main dashboard: `http://localhost:3000/dashboard`
   - Expenses: `http://localhost:3000/expenses`
   - Add expense: `http://localhost:3000/expenses/add`
   - Analytics: `http://localhost:3000/expenses/analytics`

## 🔧 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js
- **UI Components**: Custom components with Tailwind CSS
- **Charts**: Recharts library
- **Icons**: Lucide React
- **Styling**: Tailwind CSS with custom design system

## 📋 Navigation

The sidebar includes:
- Dashboard (overview)
- All Expenses (list view)
- Add Expense (form)
- Analytics (charts and insights)
- Bills (existing feature)

Quick actions on dashboard link directly to expense management pages.

## 🔄 Data Flow

1. **User Authentication**: NextAuth session management
2. **API Calls**: Fetch API with proper error handling
3. **State Management**: React hooks for local state
4. **Real-time Updates**: Automatic refetch after CRUD operations
5. **Optimistic UI**: Loading states during async operations

## 💡 Usage Examples

### Adding an Expense
1. Navigate to `/expenses/add`
2. Select category from dropdown
3. Enter amount (validates positive numbers)
4. Choose date (defaults to today)
5. Add optional note
6. Submit form

### Filtering Expenses
1. Go to `/expenses`
2. Use search box for text search
3. Select category filter
4. Set date range
5. Results update automatically

### Viewing Analytics
1. Navigate to `/expenses/analytics`
2. Optionally set date range filter
3. View category breakdown pie chart
4. Compare categories in bar chart
5. Analyze monthly trends

This expense tracking system provides a complete solution for personal finance management with intuitive UI, robust backend, and comprehensive analytics.
