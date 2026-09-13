const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fetch = global.fetch;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("deepinfo")
        .setDescription("Show details about a Deepwoken Wiki page")
        .addStringOption(option =>
            option.setName("page") // FIXED
                .setDescription("Exact page name (example: The Ferryman)")
                .setRequired(true)
        ),

    async execute(interaction) {
        const pageName = interaction.options.getString("page"); // FIXED
        await interaction.deferReply();

        try {
            const pageUrl = `https://deepwoken.fandom.com/api.php?action=query&prop=extracts|pageimages&exintro&explaintext&pithumbsize=600&titles=${encodeURIComponent(pageName)}&format=json`;
            const res = await fetch(pageUrl);
            const data = await res.json();

            const page = data.query.pages[Object.keys(data.query.pages)[0]];

            if (!page.extract) {
                return interaction.editReply("❌ Page not found on the Deepwoken Wiki.");
            }

            const link = `https://deepwoken.fandom.com/wiki/${encodeURIComponent(pageName.replace(/ /g, "_"))}`;
            const image = page.thumbnail ? page.thumbnail.source : null;

            const embed = new EmbedBuilder()
                .setTitle(page.title)
                .setDescription(page.extract.substring(0, 2000))
                .setURL(link)
                .setColor("#8A2BE2")
                .setFooter({ text: "Deepwoken Wiki" });

            if (image) embed.setThumbnail(image);

            await interaction.editReply({ embeds: [embed] });

        } catch (err) {
            console.error(err);
            await interaction.editReply("⚠️ Error while retrieving page information.");
        }
    }
};
