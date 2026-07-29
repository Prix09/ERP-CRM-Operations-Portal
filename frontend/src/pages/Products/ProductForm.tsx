import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { productApi } from '../../services/productApi';
import { AppPageHeader } from '../../components/ui/AppPageHeader';
import { AppFormField } from '../../components/ui/AppFormField';
import { AppButton } from '../../components/ui/AppButton';
import { ArrowLeft, Save } from 'lucide-react';
import { cn } from '../../utils/formatters';

const productSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  sku: z.string().min(2, 'SKU is required'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be positive'),
  costPrice: z.coerce.number().min(0).optional(),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  minStock: z.coerce.number().int().min(0).default(5),
  categoryId: z.string().min(1, 'Category is required'),
  warehouseId: z.string().min(1, 'Warehouse is required'),
  imageUrl: z.string().url().optional().or(z.literal('')),
});

type ProductFormValues = z.infer<typeof productSchema>;

export const ProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isViewMode = !location.pathname.endsWith('/edit') && Boolean(id);
  const isEditMode = location.pathname.endsWith('/edit');
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [categories, setCategories] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      stock: 0,
      minStock: 5,
    }
  });

  const fetchProduct = async () => {
    if (!id) return;
    try {
      const product = await productApi.getProductById(id);
      reset({
        name: product.name,
        sku: product.sku,
        description: product.description || '',
        price: product.price,
        costPrice: (product as any).costPrice || 0,
        stock: product.stock,
        minStock: product.minStock,
        categoryId: product.categoryId,
        warehouseId: product.warehouseId,
        imageUrl: product.imageUrl || '',
      });
    } catch (err) {
      setError('Failed to fetch product details');
    }
  };

  const refreshStock = async () => {
    if (!id) return;
    try {
      const product = await productApi.getProductById(id);
      // Only update the stock to avoid wiping unsaved changes in other fields
      reset({ ...getValues(), stock: product.stock });
    } catch (err) {
      console.error('Failed to refresh stock', err);
    }
  };

  useEffect(() => {
    if ((isEditMode || isViewMode) && id) {
      fetchProduct();
    }
    const fetchDropdowns = async () => {
      try {
        const [catRes, whRes] = await Promise.all([
          productApi.getCategories(),
          productApi.getWarehouses()
        ]);
        setCategories(catRes);
        setWarehouses(whRes);
      } catch (err) {
        console.error('Failed to load categories or warehouses', err);
      }
    };
    fetchDropdowns();
  }, [id, isEditMode, isViewMode, reset]);

  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      if (isEditMode && id) {
        await productApi.updateProduct(id, data);
      } else {
        await productApi.createProduct(data);
      }
      queryClient.invalidateQueries({ queryKey: ['products'] });
      navigate('/products');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50";

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/products')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <AppPageHeader 
            title={isViewMode ? 'View Product' : isEditMode ? 'Edit Product' : 'Add New Product'} 
            description={isViewMode ? 'View inventory item details.' : isEditMode ? 'Update inventory item details.' : 'Create a new inventory item.'}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <fieldset disabled={isViewMode} className="contents">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AppFormField label="Product Name" required error={errors.name?.message}>
                <input 
                  {...register('name')} 
                  className={inputClass} 
                  placeholder="Product XYZ" 
                />
              </AppFormField>

              <AppFormField label="SKU Code" required error={errors.sku?.message}>
                <input 
                  {...register('sku')} 
                  className={inputClass} 
                  placeholder="SKU-10001" 
                />
              </AppFormField>

              <AppFormField label="Selling Price (₹)" required error={errors.price?.message}>
                <input 
                  type="number"
                  step="0.01"
                  {...register('price')} 
                  className={inputClass} 
                  placeholder="0.00" 
                />
              </AppFormField>

              <AppFormField label="Cost Price (₹)" error={errors.costPrice?.message}>
                <input 
                  type="number"
                  step="0.01"
                  {...register('costPrice')} 
                  className={inputClass} 
                  placeholder="0.00" 
                />
              </AppFormField>

              <AppFormField label="Current Stock" required error={errors.stock?.message}>
                <input 
                  type="number"
                  {...register('stock')} 
                  className={cn(inputClass, isEditMode && "bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed")} 
                  placeholder="0" 
                  readOnly={isEditMode}
                  title={isEditMode ? "Use Stock Movements to adjust stock" : ""}
                />
              </AppFormField>

              <AppFormField label="Minimum Stock Alert" required error={errors.minStock?.message}>
                <input 
                  type="number"
                  {...register('minStock')} 
                  className={inputClass} 
                  placeholder="5" 
                />
              </AppFormField>

              <AppFormField label="Category" required error={errors.categoryId?.message}>
                <select {...register('categoryId')} className={inputClass}>
                  <option value="" disabled>Select Category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </AppFormField>

              <AppFormField label="Warehouse" required error={errors.warehouseId?.message}>
                <select {...register('warehouseId')} className={inputClass}>
                  <option value="" disabled>Select Warehouse</option>
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </AppFormField>

              <div className="md:col-span-2">
                <AppFormField label="Image URL" error={errors.imageUrl?.message}>
                  <div className="flex gap-2">
                    <input 
                      type="url"
                      {...register('imageUrl')} 
                      className={cn(inputClass, "flex-1")} 
                      placeholder="https://example.com/image.jpg" 
                    />
                    {!isViewMode && (
                      <div className="relative flex-shrink-0">
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                const url = await productApi.uploadImage(file);
                                // @ts-ignore
                                const backendUrl = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';
                                reset({ ...getValues(), imageUrl: `${backendUrl}${url}` });
                              } catch (err) {
                                setError('Failed to upload image');
                              }
                            }
                          }}
                        />
                        <AppButton type="button" variant="outline" className="h-full">
                          Upload Image
                        </AppButton>
                      </div>
                    )}
                  </div>
                </AppFormField>
              </div>

              <div className="md:col-span-2">
                <AppFormField label="Description" error={errors.description?.message}>
                  <textarea 
                    {...register('description')} 
                    className={cn(inputClass, "min-h-[100px] resize-y")} 
                    placeholder="Detailed product description..." 
                  />
                </AppFormField>
              </div>
            </div>
          </fieldset>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
            {isViewMode ? (
              <>
                <AppButton type="button" variant="outline" onClick={() => navigate('/products')}>
                  Back to List
                </AppButton>
                <AppButton type="button" variant="primary" onClick={() => navigate(`/products/${id}/edit`)}>
                  Edit Product
                </AppButton>
              </>
            ) : (
              <>
                <AppButton type="button" variant="outline" onClick={() => navigate('/products')}>
                  Cancel
                </AppButton>
                <AppButton type="submit" variant="primary" disabled={isSubmitting} icon={<Save className="w-4 h-4" />}>
                  {isSubmitting ? 'Saving...' : 'Save Product'}
                </AppButton>
              </>
            )}
          </div>
        </form>
      </div>

      {(isViewMode || isEditMode) && id && (
        <StockMovementLogSection 
          productId={id} 
          onStockUpdated={() => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            refreshStock();
          }} 
        />
      )}
    </div>
  );
};

