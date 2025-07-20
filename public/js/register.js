document.addEventListener("DOMContentLoaded", () => {
  // Form validation
  const registerForm = document.getElementById("register-form");
  const fullnameInput = document.getElementById("fullname");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirm-password");
  const termsCheckbox = document.getElementById("terms");
  const registerBtn = document.querySelector(".register-btn");

  // Error message elements
  const fullnameError = document.getElementById("fullname-error");
  const emailError = document.getElementById("email-error");
  const passwordError = document.getElementById("password-error");
  const confirmPasswordError = document.getElementById(
    "confirm-password-error"
  );
  const termsError = document.getElementById("terms-error");

  // Password strength elements
  const strengthBar = document.querySelector(".strength-bar");
  const strengthText = document.querySelector(".strength-text");

  // Toggle password visibility
  const togglePasswordButtons = document.querySelectorAll(".toggle-password");
  togglePasswordButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const input = this.previousElementSibling;
      const type =
        input.getAttribute("type") === "password" ? "text" : "password";
      input.setAttribute("type", type);

      // Update icon
      if (type === "text") {
        this.innerHTML = `
          <path d="M17.94 17.94C17.45 18.34 16.9 18.68 16.31 18.95C15.72 19.22 15.1 19.42 14.46 19.54C13.82 19.66 13.17 19.7 12.51 19.66C11.85 19.62 11.2 19.5 10.57 19.3M9.9 4.24C10.59 4.08 11.29 4 12 4C19 4 23 12 23 12C22.393 13.055 21.68 14.037 20.88 14.93M14.12 14.12C13.8454 14.4148 13.5141 14.6512 13.1462 14.8151C12.7782 14.9791 12.3809 15.0673 11.9781 15.0744C11.5753 15.0815 11.1749 15.0074 10.8016 14.8565C10.4282 14.7056 10.0887 14.481 9.80385 14.1962C9.51897 13.9113 9.29439 13.5718 9.14351 13.1984C8.99262 12.8251 8.91853 12.4247 8.92563 12.0219C8.93274 11.6191 9.02091 11.2218 9.18488 10.8538C9.34884 10.4859 9.58525 10.1546 9.88 9.88M1 1L23 23M8.21 8.21C7.48 8.9 6.85 9.68 6.34 10.54C5.83 11.4 5.44 12.32 5.17 13.27C4.9 14.22 4.75 15.19 4.73 16.17C4.71 17.15 4.81 18.13 5.04 19.08" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        `;
      } else {
        this.innerHTML = `
          <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
        `;
      }
    });
  });

  // Add input focus effects
  const inputs = document.querySelectorAll(
    "input[type='text'], input[type='email'], input[type='password']"
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

  fullnameInput.addEventListener("keydown", (e) => {
    if (e.key === " ") {
      e.preventDefault();
      return false;
    }
  });
  // Input validation functions
  const validateFullname = () => {
    if (fullnameInput.value.trim() === "") {
      fullnameError.textContent = "Full name is required";
      return false;
    } else if (fullnameInput.value.trim().length < 3) {
      fullnameError.textContent = "Full name must be at least 3 characters";
      return false;
    } else {
      fullnameError.textContent = "";
      return true;
    }
  };

  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailInput.value.trim() === "") {
      emailError.textContent = "Email is required";
      return false;
    } else if (!emailRegex.test(emailInput.value.trim())) {
      emailError.textContent = "Please enter a valid email address";
      return false;
    } else {
      emailError.textContent = "";
      return true;
    }
  };

  const validatePassword = () => {
    if (passwordInput.value === "") {
      passwordError.textContent = "Password is required";
      return false;
    } else if (passwordInput.value.length < 8) {
      passwordError.textContent = "Password must be at least 8 characters";
      return false;
    } else {
      passwordError.textContent = "";
      return true;
    }
  };

  const validateConfirmPassword = () => {
    if (confirmPasswordInput.value === "") {
      confirmPasswordError.textContent = "Please confirm your password";
      return false;
    } else if (confirmPasswordInput.value !== passwordInput.value) {
      confirmPasswordError.textContent = "Passwords do not match";
      return false;
    } else {
      confirmPasswordError.textContent = "";
      return true;
    }
  };

  const validateTerms = () => {
    if (!termsCheckbox.checked) {
      termsError.textContent = "You must agree to the terms";
      return false;
    } else {
      termsError.textContent = "";
      return true;
    }
  };

  // Add input event listeners for real-time validation
  fullnameInput.addEventListener("input", validateFullname);
  emailInput.addEventListener("input", validateEmail);
  passwordInput.addEventListener("input", () => {
    validatePassword();
    updatePasswordStrength();
  });
  confirmPasswordInput.addEventListener("input", validateConfirmPassword);
  termsCheckbox.addEventListener("change", validateTerms);

  // Password strength indicator
  function calculatePasswordStrength(password) {
    let strength = 0;

    // Length check
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;

    // Character variety checks
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    return Math.min(strength, 4);
  }

  function updatePasswordStrength() {
    const password = passwordInput.value;
    const strength = calculatePasswordStrength(password);

    // Remove all strength classes
    strengthBar.classList.remove(
      "strength-weak",
      "strength-fair",
      "strength-good",
      "strength-strong"
    );

    if (password.length === 0) {
      strengthText.textContent = "Password strength";
      return;
    }

    switch (strength) {
      case 0:
      case 1:
        strengthBar.classList.add("strength-weak");
        strengthText.textContent = "Weak password";
        break;
      case 2:
        strengthBar.classList.add("strength-fair");
        strengthText.textContent = "Fair password";
        break;
      case 3:
        strengthBar.classList.add("strength-good");
        strengthText.textContent = "Good password";
        break;
      case 4:
        strengthBar.classList.add("strength-strong");
        strengthText.textContent = "Strong password";
        break;
    }
  }

  // Animate demo messages
  const demoMessages = document.querySelectorAll(".demo-message");
  demoMessages.forEach((message, index) => {
    setTimeout(() => {
      message.style.opacity = "0";
      message.style.transform = "translateY(20px)";
      message.style.transition = "all 0.5s ease";

      setTimeout(() => {
        message.style.opacity = "1";
        message.style.transform = "translateY(0)";
      }, 100);
    }, index * 300);
  });

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

  // Handle form submission
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // Validate all fields
    const isValidFullname = validateFullname();
    const isValidEmail = validateEmail();
    const isValidPassword = validatePassword();
    const isValidConfirmPassword = validateConfirmPassword();
    const isValidTerms = validateTerms();

    if (
      isValidFullname &&
      isValidEmail &&
      isValidPassword &&
      isValidConfirmPassword &&
      isValidTerms
    ) {
      // Add loading state to button
      const originalText = registerBtn.innerHTML;
      registerBtn.innerHTML = "<span>Creating account...</span>";
      registerBtn.disabled = true;

      const formData = {
        fullname: fullnameInput.value.trim(),
        email: emailInput.value.trim(),
        password: passwordInput.value,
      };

      // Simulate API call
      fetch("/register/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Registration failed");
          }
          return (window.location.href = "/home");
        })
        .catch((error) => {
          console.error("Error:", error);

          // Error animation
          registerBtn.innerHTML = "<span>Registration Failed</span>";
          registerBtn.style.background =
            "linear-gradient(135deg, var(--error), var(--error))";

          // Show error message
          const errorMsg = document.createElement("div");
          errorMsg.textContent = "Registration";
        });
      // .then((data) => {
      //   // Success animation
      //   registerBtn.innerHTML = "<span>Account created! 🎉</span>";
      //   registerBtn.style.background =
      //     "linear-gradient(135deg, var(--success), var(--success))";

      //   // Show success message
      //   const successMsg = document.createElement("div");
      //   successMsg.textContent =
      //     "Account created successfully! Please check your email to verify your account.";
      //   successMsg.style.cssText = `
      //     position: fixed;
      //     top: 20px;
      //     right: 20px;
      //     background: var(--success);
      //     color: white;
      //     padding: 16px 24px;
      //     border-radius: 12px;
      //     font-size: 0.875rem;
      //     z-index: 1000;
      //     animation: slideIn 0.3s ease;
      //     max-width: 300px;
      //   `;

      //   document.body.appendChild(successMsg);

      //   setTimeout(() => {
      //     window.location.href = "/check-email";
      //   }, 2000);
      // })
    }
  });
});
