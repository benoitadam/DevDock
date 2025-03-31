import { Css } from '../helpers/html';
import budibaseLogo from '../assets/budibase.svg';
import codeLogo from '../assets/code.svg';
import n8nLogo from '../assets/n8n.svg';
import supabaseLogo from '../assets/supabase.svg';
import page$ from '../messages/page$';
import useMsg from '../hooks/useMsg';
import { useState } from 'react';
import useCss from '@/hooks/useCss';

const css: Css = {
    '&': {
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: 'rgba(40, 34, 90, 0.5)',
        zIndex: 1000,
        margin: '3px',
        padding: '3px 6px',
        border: '1px solid rgba(105, 98, 176, 0.5)',
        borderRadius: '8px',
        width: 'auto',
        anim: true,
        marginTop: '9px',
        opacity: 0.5,
        paddingTop: '10px',
        marginBottom: '-35px',
    },
    '&-over': {
        opacity: 1,
        paddingTop: '3px',
        marginBottom: '3px',
    },
    '& .Tool': {
        margin: '3px 6px',
        padding: 0,
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.3s',
        borderRadius: '6px',
        width: '24px',
        height: '24px',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'contain',
        backgroundPosition: 'center',
    },
    '& .Tool:hover': {
        transform: 'scale(1.1)',
    },
    '& .Tool-active': {
        backgroundColor: 'rgba(0, 123, 255, 0.3)',
    }
}

const Tool = ({ icon, page, url }: { icon: string, page: string, url?: string }) => {
    const currentPage = useMsg(page$)
    return (
        <button
            className={currentPage === page ? 'Tool Tool-active' : 'Tool'}
            style={{ backgroundImage: `url("${icon}")` }}
            onClick={() => page$.set(page)}
            onDoubleClick={url ? () => {
                window.open(url, '_blank', 'noopener,noreferrer');
            } : undefined}
        />
    )
}

const Toolbar = () => {
    const className = useCss('Toolbar', css)
    const [isOver, setIsOver] = useState(false)

    return (
        <div
            className={isOver ? `${className} ${className}-over` : className}
            onMouseOver={() => setIsOver(true)}
            onMouseLeave={() => setIsOver(false)}
        >
            <Tool icon={codeLogo} page="code" url="/code/" />
            <Tool icon={n8nLogo} page="n8n" url="/n8n/" />
            <Tool icon={supabaseLogo} page="supabase" url="/project/default" />
            <Tool icon={budibaseLogo} page="assets" />
        </div>
    )
}

export default Toolbar
