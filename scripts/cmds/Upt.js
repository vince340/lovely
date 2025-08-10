module.exports = {
	config: {
		name: "upt",
		aliases: ["up"],
		role: 0,
		shortDescription: {
			en: "Show server uptime",
			tl: "Ipakita ang uptime ng server",
		},
		longDescription: {
			en: "Shows the duration for which the server has been running",
			tl: "Ipapakita ang tagal na gumagana ang server",
		},
		category: "goatBot",
		guide: {
			en: "{p}uptime",
			tl: "{p}uptime",
		},
	},

	onStart: async function ({ api, message, threadsData }) {
		const os = require("os");
		const uptime = os.uptime();

		const days = Math.floor(uptime / (3600 * 24));
		const hours = Math.floor((uptime % (3600 * 24)) / 3600);
		const mins = Math.floor((uptime % 3600) / 60);
		const seconds = Math.floor(uptime % 60);

		const system = `OS: ${os.platform()} ${os.release()}`;
		const cores = `Cores: ${os.cpus().length}`;
		const arch = `Architecture: ${os.arch()}`;
		const totalMemory = `Total Memory: ${Math.round(os.totalmem() / (1024 * 1024 * 1024))} GB`;
		const freeMemory = `Free Memory: ${Math.round(os.freemem() / (1024 * 1024 * 1024))} GB`;
		const uptimeString = `Uptime: ${days} days, ${hours} hours, ${mins} minutes, and ${seconds} seconds`;

		const response = `🕒 ${uptimeString}\n📡 ${system}\n🛡 ${cores}\n⚔ No AI Status\n📈 Total Users: ${threadsData.size}\n📉 Total Threads: ${threadsData.size}\n⚖ AI Usage: 0.0\n📊 RAM Usage: ${Math.round(process.memoryUsage().rss / (1024 * 1024))} MB\n💰 Total(RAM): ${Math.round(os.totalmem() / (1024 * 1024 * 1024))} GB\n💸 Current(RAM): ${Math.round(os.freemem() / (1024 * 1024 * 1024))} GB\n🛫 Ping: 15 ms\n🕰 Uptime(Seconds): ${Math.floor(process.uptime())}`;

		message.reply(response);
	},
};    const botUptimeString = formattedUptime;
    const serverUptimeString = formatUptime(os.uptime());

    const encoder = new GIFEncoder(400, 300);
    const gifPath = './uptime.gif';
    const stream = fs.createWriteStream(gifPath);

    encoder.createReadStream().pipe(stream);
    encoder.start();
    encoder.setRepeat(0);
    encoder.setDelay(1000);
    encoder.setQuality(10);

    const canvas = createCanvas(400, 300);
    const ctx = canvas.getContext('2d');

    const bgColors = ['#ffffff', '#ffcccc', '#ccffcc', '#ccccff'];
    const textColors = ['#000000', '#ff0000', '#00ff00', '#0000ff'];

    for (let i = 0; i < bgColors.length; i++) {
      ctx.fillStyle = bgColors[i];
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = textColors[i];
      ctx.font = '16px Arial';
      ctx.fillText('Kyles Bot Uptime:', 10, 30);
      ctx.fillText(botUptimeString, 10, 60);
      ctx.fillText('Server Uptime:', 10, 90);
      ctx.fillText(serverUptimeString, 10, 120);
      ctx.fillText('CPU Speed:', 10, 150);
      ctx.fillText(`${speed} MHz`, 10, 180);
      ctx.fillText('Memory Usage:', 10, 210);
      ctx.fillText(`Used: ${usedMem.toFixed(2)} GB / Total: ${totalMem.toFixed(2)} GB`, 10, 240);
      ctx.fillText('Current Time in Manila:', 10, 270);
      ctx.fillText(currentTime, 10, 290);

      encoder.addFrame(ctx);
    }

    encoder.finish();

    const start = Date.now();
    await axios.get('https://google.com');
    const BotPing = Date.now() - start;

    const loadingMessage = await message.reply(`[𓃵] ZEPH UPTIME:\n\n${spinner[0]} Checking Uptime...`);
    let currentFrame = 0;
    const intervalId = setInterval(async () => {
      currentFrame = (currentFrame + 1) % spinner.length;
      await api.editMessage(`[𓃵] ZEPH UPTIME:\n\n${spinner[currentFrame]} Checking Uptime...`, loadingMessage.messageID);
    }, 2000);

    await new Promise(resolve => setTimeout(resolve, 5000));
    clearInterval(intervalId);
    await api.unsendMessage(loadingMessage.messageID);

    return message.reply({
      body: `
╭────────────────╮
👑 Lovely Bot Uptime 
╰────────────────╯

╭────────────❏
│ 🤖 Robot Uptime: 『${formattedUptime}』
│📡 Bot Ping: ${BotPing}ms
│🖥️ Platform: ${os.platform()}
│🛡 OS: ${os.type()} ${os.release()}
│📐 Arch: ${os.arch()}
│💾 Memory: ${prettyBytes(process.memoryUsage().rss)}
│💽 RAM Usage: ${prettyBytes(usedMemory)} / Total ${prettyBytes(totalMemory)}                            
│🧠 CPU: ${cpu.model} (${os.cpus().length} cores)
│⚙ Server Uptime: ${serverUptimeString}                                                
╰────────────────❍`,
      attachment: fs.createReadStream(gifPath)
    }, event.threadID);
  }
};

const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });

function formatMilliseconds(ms) {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

function formatUptime(seconds) {
  const days = Math.floor(seconds / (24 * 60 * 60));
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((seconds % (60 * 60)) / 60);
  const secs = Math.floor(seconds % 60);
  return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

function prettyBytes(bytes) {
  if (bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
    }
