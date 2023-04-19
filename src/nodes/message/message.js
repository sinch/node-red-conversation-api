module.exports = function(RED) {
  class Message {
    constructor(config) {
      this.config = config;
      RED.nodes.createNode(this, config);

      this.on('input', (msg) => {
        const message = msg.message || this.config.message;
        const newMessage = { ...msg, message };
        this.send(newMessage);
      })
    }
  }

  RED.nodes.registerType("sinch-message", Message);
};
