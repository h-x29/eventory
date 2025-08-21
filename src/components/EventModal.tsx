import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Calendar, MapPin, Users, Clock, Heart, MessageCircle, Star, DollarSign, Tag } from 'lucide-react'
import { Event, EventRating } from '../types/Event'
import { useAuth } from '../contexts/AuthContext'
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
  const [showRatingModal, setShowRatingModal] = useState(false)

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

  const isEventFull = event.attendees >= event.maxAttendees
  const isUserInterested = user && event.interestedUsers.includes(user.name)
  const isPastEvent = new Date(event.date) < new Date()
  const canRate = isPastEvent && event.isAttending && user

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

  const averageRating = event.ratings.length > 0 
    ? event.ratings.reduce((sum, rating) => sum + rating.rating, 0) / event.ratings.length 
    : 0

  // Get localized content based on current language
  const getLocalizedContent = () => {
    const isKorean = i18n.language === 'ko'
    return {
      title: isKorean ? event.title : event.titleEn,
      description: isKorean ? event.description : event.descriptionEn,
      location: isKorean ? event.location : event.locationEn,
      organizer: isKorean ? event.organizer : event.organizerEn,
      tags: isKorean ? event.tags : event.tagsEn
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
              src={event.image}
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
                {t(`categories.${event.category}`)}
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
                  <p className="font-medium text-gray-900">{formatDate(event.date)}</p>
                </div>
              </div>

              {/* Time */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">{t('events.details.time')}</p>
                  <p className="font-medium text-gray-900">{formatTime(event.time)}</p>
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

              {/* Attendees */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">{t('events.details.attendees')}</p>
                  <p className="font-medium text-gray-900">
                    {event.attendees}/{event.maxAttendees}
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
                    {event.price === 0 ? t('common.free') : `₩${event.price.toLocaleString()}`}
                  </p>
                </div>
              </div>

              {/* Interested Users */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Heart className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-sm text-gray-600">{t('events.details.interested')}</p>
                  <p className="font-medium text-gray-900">
                    {event.interestedUsers.length} {i18n.language === 'ko' ? '명' : 'people'}
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
            {isPastEvent && event.ratings.length > 0 && (
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
                      {averageRating.toFixed(1)} ({event.ratings.length} {t('reviews.total')})
                    </span>
                  </div>
                </div>

                <div className="space-y-4 max-h-60 overflow-y-auto">
                  {event.ratings.map((rating, index) => (
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

            {/* Action Buttons */}
            <div className="flex gap-3">
              {/* Join Button */}
              {!isPastEvent && (
                <button
                  onClick={() => onToggleAttendance(event.id)}
                  disabled={!user || (isEventFull && !event.isAttending)}
                  className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
                    event.isAttending
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : isEventFull
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {!user 
                    ? t('nav.login')
                    : event.isAttending 
                    ? t('events.actions.joined')
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
                onClick={() => onToggleInterest(event.id)}
                disabled={!user}
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  isUserInterested
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Heart className={`w-5 h-5 ${isUserInterested ? 'fill-current' : ''}`} />
              </button>
              
              {/* Chat Button */}
              {event.isAttending && (
                <button
                  onClick={() => onOpenGroupChat(event)}
                  className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  <MessageCircle className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <RatingModal
          event={event}
          onClose={() => setShowRatingModal(false)}
          onSubmitRating={handleSubmitRating}
        />
      )}
    </>
  )
}

export default EventModal
