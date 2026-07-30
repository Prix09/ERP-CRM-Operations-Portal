import { CustomerType, CustomerStatus, NoteType } from '@prisma/client';
import { prisma } from '../config/db.js';

export class CustomerService {
  static async getCustomers(params: { search?: string; type?: CustomerType; status?: CustomerStatus; page?: number; limit?: number }): Promise<any> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.type) where.type = params.type;
    if (params.status) where.status = params.status;
    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
        { company: { contains: params.search, mode: 'insensitive' } },
        { city: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          salesChallans: {
            where: { status: 'CONFIRMED' },
            select: { total: true }
          },
          _count: {
            select: { salesChallans: true, notes: true },
          },
        },
      }),
      prisma.customer.count({ where }),
    ]);

    // Auto-seed default customer for fresh deployments
    if (total === 0 && Object.keys(where).length === 0) {
      try {
        await prisma.customer.create({
          data: {
            name: 'Demo Customer',
            email: 'demo@flowsphere.com',
            phone: '+1-555-0123',
            company: 'Demo Company Ltd',
            address: '123 Business Avenue',
            city: 'New York',
            type: 'WHOLESALE',
            status: 'ACTIVE'
          }
        });
        // Refetch after seeding
        return this.getCustomers(params);
      } catch (e) {
        // Ignore unique constraint errors
      }
    }

    const mappedCustomers = customers.map(c => {
      const outstandingBalance = c.salesChallans.reduce((sum, ch) => sum + ch.total, 0);
      const { salesChallans, ...rest } = c;
      return {
        ...rest,
        outstandingBalance
      };
    });

    return {
      customers: mappedCustomers,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getCustomerById(id: string) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        notes: {
          include: {
            user: { select: { name: true, role: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        salesChallans: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    return customer;
  }

  static async createCustomer(data: {
    name: string;
    email: string;
    phone: string;
    company?: string | null;
    address: string;
    city: string;
    type?: CustomerType;
    status?: CustomerStatus;
  }, userId: string) {
    const existing = await prisma.customer.findUnique({ where: { email: data.email } });
    if (existing) throw new Error('Customer email already exists');

    const customer = await prisma.customer.create({ data });
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (user) {
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          entity: 'Customer CRM',
          action: 'CREATED_CUSTOMER',
          details: `Added new customer "${customer.name}" (${customer.company || 'Individual'})`,
        },
      });
    }

    return customer;
  }

  static async updateCustomer(id: string, data: any) {
    return prisma.customer.update({
      where: { id },
      data,
    });
  }

  static async deleteCustomer(id: string) {
    try {
      return await prisma.customer.delete({ where: { id } });
    } catch (err: any) {
      if (err.code === 'P2003') {
        throw new Error('Cannot delete this customer because they have existing challans or notes. Please delete those records first.');
      }
      throw err;
    }
  }

  static async addNote(customerId: string, userId: string, data: { note: string; type?: NoteType; followUpDate?: string | null }) {
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) throw new Error('Customer not found');

    const createdNote = await prisma.customerNote.create({
      data: {
        customerId,
        userId,
        note: data.note,
        type: data.type || NoteType.NOTE,
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
      },
      include: {
        user: { select: { name: true, role: true } },
      },
    });

    if (data.followUpDate) {
      await prisma.notification.create({
        data: {
          userId,
          title: 'Customer Follow-up Scheduled',
          message: `Follow-up set for ${customer.name}: "${data.note}"`,
          type: 'FOLLOW_UP',
          link: `/customers/${customer.id}`,
        },
      });
    }

    return createdNote;
  }
}
