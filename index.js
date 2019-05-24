const Bot = require('./Bot');
const config = require('./Bot/config/puppeteer');

const readline = require('readline');
const params = require('commander');

params
    .option('-d, --debug', 'output extra debugging')
    .option('-u, --user_id <user_id>', 'id')
    .option('-p, --password <password>', 'password')
    .option('-l, --manual_login', 'login manually if suspended')
    // .option('-m, --mobile', 'access with mobile user-agent')
    .parse(process.argv);

if (params.debug) console.log(params.opts());

function askQuestion(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }))
}

const run = async () => {
    const bot = new Bot();

    const startTime = Date();

    await bot.initPuppeter().then(() => console.log("[v] 초기화"));

    const id = params.user_id || config.username;
    const pw = params.password || config.password;
    await bot.visitInstagram(id, pw).then(() => console.log("[v] 인스타 로그인"));

    if (params.manual_login) {
        const proceed = await askQuestion("로그인 성공? y/n");
        if (proceed !== 'y') {
            return console.log("End!");
        }
    }

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

setInterval(run, config.settings.interval_hours * 1000 * 60 * 60);
