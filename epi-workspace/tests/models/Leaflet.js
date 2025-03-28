const {Model} = require("./Model");
const {LeafletFile} = require("./LeafletFile");

class Leaflet extends Model {

    productCode = "";
    language = "";
    xmlFileContent = "";
    otherFilesContent = [];

    constructor(product) {
        super();
        Model.fromObject(this, product);
        if (this.otherFilesContent && this.otherFilesContent.length) {
            this.otherFilesContent = this.otherFilesContent.map(f => new LeafletFile(f));
        }
    }
}

module.exports = {
    Leaflet
}