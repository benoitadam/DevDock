import { useEffect, useState } from "react";

const useTimerMs = (
    ms: number = 100,
    deps: React.DependencyList = []
): number => {
    const [start, setStart] = useState(0)
    const [now, setNow] = useState(0)
    useEffect(() => {
        setStart(Date.now())
        setNow(Date.now())
        const timer = setInterval(() => {
            setNow(Date.now())
        }, ms)
        return () => clearInterval(timer);
    }, deps)
    return now - start
}

export default useTimerMs;