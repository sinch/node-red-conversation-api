const helper = require("node-red-node-test-helper");
const StartConversationNode = require("../src/nodes/start-conversation/start-conversation.js");

helper.init(require.resolve("node-red"));

describe("Start Conversation Node", () => {
  const flow = [
    {
      id: "n1",
      type: "sinch-start-conversation",
      name: "Start Conversation",
      channelIdentities: [
        {
          channel: "TELEGRAM",
          identity: "testId",
        },
      ],
      variables: '{ "testVar": "testValue" }',
      wires: [["n2"]],
    },
    { id: "n2", type: "helper" },
  ];
  
  beforeEach((done) => {
    helper.startServer(done);
  });

  afterEach((done) => {
    helper.unload();
    helper.stopServer(done);
  });

  it("should be loaded", (done) => {
    helper.load(StartConversationNode, flow, () => {
      const n1 = helper.getNode("n1");
      try {
        n1.should.have.property("name", "Start Conversation");
        done();
      } catch (err) {
        done(err);
      }
    });
  });

  it("should send returned message using send()", (done) => {
    helper.load(StartConversationNode, flow, () => {
      const n1 = helper.getNode("n1");
      const n2 = helper.getNode("n2");
      n2.on("input", (msg) => {
        try {
          msg.contact.channelIdentities[0].should.have.property("channel", "TELEGRAM");
          msg.contact.channelIdentities[0].should.have.property("identity", "testId");
          msg.should.have.property("variables", '{ "testVar": "testValue" }');
          done();
        } catch (err) {
          done(err);
        }
      });
      n1.receive();
    });
  });
});
