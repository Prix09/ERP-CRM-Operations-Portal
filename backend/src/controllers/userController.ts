import { Response, NextFunction } from 'express';
import { UserService } from '../services/userService.js';
import { AuthRequest } from '../types/index.js';

export class UserController {
  static async getUsers(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await UserService.getAllUsers();
      res.status(200).json({ success: true, message: 'Users retrieved', data: users });
    } catch (err) {
      next(err);
    }
  }

  static async createUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await UserService.createUser(req.body, req.user!.userId);
      res.status(201).json({ success: true, message: 'User created successfully', data: user });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async updateUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await UserService.updateUser(req.params.id, req.body, req.user!.userId);
      res.status(200).json({ success: true, message: 'User updated successfully', data: user });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}
