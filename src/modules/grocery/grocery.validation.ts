import { z } from 'zod'

export const createGrocerySchema = z.object({
  body: z.object({
    name: z.string({ error: 'Name is required' })
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must not exceed 100 characters'),

    description: z.string()
      .max(500, 'Description must not exceed 500 characters')
      .optional(),

    price: z.number({ error: 'Price is required' })
      .positive('Price must be greater than 0')
      .multipleOf(0.01, 'Price can have at most 2 decimal places'),

    inventory: z.number({ error: 'Inventory is required' })
      .int('Inventory must be a whole number')
      .min(0, 'Inventory cannot be negative'),
  }),
})

export const updateGrocerySchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
  body: z.object({
    name: z.string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must not exceed 100 characters')
      .optional(),

    description: z.string()
      .max(500, 'Description must not exceed 500 characters')
      .optional(),

    price: z.number()
      .positive('Price must be greater than 0')
      .multipleOf(0.01, 'Price can have at most 2 decimal places')
      .optional(),

    isActive: z.boolean().optional(),
  }),
})

export const updateInventorySchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
  body: z.object({
    inventory: z.number({ error: 'Inventory is required' })
      .int('Inventory must be a whole number')
      .min(0, 'Inventory cannot be negative'),
  }),
})

export const groceryIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
})

export type CreateGroceryInput = z.infer<typeof createGrocerySchema>['body']
export type UpdateGroceryInput = z.infer<typeof updateGrocerySchema>['body']
export type UpdateInventoryInput = z.infer<typeof updateInventorySchema>['body']