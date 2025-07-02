import { io } from "https://cdn.socket.io/4.3.2/socket.io.esm.min.js";
const socket = io();
document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const settingsBtn = document.getElementById("settings-btn");
  const profileSidebar = document.getElementById("profile-sidebar");
  const closeProfileBtn = document.getElementById("close-profile-btn");
  const closeModalBtns = document.querySelectorAll(".close-modal-btn");
  const messageInput = document.getElementById("message-input");
  const sendButton = document.getElementById("send-button");
  const messagesContainer = document.getElementById("messages-container");
  const contactItems = document.querySelectorAll(".contact-item");
  const searchInput = document.getElementById("search-input");
  const changeAvatarBtn = document.getElementById("change-avatar-btn");
  const saveProfileBtn = document.getElementById("save-profile-btn");
  const closeSessionBtn = document.getElementById("close-session-btn");
  // State

  let isTyping = false;
  let typingTimeout;

  // Initialize

  scrollToBottom();

  // Event Listeners
  settingsBtn.addEventListener("click", () => {
    profileSidebar.classList.add("active");
  });

  closeProfileBtn.addEventListener("click", () => {
    profileSidebar.classList.remove("active");
  });

  closeModalBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const modal = btn.closest(".modal");
      modal.classList.remove("active");
    });
  });

  // Close modals when clicking outside
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) {
      e.target.classList.remove("active");
    }
  });

  // Message sending
  sendButton.addEventListener("click", sendMessage);

  messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }

    // Simulate typing indicator
    if (!isTyping) {
      isTyping = true;
      showTypingIndicator();

      // Hide typing indicator after 3 seconds of inactivity
      clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        isTyping = false;
        hideTypingIndicator();
      }, 3000);
    }
  });

  // Contact selection
  let currentChat = null;
  let currentContactId = null;
  let currentUserId = null;

  contactItems.forEach((item, index) => {
    item.addEventListener("click", () => {
      localStorage.setItem("currentChat", index);
      currentContactId = item.getAttribute("data-contact-id");
      currentUserId = item.getAttribute("data-current-user-id");

      // Remove active class from all contacts
      contactItems.forEach((contact) => contact.classList.remove("active"));
      item.classList.add("active");

      // Update current chat
      const contactName = item.querySelector("h4").textContent;
      currentChat = contactName;
      document.querySelector(".chat-contact-info h3").textContent = contactName;

      // Update avatar
      const avatarSrc = item.querySelector("img").src;
      document.querySelector(".chat-contact-info img").src = avatarSrc;

      // Clear unread count
      const unreadCount = item.querySelector(".unread-count");
      if (unreadCount) {
        unreadCount.remove();
      }

      // Cargar mensajes del chat
      fetch(`/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactId: currentContactId,
          currentUserId: currentUserId,
        }),
      })
        .then((response) => {
          if (!response.ok) throw new Error("Network error");
          return response.json();
        })
        .then((data) => {
          const statusContact = document.getElementById("status-contact");
          statusContact.innerHTML = data.statusContact
            ? data.statusContact
            : "AVALIABLE";
          const messages = document.getElementById("messages-container");
          messages.innerHTML = "";
          data.messages.forEach((message) => {
            if (message.image) {
              const messageElement = document.createElement("div");
              messageElement.className =
                message.sender_id == currentUserId
                  ? "message sent"
                  : "message received";
              messageElement.innerHTML = `
              <div class="message-content image-message">
                <img src="images/${message.text}" alt="Sent image">
                <span class="message-time">${message.date}</span>
                <span class="message-status">
                  <i class="fas fa-check"></i>
                </span>
              </div>
            `;
              messages.appendChild(messageElement);
            } else {
              const messageElement = document.createElement("div");
              messageElement.className =
                message.sender_id == currentUserId
                  ? "message sent"
                  : "message received";
              messageElement.innerHTML = `
            <div class="message-content">
              <p>${message.text}</p>
              <span class="message-time">${message.date}</span>
            </div>
          `;
              messages.appendChild(messageElement);
            }
          });
        });
    });
    const currentChatInit = localStorage.getItem("currentChat");

    contactItems[currentChatInit].click();
  });

  // Solo un listener para enviar mensaje
  const form = document.getElementById("form-send-message");
  const input = document.getElementById("message-input");
  const messages = document.getElementById("messages-container");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (input.value.trim().length !== 0 && currentContactId && currentUserId) {
      const message = input.value.trim();

      // Desplazar al final del chat
      messages.scrollTop = messages.scrollHeight;

      // Enviar mensaje al servidor
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const timeString = `${hours}:${minutes}`;

      socket.emit("chat message", {
        text: message,
        senderId: currentUserId,
        date: timeString,
        sentTo: currentContactId,
        image: false,
      });

      // Limpiar input
      input.value = "";
    }
  });
  // Attachment button functionality
  const attachBtn = document.getElementById("BtnAttach");
  const inputImg = document.getElementById("inputImg");
  if (attachBtn) {
    attachBtn.addEventListener("click", () => {
      inputImg.addEventListener("change", (e) => {
        const file = e.target.files[0];

        if (file) {
          const reader = new FileReader();

          reader.onload = (event) => {
            // Show image preview modal
            const modal = document.getElementById("image-preview-modal");
            const previewImage = document.getElementById("preview-image");
            // Set image source
            previewImage.src = event.target.result;

            // Show modal
            const cancelBtn = document.getElementById("cancel-btn");
            const sendBtnImg = document.getElementById("send-btn-img");
            cancelBtn.style.display = "block";
            sendBtnImg.style.display = "block";
            modal.classList.add("active");

            // Add send button functionality

            const sendBtn = document.getElementById("send-btn-img");
            let isSending = false; // variable global o al menos fuera del onclick
            sendBtn.onclick = async () => {
              if (isSending) return; // Bloquea ejecuciones múltiples inmediatamente
              isSending = true;

              sendBtn.disabled = true;
              sendBtn.textContent = "Sending...";

              const idCurrentUser =
                document.getElementById("idCurrentUser").value;
              const input = document.getElementById("inputImg");

              if (!input.files[0]) {
                alert("Selecciona una imagen.");
                sendBtn.disabled = false;
                sendBtn.textContent = "Send";
                isSending = false;
                return;
              }

              const formData = new FormData();
              formData.append("inputImg", input.files[0]);
              formData.append("id_user", idCurrentUser);

              try {
                const response = await fetch("/upload-image", {
                  method: "POST",
                  body: formData,
                });

                const data = await response.json();

                const now = new Date();
                const hours = now.getHours().toString().padStart(2, "0");
                const minutes = now.getMinutes().toString().padStart(2, "0");
                const timeString = `${hours}:${minutes}`;

                socket.emit("chat message", {
                  text: data.fileName,
                  senderId: currentUserId,
                  date: timeString,
                  sentTo: currentContactId,
                  image: true,
                });

                scrollToBottom();
                modal.classList.remove("active");
              } catch (err) {
                console.error("Error al subir la imagen:", err);
                alert("Error al enviar la imagen. Intenta de nuevo.");
              } finally {
                sendBtn.disabled = false;
                sendBtn.textContent = "Send";
                isSending = false; // 🔓 libera el botón SOLO al final
              }
            };

            // Add cancel button functionality
            cancelBtn.onclick = () => {
              modal.classList.remove("active");
            };
          };

          reader.readAsDataURL(file);
        }
      });

      inputImg.click();
    });
  }

  // Search functionality
  searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.toLowerCase();

    contactItems.forEach((item) => {
      const contactName = item.querySelector("h4").textContent.toLowerCase();
      const lastMessage = item
        .querySelector(".last-message p")
        .textContent.toLowerCase();

      if (
        contactName.includes(searchTerm) ||
        lastMessage.includes(searchTerm)
      ) {
        item.style.display = "flex";
      } else {
        item.style.display = "none";
      }
    });
  });

  // Profile image change
  changeAvatarBtn.addEventListener("click", () => {
    const profileImg = document.getElementById("profileImg");
    const handleChangeProfileImg = (e) => {
      const file = e.target.files[0];

      if (file) {
        const profileImgInput = document.getElementById("profileImg");
        const idCurrentUser = document.getElementById("idCurrentUser");
        const profileUser = document.getElementById("profileUser");
        const formData = new FormData();
        formData.append("profileImg", profileImgInput.files[0]); // file
        formData.append("id_user", idCurrentUser.value); // ID user
        formData.append("profileUser", profileUser.value); // profile user

        fetch("/update-profile-picture", {
          method: "POST",
          body: formData, // NO pongas headers aquí
        })
          .then((response) => response.json())
          .then((data) => {
            console.log("Respuesta del servidor:", data);
            location.reload();
          })
          .catch((error) => {
            console.error("Error al subir la imagen:", error);
          });
        const reader = new FileReader();

        reader.onload = (event) => {
          // Update profile images
          document.querySelector(".profile-image-large img").src =
            event.target.result;
          document.querySelector("#current-user-avatar img").src =
            event.target.result;

          // Show toast notification
          showToast("Profile picture updated successfully!", "success");
        };

        reader.readAsDataURL(file);
      }
    };
    profileImg.removeEventListener("change", handleChangeProfileImg);
    profileImg.addEventListener("change", handleChangeProfileImg, {
      once: true,
    });
  });
  const name = document.getElementById("profile-name");
  name.addEventListener("keydown", (e) => {
    if (e.key === " ") {
      e.preventDefault();
      return false;
    }
  });

  // Save profile changes
  saveProfileBtn.addEventListener("click", () => {
    const idCurrentUser = document.getElementById("idCurrentUser").value;
    const name = document.getElementById("profile-name").value;
    const status = document.getElementById("profile-status").value;

    fetch("/update-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, status, id_user: idCurrentUser }),
    }).then((response) => {
      // Update UI
      document.querySelector(".user-info h3").textContent = name;
      document.querySelector(".user-info .status").textContent = status;

      // Close sidebar
      profileSidebar.classList.remove("active");

      // Show toast notification
      showToast("Profile updated successfully!", "success");
    });
  });

  // Functions
  function sendMessage() {
    const message = messageInput.value.trim();

    if (message) {
      scrollToBottom();
    }
  }

  function showTypingIndicator() {
    // Check if typing indicator already exists
    if (!document.querySelector(".typing-indicator")) {
      const typingIndicator = document.createElement("div");
      typingIndicator.className = "typing-indicator fade-in";
      typingIndicator.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      `;

      messagesContainer.appendChild(typingIndicator);
      scrollToBottom();
    }
  }

  function hideTypingIndicator() {
    const typingIndicator = document.querySelector(".typing-indicator");
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Toast notification
  function showToast(message, type = "info") {
    // Remove existing toast if any
    const existingToast = document.querySelector(".toast");
    if (existingToast) {
      existingToast.remove();
    }

    // Create toast element
    const toast = document.createElement("div");
    toast.className = "toast";

    // Set icon based on type
    let icon = "info-circle";
    if (type === "success") icon = "check-circle";
    if (type === "error") icon = "exclamation-circle";
    if (type === "warning") icon = "exclamation-triangle";

    toast.innerHTML = `
      <div class="toast-icon">
        <i class="fas fa-${icon}"></i>
      </div>
      <div class="toast-message">${message}</div>
      <div class="toast-close">
        <i class="fas fa-times"></i>
      </div>
    `;

    // Add to body
    document.body.appendChild(toast);

    // Show toast
    setTimeout(() => {
      toast.classList.add("show");
    }, 10);

    // Add close event
    toast.querySelector(".toast-close").addEventListener("click", () => {
      toast.classList.remove("show");
      setTimeout(() => {
        toast.remove();
      }, 300);
    });
  }

  // Image preview modal
  document.addEventListener("click", (e) => {
    if (e.target.closest(".image-message img")) {
      const img = e.target.closest(".image-message img");
      const modal = document.getElementById("image-preview-modal");
      const previewImage = document.getElementById("preview-image");
      const cancelBtn = document.getElementById("cancel-btn");
      const sendBtnImg = document.getElementById("send-btn-img");
      // Set image source
      previewImage.src = img.src;

      // Show modal
      modal.classList.add("active");
      cancelBtn.style.display = "none";
      sendBtnImg.style.display = "none";
    }
  });

  // Mobile responsiveness
  function setupMobileView() {
    const isMobile = window.innerWidth < 768;

    if (isMobile) {
      // Create mobile toggle button if it doesn't exist
      if (!document.querySelector(".mobile-toggle")) {
        const mobileToggle = document.createElement("button");
        mobileToggle.className = "icon-button mobile-toggle";
        mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
        mobileToggle.title = "Toggle Contacts";

        document.querySelector(".chat-header").prepend(mobileToggle);

        mobileToggle.addEventListener("click", () => {
          const sidebar = document.querySelector(".sidebar");
          sidebar.classList.toggle("active");
        });

        // Close sidebar when a contact is clicked on mobile
        contactItems.forEach((item) => {
          item.addEventListener("click", () => {
            if (isMobile) {
              document.querySelector(".sidebar").classList.remove("active");
            }
          });
        });
      }
    } else {
      // Remove mobile toggle if screen is larger
      const mobileToggle = document.querySelector(".mobile-toggle");
      if (mobileToggle) {
        mobileToggle.remove();
      }
    }
  }

  // Call on load and resize
  setupMobileView();
  window.addEventListener("resize", setupMobileView);

  // Emoji picker functionality
  const emojiBtn = document.querySelector(
    ".message-input-container .icon-button:first-child"
  );

  if (emojiBtn) {
    emojiBtn.addEventListener("click", () => {
      // Check if emoji picker exists
      let emojiPicker = document.querySelector(".emoji-picker");

      if (!emojiPicker) {
        // Create emoji picker
        emojiPicker = document.createElement("div");
        emojiPicker.className = "emoji-picker";

        // Add emoji categories
        const categories = ["😀", "🙂", "❤️", "🎉", "🐱", "🍎", "⚽", "✈️"];

        let emojiHTML = '<div class="emoji-categories">';
        categories.forEach((emoji, index) => {
          emojiHTML += `<div class="emoji-category${
            index === 0 ? " active" : ""
          }" data-category="${index}">${emoji}</div>`;
        });
        emojiHTML += "</div>";

        // Add emoji list (simplified for demo)
        const emojisByCategory = [
          [
            "😀",
            "😃",
            "😄",
            "😁",
            "😆",
            "😅",
            "😂",
            "🤣",
            "😊",
            "😇",
            "🙂",
            "🙃",
            "😉",
            "😌",
            "😍",
            "🥰",
            "😘",
          ],
          [
            "👋",
            "👌",
            "✌️",
            "🤞",
            "👍",
            "👎",
            "👏",
            "🙌",
            "👐",
            "🤲",
            "🤝",
            "🙏",
            "✍️",
            "💪",
            "🦾",
            "🦿",
            "🦵",
          ],
          [
            "❤️",
            "🧡",
            "💛",
            "💚",
            "💙",
            "💜",
            "🖤",
            "🤍",
            "🤎",
            "💔",
            "❣️",
            "💕",
            "💞",
            "💓",
            "💗",
            "💖",
            "💘",
          ],
          [
            "🎉",
            "🎊",
            "🎈",
            "🎂",
            "🎁",
            "🎄",
            "🎃",
            "🎗️",
            "🎟️",
            "🎫",
            "🎖️",
            "🏆",
            "🥇",
            "🥈",
            "🥉",
            "⚽",
            "🏀",
          ],
          [
            "🐱",
            "🐶",
            "🐭",
            "🐹",
            "🐰",
            "🦊",
            "🐻",
            "🐼",
            "🐨",
            "🐯",
            "🦁",
            "🐮",
            "🐷",
            "🐸",
            "🐵",
            "🐔",
            "🐧",
          ],
          [
            "🍎",
            "🍐",
            "🍊",
            "🍋",
            "🍌",
            "🍉",
            "🍇",
            "🍓",
            "🍈",
            "🍒",
            "🍑",
            "🥭",
            "🍍",
            "🥥",
            "🥝",
            "🍅",
            "🍆",
          ],
          [
            "⚽",
            "🏀",
            "🏈",
            "⚾",
            "🥎",
            "🎾",
            "🏐",
            "🏉",
            "🥏",
            "🎱",
            "🪀",
            "🏓",
            "🏸",
            "🏒",
            "🏑",
            "🥍",
            "🏏",
          ],
          [
            "✈️",
            "🚗",
            "🚕",
            "🚙",
            "🚌",
            "🚎",
            "🏎️",
            "🚓",
            "🚑",
            "🚒",
            "🚐",
            "🚚",
            "🚛",
            "🚜",
            "🛴",
            "🚲",
            "🛵",
          ],
        ];

        emojiHTML += '<div class="emoji-list">';
        emojisByCategory[0].forEach((emoji) => {
          emojiHTML += `<div class="emoji-item" data-emoji="${emoji}">${emoji}</div>`;
        });
        emojiHTML += "</div>";

        emojiPicker.innerHTML = emojiHTML;

        // Add to DOM
        document
          .querySelector(".message-input-container")
          .appendChild(emojiPicker);

        // Add event listeners for categories
        document.querySelectorAll(".emoji-category").forEach((category) => {
          category.addEventListener("click", () => {
            // Update active category
            document
              .querySelectorAll(".emoji-category")
              .forEach((c) => c.classList.remove("active"));
            category.classList.add("active");

            // Update emoji list
            const categoryIndex = parseInt(
              category.getAttribute("data-category")
            );
            const emojiList = document.querySelector(".emoji-list");

            let emojisHTML = "";
            emojisByCategory[categoryIndex].forEach((emoji) => {
              emojisHTML += `<div class="emoji-item" data-emoji="${emoji}">${emoji}</div>`;
            });

            emojiList.innerHTML = emojisHTML;

            // Add click events to new emojis
            document.querySelectorAll(".emoji-item").forEach((item) => {
              item.addEventListener("click", () => {
                const emoji = item.getAttribute("data-emoji");
                messageInput.value += emoji;
                messageInput.focus();
              });
            });
          });
        });

        // Add click events to emojis
        document.querySelectorAll(".emoji-item").forEach((item) => {
          item.addEventListener("click", () => {
            const emoji = item.getAttribute("data-emoji");
            messageInput.value += emoji;
            messageInput.focus();
          });
        });

        // Close emoji picker when clicking outside
        document.addEventListener("click", (e) => {
          if (
            !e.target.closest(".emoji-picker") &&
            !e.target.closest(
              ".message-input-container .icon-button:first-child"
            )
          ) {
            const picker = document.querySelector(".emoji-picker");
            if (picker) {
              picker.classList.remove("active");
            }
          }
        });
      }

      // Toggle emoji picker
      emojiPicker.classList.toggle("active");
    });
  }

  closeSessionBtn.addEventListener("click", () => {
    fetch("/logout", { method: "GET" })
      .then(() => {
        window.location.href = "/";
      })
      .catch((error) => {
        console.error("Error logging out:", error);
      });
  });
});
