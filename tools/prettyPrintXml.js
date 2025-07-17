function prettyPrintXml(xml) {
  let formatted = "";
  const reg = /(>)(<)(\/*)/g;
  xml = xml.replace(reg, "$1\n$2$3");
  let pad = 0;
  xml.split("\n").forEach((node) => {
    let indent = 0;
    if (node.match(/.+<\/\w[^>]*>$/)) {
      indent = 0;
    } else if (node.match(/^<\/\w/)) {
      if (pad !== 0) pad -= 2;
    } else if (node.match(/^<\w([^>]*[^/])?>.*$/)) {
      indent = 2;
    } else {
      indent = 0;
    }
    formatted += " ".repeat(pad) + node + "\n";
    pad += indent;
  });
  return formatted.trim();
}

module.exports = prettyPrintXml;
