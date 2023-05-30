const { getToken } = require("../../apis/auth");
const { listTemplates } = require("../../apis/conv-api");
const { tryToParseJSON } = require("../../utils/helpers");
const GetNode = require("../../utils/get-node");

module.exports = function(RED) {
  class Template {
    constructor(config) {
      this.config = config;
      RED.nodes.createNode(this, config);

      this.on("input", (msg, _, done) => {
        const template = this.config.template;
        if (!template) {
          this.error("No template selected in the configuration");
          done();
        }

        const newMessage = { ...msg, templateId: template };
        this.send(newMessage);
      });
    }
  }

  RED.httpNode.post("/sinch-conversation-api/templates", async (req, res) => {
    const { configuration, configNodeId } = req.body;

    let configNode = tryToParseJSON(configuration);

    if (!configuration) {
      const getNode = GetNode(RED);
      configNode = getNode(configNodeId);
    }

    if (!configNode) {
      return res.sendStatus(400);
    }

    const { credentials, config } = configNode;

    if (!credentials) {
      return res.sendStatus(400);
    }

    const { keySecret } = credentials;
    const { projectId, keyId, region } = config;
    if (!projectId || !keyId || !keySecret || !region) {
      return res.sendStatus(400);
    }
    const token = await getToken(keyId, keySecret);
    if (!token) {
        return res.sendStatus(401);
    }
    listTemplates({ projectId, token, region })
      .then(({ body }) => {
        const { templates } = tryToParseJSON(body);
        res.send({ templates });
      })
      .catch(() => res.sendStatus(500));
  });

  RED.nodes.registerType("sinch-template", Template);
};
