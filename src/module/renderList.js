export const RenderCompendium = async function(object, html) {
    if (object.metadata.name != "spells") {
        return;
    }
    const spellRender = html[0].querySelectorAll(".item");
    const content = await object.getContent();
    spellRender.forEach(function(item, i) {
        const tagList = document.createElement("div");
        tagList.classList.add("tag-list");

        appendTag(tagList, content[i].data.data.class);
        appendTag(tagList, `lvl ${content[i].data.data.lvl}`);
    
        item.appendChild(tagList);
    })
}

function appendTag(html, tagContent) {
    const tag = document.createElement("span");
    tag.classList.add("tag");
    tag.innerHTML = tagContent;
    html.appendChild(tag);
}