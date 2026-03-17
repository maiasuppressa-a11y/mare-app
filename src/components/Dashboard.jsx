import { useState, useEffect } from "react";
import { supabase } from "../supabase.js";

export default function Dashboard() {
  const [leMieCase, setLeMieCase] = useState([]);
  const [tuttePrenotazioni, setTuttePrenotazioni] = useState([]);
  const [nomeCasa, setNomeCasa] = useState("");
  const [casaSelezionata, setCasaSelezionata] = useState(null);

  // Stati per Dettaglio (Ripresi dal tuo codice originale)
  const [prenotazioni, setPrenotazioni] = useState([]);
  const [tariffe, setTariffe] = useState([]);
  const [nomeCliente, setNomeCliente] = useState("");
  const [telefono, setTelefono] = useState("");
  const [nPersone, setNPersone] = useState("");
  const [dataArrivo, setDataArrivo] = useState("");
  const [dataPartenza, setDataPartenza] = useState("");
  const [prezzo, setPrezzo] = useState("");
  const [biancheria, setBiancheria] = useState(false);
  const [note, setNote] = useState("");
  const [inizioTariffa, setInizioTariffa] = useState("");
  const [fineTariffa, setFineTariffa] = useState("");
  const [prezzoTariffa, setPrezzoTariffa] = useState("");
  const [nuovaFotoUrl, setNuovaFotoUrl] = useState("");

  useEffect(() => { scaricaCase(); scaricaTuttePrenotazioni(); }, []);

  const scaricaCase = async () => {
    const { data } = await supabase.from('case').select('*').order('created_at', { ascending: false });
    if (data) setLeMieCase(data);
  };

  const scaricaTuttePrenotazioni = async () => {
    const { data } = await supabase.from('prenotazioni').select('*');
    if (data) setTuttePrenotazioni(data);
  };

  const apriCasa = async (casa) => {
    setCasaSelezionata(casa);
    const { data: p } = await supabase.from('prenotazioni').select('*').eq('casa_id', casa.id).order('data_arrivo');
    const { data: t } = await supabase.from('tariffe').select('*').eq('casa_id', casa.id).order('data_inizio');
    setPrenotazioni(p || []);
    setTariffe(t || []);
  };

  const handleAggiungiCasa = async (e) => {
    e.preventDefault();
    await supabase.from('case').insert([{ nome: nomeCasa }]);
    setNomeCasa(""); scaricaCase();
  };

  const handleAggiungiPrenotazione = async (e) => {
    e.preventDefault();
    await supabase.from('prenotazioni').insert([{
      casa_id: casaSelezionata.id, nome_cliente: nomeCliente, telefono: telefono,
      n_persone: parseInt(nPersone), data_arrivo: dataArrivo, data_partenza: dataPartenza,
      prezzo: parseFloat(prezzo), biancheria: biancheria, note: note
    }]);
    setNomeCliente(""); setTelefono(""); setNPersone(""); setDataArrivo(""); setDataPartenza(""); setPrezzo(""); setBiancheria(false); setNote("");
    apriCasa(casaSelezionata); scaricaTuttePrenotazioni();
  };

  const handleAggiungiTariffa = async (e) => {
    e.preventDefault();
    await supabase.from('tariffe').insert([{
      casa_id: casaSelezionata.id, data_inizio: inizioTariffa, data_fine: fineTariffa, prezzo: parseFloat(prezzoTariffa)
    }]);
    setInizioTariffa(""); setFineTariffa(""); setPrezzoTariffa(""); apriCasa(casaSelezionata);
  };

  const handleAggiornaFoto = async (e) => {
    e.preventDefault();
    await supabase.from('case').update({ foto_url: nuovaFotoUrl }).eq('id', casaSelezionata.id);
    setNuovaFotoUrl("");
    const nuovaCasa = { ...casaSelezionata, foto_url: nuovaFotoUrl };
    setCasaSelezionata(nuovaCasa);
    scaricaCase();
  };

  // Calendario 30gg (Logica originale)
  const oggi = new Date();
  const prossimi30Giorni = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(oggi); d.setDate(oggi.getDate() + i);
    const y = d.getFullYear(); const m = String(d.getMonth() + 1).padStart(2, '0'); const day = String(d.getDate()).padStart(2, '0');
    return { str: `${y}-${m}-${day}`, label: `${day}/${m}` };
  });

  return (
    <div style={{ background: "#F8FAFC", minHeight: "100vh", fontFamily: "sans-serif", paddingBottom: 50 }}>
      {/* NAVBAR */}
      <div style={{ background: "white", padding: "15px 30px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", position: "sticky", top: 0, zIndex: 100 }}>
        <span onClick={() => setCasaSelezionata(null)} style={{ cursor: "pointer", fontWeight: "800", color: "#0EA5E9", fontSize: 24, letterSpacing: "-1px" }}>🌊 MareApp</span>
        <button onClick={() => supabase.auth.signOut()} style={{ background: "#FEE2E2", color: "#EF4444", border: "none", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontWeight: "bold" }}>Esci</button>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "20px" }}>
        {!casaSelezionata ? (
          <>
            {/* CALENDARIO GANTT */}
            <div style={{ background: "white", padding: 25, borderRadius: 20, boxShadow: "0 4px 15px rgba(0,0,0,0.05)", marginBottom: 30, overflowX: "auto" }}>
              <h2 style={{ color: "#1E293B", marginTop: 0, marginBottom: 20, fontSize: 18, display: "flex", alignItems: "center", gap: 10 }}>🗓️ Stato Occupazione</h2>
              <div style={{ minWidth: "850px" }}>
                <div style={{ display: "flex", marginBottom: 10 }}>
                  <div style={{ width: 160 }}></div>
                  {prossimi30Giorni.map(g => <div key={g.str} style={{ width: 32, textAlign: "center", fontSize: 11, color: "#94A3B8", fontWeight: "600" }}>{g.label}</div>)}
                </div>
                {leMieCase.map(casa => (
                  <div key={casa.id} style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ width: 160, fontWeight: "bold", color: "#334155", fontSize: 13 }}>{casa.nome}</div>
                    {prossimi30Giorni.map(g => {
                      const pren = tuttePrenotazioni.find(p => p.casa_id === casa.id && g.str >= p.data_arrivo && g.str < p.data_partenza);
                      return <div key={g.str} style={{ width: 30, height: 22, margin: "1px", borderRadius: 5, background: pren ? "#FDA4AF" : "#CCFBF1", border: pren ? "1px solid #F43F5E" : "1px solid #2DD4BF" }}></div>
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* FORM AGGIUNGI CASA */}
            <div style={{ background: "white", padding: 25, borderRadius: 20, boxShadow: "0 4px 15px rgba(0,0,0,0.05)", marginBottom: 30 }}>
              <h2 style={{ color: "#0EA5E9", marginTop: 0, marginBottom: 15, fontSize: 18 }}>🏠 Le tue proprietà</h2>
              <form onSubmit={handleAggiungiCasa} style={{ display: "flex", gap: 15 }}>
                <input type="text" required placeholder="Nome nuova casa..." value={nomeCasa} onChange={(e) => setNomeCasa(e.target.value)} style={{ flex: 1, padding: "12px 15px", borderRadius: 12, border: "2px solid #F1F5F9", outline: "none" }} />
                <button type="submit" style={{ background: "#0EA5E9", color: "white", padding: "0 25px", borderRadius: 12, border: "none", cursor: "pointer", fontWeight: "bold" }}>+ Aggiungi</button>
              </form>
            </div>

            {/* GRIGLIA CASE */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {leMieCase.map((casa) => (
                <div key={casa.id} onClick={() => apriCasa(casa)} style={{ background: "white", borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", cursor: "pointer" }}>
                  <div style={{ height: 140, background: casa.foto_url ? `url(${casa.foto_url}) center/cover` : "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", color: "#94A3B8" }}>
                    {!casa.foto_url && "Nessuna foto"}
                  </div>
                  <div style={{ padding: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ margin: 0, color: "#1E293B" }}>{casa.nome}</h3>
                    <span style={{ color: "#0EA5E9", fontWeight: "bold" }}>Gestisci →</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* DETTAGLIO CASA (TUTTE LE TUE FUNZIONI) */
          <div>
            <button onClick={() => setCasaSelezionata(null)} style={{ background: "none", border: "none", color: "#64748B", fontWeight: "bold", cursor: "pointer", marginBottom: 20 }}>← Torna alla Home</button>
            <h1 style={{ color: "#1E293B", marginBottom: 30 }}>{casaSelezionata.nome}</h1>

            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 25 }}>
              
              {/* COLONNA SINISTRA: PRENOTAZIONI */}
              <div>
                <div style={{ background: "white", padding: 25, borderRadius: 24, boxShadow: "0 4px 15px rgba(0,0,0,0.05)", marginBottom: 25 }}>
                  <h3 style={{ color: "#10B981", marginTop: 0 }}>Nuova Prenotazione</h3>
                  <form onSubmit={handleAggiungiPrenotazione} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
                    <input type="text" placeholder="Nome Ospite" required value={nomeCliente} onChange={e=>setNomeCliente(e.target.value)} style={{ gridColumn: "span 2", padding: 12, borderRadius: 10, border: "1px solid #E2E8F0" }} />
                    <input type="date" required value={dataArrivo} onChange={e=>setDataArrivo(e.target.value)} style={{ padding: 12, borderRadius: 10, border: "1px solid #E2E8F0" }} />
                    <input type="date" required value={dataPartenza} onChange={e=>setDataPartenza(e.target.value)} style={{ padding: 12, borderRadius: 10, border: "1px solid #E2E8F0" }} />
                    <input type="number" placeholder="Persone" value={nPersone} onChange={e=>setNPersone(e.target.value)} style={{ padding: 12, borderRadius: 10, border: "1px solid #E2E8F0" }} />
                    <input type="number" placeholder="Prezzo Totale €" value={prezzo} onChange={e=>setPrezzo(e.target.value)} style={{ padding: 12, borderRadius: 10, border: "1px solid #E2E8F0" }} />
                    <textarea placeholder="Note..." value={note} onChange={e=>setNote(e.target.value)} style={{ gridColumn: "span 2", padding: 12, borderRadius: 10, border: "1px solid #E2E8F0", minHeight: 60 }} />
                    <button type="submit" style={{ gridColumn: "span 2", background: "#10B981", color: "white", padding: 15, borderRadius: 12, border: "none", fontWeight: "bold", cursor: "pointer" }}>Salva Prenotazione</button>
                  </form>
                </div>

                <h3 style={{ color: "#1E293B" }}>Calendario Ospiti</h3>
                {prenotazioni.map(p => (
                  <div key={p.id} style={{ background: "white", padding: 20, borderRadius: 15, marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: "bold", fontSize: 16 }}>{p.nome_cliente}</div>
                      <div style={{ fontSize: 13, color: "#64748B" }}>{p.data_arrivo} / {p.data_partenza}</div>
                    </div>
                    <div style={{ fontWeight: "bold", color: "#10B981" }}>€{p.prezzo}</div>
                  </div>
                ))}
              </div>

              {/* COLONNA DESTRA: FOTO E TARIFFE */}
              <div>
                <div style={{ background: "white", padding: 25, borderRadius: 24, boxShadow: "0 4px 15px rgba(0,0,0,0.05)", marginBottom: 25 }}>
                  <h3 style={{ color: "#F59E0B", marginTop: 0 }}>Foto Copertina</h3>
                  <form onSubmit={handleAggiornaFoto} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <input type="text" placeholder="Link immagine..." value={nuovaFotoUrl} onChange={e=>setNuovaFotoUrl(e.target.value)} style={{ padding: 10, borderRadius: 8, border: "1px solid #E2E8F0" }} />
                    <button type="submit" style={{ background: "#F59E0B", color: "white", padding: 10, borderRadius: 8, border: "none", fontWeight: "bold" }}>Aggiorna</button>
                  </form>
                </div>

                <div style={{ background: "white", padding: 25, borderRadius: 24, boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
                  <h3 style={{ color: "#8B5CF6", marginTop: 0 }}>Tariffe</h3>
                  <form onSubmit={handleAggiungiTariffa} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <input type="date" value={inizioTariffa} onChange={e=>setInizioTariffa(e.target.value)} style={{ padding: 8, borderRadius: 8, border: "1px solid #E2E8F0" }} />
                    <input type="date" value={fineTariffa} onChange={e=>setFineTariffa(e.target.value)} style={{ padding: 8, borderRadius: 8, border: "1px solid #E2E8F0" }} />
                    <input type="number" placeholder="€ al giorno" value={prezzoTariffa} onChange={e=>setPrezzoTariffa(e.target.value)} style={{ padding: 8, borderRadius: 8, border: "1px solid #E2E8F0" }} />
                    <button type="submit" style={{ background: "#8B5CF6", color: "white", padding: 10, borderRadius: 8, border: "none", fontWeight: "bold" }}>Aggiungi Tariffa</button>
                  </form>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}