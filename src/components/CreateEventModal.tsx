import React, { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Calendar, Clock, MapPin, Users, DollarSign, Tag } from 'lucide-react'

interface CreateEventModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateEvent: (eventData: any) => void
}

const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onCreateEvent
}) => {
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    date: '',
    time: '',
    location: '',
    maxAttendees: '',
    price: '',
    tags: ''
  })

  const categories = [
    { id: 'academic', label: t('categories.academic') },
    { id: 'cultural', label: t('categories.cultural') },
    { id: 'club', label: t('categories.club') },
    { id: 'language', label: t('categories.language') },
    { id: 'sports', label: t('categories.sports') },
    { id: 'social', label: t('categories.social') }
  ]

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isSubmitting) return
    
    setIsSubmitting(true)
    
    try {
      // Add small delay to prevent rapid submissions
      await new Promise(resolve => setTimeout(resolve, 200))
      
      const eventData = {
        id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: formData.title.trim(),
        titleEn: formData.title.trim(),
        description: formData.description.trim(),
        descriptionEn: formData.description.trim(),
        category: formData.category,
        date: formData.date,
        time: formData.time,
        location: formData.location.trim(),
        locationEn: formData.location.trim(),
        organizer: 'Current User',
        organizerEn: 'Current User',
        maxAttendees: parseInt(formData.maxAttendees),
        price: parseFloat(formData.price) || 0,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        tagsEn: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        image: `https://images.pexels.com/photos/${Math.floor(Math.random() * 1000000) + 1000}/pexels-photo-${Math.floor(Math.random() * 1000000) + 1000}.jpeg?auto=compress&cs=tinysrgb&w=400`,
        attendees: 0,
        interestedUsers: [],
        ratings: [],
        isAttending: false
      }

      onCreateEvent(eventData)
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        date: '',
        time: '',
        location: '',
        maxAttendees: '',
        price: '',
        tags: ''
      })
      
      onClose()
    } catch (error) {
      console.error('Error creating event:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, onCreateEvent, onClose, isSubmitting])

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      onClose()
    }
  }, [onClose, isSubmitting])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">{t('events.create.title')}</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              {t('events.create.fields.title')}
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder={t('events.create.placeholders.title')}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              {t('events.create.fields.description')}
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={isSubmitting}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder={t('events.create.placeholders.description')}
              required
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              {t('events.create.fields.category')}
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              required
            >
              <option value="">{t('events.create.selectCategory') || 'Select a category'}</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                {t('events.create.fields.date')}
              </label>
              <input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                required
              />
            </div>

            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                {t('events.create.fields.time')}
              </label>
              <input
                id="time"
                name="time"
                type="time"
                value={formData.time}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                required
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              {t('events.create.fields.location')}
            </label>
            <input
              id="location"
              name="location"
              type="text"
              value={formData.location}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder={t('events.create.placeholders.location')}
              required
            />
          </div>

          {/* Max Attendees and Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="maxAttendees" className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                {t('events.create.fields.maxAttendees')}
              </label>
              <input
                id="maxAttendees"
                name="maxAttendees"
                type="number"
                value={formData.maxAttendees}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder={t('events.create.placeholders.maxAttendees')}
                min="1"
                required
              />
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                {t('events.create.fields.price')}
              </label>
              <input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder={t('events.create.placeholders.price')}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
              <Tag className="w-4 h-4 inline mr-1" />
              {t('events.create.fields.tags')}
            </label>
            <input
              id="tags"
              name="tags"
              type="text"
              value={formData.tags}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder={t('events.create.placeholders.tags')}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('events.create.buttons.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {t('common.creating')}
                </span>
              ) : (
                t('events.create.buttons.create')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateEventModal
