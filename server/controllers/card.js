var Card = require('../models/card.js'),
    User = require('../models/user.js'),
    request = require('request'),
    config = require('../config/secret.js'),
    jwt = require('jwt-simple');

var cardController = {

  /* Get individual card or all */
  getAll: function (req, res) {
    var header = req.headers.authorization.split(' ');
    var token = header[1];
    var payload = jwt.decode(token, config.tokenSecret);

    /* If there's a query parameter for _id,
    get the individual item */

    if(payload.id && req.query._id){
      User.findById( payload.id, function(err, results){
          console.log('found single card');
          var singleCard = results.cards.id(req.query._id);
          res.send(singleCard);
        });
    }

    /* Else get all cards if user is authenticated */
    else if (payload.id) {
      User.find({},'cards', function(err, results){
        if(err){
          console.log('can find cards: ', err);
        }
        console.log('sending all cards');
        res.send(results);
      });
    }

    else {

    }
  // });

  },

  /* Save card to DB */
  create: function(req, res){
    var newCard = new Card(req.body.cardData);
    var header = req.headers.authorization.split(' ');
    var token = header[1];
    var payload = jwt.decode(token, config.tokenSecret);
    console.log('payload: ', payload);
    User.findByIdAndUpdate(
      payload.id,
      {
        $push:{
          "cards": newCard
        }
      }, {safe:true, upsert:true},
      function(err){
        console.log(err);
      }
    );
    res.send('success');
  },

  /* Pull data from LinkedIN to build virtual card */
  build: function(req, res){
    console.log(req.headers.authorization);
    var header = req.headers.authorization.split(' ');
    var token = header[1];
    var payload = jwt.decode(token, config.tokenSecret);
    var LinkedInUrl = 'https://api.linkedin.com/v1/people/~:(formatted-name,summary,positions,skills,location,picture-url,public-profile-url,industry)';
    var params = {
      oauth2_access_token: payload.authToken,
      format: 'json'
    };

    request.get({url: LinkedInUrl, qs: params, json: true},
      function(err, response, profile){
      res.send(profile);
      });
  }
};

module.exports = cardController;