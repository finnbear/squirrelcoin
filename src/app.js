let lotion = require("lotion");
let coins = require("coins");

let CommunityReward = require("./community-reward.js");
let ValidatorReward = require("./validator-reward.js");

let config = require("./config.js");

module.exports = function(opts = {}) {
	let app = lotion({
		p2pPort: config.p2pPort,
		tendermintPort: config.tendermintPort,
		genesis: require.resolve("../json/genesis.json"),
		peers: config.peers.map((addr) => ("${addr}:" + config.p2pPort)),
		...opts
	});

	console.log(app.listen.toString());

	app.use(coins({
		handlers: {
			communityReward: CommunityReward()
		}
	}));

	app.use(function(state, tx) {
		if (tx.from[0].type === 'communityReward') {
			return;
		} else if (tx.to[0].type !== 'fee') {
			throw Error("Fee wasn't paid");
		} else if (tx.to[0].amount !== config.fee * config.oneCoin) {
			throw Error("Fee wrong amount");
		}
	});

	app.use(ValidatorReward());

	return app.listen(config.lotionPort);
}
