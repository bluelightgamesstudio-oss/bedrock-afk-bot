/**
 * Bot Name: RealPlayer_AFK
 * الهدف: خمول آمن (AFK) مع حماية ضد الـ bad_packet وتوافق مع السيرفر
 */

const bedrock = require('bedrock-protocol');

// إعدادات الاتصال (بدون فرض نسخة لتجنب التعارض)
const botOptions = {
  host: 'Bluelightmine.aternos.me', 
  port: 51069,                  
  username: 'RealPlayer_AFK',        
  offline: true,
  skipPing: false, // يسمح للبوت بطلب الإصدار من السيرفر مباشرة
};

let client = null;
let retryTimer = null;

function startBot() {
  if (retryTimer) clearTimeout(retryTimer);
  
  console.log(`[اتصال] جاري محاولة الدخول للسيرفر...`);

  try {
    client = bedrock.createClient(botOptions);

    // عند نجاح الاتصال
    client.on('connect', () => {
      console.log(`[+] تم الاتصال بـ بروتوكول السيرفر بنجاح.`);
    });

    // عند الدخول الكامل للعالم
    client.on('spawn', () => {
      console.log(`[+] دخل ${botOptions.username} وبدأ وضع الخمول الآمن.`);
    });

    // التعامل مع الأخطاء التقنية
    client.on('error', (err) => {
      console.error(`[تنبيه] خطأ في البروتوكول (Read/Write): ${err.message}`);
      triggerRetry();
    });

    // التعامل مع الطرد (Kick)
    client.on('kick', (packet) => {
      console.log(`[-] تم الطرد من السيرفر. السبب: ${packet.message || 'غير معروف'}`);
      triggerRetry();
    });

    // التعامل مع انقطاع الاتصال
    client.on('close', () => {
      console.log(`[!] انقطع الاتصال مع السيرفر.`);
      triggerRetry();
    });

  } catch (error) {
    console.error(`[خطأ في الكود]:`, error);
    triggerRetry();
  }
}

/**
 * وظيفة إعادة الاتصال الذكية
 * ننتظر 60 ثانية لتجنب اكتشاف السيرفر للـ bad_packet المتكرر
 */
function triggerRetry() {
  if (client) {
    try { client.close(); } catch (e) {}
    client = null;
  }
  
  if (retryTimer) return;

  console.log(`⏳ ننتظر 60 ثانية لتجنب الـ bad_packet وإعادة المحاولة...`);
  retryTimer = setTimeout(() => {
    retryTimer = null;
    startBot();
  }, 60000);
}

// تشغيل البوت
startBot();
