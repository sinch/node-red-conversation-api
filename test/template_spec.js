const helper = require("node-red-node-test-helper");
const TemplateNode = require("../src/nodes/template/template.js");

helper.init(require.resolve("node-red"));

describe("Template Node", () => {
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
        type: "sinch-template",
        name: "Template",
      },
    ];
    helper.load(TemplateNode, flow, () => {
      const n1 = helper.getNode("n1");
      try {
        n1.should.have.property("name", "Template");
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
        type: "sinch-template",
        name: "Template",
        template: "testTemplateId",
        wires: [["n2"]],
      },
      { id: "n2", type: "helper" },
    ];
    helper.load(TemplateNode, flow, () => {
      const n1 = helper.getNode("n1");
      const n2 = helper.getNode("n2");
      n2.on("input", (msg) => {
        try {
          msg.should.have.property("templateId", "testTemplateId");
          done();
        } catch (err) {
          done(err);
        }
      });
      n1.receive();
    });
  });

  it("should log an error message if a template isn't configured", (done) => {
    const flow = [
      {
        id: "n1",
        type: "sinch-template",
        name: "Template",
        template: undefined,
      },
    ];
    helper.load(TemplateNode, flow, () => {
      const n1 = helper.getNode("n1");
      n1.receive();
      try {
        helper.log().called.should.be.true();
        const logEvents = helper.log().args.filter((evt) => {
          return evt[0].type == "sinch-template";
        });
        logEvents.should.have.length(1);
        const msg = logEvents[0][0];
        msg.should.have.property("level", helper.log().ERROR);
        msg.should.have.property("id", "n1");
        msg.should.have.property("type", "sinch-template");
        msg.should.have.property(
          "msg",
          "No template selected in the configuration"
        );
        done();
      } catch (err) {
        done(err);
      }
    });
  });
});
