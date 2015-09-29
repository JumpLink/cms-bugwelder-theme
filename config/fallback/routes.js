exports.browser = function (req, res, next, force, showLegacyToast, page, route) {
  var routes = null;

  var host = req.session.uri.host;
  var site = null;
  var url = req.path;
  var title = "";
  if(UtilityService.isDefined(route) && UtilityService.isDefined(route.sitetitle)) title = route.sitetitle;

  MultisiteService.getCurrentSiteConfig(host, function (err, config) {
    if(err) return res.serverError(err);
    site = config.name;
    async.parallel([
      function(callback) {
        RoutesService.find(host, {}, function(err, routes) {
          callback(err, routes);
        });
      }
    ], function (err, results) {
      if(err) return res.serverError(err);

      routes = results[0];

      return ThemeService.view(req.session.uri.host, 'views/fallback/browser.jade', res, {
        showLegacyToast: showLegacyToast,
        force: force,
        host: host,
        url: url,
        routes: routes,
        useragent: req.useragent,
        title: title,
        config: {paths: sails.config.paths},
        isFallback: true,
        isModern: false,
        authenticated: false
      });
    });
  });
};