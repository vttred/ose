import { OSE, InventoryItemTag } from "./config";

export const registerHelpers = async function () {
  // Handlebars template helpers
  Handlebars.registerHelper("eq", function (a, b) {
    return a == b;
  });

  Handlebars.registerHelper("mod", function (val) {
    if (val > 0) {
      return `+${val}`;
    } else if (val < 0) {
      return `${val}`;
    } else {
      return "0";
    }
  });

  Handlebars.registerHelper("add", function (lh, rh) {
    return parseInt(lh) + parseInt(rh);
  });

  Handlebars.registerHelper("subtract", function (lh, rh) {
    return parseInt(lh) - parseInt(rh);
  });

  Handlebars.registerHelper("divide", function (lh, rh) {
    return Math.floor(parseFloat(lh) / parseFloat(rh));
  });

  Handlebars.registerHelper("mult", function (lh, rh) {
    return Math.round(100 * parseFloat(lh) * parseFloat(rh)) / 100;
  });

  Handlebars.registerHelper("roundWeight", function (weight) {
    return Math.round(parseFloat(weight) / 100) / 10;
  });

  Handlebars.registerHelper("getTagIcon", function (tagValue: string) {
    let tagKey = (Object.keys(CONFIG.OSE.tags) as InventoryItemTag[])
      // find key for the tag display name who's name matches the provided tag text.
      .find((findTagName) => CONFIG.OSE.tags[findTagName] === tagValue);
    // if that tag key is found, return the image for the tag key
    return tagKey ? CONFIG.OSE.tag_images[tagKey] : null;
  });

  Handlebars.registerHelper("counter", function (status, value, max) {
    return status
      ? Math.clamped((100.0 * value) / max, 0, 100)
      : Math.clamped(100 - (100.0 * value) / max, 0, 100);
  });

  Handlebars.registerHelper("times", function (n, block) {
    var accum = "";
    for (let i = 0; i < n; ++i) accum += block.fn(i);
    return accum;
  });

  Handlebars.registerHelper("path", function (relativePath) {
    return `${OSE.systemPath()}${relativePath}`;
  });

  Handlebars.registerHelper("asset", function (relativePath) {
    return `${OSE.assetsPath}${relativePath}`;
  });

  // helper for parsing inline rolls
  Handlebars.registerHelper("parseInline", function (html) {
    return TextEditor.enrichHTML(html);
  });
};
