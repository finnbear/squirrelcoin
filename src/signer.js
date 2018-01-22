
let express = require("express");
let bodyParser = require("body-parser");
let { getSigHash } = require("coins");
let { sign } = require("secp256k1");
let fs = require("fs");
let { join } = require("path");
let { post } = require("axios");

const HOME = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;

let walletPath = join(HOME, ".squirrelcoin/wallet.json");
let walletJson = fs.readFileSync(walletPath, "utf8");
let privKeyHex = JSON.parse(walletJson)[0].privKey;
privKey = Buffer.from(privKeyHex, "hex");

let app = express();
app.use(bodyParser.json());
app.post("/", signTx);
app.listen(3001);

function signTx (req, res) {
	let tx = req.body;
	let sigHash = getSigHash(tx);
	tx.from[0].signature = sign(sigHash, privKey).signature;
	console.log(tx);
	post("http://localhost:3000/txs", tx).then((res) => console.log(res.data.result));
	res.end();
}