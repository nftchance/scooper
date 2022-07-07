// Server setup
const express = require("express");
const bp = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require('morgan');

const { Client, Intents, MessageEmbed } = require('discord.js')

const { RecoveryProcessor } = require('./services/RecoveryProcessor');

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
});

// load the environment variables
dotenv.config({ path: "./.env" });

const development = process.env.DEV === 'true';

// Launch the Express server
const app = express();
const PORT = process.env.PORT || 9000;

app.use(cors());
app.use(bp.urlencoded({ extended: false }));
app.use(bp.json());

if (development)
    app.use(morgan("dev"));

// Connect to discord
client.login(process.env.DISCORD_AUTH_TOKEN);

// Status indicator that can be used to check the activity of the API
app.get('/', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write('<p><strong>API STATUS:</strong> RUNNING</p>');
    res.end();
})

// Process a transaction bundle request based on the data provided.
app.post('/transaction', async function (req, res) {
    console.log('Body request:', req.body)

    processor = new RecoveryProcessor(
        req.body.blockNumber,
        req.body.live,
        req.body.compromisedWalletPrivateKey,
        req.body.compromisedWalletBalance,
        req.body.sponsorWalletPrivateKey,
        req.body.sponsorWalletBalance,
        req.body.transactions,
        req.body.bundleGasEstimate
    );

    bundle = await processor.call();

    res.send({
        ...bundle
    })
    res.end()
});

// Send contact into Scooper channel in UTC discord server.
app.post('/contact', async function (req, res) {
    const embed = new MessageEmbed()
        .setTitle(`CONTACT: ${req.body.subject}`)
        .setDescription(req.body.message)
        .setColor('#707070')

    embed.addField('From', req.body.name)
    embed.addField('Payment Budget', req.body.budget)
    embed.addField('Compromised Wallet', req.body.compromisedWallet)
    embed.addField('Response Method', req.body.response_method)

    client.channels.cache
        .get(process.env.DISCORD_CONTACT_CHANNEL_ID)
        .send({ embeds: [embed] })
        .then(() => {
            res.send({ success: true })
            res.end()
        })
})

// Handle errors
app.use(function (err, req, res, next) {
    err.statusCode = err.statusCode || 500;

    res.status(err.statusCode);
    // Page not found
    if (err.statusCode === 404) {
        return res.send("Page not found.");
    }

    const msg = development ? err.message : "Interal server error.";

    // Server error (server crash)
    res.send(msg);
    res.end()
});

// Start the server on the port defined up top
app.listen(PORT, (err) => {
    if (err) {
        throw err;
    }

    console.log(`App is running at: http://localhost:${PORT}.`);
});
