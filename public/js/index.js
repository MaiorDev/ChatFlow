document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");

  // Animate chat messages
  const messages = document.querySelectorAll(".message");
  messages.forEach((message, index) => {
    setTimeout(() => {
      message.style.opacity = "0";
      message.style.transform = "translateY(20px)";
      message.style.transition = "all 0.5s ease";

      setTimeout(() => {
        message.style.opacity = "1";
        message.style.transform = "translateY(0)";
      }, 100);
    }, index * 200);
  });

  // Animate typing indicator
  const typingIndicator = document.querySelector(".typing-indicator");
  if (typingIndicator) {
    setInterval(() => {
      typingIndicator.style.opacity =
        typingIndicator.style.opacity === "0" ? "1" : "0";
    }, 3000);
  }

  // Add floating particles animation
  function createFloatingParticle() {
    const particle = document.createElement("div");
    particle.style.position = "fixed";
    particle.style.width = "4px";
    particle.style.height = "4px";
    particle.style.background = "rgba(255, 255, 255, 0.3)";
    particle.style.borderRadius = "50%";
    particle.style.pointerEvents = "none";
    particle.style.zIndex = "0";
    particle.style.left = Math.random() * 100 + "%";
    particle.style.top = "100vh";
    particle.style.animation = "float-particle 8s linear forwards";

    document.body.appendChild(particle);

    setTimeout(() => {
      particle.remove();
    }, 8000);
  }

  // Create particles periodically
  setInterval(createFloatingParticle, 2000);

  // Add input focus effects
  const inputs = document.querySelectorAll(
    "input[type='text'], input[type='password']"
  );
  inputs.forEach((input) => {
    input.addEventListener("focus", () => {
      const icon = input.parentElement.querySelector(".input-icon");
      if (icon) {
        icon.style.color = "var(--primary)";
        icon.style.transform = "translateY(-50%) scale(1.1)";
      }
    });

    input.addEventListener("blur", () => {
      const icon = input.parentElement.querySelector(".input-icon");
      if (icon) {
        icon.style.color = "var(--gray-400)";
        icon.style.transform = "translateY(-50%) scale(1)";
      }
    });
  });

  const username = document.getElementById("username");
  username.addEventListener("keydown", (e) => {
    if (e.key === " ") {
      e.preventDefault();
      return false;
    }
  });
  // Handle form submission
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Add loading state to button
    const submitBtn = loginForm.querySelector(".login-btn");
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = "<span>Signing in...</span>";
    submitBtn.disabled = true;

    if (username && password) {
      fetch("/login/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Login failed");
          }
          return response.json();
        })
        .then((data) => {
          localStorage.setItem("token", data.token);

          // Success animation
          submitBtn.innerHTML = "<span>Success!</span>";
          submitBtn.style.background =
            "linear-gradient(135deg, var(--success), var(--success))";

          setTimeout(() => {
            window.location.href = "/home";
          }, 1000);
        })
        .catch((error) => {
          console.error("Error:", error);

          // Error animation
          submitBtn.innerHTML = "<span>Login Failed</span>";
          submitBtn.style.background =
            "linear-gradient(135deg, var(--error), var(--error))";

          // Show error message
          const errorMsg = document.createElement("div");
          errorMsg.textContent =
            "Invalid username or password. Please try again.";
          errorMsg.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--error);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 0.875rem;
            z-index: 1000;
            animation: slideIn 0.3s ease;
          `;

          document.body.appendChild(errorMsg);

          setTimeout(() => {
            errorMsg.remove();
            submitBtn.innerHTML = originalText;
            submitBtn.style.background =
              "linear-gradient(135deg, var(--primary), var(--secondary))";
            submitBtn.disabled = false;
          }, 3000);
        });
    } else {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  });

  // Add CSS animation for error message
  const style = document.createElement("style");
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
});
