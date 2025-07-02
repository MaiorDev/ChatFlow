const showToast = (message, type = "error") => {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 100);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
};

// Seleccionar el formulario y el input de email
const form = document.querySelector(".login-form");
const emailInput = document.getElementById("email");

// Agregar un evento de escucha para el envío del formulario
form.addEventListener("submit", (event) => {
  event.preventDefault(); // Prevenir el comportamiento por defecto del formulario

  // Obtener el valor del email
  const email = emailInput.value;

  // Realizar la solicitud fetch
  fetch("/forgot-password/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: email }),
  })
    .then((response) => {
      if (response.ok) {
        console.log("Solicitud enviada con éxito");

        window.location.href = "/checkEmail";
      } else {
        throw new Error(response.message);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      showToast("User not found", "error");
    });
});
