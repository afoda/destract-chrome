function messageAllTabs(message) {
  chrome.tabs.query({}, function(tabs) {
      for (var i = 0; i < tabs.length; i++) {
          chrome.tabs.sendMessage(tabs[i].id, message);
      }
  });
}

function createCheckboxAdder(tracedRule, ruleRow) {
  var ruleIdentifier = getRuleIdentifier(tracedRule.ruleSetId, tracedRule.ruleId);

  var checkbox = document.createElement("input");
  checkbox.type = "checkbox";

  checkbox.addEventListener('change', function() {
    var setter = {};
    setter[ruleIdentifier] = !checkbox.checked;

    chrome.storage.sync.set(setter, function () {
      var message = {
        action: "refresh_styleblock_states"
      };
      messageAllTabs(message);
    });
  });

  return function (result) {
    var checkboxCell = ruleRow.insertCell();
    checkboxCell.classList.add("checkbox-column");
    checkboxCell.appendChild(checkbox);

    var state = tracedRule.rule.default != "disabled";
    if (ruleIdentifier in result)
      state = result[ruleIdentifier];
    checkbox.checked = !state;

    var ruleNameCell = ruleRow.insertCell();
    ruleNameCell.classList.add("rulename-column");
    var ruleNameText = tracedRule.rule.description + " (" + tracedRule.rule.elementCount + ")";
    var ruleNameTextNode = document.createTextNode(ruleNameText);
    ruleNameCell.appendChild(ruleNameTextNode);
  }
};

document.addEventListener('DOMContentLoaded', function () {

  chrome.tabs.query({'active': true, 'currentWindow': true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {action: "get_rule_usage"}, function(ruleUsage) {

      var tracedRules = [];
      for (var ruleSetId in ruleUsage) {
        ruleSet = ruleUsage[ruleSetId];
        for (var ruleId in ruleSet) {
          tracedRules.push({
            ruleSetId : ruleSetId,
            ruleId    : ruleId,
            rule      : ruleSet[ruleId]
          });
        }
      }

      var usedRules   = tracedRules.filter(function(tr) { return tr.rule.elementCount  > 0; });
      var unusedRules = tracedRules.filter(function(tr) { return tr.rule.elementCount == 0; });

      var compareDescriptions = function (r1, r2) {
          if (r1.rule.description < r2.rule.description)
            return -1;
          if (r1.rule.description > r2.rule.description)
            return 1;
          return 0;
      }
      usedRules.sort(compareDescriptions);
      unusedRules.sort(compareDescriptions);

      var orderedRules = usedRules.concat(unusedRules);

      if (orderedRules.length > 0) {
        document.getElementById("no-rules-placeholder").style.display = "none";
        document.getElementById("rule-table").style.display = "block";

        var ruleTableBody = document.querySelector("#rule-table tbody");

        for (var i = 0; i < orderedRules.length; i++) {
          var tracedRule = orderedRules[i];
          var ruleIdentifier = getRuleIdentifier(tracedRule.ruleSetId, tracedRule.ruleId);

          var ruleRow = ruleTableBody.insertRow(-1);
          if (tracedRule.rule.elementCount == 0)
              ruleRow.classList.add("unused-rule");

          var checkboxAdder = createCheckboxAdder(tracedRule, ruleRow);
          chrome.storage.sync.get(ruleIdentifier, checkboxAdder);
        }
      }
    });
  });
});
