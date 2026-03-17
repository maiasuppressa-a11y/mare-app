import { useState, useEffect } from "react";
import { supabase } from "../supabase.js";

export default function Dashboard() {
  const [leMieCase, setLeMieCase] = useState([]);
  const [tuttePrenotazioni, setTuttePrenotazioni] = useState([]);
  const [casaSelezionata, setCasaSelezionata] = useState(null);
  const [nomeCasa, setNomeCasa] = useState("");

  // Stati Dettaglio Casa
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

  // LOGICA CALENDARIO A TABELLA SETTIMANALE
  const oggi = new Date();
  const giorniCalendario = Array.from({ length: 28 }, (_, i) => {
    const d = new Date(oggi);
    d.setDate(oggi.getDate() + i);
    return { str: d.toISOString().split('T')[0], label: d.getDate(), mese: d.getMonth() + 1 };
  });

  return (
    <div style={{ background: "#F8FAFC", minHeight: "100vh", fontFamily: "sans-serif", paddingBottom: 40 }}>
      {/* NAVBAR */}
      <nav style={{ background: "white", padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 5px rgba(0,0,0,0.05)", position: "sticky", top: 0, zIndex: 100 }}>
        <b style={{ color: "#0EA5E9", fontSize: "20px" }} onClick={() => setCasaSelezionata(null)}>🌊 MareApp</b>
        <button onClick={() => supabase.auth.signOut()} style={{ background: "#EF4444", color: "white", border: "none", padding: "6px 12px", borderRadius: 8, fontSize: "12px" }}>Esci</button>
      </nav>

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "15px" }}>
        {!casaSelezionata ? (
          <>
            <h2 style={{ fontSize: "18px", color: "#1E293B", marginBottom: "15px" }}>🗓️ Occupazione Case</h2>
            
            {/* TABELLA CALENDARIO RESPONSIVE */}
            {leMieCase.map(casa => (
              <div key={casa.id} style={{ background: "white", padding: "15px", borderRadius: "16px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", marginBottom: "15px" }}>
                <b style={{ fontSize: "14px", color: "#475569" }}>{casa.nome}</b>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "5px", marginTop: "10px" }}>
                  {giorniCalendario.map(g => {
                    const pren = tuttePrenotazioni.find(p => p.casa_id === casa.id && g.str >= p.data_arrivo && g.str < p.data_partenza);
                    return (
                      <div key={g.str} style={{ 
                        height: "35px", borderRadius: "8px", fontSize: "10px", fontWeight: "bold",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: pren ? "#FDA4AF" : "#CCFBF1",
                        border: pren ? "1px solid #F43F5E" : "1px solid #2DD4BF",
                        color: pren ? "#991B1B" : "#0D9488"
                      }}>
                        {g.label}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <h2 style={{ fontSize: "18px", color: "#1E293B", marginTop: "30px", marginBottom: "15px" }}>🏠 Le tue strutture</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "15px" }}>
              {leMieCase.map(casa => (
                <div key={casa.id} onClick={() => apriCasa(casa)} style={{ background: "white", borderRadius: "15px", overflow: "hidden", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", textAlign: "center", borderBottom: "4px solid #0EA5E9" }}>
                   <div style={{height: "80px", background: casa.foto_url ? `url(${casa.foto_url}) center/cover` : "#E2E8F0"}}></div>
                   <div style={{padding: "10px", fontSize: "14px", fontWeight: "bold"}}>{casa.nome}</div>
                </div>
              ))}
              <div style={{ background: "#F1F5F9", borderRadius: "15px", border: "2px dashed #CBD5E1", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "110px" }}>
                 <input type="text" placeholder="Nuova..." value={nomeCasa} onChange={e=>setNomeCasa(e.target.value)} style={{width: "70%", border: "none", background: "transparent", fontSize: "12px"}} />
                 <button onClick={handleAggiungiCasa} style={{background: "#0EA5E9", color: "white", border: "none", borderRadius: "50%", width: "25px", height: "25px"}}>+</button>
              </div>
            </div>
          </>
        ) : (
          /* DETTAGLIO CASA COMPLETO */
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <button onClick={() => setCasaSelezionata(null)} style={{ background: "#E2E8F0", border: "none", padding: "10px", borderRadius: "10px", alignSelf: "flex-start" }}>← Torna alle Case</button>
            
            <div style={{ background: "white", padding: "20px", borderRadius: "20px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
              <h2 style={{ marginTop: 0 }}>{casaSelezionata.nome}</h2>
              
              <form onSubmit={handleAggiungiPrenotazione} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <input type="text" placeholder="Nome Cliente" required value={nomeCliente} onChange={e=>setNomeCliente(e.target.value)} style={{ padding: "12px", borderRadius: "10px", border: "1px solid #E2E8F0" }} />
                <div style={{ display: "flex", gap: "10px" }}>
                  <input type="date" required value={dataArrivo} onChange={e=>setDataArrivo(e.target.value)} style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "1px solid #E2E8F0" }} />
                  <input type="date" required value={dataPartenza} onChange={e=>setDataPartenza(e.target.value)} style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "1px solid #E2E8F0" }} />
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <input type="number" placeholder="Persone" value={nPersone} onChange={e=>setNPersone(e.target.value)} style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "1px solid #E2E8F0" }} />
                  <input type="number" placeholder="Prezzo Tot €" value={prezzo} onChange={e=>setPrezzo(e.target.value)} style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "1px solid #E2E8F0" }} />
                </div>
                <textarea placeholder="Note (codici, biancheria...)" value={note} onChange={e=>setNote(e.target.value)} style={{ padding: "12px", borderRadius: "10px", border: "1px solid #E2E8F0", minHeight: "80px" }} />
                <button type="submit" style={{ background: "#0EA5E9", color: "white", padding: "15px", borderRadius: "12px", border: "none", fontWeight: "bold" }}>Salva Prenotazione</button>
              </form>
            </div>

            {/* LISTA PRENOTAZIONI ESISTENTI */}
            <h3 style={{fontSize: "16px", color: "#475569"}}>Ospiti in arrivo</h3>
            {prenotazioni.map(p => (
              <div key={p.id} style={{ background: "white", padding: "15px", borderRadius: "15px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.03)" }}>
                <div>
                  <b style={{fontSize: "15px"}}>{p.nome_cliente}</b>
                  <div style={{fontSize: "12px", color: "#94A3B8"}}>{p.data_arrivo} ➔ {p.data_partenza}</div>
                </div>
                <div style={{fontWeight: "bold", color: "#10B981"}}>€{p.prezzo}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}