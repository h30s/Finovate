# Finovate: From Literacy to Legacy

A comprehensive financial literacy platform built with Next.js, TypeScript, TailwindCSS, and MongoDB.

## Project Structure

```
finovate/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout with Navbar and Sidebar
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/             # React components
│   ├── Navbar.tsx          # Navigation bar component
│   ├── Sidebar.tsx         # Sidebar navigation component
│   └── ui/                 # shadcn/ui components
│       ├── button.tsx
│       └── card.tsx
├── lib/                    # Utility functions
│   ├── mongodb.ts          # MongoDB connection utility
│   └── utils.ts            # Helper functions
├── models/                 # MongoDB models
│   └── User.ts             # User model schema
├── .env.local              # Environment variables
├── package.json            # Dependencies
└── tsconfig.json           # TypeScript configuration
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB installed locally or MongoDB Atlas account

### Installation

1. Navigate to the project directory:
```bash
cd finovate
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   - Edit `.env.local` file
   - Update `MONGODB_URI` with your MongoDB connection string
   - Generate and update `NEXTAUTH_SECRET`

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Features Implemented

- ✅ Next.js 15 with App Router
- ✅ TypeScript configuration
- ✅ TailwindCSS styling
- ✅ shadcn/ui component library
- ✅ MongoDB with Mongoose ORM
- ✅ Responsive layout with Navbar and Sidebar
- ✅ Sample home page with hero section
- ✅ User model schema
- ✅ Environment variables setup

## Next Steps

1. **Authentication**: Implement NextAuth.js for user authentication
2. **API Routes**: Create API endpoints for user management
3. **Additional Pages**: Build out dashboard, learning modules, and investment simulator
4. **State Management**: Add Redux or Zustand for global state
5. **Testing**: Set up Jest and React Testing Library
6. **Deployment**: Configure for Vercel deployment

## Technologies Used

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: TailwindCSS v4, shadcn/ui
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js (to be implemented)

## License

This project is private and proprietary.
