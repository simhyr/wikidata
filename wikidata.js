let https = require('https');
let URL = require('url');

module.exports = class WikidataAPI {
    constructor(config) {
        this._config = config;
        
        this._basePath = `/w/api.php?action=wbsearchentities&language=${this._config.language}&format=${this._config.format}`;
        this._hostName = 'wikidata.org';
    }

    getAsync(search, callback) {
        let completePath = this._basePath + `&search=${search}`;

        var httpOptions = {
            hostname: this._hostName,
            port: 443,
            path: completePath,
        };

        this._httpGet(httpOptions, callback);
    }

    _httpGet(options, callback) {
        let self = this;
        https.get(options, (res) => {
            // moved to different url
            if(res.statusCode == 301) {
                var url = URL.parse(res.headers.location);
                if(url.hostname)
                    options.hostname = url.hostname;
                
                options.path = url.path;
                if(!options.headers) 
                    options.headers = {};
                options.headers.cookie = res.headers['set-cookie'];
            
                // console.log('statusCode == 301');
        
                self._httpGet(options, callback);
                return;
            }
        
            // too many requests
            if(res.statusCode == 429) {
                var retrySeconds = res.headers['retry-after'];
                var retryAfter = parseInt(retrySeconds) * 1000 || 5000;
                setTimeout(() => self._httpGet(options, callback), retryAfter);
                return;
            }
        
            var json = '';
            res.on('data', (data) => {
                json += data.toString();
            });
        
            res.on('end', () => callback(json));
        });
    }
}