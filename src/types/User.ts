export interface User {
  id: string
  name: string
  email: string
  age: number
  university: string
  hobby: string
  mbti: string
  language: string
  avatar?: string
  joinedDate: string
  eventsAttended: string[]
  eventsInterested: string[]
  friendsCount: number
  groupChatsJoined: number
}

export interface ChatMessage {
  id: string
  userId: string
  userName: string
  userUniversity: string
  message: string
  timestamp: Date
  type: 'text' | 'system'
}
