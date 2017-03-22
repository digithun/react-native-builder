const fs = require('fs');
var execSync = require('child_process').execSync;

function runCli(cli) {
    return new Promise((resolve) => {
        let output = execSync(cli).toString();
        console.log(output);
        console.log('---------------');
        resolve();
    });
}

function insertClassToGradle(config) {
    return new Promise((resolve) => {

        //variables
        let {
            fileUrl,
            classCmd,
            checkClass,
            versionClass,
            repString,
            indent
        } = config;
        let insertClass = checkClass + versionClass;

        console.log('checking -> ' + fileUrl);
        fs.readFile(fileUrl, 'utf8', (err, fileString) => {

            if (err) return console.log(err);

            console.log('find previous installation of : ', insertClass);

            if (fileString.indexOf(checkClass) == -1) {

                let insertLine = '\n' + indent + classCmd + ' \'' + insertClass + '\'';
                fileString = fileString.replace(repString, repString + insertLine);
                fs.writeFile(fileUrl, fileString, (err2) => {
                    console.log('added ' + classCmd, insertClass);
                    resolve();
                });

            } else {
                console.log(classCmd, insertClass, '*warning* line already existed.. skiping');
                resolve();
            }

        });
    })
};

function insertLineInFile(config) {
    return new Promise((resolve) => {

        let {
            fileUrl,
            content,
            repString,
            option,
            indent
        } = config;

        console.log('checking -> ' + fileUrl);
        fs.readFile(fileUrl, 'utf8', (err, fileString) => {

            if (err) return console.log(err);

            console.log('find previous installation : ', content);
            if (content === '' | fileString.indexOf(content) == -1) {

                switch (option) {
                    case 'before':
                        fileString = fileString.replace(repString, indent + content + '\n' + repString);
                        break;
                    case 'after':
                        fileString = fileString.replace(repString, indent + repString + '\n' + content);
                        break;
                    case 'replaceAll':

                        String.prototype.replaceAll = function (search, replacement) {
                            var target = this;
                            return target.replace(new RegExp(search, 'g'), replacement);
                        }

                        fileString = fileString.replaceAll(repString, content);
                        break;
                    default:
                        fileString = fileString.replace(repString, content);
                        break;
                }

                fs.writeFile(fileUrl, fileString, (err2) => {
                    console.log('complete insertedLineInFile ' + content);
                    resolve();
                });

            } else {
                console.log('*warning* line already existed.. skiping');
                resolve();
            }
        });
    });
}

function insertLineEndOfFile(config) {
    return new Promise((resolve) => {

        let {
            fileUrl,
            addString
        } = config;

        console.log('checking -> ' + fileUrl);
        fs.readFile(fileUrl, 'utf8', (err, fileString) => {

            if (err) return console.log(err);

            console.log('find previous installation of : ', addString);
            if (fileString.indexOf(addString) == -1) {

                fileString = fileString.concat("\n" + addString);

                fs.writeFile(fileUrl, fileString, (err2) => {
                    console.log('added ' + addString + ' to end of file..');
                    resolve();
                });

            } else {
                console.log(addString, '*warning* line already existed.. skiping');
                resolve();
            }
        });
    });
}


function addAndroidManifestObject(config) {
    return new Promise((resolve) => {

        Array.prototype.last = function () {
            return this[this.length - 1];
        };

        let {
            fileUrl,
            xmlDir,
            line
        } = config;
        let isProp = xmlDir.last() === '$';

        console.log('checking -> ' + fileUrl);

        fs.readFile(fileUrl, 'utf8', (err, fileString) => {

            (async() => {
                if (err) return console.log(err);

                let fileObject = await xmlToObj(fileString);
                let targetPointer = fileObject;

                xmlDir.forEach(function (element) {

                    if (!targetPointer.hasOwnProperty(element))
                        targetPointer[element] = [];

                    targetPointer = targetPointer[element];

                });

                if (!isProp && !Array.isArray(targetPointer))
                    targetPointer.forEach(function (objectInFile) {
                        //find old and remove it from config
                        let propName = objectInFile['$']['android:name'];

                        let foundOldMatchedIndex = -1;
                        for (var i = 0; i < line.length; i++) {
                            if (line[i] == null) continue;

                            if (line[i].indexOf(propName) > -1) {
                                console.log('*warning* Duplicate @ ', line[i]); //<-TODO find better way to detect duplicate line
                                line[i] = null;
                            }
                        }
                    });

                for (var i = 0; i < line.length; i++) {
                    if (line[i] == null)
                        continue;

                    if (isProp) {
                        let keyValueSplit = line[i].split('=');
                        targetPointer[keyValueSplit[0]] = keyValueSplit[1].replace(/['"]+/g, ''); //add without quotes
                    } else {
                        let lineObject = await xmlToObj(line[i]);
                        targetPointer.push((lineObject)[xmlDir.last()])

                    }
                }

                var xml2js = require('xml2js');
                var builder = new xml2js.Builder();
                var xml = builder.buildObject(fileObject);
                // console.log('xml', xml);

                fs.writeFile(fileUrl, xml, (err2) => {
                    console.log(fileUrl, 'modified');
                    resolve();
                });
            })();
        });
    });
}

function xmlToObj(xml) {
    return new Promise((resolve) => {
        var xml2js = require('xml2js');
        xml2js.parseString(xml, function (err, result) {
            if (err) resolve(null);
            else resolve(result);
        });
    });
}

function copyFile(from, to) {
    console.log('Copying file', from, '->', to, '..');

    //alert when no file to copy
    if (!fs.existsSync(from)) {
        console.log('file not exist', from);
        console.log('file copy skipped..');
    } else {
        //remove previous destination file
        if (fs.existsSync(to)) {
            fs.unlinkSync(to);
            console.log('*warning* old file will be replaced');
        }

        fs.writeFileSync(to, fs.readFileSync(from));
    }
}

module.exports = {
    addAndroidManifestObject,
    insertClassToGradle,
    copyFile,
    insertLineEndOfFile,
    insertLineInFile,
    runCli
};