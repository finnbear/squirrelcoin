let {addressHash} = require('coins/src/common.js')

let config = require("./config.js");

module.exports = function() {
	return {
		type: 'block',
		middleware(state, chainInfo) {
			for (let pubKey in chainInfo.validators) {
				let pubKeyBuffer = Buffer.from(pubKey, 'hex').slice(1)

				let address = addressHash(pubKeyBuffer);

				if (!state.accounts[address]) {
					state.accounts[address] = {
						balance: 0,
						sequence: 0
					};
				}

				state.accounts[address].balance += config.validatorReward;
			}
		}
	}
}
