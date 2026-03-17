import { useState, useEffect } from "react";
import { supabase } from "../supabase.js";
import DettaglioCasa from "./DettaglioCasa";

export default function Dashboard() {
  const [leMieCase, setLeMieCase] = useState([]);
  const [tuttePrenotazioni, setTuttePrenotazioni] = useState([]);
  const [casaSelezionata, setCasaSelezionata] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    scaricaDati();
  }, []);

  const scaricaDati = async () => {
    setLoading(true);
    const resCase = await supabase.from('case').select('*').order('created_at', { ascending: false });
    const resPren = await supabase.from('prenotazioni').select('*');
    if (resCase.data) setLeMieCase(resCase.data);
    if (resPren.data) setTuttePrenotazioni(resPren.data);
    setLoading(false);
  };

  // Genera i prossimi 21 giorni per il calendario
  const oggi = new Date();
  const giorni = Array.from({ length: 21 }, (_, i) => {
    const d = new Date(oggi);
    d.setDate(oggi.getDate() + i);
    return { 
      full: d.toISOString().split('T')[0], 
      label: d.getDate(),
      mese: d.toLocaleDateString('it-IT', { month: 'short' }),
      isWeekend: d.getDay() === 0 || d.getDay() === 6 
    };
  });

  if (casaSelezionata) {
    return <DettaglioCasa casa={casaSelezionata} tornaIndietro={() => { setCasaSelezionata(null); scaricaDati(); }} />;
  }

  return (
    <div style={{ background: "#F8FAFC", minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
      {/* Header Mobile */}
      <header style={{ background: "white", padding: "15px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
        <h2 style={{ margin: 0, color: "#0EA5E9", fontSize: 22 }}>🌊 MareApp</h2>
        <button onClick={() => supabase.auth.signOut()} style={{ background: "#F1F5F9", border: "none", padding: "8px 12px", borderRadius: 8, color: "#64748B", fontWeight: "600", fontSize: 13 }}>Esci</button>
      </header>

      <main style={{ padding: "15px", maxWidth: 800, margin: "0 auto" }}>
        
        {/* Sezione Calendario Rapido */}
        <section style={{ marginBottom: 25 }}>
          <h3 style={{ fontSize: 16, color: "#64748B", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>🗓️ Disponibilità Prossimi Giorni</h3>
          <div style={{ background: "white", borderRadius: 20, padding: "15px 10px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <div style={{ minWidth: "650px" }}>
              {/* Intestazione Date */}
              <div style={{ display: "flex", marginBottom: 10 }}>
                <div style={{ width: 100, flexShrink: 0 }}></div>
                {giorni.map(g => (
                  <div key={g.full} style={{ width: 30, textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: "#94A3B8" }}>{g.mese}</div>
                    <div style={{ fontSize: 12, fontWeight: "bold", color: g.isWeekend ? "#0EA5E9" : "#1E293B" }}>{g.label}</div>
                  </div>
                ))}
              </div>
              {/* Righe Case */}
              {leMieCase.map(casa => (
                <div key={casa.id} style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ width: 100, flexShrink: 0, fontSize: 13, fontWeight: "600", color: "#334155", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {casa.nome}
                  </div>
                  <div style={{ display: "flex" }}>
                    {giorni.map(g => {
                      const occupata = tuttePrenotazioni.find(p => p.casa_id === casa.id && g.full >= p.data_arrivo && g.full < p.data_partenza);
                      return (
                        <div key={g.full} style={{ 
                          width: 26, height: 26, margin: "0 2px", borderRadius: 6,
                          background: occupata ? "#FB7185" : "#CCFBF1",
                          border: occupata ? "1px solid #E11D48" : "1px solid #99F6E4"
                        }}></div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sezione Lista Case */}
        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
            <h3 style={{ fontSize: 18, color: "#1E293B", margin: 0 }}>🏠 Le tue proprietà</h3>
            <button 
              onClick={async () => {
                const n = prompt("Nome nuova casa?");
                if(n) { await supabase.from('case').insert([{ nome: n }]); scaricaDati(); }
              }} 
              style={{ background: "#0EA5E9", color: "white", border: "none", padding: "10px 15px", borderRadius: 12, fontWeight: "bold", fontSize: 14 }}
            >
              + Aggiungi
            </button>
          </div>

          <div style={{ display: "grid", gap: 15 }}>
            {leMieCase.map(casa => (
              <div 
                key={casa.id} 
                onClick={() => setCasaSelezionata(casa)}
                style={{ background: "white", borderRadius: 24, padding: "20px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #F1F5F9" }}
              >
                <div>
                  <h4 style={{ margin: "0 0 5px 0", fontSize: 18, color: "#1E293B" }}>{casa.nome}</h4>
                  <p style={{ margin: 0, fontSize: 14, color: "#0EA5E9", fontWeight: "600" }}>Gestisci prenotazioni ➔</p>
                </div>
                <div style={{ background: "#F0F9FF", padding: "12px", borderRadius: "15px" }}>
                  🏠
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}