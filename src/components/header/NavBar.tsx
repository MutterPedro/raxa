import type { JSX } from 'react';

type NavBarProps = { children: JSX.Element[] };

export default function NavBar({ children }: NavBarProps) {
  return (
    <nav className="mx-auto flex items-center justify-between p-6 lg:px-8" aria-label="Global">
      {...children}
    </nav>
  );
}
