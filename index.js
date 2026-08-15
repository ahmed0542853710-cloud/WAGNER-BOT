const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { token, prefix } = require("./config.json");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

const { readdirSync } = require('node:fs');
readdirSync("./handlers").forEach(handler => {
    require(`./handlers/${handler}`)(client)
});

client.on("messageCreate", (message) => {
    if (message.author.bot) return;

    // SR Command
    if (message.content === prefix + "sr") {
        let embed = new EmbedBuilder()
            .setAuthor({ name: "WAGNER SERVER", iconURL: message.guild.iconURL() })
            .setTitle("Welcome to WAGNER SERVER!")
            .setDescription("Glad to have you here! Please read the rules and enjoy your stay.")
            .addFields(
                { name: "Rules", value: "1. Be respectful.\n2. No spamming." },
                { name: "Roles", value: "Members", inline: true },
                { name: "Channels", value: "General, Announcements", inline: true }
            )
            .setColor(0x0099ff)
            .setThumbnail(message.guild.iconURL())
            .setImage(client.user.avatarURL())
            .setFooter({ text: `${message.author.tag}`, iconURL: `${message.author.avatarURL()}` })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }

    // Kick Command
    if (message.content.startsWith(prefix + "kick")) {
        if (!message.member.permissions.has("KickMembers")) return message.reply("❌ Missing permissions!");
        let member = message.mentions.members.first();
        if (!member) return message.reply("❓ Please mention a user.");
        if (!member.kickable) return message.reply("⚠️ Cannot kick this user.");

        member.kick()
            .then(() => message.reply(`✅ **${member.user.tag}** has been kicked.`))
            .catch(() => message.reply("❌ Failed to kick user."));
    }

    // Ban Command
    if (message.content.startsWith(prefix + "ban")) {
        if (!message.member.permissions.has("BanMembers")) return message.reply("❌ Missing permissions!");
        let member = message.mentions.members.first();
        if (!member) return message.reply("❓ Please mention a user.");
        if (!member.bannable) return message.reply("⚠️ Cannot ban this user.");

        member.ban()
            .then(() => message.reply(`⛔ **${member.user.tag}** has been banned.`))
            .catch(() => message.reply("❌ Failed to ban user."));
    }

    // Timeout Command
    if (message.content.startsWith(prefix + "tm")) {
        if (!message.member.permissions.has("MuteMembers")) return message.reply("❌ Missing permissions!");
        
        const args = message.content.trim().split(/ +/);
        let member = message.mentions.members.first();
        if (!member) return message.reply("❓ Please mention a user.");

        // أخذ الرقم المكتوب بعد المنشن مباشرة
        let minutes = parseInt(args[2]);
        if (!minutes || isNaN(minutes)) return message.reply("❓ Please specify minutes, e.g., `tm @user 10`");

        let duration = minutes * 60 * 1000;
        
        member.timeout(duration, "Rule violation")
            .then(() => message.reply(`**${member.user.tag}** has been timed out for **${minutes}m**.`))
            .catch(() => message.reply("❌ Failed to apply timeout. Check bot permissions."));
    }
});
// Clear Command
    if (message.content.startsWith(prefix + "clear")) {
        // التحقق من صلاحيات العضو
        if (!message.member.permissions.has("ManageMessages")) {
            return message.reply("❌ ليس لديك صلاحية مسح الرسائل!");
        }

        const args = message.content.split(" ");
        let amount = parseInt(args[1]);

        if (!amount || isNaN(amount) || amount < 1 || amount > 100) {
            return message.reply("❓ يرجى تحديد عدد الرسائل المراد مسحها (من 1 إلى 100)، مثال: `!clear 10`");
        }

        // مسح الرسائل
        message.channel.bulkDelete(amount, true)
            .then(deleted => {
                message.channel.send(`🧹 تم مسح **${deleted.size}** رسالة بنجاح.`)
                    .then(msg => {
                        // حذف رسالة التأكيد بعد 3 ثواني
                        setTimeout(() => msg.delete().catch(() => {}), 3000);
                    });
            })
            .catch(err => {
                console.error(err);
                message.reply("❌ حدث خطأ أثناء مسح الرسائل. (تنبيه: لا يمكن مسح الرسائل التي مر عليها أكثر من 14 يوماً).");
            });
    }

// event الترحيب الفخم
client.on("guildMemberAdd", async (member) => {
    // ID روم الترحيب الخاصة بسيرفرك
    const welcomeChannelId = "1395447275982946374"; 
    const channel = member.guild.channels.cache.get(welcomeChannelId);

    if (!channel) return;

    // تصميم البطاقة الفخمة
    const welcomeEmbed = new EmbedBuilder()
        .setColor("2b2d31") // لون داكن فخم يناسب ثيم ديسكورد
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

    // إرسال الرسالة مع منشن للعضو
    channel.send({ 
        content: `👋 مرحباً بك ${member}!`, 
        embeds: [welcomeEmbed] 
    });
});

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

// Lock Command
    if (message.content === prefix + "قفل") {
        if (!message.member.permissions.has("ManageChannels")) {
            return message.reply("❌ No permission!");
        }
        message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: false });
        message.channel.send("🔒 Channel locked.");
    }

    // Unlock Command
    if (message.content === prefix + "فتح") {
        if (!message.member.permissions.has("ManageChannels")) {
            return message.reply("❌ No permission!");
        }
        message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: true });
        message.channel.send("🔓 Channel unlocked.");
    }

// Ticket Panel Command
if (message.content === prefix + "ticket") {
    if (!message.member.permissions.has("Administrator")) {
        return message.reply("❌ No permission!");
    }

    const ticketEmbed = new EmbedBuilder()
        .setColor("2b2d31")
        .setTitle("📩 Support Ticket")
        .setDescription("Click the button below to open a support ticket.");

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("create_ticket")
            .setLabel("Open Ticket 🎫")
            .setStyle(ButtonStyle.Primary)
    );

    message.channel.send({ embeds: [ticketEmbed], components: [row] });
}
}); // إغلاق حدث messageCreate

// Ticket Buttons Interaction (وضع هنا خارج messageCreate)
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) return;

    // فتح التكت
    if (interaction.customId === "create_ticket") {
        const channelName = `ticket-${interaction.user.username}`;
        
        const existingChannel = interaction.guild.channels.cache.find(c => c.name === channelName);
        if (existingChannel) {
            return interaction.reply({ content: `❌ You already have a ticket: ${existingChannel}`, ephemeral: true });
        }

        const ticketChannel = await interaction.guild.channels.create({
            name: channelName,
            type: 0,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: ["ViewChannel"] },
                { id: interaction.user.id, allow: ["ViewChannel", "SendMessages", "AttachFiles"] }
            ]
        });

        const closeRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("close_ticket")
                .setLabel("Close Ticket 🔒")
                .setStyle(ButtonStyle.Danger)
        );

        await ticketChannel.send({
            content: `Welcome ${interaction.user}! Staff will be with you shortly.`,
            components: [closeRow]
        });

        interaction.reply({ content: `✅ Ticket created: ${ticketChannel}`, ephemeral: true });
    }

    // إغلاق التكت
    if (interaction.customId === "close_ticket") {
        await interaction.reply("🔒 Closing ticket in 3 seconds...");
        setTimeout(() => interaction.channel.delete().catch(() => {}), 3000);
    }
});


const express = require("express");
const app = express();
app.get("/", (req, res) => res.send("Bot is alive!"));
app.listen(3000, () => console.log("Server ready on port 3000"));



client.login(process.env.TOKEN);