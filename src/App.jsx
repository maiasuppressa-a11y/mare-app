import { useState, useEffect } from "react";
import { supabase } from "./supabase.js";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Controlla se l'utente è già loggato
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Ascolta se l'utente entra o esce
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      {!session ? <Login /> : <Dashboard />}
    </>
  );
}