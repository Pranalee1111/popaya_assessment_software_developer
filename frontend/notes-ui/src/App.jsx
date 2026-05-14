import { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:5000";

export default function App() {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ title: "", content: "" });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => { fetchNotes(); }, [search]); 

  async function fetchNotes() {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/notes`, { params: search ? { search } : {} });
      setNotes(res.data);
    } catch {
      setError("Could not load notes. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    setError("");
    if (!form.title.trim()) return setError("Title cannot be empty");
    try {
      if (editingId) {
        await axios.put(`${API}/notes/${editingId}`, form);
      } else {
        await axios.post(`${API}/notes`, form);
      }
      setForm({ title: "", content: "" });
      setEditingId(null);
      fetchNotes();
    } catch (e) {
      setError(e.response?.data?.error || "Something went wrong");
    }
  }

  async function handleDelete(id) {
    await axios.delete(`${API}/notes/${id}`);
    setDeleteConfirm(null);
    fetchNotes();
  }

  function handleEdit(note) {
    setForm({ title: note.title, content: note.content });
    setEditingId(note.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "2rem 1rem", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: 28, marginBottom: 4 }}>📝 My Notes</h1>
      <p style={{ color: "#666", marginBottom: 24 }}>{notes.length} note{notes.length !== 1 ? "s" : ""}</p>

      <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 12, padding: 20, marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, marginBottom: 14 }}>{editingId ? "✏️ Edit note" : "➕ New note"}</h2>
        {error && <p style={{ color: "#c0392b", marginBottom: 10, fontSize: 14 }}>{error}</p>}
        <input
          placeholder="Title *"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
          style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ccc", marginBottom: 10, fontSize: 15, boxSizing: "border-box" }}
        />
        <textarea
          placeholder="Content (optional)"
          value={form.content}
          onChange={e => setForm({ ...form, content: e.target.value })}
          rows={4}
          style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ccc", fontSize: 15, resize: "vertical", boxSizing: "border-box" }}
        />
        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <button onClick={handleSubmit} style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontWeight: 500, fontSize: 15 }}>
            {editingId ? "Update" : "Add note"}
          </button>
          {editingId && (
            <button onClick={() => { setForm({ title: "", content: "" }); setEditingId(null); setError(""); }}
              style={{ background: "#f1f1f1", border: "none", borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontSize: 15 }}>
              Cancel
            </button>
          )}
        </div>
      </div>

      <input
        placeholder="🔍 Search notes..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #ccc", fontSize: 15, marginBottom: 20, boxSizing: "border-box" }}
      />

      {loading ? (
        <p style={{ color: "#888", textAlign: "center" }}>Loading...</p>
      ) : notes.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem 0", color: "#999" }}>
          <p style={{ fontSize: 48 }}>🗒️</p>
          <p>{search ? "No notes match your search." : "No notes yet. Create your first one!"}</p>
        </div>
      ) : (
        notes.map(note => (
          <div key={note.id} style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 12, padding: 18, marginBottom: 14 }}>
            {deleteConfirm === note.id ? (
              <div>
                <p style={{ color: "#c0392b", marginBottom: 10 }}>Delete "{note.title}"?</p>
                <button onClick={() => handleDelete(note.id)} style={{ background: "#c0392b", color: "#fff", border: "none", borderRadius: 6, padding: "7px 14px", cursor: "pointer", marginRight: 8 }}>Yes, delete</button>
                <button onClick={() => setDeleteConfirm(null)} style={{ background: "#f1f1f1", border: "none", borderRadius: 6, padding: "7px 14px", cursor: "pointer" }}>Cancel</button>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <h3 style={{ margin: 0, fontSize: 17 }}>{note.title}</h3>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => handleEdit(note)} style={{ background: "none", border: "1px solid #ccc", borderRadius: 6, padding: "4px 12px", cursor: "pointer", fontSize: 13 }}>Edit</button>
                    <button onClick={() => setDeleteConfirm(note.id)} style={{ background: "none", border: "1px solid #ffaaaa", borderRadius: 6, padding: "4px 12px", cursor: "pointer", fontSize: 13, color: "#c0392b" }}>Delete</button>
                  </div>
                </div>
                {note.content && <p style={{ color: "#555", marginTop: 8, marginBottom: 8, lineHeight: 1.6 }}>{note.content}</p>}
                <p style={{ fontSize: 12, color: "#aaa", margin: 0 }}>Updated: {new Date(note.updatedAt).toLocaleString()}</p>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
}