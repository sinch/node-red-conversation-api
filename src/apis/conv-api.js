const got = require("got");
const { getConvAPIURL, getTemplateStoreURL } = require("../utils/helpers");

const listApps = async ({ projectId, token, region }) =>
  got({
    method: "GET",
    url: `${getConvAPIURL(projectId, region)}/apps`,
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
  });

const updateConversation = async ({
  projectId,
  token,
  region,
  conversationId,
  conversationMetadata,
}) =>
  got({
    method: "PATCH",
    url: `${getConvAPIURL(projectId, region)}/conversations/${conversationId}`,
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ metadata_json: conversationMetadata }),
  });

const sendMessage = async ({
  projectId,
  token,
  region,
  message,
  contact,
  appId,
  messageMetadata,
  conversationMetadata,
}) => {
  const { channelIdentities, contactId } = contact;

  const recipient = contactId
    ? { contact_id: contactId }
    : {
        identified_by: {
          channel_identities: channelIdentities,
        },
      };

  return got({
    method: "POST",
    url: `${getConvAPIURL(projectId, region)}/messages:send`,
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      app_id: appId,
      recipient,
      conversation_metadata: conversationMetadata,
      message_metadata: JSON.stringify(messageMetadata),
      message: typeof message === "string" ? JSON.parse(message) : message,
    }),
  });
};

const listTemplates = async ({ projectId, token, region }) =>
  got({
    method: "GET",
    url: `${getTemplateStoreURL(projectId, region)}/templates`,
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
  });


module.exports = { listApps, updateConversation, sendMessage, listTemplates };
