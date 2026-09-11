const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, REST, Routes, SlashCommandBuilder } = require("discord.js");
const warnings = new Map(); // خريطة لحفظ تحذيرات الأعضاء
const { prefix } = require("./config.json");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ]
});

const { readdirSync } = require('node:fs');
readdirSync("./handlers").forEach(handler => {
    require(`./handlers/${handler}`)(client);
});

// ==================== أوامر الـ Prefix Messages ====================
client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

   // SR Command
    if (message.content === prefix + "sr") {
        const guildIcon = message.guild.iconURL() || null;
        const authorAvatar = message.author.displayAvatarURL() || null;
        const botAvatar = client.user.displayAvatarURL() || null;

        let embed = new EmbedBuilder()
            .setAuthor({ name: "WAGNER SERVER", iconURL: guildIcon })
            .setTitle("Welcome to WAGNER SERVER!")
            .setDescription("Glad to have you here! Please read the rules and enjoy your stay.")
            .addFields(
                { name: "Rules", value: "1. Be respectful.\n2. No spamming." },
                { name: "Roles", value: "Members", inline: true },
                { name: "Channels", value: "General, Announcements", inline: true }
            )
            .setColor(0x0099ff)
            .setThumbnail(guildIcon)
            .setImage(botAvatar)
            .setFooter({ text: message.author.tag, iconURL: authorAvatar })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
// User Info Command (!u / !U / !user)
    if (message.content.startsWith(prefix + "u") || message.content.startsWith(prefix + "U") || message.content.startsWith(prefix + "user")) {
        const member = message.mentions.members.first() || message.member;
        const displayName = member.nickname || member.user.username;

        const userEmbed = new EmbedBuilder()
            .setAuthor({ 
                name: displayName, 
                iconURL: member.user.displayAvatarURL({ dynamic: true }) 
            })
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }))
            .setColor("#ff4d8d")
            .addFields(
                { 
                    name: "تاريخ الدخول للسيرفر :", 
                    value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, 
                    inline: true 
                },
                { 
                    name: "تاريخ الدخول للديسكورد :", 
                    value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, 
                    inline: true 
                }
            )
            .setFooter({ 
                text: member.user.tag, 
                iconURL: member.user.displayAvatarURL({ dynamic: true }) 
            });

        message.reply({ embeds: [userEmbed] });
    }
// ==================== نظام حظر الكلمات البذيئة التلقائي ====================
    
    // 1️⃣ قائمة الكلمات البذيئة الممنوعة (يمكنك إضافة أي كلمة بين التنصيص " ")
    const badWords = [
        // عربي
        "سبسب", "قحبة", "كس", "طيز", "زب", "شرموط", "شرموطة", "عرص", "منيوك", "قواد",
         "يا ابن الكلب", "ابن الكلب", "ابن الحرام", "يا ابن الحرام", "كلب", "حيوان",
        // فرانكو / English
        "fuck", "shit", "bitch", "ass", "dick", "pussy", "bastard", "cunt", "motherfucker",
        "kos", "tez", "zbb", "7ywan", "6yz"
    ];

    // تحويل الرسالة لحروف صغيرة وتفقد الكلمات
    const messageContent = message.content.toLowerCase();
    const containsBadWord = badWords.some(word => messageContent.includes(word));

    if (containsBadWord) {
        // تجاهل الإداريين (أصحاب صلاحية KickMembers) حتى لا يتم إعطاؤهم تايم أوت بالخطأ
        if (!message.member.permissions.has("KickMembers")) {
            
            // 1️⃣ حذف الرسالة البذيئة فوراً
            message.delete().catch(() => {});

            // 2️⃣ إعطاء تايم أوت للعضو لمدة 10 دقائق (600,000 مللي ثانية)
            const TIMEOUT_DURATION = 10 * 60 * 1000;
            
            message.member.timeout(TIMEOUT_DURATION, "استخدام ألفاظ غير لائقة (Auto Bad Words)")
                .then(() => {
                    // 3️⃣ تنبيه العضو المخالف في الخاص
                    message.author.send(`⚠️ تم إعطاؤك **Timeout** لمدة 10 دقائق في سيرفر **${message.guild.name}** بسبب استخدام ألفاظ غير لائقة.`).catch(() => {});

                    // 4️⃣ إرسال تقرير (Log) إلى روم الأدمنية
                    // ⚠️ استبدل ID الروم بـ ID روم اللوج الخاصة بالإدارة
                    const logChannel = message.guild.channels.cache.get("1542299634687279235");

                    if (logChannel) {
                        const badWordEmbed = new EmbedBuilder()
                            .setColor("#ff0033")
                            .setTitle("🚫 نظام الحماية: كشف ألفاظ بذيئة (Auto-Mod)")
                            .addFields(
                                { name: "العضو المخالف:", value: `${message.author.tag} (${message.author.id})`, inline: false },
                                { name: "الروم:", value: `<#${message.channel.id}>`, inline: true },
                                { name: "العقوبة:", value: "Timeout (10 دقائق)", inline: true },
                                { name: "محتوى الرسالة المحذوفة:", value: `\`\`\`${message.content}\`\`\``, inline: false }
                            )
                            .setTimestamp();

                        logChannel.send({ embeds: [badWordEmbed] });
                    }
                })
                .catch(err => console.error("خطأ في تطبيق التايم أوت:", err));

            return; // إيقاف قراءة الرسالة حتى لا ينفذ البوت باقي الأوامر
        }
    }
    // =========================================================================
