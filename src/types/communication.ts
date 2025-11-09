export type CommunicationType = 'TEXT' | 'EMAIL'
export type CommunicationDirection = 'SENT' | 'RECEIVED'

export interface Communication {
  id: string
  personId: number
  type: CommunicationType
  content: string
  direction: CommunicationDirection
  senderName: string
  senderImageUrl: string | null
  createdAt: Date
}
