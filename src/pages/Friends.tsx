import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Users, MessageCircle, UserPlus } from 'lucide-react'
import FriendProfile from '../components/FriendProfile'

interface Friend {
  id: string
  name: string
  university: string
  hobby: string
  age: number
  mbti: string
  language: string
  avatar: string
  isOnline: boolean
  bio?: string
}

const Friends: React.FC = () => {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTab, setSelectedTab] = useState<'all' | 'online' | 'requests' | 'suggestions'>('all')
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null)
  const [showProfile, setShowProfile] = useState(false)

  // Mock friends data
  const mockFriends: Friend[] = [
    {
      id: '1',
      name: 'Sarah Kim',
      university: 'Seoul National University',
      hobby: 'Photography',
      age: 22,
      mbti: 'ENFP',
      language: 'Korean, English',
      avatar: '📸',
      isOnline: true,
      bio: 'Photography enthusiast and Korean culture lover. Always looking for new adventures and friends to explore Seoul with!'
    },
    {
      id: '2',
      name: 'Mike Chen',
      university: 'Yonsei University',
      hobby: 'Basketball',
      age: 23,
      mbti: 'ESTP',
      language: 'English, Chinese',
      avatar: '🏀',
      isOnline: false,
      bio: 'Basketball player and exchange student from Taiwan. Love meeting new people and learning about different cultures.'
    },
    {
      id: '3',
      name: 'Emma Johnson',
      university: 'Korea University',
      hobby: 'Language Learning',
      age: 21,
      mbti: 'INFJ',
      language: 'English, Korean, Japanese',
      avatar: '📚',
      isOnline: true,
      bio: 'Language exchange enthusiast studying Korean literature. Passionate about cross-cultural communication.'
    },
    {
      id: '4',
      name: 'David Park',
      university: 'Hanyang University',
      hobby: 'Music Production',
      age: 24,
      mbti: 'INTP',
      language: 'Korean, English',
      avatar: '🎵',
      isOnline: false,
      bio: 'Music producer and DJ. Love creating beats and organizing music events around campus.'
    },
    {
      id: '5',
      name: 'Lisa Wang',
      university: 'Ewha Womans University',
      hobby: 'Art & Design',
      age: 22,
      mbti: 'ISFP',
      language: 'Chinese, Korean, English',
      avatar: '🎨',
      isOnline: true,
      bio: 'Art student specializing in digital design. Always looking for creative collaborations and art exhibitions.'
    },
    {
      id: '6',
      name: 'Alex Thompson',
      university: 'Sungkyunkwan University',
      hobby: 'Hiking',
      age: 25,
      mbti: 'ENFJ',
      language: 'English, Korean',
      avatar: '🥾',
      isOnline: false,
      bio: 'Outdoor enthusiast and hiking guide. Love exploring Korean mountains and organizing weekend adventures.'
    }
  ]

  const filteredFriends = mockFriends.filter(friend => {
    const matchesSearch = friend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         friend.university.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         friend.hobby.toLowerCase().includes(searchTerm.toLowerCase())
    
    switch (selectedTab) {
      case 'online':
        return matchesSearch && friend.isOnline
      case 'requests':
        return false // No friend requests in mock data
      case 'suggestions':
        return matchesSearch && !friend.isOnline // Show offline as suggestions
      default:
        return matchesSearch
    }
  })

  const handleViewProfile = (friend: Friend) => {
    setSelectedFriend(friend)
    setShowProfile(true)
  }

  const handleSendMessage = (friend: Friend) => {
    console.log('Sending message to:', friend.name)
    // This would typically navigate to messages or open a chat
  }

  const handleCloseProfile = () => {
    setShowProfile(false)
    setSelectedFriend(null)
  }

  const handleMessageFromProfile = () => {
    if (selectedFriend) {
      console.log('Opening message with:', selectedFriend.name)
      handleCloseProfile()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('friends.title')}</h1>
          <p className="text-gray-600">Connect with fellow students from Seoul universities</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t('friends.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {[
              { key: 'all', label: t('friends.all'), icon: Users },
              { key: 'online', label: t('friends.online'), icon: Users },
              { key: 'requests', label: t('friends.requests'), icon: UserPlus },
              { key: 'suggestions', label: t('friends.suggestions'), icon: Users }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setSelectedTab(key as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-colors ${
                  selectedTab === key
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Friends Grid */}
        {filteredFriends.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFriends.map((friend) => (
              <div
                key={friend.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                {/* Friend Header */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-2xl">{friend.avatar}</span>
                    </div>
                    {friend.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">{friend.name}</h3>
                    <p className="text-sm text-gray-600">{friend.university}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {friend.isOnline ? t('friends.online') : 'Offline'}
                    </p>
                  </div>
                </div>

                {/* Friend Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Age:</span>
                    <span className="font-medium text-gray-900">{friend.age}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">MBTI:</span>
                    <span className="font-medium text-gray-900">{friend.mbti}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Hobby:</span>
                    <span className="font-medium text-gray-900">{friend.hobby}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Languages:</span>
                    <p className="font-medium text-gray-900 mt-1">{friend.language}</p>
                  </div>
                </div>

                {/* Bio Preview */}
                {friend.bio && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {friend.bio}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSendMessage(friend)}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    {t('friends.sendMessage')}
                  </button>
                  <button
                    onClick={() => handleViewProfile(friend)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    {t('friends.viewProfile')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('friends.noFriends')}</h3>
            <p className="text-gray-600 mb-6">
              {selectedTab === 'requests' 
                ? 'No pending friend requests' 
                : selectedTab === 'online'
                ? 'No friends are currently online'
                : 'Try adjusting your search or explore suggestions'
              }
            </p>
            {selectedTab === 'all' && (
              <button className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Discover Friends
              </button>
            )}
          </div>
        )}
      </div>

      {/* Friend Profile Modal */}
      {showProfile && selectedFriend && (
        <FriendProfile
          friend={selectedFriend}
          onClose={handleCloseProfile}
          onMessage={handleMessageFromProfile}
        />
      )}
    </div>
  )
}

export default Friends