// --- Stock Movement Log Component ---
const StockMovementLogSection: React.FC<{ productId: string, onStockUpdated?: () => void }> = ({ productId, onStockUpdated }) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [type, setType] = useState('IN');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      const product = await productApi.getProductById(productId);
      setLogs((product as any).inventoryLogs || []);
    } catch (err) {}
  };

  useEffect(() => {
    fetchLogs();
  }, [productId]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setType('IN');
    setQuantity('');
    setReason('');
    setError(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (log: any) => {
    setEditingId(log.id);
    setType(log.type);
    setQuantity(log.quantity.toString());
    setReason(log.reason);
    setError(null);
    setIsFormOpen(true);
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) {
      setError('Please enter a valid positive quantity.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    try {
      const payload = { type, quantity: Number(quantity), reason };
      if (editingId) {
        await productApi.updateStockMovement(productId, editingId, payload);
      } else {
        await productApi.addStockMovement(productId, payload);
      }
      await fetchLogs();
      handleCancel();
      if (onStockUpdated) onStockUpdated();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save stock movement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden mt-8">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Stock Movements</h3>
        {!isFormOpen && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
          >
            + Add Movement
          </button>
        )}
        {isFormOpen && (
          <button
            type="button"
            onClick={handleCancel}
            className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      {isFormOpen && (
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
                {error}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
              <div className="flex-shrink-0 w-full sm:w-32">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  <option value="IN">IN</option>
                  <option value="OUT">OUT</option>
                </select>
              </div>
              <div className="flex-shrink-0 w-full sm:w-32">
                <input
                  type="number"
                  placeholder="Quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
              <div className="flex-grow w-full">
                <input
                  type="text"
                  placeholder="Reason (e.g. Manual Adjustment)"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
              <div className="flex-shrink-0 w-full sm:w-auto">
                <AppButton type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Submit'}
                </AppButton>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="p-0">
        {logs.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-500 italic">No stock movements recorded for this product yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Type</th>
                  <th className="px-6 py-3 font-medium">Quantity</th>
                  <th className="px-6 py-3 font-medium">Reason</th>
                  <th className="px-6 py-3 font-medium">Recorded By</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800 text-sm text-gray-900 dark:text-gray-300">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                        log.type === 'IN' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        log.type === 'OUT' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      )}>
                        {log.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                      {log.type === 'OUT' ? '-' : '+'}{log.quantity}
                    </td>
                    <td className="px-6 py-4">{log.reason}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{log.user?.name || 'Unknown'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleOpenEdit(log)}
                        className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
