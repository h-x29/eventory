import React from 'react'
import { Event } from '../types/Event'
import { MapPin, Clock, Users, Coins } from 'lucide-react'

interface EventListProps {
  events: Event[]
  onEventSelect: (event: Event) => void
  selectedEvent: Event | null
}

const EventList: React.FC<EventListProps> = ({
  events,
  onEventSelect,
  selectedEvent
}) => {
  const formatPrice = (price: number) => {
    return price === 0 ? 'Free' : `₩${price.toLocaleString()}`
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'academic': return 'bg-blue-100 text-blue-800'
      case 'cultural': return 'bg-purple-100 text-purple-800'
      case 'club': return 'bg-green-100 text-green-800'
      case 'language': return 'bg-orange-100 text-orange-800'
      case 'sports': return 'bg-red-100 text-red-800'
      case 'social': return 'bg-pink-100 text-pink-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4 space-y-3">
        {events.map((event) => (
          <div
            key={event.id}
            onClick={() => onEventSelect(event)}
            className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
              selectedEvent?.id === event.id
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-start space-x-3">
              <img
                src={event.image}
                alt={event.title}
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(event.category)}`}>
                    {event.category}
                  </span>
                  <span className="text-xs text-gray-500">{event.date}</span>
                </div>
                
                <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">
                  {event.title}
                </h3>
                
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                  {event.description}
                </p>
                
                <div className="space-y-1">
                  <div className="flex items-center text-xs text-gray-500">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>{event.time}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        <span>{event.attendees}/{event.maxAttendees}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <Coins className="w-3 h-3 mr-1" />
                        <span className="font-medium">{formatPrice(event.price)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {event.isAttending && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Attending
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default EventList
