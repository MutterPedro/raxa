import Login from './Login';
import Logo from './Logo';
import MobileMenu from './MobileMenu';
import NavBar from './NavBar';

export default function Header() {
  return (
    <header className="bg-primary text-secondary-color arvo-bold">
      <NavBar>
        <Logo />
        <div className="hidden lg:flex lg:gap-x-12">
          <a href="/" className="text-4xl leading-6">
            RAXA
          </a>
        </div>
        <Login />
      </NavBar>
      <MobileMenu />
    </header>
  );
}
