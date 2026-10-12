var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};

// src/HCESession.ts
import { NativeEventEmitter, NativeModules, Platform } from "react-native";

// src/NFCTagType4/index.ts
var NFCTagType4NDEFContentType = /* @__PURE__ */ ((NFCTagType4NDEFContentType2) => {
  NFCTagType4NDEFContentType2["Text"] = "text";
  NFCTagType4NDEFContentType2["URL"] = "url";
  return NFCTagType4NDEFContentType2;
})(NFCTagType4NDEFContentType || {});
var NFCTagType4 = class {
  /**
   * Creates a new instance of NFCTagType4 containing an NDEF message.
   * @param props Props of the tag
   *
   * @example
   * ```
   * const tag = new NFCTagType4({
   *   type: NFCTagType4NDEFContentType.Text,
   *   content: "Hello NFC World!",
   *   writable: false
   * });
   * ...
   * hceSession.setApplication(tag);
   * ```
   */
  constructor(props) {
    this.type = "NFCTag";
    this.content = __spreadValues({}, props);
  }
  /**
   * Maps the string to {@link NFCTagType4NDEFContentType}.
   *
   * @param type
   */
  static contentTypeFromString(type) {
    switch (type) {
      case "text":
        return "text" /* Text */;
      case "url":
        return "url" /* URL */;
      default:
        throw new Error("Unknown type");
    }
  }
  /**
   * Maps the {@link NFCTagType4NDEFContentType} to string.
   *
   * @param type
   */
  static stringFromContentType(type) {
    switch (type) {
      case "url" /* URL */:
        return "url";
      case "text" /* Text */:
        return "text";
      default:
        throw new Error("Unknown type");
    }
  }
};

// src/HCESession.ts
var { Hce: NativeHce } = NativeModules;
var eventEmitter = new NativeEventEmitter(NativeHce);
var instance = null;
var checkPlatform = () => {
  if (Platform.OS !== "android") {
    throw new Error("react-native-hce does not support this platform");
  }
};
var _HCESession = class _HCESession {
  /**
   * Creates the instance of HCE Session class.
   *
   * __NOTE!!!: Do not use this constructor directly. Use {@link getInstance} to get the appropriate and synchronized instance.__
   */
  constructor() {
    /**
     * Adds the listener to an event.
     *
     * @internal
     */
    this.addListener = (eventName, callback) => {
      return eventEmitter.addListener(eventName, (eventProp) => {
        callback(eventProp);
      });
    };
    /**
     * Toggle the state of HCE service.
     *
     * This function allows to enable or disable the native component of HCE Service.
     * If enabled, the native HostApduService will be recognizable by platform's HCE router.
     * If not, service won't be recognized, thus all the interactions between HCE and reader won't be available.
     *
     * __NOTE:__ Before switching the service on, use the {@link setApplication}
     * first to register the content that You want to emulate using HCE.
     *
     * @param enable True to enable the service, false to disable.
     */
    this.setEnabled = async (enable) => {
      if (!this.application && enable) {
        throw new Error("No application set!");
      }
      await NativeHce.setEnabled(enable);
      this.enabled = enable;
    };
    this.enabled = false;
    this.application = null;
    this.stateListeners = [];
    this.addListener("hceState", this.handleStateUpdate.bind(this));
  }
  /**
   * Gets the instance of HCE Session.
   *
   * As there is only one HCE Session per application available,
   * use this function to get the instance instead of using the constructor.
   */
  static async getInstance() {
    checkPlatform();
    if (instance !== null) {
      return instance;
    }
    instance = new _HCESession();
    await instance.syncApplication();
    return instance;
  }
  /**
   * Internal method for synchronization with native module.
   *
   * @internal
   * @private
   * @param incomingEvent Native module event parameter
   */
  async handleStateUpdate(incomingEvent) {
    if (incomingEvent === _HCESession.Events.HCE_STATE_WRITE_FULL) {
      await this.syncApplication();
    }
    this.stateListeners.filter((i) => i !== null).forEach(({ event, listener }) => {
      if (event === null || event === incomingEvent) {
        listener();
      }
    });
  }
  /**
   * Adds event listener to the HCE Session.
   *
   * @param event The event that application should listen to. You should pass the constant from static {@link HCESession.Events} property.
   * If null, the listener will respond to all events - that can be usable for logging purposes.
   * @param listener The event listener.
   * @return Returns the reference to "stop listening" method. To stop listening the event, just call it.
   *
   * @example
   * ```
   * import { ToastAndroid } from "react-native"
   * import { HCESession } from "react-native-hce"
   * ...
   * const instance = await HCESession.getInstance();
   * const removeListener = instance.on(HCESession.Events.HCE_STATE_READ, () => {
   *   ToastAndroid.show("The tag has been read! Thank You.", ToastAndroid.LONG);
   *   removeListener();
   * };
   * ```
   */
  on(event, listener) {
    const index = this.stateListeners.push({ event, listener });
    return () => {
      this.stateListeners[index] = null;
    };
  }
  /**
   * Synchronize the class with current native state.
   *
   * __NOTE__: You should not use this function normally.
   * Internal implementation will call it for You, if needed.
   */
  async syncApplication() {
    const content = await NativeHce.getContent();
    if (!content) {
      return;
    }
    const enabled = await NativeHce.getEnabled();
    this.application = new NFCTagType4({
      type: NFCTagType4.contentTypeFromString(content.type),
      content: content.content,
      writable: content.writable
    });
    this.enabled = enabled;
  }
  /**
   * Update the subject application to emulate in HCE.
   *
   * @param application The application to set, must be instance of HCEApplication.
   */
  async setApplication(application) {
    await NativeHce.setContent(application.content);
    this.application = application;
  }
};
/**
 * Object that contains the events that the application can listen to using ``HCESession.on(...)``.
 *
 * Check the {@link HCESessionEvents} interface to get the listing of availble events.
 *
 * @example Usage of the property in event listener:
 * ```
 * hceSession.on(HCESession.Events.HCE_CONNECTED)
 * ```
 */
_HCESession.Events = NativeHce.getConstants();
var HCESession = _HCESession;

// src/HCESessionContext.tsx
import React, { createContext, useEffect, useState } from "react";
var HCESessionContext = createContext({
  session: new HCESession()
});
var HCESessionProvider = (props) => {
  const [session, setSession] = useState();
  useEffect(() => {
    if (!session) {
      HCESession.getInstance().then((instance2) => {
        setSession(instance2);
      });
    }
  }, [session, setSession]);
  if (!session) {
    return null;
  }
  return /* @__PURE__ */ React.createElement(HCESessionContext.Provider, __spreadValues({ value: { session } }, props));
};
export {
  HCESession,
  HCESessionContext,
  HCESessionProvider,
  NFCTagType4,
  NFCTagType4NDEFContentType
};
