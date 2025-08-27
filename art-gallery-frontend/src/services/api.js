// src/services/api.js
let BASE = import.meta.env.VITE_API_BASE_URL || ""; // si se define en .env lo usa
const DEV_BACKENDS = ["http://18.223.160.122:5000", "http://18.218.51.122:5000"];

async function detectBackend() {
  if (BASE) return BASE; // si ya viene de la env, lo usamos
  for (let url of DEV_BACKENDS) {
    try {
      const res = await fetch(`${url}/galeria`, { method: "GET" });
      if (res.ok) return url;
    } catch {}
  }
  return DEV_BACKENDS[0]; // fallback al primero
}

// Promise que resuelve BASE
const baseReady = detectBackend().then(url => {
  BASE = url;
  console.log("API base detectada:", BASE);
});

async function request(
  path,
  { method = "GET", body, headers, isUpload = false } = {}
) {
  await baseReady; // esperar a detectar backend
  const opts = { method, headers: { ...(headers || {}) } };

  if (body && !isUpload) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }

  // 🔎 log opcional para depuración
  console.log("API Request:", method, `${BASE}${path}`, body);

  const res = await fetch(`${BASE}${path}`, opts);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  return res.headers.get("content-type")?.includes("application/json")
    ? res.json()
    : res.text();
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body }),
  put: (path, body) => request(path, { method: "PUT", body }),
  putFile: async (presignedUrl, file) => {
    const res = await fetch(presignedUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!res.ok) throw new Error(`S3 PUT ${res.status}`);
    return true;
  },
};
