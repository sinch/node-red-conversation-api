const { interpolateMessage, tryToParseJSON } = require('../../utils/helpers');

module.exports = function(RED) {
  class Message {
    constructor(config) {
      this.config = config;
      RED.nodes.createNode(this, config);

      this.on('input', (msg) => {
        let message = msg.message || this.config.message;
        if (!message) {
          this.error("No message configured nor provided to the node input");
        }
        if (msg && msg.variables) {
          message = interpolateMessage(message, tryToParseJSON(msg.variables));
        }
        const newMessage = { ...msg, message };
        this.send(newMessage);
      });
    }
  }

  RED.nodes.registerType("sinch-message", Message);
};
