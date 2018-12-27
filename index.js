const _ = require('lodash');

let config = require('./config');
let wikidataClass = require('./wikidata');

let wikidata = new wikidataClass(config);

wikidata.getAsync('ccc', data => {
    let json = JSON.parse(data);
    let search = _.uniqBy(json.search, (e) => e.id);

    console.log(`>> Your search results for ${json.searchinfo.search}`);
    var mapping = search.map(function(e) {
        return {
            text: (!e.description) ? e.label : e.description,
            url: e.url.substr(2)
        };
    });

    for(let entry of mapping)
        console.log(`text="${entry.text}" url="${entry.url}"`);
});