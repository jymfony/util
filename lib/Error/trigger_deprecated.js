'use strict';

global.__jymfony = global.__jymfony || {};

__jymfony.trigger_deprecated = function (message = '') {
    process.emitWarning(message, 'DeprecationWarning');
};
