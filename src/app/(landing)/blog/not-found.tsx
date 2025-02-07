import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="font-heading text-6xl md:text-8xl font-bold tracking-tight leading-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-neutral-950 to-neutral-500">
          404
        </h1>
        <h2 className="text-2xl md:text-3xl font-medium mb-4 text-neutral-800">
          Page Not Found
        </h2>
        <p className="text-neutral-600 mb-8 max-w-md mx-auto">
        Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link 
          href="/"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-neutral-900 text-neutral-50 hover:bg-neutral-800 h-10 py-2 px-4"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
} 