/**
 * Override and extend the basic :class:`Item` implementation
 */
export class OseItem extends Item {
  /* -------------------------------------------- */
  /*	Data Preparation														*/
  /* -------------------------------------------- */

  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    super.prepareData();
  }

  static async create(data, options = {}) {
    return super.create(data, options);
  }
  /* -------------------------------------------- */
  /** @override */
  async update(data, options = {}) {
    return super.update(data, options);
  }

  /* -------------------------------------------- */

  static chatListeners(html) {
  }

  /**
   * Roll the item to Chat
   * @return {Promise}
   */
  async roll(options = {}) {
    if (options.type == "chat") {
      this.rollCard(options);
      return;
    }
    if (options.type == "attack") {
      this.rollAttack(options);
      return;
    }
    if (options.type == "damage") {
      this.rollDamage(options);
      return;
    }
    if (options.type == "trigger") {
      return;
    }
  }

  /* -------------------------------------------- */
  /*  Item Rolls - Attack, Damage, Saves, Checks  */
  /* -------------------------------------------- */
  async rollCard(options = {}) {
    // Basic template rendering data
    const token = this.actor.token;
    const templateData = {
      actor: this.actor,
      tokenId: token ? `${token.scene._id}.${token.id}` : null,
      item: this.data,
      hasAttack: this.data.data.details.attack != "",
      isHealing: this.data.data.tags.descriptor == "healing",
      hasDamage: this.data.data.damage.die != 0,
      hasTrigger: this.data.data.trigger.threshold != 0,
      config: CONFIG.MAJI,
    };
    // Render the chat card
    const template = "systems/ose/templates/chat/technique-card.html";
    const html = await renderTemplate(template, templateData);

    // Basic chat message data
    const chatData = {
      user: game.user._id,
      type: CONST.CHAT_MESSAGE_TYPES.OTHER,
      content: html,
      speaker: {
        actor: this.actor._id,
        token: this.actor.token,
        alias: this.actor.name,
      },
    };
    // Toggle default roll mode
    let rollMode = game.settings.get("core", "rollMode");
    if (["gmroll", "blindroll"].includes(rollMode))
      chatData["whisper"] = ChatMessage.getWhisperIDs("GM");
    if (rollMode === "blindroll") chatData["blind"] = true;

    // Create the chat message
    return ChatMessage.create(chatData);
  }

  /**
   * Place an attack roll using an item (weapon, feat, spell, or equipment)
   * Rely upon the Dice5e.d20Roll logic for the core implementation
   *
   * @return {Promise.<Roll>}   A Promise which resolves to the created Roll instance
   */
  rollAttack(options = {}) {
    const itemData = this.data.data;
    const actorData = this.actor.data.data;
    if (this.type != "technique") return;
    const label = this.name;
    let parts = [];
    if (options.empowered) {
      parts.push("2d8");
    } else {
      parts.push("2d6");
    }
    parts.push(
      actorData.attributes[itemData.details.attack].value +
        actorData.attributes[itemData.details.attack].mod
    );

    let rollMode = game.settings.get("core", "rollMode");
    let roll = new Roll(parts.join(" + "), {}).roll();
    roll.toMessage(
      {
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: `${label} ${game.i18n.localize("MAJI.technique.attack")}`,
      },
      { rollMode }
    );
    return roll;
  }

  rollDamage(options = {}) {
    const itemData = this.data.data;
    const actorData = this.actor.data.data;
    if (this.type != "technique") return;
    const label = this.name;
    let parts = [];
    if (itemData.damage.num && itemData.damage.die) {
      parts.push(`${itemData.damage.num}d${itemData.damage.die}`);
    }
    if (itemData.damage.bonus) {
      parts.push(
        actorData.attributes[itemData.damage.bonus].value +
          actorData.attributes[itemData.damage.bonus].mod
      );
    }
    if (options.empowered && itemData.damage.die) {
      parts.push(`1d${itemData.damage.die}`);
    }
    if (actorData.affinities.includes(itemData.element)) {
      parts.push(actorData.affinity.value + actorData.affinity.mod);
    }
    let rollMode = game.settings.get("core", "rollMode");
    let roll = new Roll(parts.join(" + "), {}).roll();
    roll.toMessage(
      {
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: `${label} ${game.i18n.localize("MAJI.technique.damage")}`,
      },
      { rollMode }
    );
    return roll;
  }

  /* -------------------------------------------- */

  /**
   * Handle toggling the visibility of chat card content when the name is clicked
   * @param {Event} event   The originating click event
   * @private
   */
  static _onChatCardToggleContent(event) {
    event.preventDefault();
    const header = event.currentTarget;
    const card = header.closest(".chat-card");
    const content = card.querySelector(".card-content");
    content.style.display = content.style.display === "none" ? "block" : "none";
  }

  static async _onChatCardAction(event) {
    event.preventDefault();

    // Extract card data
    const button = event.currentTarget;
    button.disabled = true;
    const card = button.closest(".chat-card");
    const messageId = card.closest(".message").dataset.messageId;
    const message = game.messages.get(messageId);
    const action = button.dataset.action;

    // Validate permission to proceed with the roll
    const isTargetted = action === "trigger";
    if (!(isTargetted || game.user.isGM || message.isAuthor)) return;

    // Get the Actor from a synthetic Token
    const actor = this._getChatCardActor(card);
    if (!actor) return;

    // Get the Item
    const item = actor.getOwnedItem(card.dataset.itemId);

    // Get card targets
    let targets = [];
    if (isTargetted) {
      targets = this._getChatCardTargets(card);
      if (!targets.length) {
        ui.notifications.warn(
          `You must have one or more controlled Tokens in order to use this option.`
        );
        return (button.disabled = false);
      }
    }

    // Attack and Damage Rolls
    if (action === "attack") await item.rollAttack({ event });
    // Saving Throws for card targets
    else if (action === "trigger") {
      for (let t of targets) {
        await t.rollTrigger(
          {
            threshold: button.dataset.threshold,
            condition: button.dataset.condition,
          },
          { event }
        );
      }
    }

    // Re-enable the button
    button.disabled = false;
  }

  static _getChatCardActor(card) {
    // Case 1 - a synthetic actor from a Token
    const tokenKey = card.dataset.tokenId;
    if (tokenKey) {
      const [sceneId, tokenId] = tokenKey.split(".");
      const scene = game.scenes.get(sceneId);
      if (!scene) return null;
      const tokenData = scene.getEmbeddedEntity("Token", tokenId);
      if (!tokenData) return null;
      const token = new Token(tokenData);
      return token.actor;
    }

    // Case 2 - use Actor ID directory
    const actorId = card.dataset.actorId;
    return game.actors.get(actorId) || null;
  }

  static _getChatCardTargets(card) {
    const character = game.user.character;
    const controlled = canvas.tokens.controlled;
    const targets = controlled.reduce(
      (arr, t) => (t.actor ? arr.concat([t.actor]) : arr),
      []
    );
    if (character && controlled.length === 0) targets.push(character);
    return targets;
  }
}
