const pots = [  // current pot is the *last* pot
	{
		players: {}, // k = num, v = amount
		all_in_players: []
	}
]

function bet(player, amount) {
	let current = pots[pots.length - 1].players[player] || 0
	pots[pots.length - 1].players[player] = current + amount
}

function allin(allin_player, allin_amount) {
	// HRMMMMM
}

function total() {
	return pots.flatMap(p => Object.values(p.players)).reduce((a, b) => a + b, 0)
}

function player_total(player) {
	return pots.flatMap(p => p.players[player]).reduce((a, b) => a + b, 0)
}
