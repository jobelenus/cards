let BUTTON_POSITION = 0
let BIG_BLIND = 10
let SMALL_BLIND = 5
const PLAYER_POSITIONS = [...Array(6).keys()]
const HANDS = [...Array(6).keys()]

const Redis = require("ioredis");
const redis = new Redis();

const GAME_STEPS = [
	'move_button',
	'blind-big',
	'blind-small',
	'deal_all_players-2',
	'bet',
	'burn',
	'deal-common-flop',
	'bet',
	'burn',
	'deal-common-turn',
	'bet',
	'burn',
	'deal-common-river',
	'bet',
	'resolve-poker'
]

const hand9876 = {
  burnt_cards: [],
  button: 'player_id1234',
  seats: [
    'player_id1234',
    'player_id5678'
  ],
  common_flop: [
    {card: '', suit: ''},
    {card: '', suit: ''},
    {card: '', suit: ''}
  ],
  common_turn: { card: '', suit: '' },
  common_river: { card: '', suit:'' },
  player_id1234: [
    {card: '', suit: ''},
    {card: '', suit: ''}
  ],
  player_id5678: [
    {card: '', suit: ''},
    {card: '', suit: ''}
  ]
}

const pot9876 = {

}

function move_button(hand) {
}

function big_blind(hand) {
}

function small_blind(hand) {
}

async function load_hand(hand_key) {
  const hand = JSON.parse(await redis.hgetall(hand_key))
  const deck = generate_deck(hand)
  return {hand, deck}
}

async function save_hand(hand_key, hand) {
  const string_hand = Object.keys(hand).reduce((obj, k) => {
    obj[k] = JSON.stringify(hand[k])
  }, {})
  await redis.hmset(hand_key, string_hand)
}

function deal_all_players(hand, deck, num_cards) {
  hand.seats.forEach(player_id => {
    hand[player_id] = deck.splice(0, num_cards)
  })
  return hand
}

function bet(hand_key) {
}

function burn(hand, deck, num_cards) {
  hand.burnt_cards.push(...deck.splice(0, num_cards))
  return hand
}

function deal_common(hand, deck, step) {
  switch (step) {
    case 'flop': hand.common_flop = deck.splice(0, 3)
            break
    case 'turn': hand.common_turn = deck.splice(0, 1).pop()
            break
    case 'river': hand.common_river = deck.splice(0, 1).pop()
            break
  }
  return hand
}

function resolve(hand_key) {
}
