const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbx3f-l4PUpb7pwB1CtCsWLE8SQFM5aTwFzomLX6PHkeUNZFW0LHJRDBxiVYRwa4LCyC7w/exec";

const startBtn = document.getElementById("startBtn");
const formSection = document.getElementById("formSection");
const enviarBtn = document.getElementById("enviarBtn");
const mensaje = document.getElementById("mensaje");

startBtn.addEventListener("click", () => {
  formSection.classList.remove("hidden");
  startBtn.style.display = "none";
});

const horariosPermitidos = [
  "09:00","09:30","10:00","10:30","11:00","11:30",
  "12:00","12:30","13:00","13:30","14:00","14:30",
  "15:00","15:30","16:00","16:30","17:00","17:30",
  "18:00","18:30","19:00","19:30","20:00"
];

function validarHora(hora) {
  return horariosPermitidos.includes(hora);
}

function calcularPrecio(tipoSesion, extras) {
  let precioBase = 0;
  let personas = 1;
  let duracion = 30;
  let extraPrecio = 0;

  if (tipoSesion === "Individual") {
    precioBase = 25;
    personas = 1;
  }

  if (tipoSesion === "Pareja") {
    precioBase = 35;
    personas = 2;
  }

  if (tipoSesion === "Grupo") {
    precioBase = 45;
    personas = "3 a 6";
  }

  if (extras === "+10 minutos") {
    extraPrecio = 10;
    duracion += 10;
  }

  if (extras === "Edición básica") extraPrecio = 5;
  if (extras === "Edición premium") extraPrecio = 15;
  if (extras === "Videoclip") extraPrecio = 10;

  return {
    precioBase,
    personas,
    duracion,
    total: precioBase + extraPrecio
  };
}

enviarBtn.addEventListener("click", async () => {
  const tipoSesion = document.getElementById("tipoSesion").value;
  const fecha = document.getElementById("fecha").value;
  const hora = document.getElementById("hora").value;
  const nombre = document.getElementById("nombre").value.trim();
  const celular = document.getElementById("celular").value.trim();
  const instagram = document.getElementById("instagram").value.trim();
  const extras = document.getElementById("extras").value;
  const codigo = document.getElementById("codigo").value.trim();

  if (!nombre || !celular || !fecha || !hora) {
    mensaje.textContent = "Completa todos los campos obligatorios.";
    mensaje.style.color = "red";
    return;
  }

  if (celular.replace(/\D/g, "").length < 9) {
    mensaje.textContent = "Celular inválido.";
    mensaje.style.color = "red";
    return;
  }

  if (!validarHora(hora)) {
    mensaje.textContent = "Selecciona un horario válido (cada 30 minutos).";
    mensaje.style.color = "red";
    return;
  }

  const precios = calcularPrecio(tipoSesion, extras);

  const data = {
    nombreCompleto: nombre,
    celular: celular,
    instagram: instagram,
    tipoSesion: tipoSesion,
    personas: precios.personas,
    duracionMinutos: precios.duracion,
    precioBase: precios.precioBase,
    fechaReserva: fecha,
    horaReserva: hora,
    extras: extras,
    total: precios.total,
    codigoPromocional: codigo,
    observaciones: "",
    origen: "WEB",
    waFull: "593" + celular.replace(/\D/g, "").replace(/^0/, "")
  };

  try {
    enviarBtn.disabled = true;
    enviarBtn.textContent = "Enviando...";
    mensaje.textContent = "";

    const response = await fetch(WEB_APP_URL, {
      method: "POST",
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (result.success) {
      mensaje.style.color = "green";
      mensaje.innerHTML = `
        Reserva confirmada ✅<br><br>
        Código: <strong>${result.codigo}</strong><br>
        Horario: <strong>${result.bloqueHorario}</strong><br>
        Total: <strong>$${precios.total}</strong><br><br>
        ⚠️ Llega 10 minutos antes o pierdes tu reserva
      `;
    } else {
      mensaje.style.color = "red";
      mensaje.textContent = result.message;
    }

  } catch (error) {
    mensaje.style.color = "red";
    mensaje.textContent = "Error de conexión.";
  }

  enviarBtn.disabled = false;
  enviarBtn.textContent = "Enviar reserva";
});
