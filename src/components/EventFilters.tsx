import React from 'react'
import { EventCategory } from '../types/Event'
import { GraduationCap, Palette, Users, MessageCircle, Trophy, Coffee } from 'lucide-react'

interface EventFiltersProps {
  selectedCategory: EventCategory | 'all'
  onCategoryChange: (category: EventCategory | 'all') => void
  eventCount: number
}

const categories = [
  { id: 'all' as const, label: 'All Events', icon: Coffee, color: 'text-gray-600' },
  { id: 'academic' as const, label: 'Academic', icon: GraduationCap, color: 'text-blue-600' },
  { id: 'cultural' as const, label: 'Cultural', icon: Palette, color: 'text-purple-600' },
  { id: 'club' as const, label: 'Club Events', icon: Users, color: 'text-green-600' },
  { id: 'language' as const, label: 'Language', icon: MessageCircle, color: 'text-orange-600' },
  { id: 'sports' as const, label: 'Sports', icon: Trophy, color: 'text-red-600' },
  { id: 'social' as const, label: 'Social', icon: Coffee, color: 'text-pink-600' }
]

const EventFilters: React.FC<EventFiltersProps> = ({
  selectedCategory,
  onCategoryChange,
  eventCount
}) => {
  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        <span className="text-sm text-gray-500">{eventCount} events</span>
      </div>
      
      <div className="space-y-2">
        {categories.map((category) => {
          const Icon = category.icon
          const isSelected = selectedCategory === category.id
          
          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                isSelected
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : category.color}`} />
              <span className="text-sm font-medium">{category.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default EventFilters
