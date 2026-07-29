import { PrismaClient, Role, CustomerType, CustomerStatus, NoteType, MovementType, ChallanStatus, NotificationType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding FlowSphere ERP + CRM database...');

  // Clean existing tables
  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.salesChallanItem.deleteMany();
  await prisma.salesChallan.deleteMany();
  await prisma.inventoryLog.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customerNote.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.category.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // 1. Create Users
  const admin = await prisma.user.create({
    data: { name: 'Alex Morgan', email: 'admin@flowsphere.com', password: hashedPassword, role: Role.ADMIN, isActive: true },
  });
  const sales = await prisma.user.create({
    data: { name: 'Sarah Connor', email: 'sales@flowsphere.com', password: hashedPassword, role: Role.SALES, isActive: true },
  });
  const warehouse = await prisma.user.create({
    data: { name: 'Marcus Vance', email: 'warehouse@flowsphere.com', password: hashedPassword, role: Role.WAREHOUSE, isActive: true },
  });
  const accounts = await prisma.user.create({
    data: { name: 'Elena Rostova', email: 'accounts@flowsphere.com', password: hashedPassword, role: Role.ACCOUNTS, isActive: true },
  });

  console.log('✅ Users seeded');

  // 2. Create Warehouses
  const wh1 = await prisma.warehouse.create({ data: { name: 'Central Logistics Hub', code: 'WH-CENTRAL', location: '104 Enterprise Way, Industrial Zone 4' } });
  const wh2 = await prisma.warehouse.create({ data: { name: 'East Coast Distribution Center', code: 'WH-EAST', location: '450 Terminal Blvd, Port Terminal B' } });
  const wh3 = await prisma.warehouse.create({ data: { name: 'West Depot & Fulfillment', code: 'WH-WEST', location: '880 Pacific Logistics Parkway' } });

  console.log('✅ Warehouses seeded');

  // 3. Create Categories
  const catElectronics = await prisma.category.create({ data: { name: 'Industrial Electronics', description: 'Control units, sensors, and power supplies' } });
  const catMachinery = await prisma.category.create({ data: { name: 'Machinery Components', description: 'Gears, pumps, valves, and actuators' } });
  const catRawMaterials = await prisma.category.create({ data: { name: 'Raw Metals & Alloys', description: 'Aluminium extruded bars, stainless steel sheets' } });
  const catPackaging = await prisma.category.create({ data: { name: 'Industrial Packaging', description: 'Pallet wraps, heavy-duty boxes, strapping bands' } });
  const catTools = await prisma.category.create({ data: { name: 'Heavy Tools & Equipments', description: 'Power tools, heavy equipments, and accessories' } });

  console.log('✅ Categories seeded');

  // 4. Create Products
  const products = [
    { sku: 'SKU-ELEC-001', name: 'Digital Logic Controller V4', description: 'Programmable multi-channel industrial controller unit', price: 36000.0, costPrice: 22400.0, stock: 45, minStock: 15, unit: 'pcs', categoryId: catElectronics.id, warehouseId: wh1.id },
    { sku: 'SKU-ELEC-002', name: 'Optical Laser Sensor Pro', description: 'High-precision photoelectric proximity sensor', price: 9600.0, costPrice: 5200.0, stock: 4, minStock: 10, unit: 'pcs', categoryId: catElectronics.id, warehouseId: wh1.id },
    { sku: 'SKU-ELEC-003', name: 'Industrial Power Supply 24V 10A', description: 'DIN rail mount switching power supply', price: 4800.0, costPrice: 2800.0, stock: 120, minStock: 30, unit: 'pcs', categoryId: catElectronics.id, warehouseId: wh1.id },
    { sku: 'SKU-ELEC-004', name: 'AC Variable Frequency Drive 5HP', description: '3-phase VFD for AC motor speed control', price: 28500.0, costPrice: 19000.0, stock: 12, minStock: 5, unit: 'pcs', categoryId: catElectronics.id, warehouseId: wh2.id },
    
    { sku: 'SKU-MACH-101', name: 'Hydraulic Flow Valve 34mm', description: 'High-pressure stainless steel directional control valve', price: 22400.0, costPrice: 12800.0, stock: 28, minStock: 8, unit: 'pcs', categoryId: catMachinery.id, warehouseId: wh2.id },
    { sku: 'SKU-MACH-102', name: 'Centrifugal Water Pump 5HP', description: 'Heavy duty cast iron water circulation pump', price: 71200.0, costPrice: 41600.0, stock: 2, minStock: 5, unit: 'units', categoryId: catMachinery.id, warehouseId: wh2.id },
    { sku: 'SKU-MACH-103', name: 'Pneumatic Actuator Cylinder', description: 'Double acting pneumatic cylinder 50mm bore', price: 8500.0, costPrice: 4800.0, stock: 65, minStock: 20, unit: 'pcs', categoryId: catMachinery.id, warehouseId: wh2.id },
    { sku: 'SKU-MACH-104', name: 'Rotary Gear Pump', description: 'Heavy fluid transfer gear pump in cast iron', price: 34500.0, costPrice: 21000.0, stock: 15, minStock: 10, unit: 'pcs', categoryId: catMachinery.id, warehouseId: wh1.id },

    { sku: 'SKU-MET-201', name: 'Aluminium Profile 40x40 (3m)', description: 'T-slot extruded aluminum profile bar', price: 2800.0, costPrice: 1440.0, stock: 150, minStock: 30, unit: 'bars', categoryId: catRawMaterials.id, warehouseId: wh3.id },
    { sku: 'SKU-MET-202', name: 'Stainless Steel Sheet 2mm (4x8ft)', description: 'Grade 304 cold-rolled steel sheet', price: 11600.0, costPrice: 7200.0, stock: 60, minStock: 20, unit: 'sheets', categoryId: catRawMaterials.id, warehouseId: wh3.id },
    { sku: 'SKU-MET-203', name: 'Carbon Steel Pipe 2" Sch 40 (6m)', description: 'Seamless carbon steel pipe', price: 4200.0, costPrice: 2400.0, stock: 220, minStock: 50, unit: 'pipes', categoryId: catRawMaterials.id, warehouseId: wh3.id },
    { sku: 'SKU-MET-204', name: 'Copper Busbar 10x50mm (2m)', description: 'Electrical grade pure copper busbar', price: 8900.0, costPrice: 6500.0, stock: 85, minStock: 25, unit: 'bars', categoryId: catRawMaterials.id, warehouseId: wh3.id },
  ];

  const createdProducts = await Promise.all(
    products.map(p => prisma.product.create({ data: p }))
  );
  console.log('✅ Products seeded');

  // 5. Create Customers
  const customers = [
    { name: 'Apex Industrial Automation Ltd', email: 'procurement@apexindustrial.com', phone: '+91 98765 43210', company: 'Apex Industries', address: 'Plot 42, MIDC Industrial Area', city: 'Mumbai', type: CustomerType.DISTRIBUTOR, status: CustomerStatus.ACTIVE },
    { name: 'Vanguard Robotics Inc', email: 'orders@vanguardrobotics.in', phone: '+91 98765 11223', company: 'Vanguard Group', address: '120 Innovation Drive, Tech Park', city: 'Bengaluru', type: CustomerType.WHOLESALE, status: CustomerStatus.ACTIVE },
    { name: 'Global Metal Fabrication Co', email: 'purchasing@globalmetalfab.in', phone: '+91 98765 34567', company: 'Global Metal Fab', address: '55 Foundry Road, Peenya', city: 'Bengaluru', type: CustomerType.WHOLESALE, status: CustomerStatus.ACTIVE },
    { name: 'Nexus Dynamics Systems', email: 'contact@nexusdynamics.in', phone: '+91 98765 77889', company: 'Nexus Corp', address: '99 Quantum Lane, Okhla', city: 'New Delhi', type: CustomerType.RETAIL, status: CustomerStatus.LEAD },
    { name: 'Pacific Freight Packaging', email: 'supplies@pacificfreight.in', phone: '+91 98765 22334', company: 'Pacific Freight', address: '400 Logistics Blvd, SIPCOT', city: 'Chennai', type: CustomerType.DISTRIBUTOR, status: CustomerStatus.ACTIVE },
    { name: 'Sterling Manufacturing', email: 'procurement@sterlingmfg.in', phone: '+91 98765 88990', company: 'Sterling Mfg', address: 'Sector 62, Industrial Area', city: 'Noida', type: CustomerType.WHOLESALE, status: CustomerStatus.ACTIVE },
    { name: 'Delta Engineering Solutions', email: 'info@deltaengg.in', phone: '+91 98765 55667', company: 'Delta Engg', address: 'Phase 1, GIDC', city: 'Ahmedabad', type: CustomerType.DISTRIBUTOR, status: CustomerStatus.ACTIVE },
    { name: 'Prime Construction Equipments', email: 'sales@primeequip.in', phone: '+91 98765 11224', company: 'Prime Equipments', address: 'Estate 4, Auto Nagar', city: 'Hyderabad', type: CustomerType.RETAIL, status: CustomerStatus.ACTIVE },
    { name: 'Alpha Heavy Industries', email: 'vendor@alphahi.in', phone: '+91 98765 99001', company: 'Alpha HI', address: 'Plot 10, Industrial Estate', city: 'Pune', type: CustomerType.WHOLESALE, status: CustomerStatus.ACTIVE },
    { name: 'Beta Tools & Hardware', email: 'buy@betatools.in', phone: '+91 98765 33445', company: 'Beta Tools', address: 'Market Road, Camp', city: 'Pune', type: CustomerType.RETAIL, status: CustomerStatus.INACTIVE },
  ];

  const createdCustomers = await Promise.all(
    customers.map(c => prisma.customer.create({ data: c }))
  );
  console.log('✅ Customers seeded');

  // 6. Customer Notes & Follow-ups
  await prisma.customerNote.createMany({
    data: [
      { customerId: createdCustomers[0].id, userId: sales.id, note: 'Discussed annual contract renewal for SKU-ELEC-001. Client requested 5% bulk discount.', type: NoteType.MEETING },
      { customerId: createdCustomers[0].id, userId: sales.id, note: 'Follow-up call scheduled to finalize Q3 supply order.', type: NoteType.FOLLOW_UP, followUpDate: new Date(Date.now() + 86400000 * 2) },
      { customerId: createdCustomers[1].id, userId: sales.id, note: 'Inquired about water pump availability. Sent formal quote #QT-2026-089.', type: NoteType.CALL },
      { customerId: createdCustomers[3].id, userId: sales.id, note: 'New lead qualified from trade expo. Scheduled product demo next Tuesday.', type: NoteType.FOLLOW_UP, followUpDate: new Date(Date.now() + 86400000 * 5) },
      { customerId: createdCustomers[5].id, userId: sales.id, note: 'Client reported minor issues with recent batch of components. Arranged for replacement.', type: NoteType.EMAIL },
      { customerId: createdCustomers[6].id, userId: sales.id, note: 'Negotiated pricing for 100 units of Hydraulic Flow Valves.', type: NoteType.MEETING },
    ],
  });
  console.log('✅ Customer notes & follow-ups seeded');

  // 7. Initial Inventory Logs
  for (const prod of createdProducts) {
    await prisma.inventoryLog.create({
      data: {
        productId: prod.id,
        warehouseId: prod.warehouseId,
        userId: warehouse.id,
        type: MovementType.IN,
        quantity: prod.stock + 10,
        reason: 'Initial stock intake from factory supplier',
        referenceNo: `PO-SUPPLIER-${Math.floor(1000 + Math.random() * 9000)}`,
      },
    });
  }
  console.log('✅ Inventory logs seeded');

  // 8. Sales Challans (Realistic extensive data)
  const today = new Date();
  
  const generateChallan = async (
    index: number, 
    customerIdx: number, 
    status: ChallanStatus, 
    daysAgo: number, 
    itemsData: Array<{prodIdx: number, qty: number}>
  ) => {
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);

    let subtotal = 0;
    const items = itemsData.map(item => {
      const prod = createdProducts[item.prodIdx];
      const lineTotal = prod.price * item.qty;
      subtotal += lineTotal;
      return {
        productId: prod.id,
        skuSnapshot: prod.sku,
        nameSnapshot: prod.name,
        priceSnapshot: prod.price,
        quantity: item.qty,
        lineTotal,
      };
    });

    const tax = subtotal * 0.18; // 18% GST
    const total = subtotal + tax;

    await prisma.salesChallan.create({
      data: {
        challanNo: `CHL-202607${String(index).padStart(3, '0')}`,
        customerId: createdCustomers[customerIdx].id,
        userId: sales.id,
        status,
        subtotal,
        tax,
        total,
        notes: status === ChallanStatus.CONFIRMED ? 'Delivered successfully.' : 'Pending approval.',
        createdAt: date,
        confirmedAt: status === ChallanStatus.CONFIRMED ? date : null,
        items: {
          create: items,
        },
      },
    });
  };

  // Generate challans spread across days
  // Today's Confirmed Challans (to trigger Dashboard revenue)
  await generateChallan(1, 0, ChallanStatus.CONFIRMED, 0, [{ prodIdx: 0, qty: 5 }, { prodIdx: 11, qty: 20 }]);
  await generateChallan(2, 2, ChallanStatus.CONFIRMED, 0, [{ prodIdx: 5, qty: 2 }, { prodIdx: 6, qty: 10 }]);
  await generateChallan(3, 5, ChallanStatus.CONFIRMED, 0, [{ prodIdx: 8, qty: 50 }, { prodIdx: 9, qty: 10 }]);
  
  // Past Challans
  await generateChallan(4, 1, ChallanStatus.CONFIRMED, 2, [{ prodIdx: 1, qty: 2 }, { prodIdx: 2, qty: 15 }]);
  await generateChallan(5, 4, ChallanStatus.CONFIRMED, 5, [{ prodIdx: 10, qty: 500 }]);
  await generateChallan(6, 6, ChallanStatus.CONFIRMED, 10, [{ prodIdx: 4, qty: 12 }]);
  await generateChallan(7, 7, ChallanStatus.CONFIRMED, 15, [{ prodIdx: 3, qty: 5 }, { prodIdx: 7, qty: 2 }]);
  await generateChallan(8, 8, ChallanStatus.CONFIRMED, 22, [{ prodIdx: 10, qty: 100 }, { prodIdx: 11, qty: 40 }]);
  await generateChallan(9, 0, ChallanStatus.CONFIRMED, 30, [{ prodIdx: 3, qty: 3 }]);
  await generateChallan(10, 2, ChallanStatus.CONFIRMED, 45, [{ prodIdx: 7, qty: 5 }]);
  await generateChallan(11, 5, ChallanStatus.CONFIRMED, 60, [{ prodIdx: 0, qty: 10 }]);

  // Draft / Pending / Cancelled
  await generateChallan(12, 1, ChallanStatus.DRAFT, 1, [{ prodIdx: 2, qty: 5 }]);
  await generateChallan(13, 3, ChallanStatus.DRAFT, 0, [{ prodIdx: 9, qty: 10 }]);
  await generateChallan(14, 8, ChallanStatus.CANCELLED, 14, [{ prodIdx: 5, qty: 1 }]);
  await generateChallan(15, 6, ChallanStatus.DRAFT, 3, [{ prodIdx: 8, qty: 20 }]);

  console.log('✅ Sales challans seeded');

  // 9. System Notifications
  await prisma.notification.createMany({
    data: [
      { userId: warehouse.id, title: 'Critical Low Stock Warning', message: 'Product "Optical Laser Sensor Pro" has only 4 units remaining (Min Threshold: 10).', type: NotificationType.LOW_STOCK, link: '/products' },
      { userId: warehouse.id, title: 'Critical Low Stock Warning', message: 'Product "Centrifugal Water Pump 5HP" has only 2 units remaining (Min Threshold: 5).', type: NotificationType.LOW_STOCK, link: '/products' },
      { userId: warehouse.id, title: 'Critical Low Stock Warning', message: 'Product "Corrugated Shipping Master Carton" has only 5 units remaining (Min Threshold: 100).', type: NotificationType.LOW_STOCK, link: '/products' },
      { userId: sales.id, title: 'Customer Follow-up Scheduled', message: 'Follow-up due with Apex Industrial Automation Ltd regarding Q3 supply contract.', type: NotificationType.FOLLOW_UP, link: `/customers/${createdCustomers[0].id}` },
    ],
  });
  console.log('✅ Notifications seeded');

  // 10. Activity Audit Logs
  await prisma.activityLog.createMany({
    data: [
      { userId: sales.id, userName: sales.name, userRole: sales.role, entity: 'Sales Challan', action: 'CONFIRMED', details: 'Confirmed Sales Challan CHL-202607001 for Apex Industrial Automation' },
      { userId: sales.id, userName: sales.name, userRole: sales.role, entity: 'Sales Challan', action: 'CONFIRMED', details: 'Confirmed Sales Challan CHL-202607002 for Global Metal Fabrication Co' },
      { userId: warehouse.id, userName: warehouse.name, userRole: warehouse.role, entity: 'Inventory', action: 'LOW_STOCK', details: 'Low stock threshold reached for Centrifugal Water Pump 5HP' },
      { userId: sales.id, userName: sales.name, userRole: sales.role, entity: 'Customer CRM', action: 'LOGGED_NOTE', details: 'Added follow-up note for Apex Industrial Automation Ltd' },
      { userId: admin.id, userName: admin.name, userRole: admin.role, entity: 'User Management', action: 'CREATED_USER', details: 'Created active user account for Marcus Vance (WAREHOUSE)' },
    ],
  });
  console.log('✅ Activity audit logs seeded');

  console.log('🎉 FlowSphere ERP + CRM database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
