function styleBlockId(ruleSetId, ruleId) {
   return "destract" + "-" + ruleSetId + "-" + ruleId;
}

function addStyleBlocks(ruleSetId, ruleSet) {
  for (var ruleId in ruleSet) {
    var rule = ruleSet[ruleId];

    var styleBlock = document.createElement('style');
    styleBlock.id = styleBlockId(ruleSetId, ruleId);

    var cssRules = {
      remove: "display: none;",
      hide: "visibility: hidden"
    };
    var css = rule.selector + " { " + cssRules[rule.action] + " }\n";
    styleBlock.appendChild(document.createTextNode(css));

    document.documentElement.appendChild(styleBlock);
  }
}
