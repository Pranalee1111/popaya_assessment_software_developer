const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

// GET all notes (with search)
app.get("/notes", (req, res) => {
  const { search } = req.query;
  if (search) {
    const notes = db.prepare(
      "SELECT * FROM notes WHERE title LIKE ? OR content LIKE ? ORDER BY updatedAt DESC"
    ).all(`%${search}%`, `%${search}%`);
    return res.json(notes);
  }
  const notes = db.prepare("SELECT * FROM notes ORDER BY updatedAt DESC").all();
  res.json(notes);
});

// GET single note
app.get("/notes/:id", (req, res) => {
  const note = db.prepare("SELECT * FROM notes WHERE id = ?").get(req.params.id);
  if (!note) return res.status(404).json({ error: "Note not found" });
  res.json(note);
});

// POST create note
app.post("/notes", (req, res) => {
  const { title, content } = req.body;
  if (!title || title.trim() === "") {
    return res.status(400).json({ error: "Title is required" });
  }
  const result = db.prepare(
    "INSERT INTO notes (title, content) VALUES (?, ?)"
  ).run(title.trim(), content || "");
  const newNote = db.prepare("SELECT * FROM notes WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json(newNote);
});

// PUT update note
app.put("/notes/:id", (req, res) => {
  const { title, content } = req.body;
  const existing = db.prepare("SELECT * FROM notes WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Note not found" });
  if (!title || title.trim() === "") return res.status(400).json({ error: "Title is required" });
  db.prepare(
    "UPDATE notes SET title = ?, content = ?, updatedAt = datetime('now') WHERE id = ?"
  ).run(title.trim(), content || "", req.params.id);
  const updated = db.prepare("SELECT * FROM notes WHERE id = ?").get(req.params.id);
  res.json(updated);
});

// DELETE note
app.delete("/notes/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM notes WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Note not found" });
  db.prepare("DELETE FROM notes WHERE id = ?").run(req.params.id);
  res.json({ message: "Note deleted successfully" });
});

app.listen(5000, () => {
  console.log("Notes API running on http://localhost:5000");
});