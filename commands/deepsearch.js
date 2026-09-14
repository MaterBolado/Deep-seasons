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

        // ⭐ Defer IMEDIATO — antes de tudo
        await interaction.deferReply();

        const termo = interaction.options.getString("what");

        try {
            const searchUrl = `https://deepwoken.fandom.com/api.php?action=query&list=search&srsearch=${encodeURIComponent(termo)}&format=json`;
            const res = await fetch(searchUrl);
            const data = await res.json();

            const results = (data.query && data.query.search) ? data.query.search.slice(0, 10) : [];

            if (!results.length) {
                return interaction.editReply("❌ No results found on the Deepwoken Wiki.");
            }

            // Buscar títulos reais em paralelo
            const pageFetches = results.map(r => {
                const pageInfoUrl = `https://deepwoken.fandom.com/api.php?action=query&pageids=${r.pageid}&format=json`;
                return fetch(pageInfoUrl)
                    .then(pr => pr.json())
                    .then(pageData => {
                        const page = pageData.query.pages[r.pageid];
                        const realTitle = page && page.title ? page.title : r.title;
                        // Substitui espaços por underscore e codifica para URL
                        const pagePath = encodeURIComponent(realTitle.replace(/ /g, "_"));
                        const pageUrl = `https://deepwoken.fandom.com/wiki/${pagePath}`;
                        return { title: realTitle, url: pageUrl };
                    })
                    .catch(() => ({ title: r.title, url: `https://deepwoken.fandom.com/wiki/${encodeURIComponent(r.title.replace(/ /g, "_"))}` }));
            });

            const pages = await Promise.all(pageFetches);

            // Monta descrição com links Markdown (funciona em Embed descriptions)
            let description = pages.map(p => `**[${p.title}](${p.url})**`).join("\n");

            const embed = new EmbedBuilder()
                .setTitle(`🔎 Results for: ${termo}`)
                .setDescription(description)
                .setColor("#4B8BBE")
                .setFooter({ text: "Copie um título ou clique para abrir a página" });

            await interaction.editReply({ embeds: [embed] });

        } catch (err) {
            console.error(err);
            await interaction.editReply("⚠️ Error while searching the wiki.");
        }
    }
};
