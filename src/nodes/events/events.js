module.exports = function(RED) {
  class Events {
    constructor(config) {
      this.config = config;
      RED.nodes.createNode(this, config);
    }
    onEventIn(event) {
      const events = this.config.events.split(',');
      const keys = Object.keys(event);
      keys.forEach((key) => {
        if (events.includes(key)) {
            this.send(event);
        }
      });
    }
  }

  RED.nodes.registerType("sinch-events", Events);
};
