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

type EventWithDate = Event & { dateObj: Date }

const EventCalendar: React.FC<EventCalendarProps> = ({ onEventClick }) => {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const { joinedEvents } = useEvents()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [view, setView] = useState<'calendar' | 'list'>('calendar')

  // Get localized content for event
  const getLocalizedEventContent = (event: Event) => {
    const isKorean = i18n.language === 'ko'
    return {
      title: isKorean ? (event.title || (event as any).titleEn) : ((event as any).titleEn || event.title),
      location: isKorean ? (event.location || (event as any).locationEn) : ((event as any).locationEn || event.location)
    }
  }

  const formatDateForDisplay = (date: Date) => {
    if (i18n.language === 'ko') {
      return date.toLocaleDateString('ko-KR', { weekday: 'short', month: 'short', day: 'numeric' })
    }
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':')
    const date = new Date()
    date.setHours(parseInt(hours), parseInt(minutes))
    if (i18n.language === 'ko') {
      return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })
    }
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  }

  useEffect(() => {
    // helpful debug logs
    console.log('EventCalendar - User:', user?.name)
    console.log('EventCalendar - Joined events count:', joinedEvents.length)
  }, [user, joinedEvents])

  // Convert event dates to Date objects for calendar
  const eventDates: EventWithDate[] = joinedEvents.map(event => {
    try {
      const [year, month, day] = event.date.split('-').map(Number)
      const dateObj = new Date(year, month - 1, day)
      return { ...event, dateObj }
    } catch (error) {
      console.error('EventCalendar - Error parsing date for event:', event.title, event.date, error)
      return { ...event, dateObj: new Date() }
    }
  })

  const getEventsForDate = (date: Date) => {
    return eventDates.filter(event => event.dateObj.toDateString() === date.toDateString())
  }

  const selectedDateEvents = getEventsForDate(selectedDate)

  const hasEvents = (date: Date) => {
    return eventDates.some(event => event.dateObj.toDateString() === date.toDateString())
  }

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month' && hasEvents(date)) {
      const dayEvents = getEventsForDate(date)
      return (
        <div className="flex justify-center mt-1">
          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
          {dayEvents.length > 1 && <div className="w-1 h-1 bg-blue-400 rounded-full ml-0.5"></div>}
        </div>
      )
    }
    return null
  }

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month' && hasEvents(date)) return 'has-events'
    return ''
  }

  // === FIXED: All upcoming events (no "next week" cap), sorted by date+time ===
  const toDateTime = (e: EventWithDate) => {
    const dt = new Date(e.dateObj)
    const [hh, mm] = (e.time || '00:00').split(':').map(Number)
    dt.setHours(hh || 0, mm || 0, 0, 0)
    return dt
  }

  const getUpcomingEvents = (): EventWithDate[] => {
    const now = new Date()
    return eventDates
      .filter(e => toDateTime(e) >= now)               // all future (including later today)
      .sort((a, b) => +toDateTime(a) - +toDateTime(b)) // by date + time
  }

  const upcomingEvents = getUpcomingEvents()

  const getCalendarLocale = () => (i18n.language === 'ko' ? 'ko-KR' : 'en-US')

  const getNavigationLabel = ({ date, label, view }: any) => {
    if (i18n.language === 'ko' && view === 'month') {
      return `${date.getFullYear()}년 ${date.getMonth() + 1}월`
    }
    return label
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
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${view === 'calendar' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'}`}
          >
            {t('dashboard.calendar.calendarView')}
          </button>
          <button
            onClick={() => setView('list')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${view === 'list' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'}`}
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
                locale={getCalendarLocale()}
                navigationLabel={getNavigationLabel}
                formatMonthYear={(locale, date) =>
                  i18n.language === 'ko'
                    ? `${date.getFullYear()}년 ${date.getMonth() + 1}월`
                    : date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
                }
                formatShortWeekday={(locale, date) =>
                  i18n.language === 'ko'
                    ? ['일', '월', '화', '수', '목', '금', '토'][date.getDay()]
                    : date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3)
                }
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
                {selectedDateEvents.map((event) => {
                  const localizedContent = getLocalizedEventContent(event)
                  return (
                    <div
                      key={event.id}
                      onClick={() => onEventClick(event)}
                      className="p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                    >
                      <h4 className="font-medium text-gray-900 text-sm mb-1">{localizedContent.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(event.time)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <MapPin className="w-3 h-3" />
                        <span>{localizedContent.location}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full font-medium">
                          ✅ {t('dashboard.calendar.joined')}
                        </span>
                      </div>
                    </div>
                  )
                })}
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
            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              {upcomingEvents.map((event) => {
                const localizedContent = getLocalizedEventContent(event)
                return (
                  <div
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <img
                      src={event.image}
                      alt={localizedContent.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">{localizedContent.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatTime(event.time)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{localizedContent.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                      ✅ {t('dashboard.calendar.joined')}
                    </div>
                  </div>
                )
              })}
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
          background-color: #eff6ff;
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
