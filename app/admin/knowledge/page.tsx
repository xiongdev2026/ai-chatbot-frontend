"use client";

import { useState, useEffect } from "react";
import DataTable, { Column } from "@/components/admin/DataTable";
import FormModal, { FormField } from "@/components/admin/FormModal";
import DeleteDialog from "@/components/admin/DeleteDialog";
import StatusBadge from "@/components/admin/StatusBadge";
import { Plus, Edit2, Trash2, KanbanIcon } from "lucide-react";
import BreadcrumbsWithSlashSeparator from "@/components/admin/Breadcrumb";
import { toast } from "react-toastify";
import { api } from "@/lib/axios";

export default function KnowledgePage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Chunk Modal
  const [isChunkModalOpen, setIsChunkModalOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState<any>(null);
  const [chunkContent, setChunkContent] = useState("");
  const [isAddingChunk, setIsAddingChunk] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: resData } = await api.get("/knowledge");
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
    const url = selectedItem ? `/knowledge/${selectedItem.id}` : "/knowledge";
    const method = selectedItem ? "put" : "post";

    await api[method](url, formData);

    toast.success(
      `Source ${selectedItem ? "updated" : "created"} successfully`,
    );
    fetchData();
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    await api.delete(`/knowledge/${selectedItem.id}`);
    toast.success("Source deleted");
    fetchData();
  };

  const handleAddChunk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSource || !chunkContent.trim()) return;

    setIsAddingChunk(true);
    try {
      await api.post(`/knowledge/${selectedSource.id}/chunks`, {
        content: chunkContent,
      });
      toast.success("Chunk added & embedded successfully");
      setChunkContent("");
      setIsChunkModalOpen(false);
      fetchData(); // Refresh to update chunk counts
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message);
    } finally {
      setIsAddingChunk(false);
    }
  };

  const formFields: FormField[] = [
    { name: "title", label: "Title", type: "text", required: true },
    {
      name: "sourceType",
      label: "Type",
      type: "select",
      options: [
        { label: "Document", value: "DOCUMENT" },
        { label: "Website", value: "WEBSITE" },
        { label: "FAQ", value: "FAQ" },
        { label: "Post", value: "POST" },
      ],
    },
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
    { key: "title", label: "Title", sortable: true },
    {
      key: "sourceType",
      label: "Type",
      render: (row) => row.sourceType || "—",
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
    {
      key: "chunks",
      label: "Chunks",
      render: (row) => `${row._count?.chunks || 0} chunks`,
    },
    {
      key: "isActive",
      label: "Status",
      render: (row) => <StatusBadge type="boolean" value={row.isActive} />,
    },
  ];

  const actions = (row: any) => (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={() => {
          setSelectedSource(row);
          setIsChunkModalOpen(true);
        }}
        className="rounded-lg bg-indigo-500/10 px-2 py-1 text-xs font-medium text-indigo-400 hover:bg-indigo-500/20 transition"
      >
        + Add Chunk
      </button>
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
              label: "Knowledge",
              href: "/admin/knowledge",
            },
          ]}
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
            <KanbanIcon className="h-5 w-5 text-yellow-500" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-800">
              Knowledge Sources
            </h1>
            <p className="text-sm text-slate-500">
              Manage knowledge sources and their content
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
          Add Source
        </button>
      </div>

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        searchKeys={["title"]}
        actions={actions}
      />

      <FormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedItem ? "Edit Source" : "Add Source"}
        fields={formFields}
        initialData={selectedItem}
        onSubmit={handleSave}
      />

      <DeleteDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        itemName={selectedItem?.title}
        description="This will delete the source AND all associated knowledge chunks. This action cannot be undone."
      />

      {/* Add Chunk Modal */}
      {isChunkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsChunkModalOpen(false)}
          />
          <div className="relative w-full max-w-lg overflow-hidden rounded-md border border-white/[0.08] bg-[#1c1933] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="border-b border-white/[0.06] px-6 py-4">
              <h2 className="text-lg font-semibold text-white">
                Add Chunk to {selectedSource?.title}
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                This text will be embedded into vector space.
              </p>
            </div>
            <form onSubmit={handleAddChunk} className="p-6">
              <textarea
                required
                value={chunkContent}
                onChange={(e) => setChunkContent(e.target.value)}
                placeholder="Enter text content to embed..."
                rows={6}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 outline-none transition focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
              />
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsChunkModalOpen(false)}
                  disabled={isAddingChunk}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingChunk || !chunkContent.trim()}
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {isAddingChunk ? "Embedding..." : "Save Chunk"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
