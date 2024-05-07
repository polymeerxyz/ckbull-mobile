// polyfill_util.ts

// Implementación básica de algunas funciones del módulo util de Node.js en TypeScript

// Promisify: Convierte una función basada en callback en una función que devuelve una promesa.
export function promisify<T>(fn: Function): (...args: any[]) => Promise<T> {
    return (...args: any[]) => {
        return new Promise((resolve, reject) => {
            fn(...args, (err: Error | null, result: T) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    };
}

// Herencia de prototipos: Copia las propiedades del prototipo de una clase a otra.
export function inherits(ctor: Function, superCtor: Function): void {
    ctor.prototype = Object.create(superCtor.prototype);
    ctor.prototype.constructor = ctor;
}

// Verifica si el argumento proporcionado es una instancia de la clase especificada.
export function isInstanceOf(obj: any, clazz: Function): boolean {
    return obj instanceof clazz;
}
