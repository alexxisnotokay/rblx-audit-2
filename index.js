require('dotenv').config();
const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');
const noblox = require('noblox.js');

const app = express();
app.get("/", (_, res) => res.send("Bot is running"));
app.listen(3000, () => console.log("Ping server active"));

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const GROUP_ID = parseInt(process.env.GROUP_ID, 10);
const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID;
let lastAuditId = null;

client.once('ready', async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  try {
    await noblox.setCookie(process.env.ROBLOX_COOKIE);
    console.log(`✅ Authenticated with Roblox`);
  } catch (err) {
    console.error("❌ Roblox auth failed:", err);
    return;
  }

  setInterval(async () => {
    try {
      const logs = await noblox.getAuditLog(GROUP_ID);
      if (!logs || logs.length === 0) return;

      const latest = logs[0];
      if (latest.id === lastAuditId) return;
      lastAuditId = latest.id;

      const channel = await client.channels.fetch(LOG_CHANNEL_ID);
      if (channel) {
        channel.send(
          `📢 **New Audit Log Entry**\n👤 **User**: ${latest.actor.name}\n🛠️ **Action**: ${latest.actionType}\n📝 **Description**: ${latest.description}`
        );
      }
    } catch (err) {
      console.error("❌ Error fetching audit log:", err);
    }
  }, 15000);
});

client.login(process.env.BOT_TOKEN);
