export function retryPromise(getNewPromise, onRetry, maxRetries = 3) {
    return new Promise(async (resolve, reject) => {
        let results;
        let retry = 0;
        let failed;
        do {
            failed = false;
            try {
                results = await getNewPromise();
            } catch (e) {
                failed = true;
                if (retry < maxRetries) {
                    retry++;
                    onRetry(retry);
                    await sleep(retry * 1000);
                } else {
                    reject(e);
                    return;
                }
            }
        } while (failed);
        resolve(results);
    });
}

export async function sleep(time) {
    await new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, time);
    });
}
