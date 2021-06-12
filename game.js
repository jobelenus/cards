let BIG_BLIND = 10
let SMALL_BLIND = 5

const { ACE, HEARTS, SPADES, CLUBS, DIAMONDS } = require('./base.js')
const hand_operations = require('./hands.js')

/*const hand9876 = {
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
  blinds : [
    { player: player_id1234, bet: 1, pot1: 1, blind: 'small' },
    { player: player_id5678, bet: 2, pot1: 2, blind: 'big' },
  ],
  deal: [
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
}*/

function get_chips(player) {
  return Infinity  // TODO
}

function is_bet_allin (player, amount) {
  const player_total = get_chips(player)
  if (amount >= player_total) {
    return player_total
  }
  return false
}

function move_button(hand) {
  let idx = hand.seats.indexOf(hand.button)
  idx = idx - 1
  if (idx < 0) idx = hand.length - 1  // "move left" is a negative index
  hand.button = hand.seats[idx]
}

function _blind(hand, pot, idx, bet, blind) {
  if (idx === hand.length) idx = 0
  const player = hand.seats[idx]
  const all_in = is_bet_allin(player, bet)
  if (all_in) {
    bet = all_in
    all_in = true
    // TODO increment pot
  }
  pot.blinds.push({ player, bet, pot1: bet, blind, all_in })
}

function big_blind(hand, pot) {
  let idx = hand.seats.indexOf(hand.button)
  idx = idx + 1  // "move right" is a positive index
  _blind(hand, pot, idx, BIG_BLIND, 'big')
}

function small_blind(hand) {
  let idx = hand.seats.indexOf(hand.button)
  idx = idx + 2  // "move right" is a positive index
  _blind(hand, pot, idx, SMALL_BLIND, 'small')
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

function deal_all_players(hand, deck, num_cards) {
  hand.seats.forEach(player_id => {
    hand[player_id] = deck.splice(0, num_cards)
  })
}

function bet(pot, player, amount, stage) {
  let all_in = is_bet_allin(player, amount)
  if (all_in) {
    bet = all_in
    all_in = true
  }
  const check = amount === 0 ? true : false
  const data = { player, bet, all_in, check }
  const current = `pot${pot.current_pot}`
  data[current] = bet
  pot[stage].push(data)
  if (all_in) {
    pot.current_pot += 1
  }
}

function _array_match(arr1, arr2) {
  let match = false
  if (arr1.length === arr2.length) {
    match = arr2.every(player => arr1.includes(player))
  }
  return match
}

/**
 * Returns a boolean whether or not betting is complete for this round
 */
function resolve_betting(hand, pot, stage) {
  let resolve = false
  // did everyone check?
  const players_who_check = pot[stage].filter(bet => bet.check).map(bet => bet.player)
  resolve = _array_match(players_who_check, hand.seats)
  if (resolve) return resolve

  // are all bets called?
  const active_players = pot[stage].filter(bet => !bet.fold).filter(bet => !bet.all_in)
  const zero_out = active_players.reduce((obj, bet) => {
    obj[bet.player] = 0
    return obj
  }, {})
  const players_bet_totals = active_players.reduce((obj, bet) => {
    obj[bet.player] += bet.bet
    return obj
  }, zero_out)
  resolve = Object.values(players_bet_totals).every(bet => bet === players_bet_totals[0])
  return resolve
}

function burn(hand, deck, num_cards) {
  hand.burnt_cards.push(...deck.splice(0, num_cards))
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
}

/**
 * Returns an object whose keys are the pot# and the player in that pot with the winning hand
 */
function resolve_hand(hand, pot) {
  const players_best_hand = hand.seats.reduce((obj, player) => {
    obj[player] = hand_operations.find_best_hand(hand[player], hand.common_cards)
    obj[player].player = player
    return obj
  }, {})

  return Array(pot.current_pot).keys().reduce((obj, potN) => {
    potN += 1  // array starts at 0, but we count at 1
    let pot_amount = 0
    const pot_players = new Set()
    const stages = ['blinds', 'deal', 'flop', 'turn', 'river']
    for (const stage in stages) {
      pot[stage].filter(bet => bet.pot == potN).forEach(bet => {
        pot_players.add(bet.player)
        pot_amount += bet[`pot${potN}`]
      })
    }
    
    const pot_winner_value = Math.max(...Object.values(players_best_hand).filter(p => Object.keys(pot_players).some(p)).map(p => p.max))
    obj[potN] = {
      player: Object.values(players_best_hand).filter(p => p.max === pot_winner_value).pop().player,
      amount: pot_amount
    }
    return obj
  })
}
