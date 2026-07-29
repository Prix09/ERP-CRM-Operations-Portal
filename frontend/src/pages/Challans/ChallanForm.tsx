import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { challanApi } from '../../services/challanApi';
import { customerApi } from '../../services/customerApi';
import { productApi } from '../../services/productApi';
import { AppPageHeader } from '../../components/ui/AppPageHeader';
import { AppFormField } from '../../components/ui/AppFormField';
import { AppButton } from '../../components/ui/AppButton';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { cn, formatCurrency } from '../../utils/formatters';

const challanItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.coerce.number().int().min(1, 'Min quantity 1'),
  unitPrice: z.coerce.number().min(0, 'Invalid price'),
});

const challanSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  warehouseId: z.string().optional(),
  status: z.enum(['DRAFT', 'CONFIRMED', 'DELIVERED', 'CANCELLED']).default('DRAFT'),
  items: z.array(challanItemSchema).min(1, 'At least one item is required'),
});

type ChallanFormValues = z.infer<typeof challanSchema>;

export const ChallanForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isViewMode = !location.pathname.endsWith('/edit') && Boolean(id);
  const isEditMode = location.pathname.endsWith('/edit');
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ChallanFormValues>({
    resolver: zodResolver(challanSchema),
    defaultValues: {
      status: 'DRAFT',
      items: [{ productId: '', quantity: 1, unitPrice: 0 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  useEffect(() => {
    if ((isEditMode || isViewMode) && id) {
      const fetchChallan = async () => {
        try {
          const challan = await challanApi.getChallanById(id);
          reset({
            customerId: challan.customerId,
            status: challan.status,
            items: (challan.items || []).map((i: any) => ({
              productId: i.productId,
              quantity: i.quantity,
              unitPrice: i.priceSnapshot || 0
            }))
          });
        } catch (err: any) {
          console.error('Failed to fetch challan details', err);
          setError(err?.response?.data?.message || err.message || 'Failed to fetch challan details');
        }
      };
      fetchChallan();
    }

    const fetchDropdowns = async () => {
      try {
        const [custRes, prodRes] = await Promise.all([
          customerApi.getCustomers({ limit: 100 }),
          productApi.getProducts({ limit: 100 }),
        ]);
        setCustomers((custRes as any).customers || []);
        setProducts((prodRes as any).products || []);
      } catch (err) {
        console.error("Failed to load customers/products");
      }
    };
    fetchDropdowns();
  }, []);

  const watchItems = watch('items');
  const totalAmount = watchItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice || 0), 0);

  const handleProductChange = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setValue(`items.${index}.unitPrice`, product.price);
    }
  };

  const onSubmit = async (data: ChallanFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      if (isEditMode && id) {
        await challanApi.updateStatus(id, data.status);
      } else {
        await challanApi.createChallan({
          customerId: data.customerId,
          status: data.status,
          items: (data.items || []).map(item => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        });
      }
      queryClient.invalidateQueries({ queryKey: ['challans'] });
      navigate('/challans');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50";

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/challans')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <AppPageHeader 
            title={isViewMode ? 'View Challan' : isEditMode ? 'Edit Challan' : 'Create Sales Challan'} 
            description={isViewMode ? 'View challan details.' : 'Manage challan details and line items.'}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <AppFormField label="Customer" required error={errors.customerId?.message}>
                <select {...register('customerId')} className={inputClass}>
                  <option value="" disabled>Select Customer</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} {c.company ? `(${c.company})` : ''}</option>
                  ))}
                </select>
              </AppFormField>

              <AppFormField label="Status" required error={errors.status?.message}>
                <select {...register('status')} className={inputClass} disabled={isEditMode || isViewMode}>
                  <option value="DRAFT">Draft</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </AppFormField>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Line Items</h3>
                {!isViewMode && (
                  <AppButton 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    icon={<Plus className="w-4 h-4" />}
                    onClick={() => append({ productId: '', quantity: 1, unitPrice: 0 })}
                  >
                    Add Item
                  </AppButton>
                )}
              </div>

              {errors.items?.root?.message && (
                <p className="text-sm text-red-500 mb-4">{errors.items.root.message}</p>
              )}

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-start gap-4 p-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex-1 grid grid-cols-12 gap-4">
                      <div className="col-span-12 md:col-span-6">
                        <AppFormField label="Product" required error={errors.items?.[index]?.productId?.message}>
                          <select 
                            {...register(`items.${index}.productId`)}
                            className={inputClass}
                            onChange={(e) => {
                              register(`items.${index}.productId`).onChange(e);
                              handleProductChange(index, e.target.value);
                            }}
                          >
                            <option value="" disabled>Select Product</option>
                            {products.map(p => (
                              <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>
                            ))}
                          </select>
                        </AppFormField>
                      </div>
                      <div className="col-span-6 md:col-span-3">
                        <AppFormField label="Quantity" required error={errors.items?.[index]?.quantity?.message}>
                          <input 
                            type="number"
                            {...register(`items.${index}.quantity`)}
                            className={inputClass}
                          />
                        </AppFormField>
                      </div>
                      <div className="col-span-6 md:col-span-3">
                        <AppFormField label="Unit Price" required error={errors.items?.[index]?.unitPrice?.message}>
                          <input 
                            type="number"
                            step="0.01"
                            {...register(`items.${index}.unitPrice`)}
                            className={inputClass}
                          />
                        </AppFormField>
                      </div>
                    </div>
                    
                    {!isViewMode && (
                      <div className="pt-8">
                        <button 
                          type="button"
                          onClick={() => remove(index)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          disabled={fields.length === 1}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <div className="w-64 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800">
                  <div className="flex justify-between items-center text-lg font-bold text-gray-900 dark:text-white">
                    <span>Total:</span>
                    <span>{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </fieldset>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
            {isViewMode ? (
              <>
                <AppButton type="button" variant="outline" onClick={() => navigate('/challans')}>
                  Back to List
                </AppButton>
                {id && (
                  <AppButton 
                    type="button" 
                    variant="primary" 
                    onClick={async () => {
                      try {
                        await challanApi.downloadPDF(id);
                      } catch (err) {
                        alert('Failed to download PDF');
                      }
                    }}
                  >
                    Download PDF
                  </AppButton>
                )}
              </>
            ) : (
              <>
                <AppButton type="button" variant="outline" onClick={() => navigate('/challans')}>
                  Cancel
                </AppButton>
                <AppButton type="submit" variant="primary" disabled={isSubmitting} icon={<Save className="w-4 h-4" />}>
                  {isSubmitting ? 'Saving...' : 'Save Challan'}
                </AppButton>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
