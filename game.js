let BUTTON_POSITION = 0
let BIG_BLIND = 10
let SMALL_BLIND = 5
const PLAYER_POSITIONS = [...Array(6).keys()]
const HANDS = [...Array(6).keys()]

const STEPS = [
	'shuffle',
	'move_button',
	'blind-big',
	'blind-small',
	'deal-all_players-2',
	'bet',
	'burn',
	'deal-common-3',
	'bet',
	'burn',
	'deal-common-1',
	'bet',
	'burn',
	'deal-common-1',
	'bet',
	'resolve-poker'
]

function shuffle() {
	cards = []
	return cards
}

function move_button() {
}

function big_blind() {
}

function small_blind() {
}

function deal_all_players(num_cards) {
}

function bet() {
}

function burn() {
}

function deal_common(num_cards) {
}

function resolve() {
}
