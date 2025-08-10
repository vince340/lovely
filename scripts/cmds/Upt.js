const { GoatWrapper } = require('fca-liane-utils');
const fs = require("fs-extra");
const axios = require("axios");
const moment = require("moment-timezone");
const os = require('os');
const util = require('util');
const { createCanvas } = require('canvas');
const GIFEncoder = require('gifencoder');

const manilaTime = moment.tz('Asia/Manila');
const spinner = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

module.exports = {
  config: {
    name: "upt",
    aliases: ["upt", "Uptimett", "u", "up"],
    version: "1.8",
    author: "Kylepogi",
    countDown: 5,
    role: 0,
    description: { en: "Bot ping monitor" },
    category: "𝗽𝗶𝗻𝗴 𝗥𝗼𝗯𝗼𝘁",
    guide: { en: "{pn}ping to show bot pings info" }
  },

  onStart: async function ({ message, api, event }) {
    const uptime = process.uptime();
    const formattedUptime = formatMilliseconds(uptime * 1000);
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const cpu = os.cpus()[0];
    const speed = cpu.speed;
    const totalMem = totalMemory / (1024 ** 3);
    const usedMem = usedMemory / (1024 ** 3);
    const currentTime = manilaTime.format('MMMM D, YYYY h:mm A');
    const botUptimeString = formattedUptime;
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
      ctx.fillText('lovely Bot Uptime:', 10, 30);
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
 🆙 lovely Bot Uptime 
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
