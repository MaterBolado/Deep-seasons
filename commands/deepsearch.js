const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("deepsearch")
        .setDescription("Search the Deepwoken Wiki")
        .addStringOption(option =>
            option.setName("what")
                .setDescription("What do you want to search for?")
                .setRequired(true)
        ),

    async execute(interaction) {
        const termo = interaction.options.getString("what"); // FIXED
        await interaction.deferReply();

        try {
            const searchUrl = `https://deepwoken.fandom.com/api.php?action=query&list=search&srsearch=${encodeURIComponent(termo)}&format=json`;
            const res = await fetch(searchUrl);
            const data = await res.json();

            const results = data.query.search.slice(0, 10);

            if (!results.length) {
                return interaction.editReply("❌ No results found on the Deepwoken Wiki.");
            }

            let description = "";
            results.forEach((r, i) => {
                description += `**${i + 1}. ${r.title}**\n`;
            });

            const embed = new EmbedBuilder()
                .setTitle(`🔎 Results for: ${termo}`)
                .setDescription(description)
                .setColor("#4B8BBE")
                .setFooter({ text: "Use /deepinfo <page> to see more details." });

            await interaction.editReply({ embeds: [embed] });

        } catch (err) {
            console.error(err);
            await interaction.editReply("⚠️ Error while searching the wiki.");
        }
    }
};
