import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', 
      port: 465,
      secure: true, 
      auth: {
        user: 'chatcesu@gmail.com', 
        pass: 'dztn yprc obyt tcpi', 
      },
    });
  }

  async sendVerificationEmail(to: string, token: string) {
    const url = `http://localhost:3000/auth/verify-email?token=${token}`;
    await this.transporter.sendMail({
      from: '"Chat App" <no-reply@example.com>',
      to,
      subject: 'Confirmação de Email',
      text: `Clique no link para confirmar seu email: ${url}`,
      html: `<b>Clique no link para confirmar seu email:</b> <a href="${url}">${url}</a>`,
    });
  }

  async sendPasswordResetEmail(to: string, token: string) {
    const url = `http://localhost:3000/auth/reset-password?token=${token}`;
    await this.transporter.sendMail({
      from: '"Chat App" <no-reply@example.com>',
      to,
      subject: 'Redefinição de Senha',
      text: `Clique no link para redefinir sua senha: ${url}`,
      html: `<b>Clique no link para redefinir sua senha:</b> <a href="${url}">${url}</a>`,
    });
  }
}
