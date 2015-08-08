var ruleSetId = '<%= ruleSetId %>';
var ruleSet = <%= ruleSet %>;

var message = {
  action: "register_rules",
  ruleSetId: ruleSetId,
  ruleSet: ruleSet
};
chrome.runtime.sendMessage(message);

function createStyleBlockReverter(rule, blockId) {
  return function(result) {
    var state = rule.default != "disabled";
    if (blockId in result)
      state = result[blockId];
    if (!state)
      removeStyleBlock(blockId);
  };
}

for (var ruleId in ruleSet) {
  var rule = ruleSet[ruleId];

  // Enable all style blocks initially to prevent content flashes.
  var blockId = getRuleIdentifier(ruleSetId, ruleId);
  addStyleBlock(blockId, rule);

  var styleBlockReverter = createStyleBlockReverter(rule, blockId);
  chrome.storage.sync.get(blockId, styleBlockReverter);
}
