Array.prototype.pushUnique = function (item) {
    if (this.indexOf(item) === -1) {
        this.push(item);
        return true;
    }
    return false;
}

Array.prototype.of = function (size, character) {
    return Array.apply(character, Array(size)).map(function () { })
}

String.prototype.clean = function () {
    return this.replace(/[^a-zA-Z0-9.]/g, '').trim().toLowerCase();
}