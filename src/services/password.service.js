import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transport = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendMailResetPassword(email, subject, token, user) {
  transport.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: subject,
    html: creationMailVerificationCode(token, user),
  });
}

function creationMailVerificationCode(token, user) {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      line-height: 1.6;
      color: var(--gray-700);
      background-color: #f8fafc;
      margin: 0;
      padding: 20px;
    }

    .email-container {
      max-width: 600px;
      margin: 0 auto;
      border: 1px solid #6366f1;
      background: white;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.8);
    }

    .email-header {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white;
      padding: 32px;
      text-align: center;
    }

    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .logo-icon {
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    h1 {
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0;
      letter-spacing: -0.02em;
      color: white;
    }

    .email-body {
      padding: 40px;
      background: white;
      color: #1e293b;
    }

    h2 {
      color: #0f172a;
      font-size: 1.5rem;
      margin-top: 0;
      margin-bottom: 24px;
    }

    p {
      color: #475569;
      margin-bottom: 24px;
    }

    .button {
      display: inline-block;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 12px;
      font-weight: 600;
      margin: 24px 0;
      text-align: center;
      box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.2);
      transition: all 0.3s ease;
    }

    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3);
    }

    .note {
      background: #f8fafc;
      border-radius: 12px;
      padding: 20px;
      margin: 24px 0;
      border: 1px solid #e2e8f0;
    }

    .note strong {
      color: #6366f1;
    }

    .link-text {
      word-break: break-all;
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
      color: #64748b;
      background: #f8fafc;
      padding: 12px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }

    .email-footer {
      background: #f8fafc;
      padding: 24px;
      text-align: center;
      font-size: 14px;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <div class="logo">
        <div class="logo-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px;">
            <path d="M8 12H16M8 8H16M8 16H13M6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20Z" />
          </svg>
        </div>
        <h1>ChatFlow</h1>
      </div>
      <p style="color: white; opacity: 0.9;">Restablecer Contraseña</p>
    </div>

    <div class="email-body">
      <h2>¡Hola, ${user}!</h2>
      <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta de ChatFlow. Haz clic en el botón a continuación para crear una nueva contraseña:</p>
      
      <div style="text-align: center;">
        <a href="http://localhost:3000/reset-password/${token}" class="button">Restablecer Contraseña</a>
      </div>
      
      <div class="note">
        <p><strong>Nota:</strong> Este enlace expirará en 1 hora por razones de seguridad.</p>
        <p>Si no solicitaste restablecer tu contraseña, puedes ignorar este correo electrónico.</p>
      </div>
      
      <p>Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:</p>
      <div class="link-text">http://localhost:3000/reset-password/${token}</div>
    </div>

    <div class="email-footer">
      <p>&copy; ${new Date().getFullYear()} ChatFlow. Todos los derechos reservados.</p>
      <p>Este es un correo electrónico automático, por favor no respondas.</p>
    </div>
  </div>
</body>
</html>
`;
}
