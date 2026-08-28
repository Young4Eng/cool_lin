import express from "express";
import cors from "cors";

const app = express();
const PORT = Number(process.env.PORT ?? 4000);

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, at: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`server listening on http://localhost:${PORT}`);
});
