import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { clsx } from 'clsx'
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  CalendarDaysIcon,
  PlusCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import Button from '@/components/ui/Button'

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
    setIsMobileMenuOpen(false)
  }

  const navigation = [
    { name: 'Home', href: '/', current: location.pathname === '/' },
    { name: 'Events', href: '/events', current: location.pathname === '/events' },
    ...(isAuthenticated
      ? [
          { name: 'Dashboard', href: '/dashboard', current: location.pathname === '/dashboard' },
          { name: 'Create Event', href: '/create-event', current: location.pathname === '/create-event' }
        ]
      : []
    )
  ]

  const userMenuItems = [
    {
      name: 'Profile',
      href: '/profile',
      icon: UserCircleIcon,
      onClick: () => setIsMobileMenuOpen(false)
    },
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: ChartBarIcon,
      onClick: () => setIsMobileMenuOpen(false)
    },
    ...(user?.role === 'admin'
      ? [
          {
            name: 'Admin Panel',
            href: '/admin',
            icon: Cog6ToothIcon,
            onClick: () => setIsMobileMenuOpen(false)
          }
        ]
      : []
    )
  ]

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700 sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <CalendarDaysIcon className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              EventHub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={clsx(
                  'inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors duration-200',
                  item.current
                    ? 'text-primary-600 border-b-2 border-primary-600 dark:text-primary-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link to="/create-event">
                  <Button size="sm" icon={<PlusCircleIcon className="h-4 w-4" />}>
                    Create Event
                  </Button>
                </Link>

                {/* User Menu */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200">
                    <UserCircleIcon className="h-8 w-8" />
                    <span className="font-medium">
                      {user?.firstName} {user?.lastName}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-1">
                      {userMenuItems.map((item) => {
                        const Icon = item.icon
                        return (
                          <Link
                            key={item.name}
                            to={item.href}
                            onClick={item.onClick}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                          >
                            <Icon className="h-5 w-5 mr-3" />
                            {item.name}
                          </Link>
                        )
                      })}
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-error-600 dark:text-error-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                      >
                        <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={clsx(
                    'block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200',
                    item.current
                      ? 'text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/20'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Mobile User Actions */}
            <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
              {isAuthenticated ? (
                <>
                  <div className="px-4 py-2">
                    <div className="text-base font-medium text-gray-800 dark:text-white">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {user?.email}
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    {userMenuItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={item.onClick}
                          className="flex items-center px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 transition-colors duration-200"
                        >
                          <Icon className="h-5 w-5 mr-3" />
                          {item.name}
                        </Link>
                      )
                    })}
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-base font-medium text-error-600 hover:text-error-800 hover:bg-gray-50 dark:text-error-400 dark:hover:text-error-200 dark:hover:bg-gray-800 transition-colors duration-200"
                    >
                      <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="px-4 space-y-2">
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" fullWidth>
                      Login
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button fullWidth>
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header