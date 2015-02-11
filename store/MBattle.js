/*
 * A multiplayer battle.
 *
 * This is an exception to the usual pattern of using actions to communicate
 * with the store, since the options for using actions are:
 *  - Actions that take the store as an argument.
 *  - Every store instance generates its own set of actions.
 * Both of those are functionally equivalent to plain methods.
 */

'use strict'

var _ = require('lodash');
var Reflux = require('reflux');
var GameInfo = require('../act/GameInfo.js');
var Process = require('../act/Process.js');
var Battle = require('../act/Battle.js');

// See SBattle.js for an explanation about typeTag.
var typeTag = {};

var storePrototype = {
	typeTag: typeTag,

	mixins: [require('./BattleCommon.js')],

	init: function(){
		_.extend(this, this.getClearState());
		this.listenTo(require('./LobbyServer.js'), 'updateServer', 'updateServer');
		this.listenTo(require('./Chat.js'), 'updateChat', 'updateChat');
		this.listenTo(require('./GameInfo.js'), 'updateGameInfo', 'updateGameInfo');
	},
	dispose: function(){
		this.stopListeningToAll();
	},
	triggerSync: function(){
		this.trigger(this.getInitialState());
	},

	updateServer: function(data){
		if (!data.currentBattle)
			return;
		if (this.map !== data.currentBattle.map)
			GameInfo.loadMap(data.currentBattle.map);
		if (this.game !== data.currentBattle.game)
			GameInfo.loadGame(data.currentBattle.map);
		_.extend(this, {
			map: data.currentBattle.map,
			game: data.currentBattle.game,
			engine: data.currentBattle.engine,
			teams: data.currentBattle.teams,
			ip: data.currentBattle.ip,
			port: data.currentBattle.port,
			myName: data.nick,
		});
		this.updateSyncedStatus();
		this.triggerSync();
	},
	updateChat: function(data){
		this.chatLog = data.logs['##battleroom'];
		this.triggerSync();
	},

	// Public methods

	startGame: function(){
		if (!(this.hasEngine && this.hasGame && this.hasMap))
			return;
		var script = {
			isHost: 0,
			hostIp: this.ip,
			hostPort: this.port,
			myPlayerName: this.myName,
			myPasswd: this.myName,
		};
		Process.launchSpringScript(this.engine, { game: script });
	},
	setEngine: _.noop,
	setGame: _.noop,
	setMap: function(ver){
		Chat.sayBattle('!map ' + ver);
	},
	setOwnSide: _.noop,
	setOwnTeam: function(team){
		Battle.updateMyStatus({
			ally: team === 0 ? 0 : team - 1,
			spectator: team === 0,
		});
	},
	setUserTeam: _.noop,
	kickUser: function(name){
		_(this.teams).forEach(function(team){
			if (team[name] && team[name].owner === this.myName)
				Battle.removeMultiplayerBot(name);
		});
	},
	addBot: function(team, name, type, side){
		//
	},
};

module.exports = _.partial(Reflux.createStore, storePrototype);
module.exports.typeTag = typeTag;