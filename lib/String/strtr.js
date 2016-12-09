'use strict';

global.__jymfony = global.__jymfony || {};

global.__jymfony.strtr = function (string, replacePairs) {
    let str = string.toString(), key, re;

    for (key in replacePairs) {
        if (replacePairs.hasOwnProperty(key)) {
            re = new RegExp(key, "g");
            str = str.replace(re, replacePairs[key]);
        }
    }

    return str;
};