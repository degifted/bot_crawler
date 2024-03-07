import vk_api

# Replace the values below with your own
#app_id = 51837551
app_id = 6121396 #2685278
#client_secret = 'BDL4fSpQEqZ9tu2w8kgA'
#client_secret = '409e15a7409e15a7409e15a7f84388efc84409e409e15a725325aef8eb45d3af946441e'
access_token = 'vk1.a.6zAGXhEAlgLCnBgBs1RHfYcrbP3-ONKfA5dhslm2em0CQhDSOYgh1Tbu1C3sqQZeMtXtHoYYcWwcgWRJhdo4YM0mZoTyosha_ei-8HVldbb3NRYAhnIP15ibPZtItKTxuDqLHLUoL8c2vGJwAcGTlVbG7YTUjkGuhFlVnwrYWvhyjhLTvKupHCYo-YEl-HygS0dfbWaLdRNMbtCv-Y0Npw'
group_id = 36667969 #24398930 #208986691 #123456789


# Authenticate with VK API
vk_session = vk_api.VkApi(
    #app_id=app_id,
    #client_secret=client_secret,
    #username=username,
    #login="+375291695191",
    #password='BMzWmq657s.*w2m',
    token=access_token,
    #scope='messages'
)
try:
    #vk_session.auth()
    vk = vk_session.get_api()
    #vk_session.auth(token_only=True)
except vk_api.AuthError as error_msg:
    print(error_msg)
    exit
    #return

# Get the user's access token
access_token = vk_session.token['access_token']

# Use the access token to access messages in the user's groups
vk = vk_session.get_api()

messages = vk.messages.getHistory(
    #group_id=group_id,
    peer_id=-36667969,
    count=200
)
print(messages)

messages = vk.messages.getConversations(
    filter='all', count=200,
    group_id=group_id,
)

# Print all messages
for message in messages['items']:
    print(message['last_message']['text'])