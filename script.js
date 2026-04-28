const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbx3f-l4PUpb7pwB1CtCsWLE8SQFM5aTwFzomLX6PHkeUNZFW0LHJRDBxiVYRwa4LCyC7w/exec";

const PREFIX_CODIGO = "PDnB_";

let selectedSession = {
  tipoSesion: "Individual",
  precioBase: 25,
  personas: "1"
};

let selectedExtra = {
  extras: "Ninguno",
  extraPrecio: 0
};

/* INTRO VIDEO */
const introVideo = document.getElementById("introVideo");
const videoIntro = document.getElementById("videoIntro");
const skipIntroBtn = document.getElementById("skipIntroBtn");
const mainApp = document.getElementById("mainApp");

function entrarApp() {
  mainApp.classList.remove("hidden");
  introVideo.classList.add("fade-out");

  setTimeout(() => {
    introVideo.classList.add("hidden");
    videoIntro.pause();
  }, 650);
}

skipIntroBtn.addEventListener("click", entrarApp);

/* APP RESERVAS */
const startBtn = document.getElementById("startBtn");
const formSection = document.getElementById("formSection");
const enviarBtn = document.getElementById("enviarBtn");
const mensaje = document.getElementById("mensaje");
const confirmacion = document.getElementById("confirmacion");
const totalVista = document.getElementById("totalVista");
const codigoInput = document.getElementById("codigo");

startBtn.addEventListener("click", () => {
  formSection.classList.remove("hidden");
  startBtn.style.display = "none";
  formSection.scrollIntoView({ behavior: "smooth" });
});

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

codigoInput.addEventListener("input", () => {
  const valor = codigoInput.value.trim();

  if (valor === "") {
    mensaje.textContent = "";
    return;
  }

  if (!PREFIX_CODIGO.startsWith(valor) && !valor.startsWith(PREFIX_CODIGO)) {
    mensaje.style.color = "#ff4a4a";
    mensaje.textContent = "Código incorrecto o inexistente. Si no tienes código, deja el campo vacío.";
  } else {
    mensaje.textContent = "";
  }
});

function actualizarTotal() {
  const total = selectedSession.precioBase + selectedExtra.extraPrecio;
  totalVista.textContent = "$" + total;
}

enviarBtn.addEventListener("click", async () => {
  const fecha = document.getElementById("fecha").value;
  const hora = document.getElementById("hora").value;
  const nombre = document.getElementById("nombre").value.trim();
  const celular = document.getElementById("celular").value.trim();
  const instagram = document.getElementById("instagram").value.trim();
  const codigo = document.getElementById("codigo").value.trim();
  const observaciones = document.getElementById("observaciones").value.trim();

  mensaje.textContent = "";
  confirmacion.classList.add("hidden");
  confirmacion.innerHTML = "";

  if (!nombre || !celular || !fecha || !hora) {
    mensaje.style.color = "#ff4a4a";
    mensaje.textContent = "Completa todos los campos obligatorios.";
    return;
  }

  if (celular.replace(/\D/g, "").length < 9) {
    mensaje.style.color = "#ff4a4a";
    mensaje.textContent = "Celular inválido.";
    return;
  }

  if (codigo !== "" && !codigo.startsWith(PREFIX_CODIGO)) {
    mensaje.style.color = "#ff4a4a";
    mensaje.textContent = "Código promocional incorrecto o inexistente. Si no tienes un código válido, deja este campo vacío y vuelve a enviar tu reserva.";
    return;
  }

  const total = selectedSession.precioBase + selectedExtra.extraPrecio;
  const duracion = selectedExtra.extras === "+10 minutos" ? 40 : 30;
  const waCliente = "593" + celular.replace(/\D/g, "").replace(/^0/, "");

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
    waFull: waCliente
  };

  try {
    enviarBtn.disabled = true;
    enviarBtn.textContent = "Enviando reserva...";

    const response = await fetch(WEB_APP_URL, {
      method: "POST",
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!result.success) {
      mensaje.style.color = "#ff4a4a";
      mensaje.textContent = result.message;
      enviarBtn.disabled = false;
      enviarBtn.textContent = "Enviar reserva";
      return;
    }

    const textoWhatsApp = encodeURIComponent(
      `Reserva PHOTO LAB\n\n` +
      `Código: ${result.codigo}\n` +
      `Nombre: ${nombre}\n` +
      `Sesión: ${selectedSession.tipoSesion}\n` +
      `Fecha: ${fecha}\n` +
      `Horario: ${result.bloqueHorario}\n` +
      `Extras: ${selectedExtra.extras}\n` +
      `Total: $${total}\n\n` +
      `Debo llegar mínimo 10 minutos antes.`
    );

    const whatsappUrl = `https://wa.me/${waCliente}?text=${textoWhatsApp}`;

    confirmacion.classList.remove("hidden");
    confirmacion.innerHTML = `
      <h3>Reserva enviada ✅</h3>
      <p>Tu solicitud fue registrada correctamente.</p>

      <strong>Código</strong>
      <span>${result.codigo}</span>

      <strong>Horario</strong>
      <span>${result.bloqueHorario}</span>

      <strong>Total</strong>
      <span>$${total}</span>

      <p class="confirm-note">Debes llegar mínimo 10 minutos antes.</p>

      <a class="whatsapp-btn" href="${whatsappUrl}" target="_blank">
        Enviar resumen por WhatsApp
      </a>
    `;

  } catch (error) {
    mensaje.style.color = "#ff4a4a";
    mensaje.textContent = "Error de conexión. Intenta nuevamente.";
  }

  enviarBtn.disabled = false;
  enviarBtn.textContent = "Enviar reserva";
});
