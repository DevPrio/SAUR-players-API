const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('players.json');
const middlewares = jsonServer.defaults();
const port = process.env.PORT || 4000;

const RequestPromise = require("request-promise")
Cheerio = require("cheerio"),
    fetch = require("node-fetch");


const editJsonFile = require("edit-json-file");

// If the file doesn't exist, the content will be an empty object by default.
let file = editJsonFile(`${__dirname}/players.json`);

// Set a couple of fields

async function scrape() {
    let players = []
    let staffs = []
    let url = "https://www.game-state.com/193.70.80.143:22003/"
    let options = {
        url,
        transform: function (body) {
            return Cheerio.load(body)
        }
    }
    const $ = await RequestPromise(options);
    $("#playerslist table tbody").text().split("\n").forEach(element => {
        if (element.length > 0 && element !== "0" && element !== 0 && element !== "Players" && element !== "Score" && element !== " " && element !== " 0") {
            players.push(element);
        }
    });
    let staffTags = ["*SAUR*", "*SAUR\\*", "[SAUR]", "{SAUR}", "(SAUR)", "AeroXbird", "Infinate", "Crotchy", "Castillo"];
    players.forEach(p => {
        staffTags.forEach(element_1 => {
            if (p.includes(element_1))
                return staffs.push(p);
        });
    });
    DB = players;
    players = players;
    staffs = staffs;
    staffsNumber = staffs.length;
    playersNumber = players.length;
    return [players, staffs];

}

async function APIFY() {
    let data = await scrape();
    let players = data[0];
    return players
}

setInterval(async () => {
    await APIFY().then(async players => {
        file.set("players", players);
        console.log(players)
        var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
        var xhr = new XMLHttpRequest();
        let req = new XMLHttpRequest();

        req.onreadystatechange = () => {
            if (req.readyState == XMLHttpRequest.DONE) {
                console.log(req.responseText);
            }
        };

        req.open("POST", "https://saurapi.herokuapp.com/players", true);
        req.setRequestHeader("Content-Type", "application/json");
        //req.setRequestHeader("X-Master-Key", "$2b$10$Po3n31bGWy5qjfomOHAy7u5h7Ms.RaHc84cZT7IBj4w8xVsAW3ree");
        req.send(`{"players": "${players.join(",")}"}`);

        server.use(jsonServer.rewriter({'/players': players }))
        console.log(file.get());
        file.save();
    })
}, 10000)


server.use(middlewares);
server.use(router);

server.listen(port);
