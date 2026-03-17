import { useState, useEffect } from "react";
import { supabase } from "../supabase.js";

export default function Dashboard() {
  const [leMieCase, setLeMieCase] = useState([]);
  const [tuttePrenotazioni, setTuttePrenotazioni] = useState([]);
  const [casaSelezionata, setCasaSelezionata] = useState(null);
  const [nomeCasa, setNomeCasa] = useState("");

  // Stati per il dettaglio (Ripresi dal tuo file originale)
  const [prenotazioni, setPrenotazioni] = useState([]);
  const [nomeCliente, setNomeCliente] = useState("");
  const [dataArrivo, setDataArrivo] = useState("");
  const [dataPartenza, setDataPartenza] = useState("");
  const [prezzo, setPrezzo] = useState("");

  useEffect(() => { 
    scaricaCase(); 
    scaricaTuttePrenotazioni(); 
  }, []);

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
    setPrenotazioni(p || []);
  };

  const handleAggiungiCasa = async () => {
    if (!nomeCasa) return;
    await supabase.from('case').insert([{ nome: nomeCasa }]);
    setNomeCasa("");
    scaricaCase();
  };

  // LOGICA TABELLA SETTIMANALE (7 GIORNI PER RIGA)
  const oggi = new Date();
  const giorniProssimi = Array.from({ length: 28 }, (_, i) => {
    const d = new Date(oggi);
    d.setDate(oggi.getDate() + i);
    return {
      str: d.toISOString().split('T')[0],
      label: d.getDate() + "/" + (d.getMonth() + 1)
    };
  });

  return (
    <div style={{ background: "#F1F5F9", minHeight: "100vh", paddingBottom: "40px" }}>
      {/* NAVBAR */}
      <nav style={{ background: "white", padding: "15px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
        <h1 style={{ margin: 0, color: "#0EA5E9", fontSize: "20px" }} onClick={() => setCasaSelezionata(null)}>🌊 MareApp</h1>
        <button onClick={() => supabase.auth.signOut()} style={{ background: "#EF4444", color: "white", border: "none", padding: "8px 12px", borderRadius: "8px" }}>Esci</button>
      </nav>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "15px" }}>
        {!casaSelezionata ? (
          <>
            <h2 style={{ fontSize: "18px", marginBottom: "15px" }}>🗓️ Calendario Settimanale</h2>
            
            {leMieCase.map(casa => (
              <div key={casa.id} style={{ background: "white", padding: "15px", borderRadius: "15px", marginBottom: "20px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
                <h3 style={{ marginTop: 0, fontSize: "16px" }}>{casa.nome}</h3>
                
                {/* LA GRIGLIA: 7 COLONNE */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "5px" }}>
                  {giorniProssimi.map(g => {
                    const pren = tuttePrenotazioni.find(p => p.casa_id === casa.id && g.str >= p.data_arrivo && g.str < p.data_partenza);
                    return (
                      <div key={g.str} style={{
                        aspectRatio: "1/1",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "10px",
                        borderRadius: "6px",
                        fontWeight: "bold",
                        background: pren ? "#FDA4AF" : "#CCFBF1",
                        border: pren ? "1px solid #F43F5E" : "1px solid #2DD4BF",
                        color: pren ? "#991B1B" : "#0D9488"
                      }}>
                        {g.label.split('/')[0]}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <h2 style={{ fontSize: "18px", marginTop: "30px" }}>🏠 Le tue case</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {leMieCase.map(casa => (
                <div key={casa.id} onClick={() => apriCasa(casa)} style={{ background: "white", padding: "20px", borderRadius: "15px", textAlign: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                  <b>{casa.nome}</b>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* DETTAGLIO CASA */
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <button onClick={() => setCasaSelezionata(null)} style={{ alignSelf: "flex-start", padding: "10px", border: "none", borderRadius: "10px" }}>← Indietro</button>
            <div style={{ background: "white", padding: "20px", borderRadius: "20px" }}>
              <h2>{casaSelezionata.nome}</h2>
              {/* Qui puoi rimettere il tuo form per le prenotazioni */}
              <p>Gestione prenotazioni attiva per {casaSelezionata.nome}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}