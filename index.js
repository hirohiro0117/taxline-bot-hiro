const express = require('express');
const line = require('@line/bot-sdk');
const dialogflow = require('dialogflow');
const uuid = require('uuid');

// LINE設定
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
};
const client = new line.Client(config);

// Dialogflow設定
const sessionClient = new dialogflow.SessionsClient({
  credentials: {
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_CLIENT_EMAIL
  }
});
const projectId = process.env.GOOGLE_PROJECT_ID;

const app = express();
const port = process.env.PORT || 3000;

// Webhook受信
app.post('/webhook', line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent)).then(result => res.json(result));
});

async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') return null;

  const sessionId = uuid.v4();
  const sessionPath = sessionClient.sessionPath(projectId, sessionId);

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: event.message.text,
        languageCode: 'ja',
      },
    },
  };

  const responses = await sessionClient.detectIntent(request);
  const result = responses[0].queryResult;
  const intent = result.intent.displayName;

  let responseText = 'ご相談ありがとうございます。';

  // Intent名ごとの分岐
  if (intent === '法人税') {
    responseText = '法人税に関するご相談ですね。以下のフォームよりご連絡ください。';
  } else if (intent === '相続相談') {
    responseText = '相続に関するご相談ですね。専門の担当者が対応いたします。';
  } else if (intent === '遺言関連の相談') {
    responseText = '遺言書の作成についてですね。司法書士をご紹介します。';
  }

  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: responseText
  });
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
