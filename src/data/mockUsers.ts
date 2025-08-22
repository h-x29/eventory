export type UniversityKey =
  | 'snu' | 'yonsei' | 'korea' | 'hanyang'
  | 'ewha' | 'sungkyunkwan' | 'hongik' | 'sogang'

export interface User {
  id: string
  name: string
  email: string
  password: string
  university: string
  universityKey?: UniversityKey
  age: number
  hobby: string
  mbti: string
  languages: string
  eventsAttended: string[]
  friends: string[]
  avatar: string
}

export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'huimin',
    email: 'huimin@yonsei.ac.kr',
    password: 'password123',
    university: 'Yonsei University',
    universityKey: 'yonsei',
    age: 21,
    hobby: 'Photography, Reading, Gaming',
    mbti: 'ENFP',
    languages: 'Korean, English',
    eventsAttended: [],
    friends: ['user-2', 'user-3', 'user-4'],
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 'user-2',
    name: 'Sarah Kim',
    email: 'sarah@snu.ac.kr',
    password: 'password123',
    university: 'Seoul National University',
    universityKey: 'snu',
    age: 22,
    hobby: 'Music, Dancing, Cooking',
    mbti: 'ISFJ',
    languages: 'Korean, English, Japanese',
    eventsAttended: [],
    friends: ['user-1', 'user-3'],
    avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 'user-3',
    name: 'Alex Park',
    email: 'alex@korea.ac.kr',
    password: 'password123',
    university: 'Korea University',
    universityKey: 'korea',
    age: 23,
    hobby: 'Sports, Fitness, Travel',
    mbti: 'ESTP',
    languages: 'Korean, English',
    eventsAttended: [],
    friends: ['user-1', 'user-2', 'user-4'],
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 'user-4',
    name: 'Emma Lee',
    email: 'emma@ewha.ac.kr',
    password: 'password123',
    university: 'Ewha Womans University',
    universityKey: 'ewha',
    age: 20,
    hobby: 'Art, Design, Photography',
    mbti: 'INFP',
    languages: 'Korean, English, Japanese',
    eventsAttended: [],
    friends: ['user-1', 'user-3'],
    avatar: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 'user-5',
    name: 'David Choi',
    email: 'david@hanyang.ac.kr',
    password: 'password123',
    university: 'Hanyang University',
    universityKey: 'hanyang',
    age: 24,
    hobby: 'Gaming, Technology, Movies',
    mbti: 'INTP',
    languages: 'Korean, English',
    eventsAttended: [],
    friends: [],
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400'
  }
]
