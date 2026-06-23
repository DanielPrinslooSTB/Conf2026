import { Link, Outlet, useLocation } from "react-router-dom";
import logo from "../assets/SB Logo.png";

export function Layout() {
  const location = useLocation();

  const navLinks = [
    { to: "/", label: "Disputes" },
    { to: "/disputes/new", label: "New Dispute" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-brand-blue-800 shadow-md">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 text-white font-bold text-lg">
            <img src={logo} alt="SB Logo" className="h-8 w-auto" />
            Payment Dispute Triage
          </Link>
          <nav className="flex gap-6" aria-label="Main navigation">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? "text-white"
                    : "text-blue-200 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
