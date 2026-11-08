import React, { useEffect, useState } from "react";
import { api } from "./api.js";
import { fmtDate, isOverdue } from "./utils.js";

const blank = { name: "", email: "", phone: "", company: "", tags: [] };

export default function Detail({ id, onChanged, onSaved, onDeleted }) {
  const isNew = id === "new";
  const [c, setC] = useState(isNew ? blank : null);
  const [form, setForm] = useState(blank);
  const [tagText, setTagText] = useState("");
  const [note, setNote] = useState("");
  const [rem, setRem] = useState({ title: "", dueDate: "" });
  const [error, setError] = useState("");

  const apply = (data) => { setC(data); setForm({ name: data.name, email: data.email || "", phone: data.phone || "", company: data.company || "", tags: data.tags }); setTagText(data.tags.join(", ")); };

  useEffect(() => { if (!isNew) api.contact(id).then(apply).catch((e) => setError(e.message)); }, [id]);

  const run = async (fn) => { try { setError(""); const d = await fn(); if (d) apply(d); onChanged(); } catch (e) { setError(e.message); } };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    const payload = { ...form, tags: tagText.split(",") };
    try {
      setError("");
      if (isNew) { const d = await api.createContact(payload); onSaved(d._id); }
      else { apply(await api.updateContact(id, payload)); onChanged(); }
    } catch (err) { setError(err.message); }
  };

  if (!c) return <p className="empty">{error || "Loading contact…"}</p>;

  return (
    <div className="detail">
      <form className="card" onSubmit={save}>
        <h2>{isNew ? "New contact" : c.name}</h2>
        <div className="grid">
          <label>Name<input className="input" required value={form.name} onChange={set("name")} /></label>
          <label>Company<input className="input" value={form.company} onChange={set("company")} /></label>
          <label>Email<input className="input" type="email" value={form.email} onChange={set("email")} /></label>
          <label>Phone<input className="input" value={form.phone} onChange={set("phone")} /></label>
        </div>
        <label>Tags (comma separated)<input className="input" value={tagText} onChange={(e) => setTagText(e.target.value)} placeholder="lead, partner, vip" /></label>
        <div className="actions">
          <button className="btn primary" type="submit">{isNew ? "Create contact" : "Save changes"}</button>
          {!isNew && <button type="button" className="btn danger" onClick={() => window.confirm(`Delete ${c.name}?`) && api.deleteContact(id).then(onDeleted)}>Delete contact</button>}
        </div>
        {error && <p className="error">{error}</p>}
      </form>

      {!isNew && (
        <>
          <section className="card">
            <h3>Follow-up reminders</h3>
            <form className="inline" onSubmit={(e) => { e.preventDefault(); run(async () => { const d = await api.addReminder(id, rem); setRem({ title: "", dueDate: "" }); return d; }); }}>
              <input className="input" required placeholder="What needs following up?" value={rem.title} onChange={(e) => setRem({ ...rem, title: e.target.value })} />
              <input className="input" required type="date" value={rem.dueDate} onChange={(e) => setRem({ ...rem, dueDate: e.target.value })} aria-label="Due date" />
              <button className="btn primary">Add reminder</button>
            </form>
            <ul className="rem-list">
              {[...c.reminders].sort((a, b) => a.done - b.done || new Date(a.dueDate) - new Date(b.dueDate)).map((r) => (
                <li key={r._id} className={(r.done ? "done " : "") + (!r.done && isOverdue(r.dueDate) ? "overdue" : "")}>
                  <label className="check"><input type="checkbox" checked={r.done} onChange={(e) => run(() => api.setReminderDone(id, r._id, e.target.checked))} />{r.title}</label>
                  <time>{fmtDate(r.dueDate)}</time>
                  <button className="link" onClick={() => run(() => api.deleteReminder(id, r._id))}>Remove</button>
                </li>
              ))}
              {!c.reminders.length && <li className="empty">No reminders yet.</li>}
            </ul>
          </section>

          <section className="card">
            <h3>Notes</h3>
            <form onSubmit={(e) => { e.preventDefault(); run(async () => { const d = await api.addNote(id, note); setNote(""); return d; }); }}>
              <textarea className="input" required rows={3} placeholder="Write what you discussed or learned" value={note} onChange={(e) => setNote(e.target.value)} />
              <button className="btn primary">Add note</button>
            </form>
            <ul className="notes">
              {c.notes.map((n) => (
                <li key={n._id}>
                  <p>{n.text}</p>
                  <small>{fmtDate(n.createdAt)} <button className="link" onClick={() => run(() => api.deleteNote(id, n._id))}>Delete</button></small>
                </li>
              ))}
              {!c.notes.length && <li className="empty">No notes yet.</li>}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}