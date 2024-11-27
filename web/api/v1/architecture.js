
module.exports = (app = require("express")(), configuration, dbmuxev) => {
    app.get("/api/v1/architectures", (req, res) => {
        res.send(dbmuxev.architectures);
    });

    app.get("/api/v1/architectureList", (req, res) => {
        res.send(Object.keys(dbmuxev.networks));
    })
}