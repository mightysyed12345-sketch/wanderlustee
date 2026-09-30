class Expresserror extends Error {
    constructor(statusCode, message) {
        super(message);
        this.name = "Expresserror";
        this.statusCode = statusCode;
        this.message = message;
    }
}
module.exports = Expresserror;