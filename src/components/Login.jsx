import { useState } from "react";
import { supabase } from "../supabase.js"; // Nota i due puntini .. servono per tornare indietro di una cartella

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      if (isRegistering) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert("Registrato! Ora puoi fare il login.");
        setIsRegistering(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#F0F4F8", padding: 20 }}>
      <div style={{ background: "white", padding: "40px 25px", borderRadius: 24, width: "100%", maxWidth: 400, boxShadow: "0 10px 25px rgba(0,0,0,0.05)", textAlign: "center" }}>
        <h1 style={{ color: "#0EA5E9", margin: "0 0 10px 0", fontSize: 32 }}>🌊 MareApp</h1>
        <p style={{ color: "#64748B", marginBottom: 30 }}>Gestionale Case Vacanza</p>
        {errorMsg && <p style={{ color: "#EF4444", fontSize: 14, background: "#FEE2E2", padding: 12, borderRadius: 10 }}>{errorMsg}</p>}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          <input type="email" required placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ padding: 15, borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 16, outline: "none" }} />
          <input type="password" required placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={{ padding: 15, borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 16, outline: "none" }} />
          <button type="submit" style={{ padding: 16, background: "#0EA5E9", color: "white", borderRadius: 12, border: "none", fontWeight: "bold", cursor: "pointer", fontSize: 16, boxShadow: "0 4px 12px rgba(14, 165, 233, 0.3)" }}>
            {isRegistering ? "Crea Account" : "Entra"}
          </button>
        </form>
        <p onClick={() => setIsRegistering(!isRegistering)} style={{ marginTop: 25, color: "#64748B", cursor: "pointer", fontSize: 14 }}>
          {isRegistering ? "Hai già un account? Accedi" : "Non hai un account? Registrati"}
        </p>
      </div>
    </div>
  );
}