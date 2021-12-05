import { RollHandler } from "../rollHandler.js";

export class RollHandlerDnd4e extends RollHandler {
  constructor() {
    super();
  }

  /** @override */
  async doHandleActionEvent(event, encodedValue) {
    let payload = encodedValue.split("|");

    if (payload.length !== 3) {
      super.throwInvalidValueErr();
    }

    let macroType = payload[0];
    let tokenId = payload[1];
    let actionId = payload[2];

    if (tokenId === "multi") {
      for (let t of canvas.tokens.controlled) {
        let idToken = t.id;
        await this._handleMacros(event, macroType, idToken, actionId);
      }
    } else {
      await this._handleMacros(event, macroType, tokenId, actionId);
    }
  }

  async _handleMacros(event, macroType, tokenId, actionId) {
    switch (macroType) {
      case "power":
        if (this.isRenderItem()) this.doRenderItem(tokenId, actionId);
        else this.rollItemMacro(event, tokenId, actionId);
        break;
      default:
        break;
    }
  }

  rollItemMacro(event, tokenId, itemId) {
    const actor = super.getActor(tokenId);
    const item = super.getItem(actor, itemId);

    return actor.usePower(item, event);
  }
}
