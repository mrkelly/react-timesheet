var q = require('q');
var Router = require('react-router').Router;

var securityContext = require('./context');
var retryQueue = require('./retry.queue');
var notifications = require('../services/notifications');

var authentication = {

  initialize: function () {
    var self = this;

    // Register a handler for when an item is added to the retry retryQueue
    // This forces the login page on entry.
    retryQueue.onItemAddedCallbacks.push(function (retryItem) {
      if ( retryQueue.hasMore() ) {
        self.showLogin();
      }
    });

    return self;
  },

  // Get the first reason for needing a login
  getLoginReason: function () {
    return retryQueue.retryReason();
  },

  // Show the login form
  showLogin: function () {
    // Get the current path and redirect param
    var path = window.location.pathname,
      redirectParam = window.location.search.redirect;

    // If the redirect param is defined and it's the login page
    // (which can happen when the user refreshes the login page without
    //  a redirect param)
    if (redirectParam && decodeURIComponent(redirectParam) === '/app/login') {
      // Set the redirect to root so we don't show the login page again after
      // successful authentication
      redirectParam = encodeURIComponent('/');
    }

    // If the current path is login and a redirect is defined,
    // go to the login state which preserving the current redirect param
    if (path === '/login' && redirectParam) {
      Router.transitionTo('login', {}, {redirect: redirectParam});

    // Otherwise, encode the current path URL as a redirect parameter to we can
    // redirect to it on successful authentication
    } else {
      Router.transitionTo('login', {}, {redirect: encodeURIComponent(path)});
    }
  },

  // Attempt to authenticate a user by the given email and password
  login: function (username, password) {
    var deferred = q.defer();

    data.login({username: username, password: password})
      .then(function (user) {
        securityContext.setAuthentication(user);

        if (securityContext.authenticated) {
          retryQueue.retryAll();
        }

        deferred.resolve(user);
      },
      function (x) {
        deferred.reject(x);
      });

    return deferred.promise;
  },

  // Logout the current user and redirect
  logout: function (redirectTo) {
    data.logout()
      .then(function () {
        securityContext.reset();
        window.location.assign('/');
      });
  },

  // Ask the backend to see if a user is already authenticated - this may be from a previous session.
  requestCurrentUser: function () {

    if ( securityContext.authenticated ) {
      return q.when(securityContext);
    } else {
      return data.login(null, true)
        .then(function (user) {
          securityContext.setAuthentication(user);

          if (securityContext.user && securityContext.user.username) {
            notifications.success("Welcome Back, " + securityContext.user.username + ".");
          }

          return securityContext;
        });
    }
  }
};

module.exports = authentication.initialize();
