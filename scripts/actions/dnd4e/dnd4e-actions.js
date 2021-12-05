import {ActionHandler} from "../actionHandler.js";
import * as settings from "../../settings.js";

export class ActionHandlerDnd4e extends ActionHandler {
  constructor(filterManager, categoryManager) {
    super(filterManager, categoryManager);
  }

  /** @override */
  doBuildActionList(token, multipleTokens) {
    if (token) {
      return this._buildSingleTokenList(token);
    } else if (multipleTokens) {
      return this._buildMultipleTokenList();
    }
    return this.initializeEmptyActionList();
  }

  async _buildSingleTokenList(token) {
    const list = this.initializeEmptyActionList();
    list.tokenId = token?.id;
    list.actorId = token?.actor?.id;
    if (!list.tokenId || !list.actorId) {
      return list;
    }

    if (settings.get("showHudTitle")) {
      list.hudTitle = token.data?.name;
    }

    const cats = await this._buildCategories(token);
    cats
      .flat()
      .filter((c) => c)
      .forEach((c) => {
        this._combineCategoryWithList(list, c.name, c);
      });

    return list;
  }

  _buildCategories(token) {
    return [
      this._buildPowersCategory(token),
    ];
  }

  _buildMultipleTokenList() {
    return this.initializeEmptyActionList();
  }

  /** FEATS **/

  /** @private */
  _buildPowersCategory(token) {
    let validPowers =  token.actor.data.items.filter((i) => i.type === "power");
    let sortedFeats = this._sortByItemSort(validPowers);
    return this._categorisePowers(token.id, token.actor, sortedFeats);
  }

  /** @private */
  _categorisePowers(tokenId, actor, powers) {
    const atWill = this.initializeEmptySubcategory();
    const encounter = this.initializeEmptySubcategory();
    const daily = this.initializeEmptySubcategory();
    const recharge = this.initializeEmptySubcategory();
    const other = this.initializeEmptySubcategory();

    powers.forEach(power => {
      const powerData = this._getEntityData(power);
      const macroType = "power";
      const powerItem = this._buildEquipmentItem(tokenId, actor, macroType, power);

      switch (powerData.useType) {
        case "atwill": atWill.actions.push(powerItem); break;
        case "encounter": encounter.actions.push(powerItem); break;
        case "daily": daily.actions.push(powerItem); break;
        case "recharge": recharge.actions.push(powerItem); break;
        case "other": other.actions.push(powerItem); break;
      }
    })

    let result = this.initializeEmptyCategory("powers");
    result.name = this.i18n("tokenactionhud.powers");

    const titleAtWill = this.i18n("tokenactionhud.dnd4e.atwill");
    const titleEncounter = this.i18n("tokenactionhud.dnd4e.encounter");
    const titleDaily = this.i18n("tokenactionhud.dnd4e.daily");
    const titleRecharge = this.i18n("tokenactionhud.dnd4e.recharge");
    const titleOther = this.i18n("tokenactionhud.dnd4e.other");
    this._combineSubcategoryWithCategory(result, titleAtWill, atWill);
    this._combineSubcategoryWithCategory(result, titleEncounter, encounter);
    this._combineSubcategoryWithCategory(result, titleDaily, daily);
    this._combineSubcategoryWithCategory(result, titleRecharge, recharge);
    this._combineSubcategoryWithCategory(result, titleOther, other);

    return result;
  }

  /** @private */
  _buildEquipmentItem(tokenId, actor, macroType, item) {
    let action = this._buildItem(tokenId, actor, macroType, item);
    this._addItemInfo(actor, item, action);
    return action;
  }

  /** @private */
  _addItemInfo(actor, item, action) {
    action.info1 = this._getUsesData(item);
  }

  /** @private */
  _getUsesData(item) {
    const itemData = this._getEntityData(item);
    let result = "";

    let uses = itemData.uses;
    if (!uses) return result;

    result = uses.value === 0 && uses.max ? "0" : uses.value;

    if (uses.max > 0) {
      result += `/${uses.max}`;
    }

    return result;
  }

  /** @private */
  _buildItem(tokenId, actor, macroType, item) {
    return {
      name: item.name,
      id: item.id,
      encodedValue: [macroType, tokenId, item.id].join(this.delimiter),
      img: this._getImage(item),
      icon: this._getActionIcon(item.data?.data?.activation?.type),
    };
  }

  _getImage(item) {
    let result = "";
    if (settings.get("showIcons")) result = item.img ?? "";

    return !result?.includes("icons/svg/mystery-man.svg") ? result : "";
  }

  /** @private */
  _sortByItemSort(items) {
    let result = Object.values(items);

    result.sort((a, b) => a.sort - b.sort);

    return result;
  }

  _getActionIcon(action) {
    const img = {
      atwill: `<i class="fas fa-chess-pawn"></i>`,
      encounter: `<i class="fas fa-chess-bishop"></i>`,
      daily: `<i class="fas fa-chess-queen"></i>`,
      recharge: `<i class="fas fa-sync"></i>`,
      other: `<i class="fas fa-question"></i>`,
    };
    return img[action];
  }

  _getEntityData(entity) {
    return entity.data.data ?? entity.data;
  }
}
