import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { customerApi } from '../../services/customerApi';
import { AppPageHeader } from '../../components/ui/AppPageHeader';
import { AppFormField } from '../../components/ui/AppFormField';
import { AppButton } from '../../components/ui/AppButton';
import { ArrowLeft, Save } from 'lucide-react';
import { cn } from '../../utils/formatters';

const customerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(5, 'Phone number is required'),
  company: z.string().optional(),
  gstNumber: z.string().optional(),
  address: z.string().min(2, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  type: z.enum(['RETAIL', 'WHOLESALE', 'DISTRIBUTOR']),
  status: z.enum(['LEAD', 'ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

export const CustomerForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isViewMode = !location.pathname.endsWith('/edit') && Boolean(id);
  const isEditMode = location.pathname.endsWith('/edit');
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      type: 'RETAIL',
      status: 'ACTIVE',
    }
  });

  useEffect(() => {
    if ((isEditMode || isViewMode) && id) {
      const fetchCustomer = async () => {
        try {
          const customer = await customerApi.getCustomerById(id);
          reset({
            name: customer.name,
            email: customer.email,
            phone: customer.phone || '',
            company: customer.company || '',
            gstNumber: (customer as any).gstNumber || '',
            address: customer.address || '',
            city: (customer as any).city || '',
            type: customer.type,
            status: customer.status,
          });
        } catch (err) {
          setError('Failed to fetch customer details');
        }
      };
      fetchCustomer();
    }
  }, [id, isEditMode, isViewMode, reset]);

  const onSubmit = async (data: CustomerFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      if (isEditMode && id) {
        await customerApi.updateCustomer(id, data);
      } else {
        await customerApi.createCustomer(data);
      }
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      navigate('/customers');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder:text-gray-400";

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/customers')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <AppPageHeader 
          title={isViewMode ? 'View Customer' : isEditMode ? 'Edit Customer' : 'Add New Customer'} 
          description={isViewMode ? 'View customer details and notes.' : isEditMode ? 'Update customer information.' : 'Create a new customer profile in the system.'}
        />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Customer Information</h3>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm border border-red-100 dark:border-red-800">
              {error}
            </div>
          )}
          
          <fieldset disabled={isViewMode} className="contents">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <AppFormField label="Full Name" required error={errors.name?.message}>
                <input 
                  {...register('name')} 
                  className={inputClass} 
                  placeholder="e.g. John Doe" 
                />
              </AppFormField>

              <AppFormField label="Email Address" required error={errors.email?.message}>
                <input 
                  {...register('email')} 
                  type="email" 
                  className={inputClass} 
                  placeholder="john@company.com" 
                />
              </AppFormField>

              <AppFormField label="Phone Number" required error={errors.phone?.message}>
                <input 
                  {...register('phone')} 
                  className={inputClass} 
                  placeholder="+91 98765 43210" 
                />
              </AppFormField>

              <AppFormField label="Company / Organisation" error={errors.company?.message}>
                <input 
                  {...register('company')} 
                  className={inputClass} 
                  placeholder="Acme Corp" 
                />
              </AppFormField>

              <AppFormField label="GST Number (Optional)" error={errors.gstNumber?.message}>
                <input 
                  {...register('gstNumber')} 
                  className={inputClass} 
                  placeholder="22AAAAA0000A1Z5" 
                />
              </AppFormField>
              
              <AppFormField label="Customer Type" required error={errors.type?.message}>
                <select {...register('type')} className={inputClass}>
                  <option value="RETAIL">Retail</option>
                  <option value="WHOLESALE">Wholesale</option>
                  <option value="DISTRIBUTOR">Distributor</option>
                </select>
              </AppFormField>

              <AppFormField label="Status" required error={errors.status?.message}>
                <select {...register('status')} className={inputClass}>
                  <option value="ACTIVE">Active</option>
                  <option value="LEAD">Lead</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </AppFormField>

              <AppFormField label="City" required error={errors.city?.message}>
                <input 
                  {...register('city')} 
                  className={inputClass} 
                  placeholder="Mumbai" 
                />
              </AppFormField>

              <div className="md:col-span-2">
                <AppFormField label="Address" required error={errors.address?.message}>
                  <textarea 
                    {...register('address')} 
                    className={cn(inputClass, "min-h-[80px] resize-y")} 
                    placeholder="123 Business Street, Floor 4..." 
                  />
                </AppFormField>
              </div>
            </div>
          </fieldset>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
            {isViewMode ? (
              <>
                <AppButton type="button" variant="outline" onClick={() => navigate('/customers')}>
                  Back to List
                </AppButton>
                <AppButton type="button" variant="primary" onClick={() => navigate(`/customers/${id}/edit`)}>
                  Edit Customer
                </AppButton>
              </>
            ) : (
              <>
                <AppButton type="button" variant="outline" onClick={() => navigate('/customers')}>
                  Cancel
                </AppButton>
                <AppButton type="submit" variant="primary" disabled={isSubmitting} icon={<Save className="w-4 h-4" />}>
                  {isSubmitting ? 'Saving...' : isEditMode ? 'Update Customer' : 'Create Customer'}
                </AppButton>
              </>
            )}
          </div>
        </form>
      </div>

      {(isViewMode || isEditMode) && id && (
        <CustomerNotesSection customerId={id} />
      )}
    </div>
  );
};

// --- Customer Notes Component ---
const CustomerNotesSection: React.FC<{ customerId: string }> = ({ customerId }) => {
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const customer = await customerApi.getCustomerById(customerId);
        setNotes((customer as any).notes || []);
      } catch (err) {}
    };
    fetchNotes();
  }, [customerId]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setIsSubmitting(true);
    try {
      await customerApi.addNote(customerId, {
        note: newNote,
        type: 'NOTE',
        followUpDate: followUpDate || null,
      });
      setNewNote('');
      setFollowUpDate('');
      const updatedCustomer = await customerApi.getCustomerById(customerId);
      setNotes((updatedCustomer as any).notes || []);
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    } catch (err) {
      console.error('Failed to add note', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden mt-8">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Notes & Follow-ups</h3>
      </div>
      <div className="p-6">
        <form onSubmit={handleAddNote} className="mb-6 space-y-4">
          <AppFormField label="New Note">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder:text-gray-400 min-h-[80px]"
              placeholder="Add a follow-up note..."
              required
            />
          </AppFormField>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <AppFormField label="Follow-up Date (Optional)">
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </AppFormField>
            </div>
            <AppButton type="submit" variant="primary" disabled={isSubmitting || !newNote.trim()}>
              {isSubmitting ? 'Adding...' : 'Add Note'}
            </AppButton>
          </div>
        </form>

        <div className="space-y-4">
          {notes.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No notes found for this customer.</p>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800">
                <p className="text-sm text-gray-900 dark:text-white mb-2">{note.note}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <span>By: {note.user?.name || 'Unknown'}</span>
                  <span>{new Date(note.createdAt).toLocaleString()}</span>
                  {note.followUpDate && (
                    <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                      Follow-up: {new Date(note.followUpDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