// ==================== نظام منع الروابط (مع السماح بالـ GIF) ====================
    // 1️⃣ التعرف على الروابط في الرسالة
    const hasLink = /(https?:\/\/|discord\.gg\/|discord\.com\/invite\/)/i.test(message.content);
    
    // 2️⃣ التأكد هل الرابط عبارة عن GIF؟
    const isGif = /(tenor\.com|giphy\.com|\.gif)/i.test(message.content);

    // إذا كانت الرسالة تحتوي على رابط وليس GIF، والمستخدم ليس إدارياً
    if (hasLink && !isGif && !message.member.permissions.has("ManageMessages")) {
        // حذف الرسالة فوراً
        message.delete().catch(() => {});

        // إرسال تحذير مؤقت للعضو يختفي بعد 5 ثوانٍ
        return message.channel.send(`⚠️ عذراً <@${message.author.id}>،يمنع نشر الروابط هنا !`)
            .then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    }
    // ==============================================================================
    // Kick Command
    if (message.content.startsWith(prefix + "kick")) {
        if (!message.member.permissions.has("KickMembers")) return message.reply("❌ Missing permissions!");
        let member = message.mentions.members.first();
        if (!member) return message.reply("❓ Please mention a user.");
        if (!member.kickable) return message.reply("⚠️ Cannot kick this user.");

        member.kick("طرُد بواسطة الأمر")
            .then(() => message.reply(`✅ **${member.user.username}** has been kicked.`))
            .catch(() => message.reply("❌ Failed to kick user."));
    }

    // Ban Command
    if (message.content.startsWith(prefix + "ban")) {
        if (!message.member.permissions.has("BanMembers")) return message.reply("❌ Missing permissions!");
        let member = message.mentions.members.first();
        if (!member) return message.reply("❓ Please mention a user.");
        if (!member.bannable) return message.reply("⚠️ Cannot ban this user.");

        member.ban({ reason: "حظر بواسطة الأمر" })
            .then(() => message.reply(`⛔ **${member.user.username}** has been banned.`))
            .catch(() => message.reply("❌ Failed to ban user."));
    }

   // Timeout Command
    if (message.content.startsWith(prefix + "tm")) {
        if (!message.member.permissions.has("MuteMembers")) return message.reply("❌ Missing permissions!");

        const args = message.content.trim().split(/\s+/);
        let member = message.mentions.members.first();
        if (!member) return message.reply("❓ Please mention a user.");

        // البحث عن الرقم في الكلمات المكتوبة حتى لو اختلف ترتيبها
        let minutes = parseInt(args.find(arg => !isNaN(arg) && !arg.includes("<@")));
        if (!minutes || isNaN(minutes)) return message.reply("❓ Please specify minutes, e.g., `!tm @user 10`");

        let duration = minutes * 60 * 1000;

        member.timeout(duration, "Rule violation")
            .then(() => message.reply(`⏰ **${member.user.username}** has been timed out for **${minutes}m**.`))
            .catch(() => message.reply("❌ Failed to apply timeout. Check bot permissions."));
    }

    // Clear Command
    if (message.content.startsWith(prefix + "clear")) {
        if (!message.member.permissions.has("ManageMessages")) {
            return message.reply("❌ ليس لديك صلاحية مسح الرسائل!");
        }

        const args = message.content.trim().split(/\s+/);
        let amount = parseInt(args[1]);

        if (!amount || isNaN(amount) || amount < 1 || amount > 100) {
            return message.reply("❓ يرجى تحديد عدد الرسائل المراد مسحها (من 1 إلى 100)، مثال: `!clear 10`");
        }

        message.channel.bulkDelete(amount, true)
            .then(deleted => {
                message.channel.send(`🧹 تم مسح **${deleted.size}** رسالة بنجاح.`)
                    .then(msg => {
                        setTimeout(() => msg.delete().catch(() => {}), 3000);
                    });
            })
            .catch(err => {
                console.error(err);
                message.reply("❌ حدث خطأ أثناء مسح الرسائل. (تنبيه: لا يمكن مسح الرسائل التي مر عليها أكثر من 14 يوماً)");
            });
    }

    // Lock Command
    if (message.content === prefix + "قفل") {
        if (!message.member.permissions.has("ManageChannels")) {
            return message.reply("❌ No permission!");
        }
        await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: false });
        await message.channel.send("🔒 Channel locked.");
    }

    // Unlock Command
    if (message.content === prefix + "فتح") {
        if (!message.member.permissions.has("ManageChannels")) {
            return message.reply("❌ No permission!");
        }
        await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: true });
        await message.channel.send("🔓 Channel unlocked.");
    }

    // Ticket Panel Command
    if (message.content === prefix + "ticket") {
        if (!message.member.permissions.has("Administrator")) {
            return message.reply("❌ No permission!");
        }

        const ticketEmbed = new EmbedBuilder()
            .setColor("#2b2d31")
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
});

