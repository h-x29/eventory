import React, { useCallback, useState } from 'react'
import { Calendar, MapPin, Users, Clock, Heart } from 'lucide-react'
import { Event } from '../types/Event'
import { useAuth } from '../contexts/AuthContext'
import { useTranslation } from 'react-i18next'

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
  const { user } = useAuth()
  const { t, i18n } = useTranslation()
  const [isProcessing, setIsProcessing] = useState(false)

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

  // FIXED: Get localized content based on current language
  const getLocalizedContent = () => {
    const isKorean = i18n.language === 'ko'
    return {
      title: isKorean ? (event.title || event.titleEn) : (event.titleEn || event.title),
      description: isKorean ? (event.description || event.descriptionEn) : (event.descriptionEn || event.description),
      location: isKorean ? (event.location || event.locationEn) : (event.locationEn || event.location)
    }
  }

  const localizedContent = getLocalizedContent()

  const isEventFull = event.attendees >= event.maxAttendees
  const isPastEvent = new Date(event.date) < new Date()

  const handleEventClick = useCallback(() => {
    onEventClick(event)
  }, [event, onEventClick])

  const handleToggleAttendance = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isProcessing || !user) return
    
    setIsProcessing(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 100)) // Prevent rapid clicks
      onToggleAttendance(event.id)
    } catch (error) {
      console.error('Error toggling attendance:', error)
    } finally {
      setIsProcessing(false)
    }
  }, [event.id, onToggleAttendance, user, isProcessing])

  const handleToggleInterest = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isProcessing || !user) return
    
    setIsProcessing(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 100)) // Prevent rapid clicks
      onToggleInterest(event.id)
    } catch (error) {
      console.error('Error toggling interest:', error)
    } finally {
      setIsProcessing(false)
    }
  }, [event.id, onToggleInterest, user, isProcessing])

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group cursor-pointer">
      <div onClick={handleEventClick}>
        {/* Image */}
        <div className="relative overflow-hidden">
          <img
            src={event.image}
            alt={localizedContent.title}
            className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-200"
          />
          <div className="absolute top-2 left-2">
            <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
              {t(`categories.${event.category}`)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {localizedContent.title}
          </h3>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {localizedContent.description}
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
              <span className="truncate">{localizedContent.location}</span>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Users className="w-3 h-3 text-blue-600" />
              <span>
                {event.attendees}/{event.maxAttendees} {t('events.details.attendees')}
              </span>
            </div>
          </div>

          {/* Interest Count */}
          <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
            <Heart className="w-3 h-3 text-red-400" />
            <span>
              {event.interestedUsers.length} {t('events.details.interested')}
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
            onClick={handleToggleAttendance}
            disabled={!user || (isEventFull && !isJoined) || isProcessing}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isJoined
                ? 'bg-red-600 text-white hover:bg-red-700'
                : isEventFull
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center">
                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                {t('common.processing')}
              </span>
            ) : !user 
              ? t('nav.login')
              : isJoined 
              ? t('events.actions.leave')
              : isEventFull 
              ? t('events.actions.full')
              : t('events.actions.join')
            }
          </button>
        )}
        
        <button
          onClick={handleToggleInterest}
          disabled={!user || isProcessing}
          className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            isInterested
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Heart className={`w-3 h-3 ${isInterested ? 'fill-current' : ''}`} />
        </button>
      </div>
    </div>
  )
}

export default EventCard
