import { z } from 'zod'

// Schema for creating a new person (POST)
// firstName and lastName are required, other fields optional
export const personCreateSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().trim().optional().or(z.literal('')),
  status: z.string().trim().min(1, 'Status is required').default('Prospect')
})

// Schema for updating a person (PUT)
// All fields are required
export const personUpdateSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().trim().optional().or(z.literal('')),
  status: z.string().trim().min(1, 'Status is required')
})

// Type exports for TypeScript
export type PersonCreateInput = z.infer<typeof personCreateSchema>
export type PersonUpdateInput = z.infer<typeof personUpdateSchema>
