var ruleRegistry = {};

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action == "register_rules") {
    var tabId = sender.tab.id;
    if (!(tabId in ruleRegistry))
      ruleRegistry[tabId] = {};
    ruleRegistry[tabId][request.ruleSetId] = request.ruleSet;
  }

  else if (request.action == "get_registered_rules") {
    var registeredRules = ruleRegistry[request.tabId];
    sendResponse(registeredRules);
  }
});
