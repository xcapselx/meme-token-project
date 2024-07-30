const express = require('express');
const { ApiPromise, WsProvider } = require('@polkadot/api');
const { cryptoWaitReady } = require('@polkadot/util-crypto');

const app = express();
const port = 5001;

async function getApi() {
    await cryptoWaitReady();
    const provider = new WsProvider('wss://rpc.polkadot.io');
    return await ApiPromise.create({ provider });
}

app.get('/', async (req, res) => {
    const api = await getApi();

    const chain = await api.rpc.system.chain();
    const lastHeader = await api.rpc.chain.getHeader();

    res.send(`<h1>Polkadot Meme Token Project</h1>
              <p>Connected to chain: ${chain}</p>
              <p>Last block number: ${lastHeader.number}</p>`);
});

app.get('/latest-block', async (req, res) => {
    const api = await getApi();

    const lastHeader = await api.rpc.chain.getHeader();
    const blockHash = await api.rpc.chain.getBlockHash(lastHeader.number);
    const signedBlock = await api.rpc.chain.getBlock(blockHash);

    res.send(`<h1>Latest Block Information</h1>
              <p>Block Number: ${lastHeader.number}</p>
              <p>Block Hash: ${blockHash}</p>
              <p>Parent Hash: ${signedBlock.block.header.parentHash}</p>
              <p>State Root: ${signedBlock.block.header.stateRoot}</p>
              <p>Extrinsics Root: ${signedBlock.block.header.extrinsicsRoot}</p>`);
});

app.get('/create-token', async (req, res) => {
    const api = await getApi();

    // Assuming you have a method to create tokens. Replace with actual implementation.
    const createTokenExtrinsic = api.tx.token.createToken('Meme Token', 'MTK', 1000000);

    // Sign and send the transaction here
    res.send('<h1>Token Creation Initiated</h1>');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
