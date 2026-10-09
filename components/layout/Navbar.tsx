'use client';

import { api } from '@/lib/axios';

import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Settings,
  ChevronDown,
  Bot,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { logout } from '@/lib/auth';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  { label: 'Users', icon: Users, href: '/admin/users' },
  {
    label: 'Admin Tools',
    icon: Settings, // Using Settings icon for now, can be changed
    children: [
      { label: 'Chatlogs', href: '/admin/chatlogs' },
      { label: 'Departments', href: '/admin/departments' },
      { label: 'Doctors', href: '/admin/doctors' },
      { label: 'FAQs', href: '/admin/faqs' },
      { label: 'Knowledge', href: '/admin/knowledge' },
      { label: 'Medical Services', href: '/admin/medical-services' },
      { label: 'Posts', href: '/admin/posts' },
      { label: 'Services', href: '/admin/services' },
      { label: 'Satisfaction Surveys', href: '/admin/surveys' },
    ],
  },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileOpenDropdown, setMobileOpenDropdown] = useState<string | null>(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [user, setUser] = useState<{ userRole?: string; email?: string; name?: string } | null>(null);

  const pathname = usePathname();

  // Dashboard (/admin) must match exactly, since every admin route starts with
  // "/admin"; deeper routes also match their own sub-pages (e.g. /admin/users/123).
  const isActive = (href?: string) =>
    !!href &&
    (href === '/admin'
      ? pathname === '/admin'
      : pathname === href || pathname.startsWith(href + '/'));

  const isChildActive = (children?: { href: string }[]) =>
    !!children?.some((c) => isActive(c.href));

  useEffect(() => {
    api.get('/auth/me')
      .then((res) => {
        if (res.data && res.data.status === 200) {
          setUser(res.data.data); // Assuming ApiResponseHandler structure: { status: 200, data: userObject, ... }
        } else if (res.data) {
           setUser(res.data);
        }
      })
      .catch(console.error);
  }, []);

  // Close the mobile sheet whenever navigation lands on a new route.
  useEffect(() => {
    setMobileOpen(false);
    setMobileOpenDropdown(null);
  }, [pathname]);

  // Lock body scroll while the mobile sheet is open so the drawer feels like a
  // real overlay rather than a scrolling section of the page.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const original = document.body.style.overflow;
    document.body.style.overflow = mobileOpen ? 'hidden' : original;
    return () => {
      document.body.style.overflow = original;
    };
  }, [mobileOpen]);

  const router = useRouter();

  const displayName = user?.userRole || user?.name || 'Admin';
  const displayEmail = user?.email || 'admin@gmail.com';

  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      router.push('/login');
    }
  };

  return (
    <>
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-gradient-to-r from-[#1e1b2e] via-[#252140] to-[#1e1b2e] backdrop-blur-xl">
      <div className="mx-auto flex h-20 items-center justify-between px-4 lg:px-8">
        {/* Left — Logo */}
        <Link href={"/admin"} className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            Chatbot
          </span>
        </Link>

        {/* Middle — Desktop Nav */}
        <ul className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            if (item.children) {
              return (
                <li key={item.label} className="relative group">
                  <button
                    className={`group flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200
                      ${isChildActive(item.children)
                        ? 'bg-white/10 text-white shadow-sm'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                      }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                    <ChevronDown className="h-3 w-3 transition-transform group-hover:rotate-180" />
                  </button>
                  <div className="absolute left-0 top-full z-10 hidden w-48 rounded-md border border-white/10 bg-[#1e1b2e] p-2 shadow-lg group-hover:block">
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition
                          ${isActive(child.href)
                            ? 'bg-white/10 text-white'
                            : 'text-gray-300 hover:bg-white/5 hover:text-white'
                          }`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </li>
              );
            }
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`group flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200
                    ${isActive(item.href)
                      ? 'bg-white/10 text-white shadow-sm'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Right — Notifications + Profile */}
        <div className="flex items-center gap-3">
          {/* Profile */}
          <div className="relative hidden md:flex">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-xs font-bold text-white">
                A
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-white">{user?.userRole || 'Admin'}</span>
                <span className="text-[10px] text-gray-400">{user?.email || 'admin@gmail.com'}</span>
              </div>
              <ChevronDown className={`ml-1 h-3.5 w-3.5 text-gray-400 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 top-12 w-48 rounded-xl border border-white/10 bg-[#1e1b2e] p-2 shadow-2xl">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-500 hover:text-white"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-white/10 hover:text-white lg:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      </nav>

      {/* Mobile Nav — slide-in sheet (backdrop + right drawer).
          Rendered as a sibling of <nav>, NOT inside it: the navbar's
          backdrop-blur creates a containing block that would otherwise trap
          this fixed overlay inside the 80px bar. */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${mobileOpen ? '' : 'pointer-events-none'}`}
        aria-hidden={!mobileOpen}
      >
        {/* Backdrop */}
        <div
          onClick={() => setMobileOpen(false)}
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
            mobileOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Drawer */}
        <div
          role="dialog"
          aria-modal="true"
          className={`absolute inset-y-0 right-0 flex w-72 max-w-[82%] flex-col bg-[#1e1b2e] shadow-2xl transition-transform duration-300 ease-out ${
            mobileOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Sheet header */}
          <div className="flex h-20 shrink-0 items-center justify-between border-b border-white/10 px-4">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                Chatbot
              </span>
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-white/10 hover:text-white"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Sheet nav (scrollable) */}
          <nav className="flex-1 overflow-y-auto px-4 py-4">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                if (item.children) {
                  return (
                    <li key={item.label}>
                      <button
                        onClick={() => setMobileOpenDropdown(mobileOpenDropdown === item.label ? null : item.label)}
                        className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all
                          ${mobileOpenDropdown === item.label || isChildActive(item.children)
                            ? 'bg-white/10 text-white'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </div>
                        <ChevronDown className={`h-4 w-4 transition-transform ${mobileOpenDropdown === item.label ? 'rotate-180' : ''}`} />
                      </button>
                      {mobileOpenDropdown === item.label && (
                        <ul className="ml-6 mt-1 space-y-1 border-l border-white/10 pl-3">
                          {item.children.map((child) => (
                            <li key={child.label}>
                              <Link
                                href={child.href}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition
                                  ${isActive(child.href)
                                    ? 'bg-white/10 text-white'
                                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                  }`}
                              >
                                {child.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                }
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all
                        ${isActive(item.href)
                          ? 'bg-white/10 text-white'
                          : 'text-gray-400 hover:bg-white/5 hover:text-white'
                        }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Sheet footer — profile + logout (mobile only place these live) */}
          <div className="shrink-0 border-t border-white/10 p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-sm font-bold text-white">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">{displayName}</p>
                <p className="truncate text-xs text-gray-400">{displayEmail}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
