import React, { useState, useRef, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Event } from '../types/Event'
import { ChatMessage } from '../types/User'
import { currentUser } from '../data/mockUser'
import { X, Send, Users, MessageCircle } from 'lucide-react'

interface GroupChatProps {
  event: Event
  onClose: () => void
}

/** Stable university keys for localization */
type UniversityKey =
  | 'snu'
  | 'yonsei'
  | 'korea'
  | 'hanyang'
  | 'ewha'
  | 'sogang'
  | 'hongik'
  | 'konkuk'
  | 'sungkyunkwan'

/** Map both EN and KR labels -> stable key (works for old saved strings) */
const UNI_FROM_LABEL: Record<string, UniversityKey> = {
  'Seoul National University': 'snu',
  '서울대학교': 'snu',
  'Yonsei University': 'yonsei',
  '연세대학교': 'yonsei',
  'Korea University': 'korea',
  '고려대학교': 'korea',
  'Hanyang University': 'hanyang',
  '한양대학교': 'hanyang',
  'Ewha Womans University': 'ewha',
  '이화여자대학교': 'ewha',
  'Sogang University': 'sogang',
  '서강대학교': 'sogang',
  'Hongik University': 'hongik',
  '홍익대학교': 'hongik',
  'Konkuk University': 'konkuk',
  '건국대학교': 'konkuk',
  'Sungkyunkwan University': 'sungkyunkwan',
  '성균관대학교': 'sungkyunkwan',
}

/** Badge text by locale */
const uniAbbrev = (key: UniversityKey, lang: string) =>
  (lang === 'ko'
    ? {
        snu: '서울대',
        yonsei: '연세대',
        korea: '고려대',
        hanyang: '한양대',
        ewha: '이대',
        sogang: '서강대',
        hongik: '홍익대',
        konkuk: '건국대',
        sungkyunkwan: '성균관대',
      }
    : {
        snu: 'SNU',
        yonsei: 'Yonsei',
        korea: 'KU',
        hanyang: 'HYU',
        ewha: 'Ewha',
        sogang: 'Sogang',
        hongik: 'Hongik',
        konkuk: 'Konkuk',
        sungkyunkwan: 'SKKU',
      })[key]

/** Colors by university key */
const uniColor = (key: UniversityKey) =>
  ({
    snu: 'text-blue-600',
    yonsei: 'text-red-600',
    korea: 'text-red-700',
    hanyang: 'text-blue-700',
    ewha: 'text-green-600',
    sogang: 'text-purple-600',
    hongik: 'text-gray-600',
    konkuk: 'text-emerald-700',
    sungkyunkwan: 'text-yellow-600',
  } as const)[key] || 'text-gray-600'

/** Try to find a stable translation key for the chat title so it reacts to language changes */
const KNOWN_TITLE_KEYS = [
  'dashboard.groupChats.koreanLanguage',
  'dashboard.groupChats.photographyWorkshop',
  'dashboard.groupChats.seoulFoodTour',
] as const

