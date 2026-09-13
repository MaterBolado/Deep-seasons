const fs = require("fs");
const path = require("path");
const { Client, Collection, GatewayIntentBits, REST, Routes } = require("discord.js");
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

// Criar cliente
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
const clientId = "1548734359299817564";

// ----------------------------
// 🔥 CARREGAR COMANDOS DA PASTA
// ----------------------------
client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

const slashCommandsJSON = [];

// Carregar comandos externos
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    client.commands.set(command.data.name, command);
    slashCommandsJSON.push(command.data.toJSON());
}

// ----------------------------
// 🔥 ADICIONAR /day E /next AO JSON
// ----------------------------
slashCommandsJSON.push(
    {
        name: "day",
        description: "Mostra o dia atual"
    },
    {
        name: "next",
        description: "Avança para o próximo dia"
    }
);

// ----------------------------
// 🔥 REGISTAR COMANDOS SLASH
// ----------------------------
const rest = new REST({ version: "10" }).setToken(token);

(async () => {
    try {
        console.log("A atualizar comandos slash...");
        await rest.put(
            Routes.applicationCommands(clientId),
            { body: slashCommandsJSON }
        );
        console.log("Comandos slash registados!");
    } catch (err) {
        console.error(err);
    }
})();

// ----------------------------
// 🔥 BOT PRONTO
// ----------------------------
client.on("ready", () => {
    console.log(`Bot ligado como ${client.user.tag}`);

    // Atualiza todos os dias às 01:00 da manhã
    cron.schedule("0 1 * * *", async () => {
        try {
            const canal = await client.channels.fetch(canalId);
            const msg = await canal.messages.fetch(mensagemId);

            await msg.edit(` **${dias[diaAtual]}**`);
            console.log("updated to", dias[diaAtual]);

            diaAtual = (diaAtual + 1) % dias.length;

        } catch (err) {
            console.error("error", err);
        }
    });
});

// ----------------------------
// 🔥 EXECUTAR COMANDOS
// ----------------------------
client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;

    // Comandos externos
    const command = client.commands.get(interaction.commandName);
    if (command) {
        try {
            return await command.execute(interaction);
        } catch (error) {
            console.error(error);
            return await interaction.reply({ content: "Erro ao executar o comando.", ephemeral: true });
        }
    }

    // Comandos internos
    if (interaction.commandName === "day") {
        return await interaction.reply(`**${dias[diaAtual]}**`);
    }

    if (interaction.commandName === "next") {
        diaAtual = (diaAtual + 1) % dias.length;
        return await interaction.reply(`**${dias[diaAtual]}**`);
    }
});

// Ligar bot
client.login(token);

