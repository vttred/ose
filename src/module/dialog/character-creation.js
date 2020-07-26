import { OseActor } from '../actor/entity.js';
import { OseDice } from "../dice.js";

export class OseCharacterCreator extends FormApplication {
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.classes = ["ose", "dialog", "creator"],
      options.id = 'character-creator';
    options.template =
      'systems/ose/templates/actors/dialogs/character-creation.html';
    options.width = 235;
    return options;
  }

  /* -------------------------------------------- */

  /**
   * Add the Entity name into the window title
   * @type {String}
   */
  get title() {
    return `${this.object.name}: ${game.i18n.localize('OSE.dialog.generator')}`;
  }

  /* -------------------------------------------- */

  /**
   * Construct and return the data object used to render the HTML template for this form application.
   * @return {Object}
   */
  getData() {
    let data = this.object.data;
    data.user = game.user;
    data.config = CONFIG.OSE;
    data.counters = {
      str: 0,
      wis: 0,
      dex: 0,
      int: 0,
      cha: 0,
      con: 0,
      gold: 0
    }
    data.stats = {
      sum: 0,
      avg: 0,
      std: 0
    }
    return data;
  }

  /* -------------------------------------------- */

  doStats(ev) {
    let list = $(ev.currentTarget).closest('.attribute-list');
    let values = [];
    list.find('.score-value').each((i, s) => {
      if (s.value != 0) {
        values.push(parseInt(s.value));
      }
    })

    let n = values.length;
    let sum = values.reduce((a, b) => a + b);
    let mean = parseFloat(sum) / n;
    let std = Math.sqrt(values.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);

    let stats = list.siblings('.roll-stats');
    stats.find('.sum').text(sum);
    stats.find('.avg').text(Math.round(10 * sum / n) / 10);
    stats.find('.std').text(Math.round(100 * std) / 100);

    if (n >= 6) {
      $(ev.currentTarget).closest('form').find('button[type="submit"]').removeAttr('disabled');
    }

    this.object.data.stats = {
      sum: sum,
      avg: Math.round(10 * sum / n) / 10,
      std: Math.round(100 * std) / 100
    }
  }

  rollScore(score, options = {}) {
    // Increase counter
    this.object.data.counters[score]++;

    const label = score != "gold" ? game.i18n.localize(`OSE.scores.${score}.long`) : "Gold";
    const rollParts = ["3d6"];
    const data = {
      roll: {
        type: "result"
      }
    };
    // Roll and return
    return OseDice.Roll({
      event: options.event,
      parts: rollParts,
      data: data,
      skipDialog: true,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: game.i18n.format('OSE.dialog.generateScore', { score: label, count: this.object.data.counters[score] }),
      title: game.i18n.format('OSE.dialog.generateScore', { score: label, count: this.object.data.counters[score] }),
    });
  }

  async close() {
    super.close();
    // Gather scores
    let scores = {};
    $(this.form.children).find(".score-roll").each((_, d) => {
      let gr = $(d).closest('.form-group');
      let val = gr.find(".score-value").val();
      scores[gr.data("score")] = val;
    })
    const gold = $(this.form.children).find('.gold-value').val();
    const speaker = ChatMessage.getSpeaker({ actor: this });
    const templateData = {
      config: CONFIG.OSE,
      scores: scores,
      title: game.i18n.localize("OSE.dialog.generator"),
      stats: this.object.data.stats,
      gold: gold
    }
    const content = await renderTemplate("/systems/ose/templates/chat/roll-creation.html", templateData)
    ChatMessage.create({
      content: content,
      speaker,
    });
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    html.find('a.score-roll').click((ev) => {
      let el = ev.currentTarget.parentElement.parentElement;
      let score = el.dataset.score;
      this.rollScore(score, { event: ev }).then(r => {
        $(el).find('input').val(r.total).trigger('change');
      });
    });

    html.find('a.gold-roll').click((ev) => {
      let el = ev.currentTarget.parentElement.parentElement.parentElement;
      this.rollScore("gold", { event: ev }).then(r => {
        $(el).find('.gold-value').val(r.total * 10);
      });
    });

    html.find('input.score-value').change(ev => {
      this.doStats(ev);
    })
  }

  async _onSubmit(event, { updateData = null, preventClose = false, preventRender = false } = {}) {
    super._onSubmit(event, { updateData: updateData, preventClose: preventClose, preventRender: preventRender });
    // Generate gold
    let gold = event.target.elements.namedItem('gold').value;
    const itemData = {
      name: "GP",
      type: "item",
      img: "/systems/ose/assets/gold.png",
      data: {
        treasure: true,
        cost: 1,
        weight: 1,
        quantity: {
          value: gold
        }
      }
    };
    this.object.createOwnedItem(itemData);
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
    this.object.update(formData);
    // Re-draw the updated sheet
    this.object.sheet.render(true);
  }
}
