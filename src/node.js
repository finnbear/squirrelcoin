let os = require("os");
let fs = require("fs");
let { join, dirname } = require("path");
let mkdirp = require("mkdirp").sync;
const { spawn } = require('child_process');

let App = require("./app.js");

let config = require("./config.js");

const HOME = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
const nodeWalletPath = join(HOME, '.squirrelcoin/node_wallet.json');

try {
	fs.readFileSync(nodeWalletPath, 'utf8');

	startNode();
} catch (err) {
	if (err.code !== "ENOENT") {
		throw err;
	}

	mkdirp(dirname(nodeWalletPath));

	let keygen = spawn("../node_modules/lotion/bin/tendermint", ["gen_validator"]);

	keygen.stdout.on('data', (data) => {
		fs.writeFileSync(nodeWalletPath, data, "utf8");

		startNode();
	});
}

function startNode() {
	console.log("Starting node...");

	App({
		keys: nodeWalletPath,
		lotionPort: config.lotionPort,
		logTendermint: true
	}).then(({tendermintPort}) => {
		console.log("Node successfully started")
		console.log("Lotion API listening on https://localhost:" + config.lotionPort);
		console.log("Tendermint API listening on https://localhost:" + tendermintPort);
	}).catch((err) => {
 		console.error(err.stack);
	});
}
