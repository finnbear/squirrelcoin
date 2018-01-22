let fs = require("fs");
let {dirname, join} = require("path");
let mkdirp = require("mkdirp").sync;
let {createHash, randomBytes} = require("crypto");

var { connect } = require("lotion");

let Methods = require("./methods.js");

let config = require("./config.js");
let genesis = require("../json/genesis.json");

const HOME = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;

let walletPath = join(HOME, ".squirrelcoin/wallet.json");

let argv = process.argv.slice(2)

if (argv.length === 0) {
	console.log("Squirrelcoin help:\n\nsquirrelcoin balance\n  Retrieves your wallet address and balance\n\nsquirrelcoin send <address> <ammount>\n  Sends squirrelcoins from your wallet to the given address")
	process.exit(0);
}

async function main() {
	let privKey;

	try {
		let walletJson = fs.readFileSync(walletPath, "utf8");
		let privKeyHex = JSON.parse(walletJson)[0].privKey;
		privKey = Buffer.from(privKeyHex, "hex");
	} catch (err) {
		if (err.code !== "ENOENT") throw err

		let wallet = [{privKey: randomBytes(32).toString("hex")}]
		let walletJson = JSON.stringify(wallet, null, " ")

		mkdirp(dirname(walletPath));

		fs.writeFileSync(walletPath, walletJson, "utf8")

		privKey = Buffer.from(wallet[0].privKey, "hex");

		console.log("Generated new wallet, saved to " + walletPath);
	}

	let timeout = setTimeout(() => console.log("Connecting..."), 2000);

	let nodes = config.peers.map((addr) => "ws://" + addr + ":" + config.tendermintPort);

	let client = await connect(null, {genesis, nodes});
	let methods = new Methods(privKey, client);

	clearTimeout(timeout);

	switch (argv.length) {
		case 1:
			if (argv[0] === "key") {
				return methods.pubKey;
				process.exit();
			} else if (argv[0] === "balance") {
				let balance

				try {
					balance = await methods.getBalance();
				} catch (err) {
					if (err.message === "invalid state from full node") {
						balance = await wallet.getBalance();
					} else {
						throw err
					}
				}

				console.log("Address: " + methods.address);
				console.log("Balance: " + (balance / config.oneCoin) + " SQRL");

				process.exit();
			}
			break;
		case 3:
			if (argv[0] === "send") {
				let recipientAddr = argv[1];
				let amount = Number(argv[2]) * config.oneCoin;

				let res = await methods.send(recipientAddr, amount);
				console.log("Done sending: " + res);
				process.exit();
			}
			break;
	}
}

main().catch((err) => console.error(err.stack));
