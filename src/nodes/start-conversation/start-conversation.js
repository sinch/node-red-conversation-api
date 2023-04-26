module.exports = function(RED) {
  class StartConversation {
    constructor(config) {
      this.config = config;
      RED.nodes.createNode(this, config);
      this.on("input", (msg) => {
        const newMessage = {
          ...msg,
          contact: {
            channelIdentities: config.channelIdentities
          },
          variables: config.variables,
        };
        this.send(newMessage);
      });
    }
  }

  RED.nodes.registerType("sinch-start-conversation", StartConversation);
};
