module.exports = function(RED) {
  function ConversationApiConfiguration(config) {
    RED.nodes.createNode(this, config);
    this.config = config;
  }
  RED.nodes.registerType(
    "sinch-convapi-configuration",
    ConversationApiConfiguration,
    {
      credentials: {
        keySecret: {
          type: "text",
        },
      },
    }
  );
};
