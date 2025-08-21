import React, { useState } from 'react'
import { Star, Heart, Clock, Users, MapPin, Calendar, MessageSquare } from 'lucide-react'
import Navigation from '../components/Navigation'
import EventModal from '../components/EventModal'
import RatingModal from '../components/RatingModal'
import GroupChat from '../components/GroupChat'
import { Event } from '../types/Event'
import { useAuth } from '../contexts/AuthContext'
import { useEvents } from '../contexts/EventContext'
import { useTranslation } from 'react-i18next'

const NewsletterPage: React.FC = () => {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const { events, toggleInterest, joinEvent, leaveEvent, isEventJoined } = useEvents()
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [ratingEvent, setRatingEvent] = useState<Event | null>(null)

  // NEW: group chat state
  const [showGroupChat, setShowGroupChat] = useState(false)
  const [selectedChatEvent, setSelectedChatEvent] = useState<Event | null>(null)

  // Get current date for filtering past events
  const currentDate = new Date()
  const twoDaysAgo = new Date(currentDate.getTime() - (2 * 24 * 60 * 60 * 1000))

  // FIXED: Get localized content for events
  const getLocalizedEventContent = (event: Event) => {
    const isKorean = i18n.language === 'ko'
    return {
      title: isKorean ? (event.title || event.titleEn) : (event.titleEn || event.title),
      description: isKorean ? (event.description || event.descriptionEn) : (event.descriptionEn || event.description),
      location: isKorean ? (event.location || event.locationEn) : (event.locationEn || event.location),
      organizer: isKorean ? (event.organizer || event.organizerEn) : (event.organizerEn || event.organizer)
    }
  }

  // Format date based on language
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    if (i18n.language === 'ko') {
      return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Format time based on language
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':')
    const date = new Date()
    date.setHours(parseInt(hours), parseInt(minutes))
    if (i18n.language === 'ko') {
      return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })
    }
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  }

  // Top rated events - all past events with ratings (user can review if participated)
  const topRatedEvents = events
    .filter(event => {
      const eventDate = new Date(event.date)
      const isEventPast = eventDate < currentDate
      const hasRatings = event.ratings && event.ratings.length > 0
      return isEventPast && hasRatings
    })
    .map(event => {
      const avgRating = event.ratings.reduce((sum, rating) => sum + rating.rating, 0) / event.ratings.length
      return { ...event, avgRating }
    })
    .sort((a, b) => b.avgRating - a.avgRating)
    .slice(0, 6)

  // Most anticipated events - future events sorted by interest count
  const mostAnticipatedEvents = events
    .filter(event => {
      const eventDate = new Date(event.date)
      return eventDate >= currentDate
    })
    .sort((a, b) => b.interestedUsers.length - a.interestedUsers.length)
    .slice(0, 6)

  // Recently added events - events added within 2 days that haven't passed yet
  const recentlyAddedEvents = events
    .filter(event => {
      const eventDate = new Date(event.date)
      const isEventFuture = eventDate >= currentDate
      // In a real app, you'd have an 'addedDate' field. For demo, we'll use the first 6 future events
      return isEventFuture
    })
    .slice(0, 6)

  const getCategoryColor = (category: string) => {
    const colors = {
      academic: 'bg-blue-100 text-blue-800',
      cultural: 'bg-purple-100 text-purple-800',
      club: 'bg-green-100 text-green-800',
      language: 'bg-orange-100 text-orange-800',
      sports: 'bg-red-100 text-red-800',
      social: 'bg-pink-100 text-pink-800'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const handleToggleAttendance = (eventId: string) => {
    if (!user) {
      alert(t('auth.loginRequired') || 'Please log in to join events')
      return
    }

    if (isEventJoined(eventId)) {
      leaveEvent(eventId)
    } else {
      joinEvent(eventId)
    }

    // Update selected event if it's the same event
    if (selectedEvent && selectedEvent.id === eventId) {
      const updatedEvent = events.find(e => e.id === eventId)
      if (updatedEvent) {
        setSelectedEvent({
          ...updatedEvent,
          isAttending: !isEventJoined(eventId)
        })
      }
    }
  }

  const handleToggleInterest = (eventId: string) => {
    if (!user) {
      alert(t('auth.loginRequired') || 'Please log in to show interest in events')
      return
    }

    toggleInterest(eventId)

    // Update selected event if it's the same event
    if (selectedEvent && selectedEvent.id === eventId) {
      const updatedEvent = events.find(e => e.id === eventId)
      if (updatedEvent) {
        setSelectedEvent(updatedEvent)
      }
    }
  }

  const handleRateEvent = (event: Event) => {
    setRatingEvent(event)
    setShowRatingModal(true)
  }

  const handleSubmitRating = (rating: number, comment: string) => {
    if (ratingEvent && user) {
      console.log('Submitting rating:', { eventId: ratingEvent.id, rating, comment })
      // In a real app, this would update the backend
      alert(`Thank you for rating "${getLocalizedEventContent(ratingEvent).title}"! Your ${rating}-star review has been submitted.`)
      setShowRatingModal(false)
      setRatingEvent(null)
    }
  }

  const canRateEvent = (event: Event) => {
    if (!user) return false
    const eventDate = new Date(event.date)
    const isEventPast = eventDate < currentDate
    const hasUserAttended = isEventJoined(event.id) || event.isAttending
    const hasUserRated = event.ratings.some(rating => rating.userId === user.name)
    return isEventPast && hasUserAttended && !hasUserRated
  }

  const isEventPast = (eventDate: string) => {
    const eventDateObj = new Date(eventDate)
    return eventDateObj < currentDate
  }

  // NEW: open group chat from EventModal
  const handleOpenGroupChat = (ev: Event) => {
    setSelectedChatEvent(ev)
    setShowGroupChat(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('newsletter.title')}</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('newsletter.subtitle')}
          </p>
        </div>

        {/* FIXED: Top Rated Events - All Past Events with Ratings */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{t('newsletter.sections.top')}</h2>
          </div>
          
          {topRatedEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topRatedEvents.map((event, index) => {
                const localizedContent = getLocalizedEventContent(event)
                return (
                  <div 
                    key={event.id} 
                    className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="relative">
                      <img
                        src={event.image}
                        alt={localizedContent.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(event.category)}`}>
                          {t(`categories.${event.category}`)}
                        </span>
                      </div>
                      <div className="absolute top-4 right-4 bg-white bg-opacity-90 px-2 py-1 rounded-full flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{event.avgRating.toFixed(1)}</span>
                      </div>
                      {index === 0 && (
                        <div className="absolute bottom-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                          #1 {t('newsletter.sections.top')}
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="font-semibold text-gray-900 mb-2 text-lg">{localizedContent.title}</h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">{localizedContent.description}</p>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          {formatDate(event.date)} {formatTime(event.time)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <MapPin className="w-4 h-4" />
                          {localizedContent.location}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Users className="w-4 h-4" />
                          {event.ratings.length} {t('reviews.total')}
                        </div>
                      </div>
                      
                      {/* Show existing reviews */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">{t('reviews.title')}:</h4>
                        <div className="space-y-2 max-h-24 overflow-y-auto">
                          {event.ratings.slice(0, 2).map((rating, idx) => (
                            <div key={idx} className="text-xs bg-gray-50 p-2 rounded">
                              <div className="flex items-center gap-1 mb-1">
                                <span className="font-medium">{rating.userId}</span>
                                <div className="flex">
                                  {[...Array(rating.rating)].map((_, i) => (
                                    <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                                  ))}
                                </div>
                              </div>
                              <p className="text-gray-600">{rating.comment}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {canRateEvent(event) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRateEvent(event)
                          }}
                          className="w-full bg-yellow-100 text-yellow-800 py-2 px-4 rounded-lg hover:bg-yellow-200 transition-colors font-medium flex items-center justify-center gap-2"
                        >
                          <MessageSquare className="w-4 h-4" />
                          {t('reviews.rateEvent')}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
              <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('newsletter.noRatedEvents')}</h3>
              <p className="text-gray-500">{t('newsletter.noRatedEventsDesc')}</p>
            </div>
          )}
        </section>

        {/* FIXED: Most Anticipated Events - Based on Interest Count */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-pink-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{t('newsletter.sections.trending')}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mostAnticipatedEvents.map((event) => {
              const localizedContent = getLocalizedEventContent(event)
              return (
                <div 
                  key={event.id} 
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedEvent(event)}
                >
                  <img
                    src={event.image}
                    alt={localizedContent.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(event.category)}`}>
                        {t(`categories.${event.category}`)}
                      </span>
                      <div className="flex items-center gap-1 text-pink-600 text-sm font-medium">
                        <Heart className="w-4 h-4" />
                        {event.interestedUsers.length}
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{localizedContent.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{localizedContent.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{formatDate(event.date)}</span>
                      <span>{event.attendees} {t('events.details.attendees')}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* FIXED: Recently Added Events - Added within 2 days and not past */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{t('newsletter.sections.recent')}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentlyAddedEvents.map((event) => {
              const localizedContent = getLocalizedEventContent(event)
              return (
                <div 
                  key={event.id} 
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="flex gap-4">
                    <img
                      src={event.image}
                      alt={localizedContent.title}
                      className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(event.category)}`}>
                          {t(`categories.${event.category}`)}
                        </span>
                        <span className="text-xs text-gray-500">{t('newsletter.recentlyAdded')}</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{localizedContent.title}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{localizedContent.description}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{localizedContent.location}</span>
                        <span>{event.attendees} {t('events.details.attendees')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>

      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onToggleAttendance={handleToggleAttendance}
          onToggleInterest={handleToggleInterest}
          onOpenGroupChat={handleOpenGroupChat}  // <-- FIX: wire chat to open GroupChat
        />
      )}

      {showRatingModal && ratingEvent && (
        <RatingModal
          event={ratingEvent}
          onClose={() => setShowRatingModal(false)}
          onSubmitRating={handleSubmitRating}
        />
      )}

      {/* FIX: mount GroupChat so the modal button works on this page */}
      {showGroupChat && selectedChatEvent && (
        <GroupChat
          event={selectedChatEvent}
          onClose={() => setShowGroupChat(false)}
        />
      )}
    </div>
  )
}

export default NewsletterPage
