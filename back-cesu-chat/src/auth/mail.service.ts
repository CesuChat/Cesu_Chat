import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class MailService {
  private transporter;

  constructor(private usersService: UsersService) {
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
    const user = await this.usersService.findByEmail(to); 
    if (!user) {
        console.error(`Usuário com email ${to} não encontrado.`);
        return; 
    }
    const username = user.username; 
    const url = `http://localhost:3000/auth/verify-email/${userId}?token=${token}`;
    await this.transporter.sendMail({
      from: '"ChatCesu" <no-reply@example.com>',
      to,
      subject: 'Confirmação de Email',
      text: `Clique no link para confirmar seu email: ${url}`,
      html: `
        <!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="pt-BR">
<head>
	<title></title>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<style>
		* {
			box-sizing: border-box;
		}
		body {
			margin: 0;
			padding: 0;
		}
		a[x-apple-data-detectors] {
			color: inherit !important;
			text-decoration: inherit !important;
		}
		#MessageViewBody a {
			color: inherit;
			text-decoration: none;
		}
		p {
			line-height: inherit
		}
		.desktop_hide,
		.desktop_hide table {
			mso-hide: all;
			display: none;
			max-height: 0px;
			overflow: hidden;
		}
		.image_block img+div {
			display: none;
		}
		sup,
		sub {
			font-size: 75%;
			line-height: 0;
		}
		@media (max-width:505px) {
			.desktop_hide table.icons-inner {
				display: inline-block !important;
			}
			.icons-inner {
				text-align: center;
			}
			.icons-inner td {
				margin: 0 auto;
			}
			.mobile_hide {
				display: none;
			}
			.row-content {
				width: 100% !important;
			}
			.stack .column {
				width: 100%;
				display: block;
			}
			.mobile_hide {
				min-height: 0;
				max-height: 0;
				max-width: 0;
				overflow: hidden;
				font-size: 0px;
			}
			.desktop_hide,
			.desktop_hide table {
				display: table !important;
				max-height: none !important;
			}
		}
	</style>
</head>
<body class="body" style="background-color: #ffffff; margin: 0; padding: 0;">
	<table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #ffffff;">
		<tbody>
			<tr>
				<td>
					<table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
						<tbody>
							<tr>
								<td>
									<table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="color: #000000; width: 485px; margin: 0 auto;" width="485">
										<tbody>
											<tr>
												<td class="column column-1" width="100%">
													<table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
														<tr>
															<td class="pad" style="width:100%;">
																<div class="alignment" align="center">
																	<div style="max-width: 260px;">
																		<img src="https://09f161c582.imgdist.com/pub/bfra/p8e8qq2f/lpp/ygd/2zt/CesuChat-removebg-preview%201.png" style="display: block; height: auto; border: 0; width: 100%;" width="100" alt title height="auto">
																	</div>
																</div>
															</td>
														</tr>
													</table>
													<table class="heading_block block-2" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation">
														<tr>
															<td class="pad">
 																<h1 style="margin: 0; color: #0097b2; font-family: Arial, Helvetica, sans-serif; font-size: 38px; font-weight: 700; line-height: 120%; text-align: left;">
                                           						 Olá, ${username} 😊!
                                          						</h1>
															</td>
														</tr>
													</table>
													<table class="paragraph_block block-3" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation">
														<tr>
															<td class="pad">
																<div style="color:#101112;direction:ltr;font-family:Arial, Helvetica, sans-serif;font-size:16px;font-weight:400;line-height:120%;text-align:left;">
																	<p style="margin: 0;">Estamos super empolgados por você ter se juntado ao <strong>CesuChat</strong>! Para finalizar seu registro e começar a usar tudo que temos a oferecer, basta confirmar seu e-mail clicando no botão abaixo:</p>
																</div>
															</td>
														</tr>
													</table>
													<table class="button_block block-4" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation">
														<tr>
															<td class="pad">
																<div class="alignment" align="center">
																	<a href="${url}" style="background-color:#0097b2;border-radius:4px;color:#ffffff;display:inline-block;font-family:Arial, Helvetica, sans-serif;font-size:16px;font-weight:700;padding:10px 20px;text-align:center;text-decoration:none;">Confirmar Email</a>
																</div>
															</td>
														</tr>
													</table>
													<table class="paragraph_block block-5" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation">
														<tr>
															<td class="pad">
																<div style="color:#101112;direction:ltr;font-family:Arial, Helvetica, sans-serif;font-size:16px;font-weight:400;line-height:120%;text-align:left;">
																	<p style="margin: 0; margin-bottom: 16px;">Esse passo é super importante para garantir a segurança da sua conta e para que você possa aproveitar todas as funcionalidades do nosso app.</p>
																	<p style="margin: 0; margin-bottom: 16px;"><strong>Se tiver qualquer dúvida ou precisar de ajuda, nossa equipe de suporte está aqui para te ajudar</strong>!</p>
																	<p style="margin: 0;">Atenciosamente, Equipe CesuChat</p>
																</div>
															</td>
														</tr>
													</table>
													<table class="divider_block block-6" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation">
														<tr>
															<td class="pad">
																<div class="alignment" align="center">
																	<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
																		<tr>
																			<td class="divider_inner" style="font-size: 1px; line-height: 1px; border-top: 1px solid #dddddd;"><span style="word-break: break-word;">&#8202;</span></td>
																		</tr>
																	</table>
																</div>
															</td>
														</tr>
													</table>
												</td>
											</tr>
										</tbody>
									</table>
								</td>
							</tr>
						</tbody>
					</table>
				</td>
			</tr>
		</tbody>
	</table><!-- End -->
</body>
</html>
      `,
    });
}

  async sendPasswordResetEmail(to: string, token: string) {
    const url = `http://localhost:3000/auth/reset-password?token=${token}`;
    await this.transporter.sendMail({
      from: '"ChatCesu" <no-reply@example.com>',
      to,
      subject: 'Redefinição de Senha',
      text: `Clique no link para redefinir sua senha: ${url}`,
      html: `
        <!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="pt-BR">

<head>
	<title></title>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0"><!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]--><!--[if !mso]><!--><!--<![endif]-->
	<style>
		* {
			box-sizing: border-box;
		}

		body {
			margin: 0;
			padding: 0;
		}

		a[x-apple-data-detectors] {
			color: inherit !important;
			text-decoration: inherit !important;
		}

		#MessageViewBody a {
			color: inherit;
			text-decoration: none;
		}

		p {
			line-height: inherit
		}

		.desktop_hide,
		.desktop_hide table {
			mso-hide: all;
			display: none;
			max-height: 0px;
			overflow: hidden;
		}

		.image_block img+div {
			display: none;
		}

		sup,
		sub {
			font-size: 75%;
			line-height: 0;
		}

		@media (max-width:505px) {
			.desktop_hide table.icons-inner {
				display: inline-block !important;
			}

			.icons-inner {
				text-align: center;
			}

			.icons-inner td {
				margin: 0 auto;
			}

			.mobile_hide {
				display: none;
			}

			.row-content {
				width: 100% !important;
			}

			.stack .column {
				width: 100%;
				display: block;
			}

			.mobile_hide {
				min-height: 0;
				max-height: 0;
				max-width: 0;
				overflow: hidden;
				font-size: 0px;
			}

			.desktop_hide,
			.desktop_hide table {
				display: table !important;
				max-height: none !important;
			}
		}
	</style><!--[if mso ]><style>sup, sub { font-size: 100% !important; } sup { mso-text-raise:10% } sub { mso-text-raise:-10% }</style> <![endif]-->
</head>

<body class="body" style="background-color: #ffffff; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
	<table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff;">
		<tbody>
			<tr>
				<td>
					<table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
						<tbody>
							<tr>
								<td>
									<table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 485px; margin: 0 auto;" width="485">
										<tbody>
											<tr>
												<td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
													<table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad" style="width:100%;">
																<div class="alignment" align="center" style="line-height:10px">
                                                                    <div style="max-width: 260px;"><img src="https://09f161c582.imgdist.com/pub/bfra/p8e8qq2f/lpp/ygd/2zt/CesuChat-removebg-preview%201.png" style="display: block; height: auto; border: 0; width: 100%;" width="100" alt title height="auto"></div>
																</div>
															</td>
														</tr>
													</table>
													<table class="divider_block block-2" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad">
																<div class="alignment" align="center">
																	<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
																		<tr>
																			<td class="divider_inner" style="font-size: 1px; line-height: 1px; border-top: 1px solid #dddddd;"><span style="word-break: break-word;">&#8202;</span></td>
																		</tr>
																	</table>
																</div>
															</td>
														</tr>
													</table>
													<table class="heading_block block-3" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad">
																<h1 style="margin: 0; color: #0097b2; font-family: Arial, Helvetica, sans-serif; font-size: 38px; font-weight: 700; line-height: 120%; text-align: left;">
																Olá, ${User.name} 😊!
																</h1>
															</td>
														</tr>
													</table>
													<table class="paragraph_block block-4" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad">
																<div style="color:#101112;direction:ltr;font-family:Arial, Helvetica, sans-serif;font-size:16px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:left;mso-line-height-alt:19.2px;">
																	<p style="margin: 0; margin-bottom: 16px;">Recebemos um pedido para redefinir a sua senha do&nbsp;<strong>CesuChat</strong>. Não se preocupe, estamos aqui para ajudar!</p>
																	<p style="margin: 0;">Para criar uma nova senha, clique no botão abaixo:</p>
																</div>
															</td>
														</tr>
													</table>
													<table class="button_block block-5" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad">
																<div class="alignment" align="center"><!--[if mso]>
<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" style="height:42px;width:161px;v-text-anchor:middle;" arcsize="10%" stroke="false" fillcolor="#0097b2">
<w:anchorlock/>
<v:textbox inset="0px,0px,0px,0px">
<center dir="false" style="color:#ffffff;font-family:Arial, sans-serif;font-size:16px">
<![endif]-->
																	<div style="background-color:#0097b2;border-bottom:0px solid transparent;border-left:0px solid transparent;border-radius:4px;border-right:0px solid transparent;border-top:0px solid transparent;color:#ffffff;display:inline-block;font-family:Arial, Helvetica, sans-serif;font-size:16px;font-weight:700;mso-border-alt:none;padding-bottom:5px;padding-top:5px;text-align:center;text-decoration:none;width:auto;word-break:keep-all;"><span style="word-break: break-word; padding-left: 20px; padding-right: 20px; font-size: 16px; display: inline-block; letter-spacing: normal;"><span style="word-break: break-word; line-height: 32px;">Redefinir Senha</span></span></div><!--[if mso]></center></v:textbox></v:roundrect><![endif]-->
																</div>
															</td>
														</tr>
													</table>
													<table class="divider_block block-6" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad">
																<div class="alignment" align="center">
																	<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
																		<tr>
																			<td class="divider_inner" style="font-size: 1px; line-height: 1px; border-top: 1px solid #dddddd;"><span style="word-break: break-word;">&#8202;</span></td>
																		</tr>
																	</table>
																</div>
															</td>
														</tr>
													</table>
													<table class="paragraph_block block-7" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad">
																<div style="color:#101112;direction:ltr;font-family:Arial, Helvetica, sans-serif;font-size:16px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:left;mso-line-height-alt:19.2px;">
																	<p style="margin: 0; margin-bottom: 16px;">&nbsp;Se você não solicitou a redefinição de senha, pode ignorar este e-mail. Sua conta permanece segura!</p>
																	<p style="margin: 0; margin-bottom: 16px;">Caso tenha alguma dúvida ou precise de assistência, nossa equipe de suporte está sempre à disposição para te ajudar! 💬</p>
																	<p style="margin: 0;">Atenciosamente, Equipe CesuChat</p>
																</div>
															</td>
														</tr>
													</table>
																</div>
															</td>
														</tr>
													</table>
												</td>
											</tr>
										</tbody>
									</table>
								</td>
							</tr>
						</tbody>
					</table>
					<table class="row row-2" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff;">
						<tbody>
							<tr>
								<td>
									<table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 485px; margin: 0 auto;" width="485">
										<tbody>
											<tr>
												<td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
															</td>
														</tr>
													</table>
												</td>
											</tr>
										</tbody>
									</table>
								</td>
							</tr>
						</tbody>
					</table>
				</td>
			</tr>
		</tbody>
	</table><!-- End -->
</body>

</html>
      `,
    });
  }
}
