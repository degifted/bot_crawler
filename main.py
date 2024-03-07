import vk_api
from vk_api.bot_longpoll import VkBotLongPoll, VkBotEventType

# Replace the values below with your own
group_id = 36667969 #24398930 #208986691 #123456789
#https://oauth.vk.com/blank.html#access_token=vk1.a.3QbE0uMN3C0cfxtg9ArHHyJMGEa7X0EiJxIoUTLpki0WCOhdr4_w8c7L_4-KGSXRwdpZ0VAoyj_k7iWpFnNaoo2o0-q28z62jlG47QbaTluuQUyF2FHyZ2SXNpPunXrCslhJ7utp6gp74kg_LVBxwozp1h1BWYg2xHUJXuRFJ4kJD5TBm6oRW201wB3IJ6w-uSbAYV9f0u278NlieRklbw&expires_in=86400&user_id=15751183
access_token = 'vk1.a.3QbE0uMN3C0cfxtg9ArHHyJMGEa7X0EiJxIoUTLpki0WCOhdr4_w8c7L_4-KGSXRwdpZ0VAoyj_k7iWpFnNaoo2o0-q28z62jlG47QbaTluuQUyF2FHyZ2SXNpPunXrCslhJ7utp6gp74kg_LVBxwozp1h1BWYg2xHUJXuRFJ4kJD5TBm6oRW201wB3IJ6w-uSbAYV9f0u278NlieRklbw'

# Authenticate with VK API
vk_session = vk_api.VkApi(token=access_token)
vk = vk_session.get_api()


messages = vk.messages.getHistory(
    peer_id=group_id,
    count=200
)
print(messages)
#print( vk_session.method('messages.getChat', {'chat_id': group_id}))
#['title']


# Get all messages in the group
messages = vk.messages.getConversations(
    #filter='all',
    group_id=group_id,
    count=200
)


# Print all messages
for message in messages['items']:
    print(message['last_message']['text'])
