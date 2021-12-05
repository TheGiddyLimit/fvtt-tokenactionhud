import {SystemManager} from "./manager.js";
import {ActionHandlerDnd4e as ActionHandler} from "../actions/dnd4e/dnd4e-actions.js";
import * as systemSettings from "../settings/dnd5e-settings.js";
import { RollHandlerDnd4e as RollHandler } from "../rollHandlers/dnd4e/dnd4e.js";


export class Dnd4eSystemManager extends SystemManager {
  constructor(appName) {
    super(appName);
  }

  /** @override */
  doGetActionHandler(filterManager, categoryManager) {
	  return new ActionHandler(filterManager, categoryManager);
  }

  /** @override */
  getAvailableRollHandlers() {
    return { core: "D&D4e" };
  }

  /** @override */
  doGetRollHandler(handlerId) {
  	return new RollHandler();
  }

  /** @override */
  doRegisterSettings(appName, updateFunc) {
    systemSettings.register(appName, updateFunc);
  }
}
