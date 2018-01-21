let secp256k1 = require("secp256k1");

let config = require("./config.js");

module.exports = function() {
	let oraclePubKey = Buffer.from(config.oraclePubKey, 'hex');

	return {
		initialState: {
			grantIds: {}
		},
		onInput(input, tx, state) {
			if (!secp256k1.verify(tx.sigHash, input.signature, oraclePubKey)) {
				throw Error("Invalid signature");
			}

			let rewardAmount = tx.to[0].amount;

			let treasuryPayout = tx.to[1];
			let expectedTreasuryAmount = Math.floor(rewardAmount * config.treasuryPercent / 100);

			if (treasuryPayout.amount !== expectedTreasuryAmount) {
				throw Error("Oracle must pay " + (config.treasuryPercent * 100) + "% of reward to treasury");
			}

			if (treasuryPayout.address != "treasury") {
				throw Error("Treasury payout wrong address");
			}

			let founderPayout = tx.to[0];
			let expectedFounderAmount = Math.floor(rewardAmount * config.founderPercent / 100);

			if (founderPayout.amount !== expectedFounderAmount) {
				throw Error("Oracle must pay " + (config.founderPercent * 100) + "% of reward to founder");
			}

			state.grantIds[input.id] = true;

		}
	}
}
