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
  const [operationLocks, setOperationLocks] = useState<{ [eventId: string]: boolean }>({})

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
    if (user && joinedEventIds.length >= 0) {
      try {
        localStorage.setItem(`joinedEvents_${user.id}`, JSON.stringify(joinedEventIds))
        console.log('Saved joined events for user:', user.name, joinedEventIds)
      } catch (error) {
        console.error('Error saving joined events:', error)
      }
    }
  }, [joinedEventIds, user, updateUser])

  // Update events with user's attendance status
  const eventsWithAttendance = events.map(event => ({
    ...event,
    isAttending: joinedEventIds.includes(event.id)
  }))

  const joinedEvents = eventsWithAttendance.filter(event => event.isAttending)

  const isEventJoined = useCallback((eventId: string): boolean => {
    return joinedEventIds.includes(eventId)
  }, [joinedEventIds])

  // FIXED: Completely rewritten join event logic with operation locks
  const joinEvent = useCallback((eventId: string) => {
    console.log('joinEvent called for event:', eventId);
    console.log('Current joinedEventIds:', joinedEventIds);
    const currentEvent = events.find(e => e.id === eventId);
    console.log('Current attendee count for event', eventId, ':', currentEvent?.attendees);
    if (!user) {
      console.log('Cannot join event: user not logged in')
      return
    }

    // FIXED: Check operation lock to prevent concurrent operations
    if (operationLocks[eventId]) {
      console.log('Operation already in progress for event:', eventId)
      return
    }

    // FIXED: Check if already joined
    if (joinedEventIds.includes(eventId)) {
      console.log('User already joined event:', eventId)
      return
    }

    // Check if event exists and is not full
    const event = events.find(e => e.id === eventId)
    if (!event) {
      console.log('Event not found:', eventId)
      return
    }

    if (event.attendees >= event.maxAttendees) {
      console.log('Event is full:', eventId)
      return
    }

    console.log(`Joining event ${eventId}...`)
    
    // FIXED: Set operation lock
    setOperationLocks(prev => ({ ...prev, [eventId]: true }))
    
    try {
      // FIXED: Update joined events first
      setJoinedEventIds(prev => {
        if (prev.includes(eventId)) {
          console.log('Event already in joined list, skipping')
          return prev
        }
        return [...prev, eventId]
      })
      
      // FIXED: Update event attendee count
      setEvents(prev => prev.map(e => {
        if (e.id === eventId) {
          const newAttendeeCount = Math.min(e.attendees + 1, e.maxAttendees)
          console.log(`Event ${eventId}: Attendees ${e.attendees} -> ${newAttendeeCount}`)
          return { 
            ...e, 
            attendees: newAttendeeCount,
            isAttending: true
          }
        }
        return e
      }))

      console.log('Successfully joined event:', eventId)
    } catch (error) {
      console.error('Error joining event:', error)
    } finally {
      // FIXED: Clear operation lock after delay
      setTimeout(() => {
        setOperationLocks(prev => ({ ...prev, [eventId]: false }))
      }, 1000)
    }
  }, [user, joinedEventIds, events, operationLocks])

  // FIXED: Completely rewritten leave event logic with operation locks
  const leaveEvent = useCallback((eventId: string) => {
    console.log('leaveEvent called for event:', eventId);
    console.log('Current joinedEventIds:', joinedEventIds);
    const currentEvent = events.find(e => e.id === eventId);
    console.log('Current attendee count for event', eventId, ':', currentEvent?.attendees);
    if (!user) {
      console.log('Cannot leave event: user not logged in')
      return
    }

    // FIXED: Check operation lock to prevent concurrent operations
    if (operationLocks[eventId]) {
      console.log('Operation already in progress for event:', eventId)
      return
    }

    // FIXED: Check if actually joined
    if (!joinedEventIds.includes(eventId)) {
      console.log('User is not joined to event:', eventId)
      return
    }

    console.log(`Leaving event ${eventId}...`)
    
    // FIXED: Set operation lock
    setOperationLocks(prev => ({ ...prev, [eventId]: true }))
    
    try {
      // FIXED: Update joined events first
      setJoinedEventIds(prev => prev.filter(id => id !== eventId))
      
      // FIXED: Update event attendee count
      setEvents(prev => prev.map(e => {
        if (e.id === eventId && joinedEventIds.includes(eventId)) {
          const newAttendeeCount = Math.max(e.attendees - 1, 0)
 console.log(`Event ${eventId}: Attendees ${e.attendees} -> ${newAttendeeCount}`);
          return { 
            ...e, 
 attendees: newAttendeeCount,
            isAttending: false
          }
        }
        return e
      }))

      console.log('Successfully left event:', eventId)
    } catch (error) {
      console.error('Error leaving event:', error)
    } finally {
      // FIXED: Clear operation lock after delay
      setTimeout(() => {
        setOperationLocks(prev => ({ ...prev, [eventId]: false }))
      }, 1000)
    }
  }, [user, joinedEventIds, operationLocks])

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
    if (!user) {
      console.log('Cannot toggle interest: user not logged in')
      return
    }

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
  }, [user])

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
