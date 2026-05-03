import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class CorreoServicio {
  private readonly logger = new Logger(CorreoServicio.name);
  private transporter: Transporter;

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('SMTP_HOST', 'smtp.gmail.com'),
      port: this.config.get<number>('SMTP_PORT', 587),
      secure: false, // TLS
      auth: {
        user: this.config.get<string>('SMTP_USER'),
        pass: this.config.get<string>('SMTP_PASS'),
      },
    });
  }

  async enviarRecuperacionContrasena(
    destinatario: string,
    nombre: string,
    token: string,
  ): Promise<void> {
    const baseUrl = this.config.get<string>('APP_URL', 'http://localhost:5173');
    const enlace = `${baseUrl}/restablecer-contrasena?token=${token}`;
    const smtpUser = this.config.get<string>('SMTP_USER');

    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Restablecer contrasena - Cambridge Academy of Languages</title>
      </head>
      <body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 0;">
          <tr>
            <td align="center">
              <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                <!-- Header -->
                <tr>
                  <td style="background:#1e3a5f;padding:32px 40px;text-align:center;">
                    <table cellpadding="0" cellspacing="0" style="margin:0 auto 16px;">
                      <tr>
                        <td style="background:#2563eb;width:44px;height:44px;border-radius:10px;text-align:center;vertical-align:middle;">
                          <span style="color:#ffffff;font-size:22px;font-weight:bold;">C</span>
                        </td>
                      </tr>
                    </table>
                    <p style="color:#93c5fd;font-size:13px;margin:0 0 4px;">Cambridge Academy of Languages</p>
                    <h1 style="color:#ffffff;font-size:22px;margin:0;font-weight:600;">Restablecer contrasena</h1>
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding:40px 40px 24px;">
                    <p style="color:#374151;font-size:15px;margin:0 0 12px;">Hola, <strong>${nombre}</strong></p>
                    <p style="color:#6b7280;font-size:14px;margin:0 0 24px;line-height:1.6;">
                      Recibimos una solicitud para restablecer la contrasena de tu cuenta en el
                      Sistema CAL. Haz clic en el boton a continuacion para crear una nueva contrasena.
                    </p>
                    <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
                      <tr>
                        <td style="background:#2563eb;border-radius:8px;padding:14px 32px;text-align:center;">
                          <a href="${enlace}" style="color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;">
                            Restablecer contrasena
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p style="color:#9ca3af;font-size:13px;text-align:center;margin:0 0 16px;">
                      Este enlace expira en <strong>30 minutos</strong>.
                    </p>
                    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
                    <p style="color:#9ca3af;font-size:12px;margin:0;line-height:1.6;">
                      Si no solicitaste este cambio, puedes ignorar este correo.
                      Tu contrasena no sera modificada.<br/>
                      Por seguridad, no compartas este enlace con nadie.
                    </p>
                    <p style="color:#d1d5db;font-size:11px;margin:16px 0 0;word-break:break-all;">
                      Enlace alternativo: <a href="${enlace}" style="color:#2563eb;">${enlace}</a>
                    </p>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
                    <p style="color:#9ca3af;font-size:12px;margin:0;">
                      &copy; 2026 Cambridge Academy of Languages &mdash; Sistema CAL
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from: `"Sistema CAL" <${smtpUser}>`,
        to: destinatario,
        subject: 'Restablecer contrasena - Cambridge Academy of Languages',
        html,
      });
      this.logger.log(`Correo de recuperacion enviado a: ${destinatario}`);
    } catch (error) {
      this.logger.error(`Error enviando correo a ${destinatario}`, error);
      throw error;
    }
  }
}
