import { useEffect, useState } from "react";

interface PromiseLike<T> {
    then: (cb: ((value: T) => any)) => any;
}

const usePromise = <T>(
    constructor: () => PromiseLike<T>|null|undefined,
    deps: React.DependencyList
): T|undefined => {
    const [value, setValue] = useState<T|undefined>(undefined)
    useEffect(() => {
        constructor()?.then(setValue)
    }, deps)
    return value
}

export default usePromise;