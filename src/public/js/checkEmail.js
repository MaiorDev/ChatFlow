document.addEventListener("DOMContentLoaded", () => {
  // Get the email from URL parameters or localStorage
  const urlParams = new URLSearchParams(window.location.search);
  const email =
    urlParams.get("email") ||
    localStorage.getItem("userEmail") ||
    "your email address";

  // Display the email in the page
  const userEmailElement = document.querySelector(".user-email");
  if (userEmailElement) {
    userEmailElement.textContent = email;

    // Add copy to clipboard functionality
    userEmailElement.addEventListener("click", () => {
      navigator.clipboard
        .writeText(email)
        .then(() => {
          showToast("Email copied to clipboard!");
        })
        .catch((err) => {
          console.error("Could not copy text: ", err);
        });

      // Add visual feedback
      const originalColor = userEmailElement.style.color;
      userEmailElement.style.color = "var(--success)";
      setTimeout(() => {
        userEmailElement.style.color = originalColor;
      }, 1000);
    });

    // Add tooltip to indicate it's clickable
    userEmailElement.title = "Click to copy";
    userEmailElement.style.cursor = "pointer";
    userEmailElement.style.borderBottom = "1px dashed var(--primary)";
  }

  // Timer functionality
  const timerElement = document.getElementById("timer");
  const timerBar = document.getElementById("timer-bar");
  const resendBtn = document.getElementById("resend-btn");

  let timeLeft = 60; // 60 seconds countdown
  let countdown;

  // Function to start/restart the countdown
  function startCountdown() {
    // Clear any existing interval
    if (countdown) {
      clearInterval(countdown);
    }

    timeLeft = 60;

    if (timerElement) {
      timerElement.textContent = timeLeft;
    }

    if (timerBar) {
      timerBar.style.width = "100%";
      // Add transition animation
      timerBar.style.transition = "width 1s linear";
    }

    if (resendBtn) {
      resendBtn.disabled = true;
    }

    // Start the countdown
    countdown = setInterval(() => {
      timeLeft--;

      if (timerElement) {
        timerElement.textContent = timeLeft;
      }

      if (timerBar) {
        // Update the progress bar width
        const percentage = (timeLeft / 60) * 100;
        timerBar.style.width = `${percentage}%`;

        // Change color as time decreases
        if (timeLeft <= 10) {
          timerBar.style.background =
            "linear-gradient(to right, #ff9f43, #ff6b6b)";
        }
      }

      if (timeLeft <= 0) {
        clearInterval(countdown);

        if (timerElement) {
          timerElement.textContent = "0";
        }

        if (resendBtn) {
          resendBtn.disabled = false;
          // Add attention animation
          resendBtn.classList.add("pulse-animation");
        }

        // Reset timer bar color
        if (timerBar) {
          timerBar.style.background =
            "linear-gradient(to right, var(--primary), var(--accent))";
        }
      }
    }, 1000);
  }

  // Start the initial countdown
  startCountdown();

  // Add mobile menu functionality
  const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
  const navLinks = document.querySelector(".nav-links");

  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener("click", () => {
      navLinks.classList.toggle("active");

      // Add styles for mobile menu if not already in CSS
      if (navLinks.classList.contains("active")) {
        navLinks.style.display = "flex";
        navLinks.style.flexDirection = "column";
        navLinks.style.position = "absolute";
        navLinks.style.top = "100%";
        navLinks.style.left = "0";
        navLinks.style.right = "0";
        navLinks.style.backgroundColor = "white";
        navLinks.style.padding = "20px";
        navLinks.style.boxShadow = "0 10px 20px rgba(0, 0, 0, 0.1)";
        navLinks.style.zIndex = "100";
      } else {
        navLinks.style.display = "";
      }
    });
  }

  // Add floating drinks animation enhancement
  const emailDrinks = document.querySelectorAll(".floating-drink");

  emailDrinks.forEach((drink) => {
    // Add random rotation to each drink
    const randomRotation = Math.floor(Math.random() * 10) - 5;
    drink.style.transform = `rotate(${randomRotation}deg)`;

    // Add random animation delay
    const randomDelay = Math.random() * 2;
    drink.style.animationDelay = `${randomDelay}s`;
  });

  // Toast notification function
  // Función showToast actualizada para usar el estilo consistente
  function showToast(message, duration = 3000) {
    let toast = document.querySelector(".toast-notification");
  
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast-notification";
      document.body.appendChild(toast);
    }
  
    // Set message con icono
    toast.innerHTML = `<i class="fas fa-info-circle" style="margin-right: 8px;"></i> ${message}`;
  
    // Show toast con animación suave
    toast.style.transform = "translateY(100px)";
    toast.style.opacity = "0";
    
    setTimeout(() => {
      toast.style.transform = "translateY(0)";
      toast.style.opacity = "1";
    }, 10);
  
    // Hide toast después de la duración
    setTimeout(() => {
      toast.style.transform = "translateY(100px)";
      toast.style.opacity = "0";
    }, duration);
  }

  // Add check inbox button
  const verificationInstructions = document.querySelector(
    ".verification-instructions"
  );

  if (verificationInstructions) {
    const checkInboxBtn = document.createElement("button");
    checkInboxBtn.className = "resend-btn";
    checkInboxBtn.innerHTML = '<i class="fas fa-external-link-alt"></i> Open Email Provider';
    checkInboxBtn.style.marginTop = "15px";
    checkInboxBtn.style.background = "linear-gradient(135deg, var(--secondary), var(--accent))";

    // Add styles
    checkInboxBtn.style.backgroundColor = "var(--secondary)";
    checkInboxBtn.style.color = "white";
    checkInboxBtn.style.border = "none";
    checkInboxBtn.style.padding = "10px 20px";
    checkInboxBtn.style.borderRadius = "8px";
    checkInboxBtn.style.fontFamily = "'Poppins', sans-serif";
    checkInboxBtn.style.fontSize = "0.9rem";
    checkInboxBtn.style.fontWeight = "500";
    checkInboxBtn.style.cursor = "pointer";
    checkInboxBtn.style.transition = "all 0.3s";
    checkInboxBtn.style.marginTop = "15px";

    // Add hover effect
    checkInboxBtn.addEventListener("mouseover", () => {
      checkInboxBtn.style.backgroundColor = "#3dbbb4";
      checkInboxBtn.style.transform = "translateY(-2px)";
    });

    checkInboxBtn.addEventListener("mouseout", () => {
      checkInboxBtn.style.backgroundColor = "var(--secondary)";
      checkInboxBtn.style.transform = "translateY(0)";
    });

    // Add click functionality
    checkInboxBtn.addEventListener("click", () => {
      // Determine email provider and open in new tab
      let emailProvider = "";

      if (email.includes("@gmail")) {
        emailProvider = "https://mail.google.com";
      } else if (email.includes("@yahoo")) {
        emailProvider = "https://mail.yahoo.com";
      } else if (email.includes("@outlook") || email.includes("@hotmail")) {
        emailProvider = "https://outlook.live.com";
      } else {
        emailProvider = "https://mail.google.com"; // Default to Gmail
      }

      window.open(emailProvider, "_blank");
    });

    verificationInstructions.after(checkInboxBtn);
  }

  console.log("Email verification page initialized");
});
