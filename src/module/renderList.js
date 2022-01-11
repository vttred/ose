export const RenderCompendium = async function (object, html, d) {
  if (object.documentName != "Item") {
    return;
  }
  const render = html[0].querySelectorAll(".item");
  const docs = await d.collection.getDocuments();
  render.forEach(function (item, i) {
    const id = render[i].dataset.documentId;
    const element = docs.filter((d) => d.id === id)[0];
    const tagList = document.createElement("ol");
    tagList.classList.add("tag-list");
    const tags = element.getTags();
    tagList.innerHTML = tags;
    item.appendChild(tagList);
  });
};

export const RenderDirectory = async function (object, html) {
  if (object.id != "items") {
    return;
  }
  const render = html[0].querySelectorAll(".item");
  const content = object.documents;
  render.forEach(function (item) {
    const tagList = document.createElement("ol");
    tagList.classList.add("tag-list");
    const foundryDocument = content.find(
      (e) => e.id == item.dataset.documentId
    );
    const tags = foundryDocument.getTags();
    tagList.innerHTML = tags;
    item.appendChild(tagList);
  });
};
