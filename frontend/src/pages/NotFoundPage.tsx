import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">Page not found</h2>
      <p className="text-sm text-slate-600">The requested route does not exist.</p>
      <Link to="/" className="text-sm font-medium text-primary-700">
        Go to home
      </Link>
    </div>
  );
}
