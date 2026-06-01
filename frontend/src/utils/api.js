const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const api = {
  analyze: async (text) => {
    const res = await fetch(`${API_BASE}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error("API error");
    return res.json();
  },
  chat: async (message, history = []) => {
    const res = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history }),
    });
    if (!res.ok) throw new Error("API error");
    return res.json();
  },
  ocr: async (file) => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${API_BASE}/ocr`, { method: "POST", body: form });
    if (!res.ok) throw new Error("OCR error");
    return res.json();
  },
  searchLaws: async (q, top = 5) => {
    const res = await fetch(`${API_BASE}/laws/search?q=${encodeURIComponent(q)}&top=${top}`);
    if (!res.ok) throw new Error("Search error");
    return res.json();
  },
  categories: async () => {
    const res = await fetch(`${API_BASE}/laws/categories`);
    if (!res.ok) throw new Error("Error");
    return res.json();
  },
};
