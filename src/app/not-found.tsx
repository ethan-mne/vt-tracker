import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-blue-600 mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-gray-900 mb-6">Page Not Found</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          We couldn't find the page you were looking for. It might have been moved or deleted.
        </p>
        <Link href="/" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md font-medium shadow-sm hover:bg-blue-700 transition-colors">
          Return to home
        </Link>
      </div>
    </div>
  );
} 