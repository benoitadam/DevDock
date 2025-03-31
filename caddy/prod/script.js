const css = `
html, body {
    background: black;
}

.injectedNav {
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    justify-content: center;
    background-color: rgba(40, 34, 90, 0.5);
    z-index: 99999;
    margin: 3px;
    padding: 3px 6px;
    border: 1px solid rgba(105, 98, 176, 0.5);
    border-radius: 8px;
    width: auto;
}

.injectedBtn {
    margin: 3px 6px;
    padding: 0;
    background-color: transparent;
    border: none;
    cursor: pointer;
    transition: all 0.3s;
    border-radius: 6px;
    width: 24px;
    height: 24px;
    background-repeat: no-repeat;
    background-size: contain;
    background-position: center;
}

.injectedBtn:hover {
    transform: scale(1.1);
}

.injectedBtn-active {
    background-color: rgba(0, 123, 255, 0.3);
}

.injectedIframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: none;
    border: none;
    z-index: 99990;
    transform: translateX(-100%);
    transition: all 0.3s;
    opacity: 0;
}

.injectedIframe-removing {
    display: block;
    transform: translateX(+100%);
    opacity: 0;
}

.injectedIframe-showing {
    display: block;
    transform: translateX(-100%);
    opacity: 0;
}

.injectedIframe-active {
    display: block;
    transform: translateX(0%);
    opacity: 1;
}
`;

setTimeout(() => {

    console.debug('hello inject !')

    const style = document.createElement('style');
    document.body.appendChild(style);
    style.id = "injectedStyle";
    style.textContent = css;

    const nav = document.createElement('div');
    document.body.appendChild(nav);
    nav.className = "injectedNav";
    
    const buttons = [
        ["supabase", "supabase.svg", "/project/default"],
        ["n8n", "n8n.svg", "/n8n/"],
        ["code", "code.svg", "/code/"],
        // ["pgadmin", "pgadmin.ico", "/pgadmin/"],
        // ["budibase", "budibase.svg", "https://budibase.prod.mediactil.com/builder"]
    ]
    const btnMap = {}
    const iframeMap = {}

    for (const [name, icon, url] of buttons) {
        const btn = document.createElement('div');
        btnMap[name] = btn;
        btn.className = "injectedBtn";
        nav.appendChild(btn);
        btn.style.backgroundImage = `url(/inject/icons/${icon})`;
        btn.onclick = () => {
            for (const iframe of Object.values(iframeMap)) {
                if (!iframe.className !== "injectedIframe" && iframe.id !== "iframe-" + name) {
                    iframe.className = "injectedIframe injectedIframe-removing";
                    setTimeout(() => {
                        iframe.className = "injectedIframe";
                    }, 500);
                }
            }

            for (const btn of Object.values(btnMap)) {
                btn.className = "injectedBtn";
            }

            btn.className = "injectedBtn injectedBtn-active";

            if (!url) return;

            const iframe = iframeMap[name] || (iframeMap[name] = (() => {
                const iframe = document.createElement('iframe');
                document.body.appendChild(iframe);
                iframe.id = "iframe-" + name;
                iframe.src = url;
                iframe.title = name;
                return iframe;
            })());

            iframe.className = "injectedIframe injectedIframe-showing";
            setTimeout(() => {
                iframe.className = "injectedIframe injectedIframe-active";
            }, 10);  
        };
    }
}, 200);