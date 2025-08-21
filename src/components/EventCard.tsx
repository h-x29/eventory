import React from 'react'
import { Calendar, MapPin, Users, Clock, Heart } from 'lucide-react'
import { Event } from '../types/Event'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'

interface EventCardProps {
  event: Event
  onEventClick: (event: Event) => void
  onToggleAttendance: (eventId: string) => void
  onToggleInterest: (eventId: string) => void
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  onEventClick,
  onToggleAttendance,
  onToggleInterest
}) => {
  const { user } = useAuth()
  const { t, language } = useLanguage()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    if (language === 'ko') {
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

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':')
    const date = new Date()
    date.setHours(parseInt(hours), parseInt(minutes))
    
    if (language === 'ko') {
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

  const getCategoryLabel = (category: string) => {
    const categoryMap: { [key: string]: { en: string, ko: string } } = {
      academic: { en: 'Academic', ko: '학술' },
      cultural: { en: 'Cultural', ko: '문화' },
      club: { en: 'Club Event', ko: '동아리 행사' },
      language: { en: 'Language Exchange', ko: '언어 교환' },
      sports: { en: 'Sports', ko: '스포츠' },
      social: { en: 'Social', ko: '사교 모임' }
    }
    return categoryMap[category]?.[language] || category
  }

  const isEventFull = event.attendees >= event.maxAttendees
  const isUserInterested = user && event.interestedUsers.includes(user.name)
  const isPastEvent = new Date(event.date) < new Date()

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group cursor-pointer">
      <div onClick={() => onEventClick(event)}>
        {/* Image */}
        <div className="relative overflow-hidden">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-200"
          />
          <div className="absolute top-2 left-2">
            <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
              {getCategoryLabel(event.category)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {event.title}
          </h3>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {event.description}
          </p>

          {/* Event Details */}
          <div className="space-y-1 mb-3">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Calendar className="w-3 h-3 text-blue-600" />
              <span>{formatDate(event.date)}</span>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Clock className="w-3 h-3 text-blue-600" />
              <span>{formatTime(event.time)}</span>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <MapPin className="w-3 h-3 text-blue-600" />
              <span className="truncate">{event.location}</span>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Users className="w-3 h-3 text-blue-600" />
              <span>
                {event.attendees}/{event.maxAttendees} {t('events.attendees')}
              </span>
            </div>
          </div>

          {/* Interest Count */}
          <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
            <Heart className="w-3 h-3 text-red-400" />
            <span>
              {event.interestedUsers.length} {t('events.interested')}
            </span>
          </div>

          {/* Price */}
          {event.price !== undefined && (
            <div className="mb-3">
              <span className="text-sm font-bold text-green-600">
                {event.price === 0 ? t('common.free') : `₩${event.price.toLocaleString()}`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 pb-4 flex gap-2">
        {!isPastEvent && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleAttendance(event.id)
            }}
            disabled={!user || (isEventFull && !event.isAttending)}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
              event.isAttending
                ? 'bg-green-600 text-white hover:bg-green-700'
                : isEventFull
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {!user 
              ? t('auth.login.title')
              : event.isAttending 
              ? t('common.joined')
              : isEventFull 
              ? t('common.full')
              : t('common.join')
            }
          </button>
        )}
        
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleInterest(event.id)
          }}
          disabled={!user}
          className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
            isUserInterested
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Heart className={`w-3 h-3 ${isUserInterested ? 'fill-current' : ''}`} />
        </button>
      </div>
    </div>
  )
}

export default EventCard
