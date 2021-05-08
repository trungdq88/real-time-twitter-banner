
# Real-time Twitter Header

This is a fun little experiment with Twitter API. See [my tweet](https://twitter.com/tdinh_me/status/1390700264756191232)!

![CleanShot 2021-05-08 at 20 41 05@2x](https://user-images.githubusercontent.com/4214509/117539600-f97acb80-b03d-11eb-98d4-64c6b12634f8.png)


## How to setup for your Twitter

Just fill in your information in the `emojiheader.js` script.

```
const TWITTER_HANDLE = '@tdinh_me';
const credentials = {
  consumer_key: 'YOUR KEY HERE',
  consumer_secret: 'YOUR KEY HERE',
  access_token_key: 'YOUR KEY HERE',
  access_token_secret: 'YOUR KEY HERE'
};
```

To get the API keys, you need to [apply for a Twitter Developer account](https://developer.twitter.com/en/apply-for-access). It's free and take ~5 minutes.

Lastly, change the default banner `1500x500.png` (unless you want to use mine, which is fine). Make sure it's a `png` (as in the mimetype, not just the file extension).

![](https://github.com/trungdq88/real-time-twitter-banner/blob/master/1500x500.png)

## How the script works

[Read my thread here](https://twitter.com/tdinh_me/status/1391019332738576390). Summary:

1. Fetch your replies using Twitter API. (Rate limit: 180 requests per 15 mins)
2. Filter the emojis from the text (not easy as it seems).
3. Slap the emojis into the default banner (emoji images provided by [twemoji](https://github.com/twitter/twemoji)).
4. Update your profile banner using Twitter API. (Rate limit: 30 requests per 15 mins)

The script fetch new replies every 6 seconds (to avoid rate limit), then update the banner only if there are new emojis.

The delay between reply and banner update is between 6s to 15s.

## Run the script

```
node emojiheader.js
```

Just keep in running and have fun!

## Most importantly

Follow me on Twitter! [https://twitter.com/tdinh_me](https://twitter.com/tdinh_me)

Thanks!

## License

AGPLv3
