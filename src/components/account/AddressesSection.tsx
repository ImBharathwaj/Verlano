"use client";

import { useState, useEffect } from "react";

type Address = {
  id: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
};

type AddressForm = {
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
};

const emptyForm = (): AddressForm => ({
  name: "",
  phone: "",
  street: "",
  city: "",
  state: "",
  postalCode: "",
});

export function AddressesSection() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/account/addresses", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setAddresses(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const startAdd = () => {
    setAdding(true);
    setEditingId(null);
    setForm(emptyForm());
    setError(null);
  };

  const startEdit = (a: Address) => {
    setEditingId(a.id);
    setAdding(false);
    setForm({
      name: a.name,
      phone: a.phone,
      street: a.street,
      city: a.city,
      state: a.state,
      postalCode: a.postalCode,
    });
    setError(null);
  };

  const cancel = () => {
    setAdding(false);
    setEditingId(null);
    setForm(emptyForm());
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.street.trim() || !form.city.trim() || !form.state.trim() || !form.postalCode.trim()) {
      setError("All fields are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (editingId) {
        const res = await fetch(`/api/account/addresses/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Update failed");
          return;
        }
        setAddresses((prev) => prev.map((a) => (a.id === editingId ? data : a)));
        cancel();
      } else {
        const res = await fetch("/api/account/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Add failed");
          return;
        }
        setAddresses((prev) => [...prev, data]);
        cancel();
      }
    } catch {
      setError("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this address?")) return;
    try {
      const res = await fetch(`/api/account/addresses/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch {
      setError("Failed to delete.");
    }
  };

  if (loading) {
    return (
      <div className="mt-2 animate-pulse space-y-2">
        <div className="h-16 rounded bg-gray-soft/50" />
        <div className="h-16 rounded bg-gray-soft/50" />
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-4">
      {addresses.length === 0 && !adding && (
        <p className="text-sm text-gray-deep/70">No saved addresses. Add one below.</p>
      )}
      <ul className="space-y-3">
        {addresses.map((a) => (
          <li key={a.id} className="rounded-lg border border-gray-soft bg-gray-soft/20 p-3">
            {editingId === a.id ? (
              <form onSubmit={handleSubmit} className="space-y-2">
                <AddressFormFields form={form} setForm={setForm} />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-full border border-ink bg-ink px-3 py-1.5 text-xs font-medium text-white hover:bg-ink/90 disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={cancel}
                    className="rounded-full border border-gray-deep/30 px-3 py-1.5 text-xs font-medium text-gray-deep"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="text-sm text-gray-deep/90">
                  <p className="font-medium text-ink">{a.name}</p>
                  <p>{a.phone}</p>
                  <p>{a.street}, {a.city}, {a.state} {a.postalCode}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(a)}
                    className="text-xs font-medium text-ink underline hover:no-underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(a.id)}
                    className="text-xs font-medium text-red-600 underline hover:no-underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
      {(adding || (addresses.length === 0 && !adding)) && !editingId && (
        <div className="rounded-lg border border-gray-soft bg-gray-soft/10 p-3">
          {adding ? (
            <form onSubmit={handleSubmit} className="space-y-2">
              <AddressFormFields form={form} setForm={setForm} />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full border border-ink bg-ink px-3 py-1.5 text-xs font-medium text-white hover:bg-ink/90 disabled:opacity-50"
                >
                  Add address
                </button>
                <button
                  type="button"
                  onClick={cancel}
                  className="rounded-full border border-gray-deep/30 px-3 py-1.5 text-xs font-medium text-gray-deep"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={startAdd}
              className="text-sm font-medium text-ink underline hover:no-underline"
            >
              + Add address
            </button>
          )}
        </div>
      )}
      {addresses.length > 0 && !adding && !editingId && (
        <button
          type="button"
          onClick={startAdd}
          className="text-sm font-medium text-ink underline hover:no-underline"
        >
          + Add another address
        </button>
      )}
      {error && !editingId && !adding && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

function AddressFormFields({
  form,
  setForm,
}: {
  form: AddressForm;
  setForm: React.Dispatch<React.SetStateAction<AddressForm>>;
}) {
  return (
    <>
      <div>
        <label className="mb-0.5 block text-xs text-gray-deep/80">Name</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="w-full rounded border border-gray-soft px-2 py-1.5 text-sm"
          required
        />
      </div>
      <div>
        <label className="mb-0.5 block text-xs text-gray-deep/80">Phone</label>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          className="w-full rounded border border-gray-soft px-2 py-1.5 text-sm"
          required
        />
      </div>
      <div>
        <label className="mb-0.5 block text-xs text-gray-deep/80">Street</label>
        <input
          type="text"
          value={form.street}
          onChange={(e) => setForm((f) => ({ ...f, street: e.target.value }))}
          className="w-full rounded border border-gray-soft px-2 py-1.5 text-sm"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-0.5 block text-xs text-gray-deep/80">City</label>
          <input
            type="text"
            value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            className="w-full rounded border border-gray-soft px-2 py-1.5 text-sm"
            required
          />
        </div>
        <div>
          <label className="mb-0.5 block text-xs text-gray-deep/80">State</label>
          <input
            type="text"
            value={form.state}
            onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
            className="w-full rounded border border-gray-soft px-2 py-1.5 text-sm"
            required
          />
        </div>
      </div>
      <div>
        <label className="mb-0.5 block text-xs text-gray-deep/80">Postal code</label>
        <input
          type="text"
          value={form.postalCode}
          onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))}
          className="w-full rounded border border-gray-soft px-2 py-1.5 text-sm"
          required
        />
      </div>
    </>
  );
}
