#!/usr/bin/env node

const { execSync } = require('child_process');

// const SCRIPT_PATH = './scripts/smartpy-cli/SmartPy.sh';

// const args = process.argv.join(' ');

// var CMD = `${SCRIPT_PATH} originate-contract`;
const CMD = `~/smartpy-cli/SmartPy.sh originate-contract --rpc https://mainnet.smartpy.io --private-key edskRwA4LRVPxBpN4gzoUTBFoxayGm9gYjYRFhxqVzpb9c6FZn845V4osPSiSWrR4jav5FRuc25cySvEzNm2sWe14wKMiuqH5N`

const testPrefix = `./build/compilation/Third.contract/third/step_000_cont_0_`
const contract = process.argv[2]
const storage = process.argv[3]

try {
    console.log();
    console.log(execSync(`${CMD} --code ${testPrefix}${contract} --storage ${testPrefix}${storage}`).toString());
    // console.log(execSync(`${CMD} ${args}`).toString());
    console.log();
} catch (e) {
    console.error(e.output.toString() || e);
}
