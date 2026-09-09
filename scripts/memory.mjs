#!/usr/bin/env node
// VidMate agent memory — SQLite-backed persistent state for the video-making agent.
// Usage: npm run memory -- <command>
//   status
//   playlist list
//   playlist create <name> [description]
//   playlist set-active <name|id>
//   video add <title> [--topic x] [--status s] [--duration secs] [--notes x]
//   video list [--playlist name] [--status s]
//   video get <id>
//   video update <id> [--title x] [--topic x] [--status s] [--output p] [--composition c] [--duration n] [--notes x]
//   note add <text>
//   note list
//   meta set <key> <value>
//   meta get <key>
//   history
//   help

import { DatabaseSync } from "node:sqlite";
import { mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_DIR = resolve(__dirname, "../data");
const DB_PATH = resolve(DB_DIR, "memory.sqlite");

mkdirSync(DB_DIR, { recursive: true });
const db = new DatabaseSync(DB_PATH);

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS playlists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    playlist_id INTEGER NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    topic TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'planned',
    composition TEXT DEFAULT '',
    output_path TEXT DEFAULT '',
    duration_seconds INTEGER DEFAULT 0,
    notes TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    detail TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

const ACTIVE_KEY = "active_playlist_id";
const VALID_STATUS = ["planned", "writing", "scripting", "building", "rendering", "rendered", "published"];

function log(action, detail = "") {
  db.prepare("INSERT INTO history (action, detail) VALUES (?, ?)").run(action, String(detail).slice(0, 2000));
}

function getActivePlaylist() {
  const row = db.prepare("SELECT value FROM meta WHERE key = ?").get(ACTIVE_KEY);
  if (!row) return null;
  return db.prepare("SELECT * FROM playlists WHERE id = ?").get(Number(row.value));
}

function setActivePlaylist(id) {
  db.prepare("INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
    .run(ACTIVE_KEY, String(id));
}

function playlistByIdOrName(ref) {
  if (/^\d+$/.test(ref)) {
    return db.prepare("SELECT * FROM playlists WHERE id = ?").get(Number(ref));
  }
  return db.prepare("SELECT * FROM playlists WHERE name = ?").get(ref);
}

function fmtVideo(v) {
  const pad = (s, n) => String(s ?? "").padEnd(n);
  const d = Math.round((v.duration_seconds || 0) * 10) / 10;
  return `${pad(v.id, 4)} ${pad(v.status, 11)} ${pad(d + "s", 7)}  ${v.title}`;
}

function cmdStatus() {
  const active = getActivePlaylist();
  console.log("== STATUS ==");
  if (active) {
    const counts = db
      .prepare("SELECT status, COUNT(*) AS n FROM videos WHERE playlist_id = ? GROUP BY status")
      .all(active.id);
    const total = db.prepare("SELECT COUNT(*) AS n FROM videos WHERE playlist_id = ?").get(active.id).n;
    console.log(`Active playlist : ${active.name}  (id ${active.id}) — ${total} videos total`);
    for (const c of counts) console.log(`  - ${c.status}: ${c.n}`);
    console.log("");
    console.log("Recent videos:");
    const recent = db
      .prepare("SELECT * FROM videos WHERE playlist_id = ? ORDER BY updated_at DESC, id DESC LIMIT 6")
      .all(active.id);
    for (const v of recent) console.log("  " + fmtVideo(v));
  } else {
    console.log("No active playlist set. Create one with: npm run memory -- playlist create <name>");
    const all = db.prepare("SELECT * FROM playlists ORDER BY id DESC LIMIT 10").all();
    if (all.length) {
      console.log("");
      console.log("Existing playlists:");
      for (const p of all) console.log(`  - ${p.name} (id ${p.id})`);
    }
  }
}

function cmdPlaylistList() {
  const rows = db.prepare(`
    SELECT p.*, (SELECT COUNT(*) FROM videos v WHERE v.playlist_id = p.id) AS video_count
    FROM playlists p ORDER BY p.name
  `).all();
  const active = getActivePlaylist();
  console.log("== PLAYLISTS ==");
  if (!rows.length) { console.log("(none)"); return; }
  for (const p of rows) {
    const marker = active && active.id === p.id ? ">" : " ";
    console.log(`${marker} ${p.name} (id ${p.id}) — ${p.video_count} videos  ${p.description ? "— " + p.description : ""}`);
  }
}

function cmdPlaylistCreate(args) {
  if (!args.length) { console.error("Usage: playlist create <name> [description]"); process.exit(1); }
  const name = args[0];
  const description = args.slice(1).join(" ") || "";
  try {
    const res = db.prepare("INSERT INTO playlists (name, description) VALUES (?, ?)").run(name, description);
    const id = Number(res.lastInsertRowid);
    if (!getActivePlaylist()) setActivePlaylist(id);
    log("playlist_create", `${name} (id ${id})`);
    console.log(`Playlist created: ${name} (id ${id})`);
  } catch (e) {
    console.error(`Playlist "${name}" already exists.`);
    process.exit(1);
  }
}

function cmdPlaylistSetActive(ref) {
  const p = playlistByIdOrName(ref);
  if (!p) { console.error(`Playlist not found: ${ref}`); process.exit(1); }
  setActivePlaylist(p.id);
  log("playlist_set_active", `${p.name} (id ${p.id})`);
  console.log(`Active playlist: ${p.name} (id ${p.id})`);
}

function parseFlags(args) {
  const flags = {};
  const positional = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const val = args[i + 1] && !args[i + 1].startsWith("--") ? args[++i] : true;
      flags[key] = val;
    } else {
      positional.push(a);
    }
  }
  return { flags, positional };
}

