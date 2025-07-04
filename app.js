import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";
import jwt from "jsonwebtoken";
import { sendMail } from "./src/services/mail.service.js";
import { sendMailResetPassword } from "./src/services/password.service.js";
import pool from "./src/services/bdconnection.js";
import multer from "multer";
import { Server } from "socket.io";
import { createServer } from "node:http";
import bcrypt from "bcrypt"; // Importar bcrypt
import fs from "fs";

dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const IMAGE_DIR = path.join(__dirname, "public/images");

// Configuración del almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, IMAGE_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + ".png");
  },
});

const upload = multer({ storage });

const app = express();
const server = createServer(app);
const io = new Server(server, {
  connectionStateRecovery: {},
});

app.use(cookieParser());
app.set("views", path.join(__dirname, "src", "views"));

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("chat message", (msg) => {
    console.log(msg);
    io.emit("chat message", msg);
    if (!msg.image) {
      const query =
        "INSERT INTO messages (sender_id, text, date, sent_to, image) VALUES ($1, $2, $3, $4, $5) RETURNING *";

      pool.query(
        query,
        [msg.senderId, msg.text, msg.date, msg.sentTo, false],
        (err, results) => {
          if (err) {
            console.error("Error inserting message:", err);
          } else {
            console.log("Message inserted:", results.rows[0]);
          }
        }
      );
    } else {
      const query =
        "INSERT INTO messages (sender_id, text, date, sent_to,image ) VALUES ($1, $2, $3, $4,$5) RETURNING *";

      pool.query(
        query,
        [msg.senderId, msg.text, msg.date, msg.sentTo, true],
        (err, results) => {
          if (err) {
            console.error("Error inserting message:", err);
          } else {
            console.log("Message inserted:", results.rows[0]);
          }
        }
      );
    }
  });
});
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users LIMIT 1");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error en /test-db:", err);
    res.status(500).send(err.message);
  }
});

app.get("/", (req, res) => {
  if (req.cookies.token) {
    return res.redirect("/home");
  }
  res.render("index.ejs");
});

app.post("/login/submit", (req, res) => {
  const { username, password } = req.body;
  console.log(username, password);
  const query = "SELECT * FROM users WHERE fullname = $1 AND verified = '1'";

  pool.query(query, [username], async (err, results) => {
    if (err) {
      console.error("Error fetching data:", err);
      return res.status(500).json({ error: "Error fetching data" });
    }

    if (results.rows.length > 0) {
      const user = results.rows[0];
      console.log("User found:", user);
      // Compara la contraseña ingresada con la contraseña encriptada
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user.id_user }, process.env.SECRET, {
        expiresIn: "1h",
      });

      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 3600000,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      return res.json({ message: "Login successful", token });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });
});
app.get("/forgot-password", (req, res) => {
  res.render("forgotpassword.ejs");
});
app.post("/forgot-password/submit", (req, res) => {
  const { email } = req.body;
  const query = "SELECT * FROM users WHERE email = $1";
  pool.query(query, [email], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching data" });
    }
    if (results.rows.length > 0) {
      const user = results.rows[0];
      const token = jwt.sign({ email: user.email }, process.env.SECRET, {
        expiresIn: "1h",
      });
      sendMailResetPassword(email, "Reset your password", token, user.fullname);

      return res.json({ success: true, message: "Email sent successfully" });
    } else {
      return res.status(404).json({ error: "User not found" });
    }
  });
});
app.get("/reset-password/:token", (req, res) => {
  const { token } = req.params;
  jwt.verify(token, process.env.SECRET, (err, decoded) => {
    if (err) {
      return res.status(400).json({ error: "Invalid token" });
    }
    res.render("changePass.ejs", { token });
  });
});
app.post("/reset-password/submit", async (req, res) => {
  const { token, newPassword } = req.body;
  console.log(token, newPassword);
  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    const { email } = decoded;
    console.log(email);
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    const updateQuery = "UPDATE users SET password = $1 WHERE email = $2";
    pool.query(updateQuery, [hashedPassword, email], (err, updateResult) => {
      if (err) {
        console.error("Error updating password:", err);
        return res.status(500).json({ error: "Error updating password" });
      }
      return res.json({
        success: true,
        message: "Password updated successfully",
      });
    });
  } catch (error) {
    console.error("Error in password reset process:", error);
    return res.status(500).json({ error: "Error in password reset process" });
  }
});

app.get("/checkEmail", (req, res) => {
  res.render("checkEmail.ejs");
});
app.get("/register", (_, res) => {
  res.render("register.ejs");
});
app.post("/register/submit", async (req, res) => {
  const { fullname, email, password } = req.body;

  try {
    // First check if the user already exists
    const checkResult = await pool.query(
      "SELECT * FROM users WHERE email = $1 AND fullname = $2",
      [email, fullname]
    );

    // If user exists, return error
    if (checkResult.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }

    // Hash the password with bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // If user doesn't exist, proceed with registration
    const query =
      "INSERT INTO users (fullname, email, password) VALUES ($1, $2, $3)";
    await pool.query(query, [fullname, email, hashedPassword]);

    const token = jwt.sign({ email }, process.env.SECRET, {
      expiresIn: "1h",
    });
    sendMail(email, "Verify your email", token, fullname);
    res.redirect("/checkEmail");
  } catch (error) {
    console.error("Error in registration process:", error);
    return res.status(500).json({ error: "Error in registration process" });
  }
});

app.get("/checkEmail", (_, res) => {
  res.render("checkEmail.ejs");
});

