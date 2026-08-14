const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
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
        let member = message.mentions.members.first();
        if (!member) return message.reply("❓ Please mention a user.");

        let duration = 1 * 60 * 1000; // 1 Minute
        member.timeout(duration, "Rule violation")
            .then(() => message.reply(`🤐 **${member.user.tag}** has been timed out for 1m.`))
            .catch(() => message.reply("❌ Failed to apply timeout."));
    }
});

const express = require("express");
const app = express();
app.get("/", (req, res) => res.send("Bot is alive!"));
app.listen(3000, () => console.log("Server ready on port 3000"));



client.login(token);