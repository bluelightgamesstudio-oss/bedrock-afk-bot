const { createClient } = require('bedrock-protocol');

const botOptions = {
    host: 'Bluelightmine.aternos.me',
    port: 51069, // تأكد أنه المنفذ الحالي من أترنوس
    username: 'RealPlayer_AFK',
    offline: true,
    version: '1.26.20',
    device: { deviceOS: 1, deviceModel: 'Pixel 7' },
    skipPing: true // تم التعديل لـ true لتجاوز الـ Time-out
};

let movementInterval = null;
let activeClient = null; // متغير لتتبع الاتصال النشط

function startBot() {
    console.log('🔄 جاري محاولة إنشاء اتصال نظيف...');

    // 1. تنظيف أي عمليات سابقة (إجبار البوتات القديمة على الخروج)
    if (activeClient) {
        try { activeClient.close(); } catch (e) {}
        activeClient = null;
    }
    if (movementInterval) clearInterval(movementInterval);

    // 2. إنشاء اتصال جديد
    activeClient = createClient(botOptions);

    activeClient.on('connect', () => {
        console.log('✅ تم الاتصال بنجاح!');
    });

    activeClient.on('spawn', () => {
        console.log('🎮 البوت دخل العالم!');
        
        movementInterval = setInterval(() => {
            try {
                activeClient.write('player_auth_input', {
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
                console.log('⚠️ خطأ في الحركة.');
                clearInterval(movementInterval);
            }
        }, 30000);
    });

    const handleError = () => {
        if (movementInterval) clearInterval(movementInterval);
        setTimeout(startBot, 60000);
    };

    activeClient.once('error', (err) => {
        console.log('⚠️ خطأ بروتوكول:', err.message);
        handleError();
    });

    activeClient.once('kick', (packet) => {
        console.log('❌ تم الطرد:', packet.reason || 'Unknown');
        handleError();
    });

    activeClient.once('close', () => {
        console.log('🔌 الاتصال مغلق، إعادة المحاولة في دقيقة...');
        handleError();
    });
}

process.on('uncaughtException', (err) => {
    console.log('🚨 خطأ غير متوقع:', err.message);
    setTimeout(startBot, 60000);
});

startBot();
