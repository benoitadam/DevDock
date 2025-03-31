import { setCss, Css } from "@/helpers/html"
import { useEffect } from "react"

const useCss = (className: string, css?: Css, isShow: boolean = true) => {
    useEffect(() => {
        if (isShow) setCss(className, css)
    }, [className, css, isShow])
    return className
}

export default useCss
