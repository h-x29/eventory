import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Calendar, Eye, EyeOff, Globe } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

type UniversityOption = {
  key: 'snu'|'yonsei'|'korea'|'hanyang'|'ewha'|'sungkyunkwan'|'hongik'|'sogang'
  en: string
  ko: string
}

const universityOptions: UniversityOption[] = [
  { key: 'snu', en: 'Seoul National University', ko: '서울대학교' },
  { key: 'yonsei', en: 'Yonsei University', ko: '연세대학교' },
  { key: 'korea', en: 'Korea University', ko: '고려대학교' },
  { key: 'hanyang', en: 'Hanyang University', ko: '한양대학교' },
  { key: 'ewha', en: 'Ewha Womans University', ko: '이화여자대학교' },
  { key: 'sungkyunkwan', en: 'Sungkyunkwan University', ko: '성균관대학교' },
  { key: 'hongik', en: 'Hongik University', ko: '홍익대학교' },
  { key: 'sogang', en: 'Sogang University', ko: '서강대학교' },
]

const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    universityKey: '', // ✅ store the stable key
    hobby: '',
    mbti: '',
    language: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { signup } = useAuth()
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  const mbtiTypes = [
    'INTJ', 'INTP', 'ENTJ', 'ENTP',
    'INFJ', 'INFP', 'ENFJ', 'ENFP',
    'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
    'ISTP', 'ISFP', 'ESTP', 'ESFP'
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // find display label for the selected key (so backend has both)
      const uni = universityOptions.find(u => u.key === formData.universityKey)
      const displayUniversity = uni ? (i18n.language === 'ko' ? uni.ko : uni.en) : ''

      const success = await signup({
        ...formData,
        age: parseInt(formData.age, 10),
        universityKey: formData.universityKey,
        university: displayUniversity, // optional convenience display label
        password: formData.password
      })
      
      if (success) {
        navigate('/newsletter')
      } else {
        setError(t('common.error') || 'Signup failed. Please try again.')
      }
    } catch {
      setError(t('common.error') || 'Signup failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleLanguage = () => {
    const newLanguage = i18n.language === 'en' ? 'ko' : 'en'
    i18n.changeLanguage(newLanguage)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <Calendar className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Seoul Student Events</span>
          </Link>
          
          {/* Language Toggle */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <Globe className="w-4 h-4 text-gray-500" />
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-sm font-medium text-gray-700"
            >
              {i18n.language === 'en' ? '한국어' : 'English'}
            </button>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('auth.signup.title')}</h1>
          <p className="text-gray-600">{t('auth.signup.subtitle')}</p>
        </div>

        {/* Signup Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.fields.name')}
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('auth.placeholders.name')}
                  required
                />
              </div>

              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.fields.age')}
                </label>
                <input
                  id="age"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('auth.placeholders.age')}
                  min="18"
                  max="35"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.fields.email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('auth.placeholders.email')}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.fields.password')}
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                  placeholder={t('auth.placeholders.password')}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="university" className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.fields.university')}
              </label>
              <select
                id="university"
                name="universityKey"
                value={formData.universityKey}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">{t('auth.placeholders.university')}</option>
                {universityOptions.map((u) => (
                  <option key={u.key} value={u.key}>
                    {i18n.language === 'ko' ? u.ko : u.en}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="hobby" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.fields.hobby')}
                </label>
                <input
                  id="hobby"
                  name="hobby"
                  type="text"
                  value={formData.hobby}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('auth.placeholders.hobby')}
                  required
                />
              </div>

              <div>
                <label htmlFor="mbti" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.fields.mbti')}
                </label>
                <select
                  id="mbti"
                  name="mbti"
                  value={formData.mbti}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">{t('auth.placeholders.mbti')}</option>
                  {mbtiTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.fields.language')}
              </label>
              <input
                id="language"
                name="language"
                type="text"
                value={formData.language}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('auth.placeholders.language')}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isLoading ? t('common.loading') : t('auth.signup.button')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              {t('auth.login.link')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignupPage
