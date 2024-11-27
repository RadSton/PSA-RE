
module.exports = (app = require("express")(), configuration, dbmuxev) => {
    app.get("/api/v1/nodes", (req, res) => {
        res.send(Object.keys(dbmuxev.nodes));
    });

    app.get("/api/v1/nodes/:id", (req, res) => {
        const archId = req.params.id;

        const node = dbmuxev.nodes[archId];

        if (!node) {
            res.status(400).send({ error: "Could not find any nodes for " + archId  })
        }

        res.send(node);
    });

    app.post("/api/v1/node/:id/search", (req, res) => {
        if (!req.body.query) {
            res.status(400).send({ error: "You need to declare query in the body of the request!" })
            return;
        }

        const node = dbmuxev.nodes[req.params.id]
        if (!node) {
            res.status(400).send({ error: "Invalid node!" })
            return;
        }

        const query = req.body.query.toUpperCase();

        let results = {};

        func1: for (const [nodeKey, nodeData] of Object.entries(node)) {
            if (nodeKey.includes(query)) {
                results[nodeKey] = nodeData;
                continue func1;
            }

            if (nodeData.alt)
                for (const altNames of nodeData.alt)
                    if (altNames.includes(query)) {
                        results[nodeKey] = nodeData;
                        continue func1;
                    }

            if (nodeData.name)
                if (nodeData.name.en.toUpperCase().includes(query) || nodeData.name.fr.toUpperCase().includes(query)) {
                    results[nodeKey] = nodeData;
                    continue func1;
                }

            if (nodeData.comment)
                if (nodeData.comment.en.toUpperCase().includes(query) || nodeData.comment.fr.toUpperCase().includes(query)) {
                    results[nodeKey] = nodeData;
                    continue func1;
                }

        }

        res.send(results);

    })
}