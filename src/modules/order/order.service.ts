import prisma from '../../lib/prisma'
import { AppError } from '../../middlewares/error.middleware'
import { CreateOrderInput } from './order.validation'
import Decimal from 'decimal.js'

export class OrderService {

  // ─── Create Order with Transaction ───────────────
  async createOrder(userId: number, data: CreateOrderInput) {

    // Extract all grocery IDs from request
    const groceryIds = data.items.map((item) => item.groceryItemId)

    // Check for duplicate item IDs in request
    const uniqueIds = new Set(groceryIds)
    if (uniqueIds.size !== groceryIds.length) {
      throw new AppError(
        'Duplicate items in order. Use quantity instead.',
        400
      )
    }

    // ─── Begin Transaction ──────────────────────────
    const order = await prisma.$transaction(async (tx) => {

      // Lock and fetch all requested items
      // Raw query needed for SELECT FOR UPDATE in Prisma
        type GroceryRow = {
        id: number
        name: string
        price: Decimal
        inventory: number
        isActive: boolean
        }

        const groceryItems = await tx.$queryRaw<GroceryRow[]>`
        SELECT id, name, price, inventory, "isActive"
        FROM grocery_items
        WHERE id = ANY(${groceryIds}::int[])
        FOR UPDATE
        `

      // Validate all items exist
      if (groceryItems.length !== groceryIds.length) {
        const foundIds = groceryItems.map((i) => i.id)
        const missingIds = groceryIds.filter((id) => !foundIds.includes(id))
        throw new AppError(
          `Grocery items not found: ${missingIds.join(', ')}`,
          404
        )
      }

      // Validate all items are active and have stock
      const errors: string[] = []

      for (const requestedItem of data.items) {
        const groceryItem = groceryItems.find(
          (g) => g.id === requestedItem.groceryItemId
        )!

        if (!groceryItem.isActive) {
          errors.push(`"${groceryItem.name}" is no longer available`)
          continue
        }

        if (groceryItem.inventory < requestedItem.quantity) {
          errors.push(
            `"${groceryItem.name}" has insufficient stock. ` +
            `Requested: ${requestedItem.quantity}, Available: ${groceryItem.inventory}`
          )
        }
      }

      // If ANY error exists → ROLLBACK
      if (errors.length > 0) {
        throw new AppError(errors.join(' | '), 400)
      }

      // Calculate total amount
      let totalAmount = new Decimal(0)

      for (const requestedItem of data.items) {
        const groceryItem = groceryItems.find(
          (g) => g.id === requestedItem.groceryItemId
        )!

        const itemTotal = new Decimal(groceryItem.price).mul(
          requestedItem.quantity
        )
        totalAmount = totalAmount.add(itemTotal)
      }

      // Deduct inventory for each item
      for (const requestedItem of data.items) {
        const groceryItem = groceryItems.find(
          (g) => g.id === requestedItem.groceryItemId
        )!

        await tx.groceryItem.update({
          where: { id: groceryItem.id },
          data: {
            inventory: {
              decrement: requestedItem.quantity,
            },
          },
        })
      }

      // Create order record
      const newOrder = await tx.order.create({
        data: {
          userId,
          totalAmount,
          orderItems: {
            create: data.items.map((requestedItem) => {
              const groceryItem = groceryItems.find(
                (g) => g.id === requestedItem.groceryItemId
              )!
              return {
                groceryItemId: requestedItem.groceryItemId,
                quantity: requestedItem.quantity,
                unitPrice: groceryItem.price,
              }
            }),
          },
        },
        include: {
          orderItems: {
            include: {
              groceryItem: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                },
              },
            },
          },
        },
      })

      return newOrder
    })
    // ─── End Transaction ────────────────────────────

    return order
  }

  // ─── Get All Orders for User ──────────────────────
  async getUserOrders(userId: number) {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: {
            groceryItem: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return orders
  }

  // ─── Get Single Order ─────────────────────────────
  async getUserOrderById(userId: number, orderId: number) {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId, // ensures user can only see their own orders
      },
      include: {
        orderItems: {
          include: {
            groceryItem: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
      },
    })

    if (!order) {
      throw new AppError('Order not found', 404)
    }

    return order
  }
}

export const orderService = new OrderService()