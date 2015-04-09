var querystring = require('querystring'),
    request = require('request');

function getStocks(route, args) {
    var i18n = this.i18n;

    if (args.length === 0) {
        route.send('?stocks_symbol_invalid');
        return;
    }

    // Parse stock symbols from the args
    var symbols = args.map(function (symbol) {
        return symbol.replace(/,/g, '');
    });

    // Set up the URL for the request
    var url = 'http://www.google.com/finance/info?infotype=infoquoteall&q=' + querystring.escape(symbols);

    // Make the request
    request.get(url, function (err, res, body) {

        if (res.statusCode === 200) {

            // Parse the response
            var response = JSON.parse(body.replace('\\x26','&').replace('// [','['));

            // If there is a response, parse/return it
            if (response.length > 0) {
                var stockValues = [];

                try {
                    for (var index in response) {
                        var values = [response[index].name,
                            (parseFloat(response[index].l) - parseFloat(response[index].c)).toFixed(2).toString(),
                            response[index].op,
                            response[index].l,
                            response[index].cp];

                        stockValues.push(i18n.doTemplate('stocks_symbol_value', values));
                    }
                    route.send('?stocks_response', symbols.join(', '), stockValues.join('\n'));
                } catch (e) {
                    console.log(e.stack);
                    route.send('?generic_error');
                }
            }

        } else {
            route.send('?stocks_symbol_invalid');
        }

    }.bind(this));
}

module.exports = {
    displayname : 'Stocks',
    description : 'Returns information for the requested stock symbol.',

    commands : [{
            name : 'Stocks',
            description : 'Returns information for the requested stock symbol.',
            usage : 'stock [search term]',
            trigger : /stock/i,
            func : getStocks
        }
    ]
};
