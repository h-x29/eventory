import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Calendar, Users, MessageCircle, Heart, Plus, Edit, Settings, Award, TrendingUp, ChevronDown, ChevronUp, UserPlus, MapPin, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useEvents } from '../contexts/EventContext'
import Navigation from '../components/Navigation'
import CreateEventModal from '../components/CreateEventModal'
import EventModal from '../components/EventModal'
import GroupChat from '../components/GroupChat'
import FriendsModal from '../components/FriendsModal'
import EventCalendar from '../components/EventCalendar'
import FriendMessaging from '../components/FriendMessaging'
import { Event } from '../types/Event'

const DashboardPage: React.FC = () => {
  const { user } = useAuth()
  const { t } = useTranslation()
  const { events, joinedEvents, joinEvent, leaveEvent, isEventJoined, addEvent, toggleInterest } = useEvents()
  const [showCreateEvent, setShowCreateEvent] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showGroupChat, setShowGroupChat] = useState(false)
  const [selectedChatEvent, setSelectedChatEvent] = useState<Event | null>(null)
  const [showFriendsModal, setShowFriendsModal] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [showFriendMessaging, setShowFriendMessaging] = useState(false)
  const [messagingFriend, setMessagingFriend] = useState<any>(null)

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('auth.loginRequired')}</h2>
          <p className="text-gray-600 mb-6">{t('dashboard.loginMessage')}</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('nav.login')}
          </button>
        </div>
      </div>
    )
  }

  console.log('Dashboard - Current user:', user.name, 'Joined events:', joinedEvents.length)

  // User statistics based on actual data
  const userStats = {
    eventsAttended: joinedEvents.length,
    eventsInterested: events.filter(event => !isEventJoined(event.id)).length,
    friendsCount: 24,
    groupChatsJoined: 6
  }

  // Get user's attended and interested events
  const attendedEvents = joinedEvents.slice(0, 6)
  const interestedEvents = events.filter(event => !isEventJoined(event.id)).slice(0, 6)

  // Mock group chats
  const groupChats = [
    {
      id: '1',
      eventTitle: t('dashboard.groupChats.koreanLanguage'),
      eventImage: 'https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg',
      lastMessage: t('dashboard.groupChats.lookingForward'),
      lastMessageTime: t('dashboard.groupChats.twoMinAgo'),
      participantCount: 12,
      unreadCount: 3
    },
    {
      id: '2',
      eventTitle: t('dashboard.groupChats.photographyWorkshop'),
      eventImage: 'https://images.pexels.com/photos/1983037/pexels-photo-1983037.jpeg',
      lastMessage: t('dashboard.groupChats.bringCameras'),
      lastMessageTime: t('dashboard.groupChats.oneHourAgo'),
      participantCount: 8,
      unreadCount: 0
    },
    {
      id: '3',
      eventTitle: t('dashboard.groupChats.seoulFoodTour'),
      eventImage: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
      lastMessage: t('dashboard.groupChats.meetingHongdae'),
      lastMessageTime: t('dashboard.groupChats.threeHoursAgo'),
      participantCount: 15,
      unreadCount: 1
    }
  ]

  // Mock friends list with clickable names
  const friendsList = [
    { id: '1', name: '정사라', university: t('universities.yonsei'), avatar: 'JS', hobby: t('dashboard.friends.photography'), age: 21, mbti: 'ENFP', language: t('dashboard.friends.koreanEnglish') },
    { id: '2', name: '김마이크', university: t('universities.korea'), avatar: 'KM', hobby: t('dashboard.friends.basketball'), age: 23, mbti: 'ESTP', language: t('dashboard.friends.englishChinese') },
    { id: '3', name: '이엠마', university: t('universities.snu'), avatar: 'LE', hobby: t('dashboard.friends.music'), age: 20, mbti: 'INFP', language: t('dashboard.friends.koreanEnglishJapanese') },
    { id: '4', name: '왕데이비드', university: t('universities.hanyang'), avatar: 'WD', hobby: t('dashboard.friends.gaming'), age: 22, mbti: 'INTP', language: t('dashboard.friends.englishKorean') },
    { id: '5', name: '한제니', university: t('universities.ewha'), avatar: 'HJ', hobby: t('dashboard.friends.art'), age: 21, mbti: 'ISFP', language: t('dashboard.friends.koreanEnglish') },
    { id: '6', name: '사토유키', university: t('universities.sogang'), avatar: 'SY', hobby: t('dashboard.friends.dancing'), age: 20, mbti: 'ESFP', language: t('dashboard.friends.koreanJapanese') }
  ]

  const [selectedFriend, setSelectedFriend] = useState<any>(null)
  const [showFriendProfile, setShowFriendProfile] = useState(false)

  const handleCreateEvent = (eventData: any) => {
    addEvent({
      ...eventData,
      coordinates: { lat: 37.5665, lng: 126.9780 }, // Default Seoul coordinates
      organizer: user?.name || 'Anonymous',
      attendees: 0,
      isAttending: false
    })
    setShowCreateEvent(false)
    alert(t('events.create.success'))
  }

  const handleToggleAttendance = (eventId: string) => {
    if (isEventJoined(eventId)) {
      leaveEvent(eventId)
    } else {
      joinEvent(eventId)
    }
  }

  const handleToggleInterest = (eventId: string) => {
    if (!user) {
      alert(t('auth.loginRequired'))
      return
    }

    toggleInterest(eventId)

    // Update selected event if it's the same event
    if (selectedEvent && selectedEvent.id === eventId) {
      const isCurrentlyInterested = selectedEvent.interestedUsers.includes(user.name)
      const updatedInterestedUsers = isCurrentlyInterested
        ? selectedEvent.interestedUsers.filter(userId => userId !== user.name)
        : [...selectedEvent.interestedUsers, user.name]
      
      setSelectedEvent({
        ...selectedEvent,
        interestedUsers: updatedInterestedUsers
      })
    }
  }

  const handleOpenGroupChat = (chatEvent: Event) => {
    setSelectedChatEvent(chatEvent)
    setShowGroupChat(true)
  }

  const handleOpenFriendProfile = (friend: any) => {
    setSelectedFriend(friend)
    setShowFriendProfile(true)
  }

  const handleOpenFriendMessaging = (friend: any) => {
    setMessagingFriend(friend)
    setShowFriendMessaging(true)
  }

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const getUniversityColor = (university: string) => {
    switch (university) {
      case t('universities.snu'): return 'text-blue-600'
      case t('universities.yonsei'): return 'text-red-600'
      case t('universities.korea'): return 'text-red-700'
      case t('universities.hanyang'): return 'text-blue-700'
      case t('universities.ewha'): return 'text-green-600'
      case t('universities.sogang'): return 'text-purple-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {t('dashboard.welcome')}, {user.name}!
              </h1>
              <p className="text-gray-600 mt-1">
                {user.university} • {user.hobby} • {user.mbti}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-6 h-6" />
              </button>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div 
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => toggleSection('attended')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('dashboard.stats.attended')}</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.eventsAttended}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                +{joinedEvents.length} {t('dashboard.stats.joined')}
              </div>
              {expandedSection === 'attended' ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </div>
          </div>

          <div 
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => toggleSection('interested')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('dashboard.stats.interested')}</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.eventsInterested}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                {t('dashboard.stats.availableToJoin')}
              </div>
              {expandedSection === 'interested' ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </div>
          </div>

          <div 
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => toggleSection('friends')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('dashboard.stats.friends')}</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.friendsCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                +3 {t('dashboard.stats.thisMonth')}
              </div>
              {expandedSection === 'friends' ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </div>
          </div>

          <div 
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => toggleSection('chats')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('dashboard.stats.chats')}</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.groupChatsJoined}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                +1 {t('dashboard.stats.thisWeek')}
              </div>
              {expandedSection === 'chats' ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </div>
          </div>
        </div>

        {/* Calendar Section */}
        <div className="mb-8">
          <EventCalendar 
            onEventClick={setSelectedEvent}
          />
        </div>

        {/* Expanded Sections */}
        {expandedSection === 'attended' && (
          <div className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.sections.eventsJoined')}</h3>
            {attendedEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {attendedEvents.map((event) => (
                  <div 
                    key={event.id} 
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{event.title}</h4>
                      <p className="text-sm text-gray-600">{event.location} • {event.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-yellow-500" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">{t('dashboard.sections.noEventsJoined')}</p>
                <p className="text-sm text-gray-400">{t('dashboard.sections.joinEventsToSee')}</p>
              </div>
            )}
          </div>
        )}

        {expandedSection === 'interested' && (
          <div className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.sections.eventsCanJoin')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {interestedEvents.map((event) => (
                <div 
                  key={event.id} 
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => setSelectedEvent(event)}
                >
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{event.title}</h4>
                    <p className="text-sm text-gray-600">{event.location} • {event.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {expandedSection === 'friends' && (
          <div className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{t('dashboard.sections.yourFriends')}</h3>
              <button
                onClick={() => setShowFriendsModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <UserPlus className="w-4 h-4" />
                {t('dashboard.sections.addFriends')}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {friendsList.map((friend) => (
                <div key={friend.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {friend.avatar}
                    </span>
                  </div>
                  <div className="flex-1">
                    <button
                      onClick={() => handleOpenFriendProfile(friend)}
                      className="font-medium text-gray-900 hover:text-blue-600 transition-colors text-left"
                    >
                      {friend.name}
                    </button>
                    <p className={`text-sm font-medium ${getUniversityColor(friend.university)}`}>
                      {friend.university}
                    </p>
                  </div>
                  <button 
                    onClick={() => handleOpenFriendMessaging(friend)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    {t('dashboard.sections.message')}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {expandedSection === 'chats' && (
          <div className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.sections.yourGroupChats')}</h3>
            <div className="space-y-4">
              {groupChats.map((chat) => (
                <div 
                  key={chat.id} 
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => {
                    const chatEvent = events.find(e => e.title === chat.eventTitle) || events[0]
                    handleOpenGroupChat(chatEvent)
                  }}
                >
                  <img
                    src={chat.eventImage}
                    alt={chat.eventTitle}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-900">{chat.eventTitle}</h4>
                      <span className="text-xs text-gray-500">{chat.lastMessageTime}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{chat.lastMessage}</p>
                    <p className="text-xs text-gray-500">{chat.participantCount} {t('dashboard.sections.participants')}</p>
                  </div>
                  {chat.unreadCount > 0 && (
                    <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                      {chat.unreadCount}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Host Event Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{t('dashboard.host.title')}</h2>
                  <p className="text-blue-100 mb-6">{t('dashboard.host.subtitle')}</p>
                  <button
                    onClick={() => setShowCreateEvent(true)}
                    className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors inline-flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    {t('dashboard.host.button')}
                  </button>
                </div>
                <div className="hidden md:block">
                  <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <Calendar className="w-12 h-12 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('dashboard.sections.recentActivity')}</h2>
              <div className="space-y-4">
                {joinedEvents.slice(0, 3).map((event, index) => (
                  <div key={event.id} className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{t('dashboard.activity.joined')} {event.title}</p>
                      <p className="text-sm text-gray-600">{index === 0 ? t('dashboard.activity.twoHoursAgo') : index === 1 ? t('dashboard.activity.oneDayAgo') : t('dashboard.activity.twoDaysAgo')}</p>
                    </div>
                  </div>
                ))}
                {joinedEvents.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-gray-500">{t('dashboard.activity.noRecentActivity')}</p>
                    <p className="text-sm text-gray-400">{t('dashboard.activity.joinEventsToSeeActivity')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.profile.title')}</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('dashboard.profile.university')}</p>
                  <p className="text-gray-900">{user.university}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('dashboard.profile.age')}</p>
                  <p className="text-gray-900">{user.age} {t('dashboard.profile.yearsOld')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('dashboard.profile.hobby')}</p>
                  <p className="text-gray-900">{user.hobby}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('dashboard.profile.mbti')}</p>
                  <p className="text-gray-900">{user.mbti}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('dashboard.profile.languages')}</p>
                  <p className="text-gray-900">{user.language}</p>
                </div>
              </div>
              <button className="w-full mt-4 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors inline-flex items-center justify-center gap-2">
                <Edit className="w-4 h-4" />
                {t('dashboard.profile.editProfile')}
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.quickActions.title')}</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => setShowFriendsModal(true)}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3"
                >
                  <Users className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">{t('dashboard.quickActions.findFriends')}</span>
                </button>
                <button 
                  onClick={() => toggleSection('chats')}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3"
                >
                  <MessageCircle className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">{t('dashboard.quickActions.joinGroupChats')}</span>
                </button>
                <button 
                  onClick={() => window.location.href = '/events'}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3"
                >
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">{t('dashboard.quickActions.browseEvents')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showCreateEvent && (
        <CreateEventModal
          isOpen={showCreateEvent}
          onClose={() => setShowCreateEvent(false)}
          onCreateEvent={handleCreateEvent}
        />
      )}

      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onToggleAttendance={handleToggleAttendance}
          onToggleInterest={handleToggleInterest}
          onOpenGroupChat={handleOpenGroupChat}
        />
      )}

      {showGroupChat && selectedChatEvent && (
        <GroupChat
          event={selectedChatEvent}
          onClose={() => setShowGroupChat(false)}
        />
      )}

      {showFriendsModal && (
        <FriendsModal
          onClose={() => setShowFriendsModal(false)}
        />
      )}

      {showFriendMessaging && messagingFriend && (
        <FriendMessaging
          friend={messagingFriend}
          onClose={() => {
            setShowFriendMessaging(false)
            setMessagingFriend(null)
          }}
        />
      )}

      {showFriendProfile && selectedFriend && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 p-6 rounded-t-2xl">
              <button
                onClick={() => setShowFriendProfile(false)}
                className="absolute top-4 right-4 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-all"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              
              <div className="text-center">
                <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-bold">{selectedFriend.avatar}</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">{selectedFriend.name}</h2>
                <p className={`font-medium ${getUniversityColor(selectedFriend.university)} bg-white px-3 py-1 rounded-full text-sm inline-block`}>
                  {selectedFriend.university}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">{selectedFriend.age}</p>
                  <p className="text-sm text-gray-600">{t('dashboard.profile.yearsOld')}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {selectedFriend.mbti}
                  </span>
                  <p className="text-sm text-gray-600 mt-1">{t('dashboard.profile.personality')}</p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="font-medium text-gray-900">{t('dashboard.profile.hobby')}</p>
                    <p className="text-gray-600">{selectedFriend.hobby}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-medium text-gray-900">{t('dashboard.profile.languages')}</p>
                    <p className="text-gray-600">{selectedFriend.language}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => {
                    handleOpenFriendMessaging(selectedFriend)
                    setShowFriendProfile(false)
                  }}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  {t('dashboard.profile.sendMessage')}
                </button>
                <button className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors font-medium flex items-center justify-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  {t('dashboard.profile.addFriend')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardPage
