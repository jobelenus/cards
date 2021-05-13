let BUTTON_POSITION = 0
let BIG_BLIND = 10
let SMALL_BLIND = 5

const { ACE, HEARTS, SPADES, CLUBS, DIAMONDS } = require('./base.js')

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
  button: 'player_id9876',
  seats: [
    'player_id1234',
    'player_id5678',
    'player_id9876'
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
  ],
  player_id9876: [
    {card: '', suit: ''},
    {card: '', suit: ''}
  ],
}

const pot9876 = {
  //current_pot: 1,
  current_pot: 2,
  deal: [
    { player: player_id1234, bet: 1, pot1: 1, blind: 'small' },
    { player: player_id5678, bet: 2, pot1: 2, blind: 'big' },
    { player: player_id9876, bet: 3, pot1: 3, all_in: true },
    { player: player_id1234, bet: 4, pot1: 2, pot2: 2 },
    { player: player_id5678, bet: 3, pot1: 1, pot2: 2 },
  ],
  flop: [
    { player: player_id1234, bet: 1, pot2: 1 },
    { player: player_id5678, fold: true },
  ],
  turn: [],
  river: [],
}

function move_button(hand) {
}

function big_blind(hand) {
}

function small_blind(hand) {
}

/**
 * Durstenfeld shuffle, an optimized version of Fisher-Yates:
 * Taken from https://stackoverflow.com/a/12646864
 */
function shuffle_array(array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
}

/**
 * Based on the cards in play determine what the rest of the deck looks like
 */
function generate_deck(hand) {
  const all_numerics = [...Array(ACE+1).keys()]
  const all_suits = [HEARTS, CLUBS, SPADES, DIAMONDS]
  const all_used_cards = hand.seats.flatMap(player => hand[player])
  all_used_cards.push(...hand.burnt_cards)
  const remaining_deck = all_suits.reduce((deck, suit) => {
    deck.append(...all_numerics.map(card => {
      const c = { suit, card }
      if (all_used_cards.filter(u => c.suit != u.suit && c.card != u.card)) {
        return c
      }
      return null
    }))
    return deck
  }, [])
  return shuffle_array(remaining_deck.filter(Boolean))
}

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
