const configuarion = require("./configuration.json");
require("./utils/BetterLogging")({
    prefix: "$gray[$light_redPSA-RE-Web$gray]"
});

const express = require("express");
const { networkInterfaces } = require('os');

const dbmuxevLibrary = require("./dbmuxev/dbmuxev");
const dbmuxev = dbmuxevLibrary.loadSmart(configuarion);

const app = express();

app.use(express.static(configuarion.STATIC_WEB_ROOT))
app.use(express.json());

require("./api/APILoader").load(app, configuarion, dbmuxev, dbmuxevLibrary);

app.get("/cars", (req, res) => {
    res.sendFile(__dirname + "/view/cars.html");
})  

app.get("/nodes", (req, res) => {
    res.sendFile(__dirname + "/view/nodes.html");
})  

app.get("/architecture*", (req, res) => {
    res.sendFile(__dirname + "/view/architectures.html");
})  

app.get("/buses", (req, res) => {
    res.sendFile(__dirname + "/view/buses.html");
})  

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/view/architectures.html");
})  

app.get("/*", (req, res) => {
    res.status(302).redirect("/");
})


app.listen(configuarion.WEB_PORT, () => {
    console.debug("Webserver running on port " + configuarion.WEB_PORT);
    console.log();
    console.info("$redPSA-RE-Web`s Webserver$light_magenta has started, you can access it at one of these addresses:");
    console.info("$yellowLocal$green access: $bluehttp://localhost:" + configuarion.WEB_PORT);

    // Stolen and modified code from: https://stackoverflow.com/questions/3653065/get-local-ip-address-in-node-js
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
            const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
            if (net.family === familyV4Value && !net.internal) {
                console.info("$yellowOther$green access: $light_cyanhttp://" + net.address + ":" + configuarion.WEB_PORT + " (" + name + ")");
            }
        }
    }

    console.log();
})