import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Event } from '../types/Event'
import { Navigation, MapPin, Calendar, Users, Clock } from 'lucide-react'
import EventModal from './EventModal'
import { useEvents } from '../contexts/EventContext'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'

interface MapViewProps {
  events: Event[]
  selectedEvent: Event | null
  onEventSelect: (event: Event) => void
}

declare global {
  interface Window {
    kakao: any
  }
}

const MapView: React.FC<MapViewProps> = ({
  events,
  selectedEvent,
  onEventSelect
}) => {
  const { user } = useAuth()
  const { t } = useLanguage()
  const { isEventJoined, joinEvent, leaveEvent, toggleInterest } = useEvents()
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const overlaysRef = useRef<any[]>([])
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [modalEvent, setModalEvent] = useState<Event | null>(null)

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'academic': return '#3B82F6'
      case 'cultural': return '#8B5CF6'
      case 'club': return '#10B981'
      case 'language': return '#F59E0B'
      case 'sports': return '#EF4444'
      case 'social': return '#EC4899'
      default: return '#6B7280'
    }
  }

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: { en: string, ko: string } } = {
      academic: { en: 'Academic', ko: '학술' },
      cultural: { en: 'Cultural', ko: '문화' },
      club: { en: 'Club Events', ko: '동아리' },
      language: { en: 'Language', ko: '언어' },
      sports: { en: 'Sports', ko: '스포츠' },
      social: { en: 'Social', ko: '사교' }
    }
    return labels[category] || { en: category, ko: category }
  }

  const initializeMap = useCallback(() => {
    console.log('🗺️ Initializing Kakao Map...')
    
    if (!window.kakao?.maps) {
      setMapError(t('common.error'))
      return
    }

    if (!mapContainer.current) {
      setMapError('Map container not available')
      return
    }

    try {
      const centerLat = 37.5665
      const centerLng = 126.9780

      const options = {
        center: new window.kakao.maps.LatLng(centerLat, centerLng),
        level: 8,
        draggable: true,
        scrollwheel: true,
        disableDoubleClick: false,
        disableDoubleClickZoom: false
      }

      const map = new window.kakao.maps.Map(mapContainer.current, options)
      mapRef.current = map
      
      setIsMapLoaded(true)
      setMapError(null)

      // Add map controls
      const zoomControl = new window.kakao.maps.ZoomControl()
      map.addControl(zoomControl, window.kakao.maps.ControlPosition.TOPRIGHT)

      const mapTypeControl = new window.kakao.maps.MapTypeControl()
      map.addControl(mapTypeControl, window.kakao.maps.ControlPosition.TOPLEFT)

      console.log('✅ Map initialized successfully')

    } catch (error) {
      console.error('❌ Map initialization error:', error)
      setMapError(`Map initialization failed: ${error}`)
    }
  }, [t])

  // NEW APPROACH: Use custom overlays instead of markers for better click handling
  const createCustomMarkers = useCallback(() => {
    if (!mapRef.current || !window.kakao) {
      console.log('⚠️ Map or Kakao not ready')
      return
    }

    console.log('🎯 Creating custom markers for', events.length, 'events')

    // Clear existing overlays
    overlaysRef.current.forEach(overlay => {
      if (overlay && overlay.setMap) {
        overlay.setMap(null)
      }
    })
    overlaysRef.current = []

    // Clear existing markers
    markersRef.current.forEach(marker => {
      if (marker && marker.setMap) {
        marker.setMap(null)
      }
    })
    markersRef.current = []

    events.forEach((event, index) => {
      const position = new window.kakao.maps.LatLng(
        event.coordinates.lat, 
        event.coordinates.lng
      )

      try {
        const color = getCategoryColor(event.category)
        
        // Create custom overlay with HTML content for better click handling
        const overlayContent = document.createElement('div')
        overlayContent.className = 'custom-marker'
        overlayContent.style.cssText = `
          width: 24px;
          height: 24px;
          background-color: ${color};
          border: 3px solid white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          position: relative;
          z-index: ${1000 + index};
          transition: all 0.2s ease;
        `
        
        // Add hover effect
        overlayContent.addEventListener('mouseenter', () => {
          overlayContent.style.transform = 'scale(1.2)'
          overlayContent.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)'
        })
        
        overlayContent.addEventListener('mouseleave', () => {
          overlayContent.style.transform = 'scale(1)'
          overlayContent.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)'
        })

        // CRITICAL: Direct click handler on the DOM element
        overlayContent.addEventListener('click', (e) => {
          e.preventDefault()
          e.stopPropagation()
          
          console.log('🎯 CUSTOM MARKER CLICKED!')
          console.log('Event:', event.title)
          console.log('Event ID:', event.id)
          
          // Find current event data
          const currentEvent = events.find(e => e.id === event.id) || event
          
          // Show modal
          setModalEvent(currentEvent)
          setShowEventModal(true)
          onEventSelect(currentEvent)
          
          // Center and zoom map
          mapRef.current.panTo(position)
          setTimeout(() => {
            mapRef.current.setLevel(6)
          }, 300)
          
          console.log('✅ Modal should be showing now')
        })

        // Create custom overlay
        const customOverlay = new window.kakao.maps.CustomOverlay({
          position: position,
          content: overlayContent,
          xAnchor: 0.5,
          yAnchor: 0.5,
          zIndex: 1000 + index
        })

        // Add to map
        customOverlay.setMap(mapRef.current)
        overlaysRef.current.push(customOverlay)

        console.log(`✅ Custom marker created for: ${event.title}`)

      } catch (error) {
        console.error('❌ Error creating custom marker:', error)
      }
    })

    console.log(`🎯 Total custom markers created: ${overlaysRef.current.length}`)
  }, [events, onEventSelect])

  const handleToggleAttendance = (eventId: string) => {
    if (!user) {
      alert(t('auth.login.title'))
      return
    }

    if (isEventJoined(eventId)) {
      leaveEvent(eventId)
    } else {
      joinEvent(eventId)
    }

    if (modalEvent && modalEvent.id === eventId) {
      const updatedEvent = events.find(e => e.id === eventId)
      if (updatedEvent) {
        setModalEvent({
          ...updatedEvent,
          isAttending: !isEventJoined(eventId)
        })
      }
    }
  }

  const handleToggleInterest = (eventId: string) => {
    if (!user) {
      alert(t('auth.login.title'))
      return
    }

    toggleInterest(eventId)

    if (modalEvent && modalEvent.id === eventId) {
      const updatedEvent = events.find(e => e.id === eventId)
      if (updatedEvent) {
        setModalEvent(updatedEvent)
      }
    }
  }

  const handleOpenGroupChat = (event: Event) => {
    console.log('Opening group chat for event:', event.title)
  }

  useEffect(() => {
    const checkKakaoMaps = () => {
      if (window.kakao?.maps) {
        window.kakao.maps.load(() => {
          initializeMap()
        })
      } else {
        setTimeout(checkKakaoMaps, 300)
      }
    }

    setTimeout(checkKakaoMaps, 100)
  }, [initializeMap])

  useEffect(() => {
    if (isMapLoaded && events.length > 0) {
      console.log('🎯 Map ready, creating custom markers...')
      setTimeout(() => {
        createCustomMarkers()
      }, 500)
    }
  }, [events, isMapLoaded, createCustomMarkers])

  useEffect(() => {
    if (selectedEvent && mapRef.current && window.kakao) {
      const position = new window.kakao.maps.LatLng(
        selectedEvent.coordinates.lat, 
        selectedEvent.coordinates.lng
      )
      mapRef.current.panTo(position)
      mapRef.current.setLevel(6)
    }
  }, [selectedEvent])

  const resetMapView = () => {
    if (mapRef.current && window.kakao) {
      const center = new window.kakao.maps.LatLng(37.5665, 126.9780)
      mapRef.current.panTo(center)
      mapRef.current.setLevel(8)
    }
  }

  const testCustomMarkers = () => {
    console.log('🧪 Testing custom markers...')
    console.log('Custom overlays:', overlaysRef.current.length)
    overlaysRef.current.forEach((overlay, index) => {
      console.log(`Overlay ${index}:`, overlay)
    })
  }

  return (
    <div className="relative h-full bg-gray-100">
      {/* Map container */}
      <div 
        ref={mapContainer}
        className="w-full h-full"
        style={{ minHeight: '500px' }}
      />
      
      {/* Loading/Error overlay */}
      {(!isMapLoaded || mapError) && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center max-w-md p-6">
            {mapError ? (
              <>
                <div className="text-red-500 text-6xl mb-4">🗺️</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('common.error')}
                </h3>
                <p className="text-gray-600 mb-4">{mapError}</p>
                <button 
                  onClick={() => {
                    setMapError(null)
                    setIsMapLoaded(false)
                    setTimeout(() => initializeMap(), 100)
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t('common.loading')}
                </button>
              </>
            ) : (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">{t('common.loading')}...</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Map controls */}
      {isMapLoaded && (
        <div className="absolute top-4 right-4 flex flex-col space-y-2 z-10">
          <button 
            onClick={resetMapView}
            className="bg-white p-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 group"
            title={t('events.view.map')}
          >
            <Navigation className="w-5 h-5 text-gray-700 group-hover:text-blue-600 transition-colors" />
          </button>
          
          <button 
            onClick={testCustomMarkers}
            className="bg-yellow-500 text-white p-2 rounded-lg text-xs"
            title="Test custom markers"
          >
            Test
          </button>
        </div>
      )}

      {/* Legend */}
      {isMapLoaded && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 z-10 max-w-xs">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-blue-600" />
            {t('events.filter.all')}
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {[
              { category: 'academic', color: '#3B82F6' },
              { category: 'cultural', color: '#8B5CF6' },
              { category: 'club', color: '#10B981' },
              { category: 'language', color: '#F59E0B' },
              { category: 'sports', color: '#EF4444' },
              { category: 'social', color: '#EC4899' }
            ].map(({ category, color }) => {
              const label = getCategoryLabel(category)
              return (
                <div key={category} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: color }}
                  ></div>
                  <span className="text-xs text-gray-700 font-medium">
                    {t(`events.filter.${category}`) || label.en}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              <strong>{t('common.loading')}</strong>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {overlaysRef.current.length} markers loaded
            </p>
          </div>
        </div>
      )}

      {/* Event counter */}
      {isMapLoaded && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg px-4 py-3 z-10">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {events.length} {t('nav.events')}
              </p>
              <p className="text-xs text-gray-500">Seoul</p>
            </div>
          </div>
        </div>
      )}

      {/* Event Modal */}
      {showEventModal && modalEvent && (
        <EventModal
          event={modalEvent}
          onClose={() => {
            setShowEventModal(false)
            setModalEvent(null)
          }}
          onToggleAttendance={handleToggleAttendance}
          onToggleInterest={handleToggleInterest}
          onOpenGroupChat={handleOpenGroupChat}
        />
      )}
    </div>
  )
}

export default MapView
