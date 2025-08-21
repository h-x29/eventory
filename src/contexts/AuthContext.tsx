import React, { createContext, useContext, useState, useEffect } from 'react'
import { User } from '../types/User'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  signup: (userData: Omit<User, 'id'> & { password: string }) => Promise<boolean>
  logout: () => void
  isLoading: boolean
  updateUser: (updates: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('currentUser')
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        console.log('Loading stored user:', parsedUser)
        setUser(parsedUser)
      } catch (error) {
        console.error('Error parsing stored user:', error)
        localStorage.removeItem('currentUser')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    
    try {
      // Mock authentication - in real app, this would be an API call
      const mockUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
      const foundUser = mockUsers.find((u: any) => u.email === email && u.password === password)
      
      if (foundUser) {
        const { password: _, ...userWithoutPassword } = foundUser
        console.log('User logged in:', userWithoutPassword)
        setUser(userWithoutPassword)
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword))
        setIsLoading(false)
        return true
      }
      
      setIsLoading(false)
      return false
    } catch (error) {
      console.error('Login error:', error)
      setIsLoading(false)
      return false
    }
  }

  const signup = async (userData: Omit<User, 'id'> & { password: string }): Promise<boolean> => {
    setIsLoading(true)
    
    try {
      // Check if user already exists
      const mockUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
      const existingUser = mockUsers.find((u: any) => u.email === userData.email)
      
      if (existingUser) {
        setIsLoading(false)
        return false
      }

      // Mock user creation
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: userData.name,
        email: userData.email,
        age: userData.age,
        university: userData.university,
        hobby: userData.hobby,
        mbti: userData.mbti,
        language: userData.language,
        avatar: userData.avatar,
        joinedDate: new Date().toISOString(),
        eventsAttended: [],
        eventsInterested: [],
        friendsCount: 0,
        groupChatsJoined: 0
      }

      // Store user with password for login
      mockUsers.push({ ...newUser, password: userData.password })
      localStorage.setItem('registeredUsers', JSON.stringify(mockUsers))

      // Set current user (without password)
      console.log('User signed up:', newUser)
      setUser(newUser)
      localStorage.setItem('currentUser', JSON.stringify(newUser))
      
      setIsLoading(false)
      return true
    } catch (error) {
      console.error('Signup error:', error)
      setIsLoading(false)
      return false
    }
  }

  const updateUser = (updates: Partial<User>) => {
    if (!user) return
    
    const updatedUser = { ...user, ...updates }
    setUser(updatedUser)
    localStorage.setItem('currentUser', JSON.stringify(updatedUser))
    
    // Also update in registered users
    const mockUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
    const updatedUsers = mockUsers.map((u: any) => 
      u.id === user.id ? { ...u, ...updates } : u
    )
    localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers))
    
    console.log('User updated:', updatedUser)
  }

  const logout = () => {
    console.log('User logged out')
    setUser(null)
    localStorage.removeItem('currentUser')
    // Clear user-specific data
    if (user) {
      localStorage.removeItem(`joinedEvents_${user.id}`)
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}
