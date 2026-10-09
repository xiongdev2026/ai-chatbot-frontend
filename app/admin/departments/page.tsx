'use client';

import { useState, useEffect } from 'react';
import DataTable, { Column } from '@/components/admin/DataTable';
import FormModal from '@/components/admin/FormModal';
import DeleteDialog from '@/components/admin/DeleteDialog';
import StatusBadge from '@/components/admin/StatusBadge';
import { Plus, Edit2, Trash2, Building2 } from 'lucide-react';
import { toast } from 'react-toastify';
import BreadcrumbsWithSlashSeparator from '@/components/admin/Breadcrumb';
import { Department } from '@/types/department.types';
import { api } from '@/lib/axios';

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200';

export default function DepartmentsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: resData } = await api.get('/departments?limit=200');
      setData(resData.data);
    } catch (error: any) {
      toast.error(error.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async (formData: any) => {
    const url = selectedItem
      ? `/departments/${selectedItem.id}`
      : '/departments';
    const method = selectedItem ? 'put' : 'post';

    await api[method](url, formData);

    toast.success(`Department ${selectedItem ? 'updated' : 'created'} successfully`);
    fetchData();
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    await api.delete(`/departments/${selectedItem.id}`);
    toast.success('Department deleted');
    fetchData();
  };

  const columns: Column<Department>[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'openingHours', label: 'Opening Hours', render: (row) => (row as any).openingHours || '—' },
    { key: 'location', label: 'Location', render: (row) => (row as any).location || '—', sortable: true },
    {
      key: 'doctors',
      label: 'Doctors',
      render: (row) => (
        <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-600/20">
          {(row as any)._count?.doctors ?? 0}
        </span>
      ),
    },
    {
      key: 'medicalServices',
      label: 'Services',
      render: (row) => (
        <span className="inline-flex items-center rounded-full bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700 ring-1 ring-inset ring-violet-600/20">
          {(row as any)._count?.medicalServices ?? 0}
        </span>
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
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {row.description && (
        <div className="sm:col-span-2">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Description</p>
          <p className="text-sm text-slate-600">{row.description}</p>
        </div>
      )}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Doctors ({row.doctors?.length || 0})
        </p>
        {row.doctors?.length > 0 ? (
          <ul className="space-y-1">
            {row.doctors.map((d: any) => (
              <li key={d.id} className="flex items-center gap-2 text-sm">
                <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-400" />
                <span className="font-medium text-slate-700">{d.fullName}</span>
                {d.specialty && <span className="text-slate-400">— {d.specialty}</span>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm italic text-slate-400">No doctors assigned.</p>
        )}
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Medical Services ({row.medicalServices?.length || 0})
        </p>
        {row.medicalServices?.length > 0 ? (
          <ul className="space-y-1">
            {row.medicalServices.map((s: any) => (
              <li key={s.id} className="flex items-center gap-2 text-sm">
                <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-violet-400" />
                <span className="font-medium text-slate-700">{s.name}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm italic text-slate-400">No services added.</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-gray-200 bg-white px-4 py-6 rounded-md">
        <BreadcrumbsWithSlashSeparator
          items={[
            { label: 'Dashboard', href: '/admin' },
            { label: 'Departments', href: '/admin/departments' },
          ]}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
            <Building2 className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-800">Departments</h1>
            <p className="text-sm text-slate-500">Manage hospital departments and their assignments</p>
          </div>
        </div>
        <button
          onClick={() => { setSelectedItem(null); setIsFormOpen(true); }}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Add Department
        </button>
      </div>

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        searchKeys={['name', 'location']}
        actions={actions}
        expandRow={expandRow}
        emptyMessage="No departments found. Create your first department!"
      />

      <FormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedItem ? 'Edit Department' : 'Add Department'}
        initialData={selectedItem}
        onSubmit={handleSave}
      >
        {({ formData, handleChange }) => (
          <>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Department Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name ?? ''}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g. Cardiology"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Description</label>
              <textarea
                rows={3}
                value={formData.description ?? ''}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Brief description of this department"
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Opening Hours</label>
                <input
                  type="text"
                  value={formData.openingHours ?? ''}
                  onChange={(e) => handleChange('openingHours', e.target.value)}
                  placeholder="e.g. 08:00 - 17:00"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  value={formData.location ?? ''}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="e.g. Floor 2, Wing A"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Active</p>
                <p className="text-xs text-gray-400">Enable to make this department visible</p>
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
        description="This will permanently delete this department. You cannot delete a department if it still has doctors or services assigned to it."
      />
    </div>
  );
}
