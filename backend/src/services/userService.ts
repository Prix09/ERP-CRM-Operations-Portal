import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { prisma } from '../config/db.js';

export class UserService {
  static async getAllUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async createUser(data: { name: string; email: string; password: string; role: Role }, adminUserId: string) {
    const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (existing) {
      throw new Error('Email already registered');
    }

    const admin = await prisma.user.findUnique({ where: { id: adminUserId } });
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        password: hashedPassword,
        role: data.role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (admin) {
      await prisma.activityLog.create({
        data: {
          userId: admin.id,
          userName: admin.name,
          userRole: admin.role,
          entity: 'User Management',
          action: 'CREATED_USER',
          details: `Created user ${newUser.name} (${newUser.role})`,
        },
      });
    }

    return newUser;
  }

  static async updateUser(userId: string, data: { name?: string; email?: string; role?: Role; isActive?: boolean }, adminUserId: string) {
    const admin = await prisma.user.findUnique({ where: { id: adminUserId } });
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    if (admin) {
      await prisma.activityLog.create({
        data: {
          userId: admin.id,
          userName: admin.name,
          userRole: admin.role,
          entity: 'User Management',
          action: 'UPDATED_USER',
          details: `Updated details for ${user.name}`,
        },
      });
    }

    return user;
  }
}
