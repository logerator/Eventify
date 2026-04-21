const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");

dotenv.config();

const app = express();
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use(express.json());

let pool;

function getAuthToken(req) {
  const header = req.headers.authorization;
  if (!header) return null;
  const [type, token] = header.split(" ");
  if (type !== "Bearer" || !token) return null;
  return token;
}

function requireAuth(req, res, next) {
  const token = getAuthToken(req);
  if (!token) return res.status(401).json({ message: "Missing auth token." });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev_secret_change_this");
    req.user = decoded;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ message: "Admin access required." });
  }
  return next();
}

async function ensureSchema() {
  let conn;
  try {
    conn = await pool.getConnection();

    await conn.query(
      "CREATE TABLE IF NOT EXISTS users (" +
        "id INT AUTO_INCREMENT PRIMARY KEY," +
        "name VARCHAR(255) NOT NULL," +
        "email VARCHAR(255) NOT NULL UNIQUE," +
        "password_hash TEXT NOT NULL," +
        "is_admin TINYINT(1) NOT NULL DEFAULT 0," +
        "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
      ")"
    );

    const cols = await conn.query(
      "SELECT COUNT(*) AS c FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'is_admin'"
    );
    const hasIsAdmin = Number(cols[0]?.c || 0) > 0;
    if (!hasIsAdmin) {
      await conn.query("ALTER TABLE users ADD COLUMN is_admin TINYINT(1) NOT NULL DEFAULT 0");
    }

    await conn.query(
      "CREATE TABLE IF NOT EXISTS events (" +
        "id INT AUTO_INCREMENT PRIMARY KEY," +
        "title VARCHAR(255) NOT NULL," +
        "date VARCHAR(100) NOT NULL," +
        "location VARCHAR(255) NOT NULL," +
        "category VARCHAR(100) NOT NULL," +
        "image_url TEXT NULL," +
        "theme_color VARCHAR(32) NULL," +
        "description TEXT NULL," +
        "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
      ")"
    );
    await conn.query(
      "CREATE TABLE IF NOT EXISTS user_saved_events (" +
        "user_id INT NOT NULL," +
        "event_id INT NOT NULL," +
        "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP," +
        "PRIMARY KEY (user_id, event_id)," +
        "FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE," +
        "FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE" +
      ")"
    );

    if (process.env.ADMIN_EMAIL) {
      await conn.query("UPDATE users SET is_admin = 1 WHERE email = ?", [process.env.ADMIN_EMAIL]);
    }
  } finally {
    if (conn) conn.release();
  }
}

function pick(arr, idx) {
  return arr[idx % arr.length];
}

async function autoSeedUsersIfNeeded() {
  const demoUserEmail = process.env.DEMO_USER_EMAIL || "demo@eventify.app";
  const demoUserPassword = process.env.DEMO_USER_PASSWORD || "Demo1234!";
  const demoAdminEmail = process.env.DEMO_ADMIN_EMAIL || "admin@eventify.app";
  const demoAdminPassword = process.env.DEMO_ADMIN_PASSWORD || "Admin1234!";

  let conn;
  try {
    conn = await pool.getConnection();

    const userHash = await argon2.hash(demoUserPassword);
    const existingUser = await conn.query("SELECT id FROM users WHERE email = ?", [demoUserEmail]);
    if (existingUser.length === 0) {
      await conn.query(
        "INSERT INTO users (name, email, password_hash, is_admin) VALUES (?, ?, ?, 0)",
        ["Demo User", demoUserEmail, userHash]
      );
      console.log(`Demo user created: ${demoUserEmail}`);
    } else {
      await conn.query("UPDATE users SET password_hash = ? WHERE email = ?", [userHash, demoUserEmail]);
    }

    const adminHash = await argon2.hash(demoAdminPassword);
    const existingAdmin = await conn.query("SELECT id FROM users WHERE email = ?", [demoAdminEmail]);
    if (existingAdmin.length === 0) {
      await conn.query(
        "INSERT INTO users (name, email, password_hash, is_admin) VALUES (?, ?, ?, 1)",
        ["Demo Admin", demoAdminEmail, adminHash]
      );
      console.log(`Demo admin created: ${demoAdminEmail}`);
    } else {
      await conn.query("UPDATE users SET password_hash = ?, is_admin = 1 WHERE email = ?", [adminHash, demoAdminEmail]);
    }
  } catch (err) {
    console.error("Auto-seed users error:", err);
  } finally {
    if (conn) conn.release();
  }
}

