
/*global window, performance*/

function generateUUID () { // Public Domain/MIT
    // https://stackoverflow.com/a/8809472/2372064
    var d = new Date().getTime();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
        d += performance.now(); //use high-precision timer if available
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}
var getClientID = (function () {
    var key = "soh-client-id";
    var clientid;
    if(window.sessionStorage) {
        clientid = window.sessionStorage.getItem(key) || generateUUID();
        window.sessionStorage.setItem(key, clientid);
    } else {
        clientid = generateUUID();
    }
    return function() {
        return clientid;
    }
})()


export { getClientID }
