export class OseActor extends Actor {
  /**
   * Extends data from base Actor class
   */
  prepareData() {
    super.prepareData();
    return this.data;
  }
  /* -------------------------------------------- */
  /*  Socket Listeners and Handlers
    /* -------------------------------------------- */

  /** @override */
  async createOwnedItem(itemData, options) {
    return super.createOwnedItem(itemData, options);
  }
  /* -------------------------------------------- */
  /*  Rolls                                       */
  /* -------------------------------------------- */
}
