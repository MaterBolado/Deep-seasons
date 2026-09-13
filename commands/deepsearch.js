const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fetch = global.fetch;

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
        const termo = interaction.options.getString("what");
        await interaction.deferReply();

        try {
            // First search
            const searchUrl = `https://deepwoken.fandom.com/api.php?action=query&list=search&srsearch=${encodeURIComponent(termo)}&format=json`;
            const res = await fetch(searchUrl);
            const data = await res.json();

            const results = data.query.search.slice(0, 10);

            if (!results.length) {
                return interaction.editReply("❌ No results found on the Deepwoken Wiki.");
            }

            let description = "";

            // For each result, fetch the REAL page title using pageid
            for (const r of results) {
                const pageInfoUrl = `https://deepwoken.fandom.com/api.php?action=query&pageids=${r.pageid}&format=json`;
                const pageRes = await fetch(pageInfoUrl);
                const pageData = await pageRes.json();

                const realTitle = pageData.query.pages[r.pageid].title;

                description += `**${realTitle}**\n`;
            }

            const embed = new EmbedBuilder()
                .setTitle(`🔎 Results for: ${termo}`)
                .setDescription(description)
                .setColor("#4B8BBE")
                .setFooter({ text: "Copy a title and use /deepinfo <page>" });

            await interaction.editReply({ embeds: [embed] });

        } catch (err) {
            console.error(err);
            await interaction.editReply("⚠️ Error while searching the wiki.");
        }
    }
};
