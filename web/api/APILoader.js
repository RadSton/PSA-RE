const fs = require("fs");
const path = require("path");

module.exports.load = (app, configuration, dbmuxev) => {
    console.info("Trying to load all api endpoints");
    fs.readdirSync(path.join(__dirname, "./"))
        .filter(name => !name.includes("."))
        .forEach(folder => {
            fs.readdirSync(path.join(__dirname, "./" + folder + "/"))
                .filter(name => name.endsWith(".js"))
                .forEach(jsFile => {
                    console.debug("Registering API-Endpoint-Definition-File " + `./${folder}/${jsFile}`);
                    const javascript = require(`./${folder}/${jsFile}`);
                    javascript(app, configuration, dbmuxev);
                })
        });

        
    console.info("Registered all api endpoints");
} 