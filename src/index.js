const express = require('express');
const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');
const { cryptoWaitReady } = require('@polkadot/util-crypto');

const app = express();
const port = 5001; // Ensure it's the correct port

app.use(express.json()); // Middleware to parse JSON bodies

async function getApi() {
    await cryptoWaitReady();
    const provider = new WsProvider('wss://rpc.polkadot.io');
    return await ApiPromise.create({ provider });
}

app.get('/', async (req, res) => {
    try {
        const api = await getApi();
        const chain = await api.rpc.system.chain();
        const lastHeader = await api.rpc.chain.getHeader();
        res.send(`<h1>Polkadot Meme Token Project</h1>
                  <p>Connected to chain: ${chain}</p>
                  <p>Last block number: ${lastHeader.number}</p>`);
    } catch (error) {
        res.send(`<h1>Error</h1><p>${error.message}</p>`);
    }
});

app.get('/create-token', async (req, res) => {
    try {
        const api = await getApi();
        const keyring = new Keyring({ type: 'sr25519' });
        const alice = keyring.addFromUri('//Alice');

        // Dummy extrinsic call (since we don't have a real pallet, this is a placeholder)
        const dummyExtrinsic = api.tx.balances.transfer('5FHneW46xGXgs5mUiveU4sbTyGBzmto3k3mXUwwAYeGpK2nE', 12345);

        const hash = await dummyExtrinsic.signAndSend(alice);
        res.send(`<h1>Token Created</h1><p>Transaction Hash: ${hash}</p>`);
    } catch (error) {
        res.send(`<h1>Error Creating Token</h1><p>${error.message}</p>`);
    }
});

app.post('/transfer', async (req, res) => {
    const { fromUri, toAddress, amount } = req.body;
    try {
        const api = await getApi();
        const keyring = new Keyring({ type: 'sr25519' });
        const from = keyring.addFromUri(fromUri);

        const transferExtrinsic = api.tx.balances.transfer(toAddress, amount);
        const hash = await transferExtrinsic.signAndSend(from);
        res.send(`<h1>Transfer Successful</h1><p>Transaction Hash: ${hash}</p>`);
    } catch (error) {
        res.send(`<h1>Error Transferring Tokens</h1><p>${error.message}</p>`);
    }
});

app.get('/balance/:address', async (req, res) => {
    const { address } = req.params;
    try {
        const api = await getApi();
        const { data: balance } = await api.query.system.account(address);
        res.send(`<h1>Balance</h1><p>Address: ${address}</p><p>Balance: ${balance.free}</p>`);
    } catch (error) {
        res.send(`<h1>Error Fetching Balance</h1><p>${error.message}</p>`);
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
