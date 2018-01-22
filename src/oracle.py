founderAddress = "3jsjf41SwsDu7oq3Mg7mhe3GKXRUKviNQ"

import os
import sys
import math
import json
import httplib2
#import base58
#import argparse

def sendTx(address, amount, grantId):
	config = {"oneCoin": 1e8, "treasuryPercent": 0.1, "founderPercent": 0.05}

	tx = json.dumps({
		"from": [
			{
				"type": "communityReward",
				"amount": math.floor(amount * (1 + config["treasuryPercent"] + config["founderPercent"]) * config["oneCoin"]),
				"grantId": grantId
			}
		],
		"to": [
			{
				"address": address,
				"amount": math.floor(amount * config["oneCoin"])
			},
			{
				"address": "treasury",
				"amount": math.floor(amount * config["treasuryPercent"] * config["oneCoin"])
			},
			{
				"address": founderAddress,
				"amount": math.floor(amount * config["founderPercent"] * config["oneCoin"])
			}
		]
	})

	http = httplib2.Http()
	url = "http://localhost:4001/"
	headers = {"content-type":"application/json"}
	resp, content = http.request(url, method="POST", body=tx, headers=headers)

	print resp

sendTx(founderAddress, 10, "test:1")