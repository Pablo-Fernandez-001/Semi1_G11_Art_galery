// src/services/api.js
let BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

// Balanceador de carga (se prueban ambas variantes: raíz y /api)
const DEV_BACKENDS = [
  "http://balanceador-api-1581958558.us-east-2.elb.amazonaws.com",
];

async function detectBackend() {
  // Si viene por .env, úsalo tal cual
  if (BASE) return BASE;

  // Probar el ALB con /galeria (tu backend está en español)
  for (let url of DEV_BACKENDS) {
    try {
      const res = await fetch(`${url.replace(/\/+$/, "")}`, { method: "GET" });
      if (res.ok) return url.replace(/\/+$/, "");
    } catch {}
  }
  // Fallback al primero
  return DEV_BACKENDS[0].replace(/\/+$/, "");
}

// Promise que resuelve BASE
const baseReady = detectBackend().then((url) => {
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

  // Asegura que el path inicie con "/"
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  // 🔎 log opcional para depuración
  console.log("API Request:", method, `${BASE}${cleanPath}`, body || "");

  const res = await fetch(`${BASE}${cleanPath}`, opts);
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
      headers: { "Content-Type": file.type || "application/octet-stream" },
      body: file,
    });
    if (!res.ok) throw new Error(`S3 PUT ${res.status}`);
    return true;
  },
};
