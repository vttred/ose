/**
 * @file The Character Creator application
 */
import OSE from "../config";
import OseDice from "../dice";

export default class OseCharacterCreator extends FormApplication {
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.classes = ["ose", "dialog", "creator"];
    options.id = "character-creator";
    options.template = `${OSE.systemPath()}/templates/actors/dialogs/character-creation.html`;
    options.width = 235;
    return options;
  }

  /* -------------------------------------------- */

  /**
   * Add the Entity name into the window title
   *
   * @type {string}
   */
  get title() {
    return `${this.object.name}: ${game.i18n.localize("OSE.dialog.generator")}`;
  }

  /* -------------------------------------------- */

  /**
   * Construct and return the data object used to render the HTML template for this form application.
   *
   * @returns {object} - Render data for the form application
   */
  getData() {
    let data = foundry.utils.deepClone(this.object);
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
        .map((x) => (x.value - mean) ** 2)
        .reduce((acc, next) => acc + next, 0) / n
    );

    const stats = list.siblings(".roll-stats");
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
      sum,
      avg: Math.round((10 * sum) / n) / 10,
      std: Math.round(100 * std) / 100,
    };
  }

  rollScore(score, options = {}) {
    // Increase counter
    this.counters[score] += 1;

    const label =
      score === "gold"
        ? "Gold"
        : game.i18n.localize(`OSE.scores.${score}.long`);
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
      data,
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
      `${OSE.systemPath()}/templates/chat/roll-creation.html`,
      templateData
    );
    ChatMessage.create({
      content,
      speaker,
    });
    return super.close(options);
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    html.find("a.score-roll").click((ev) => {
      const el = ev.currentTarget.parentElement.parentElement;
      const { score } = el.dataset;
      this.rollScore(score, { event: ev }).then((r) => {
        this.scores[score] = { value: r.total };
        $(el).find("input").val(r.total).trigger("change");
      });
    });

    html.find("a.gold-roll").click((ev) => {
      const el = ev.currentTarget.parentElement.parentElement.parentElement;
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
      for (const char of stats) {
        const r = await this.rollScore(char, { event: ev, skipMessage: true });
        this.scores[char] = { value: r.total };
      }
      this.doStats(ev);
      const r = await this.rollScore("gold", { event: ev, skipMessage: true });
      this.gold = 10 * r.total;
      this.submit();
    });
  }

  // eslint-disable-next-line no-underscore-dangle
  async _onSubmit(
    event,
    { updateData = null, preventClose = false, preventRender = false } = {}
  ) {
    const extendedData = { ...updateData, data: { scores: this.scores } };
    // eslint-disable-next-line no-underscore-dangle
    super._onSubmit(event, {
      extendedData,
      preventClose,
      preventRender,
    });
    // Generate gold
    const itemData = {
      name: game.i18n.localize("OSE.items.gp.short"),
      type: "item",
      img: `${OSE.assetsPath}/gold.png`,
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
   *
   * @param {Event} event - The initial triggering submission event
   * @param {object} formData - The object of validated form data with which to update the object
   * @private
   */
  // eslint-disable-next-line no-underscore-dangle
  async _updateObject(event, formData) {
    event.preventDefault();
    // Update the actor
    await this.object.update(formData);

    // Re-draw the updated sheet
    this.object.sheet.render(true);
  }
}
