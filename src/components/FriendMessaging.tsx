import React, { useState, useRef, useEffect } from 'react'
import { X, Send, Smile, Paperclip, Phone, Video } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface Message {
  id: string
  senderId: string
  senderName: string
  message: string
  timestamp: Date
  type: 'text' | 'image' | 'file'
}

interface FriendMessagingProps {
  friend: {
    id: string
    name: string
    university: string
    avatar: string
  }
  onClose: () => void
}

const FriendMessaging: React.FC<FriendMessagingProps> = ({ friend, onClose }) => {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      senderId: friend.id,
      senderName: friend.name,
      message: 'Hey! How are you doing?',
      timestamp: new Date(Date.now() - 3600000),
      type: 'text'
    },
    {
      id: '2',
      senderId: user?.id || 'current-user',
      senderName: user?.name || 'You',
      message: 'Hi! I\'m doing great, thanks for asking! How about you?',
      timestamp: new Date(Date.now() - 3000000),
      type: 'text'
    },
    {
      id: '3',
      senderId: friend.id,
      senderName: friend.name,
      message: 'I\'m good too! Are you going to the photography workshop this weekend?',
      timestamp: new Date(Date.now() - 1800000),
      type: 'text'
    },
    {
      id: '4',
      senderId: user?.id || 'current-user',
      senderName: user?.name || 'You',
      message: 'Yes! I\'m really excited about it. Will you be there too?',
      timestamp: new Date(Date.now() - 900000),
      type: 'text'
    },
    {
      id: '5',
      senderId: friend.id,
      senderName: friend.name,
      message: 'Definitely! Maybe we can grab coffee afterwards and discuss what we learned?',
      timestamp: new Date(Date.now() - 300000),
      type: 'text'
    }
  ])
  
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (newMessage.trim() && user) {
      const message: Message = {
        id: Date.now().toString(),
        senderId: user.id,
        senderName: user.name,
        message: newMessage.trim(),
        timestamp: new Date(),
        type: 'text'
      }
      setMessages([...messages, message])
      setNewMessage('')

      // Simulate friend typing and responding
      setIsTyping(true)
      setTimeout(() => {
        setIsTyping(false)
        const responses = [
          'That sounds great!',
          'I agree with you!',
          'Thanks for sharing that!',
          'Interesting point!',
          'Let me think about that.',
          'That\'s a good idea!',
          'I\'ll check that out.',
          'Thanks for letting me know!'
        ]
        const randomResponse = responses[Math.floor(Math.random() * responses.length)]
        
        const friendMessage: Message = {
          id: (Date.now() + 1).toString(),
          senderId: friend.id,
          senderName: friend.name,
          message: randomResponse,
          timestamp: new Date(),
          type: 'text'
        }
        setMessages(prev => [...prev, friendMessage])
      }, 2000)
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

  const formatDate = (timestamp: Date) => {
    const today = new Date()
    const messageDate = new Date(timestamp)
    
    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today'
    } else {
      return messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">{friend.avatar}</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{friend.name}</h2>
              <p className={`text-sm font-medium ${getUniversityColor(friend.university)}`}>
                {friend.university.split(' ').map(word => word[0]).join('')}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Phone className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Video className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => {
            const showDate = index === 0 || 
              formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp)
            
            return (
              <div key={message.id}>
                {showDate && (
                  <div className="text-center mb-4">
                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {formatDate(message.timestamp)}
                    </span>
                  </div>
                )}
                
                <div className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md ${message.senderId === user?.id ? 'order-2' : 'order-1'}`}>
                    <div className={`px-4 py-2 rounded-2xl ${
                      message.senderId === user?.id
                        ? 'bg-blue-600 text-white rounded-br-md'
                        : 'bg-gray-100 text-gray-900 rounded-bl-md'
                    }`}>
                      <p className="text-sm">{message.message}</p>
                    </div>
                    <p className={`text-xs text-gray-500 mt-1 ${
                      message.senderId === user?.id ? 'text-right' : 'text-left'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="max-w-xs lg:max-w-md">
                <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-2xl rounded-bl-md">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{friend.name} is typing...</p>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-end space-x-3">
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Paperclip className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="w-full p-3 border border-gray-300 rounded-2xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-32"
                rows={1}
                style={{ minHeight: '44px' }}
              />
            </div>
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Smile className="w-5 h-5" />
            </button>
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="p-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FriendMessaging
