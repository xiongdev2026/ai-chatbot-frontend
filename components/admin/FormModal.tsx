'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

export type FormField = {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'toggle' | 'number';
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string | number }[]; // For select
  defaultValue?: any;
};

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  submitLabel?: string;
  initialData?: Record<string, any> | null;
  fields?: FormField[]; // Restored for backward compatibility with pages not yet using custom children
  children?:
    | React.ReactNode
    | ((props: {
        formData: Record<string, any>;
        handleChange: (name: string, value: any) => void;
        setFormData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
      }) => React.ReactNode);
}

export default function FormModal({
  isOpen,
  onClose,
  title,
  onSubmit,
  submitLabel = 'Save',
  initialData,
  fields,
  children,
}: FormModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const initial: Record<string, any> = {};
      if (fields) {
        fields.forEach((f) => {
          initial[f.name] = initialData?.[f.name] ?? f.defaultValue ?? '';
          if (f.type === 'toggle' && initial[f.name] === '') {
            initial[f.name] = false;
          }
        });
      } else {
        Object.assign(initial, initialData ?? {});
      }
      setFormData(initial);
      setError(null);
    }
  }, [isOpen, initialData, fields]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative w-full max-w-lg overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Error */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Custom fields rendered by each page */}
          <div className="space-y-4">
            {typeof children === 'function'
              ? children({ formData, handleChange, setFormData })
              : children}

            {/* Legacy fields rendering for backward compatibility */}
            {fields &&
              fields.map((field) => (
                <div key={field.name}>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>

                  {field.type === 'textarea' ? (
                    <textarea
                      required={field.required}
                      value={formData[field.name] ?? ''}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      rows={4}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
                    />
                  ) : field.type === 'select' ? (
                    <select
                      required={field.required}
                      value={formData[field.name] ?? ''}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
                    >
                      <option value="" disabled>
                        — Select {field.label} —
                      </option>
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'toggle' ? (
                    <button
                      type="button"
                      onClick={() => handleChange(field.name, !formData[field.name])}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        formData[field.name] ? 'bg-indigo-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          formData[field.name] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  ) : (
                    <input
                      type={field.type}
                      required={field.required}
                      value={formData[field.name] ?? ''}
                      onChange={(e) =>
                        handleChange(
                          field.name,
                          field.type === 'number' ? Number(e.target.value) : e.target.value
                        )
                      }
                      placeholder={field.placeholder}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
                    />
                  )}
                </div>
              ))}
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
