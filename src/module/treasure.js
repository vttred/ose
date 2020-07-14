export const augmentTable = (table, html, data) => {
  // Treasure Toggle
  let head = html.find(".sheet-header");
  const flag = table.object.getFlag("ose", "treasure");
  const treasure = flag
    ? "<div class='toggle-treasure'><a><i class='fas fa-gem'></i></a></div>"
    : "<div class='toggle-treasure'><a><i class='far fa-gem'></i></a></div>";
  head.append(treasure);

  html.find(".toggle-treasure").click((ev) => {
    let isTreasure = table.object.getFlag("ose", "treasure");
    table.object.setFlag("ose", "treasure", !isTreasure);
  });

  // Treasure table formatting
  if (flag) {
    // Remove Interval
    html.find(".result-range").remove();
    html.find(".normalize-results").remove();

    html.find(".result-weight").first().text("Chance");

    // Replace Roll button
    const roll = `<button class="roll-treasure" type="button"><i class="fas fa-gem"></i> Roll Treasure</button>`;
    html.find(".sheet-footer .roll").replaceWith(roll);
  }

  html.find(".roll-treasure").click((ev) => {
    rollTreasure(table.object, { event: ev });
  });
};

async function rollTreasure(table, options = {}) {
  let percent = (chance) => {
    let roll = new Roll("1d100").roll();
    return roll.total <= chance;
  };
  let templateData = {
    treasure: [],
    table: table,
  };
  let ids = [];
  table.results.forEach((r) => {
    if (percent(r.weight)) {
      let text = "";
      switch (r.type) {
        case 0:
          text = r.text;
          break;
        case 1:
          text = `@${r.collection}[${r.resultId}]{${r.text}}`;
          break;
        case 2:
          text = `@Compendium[${r.collection}.${r.resultId}]{${r.text}}`;
      }
      templateData.treasure.push({
        id: r._id,
        img: r.img,
        text: TextEditor.enrichHTML(text),
      });
      ids.push(r._id);
    }
  });

  // Animation
  if (options.event) {
    let results = $(event.currentTarget.parentElement)
      .prev()
      .find(".table-result");
    results.each((_, item) => {
      item.classList.remove("active");
      if (ids.includes(item.dataset.resultId)) {
        item.classList.add("active");
      }
    });
  }

  let html = await renderTemplate(
    "systems/ose/templates/chat/roll-treasure.html",
    templateData
  );
  ChatMessage.create({ content: html });
}
