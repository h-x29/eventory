import React from 'react'
import { useTranslation } from 'react-i18next'
import { Calendar, Clock, MapPin, Users, Heart, MessageCircle } from 'lucide-react'
import { Event } from '../types/Event'
import { useAuth } from '../contexts/AuthContext'

interface EventCardProps {
  event: Event
  onEventClick: (event: Event) => void
  onToggleAttendance: (eventId: string) => void
  onToggleInterest: (eventId: string) => void
  isJoined: boolean
  isInterested: boolean
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  onEventClick,
  onToggleAttendance,
  onToggleInterest,
  isJoined,
  isInterested
}) => {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()

  // Get localized content for event
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
      return date.toLocaleDateString('ko-KR', {
        month: 'long',
        day: 'numeric'
      })
    }
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  // Format time based on language
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':')
    const date = new Date()
    date.setHours(parseInt(hours), parseInt(minutes))
    
    if (i18n.language === 'ko') {
      return date.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    }
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const localizedContent = getLocalizedEventContent(event)
  const isEventFull = event.attendees >= event.maxAttendees

  // FIXED: Prevent multiple rapid clicks
  const handleToggleAttendance = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user) {
      alert(t('auth.loginRequired'))
      return
    }
    onToggleAttendance(event.id)
  }

  const handleToggleInterest = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user) {
      alert(t('auth.loginRequired'))
      return
    }
    onToggleInterest(event.id)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
      {/* Event Image */}
      <div className="relative h-48 overflow-hidden" onClick={() => onEventClick(event)}>
        <img
          src={event.image}
          alt={localizedContent.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
            event.category === 'academic' ? 'bg-blue-600' :
            event.category === 'cultural' ? 'bg-purple-600' :
            event.category === 'club' ? 'bg-green-600' :
            event.category === 'language' ? 'bg-orange-600' :
            event.category === 'sports' ? 'bg-red-600' :
            'bg-pink-600'
          }`}>
            {t(`categories.${event.category}`)}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <button
            onClick={handleToggleInterest}
            className={`p-2 rounded-full transition-colors ${
              isInterested
                ? 'bg-red-500 text-white'
                : 'bg-white/80 text-gray-600 hover:bg-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${isInterested ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Event Content */}
      <div className="p-6" onClick={() => onEventClick(event)}>
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {localizedContent.title}
          </h3>
          <div className="flex items-center gap-1 text-sm text-gray-500 ml-2">
            <Heart className="w-4 h-4" />
            <span>{event.interestedUsers.length}</span>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {localizedContent.description}
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{formatTime(event.time)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{localizedContent.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>{event.attendees}/{event.maxAttendees} {t('events.details.attendees')}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold text-gray-900">
            {event.price === 0 ? t('common.free') : `₩${event.price.toLocaleString()}`}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleAttendance}
              disabled={!isJoined && isEventFull}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isJoined
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : isEventFull
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isJoined
                ? t('events.actions.joined')
                : isEventFull
                ? t('events.actions.full')
                : t('events.actions.join')
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventCard
