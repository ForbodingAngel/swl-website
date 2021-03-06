/*
 * Actions for opening battles.
 */

'use strict'

var Reflux = require('reflux');

module.exports = Reflux.createActions([
	"closeCurrentBattle",
	// Takes the title of the new battle and an init function that takes the
	// new store as the argument, "this" is bound to the new store as well.
	"openLocalBattle",

	"joinMultiplayerBattle", // battle ID [, password]
	"leaveMultiplayerBattle",

	"hostBattle",

	"updateMultiplayerStatus", // { ally, spectator, team, synced }
	"addMultiplayerBot", // team, name, type, side
	"removeMultiplayerBot", // name
	// box uses [0,1] floats and CSS positioning convention.
	"addMultiplayerBox", // team, box { top, left, bottom, right }
	"removeMultiplayerBox", // team
]);
