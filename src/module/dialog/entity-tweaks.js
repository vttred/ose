// eslint-disable-next-line no-unused-vars
import { OseActor } from "../actor/entity.js";

export class OseEntityTweaks extends FormApplication {
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.id = "sheet-tweaks";
    options.template =
      "systems/ose/dist/templates/actors/dialogs/tweaks-dialog.html";
    options.width = 380;
    return options;
  }

  /* -------------------------------------------- */

  /**
   * Add the Entity name into the window title
   * @type {String}
   */
  get title() {
    return `${this.object.name}: ${game.i18n.localize("OSE.dialog.tweaks")}`;
  }

  /* -------------------------------------------- */

  /**
   * Construct and return the data object used to render the HTML template for this form application.
   * @return {Object}
   */
  getData() {
    const data = foundry.utils.deepClone(this.object.data);
    if (data.type === "character") {
      data.isCharacter = true;
    }
    data.user = game.user;
    data.config = {
      ...CONFIG.OSE,
      ascendingAC: game.settings.get("ose", "ascendingAC"),
    };
    return data;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {

    html.find("#multiclass").change(e => {      
      const multiClassEnabled = $(e.currentTarget).is(":checked");
      if(!multiClassEnabled){
        html.find("#xp2enabled").val(false); 
        html.find("#xp3enabled").val(false); 
        html.find("#experience2").val(0);
        html.find("#experience3").val(0);
        html.find("#experiencenext2").val(0);
        html.find("#experiencenext3").val(0);
        html.find(".additional-classes").hide();
        html.find(".first-class-multiclass-label").hide();
      } else {
        html.find(".additional-classes").show();
        html.find(".first-class-multiclass-label").show();
      }
    });

    html.find("#xp2enabled").change(e => {      
      const xp2Enabled = $(e.currentTarget).is(":checked");
      if(!xp2Enabled){
        html.find("#xp3enabled").val(false).attr("disabled", true); 
        html.find("#experience3").val(0).attr("readonly", true);
        html.find("#experiencenext3").val(0).attr("readonly", true);
        
      } else {
        html.find("#xp3enabled").attr("disabled", false); 
        html.find("#experience3").attr("readonly", false);
        html.find("#experiencenext3").attr("readonly", false);
      }
    });
    
    super.activateListeners(html);
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
    const multiClassEnabled = $("#multiclass").is(":checked");
    const xp2Enabled = $("#xp2enabled").is(":checked");
    
    if(!multiClassEnabled){
      formData['data.details.xp2.enabled'] = false; 
      formData['data.details.xp3.enabled'] = false; 
    }
    if(!xp2Enabled){
      formData['data.details.xp3.enabled'] = false; 
    }
    
    this.object.update(formData);
    // Re-draw the updated sheet
    this.object.sheet.render(true);
  }
}
