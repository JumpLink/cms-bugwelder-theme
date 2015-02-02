/**
 * UserController
 *
 * @module      :: Controller
 * @description :: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {
  setup: function (req, res, next) {
    async.waterfall([
      function destroyAll(callback){
        sails.log.debug("destroyAll");
        User.destroy({}, function (error, destroyed) {
          sails.log.debug(destroyed);
          callback(error);
        });
      },
      function getNewSetup (callback){
        sails.log.debug("getNewSetup");
        SetupService.users(callback);
      },
      function createNewSetup (newValue, callback){
        sails.log.debug("createNewSetup");
        User.create(newValue, callback);
      },
    ], function (err, result) {
      sails.log.debug("done");
      if(err)
        res.json(err);
      else
        res.json(result);
    });
  }
  , update: function (req, res, next) {
    var id = req.param('id');
    var data = req.params.all();
    User.update({id:id},data).exec(function update(error, updated){
      if(error) return res.serverError(error);
      User.publishUpdate(updated[0].id, updated[0]);
      res.json(updated);
    });
  }
  , destroy: function(req, res) {
    var id = req.param('id');
    User.destroy(id, function (error, destroyed) {
      if(error) return res.serverError(error);
      User.publishDestroy(id);
      sails.log.debug(destroyed);
      res.ok();
    });
  }
  , create: function(req, res) {
    var data = req.params.all();
    User.create(data, function (error, created) {
      if(error) return res.serverError(error);
      User.publishCreate(created);
      sails.log.debug(created);
      res.ok();
    });
  }
};