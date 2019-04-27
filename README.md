# Instagram Like/Follow/Comment Bouncer

인스타그램 좋아요반사/팔로우반사/댓글반사 봇입니다.  
`puppeteer`를 이용해서 실제 웹브라우저에서 사람이 행동하는것과 동일한 패턴으로 자동 반사 처리를 합니다.

### 사전 준비

- [node.js](https://nodejs.org/en/) v7.6.0 이상
- [firebase real-time database](https://firebase.google.com/)

### 사용 방법

* 프로젝트 복사: `git clone https://github.com/agileup/insta-like-bouncer.git`
* config 폴더 내 `example.db_config.json`/`example.puppeteer.json` 파일을 각각 `db_config.json`/`puppeteer.json`으로 이름 변경
* firebase에서 등록한 real-time database의 credential 정보를 `db_config.json` 파일에 입력
* `puppeter.json` 파일에 본인 인스타그램 계정 정보를 입력 - [환경 설정](###환경&#32;설정) 참고
* 필요 모듈 설치: `npm install`
* 봇 실행: `node index.js`

### 환경 설정

| params                  | type     | desc                                                   |
|-------------------------|----------|--------------------------------------------------------|
| base_url                | String   | 인스타 기본 URL                                        |
| database_url            | String   | firebase db url                                        |
| username                | String   | 인스타 ID                                              |
| password                | String   | 비번                                                   |
| hashtags                | [String] | 대상 해시태그들                                        |
| comments                | [String] | 자동 댓글 목록                                         |
| settings.headless       | Boolean  | puppeteer 브라우저 윈도우 표시 여부(false일 경우 표시) |
| settings.interval_hours | Integer  | 실행 간격(시간)                                        |
| settings.max_per_tag    | Integer  | 해시태그별 최대 탐색 개수                              |
| settings.new_commenting | Boolean  | 댓글 입력 여부                                         |
| settings.comment_ratio  | Double   | 댓글 입력 확률(0~1)                                    |
| settings.new_following  | Boolean  | 팔로우 신청 여부                                       |
| settings.unfollow_days  | Integer  | 팔로우 유지 기간(일), 해당 일수 이후 자동 언팔         |
| selectors               | Object   | 인스타 탐색용 고유값                                   |

### 참고
> puppeteer, https://pptr.dev/  
> [3 Ways to Get Around Instagram’s Daily Limits in 2019](https://socialpros.co/instagram-daily-limits)
