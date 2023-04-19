const got = require("got");
const { getConvAPIURL } = require("../utils/helpers");

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

module.exports = { listApps };