const GroupChat: React.FC<GroupChatProps> = ({ event, onClose }) => {
  const { t, i18n } = useTranslation()

  // Localize the chat title even if 'event.title' was captured in another language
  const titleKey = useMemo(() => {
    const tEn = i18n.getFixedT('en')
    const tKo = i18n.getFixedT('ko')
    for (const key of KNOWN_TITLE_KEYS) {
      if (event.title === tEn(key) || event.title === tKo(key)) return key
    }
    return null
  }, [event.title, i18n])

  // Mock messages (kept as-is); we’ll localize university display via reverse map
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      userId: 'user-2',
      userName: 'Sarah Park',
      userUniversity: 'Yonsei University',
      message: 'Looking forward to this event! Anyone else from Yonsei coming?',
      timestamp: new Date(Date.now() - 3600000),
      type: 'text',
    },
    {
      id: '2',
      userId: 'user-3',
      userName: 'Mike Chen',
      userUniversity: 'Korea University',
      message: "Yes! I'll be there. Should we meet up beforehand?",
      timestamp: new Date(Date.now() - 1800000),
      type: 'text',
    },
    {
      id: '3',
      userId: 'system',
      userName: 'System',
      userUniversity: '',
      message: 'Emma Lee joined the chat',
      timestamp: new Date(Date.now() - 900000),
      type: 'system',
    },
    {
      id: '4',
      userId: 'user-4',
      userName: 'Emma Lee',
      userUniversity: 'Seoul National University',
      message: 'Hi everyone! Excited to meet you all at the event 🎉',
      timestamp: new Date(Date.now() - 600000),
      type: 'text',
    },
  ])

  const [newMessage, setNewMessage] = useState('')
  const [showParticipants, setShowParticipants] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Bilingual participant mock data
  const participants = [
    {
      id: 'user-1',
      nameEn: 'Alex Kim',
      nameKo: '김알렉스',
      universityKey: 'snu' as UniversityKey,
      hobbyEn: 'Photography',
      hobbyKo: '사진',
      languagesEn: 'Korean, English',
      languagesKo: '한국어, 영어',
    },
    {
      id: 'user-2',
      nameEn: 'Sarah Park',
      nameKo: '박사라',
      universityKey: 'yonsei' as UniversityKey,
      hobbyEn: 'Music',
      hobbyKo: '음악',
      languagesEn: 'Korean, Japanese',
      languagesKo: '한국어, 일본어',
    },
    {
      id: 'user-3',
      nameEn: 'Mike Chen',
      nameKo: '마이크 천',
      universityKey: 'korea' as UniversityKey,
      hobbyEn: 'Sports',
      hobbyKo: '스포츠',
      languagesEn: 'English, Chinese',
      languagesKo: '영어, 중국어',
    },
    {
      id: 'user-4',
      nameEn: 'Emma Lee',
      nameKo: '이엠마',
      universityKey: 'snu' as UniversityKey,
      hobbyEn: 'Art',
      hobbyKo: '예술',
      languagesEn: 'Korean, English',
      languagesKo: '한국어, 영어',
    },
    {
      id: 'user-5',
      nameEn: 'David Kim',
      nameKo: '김데이비드',
      universityKey: 'hanyang' as UniversityKey,
      hobbyEn: 'Technology',
      hobbyKo: '기술',
      languagesEn: 'Korean, English',
      languagesKo: '한국어, 영어',
    },
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    // Prefer currentUser.universityKey if present; else keep existing label
    const key = (currentUser as any).universityKey as UniversityKey | undefined
    const localizedUni = key ? t(`universities.${key}`) : currentUser.university

    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userUniversity: localizedUni, // store a label (works with reverse map above)
      message: newMessage.trim(),
      timestamp: new Date(),
      type: 'text',
    }
    setMessages((prev) => [...prev, message])
    setNewMessage('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (timestamp: Date) =>
    timestamp.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })

  // Resolve a stable key from any label, then localize + colorize
  const resolveUniKey = (label: string): UniversityKey | undefined =>
    UNI_FROM_LABEL[label]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <MessageCircle className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {titleKey ? t(titleKey) : event.title}
              </h2>
              <p className="text-sm text-gray-500">
                {participants.length} {t('chat.members')}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowParticipants((s) => !s)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label={t('chat.members')}
            >
              <Users className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close"
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
              {messages.map((message) => {
                const key = resolveUniKey(message.userUniversity)
                const badge =
                  key ? uniAbbrev(key, i18n.language) : message.userUniversity
                const colorClass = key ? uniColor(key) : 'text-gray-600'

                return (
                  <div key={message.id}>
                    {message.type === 'system' ? (
                      <div className="text-center">
                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                          {message.message}
                        </span>
                      </div>
                    ) : (
                      <div
                        className={`flex ${
                          message.userId === currentUser.id
                            ? 'justify-end'
                            : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md ${
                            message.userId === currentUser.id
                              ? 'order-2'
                              : 'order-1'
                          }`}
                        >
                          {message.userId !== currentUser.id && (
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-sm font-medium text-gray-900">
                                {message.userName}
                              </span>
                              <span
                                className={`text-xs font-medium ${colorClass}`}
                                title={
                                  key ? t(`universities.${key}`) : undefined
                                }
                              >
                                {badge}
                              </span>
                            </div>
                          )}
                          <div
                            className={`px-4 py-2 rounded-lg ${
                              message.userId === currentUser.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.message}</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
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
                    placeholder={t('chat.messagePlaceholder')}
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  aria-label={t('chat.send')}
                  title={t('chat.send')}
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
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('chat.members')}
                </h3>
                <p className="text-sm text-gray-500">
                  {participants.length} {t('chat.members')}
                </p>
              </div>
              <div className="overflow-y-auto">
                {participants.map((p) => {
                  const name =
                    i18n.language === 'ko' ? p.nameKo || p.nameEn : p.nameEn
                  const hobby =
                    i18n.language === 'ko'
                      ? p.hobbyKo || p.hobbyEn
                      : p.hobbyEn
                  const langs =
                    i18n.language === 'ko'
                      ? p.languagesKo || p.languagesEn
                      : p.languagesEn
                  const uniLabel = t(`universities.${p.universityKey}`)
                  const colorClass = uniColor(p.universityKey)

                  return (
                    <div
                      key={p.id}
                      className="p-4 border-b border-gray-200 hover:bg-white transition-colors"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {name
                              .split(' ')
                              .map((n: string) => n[0])
                              .join('')}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {name}
                          </p>
                          <p
                            className={`text-xs font-medium ${colorClass} truncate`}
                            title={uniLabel}
                          >
                            {uniLabel}
                          </p>
                          <div className="mt-1 space-y-1">
                            <div className="flex items-center space-x-1">
                              <span className="text-xs text-gray-500">
                                {t('dashboard.profile.hobby')}:
                              </span>
                              <span className="text-xs text-gray-700">
                                {hobby}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span className="text-xs text-gray-500">
                                {t('dashboard.profile.languages')}:
                              </span>
                              <span className="text-xs text-gray-700">
                                {langs}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default GroupChat
