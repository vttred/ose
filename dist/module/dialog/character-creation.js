import { OseActor } from "../actor/entity.js";
import { OseDice } from "../dice.js";

export class OseCharacterCreator extends FormApplication {
  static get defaultOptions() {
    const options = super.defaultOptions;
    (options.classes = ["ose", "dialog", "creator"]),
      (options.id = "character-creator");
    options.template =
      "systems/ose/templates/actors/dialogs/character-creation.html";
    options.width = 235;
    return options;
  }

  /* -------------------------------------------- */

  /**
   * Add the Entity name into the window title
   * @type {String}
   */
  get title() {
    return `${this.object.name}: ${game.i18n.localize("OSE.dialog.generator")}`;
  }

  /* -------------------------------------------- */

  /**
   * Construct and return the data object used to render the HTML template for this form application.
   * @return {Object}
   */
  getData() {
    let data = foundry.utils.deepClone(this.object.data);
    data.user = game.user;
    data.config = CONFIG.OSE;
    this.counters = {
      str: 0,
      wis: 0,
      dex: 0,
      int: 0,
      cha: 0,
      con: 0,
      gold: 0,
    };
    this.stats = {
      sum: 0,
      avg: 0,
      std: 0,
    };
    this.scores = {};
    this.gold = 0;
    return data;
  }

  /* -------------------------------------------- */

  doStats(ev) {
    const list = $(ev.currentTarget).closest(".attribute-list");
    const scores = Object.values(this.scores);
    const n = scores.length;
    const sum = scores.reduce((acc, next) => acc + next.value, 0);
    const mean = parseFloat(sum) / n;
    const std = Math.sqrt(
      scores
        .map((x) => Math.pow(x.value - mean, 2))
        .reduce((acc, next) => acc + next, 0) / n
    );

    let stats = list.siblings(".roll-stats");
    stats.find(".sum").text(sum);
    stats.find(".avg").text(Math.round((10 * sum) / n) / 10);
    stats.find(".std").text(Math.round(100 * std) / 100);

    if (n >= 6) {
      $(ev.currentTarget)
        .closest("form")
        .find('button[type="submit"]')
        .removeAttr("disabled");
    }

    this.object.data.stats = {
      sum: sum,
      avg: Math.round((10 * sum) / n) / 10,
      std: Math.round(100 * std) / 100,
    };
  }

  rollScore(score, options = {}) {
    // Increase counter
    this.counters[score]++;

    const label =
      score != "gold" ? game.i18n.localize(`OSE.scores.${score}.long`) : "Gold";
    const rollParts = ["3d6"];
    const data = {
      roll: {
        type: "result",
      },
    };
    if (options.skipMessage) {
      return new Roll(rollParts[0]).evaluate({ async: false });
    }
    // Roll and return
    return OseDice.Roll({
      event: options.event,
      parts: rollParts,
      data: data,
      skipDialog: true,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: game.i18n.format("OSE.dialog.generateScore", {
        score: label,
        count: this.counters[score],
      }),
      title: game.i18n.format("OSE.dialog.generateScore", {
        score: label,
        count: this.counters[score],
      }),
    });
  }

  async close(options) {
    // Gather scores
    const speaker = ChatMessage.getSpeaker({ actor: this });
    const templateData = {
      config: CONFIG.OSE,
      scores: this.scores,
      title: game.i18n.localize("OSE.dialog.generator"),
      stats: this.object.data.stats,
      gold: this.gold,
    };
    const content = await renderTemplate(
      "/systems/ose/templates/chat/roll-creation.html",
      templateData
    );
    ChatMessage.create({
      content: content,
      speaker,
    });
    return super.close(options);
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    html.find("a.score-roll").click((ev) => {
      let el = ev.currentTarget.parentElement.parentElement;
      let score = el.dataset.score;
      this.rollScore(score, { event: ev }).then((r) => {
        this.scores[score] = { value: r.total };
        $(el).find("input").val(r.total).trigger("change");
      });
    });

    html.find("a.gold-roll").click((ev) => {
      let el = ev.currentTarget.parentElement.parentElement.parentElement;
      this.rollScore("gold", { event: ev }).then((r) => {
        this.gold = 10 * r.total;
        $(el).find(".gold-value").val(this.gold);
      });
    });

    html.find("input.score-value").change((ev) => {
      this.doStats(ev);
    });

    html.find("a.auto-roll").click(async (ev) => {
      const stats = ["str", "int", "dex", "wis", "con", "cha"];
      for (let char of stats) {
        const r = await this.rollScore(char, { event: ev, skipMessage: true });
        this.scores[char] = { value: r.total };
      }
      this.doStats(ev);
      const r = await this.rollScore("gold", { event: ev, skipMessage: true });
      this.gold = 10 * r.total;
      this.submit();
    });
  }

  async _onSubmit(
    event,
    { updateData = null, preventClose = false, preventRender = false } = {}
  ) {
    updateData = { ...updateData, data: { scores: this.scores } };
    super._onSubmit(event, {
      updateData: updateData,
      preventClose: preventClose,
      preventRender: preventRender,
    });
    // Generate gold
    const itemData = {
      name: "GP",
      type: "item",
      img: "/systems/ose/assets/gold.png",
      data: {
        treasure: true,
        cost: 1,
        weight: 1,
        quantity: {
          value: this.gold,
        },
      },
    };
    this.object.createEmbeddedDocuments("Item", [itemData]);
  }
  /**
   * This method is called upon form submission after form data is validated
   * @param event {Event}       The initial triggering submission event
   * @param formData {Object}   The object of validated form data with which to update the object
   * @private
   */
  async _updateObject(event, formData) {
    event.preventDefault();
    // Update the actor
    await this.object.update(formData);

    // Re-draw the updated sheet
    this.object.sheet.render(true);
  }
}
