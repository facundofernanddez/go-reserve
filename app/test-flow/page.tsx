"use client"; 

import { useState } from "react";

// --- TIPOS DE DATOS ---
interface Complex {
  id: string;
  name: string;
  address: string;
}

// Actualizamos Court para incluir disponibilidad
interface Court {
  id: string;
  name: string;
  sport: string;
  price: number;
  isAvailable?: boolean; // Opcional porque puede no venir al principio
  description?: string;
}

interface Reservation {
  id: string;
  status: string;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  location: string;
  address: string;
}

export default function TestFlowPage() {
  // --- ESTADOS GLOBALES ---
  const [view, setView] = useState<'CLIENT' | 'ADMIN'>('CLIENT'); 

  // --- ESTADOS DEL CLIENTE ---
  const [step, setStep] = useState(1);
  const [location, setLocation] = useState("");
  const [complexes, setComplexes] = useState<Complex[]>([]);
  const [selectedComplex, setSelectedComplex] = useState<Complex | null>(null);
  const [courts, setCourts] = useState<Court[]>([]);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [bookingData, setBookingData] = useState({ name: "", phone: "", date: "", time: "" });
  const [reservationResult, setReservationResult] = useState<Reservation | null>(null);

  // --- ESTADOS DEL ADMIN ---
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [adminData, setAdminData] = useState({ name: "", email: "", password: "", location: "", address: "" });
  const [loggedUser, setLoggedUser] = useState<AdminUser | null>(null);

  // ==========================================
  // FUNCIONES DE CLIENTE
  // ==========================================
  const searchComplexes = async () => {
    const res = await fetch(`/api/complexes?location=${location}`);
    const data = await res.json();
    setComplexes(data);
    setStep(2);
  };

  const selectComplex = async (complex: Complex) => {
    setSelectedComplex(complex);
    // IMPORTANTE: Aquí pedimos availableOnly=true para que el cliente NO vea las rotas (o false si quieres que las vea bloqueadas)
    // Para este ejemplo, no filtramos en el fetch para poder MOSTRARLAS bloqueadas visualmente
    const res = await fetch(`/api/courts?complexId=${complex.id}`);
    const data = await res.json();
    setCourts(data);
    setStep(3);
  };

  const createReservation = async () => {
    if (!selectedComplex || !selectedCourt) return;
    const finalDate = new Date(`${bookingData.date}T${bookingData.time}:00`);
    
    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientName: bookingData.name,
        clientPhone: bookingData.phone,
        startTime: finalDate.toISOString(), 
        complexId: selectedComplex.id,
        courtId: selectedCourt.id
      }),
    });

    const data = await res.json();
    if (res.status === 201) {
      setReservationResult(data);
      setStep(5); 
    } else {
      alert("Error: " + (data.error || "Algo salió mal"));
    }
  };

  const simulatePayment = async () => {
    if (!reservationResult) return;
    const res = await fetch("/api/reservations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reservationId: reservationResult.id, newStatus: "CONFIRMED" }),
    });
    if (res.ok) {
        alert("✅ ¡PAGO EXITOSO!");
        setStep(1); setLocation(""); setComplexes([]);
    } else {
        alert("❌ Error al pagar");
    }
  };

  // ==========================================
  // FUNCIONES DE ADMIN
  // ==========================================
  const handleRegister = async () => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(adminData),
    });
    const data = await res.json();
    
    if (res.ok) {
      alert("✅ Registro Exitoso: " + data.name);
      setAuthMode('LOGIN'); 
    } else {
      alert("❌ Error: " + data.error);
    }
  };

  const handleLogin = async () => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: adminData.email, password: adminData.password }),
    });
    const data = await res.json();

    if (res.ok) {
      setLoggedUser(data.user);
      alert("🔓 Login Correcto. Hola " + data.user.name);
    } else {
      alert("❌ Error: " + data.error);
    }
  };

  const createCourt = async () => {
    if (!loggedUser) return;
    // Tomamos valores de los inputs por ID
    const nameInput = document.getElementById('newCourtName') as HTMLInputElement;
    const sportInput = document.getElementById('newCourtSport') as HTMLSelectElement;
    const priceInput = document.getElementById('newCourtPrice') as HTMLInputElement;

    const res = await fetch("/api/courts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            complexId: loggedUser.id,
            name: nameInput.value,
            sport: sportInput.value,
            price: priceInput.value,
            features: ["Iluminación", "Techada"] 
        }),
    });

    if(res.ok) {
        alert("✅ Cancha creada exitosamente");
        nameInput.value = ""; // Limpiar
        loadAdminCourts(); // Recargar lista
    } else {
        alert("❌ Error al crear cancha");
    }
  };

  const loadAdminCourts = async () => {
      if (!loggedUser) return;
      const res = await fetch(`/api/courts?complexId=${loggedUser.id}`);
      const data = await res.json();
      setCourts(data); // Usamos el mismo estado de courts
  };

  const toggleMaintenance = async (court: Court) => {
      const newState = court.isAvailable === false ? true : false;
      await fetch("/api/courts", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courtId: court.id, isAvailable: newState })
      });
      alert("Estado actualizado.");
      loadAdminCourts(); // Recargar para ver cambios
  };

  // --- ESTILOS ---
  const containerStyle: React.CSSProperties = { maxWidth: "700px", margin: "30px auto", fontFamily: "sans-serif", border: "1px solid #ccc", borderRadius: "10px", overflow: "hidden" };
  const navStyle: React.CSSProperties = { display: 'flex', borderBottom: '1px solid #ccc', background: '#f5f5f5' };
  const tabStyle = (isActive: boolean): React.CSSProperties => ({ flex: 1, padding: '15px', textAlign: 'center', cursor: 'pointer', background: isActive ? 'white' : 'transparent', fontWeight: isActive ? 'bold' : 'normal' });
  const contentStyle: React.CSSProperties = { padding: "20px" };
  const inputStyle: React.CSSProperties = { padding: "10px", width: "100%", marginBottom: "10px", border: "1px solid #ccc", boxSizing: "border-box" };
  const btnStyle: React.CSSProperties = { background: "black", color: "white", padding: "10px 20px", border: "none", cursor: "pointer", width: '100%', borderRadius: "5px" };
  const cardStyle: React.CSSProperties = { border: "1px solid #ddd", padding: "10px", marginBottom: "10px", cursor: "pointer", borderRadius: "5px" };

  return (
    <div style={containerStyle}>
      {/* BARRA SUPERIOR */}
      <div style={navStyle}>
        <div style={tabStyle(view === 'CLIENT')} onClick={() => setView('CLIENT')}>👤 MODO CLIENTE</div>
        <div style={tabStyle(view === 'ADMIN')} onClick={() => setView('ADMIN')}>🛡️ MODO ADMIN</div>
      </div>

      {/* VISTA DE ADMIN */}
      {view === 'ADMIN' && (
        <div style={contentStyle}>
          {!loggedUser ? (
            /* FORMULARIO DE LOGIN/REGISTRO */
            <>
              <div style={{marginBottom: '20px', textAlign: 'center'}}>
                <button style={{marginRight: '10px', cursor: 'pointer', fontWeight: authMode==='LOGIN'?'bold':'normal'}} onClick={()=>setAuthMode('LOGIN')}>Iniciar Sesión</button> | 
                <button style={{marginLeft: '10px', cursor: 'pointer', fontWeight: authMode==='REGISTER'?'bold':'normal'}} onClick={()=>setAuthMode('REGISTER')}>Registrarse</button>
              </div>

              <h3>{authMode === 'LOGIN' ? 'Entrar a mi Panel' : 'Registrar Nuevo Complejo'}</h3>
              
              {authMode === 'REGISTER' && (
                <>
                  <input style={inputStyle} placeholder="Nombre del Club" onChange={e => setAdminData({...adminData, name: e.target.value})} />
                  <input style={inputStyle} placeholder="Ciudad" onChange={e => setAdminData({...adminData, location: e.target.value})} />
                  <input style={inputStyle} placeholder="Dirección" onChange={e => setAdminData({...adminData, address: e.target.value})} />
                </>
              )}
              
              <input style={inputStyle} placeholder="Email" onChange={e => setAdminData({...adminData, email: e.target.value})} />
              <input style={inputStyle} type="password" placeholder="Contraseña" onChange={e => setAdminData({...adminData, password: e.target.value})} />
              
              <button style={btnStyle} onClick={authMode === 'LOGIN' ? handleLogin : handleRegister}>
                {authMode === 'LOGIN' ? 'INGRESAR' : 'CREAR CUENTA'}
              </button>
            </>
          ) : (
            /* DASHBOARD DEL ADMIN (PANEL DE CONTROL) */
            <div style={{padding: '10px', border: '2px solid green', borderRadius: '10px'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <h3 style={{color: 'green', margin:0}}>Panel de {loggedUser.name}</h3>
                    <button style={{...btnStyle, background: 'red', width:'auto', padding:'5px 10px'}} onClick={() => setLoggedUser(null)}>Salir</button>
                </div>
                <p>📍 {loggedUser.address}</p>
                <hr />

                {/* CREAR CANCHA */}
                <h4>➕ Agregar Nueva Cancha</h4>
                <div style={{display:'flex', gap:'5px', marginBottom:'10px'}}>
                    <input style={inputStyle} placeholder="Nombre" id="newCourtName" />
                    <select style={inputStyle} id="newCourtSport">
                        <option value="Padel">Padel</option>
                        <option value="Futbol">Futbol</option>
                    </select>
                    <input style={{...inputStyle, width:'100px'}} type="number" placeholder="$$" id="newCourtPrice" />
                </div>
                <button style={btnStyle} onClick={createCourt}>GUARDAR CANCHA</button>

                <hr style={{margin:'20px 0'}}/>

                {/* LISTA DE CANCHAS */}
                <h4>📋 Mis Canchas</h4>
                <button style={{...btnStyle, background:'#333'}} onClick={loadAdminCourts}>🔄 CARGAR MIS CANCHAS</button>

                <div style={{marginTop:'10px'}}>
                    {courts.map(c => (
                        <div key={c.id} style={{borderBottom:'1px solid #ccc', padding:'10px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                            <div>
                                <strong>{c.name}</strong> ({c.sport}) <br/> 
                                <span style={{color: c.isAvailable === false ? 'red' : 'green'}}>
                                    {c.isAvailable === false ? '🔴 Mantenimiento' : '🟢 Disponible'}
                                </span>
                            </div>
                            <button style={{cursor:'pointer', padding:'5px'}} onClick={() => toggleMaintenance(c)}>
                                🔧 {c.isAvailable === false ? 'Habilitar' : 'Deshabilitar'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
          )}
        </div>
      )}

      {/* VISTA DE CLIENTE */}
      {view === 'CLIENT' && (
        <div style={contentStyle}>
          <p style={{color: '#666'}}>Paso {step} de 5</p>

          {step === 1 && (
            <div>
              <h3>📍 ¿Dónde quieres jugar?</h3>
              <input type="text" placeholder="Ej: Corrientes" value={location} onChange={(e) => setLocation(e.target.value)} style={inputStyle} />
              <button style={btnStyle} onClick={searchComplexes}>Buscar Complejos</button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3>🏢 Selecciona un Complejo</h3>
              {complexes.length === 0 && <p>No se encontraron complejos en &quot;{location}&quot;</p>}
              {complexes.map((c) => (
                <div key={c.id} style={cardStyle} onClick={() => selectComplex(c)}>
                  <strong>{c.name}</strong><br/><small>{c.address}</small>
                </div>
              ))}
              <button style={{...btnStyle, background: '#ccc', color: 'black'}} onClick={() => setStep(1)}>Volver</button>
            </div>
          )}

          {step === 3 && selectedComplex && (
            <div>
              <h3>⚽ Selecciona Cancha en &quot;{selectedComplex.name}&quot;</h3>
              {courts.length === 0 && <p>Este complejo no tiene canchas.</p>}
              
              {courts.map((c) => {
                // LOGICA VISUAL DE MANTENIMIENTO
                const isMaintenance = c.isAvailable === false; 
                return (
                    <div 
                        key={c.id} 
                        style={{
                            ...cardStyle, 
                            // Cambia de color si está en mantenimiento
                            background: isMaintenance ? '#f9f9f9' : 'white',
                            borderColor: isMaintenance ? 'red' : '#ddd',
                            opacity: isMaintenance ? 0.6 : 1,
                            cursor: isMaintenance ? 'not-allowed' : 'pointer'
                        }} 
                        onClick={() => {
                            if (isMaintenance) {
                                alert("⛔ Esta cancha está cerrada por mantenimiento.");
                                return;
                            }
                            setSelectedCourt(c); 
                            setStep(4); 
                        }}
                    >
                        <strong>{c.name}</strong> - {c.sport}<br/>
                        <small>${c.price}</small>
                        {isMaintenance && <div style={{color:'red', fontWeight:'bold'}}>🚧 EN MANTENIMIENTO</div>}
                    </div>
                );
              })}
              
              <button style={{...btnStyle, background: '#ccc', color: 'black'}} onClick={() => setStep(2)}>Volver</button>
            </div>
          )}

          {step === 4 && selectedCourt && (
            <div>
              <h3>📅 Reserva</h3>
              <p>Cancha: <strong>{selectedCourt.name}</strong></p>
              <input style={inputStyle} placeholder="Tu Nombre" onChange={e => setBookingData({...bookingData, name: e.target.value})} />
              <input style={inputStyle} placeholder="Tu Teléfono" onChange={e => setBookingData({...bookingData, phone: e.target.value})} />
              <input style={inputStyle} type="date" onChange={e => setBookingData({...bookingData, date: e.target.value})} />
              <input style={inputStyle} type="time" onChange={e => setBookingData({...bookingData, time: e.target.value})} />
              <button style={btnStyle} onClick={createReservation}>CONFIRMAR</button>
              <button style={{...btnStyle, background: '#ccc', color: 'black', marginTop: '10px'}} onClick={() => setStep(3)}>Cancelar</button>
            </div>
          )}

          {step === 5 && reservationResult && selectedCourt && (
            <div style={{textAlign: 'center'}}>
              <h2 style={{color: 'green'}}>¡Reserva Creada!</h2>
              <p>Código: <strong>{reservationResult.id}</strong></p>
              <button style={{...btnStyle, background: 'green'}} onClick={simulatePayment}>💸 PAGAR AHORA</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}