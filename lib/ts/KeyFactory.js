'use strict';
var KeyFactory = (function () {
    function KeyFactory() {
    }
    KeyFactory.clubKeyMaker = function (clubname, cityname) {
        return "".concat(clubname, "~", cityname);
    };
    KeyFactory.clubKeyDecomposer = function (key) {
        var result = key.split("~");
        return { club: result[0], city: result[1] };
    };
    KeyFactory.squadKeyMaker = function (clubname, cityname, squadname, season) {
        return this.clubKeyMaker(clubname, cityname).concat('~', squadname, '~', season);
    };
    return KeyFactory;
}());
exports.KeyFactory = KeyFactory;
//# sourceMappingURL=KeyFactory.js.map