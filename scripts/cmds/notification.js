
const { getStreamsFromAttachment } = global.utils;
const fonts = require('../../func/fonts.js');

module.exports = {
	config: {
		name: "notification",
		aliases: ["notify", "noti", "announce"],
		version: "2.0",
		author: "Aryan Chauhan",
		countDown: 5,
		role: 2,
		description: {
			vi: "Gửi thông báo từ admin đến all box với font đẹp",
			en: "Send beautiful notification from admin to all groups with stylish fonts"
		},
		category: "owner",
		guide: {
			en: "{pn} <message> - Send notification to all groups\n{pn} style <message> - Send with different font styles\n{pn} urgent <message> - Send urgent notification\n{pn} preview <message> - Preview notification formatting"
		},
		envConfig: {
			delayPerGroup: 250
		}
	},

	langs: {
		vi: {
			missingMessage: "Vui lòng nhập tin nhắn bạn muốn gửi đến tất cả các nhóm",
			notification: "📢 THÔNG BÁO CHÍNH THỨC TỪ ADMIN BOT 📢",
			sendingNotification: "🚀 Bắt đầu gửi thông báo từ admin bot đến %1 nhóm chat",
			sentNotification: "✅ Đã gửi thông báo đến %1 nhóm thành công",
			errorSendingNotification: "❌ Có lỗi xảy ra khi gửi đến %1 nhóm:\n%2",
			previewNotification: "📋 Xem trước thông báo:",
			urgentNotification: "🚨 THÔNG BÁO KHẨN CẤP TỪ ADMIN BOT 🚨"
		},
		en: {
			missingMessage: "Please enter the message you want to send to all groups",
			notification: "📢| NOTIFICATION",
			sendingNotification: "🚀 Start sending notification from admin bot to %1 chat groups",
			sentNotification: "✅ Sent notification to %1 groups successfully",
			errorSendingNotification: "❌ An error occurred while sending to %1 groups:\n%2",
			previewNotification: "📋 Notification Preview:",
			urgentNotification: "🚨 URGENT NOTIFICATION FROM ADMIN BOT 🚨"
		}
	},

	onStart: async function ({ message, api, event, args, commandName, envCommands, threadsData, getLang, usersData }) {
		const { delayPerGroup } = envCommands[commandName];
		const action = args[0]?.toLowerCase();
		
		const adminInfo = await usersData.get(event.senderID);
		const adminName = adminInfo.name || "Admin";

		if (action === "preview") {
			if (!args[1]) return message.reply(getLang("missingMessage"));
			
			const previewMessage = args.slice(1).join(" ");
			const formattedPreview = formatNotification(previewMessage, adminName, false, getLang);
			
			return message.reply(`${getLang("previewNotification")}\n\n${formattedPreview}`);
		}

		if (action === "style") {
			if (!args[1]) return message.reply(getLang("missingMessage"));
			
			const styleMessage = args.slice(1).join(" ");
			const styledPreview = `${fonts.bold("📢 NOTIFICATION STYLES 📢")}\n\n` +
				`${fonts.bold("Bold:")} ${fonts.bold(styleMessage)}\n` +
				`${fonts.sansSerif("Sans Serif:")} ${fonts.sansSerif(styleMessage)}\n` +
				`${fonts.italic("Italic:")} ${fonts.italic(styleMessage)}\n` +
				`${fonts.fancy("Fancy:")} ${fonts.fancy(styleMessage)}\n` +
				`${fonts.monospace("Monospace:")} ${fonts.monospace(styleMessage)}\n` +
				`${fonts.outline("Outline:")} ${fonts.outline(styleMessage)}`;
			
			return message.reply(styledPreview);
		}

		const isUrgent = action === "urgent";
		const messageContent = isUrgent ? args.slice(1).join(" ") : args.join(" ");
		
		if (!messageContent) return message.reply(getLang("missingMessage"));

		const formSend = {
			body: formatNotification(messageContent, adminName, isUrgent, getLang),
			attachment: await getStreamsFromAttachment(
				[
					...event.attachments,
					...(event.messageReply?.attachments || [])
				].filter(item => ["photo", "png", "animated_image", "video", "audio"].includes(item.type))
			)
		};

		const allThreadID = (await threadsData.getAll()).filter(t => t.isGroup && t.members.find(m => m.userID == api.getCurrentUserID())?.inGroup);
		
		const notificationStats = {
			totalGroups: allThreadID.length,
			adminName: adminName,
			timestamp: new Date().toLocaleString(),
			isUrgent: isUrgent
		};

		message.reply(
			`${fonts.bold("📊 NOTIFICATION")}\n\n` +
			`${fonts.sansSerif("👤 Admin:")} ${fonts.bold(adminName)}\n` +
			`${fonts.sansSerif("📱 Target Groups:")} ${fonts.bold(allThreadID.length.toString())}\n` +
			`${fonts.sansSerif("🕐 Time:")} ${fonts.monospace(notificationStats.timestamp)}\n` +
			`${fonts.sansSerif("🚨 Priority:")} ${fonts.bold(isUrgent ? "URGENT" : "NORMAL")}\n\n` +
			`${fonts.italic("⏳ Sending notifications...")}`
		);

		let sendSucces = 0;
		const sendError = [];
		const wattingSend = [];

		for (const thread of allThreadID) {
			const tid = thread.threadID;
			try {
				wattingSend.push({
					threadID: tid,
					pending: api.sendMessage(formSend, tid)
				});
				await new Promise(resolve => setTimeout(resolve, delayPerGroup));
			}
			catch (e) {
				sendError.push(tid);
			}
		}

		for (const sended of wattingSend) {
			try {
				await sended.pending;
				sendSucces++;
			}
			catch (e) {
				const { errorDescription } = e;
				if (!sendError.some(item => item.errorDescription == errorDescription))
					sendError.push({
						threadIDs: [sended.threadID],
						errorDescription
					});
				else
					sendError.find(item => item.errorDescription == errorDescription).threadIDs.push(sended.threadID);
			}
		}

		let msg = `${fonts.bold("📊 NOTIFICATION")}\n\n`;
		
		if (sendSucces > 0) {
			msg += `${fonts.sansSerif("✅ Successfully sent to:")} ${fonts.bold(sendSucces.toString())} ${fonts.sansSerif("groups")}\n`;
		}
		
		if (sendError.length > 0) {
			const totalErrors = sendError.reduce((a, b) => a + (b.threadIDs?.length || 1), 0);
			msg += `${fonts.sansSerif("❌ Failed to send to:")} ${fonts.bold(totalErrors.toString())} ${fonts.sansSerif("groups")}\n`;
			msg += `${fonts.italic("Error details saved to logs")}`;
		}

		msg += `\n\n${fonts.fancy("🎉 Notification broadcast completed!")}`;
		
		message.reply(msg);
	}
};

function formatNotification(messageContent, adminName, isUrgent, getLang) {
	const timestamp = new Date().toLocaleString();
	const divider = "━".repeat(10);
	
	let header = isUrgent ? getLang("urgentNotification") : getLang("notification");
	
	const formattedMessage = 
		`${fonts.bold(header)}\n` +
		`${divider}\n\n` +
		`${fonts.bold("👤 From Admin:")} ${fonts.fancy(adminName)}\n` +
		`${fonts.bold("🕐 Time:")} ${fonts.monospace(timestamp)}\n` +
		`${fonts.bold("🎯 Priority:")} ${fonts.sansSerif(isUrgent ? "🚨 URGENT" : "📢 NORMAL")}\n\n` +
		`${divider}\n` +
		`${fonts.sansSerif("📝 Message:")}\n\n` +
		`${fonts.sansSerif(messageContent)}\n\n` +
		`${divider}\n` +
		`${fonts.italic("⚠️ This is an official bot notification")}\n` +
		`${fonts.italic("💬 Do not reply to this message")}\n` +
		`${fonts.monospace("🤖 Powered by GoatBot System")}`;

	return formattedMessage;
													}
