const jsonServer = require('json-server');
let server = jsonServer.create();
let router = jsonServer.router('players.json');
let middlewares = jsonServer.defaults();
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
        transform: function(body) {
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

async function main() {
    await APIFY().then(async players => {
        const axios = require('axios');
        var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

        var url = "https://saurapi.herokuapp.com/players/1";

        axios.put(url, {
            players: players
        }).then(resp => {

            console.log(resp.data);
        }).catch(error => {

            console.log(error);
        });

    })
}

main()
setInterval(async () => {
    main()
}, 180000)



router.put("/players:id", function(req, res, next) {
    console.log(req)
    console.log(res)
})

server.use(middlewares);
server.use(router);
server.listen(port);
