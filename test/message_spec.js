const helper = require("node-red-node-test-helper");
const MessageNode = require("../src/nodes/message/message.js");

helper.init(require.resolve("node-red"));

describe("Message Node", () => {
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
        type: "sinch-message",
        name: "Message",
      },
    ];
    helper.load(MessageNode, flow, () => {
      const n1 = helper.getNode("n1");
      try {
        n1.should.have.property("name", "Message");
        done();
      } catch (err) {
        done(err);
      }
    });
  });

  it("should send returned message using send()", (done) => {
    const flow = [
      {
        id: "n1",
        type: "sinch-message",
        name: "Message",
        wires: [["n2"]],
      },
      { id: "n2", type: "helper" },
    ];
    helper.load(MessageNode, flow, () => {
      const n1 = helper.getNode("n1");
      const n2 = helper.getNode("n2");
      n2.on("input", (msg) => {
        try {
          msg.should.have.property(
            "message",
            '{"text_message":{"text":"This is a text message."}}'
          );
          done();
        } catch (err) {
          done(err);
        }
      });
      n1.receive({
        message: '{"text_message":{"text":"This is a text message."}}',
      });
    });
  });

  it("should interpolate variables from msg and return message using send()", (done) => {
    const flow = [
      {
        id: "n1",
        type: "sinch-message",
        name: "Message",
        message: '{"text_message":{"text":"Hello {{name}}."}}',
        wires: [["n2"]],
      },
      { id: "n2", type: "helper" },
    ];
    helper.load(MessageNode, flow, () => {
      const n1 = helper.getNode("n1");
      const n2 = helper.getNode("n2");
      n2.on("input", (msg) => {
        try {
          msg.should.have.property(
            "message",
            '{"text_message":{"text":"Hello Calle."}}'
          );
          done();
        } catch (err) {
          done(err);
        }
      });
      n1.receive({ variables: '{ "name": "Calle" }' });
    });
  });

  it("should log an error message if a message isn't provided or configured", (done) => {
    const flow = [
      {
        id: "n1",
        type: "sinch-message",
        name: "Message",
        template: undefined,
      },
    ];
    helper.load(MessageNode, flow, () => {
      const n1 = helper.getNode("n1");
      n1.receive();
      try {
        helper.log().called.should.be.true();
        const logEvents = helper.log().args.filter((evt) => {
          return evt[0].type == "sinch-message";
        });
        logEvents.should.have.length(1);
        const msg = logEvents[0][0];
        msg.should.have.property("level", helper.log().ERROR);
        msg.should.have.property("id", "n1");
        msg.should.have.property("type", "sinch-message");
        msg.should.have.property(
          "msg",
          "No message configured nor provided to the node input"
        );
        done();
      } catch (err) {
        done(err);
      }
    });
  });
});
