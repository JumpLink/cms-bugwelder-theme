// window.saveAs
// Shims the saveAs method, using saveBlob in IE10.
// And for when Chrome and FireFox get round to implementing saveAs we have their vendor prefixes ready.
// But otherwise this creates a object URL resource and opens it on an anchor tag which contains the "download" attribute (Chrome)
// ... or opens it in a new tab (FireFox)
// @author Andrew Dodson
// @copyright MIT, BSD. Free to clone, modify and distribute for commercial and personal use.
// https://gist.github.com/MrSwitch/3552985

window.saveAs || ( window.saveAs = (window.navigator.msSaveBlob ? function(b,n){ return window.navigator.msSaveBlob(b,n); } : false) || window.webkitSaveAs || window.mozSaveAs || window.msSaveAs || (function(){
  // URL's
  window.URL || (window.URL = window.webkitURL);
  if(!window.URL){
    return false;
  }
  return function(blob,name){
    var url = URL.createObjectURL(blob);
    // Test for download link support
    if( "download" in document.createElement('a') ){
      var a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('download', name);
      // Create Click event
      var clickEvent = document.createEvent ("MouseEvent");
      clickEvent.initMouseEvent ("click", true, true, window, 0,
        event.screenX, event.screenY, event.clientX, event.clientY,
        event.ctrlKey, event.altKey, event.shiftKey, event.metaKey,
        0, null);
      // dispatch click event to simulate download
      a.dispatchEvent (clickEvent);
    }
    else{
      // fallover, open resource in new tab.
      window.open(url, '_blank', '');
    }
  };
})());

if (typeof jumplink === 'undefined') {
  var jumplink = {};
}

// Sourde: https://github.com/darius/requestAnimationFrame
// Adapted from https://gist.github.com/paulirish/1579671 which derived from
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller.
// Fixes from Paul Irish, Tino Zijdel, Andrew Mao, Klemen Slavič, Darius Bacon

// MIT license

if (!Date.now)
    Date.now = function() { return new Date().getTime(); };

(function() {
    'use strict';

    var vendors = ['webkit', 'moz'];
    for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
        var vp = vendors[i];
        window.requestAnimationFrame = window[vp+'RequestAnimationFrame'];
        window.cancelAnimationFrame = (window[vp+'CancelAnimationFrame']
                                   || window[vp+'CancelRequestAnimationFrame']);
    }
    if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) // iOS6 is buggy
        || !window.requestAnimationFrame || !window.cancelAnimationFrame) {
        var lastTime = 0;
        window.requestAnimationFrame = function(callback) {
            var now = Date.now();
            var nextTime = Math.max(lastTime + 16, now);
            return setTimeout(function() { callback(lastTime = nextTime); },
                              nextTime - now);
        };
        window.cancelAnimationFrame = clearTimeout;
    }
}());

jumplink.cms = angular.module('jumplink.cms', [
  'ngMaterial'                // Angular Material: https://github.com/angular/material
  , 'ngAria'                  // https://github.com/angular/bower-angular-aria
  , 'ngMdIcons'               // https://github.com/klarsys/angular-material-icons
  , 'ui.router'               // AngularUI Router: https://github.com/angular-ui/ui-router
  , 'ngAnimate'               // ngAnimate: https://docs.angularjs.org/api/ngAnimate
  , 'ngSanitize'              // ngSanitize: https://docs.angularjs.org/api/ngSanitize
  , 'sails.io'                // angularSails: https://github.com/balderdashy/angularSails
  //, 'webodf'                  // custom module
  , 'FBAngular'               // angular-fullscreen: https://github.com/fabiobiondi/angular-fullscreen
  //, 'mgcrea.ngStrap'          // AngularJS 1.2+ native directives for Bootstrap 3: http://mgcrea.github.io/angular-strap/
  , 'angularMoment'           // Angular.JS directive and filters for Moment.JS: https://github.com/urish/angular-moment
  // , 'wu.masonry'              // A directive to use masonry with AngularJS: http://passy.github.io/angular-masonry/
  //, 'angular-carousel'        // An AngularJS carousel implementation optimised for mobile devices: https://github.com/revolunet/angular-carousel
  // , 'textAngular'             // A radically powerful Text-Editor/Wysiwyg editor for Angular.js: https://github.com/fraywing/textAngular
  , 'angular-medium-editor'   // AngularJS directive for Medium.com editor clone: https://github.com/thijsw/angular-medium-editor
  , 'ui.ace'                  // This directive allows you to add ACE editor elements: https://github.com/angular-ui/ui-ace
  //, 'leaflet-directive'       // AngularJS directive to embed an interact with maps managed by Leaflet library: https://github.com/tombatossals/angular-leaflet-directive
  //, 'toaster'                 // AngularJS Toaster is a customized version of "toastr" non-blocking notification javascript library: https://github.com/jirikavi/AngularJS-Toaster
  , 'angularFileUpload'       // Angular File Upload is a module for the AngularJS framework: https://github.com/nervgh/angular-file-upload
  //, 'angular-filters'         // Useful filters for AngularJS: https://github.com/niemyjski/angular-filters
]);

