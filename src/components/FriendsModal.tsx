import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Search, Users, MessageCircle, Mail } from 'lucide-react'
import FriendProfile from './FriendProfile'
import FriendMessaging from './FriendMessaging'

interface FriendsModalProps {
  onClose: () => void
}

const UNI_NAME_TO_KEY: Record<string, string> = {
  'Seoul National University': 'snu',
  'Yonsei University': 'yonsei',
  'Korea University': 'korea',
  'Hanyang University': 'hanyang',
  'Ewha Womans University': 'ewha',
  'Sogang University': 'sogang',
  'Hongik University': 'hongik',
  'Konkuk University': 'konkuk',
  // If your JSON also includes this, keep it; otherwise the fallback will show the raw name:
  'Sungkyunkwan University': 'sungkyunkwan',
}

const FriendsModal: React.FC<FriendsModalProps> = ({ onClose }) => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'search' | 'requests' | 'invite'>('search')
  const [searchQuery, setSearchQuery] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [selectedFriend, setSelectedFriend] = useState<any>(null)
  const [showMessaging, setShowMessaging] = useState(false)
  const [messagingFriend, setMessagingFriend] = useState<any>(null)

  const friendSuggestions = [
    { id: '1', name: 'Sarah Jung', university: 'Yonsei University', hobby: 'Photography', age: 21, mbti: 'ENFP', language: 'Korean, English', mutualFriends: 3, avatar: 'SJ', isRequested: false, bio: 'Photography enthusiast and art lover. Always looking for new places to explore in Seoul!' },
    { id: '2', name: 'Mike Chen', university: 'Korea University', hobby: 'Basketball', age: 23, mbti: 'ESTP', language: 'English, Chinese', mutualFriends: 5, avatar: 'MC', isRequested: false, bio: 'Basketball player and sports enthusiast. Love meeting new people and staying active!' },
    { id: '3', name: 'Emma Lee', university: 'Seoul National University', hobby: 'Music', age: 20, mbti: 'INFP', language: 'Korean, English, Japanese', mutualFriends: 2, avatar: 'EL', isRequested: true, bio: 'Music lover and aspiring composer. Enjoy classical music and K-pop equally!' },
    { id: '4', name: 'David Wang', university: 'Hanyang University', hobby: 'Gaming', age: 22, mbti: 'INTP', language: 'English, Korean', mutualFriends: 1, avatar: 'DW', isRequested: false, bio: 'Tech enthusiast and gamer. Always up for discussing the latest games and technology!' },
    { id: '5', name: 'Jenny Han', university: 'Ewha Womans University', hobby: 'Art', age: 21, mbti: 'ISFP', language: 'Korean, English', mutualFriends: 4, avatar: 'JH', isRequested: false, bio: 'Digital artist and design student. Love creating and sharing art with others!' }
  ]

  const friendRequests = [
    { id: '1', name: 'Alex Park', university: 'Sungkyunkwan University', hobby: 'Reading', age: 24, mbti: 'INTJ', language: 'Korean, English', avatar: 'AP', requestTime: '2 hours ago', bio: 'Bookworm and philosophy student. Enjoy deep conversations and quiet cafes.' },
    { id: '2', name: 'Lisa Kim', university: 'Sogang University', hobby: 'Dancing', age: 20, mbti: 'ESFP', language: 'Korean, English', avatar: 'LK', requestTime: '1 day ago', bio: 'Dance enthusiast and performer. Love expressing myself through movement!' }
  ]

  const [suggestions, setSuggestions] = useState(friendSuggestions)
  const [requests, setRequests] = useState(friendRequests)

  const uniKey = (name: string) => UNI_NAME_TO_KEY[name] || ''
  const uniLabel = (name: string) => {
    const key = uniKey(name)
    // defaultValue makes sure we fall back to the original English if the key is missing
    return key ? t(`universities.${key}`, { defaultValue: name }) : name
  }
  const uniColor = (name: string) => {
    switch (uniKey(name)) {
      case 'snu': return 'text-blue-600'
      case 'yonsei': return 'text-red-600'
      case 'korea': return 'text-red-700'
      case 'hanyang': return 'text-blue-700'
      case 'ewha': return 'text-green-600'
      case 'sogang': return 'text-purple-600'
      case 'hongik': return 'text-gray-700'
      case 'konkuk': return 'text-emerald-700'
      case 'sungkyunkwan': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  const handleSendRequest = (userId: string) => {
    setSuggestions(prev => prev.map(u => (u.id === userId ? { ...u, isRequested: true } : u)))
  }
  const handleAcceptRequest = (userId: string) => {
    setRequests(prev => prev.filter(u => u.id !== userId))
    alert(t('friendsModal.alerts.accepted'))
  }
  const handleRejectRequest = (userId: string) => {
    setRequests(prev => prev.filter(u => u.id !== userId))
  }
  const handleInviteByEmail = () => {
    if (inviteEmail.trim()) {
      alert(t('friendsModal.alerts.invited', { email: inviteEmail }))
      setInviteEmail('')
    }
  }
  const handleOpenProfile = (friend: any) => setSelectedFriend(friend)
  const handleOpenMessaging = (friend: any) => { setMessagingFriend(friend); setShowMessaging(true) }

  const normalizedQuery = searchQuery.toLowerCase()
  const filteredSuggestions = suggestions.filter(u => {
    const localizedUni = uniLabel(u.university).toLowerCase()
    return (
      u.name.toLowerCase().includes(normalizedQuery) ||
      u.university.toLowerCase().includes(normalizedQuery) || // English name
      localizedUni.includes(normalizedQuery) ||               // Localized (Korean) label
      u.hobby.toLowerCase().includes(normalizedQuery)
    )
  })

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">{t('friendsModal.header')}</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('search')}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'search' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Search className="w-4 h-4 inline mr-2" />
              {t('friendsModal.tabs.search')}
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'requests' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              {t('friendsModal.tabs.requests')}
              {requests.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {requests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('invite')}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'invite' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Mail className="w-4 h-4 inline mr-2" />
              {t('friendsModal.tabs.invite')}
            </button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-96 overflow-y-auto">
            {activeTab === 'search' && (
              <div>
                {/* Search Bar */}
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('friendsModal.searchPlaceholder')}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Friend Suggestions */}
                <div className="space-y-4">
                  {filteredSuggestions.map((user) => (
                    <div key={user.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">{user.avatar}</span>
                      </div>
                      <div className="flex-1">
                        <button
                          onClick={() => handleOpenProfile(user)}
                          className="font-medium text-gray-900 hover:text-blue-600 transition-colors text-left"
                        >
                          {user.name}
                        </button>
                        <p className={`text-sm font-medium ${uniColor(user.university)}`}>
                          {uniLabel(user.university)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {t('friendsModal.labels.hobby')}: {user.hobby}
                        </p>
                        <p className="text-xs text-gray-500">
                          {t('friendsModal.mutualFriends', { count: user.mutualFriends })}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenMessaging(user)}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
                          aria-label={t('friendsModal.actions.message')}
                        >
                          <MessageCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleSendRequest(user.id)}
                          disabled={user.isRequested}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            user.isRequested ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {user.isRequested ? t('friendsModal.requested') : t('friendsModal.addFriend')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'requests' && (
              <div>
                {requests.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">{t('friendsModal.noRequests')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {requests.map((user) => (
                      <div key={user.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">{user.avatar}</span>
                        </div>
                        <div className="flex-1">
                          <button
                            onClick={() => handleOpenProfile(user)}
                            className="font-medium text-gray-900 hover:text-blue-600 transition-colors text-left"
                          >
                            {user.name}
                          </button>
                          <p className={`text-sm font-medium ${uniColor(user.university)}`}>
                            {uniLabel(user.university)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {t('friendsModal.labels.hobby')}: {user.hobby}
                          </p>
                          <p className="text-xs text-gray-500">
                            {t('friendsModal.sent', { time: user.requestTime })}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRejectRequest(user.id)}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                          >
                            {t('friendsModal.actions.decline')}
                          </button>
                          <button
                            onClick={() => handleAcceptRequest(user.id)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                          >
                            {t('friendsModal.actions.accept')}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'invite' && (
              <div>
                <div className="text-center mb-6">
                  <Mail className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {t('friendsModal.invite.title')}
                  </h3>
                  <p className="text-gray-600">{t('friendsModal.invite.subtitle')}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('friendsModal.invite.emailLabel')}
                    </label>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder={t('friendsModal.invite.emailPlaceholder')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <button
                    onClick={handleInviteByEmail}
                    disabled={!inviteEmail.trim()}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {t('friendsModal.invite.send')}
                  </button>
                </div>

                <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">
                    {t('friendsModal.invite.previewTitle')}
                  </h4>
                  <div className="text-sm text-blue-800 bg-white p-3 rounded border">
                    <p className="mb-2">{t('friendsModal.invite.body.greeting')}</p>
                    <p className="mb-2">{t('friendsModal.invite.body.line1')}</p>
                    <p className="mb-2">{t('friendsModal.invite.body.line2')}</p>
                    <p>{t('friendsModal.invite.body.signature', { name: 'Alex Kim' })}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
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

export default FriendsModal
