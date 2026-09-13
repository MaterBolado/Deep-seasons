const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("deepsearch")
        .setDescription("Pesquisa no Deepwoken Wiki")
        .addStringOption(option =>
            option.setName("termo")
                .setDescription("O que queres pesquisar?")
                .setRequired(true)
        ),

    async execute(interaction) {
        const termo = interaction.options.getString("termo");
        await interaction.deferReply();

        try {
            const searchUrl = `https://deepwoken.fandom.com/api.php?action=query&list=search&srsearch=${encodeURIComponent(termo)}&format=json`;
            const res = await fetch(searchUrl);
            const data = await res.json();

            const results = data.query.search.slice(0, 10);

            if (!results.length) {
                return interaction.editReply("❌ Não encontrei nada no Deepwoken Wiki.");
            }

            let description = "";
            results.forEach((r, i) => {
                description += `**${i + 1}. ${r.title}**\n`;
            });

            const embed = new EmbedBuilder()
                .setTitle(`🔎 Resultados para: ${termo}`)
                .setDescription(description)
                .setColor("#4B8BBE")
                .setFooter({ text: "Usa /deepinfo <nome> para ver detalhes." });

            await interaction.editReply({ embeds: [embed] });

        } catch (err) {
            console.error(err);
            await interaction.editReply("⚠️ Erro ao pesquisar no Deepwoken Wiki.");
        }
    }
};
