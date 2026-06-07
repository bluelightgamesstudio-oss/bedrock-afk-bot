const bedrock = require('bedrock-protocol');

// إعدادات الاتصال بالسيرفر
const botOptions = {
  host: 'Bluelightmine.aternos.me', // الآي بي الخاص بسيرفرك
  port: 51069,                      // المنفذ الخاص بسيرفرك
  username: 'RealPlayer_AFK',       // اسم البوت
  offline: true,                    // مفعل للسيرفرات المكركة
  version: '1.21.130'               // الإصدار المطابق للسيرفر
};

let client = null;
let retryTimer = null;
let afkInterval = null;

// متغيرات حفظ موقع البوت لمنع الكراش
let botRuntimeId = null;
let botPosition = { x: 0, y: 0, z: 0 };

function startBot() {
  // تنظيف أي مؤقتات أو حلقات قديمة عند إعادة التشغيل
  if (retryTimer) clearTimeout(retryTimer);
  if (afkInterval) clearInterval(afkInterval);
  
  console.log(`[اتصال] جاري محاولة الاتصال بسيرفر البدروك إصدار ${botOptions.version}...`);

  try {
    client = bedrock.createClient(botOptions);

    // 1. التقاط إحداثيات وهواية البوت بأمان فور توليد العالم لتفادي خطأ الـ Undefined
    client.on('start_game', (packet) => {
      if (packet.player_position) {
        botPosition = { ...packet.player_position };
      }
      botRuntimeId = packet.runtime_id;
      console.log(`[معلومات] تم التعرف على معرف البوت بنجاح: ${botRuntimeId}`);
    });

    // 2. تحديث الإحداثيات إذا قام السيرفر بنقل البوت (تجنباً للـ bad_packet)
    client.on('move_player', (packet) => {
      if (botRuntimeId && packet.runtime_id === botRuntimeId) {
        botPosition = packet.position;
      }
    });

    // 3. عند نجاح رسوبن البوت واستقرار الاتصال
    client.on('spawn', () => {
      console.log(`[+] دخل ${botOptions.username} إلى السيرفر وهو الآن مستقر!`);
      
      // تأخير مريح لمدة 5 ثوانٍ قبل تشغيل الحركة العشوائية لحماية البوت من الطرد الفوري
      setTimeout(() => {
        startSmartAFKLoop();
      }, 5000);
    });

    // معالجة أخطاء الشبكة أو إغلاق السيرفر
    client.on('error', (err) => {
      console.error(`[تنبيه] حدث خطأ في الاتصال أو السيرفر مطفأ (${err.message})`);
      triggerRetry();
    });

    client.on('close', () => {
      console.log(`[!] انقطع الاتصال بالسيرفر.`);
      triggerRetry();
    });

    client.on('kick', (packet) => {
      console.log(`[-] تم طرد البوت. السبب: ${packet.reason}`);
      triggerRetry();
    });

  } catch (error) {
    console.error(`[خطأ غير متوقع]:`, error);
    triggerRetry();
  }
}

// حلقة الحركة العشوائية الذكية (تمنع طرد الـ AFK بدون كراش وبدون رصد الـ Anti-Cheat)
function startSmartAFKLoop() {
  if (afkInterval) clearInterval(afkInterval);

  console.log(`[⚙️] تم تفعيل حلقة الحركة والالتفات العشوائي الذكي لمنع الـ AFK.`);

  afkInterval = setInterval(() => {
    if (!client || !botRuntimeId) return;

    // توليد زوايا رؤية عشوائية (التفات يميناً ويساراً ولأعلى وأسفل)
    const randomYaw = Math.random() * 360;
    const randomPitch = (Math.random() * 40) - 20; // زاوية بين -20 و 20

    // إحداث حركة اهتزازية خفيفة جداً وآمنة في نفس الموقع
    const microMovement = {
      x: botPosition.x + (Math.random() * 0.1 - 0.05),
      y: botPosition.y,
      z: botPosition.z + (Math.random() * 0.1 - 0.05)
    };

    try {
      client.queue('move_player', {
        runtime_id: botRuntimeId,
        position: microMovement,
        pitch: randomPitch,
        yaw: randomYaw,
        head_yaw: randomYaw,
        mode: 0,
        on_ground: true,
        riding_runtime_id: 0,
        teleport_cause: 0,
        teleport_item_id: 0,
        tick: 0
      });
    } catch (e) {
      console.error(`[!] فشل إرسال حزمة الحركة العشوائية:`, e.message);
    }
  }, 4000); // يتمرن ويتحرك كل 4 ثوانٍ
}

function triggerRetry() {
  if (afkInterval) clearInterval(afkInterval);
  
  if (client) {
    try { client.close(); } catch (e) {}
    client = null;
  }

  if (retryTimer) return;

  console.log(`⏳ سيتم إعادة المحاولة تلقائياً خلال 30 ثانية...`);
  retryTimer = setTimeout(() => {
    retryTimer = null;
    startBot();
  }, 30000);
}

// انطلاق البوت
startBot();
