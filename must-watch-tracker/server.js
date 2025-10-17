import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3001;

app.get("/api/imdb", async (req, res) => {
  const q = req.query.q || "";
  const url = `https://imdb8.p.rapidapi.com/auto-complete?q=${encodeURIComponent(q)}`;
  try {
    const response = await fetch(url, {
      headers: {
        "X-RapidAPI-Key": process.env.VITE_API_KEY,
        "X-RapidAPI-Host": "imdb8.p.rapidapi.com",
      },
    });
    const data = await response.json();
    res.json(data);
  } catch {
    res.status(500).json({ error: "Proxy error" });
  }
});

app.listen(PORT, () => console.log(`Proxy running on http://localhost:${PORT}`));
