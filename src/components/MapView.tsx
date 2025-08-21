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
  currentInfowindowRef = useRef<any>(null) // Ref for the currently open InfoWindow
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [modalEvent, setModalEvent] = useState<Event | null>(null)
  const [isKakaoLoaded, setIsKakaoLoaded] = useState(false)

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

  // FIXED: Improved Kakao Maps loading with better error handling
  const loadKakaoMaps = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      console.log('🗺️ Starting Kakao Maps loading process...')
      
      // Check if already loaded
      if (window.kakao?.maps) {
        console.log('✅ Kakao Maps already loaded')
        setIsKakaoLoaded(true)
        resolve()
        return
      }

      // Check if script already exists
      const existingScript = document.querySelector('script[src*="dapi.kakao.com"]')
      if (existingScript) {
        console.log('📜 Kakao script already exists, waiting for load...')
        const checkKakao = () => {
          if (window.kakao?.maps) {
            console.log('✅ Kakao Maps loaded from existing script')
            setIsKakaoLoaded(true)
            resolve()
          } else {
            setTimeout(checkKakao, 100)
          }
        }
        checkKakao()
        return
      }

      // Create new script
      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=95c4d96735fac42689ecec481164e569&autoload=false`
      script.async = true
      
      script.onload = () => {
        console.log('📜 Kakao script loaded, initializing maps...')
        if (window.kakao?.maps) {
          window.kakao.maps.load(() => {
            console.log('✅ Kakao Maps API ready')
            setIsKakaoLoaded(true)
            resolve()
          })
        } else {
          console.error('❌ Kakao object not found after script load')
          reject(new Error('Kakao Maps API not available'))
        }
      }
      
      script.onerror = (error) => {
        console.error('❌ Failed to load Kakao Maps script:', error)
        reject(new Error('Failed to load Kakao Maps script'))
      }

      document.head.appendChild(script)
      console.log('📜 Kakao script added to document')
    })
  }, [])

  // FIXED: Improved map initialization
  const initializeMap = useCallback(() => {
    console.log('🗺️ Initializing map...')
    
    if (!window.kakao?.maps) {
      console.error('❌ Kakao Maps not available')
      setMapError('Kakao Maps API not loaded')
      return
    }

    if (!mapContainer.current) {
      console.error('❌ Map container not available')
      setMapError('Map container not found')
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

      console.log('🗺️ Creating map with options:', options)
      const map = new window.kakao.maps.Map(mapContainer.current, options)
      mapRef.current = map
      
      // Add map controls
      const zoomControl = new window.kakao.maps.ZoomControl()
      map.addControl(zoomControl, window.kakao.maps.ControlPosition.TOPRIGHT)

      const mapTypeControl = new window.kakao.maps.MapTypeControl()
      map.addControl(mapTypeControl, window.kakao.maps.ControlPosition.TOPLEFT)

      console.log('✅ Map initialized successfully')
      setIsMapLoaded(true)
      setMapError(null)

    } catch (error) {
      console.error('❌ Map initialization error:', error)
      setMapError(`Map initialization failed: ${error}`)
      setIsMapLoaded(false)
    }
  }, [])

  // FIXED: Improved marker creation with better error handling
  const createCustomMarkers = useCallback(() => {
    if (!mapRef.current || !window.kakao || !isMapLoaded) {
      console.log('⚠️ Map not ready for markers')
      return
    }

    console.log('🎯 Creating markers for', events.length, 'events')

    // Clear existing overlays
    overlaysRef.current.forEach(overlay => {
      if (overlay && overlay.setMap) {
        overlay.setMap(null)
      }
    })
    overlaysRef.current = []

    events.forEach((event, index) => {
      if (!event.coordinates) {
        console.log('⚠️ Event missing coordinates:', event.title)
        return
      }

      try {
        const markerPosition = new window.kakao.maps.LatLng(
 event.coordinates.lat,
 event.coordinates.lng
 )

        const div = document.createElement('div')
 div.innerHTML = `
              <div style="
 cursor: pointer;
 width: 60px;
                height: 60px;
                border-radius: 50%;
                background-color: ${getCategoryColor(event.category)};
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 12px;
                border: 2px solid white;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
              ">
                ${event.title.substring(0, 5)}...
              </div>
            `

        const overlayContent = div

        const customOverlay = new window.kakao.maps.CustomOverlay({
          position: markerPosition,
          content: overlayContent,
          yAnchor: 1
        });

        customOverlay.setMap(mapRef.current)
        overlaysRef.current.push(customOverlay)

        overlayContent.addEventListener('click', () => {
          console.log('🎯 Marker clicked:', event)
          // TODO: Show event details on map click
          onEventSelect(event)
        })

        console.log(`✅ Marker created for: ${event.title}`)

      } catch (error) {
        console.error('❌ Error creating marker:', error)
      }
    })

    console.log(`🎯 Total markers created: ${overlaysRef.current.length}`)
  }, [events, onEventSelect, isMapLoaded])

  const handleToggleAttendance = (eventId: string) => {
    if (!user) {
      alert(t('auth.loginRequired'))
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
      alert(t('auth.loginRequired'))
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

  // FIXED: Improved loading sequence
  useEffect(() => {
    let mounted = true

    const initSequence = async () => {
      try {
        console.log('🚀 Starting map initialization sequence...')
        
        // Step 1: Load Kakao Maps
        await loadKakaoMaps()
        
        if (!mounted) return
        
        // Step 2: Initialize map
        setTimeout(() => {
          if (mounted) {
            initializeMap()
          }
        }, 100)
        
      } catch (error) {
        console.error('❌ Map initialization sequence failed:', error)
        if (mounted) {
          setMapError(`Failed to load map: ${error}`)
          setIsMapLoaded(false)
        }
      }
    }

    initSequence()

    return () => {
      mounted = false
    }
  }, [loadKakaoMaps, initializeMap])

  // Create markers when map is ready and events are available
  useEffect(() => {
    if (isMapLoaded && events.length > 0 && isKakaoLoaded) {
      console.log('🎯 Map ready, creating markers...')
      setTimeout(() => {
        createCustomMarkers()
      }, 200)
    }
  }, [events, isMapLoaded, isKakaoLoaded, createCustomMarkers])

  // Handle selected event
  useEffect(() => {
    if (selectedEvent && mapRef.current && window.kakao && isMapLoaded) {
      const position = new window.kakao.maps.LatLng(
        selectedEvent.coordinates.lat, 
        selectedEvent.coordinates.lng
      )
      mapRef.current.panTo(position)
      mapRef.current.setLevel(6)
    }
  }, [selectedEvent, isMapLoaded])

  const resetMapView = () => {
    if (mapRef.current && window.kakao) {
      const center = new window.kakao.maps.LatLng(37.5665, 126.9780)
      mapRef.current.panTo(center)
      mapRef.current.setLevel(8)
    }
  }

  return (
    <div className="relative h-full bg-gray-100">
      {/* Map container */}
      <div 
        ref={mapContainer}
        className="w-full h-full"
        style={{ minHeight: '500px' }}
      />
      
      {/* FIXED: Better loading/error states */}
      {(!isMapLoaded || mapError) && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center max-w-md p-6">
            {mapError ? (
              <>
                <div className="text-red-500 text-6xl mb-4">🗺️</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Map Loading Error
                </h3>
                <p className="text-gray-600 mb-4 text-sm">{mapError}</p>
                <button 
                  onClick={() => {
                    setMapError(null)
                    setIsMapLoaded(false)
                    setIsKakaoLoaded(false)
                    setTimeout(() => {
                      loadKakaoMaps().then(() => {
                        setTimeout(() => initializeMap(), 100)
                      }).catch(err => {
                        setMapError(`Reload failed: ${err}`)
                      })
                    }, 100)
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Retry Loading
                </button>
              </>
            ) : (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading Map...</p>
                <p className="text-xs text-gray-400 mt-2">
                  {!isKakaoLoaded ? 'Loading Kakao Maps API...' : 'Initializing map...'}
                </p>
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
            title="Reset Map View"
          >
            <Navigation className="w-5 h-5 text-gray-700 group-hover:text-blue-600 transition-colors" />
          </button>
        </div>
      )}

      {/* Legend */}
      {isMapLoaded && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 z-10 max-w-xs">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-blue-600" />
            Event Categories
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
                    {label.en}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              <strong>{overlaysRef.current.length}</strong> events shown
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
                {events.length} Events
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
