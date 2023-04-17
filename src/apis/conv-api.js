const got = require("got");
const { getConvAPIURL, tryToParseJSON } = require("../utils/helpers");

const listApps = async ({ projectId, token, region }) => {
  const { body } = await got({
    method: "GET",
    url: `${getConvAPIURL(projectId, region)}/apps`,
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
  }).catch((err) => {
    return { error: err };
  });
  const { apps } = tryToParseJSON(body);
  return { apps };
};

module.exports = { listApps };
