export class OsePartySheet extends FormApplication {
  static get defaultOptions() {
    const options = super.defaultOptions;
    (options.classes = ["ose", "dialog", "party-sheet"]),
      (options.id = "party-sheet");
    options.template = "systems/ose/templates/apps/party-sheet.html";
    options.width = 280;
    return options;
  }

  /* -------------------------------------------- */

  /**
   * Add the Entity name into the window title
   * @type {String}
   */
  get title() {
    return game.i18n.localize("OSE.dialog.partysheet");
  }

  /* -------------------------------------------- */

  /**
   * Construct and return the data object used to render the HTML template for this form application.
   * @return {Object}
   */
  getData() {
    const settings = {
      ascending: game.settings.get('ose', 'ascendingAC')
    };
    let data = {
      data: this.object,
      config: CONFIG.OSE,
      user: game.user,
      settings: settings
    };
    return data;
  }

  _onDrop(event) {
    event.preventDefault();

    console.log("DROPPING");
    let data;
    try {
      data = JSON.parse(event.dataTransfer.getData("text/plain"));
      if (data.type !== "Item") return;
    } catch (err) {
      return false;
    }
    console.log(data);
  }
  /* -------------------------------------------- */

  _dealXP(ev) {
    // Grab experience
    const template = `
          <form>
           <div class="form-group">
            <label>How much ?</label> 
            <input name="total" placeholder="0" type="text"/>
           </div>
        </form>`;
    let pcs = this.object.entities.filter((e) => {
      return e.data.type == "character";
    });
    new Dialog({
      title: "Deal Experience",
      content: template,
      buttons: {
        set: {
          icon: '<i class="fas fa-hand"></i>',
          label: game.i18n.localize("OSE.dialog.dealXP"),
          callback: (html) => {
            let toDeal = html.find('input[name="total"]').val();
            const value = parseFloat(toDeal) / pcs.length;
            if (value) {
              // Give experience
              pcs.forEach((t) => {
                t.getExperience(Math.floor(value));
              });
            }
          },
        },
      },
    }).render(true);
  }

  async _selectActors(ev) {
    const template = "/systems/ose/templates/apps/party-select.html";
    const templateData = {
      actors: this.object.entities
    }
    const content = await renderTemplate(template, templateData);
    new Dialog({
      title: "Select Party Characters",
      content: content,
      buttons: {
        set: {
          icon: '<i class="fas fa-save"></i>',
          label: game.i18n.localize("OSE.Update"),
          callback: (html) => {
            let checks = html.find("input[data-action='select-actor']");
            checks.each(async (_, c) => {
              let key = c.getAttribute('name');
              await this.object.entities[key].setFlag('ose', 'party', c.checked);
            });
          },
        },
      },
    }, {height: "auto"}).render(true);
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    html
      .find("button[data-action='select-actors']")
      .click(this._selectActors.bind(this));
    html.find("button[data-action='deal-xp']").click(this._dealXP.bind(this));
    html.find("a.resync").click(() => this.render(true));
    html.find(".field-img").click((ev) => {
      let actorId = ev.currentTarget.parentElement.dataset.actorId;
      game.actors.get(actorId).sheet.render(true);
    })
  }
}
