'use client';

import { useState, useEffect } from 'react';
import DataTable, { Column } from '@/components/admin/DataTable';
import FormModal from '@/components/admin/FormModal';
import DeleteDialog from '@/components/admin/DeleteDialog';
import StatusBadge from '@/components/admin/StatusBadge';
import FilterBar from '@/components/admin/FilterBar';
import { Plus, Edit2, Trash2, HeartPulse } from 'lucide-react';
import { toast } from 'react-toastify';
import BreadcrumbsWithSlashSeparator from '@/components/admin/Breadcrumb';
import { MedicalService } from '@/types/Medical-services.types';
import { api } from '@/lib/axios';

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200';

export default function MedicalServicesPage() {
  const [data, setData] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ departmentId: '' });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const fetchDeps = async () => {
    const { data: resData } = await api.get('/departments?limit=200');
    setDepartments(resData.data);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      query.append('limit', '200');
      if (filters.departmentId) query.append('departmentId', filters.departmentId);
      const { data: resData } = await api.get(`/medical-services?${query.toString()}`);
      setData(resData.data);
    } catch (error: any) {
      toast.error(error.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDeps(); }, []);
  useEffect(() => { fetchData(); }, [filters]);

  const handleSave = async (formData: any) => {
    const url = selectedItem
      ? `/medical-services/${selectedItem.id}`
      : '/medical-services';
    const method = selectedItem ? 'put' : 'post';

    await api[method](url, formData);

    toast.success(`Service ${selectedItem ? 'updated' : 'created'} successfully`);
    fetchData();
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    await api.delete(`/medical-services/${selectedItem.id}`);
    toast.success('Service deleted');
    fetchData();
  };

  const columns: Column<MedicalService>[] = [
    { key: 'name', label: 'Service Name', sortable: true },
    {
      key: 'department',
      label: 'Department',
      render: (row) =>
        (row as any).department?.name ? (
          <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-600/20">
            {(row as any).department.name}
          </span>
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
    { key: 'isActive', label: 'Status', render: (row) => <StatusBadge type="boolean" value={row.isActive} /> },
  ];

  const actions = (row: any) => (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={() => { setSelectedItem(row); setIsFormOpen(true); }}
        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-indigo-600"
        title="Edit"
      >
        <Edit2 className="h-4 w-4" />
      </button>
      <button
        onClick={() => { setSelectedItem(row); setIsDeleteOpen(true); }}
        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
        title="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  const expandRow = (row: any) => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Description</p>
        {row.description ? (
          <p className="text-sm text-slate-600 leading-relaxed">{row.description}</p>
        ) : (
          <p className="text-sm italic text-slate-400">No description provided.</p>
        )}
      </div>
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Details</p>
        <dl className="space-y-1 text-sm">
          <div className="flex gap-2">
            <dt className="w-28 flex-shrink-0 text-slate-400">Department:</dt>
            <dd className="font-medium text-slate-700">{row.department?.name || '—'}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-28 flex-shrink-0 text-slate-400">Status:</dt>
            <dd><StatusBadge type="boolean" value={row.isActive} /></dd>
          </div>
        </dl>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-gray-200 bg-white px-4 py-6 rounded-md">
        <BreadcrumbsWithSlashSeparator
          items={[
            { label: 'Dashboard', href: '/admin' },
            { label: 'Medical Services', href: '/admin/medical-services' },
          ]}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50">
            <HeartPulse className="h-5 w-5 text-rose-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-800">Medical Services</h1>
            <p className="text-sm text-slate-500">Manage services offered across departments</p>
          </div>
        </div>
        <button
          onClick={() => { setSelectedItem(null); setIsFormOpen(true); }}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Add Service
        </button>
      </div>

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        searchKeys={['name']}
        actions={actions}
        expandRow={expandRow}
        emptyMessage="No medical services found. Add your first service!"
        headerRight={
          <FilterBar
            filters={[
              {
                key: 'departmentId',
                label: 'Department',
                value: filters.departmentId,
                options: departments.map((d) => ({ label: d.name, value: d.id })),
              },
            ]}
            onChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))}
            onClear={() => setFilters({ departmentId: '' })}
          />
        }
      />

      <FormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedItem ? 'Edit Service' : 'Add Service'}
        initialData={
          selectedItem
            ? {
                ...selectedItem,
                departmentId: selectedItem.departmentId ?? selectedItem.department?.id ?? '',
              }
            : null
        }
        onSubmit={handleSave}
      >
        {({ formData, handleChange }) => (
          <>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Service Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name ?? ''}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g. ECG Examination"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.departmentId ?? ''}
                onChange={(e) => handleChange('departmentId', e.target.value)}
                className={inputClass}
              >
                <option value="" disabled>— Select Department —</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Description</label>
              <textarea
                rows={3}
                value={formData.description ?? ''}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Brief description of this service..."
                className={inputClass}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Active</p>
                <p className="text-xs text-gray-400">Enable to make this service available</p>
              </div>
              <button
                type="button"
                onClick={() => handleChange('isActive', !(formData.isActive ?? true))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  (formData.isActive ?? true) ? 'bg-indigo-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    (formData.isActive ?? true) ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </>
        )}
      </FormModal>

      <DeleteDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        itemName={selectedItem?.name}
      />
    </div>
  );
}
