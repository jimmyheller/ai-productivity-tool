import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full py-4 bg-slate-100 border-t border-slate-200">
      <div className="container mx-auto px-4 flex justify-center">
        <Link href="/privacy" className="text-sm text-slate-600 hover:text-slate-900">
          Privacy Policy
        </Link>
      </div>
    </footer>
  );
}