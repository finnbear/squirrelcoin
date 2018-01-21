let secp = require("secp256k1");
let coins = require("coins");
let {randomBytes} = require("crypto");

let config = require("./config.js");

module.exports = function(privKey, client) {
	if (!Buffer.isBuffer(privKey) || privKey.length !== 32) {
		throw Error("Private key must be a 32-byte buffer");
	}

	let creds = {};

	creds.privKey = privKey;
	creds.pubKey = secp.publicKeyCreate(creds.privKey);
	creds.address = coins.secp256k1Account.getAddress({pubkey: creds.pubKey});

	return {
		address: creds.address,
		privKey: creds.privKey,
		pubKey: creds.pubKey,
		getBalance: async function() {
			let state = await client.getState();

			if (!state.accounts[creds.address]) {
				return 0;
			}

			return state.accounts[creds.address].balance;
		},
		send: async function(recipientAddress, amount) {
			let state = await client.getState();

			feeAmount = config.fee * config.oneCoin;

			let tx = {
				from: {
					amount: amount + feeAmount,
					sequence: state.accounts[creds.address].sequence,
					pubkey: creds.pubKey
				},
				to: [
					{
						type: 'fee', amount: feeAmount
					},
					{
						amount,
						address
					}
				]
			};

			let sigHash = coins.getSigHash(tx);
			tx.from.signature = secp.sign(sigHash, creds.privKey).signature;

			return await client.send(tx);
		}
	}
}
