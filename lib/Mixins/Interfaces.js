const Mixins = require('./Mixins');
const CLASS_TYPE = 'Interface';

const checkedClassesCache = new Set();

class Interfaces {
    /**
     * @param {*} mixin
     *
     * @returns {boolean}
     */
    static isInterface(mixin) {
        return mixin[Mixins.classTypeSymbol] === CLASS_TYPE;
    }

    /**
     * @param {Object} definition
     * @param {MixinInterface} parents
     *
     * @returns {Function}
     */
    static create(definition, ...parents) {
        for (const p of parents) {
            if (! Interfaces.isInterface(p)) {
                throw new TypeError(__jymfony.sprintf('Cannot use %s as interface', p.toString()));
            }
        }

        const checks = obj => {
            if (checkedClassesCache.has(obj.constructor)) {
                return;
            }

            for (const descriptor of Mixins.getFunctions(definition)) {
                if (descriptor.fn) {
                    if ('function' === typeof obj[descriptor.fn]) {
                        continue;
                    }

                    if ('__construct' === descriptor.fn) {
                        continue;
                    }

                    if (descriptor['static'] && 'function' === typeof obj.constructor[descriptor.fn]) {
                        continue;
                    }

                    throw new SyntaxError('Method "' + descriptor.fn + '" must be implemented.');
                } else if (descriptor.property) {
                    const target = descriptor['static'] ? obj.constructor : obj;
                    const targetDescriptor = Mixins.getPropertyDescriptor(target, descriptor.property);

                    if (undefined === targetDescriptor) {
                        throw new SyntaxError(
                            __jymfony.sprintf('Getter/Setter for "%s" property must be implemented.', descriptor.property)
                        );
                    }

                    if (descriptor['get'] && undefined === targetDescriptor.get) {
                        throw new SyntaxError('Getter for "' + descriptor.property + '" property must be implemented.');
                    }
                    if (descriptor['set'] && undefined === targetDescriptor.set) {
                        throw new SyntaxError('Setter for "' + descriptor.property + '" property must be implemented.');
                    }
                }
            }

            checkedClassesCache.add(obj.constructor);
        };

        const mixin = Mixins.createMixin(definition, undefined, checks);
        Object.setPrototypeOf(mixin, {
            definition: definition,
            [Mixins.classTypeSymbol]: CLASS_TYPE,
            [Mixins.superInterfaces]: parents,
            [Symbol.hasInstance]: Interfaces._createHasInstance(mixin),
        });

        return mixin;
    }

    /**
     * @param {Object} mixin
     *
     * @returns {Function}
     *
     * @private
     */
    static _createHasInstance(mixin) {
        return o => {
            let desc;
            if (null === o || undefined === o) {
                return false;
            } else if (Object.prototype.hasOwnProperty.call(o, '__self__')) {
                o = o.__self__;
            } else if ((desc = Object.getOwnPropertyDescriptor(o, Symbol.for('jymfony.namespace.class')))) {
                o = desc.value;
            }

            if (! isObject(o)) {
                return false;
            }

            const mixins = o.constructor && o.constructor[Mixins.appliedInterfacesSymbol];
            if (! mixins) {
                return false;
            }

            return -1 !== mixins.indexOf(mixin);
        };
    }
}

module.exports = Interfaces;
