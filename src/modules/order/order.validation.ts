import { z } from 'zod'

export const createOrderSchema = z.object({
  body: z.object({
    items: z
      .array(
        z.object({
          groceryItemId: z
            .number({ required_error: 'Grocery item ID is required' })
            .int('Grocery item ID must be a whole number')
            .positive('Grocery item ID must be positive'),

          quantity: z
            .number({ required_error: 'Quantity is required' })
            .int('Quantity must be a whole number')
            .min(1, 'Quantity must be at least 1'),
        })
      )
      .min(1, 'Order must contain at least one item'),
  }),
})

export const orderIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>['body']