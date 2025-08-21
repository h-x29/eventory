import React, { useState, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Calendar, MapPin, Users, Clock, Heart, MessageCircle, Star, DollarSign, Tag } from 'lucide-react'
import { Event, EventRating } from '../types/Event'
import { useAuth } from '../contexts/AuthContext'
import { useEvents } from '../contexts/EventContext'
import RatingModal from './RatingModal'

interface EventModalProps {
  event: Event
  onClose: () => void
  onToggleAttendance: (eventId: string) => void
  onToggleInterest: (eventId: string) => void
  onOpenGroupChat: (event: Event) => void
}

const EventModal: React.FC<EventModalProps> = ({
  event,
  onClose,
  onToggleAttendance,
  onToggleInterest,
  onOpenGroupChat
}) => {
  const { user } = useAuth()
  const { t, i18n } = useTranslation()
  const { isEventJoined, events } = useEvents()
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // FIXED: Get current event data from context to ensure real-time updates
  const currentEvent = events.find(e => e.id === event.id) || event

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    if (i18n.language === 'ko') {
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      })
    }
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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

  // FIXED: Check if user is attending this event using real-time data
  const isUserAttending = isEventJoined(currentEvent.id)
  const isEventFull = currentEvent.attendees >= currentEvent.maxAttendees
  const isUserInterested = user && currentEvent.interestedUsers?.includes(user.name)
  const isPastEvent = new Date(currentEvent.date) < new Date()
  const canRate = isPastEvent && isUserAttending && user

  // FIXED: Handle attendance toggle with proper state management
  const handleToggleAttendance = useCallback(async (e: React.MouseEvent) => {
    console.log(`handleToggleAttendance called for event: ${currentEvent.id}. isUserAttending: ${isUserAttending}`);
    e.preventDefault()
    e.stopPropagation()
    
    if (isProcessing || !user) return
    
    setIsProcessing(true)
    
    try {
      console.log('Toggling attendance for event:', currentEvent.id, 'Current status:', isUserAttending)
      
      console.log('Before onToggleAttendance call');
      onToggleAttendance(currentEvent.id)
      
      // Show feedback to user
      const message = isUserAttending 
        ? t('events.feedback.leftEvent') || 'You have left the event'
        : t('events.feedback.joinedEvent') || 'You have joined the event!'
      
      // Small delay to show the processing state
      console.log('After onToggleAttendance call, waiting for delay');
      await new Promise(resolve => setTimeout(resolve, 300))
      
      console.log(message)
      
    } catch (error) {
      console.error('Error toggling attendance:', error)
    } finally {
      setIsProcessing(false)
    }
  }, [currentEvent.id, onToggleAttendance, user, isProcessing, isUserAttending, t])

  const handleToggleInterest = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isProcessing || !user) return
    
    setIsProcessing(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 100)) // Prevent rapid clicks
      onToggleInterest(currentEvent.id)
    } catch (error) {
      console.error('Error toggling interest:', error)
    } finally {
      setIsProcessing(false)
    }
  }, [currentEvent.id, onToggleInterest, user, isProcessing])

  const handleOpenGroupChat = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onOpenGroupChat(currentEvent)
  }, [currentEvent, onOpenGroupChat])

  const handleSubmitRating = (rating: number, comment: string) => {
    if (!user) return
    
    const newRating: EventRating = {
      userId: user.name,
      rating,
      comment,
      date: new Date().toISOString().split('T')[0]
    }
    
    console.log('New rating:', newRating)
    setShowRatingModal(false)
  }

  const averageRating = currentEvent.ratings.length > 0 
    ? currentEvent.ratings.reduce((sum, rating) => sum + rating.rating, 0) / currentEvent.ratings.length 
    : 0

  // FIXED: Get localized content based on current language
  const getLocalizedContent = () => {
    const isKorean = i18n.language === 'ko'
    return {
      title: isKorean ? (currentEvent.title || currentEvent.titleEn) : (currentEvent.titleEn || currentEvent.title),
      description: isKorean ? (currentEvent.description || currentEvent.descriptionEn) : (currentEvent.descriptionEn || currentEvent.description),
      location: isKorean ? (currentEvent.location || currentEvent.locationEn) : (currentEvent.locationEn || currentEvent.location),
      organizer: isKorean ? (currentEvent.organizer || currentEvent.organizerEn) : (currentEvent.organizerEn || currentEvent.organizer),
      tags: isKorean ? (currentEvent.tags || currentEvent.tagsEn) : (currentEvent.tagsEn || currentEvent.tags)
    }
  }

  const localizedContent = getLocalizedContent()

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header with Event Image */}
          <div className="relative">
            <img
              src={currentEvent.image}
              alt={localizedContent.title}
              className="w-full h-64 object-cover rounded-t-2xl"
            />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 transition-all shadow-lg"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
            <div className="absolute bottom-4 left-4">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                {t(`categories.${currentEvent.category}`)}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Event Name */}
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{localizedContent.title}</h1>
            
            {/* Event Description */}
            <p className="text-gray-700 text-base mb-6 leading-relaxed">{localizedContent.description}</p>

            {/* Event Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Date */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">{t('events.details.date')}</p>
                  <p className="font-medium text-gray-900">{formatDate(currentEvent.date)}</p>
                </div>
              </div>

              {/* Time */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">{t('events.details.time')}</p>
                  <p className="font-medium text-gray-900">{formatTime(currentEvent.time)}</p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <MapPin className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">{t('events.details.location')}</p>
                  <p className="font-medium text-gray-900">{localizedContent.location}</p>
                </div>
              </div>

              {/* FIXED: Attendees with real-time count */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">{t('events.details.attendees')}</p>
                  <p className="font-medium text-gray-900">
                    {currentEvent.attendees}/{currentEvent.maxAttendees}
                    {isEventFull && (
                      <span className="ml-2 text-red-600 text-sm">({t('events.actions.full')})</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Fee */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">{t('events.details.fee')}</p>
                  <p className="font-medium text-gray-900">
                    {currentEvent.price === 0 ? t('common.free') : `₩${currentEvent.price.toLocaleString()}`}
                  </p>
                </div>
              </div>

              {/* Interested Users */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Heart className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-sm text-gray-600">{t('events.details.interested')}</p>
                  <p className="font-medium text-gray-900">
                    {currentEvent.interestedUsers.length} {i18n.language === 'ko' ? '명' : 'people'}
                  </p>
                </div>
              </div>
            </div>

            {/* Organizer */}
            <div className="mb-6 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-blue-800">{t('events.details.organizer')}</span>
              </div>
              <p className="text-blue-900 font-medium">{localizedContent.organizer}</p>
            </div>

            {/* Tags */}
            {localizedContent.tags && localizedContent.tags.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {t('events.details.tags')}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {localizedContent.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Past Event Reviews and Ratings */}
            {isPastEvent && currentEvent.ratings.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {t('reviews.title')}
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= averageRating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {averageRating.toFixed(1)} ({currentEvent.ratings.length} {t('reviews.total')})
                    </span>
                  </div>
                </div>

                <div className="space-y-4 max-h-60 overflow-y-auto">
                  {currentEvent.ratings.map((rating, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{rating.userId}</span>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3 h-3 ${
                                  star <= rating.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">{rating.date}</span>
                        </div>
                      </div>
                      {rating.comment && (
                        <p className="text-gray-700 text-sm">{rating.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FIXED: Action Buttons with proper state management */}
            <div className="flex gap-3">
              {/* Join/Leave Button */}
              {!isPastEvent && (
                <button
                  onClick={handleToggleAttendance}
                  disabled={!user || (isEventFull && !isUserAttending) || isProcessing}
                  className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isUserAttending
                      ? 'bg-red-600 text-white hover:bg-red-700 shadow-sm'
                      : isEventFull
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                  }`}
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      {t('common.processing')}
                    </span>
                  ) : !user 
                    ? t('nav.login')
                    : isUserAttending 
                    ? t('events.actions.leave') || 'Leave Event'
                    : isEventFull 
                    ? t('events.actions.full')
                    : t('events.actions.join')
                  }
                </button>
              )}

              {/* Rate Button for Past Events */}
              {canRate && (
                <button
                  onClick={() => setShowRatingModal(true)}
                  className="flex-1 py-3 px-6 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
                >
                  {t('reviews.rateEvent')}
                </button>
              )}
              
              {/* Like Button */}
              <button
                onClick={handleToggleInterest}
                disabled={!user || isProcessing}
                className={`px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isUserInterested
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Heart className={`w-5 h-5 ${isUserInterested ? 'fill-current' : ''}`} />
              </button>
              
              {/* Chat Button - Only for attending users */}
              {isUserAttending && (
                <button
                  onClick={handleOpenGroupChat}
                  className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  <MessageCircle className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* FIXED: User Status Indicator */}
            {user && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{t('events.details.yourStatus')}:</span>
                  <div className="flex items-center gap-4">
                    {isUserAttending && (
                      <span className="flex items-center gap-1 text-green-700 font-medium">
                        ✅ {t('events.status.attending')}
                      </span>
                    )}
                    {isUserInterested && (
                      <span className="flex items-center gap-1 text-red-700 font-medium">
                        ❤️ {t('events.status.interested')}
                      </span>
                    )}
                    {!isUserAttending && !isUserInterested && (
                      <span className="text-gray-500">
                        {t('events.status.notParticipating')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <RatingModal
          event={currentEvent}
          onClose={() => setShowRatingModal(false)}
          onSubmitRating={handleSubmitRating}
        />
      )}
    </>
  )
}

export default EventModal
