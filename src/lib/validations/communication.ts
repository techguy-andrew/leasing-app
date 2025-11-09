import { z } from 'zod'

export const createCommunicationSchema = z.object({
  type: z.enum(['TEXT', 'EMAIL']),
  content: z.string().min(1, 'Content is required').trim()
})

export type CreateCommunicationInput = z.infer<typeof createCommunicationSchema>
