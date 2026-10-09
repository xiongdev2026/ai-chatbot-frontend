"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, User } from "lucide-react";
import { toast } from "react-toastify";

import DataTable, { Column } from "@/components/admin/DataTable";
import FormModal, { FormField } from "@/components/admin/FormModal";
import DeleteDialog from "@/components/admin/DeleteDialog";
import StatusBadge from "@/components/admin/StatusBadge";
import FilterBar from "@/components/admin/FilterBar";

import { api } from "@/lib/axios";
import BreadcrumbsWithSlashSeparator from "@/components/admin/Breadcrumb";

interface User {
  id: string;
  email: string;
  fullName: string | null;
  role: "USER" | "ADMIN";
  isActive: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    role: "",
    isActive: "",
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedItem, setSelectedItem] = useState<User | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);

      const query = new URLSearchParams();
      query.append("limit", "200");

      if (filters.role) {
        query.append("role", filters.role);
      }

      if (filters.isActive) {
        query.append("isActive", filters.isActive);
      }

      const res = await api.get(`/users?${query.toString()}`);

      setData(res.data.data);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreateOrUpdate = async (formData: Record<string, any>) => {
    try {
      if (selectedItem && !formData.password) {
        delete formData.password;
      }

      if (selectedItem) {
        await api.put(`/users/${selectedItem.id}`, formData);
      } else {
        await api.post("/users", formData);
      }

      toast.success(
        `User ${selectedItem ? "updated" : "created"} successfully`,
      );

      setIsFormOpen(false);
      setSelectedItem(null);

      await fetchUsers();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Failed to save user",
      );
    }
  };

  const handleDelete = async () => {
    try {
      if (!selectedItem) return;

      await api.delete(`/users/${selectedItem.id}`);

      toast.success("User deleted successfully");

      setIsDeleteOpen(false);
      setSelectedItem(null);

      await fetchUsers();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete user");
    }
  };

  const formFields: FormField[] = [
    {
      name: "fullName",
      label: "Full Name",
      type: "text",
      required: true,
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      required: true,
    },
    ...(selectedItem
      ? []
      : [
          {
            name: "password",
            label: "Password",
            type: "password" as const,
            required: true,
          },
        ]),
    {
      name: "role",
      label: "Role",
      type: "select",
      defaultValue: "USER",
      options: [
        {
          label: "User",
          value: "USER",
        },
        {
          label: "Admin",
          value: "ADMIN",
        },
      ],
    },
    {
      name: "isActive",
      label: "Active",
      type: "toggle",
      defaultValue: true,
    },
  ];

  const columns: Column<User>[] = [
    {
      key: "fullName",
      label: "User",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
            {row.fullName?.charAt(0).toUpperCase() ||
              row.email.charAt(0).toUpperCase()}
          </div>

          <div>
            <p className="font-medium text-slate-900">
              {row.fullName || "No Name"}
            </p>

            <p className="text-xs text-slate-500">{row.email}</p>
          </div>
        </div>
      ),
    },

    {
      key: "role",
      label: "Role",
      sortable: true,
      render: (row) => <StatusBadge type="role" value={row.role} />,
    },

    {
      key: "isActive",
      label: "Status",
      sortable: true,
      render: (row) => <StatusBadge type="boolean" value={row.isActive} />,
    },

    {
      key: "createdAt",
      label: "Joined",
      sortable: true,
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
  ];

  const actions = (row: User) => (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={() => {
          setSelectedItem(row);
          setIsFormOpen(true);
        }}
        className="rounded-lg p-2 text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-600"
      >
        <Edit2 className="h-4 w-4" />
      </button>

      <button
        onClick={() => {
          setSelectedItem(row);
          setIsDeleteOpen(true);
        }}
        className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 bg-white px-4 py-6 rounded-md">
        <BreadcrumbsWithSlashSeparator
          items={[
            {
              label: "Dashboard",
              href: "/admin",
            },
            {
              label: "Users",
              href: "/admin/users",
            },
          ]}
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
            <User className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-800">Users</h1>
            <p className="text-sm text-slate-500">
              Manage hospital users and their assignments
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
          Add User
        </button>
      </div>

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        searchKeys={["fullName", "email"]}
        pageSize={10}
        actions={actions}
        headerRight={
          <FilterBar
            filters={[
              {
                key: "role",
                label: "Role",
                value: filters.role,
                options: [
                  { label: "Admin", value: "ADMIN" },
                  { label: "User", value: "USER" },
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
            onChange={(key, value) =>
              setFilters((prev) => ({
                ...prev,
                [key]: value,
              }))
            }
            onClear={() =>
              setFilters({
                role: "",
                isActive: "",
              })
            }
          />
        }
      />

      <FormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedItem(null);
        }}
        title={selectedItem ? "Edit User" : "Create User"}
        fields={formFields}
        initialData={selectedItem}
        onSubmit={handleCreateOrUpdate}
      />

      <DeleteDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedItem(null);
        }}
        onConfirm={handleDelete}
        itemName={selectedItem?.email}
      />
    </div>
  );
}
