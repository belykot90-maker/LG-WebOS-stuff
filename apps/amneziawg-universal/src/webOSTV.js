/* Minimal webOS TV service bridge for this app (MIT, copyright 2026).
 * Replaces the third-party SDK bundle in the public release.
 * Compatible with PalmServiceBridge in webOS TV 4.x.
 */
(function (w) {
  'use strict';
  w.webOS = {
    platformBack: function () {
      if (w.PalmSystem && w.PalmSystem.platformBack) w.PalmSystem.platformBack();
    },
    service: {
      request: function (service, opt) {
        var success = opt.onSuccess || function () {};
        var failure = opt.onFailure || function () {};
        if (!w.PalmServiceBridge) {
          failure({errorText: 'PalmServiceBridge is unavailable'});
          return {cancel: function () {}};
        }
        var bridge = new w.PalmServiceBridge();
        bridge.onservicecallback = function (payload) {
          var result;
          try { result = JSON.parse(payload); }
          catch (e) { failure({errorText: 'Invalid Luna service response'}); return; }
          if (result.returnValue === false || result.errorCode) failure(result);
          else success(result);
        };
        var uri = service + (service.charAt(service.length - 1) === '/' ? '' : '/') + opt.method;
        bridge.call(uri, JSON.stringify(opt.parameters || {}));
        return {cancel: function () { if (bridge && bridge.cancel) bridge.cancel(); }};
      }
    }
  };
})(window);
