const {generateGTIN} = require("../gtinUtils");

describe("gtin-utils", () => {
    it("randomly generates gtins", () => {
        const gtin = generateGTIN();
        expect(gtin).toHaveLength(14);
        expect(typeof gtin).toBe("string");
    });

    const paddings = [1,2,3,4,5,6,7,8,9,10,11,12,13];
    paddings.forEach(baseNumber => {
        it(`generates gtins from ${baseNumber} length numbers`, () => {
            const arr = new Array(baseNumber)
            arr.fill(0)
            arr[0] = 1; // First digit is always 1 to make it powers of 10
            const gtin = generateGTIN(arr.join(""));
            expect(gtin).toHaveLength(14);
            console.log(`Generated gtin: ${gtin} from base number: ${baseNumber}`);
        })
    })

    it.skip("enumerates all possible gtins", () => {
        const possibleGtins = 10**14;
        const limit = parseInt(new Array(13).fill(9).join(''));
        const start = Date.now();

        let counter = 10;
        let elapsed;
        const gtins = []
        for(let i = 0; i <= limit; i++) {
            if (i % counter === 0){
                elapsed = Date.now();
                console.log(`Generating ${counter}th out of ${possibleGtins} in ${elapsed - start} milliseconds`);
                counter = counter * 10;
            }
            const gtin = generateGTIN(i);
            gtins.push(gtin);
        }
        const end = Date.now();

        console.log(`Generated ${gtins.length}out of ${possibleGtins} gtins in ${end - start} milliseconds`);
    })

})