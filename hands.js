const assert = require('assert')
const {
	 HAND_SIZE,
	 BASE,
	 HEARTS,
	 SPADES,
	 CLUBS,
	 DIAMONDS,
	 LOW_ACE,
	 TWO,
	 THREE,
	 FOUR,
	 FIVE,
	 SIX,
	 SEVEN,
	 EIGHT,
	 NINE,
	 TEN,
	 JACK,
	 QUEEN,
	 KING,
	 ACE
} = require('./base.js')

function _numeric_sort(a, b) {
	return a - b
}

function _flip(counts) {
  return Object.keys(counts).reduce((obj,key) => {
    obj[counts[key]] = key
    return obj
  }, {})
}

function _detect_counts(hand) {
  return hand.reduce((counts, c) => {
		counts[c.card] = counts[c.card] + 1 || 1
		return counts
	}, {})
}

function _detect_flush(hand) {
	return [...new Set(hand.map(c => c.suit))].length === 1 ? true : false
}

function _detect_straight(hand) {
	let has_ace = hand.filter(c => c.card === ACE).length > 0
	let sorted = hand.map(c => c.card).sort(_numeric_sort)
	let is_straight = (sorted[4] - sorted[0]) === 4 ? sorted[4] : false
	if (is_straight || !has_ace) {
		return is_straight  // regular straight or ace high
	} else {
		// turn the ace into a 1, and do the same test
		sorted[sorted.indexOf(ACE)] = LOW_ACE
		sorted.sort(_numeric_sort)
		let is_straight = (sorted[4] - sorted[0]) === 4 ? sorted[4] : false
    return is_straight
	}
}

/**
 * Detect function interface
 * Arguments: hand [{card: ..., suit: ...}, ...]
 * Returns: False when not found
 * Returns: base16 String value (usually the highest card)
 */
function detect_straight_flush(hand) {
	let flush = _detect_flush(hand)
	let straight =  _detect_straight(hand)
	return (flush && straight) ? straight : false  // returning the highest card
}

function detect_four_of_a_kind(hand) {
	let counts = _flip(_detect_counts(hand))
	return counts[4] ? counts[4] : false
}

function detect_full_house_high(hand) {
	let counts = _flip(_detect_counts(hand))
	if (counts[3] && counts[2])
		return counts[3]
	return false
}

function detect_full_house_low(hand) {
	let counts = _flip(_detect_counts(hand))
	if (counts[3] && counts[2])
		return counts[2]
	return false
}

function detect_flush(hand) {
  // we can send 1 back for all flush, and let the highest card value sort out the winner
	return _detect_flush(hand) ? 1 : false
}

function detect_straight(hand) {
  const straight = _detect_straight(hand)
	return straight ? straight : false
}

function detect_three_of_a_kind(hand) {
	let counts = _flip(_detect_counts(hand))
	return counts[3] ? counts[3] : false
}

function detect_two_pair_high(hand) {
	const counts = _detect_counts(hand)
  const value = Object.keys(counts).reduce((max_value, value) => {
    if (counts[value] === 2 && value > parseInt(max_value, BASE)) max_value = parseInt(value, BASE);
    return max_value
  }, 0)
  return value ? value : false
}

function detect_two_pair_low(hand) {
	const counts = _detect_counts(hand)
  const value = Object.keys(counts).reduce((min_value, value) => {
    if (counts[value] === 2 && parseInt(value) < min_value, BASE) min_value = parseInt(value, BASE);
    return min_value
  }, Infinity)
  return value !== Infinity ? value : false
}

function detect_pair(hand) {
	const counts = _flip(_detect_counts(hand))
	return counts[2] ? counts[2] : false
}

const run_next_detection = (fn, return_to_some) => {
  return (hand) => {
    const value = fn(hand)
    return [value, value ? return_to_some : false]
  }
}

const DETECT = [
	run_next_detection(detect_straight_flush, true),
	run_next_detection(detect_four_of_a_kind, true),
  run_next_detection(detect_full_house_high, false),
	run_next_detection(detect_full_house_low, true),
	run_next_detection(detect_flush, true),
	run_next_detection(detect_straight, true),
	run_next_detection(detect_three_of_a_kind, true),
	run_next_detection(detect_two_pair_high, false),
	run_next_detection(detect_two_pair_low, true),
	run_next_detection(detect_pair, true)
]

/**
 * Arguments
 * hand: a list of JSON objects containing `card`, and `suit` keys
 * e.g. [{card: SEVEN, suit: HEARTS}, ...]
 */
