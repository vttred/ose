/**
 * @file Helper functions related to treasure table rolls
 */
import OSE from "./config";

// eslint-disable-next-line import/prefer-default-export
export const augmentTable = (table, html) => {
  // Treasure Toggle
  const isTreasureTable = Boolean(
    table.object.getFlag(game.system.id, "treasure")
  );

  const treasureTableToggle = $(
    "<div class='toggle-treasure' title='Toggle Treasure Table'></div>"
  );
  treasureTableToggle.toggleClass("active", isTreasureTable);

  const head = html.find(".sheet-header");
  head.append(treasureTableToggle);

  html.find(".toggle-treasure").click((ev) => {
    const isTreasure = Boolean(
      table.object.getFlag(game.system.id, "treasure")
    );
    table.object.setFlag(game.system.id, "treasure", !isTreasure);
  });

  // Treasure table formatting
  if (!isTreasureTable) {
    return;
  }

  // Hide irrelevant standard fields
  html.find(".result-range").hide(); // We only hide this column because the underlying model requires two fields for the range and throw an error if they are missing
  html.find(".normalize-results").remove();

  const chanceHeader = html.find(".table-header .result-weight");
  chanceHeader.text("Chance (%)");

  const chanceColumn = html.find(".result-weight");
  chanceColumn.css("flex", "0 0 75px");

  const formula = html.find("input[name=formula]");
  formula.attr("value", "1d100");
  formula.attr("disabled", true);

  // Replace Roll button
  const roll = `<button class="roll-treasure" type="button"><i class="fas fa-gem"></i> ${game.i18n.localize(
    "OSE.table.treasure.roll"
  )}</button>`;
  html.find(".sheet-footer .roll").replaceWith(roll);

  html.find(".roll-treasure").click((ev) => {
    rollTreasure(table.object, { event: ev });
  });
};

/**
 *
 * @param table
 * @param data
 */
async function drawTreasure(table, data) {
  const percent = async (chance) => {
    const roll = new Roll("1d100");
    await roll.evaluate();
    return roll.total <= chance;
  };
  data.treasure = {};
  if (table.getFlag(game.system.id, "treasure")) {
    table.results.forEach(async (r) => {
      if (await percent(r.weight)) {
        const text = r.getChatText(r);
        data.treasure[r.id] = {
          img: r.img,
          text: await TextEditor.enrichHTML(text, { async: true }),
        };
        if (
          r.type === CONST.TABLE_RESULT_TYPES.DOCUMENT &&
          r.collection === "RollTable"
        ) {
          const embeddedTable = game.tables.get(r.resultId);
          await drawTreasure(embeddedTable, data.treasure[r.id]);
        }
      }
    });
  } else {
    const { results } = await table.roll();
    results.forEach((s) => {
      data.treasure[s.id] = { img: s.img, text: s.text };
    });
  }
  return data;
}

/**
 *
 * @param table
 * @param options
 */
export async function rollTreasure(table, options = {}) {
  // Draw treasure
  const data = await drawTreasure(table, {});
  const templateData = {
    treasure: data.treasure,
    table,
  };

  // Animation
  if (options.event) {
    const results = $(options.event.currentTarget.parentElement)
      .prev()
      .find(".table-result");
    results.each((_, item) => {
      item.classList.remove("active");
      if (data.treasure[item.dataset.resultId]) {
        item.classList.add("active");
      }
    });
  }
  
  await new Promise(resolve => requestAnimationFrame(resolve));
  const html = await renderTemplate(
    `${OSE.systemPath()}/templates/chat/roll-treasure.html`,
    templateData
    );

  const chatData = {
    content: html,
    // sound: "systems/ose/assets/coins.mp3"
    };

  const rollMode = game.settings.get("core", "rollMode");
  if (["gmroll", "blindroll"].includes(rollMode))
    chatData.whisper = ChatMessage.getWhisperRecipients("GM");
  if (rollMode === "selfroll") chatData.whisper = [game.user._id];
  if (rollMode === "blindroll") chatData.blind = true;

  ChatMessage.create(chatData);
}

export const functionsForTesting = {
  drawTreasure,
  rollTreasure,
};
