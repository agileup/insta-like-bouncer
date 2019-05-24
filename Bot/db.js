const firebase = require('firebase-admin');
const db_config = require('./config/db_config');
const config = require('./config/puppeteer.json');

firebase.initializeApp({
    credential: firebase.credential.cert(db_config),
    databaseURL: config.database_url,
});
let database = firebase.database();

const replaceChar = function(str) {
    return str.replace(/\./g, '%2E');
};

const owner = replaceChar(config.username);

const following = (param = '') => database.ref(`${owner}/following/${replaceChar(param)}`);

const followHistory = (param = '') => database.ref(`${owner}/follow_history/${replaceChar(param)}`);

let addFollowing = async username =>{
    const added = new Date().getTime();
    return following(username).set({username,added});
};

let getFollowings = async () => following().once('value').then(data => data.val());

let unFollow = async username => following(username).remove().then(() => followHistory(username).set({username}));

let inHistory = async username => followHistory(username).once('value').then(data => data.val());

module.exports = {
    addFollowing,
    getFollowings,
    unFollow,
    inHistory
};
