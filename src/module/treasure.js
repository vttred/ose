export const augmentTable = (table, html, data) => {
  // Treasure Toggle
  let head = html.find(".sheet-header");
  const flag = table.object.getFlag("ose", "treasure");
  const treasure = flag
    ? "<div class='toggle-treasure active'></div>"
    : "<div class='toggle-treasure'></div>";
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
    const roll = `<button class="roll-treasure" type="button"><i class="fas fa-gem"></i> ${game.i18n.localize(
      "OSE.table.treasure.roll"
    )}</button>`;
    html.find(".sheet-footer .roll").replaceWith(roll);
  }

  html.find(".roll-treasure").click((ev) => {
    rollTreasure(table.object, { event: ev });
  });
};

function drawTreasure(table, data) {
  const percent = (chance) => {
    const roll = new Roll("1d100");
    roll.evaluate({ async: false });
    return roll.total <= chance;
  };
  data.treasure = {};
  if (table.getFlag("ose", "treasure")) {
    table.results.forEach((r) => {
      if (percent(r.data.weight)) {
        const text = r.getChatText(r);
        data.treasure[r.id] = {
          img: r.data.img,
          text: TextEditor.enrichHTML(text),
        };
        if (
          r.data.type === CONST.TABLE_RESULT_TYPES.ENTITY &&
          r.data.collection === "RollTable"
        ) {
          const embeddedTable = game.tables.get(r.data.resultId);
          drawTreasure(embeddedTable, data.treasure[r.id]);
        }
      }
    });
  } else {
    const results = table.evaluate({ async: false }).results;
    results.forEach((s) => {
      const text = TextEditor.enrichHTML(table._getResultChatText(s));
      data.treasure[s.id] = { img: s.data.img, text: text };
    });
  }
  return data;
}

async function rollTreasure(table, options = {}) {
  // Draw treasure
  const data = drawTreasure(table, {});
  let templateData = {
    treasure: data.treasure,
    table: table,
  };

  // Animation
  if (options.event) {
    let results = $(options.event.currentTarget.parentElement)
      .prev()
      .find(".table-result");
    results.each((_, item) => {
      item.classList.remove("active");
      if (data.treasure[item.dataset.resultId]) {
        item.classList.add("active");
      }
    });
  }

  let html = await renderTemplate(
    "systems/ose/dist/templates/chat/roll-treasure.html",
    templateData
  );

  let chatData = {
    content: html,
    // sound: "systems/ose/assets/coins.mp3"
  };

  let rollMode = game.settings.get("core", "rollMode");
  if (["gmroll", "blindroll"].includes(rollMode))
    chatData["whisper"] = ChatMessage.getWhisperRecipients("GM");
  if (rollMode === "selfroll") chatData["whisper"] = [game.user._id];
  if (rollMode === "blindroll") chatData["blind"] = true;

  ChatMessage.create(chatData);
}
