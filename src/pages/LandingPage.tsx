import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Calendar, Users, MapPin } from 'lucide-react'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { mockEvents } from '../data/mockEvents'

const LandingPage: React.FC = () => {
  const { t, i18n } = useTranslation()

  // Helper to pull KR/EN from event data with safe fallbacks
  const evText = (e: any, key: 'title' | 'description' | 'location') => {
    const lang = i18n.language || 'en'
    const isEn = lang.startsWith('en')
    const primary = isEn ? e[`${key}En`] : e[key]
    const fallback = isEn ? e[key] : e[`${key}En`]
    return primary || fallback || ''
  }

  const featuredEvents = mockEvents.slice(0, 6)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Seoul Student Events</span>
            </div>

            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium">
                {t('nav.login')}
              </Link>
              <Link
                to="/signup"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {t('nav.signup')}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">{t('landing.title')}</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">{t('landing.subtitle')}</p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-colors font-semibold text-lg"
          >
            <Users className="w-6 h-6" />
            {t('landing.cta')}
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {t('landing.features.discover.title')}
              </h3>
              <p className="text-gray-600">{t('landing.features.discover.description')}</p>
            </div>

            <div className="text-center p-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {t('landing.features.connect.title')}
              </h3>
              <p className="text-gray-600">{t('landing.features.connect.description')}</p>
            </div>

            <div className="text-center p-8">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {t('landing.features.organize.title')}
              </h3>
              <p className="text-gray-600">{t('landing.features.organize.description')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('landing.featured.title')}</h2>
            <p className="text-gray-600">{t('landing.featured.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredEvents.map((event: any) => {
              const title = evText(event, 'title')
              const description = evText(event, 'description')
              const location = evText(event, 'location')
              return (
                <div
                  key={event.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <img src={event.image} alt={title} className="w-full h-48 object-cover" />
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          event.category === 'academic'
                            ? 'bg-blue-100 text-blue-800'
                            : event.category === 'cultural'
                            ? 'bg-purple-100 text-purple-800'
                            : event.category === 'club'
                            ? 'bg-green-100 text-green-800'
                            : event.category === 'language'
                            ? 'bg-orange-100 text-orange-800'
                            : event.category === 'sports'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-pink-100 text-pink-800'
                        }`}
                      >
                        {t(`categories.${event.category}`)}
                      </span>
                      <span className="text-sm text-gray-500">{event.date}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="w-4 h-4" />
                        {location}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Users className="w-4 h-4" />
                        {event.attendees}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {t('landing.featured.viewAll')}
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-white mb-2">500+</div>
              <div className="text-blue-100">{t('landing.stats.students')}</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">150+</div>
              <div className="text-blue-100">{t('landing.stats.events')}</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">8</div>
              <div className="text-blue-100">{t('landing.stats.universities')}</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">95%</div>
              <div className="text-blue-100">{t('landing.stats.satisfaction')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-blue-400" />
              <span className="ml-2 text-xl font-bold">Seoul Student Events</span>
            </div>
            <div className="text-gray-400">{t('landing.footer.copyright')}</div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
