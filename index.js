const { Client, GatewayIntentBits, REST, Routes } = require("discord.js");
const cron = require("node-cron");

// Lista dos teus "dias"
const dias = [
    "Hearthspan(spring)",
    "Rootwatch(spring)",
    "Seedspan(summer)",
    "Bloomfall(summer)",
    "Scythespan(autumn)",
    "Ardfall(autumn)",
    "Saltspan(winter)",
    "Rimefall(winter)"
];

// Começa em Bloomfall (índice 3)
let diaAtual = 3;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// IDs
const canalId = "1546145935183187978";
const mensagemId = "1548736343142703107";
const token = process.env.TOKEN;
client.login(token);
const clientId = "1548734359299817564"; // este é o ID da aplicação

// Comandos slash
const commands = [
    {
        name: "day",
        description: "today"
    },
    {
        name: "next",
        description: "next day"
    }
];

// Registar comandos
const rest = new REST({ version: "10" }).setToken(token);

(async () => {
    try {
        console.log("A atualizar comandos slash...");
        await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands }
        );
        console.log("Comandos slash registados!");
    } catch (err) {
        console.error(err);
    }
})();

client.on("ready", () => {
    console.log(`Bot ligado como ${client.user.tag}`);

    // Atualiza todos os dias às 01:00 da manhã
    cron.schedule("0 1 * * *", async () => {
        try {
            const canal = await client.channels.fetch(canalId);
            const msg = await canal.messages.fetch(mensagemId);

            await msg.edit(` **${dias[diaAtual]}**`);
            console.log("uptated to", dias[diaAtual]);

            diaAtual = (diaAtual + 1) % dias.length;

        } catch (err) {
            console.error("error", err);
        }
    });
});

// Responder aos comandos
client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === "day") {
        await interaction.reply(`**${dias[diaAtual]}**`);
    }

    if (interaction.commandName === "next") {
        diaAtual = (diaAtual + 1) % dias.length;
        await interaction.reply(`**${dias[diaAtual]}**`);
    }
});

client.login(token);
