module.exports = {
    name: "interactionCreate",
    async execute(interaction) {
        // التأكد من أن التفاعل هو أمر سلاش
        if (!interaction.isChatInputCommand()) return;

        if (interaction.commandName === "ping") {
            try {
                // الرد الفوري المباشر لمنع خطأ عدم الاستجابة
                await interaction.reply({
                    content: "🏓 **Pong!** البوت يعمل ونشط جاهز للحصول على شارة المطور!",
                    ephemeral: false
                });
            } catch (error) {
                console.error("خطأ في الرد على الأمر:", error);
            }
        }
    }
};