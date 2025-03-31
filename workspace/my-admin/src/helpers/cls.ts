const cls = (...classNames: any[]) => classNames.filter(c => c).join(' ');

export default cls;