const { interpolateMessage } = require('../../utils/helpers');

module.exports = function(RED) {
  class Message {
    constructor(config) {
      this.config = config;
      RED.nodes.createNode(this, config);

      this.on('input', (msg) => {
        let message = msg.message || this.config.message;
        if (msg.variables) {
          message = interpolateMessage(message, msg.variables);
        }
        const newMessage = { ...msg, message };
        this.send(newMessage);
      })
    }
  }

  RED.nodes.registerType("sinch-message", Message);
};
