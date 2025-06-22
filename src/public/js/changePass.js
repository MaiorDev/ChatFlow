document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("changePasswordForm");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");

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

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      showToast("Las contraseñas no coinciden");
      return;
    }

    // Validar longitud mínima
    if (password.length < 8) {
      showToast("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    try {
      const token = document.getElementById("token").value;
      const response = await fetch("/reset-password/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          newPassword: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast("Contraseña actualizada correctamente", "success");
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      } else {
        showToast(data.message || "Error al cambiar la contraseña");
      }
    } catch (error) {
      showToast("Error al procesar la solicitud");
    }
  });
});
