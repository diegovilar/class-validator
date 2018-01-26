import {PACKAGE_KEY} from "./constants";

/**
 * Container options.
 */
export interface UseContainerOptions {

    /**
     * If set to true, then default container will be used in the case if given container haven't returned anything.
     */
    fallback?: boolean;

    /**
     * If set to true, then default container will be used in the case if given container thrown an exception.
     */
    fallbackOnErrors?: boolean;

}

export interface IContainer {

    get<T>(someClass: { new(...args: any[]): T } | Function): T;
    get<T>(key: string | Symbol, someClass: { new(...args: any[]): T } | Function): T;

}

/**
 * Container to be used by this library for inversion control. If container was not implicitly set then by default
 * container simply creates a new instance of the given class.
 */
export class Container implements IContainer {
    private instances: { key: any, type: Function, object: any }[] = [];

    get<T>(someClass: Function | (new (...args: any[]) => T)): T;
    get<T>(key: string | Symbol, someClass: Function | (new (...args: any[]) => T)): T;
    get(key: any, someClass?: any) {

        if (arguments.length < 2) {
            someClass = key;
        }

        let instance = this.instances.find(instance => instance.key === key);

        if (!instance) {
            instance = { key, type: someClass, object: new someClass() };
            this.instances.push(instance);
        }

        return instance.object;

    }

}

const PACKAGE_SYMBOL = Symbol.for(`${PACKAGE_KEY}/TrueSingleton`);
const anyGlobal = global as any;

class TrueSingleton {

    static get instance(): TrueSingleton {

        const globalSymbols = Object.getOwnPropertySymbols(anyGlobal);
        const instance = (globalSymbols.indexOf(PACKAGE_SYMBOL) > -1) ? anyGlobal[PACKAGE_SYMBOL] : anyGlobal[PACKAGE_SYMBOL] = new TrueSingleton();
        return instance as TrueSingleton;

    }

    private readonly _defaultContainer = new Container();

    private _userContainer: Container | undefined;

    private _userContainerOptions: UseContainerOptions | undefined;

    private constructor() {

    }

    get defaultContainer() {

        return this._defaultContainer;

    }

    get userContainer() {

        return this._userContainer;

    }

    set userContainer(container: Container | undefined) {

        this._userContainer = container;

    }
    get userContainerOptions() {

        return this._userContainerOptions;

    }

    set userContainerOptions(options: UseContainerOptions | undefined) {

        this._userContainerOptions = options;

    }

}

const singleton = TrueSingleton.instance;

/**
 * Sets container to be used by this library.
 */
export function useContainer(iocContainer: Container, options?: UseContainerOptions) {
    singleton.userContainer = iocContainer;
    singleton.userContainerOptions = options;
}

/**
 * Gets the IOC container used by this library.
 */
export function getFromContainer<T>(someClass: { new(...args: any[]): T } | Function): T;
export function getFromContainer<T>(key: string | Symbol, someClass: { new(...args: any[]): T } | Function): T;
export function getFromContainer(key: any, someClass?: any) {

    if (arguments.length < 2) {
        someClass = key;
    }

    const userContainer = singleton.userContainer;
    const userContainerOptions = singleton.userContainerOptions;

    if (userContainer) {
        try {
            const instance = userContainer.get(key, someClass);
            if (instance) {
                return instance;
            }

            if (!userContainerOptions || !userContainerOptions.fallback) {
                return instance;
            }
        } catch (error) {
            if (!userContainerOptions || !userContainerOptions.fallbackOnErrors) {
                throw error;
            }
        }
    }

    return singleton.defaultContainer.get(key, someClass);

}
