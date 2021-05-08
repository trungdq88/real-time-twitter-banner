const fs = require('fs');
const TwitterV2 = require('twitter-v2');
const TwitterV1 = require('twitter');
const mergeImg = require('merge-img');
const emojis = require('./emoji-compact.json');
const twemoji = require('twemoji');
const sharp = require('sharp');

const TWITTER_HANDLE = '@tdinh_me';
const credentials = {
  consumer_key: 'YOUR KEY HERE',
  consumer_secret: 'YOUR KEY HERE',
  access_token_key: 'YOUR KEY HERE',
  access_token_secret: 'YOUR KEY HERE'
};

const clientV2 = new TwitterV2(credentials);
const clientV1 = new TwitterV1(credentials);

let lastTweetID = '';
let lastDrawImage = 0;

let emoijString = [];
let drawTimer;

async function pollIt() {
  const params = {
    max_results: 50,
    query: TWITTER_HANDLE,
    'tweet.fields': 'id,text,referenced_tweets'
  };

  if (lastTweetID) {
    params.since_id = lastTweetID;
  }

  // get replies
  const response = await clientV2.get(`tweets/search/recent`, params);

  if (!response.data || !response.data.length) {
    console.log(new Date(), 'no new replies');
    return;
  }

  lastTweetID = response.data[0].id;

  console.log('polled', response.data.length);
  console.log('lastTweetID', lastTweetID);

  const rows = response.data.slice();
  rows.reverse();

  // get all the emojis from the replies
  rows
    .filter(
      (t) =>
        t &&
        t.referenced_tweets &&
        t.referenced_tweets.length &&
        t.referenced_tweets[0].type === 'replied_to'
    )
    .forEach((item) => {
      console.log(item.text);
      emoijString.unshift(...getEmojis(item.text));
    });

  // draw the emojis and update banner
  function drawit() {
    console.log('drawing');
    lastDrawImage = Date.now();
    drawImage(emoijString.slice(0, 20));
  }

  const remaining = Date.now() - lastDrawImage;

  // Avoid hitting rate limit when update banner
  // 30 requests per 15 mins meaning 1 request per 30 secs
  if (remaining > 30000) {
    drawit();
  } else {
    console.log('set timer', 30000 - remaining);
    clearTimeout(drawTimer);
    drawTimer = setTimeout(drawit, 30000 - remaining);
  }
}

function getEmojis(input) {
  return emojis
    .filter((e) => input.indexOf(e) > -1)
    .map((e) => twemoji.convert.toCodePoint(e));
}

async function drawImage(imageNames) {
  var fileName = '1500x500.png';

  try {
    const img = await mergeImg(
      imageNames
        .map((name) => `./assets/72x72/${name}.png`)
        .filter((path) => fs.existsSync(path))
    );

    const name = Math.random(); // avoid disk cache for same file names (weird)

    img.write(`${name}-1.png`, async () => {
      console.log(`${name}-1.png`);

      await sharp(`${name}-1.png`).resize(800).toFile(`${name}-2.png`);
      await sharp(fileName)
        .composite([{ input: `${name}-2.png`, top: 450, left: 450 }])
        .toFile(`${name}.png`);

      const base64 = fs.readFileSync(`${name}.png`, { encoding: 'base64' });

      clientV1.post(
        'account/update_profile_banner',
        {
          banner: base64
        },
        (err, data, response) => {
          console.log('err', err);
          const json = response.toJSON();
          console.log(json.statusCode, json.headers, json.body);

          try {
            console.log('removing', `${name}{,1,2}.png`);
            fs.unlinkSync(`${name}.png`);
            fs.unlinkSync(`${name}-1.png`);
            fs.unlinkSync(`${name}-2.png`);
          } catch (e) {
            console.log(e);
          }
        }
      );
    });
  } catch (e) {
    console.error(e);
  }
}

// start everything
pollIt();
setInterval(() => {
  pollIt();
}, 6000);
