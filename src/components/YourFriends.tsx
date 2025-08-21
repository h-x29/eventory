import React, { useState } from 'react'
import { MessageCircle, UserMinus, MoreHorizontal, Users, Search } from 'lucide-react'
import FriendProfile from './FriendProfile'
import FriendMessaging from './FriendMessaging'

interface YourFriendsProps {
  onClose: () => void
}

const YourFriends: React.FC<YourFriendsProps> = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFriend, setSelectedFriend] = useState<any>(null)
  const [showMessaging, setShowMessaging] = useState(false)
  const [messagingFriend, setMessagingFriend] = useState<any>(null)

  // Mock friends data
  const friends = [
    {
      id: '1',
      name: 'Sarah Jung',
      university: 'Yonsei University',
      hobby: 'Photography',
      age: 21,
      mbti: 'ENFP',
      language: 'Korean, English',
      avatar: 'SJ',
      status: 'online',
      lastSeen: 'Active now',
      bio: 'Photography enthusiast and art lover. Always looking for new places to explore in Seoul!',
      friendSince: '2 months ago'
    },
    {
      id: '2',
      name: 'Mike Chen',
      university: 'Korea University',
      hobby: 'Basketball',
      age: 23,
      mbti: 'ESTP',
      language: 'English, Chinese',
      avatar: 'MC',
      status: 'offline',
      lastSeen: '2 hours ago',
      bio: 'Basketball player and sports enthusiast. Love meeting new people and staying active!',
      friendSince: '3 months ago'
    },
    {
      id: '3',
      name: 'Emma Lee',
      university: 'Seoul National University',
      hobby: 'Music',
      age: 20,
      mbti: 'INFP',
      language: 'Korean, English, Japanese',
      avatar: 'EL',
      status: 'online',
      lastSeen: 'Active now',
      bio: 'Music lover and aspiring composer. Enjoy classical music and K-pop equally!',
      friendSince: '1 month ago'
    },
    {
      id: '4',
      name: 'David Wang',
      university: 'Hanyang University',
      hobby: 'Gaming',
      age: 22,
      mbti: 'INTP',
      language: 'English, Korean',
      avatar: 'DW',
      status: 'offline',
      lastSeen: '1 day ago',
      bio: 'Tech enthusiast and gamer. Always up for discussing the latest games and technology!',
      friendSince: '4 months ago'
    },
    {
      id: '5',
      name: 'Jenny Han',
      university: 'Ewha Womans University',
      hobby: 'Art',
      age: 21,
      mbti: 'ISFP',
      language: 'Korean, English',
      avatar: 'JH',
      status: 'online',
      lastSeen: 'Active now',
      bio: 'Digital artist and design student. Love creating and sharing art with others!',
      friendSince: '2 weeks ago'
    },
    {
      id: '6',
      name: 'Alex Park',
      university: 'Sungkyunkwan University',
      hobby: 'Reading',
      age: 24,
      mbti: 'INTJ',
      language: 'Korean, English',
      avatar: 'AP',
      status: 'offline',
      lastSeen: '3 hours ago',
      bio: 'Bookworm and philosophy student. Enjoy deep conversations and quiet cafes.',
      friendSince: '5 months ago'
    }
  ]

  const handleRemoveFriend = (friendId: string) => {
    if (confirm('Are you sure you want to remove this friend?')) {
      alert('Friend removed successfully')
      // In a real app, this would update the backend
    }
  }

  const handleOpenProfile = (friend: any) => {
    setSelectedFriend(friend)
  }

  const handleOpenMessaging = (friend: any) => {
    setMessagingFriend(friend)
    setShowMessaging(true)
  }

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

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.hobby.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const onlineFriends = filteredFriends.filter(friend => friend.status === 'online')
  const offlineFriends = filteredFriends.filter(friend => friend.status === 'offline')

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Your Friends</h2>
                <p className="text-sm text-gray-600">{friends.length} friends</p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search friends..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Friends List */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredFriends.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No friends found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Online Friends */}
              {onlineFriends.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                      Online ({onlineFriends.length})
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {onlineFriends.map((friend) => (
                      <div key={friend.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold">{friend.avatar}</span>
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div className="flex-1">
                          <button
                            onClick={() => handleOpenProfile(friend)}
                            className="font-medium text-gray-900 hover:text-blue-600 transition-colors text-left"
                          >
                            {friend.name}
                          </button>
                          <p className={`text-sm font-medium ${getUniversityColor(friend.university)}`}>
                            {friend.university}
                          </p>
                          <p className="text-xs text-green-600 font-medium">{friend.lastSeen}</p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleOpenMessaging(friend)}
                            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Send message"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleRemoveFriend(friend.id)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove friend"
                          >
                            <UserMinus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Offline Friends */}
              {offlineFriends.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                      Offline ({offlineFriends.length})
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {offlineFriends.map((friend) => (
                      <div key={friend.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors opacity-75">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold">{friend.avatar}</span>
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gray-400 border-2 border-white rounded-full"></div>
                        </div>
                        <div className="flex-1">
                          <button
                            onClick={() => handleOpenProfile(friend)}
                            className="font-medium text-gray-900 hover:text-blue-600 transition-colors text-left"
                          >
                            {friend.name}
                          </button>
                          <p className={`text-sm font-medium ${getUniversityColor(friend.university)}`}>
                            {friend.university}
                          </p>
                          <p className="text-xs text-gray-500">{friend.lastSeen}</p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleOpenMessaging(friend)}
                            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Send message"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleRemoveFriend(friend.id)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove friend"
                          >
                            <UserMinus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {selectedFriend && (
        <FriendProfile
          friend={selectedFriend}
          onClose={() => setSelectedFriend(null)}
          onMessage={() => {
            handleOpenMessaging(selectedFriend)
            setSelectedFriend(null)
          }}
        />
      )}

      {showMessaging && messagingFriend && (
        <FriendMessaging
          friend={messagingFriend}
          onClose={() => {
            setShowMessaging(false)
            setMessagingFriend(null)
          }}
        />
      )}
    </>
  )
}

export default YourFriends
