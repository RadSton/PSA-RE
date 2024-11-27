
const requestJSON = (method, url) => {
    return new Promise((res, rej) => {
        const xml = new XMLHttpRequest();
        xml.onload = () => {
            try {
                res(JSON.parse(xml.response));
            } catch (error) {
                rej(error);
            }
        }
        xml.open(method, url);
        xml.send();
    })
}

const requestJSONWithBody = (method, url, body) => {
    return new Promise((res, rej) => {
        const xml = new XMLHttpRequest();
        xml.onload = () => {
            try {
                res(JSON.parse(xml.response));
            } catch (error) {
                rej(error);
            }
        }
        xml.open(method, url);
        xml.setRequestHeader("Content-Type", "application/json")
        xml.send(JSON.stringify(body));
    })
}
