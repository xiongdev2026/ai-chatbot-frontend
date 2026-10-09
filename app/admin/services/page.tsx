"use client";

import { useState, useEffect } from "react";
import DataTable, { Column } from "@/components/admin/DataTable";
import FormModal, { FormField } from "@/components/admin/FormModal";
import DeleteDialog from "@/components/admin/DeleteDialog";
import StatusBadge from "@/components/admin/StatusBadge";
import FilterBar from "@/components/admin/FilterBar";
import { Plus, Edit2, Trash2, UserCog } from "lucide-react";
import { toast } from "react-toastify";
import BreadcrumbsWithSlashSeparator from "@/components/admin/Breadcrumb";
import { api } from "@/lib/axios";

export default function ServicesPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: "", isActive: "" });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      query.append("limit", "200");
      if (filters.category) query.append("category", filters.category);
      if (filters.isActive) query.append("isActive", filters.isActive);

      const { data: resData } = await api.get(`/services?${query.toString()}`);
      setData(resData.data);
    } catch (error: any) {
      toast.error(error.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const handleSave = async (formData: any) => {
    const url = selectedItem ? `/services/${selectedItem.id}` : "/services";
    const method = selectedItem ? "put" : "post";

    await api[method](url, formData);

    toast.success(
      `Service ${selectedItem ? "updated" : "created"} successfully`,
    );
    fetchData();
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    await api.delete(`/services/${selectedItem.id}`);
    toast.success("Service deleted");
    fetchData();
  };

  const formFields: FormField[] = [
    { name: "name", label: "Service Name", type: "text", required: true },
    { name: "shortDescription", label: "Short Description", type: "text" },
    { name: "fullDescription", label: "Full Description", type: "textarea" },
    {
      name: "category",
      label: "Category",
      type: "select",
      options: [
        { label: "General", value: "GENERAL" },
        { label: "Medical", value: "MEDICAL" },
        { label: "Technical", value: "TECHNICAL" },
        { label: "Finance", value: "FINANCE" },
      ],
    },
    { name: "isActive", label: "Active", type: "toggle", defaultValue: true },
  ];

  const columns: Column<any>[] = [
    { key: "name", label: "Name", sortable: true },
    {
      key: "category",
      label: "Category",
      render: (row) =>
        row.category ? (
          <StatusBadge type="category" value={row.category} />
        ) : (
          "—"
        ),
    },
    {
      key: "isActive",
      label: "Status",
      render: (row) => <StatusBadge type="boolean" value={row.isActive} />,
    },
    {
      key: "creator",
      label: "Created By",
      render: (row) => row.creator?.fullName || row.creator?.email || "—",
    },
  ];

  const actions = (row: any) => (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={() => {
          setSelectedItem(row);
          setIsFormOpen(true);
        }}
        className="rounded-lg p-1.5 text-gray-400 transition hover:bg-white/10 hover:text-indigo-400"
      >
        <Edit2 className="h-4 w-4" />
      </button>
      <button
        onClick={() => {
          setSelectedItem(row);
          setIsDeleteOpen(true);
        }}
        className="rounded-lg p-1.5 text-gray-400 transition hover:bg-white/10 hover:text-rose-400"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-gray-200 bg-white px-4 py-6 rounded-md">
        <BreadcrumbsWithSlashSeparator
          items={[
            {
              label: "Dashboard",
              href: "/admin",
            },
            {
              label: "Services",
              href: "/admin/services",
            },
          ]}
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
            <UserCog className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-800">Services</h1>
            <p className="text-sm text-slate-500">
              Manage services and their details
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setSelectedItem(null);
            setIsFormOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Add Service
        </button>
      </div>

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        searchKeys={["name"]}
        actions={actions}
        headerRight={
          <FilterBar
            filters={[
              {
                key: "category",
                label: "Category",
                value: filters.category,
                options: [
                  { label: "General", value: "GENERAL" },
                  { label: "Medical", value: "MEDICAL" },
                  { label: "Technical", value: "TECHNICAL" },
                  { label: "Finance", value: "FINANCE" },
                ],
              },
              {
                key: "isActive",
                label: "Status",
                value: filters.isActive,
                options: [
                  { label: "Active", value: "true" },
                  { label: "Inactive", value: "false" },
                ],
              },
            ]}
            onChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))}
            onClear={() => setFilters({ category: "", isActive: "" })}
          />
        }
      />

      <FormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedItem ? "Edit Service" : "Add Service"}
        fields={formFields}
        initialData={selectedItem}
        onSubmit={handleSave}
      />

      <DeleteDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        itemName={selectedItem?.name}
      />
    </div>
  );
}
