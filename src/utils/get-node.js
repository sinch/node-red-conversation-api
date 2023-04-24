module.exports = (RED) => {
    const searchSubflow = (subflows, path) => {
      let result;
      Object.keys(subflows).forEach((key) => {
        if (subflows[key].path === path) {
          result = subflows[key];
        }
      });
      return result;
    };
  
    const searchByAlias = (nodes, id) => {
      let result;
      Object.keys(nodes).forEach((key) => {
        if (nodes[key]._alias === id) {
          result = nodes[key];
        }
      });
      return result;
    };
  
    const findNodeByPath = (nodePath, scope = null, idx = 0) => {
      if (typeof nodePath !== 'string') {
        return undefined;
      }
      const ids = nodePath.split('/');
  
      // in case there is a path (multiple ids separated by /)
      if (idx < ids.length - 1) {
        if (idx === 0) {
          // first level is always a tab, it's just a container, skip to the next index
          return findNodeByPath(nodePath, null, 1);
        } else {
          const tryNode = RED.nodes.getNode(ids[idx]);
          if (tryNode != null) {
            // first try to get the node instance with the usual method, if the node / subflow sits on
            // a tab, then the flow id is the same as the instance node id, set the current scope as the
            // found node and move the index
            return findNodeByPath(nodePath, tryNode, idx + 1);
          } else if (
            scope._flow != null &&
            searchSubflow(
              scope._flow.subflowInstanceNodes,
              ids.slice(0, idx + 1).join('/')
            )
          ) {
            // if the scope is a subflow or a subflow inside a subflow, then search
            // inside the subflow instances for the portion of the path determined by idx
            // if found then set the current scope to the found node / subflows and move the index
            return findNodeByPath(
              nodePath,
              searchSubflow(
                scope._flow.subflowInstanceNodes,
                ids.slice(0, idx + 1).join('/')
              ),
              idx + 1
            );
          } else if (
            scope.subflowInstanceNodes != null &&
            searchSubflow(
              scope.subflowInstanceNodes,
              ids.slice(0, idx + 1).join('/')
            )
          ) {
            return findNodeByPath(
              nodePath,
              searchSubflow(
                scope.subflowInstanceNodes,
                ids.slice(0, idx + 1).join('/')
              ),
              idx + 1
            );
          }
          // if end up here, then not found
          return undefined;
        }
      } else {
        if (RED.nodes.getNode(ids[idx])) {
          return RED.nodes.getNode(ids[idx]);
        } else if (scope && scope.activeNodes) {
          return searchByAlias(scope.activeNodes, ids[idx]);
        } else if (scope && scope._flow != null) {
          return searchByAlias(scope._flow.activeNodes, ids[idx]);
        }
        return undefined;
      }
    };
  
    return findNodeByPath;
  };
  