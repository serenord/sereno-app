import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, country, interest } = body;

    // 1. Configure SMTP Transporter (Hostinger)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // 2. Prepare Welcome Email (Emotional & Professional)
    const mailOptions = {
      from: `"SERENO Health" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Bienvenido a SERENO - Tu tranquilidad comienza aquí',
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #0f172a;">
          <h1 style="color: #1e40af; font-size: 24px;">¡Hola ${name || 'amigo/a'}! 👋</h1>
          <p style="font-size: 16px; line-height: 1.6;">
            Gracias por interesarte en <strong>SERENO</strong>. Sabemos lo que significa estar lejos de casa y la preocupación que genera la salud de quienes más quieres en República Dominicana.
          </p>
          <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin: 25px 0;">
            <h3 style="margin-top: 0; color: #10b981;">Confirmamos tu pre-registro:</h3>
            <ul style="list-style: none; padding: 0;">
              <li>📍 <strong>Desde:</strong> ${country || 'Exterior'}</li>
              <li>🎯 <strong>Interés:</strong> ${interest || 'Cuidado Integral'}</li>
            </ul>
          </div>
          <p style="font-size: 16px;">
            Nuestro equipo se pondrá en contacto contigo muy pronto para explicarte cómo activar tu plan y empezar a monitorear la salud de tus familiares con tecnología Bluetooth.
          </p>
          <div style="text-align: center; margin: 40px 0;">
            <a href="https://serenoapp.org" style="background: #10b981; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">Ver mi Dashboard</a>
          </div>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 40px 0;">
          <p style="font-size: 12px; color: #64748b; text-align: center;">
            ¿Tienes dudas inmediatas? Escríbenos directamente por WhatsApp: <br>
            <a href="https://wa.me/18292847990" style="color: #1e40af;">+1 (829) 284-7990</a>
          </p>
        </div>
      `,
    };

    // 3. Send Email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ 
      success: true, 
      message: 'Lead capturado y correo enviado' 
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al procesar la solicitud' 
    }, { status: 500 });
  }
}
