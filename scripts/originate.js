#!/usr/bin/env node

const { execSync } = require('child_process');

// const SCRIPT_PATH = './scripts/smartpy-cli/SmartPy.sh';

// const args = process.argv.join(' ');

// var CMD = `${SCRIPT_PATH} originate-contract`;
const CMD = `~/smartpy-cli/SmartPy.sh originate-contract --rpc https://mainnet.smartpy.io --private-key edskRwA4LRVPxBpN4gzoUTBFoxayGm9gYjYRFhxqVzpb9c6FZn845V4osPSiSWrR4jav5FRuc25cySvEzNm2sWe14wKMiuqH5N`

const prefix = `./build/compilation/BuyingUtility.contract/buyingUtility/step_000_cont_0_`

try {
    console.log();
    console.log(execSync(`${CMD} --code ${prefix}contract.tz --storage ${prefix}storage.tz`).toString());
    // console.log(execSync(`${CMD} ${args}`).toString());
    console.log();
} catch (e) {
    console.error(e.output.toString() || e);
}
