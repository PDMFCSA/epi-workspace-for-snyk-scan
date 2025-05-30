/*
  Loki (node) fs structured Adapter (need to require this script to instance and use it).

  This adapter will save database container and each collection to separate files and
  save collection only if it is dirty.  It is also designed to use a destructured serialization 
  method intended to lower the memory overhead of json serialization.
  
  This adapter utilizes ES6 generator/iterator functionality to stream output and
  uses node linereader module to stream input.  This should lower memory pressure 
  in addition to individual object serializations rather than loki's default deep object
  serialization.
*/

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define([], factory);
    } else if (typeof exports === 'object') {
        // Node, CommonJS-like
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.LokiFsStructuredAdapter = factory();
    }
}(this, function () {
    return (function () {

        const fs = require('fs');
        const readline = require('readline');
        const stream = require('stream');
        const log = require("../../../utils/logger").conditionalLog

        /**
         * Loki structured (node) filesystem adapter class.
         *     This class fulfills the loki 'reference' abstract adapter interface which can be applied to other storage methods.
         *
         * @constructor LokiFsStructuredAdapter
         *
         */
        function LokiFsStructuredAdapter() {
            this.mode = "reference";
            this.dbref = null;
            this.dirtyPartitions = [];
        }

        /**
         * Generator for constructing lines for file streaming output of db container or collection.
         *
         * @param {object=} options - output format options for use externally to loki
         * @param {int=} options.partition - can be used to only output an individual collection or db (-1)
         *
         * @returns {string|array} A custom, restructured aggregation of independent serializations.
         * @memberof LokiFsStructuredAdapter
         */
        LokiFsStructuredAdapter.prototype.generateDestructured = function* (options) {
            let idx;
            let dbcopy;

            options = options || {};

            if (!options.hasOwnProperty("partition")) {
                options.partition = -1;
            }

            // if partition is -1 we will return database container with no data
            if (options.partition === -1) {
                // instantiate lightweight clone and remove its collection data
                dbcopy = this.dbref.copy();

                for (idx = 0; idx < dbcopy.collections.length; idx++) {
                    dbcopy.collections[idx].data = [];
                }

                yield dbcopy.serialize({
                    serializationMethod: "normal"
                });

                return;
            }

            // 'partitioned' along with 'partition' of 0 or greater is a request for single collection serialization
            if (options.partition >= 0) {
                let doccount,
                    docidx;

                // dbref collections have all data so work against that
                doccount = this.dbref.collections[options.partition].data.length;

                for (docidx = 0; docidx < doccount; docidx++) {
                    yield JSON.stringify(this.dbref.collections[options.partition].data[docidx]);
                }
            }
        };

        /**
         * Loki persistence adapter interface function which outputs un-prototype db object reference to load from.
         *
         * @param {string} dbname - the name of the database to retrieve.
         * @param {function} callback - callback should accept string param containing db object reference.
         * @memberof LokiFsStructuredAdapter
         */
        LokiFsStructuredAdapter.prototype.loadDatabase = function (dbname, callback) {
            let instream,
                outstream,
                rl,
                self = this;

            this.dbref = null;

            // make sure file exists
            fs.stat(dbname, function (fileErr, stats) {
                let jsonErr;

                if (fileErr) {
                    if (fileErr.code === "ENOENT") {
                        // file does not exist, so callback with null
                        callback(null);
                        return;
                    } else {
                        // some other file system error.
                        callback(fileErr);
                        return;
                    }
                } else if (!stats.isFile()) {
                    // something exists at this path but it isn't a file.
                    callback(new Error(dbname + " is not a valid file."));
                    return;
                }

                instream = fs.createReadStream(dbname);
                outstream = new stream();
                rl = readline.createInterface(instream, outstream);

                // first, load db container component
                rl.on('line', function (line) {
                    // it should single JSON object (a one line file)
                    if (self.dbref === null && line !== "") {
                        try {
                            self.dbref = JSON.parse(line);
                        } catch (e) {
                            jsonErr = e;
                        }
                    }
                });

                // when that is done, examine its collection array to sequence loading each
                rl.on('close', function () {
                    if (jsonErr) {
                        // a json error was encountered reading the container file.
                        callback(jsonErr);
                    } else if (self.dbref.collections.length > 0) {
                        self.loadNextCollection(dbname, 0, function () {
                            callback(self.dbref);
                        });
                    }
                });
            });
        };

        /**
         * Recursive function to chain loading of each collection one at a time.
         * If at some point i can determine how to make async driven generator, this may be converted to generator.
         *
         * @param {string} dbname - the name to give the serialized database within the catalog.
         * @param {int} collectionIndex - the ordinal position of the collection to load.
         * @param {function} callback - callback to pass to next invocation or to call when done
         * @memberof LokiFsStructuredAdapter
         */
        LokiFsStructuredAdapter.prototype.loadNextCollection = function (dbname, collectionIndex, callback) {
            let instream = null;
            let outstream = null;
            let rl = null;

            let filePath = dbname + "." + collectionIndex;
            log(console, "Loading next collection: " + filePath);

            try {
                if(!fs.existsSync(filePath))
                    throw new Error("File not found");

                instream = fs.createReadStream(filePath);
                outstream = new stream();
                rl = readline.createInterface(instream, outstream);
            } catch (e) {
                log(console, "Error opening collection file: " + dbname + "." + collectionIndex);

                const match = dbname.match(/\/([^\/]+)\/database$/);

                if(match && !dbname.includes("renamed"))
                    dbname = dbname.replace(match[1], match[1] + "-renamed");

                log(console, "Seems that path is incorrect changing to : " + dbname + "." + collectionIndex);

                instream = fs.createReadStream(dbname + "." + collectionIndex);
                outstream = new stream();
                rl = readline.createInterface(instream, outstream);
            }

            let self = this,
                obj;

            rl.on('line', function (line) {
                if (line !== "") {
                    try {
                        obj = JSON.parse(line);
                    } catch (e) {
                        callback(e);
                    }
                    self.dbref.collections[collectionIndex].data.push(obj);
                }
            });

            rl.on('close', function () {
                instream = null;
                outstream = null;
                rl = null;
                obj = null;

                // if there are more collections, load the next one
                if (++collectionIndex < self.dbref.collections.length) {
                    self.loadNextCollection(dbname, collectionIndex, callback);
                }
                // otherwise we are done, callback to loadDatabase so it can return the new db object representation.
                else {
                    callback();
                }
            });
        };

        /**
         * Generator for yielding sequence of dirty partition indices to iterate.
         *
         * @memberof LokiFsStructuredAdapter
         */
        LokiFsStructuredAdapter.prototype.getPartition = function* () {
            let idx,
                clen = this.dbref.collections.length;

            // since database container (partition -1) doesn't have dirty flag at db level, always save
            yield -1;

            // yield list of dirty partitions for iterateration
            for (idx = 0; idx < clen; idx++) {
                if (this.dbref.collections[idx].dirty) {
                    yield idx;
                }
            }
        };

        /**
         * Loki reference adapter interface function.  Saves structured json via loki database object reference.
         *
         * @param {string} dbname - the name to give the serialized database within the catalog.
         * @param {object} dbref - the loki database object reference to save.
         * @param {function} callback - callback passed obj.success with true or false
         * @memberof LokiFsStructuredAdapter
         */
        LokiFsStructuredAdapter.prototype.exportDatabase = function (dbname, dbref, callback) {
            this.dbref = dbref;

            // create (dirty) partition generator/iterator
            let pi = this.getPartition();

            this.saveNextPartition(dbname, pi, function () {
                callback(null);
            });

        };

        /**
         * Utility method for queueing one save at a time
         */
        LokiFsStructuredAdapter.prototype.saveNextPartition = function (dbname, pi, callback) {
            let li;
            let filename;
            let self = this;
            let pinext = pi.next();

            if (pinext.done) {
                callback();
                return;
            }

            // db container (partition -1) uses just dbname for filename,
            // otherwise append collection array index to filename
            filename = dbname + ((pinext.value === -1) ? "" : ("." + pinext.value));

            let wstream = fs.createWriteStream(filename);
            //wstream.on('finish', function() {
            wstream.on('close', function () {
                self.saveNextPartition(dbname, pi, callback);
            });

            li = this.generateDestructured({partition: pinext.value});

            // iterate each of the lines generated by generateDestructured()
            for (let outline of li) {
                wstream.write(outline + "\n");
            }

            wstream.end();
        };

        return LokiFsStructuredAdapter;

    }());
}));
