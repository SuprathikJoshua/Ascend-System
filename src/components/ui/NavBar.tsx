'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Code2, Globe, Settings, Sparkles } from 'lucide-react';

const LINKS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dsa', label: 'DSA', icon: Code2 },
  { href: '/webdev', label: 'Web Dev', icon: Globe },
  { href: '/ai', label: 'AI', icon: Sparkles },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function NavBar() {
  const pathname = usePathname();
  if (pathname === '/login') return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 glass border-b border-gray-800 flex items-center px-3 sm:px-6 gap-2">
      <span className="text-violet-400 font-bold text-lg tracking-tight mr-1 sm:mr-4 flex items-center gap-2">
        <span className="text-xl">⚡</span>
        <span className="hidden sm:inline">PrepSystem</span>
      </span>
      <div className="flex items-center gap-1">
        {LINKS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname ? (href === '/' ? pathname === '/' : pathname.startsWith(href)) : false;
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              title={label}
              className={`min-h-11 min-w-11 flex items-center justify-center gap-2 px-2 sm:px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
              }`}
            >
              <Icon size={15} />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
