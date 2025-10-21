import { z } from 'zod'

// Schema for creating a new property (POST)
// All fields are required
export const propertyCreateSchema = z.object({
  name: z.string().trim().min(1, 'Property name is required'),
  address: z.string().trim().min(1, 'Property address is required'),
  energyProvider: z.string().trim().min(1, 'Energy provider is required')
})

// Schema for updating a property (PUT)
// All fields are required
export const propertyUpdateSchema = z.object({
  name: z.string().trim().min(1, 'Property name is required'),
  address: z.string().trim().min(1, 'Property address is required'),
  energyProvider: z.string().trim().min(1, 'Energy provider is required')
})

// Type exports for TypeScript
export type PropertyCreateInput = z.infer<typeof propertyCreateSchema>
export type PropertyUpdateInput = z.infer<typeof propertyUpdateSchema>
