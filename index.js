const Bot = require('./Bot');
const config = require('./Bot/config/puppeteer');

const run = async () => {
    const bot = new Bot();

    const startTime = Date();

    await bot.initPuppeter().then(() => console.log("[v] 초기화"));

    await bot.visitInstagram().then(() => console.log("[v] 인스타 로그인"));

    console.log("\n-> 좋반/팔반 시작");
    await bot.visitHashtagUrl().then(() => console.log("\n[v] 좋반/팔반 끝!"));

    console.log("\n-> 언팔 시작");
    await bot.unFollowUsers().then(() => console.log("[v] 언팔 끝!\n"));

    await bot.closeBrowser().then(() => console.log("[v] 브라우저 종료"));

    const endTime = Date();

    console.log(`START TIME - ${startTime}`);
    console.log(`  END TIME - ${endTime}`);
};

run().catch(e => console.log(e.message));

setInterval(run, config.settings.interval_hours * 3600000);
