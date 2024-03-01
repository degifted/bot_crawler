const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { NewMessage } = require("telegram/events");
const sleep = require('util').promisify(setTimeout);
const input = require("input");

const apiId = 26587388;
const apiHash = "7e6d680256e035b8daf611f328d1683f";
const botAuthToken = "6420625082:AAHUlWjbsMmDaOwdS7cKqN7PiZL1r3DGGzI";
const stringSession = new StringSession("1AgAOMTQ5LjE1NC4xNjcuNTEBu51gcL1193vWXJwSnUlW51XxIO6bEBGB3sJtKJoz5i2fxhbije+FfmIseUF0JqW74yjJ4AswCda15eUzRQMJfxcDG9K6Ie7j86BoK6G0Cy5WHKnwhthwAvtfEGLv4eTzD5tmmLhHoMVlP6frPtRJpvPjeVvO+T27mY72TK6DShZb+ey/FgD+tdpg0/bf6EpJ9/6rGvIg61FVp/GHzwLXqLeMDtabcMOlRijB/NX+rV2FQrdQv6tHAT6suWGwiiM91U8EmOEsZBl4D6WnXUhz5YAM0yPJxMZJVkz13/xKrQpdCmKThQbrfkesjHxq0RPj+A/WaaVDtiCeusbEWrWRo20=");

let chats = `
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
async function startCrawler(){
  try{
    const crawler = new TelegramClient(stringSession, apiId, apiHash, {
      connectionRetries: 5,
      floodSleepThreshold: 10,
    });
    await crawler.start({
      phoneNumber: async () => await input.text("Please enter your number: "),
      password: async () => await input.text("Please enter your password: "),
      phoneCode: async () => await input.text("Please enter the code you received: "),
      onError: (err) => console.log(err),
    });
    crawler.logger.info(`Session: ${crawler.session.save()}`);
    //await crawler.sendMessage("me", { message: "The Crawler has been started" });
    return crawler;
  }catch(e){
    console.error(e);
    await sleep(60000);
    return await startCrawler();
  }
}
(async () => {
  let crawler = await startCrawler();
  const bot = new TelegramClient(new StringSession(), apiId, apiHash, {
    connectionRetries: 5,
    floodSleepThreshold: 6000,
  });
  await bot.start({botAuthToken});
  bot.addEventHandler(async (event) => {
    const msg = event.message;
    crawler.logger.info(`${msg.sender.username}[${msg.senderId}]: "${msg.text}"`);
    if (msg.text == "/status"){
      await msg.reply({
        message: Object.keys(chatMembers)
          .map(chatName => `${chatName}: ${chatMembers[chatName].processedMessages}/${chatMembers[chatName].totalMessages}`)
          .join('\n')
      });
    } else if (msg.text.startsWith("/restart")){
      await crawler.destroy();
      crawler = await startCrawler();
    } else if (msg.text.startsWith("/add")){
      chats += msg.text.substring(4) + '\n';
    } else if (msg.text.startsWith("/check")){
      const id = Number(msg.text.substring(6));
      let reply = "";
      for (const chatName of Object.keys(chatMembers)){
        if (chatMembers[chatName].ids.includes(id)){
          reply += `${chatName}\n`;
        }
      }
      await msg.reply({ message: reply.length ? reply : "Не найдено" });
    } else if (msg.text.startsWith("/del")){
      chats = chats.replace(msg.text.substring(4), '');
    }else{
      let reply = "";
      for (const chatName of Object.keys(chatMembers)){
        if (chatMembers[chatName].ids.includes(+msg.senderId)){
          reply += `${chatName}\n`;
        }
      }
      await msg.reply({ message: reply.length ? reply : "Не найдено" });
    }
  }, new NewMessage());

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
          limit: 2000,
          reverse: true,
          waitTime: 60
        });
        if (messages && messages.length){
          chatMembers[chatName].processedMessages += messages.length;
          chatMembers[chatName].totalMessages = messages.total;
          chatMembers[chatName].lastId = messages[messages.length - 1].id;
          crawler.logger.info(`${chatName}: ${chatMembers[chatName].processedMessages}/${chatMembers[chatName].totalMessages}`);
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
        crawler.logger.error(e);
        if (e.message.includes('username') || e.errorMessage == 'USERNAME_INVALID') continue;
        if (e.name == 'FloodWaitError'){
          await sleep(60000);
          continue;
        }
        await crawler.destroy();
        await sleep(10000);
        crawler = await startCrawler();
      }
    }
    sleep(60000);
  }
})();

