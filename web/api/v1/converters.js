
module.exports = (app = require("express")(), configuration, dbmuxev = require("../../debugging_dbmuxev.json"), dbmuxevLibrary) => {
    app.get("/api/v1/converters", (req, res) => {
        res.send(dbmuxevLibrary.getAvailableConverters());
    });

    app.get("/api/v1/convert/:converter/:arch/:bus/:lang", (req, res) => {
        const converter = req.params.converter;
        const arch = req.params.arch;
        const bus = req.params.bus;
        const lang = req.params.lang;

        const result = dbmuxevLibrary.runConverter(dbmuxev, converter, arch, bus, lang);

        res.send(result);
    })

}