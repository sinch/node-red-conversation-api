const helper = require("node-red-node-test-helper");
const SendNode = require("../src/nodes/send/send.js");
const ConvApiNode = require("../src/configuration-nodes/conversation-api/conversation-api.js");

helper.init(require.resolve("node-red"));

describe("Send Node", () => {
  const testCredentials = {
    convapi: {
      keySecret: "somesecret",
    },
  };

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
        type: "sinch-send",
        name: "Send",
        receive: true,
      },
    ];
    helper.load(SendNode, flow, () => {
      const n1 = helper.getNode("n1");
      try {
        n1.should.have.property("name", "Send");
        n1.config.should.have.property("receive", true);
        done();
      } catch (err) {
        done(err);
      }
    });
  });

  it("should log an error message if Conversation API configuration doesn't exist", (done) => {
    const flow = [
      {
        id: "n1",
        type: "sinch-send",
        name: "Send",
        receive: true,
      },
    ];
    helper.load(SendNode, flow, () => {
      const n1 = helper.getNode("n1");
      n1.receive();
      try {
        helper.log().called.should.be.true();
        const logEvents = helper.log().args.filter((evt) => {
          return evt[0].type == "sinch-send";
        });
        logEvents.should.have.length(1);
        const msg = logEvents[0][0];
        msg.should.have.property("level", helper.log().ERROR);
        msg.should.have.property(
          "msg",
          "Select or configure a Conversation API configuration"
        );
        done();
      } catch (err) {
        done(err);
      }
    });
  });

  it("should log an error message if Project ID isn't configured ", (done) => {
    const flow = [
      {
        id: "n1",
        type: "sinch-send",
        name: "Send",
        receive: true,
        convapiConfiguration: "convapi",
      },
      {
        id: "convapi",
        type: "sinch-convapi-configuration",
        keyId: "keyId",
        appId: "appId",
        appDisplayName: "Carls",
        region: "eu",
      },
    ];

    helper.load([SendNode, ConvApiNode], flow, testCredentials, () => {
      const n1 = helper.getNode("n1");
      n1.receive();
      try {
        helper.log().called.should.be.true();
        const logEvents = helper.log().args.filter((evt) => {
          return evt[0].type == "sinch-send";
        });
        logEvents.should.have.length(1);
        const msg = logEvents[0][0];
        msg.should.have.property("level", helper.log().ERROR);
        msg.should.have.property(
          "msg",
          "Incomplete Conversation API configuration"
        );
        done();
      } catch (err) {
        done(err);
      }
    });
  });

  it("should log an error message if App ID isn't configured ", (done) => {
    const flow = [
      {
        id: "n1",
        type: "sinch-send",
        name: "Send",
        receive: true,
        convapiConfiguration: "convapi",
      },
      {
        id: "convapi",
        type: "sinch-convapi-configuration",
        projectId: "projectId",
        keyId: "keyId",
        appDisplayName: "Carls",
        region: "eu",
      },
    ];

    helper.load([SendNode, ConvApiNode], flow, testCredentials, () => {
      const n1 = helper.getNode("n1");
      n1.receive();
      try {
        helper.log().called.should.be.true();
        const logEvents = helper.log().args.filter((evt) => {
          return evt[0].type == "sinch-send";
        });
        logEvents.should.have.length(1);
        const msg = logEvents[0][0];
        msg.should.have.property("level", helper.log().ERROR);
        msg.should.have.property(
          "msg",
          "Incomplete Conversation API configuration"
        );
        done();
      } catch (err) {
        done(err);
      }
    });
  });

  it("should log an error message if Region isn't configured ", (done) => {
    const flow = [
      {
        id: "n1",
        type: "sinch-send",
        name: "Send",
        receive: true,
        convapiConfiguration: "convapi",
      },
      {
        id: "convapi",
        type: "sinch-convapi-configuration",
        projectId: "projectId",
        keyId: "keyId",
        appId: "appId",
        appDisplayName: "Carls",
      },
    ];

    helper.load([SendNode, ConvApiNode], flow, testCredentials, () => {
      const n1 = helper.getNode("n1");
      n1.receive();
      try {
        helper.log().called.should.be.true();
        const logEvents = helper.log().args.filter((evt) => {
          return evt[0].type == "sinch-send";
        });
        logEvents.should.have.length(1);
        const msg = logEvents[0][0];
        msg.should.have.property("level", helper.log().ERROR);
        msg.should.have.property(
          "msg",
          "Incomplete Conversation API configuration"
        );
        done();
      } catch (err) {
        done(err);
      }
    });
  });

  it("should log an error message if Key ID isn't configured ", (done) => {
    const flow = [
      {
        id: "n1",
        type: "sinch-send",
        name: "Send",
        receive: true,
        convapiConfiguration: "convapi",
      },
      {
        id: "convapi",
        type: "sinch-convapi-configuration",
        projectId: "projectId",
        appId: "appId",
        appDisplayName: "Carls",
        region: "eu",
      },
    ];

    helper.load([SendNode, ConvApiNode], flow, testCredentials, () => {
      const n1 = helper.getNode("n1");
      n1.receive();
      try {
        helper.log().called.should.be.true();
        const logEvents = helper.log().args.filter((evt) => {
          return evt[0].type == "sinch-send";
        });
        logEvents.should.have.length(1);
        const msg = logEvents[0][0];
        msg.should.have.property("level", helper.log().ERROR);
        msg.should.have.property(
          "msg",
          "Incomplete Conversation API configuration"
        );
        done();
      } catch (err) {
        done(err);
      }
    });
  });

  it("should log an error message if Key Secret isn't configured ", (done) => {
    const flow = [
      {
        id: "n1",
        type: "sinch-send",
        name: "Send",
        receive: true,
        convapiConfiguration: "convapi",
      },
      {
        id: "convapi",
        type: "sinch-convapi-configuration",
        projectId: "project1",
        keyId: "keyId",
        appId: "appId",
        appDisplayName: "Carls",
        region: "eu",
      },
    ];
    helper.load([SendNode, ConvApiNode], flow, () => {
      const n1 = helper.getNode("n1");
      n1.receive();
      try {
        helper.log().called.should.be.true();
        const logEvents = helper.log().args.filter((evt) => {
          return evt[0].type == "sinch-send";
        });
        logEvents.should.have.length(1);
        const msg = logEvents[0][0];
        msg.should.have.property("level", helper.log().ERROR);
        msg.should.have.property(
          "msg",
          "Missing KeySecret in Conversation API configuration"
        );
        done();
      } catch (err) {
        done(err);
      }
    });
  });

  it("should log an error message if Message or Template ID isn't passed to node ", (done) => {
    const flow = [
      {
        id: "n1",
        type: "sinch-send",
        name: "Send",
        receive: true,
        convapiConfiguration: "convapi",
      },
      {
        id: "convapi",
        type: "sinch-convapi-configuration",
        projectId: "projectId",
        keyId: "keyId",
        appId: "appId",
        appDisplayName: "Carls",
        region: "eu",
      },
    ];

    helper.load([SendNode, ConvApiNode], flow, testCredentials, () => {
      const n1 = helper.getNode("n1");
      n1.receive();
      try {
        helper.log().called.should.be.true();
        const logEvents = helper.log().args.filter((evt) => {
          return evt[0].type == "sinch-send";
        });
        logEvents.should.have.length(1);
        const msg = logEvents[0][0];
        msg.should.have.property("level", helper.log().ERROR);
        msg.should.have.property(
          "msg",
          "No message nor template provided on input"
        );
        done();
      } catch (err) {
        done(err);
      }
    });
  });

  it("should log an error message if a Contact isn't passed to node ", (done) => {
    const flow = [
      {
        id: "n1",
        type: "sinch-send",
        name: "Send",
        receive: true,
        convapiConfiguration: "convapi",
      },
      {
        id: "convapi",
        type: "sinch-convapi-configuration",
        projectId: "projectId",
        keyId: "keyId",
        appId: "appId",
        appDisplayName: "Carls",
        region: "eu",
      },
    ];

    helper.load([SendNode, ConvApiNode], flow, testCredentials, () => {
      const n1 = helper.getNode("n1");
      n1.receive({ message: "Some message", templateId: "templateId" });
      try {
        helper.log().called.should.be.true();
        const logEvents = helper.log().args.filter((evt) => {
          return evt[0].type == "sinch-send";
        });
        logEvents.should.have.length(1);
        const msg = logEvents[0][0];
        msg.should.have.property("level", helper.log().ERROR);
        msg.should.have.property("msg", "No contact provided on input");
        done();
      } catch (err) {
        done(err);
      }
    });
  });
});