jumplink.cms.config( function($stateProvider, $urlRouterProvider, $locationProvider) {

  // use the HTML5 History API
  $locationProvider.html5Mode(false);

  $urlRouterProvider.otherwise('/shipping');

  $stateProvider
  // LAYOUT
  .state('layout', {
    abstract: true
    , templateUrl: "layout"
    , controller: 'LayoutController'
  })
  // shipping
  .state('layout.shipping', {
    url: '/shipping'
    , resolve:{
      about: function($sailsSocket) {
        return $sailsSocket.get('/content?name=about', {name: 'about'}).then (function (data) {
          if(angular.isUndefined(data) || angular.isUndefined(data.data[0]))
            return null;
          else
            return html_beautify(data.data[0].content);
        });
      }
      , goals: function($sailsSocket, $timeout) {
        return $sailsSocket.get('/content?name=goals', {name: 'goals'}).then (function (data) {
          if(angular.isUndefined(data) || angular.isUndefined(data.data[0]))
            return null;
          else
            return html_beautify(data.data[0].content);
        });
      }
    }
    , views: {
      'content' : {
        templateUrl: 'shipping/content'
        , controller: 'ShippingContentController'
      }
      , 'left-sidenav' : {
        templateUrl: 'left-sidenav'
        , controller: 'LeftSidenavController'
      }
      , 'right-sidenav' : {
        templateUrl: 'right-sidenav'
        , controller: 'RightSidenavController'
      }
      , 'footer' : {
        templateUrl: 'footer'
        , controller: 'FooterController'
      }
    }
  })
  // gallery
  .state('layout.gallery', {
    url: '/gallery'
    , resolve:{
      images: function($sailsSocket) {
        return $sailsSocket.get('/gallery?limit=0').then (function (data) {
          return data.data;
        });
      }
    }
    , views: {
      'content' : {
        templateUrl: 'gallery/content'
        , controller: 'GalleryContentController'
      }
      , 'left-sidenav' : {
        templateUrl: 'left-sidenav'
        , controller: 'LeftSidenavController'
      }
      , 'footer' : {
        templateUrl: 'footer'
        , controller: 'FooterController'
      }
    }
  })
  .state('layout.gallery-fullscreen', {
    url: '/gallery/fs/:id'
    , resolve:{
      image: function($sailsSocket, $stateParams, $log) {
        $log.debug("$stateParams", $stateParams);
        return $sailsSocket.get('/gallery/'+$stateParams.id).then (function (data) {
          $log.debug('/gallery/'+$stateParams.id, data);
          return data.data;
        });
      }
    }
    , views: {
      'content' : {
        templateUrl: 'gallery/fullscreen'
        , controller: 'GalleryFullscreenController'
      }
      , 'left-sidenav' : {
        templateUrl: 'left-sidenav'
        , controller: 'LeftSidenavController'
      }
      // , 'footer' : {
      //   templateUrl: 'footer'
      //   , controller: 'FooterController'
      // }
    }
  })
  // gallery slideshow
  .state('layout.gallery-slider', {
    url: '/slider/:slideIndex'
    , resolve:{
      images: function($sailsSocket) {
        return $sailsSocket.get('/gallery?limit=0').then (function (data) {
          return data.data;
        });
      }
    }
    , views: {
      'content' : {
        templateUrl: 'gallery/slider'
        , controller: 'GallerySlideController'
      }
      , 'left-sidenav' : {
        templateUrl: 'gallery/left-sidenav'
        , controller: 'LeftSidenavController'
      }
    }
  })
  // events timeline
  .state('layout.timeline', {
    url: '/events'
    , resolve:{
      events: function($sailsSocket, eventService) {
        return $sailsSocket.get('/timeline').then (function (data) {
          return eventService.split(data.data);
        });
      }
    }
    , views: {
      'content' : {
        templateUrl: 'events/timeline'
        , controller: 'TimelineController'
      }
      , 'left-sidenav' : {
        templateUrl: 'left-sidenav'
        , controller: 'LeftSidenavController'
      }
      , 'footer' : {
        templateUrl: 'footer'
        , controller: 'FooterController'
      }
    }
  })
  // members
  .state('layout.members', {
    url: '/members'
    , resolve:{
      members: function($sailsSocket, $filter) {
        return $sailsSocket.get('/member').then (function (data) {
          return $filter('orderBy')(data.data, 'position');
        });
      }
    }
    , views: {
      'content' : {
        templateUrl: 'members/content'
        , controller: 'MembersController'
      }
      , 'left-sidenav' : {
        templateUrl: 'left-sidenav'
        , controller: 'LeftSidenavController'
      }
      , 'footer' : {
        templateUrl: 'footer'
        , controller: 'FooterController'
      }
      // 'adminbar': {
      //   templateUrl: 'adminbar'
      // }
    }
  })
  // application
  .state('layout.application', {
    url: '/application'
    , resolve:{
      application: function($sailsSocket) {
        return $sailsSocket.get('/content?name=application', {name: 'application'}).then (function (data) {
          if(angular.isDefined(data) && angular.isDefined(data.data[0]) && angular.isDefined(data.data[0].content))
            return html_beautify(data.data[0].content);
          else
            return null;
        });
      }
    }
    , views: {
      'content' : {
        templateUrl: 'application/content'
        , controller: 'ApplicationController'
      }
      , 'left-sidenav' : {
        templateUrl: 'left-sidenav'
        , controller: 'LeftSidenavController'
      }
      , 'footer' : {
        templateUrl: 'footer'
        , controller: 'FooterController'
      }
    }
  })
  // imprint
  .state('layout.imprint', {
    url: '/imprint'
    , resolve:{
      imprint: function($sailsSocket) {
        return $sailsSocket.get('/content?name=imprint', {name: 'imprint'}).then (function (data) {
          if(angular.isUndefined(data) || angular.isUndefined(data.data[0]))
            return null;
          else
            return html_beautify(data.data[0].content);
        });
      }
    }
    , views: {
      'content' : {
        templateUrl: 'imprint/content'
        , controller: 'ImprintController'
      }
      , 'left-sidenav' : {
        templateUrl: 'left-sidenav'
        , controller: 'LeftSidenavController'
      }
      , 'footer' : {
        templateUrl: 'footer'
        , controller: 'FooterController'
      }
    }
  })
  // links
  .state('layout.links', {
    url: '/links'
    , resolve:{
      links: function($sailsSocket) {
        return $sailsSocket.get('/content?name=links', {name: 'links'}).then (function (data) {
          if(angular.isUndefined(data) || angular.isUndefined(data.data[0]))
            return null;
          else
            return html_beautify(data.data[0].content);
        });
      }
    }
    , views: {
      'content' : {
        templateUrl: 'links/content'
        , controller: 'LinksController'
      }
      , 'left-sidenav' : {
        templateUrl: 'left-sidenav'
        , controller: 'LeftSidenavController'
      }
      , 'footer' : {
        templateUrl: 'footer'
        , controller: 'FooterController'
      }
    }
  })
  // administration
  .state('layout.administration', {
    url: '/admin'
    , resolve:{
      themeSettings: function($sailsSocket) {
        return $sailsSocket.get('/theme/find').then (function (data) {
          console.log(data);
          return data.data;
        });
      }
    }
    , views: {
      'content' : {
        templateUrl: 'administration/settings'
        , controller: 'AdminController'
      }
      , 'left-sidenav' : {
        templateUrl: 'left-sidenav'
        , controller: 'LeftSidenavController'
      }
    }
  })
  .state('layout.users', {
    url: '/users'
    , resolve:{
      users: function($sailsSocket) {
        return $sailsSocket.get('/user').then (function (data) {
          return data.data;
        });
      }
    }
    , views: {
      'content' : {
        templateUrl: 'administration/users'
        , controller: 'UsersController'
      }
      , 'left-sidenav' : {
        templateUrl: 'left-sidenav'
        , controller: 'LeftSidenavController'
      }
    }
  })
  .state('layout.user', {
    url: '/user/:index'
    , resolve:{
      user: function($sailsSocket, $stateParams) {
        return $sailsSocket.get('/user'+'/'+$stateParams.index).then (function (data) {
          delete data.data.password;
          return data.data;
        });
      }
    }
    , views: {
      'content' : {
        templateUrl: 'administration/user'
        , controller: 'UserController'
      }
      , 'left-sidenav' : {
        templateUrl: 'left-sidenav'
        , controller: 'LeftSidenavController'
      }
    }
  })
  .state('layout.new-user', {
    url: '/new/user'
    , views: {
      'content' : {
        templateUrl: 'administration/user'
        , controller: 'UserNewController'
      }
      , 'left-sidenav' : {
        templateUrl: 'left-sidenav'
        , controller: 'LeftSidenavController'
      }
    }
  })
  ;
});
