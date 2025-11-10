import { z } from 'zod'

// Schema for creating a new unit (POST)
export const unitCreateSchema = z.object({
  propertyId: z.number().int().positive('Property ID is required'),
  unitNumber: z.string().trim().min(1, 'Unit number is required'),
  street: z.string().trim().optional().or(z.literal('')),
  city: z.string().trim().optional().or(z.literal('')),
  state: z.string().trim().optional().or(z.literal('')),
  zip: z.string().trim().optional().or(z.literal('')),
  bedrooms: z.number().int().min(0).optional().or(z.literal('')),
  bathrooms: z.number().min(0).optional().or(z.literal('')),
  squareFeet: z.number().int().min(0).optional().or(z.literal('')),
  floor: z.number().int().optional().or(z.literal('')),
  baseRent: z.string().trim().optional().or(z.literal('')),
  status: z.string().trim().min(1, 'Status is required').default('Vacant'),
  availableOn: z.string().optional().or(z.date().optional()).or(z.literal(''))
})

// Schema for updating a unit (PUT)
export const unitUpdateSchema = z.object({
  propertyId: z.number().int().positive('Property ID is required'),
  unitNumber: z.string().trim().min(1, 'Unit number is required'),
  street: z.string().trim().optional().or(z.literal('')),
  city: z.string().trim().optional().or(z.literal('')),
  state: z.string().trim().optional().or(z.literal('')),
  zip: z.string().trim().optional().or(z.literal('')),
  bedrooms: z.number().int().min(0).optional().or(z.literal('')),
  bathrooms: z.number().min(0).optional().or(z.literal('')),
  squareFeet: z.number().int().min(0).optional().or(z.literal('')),
  floor: z.number().int().optional().or(z.literal('')),
  baseRent: z.string().trim().optional().or(z.literal('')),
  status: z.string().trim().min(1, 'Status is required'),
  availableOn: z.string().optional().or(z.date().optional()).or(z.literal(''))
})

// Type exports for TypeScript
export type UnitCreateInput = z.infer<typeof unitCreateSchema>
export type UnitUpdateInput = z.infer<typeof unitUpdateSchema>
