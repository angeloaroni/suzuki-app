import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(email: string, token: string) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    try {
        await resend.emails.send({
            from: 'Musivo <onboarding@resend.dev>',
            to: email,
            subject: 'Restablece tu contraseña - Musivo',
            html: `
                <h1>Restablece tu contraseña</h1>
                <p>Has solicitado restablecer tu contraseña en Musivo.</p>
                <p>Haz clic en el siguiente enlace para continuar:</p>
                <a href="${resetLink}">${resetLink}</a>
                <p>Este enlace expirará en 1 hora.</p>
                <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
            `
        });
        return { success: true };
    } catch (error) {
        console.error("Error sending email:", error);
        return { error: "No se pudo enviar el correo" };
    }
}
