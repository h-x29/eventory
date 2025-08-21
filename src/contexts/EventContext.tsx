import React, { createContext, useContext, useState, useEffect } from 'react'
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

  // Load user's joined events from localStorage
  useEffect(() => {
    if (user) {
      const savedJoinedEvents = localStorage.getItem(`joinedEvents_${user.id}`)
      if (savedJoinedEvents) {
        const eventIds = JSON.parse(savedJoinedEvents)
        console.log('Loaded joined events for user:', user.name, eventIds)
        setJoinedEventIds(eventIds)
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
      localStorage.setItem(`joinedEvents_${user.id}`, JSON.stringify(joinedEventIds))
      // Update user profile with attended events
      updateUser({ eventsAttended: joinedEventIds })
      console.log('Saved joined events for user:', user.name, joinedEventIds)
    }
  }, [joinedEventIds, user, updateUser])

  // Update events with user's attendance status
  const eventsWithAttendance = events.map(event => ({
    ...event,
    isAttending: joinedEventIds.includes(event.id)
  }))

  const joinedEvents = eventsWithAttendance.filter(event => event.isAttending)

  const isEventJoined = (eventId: string): boolean => {
    return joinedEventIds.includes(eventId)
  }

  const joinEvent = (eventId: string) => {
    if (!user) {
      console.log('Cannot join event: user not logged in')
      return
    }

    if (!joinedEventIds.includes(eventId)) {
      const newJoinedEvents = [...joinedEventIds, eventId]
      setJoinedEventIds(newJoinedEvents)
      
      // Update event attendee count
      setEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { ...event, attendees: Math.min(event.attendees + 1, event.maxAttendees) }
          : event
      ))

      console.log('User joined event:', eventId)
    }
  }

  const leaveEvent = (eventId: string) => {
    if (!user) {
      console.log('Cannot leave event: user not logged in')
      return
    }

    const newJoinedEvents = joinedEventIds.filter(id => id !== eventId)
    setJoinedEventIds(newJoinedEvents)
    
    // Update event attendee count
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, attendees: Math.max(event.attendees - 1, 0) }
        : event
    ))

    console.log('User left event:', eventId)
  }

  const addEvent = (eventData: Omit<Event, 'id'>) => {
    const newEvent: Event = {
      ...eventData,
      id: `event-${Date.now()}`,
      attendees: 1, // Creator automatically joins
      isAttending: true
    }
    
    setEvents(prev => [...prev, newEvent])
    
    // Creator automatically joins their own event
    if (user) {
      joinEvent(newEvent.id)
    }
    
    console.log('Event created:', newEvent.title)
  }

  const updateEvent = (eventId: string, updates: Partial<Event>) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId ? { ...event, ...updates } : event
    ))
    console.log('Event updated:', eventId, updates)
  }

  const toggleInterest = (eventId: string) => {
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
  }

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
