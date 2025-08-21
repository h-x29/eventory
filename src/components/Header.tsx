import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Map, List, Plus } from 'lucide-react'
import CreateEventModal from './CreateEventModal'
import LanguageSwitcher from './LanguageSwitcher'

interface HeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  viewMode: 'map' | 'list'
  onViewModeChange: (mode: 'map' | 'list') => void
  onCreateEvent?: (eventData: any) => void
}

const Header: React.FC<HeaderProps> = ({ 
  searchQuery, 
  onSearchChange, 
  viewMode, 
  onViewModeChange,
  onCreateEvent 
}) => {
  const { t } = useTranslation()
  const [showCreateModal, setShowCreateModal] = useState(false)

  const handleCreateEvent = (eventData: any) => {
    if (onCreateEvent) {
      onCreateEvent(eventData)
    }
    setShowCreateModal(false)
  }

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Seoul Campus Events</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t('events.search')}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
            </div>

            {/* Create Event Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">{t('events.create')}</span>
            </button>
            
            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => onViewModeChange('map')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                  viewMode === 'map' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Map className="w-4 h-4" />
                <span className="hidden sm:inline">{t('events.viewMode.map')}</span>
              </button>
              <button
                onClick={() => onViewModeChange('list')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">{t('events.viewMode.list')}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <CreateEventModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateEvent={handleCreateEvent}
      />
    </>
  )
}

export default Header
