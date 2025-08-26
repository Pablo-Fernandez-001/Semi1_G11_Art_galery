// src/services/api.js (cliente fetch con base URL y helpers)
const BASE = import.meta.env.VITE_API_BASE_URL || ""; // si usas proxy de Vite, deja ""


async function request(path, { method="GET", body, headers, isUpload=false }={}){
const opts = { method, headers: { ...(headers||{}) } };
if (body && !isUpload) {
opts.headers["Content-Type"] = "application/json";
opts.body = JSON.stringify(body);
}
const res = await fetch(`${BASE}/api${path}`, opts);
if (!res.ok) throw new Error(`HTTP ${res.status}`);
return res.headers.get("content-type")?.includes("application/json") ? res.json() : res.text();
}


export const api = {
get: (path)=> request(path),
post: (path, body)=> request(path, { method:"POST", body }),
// Subida directa a S3 con URL prefirmada (PUT binario)
putFile: async (presignedUrl, file)=> {
const res = await fetch(presignedUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
if (!res.ok) throw new Error(`S3 PUT ${res.status}`);
return true;
},
};