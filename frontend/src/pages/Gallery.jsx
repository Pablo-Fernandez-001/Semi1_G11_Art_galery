// src/pages/Gallery.jsx (Visualizar Galería Completa)
import React, { useEffect, useState } from "react";
import { api } from "../services/api.js";


export default function Gallery(){
const [items, setItems] = useState([]);
const [loading, setLoading] = useState(true);


useEffect(()=>{
(async()=>{
try {
const data = await api.get("/gallery");
setItems(data.items || []);
} finally {
setLoading(false);
}
})();
},[]);


if (loading) return <p className="text-neutral-400">Cargando galería…</p>;


return (
<section className="space-y-3">
<h1 className="text-2xl font-semibold">Galería</h1>
{items.length === 0 ? (
<p className="text-neutral-400">No hay obras disponibles.</p>
) : (
<ul className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
{items.map((it)=> (
<li key={it.id} className="bg-neutral-900/70 border border-neutral-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition">
<img src={it.imageUrl} alt={it.title} className="w-full h-48 object-cover"/>
<div className="p-3 text-sm">
<div className="font-semibold truncate text-white">{it.title}</div>
<div className="text-neutral-400">{it.author} • {it.year}</div>
<div className="mt-2 flex items-center justify-between">
<span className={`text-xs ${it.available ? 'text-green-400' : 'text-red-400'}`}>{it.available ? "Disponible" : "No disponible"}</span>
{it.available && (
<button className="text-xs px-3 py-1 rounded-lg bg-gradient-to-r from-pink-400 to-purple-400 text-black font-semibold hover:from-pink-300 hover:to-purple-300 transition">Adquirir</button>
)}
</div>
</div>
</li>
))}
</ul>
)}
</section>
);
}