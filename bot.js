const { createClient } = require('bedrock-protocol');

// إعدادات البوت (تعديلات التمويه)
const botOptions = {
    host: 'Bluelightmine.aternos.me',
    port: 51069,
    username: 'RealPlayer_AFK',
    offline: true,
    version: '1.26.20', // أحدث إصدار متوافق
    device: {
        deviceOS: 1, // Android
        deviceModel: 'Pixel 7'
    },
    skipPing: false
};

function startBot() {
    console.log('🔄 جاري الاتصال بـ Bluelightmine...');
    
    const client = createClient(botOptions);

    client.on('connect', () => {
        console.log('✅ تم الاتصال بنجاح!');
    });

    client.on('spawn', () => {
        console.log('🎮 البوت دخل العالم! يقوم الآن بالتفاعل...');
        
        // تفعيل الحركة العشوائية الآمنة
        const movementInterval = setInterval(() => {
            // نتحقق أولاً من أن البوت لا يزال داخل العالم
            if (client) {
                try {
                    client.write('player_auth_input', {
                        pitch: Math.random() * 90 - 45,
                        yaw: Math.random() * 360 - 180,
                        position: { x: 0, y: 0, z: 0 },
                        moveVector: { x: (Math.random() - 0.5) * 0.1, z: (Math.random() - 0.5) * 0.1 },
                        inputMode: 0,
                        playMode: 0,
                        interactionMode: 0,
                        transaction: { type: 0 }
                    });
                } catch (err) {
                    console.log('⚠️ تعذر إرسال الحركة، قد يكون البوت قد طُرد.');
                    clearInterval(movementInterval);
                }
            }
        }, 30000); // كل 30 ثانية
    });

    client.on('error', (err) => {
        console.log('⚠️ خطأ بروتوكول:', err.message);
    });

    client.on('kick', (packet) => {
        console.log('❌ تم الطرد. السبب:', packet.reason || 'Silent Disconnect');
        console.log('⏳ إعادة المحاولة بعد 60 ثانية...');
        setTimeout(startBot, 60000);
    });
}

// البدء
startBot();