// ==================== التفاعلات (أزرار التذاكر + أمر السلاش /ping) ====================
client.on("interactionCreate", async (interaction) => {
    try {
        // 1️⃣ الرد على أمر السلاش /ping
        if (interaction.isChatInputCommand()) {
            if (interaction.commandName === "ping") {
                return await interaction.reply({
                    content: "🏓 **Pong!** البوت يعمل ونشط وجاهز للحصول على شارة المطور!",
                    ephemeral: false
                });
            }
        }

        // 2️⃣ التعامل مع أزرار التذاكر
        if (interaction.isButton()) {
            // فتح التذكرة
            if (interaction.customId === "create_ticket") {
                const channelName = `ticket-${interaction.user.username}`;
                const existingChannel = interaction.guild.channels.cache.find(c => c.name === channelName);

                if (existingChannel) {
                    return interaction.reply({ content: `❌ You already have a ticket: ${existingChannel}`, ephemeral: true });
                }

                const ticketChannel = await interaction.guild.channels.create({
                    name: channelName,
                    type: 0, // GuildText
                    permissionOverwrites: [
                        { 
                            id: interaction.guild.roles.everyone.id, 
                            deny: ["ViewChannel"] 
                        },
                        { 
                            id: interaction.user.id, 
                            allow: ["ViewChannel", "SendMessages", "AttachFiles"] 
                        }
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

                return interaction.reply({ content: `✅ Ticket created: ${ticketChannel}`, ephemeral: true });
            }

            // إغلاق التذكرة
            if (interaction.customId === "close_ticket") {
                await interaction.reply({ content: "🔒 Closing ticket in 3 seconds..." });
                setTimeout(() => {
                    if (interaction.channel) {
                        interaction.channel.delete().catch(() => {});
                    }
                }, 3000);
            }
        }
    } catch (error) {
        console.error("❌ خطأ في التفاعل:", error);
    }
});

// ==================== تغيير اسم الأعضاء الجدد تلقائياً ====================
client.on("guildMemberAdd", async (member) => {
    try {
        // إضافة علامة ! ومسافة قبل اسم العضو
        const newNickname = `! ${member.user.username}`;
        
        // تعديل لقب العضو
        await member.setNickname(newNickname);
        console.log(`🏷️ تم تغيير اسم ${member.user.tag} إلى ${newNickname}`);
    } catch (error) {
        console.error(`❌ لم يتمكن البوت من تغيير اسم ${member.user.tag}:`, error.message);
    }
});


// ==================== تسجيل اتصال ديسكورد ====================
client.once('ready', () => {
    console.log(`🟢 تم الاتصال بالديسكورد بنجاح باسم: ${client.user.tag}`);
});

// ======================= سيرفر Express لإبقاء البوت حيًا =======================
const express = require("express");
const app = express();
app.get("/", (req, res) => res.send("Bot is alive!"));
app.listen(process.env.PORT || 3000, () => console.log("Server ready on port 3000"));

// ==================== تسجيل الدخول ====================
let finalToken;
try {
    finalToken = process.env.TOKEN || require('./config.json').token;
} catch (e) {
    finalToken = process.env.TOKEN;
}

client.login(finalToken).catch(err => {
    console.error("🔴 خطأ أثناء تسجيل الدخول:", err.message);
});