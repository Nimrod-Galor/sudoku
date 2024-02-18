// get current time
var startTime = new Date();
timer();

function timer(){
    // get current time
    const currentTime = new Date();
    const diffMs = (currentTime - startTime); // milliseconds between now & start time
    const hr = Math.floor(diffMs / 3600000);
    const min = Math.floor((diffMs % 3600000) / 60000);
    const sec = Math.floor((diffMs % 60000) / 1000);
    // return output to Web Worker
    postMessage(`${String(hr).padStart(2, '0')}:${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`);

    setTimeout("timer()", 1000);
}