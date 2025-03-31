import { useEffect, useState } from "react";

const useAnimState = (isShow: boolean, duration: number = 300): string => {
    const [state, setState] = useState<string>(isShow ? 'show' : '');

    useEffect(() => {
        setState(prev => isShow ? 'showing' : prev ? 'hiding' : '');

        const timer = setTimeout(() => {
            setState(prev => (
                prev === 'showing' ? 'show' :
                prev === 'hiding' ? 'hide' :
                prev
            ));
        }, duration);

        return () => clearTimeout(timer);
    }, [isShow, duration]);

    return state;
};

export default useAnimState;