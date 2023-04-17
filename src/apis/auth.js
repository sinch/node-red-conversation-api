const got = require("got");
const { HYDRA_TOKEN_URL } = require("../constants");

const safeLimit = 10000;
let expiresOn = 0;
let lastUser, lastPass, token;

const getToken = async (username, password) => {
  if (
    lastUser !== username ||
    lastPass !== password ||
    expiresOn < Date.now()
  ) {
    const res = await got
      .post(HYDRA_TOKEN_URL, {
        username,
        password,
        form: { grant_type: "client_credentials" },
        responseType: "json",
      })
      .catch(() => {
        return null;
      });

    if (!res) return null;
    const { body } = res;
    expiresOn = Date.now() + body.expires_in * 1000 - safeLimit;
    token = body.access_token;
    lastUser = username;
    lastPass = password;
  }
  return token;
};

module.exports = {
  getToken,
};
