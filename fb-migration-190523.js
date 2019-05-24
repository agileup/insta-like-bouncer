const firebase = require('firebase-admin');
const db_config = require('./Bot/config/db_config');
const config = require('./Bot/config/puppeteer.json');

firebase.initializeApp({
    credential: firebase.credential.cert(db_config),
    databaseURL: config.database_url,
});
let database = firebase.database();

const followHistory = (param = '') => database.ref(`follow_history/${param}`);
const newFollowHistory = (owner, param = '') => database.ref(`${owner}/follow_history/${param}`);

let getFollowHistories = async () => followHistory().once('value').then(data => data.val());
let getNewFollowHistories = async (owner) => newFollowHistory(owner).once('value').then(data => data.val());

let addNewFollowHistory = async (owner, username) => {
  return followHistory(username).remove().then(() => newFollowHistory(owner, username).set({username}));
};

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

const run = async () => {
  console.log('Start')

  const owner = (config.username).replace(/\./g, '%2E');
  let prev = await getFollowHistories();
  if (prev) {
    console.log('prev', Object.keys(prev).length);

    await asyncForEach(Object.keys(prev), async c => {
      await addNewFollowHistory(owner, c);
      console.log(c);
    });
  } else {
    console.log('prev empty');
  }

  let curr = await getNewFollowHistories(owner);
  console.log('curr', Object.keys(curr).length);

  console.log('Done');
};
run().catch(e => console.error(e.message));
