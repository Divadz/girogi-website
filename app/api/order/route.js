import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req) {
    const { email, cart, total } = await req.json();

    // 1. Sauvegarde DB
    await prisma.order.create({
        data: { email, total, details: JSON.stringify(cart) }
    });

    // 2. Envoi Mail
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_RECEIVER,
        subject: `Nouvelle commande : ${email}`,
        html: `
      <h1>Récapitulatif de commande</h1>
      <p>Client : ${email}</p>
      <ul>${cart.map(item => `<li>${item.name} - ${item.price}€</li>`).join('')}</ul>
      <p><strong>Total : ${total}€</strong></p>
    `
    };

    await transporter.sendMail(mailOptions);
    return Response.json({ success: true });
}