async function autoSeedEventsIfNeeded() {
  const targetCount = 100;

  const categories = ["Tech", "Music", "Food", "Sports", "Art", "Networking", "Gaming", "Health"];
  const locations = ["Downtown", "Student Center", "City Park", "Library", "Convention Hall", "Waterfront", "Museum", "Theatre"];
  const colors = ["#2563eb", "#7c3aed", "#db2777", "#16a34a", "#ea580c", "#0891b2", "#b91c1c", "#0f766e"];
  const titles = [
    "Community Meetup",
    "Workshop",
    "Live Showcase",
    "Beginner Class",
    "Open Mic",
    "Festival",
    "Career Night",
    "Local Tournament"
  ];

  let conn;
  try {
    conn = await pool.getConnection();
    const current = await conn.query("SELECT COUNT(*) AS c FROM events");
    const currentCount = Number(current[0]?.c || 0);

    if (currentCount >= targetCount) return;

    const toInsert = targetCount - currentCount;
    const rows = [];
    for (let i = 0; i < toInsert; i++) {
      const idx = currentCount + i + 1;
      const category = pick(categories, idx);
      const location = pick(locations, idx);
      const themeColor = pick(colors, idx);
      const title = `${pick(titles, idx)}: ${category}`;
      const date = new Date(Date.now() + idx * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const imageUrl = `https://picsum.photos/seed/eventify-${idx}/640/360`;
      const description = `Join us for ${title} in ${location}.`;
      rows.push([title, date, location, category, imageUrl, themeColor, description]);
    }

    await conn.batch(
      "INSERT INTO events (title, date, location, category, image_url, theme_color, description) VALUES (?, ?, ?, ?, ?, ?, ?)",
      rows
    );
    console.log(`Auto-seeded ${toInsert} demo events (total now ${targetCount}).`);
  } catch (err) {
    console.error("Auto-seed events error:", err);
  } finally {
    if (conn) conn.release();
  }
}

const port = Number(process.env.PORT || 8080);
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});

(async () => {
  const mariadbModule = await import("mariadb");
  const mariadb = mariadbModule.default ?? mariadbModule;

  pool = mariadb.createPool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 5,
    allowPublicKeyRetrieval: true
  });

  await ensureSchema();
  await autoSeedUsersIfNeeded();
  await autoSeedEventsIfNeeded();

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.get("/", (req, res) => {
  res.send("Backend is working");
});

app.get("/test-db", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query("SELECT id, name, email, created_at FROM users");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database connection failed" });
  } finally {
    if (conn) conn.release();
  }
});

