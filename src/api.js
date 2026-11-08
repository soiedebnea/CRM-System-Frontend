const BASE = (import.meta.env.VITE_API_URL || "") + "/api";

async function req(path, method = "GET", body) {
  const res = await fetch(BASE + path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const api = {
  contacts: (search = "", tag = "") => req(`/contacts?search=${encodeURIComponent(search)}&tag=${encodeURIComponent(tag)}`),
  contact: (id) => req(`/contacts/${id}`),
  createContact: (d) => req("/contacts", "POST", d),
  updateContact: (id, d) => req(`/contacts/${id}`, "PUT", d),
  deleteContact: (id) => req(`/contacts/${id}`, "DELETE"),
  addNote: (id, text) => req(`/contacts/${id}/notes`, "POST", { text }),
  deleteNote: (id, nid) => req(`/contacts/${id}/notes/${nid}`, "DELETE"),
  addReminder: (id, d) => req(`/contacts/${id}/reminders`, "POST", d),
  setReminderDone: (id, rid, done) => req(`/contacts/${id}/reminders/${rid}`, "PATCH", { done }),
  deleteReminder: (id, rid) => req(`/contacts/${id}/reminders/${rid}`, "DELETE"),
  reminders: () => req("/reminders"),
  tags: () => req("/tags"),
};