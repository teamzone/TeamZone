'use strict';
var noCacheMiddleware = function (req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
};
module.exports = noCacheMiddleware;
//# sourceMappingURL=noCacheMiddleware.js.map