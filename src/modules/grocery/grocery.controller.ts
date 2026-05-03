import { Request, Response, NextFunction } from 'express'
import { groceryService } from './grocery.service'
import {
  CreateGroceryInput,
  UpdateGroceryInput,
  UpdateInventoryInput,
} from './grocery.validation'

export class GroceryController {

  // ─── Admin: Create ────────────────────────────────
  async createItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body as CreateGroceryInput
      const item = await groceryService.createItem(data)

      res.status(201).json({
        success: true,
        message: 'Grocery item created successfully',
        data: item,
      })
    } catch (error) {
      next(error)
    }
  }

  // ─── Admin: Get All ───────────────────────────────
  async getAllItems(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const items = await groceryService.getAllItems()

      res.status(200).json({
        success: true,
        message: 'Grocery items retrieved successfully',
        data: items,
        total: items.length,
      })
    } catch (error) {
      next(error)
    }
  }

  // ─── Admin: Update ────────────────────────────────
  async updateItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id as string)
      const data = req.body as UpdateGroceryInput
      const item = await groceryService.updateItem(id, data)

      res.status(200).json({
        success: true,
        message: 'Grocery item updated successfully',
        data: item,
      })
    } catch (error) {
      next(error)
    }
  }

  // ─── Admin: Delete ────────────────────────────────
  async deleteItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id as string)
      const result = await groceryService.deleteItem(id)

      res.status(200).json({
        success: true,
        message: result.message,
      })
    } catch (error) {
      next(error)
    }
  }

  // ─── Admin: Update Inventory ──────────────────────
  async updateInventory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id as string)
      const data = req.body as UpdateInventoryInput
      const item = await groceryService.updateInventory(id, data)

      res.status(200).json({
        success: true,
        message: 'Inventory updated successfully',
        data: item,
      })
    } catch (error) {
      next(error)
    }
  }

  // ─── User: Get Available ──────────────────────────
  async getAvailableItems(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const items = await groceryService.getAvailableItems()

      res.status(200).json({
        success: true,
        message: 'Available grocery items retrieved successfully',
        data: items,
        total: items.length,
      })
    } catch (error) {
      next(error)
    }
  }
}

export const groceryController = new GroceryController()