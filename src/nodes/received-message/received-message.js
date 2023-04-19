const { registerTrigger } = require("../../apis/callbacks");
const { getToken } = require("../../apis/auth");
const { listApps } = require("../../apis/conv-api");
const { tryToParseJSON } = require("../../utils/helpers");

module.exports = function(RED) {
  class ReceivedMessage {
    constructor(config) {
      RED.nodes.createNode(this, config);
      this.config = config;
      this.convApiConfig = RED.nodes.getNode(this.config.convapiConfiguration);

      const removeCallback = registerTrigger(this);
      this.on("close", removeCallback);
    }

    async onMessageIn(inboundMessage) {
      this.send(inboundMessage);
    }
  }

  RED.httpNode.post("/sinch-conversation-api/apps", async (req, res) => {
    const { projectId, keyId, keySecret, region } = req.body;
    if (!projectId || !keyId || !keySecret || !region)
      return res.sendStatus(400);
    const token = await getToken(keyId, keySecret);
    if (!token) return res.sendStatus(401);
    listApps({ projectId, token, region })
      .then(({ body }) => {
        const { apps } = tryToParseJSON(body);
        res.send({ apps });
      })
      .catch((error) => {
        console.log("Error: ", error);
        return res.sendStatus(500);
      });
  });

  RED.nodes.registerType("sinch-received-message", ReceivedMessage);
};
