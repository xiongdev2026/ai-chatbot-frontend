"use client";

import { useState, useEffect } from "react";
import DataTable, { Column } from "@/components/admin/DataTable";
import FormModal, { FormField } from "@/components/admin/FormModal";
import DeleteDialog from "@/components/admin/DeleteDialog";
import StatusBadge from "@/components/admin/StatusBadge";
import FilterBar from "@/components/admin/FilterBar";
import { Plus, Edit2, Trash2, FilePlusCorner } from "lucide-react";
import { toast } from "react-toastify";
import BreadcrumbsWithSlashSeparator from "@/components/admin/Breadcrumb";
import { api } from "@/lib/axios";

export default function PostsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: "" });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      query.append("limit", "200");
      if (filters.status) query.append("status", filters.status);

      const { data: resData } = await api.get(`/posts?${query.toString()}`);
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
    const url = selectedItem ? `/posts/${selectedItem.id}` : "/posts";
    const method = selectedItem ? "put" : "post";

    await api[method](url, formData);

    toast.success(`Post ${selectedItem ? "updated" : "created"} successfully`);
    fetchData();
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    await api.delete(`/posts/${selectedItem.id}`);
    toast.success("Post deleted");
    fetchData();
  };

  const formFields: FormField[] = [
    { name: "title", label: "Title", type: "text", required: true },
    {
      name: "content",
      label: "Content (Markdown Supported)",
      type: "textarea",
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "Draft", value: "DRAFT" },
        { label: "Published", value: "PUBLISHED" },
        { label: "Archived", value: "ARCHIVED" },
      ],
      defaultValue: "DRAFT",
    },
  ];

  const columns: Column<any>[] = [
    { key: "title", label: "Title", sortable: true },
    {
      key: "slug",
      label: "Slug",
      render: (row) => (
        <span className="text-gray-500 font-mono text-xs">{row.slug}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge type="post_status" value={row.status} />,
    },
    {
      key: "creator",
      label: "Author",
      render: (row) => row.creator?.fullName || row.creator?.email || "—",
    },
    {
      key: "createdAt",
      label: "Date",
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
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
              label: "Posts",
              href: "/admin/posts",
            },
          ]}
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
            <FilePlusCorner className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-800">
              Posts
            </h1>
            <p className="text-sm text-slate-500">
              Manage blog posts and their content
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
          Add Post
        </button>
      </div>

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        searchKeys={["title", "slug"]}
        actions={actions}
        headerRight={
          <FilterBar
            filters={[
              {
                key: "status",
                label: "Status",
                value: filters.status,
                options: [
                  { label: "Draft", value: "DRAFT" },
                  { label: "Published", value: "PUBLISHED" },
                  { label: "Archived", value: "ARCHIVED" },
                ],
              },
            ]}
            onChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))}
            onClear={() => setFilters({ status: "" })}
          />
        }
      />

      <FormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedItem ? "Edit Post" : "Create Post"}
        fields={formFields}
        initialData={selectedItem}
        onSubmit={handleSave}
      />

      <DeleteDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        itemName={selectedItem?.title}
      />
    </div>
  );
}