app.post("/api/auth/signup", async (req, res) => {
  console.log("Signup route hit:", req.body);

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  let conn;
  try {
    conn = await pool.getConnection();

    const existing = await conn.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: "Email already registered." });
    }

    const passwordHash = await argon2.hash(password);

    await conn.query(
      "INSERT INTO users (name, email, password_hash, is_admin) VALUES (?, ?, ?, 0)",
      [name, email, passwordHash]
    );

    res.status(201).json({ message: "Account created successfully." });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error during signup." });
  } finally {
    if (conn) conn.release();
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  let conn;
  try {
    conn = await pool.getConnection();

    const rows = await conn.query(
      "SELECT id, name, email, password_hash, is_admin FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const user = rows[0];
    const validPassword = await argon2.verify(user.password_hash, password);

    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, is_admin: Boolean(user.is_admin) },
      process.env.JWT_SECRET || "dev_secret_change_this",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        is_admin: Boolean(user.is_admin)
      }
    });
  } catch (err) {
    console.error("Login error:", err);

    res.status(500).json({ message: "Server error during login." });
  } finally {
    if (conn) conn.release();
  }
});

  app.get("/api/user/me", requireAuth, async (req, res) => {
    let conn;
    try {
      conn = await pool.getConnection();
      const rows = await conn.query(
        "SELECT id, name, email, created_at FROM users WHERE id = ?",
        [req.user.id]
      );
      if (rows.length === 0) return res.status(404).json({ message: "User not found." });
      return res.json({ user: rows[0] });
    } catch (err) {
      console.error("Get profile error:", err);
      return res.status(500).json({ message: "Server error loading profile." });
    } finally {
      if (conn) conn.release();
    }
  });

  app.put("/api/user/me", requireAuth, async (req, res) => {
    const { name, currentPassword, newPassword } = req.body;

    let conn;
    try {
      conn = await pool.getConnection();
      const rows = await conn.query(
        "SELECT id, name, email, password_hash FROM users WHERE id = ?",
        [req.user.id]
      );
      if (rows.length === 0) return res.status(404).json({ message: "User not found." });
      const user = rows[0];

      if (newPassword) {
        if (!currentPassword) return res.status(400).json({ message: "Current password is required." });
        const valid = await argon2.verify(user.password_hash, currentPassword);
        if (!valid) return res.status(401).json({ message: "Current password is incorrect." });
        const newHash = await argon2.hash(newPassword);
        await conn.query("UPDATE users SET password_hash = ? WHERE id = ?", [newHash, req.user.id]);
      }

      if (typeof name === "string" && name.trim()) {
        await conn.query("UPDATE users SET name = ? WHERE id = ?", [name.trim(), req.user.id]);
      }

      const updated = await conn.query("SELECT id, name, email, created_at FROM users WHERE id = ?", [req.user.id]);
      return res.json({ message: "Profile updated successfully.", user: updated[0] });
    } catch (err) {
      console.error("Update profile error:", err);
      return res.status(500).json({ message: "Server error updating profile." });
    } finally {
      if (conn) conn.release();
    }
  });

  app.get("/api/events", async (req, res) => {
    const search = (req.query.search || "").toString().trim();
    const category = (req.query.category || "").toString().trim();

    let conn;
    try {
      conn = await pool.getConnection();
      const conditions = [];
      const params = [];

      if (search) {
        conditions.push("(title LIKE ? OR location LIKE ? OR category LIKE ?)");
        const q = `%${search}%`;
        params.push(q, q, q);
      }

      if (category && category !== "all") {
        conditions.push("category = ?");
        params.push(category);
      }

      const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
      const rows = await conn.query(
        `SELECT id, title, date, location, category, image_url AS imageUrl, theme_color AS themeColor, description FROM events ${where} ORDER BY id DESC`,
        params
      );
      return res.json({ events: rows });
    } catch (err) {
      console.error("List events error:", err);
      return res.status(500).json({ error: "Failed to load events" });
    } finally {
      if (conn) conn.release();
    }
  });

  app.post("/api/events", requireAuth, requireAdmin, async (req, res) => {
    const { title, date, location, category, imageUrl, themeColor, description } = req.body;
    if (!title || !date || !location || !category) {
      return res.status(400).json({ error: "title, date, location, category are required" });
    }

    let conn;
    try {
      conn = await pool.getConnection();
      const result = await conn.query(
        "INSERT INTO events (title, date, location, category, image_url, theme_color, description) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [title, date, location, category, imageUrl || null, themeColor || null, description || null]
      );

      const rows = await conn.query(
        "SELECT id, title, date, location, category, image_url AS imageUrl, theme_color AS themeColor, description FROM events WHERE id = ?",
        [Number(result.insertId)]
      );
      return res.status(201).json({ event: rows[0] });
    } catch (err) {
      console.error("Create event error:", err);
      return res.status(500).json({ error: "Failed to create event" });
    } finally {
      if (conn) conn.release();
    }
  });

  app.put("/api/events/:id", requireAuth, requireAdmin, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "invalid id" });

    const { title, date, location, category, imageUrl, themeColor, description } = req.body;
    if (!title || !date || !location || !category) {
      return res.status(400).json({ error: "title, date, location, category are required" });
    }

    let conn;
    try {
      conn = await pool.getConnection();
      const result = await conn.query(
        "UPDATE events SET title = ?, date = ?, location = ?, category = ?, image_url = ?, theme_color = ?, description = ? WHERE id = ?",
        [title, date, location, category, imageUrl || null, themeColor || null, description || null, id]
      );
      if (result.affectedRows === 0) return res.status(404).json({ error: "event not found" });

      const rows = await conn.query(
        "SELECT id, title, date, location, category, image_url AS imageUrl, theme_color AS themeColor, description FROM events WHERE id = ?",
        [id]
      );
      return res.json({ event: rows[0] });
    } catch (err) {
      console.error("Update event error:", err);
      return res.status(500).json({ error: "Failed to update event" });
    } finally {
      if (conn) conn.release();
    }
  });

  app.delete("/api/events/:id", requireAuth, requireAdmin, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "invalid id" });

    let conn;
    try {
      conn = await pool.getConnection();
      await conn.query("DELETE FROM user_saved_events WHERE event_id = ?", [id]);
      const result = await conn.query("DELETE FROM events WHERE id = ?", [id]);
      if (result.affectedRows === 0) return res.status(404).json({ error: "event not found" });
      return res.json({ deleted: true });
    } catch (err) {
      console.error("Delete event error:", err);
      return res.status(500).json({ error: "Failed to delete event" });
    } finally {
      if (conn) conn.release();
    }
  });

  app.get("/api/my-events", requireAuth, async (req, res) => {
    let conn;
    try {
      conn = await pool.getConnection();
      const rows = await conn.query(
        "SELECT e.id, e.title, e.date, e.location, e.category, e.image_url AS imageUrl, e.theme_color AS themeColor, e.description FROM user_saved_events s JOIN events e ON e.id = s.event_id WHERE s.user_id = ? ORDER BY s.created_at DESC",
        [req.user.id]
      );
      return res.json({ events: rows });
    } catch (err) {
      console.error("List my events error:", err);
      return res.status(500).json({ error: "Failed to load My Events" });
    } finally {
      if (conn) conn.release();
    }
  });

  app.post("/api/my-events", requireAuth, async (req, res) => {
    const eventId = req.body ? req.body.eventId : null;
    if (!Number.isFinite(eventId)) return res.status(400).json({ error: "eventId must be a number" });

    let conn;
    try {
      conn = await pool.getConnection();
      const exists = await conn.query("SELECT id FROM events WHERE id = ?", [eventId]);
      if (exists.length === 0) return res.status(404).json({ error: "event not found" });

      await conn.query(
        "INSERT IGNORE INTO user_saved_events (user_id, event_id) VALUES (?, ?)",
        [req.user.id, eventId]
      );
      return res.status(201).json({ saved: true });
    } catch (err) {
      console.error("Save my event error:", err);
      return res.status(500).json({ error: "Failed to save event" });
    } finally {
      if (conn) conn.release();
    }
  });

  app.delete("/api/my-events/:eventId", requireAuth, async (req, res) => {
    const eventId = Number(req.params.eventId);
    if (!Number.isFinite(eventId)) return res.status(400).json({ error: "invalid eventId" });

    let conn;
    try {
      conn = await pool.getConnection();
      await conn.query("DELETE FROM user_saved_events WHERE user_id = ? AND event_id = ?", [req.user.id, eventId]);
      return res.json({ removed: true });
    } catch (err) {
      console.error("Remove my event error:", err);
      return res.status(500).json({ error: "Failed to remove event" });
    } finally {
      if (conn) conn.release();
    }
  });

  app.post("/api/admin/seed-events", requireAuth, requireAdmin, async (req, res) => {
    const count = Number(req.body && req.body.count ? req.body.count : 100);
    const safeCount = Number.isFinite(count) && count > 0 ? Math.min(count, 500) : 100;

    const categories = ["Tech", "Music", "Food", "Sports", "Art", "Networking", "Gaming", "Health"];
    const locations = ["Downtown", "Student Center", "City Park", "Library", "Convention Hall", "Waterfront", "Museum", "Theatre"];
    const colors = ["#2563eb", "#7c3aed", "#db2777", "#16a34a", "#ea580c", "#0891b2", "#b91c1c", "#0f766e"];
    const titles = [
      "Community Meetup",
      "Workshop",
      "Live Showcase",
      "Beginner Class",
      "Open Mic",
      "Festival",
      "Career Night",
      "Local Tournament"
    ];

    let conn;
    try {
      conn = await pool.getConnection();

      const current = await conn.query("SELECT COUNT(*) AS c FROM events");
      const currentCount = Number(current[0]?.c || 0);
      if (currentCount >= safeCount) {
        return res.json({ seeded: 0, total: currentCount, message: "Events already seeded." });
      }

      const toInsert = safeCount - currentCount;
      const rows = [];
      for (let i = 0; i < toInsert; i++) {
        const idx = currentCount + i + 1;
        const category = pick(categories, idx);
        const location = pick(locations, idx);
        const themeColor = pick(colors, idx);
        const title = `${pick(titles, idx)}: ${category}`;
        const date = new Date(Date.now() + idx * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        const imageUrl = `https://picsum.photos/seed/eventify-${idx}/640/360`;
        const description = `Join us for ${title} in ${location}.`;
        rows.push([title, date, location, category, imageUrl, themeColor, description]);
      }

      await conn.batch(
        "INSERT INTO events (title, date, location, category, image_url, theme_color, description) VALUES (?, ?, ?, ?, ?, ?, ?)",
        rows
      );

      const totalRows = await conn.query("SELECT COUNT(*) AS c FROM events");
      return res.json({ seeded: toInsert, total: Number(totalRows[0]?.c || 0) });
    } catch (err) {
      console.error("Seed events error:", err);
      return res.status(500).json({ error: "Failed to seed events" });
    } finally {
      if (conn) conn.release();
    }
  });

})();