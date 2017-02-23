// Pagination functions

var currentItems = function (total, start, limit) {
    if (limit > (total - start)) {
        return (total - (start - 1));
    }
    if (limit >= total) {
        return total;
    } else {
        return limit;
    }
};

var numberOfPages = function (total, start, limit) {
    return Math.ceil(total / limit);
};

var currentPage = function (total, start, limit) {
    return Math.ceil(start / limit);
};

var getFirstQueryString = function (total, start, limit) {
    return "?start=1&limit=" + limit;
};

var getLastQueryString = function (total, start, limit) {
    if (total % limit == 0) {
        return "?start=" + (total - limit + 1) + "&limit=" + limit;
    } else {
        return "?start=" + (total - (total % limit) + 1) + "&limit=" + limit;
    }
};

var getPreviousQueryString = function (total, start, limit) {
    if (start - limit <= 0) {
        return getFirstQueryString(total, start, limit);
    } else {
        return "?start=" + (start - limit) + "&limit=" + limit;
    }
};

var getNextQueryString = function (total, start, limit) {
    if (total < start + limit) {
        return getLastQueryString(total, start, limit);
    } else {
        return "?start=" + (start + limit) + "&limit=" + limit;
    }
};

var getPagination = function (total, start, limit, req, res) {
    var firstPage = 1;
    var lastPage = numberOfPages(total, start, limit);
    var previousPage = 0;
    var nextPage = 0;

    if (currentPage(total, start, limit) == 1) {
        previousPage = 1;
    } else {
        previousPage = currentPage(total, start, limit) - 1;
    }
    if (currentPage(total, start, limit) == numberOfPages(total, start, limit)) {
        nextPage = numberOfPages(total, start, limit);
    } else {
        nextPage = currentPage(total, start, limit) + 1;
    }

    return {
        "currentPage": currentPage(total, start, limit),
        "currentItems": currentItems(total, start, limit),
        "totalPages": numberOfPages(total, start, limit),
        "totalItems": total,
        "_links": {
            "first": {
                "page": firstPage,
                "href": "http://" + req.headers.host + "/afta/heroes" + getFirstQueryString(total, start, limit)
            },
            "last": {
                "page": lastPage,
                "href": "http://" + req.headers.host + "/afta/heroes" + getLastQueryString(total, start, limit)
            },
            "previous": {
                "page": previousPage,
                "href": "http://" + req.headers.host + "/afta/heroes" + getPreviousQueryString(total, start, limit)
            },
            "next": {
                "page": nextPage,
                "href": "http://" + req.headers.host + "/afta/heroes" + getNextQueryString(total, start, limit)
            }
        }
    };
};


// HTTP request functions

var heroController = function (Hero) {
    var options = function (req, res) {
        res.header('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, DELETE');
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Accept, Content-Type');
        res.status(200).send();
    };

    var get = function (req, res) {
        if (!(req.header('Accept') == 'application/json')) {
            res.status(406).send('Not a supported format');
        } else {
            var query = {};
            if (req.query.type) {
                query.type = req.query.type;
            }
            if (req.query.attribute) {
                query.attribute = req.query.attribute;
            }
            var start;
            if (req.query.start) {
                start = parseInt(req.query.start);
            }
            var limit;
            if (req.query.limit) {
                limit = parseInt(req.query.limit);
            }

            Hero.find(query, function (err, heroes) {
                if (err) {
                    res.status(500).send(err);
                } else {
                    var returnHeroes = [];
                    heroes.forEach(function (element, index, array) {
                        var newHero = element.toJSON();
                        newHero._links = {};
                        newHero._links.self = {'href': 'http://' + req.headers.host + '/afta/heroes/' + newHero._id};
                        newHero._links.collection = {'href': 'http://' + req.headers.host + '/afta/heroes/'};
                        returnHeroes.push(newHero);
                    });

                    if ((start === undefined) && (limit === undefined)) {
                        start = 1;
                        limit = returnHeroes.length;
                    } else if (!(start === undefined) && (limit === undefined)) {
                        if (start == 0) {
                            start = 1;
                        }
                        limit = returnHeroes.length;
                    } else if ((start === undefined) && !(limit === undefined)) {
                        start = 1;
                    } else {
                        if (start == 0) {
                            start = 1;
                        }
                    }
                    start--;

                    var heroesCollection = {};
                    heroesCollection.items = returnHeroes.slice(start, start + limit);
                    heroesCollection._links = {};
                    heroesCollection._links.self = {'href': 'http://' + req.headers.host + '/afta/heroes/'};
                    heroesCollection.pagination = getPagination(returnHeroes.length, (start + 1), limit, req, res);
                    res.json(heroesCollection);
                }
            });
        }
    };

    var post = function (req, res) {
        var hero = new Hero(req.body);
        if (!req.body.name) {
            res.status(400).send('A hero needs a name');
        } else if (!req.body.type) {
            res.status(400).send('A hero needs a type');
        } else if (!req.body.attribute) {
            res.status(400).send('A hero needs an attribute');
        } else if (!req.body.rank) {
            res.status(400).send('A hero needs a rank');
        } else if (!req.body.image) {
            res.status(400).send('A hero needs an image');
        } else {
            hero.save();
            res.status(201).send(hero);
        }
    };

    return {
        options: options,
        get: get,
        post: post
    }
};

module.exports = heroController;