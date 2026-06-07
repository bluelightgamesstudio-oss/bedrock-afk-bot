const bedrock = require('bedrock-protocol');

// إعدادات الاتصال بالسيرفر
const botOptions = {
  host: 'Bluelightmine.aternos.me', // الـ IP الخاص بسيرفرك
  port: 51069,                      // المنفذ (Port) الخاص بسيرفرك
  username: 'RealPlayer_AFK',       // اسم البوت داخل اللعبة
  offline: true,                    // مفعل للسيرفرات المكركة (Cracked)
  version: '1.21.130'               // تحديد الإصدار المطابق لسيرفرك
};

let client = null;
let retryTimer = null;

function startBot() {
  // إلغاء أي مؤقت قديم لمنع تداخل المحاولات
  if (retryTimer) clearTimeout(retryTimer);
  
  console.log(`[اتصال] جاري محاولة الاتصال بسيرفر البدروك إصدار ${botOptions.version}...`);

  try {
    client = bedrock.createClient(botOptions);

    // عند نجاح الدخول والرسوبن
    client.on('spawn', () => {
      console.log(`[+] دخل ${botOptions.username} إلى السيرفر بنجاح وهو الآن متصل ومستقر!`);
    });

    // في حال تم طرد البوت أثناء عمل السيرفر
    client.on('kick', (packet) => {
      console.log(`[-] تم طرد البوت من السيرفر. السبب: ${packet.reason}`);
      triggerRetry();
    });

    // في حال كان السيرفر مطفأ (RakTimeout) أو حدث أي خطأ شبكة
    client.on('error', (err) => {
      console.error(`[تنبيه] السيرفر غير متاح حالياً أو مطفأ (${err.message})`);
      triggerRetry();
    });

    // في حال انقطع الاتصال لأي سبب مفاجئ
    client.on('close', () => {
      console.log(`[!] انقطع الاتصال بالسيرفر بشكل مفاجئ.`);
      triggerRetry();
    });

  } catch (error) {
    console.error(`[خطأ غير متوقع]:`, error);
    triggerRetry();
  }
}

function triggerRetry() {
  // إغلاق العميل الحالي بأمان لتنظيف الذاكرة
  if (client) {
    try { client.close(); } catch (e) {}
    client = null;
  }

  // إذا كان هناك مؤقت يعمل بالفعل، لا ننشئ واحداً آخر لتفادي التكرار عشوائياً
  if (retryTimer) return;

  console.log(`⏳ سيقوم البوت بإعادة محاولة الاتصال تلقائياً بعد 30 ثانية...`);
  retryTimer = setTimeout(() => {
    retryTimer = null; // تصفير المؤقت للتحضير للمحاولة القادمة
    startBot();
  }, 30000); // 30000 مللي ثانية = 30 ثانية
}

// تشغيل البوت لأول مرة
startBot();
