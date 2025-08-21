import React from 'react'
import { X, MessageCircle, UserPlus, MapPin, Calendar, Heart, Star } from 'lucide-react'

interface FriendProfileProps {
  friend: {
    id: string
    name: string
    university: string
    hobby: string
    age: number
    mbti: string
    language: string
    avatar: string
    bio?: string
  }
  onClose: () => void
  onMessage: () => void
}

const FriendProfile: React.FC<FriendProfileProps> = ({ friend, onClose, onMessage }) => {
  const getUniversityColor = (university: string) => {
    switch (university) {
      case 'Seoul National University': return 'text-blue-600'
      case 'Yonsei University': return 'text-red-600'
      case 'Korea University': return 'text-red-700'
      case 'Hanyang University': return 'text-blue-700'
      case 'Ewha Womans University': return 'text-green-600'
      case 'Sungkyunkwan University': return 'text-yellow-600'
      case 'Sogang University': return 'text-purple-600'
      default: return 'text-gray-600'
    }
  }

  const getMBTIColor = (mbti: string) => {
    const firstLetter = mbti[0]
    switch (firstLetter) {
      case 'E': return 'bg-orange-100 text-orange-800'
      case 'I': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Mock data for friend's activities
  const recentEvents = [
    { name: 'Korean Language Exchange', date: '2024-01-20', type: 'attended' },
    { name: 'Photography Workshop', date: '2024-01-18', type: 'interested' },
    { name: 'Basketball Tournament', date: '2024-01-15', type: 'attended' }
  ]

  const commonInterests = ['Photography', 'Korean Culture', 'University Events']
  const mutualFriends = ['Mike Chen', 'Emma Lee', 'David Wang']

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 p-6 rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-all"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          
          <div className="text-center">
            <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">{friend.avatar}</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">{friend.name}</h2>
            <p className={`font-medium ${getUniversityColor(friend.university)} bg-white px-3 py-1 rounded-full text-sm inline-block`}>
              {friend.university}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{friend.age}</p>
              <p className="text-sm text-gray-600">Years Old</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getMBTIColor(friend.mbti)}`}>
                {friend.mbti}
              </span>
              <p className="text-sm text-gray-600 mt-1">Personality</p>
            </div>
          </div>

          {/* Bio */}
          {friend.bio && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">About</h3>
              <p className="text-gray-600 leading-relaxed">{friend.bio}</p>
            </div>
          )}

          {/* Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-red-500" />
              <div>
                <p className="font-medium text-gray-900">Hobby</p>
                <p className="text-gray-600">{friend.hobby}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-blue-500" />
              <div>
                <p className="font-medium text-gray-900">Languages</p>
                <p className="text-gray-600">{friend.language}</p>
              </div>
            </div>
          </div>

          {/* Common Interests */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Common Interests</h3>
            <div className="flex flex-wrap gap-2">
              {commonInterests.map((interest, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* Mutual Friends */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Mutual Friends</h3>
            <div className="space-y-2">
              {mutualFriends.map((friendName, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-medium">
                      {friendName.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <span className="text-gray-700">{friendName}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Activity</h3>
            <div className="space-y-3">
              {recentEvents.map((event, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    event.type === 'attended' ? 'bg-green-100' : 'bg-yellow-100'
                  }`}>
                    {event.type === 'attended' ? (
                      <Calendar className="w-4 h-4 text-green-600" />
                    ) : (
                      <Star className="w-4 h-4 text-yellow-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{event.name}</p>
                    <p className="text-xs text-gray-500">
                      {event.type === 'attended' ? 'Attended' : 'Interested'} • {event.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onMessage}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Send Message
            </button>
            <button className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors font-medium flex items-center justify-center gap-2">
              <UserPlus className="w-5 h-5" />
              Add Friend
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FriendProfile
