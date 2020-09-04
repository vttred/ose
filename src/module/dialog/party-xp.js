export class OsePartyXP extends FormApplication {

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["ose", "dialog", "party-xp"],
            template: "systems/ose/templates/apps/party-xp.html",
            width: 280,
            height: 400,
            resizable: false,
        });
    }

    /* -------------------------------------------- */

    /**
     * Add the Entity name into the window title
     * @type {String}
     */
    get title() {
        return game.i18n.localize("OSE.dialog.xp.deal");
    }

    /* -------------------------------------------- */

    /**
     * Construct and return the data object used to render the HTML template for this form application.
     * @return {Object}
     */
    getData() {
        const actors = this.object.entities.filter(e => e.data.type === "character" && e.data.flags.ose && e.data.flags.ose.party === true);
        let data = {
            actors: actors,
            data: this.object,
            config: CONFIG.OSE,
            user: game.user,
            settings: settings
        };
        return data;
    }

    _onDrop(event) {
        event.preventDefault();
        // WIP Drop Item Quantity
        let data;
        try {
            data = JSON.parse(event.dataTransfer.getData("text/plain"));
            if (data.type !== "Item") return;
        } catch (err) {
            return false;
        }
    }
    /* -------------------------------------------- */

    _calculateShare(ev) {
        const actors = this.object.entities.filter(e => e.data.type === "character" && e.data.flags.ose && e.data.flags.ose.party === true);
        const toDeal = $(ev.currentTarget.parentElement).find('input[name="total"]').val();
        const html = $(this.form);
        let shares = 0;
        actors.forEach((a) => {
            shares += a.data.data.details.xp.share;
        });
        const value = parseFloat(toDeal) / shares;
        if (value) {
            actors.forEach(a => {
                html.find(`li[data-actor-id='${a.id}'] input`).val(Math.floor(a.data.data.details.xp.share * value));
            })
        }
    }

    _dealXP(ev) {
        const html = $(this.form);
        const rows = html.find('.actor');
        rows.each((_, row) => {
            const qRow = $(row);
            const value = qRow.find('input').val();
            const id = qRow.data('actorId');
            const actor = this.object.entities.find(e => e.id === id);
            actor.getExperience(Math.floor(parseInt(value)))
        })
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);
        html
            .find('button[data-action="calculate-share"')
            .click(this._calculateShare.bind(this));
        html
            .find('button[data-action="deal-xp"')
            .click(this._dealXP.bind(this));
    }
}
