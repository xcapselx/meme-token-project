const express = require('express');
const bodyParser = require('body-parser');
const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');
const { cryptoWaitReady } = require('@polkadot/util-crypto');

const app = express();
const port = 5001;

app.use(bodyParser.json());

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

app.get('/balance/:address', async (req, res) => {
    const { address } = req.params;
    const api = await getApi();

    try {
        const { data: balance } = await api.query.system.account(address);
        res.send(`<h1>Balance for ${address}</h1>
                  <p>Free Balance: ${balance.free}</p>
                  <p>Reserved Balance: ${balance.reserved}</p>
                  <p>Misc Frozen: ${balance.miscFrozen}</p>
                  <p>Fee Frozen: ${balance.feeFrozen}</p>`);
    } catch (error) {
        res.status(500).send(`<h1>Error</h1><p>${error.message}</p>`);
    }
});

app.post('/transfer', async (req, res) => {
    const { senderSeed, recipient, amount } = req.body;
    const api = await getApi();

    try {
        const keyring = new Keyring({ type: 'sr25519' });
        const sender = keyring.addFromUri(senderSeed);

        const transfer = api.tx.balances.transfer(recipient, amount);
        const hash = await transfer.signAndSend(sender);

        res.send(`<h1>Transfer Successful</h1>
                  <p>Transaction Hash: ${hash}</p>`);
    } catch (error) {
        res.status(500).send(`<h1>Error</h1><p>${error.message}</p>`);
    }
});

app.post('/create-token', async (req, res) => {
    const { senderSeed, tokenName, tokenSymbol, initialSupply } = req.body;
    const api = await getApi();

    try {
        const keyring = new Keyring({ type: 'sr25519' });
        const sender = keyring.addFromUri(senderSeed);

        const createTokenExtrinsic = api.tx.balances.createToken(tokenName, tokenSymbol, initialSupply);
        const hash = await createTokenExtrinsic.signAndSend(sender);

        res.send(`<h1>Token Creation Successful</h1>
                  <p>Token Name: ${tokenName}</p>
                  <p>Token Symbol: ${tokenSymbol}</p>
                  <p>Initial Supply: ${initialSupply}</p>
                  <p>Transaction Hash: ${hash}</p>`);
    } catch (error) {
        res.status(500).send(`<h1>Error</h1><p>${error.message}</p>`);
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
