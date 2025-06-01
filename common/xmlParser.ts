// utils/xmlParser.js

const xml2js = require("xml2js");

const parseXml = (xmlString) => {
  return new Promise((resolve, reject) => {
    const parser = new xml2js.Parser();
    parser.parseString(xmlString, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

export default parseXml;
