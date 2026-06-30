const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

console.log("Iniciando o Robô do WhatsApp...");

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

client.on("qr", (qr) => {
  console.log("\n=============================================");
  console.log("   ESCANEIE O QR CODE ABAIXO NO SEU WHATSAPP");
  console.log("=============================================\n");
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("\n✅ WhatsApp Bot Conectado com Sucesso!");
  console.log(
    "O robô já está vigiando o banco de dados por novos agendamentos...",
  );

  setInterval(checkPendingNotifications, 10000);
});

async function checkPendingNotifications() {
  try {
    const pending = await prisma.notification.findMany({
      where: { status: "PENDING" },
    });

    for (const notif of pending) {
      console.log(`\nProcessando mensagem para: ${notif.phone}`);

      let cleanPhone = notif.phone.replace(/\D/g, "");

      if (cleanPhone.length === 10 || cleanPhone.length === 11) {
        cleanPhone = `55${cleanPhone}`;
      }
      const chatId = `${cleanPhone}@c.us`;

      try {
        await client.sendMessage(chatId, notif.message);

        await prisma.notification.update({
          where: { id: notif.id },
          data: { status: "SENT" },
        });
        console.log(`✅ Mensagem enviada com sucesso para ${notif.phone}`);
      } catch (err) {
        console.error(`❌ Erro ao enviar para ${notif.phone}:`, err.message);
        // Atualiza como falha para não ficar tentando infinitamente (ou pode gerenciar tentativas)
        await prisma.notification.update({
          where: { id: notif.id },
          data: { status: "FAILED" },
        });
      }
    }
  } catch (error) {
    console.error("Erro interno no robô:", error);
  }
}

client.initialize();
