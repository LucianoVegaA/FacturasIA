import type { SVGProps } from 'react';
import Link from 'next/link';

// Placeholder SVG Icon for Hypernova (Star)
const HypernovaIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 2l2.35 7.16h7.65l-6.18 4.48 2.35 7.16L12 16.32l-6.17 4.48 2.35-7.16L2 9.16h7.65L12 2z"/>
  </svg>
);


export function AppLogo({ collapsed } : { collapsed?: boolean}) {
  return (
    <Link href="/dashboard" className="flex items-center gap-2 text-primary-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring rounded-sm">
      <HypernovaIcon className="h-7 w-7 text-sidebar-primary" />
      {!collapsed && (
        <h1 className="text-xl font-bold font-headline text-sidebar-foreground">
          Hypernova
        </h1>
      )}
    </Link>
  );
}
