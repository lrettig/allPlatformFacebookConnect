/**
 * @author Lane Rettig <lanerettig@gmail.com>
 * @copyright Lane Rettig, 2015
 * @file - allPlatformFacebookConnect.js
 * @about - Wraps JavaScript interface for PhoneGap bridge to Facebook Connect SDK
 * @license - MIT
 *
 * Based on: com.phonegap.plugins.facebookconnect (the official plugin for
 * Facebook in Apache Cordova/PhoneGap)
 * https://github.com/Wizcorp/phonegap-facebook-plugin
 *
 */

angular.module('allPlatformFacebookConnect', [])
    .factory('facebookConnect', function () {

        var fbAppId = '<MUST BE SET>';
        var hasBeenInitialized = false;

        if (window.cordova) {
            console.log('Running in cordova, using native FB SDK');
            hasBeenInitialized = true;

            var allPlatformFacebookConnect = {
                getLoginStatus: function (s, f) {
                    return facebookConnectPlugin.getLoginStatus(s, f);
                },
                login: function(permissions, s, f) {
                    return facebookConnectPlugin.login(permissions, s, f)
                },
                showDialog: function (options, s, f) {
                    return facebookConnectPlugin.showDialog(options, s, f);
                },
                getAccessToken: function (s, f) {
                    return facebookConnectPlugin.getAccessToken(s, f);
                },
                logEvent: function (eventName, params, valueToSum, s, f) {
                    return facebookConnectPlugin.logEvent(eventName, params, valueToSum, s, f);
                },
                logPurchase: function (value, currency, s, f) {
                    return facebookConnectPlugin.logPurchase(value, currency, s, f);
                },
                logout: function (s, f) {
                    return facebookConnectPlugin.logout(s, f);
                },
                api: function (graphPath, permissions, s, f) {
                    return facebookConnectPlugin.api(graphPath, permissions, s, f);
                }
            };

            return allPlatformFacebookConnect;
        }

        else {
            console.log('Running in browser, using FB JS SDK');

            var initFB = function (appId, version) {
                if (!version) {
                    version = "v2.0";
                }

                FB.init({
                    appId: appId,
                    cookie: true,
                    xfbml: true,
                    status: true,
                    version: version
                });

                hasBeenInitialized = true;
            };

            if (window.FB) {
                console.log('Browser FB SDK already loaded');
                initFB(fbAppId);
            }
            else {
                window.fbAsyncInit = function() {
                    console.log('Browser FB SDK not loaded yet, waiting for fbAsyncInit to init FB SDK.');
                    initFB(fbAppId);
                };
            }

            var allPlatformFacebookConnect = {

                getLoginStatus: function (s, f) {
                    var thisMethod = function () {

                        var requestFailed = function () {
                            console.log('FB is unresponsive');
                            f('FB is unresponsive');
                        };

                        var timeoutHandler = setTimeout(function() { requestFailed(); }, 2000);

                        // Try will catch errors when SDK has not been init
                        try {
                            FB.getLoginStatus(function (response) {
                                clearTimeout(timeoutHandler);
                                if (s) {
                                    s(response);
                                }
                            });
                        } catch (error) {
                            clearTimeout(timeoutHandler);
                            if (!f) {
                                console.error(error.message);
                            } else {
                                f(error.message);
                            }
                        }
                    };

                    // Make sure the SDK has been initialized before running.
                    // If it hasn't, queue it up to run once it's been
                    // initialized.
                    // TODO: This should be done for all methods, not just this
                    // one.
                    if (hasBeenInitialized) {
                        thisMethod();
                    }
                    else {
                        console.log(
                            'getLoginStatus called before SDK init, postponing'
                        );
                        var oldFbAsyncInit = window.fbAsyncInit;
                        window.fbAsyncInit = function() {
                            console.log('Running new fbAsyncInit');
                            if (oldFbAsyncInit) {
                                oldFbAsyncInit();
                            }
                            thisMethod();
                        }
                    }
                },

                showDialog: function (options, s, f) {

                    if (!options.name) {
                        options.name = "";
                    }
                    if (!options.message) {
                        options.message = "";
                    }
                    if (!options.caption) {
                        options.caption = "";
                    }
                    if (!options.description) {
                        options.description = "";
                    }
                    if (!options.href) {
                        options.href = "";
                    }
                    if (!options.picture) {
                        options.picture = "";
                    }

                    // Try will catch errors when SDK has not been init
                    try {
                        FB.ui(options,
                            function (response) {
                                if (response && (response.request || !response.error_code)) {
                                    s(response);
                                } else {
                                    f(response);
                                }
                            });
                    } catch (error) {
                        if (!f) {
                            console.error(error.message);
                        } else {
                            f(error.message);
                        }
                    }
                },
                // Attach this to a UI element, this requires user interaction.
                login: function (permissions, s, f) {
                    // JS SDK takes an object here but the native SDKs use array.
                    var permissionObj = {};
                    if (permissions && permissions.length > 0) {
                        permissionObj.scope = permissions.toString();
                    }

                    FB.login(function (response) {
                        if (response.authResponse) {
                            s(response);
                        } else {
                            f(response.status);
                        }
                    }, permissionObj);
                },

                getAccessToken: function (s, f) {
                    var response = FB.getAccessToken();
                    if (!response) {
                        if (!f) {
                            console.error("NO_TOKEN");
                        } else {
                            f("NO_TOKEN");
                        }
                    } else {
                        s(response);
                    }
                },

                logEvent: function (eventName, params, valueToSum, s, f) {
                    // AppEvents are not avaliable in JS.
                    s();
                },

                logPurchase: function (value, currency, s, f) {
                    // AppEvents are not avaliable in JS.
                    s();
                },

                logout: function (s, f) {
                    // Try will catch errors when SDK has not been init
                    try {
                        FB.logout( function (response) {
                            s(response);
                        });
                    } catch (error) {
                        if (!f) {
                            console.error(error.message);
                        } else {
                            f(error.message);
                        }
                    }
                },

                api: function (graphPath, permissions, s, f) {
                    // JS API does not take additional permissions

                    // Try will catch errors when SDK has not been init
                    try {
                        FB.api(graphPath, function (response) {
                            if (response.error) {
                                f(response);
                            } else {
                                s(response);
                            }
                        });
                    } catch (error) {
                        if (!f) {
                            console.error(error.message);
                        } else {
                            f(error.message);
                        }
                    }
                }
            };
        }

        return allPlatformFacebookConnect;
    }
);
