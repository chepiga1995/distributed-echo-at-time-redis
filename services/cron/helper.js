

module.exports.promiseImmediate = function (func, ...args) {
    return new Promise((resolve, reject) => setImmediate(async () => {
        try {
            const result = func(...args);
            if(result instanceof Promise) {
                resolve(await result);
            } else {
                resolve(result);
            }
        } catch (error) {
            reject(error);
        }
    }));
};

