export interface EventRating {
  userId: string
  rating: number
  comment: string
  date: string
}

export interface Event {
  id: string
  title: string
  titleEn: string
  description: string
  descriptionEn: string
  category: 'academic' | 'cultural' | 'club' | 'language' | 'sports' | 'social'
  date: string
  time: string
  location: string
  locationEn: string
  address: string
  coordinates: {
    lat: number
    lng: number
  }
  image: string
  organizer: string
  organizerEn: string
  attendees: number
  maxAttendees: number
  price: number
  tags: string[]
  tagsEn: string[]
  isAttending?: boolean
  ratings: EventRating[]
  interestedUsers: string[]
}
