export const RenderCompendium = function(object, html) {
    if (object.metadata.name != "spells") {
        return;
    }
    const spellRender = html[0].querySelectorAll(".item");
    spellRender.forEach(async function(item, i) {
        const entity = await object.getEntity(object.index[i]._id);
        const name = item.removeChild(item.childNodes[3]);

        const itemHead = document.createElement("div");
        itemHead.classList.add("item-section");
        itemHead.appendChild(name);
        
        const tagList = document.createElement("div");
        tagList.classList.add("tag-list");
        itemHead.appendChild(tagList);

        appendTag(tagList, entity.data.data.class);
        appendTag(tagList, `lvl ${entity.data.data.lvl}`);
    
        item.appendChild(itemHead);
    })
}

function appendTag(html, tagContent) {
    const tag = document.createElement("span");
    tag.classList.add("tag");
    tag.innerHTML = tagContent;
    html.appendChild(tag);
}