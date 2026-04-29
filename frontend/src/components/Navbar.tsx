import { Link, NavLink } from "react-router-dom";

export default function Navbar() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? "bg-brand-700 text-white"
        : "text-indigo-100 hover:bg-brand-700 hover:text-white"
    }`;

  return (
    <nav className="bg-brand-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-white font-bold text-lg tracking-tight">
              Profiles Ops
            </span>
            <span className="text-indigo-300 text-xs font-medium">AI Resume Tailor</span>
          </Link>
          <div className="flex items-center gap-1">
            <NavLink to="/profiles" className={linkClass}>
              Profiles
            </NavLink>
            <NavLink to="/applications" className={linkClass}>
              Applications
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}