app.get("/verify-email", (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ error: "Token is missing" });
  }
  jwt.verify(token, process.env.SECRET, (err, decoded) => {
    if (err) {
      return res.status(400).json({ error: "Invalid token" });
    }
    const { email } = decoded;
    const updateQuery = "UPDATE users SET verified = 1 WHERE email = $1";
    pool.query(updateQuery, [email], (err, updateResult) => {
      if (err) {
        console.error("Error updating user:", err);
        return res.status(500).json({ error: "Error updating user" });
      }
      // Fetch the user to get their id
      const selectQuery = "SELECT id_user FROM users WHERE email = $1";
      pool.query(selectQuery, [email], (err, selectResult) => {
        if (err || !selectResult.rows.length) {
          console.error("Error fetching user:", err);
          return res.status(500).json({ error: "User not found after update" });
        }
        const userId = selectResult.rows[0].id_user;
        const newToken = jwt.sign({ userId }, process.env.SECRET, {
          expiresIn: "1h",
        });
        res.cookie("token", newToken, {
          httpOnly: true,
          maxAge: 3600000,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });
        res.redirect("/home");
      });
    });
  });
});

app.get("/home", validateToken, async (req, res) => {
  const user = req.user;
  const query = "SELECT * FROM messages";
  pool.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching messages:", err);
      return res.status(500).json({ error: "Error fetching messages" });
    }
    const messages = results.rows;
    let query = "SELECT fullname, id_user, profile FROM users";
    pool.query(query, (err, results) => {
      if (err) {
        console.error("Error fetching users:", err);
        return res.status(500).json({ error: "Error fetching users" });
      }
      const contacts = results.rows;

      res.render("home.ejs", { user, messages, contacts });
    });
  });
});

app.post("/chat", (req, res) => {
  const contactId = req.body.contactId;
  const currentId = req.body.currentUserId;
  console.log(contactId, currentId);
  const query =
    "SELECT * FROM messages WHERE (sender_id = $1 AND sent_to = $2) OR (sender_id = $2 AND sent_to = $1)";
  pool.query(query, [currentId, contactId], (err, results) => {
    if (err) {
      console.error("Error fetching messages:", err);
      return res.status(500).json({ error: "Error fetching messages" });
    }
    const messages = results.rows;
    const query = "SELECT status FROM users WHERE id_user = $1";
    pool.query(query, [contactId], (err, results) => {
      if (err) {
        console.error("Error fetching messages:", err);
        return res.status(500).json({ error: "Error fetching messages" });
      }
      const statusContact = results.rows[0].status;

      res.json({ messages, statusContact });
    });
  });
});

app.post("/update-profile-picture", upload.single("profileImg"), (req, res) => {
  const { id_user, profileUser } = req.body;
  const profilePicture = req.file?.filename;

  if (!profilePicture || !id_user) {
    return res.status(400).json({ error: "Faltan datos: imagen o id_user" });
  }
  // Si el usuario ya tenía una imagen anterior, la eliminamos
  if (profileUser) {
    const oldImagePath = path.join(IMAGE_DIR, profileUser);
    fs.unlink(oldImagePath, (err) => {
      if (err) {
        console.error("Error al eliminar imagen anterior:", err.message);
        // No detenemos el flujo si no se puede borrar
      }
    });
  }
  const query = "UPDATE users SET profile = $1 WHERE id_user = $2";
  pool.query(query, [profilePicture, id_user], (err, results) => {
    if (err) {
      console.error("Error updating profile picture:", err);
      return res.status(500).json({ error: "Error updating profile picture" });
    }

    console.log("Imagen subida correctamente como: " + profilePicture);
    res.json({ success: true });
  });
});

app.post("/update-profile", (req, res) => {
  const { id_user, name, status } = req.body;
  if (!id_user || !name || !status) {
    return res.status(400).json({ error: "left data" });
  }
  const query =
    "UPDATE users SET fullname = $1, status = $2 WHERE id_user = $3";
  pool.query(query, [name, status, id_user], (err, results) => {
    if (err) {
      console.error("Error updating profile picture:", err);
      return res
        .status(500)
        .json({ error: "Error updating profile name and status" });
    }

    res.json({ success: true });
  });
});

app.post("/upload-image", upload.single("inputImg"), (req, res) => {
  const { id_user } = req.body;
  const image = req.file?.filename;
  console.log(image, id_user);
  if (!image || !id_user) {
    return res.status(400).json({ error: "Faltan datos" });
  }
  console.log("Imagen subida correctamente como: " + image);
  res.json({ fileName: image });
});

app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

// In the validateToken function
function validateToken(req, res, next) {
  console.log("Validating token...");
  const accessToken = req.header("Authorization") || req.cookies.token;
  if (!accessToken) {
    return res.render("error");
  }

  jwt.verify(accessToken, process.env.SECRET, (err, decoded) => {
    if (err) {
      return res.render("error");
    }
    // Extract user ID from token
    const userId = decoded.userId;
    // Use userId instead of userEmail in the query
    const query = "SELECT * FROM users WHERE id_user=$1";
    pool.query(query, [userId], (dbErr, results) => {
      if (dbErr || results.rows.length === 0) {
        console.error(
          "Error fetching user data:",
          dbErr ? dbErr.message : "User not found"
        );
        return res.status(500).json({ error: "Error fetching user data" });
      }
      // Add user data to request object
      req.user = results.rows[0];
      // Add user data to res.locals so it's available to all templates
      res.locals.user = results.rows[0];
      next();
    });
  });
}
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
