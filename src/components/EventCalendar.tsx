import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Calendar from 'react-calendar'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react'
import { Event } from '../types/Event'
import { useEvents } from '../contexts/EventContext'
import { useAuth } from '../contexts/AuthContext'
import 'react-calendar/dist/Calendar.css'

interface EventCalendarProps {
  onEventClick: (event: Event) => void
}

const EventCalendar: React.FC<EventCalendarProps> = ({ onEventClick }) => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { joinedEvents } = useEvents()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [view, setView] = useState<'calendar' | 'list'>('calendar')

  useEffect(() => {
    console.log('EventCalendar - User:', user?.name)
    console.log('EventCalendar - Joined events count:', joinedEvents.length)
    console.log('EventCalendar - Joined events:', joinedEvents.map(e => ({ 
      id: e.id, 
      title: e.title, 
      date: e.date,
      isAttending: e.isAttending 
    })))
  }, [user, joinedEvents])

  // Convert event dates to Date objects for calendar
  const eventDates = joinedEvents.map(event => {
    try {
      // Parse date in YYYY-MM-DD format
      const [year, month, day] = event.date.split('-').map(Number)
      const dateObj = new Date(year, month - 1, day)
      console.log(`EventCalendar - Processing event "${event.title}": ${event.date} -> ${dateObj.toDateString()}`)
      return {
        ...event,
        dateObj
      }
    } catch (error) {
      console.error('EventCalendar - Error parsing date for event:', event.title, event.date, error)
      return {
        ...event,
        dateObj: new Date() // fallback to today
      }
    }
  })

  // Get events for selected date
  const getEventsForDate = (date: Date) => {
    const eventsForDate = eventDates.filter(event => {
      const eventDate = event.dateObj
      const matches = eventDate.toDateString() === date.toDateString()
      if (matches) {
        console.log(`EventCalendar - Found event for ${date.toDateString()}: ${event.title}`)
      }
      return matches
    })
    console.log(`EventCalendar - Events for ${date.toDateString()}:`, eventsForDate.length)
    return eventsForDate
  }

  // Get events for selected date
  const selectedDateEvents = getEventsForDate(selectedDate)

  // Check if a date has events
  const hasEvents = (date: Date) => {
    const hasEventsResult = eventDates.some(event => 
      event.dateObj.toDateString() === date.toDateString()
    )
    if (hasEventsResult) {
      console.log(`EventCalendar - Date ${date.toDateString()} has events`)
    }
    return hasEventsResult
  }

  // Custom tile content to show event indicators
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month' && hasEvents(date)) {
      const dayEvents = getEventsForDate(date)
      console.log(`EventCalendar - Rendering tile content for ${date.toDateString()}, events:`, dayEvents.length)
      return (
        <div className="flex justify-center mt-1">
          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
          {dayEvents.length > 1 && (
            <div className="w-1 h-1 bg-blue-400 rounded-full ml-0.5"></div>
          )}
        </div>
      )
    }
    return null
  }

  // Custom tile class names
  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month' && hasEvents(date)) {
      return 'has-events'
    }
    return ''
  }

  // Get upcoming events (next 7 days)
  const getUpcomingEvents = () => {
    const today = new Date()
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    return eventDates
      .filter(event => event.dateObj >= today && event.dateObj <= nextWeek)
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
      .slice(0, 5)
  }

  const upcomingEvents = getUpcomingEvents()

  const formatDateForDisplay = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">{t('dashboard.calendar.title')}</h2>
          <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded-full">
            {joinedEvents.length} {t('dashboard.calendar.events')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('calendar')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              view === 'calendar'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t('dashboard.calendar.calendarView')}
          </button>
          <button
            onClick={() => setView('list')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              view === 'list'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t('dashboard.calendar.listView')}
          </button>
        </div>
      </div>

      {joinedEvents.length === 0 ? (
        <div className="text-center py-12">
          <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('dashboard.calendar.noEvents')}</h3>
          <p className="text-gray-500 mb-4">{t('dashboard.calendar.noEventsDescription')}</p>
          <button 
            onClick={() => window.location.href = '/events'}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('dashboard.calendar.browseEvents')}
          </button>
        </div>
      ) : view === 'calendar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="calendar-container">
              <Calendar
                onChange={(value) => setSelectedDate(value as Date)}
                value={selectedDate}
                tileContent={tileContent}
                tileClassName={tileClassName}
                prevLabel={<ChevronLeft className="w-4 h-4" />}
                nextLabel={<ChevronRight className="w-4 h-4" />}
                prev2Label={null}
                next2Label={null}
                className="custom-calendar"
              />
            </div>
          </div>

          {/* Selected Date Events */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">
              {formatDateForDisplay(selectedDate)}
            </h3>
            {selectedDateEvents.length > 0 ? (
              <div className="space-y-3">
                {selectedDateEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className="p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                  >
                    <h4 className="font-medium text-gray-900 text-sm mb-1">
                      {event.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                      <Clock className="w-3 h-3" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <MapPin className="w-3 h-3" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">{t('dashboard.calendar.noEventsOnDate')}</p>
            )}
          </div>
        </div>
      ) : (
        /* List View */
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">
            {t('dashboard.calendar.upcomingEvents')} ({upcomingEvents.length})
          </h3>
          {upcomingEvents.length > 0 ? (
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  onClick={() => onEventClick(event)}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{event.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                    {t('dashboard.calendar.joined')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">{t('dashboard.calendar.noUpcomingEvents')}</p>
              <p className="text-sm text-gray-400">{t('dashboard.calendar.joinedEventsWillAppear')}</p>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .calendar-container :global(.custom-calendar) {
          width: 100%;
          border: none;
          font-family: inherit;
        }
        
        .calendar-container :global(.react-calendar__tile) {
          padding: 0.75rem 0.5rem;
          background: none;
          border: none;
          font-size: 0.875rem;
          position: relative;
        }
        
        .calendar-container :global(.react-calendar__tile:hover) {
          background-color: #f3f4f6;
        }
        
        .calendar-container :global(.react-calendar__tile--active) {
          background-color: #3b82f6 !important;
          color: white;
        }
        
        .calendar-container :global(.react-calendar__tile--now) {
          background-color: #dbeafe;
          color: #1d4ed8;
        }
        
        .calendar-container :global(.react-calendar__tile.has-events) {
          font-weight: 600;
        }
        
        .calendar-container :global(.react-calendar__navigation) {
          margin-bottom: 1rem;
        }
        
        .calendar-container :global(.react-calendar__navigation button) {
          background: none;
          border: none;
          font-size: 1rem;
          font-weight: 600;
          color: #374151;
          padding: 0.5rem;
        }
        
        .calendar-container :global(.react-calendar__navigation button:hover) {
          background-color: #f3f4f6;
          border-radius: 0.5rem;
        }
        
        .calendar-container :global(.react-calendar__month-view__weekdays) {
          font-weight: 600;
          font-size: 0.75rem;
          color: #6b7280;
          text-transform: uppercase;
        }
        
        .calendar-container :global(.react-calendar__month-view__weekdays__weekday) {
          padding: 0.5rem;
        }
      `}</style>
    </div>
  )
}

export default EventCalendar
