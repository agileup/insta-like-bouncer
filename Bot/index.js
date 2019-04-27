class InstagramBot {
    constructor() {
        this.firebase_db = require('./db');
        this.config = require('./config/puppeteer.json');
    }

    async initPuppeter() {
        const puppeteer = require('puppeteer');
        this.browser = await puppeteer.launch({
            headless: this.config.settings.headless,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
            ],
        });
        this.page = await this.browser.newPage();
        this.page.setViewport({ width: 1600, height: 800 });
    }

    async visitInstagram() {
        // 인스타 접속
        await this.page.goto(this.config.base_url, {timeout: 60000});
        await this.page.waitFor(2500);

        // 로그인 페이지 이동
        await this.page.click(this.config.selectors.button_goto_login);
        await this.page.waitFor(2500);

        // 계정 정보 입력
        await this.page.click(this.config.selectors.input_username);
        await this.page.keyboard.type(this.config.username, { delay: 100 });
        await this.page.click(this.config.selectors.input_password);
        await this.page.keyboard.type(this.config.password, { delay: 100 });

        // 로그인 요청
        await this.page.click(this.config.selectors.submit_login);
        await this.page.waitForNavigation();

        // 알림 설정 팝업 닫기
        if (!this.config.settings.headless) {
            await this.page.click(this.config.selectors.not_now_button);
        }
    }

    async visitHashtagUrl() {
        let hashtags = this.config.hashtags;
        for (let tagIndex = 0; tagIndex < hashtags.length; tagIndex++) {
            console.log(`\n  #${hashtags[tagIndex]}`);
            // 해시태그 페이지 이동
            await this.page.goto(`${this.config.base_url}/explore/tags/` + hashtags[tagIndex] + '/?hl=en');
            // 각 포스트 좋아요/팔로우 처리
            await this._doPostLikeAndFollow(this.config.selectors.hash_tags_base_class, this.page);
        }
    }

    async _doPostLikeAndFollow (parentClass, page) {
        await page.waitFor(2000);

        let count = 0;
        for (let row = 1; row < 300; row++) {
            for (let col = 1; col < 4; col++) {
                // 어뷰징 방지를 위해 포스트 1개씩 건너뛰면서 처리
                if ((row % 2 === 0 && col % 2 !== 0) || (row % 2 !== 0 && col % 2 === 0)) continue;
                
                // 태그당 최대 처리수 확인
                if (count > this.config.settings.max_per_tag) continue;

                // 대상 포스트 조회
                let post_check = true;
                await page.click(`${parentClass} > div:nth-child(3) > div > .Nnq7C:nth-child(${row}) > .v1Nh3:nth-child(${col}) > a`).catch(e => {
                    post_check = false;
                });
                if (!post_check) continue;
                await page.waitFor(3000 + Math.floor(Math.random() * 500));

                try {
                    // 현재 좋아요 여부 확인
                    let isRedHeart = await page.$(this.config.selectors.post_heart_red);

                    // 현재 포스트 계정 확인
                    let username = await page.evaluate(x => {
                        let element = document.querySelector(x);
                        return Promise.resolve(element ? element.innerHTML : '');
                    }, this.config.selectors.post_username);
                    if (!username) {
                        continue;
                    }
                    console.log(`  ${count}번째 포스트: ${username} - ${isRedHeart}`);

                    // 좋아요 처리
                    if (isRedHeart == null) {
                        await page.click(this.config.selectors.post_like_button);
                        await page.waitFor(500 + Math.floor(Math.random() * 1000));

                        // 코멘트 작성(특정 확률로)
                        if (this.config.settings.new_commenting && Math.random() < this.config.settings.comment_ratio) {
                            let comment_open = true;
                            await page.click(this.config.selectors.post_comment_field).catch(e => {
                                comment_open = false;
                            });
                            if (!comment_open) continue;

                            // 코멘트 내용 다양화
                            let comment_idx = Math.floor(Math.random()*(this.config.comments.length))+1;
                            await page.keyboard.type(this.config.comments[comment_idx-1], { delay: 50 });
                            await page.waitFor(500 + Math.floor(Math.random() * 1000));

                            // 코멘트 입력 버튼이 UI상 없어지는 경우가 있어 엔터키 입력으로 대체
                            await page.keyboard.press(String.fromCharCode(13));
                            // await page.click(this.config.selectors.post_comment_button);
                            await page.waitFor(2000 + Math.floor(Math.random() * 5000));
                        }
                    }

                    if (this.config.settings.new_following) {
                        // 이전에 언팔한 기록이 있는지 확인
                        let isArchivedUser = null;
                        await this.firebase_db.inHistory(username)
                            .then(data => isArchivedUser = data)
                            .catch(() => isArchivedUser = false);

                        // 현재 팔로우 여부 확인
                        let followStatus = await page.evaluate(x => {
                            let element = document.querySelector(x);
                            return Promise.resolve(element ? element.innerHTML : '');
                        }, this.config.selectors.post_follow_link);
                        // console.log(`    follow status> ${followStatus}`);

                        // 팔로우 처리
                        if (followStatus === 'Follow' && !isArchivedUser) {
                            await this.firebase_db.addFollowing(username).then(() => {
                                return page.click(this.config.selectors.post_follow_link);
                            }).then(() => {
                                console.log(`    ${username} 팔로우 성공`);
                                return page.waitFor(10000 + Math.floor(Math.random() * 5000));
                            }).catch(e => {
                                if (e) {
                                    console.error(`    ${username} 팔로우 에러 - ${e.message}`);
                                } else {
                                    console.log(`    ${username} 기존 팔로우`);
                                }
                            });
                        }
                    }

                    count++;

                    // 현재 포스트 닫기
                    await page.click(this.config.selectors.post_close_button)
                        .catch(e => console.error(`  포스트 닫기 에러 - ${e.message}`));
                    await page.waitFor(2250 + Math.floor(Math.random() * 250));
                } catch (error) {
                    console.error(`error --- ${error}`);
                }
            }
        }
    };

    async unFollowUsers() {
        let date_range = new Date().getTime() - (this.config.settings.unfollow_days * 86400000);

        // 팔로우 중인 계정 DB 조회
        let following = await this.firebase_db.getFollowings();

        // 언팔 대상 필터링
        let users_to_unfollow = [];
        if (following) {
            const all_users = Object.keys(following);
            users_to_unfollow = all_users.filter(user => following[user].added < date_range);
        }

        if (users_to_unfollow.length) {
            for (let n = 0; n < users_to_unfollow.length; n++) {
                let user = users_to_unfollow[n];
                await this.page.goto(`${this.config.base_url}/${user}/?hl=en`);
                await this.page.waitFor(1500 + Math.floor(Math.random() * 500));

                let followStatus = await this.page.evaluate(x => {
                    let element = document.querySelector(x);
                    return Promise.resolve(element ? element.innerHTML : '');
                }, this.config.selectors.user_unfollow_button);

                if (followStatus === 'Following') {
                    // 언팔 처리 & DB 기록
                    await this.page.click(this.config.selectors.user_unfollow_button);
                    await this.page.waitFor(1000);
                    await this.page.click(this.config.selectors.user_unfollow_confirm_button);
                    await this.page.waitFor(20000 + Math.floor(Math.random() * 5000));
                    await this.firebase_db.unFollow(user);
                    console.log(`  ${user} 언팔 성공`);
                } else {
                    // 언팔 DB 기록
                    this.firebase_db.unFollow(user);
                }
            }
        }
    }

    async closeBrowser(){
        await this.browser.close();
    }
}

module.exports = InstagramBot;
