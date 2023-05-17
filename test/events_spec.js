const helper = require("node-red-node-test-helper");
const EventsNode = require("../src/nodes/events/events.js");

helper.init(require.resolve("node-red"));

describe("Events Node", () => {
  beforeEach((done) => {
    helper.startServer(done);
  });

  afterEach((done) => {
    helper.unload();
    helper.stopServer(done);
  });

  it("should be loaded", (done) => {
    const flow = [
      {
        id: "n1",
        type: "sinch-events",
        name: "Events",
        events:
          "message,messageDeliveryReport,capabilityNotification,contactCreateNotification,contactDeleteNotification,duplicatedContactIdentitiesNotification,contactMergeNotification,contactUpdateNotification,contactUpdateNotification,conversationStartNotification,conversationStopNotification,eventDeliveryReport,event,messageSubmitNotification,optInNotification,optOutNotification,smartConversationNotification,unsupportedCallback",
      },
    ];
    helper.load(EventsNode, flow, () => {
      const n1 = helper.getNode("n1");
      try {
        n1.should.have.property("name", "Events");
        n1.config.should.have.property(
          "events",
          "message,messageDeliveryReport,capabilityNotification,contactCreateNotification,contactDeleteNotification,duplicatedContactIdentitiesNotification,contactMergeNotification,contactUpdateNotification,contactUpdateNotification,conversationStartNotification,conversationStopNotification,eventDeliveryReport,event,messageSubmitNotification,optInNotification,optOutNotification,smartConversationNotification,unsupportedCallback"
        );
        done();
      } catch (err) {
        done(err);
      }
    });
  });
});
