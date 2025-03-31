const express = require('express');
const line = require('@line/bot-sdk');

const app = express();
const port = process.env.PORT || 3000;

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
};

const client = new line.Client(config);

app.post('/webhook', line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent)).then(result => res.json(result));
});

function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  const text = event.message.text;
  let replyMessage = '';

  if (text.includes('税金') || text.includes('相談')) {
    replyMessage =
      'ご相談ありがとうございます😊\n\n税金に関するご相談ですね！\n\n以下の方法でご連絡いただけます：\n📩 メール：abc@tax.com\n👨‍💼 担当：山下三郎（ABC税理士法人）\n\nこのままLINEで「お名前」と「ご相談内容」をご記入いただけましたら、担当よりご連絡させていただきます。';
  } else {
    replyMessage = `メッセージを受け取りました：「${text}」`;
  }

  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: replyMessage
  });
}

app.listen(port, () => {
  console.log(`LINE bot is running on port ${port}`);
});
