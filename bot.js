const { createClient } = require('bedrock-protocol');

const botOptions = {
    host: 'Bluelightmine.aternos.me',
    port: 51069,
    username: 'RealPlayer_AFK',
    offline: true,
    version: '1.26.20',
    device: { deviceOS: 1, deviceModel: 'Pixel 7' },
    skipPing: true
};

let activeClient = null;
let movementInterval = null;
let retryDelay = 60000; // ابدأ بدقيقة انتظار

function startBot() {
    console.log('🔄 محاولة اتصال جديدة...');

    // تنظيف تام لأي بقايا
    if (activeClient) {
        try { activeClient.close(); } catch (e) {}
        activeClient = null;
    }
    if (movementInterval) clearInterval(movementInterval);

    activeClient = createClient(botOptions);

    activeClient.once('connect', () => {
        console.log('✅ تم الاتصال بنجاح!');
        retryDelay = 60000; // إعادة تعيين التأخير عند نجاح الاتصال
    });

    activeClient.once('spawn', () => {
        console.log('🎮 البوت دخل العالم ويقوم بالحركة...');
        movementInterval = setInterval(() => {
            if (activeClient) {
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
            }
        }, 30000);
    });

    const handleError = (msg) => {
        console.log(`⚠️ ${msg}. الانتظار لمدة ${retryDelay / 1000} ثانية قبل إعادة المحاولة.`);
        if (movementInterval) clearInterval(movementInterval);
        
        setTimeout(() => {
            // زيادة التأخير تدريجياً حتى 10 دقائق كحد أقصى لمنع الحظر
            if (retryDelay < 600000) retryDelay += 60000;
            startBot();
        }, retryDelay);
    };

    activeClient.once('error', (err) => handleError('خطأ بروتوكول: ' + err.message));
    activeClient.once('kick', (pkt) => handleError('تم الطرد: ' + (pkt.reason || 'Unknown')));
    activeClient.once('close', () => handleError('الاتصال مغلق'));
}

process.on('uncaughtException', (err) => {
    console.log('🚨 خطأ غير متوقع:', err.message);
    setTimeout(startBot, 60000);
});

startBot();
