import { useState, useEffect } from "react";
import { supabase } from "../supabase.js";

export default function DettaglioCasa({ casa, tornaIndietro }) {
  const [prenotazioni, setPrenotazioni] = useState([]);
  const [nomeCliente, setNomeCliente] = useState("");
  const [telefono, setTelefono] = useState("");
  const [dataArrivo, setDataArrivo] = useState("");
  const [dataPartenza, setDataPartenza] = useState("");
  const [prezzo, setPrezzo] = useState("");

  useEffect(() => {
    scaricaPrenotazioni();
  }, [casa.id]);

  const scaricaPrenotazioni = async () => {
    const { data } = await supabase
      .from('prenotazioni')
      .select('*')
      .eq('casa_id', casa.id)
      .order('data_arrivo', { ascending: true });
    setPrenotazioni(data || []);
  };

  const aggiungiPrenotazione = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('prenotazioni').insert([{
      casa_id: casa.id,
      nome_cliente: nomeCliente,
      telefono: telefono,
      data_arrivo: dataArrivo,
      data_partenza: dataPartenza,
      prezzo: parseFloat(prezzo)
    }]);
    
    if (!error) {
      setNomeCliente(""); setTelefono(""); setDataArrivo(""); setDataPartenza(""); setPrezzo("");
      scaricaPrenotazioni();
    }
  };

  const inviaWhatsApp = (p) => {
    const messaggio = `Ciao ${p.nome_cliente}, ti confermo la prenotazione per ${casa.nome} dal ${p.data_arrivo} al ${p.data_partenza}. Ti aspettiamo! 🌊`;
    const url = `https://wa.me/${p.telefono.replace(/\D/g, '')}?text=${encodeURIComponent(messaggio)}`;
    window.open(url, '_blank');
  };

  const eliminaPrenotazione = async (id) => {
    if (window.confirm("Vuoi cancellare questa prenotazione?")) {
      await supabase.from('prenotazioni').delete().eq('id', id);
      scaricaPrenotazioni();
    }
  };

  return (
    <div style={{ background: "#F8FAFC", minHeight: "100vh", paddingBottom: "40px" }}>
      {/* Header compatto */}
      <div style={{ background: "white", padding: "15px 20px", display: "flex", alignItems: "center", gap: "15px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
        <button onClick={tornaIndietro} style={{ background: "#F1F5F9", border: "none", fontSize: "20px", borderRadius: "10px", padding: "5px 12px" }}>←</button>
        <h2 style={{ margin: 0, fontSize: "20px", color: "#1E293B" }}>{casa.nome}</h2>
      </div>

      <div style={{ padding: "15px" }}>
        {/* Form Nuova Prenotazione */}
        <div style={{ background: "white", padding: "20px", borderRadius: "24px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", marginBottom: "20px" }}>
          <h3 style={{ marginTop: 0, fontSize: "16px", color: "#64748B" }}>➕ NUOVA PRENOTAZIONE</h3>
          <form onSubmit={aggiungiPrenotazione} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <input type="text" placeholder="Nome Ospite" required value={nomeCliente} onChange={e=>setNomeCliente(e.target.value)} style={{ padding: "14px", borderRadius: "12px", border: "1px solid #E2E8F0", fontSize: "16px" }} />
            <input type="tel" placeholder="Cellulare (es. 39333...)" value={telefono} onChange={e=>setTelefono(e.target.value)} style={{ padding: "14px", borderRadius: "12px", border: "1px solid #E2E8F0", fontSize: "16px" }} />
            <div style={{ display: "flex", gap: "10px" }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: "12px", color: "#94A3B8" }}>Arrivo</label>
                <input type="date" required value={dataArrivo} onChange={e=>setDataArrivo(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "1px solid #E2E8F0", fontSize: "14px" }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: "12px", color: "#94A3B8" }}>Partenza</label>
                <input type="date" required value={dataPartenza} onChange={e=>setDataPartenza(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "1px solid #E2E8F0", fontSize: "14px" }} />
              </div>
            </div>
            <input type="number" placeholder="Prezzo Totale €" required value={prezzo} onChange={e=>setPrezzo(e.target.value)} style={{ padding: "14px", borderRadius: "12px", border: "1px solid #E2E8F0", fontSize: "16px" }} />
            <button type="submit" style={{ background: "#0EA5E9", color: "white", border: "none", padding: "16px", borderRadius: "15px", fontWeight: "bold", fontSize: "16px", marginTop: "10px" }}>Salva Prenotazione</button>
          </form>
        </div>

        {/* Lista Prenotazioni */}
        <h3 style={{ fontSize: "16px", color: "#64748B", marginBottom: "15px" }}>📅 PROSSIMI ARRIVI</h3>
        {prenotazioni.length === 0 && <p style={{ textAlign: "center", color: "#94A3B8" }}>Nessuna prenotazione attiva.</p>}
        {prenotazioni.map(p => (
          <div key={p.id} style={{ background: "white", padding: "15px", borderRadius: "20px", marginBottom: "12px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)", borderLeft: "5px solid #10B981" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <div>
                <div style={{ fontWeight: "bold", fontSize: "17px" }}>{p.nome_cliente}</div>
                <div style={{ color: "#64748B", fontSize: "13px" }}>{p.data_arrivo} ➔ {p.data_partenza}</div>
              </div>
              <div style={{ fontWeight: "bold", color: "#10B981", fontSize: "18px" }}>€{p.prezzo}</div>
            </div>
            
            <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
              <button onClick={() => inviaWhatsApp(p)} style={{ flex: 1, background: "#25D366", color: "white", border: "none", padding: "10px", borderRadius: "10px", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                💬 WhatsApp
              </button>
              <button onClick={() => eliminaPrenotazione(p.id)} style={{ background: "#FEE2E2", border: "none", padding: "10px 15px", borderRadius: "10px", color: "#EF4444" }}>
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}