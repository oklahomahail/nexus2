import React, { useEffect, useRef, useState } from "react";

import Modal from "@/components/ui-kit/Modal";
import {
  createClient,
  updateClient,
  Client,
  CreateClientData,
  UpdateClientData,
} from "@/services/clientService";

export type ClientModalMode = "create" | "edit";

interface ClientModalProps {
  open: boolean;
  mode: ClientModalMode;
  client?: Client | null; // only for edit mode
  onClose: () => void;
  onSaved?: (client: Client) => void; // notify parent to refresh, navigate, etc.
}

const defaultValues: CreateClientData = {
  name: "",
  shortName: "",
  website: "",
  primaryContactName: "",
  primaryContactEmail: "",
  notes: "",
};

export default function ClientModal({
  open,
  mode,
  client,
  onClose,
  onSaved,
}: ClientModalProps) {
  const [values, setValues] = useState<CreateClientData>(defaultValues);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement | null>(null);

  const isEdit = mode === "edit";

  useEffect(() => {
    if (!open) return;
    if (isEdit && client) {
      setValues({
        name: client.name,
        shortName: client.shortName ?? "",
        website: client.website ?? "",
        primaryContactName: client.primaryContactName ?? "",
        primaryContactEmail: client.primaryContactEmail ?? "",
        notes: client.notes ?? "",
      });
    } else {
      setValues(defaultValues);
    }
    setError(null);

    const t = setTimeout(() => nameRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [open, isEdit, client]);

  const validate = (): string | null => {
    if (!values.name.trim()) return "Client name is required.";
    if (
      values.primaryContactEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.primaryContactEmail)
    ) {
      return "Please enter a valid email address.";
    }
    return null;
  };

  const handleChange =
    (key: keyof CreateClientData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((prev: CreateClientData) => ({
        ...prev,
        [key]: e.target.value,
      }));
    };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (saving) return;

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError(null);

      let saved: Client;
      if (isEdit && client) {
        const updates: UpdateClientData = { ...values };
        const updated = await updateClient(client.id, updates);
        if (!updated) throw new Error("Failed to update client.");
        saved = updated;
      } else {
        const created = await createClient(values);
        saved = created;
      }

      onSaved?.(saved);
      onClose();
    } catch (err: any) {
      console.error("ClientModal save error", err);
      setError(err?.message || "An error occurred while saving the client.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Client" : "New Client"}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="client-name" className="text-sm font-medium">
              Client Name <span className="text-red-500">*</span>
            </label>
            <input
              id="client-name"
              ref={nameRef}
              type="text"
              value={values.name}
              onChange={handleChange("name")}
              placeholder="Acme Nonprofit"
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="client-shortName" className="text-sm font-medium">
              Short Name
            </label>
            <input
              id="client-shortName"
              type="text"
              value={values.shortName || ""}
              onChange={handleChange("shortName")}
              placeholder="Acme"
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="client-website" className="text-sm font-medium">
              Website
            </label>
            <input
              id="client-website"
              type="url"
              value={values.website || ""}
              onChange={handleChange("website")}
              placeholder="https://example.org"
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="client-contact-name"
              className="text-sm font-medium"
            >
              Primary Contact
            </label>
            <input
              id="client-contact-name"
              type="text"
              value={values.primaryContactName || ""}
              onChange={handleChange("primaryContactName")}
              placeholder="Jane Doe"
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
            />
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label
              htmlFor="client-contact-email"
              className="text-sm font-medium"
            >
              Primary Contact Email
            </label>
            <input
              id="client-contact-email"
              type="email"
              value={values.primaryContactEmail || ""}
              onChange={handleChange("primaryContactEmail")}
              placeholder="jane@example.org"
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="client-notes" className="text-sm font-medium">
            Notes
          </label>
          <textarea
            id="client-notes"
            value={values.notes || ""}
            onChange={handleChange("notes")}
            placeholder="Internal notes about this client..."
            className="min-h-[90px] w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
          />
        </div>

        <div className="mt-2 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? isEdit
                ? "Saving..."
                : "Creating..."
              : isEdit
                ? "Save Changes"
                : "Create Client"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
