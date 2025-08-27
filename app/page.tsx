import Link from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="mb-16 text-center">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          Welcome to Finovate
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Your journey from financial literacy to building a lasting legacy starts here.
          Learn, invest, and secure your financial future with confidence.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/register"
            className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            Get Started
          </Link>
          <Link
            href="/learn"
            className="inline-flex h-12 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Explore Courses
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">Build Your Financial Future</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-card rounded-lg p-6 border shadow-sm">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Learn Financial Basics</h3>
            <p className="text-sm text-muted-foreground">
              Start with fundamentals of budgeting, saving, and understanding money management.
            </p>
          </div>

          <div className="bg-card rounded-lg p-6 border shadow-sm">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Track Your Progress</h3>
            <p className="text-sm text-muted-foreground">
              Monitor your financial literacy journey with detailed analytics and achievements.
            </p>
          </div>

          <div className="bg-card rounded-lg p-6 border shadow-sm">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Practice Investing</h3>
            <p className="text-sm text-muted-foreground">
              Use our simulator to practice investing without risk and learn market dynamics.
            </p>
          </div>

          <div className="bg-card rounded-lg p-6 border shadow-sm">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Build Your Legacy</h3>
            <p className="text-sm text-muted-foreground">
              Create long-term wealth strategies and secure your family's financial future.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-muted rounded-lg p-12 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Financial Future?</h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join thousands of users who are building their financial literacy and creating lasting wealth.
        </p>
        <Link
          href="/register"
          className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          Start Your Journey Today
        </Link>
      </section>
    </div>
  );
}
