import React from 'react'
import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation()

  const toggleLanguage = () => {
    const newLanguage = i18n.language === 'en' ? 'ko' : 'en'
    i18n.changeLanguage(newLanguage)
  }

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-sm font-medium text-gray-700"
      title={i18n.language === 'en' ? 'Switch to Korean' : '영어로 전환'}
    >
      <Globe className="w-4 h-4" />
      <span className="hidden sm:inline">
        {i18n.language === 'en' ? '한국어' : 'English'}
      </span>
      <span className="sm:hidden">
        {i18n.language === 'en' ? 'KO' : 'EN'}
      </span>
    </button>
  )
}

export default LanguageSwitcher
