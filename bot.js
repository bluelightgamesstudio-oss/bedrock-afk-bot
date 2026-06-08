const bedrock = require('bedrock-protocol');

const botOptions = {
  host: 'Bluelightmine.aternos.me', 
  port: 51069,                      
  username: 'RealPlayer_AFK',       
  offline: true,                    
  version: '1.26.23'               
};

let client = null;
let retryTimer = null;

function startBot() {
  if (retryTimer) clearTimeout(retryTimer);
  
  console.log(`[اتصال] جاري الدخول بوضع (Passive AFK)...`);

  try {
    client = bedrock.createClient(botOptions);

    client.on('spawn', () => {
      console.log(`[+] دخل ${botOptions.username} وبدأ وضع الخمول الآمن.`);
    });

    client.on('error', (err) => {
      console.error(`[تنبيه] خطأ في البروتوكول: ${err.message}`);
      triggerRetry();
    });

    client.on('close', () => {
      console.log(`[!] انقطع الاتصال.`);
      triggerRetry();
    });

    // إذا طردنا السيرفر بسبب الـ bad_packet، سننتظر لفترة أطول قبل إعادة الدخول
    client.on('kick', (packet) => {
      console.log(`[-] تم الطرد. السبب: ${packet.reason || 'bad_packet'}`);
      triggerRetry();
    });

  } catch (error) {
    console.error(`[خطأ]:`, error);
    triggerRetry();
  }
}

function triggerRetry() {
  if (client) {
    try { client.close(); } catch (e) {}
    client = null;
  }
  
  if (retryTimer) return;

  // رفعنا المهلة لـ 60 ثانية للسماح للسيرفر بمسح "ذاكرة الـ packet" الخاصة بالبوت
  console.log(`⏳ ننتظر 60 ثانية لتجنب الـ bad_packet...`);
  retryTimer = setTimeout(() => {
    retryTimer = null;
    startBot();
  }, 60000);
}

startBot();
