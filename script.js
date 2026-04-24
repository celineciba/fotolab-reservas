const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbx3f-l4PUpb7pwB1CtCsWLE8SQFM5aTwFzomLX6PHkeUNZFW0LHJRDBxiVYRwa4LCyC7w/exec";

let selectedSession = {
  tipoSesion: "Individual",
  precioBase: 25,
  personas: "1"
};

let selectedExtra = {
  extras: "Ninguno",
  extraPrecio: 0
};

const startBtn = document.getElementById("startBtn");
const formSection = document.getElementById("formSection");
const enviarBtn = document.getElementById("enviarBtn");
const mensaje = document.getElementById("mensaje");
const totalVista = document.getElementById("totalVista");

startBtn.addEventListener("click", () => {
  formSection.classList.remove("hidden");
  startBtn.style.display = "none";
  formSection.scrollIntoView({ behavior: "smooth" });
});

/* SELECCIÓN SESIÓN */
document.querySelectorAll(".session-card").forEach(card => {
  card.addEventListener("click", () => {
    document.querySelectorAll(".session-card").forEach(c => c.classList.remove("active"));
    card.classList.add("active");

    selectedSession = {
      tipoSesion: card.dataset.value,
      precioBase: Number(card.dataset.price),
      personas: card.dataset.personas
    };

    actualizarTotal();
  });
});

/* SELECCIÓN EXTRAS */
document.querySelectorAll(".extra-card").forEach(card => {
  card.addEventListener("click", () => {
    document.querySelectorAll(".extra-card").forEach(c => c.classList.remove("active"));
    card.classList.add("active");

    selectedExtra = {
      extras: card.dataset.value,
      extraPrecio: Number(card.dataset.price)
    };

    actualizarTotal();
  });
});

/* TOTAL */
function actualizarTotal() {
  const total = selectedSession.precioBase + selectedExtra.extraPrecio;
  totalVista.textContent = "$" + total;
}

/* ENVÍO */
enviarBtn.addEventListener("click", async () => {

  const fecha = document.getElementById("fecha").value;
  const hora = document.getElementById("hora").value;
  const nombre = document.getElementById("nombre").value.trim();
  const celular = document.getElementById("celular").value.trim();
  const instagram = document.getElementById("instagram").value.trim();
  const codigo = document.getElementById("codigo").value.trim();
  const observaciones = document.getElementById("observaciones").value.trim();

  if (!nombre || !celular || !fecha || !hora) {
    mensaje.style.color = "#ff1f12";
    mensaje.textContent = "Completa todos los campos obligatorios.";
    return;
  }

  if (celular.replace(/\D/g, "").length < 9) {
    mensaje.style.color = "#ff1f12";
    mensaje.textContent = "Celular inválido.";
    return;
  }

  const total = selectedSession.precioBase + selectedExtra.extraPrecio;
  const duracion = selectedExtra.extras === "+10 minutos" ? 40 : 30;

  const data = {
    nombreCompleto: nombre,
    celular: celular,
    instagram: instagram,
    tipoSesion: selectedSession.tipoSesion,
    personas: selectedSession.personas,
    duracionMinutos: duracion,
    precioBase: selectedSession.precioBase,
    fechaReserva: fecha,
    horaReserva: hora,
    extras: selectedExtra.extras,
    total: total,
    codigoPromocional: codigo,
    observaciones: observaciones,
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
        Total: <strong>$${total}</strong><br><br>
        ⚠️ Llega 10 minutos antes o pierdes tu reserva
      `;
    } else {
      mensaje.style.color = "#ff1f12";
      mensaje.textContent = result.message;
    }

  } catch (error) {
    mensaje.style.color = "#ff1f12";
    mensaje.textContent = "Error de conexión. Intenta nuevamente.";
  }

  enviarBtn.disabled = false;
  enviarBtn.textContent = "Enviar reserva";
});
