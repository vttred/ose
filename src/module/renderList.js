/**
 * @file Functions that alter the way that sidebar and compendium lists render
 */
import OSE from "./config";

export const RenderCompendium = async (object, html, d) => {
  if (object.metadata.type !== "Item") {
    return;
  }

  const render = html[0].querySelectorAll(".item");
  const docs = await d.collection.getDocuments();

  render.forEach(async (item, i) => {
    const id = render[i].dataset.documentId;

    const element = docs.find((doc) => doc.id === id);
    const tagTemplate = $.parseHTML(
      await renderTemplate(
        `${OSE.systemPath()}/templates/actors/partials/item-auto-tags-partial.html`,
        { tags: element.system.autoTags }
      )
    );

    $(item).append(tagTemplate);
  });
};

export const RenderDirectory = async (object, html) => {
  if (object.id !== "items") {
    return;
  }

  const render = html[0].querySelectorAll(".item");
  const content = object.documents;

  render.forEach(async (item) => {
    const foundryDocument = content.find(
      (e) => e.id === item.dataset.documentId
    );

    const tagTemplate = $.parseHTML(
      await renderTemplate(
        `${OSE.systemPath()}/templates/actors/partials/item-auto-tags-partial.html`,
        { tags: foundryDocument.system.autoTags || [] }
      )
    );
    $(item).append(tagTemplate);
  });
};
