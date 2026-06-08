const { createClient } = require('bedrock-protocol');

function startBot() {
    console.log('🔄 محاولة الاتصال بـ Bluelightmine...');

    const client = createClient({
        host: 'Bluelightmine.aternos.me',
        port: 51069,
        username: 'RealPlayer_AFK',
        offline: true,
        version: '1.26.20', // جرب وضع أحدث إصدار مرة أخرى
        // التعديل السحري هنا:
        // إضافة الـ Device Data ليوهم السيرفر أن البوت من جهاز محمول
        device: {
            deviceOS: 1, // 1 = Android
            deviceModel: 'Pixel 7',
        }
    });

    client.on('connect', () => console.log('✅ تم الاتصال ببروتوكول السيرفر!'));
    
    client.on('spawn', () => console.log('🎮 البوت داخل العالم الآن!'));

    client.on('kick', (packet) => {
        console.log('❌ تم الطرد. السبب:', packet.message || 'Silent Disconnect');
        setTimeout(startBot, 60000);
    });
}

startBot();
