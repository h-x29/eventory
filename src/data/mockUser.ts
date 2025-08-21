import { User } from '../types/User'

export const currentUser: User = {
  id: 'current-user',
  name: 'Alex Kim',
  email: 'alex.kim@snu.ac.kr',
  age: 22,
  university: 'Seoul National University',
  hobby: 'Photography',
  mbti: 'ENFP',
  language: 'Korean, English',
  joinedDate: new Date().toISOString(),
  eventsAttended: ['1', '3', '5'],
  eventsInterested: ['2', '4', '6'],
  friendsCount: 24,
  groupChatsJoined: 6
}
