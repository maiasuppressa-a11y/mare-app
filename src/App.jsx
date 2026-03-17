import { useState, useEffect } from "react";
import { supabase } from "./supabase.js";

// --- COMPONENTE LOGIN ---
function Auth() {
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

// --- APP PRINCIPALE ---
export default function App() {
  const [session, setSession] = useState(null);
  const [leMieCase, setLeMieCase] = useState([]);
  const [tuttePrenotazioni, setTuttePrenotazioni] = useState([]);
  const [casaSelezionata, setCasaSelezionata] = useState(null);
  const [nomeCasa, setNomeCasa] = useState("");

  // Stati per moduli dettaglio (omessi per brevità, ma presenti nel codice completo)
  const [prenotazioni, setPrenotazioni] = useState([]);
  const [nomeCliente, setNomeCliente] = useState("");
  const [telefono, setTelefono] = useState("");
  const [dataArrivo, setDataArrivo] = useState("");
  const [dataPartenza, setDataPartenza] = useState("");
  const [prezzo, setPrezzo] = useState("");
  const [note, setNote] = useState("");
  const [tariffe, setTariffe] = useState([]);
  const [inizioTariffa, setInizioTariffa] = useState("");
  const [fineTariffa, setFineTariffa] = useState("");
  const [prezzoTariffa, setPrezzoTariffa] = useState("");
  const [nuovaFotoUrl, setNuovaFotoUrl] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) { scaricaDati(); }
  }, [session]);

  const scaricaDati = async () => {
    const resCase = await supabase.from('case').select('*').order('created_at', { ascending: false });
    const resPren = await supabase.from('prenotazioni').select('*');
    if (resCase.data) setLeMieCase(resCase.data);
    if (resPren.data) setTuttePrenotazioni(resPren.data);
  };

  const apriCasa = async (casa) => {
    setCasaSelezionata(casa);
    const resP = await supabase.from('prenotazioni').select('*').eq('casa_id', casa.id).order('data_arrivo', { ascending: true });
    const resT = await supabase.from('tariffe').select('*').eq('casa_id', casa.id).order('data_inizio', { ascending: true });
    setPrenotazioni(resP.data || []);
    setTariffe(resT.data || []);
  };

  const aggiungiCasa = async (e) => {
    e.preventDefault();
    await supabase.from('case').insert([{ nome: nomeCasa }]);
    setNomeCasa(""); scaricaDati();
  };

  const aggiungiPrenotazione = async (e) => {
    e.preventDefault();
    await supabase.from('prenotazioni').insert([{
      casa_id: casaSelezionata.id, nome_cliente: nomeCliente, telefono,
      data_arrivo: dataArrivo, data_partenza: dataPartenza, prezzo: parseFloat(prezzo), note
    }]);
    setNomeCliente(""); setTelefono(""); setDataArrivo(""); setDataPartenza(""); setPrezzo(""); setNote("");
    apriCasa(casaSelezionata); scaricaDati();
  };

  const eliminaCasa = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("Eliminare la casa?")) {
      await supabase.from('case').delete().eq('id', id);
      scaricaDati();
    }
  };

  // Logica Calendario Dashboard
  const oggi = new Date();
  const giorni = Array.from({ length: 21 }, (_, i) => {
    const d = new Date(oggi); d.setDate(oggi.getDate() + i);
    return { 
      full: d.toISOString().split('T')[0], 
      label: d.getDate(), 
      isWeekend: d.getDay() === 0 || d.getDay() === 6 
    };
  });

  if (!session) return <Auth />;

  return (
    <div style={{ background: "#F8FAFC", minHeight: "100vh", fontFamily: "system-ui, sans-serif", paddingBottom: 40 }}>
      
      {/* HEADER COMPATTO PER MOBILE */}
      <header style={{ background: "white", padding: "15px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
        <h2 onClick={() => setCasaSelezionata(null)} style={{ margin: 0, color: "#0EA5E9", fontSize: 22, cursor: "pointer" }}>🌊 MareApp</h2>
        <button onClick={() => supabase.auth.signOut()} style={{ background: "#F1F5F9", border: "none", padding: "8px 12px", borderRadius: 8, color: "#64748B", fontWeight: "600", fontSize: 13 }}>Esci</button>
      </header>

      <div style={{ padding: "15px", maxWidth: 800, margin: "0 auto" }}>
        
        {!casaSelezionata ? (
          <>
            {/* DASHBOARD CALENDARIO OTTIMIZZATA */}
            <section style={{ marginBottom: 30 }}>
              <h3 style={{ fontSize: 18, color: "#1E293B", marginBottom: 15 }}>🗓️ Stato Occupazione</h3>
              <div style={{ background: "white", borderRadius: 20, padding: "15px 10px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
                <div style={{ minWidth: "600px" }}>
                  {/* Riga date */}
                  <div style={{ display: "flex", marginBottom: 10 }}>
                    <div style={{ width: 100, flexShrink: 0 }}></div>
                    {giorni.map(g => (
                      <div key={g.full} style={{ width: 30, textAlign: "center", fontSize: 11, fontWeight: "bold", color: g.isWeekend ? "#0EA5E9" : "#94A3B8" }}>
                        {g.label}
                      </div>
                    ))}
                  </div>
                  {/* Righe Case */}
                  {leMieCase.map(casa => (
                    <div key={casa.id} style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
                      <div style={{ width: 100, flexShrink: 0, fontSize: 13, fontWeight: "600", color: "#334155", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 5 }}>
                        {casa.nome}
                      </div>
                      {giorni.map(g => {
                        const occupata = tuttePrenotazioni.find(p => p.casa_id === casa.id && g.full >= p.data_arrivo && g.full < p.data_partenza);
                        return (
                          <div key={g.full} style={{ 
                            width: 26, height: 26, margin: "0 2px", borderRadius: 6,
                            background: occupata ? "#FDA4AF" : "#CCFBF1",
                            border: occupata ? "2px solid #FB7185" : "2px solid #99F6E4"
                          }}></div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* LISTA CASE A SCHEDE */}
            <section>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
                <h3 style={{ fontSize: 18, color: "#1E293B", margin: 0 }}>🏠 Le tue case</h3>
                <button onClick={() => {let n = prompt("Nome nuova casa?"); if(n) setNomeCasa(n)}} style={{ background: "#0EA5E9", color: "white", border: "none", padding: "8px 15px", borderRadius: 10, fontWeight: "bold", fontSize: 13 }}>+ Aggiungi</button>
              </div>
              
              <div style={{ display: "grid", gap: 15 }}>
                {leMieCase.map(casa => (
                  <div key={casa.id} onClick={() => apriCasa(casa)} style={{ background: "white", borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", border: "1px solid #F1F5F9" }}>
                    {casa.foto_url ? (
                      <img src={casa.foto_url} style={{ width: "100%", height: 160, objectFit: "cover" }} />
                    ) : (
                      <div style={{ height: 100, background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", color: "#94A3B8" }}>Nessuna foto</div>
                    )}
                    <div style={{ padding: "15px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: 18, color: "#1E293B" }}>{casa.nome}</h4>
                        <span style={{ fontSize: 13, color: "#0EA5E9", fontWeight: "600" }}>Gestisci disponibilità ➔</span>
                      </div>
                      <button onClick={(e) => eliminaCasa(casa.id, e)} style={{ background: "#FFF1F2", border: "none", padding: "10px", borderRadius: 12, color: "#FB7185" }}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : (
          /* --- DETTAGLIO CASA (MOBILE OPTIMIZED) --- */
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <button onClick={() => setCasaSelezionata(null)} style={{ background: "none", border: "none", color: "#64748B", fontWeight: "bold", marginBottom: 20, padding: 0, fontSize: 16 }}>← Torna alla Home</button>
            <h2 style={{ marginBottom: 20 }}>{casaSelezionata.nome}</h2>

            {/* FORM NUOVA PRENOTAZIONE - COMPATTO */}
            <div style={{ background: "white", padding: 20, borderRadius: 20, boxShadow: "0 4px 6px rgba(0,0,0,0.05)", marginBottom: 20 }}>
              <h4 style={{ marginTop: 0, color: "#10B981" }}>Nuova Prenotazione</h4>
              <form onSubmit={aggiungiPrenotazione} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <input type="text" placeholder="Nome Ospite" required value={nomeCliente} onChange={e=>setNomeCliente(e.target.value)} style={{ padding: 12, borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 16 }} />
                <div style={{ display: "flex", gap: 10 }}>
                  <input type="date" required value={dataArrivo} onChange={e=>setDataArrivo(e.target.value)} style={{ flex: 1, padding: 12, borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 14 }} />
                  <input type="date" required value={dataPartenza} onChange={e=>setDataPartenza(e.target.value)} style={{ flex: 1, padding: 12, borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 14 }} />
                </div>
                <input type="number" placeholder="Prezzo Totale €" required value={prezzo} onChange={e=>setPrezzo(e.target.value)} style={{ padding: 12, borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 16 }} />
                <button type="submit" style={{ background: "#10B981", color: "white", padding: 15, borderRadius: 12, border: "none", fontWeight: "bold", fontSize: 16 }}>Salva</button>
              </form>
            </div>

            {/* ELENCO PRENOTAZIONI */}
            {prenotazioni.map(p => (
              <div key={p.id} style={{ background: "white", padding: 15, borderRadius: 15, marginBottom: 10, borderLeft: "4px solid #10B981", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: "bold", color: "#1E293B" }}>{p.nome_cliente}</div>
                  <div style={{ fontSize: 13, color: "#64748B" }}>{p.data_arrivo} / {p.data_partenza}</div>
                </div>
                <div style={{ fontWeight: "bold", color: "#10B981" }}>€{p.prezzo}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}