import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Event } from '../types/Event'

declare global {
  interface Window {
    kakao: any
    openEventDetails?: (eventId: string) => void
  }
}

interface KakaoMapProps {
  events: Event[]
  onEventClick: (event: Event) => void
  selectedCategory: string
}

const KakaoMap: React.FC<KakaoMapProps> = ({ events, onEventClick, selectedCategory }) => {
  const { t, i18n } = useTranslation()
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

  // Get localized content for event
  const getLocalizedEventContent = (event: Event) => {
    const isKorean = i18n.language === 'ko'
    return {
      title: isKorean ? (event.title || event.titleEn) : (event.titleEn || event.title),
      location: isKorean ? (event.location || event.locationEn) : (event.locationEn || event.location),
      organizer: isKorean ? (event.organizer || event.organizerEn) : (event.organizerEn || event.organizer)
    }
  }

  // Format date based on language
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    if (i18n.language === 'ko') {
      return date.toLocaleDateString('ko-KR', {
        month: 'long',
        day: 'numeric'
      })
    }
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  // Format time based on language
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':')
    const date = new Date()
    date.setHours(parseInt(hours), parseInt(minutes))
    
    if (i18n.language === 'ko') {
      return date.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    }
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
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
      if (marker.hoverInfoWindow) {
        marker.hoverInfoWindow.close()
      }
      if (marker.clickInfoWindow) {
        marker.clickInfoWindow.close()
      }
      marker.setMap(null)
    })

    // FIXED: Set up global event handler before creating markers
    window.openEventDetails = (eventId: string) => {
      console.log('Global openEventDetails called with eventId:', eventId)
      const event = events.find(e => e.id === eventId)
      if (event) {
        console.log('Found event, calling onEventClick:', event.title)
        onEventClick(event)
      } else {
        console.error('Event not found with id:', eventId)
      }
    }

    // Create new markers for filtered events
    const newMarkers = events.map(event => {
      if (!event.coordinates) return null

      const markerPosition = new window.kakao.maps.LatLng(
        event.coordinates.lat,
        event.coordinates.lng
      )

      // Get localized content
      const localizedContent = getLocalizedEventContent(event)

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

      // Create hover tooltip with basic info
      const hoverTooltipContent = `
        <div style="
          padding: 8px 12px; 
          min-width: 180px; 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          border: 1px solid #e5e7eb;
        ">
          <div style="font-weight: 600; font-size: 13px; margin-bottom: 4px; color: #1F2937; line-height: 1.3;">
            ${localizedContent.title}
          </div>
          <div style="font-size: 11px; color: #6B7280; margin-bottom: 2px; display: flex; align-items: center;">
            📍 ${localizedContent.location}
          </div>
          <div style="font-size: 11px; color: #6B7280; margin-bottom: 6px; display: flex; align-items: center;">
            📅 ${formatDate(event.date)} ${formatTime(event.time)}
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="
              background: ${categoryColors[event.category as keyof typeof categoryColors] || '#6B7280'}; 
              color: white; 
              padding: 2px 6px; 
              border-radius: 10px; 
              font-size: 9px; 
              font-weight: 500;
            ">
              ${t(`categories.${event.category}`)}
            </span>
            <span style="font-size: 10px; color: #6B7280;">
              👥 ${event.attendees}/${event.maxAttendees || '∞'}
            </span>
          </div>
          <div style="
            margin-top: 6px; 
            padding-top: 6px; 
            border-top: 1px solid #f3f4f6; 
            font-size: 9px; 
            color: #9CA3AF; 
            text-align: center;
          ">
            ${t('events.mapTooltip.clickForDetails')}
          </div>
        </div>
      `

      const hoverInfoWindow = new window.kakao.maps.InfoWindow({
        content: hoverTooltipContent,
        removable: false
      })

      // Add hover events for tooltip
      window.kakao.maps.event.addListener(marker, 'mouseover', () => {
        // Close all other hover tooltips
        markers.forEach(m => {
          if (m.hoverInfoWindow) {
            m.hoverInfoWindow.close()
          }
        })
        hoverInfoWindow.open(map, marker)
      })

      window.kakao.maps.event.addListener(marker, 'mouseout', () => {
        hoverInfoWindow.close()
      })

      // FIXED: Add click event to marker - directly opens event details modal
      window.kakao.maps.event.addListener(marker, 'click', () => {
        console.log('Marker clicked for event:', event.title, 'ID:', event.id)
        
        // Close hover tooltip
        hoverInfoWindow.close()
        
        // Close all other hover tooltips
        markers.forEach(m => {
          if (m.hoverInfoWindow) {
            m.hoverInfoWindow.close()
          }
        })
        
        // FIXED: Directly open event details modal instead of info window
        onEventClick(event)
        
        console.log('Event details modal opened for:', event.title)
      })

      // Store references to info windows
      marker.hoverInfoWindow = hoverInfoWindow
      
      return marker
    }).filter(Boolean)

    setMarkers(newMarkers)

    return () => {
      // Cleanup
      newMarkers.forEach(marker => {
        if (marker && marker.hoverInfoWindow) {
          marker.hoverInfoWindow.close()
        }
      })
    }
  }, [map, events, onEventClick, t, i18n.language])

  // Cleanup global function on unmount
  useEffect(() => {
    return () => {
      if (window.openEventDetails) {
        delete window.openEventDetails
      }
    }
  }, [])

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
        <h3 className="font-semibold text-sm text-gray-900 mb-3">{t('events.mapLegend.title')}</h3>
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
