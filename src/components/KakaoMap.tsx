import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Event } from '../types/Event'

declare global {
  interface Window {
    kakao: any
  }
}

interface KakaoMapProps {
  events: Event[]
  onEventClick: (event: Event) => void
  selectedCategory: string
}

const KakaoMap: React.FC<KakaoMapProps> = ({ events, onEventClick, selectedCategory }) => {
  const { t } = useTranslation()
  const mapContainer = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [markers, setMarkers] = useState<any[]>([])

  // Category colors for markers
  const categoryColors = {
    academic: '#3B82F6',    // Blue
    cultural: '#8B5CF6',    // Purple
    club: '#10B981',        // Green
    language: '#F59E0B',    // Orange
    sports: '#EF4444',      // Red
    social: '#EC4899'       // Pink
  }

  useEffect(() => {
    if (!window.kakao || !mapContainer.current) return

    const script = document.createElement('script')
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=95c4d96735fac42689ecec481164e569&autoload=false`
    script.async = true
    
    script.onload = () => {
      window.kakao.maps.load(() => {
        const options = {
          center: new window.kakao.maps.LatLng(37.5665, 126.9780), // Seoul center
          level: 8
        }

        const kakaoMap = new window.kakao.maps.Map(mapContainer.current, options)
        setMap(kakaoMap)
      })
    }

    if (!document.querySelector(`script[src*="dapi.kakao.com"]`)) {
      document.head.appendChild(script)
    } else {
      window.kakao.maps.load(() => {
        const options = {
          center: new window.kakao.maps.LatLng(37.5665, 126.9780),
          level: 8
        }

        const kakaoMap = new window.kakao.maps.Map(mapContainer.current, options)
        setMap(kakaoMap)
      })
    }
  }, [])

  useEffect(() => {
    if (!map || !window.kakao) return

    // Clear existing markers
    markers.forEach(marker => {
      if (marker.infoWindow) {
        marker.infoWindow.close()
      }
      marker.setMap(null)
    })

    // Create new markers for filtered events
    const newMarkers = events.map(event => {
      if (!event.coordinates) return null

      const markerPosition = new window.kakao.maps.LatLng(
        event.coordinates.lat,
        event.coordinates.lng
      )

      // Create custom marker with category color
      const markerImageSrc = `data:image/svg+xml;base64,${btoa(`
        <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0C7.163 0 0 7.163 0 16c0 16 16 24 16 24s16-8 16-24C32 7.163 24.837 0 16 0z" fill="${categoryColors[event.category as keyof typeof categoryColors] || '#6B7280'}"/>
          <circle cx="16" cy="16" r="8" fill="white"/>
        </svg>
      `)}`
      
      const markerImageSize = new window.kakao.maps.Size(32, 40)
      const markerImageOption = { offset: new window.kakao.maps.Point(16, 40) }
      
      const markerImage = new window.kakao.maps.MarkerImage(
        markerImageSrc,
        markerImageSize,
        markerImageOption
      )

      const marker = new window.kakao.maps.Marker({
        position: markerPosition,
        image: markerImage
      })

      marker.setMap(map)

      // Create info window
      const infoWindowContent = `
        <div style="padding: 12px; min-width: 200px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px; color: #1F2937;">
            ${event.title}
          </div>
          <div style="font-size: 12px; color: #6B7280; margin-bottom: 8px;">
            📍 ${event.location}
          </div>
          <div style="font-size: 12px; color: #6B7280; margin-bottom: 8px;">
            📅 ${event.date} ${event.time}
          </div>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <span style="background: ${categoryColors[event.category as keyof typeof categoryColors] || '#6B7280'}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 500;">
              ${t(`categories.${event.category}`)}
            </span>
            <span style="font-size: 12px; color: #6B7280;">
              👥 ${event.attendees}/${event.maxAttendees || '∞'}
            </span>
          </div>
          <button 
            onclick="window.selectEvent('${event.id}')"
            style="background: #3B82F6; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; width: 100%; transition: background-color 0.2s;"
            onmouseover="this.style.backgroundColor='#2563EB'"
            onmouseout="this.style.backgroundColor='#3B82F6'"
          >
            ${t('common.view')}
          </button>
        </div>
      `

      const infoWindow = new window.kakao.maps.InfoWindow({
        content: infoWindowContent
      })

      // Add click event to marker - opens event details modal
      window.kakao.maps.event.addListener(marker, 'click', () => {
        // Close all other info windows first
        markers.forEach(m => {
          if (m.infoWindow) {
            m.infoWindow.close()
          }
        })
        
        // Open info window
        infoWindow.open(map, marker)
        
        // Also trigger event details modal
        onEventClick(event)
      })

      // Add hover effect to marker
      window.kakao.maps.event.addListener(marker, 'mouseover', () => {
        // Close all other info windows
        markers.forEach(m => {
          if (m.infoWindow) {
            m.infoWindow.close()
          }
        })
        infoWindow.open(map, marker)
      })

      marker.infoWindow = infoWindow
      return marker
    }).filter(Boolean)

    setMarkers(newMarkers)

    // Global function to select event from info window
    window.selectEvent = (eventId: string) => {
      const event = events.find(e => e.id === eventId)
      if (event) {
        onEventClick(event)
      }
    }

    return () => {
      window.selectEvent = undefined
    }
  }, [map, events, onEventClick, t])

  return (
    <div className="relative">
      {/* Map Container */}
      <div 
        ref={mapContainer} 
        className="w-full h-[600px] rounded-lg"
        style={{ minHeight: '600px' }}
      />
      
      {/* Map Legend */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
        <h3 className="font-semibold text-sm text-gray-900 mb-3">{t('events.filters.all')}</h3>
        <div className="space-y-2">
          {Object.entries(categoryColors).map(([category, color]) => (
            <div key={category} className="flex items-center gap-2 text-xs">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-gray-700">{t(`categories.${category}`)}</span>
            </div>
          ))}
        </div>
        
        {/* Event Count */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="text-xs text-gray-600">
            📍 {events.length} {events.length === 1 ? t('common.event') : t('common.events')}
          </div>
        </div>
      </div>

      {/* Map Instructions */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 max-w-xs">
        <div className="text-xs text-gray-600">
          💡 {t('events.mapInstructions')}
        </div>
      </div>

      {/* Loading State */}
      {!map && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">{t('common.loading')}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default KakaoMap
