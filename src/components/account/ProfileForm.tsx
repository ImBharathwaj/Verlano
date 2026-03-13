"use client";

import { useState, useEffect } from "react";

type Profile = { id: string; name: string; email: string; phone: string | null };

export function ProfileForm() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    fetch("/api/account/profile", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          return;
        }
        setProfile(data);
        setName(data.name ?? "");
        setEmail(data.email ?? "");
        setPhone(data.phone ?? "");
      })
      .catch(() => setError("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), phone: phone.trim() || null }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Update failed");
        return;
      }
      setProfile(data);
    } catch {
      setError("Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-2 animate-pulse space-y-2">
        <div className="h-9 rounded bg-gray-soft/50" />
        <div className="h-9 rounded bg-gray-soft/50" />
        <div className="h-9 rounded bg-gray-soft/50" />
      </div>
    );
  }

  if (error && !profile) {
    return <p className="mt-2 text-sm text-red-600">{error}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-deep/80">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full max-w-md rounded-lg border border-gray-soft bg-white px-3 py-2 text-sm text-black"
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-deep/80">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full max-w-md rounded-lg border border-gray-soft bg-white px-3 py-2 text-sm text-black"
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-deep/80">Phone (optional)</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full max-w-md rounded-lg border border-gray-soft bg-white px-3 py-2 text-sm text-black"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="rounded-full border border-ink bg-ink px-5 py-2 text-sm font-medium text-white transition hover:bg-ink/90 disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
