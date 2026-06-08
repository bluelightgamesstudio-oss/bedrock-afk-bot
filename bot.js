const mineflayer = require('mineflayer');
const bedrock = require('mineflayer-bedrock');

const bot = mineflayer.createBot({
  host: 'Bluelightmine.aternos.me',
  port: 51069,
  username: 'RealPlayer_AFK',
  version: '1.26.20', // المكتبة هنا تتعامل مع النسخة بمرونة أكبر
  plugins: [bedrock.plugin] 
});

bot.on('spawn', () => {
  console.log('البوت دخل العالم بنجاح عبر بروتوكول RakNet!');
});

bot.on('error', (err) => {
  console.error('خطأ في الاتصال:', err);
});

bot.on('end', () => {
  console.log('انقطع الاتصال، جاري إعادة المحاولة...');
  setTimeout(() => process.exit(0), 1000); // إعادة تشغيل السكربت بالكامل لضمان نظافة الذاكرة
});
