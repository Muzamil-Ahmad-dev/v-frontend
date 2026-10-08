 import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext.jsx';
import {
  HiOutlineHome,
  HiOutlineBuildingStorefront,
  HiOutlineUsers,
} from 'react-icons/hi2';

const navItems = [
  { to: '/shop-owner/dashboard', label: 'Dashboard', icon: HiOutlineHome },
  { to: '/shop-owner/shop', label: 'My Shop', icon: HiOutlineBuildingStorefront },
  { to: '/shop-owner/customers', label: 'Customers', icon: HiOutlineUsers },
];

export function ShopOwnerLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-white to-slate-100">

      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 text-white flex flex-col shadow-2xl">

        {/* Logo */}
        <div className="px-6 py-6 border-b border-slate-700 flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 bg-white/10 rounded-lg">
            <img
              src="/image.png"
              alt="Logo"
              className="h-8 w-8 object-contain"
            />
          </div>

          <div>
            <h1 className="text-lg font-bold tracking-wide">ShopOwner</h1>
            <p className="text-xs text-slate-400">Shop Panel</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg scale-[1.03]'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white hover:scale-[1.01]'
                }`
              }
            >
              <span className="text-lg"><Icon /></span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User Section */}
        <div className="px-4 py-5 border-t border-slate-700">

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold shadow-md">
              {user?.name?.[0]?.toUpperCase()}
            </div>

            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">
                {user?.name}
              </p>
              <p className="text-xs text-slate-400 capitalize">
                {user?.role}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
          >
            Sign out →
          </button>
        </div>

      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-full p-6 md:p-8">
          <Outlet />
        </div>
      </main>

    </div>
  );
}