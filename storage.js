const Redis = require("ioredis");
const redis = new Redis();

async function load_hand(hand_key) {
  const hand = await redis.hgetall(hand_key)
  const parsed_hand = Object.keys(hand).reduce(((obj, k) => JSON.parse(hand[k])))
  const deck = generate_deck(parsed_hand)
  return {parsed_hand, deck}
}

async function save_hand(hand_key, hand) {
  const string_hand = Object.keys(hand).reduce((obj, k) => {
    obj[k] = JSON.stringify(hand[k])
  }, {})
  await redis.hmset(hand_key, string_hand)
}
