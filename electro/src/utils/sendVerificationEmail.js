import { sendEmail } from "./sendEmail.js";

export const sendVerificationEmail = async (user, token) => {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const html = `
    <h2>Xin chào ${user.fullname},</h2>
    <p>Cảm ơn bạn đã đăng ký tài khoản tại Electro.</p>
    <p>Vui lòng nhấn vào liên kết bên dưới để xác minh email của bạn:</p>
    <a href="${verifyUrl}" target="_blank" style="color: #1a73e8;">Xác minh Email</a>
    <p>Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email.</p>
    <br/>
    <p>Trân trọng,<br/>Đội ngũ Electro</p>
  `;

  await sendEmail({
    to: user.email,
    subject: "Xác minh tài khoản Electro",
    html,
  });
};
