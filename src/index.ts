export const DEFAULT_RETRIES = 10;
export const DEFAULT_DELAY = 10;

interface PromisableOptions {
    retries?: number;
    delay?: number;
    shouldReject?: boolean;
    rejectMessage?: string;
}

export const getPromisableResult = <T>(
    getResultFunction: () => T,
    checkResult: (result: T) => boolean,
    options: PromisableOptions = {}
): Promise<T> => {
    const {
        retries = DEFAULT_RETRIES,
        delay = DEFAULT_DELAY,
        shouldReject = true
    } = options;
    const rejectMessage = options.rejectMessage ?? `Could not get the result after {{ retries }} retries`;
    return new Promise<T>((resolve, reject) => {
        let attempts = 0;
        const getResultFunctionWrapper = () => {
            const result: T = getResultFunction();
            if (checkResult(result)) {
                resolve(result);
            } else {
                attempts++;
                if (attempts < retries) {
                    setTimeout(
                        getResultFunctionWrapper,
                        delay
                    );
                } else {
                    if (shouldReject) {
                        reject(
                            new Error(rejectMessage.replace(/\{\{\s*retries\s*\}\}/g, `${retries}`))
                        );
                    } else {
                        resolve(result);
                    }
                }
            }
        };
        getResultFunctionWrapper();
    });
};