import { z } from 'zod'
import { STATUS_OPTIONS, PROPERTY_OPTIONS } from '@/lib/constants'

// Extract valid values from options
const statusValues = STATUS_OPTIONS.map(opt => opt.value) as [string, ...string[]]
const propertyValues = PROPERTY_OPTIONS.map(opt => opt.value) as [string, ...string[]]

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
  completed: z.boolean()
})

// Tasks array schema
const tasksSchema = z.array(taskSchema).optional().default([])

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
  status: z.enum(statusValues).optional().default('New'),
  tasks: tasksSchema
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
  status: z.enum(statusValues).optional(),
  tasks: tasksSchema
})

// Type exports for TypeScript
export type ApplicationCreateInput = z.infer<typeof applicationCreateSchema>
export type ApplicationUpdateInput = z.infer<typeof applicationUpdateSchema>
