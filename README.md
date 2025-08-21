# Seoul Student Events - Internationalization Guide

## 🌍 Translation System

This project uses **react-i18next** for internationalization with support for English and Korean languages.

## 📁 Translation Files Location

Translation files are located in:
```
src/i18n/locales/
├── en.json (English translations)
└── ko.json (Korean translations)
```

## 🔧 How to Add/Edit Translations

### 1. Adding New Translation Keys

To add a new translation, add the key-value pair to both language files:

**English (en.json):**
```json
{
  "section": {
    "newKey": "English text here"
  }
}
```

**Korean (ko.json):**
```json
{
  "section": {
    "newKey": "한국어 텍스트"
  }
}
```

### 2. Using Translations in Components

Import and use the translation hook:
```tsx
import { useTranslation } from 'react-i18next'

const MyComponent = () => {
  const { t } = useTranslation()
  
  return <div>{t('section.newKey')}</div>
}
```

### 3. Translation Structure

The translation files are organized by sections:

- **nav**: Navigation items
- **landing**: Landing page content
- **auth**: Authentication forms
- **dashboard**: Dashboard content
- **events**: Event-related text
- **newsletter**: Newsletter page
- **reviews**: Rating and review system
- **chat**: Chat functionality
- **profile**: User profile
- **common**: Reusable common text
- **time**: Time-related text
- **categories**: Event categories
- **universities**: University names

### 4. Language Switching

Users can switch languages using the language switcher component located in the header. The selected language is automatically saved to localStorage.

### 5. Fallback Language

English is set as the fallback language. If a translation key is missing in Korean, it will display the English version.

## 🎯 Best Practices

1. **Consistent Naming**: Use descriptive, hierarchical keys (e.g., `events.details.location`)
2. **No Hardcoded Text**: All user-facing text should use translation keys
3. **Pluralization**: Handle singular/plural forms appropriately for each language
4. **Context**: Provide context in key names to avoid ambiguity
5. **Testing**: Test both languages to ensure proper display

## 🔄 Adding New Languages

To add a new language:

1. Create a new JSON file in `src/i18n/locales/` (e.g., `ja.json`)
2. Add the language to the resources in `src/i18n/index.ts`
3. Update the language switcher component to include the new language
4. Translate all keys from the English file

## 📝 Translation Guidelines

- **Korean**: Use formal language appropriate for university students
- **English**: Use clear, concise language
- **Consistency**: Maintain consistent terminology across the application
- **Cultural Adaptation**: Adapt content to be culturally appropriate for each language

## 🚀 Development Workflow

1. Add English text first in `en.json`
2. Add corresponding Korean translation in `ko.json`
3. Use the translation key in your component with `t('your.key')`
4. Test both languages to ensure proper functionality
