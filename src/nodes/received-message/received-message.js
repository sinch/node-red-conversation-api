const { registerTrigger } = require('../../apis/callbacks');
const { getToken } = require('../../apis/auth');
const { listApps } = require('../../apis/conv-api');

module.exports = function(RED) {
  class ReceivedMessage {
    constructor(config) {
      RED.nodes.createNode(this, config);
      this.config = config;
      const removeCallback = registerTrigger(this);
      this.on('close', removeCallback);
    }

    async onMessageIn(inboundMessage) {
      this.send(inboundMessage);
    }
  }

  RED.httpNode.post('/apps', async (req, res) => {
    const { projectId, keyId, keySecret, region } = req.body;
    if (!projectId || !keyId || !keySecret || !region) return res.sendStatus(400);
    const token = await getToken(keyId, keySecret);
    if (!token) return res.sendStatus(401);
    const { apps, error } = await listApps({projectId, token, region});
    if (error) {
        console.log('failed to fetch apps: ', error);
        return res.sendStatus(500);
    }
    return res.send({ apps });
  });

  RED.httpNode.post('/token', async (req, res) => {
    const { keyId, keySecret } = req.body;
    if (!keyId || !keySecret) return res.sendStatus(400);
    const token = await getToken(keyId, keySecret);
    return token ? res.send(token) : res.sendStatus(401);
  });

  RED.nodes.registerType('sinch-received-message', ReceivedMessage);
};
