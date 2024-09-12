require("../../../builds/output/testsRuntime");
const psk_crypto = require("pskcrypto");


psk_crypto.uidGenerator.registerObserver(function (err, stats) {
    console.log("Received: ", stats);
});

function FakeGenerator() {
    let counter = 0;

    this.generate = function (size) {
        let arr = [];
        for (let i = 0; i < size; i++) {
            arr.push(counter++);
        }
        return $$.Buffer.from(arr);
    }

}

let fg = new FakeGenerator();
let fg2 = new FakeGenerator();
let arr = [];

let sizes = [128, 100, 87, 32];

for (let i = 0; i < 10000; i++) {
    arr.push(i);
}
let buff = $$.Buffer.from(arr);

/*crypto.randomBytes = function (size, callback) {
	if(!callback){
		return fg.generate(size);
	}
	callback(null, fg.generate(size));
};*/
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

let prevSize = 0;
let totalLength = 0;


for (let i = 0; i < 2500; i++) {
    let size = 128;
    totalLength += size;
    //console.log(buff.slice(prevSize, prevSize+size));
    setTimeout(function () {
        psk_crypto.generateUid(size);
    }, i);

    //console.log("prevSize =", prevSize, "size =", size);
    prevSize = prevSize + size;
}