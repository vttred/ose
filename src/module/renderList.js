export const RenderCompendium = async function(object, html) {
    if (object.metadata.entity != "Item") {
        return;
    }
    const render = html[0].querySelectorAll(".item");
    const content = await object.getContent();
    render.forEach(function(item, i) {
        const tagList = document.createElement("ol");
        tagList.classList.add("tag-list");
        const tags = content[i].getTags();
        tagList.innerHTML = tags;
        item.appendChild(tagList);
    })
}

export const RenderDirectory = async function(object, html) {
    if (object.id != "items") {
        return;
    }
    const render = html[0].querySelectorAll(".item");
    const content = object.entities;
    render.forEach(function(item) {
        const tagList = document.createElement("ol");
        tagList.classList.add("tag-list");
        const entity = content.find((e) => e.id == item.dataset.entityId);
        const tags = entity.getTags();
        tagList.innerHTML = tags;
        item.appendChild(tagList);
    })
}