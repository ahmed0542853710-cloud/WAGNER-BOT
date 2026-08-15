const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "guildMemberAdd",
    async execute(member) {
        // ID روم الترحيب الخاص بسيرفرك
        const welcomeChannelId = "1395447275982946374"; 
        
        try {
            const channel = member.guild.channels.cache.get(welcomeChannelId) 
                         || await member.guild.channels.fetch(welcomeChannelId).catch(() => null);

            if (!channel) return console.log("❌ لم يتم العثور على روم الترحيب!");

            // تصميم البطاقة الفخمة
            const welcomeEmbed = new EmbedBuilder()
                .setColor("2b2d31")
                .setAuthor({ 
                    name: `WELCOME TO ${member.guild.name.toUpperCase()}`, 
                    iconURL: member.guild.iconURL({ dynamic: true }) 
                })
                .setTitle(`👑 أهلاً بك في العائلة!`)
                .setDescription(
                    `مرحباً بك ${member} 👋\n\n` +
                    `> 🌟 **نورت السيرفر وانضممت إلى:** **${member.guild.name}**\n` +
                    `> 📜 **نتمنى لك قضاء وقت ممتع والمشاركة معنا!**\n` +
                    `> 💎 **أنت العضو رقم:** \`#${member.guild.memberCount}\``
                )
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }))
                .setImage("https://cdn.discordapp.com/attachments/1395743517875372062/1534945621327478865/Gemini_Generated_Image_fueabcfueabcfuea.png?ex=6a812dc2&is=6a7fdc42&hm=14a49dd797d897a0efb9decfdb0bf04e4930910bf89b38322d4d1460693a7367&")
                .setFooter({ 
                    text: `${member.user.tag} • WAGNER SYSTEM`, 
                    iconURL: member.user.displayAvatarURL({ dynamic: true }) 
                })
                .setTimestamp();

            await channel.send({ 
                content: `👋 مرحباً بك ${member}!`, 
                embeds: [welcomeEmbed] 
            });
            console.log(`✅ تم الترحيب بالعضو: ${member.user.tag}`);
        } catch (err) {
            console.error("❌ خطأ أثناء إرسال الترحيب:", err);
        }
    }
};