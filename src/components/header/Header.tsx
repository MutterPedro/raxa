import LoginButton from '../login/LoginButton';
import NavBar from './NavBar';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  return (
    <header className="bg-brand-700 dark:bg-brand-600 text-brand-200 type-display">
      <NavBar>
        <a href="/" aria-label="raxa" className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width={26} aria-hidden="true">
            <circle cx="8" cy="8" r="4.6" className="fill-brand-300" />
            <circle cx="24" cy="8" r="4.6" className="fill-brand-300" />
            <circle cx="8" cy="24" r="4.6" className="fill-brand-300" />
            <circle cx="24" cy="24" r="4.6" className="fill-brand-300" />
            <circle cx="16" cy="16" r="5.4" className="fill-brand-50" />
          </svg>
          <span className="text-2xl tracking-[-0.05em] text-brand-50">raxa</span>
        </a>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LoginButton />
        </div>
      </NavBar>
    </header>
  );
}
