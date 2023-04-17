const { keysToCamel } = require("../utils/helpers");
const { tryToParseJSON } = require("../utils/helpers");

let triggersByApp = {};

/*
 * Called by Received message node on deploy
 */
const registerTrigger = (receiveMessageNode) => {
  const { appId } = receiveMessageNode.config;
  triggersByApp[appId] = triggersByApp[appId] || [];
  triggersByApp[appId].push(receiveMessageNode);
  return () => {
    triggersByApp[appId] = triggersByApp[appId].filter((t) => {
      return t !== receiveMessageNode;
    });
  };
};

/*
 * Express middleware that responds to callback
 */
const respondToCallback = () => (_, res, next) => {
  res.send({});
  next();
};

/*
 * Express middleware that builds message from req.body
 */
const setMessage = () => async (req, _, next) => {
  const body = keysToCamel(req.body);
  if (body.message && body.message.contactMessage) {
    const { contactMessage } = body.message;

    req.message = { sinch_data: body.message };

    const metadata = tryToParseJSON(body.messageMetadata);
    req.message.sinch_data.variables =
      (metadata && tryToParseJSON(metadata.variables)) || {};

    req.message.sinch_data.messageMetadata = metadata;
    req.message.payload =
      (contactMessage.mediaMessage && contactMessage.mediaMessage.url) ||
      (contactMessage.textMessage && contactMessage.textMessage.text) ||
      contactMessage.choiceResponseMessage ||
      contactMessage.locationMessage ||
      contactMessage;
    next();
  }
};

/*
 * Middleware that dispatches the inbound message to a waiting
 * receive node, or to trigger(s) registered for the project
 */
const dispatchMessage = () => async (req, _, next) => {
  const { appId } = req.message;

  const sendToTriggers = () => {
    if (!triggersByApp[appId] || triggersByApp[appId].length === 0) {
      return next();
    }
    const receivedMessageNodes = triggersByApp[appId].filter(
      (triggerNode) => triggerNode.type === "sinch-received-message"
    );
    if (receivedMessageNodes.length === 0) {
      return next();
    }
    receivedMessageNodes.forEach((receivedMessageNode) => {
      receivedMessageNode.onMessageIn(req.message);
    });
  };

  sendToTriggers();
};

/*
 * Install HTTP route and init triggersByApp hashmap
 */
const setup = (RED) => {
  RED.httpNode.post(
    "/callback",
    respondToCallback(),
    setMessage(),
    dispatchMessage(RED),
    (err) => {
      if (err) {
        throw new Error("callbackReceiver", err);
      }
    }
  );
  triggersByApp = {};
};

module.exports = {
  registerTrigger,
  registerCallback: (RED) => setup(RED),
};
