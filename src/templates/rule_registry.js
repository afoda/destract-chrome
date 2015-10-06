var ruleRegistry = <%= ruleRegistry %>;


function getRuleIdentifier(ruleSetId, ruleId) {
   return "destract" + "-" + ruleSetId + "-" + ruleId;
}

function endsWith(str, suffix) {
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function matchingRuleSets(hostname) {
  var matches = {};
  for (var ruleSetId in ruleRegistry) {
    var ruleSet = ruleRegistry[ruleSetId];

    var match = false;
    var matchHosts = ruleSet.matches;
    for (var i = 0; i < matchHosts.length; i++)
      if (endsWith(hostname, matchHosts[i]))
        match = true;

    if (match)
      matches[ruleSetId] = ruleSet.rules;
  }
  return matches;
}
