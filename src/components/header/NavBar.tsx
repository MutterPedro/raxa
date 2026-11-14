import type { JSX } from 'react';

type NavBarProps = { children: JSX.Element[] };

export default function NavBar({ children }: NavBarProps) {
  return (
    <nav
      className="mx-auto flex items-center justify-between p-6 pt-[calc(var(--spacing)*6+env(safe-area-inset-top,0px))] lg:px-8"
      aria-label="Global"
      data-testid="app-bar"
    >
      {...children}
    </nav>
  );
}
