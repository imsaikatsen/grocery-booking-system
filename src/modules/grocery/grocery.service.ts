import prisma from '../../lib/prisma'
import { AppError } from '../../middlewares/error.middleware'
import {
  CreateGroceryInput,
  UpdateGroceryInput,
  UpdateInventoryInput,
} from './grocery.validation'

export class GroceryService {

  // ─── Admin: Create ────────────────────────────────
  async createItem(data: CreateGroceryInput) {
    // Check duplicate name
    const existing = await prisma.groceryItem.findFirst({
      where: {
        name: {
          equals: data.name,
          mode: 'insensitive', // case-insensitive check
        },
      },
    })

    if (existing) {
      throw new AppError('Grocery item with this name already exists', 409)
    }

    const item = await prisma.groceryItem.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        inventory: data.inventory,
      },
    })

    return item
  }

  // ─── Admin: Get All ───────────────────────────────
  async getAllItems() {
    const items = await prisma.groceryItem.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return items
  }

  // ─── Admin: Update ────────────────────────────────
  async updateItem(id: number, data: UpdateGroceryInput) {
    await this.findItemOrFail(id)

    const updated = await prisma.groceryItem.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    })

    return updated
  }

  // ─── Admin: Delete ────────────────────────────────
  async deleteItem(id: number) {
    await this.findItemOrFail(id)
    await prisma.groceryItem.update({
      where: { id },
      data: { isActive: false },
    })

    return { message: 'Grocery item removed successfully' }
  }

  // ─── Admin: Update Inventory ──────────────────────
  async updateInventory(id: number, data: UpdateInventoryInput) {
    await this.findItemOrFail(id)

    const updated = await prisma.groceryItem.update({
      where: { id },
      data: { inventory: data.inventory },
    })

    return updated
  }

  // ─── User: Get Available Items ────────────────────
  async getAvailableItems() {
    const items = await prisma.groceryItem.findMany({
      where: {
        isActive: true,
        inventory: { gt: 0 },
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        inventory: true,
      },
      orderBy: { name: 'asc' },
    })

    return items
  }

  // ─── Shared Helper ────────────────────────────────
  private async findItemOrFail(id: number) {
    const item = await prisma.groceryItem.findUnique({
      where: { id },
    })

    if (!item) {
      throw new AppError('Grocery item not found', 404)
    }

    return item
  }
}

export const groceryService = new GroceryService()