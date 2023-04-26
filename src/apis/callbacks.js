const {
  tryToParseJSON,
  getNodesByType,
  keysToCamel,
} = require("../utils/helpers");
const GetNode = require("../utils/get-node");

let triggersByApp;

/*
 * Called by Received message node on deploy
 */
const registerTrigger = (node) => {
  if (node.convApiConfig.config && node.convApiConfig.config.appId) {
    const { appId } = node.convApiConfig.config;
    triggersByApp[appId] = triggersByApp[appId] || [];

    if (triggersByApp[appId].length > 0) {
      console.log(`Duplicate triggers registered for app [${appId}]`);
    }

    triggersByApp[appId].push(node);
    return () => {
      triggersByApp[appId] = triggersByApp[appId].filter((t) => {
        return t !== node;
      });
    };
  } else return () => {};
};

/*
 * Express middleware that responds to callback
 */
const respondToCallback = () => (_, res, next) => {
  res.send({});
  next();
};

/*
 * All events should be routed to all event nodes. Only the Inbound Message event should also be routed to either a Receive message node or a send node.
 */
const checkAndRouteEvent = (RED) => (req, _, next) => {
  const getNode = GetNode(RED);
  const body = keysToCamel(req.body);

  getNodesByType("sinch-events", RED).forEach(({ id }) => {
    const node = getNode(id);
    node.onEventIn(body);
  });

  if (body.message && body.message.contactMessage) {
    next();
  }
};

/*
 * Express middleware that builds message from req.body
 * lastResponse contains the complete message from the conversation API
 * variables and awaiting node id are stored in the conversationMetadata (called messageMetadata from the API)
 * messageMetadata is called only metadata from the API and contains the postbackData for routing
 * payload contains the actual message sent from the API
 */
const setMessage = () => async (req, _, next) => {
  const body = keysToCamel(req.body);
  if (body.message && body.message.contactMessage) {
    const {
      contactMessage,
      channelIdentity,
      contactId,
      metadata,
    } = body.message;
    const messageMetadata = tryToParseJSON(body.messageMetadata);

    req.message = {
      lastResponse: body,
      contact: { channelIdentities: [channelIdentity], contactId },
      variables:
        (messageMetadata && tryToParseJSON(messageMetadata.variables)) || {},
      conversationMetadata: messageMetadata,
      messageMetadata: tryToParseJSON(metadata) || undefined,
      payload:
        (contactMessage.mediaMessage && contactMessage.mediaMessage.url) ||
        (contactMessage.textMessage && contactMessage.textMessage.text) ||
        contactMessage.choiceResponseMessage ||
        contactMessage.locationMessage ||
        contactMessage,
    };
    next();
  }
};

/*
 * Middleware that dispatches the inbound message to a waiting
 * receive node, or to trigger(s) registered for the project
 */
const dispatchMessage = (RED) => async (req, _, next) => {
  const getNode = GetNode(RED);
  const { lastResponse, messageMetadata, conversationMetadata } = req.message;
  const { appId, message } = lastResponse;

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

  if (
    message &&
    message.contactMessage & message.contactMessage.choiceResponseMessage
  ) {
    const receiveNode =
      messageMetadata &&
      messageMetadata.postbackNode &&
      getNode(messageMetadata.postbackNode);
    if (!receiveNode) {
      return sendToTriggers();
    }
    receiveNode.onResponse(req.message);
  } else if (conversationMetadata && conversationMetadata.nextResponse) {
    const receiveNode = getNode(conversationMetadata.nextResponse);
    if (!receiveNode) {
      return sendToTriggers();
    }
    receiveNode.onResponse(req.message, receiveNode);
  } else {
    sendToTriggers();
  }
};

/*
 * Install HTTP route and init triggersByApp hashmap
 */
const setup = (RED) => {
  RED.httpNode.post(
    "/sinch-conversation-api/callback",
    respondToCallback(),
    checkAndRouteEvent(RED),
    setMessage(),
    dispatchMessage(RED),
    (err) => {
      if (err) {
        console.log("CallbackError");
      }
    }
  );
  triggersByApp = {};
};

module.exports = {
  registerTrigger,
  registerCallback: (RED) => setup(RED),
};
