// src/hooks/useAuth.js (estado mínimo de sesión)
import { useEffect, useState } from "react";


export function useAuth(){
const [session, setSession] = useState(()=>{
const raw = localStorage.getItem("session");
return raw ? JSON.parse(raw) : null;
});


useEffect(()=>{
if (session) localStorage.setItem("session", JSON.stringify(session));
else localStorage.removeItem("session");
},[session]);


const saveSession = (data)=> setSession(data);
const logout = ()=> setSession(null);


return {
isAuthenticated: Boolean(session?.token),
token: session?.token || null,
user: session?.user || null,
saveSession,
logout,
};
}