function calculate_hand(hand) {
	// empty value
	let values = new Array(BASE-1).fill(0)

	// all the base card values
	let sorted = hand.map(c => c.card).sort(_numeric_sort).map(c => Number(c).toString(BASE))

	// overwrite the first value entries
	values.splice(0, sorted.length, ...sorted);

	// run detection in descending order
	let digit_counter = 1
	DETECT.some(fn => {
		let [ value, next ]  = fn(hand)
		if (value) {
			values[values.length - digit_counter] = Number(value).toString(BASE)
			return next  // stops the `some` loop
		} else {
			digit_counter++
		}
	})
	values.reverse()
	return parseInt(values.join(''), BASE)
}

function k_combinations(set, k) {
	/**
	 * Copyright 2012 Akseli Palén.
	 * Created 2012-07-15.
	 * Licensed under the MIT license.
	 */
    var i, j, combs, head, tailcombs;
    if (k > set.length || k <= 0) {
        return [];
    }
    if (k == set.length) {
        return [set];
    }
    if (k == 1) {
        combs = [];
        for (i = 0; i < set.length; i++) {
            combs.push([set[i]]);
        }
        return combs;
    }
    combs = [];
    for (i = 0; i < set.length - k + 1; i++) {
        head = set.slice(i, i+1);
        tailcombs = k_combinations(set.slice(i + 1), k - 1);
        for (j = 0; j < tailcombs.length; j++) {
            combs.push(head.concat(tailcombs[j]));
        }
    }
    return combs;
}

function find_best_hand(player_cards, common_cards) {
	let possible_hands = k_combinations(common_cards.concat(player_cards), HAND_SIZE)
	let possible_values = possible_hands.map(hand => calculate_hand(hand))
	let max = Math.max(...possible_values)
	let idx = possible_values.indexOf(max)
	let hand = possible_hands[idx]
	return [max, hand]
}

/*
let hand1 = [
	{card: TEN, suit: HEARTS},
	{card: JACK, suit: HEARTS},
	{card: QUEEN, suit: HEARTS},
	{card: KING, suit: HEARTS},
	{card: ACE, suit: HEARTS},
]

let hand2 = [
	{card: TEN, suit: SPADES},
	{card: TEN, suit: CLUBS},
	{card: FIVE, suit: DIAMONDS},
	{card: FIVE, suit: DIAMONDS},
	{card: ACE, suit: DIAMONDS},
]

let c1 = calculate_hand(hand1)
let c2 = calculate_hand(hand2)
console.log("1", c1)
console.log("2", c2)
assert(c1 > c2)



let hand3 = [
	{card: TWO, suit: HEARTS},
	{card: THREE, suit: HEARTS},
	{card: FOUR, suit: SPADES},
	{card: FIVE, suit: HEARTS},
	{card: SEVEN, suit: HEARTS},
]

let hand4 = [
	{card: THREE, suit: SPADES},
	{card: FOUR, suit: CLUBS},
	{card: FIVE, suit: DIAMONDS},
	{card: SIX, suit: DIAMONDS},
	{card: EIGHT, suit: DIAMONDS},
]

let c3 = calculate_hand(hand3)
let c4 = calculate_hand(hand4)
console.log("3", c3)
console.log("4", c4)
assert(c3 < c4)


let hand5 = [
	{card: ACE, suit: HEARTS},
	{card: KING, suit: HEARTS},
	{card: QUEEN, suit: DIAMONDS},
	{card: JACK, suit: DIAMONDS},
	{card: TEN, suit: HEARTS},
]

let hand6 = [
	{card: ACE, suit: HEARTS},
	{card: KING, suit: HEARTS},
	{card: TEN, suit: HEARTS},
	{card: TWO, suit: HEARTS},
	{card: THREE, suit: HEARTS},
]

let c5 = calculate_hand(hand5)
let c6 = calculate_hand(hand6)
console.log("5", c5)
console.log("6", c6)
assert(c5 < c6)


let hand7 = [
	{card: TEN, suit: HEARTS},
	{card: TEN, suit: DIAMONDS},
	{card: QUEEN, suit: DIAMONDS},
	{card: JACK, suit: DIAMONDS},
	{card: FIVE, suit: HEARTS},
]

let hand8 = [
	{card: ACE, suit: SPADES},
	{card: TEN, suit: SPADES},
	{card: TEN, suit: CLUBS},
	{card: TWO, suit: CLUBS},
	{card: THREE, suit: CLUBS},
]

let c7 = calculate_hand(hand5)
let c8 = calculate_hand(hand6)
console.log("7", c5)
console.log("8", c6)
assert(c7 < c8)
*/

let player1 = [{card: ACE, suit: HEARTS, is_player: true}, {card: KING, suit: HEARTS, is_player: true}]
let common1 = [
	{card: QUEEN, suit: DIAMONDS, is_common: true},
	{card: JACK, suit: DIAMONDS, is_common: true},
	{card: TEN, suit: HEARTS, is_common: true},
	{card: TWO, suit: HEARTS, is_common: true},
	{card: THREE, suit: HEARTS, is_common: true}
]
let [value, best1] = find_best_hand(player1, common1)
console.log(value, best1)
