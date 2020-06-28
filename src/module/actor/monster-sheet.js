import { OseActor } from "./entity.js";
import { ActorTraitSelector } from "../apps/trait-selector.js";

/**
 * Extend the basic ActorSheet with some very simple modifications
 */
export class OseActorSheetMonster extends ActorSheet {
  constructor(...args) {
    super(...args);
  }

  /* -------------------------------------------- */

  /**
   * Extend and override the default options used by the 5e Actor Sheet
   * @returns {Object}
   */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["ose", "sheet", "monster", "actor"],
      template: "systems/ose/templates/actors/monster-sheet.html",
      width: 520,
      height: 580,
      resizable: false,
      tabs: [
        {
          navSelector: ".tabs",
          contentSelector: ".sheet-body",
          initial: "notes",
        },
      ],
    });
  }

  /* -------------------------------------------- */

  /**
   * Prepare data for rendering the Actor sheet
   * The prepared data object contains both the actor data as well as additional sheet options
   */
  getData() {
    const data = super.getData();
    data.config = CONFIG.MAJI;

    // Prepare owned items
    this._prepareItems(data);
    return data;
  }

  /**
   * Organize and classify Owned Items for Character sheets
   * @private
   */
  _prepareItems(data) {
    let [traits, techniques] = data.items.reduce(
      (arr, item) => {
        // Classify items into types
        if (item.type === "feature") arr[0].push(item);
        else if (item.type === "technique") arr[1].push(item);
        return arr;
      },
      [[], [], [], []]
    );
    // Assign and return
    data.traits = traits;
    data.techniques = techniques;
  }

  _onItemSummary(event) {
    event.preventDefault();
    let li = $(event.currentTarget).parents(".item-entry"),
      expanded = !li.children(".collapsible").hasClass("collapsed");
    li = $(li);
    let ol = li.children(".collapsible");
    let icon = li.find("i.fas");

    // Collapse the Playlist
    if (expanded) {
      ol.slideUp(200, () => {
        ol.addClass("collapsed");
        icon.removeClass("fa-angle-up").addClass("fa-angle-down");
      });
    }

    // Expand the Playlist
    else {
      ol.slideDown(200, () => {
        ol.removeClass("collapsed");
        icon.removeClass("fa-angle-down").addClass("fa-angle-up");
      });
    }
  }

  /**
   * Handle spawning the ActorTraitSelector application which allows a checkbox of multiple trait options
   * @param {Event} event   The click event which originated the selection
   * @private
   */
  _onTraitSelector(event) {
    event.preventDefault();
    const a = event.currentTarget;
    const options = {
      name: `data.${a.dataset.target}`,
      title: a.innerText,
      choices: CONFIG.MAJI[a.dataset.options],
    };
    new ActorTraitSelector(this.actor, options).render(true);
  }

  _keyUpHandler(event) {
    if (event.keyCode == 17) {
      let icons = document.querySelectorAll(".monster .roll-empowerable");
      for (let i = 0; i < icons.length; i++) {
        let icon = icons[i].getElementsByTagName("img")[0];
        if (icon.getAttribute("src") == "/systems/majimonsters/assets/icons/dice/d6s.png") {
          icon.setAttribute("src", "/systems/majimonsters/assets/icons/dice/d8s.png");
        } else if (icon.getAttribute("src") == "/systems/majimonsters/assets/icons/dice/d.png"){
          icon.setAttribute("src", "/systems/majimonsters/assets/icons/dice/dp.png");
        }
      }
    }
  }

  _keyDownHandler(event) {
    if (event.keyCode == 17) {
      let icons = document.querySelectorAll(".monster .roll-empowerable");
      for (let i = 0; i < icons.length; i++) {
        let icon = icons[i].getElementsByTagName("img")[0];
        if (icon.getAttribute("src") == "/systems/majimonsters/assets/icons/dice/d8s.png") {
          icon.setAttribute("src", "/systems/majimonsters/assets/icons/dice/d6s.png");
        } else if (icon.getAttribute("src") == "/systems/majimonsters/assets/icons/dice/dp.png"){
          icon.setAttribute("src", "/systems/majimonsters/assets/icons/dice/d.png");
        }
      }
    }
  }

  _onRollTechnique(event) {
    event.preventDefault();
    let itemId = event.currentTarget.parentElement.previousElementSibling.dataset.itemId;
    const technique = this.actor.getOwnedItem(itemId);
    return technique.roll({empowered: event.ctrlKey, type: event.currentTarget.dataset.rollType});
  }

  _onRollStat(event) {
    event.preventDefault();
    let stat = event.currentTarget.parentElement.dataset.attribute;
    this.actor.rollStat(stat, { event: event, empowered: event.ctrlKey });
  }

  _onShowCard(event) {
    event.preventDefault();
    let itemId = event.currentTarget.closest(".item").dataset.itemId;
    const technique = this.actor.getOwnedItem(itemId);
    return technique.roll({empowered: event.ctrlKey, type: event.currentTarget.dataset.rollType});
  }

  /* -------------------------------------------- */

  /**
   * Activate event listeners using the prepared sheet HTML
   * @param html {HTML}   The prepared HTML object ready to be rendered into the DOM
   */
  activateListeners(html) {
    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Update Inventory Item
    html.find(".item-edit").click((ev) => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.getOwnedItem(li.data("itemId"));
      item.sheet.render(true);
    });

    // Delete Inventory Item
    html.find(".item-delete").click((ev) => {
      const li = $(ev.currentTarget).parents(".item");
      this.actor.deleteOwnedItem(li.data("itemId"));
      li.slideUp(200, () => this.render(false));
    });

    html.find(".item-create").click((event) => {
      event.preventDefault();
      const header = event.currentTarget;
      const type = header.dataset.type;
      const itemData = {
        name: `New ${type.capitalize()}`,
        type: type,
        data: duplicate(header.dataset),
      };
      delete itemData.data["type"];
      return this.actor.createOwnedItem(itemData);
    });

    html.find(".item-name").click((event) => {
      this._onItemSummary(event);
    });

    // Switch Gender
    html.find(".mm_gender").click((event) => {
      event.preventDefault();
      if (this.actor.data["data"].details.gender === "female") {
        this.actor.data["data"].details.gender = "male";
        this.render();
        return;
      }
      this.actor.data["data"].details.gender = "female";
      this.render();
    });

    // Config modifier
    html.find(".mm_bullet").click((ev) => {
      event.preventDefault();
      let attribute = $(ev.currentTarget).siblings(".modifier");
      if (attribute.hasClass("hidden")) {
        attribute.removeClass("hidden");
        return;
      }
      attribute.addClass("hidden");
    });

    // trait Selector
    html.find(".trait-selector").click(this._onTraitSelector.bind(this));

    // Listen to event preventing duplicate bindings
    if (document.getElementsByClassName("monster").length == 1) {
      document.addEventListener("keydown", this._keyUpHandler);
      document.addEventListener("keyup", this._keyDownHandler);
    }

    html.find(".roll-icon").click((event) => {
      if (event.currentTarget.classList.contains("roll-technique")) {
        this._onRollTechnique(event);
        return;
      }
      this._onRollStat(event);
    });

    html.find(".item-show").click((event) => {
      this._onShowCard(event);
    });

    // Handle default listeners last so system listeners are triggered first
    super.activateListeners(html);
  }

  /** @override */
  async close(options) {
    if (document.getElementsByClassName("monster").length == 1) {
      document.removeEventListener("keydown", this._keyUpHandler);
      document.removeEventListener("keyup", this._keyDownHandler);
    }
    return super.close(options);
  }
}