function cmdVideoAdd(args) {
  const { flags, positional } = parseFlags(args);
  if (!positional.length) { console.error("Usage: video add <title> [--topic x] [--status s] [--duration secs] [--notes x]"); process.exit(1); }
  const title = positional.join(" ");
  const active = getActivePlaylist();
  if (!active) { console.error("No active playlist. Set one first: playlist set-active <name|id>"); process.exit(1); }

  let status = flags.status || "planned";
  if (!VALID_STATUS.includes(status)) status = "planned";

  const res = db
    .prepare("INSERT INTO videos (playlist_id, title, topic, status, duration_seconds, notes) VALUES (?, ?, ?, ?, ?, ?)")
    .run(active.id, title, flags.topic || "", status, Number(flags.duration) || 0, flags.notes || "");
  const id = Number(res.lastInsertRowid);
  log("video_add", `[${active.name}] ${title} (id ${id})`);
  console.log(`Video added: id ${id} -> ${title} (playlist: ${active.name}, status: ${status})`);
}

function cmdVideoList(args) {
  const { flags } = parseFlags(args);
  let rows;
  if (flags.playlist) {
    const p = playlistByIdOrName(flags.playlist);
    if (!p) { console.error(`Playlist not found: ${flags.playlist}`); process.exit(1); }
    rows = db.prepare("SELECT * FROM videos WHERE playlist_id = ? ORDER BY updated_at DESC, id DESC").all(p.id);
  } else {
    const active = getActivePlaylist();
    if (!active) { console.log("(no active playlist)"); return; }
    rows = db.prepare("SELECT * FROM videos WHERE playlist_id = ? ORDER BY updated_at DESC, id DESC").all(active.id);
  }
  let list = rows;
  if (flags.status) list = list.filter((v) => v.status === flags.status);
  console.log(`== VIDEOS (${list.length}) ==`);
  for (const v of list) console.log(fmtVideo(v));
}

function cmdVideoGet(id) {
  const v = db.prepare("SELECT * FROM videos WHERE id = ?").get(Number(id));
  if (!v) { console.error(`Video not found: ${id}`); process.exit(1); }
  const p = db.prepare("SELECT name FROM playlists WHERE id = ?").get(v.playlist_id);
  console.log(`id: ${v.id}`);
  console.log(`title: ${v.title}`);
  console.log(`playlist: ${p?.name} (${v.playlist_id})`);
  console.log(`status: ${v.status}`);
  console.log(`topic: ${v.topic}`);
  console.log(`duration: ${v.duration_seconds}s`);
  console.log(`composition: ${v.composition}`);
  console.log(`output: ${v.output_path}`);
  console.log(`notes: ${v.notes}`);
  console.log(`created: ${v.created_at}`);
  console.log(`updated: ${v.updated_at}`);
}

function cmdVideoUpdate(args) {
  const { flags, positional } = parseFlags(args);
  const anyField =
    typeof flags.title === "string" ||
    typeof flags.topic === "string" ||
    typeof flags.status === "string" ||
    typeof flags.composition === "string" ||
    typeof flags.output === "string" ||
    typeof flags.notes === "string" ||
    flags.duration !== undefined;
  if (!positional.length || !anyField) {
    console.error("Usage: video update <id> [--title x] [--topic x] [--status s] [--output p] [--composition c] [--duration n] [--notes x]");
    process.exit(1);
  }
  const id = Number(positional[0]);
  const v = db.prepare("SELECT * FROM videos WHERE id = ?").get(id);
  if (!v) { console.error(`Video not found: ${id}`); process.exit(1); }

  const setters = [];
  const vals = [];
  const fields = {
    title: flags.title,
    topic: flags.topic,
    status: flags.status,
    composition: flags.composition,
    output_path: flags.output,
    notes: flags.notes,
  };
  for (const [col, val] of Object.entries(fields)) {
    if (typeof val === "string") { setters.push(`${col} = ?`); vals.push(val); }
  }
  if (flags.duration) { setters.push("duration_seconds = ?"); vals.push(Number(flags.duration)); }
  if (!setters.length) { console.error("Nothing to update."); process.exit(1); }

  if (flags.status && !VALID_STATUS.includes(flags.status)) {
    console.error(`Invalid status. Allowed: ${VALID_STATUS.join(", ")}`);
    process.exit(1);
  }

  setters.push("updated_at = datetime('now')");
  vals.push(id);
  db.prepare(`UPDATE videos SET ${setters.join(", ")} WHERE id = ?`).run(...vals);
  log("video_update", `id ${id} -> ${flags.status || ""} ${flags.title || ""}`.trim());
  console.log(`Video ${id} updated.`);
}

