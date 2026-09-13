const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fetch = require("node-fetch");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("deepinfo")
        .setDescription("Mostra detalhes de uma página do Deepwoken Wiki")
        .addStringOption(option =>
            option.setName("pagina")
                .setDescription("Nome exato da página (ex: The Ferryman)")
                .setRequired(true)
        ),

    async execute(interaction) {
        const pagina = interaction.options.getString("pagina");
        await interaction.deferReply();

        try {
            const pageUrl = `https://deepwoken.fandom.com/api.php?action=query&prop=extracts|pageimages&exintro&explaintext&pithumbsize=600&titles=${encodeURIComponent(pagina)}&format=json`;
            const res = await fetch(pageUrl);
            const data = await res.json();

            const page = data.query.pages[Object.keys(data.query.pages)[0]];

            if (!page.extract) {
                return interaction.editReply("❌ Não encontrei essa página.");
            }

            const link = `https://deepwoken.fandom.com/wiki/${encodeURIComponent(pagina.replace(/ /g, "_"))}`;
            const image = page.thumbnail ? page.thumbnail.source : null;

            const embed = new EmbedBuilder()
                .setTitle(page.title)
                .setDescription(page.extract.substring(0, 2000)) // limite do Discord
                .setURL(link)
                .setColor("#8A2BE2")
                .setFooter({ text: "Deepwoken Wiki" });

            if (image) embed.setThumbnail(image);

            await interaction.editReply({ embeds: [embed] });

        } catch (err) {
            console.error(err);
            await interaction.editReply("⚠️ Erro ao obter informação da página.");
        }
    }
};
