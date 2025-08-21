import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { Event } from '../types/Event'
import { mockEvents } from '../data/mockEvents'
import { useAuth } from './AuthContext'

interface EventContextType {
  events: Event[]
  joinedEvents: Event[]
  joinEvent: (eventId: string) => void
  leaveEvent: (eventId: string) => void
  addEvent: (event: Omit<Event, 'id'>) => void
  updateEvent: (eventId: string, updates: Partial<Event>) => void
  isEventJoined: (eventId: string) => boolean
  toggleInterest: (eventId: string) => void
}

const EventContext = createContext<EventContextType | undefined>(undefined)

export const useEvents = () => {
  const context = useContext(EventContext)
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventProvider')
  }
  return context
}

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, updateUser } = useAuth()
  const [events, setEvents] = useState<Event[]>(mockEvents)
  const [joinedEventIds, setJoinedEventIds] = useState<string[]>([])
  const [isUpdating, setIsUpdating] = useState(false)

  // Load user's joined events from localStorage
  useEffect(() => {
    if (user) {
      const savedJoinedEvents = localStorage.getItem(`joinedEvents_${user.id}`)
      if (savedJoinedEvents) {
        try {
          const eventIds = JSON.parse(savedJoinedEvents)
          console.log('Loaded joined events for user:', user.name, eventIds)
          setJoinedEventIds(eventIds)
        } catch (error) {
          console.error('Error parsing saved joined events:', error)
          setJoinedEventIds([])
        }
      } else {
        // Initialize with user's existing events if any
        if (user.eventsAttended && user.eventsAttended.length > 0) {
          console.log('Initializing with user events:', user.eventsAttended)
          setJoinedEventIds(user.eventsAttended)
          localStorage.setItem(`joinedEvents_${user.id}`, JSON.stringify(user.eventsAttended))
        }
      }
    } else {
      setJoinedEventIds([])
    }
  }, [user])

  // Save joined events to localStorage whenever they change
  useEffect(() => {
    if (user && joinedEventIds.length >= 0 && !isUpdating) {
      try {
        localStorage.setItem(`joinedEvents_${user.id}`, JSON.stringify(joinedEventIds))
        // Update user profile with attended events
        updateUser({ eventsAttended: joinedEventIds })
        console.log('Saved joined events for user:', user.name, joinedEventIds)
      } catch (error) {
        console.error('Error saving joined events:', error)
      }
    }
  }, [joinedEventIds, user, updateUser, isUpdating])

  // Update events with user's attendance status
  const eventsWithAttendance = events.map(event => ({
    ...event,
    isAttending: joinedEventIds.includes(event.id)
  }))

  const joinedEvents = eventsWithAttendance.filter(event => event.isAttending)

  const isEventJoined = useCallback((eventId: string): boolean => {
    const result = joinedEventIds.includes(eventId)
    console.log(`isEventJoined(${eventId}):`, result)
    return result
  }, [joinedEventIds])

  // FIXED: Enhanced join event logic with proper state management
  const joinEvent = useCallback((eventId: string) => {
    if (!user || isUpdating) {
      console.log('Cannot join event: user not logged in or updating')
      return
    }

    // Check if user is already joined
    if (joinedEventIds.includes(eventId)) {
      console.log('User already joined this event')
      return
    }

    // Check if event is full
    const event = events.find(e => e.id === eventId)
    if (event && event.attendees >= event.maxAttendees) {
      console.log('Event is full, cannot join')
      return
    }

    setIsUpdating(true)
    
    console.log(`Joining event ${eventId}...`)
    
    // Update joined events list
    const newJoinedEvents = [...joinedEventIds, eventId]
    setJoinedEventIds(newJoinedEvents)
    
    // FIXED: Update event attendee count atomically
    setEvents(prev => prev.map(event => {
      if (event.id === eventId) {
        const newAttendeeCount = Math.min(event.attendees + 1, event.maxAttendees)
        console.log(`Event ${eventId}: Attendees ${event.attendees} -> ${newAttendeeCount}`)
        return { 
          ...event, 
          attendees: newAttendeeCount,
          isAttending: true
        }
      }
      return event
    }))

    console.log('Successfully joined event:', eventId)
    
    // Reset updating flag after a short delay
    setTimeout(() => {
      setIsUpdating(false)
    }, 200)
  }, [user, joinedEventIds, events, isUpdating])

  // FIXED: Enhanced leave event logic with proper state management
  const leaveEvent = useCallback((eventId: string) => {
    if (!user || isUpdating) {
      console.log('Cannot leave event: user not logged in or updating')
      return
    }

    // Check if user is actually joined
    if (!joinedEventIds.includes(eventId)) {
      console.log('User is not joined to this event')
      return
    }

    setIsUpdating(true)
    
    console.log(`Leaving event ${eventId}...`)
    
    // Update joined events list
    const newJoinedEvents = joinedEventIds.filter(id => id !== eventId)
    setJoinedEventIds(newJoinedEvents)
    
    // FIXED: Update event attendee count atomically
    setEvents(prev => prev.map(event => {
      if (event.id === eventId) {
        const newAttendeeCount = Math.max(event.attendees - 1, 0)
        console.log(`Event ${eventId}: Attendees ${event.attendees} -> ${newAttendeeCount}`)
        return { 
          ...event, 
          attendees: newAttendeeCount,
          isAttending: false
        }
      }
      return event
    }))

    console.log('Successfully left event:', eventId)
    
    // Reset updating flag after a short delay
    setTimeout(() => {
      setIsUpdating(false)
    }, 200)
  }, [user, joinedEventIds, isUpdating])

  const addEvent = useCallback((eventData: Omit<Event, 'id'>) => {
    const newEvent: Event = {
      ...eventData,
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      attendees: 1, // Creator automatically joins
      isAttending: true
    }
    
    setEvents(prev => [...prev, newEvent])
    
    // Creator automatically joins their own event
    if (user) {
      const newJoinedEvents = [...joinedEventIds, newEvent.id]
      setJoinedEventIds(newJoinedEvents)
    }
    
    console.log('Event created:', newEvent.title)
  }, [user, joinedEventIds])

  const updateEvent = useCallback((eventId: string, updates: Partial<Event>) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId ? { ...event, ...updates } : event
    ))
    console.log('Event updated:', eventId, updates)
  }, [])

  const toggleInterest = useCallback((eventId: string) => {
    if (!user || isUpdating) {
      console.log('Cannot toggle interest: user not logged in or updating')
      return
    }

    setIsUpdating(true)

    setEvents(prevEvents => 
      prevEvents.map(event => {
        if (event.id === eventId) {
          const isCurrentlyInterested = event.interestedUsers.includes(user.name)
          const updatedInterestedUsers = isCurrentlyInterested
            ? event.interestedUsers.filter(userId => userId !== user.name)
            : [...event.interestedUsers, user.name]
          
          console.log('Toggling interest for event:', eventId, 'New count:', updatedInterestedUsers.length)
          
          return {
            ...event,
            interestedUsers: updatedInterestedUsers
          }
        }
        return event
      })
    )
    
    setTimeout(() => setIsUpdating(false), 100)
  }, [user, isUpdating])

  return (
    <EventContext.Provider value={{
      events: eventsWithAttendance,
      joinedEvents,
      joinEvent,
      leaveEvent,
      addEvent,
      updateEvent,
      isEventJoined,
      toggleInterest
    }}>
      {children}
    </EventContext.Provider>
  )
}
