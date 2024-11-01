import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';

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

  async sendVerificationEmail(to: string, token: string, userId: number) {
    const url = `http://localhost:3000/auth/verify-email/${userId}?token=${token}`;

    const filePath = path.join(__dirname, '..', '..', 'front-cesu-chat', 'login', 'verify-email.html');

    let htmlContent = fs.readFileSync(filePath, 'utf8');

    htmlContent = htmlContent.replace('{{url}}', url);

    await this.transporter.sendMail({
      from: '"Chat App" <no-reply@example.com>',
      to,
      subject: 'Confirmação de Email',
      text: `Clique no link para confirmar seu email: ${url}`,
      html: htmlContent,
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
