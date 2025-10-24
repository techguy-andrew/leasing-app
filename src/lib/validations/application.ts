import { z } from 'zod'
import { PROPERTY_OPTIONS } from '@/lib/constants'

// Extract valid values from options
const propertyValues = PROPERTY_OPTIONS.map(opt => opt.value) as [string, ...string[]]

// Status validation schema - accepts any array of non-empty strings (statuses are now dynamic)
const statusSchema = z.array(z.string().min(1))
  .refine((statuses) => new Set(statuses).size === statuses.length, {
    message: 'Status values must be unique'
  })

// Date validation helper - validates MM/DD/YYYY format and actual date
const dateSchema = z.string()
  .regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Date must be in MM/DD/YYYY format')
  .refine((date) => {
    const [month, day, year] = date.split('/').map(Number)
    const dateObj = new Date(year, month - 1, day)
    return dateObj.getMonth() === month - 1 &&
           dateObj.getDate() === day &&
           dateObj.getFullYear() === year &&
           year >= 1900 && year <= 2100
  }, 'Invalid date')

// Optional date schema - allows empty string or valid date
const optionalDateSchema = z.preprocess(
  (val) => {
    if (val === '' || val === null || val === undefined) return ''
    return val
  },
  z.union([
    z.string().length(0),
    dateSchema
  ])
)

// Email validation - allow empty string, null, or valid email
const emailSchema = z.preprocess(
  (val) => {
    // Convert empty string, null, or undefined to null
    if (val === '' || val === null || val === undefined) return null
    // Convert to string and trim
    return typeof val === 'string' ? val.trim() : val
  },
  z.union([
    z.string().email('Invalid email format'),
    z.null()
  ])
)

// Phone validation - allow empty string, null, or valid phone format
const phoneSchema = z.preprocess(
  (val) => {
    // Convert empty string, null, or undefined to null
    if (val === '' || val === null || val === undefined) return null
    // Convert to string and trim
    return typeof val === 'string' ? val.trim() : val
  },
  z.union([
    z.string()
      .refine(
        (val) => /^[\d\s\-()]+$/.test(val),
        'Phone must contain only digits, spaces, dashes, or parentheses'
      )
      .refine(
        (val) => val.replace(/\D/g, '').length >= 10,
        'Phone must be at least 10 digits'
      ),
    z.null()
  ])
)

// Task schema for individual tasks
export const taskSchema = z.object({
  id: z.string(),
  description: z.string(),
  completed: z.boolean(),
  type: z.enum(['AGENT', 'APPLICANT']).optional()
})

// Tasks array schema
const tasksSchema = z.array(taskSchema).optional().default([])

// Optional string schema for payment fields
const optionalStringSchema = z.preprocess(
  (val) => val === '' || val === null || val === undefined ? '' : val,
  z.string().trim()
)

// Schema for creating a new application (POST)
// Only name and createdAt are required; all other fields are optional
export const applicationCreateSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  createdAt: dateSchema,
  moveInDate: optionalDateSchema,
  property: z.preprocess(
    (val) => val === '' || val === null || val === undefined ? '' : val,
    z.union([
      z.string().length(0),
      z.enum(propertyValues, {
        errorMap: () => ({ message: 'Please select a valid property' })
      })
    ])
  ),
  unitNumber: z.preprocess(
    (val) => val === '' || val === null || val === undefined ? '' : val,
    z.string().trim()
  ),
  email: emailSchema,
  phone: phoneSchema,
  status: statusSchema
    .optional()
    .default([]),
  tasks: tasksSchema,

  // Payment fields (all optional)
  deposit: optionalStringSchema.optional(),
  rent: optionalStringSchema.optional(),
  petFee: optionalStringSchema.optional(),
  petRent: optionalStringSchema.optional(),
  proratedRent: optionalStringSchema.optional(),
  concession: optionalStringSchema.optional(),
  rentersInsurance: optionalStringSchema.optional(),
  adminFee: optionalStringSchema.optional()
})

// Schema for updating an application (PUT)
// Only applicant and createdAt are required; all other fields are optional
export const applicationUpdateSchema = z.object({
  applicant: z.string().trim().min(1, 'Applicant name is required'),
  createdAt: dateSchema,
  moveInDate: optionalDateSchema,
  property: z.preprocess(
    (val) => val === '' || val === null || val === undefined ? '' : val,
    z.union([
      z.string().length(0),
      z.enum(propertyValues, {
        errorMap: () => ({ message: 'Please select a valid property' })
      })
    ])
  ),
  unitNumber: z.preprocess(
    (val) => val === '' || val === null || val === undefined ? '' : val,
    z.string().trim()
  ),
  email: emailSchema,
  phone: phoneSchema,
  status: statusSchema
    .optional(),
  tasks: tasksSchema,

  // Payment fields (all optional)
  deposit: optionalStringSchema.optional(),
  rent: optionalStringSchema.optional(),
  petFee: optionalStringSchema.optional(),
  petRent: optionalStringSchema.optional(),
  proratedRent: optionalStringSchema.optional(),
  concession: optionalStringSchema.optional(),
  rentersInsurance: optionalStringSchema.optional(),
  adminFee: optionalStringSchema.optional()
})

// Type exports for TypeScript
export type ApplicationCreateInput = z.infer<typeof applicationCreateSchema>
export type ApplicationUpdateInput = z.infer<typeof applicationUpdateSchema>
