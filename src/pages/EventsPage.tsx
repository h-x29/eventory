import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Plus, Map, List } from 'lucide-react'
import { useEvents } from '../contexts/EventContext'
import { useAuth } from '../contexts/AuthContext'
import Navigation from '../components/Navigation'
import EventCard from '../components/EventCard'
import EventModal from '../components/EventModal'
import CreateEventModal from '../components/CreateEventModal'
import GroupChat from '../components/GroupChat'
import KakaoMap from '../components/KakaoMap'
import { Event } from '../types/Event'

const EventsPage: React.FC = () => {
  const { t } = useTranslation()
  const { events, joinEvent, leaveEvent, isEventJoined, addEvent, toggleInterest } = useEvents()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showCreateEvent, setShowCreateEvent] = useState(false)
  const [showGroupChat, setShowGroupChat] = useState(false)
  const [selectedChatEvent, setSelectedChatEvent] = useState<Event | null>(null)

  const categories = [
    { id: 'all', label: t('events.filters.all'), icon: '🎯' },
    { id: 'academic', label: t('events.filters.academic'), icon: '📚' },
    { id: 'cultural', label: t('events.filters.cultural'), icon: '🎭' },
    { id: 'club', label: t('events.filters.club'), icon: '🏛️' },
    { id: 'language', label: t('events.filters.language'), icon: '🗣️' },
    { id: 'sports', label: t('events.filters.sports'), icon: '⚽' },
    { id: 'social', label: t('events.filters.social'), icon: '🎉' }
  ]

  // Filter events based on search and category
  const filteredEvents = events.filter(event => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleCreateEvent = (eventData: any) => {
    addEvent({
      ...eventData,
      coordinates: { lat: 37.5665, lng: 126.9780 }, // Default Seoul coordinates
      organizer: user?.name || 'Anonymous',
      attendees: 0,
      isAttending: false
    })
    setShowCreateEvent(false)
    alert(t('events.create.success', 'Event created successfully! 🎉')) // ✅ leaf key with fallback
  }

  const handleToggleAttendance = (eventId: string) => {
    if (!user) {
      alert(t('auth.loginRequired', 'Please login to join events'))
      return
    }
    if (isEventJoined(eventId)) {
      leaveEvent(eventId)
    } else {
      joinEvent(eventId)
    }
  }

  const handleToggleInterest = (eventId: string) => {
    if (!user) {
      alert(t('auth.loginRequired', 'Please log in to show interest in events'))
      return
    }
    toggleInterest(eventId)
  }

  const handleOpenGroupChat = (event: Event) => {
    setSelectedChatEvent(event)
    setShowGroupChat(true)
  }

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event)
  }

  const createLabel = t('events.create.buttons.create') // ✅ use leaf string, not the parent object

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('events.title')}</h1>
            <p className="text-gray-600 mt-1">
              {filteredEvents.length}{' '}
              {t(filteredEvents.length === 1 ? 'common.event' : 'common.events')}{' '}
              {t('common.found', 'found')}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">{t('events.viewMode.list')}</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'map'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Map className="w-4 h-4" />
                <span className="hidden sm:inline">{t('events.viewMode.map')}</span>
              </button>
            </div>

            {/* Create Event Button */}
            {user && (
              <button
                onClick={() => setShowCreateEvent(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm flex-shrink-0"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">{createLabel}</span>
                <span className="sm:hidden">{createLabel}</span>
              </button>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t('events.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                }`}
              >
                <span>{category.icon}</span>
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {viewMode === 'list' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onEventClick={handleEventClick}
                onToggleAttendance={handleToggleAttendance}
                onToggleInterest={handleToggleInterest}
                isJoined={isEventJoined(event.id)}
                isInterested={user ? event.interestedUsers.includes(user.name) : false}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <KakaoMap
              events={filteredEvents}
              onEventClick={handleEventClick}
              selectedCategory={selectedCategory}
            />
          </div>
        )}

        {/* Empty State */}
        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('common.noResults')}</h3>
            <p className="text-gray-600 mb-6">
              {t('events.noResultsDescription', 'Try adjusting your search or filters to find events.')}
            </p>
            {user && (
              <button
                onClick={() => setShowCreateEvent(true)}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                {createLabel}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onToggleAttendance={handleToggleAttendance}
          onToggleInterest={handleToggleInterest}
          onOpenGroupChat={handleOpenGroupChat}
        />
      )}

      {showCreateEvent && (
        <CreateEventModal
          isOpen={showCreateEvent}
          onClose={() => setShowCreateEvent(false)}
          onCreateEvent={handleCreateEvent}
        />
      )}

      {showGroupChat && selectedChatEvent && (
        <GroupChat
          event={selectedChatEvent}
          onClose={() => setShowGroupChat(false)}
        />
      )}
    </div>
  )
}

export default EventsPage
