import React, { useCallback, useEffect, useState } from "react";
import { api } from "./api.js";
import Detail from "./Detail.jsx";
import { fmtDate, isOverdue } from "./utils.js";

export default function App() {
  const [contacts, setContacts] = useState([]);
  const [tags, setTags] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState("");
  const [selected, setSelected] = useState(null); // contact id, "new", or null
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      const [c, t, r] = await Promise.all([api.contacts(search, tag), api.tags(), api.reminders()]);
      if (![c, t, r].every(Array.isArray)) throw new Error("Unexpected response from the backend");
      setContacts(c); setTags(t); setReminders(r); setError("");
    } catch (e) { setError(e.message); }
  }, [search, tag]);

  useEffect(() => { const id = setTimeout(refresh, 200); return () => clearTimeout(id); }, [refresh]);

  return (
    <div className="app">
      <aside className="side">
        <div className="side-head">
          <h1>Contacts</h1>
          <button className="btn primary" onClick={() => setSelected("new")}>New contact</button>
        </div>
        <input className="input" type="search" placeholder="Search name, email, company" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search contacts" />
        <div className="tags" role="group" aria-label="Filter by tag">
          <button className={"chip" + (!tag ? " on" : "")} onClick={() => setTag("")}>All</button>
          {tags.map((t) => (
            <button key={t.tag} className={"chip" + (tag === t.tag ? " on" : "")} onClick={() => setTag(tag === t.tag ? "" : t.tag)}>
              {t.tag} <span className="count">{t.count}</span>
            </button>
          ))}
        </div>
        {error && <p className="error">{error}. Check that the backend is running.</p>}
        <ul className="list">
          {contacts.map((c) => (
            <li key={c._id}>
              <button className={"row" + (selected === c._id ? " active" : "")} onClick={() => setSelected(c._id)}>
                <span className="avatar">{c.name.slice(0, 1).toUpperCase()}</span>
                <span>
                  <strong>{c.name}</strong>
                  <small>{c.company || c.email || "No details yet"}</small>
                </span>
              </button>
            </li>
          ))}
          {!contacts.length && !error && <li className="empty">No contacts found. Add one to get started.</li>}
        </ul>
      </aside>

      <main className="main">
        {selected ? (
          <Detail
            key={selected}
            id={selected}
            onChanged={refresh}
            onSaved={(id) => { setSelected(id); refresh(); }}
            onDeleted={() => { setSelected(null); refresh(); }}
          />
        ) : (
          <section className="followups">
            <h2>Follow-ups</h2>
            {reminders.length === 0 && <p className="empty">Nothing pending. Open a contact to add a follow-up reminder.</p>}
            <ul className="rem-list">
              {reminders.map((r) => (
                <li key={r.reminderId} className={isOverdue(r.dueDate) ? "overdue" : ""}>
                  <button className="link" onClick={() => setSelected(r.contactId)}>{r.contactName}</button>
                  <span>{r.title}</span>
                  <time>{isOverdue(r.dueDate) ? "Overdue since " : "Due "}{fmtDate(r.dueDate)}</time>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}