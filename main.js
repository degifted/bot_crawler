const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { NewMessage } = require("telegram/events");
const sleep = require('util').promisify(setTimeout);
const input = require("input");

const apiId = 26587388;
const apiHash = "7e6d680256e035b8daf611f328d1683f";
const botAuthToken = "6420625082:AAHUlWjbsMmDaOwdS7cKqN7PiZL1r3DGGzI";
const stringSession = new StringSession("1AgAOMTQ5LjE1NC4xNjcuNTEBu8apRUe8rdlq2LELQTDxAatOdC7lhMf83agxd3uvdvY/ESqeOX3kaPWDAiFEAdu+q8bQXmj7SE783nxmAwiZif1wJOAYpGiBDx1Z6y9+qKKeZiroVkYQaoYge5MWfsVMW5ES29gio8PvjwKCJE5cbB/vr6SKbEvxu03jR1s1cXGrF9dOaj1tTZK/alJdClGBQzQX1KHkMAZpzHhBw+HQ4h3i+Gp2hGBk8NViEmlA6wFUjwWxb6SZ9Xs3lVyxTv9mjz8SMJ4LsdudQkBvMyZiwHOZkXc4SwkYUwPSJLGo6Q84bqap8vUWO9PVFyz+ZW37Yrpv1kdVmqLRHjr0GnSNBxU=");

const chats = `
LeonidaBedy6810
Graewka97
minsk_baraholka7
ideas97pro_chat
lelchicy97pro
dr1ver97_chat
driver97_minsk
frunzenskiy_97
gomel97
gomel97_gorka
gomel97pro
grodno97pro
grodnoblk_97
haharyna97
ibis97
kazinca97
kepski_chat
kg97percent
KhalezinChat
kiev_minsk
Kiev_Orlovka
kievbel_chat
lepel_strana_chat
lepel2020
lepel97pro
lesi14_16_18
loshitza3
losika97
losyca46
Minsk_BeLaRus247
Minsk_Brest
Minsk_central
Minsk_chatt
minsk_eastern_district_107_chat
minsk_grodno_car
Minsk_GULAG
minsk_kiev_1
Minsk_Lesi_Ukrainki_12
minsk_moskva
minsk_new
minsk_oct
minsk_praca
Minsk_Ukrainki_L_12_2
minsk_vape
minsk_victory_square
minsk_world
minsk_zavod
minsk_zavodskoy
minsk1_vape
minsk3233p
minsk468
minsk97pro
minskbaristahustle
minskflatblr
minskii_chat_taxi
MinskMir24
MinskMira
minskmirzapadnayevropa
minsknewyork4x
minskoe_taxi
minskpiterminskk
minskworld
minskworld22
MinskWorld23district
minskworld26
MinskWorld9district
MinskWorldAll
minskworldofftopic
MinskWorldPetFriendly
polbelmed
polesie97_chat
polevaya_minsk
poligonby
politdvizh
`;

const chatMembers = {};
(async () => {
  const bot = new TelegramClient(new StringSession(), apiId, apiHash, {
    connectionRetries: 5,
    floodSleepThreshold: 6000,
  });
  await bot.start({botAuthToken});
  bot.addEventHandler(async (event) => {
    const msg = event.message;
    switch(msg.text){
      case "/status":
        await msg.reply({
          message: Object.keys(chatMembers)
            .map(chatName => `${chatName}: ${chatMembers[chatName].processedMessages}/${chatMembers[chatName].totalMessages}`)
            .join('\n')
        });
        break;
      case "/start":
      default:
        let reply = "";
        for (const chatName of Object.keys(chatMembers)){
          if (chatMembers[chatName].ids.includes(+msg._senderId)){
            reply += `${chatName}\n`;
          }
        }
        await msg.reply({ message: reply.length ? reply : "Не найдено" });
        break;
    }
  }, new NewMessage());


  const crawler = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
    floodSleepThreshold: 6000,
  });
  await crawler.start({
    phoneNumber: async () => await input.text("Please enter your number: "),
    password: async () => await input.text("Please enter your password: "),
    phoneCode: async () => await input.text("Please enter the code you received: "),
    onError: (err) => console.log(err),
  });
  console.log(`Session: ${crawler.session.save()}`);
  await crawler.sendMessage("me", { message: "The Crawler has been started" });

  while(true){
    for (const chatName of chats.split(/\W/).map(c => c.trim()).filter(c => c.length)){
      try{
        if (!chatMembers[chatName]) chatMembers[chatName] = {
          chat: await crawler.getInputEntity(chatName),
          lastId: 0,
          processedMessages: 0,
          totalMessages: 0,
          ids: []
        };
        const messages = await crawler.getMessages(chatMembers[chatName].chat, {
          minId: chatMembers[chatName].lastId,
          limit: 10000,
          reverse: true,
          waitTime: 60
        });
        if (messages && messages.length){
          chatMembers[chatName].processedMessages += messages.length;
          chatMembers[chatName].totalMessages = messages.total;
          chatMembers[chatName].lastId = messages[messages.length - 1].id;
          console.log(`${chatName}: ${chatMembers[chatName].processedMessages}/${chatMembers[chatName].totalMessages}`);
          chatMembers[chatName].ids = Array.from(
            new Set([
              ...chatMembers[chatName].ids,
              ...messages
                .filter(m => m.className == 'Message' && m.fromId?.className == 'PeerUser')
                .map(m => Number(m.fromId?.userId))
            ])
          );
          await sleep(2000);
        }
      }catch(e){
        console.log(e);
      }
    }
    sleep(60000);
  }
})();

