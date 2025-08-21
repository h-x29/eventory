import React, { useState } from 'react'
import { X, Send, Users, Copy, Check } from 'lucide-react'
import { Event } from '../types/Event'

interface InviteModalProps {
  isOpen: boolean
  onClose: () => void
  event: Event
}

const InviteModal: React.FC<InviteModalProps> = ({ isOpen, onClose, event }) => {
  const [inviteEmails, setInviteEmails] = useState('')
  const [personalMessage, setPersonalMessage] = useState('')
  const [copied, setCopied] = useState(false)

  const eventUrl = `${window.location.origin}/event/${event.id}`

  const handleSendInvites = () => {
    const emails = inviteEmails.split(',').map(email => email.trim()).filter(email => email)
    
    if (emails.length === 0) return

    // Here you would typically send the invites via API
    console.log('Sending invites to:', emails)
    console.log('Personal message:', personalMessage)
    
    // Show success message and close modal
    alert(`Invitations sent to ${emails.length} people!`)
    onClose()
    setInviteEmails('')
    setPersonalMessage('')
  }

  const copyEventLink = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Invite People</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Event Preview */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <img
                src={event.image}
                alt={event.title}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{event.title}</h3>
                <p className="text-sm text-gray-600">{event.date} at {event.time}</p>
                <p className="text-sm text-gray-600">{event.location}</p>
              </div>
            </div>
          </div>

          {/* Share Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Share Event Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={eventUrl}
                readOnly
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-sm"
              />
              <button
                onClick={copyEventLink}
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            {copied && <p className="text-green-600 text-sm mt-1">Link copied to clipboard!</p>}
          </div>

          {/* Email Invites */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Send className="w-4 h-4 inline mr-1" />
              Send Email Invitations
            </label>
            <textarea
              value={inviteEmails}
              onChange={(e) => setInviteEmails(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter email addresses separated by commas&#10;e.g., friend1@snu.ac.kr, friend2@yonsei.ac.kr"
            />
          </div>

          {/* Personal Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Personal Message (Optional)
            </label>
            <textarea
              value={personalMessage}
              onChange={(e) => setPersonalMessage(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add a personal message to your invitation..."
            />
          </div>

          {/* Current Attendees */}
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900">Current Status</span>
            </div>
            <p className="text-sm text-blue-800">
              {event.attendees} of {event.maxAttendees} spots filled
            </p>
            <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${(event.attendees / event.maxAttendees) * 100}%` }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleSendInvites}
              disabled={!inviteEmails.trim()}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Send Invites
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InviteModal
