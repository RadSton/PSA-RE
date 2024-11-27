
module.exports = (app = require("express")(), configuration, dbmuxev) => {
    app.get("/api/v1/cars", (req, res) => {
        res.send(dbmuxev.cars);
    });

    app.get("/api/v1/car/:id", (req, res) => {
        const carId = req.params.id;

        const car = dbmuxev.cars[carId];

        if(!car) {
            res.status(400).send({ error: "Could not find that car" })
        }

        res.send(car);
    });

    app.post("/api/v1/cars/search", (req, res) => {
        if (!req.body.query) {
            res.status(400).send("You need to declare query in the json body of the request!")
            return;
        }

        const query = req.body.query.toLowerCase();

        let results = {};

        // I dont wanna know how much time in this routine is spent on toLowerCase
        func1: for (const carId in dbmuxev.cars) {
            const car = dbmuxev.cars[carId];

            if (carId.toLowerCase().includes(query)) {
                results[carId] = car;
                continue func1;
            }

            if (car.names) // I believe no car in cars/*.yml accually support this yet but its in the doc so I will add it anyways
                for (const name of car.names)
                    if (name.toLowerCase().includes(query)) {
                        results[carId] = car;
                        continue func1;
                    }

            if (car.codes)
                for (const [key, values] of Object.entries(car.codes)) {
                    if (key.toLowerCase().includes(query)) {
                        results[carId] = car;
                        continue func1;
                    }
                    if (typeof values === 'string') {
                        if (values.toLowerCase().includes(query)) {
                            results[carId] = car;
                            continue func1;
                        }
                    } else
                        for (const value of values)
                            if (value.toLowerCase().includes(query)) {
                                results[carId] = car;
                                continue func1;
                            }
                }
        }


        res.send(results);

    })
}