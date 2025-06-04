const { sendMessage, updateConversation } = require("../../apis/conv-api");
const { getToken } = require("../../apis/auth");
const { tryToParseJSON } = require("../../utils/helpers");

module.exports = function(RED) {
  class Send {
    constructor(config) {
      this.config = config;
      RED.nodes.createNode(this, config);
      this.convApiConfig = RED.nodes.getNode(this.config.convapiConfiguration);

      this.on("input", async (msg, _, done) => {
        if (!this.convApiConfig || !this.convApiConfig.config) {
          this.error("Select or configure a Conversation API configuration");
          return;
        }

        const { config, credentials } = this.convApiConfig;
        if (!credentials) {
          this.error("Missing key secret in Conversation API configuration");
          return;
        }

        const { projectId, appId, region, keyId } = config;
        if (!projectId || !appId || !region || !keyId) {
          this.error("Incomplete Conversation API configuration");
          return;
        }

        const { keySecret } = credentials;
        if (!keySecret) {
          this.error("Missing KeySecret in Conversation API configuration");
          return;
        }

        const { message, templateId, contact, variables, template } = msg;
        if (!message && !templateId && !template) {
          this.error("No message nor template provided on input");
          return;
        }

        if (!contact) {
          this.error("No contact provided on input");
          return;
        }

        let messageToSend;
        if (template) {
          messageToSend = {
            template_message: template
          };
          delete msg.template;
        } else if (templateId) {
          messageToSend = {
            template_message: {
              omni_template: {
                template_id: templateId,
                version: "latest",
                parameters: tryToParseJSON(variables) || undefined,
              },
            },
          };
          delete msg.templateId;
        } else {
          messageToSend = message;
          delete msg.message;          
        }

        const token = await getToken(keyId, keySecret);
        if (!token) {
          this.error("Invalid KeyId - KeySecret pair");
          return;
        }

        const { receive } = this.config;

        const messageMetadata = receive || msg.messageMetadata
          ? {
              postbackNode: receive ? this._path : undefined,
              ...msg.messageMetadata
            }
          : undefined;

        const conversationMetadata = {
          variables: JSON.stringify(variables),
          nextResponse: receive ? this._path : undefined,
        };

        sendMessage({
          projectId,
          token,
          region,
          message: messageToSend,
          contact,
          appId,
          messageMetadata,
          conversationMetadata,
        })
          .then(() => {
            if (!this.config.receive) {
              this.send([msg, null]);
            } else {
              done();
            }
          })
          .catch((error) => {
            this.error(`Failed to send message: ${error}`);
            this.send([null, { ...msg, error }]);
          });
      });
    }

    async onResponse(msg) {
      const { conversationMetadata, lastResponse } = msg;
      const { conversationId } = lastResponse.message;
      const { convApiConfig } = this;

      const { credentials, config } = convApiConfig;
      const { keySecret } = credentials;
      const { projectId, region, keyId } = config;

      const token = await getToken(keyId, keySecret);
      if (!token) {
        this.error("Invalid KeyId - KeySecret pair");
        return;
      }

      if (conversationMetadata && conversationMetadata.nextResponse) {
        delete conversationMetadata.nextResponse;
      }

      if (conversationMetadata && conversationId) {
        updateConversation({
          projectId,
          token,
          region,
          conversationId,
          conversationMetadata,
        })
          .catch((error) => {
            this.error(error);
          })
          .then(() => {
            this.send([msg, null]);
          });
      }
    }
  }

  RED.nodes.registerType("sinch-send", Send);
};
