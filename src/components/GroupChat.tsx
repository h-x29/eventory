import React, { useState, useRef, useEffect } from 'react'
import { Event } from '../types/Event'
import { User, ChatMessage } from '../types/User'
import { currentUser } from '../data/mockUser'
import { X, Send, Users, MessageCircle, Info } from 'lucide-react'

interface GroupChatProps {
  event: Event
  onClose: () => void
}

const GroupChat: React.FC<GroupChatProps> = ({ event, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      userId: 'user-2',
      userName: 'Sarah Park',
      userUniversity: 'Yonsei University',
      message: 'Looking forward to this event! Anyone else from Yonsei coming?',
      timestamp: new Date(Date.now() - 3600000),
      type: 'text'
    },
    {
      id: '2',
      userId: 'user-3',
      userName: 'Mike Chen',
      userUniversity: 'Korea University',
      message: 'Yes! I\'ll be there. Should we meet up beforehand?',
      timestamp: new Date(Date.now() - 1800000),
      type: 'text'
    },
    {
      id: '3',
      userId: 'system',
      userName: 'System',
      userUniversity: '',
      message: 'Emma Lee joined the chat',
      timestamp: new Date(Date.now() - 900000),
      type: 'system'
    },
    {
      id: '4',
      userId: 'user-4',
      userName: 'Emma Lee',
      userUniversity: 'Seoul National University',
      message: 'Hi everyone! Excited to meet you all at the event 🎉',
      timestamp: new Date(Date.now() - 600000),
      type: 'text'
    }
  ])
  
  const [newMessage, setNewMessage] = useState('')
  const [showParticipants, setShowParticipants] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const participants = [
    { id: 'user-1', name: 'Alex Kim', university: 'Seoul National University', hobby: 'Photography', language: 'Korean, English' },
    { id: 'user-2', name: 'Sarah Park', university: 'Yonsei University', hobby: 'Music', language: 'Korean, Japanese' },
    { id: 'user-3', name: 'Mike Chen', university: 'Korea University', hobby: 'Sports', language: 'English, Chinese' },
    { id: 'user-4', name: 'Emma Lee', university: 'Seoul National University', hobby: 'Art', language: 'Korean, English' },
    { id: 'user-5', name: 'David Kim', university: 'Hanyang University', hobby: 'Technology', language: 'Korean, English' }
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        userId: currentUser.id,
        userName: currentUser.name,
        userUniversity: currentUser.university,
        message: newMessage.trim(),
        timestamp: new Date(),
        type: 'text'
      }
      setMessages([...messages, message])
      setNewMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  }

  const getUniversityColor = (university: string) => {
    switch (university) {
      case 'Seoul National University': return 'text-blue-600'
      case 'Yonsei University': return 'text-red-600'
      case 'Korea University': return 'text-red-700'
      case 'Hanyang University': return 'text-blue-700'
      case 'Ewha Womans University': return 'text-green-600'
      case 'Sungkyunkwan University': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <MessageCircle className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{event.title}</h2>
              <p className="text-sm text-gray-500">{participants.length} participants</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Users className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id}>
                  {message.type === 'system' ? (
                    <div className="text-center">
                      <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {message.message}
                      </span>
                    </div>
                  ) : (
                    <div className={`flex ${message.userId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md ${message.userId === currentUser.id ? 'order-2' : 'order-1'}`}>
                        {message.userId !== currentUser.id && (
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium text-gray-900">{message.userName}</span>
                            <span className={`text-xs font-medium ${getUniversityColor(message.userUniversity)}`}>
                              {message.userUniversity.split(' ').map(word => word[0]).join('')}
                            </span>
                          </div>
                        )}
                        <div className={`px-4 py-2 rounded-lg ${
                          message.userId === currentUser.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <p className="text-sm">{message.message}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-3">
                <div className="flex-1">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Participants Sidebar */}
          {showParticipants && (
            <div className="w-80 border-l border-gray-200 bg-gray-50">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Participants</h3>
                <p className="text-sm text-gray-500">{participants.length} members</p>
              </div>
              <div className="overflow-y-auto">
                {participants.map((participant) => (
                  <div key={participant.id} className="p-4 border-b border-gray-200 hover:bg-white transition-colors">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {participant.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{participant.name}</p>
                        <p className={`text-xs font-medium ${getUniversityColor(participant.university)} truncate`}>
                          {participant.university}
                        </p>
                        <div className="mt-1 space-y-1">
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-500">Hobby:</span>
                            <span className="text-xs text-gray-700">{participant.hobby}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-500">Languages:</span>
                            <span className="text-xs text-gray-700">{participant.language}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default GroupChat