function cmdNoteAdd(args) {
  if (!args.length) { console.error("Usage: note add <text>"); process.exit(1); }
  const content = args.join(" ");
  const res = db.prepare("INSERT INTO notes (content) VALUES (?)").run(content);
  log("note_add", content.slice(0, 200));
  console.log(`Note added (id ${Number(res.lastInsertRowid)}): ${content}`);
}

function cmdNoteList() {
  const rows = db.prepare("SELECT * FROM notes ORDER BY id DESC LIMIT 30").all();
  console.log("== NOTES ==");
  if (!rows.length) { console.log("(none)"); return; }
  for (const n of [...rows].reverse()) {
    console.log(`#${n.id} (${n.created_at}): ${n.content}`);
  }
}

function cmdMetaSet(args) {
  const { flags, positional } = parseFlags(args);
  if (!positional.length) { console.error("Usage: meta get <key> | meta set <key> <value>"); process.exit(1); }
  const key = positional[0];
  const value = positional.slice(1).join(" ") || (typeof flags.v === "string" ? flags.v : "");
  if (!value) { console.error("Usage: meta set <key> <value>"); process.exit(1); }
  db.prepare("INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(key, value);
  log("meta_set", `${key} = ${value}`);
  console.log(`${key} = ${value}`);
}

function cmdMetaGet(key) {
  const row = db.prepare("SELECT value FROM meta WHERE key = ?").get(key);
  console.log(row ? row.value : "");
}

function cmdHistory() {
  const rows = db.prepare("SELECT * FROM history ORDER BY id DESC LIMIT 25").all();
  console.log("== RECENT ACTIVITY ==");
  for (const h of [...rows].reverse()) console.log(`[${h.created_at}] ${h.action}: ${h.detail}`);
}

function printHelp() {
  console.log(`VidMate Agent Memory (SQLite @ ${DB_PATH})

Commands:
  status                              Show active playlist, statuses, recent videos
  playlist list                       List all playlists
  playlist create <name> [desc]       Create a playlist (first becomes active)
  playlist set-active <name|id>       Set the active playlist
  video add <title> [--topic x] [--status <${VALID_STATUS.join("|")}>] [--duration secs] [--notes x]
  video list [--playlist name] [--status s]
  video get <id>
  video update <id> [--title x] [--topic x] [--status s] [--output p] [--composition c] [--duration n] [--notes x]
  note add <text>                     Store a free-form note
  note list                           Last 30 notes
  meta set <key> <value>              Store arbitrary key/value
  meta get <key>                      Read a key
  history                             Recent agent activity
  help                                This help`);
}

const [cmd, ...rest] = process.argv.slice(2);
switch (cmd) {
  case "status": cmdStatus(); break;
  case "playlist":
    switch (rest[0]) {
      case "list": cmdPlaylistList(); break;
      case "create": cmdPlaylistCreate(rest.slice(1)); break;
      case "set-active": cmdPlaylistSetActive(rest[1]); break;
      default: console.error("Unknown playlist command. See: npm run memory -- help"); process.exit(1);
    }
    break;
  case "video":
    switch (rest[0]) {
      case "add": cmdVideoAdd(rest.slice(1)); break;
      case "list": cmdVideoList(rest.slice(1)); break;
      case "get": cmdVideoGet(rest[1]); break;
      case "update": cmdVideoUpdate(rest.slice(1)); break;
      default: console.error("Unknown video command. See: npm run memory -- help"); process.exit(1);
    }
    break;
  case "note":
    switch (rest[0]) {
      case "add": cmdNoteAdd(rest.slice(1)); break;
      case "list": cmdNoteList(); break;
      default: console.error("Unknown note command. See: npm run memory -- help"); process.exit(1);
    }
    break;
  case "meta":
    if (rest[0] === "set") cmdMetaSet(rest.slice(1));
    else if (rest[0] === "get") cmdMetaGet(rest[1]);
    else { console.error("Usage: meta get <key> | meta set <key> <value>"); process.exit(1); }
    break;
  case "history": cmdHistory(); break;
  case "help":
  case "--help":
  case "-h": printHelp(); break;
  default:
    console.error(`Unknown command: ${cmd || "(none)"}`);
    printHelp();
    process.exit(1);
}