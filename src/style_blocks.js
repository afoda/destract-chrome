chrome.runtime.onMessage.addListener(function(request) {
  if (request.action == "set_styleblock_state") {
    var blockId = getRuleIdentifier(request.ruleSetId, request.ruleId);

    if (request.state) {
      if (document.getElementById(blockId) == null)
        addStyleBlock(blockId, request.rule);
    }
    else {
      removeStyleBlock(blockId);
    }
  }
});

function addStyleBlock(blockId, rule) {
  var styleBlock = document.createElement('style');
  styleBlock.id = blockId;

  var cssRules = {
    remove: "display: none;",
    hide: "visibility: hidden;"
  };
  var css = rule.selector + " { " + cssRules[rule.action] + " }\n";
  styleBlock.appendChild(document.createTextNode(css));

  document.documentElement.appendChild(styleBlock);
}

function removeStyleBlock(blockId) {
  var styleBlock = document.getElementById(blockId);

  if (styleBlock != null) {
    styleBlock.parentNode.removeChild(styleBlock);
  }
}
