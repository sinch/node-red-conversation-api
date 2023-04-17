const getNodesByType = (type, RED) => {
  const nodes = [];
  const types = Array.isArray(type) ? type : [type];
  RED.nodes.eachNode((node) => {
    if (types.includes(node.type)) {
      nodes.push(node);
    }
  });
  return nodes;
};

const toCamel = (s) => {
  return s.replace(/([-_][a-z])/gi, ($1) => {
    return $1
      .toUpperCase()
      .replace('-', '')
      .replace('_', '');
  });
};

const isArray = function(a) {
  return Array.isArray(a);
};

const isObject = function(o) {
  return o === Object(o) && !isArray(o) && typeof o !== 'function';
};

const keysToCamel = (o) => {
  if (isObject(o)) {
    const n = {};

    Object.keys(o).forEach((k) => {
      n[toCamel(k)] = keysToCamel(o[k]);
    });

    return n;
  } else if (isArray(o)) {
    return o.map((i) => {
      return keysToCamel(i);
    });
  }

  return o;
};

const getConvAPIURL = (projectId, region = 'eu') => {
    return `https://${region}.conversation.api.sinch.com/v1/projects/${projectId}`
};

const tryToParseJSON = (data) => {
  try {
    return JSON.parse(data);
  } catch (e) {
    return data;
  }
};

module.exports = {
  getNodesByType,
  keysToCamel,
  getConvAPIURL,
  tryToParseJSON,
};
