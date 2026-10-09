"use client";

import { useState, useEffect } from "react";
import DataTable, { Column } from "@/components/admin/DataTable";
import FormModal, { FormField } from "@/components/admin/FormModal";
import DeleteDialog from "@/components/admin/DeleteDialog";
import StatusBadge from "@/components/admin/StatusBadge";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import BreadcrumbsWithSlashSeparator from "@/components/admin/Breadcrumb";
import { api } from "@/lib/axios";

export default function FAQsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      query.append("limit", "200");
      const { data: resData } = await api.get(`/faqs?${query.toString()}`);
      setData(resData.data);
    } catch (error: any) {
      toast.error(error.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (formData: any) => {
    const url = selectedItem
      ? `/faqs/${selectedItem.id}`
      : "/faqs";
    const method = selectedItem ? "put" : "post";

    await api[method](url, formData);

    toast.success(`FAQ ${selectedItem ? "updated" : "created"} successfully`);
    fetchData();
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    await api.delete(`/faqs/${selectedItem.id}`);
    toast.success("FAQ deleted");
    fetchData();
  };

  const formFields: FormField[] = [
    { name: "question", label: "Question", type: "text", required: true },
    { name: "answer", label: "Answer", type: "textarea", required: true },
    {
      name: "category",
      label: "Category",
      type: "text",
    },
  ];

  const columns: Column<any>[] = [
    {
      key: "question",
      label: "Question",
      sortable: true,
      className: "max-w-[300px] truncate",
    },
    {
      key: "answer",
      label: "Answer",
      className: "max-w-[400px] truncate text-gray-400",
    },
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
              label: "Faqs",
              href: "/admin/faqs",
            },
          ]}
        />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Faqs</h1>
          <p className="text-sm text-slate-500">
            Manage frequently asked questions
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedItem(null);
            setIsFormOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Add FAQ
        </button>
      </div>

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        searchKeys={["question", "answer", "category"]}
        actions={actions}
      />

      <FormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedItem ? "Edit FAQ" : "Add FAQ"}
        fields={formFields}
        initialData={selectedItem}
        onSubmit={handleSave}
      />

      <DeleteDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        itemName={selectedItem?.question}
      />
    </div>
  );
}
