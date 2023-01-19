function log() {
    console.log.apply(console, arguments);
}

function rrgb() {//rgb颜色随机
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r},${g},${b})`;
}

export { log,rrgb };
