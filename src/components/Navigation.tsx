import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Calendar, Newspaper, LayoutDashboard, LogIn, UserPlus, LogOut, Menu, X, Globe } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import LanguageSwitcher from './LanguageSwitcher'

const Navigation: React.FC = () => {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    setIsMobileMenuOpen(false)
    // FIXED: Redirect to public landing page instead of home
    navigate('/')
  }

  const navItems = [
    { path: '/events', label: t('nav.events'), icon: Calendar },
    { path: '/newsletter', label: t('nav.newsletter'), icon: Newspaper },
    ...(user ? [{ path: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard }] : [])
  ]

  const authItems = user ? [
    { action: handleLogout, label: t('nav.logout'), icon: LogOut }
  ] : [
    { path: '/login', label: t('nav.login'), icon: LogIn },
    { path: '/signup', label: t('nav.signup'), icon: UserPlus }
  ]

  const isActivePath = (path: string) => location.pathname === path

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Eventory (이벤터리)</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActivePath(item.path)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Desktop Auth & Language */}
          <div className="hidden md:flex items-center space-x-4">
            <LanguageSwitcher />
            
            {user && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm text-gray-700">{user.name}</span>
              </div>
            )}

            {authItems.map((item, index) => {
              const Icon = item.icon
              if ('action' in item) {
                return (
                  <button
                    key={index}
                    onClick={item.action}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                )
              } else {
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActivePath(item.path)
                        ? 'text-blue-600 bg-blue-50'
                        : item.path === '/signup'
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'text-gray-700 hover:text-blue-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              }
            })}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActivePath(item.path)
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}

              {/* Mobile Language Switcher */}
              <div className="px-3 py-2">
                <LanguageSwitcher />
              </div>

              {/* Mobile User Info */}
              {user && (
                <div className="flex items-center space-x-3 px-3 py-2 border-t border-gray-200 mt-4 pt-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-base font-medium text-blue-600">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-base text-gray-700">{user.name}</span>
                </div>
              )}

              {/* Mobile Auth */}
              {authItems.map((item, index) => {
                const Icon = item.icon
                if ('action' in item) {
                  return (
                    <button
                      key={index}
                      onClick={item.action}
                      className="flex items-center space-x-3 px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 w-full text-left"
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </button>
                  )
                } else {
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                        isActivePath(item.path)
                          ? 'text-blue-600 bg-blue-50'
                          : item.path === '/signup'
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  )
                }
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navigation
