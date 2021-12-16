Array.prototype.pushUnique = function (item) {
    if (this.indexOf(item) === -1) {
        this.push(item);
        return true;
    }
    return false;
}

String.prototype.clean = function () {
    return this.replace(/[^a-zA-Z0-9.]/, '').trim().toLowerCase();
}