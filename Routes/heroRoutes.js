var express = require('express');

var routes = function (Hero) {
    var heroRouter = express.Router();

    var heroController = require('../Controllers/heroController')(Hero);
    heroRouter.route('/')
        .options(heroController.options)
        .get(heroController.get)
        .post(heroController.post);

    heroRouter.use('/:heroId', function (req, res, next) {
        Hero.findById(req.params.heroId, function (err, hero) {
            if (err) {
                res.status(500).send(err);
            } else if (hero) {
                req.hero = hero;
                next();
            } else {
                res.status(404).send('Hero not found');
            }
        });
    });

    heroRouter.route('/:heroId')
        .options(function (req, res) {
            res.setHeader('Allow', 'OPTIONS, GET, PUT, DELETE');
            res.status(200).send('OPTIONS, GET, PUT, DELETE');
        })

        .get(function (req, res) {
            var returnHero = req.hero.toJSON();
            returnHero._links = {};
            returnHero._links.self = {'href': 'http://' + req.headers.host + '/afta/heroes/' + returnHero._id};
            returnHero._links.collection = {'href': 'http://' + req.headers.host + '/afta/heroes/'};
            res.json(returnHero);
        })

        .put(function (req, res) {
            if (!req.body.name) {
                res.status(400).send("A hero needs a name");
            } else if (!req.body.type) {
                res.status(400).send("A hero needs a type");
            } else if (!req.body.attribute) {
                res.status(400).send("A hero needs an attribute");
            } else if (!req.body.rank) {
                res.status(400).send("A hero needs a rank");
            } else if (!req.body.image) {
                res.status(400).send("A hero needs an image");
            } else {
                req.hero.name = req.body.name;
                req.hero.type = req.body.type;
                req.hero.attribute = req.body.attribute;
                req.hero.rank = req.body.rank;
                req.hero.image = req.body.image;
                req.hero.save(function (err) {
                    if (err) {
                        res.status(500).send(err);
                    } else {
                        res.json(req.hero);
                    }
                });
            }
        })

        // .patch(function (req, res) {
        //     if (req.body._id) {
        //         delete req.body._id;
        //     }
        //     for (var p in req.body) {
        //         req.hero[p] = req.body[p];
        //     }
        //     req.hero.save(function (err) {
        //         if (err) {
        //             res.status(500).send(err);
        //         } else {
        //             res.json(req.hero);
        //         }
        //     });
        // })

        .delete(function (req, res) {
            req.hero.remove(function (err) {
                if (err) {
                    res.status(500).send(err);
                } else {
                    res.status(204).send('Removed');
                }
            });
        });

    return heroRouter;
};

module.exports = routes;