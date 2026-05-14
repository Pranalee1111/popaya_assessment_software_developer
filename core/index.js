const express = require("express");
const app = express();

app.use(express.json());

const users = [
  { id: 1, name: "Amit", email: "amit@test.com" },
  { id: 2, name: "Riya", email: "riya@test.com" }
];

const notes = [
  { id: 1, title: "Note 1", content: "Content 1", userId: 1 },
  { id: 2, title: "Note 2", content: "Content 2", userId: 2 }
];

//  1 FIXED: was res.send(userList) — userList is undefined
app.get("/users", (req, res) => {
  const allUsers = users;
  res.send(allUsers);
});

// 2 FIXED: req.params.id is a string, user.id is a number
app.get("/users/:id", (req, res) => {
  const id = Number(req.params.id);
  const user = users.find(u => u.id === id);
  if (!user) return res.status(404).send({ error: "User not found" });
  res.send(user);
});

//  3 FIXED: function never returned anything
function getUserById(id) {
  const user = users.find(u => u.id === id);
  return user;
}

// 4 FIXED: "lenght" typo → "length"
app.get("/notes/count", (req, res) => {
  const total = notes.length;
  res.send({ total });
});

// 5 FIXED: fetchExternalData was not defined and not awaited
app.get("/external-data", async (req, res) => {
  async function fetchExternalData() {
    return { message: "External data here" };
  }
  const data = await fetchExternalData();
  res.send(data);
});

// 6 FIXED: (notes = []) was assignment not comparison
app.get("/notes", (req, res) => {
  if (notes.length === 0) {
    console.log("No notes found");
  }
  res.send(notes);
});

function generateNoteId() {
  return Math.floor(Math.random() * 1000);
}

// 7 FIXED: (!title && !content) should be || 
// 8 FIXED: generateNoteId was not called (missing brackets)
app.post("/notes", (req, res) => {
  const { title, content, userId } = req.body;

  if (!title || !content) {
    return res.status(400).send({ error: "Title and content are required" });
  }

  const newNote = {
    id: generateNoteId(),
    title: title,
    content: content,
    userId: userId
  };

  notes.push(newNote);
  res.status(201).send(newNote);
});

// 9 FIXED: id is string, note ids are numbers. Also added -1 check
app.delete("/notes/:id", (req, res) => {
  const id = Number(req.params.id);
  const noteIndex = notes.findIndex(n => n.id === id);
  if (noteIndex === -1) return res.status(404).send({ error: "Note not found" });
  notes.splice(noteIndex, 1);
  res.send({ message: "Note deleted" });
});

// 10 FIXED: "username" doesn't exist — should be "name"
app.put("/users/:id", (req, res) => {
  const id = Number(req.params.id);
  const { name } = req.body;
  const user = users.find(u => u.id === id);
  if (!user) return res.status(404).send({ error: "User not found" });
  user.name = name;
  res.send(user);
});

// 11 FIXED: (n.userId = userId) was assignment, should be ===
app.get("/user-notes/:userId", (req, res) => {
  const userId = Number(req.params.userId);
  const userNotes = notes.filter(n => n.userId === userId);
  res.send(userNotes);
});

//  12 FIXED: || should be && — both must match for login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (email === "admin@test.com" && password === "123456") {
    res.send({ message: "Login successful" });
  } else {
    res.send({ message: "Invalid credentials" });
  }
});

//  13 FIXED: filter returns array — use find instead
app.get("/profile/:id", (req, res) => {
  const id = Number(req.params.id);
  const user = users.find(u => u.id === id);
  if (!user) return res.status(404).send({ error: "User not found" });
  res.send({ name: user.name });
});

app.post("/sum", (req, res) => {
  const { a, b } = req.body;
  const total = Number(a) + Number(b);
  res.send({ total });
});

// 14 FIXED: log said port 5000 but was listening on 3000
app.listen(3000, () => {
  console.log("Server running on port 3000");
});