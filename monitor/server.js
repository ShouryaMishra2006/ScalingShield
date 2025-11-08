import express from "express";
import morgan from "morgan";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";

const app = express();
const PORT = process.env.PORT || 4200;
app.use(morgan("dev"));
app.use(bodyParser.json({ limit: "2mb" }));

const events = [];
const FILE = path.join(process.cwd(), "events.log.json");
if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, "[]");

function save() { fs.writeFileSync(FILE, JSON.stringify(events, null, 2)); }

// receive telemetry
app.post("/api/telemetry", (req, res) => {
  const ev = { receivedAt: new Date().toISOString(), ...req.body };
  events.push(ev);
  if (events.length > 1000) events.shift();
  if (events.length % 10 === 0) save();
  res.status(202).json({ ok: true });
  broadcast(ev);
});

// serve dashboard + list
app.get("/", (_, res) => res.sendFile(path.join(process.cwd(), "dashboard.html")));
app.get("/api/events", (_, res) => res.json(events.slice().reverse().slice(0, 200)));

let clients = [];
app.get("/events/stream", (req, res) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive"
  });
  res.flushHeaders();
  const id = Date.now();
  clients.push({ id, res });
  req.on("close", () => clients = clients.filter(c => c.id !== id));
});

function broadcast(ev) {
  const msg = `event: telemetry\ndata: ${JSON.stringify(ev)}\n\n`;
  clients.forEach(c => c.res.write(msg));
}

app.listen(PORT, () => console.log(`Monitor running on http://localhost:${PORT}`));
