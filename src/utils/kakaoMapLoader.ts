// Utility to dynamically load Kakao Maps API with environment variable
export const loadKakaoMaps = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.kakao && window.kakao.maps) {
      resolve()
      return
    }

    // Get API key from environment
    const apiKey = import.meta.env.VITE_KAKAO_MAP_API_KEY
    
    if (!apiKey) {
      reject(new Error('Kakao Maps API key not found in environment variables'))
      return
    }

    // Create script element
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services,clusterer,drawing&autoload=false`
    
    script.onload = () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          resolve()
        })
      } else {
        reject(new Error('Kakao Maps failed to load'))
      }
    }
    
    script.onerror = () => {
      reject(new Error('Failed to load Kakao Maps script'))
    }

    document.head.appendChild(script)
  })
}

// Type definitions for Kakao Maps
declare global {
  interface Window {
    kakao: {
      maps: {
        load: (callback: () => void) => void
        Map: new (container: HTMLElement, options: any) => any
        LatLng: new (lat: number, lng: number) => any
        Marker: new (options: any) => any
        MarkerImage: new (src: string, size: any, options?: any) => any
        Size: new (width: number, height: number) => any
        Point: new (x: number, y: number) => any
        InfoWindow: new (options: any) => any
        ZoomControl: new () => any
        MapTypeControl: new () => any
        ControlPosition: {
          TOPLEFT: any
          TOPRIGHT: any
          BOTTOMLEFT: any
          BOTTOMRIGHT: any
        }
        event: {
          addListener: (target: any, type: string, handler: () => void) => void
        }
      }
    }
  }
}
