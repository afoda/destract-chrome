function messageAllTabs(message) {
  chrome.tabs.query({}, function(tabs) {
      for (var i = 0; i < tabs.length; i++) {
          chrome.tabs.sendMessage(tabs[i].id, message);
      }
  });
}

function createCheckboxAdder(ruleSetId, ruleId, rule, ruleRow) {

  var checkbox = document.createElement("input");
  checkbox.type = "checkbox";

  checkbox.addEventListener('change', function() {
    var setter = {};
    var ruleIdentifier = getRuleIdentifier(ruleSetId, ruleId);
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

    var ruleIdentifier = getRuleIdentifier(ruleSetId, ruleId);
    var state = rule.default != "disabled";
    if (ruleIdentifier in result)
      state = result[ruleIdentifier];
    checkbox.checked = !state;

    var ruleNameCell = ruleRow.insertCell();
    ruleNameCell.classList.add("rulename-column");
    var ruleNameText = rule.description + " (" + rule.elementCount + ")";
    var ruleNameTextNode = document.createTextNode(ruleNameText);
    ruleNameCell.appendChild(ruleNameTextNode);
  }
};

document.addEventListener('DOMContentLoaded', function () {

  chrome.tabs.query({'active': true, 'currentWindow': true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {action: "get_rule_usage"}, function(ruleUsage) {
      var ruleTable = document.getElementById("rule-table");
      var ruleTableBody = ruleTable.getElementsByTagName("tbody")[0];

      for (var ruleSetId in ruleUsage) {
        ruleSet = ruleUsage[ruleSetId];

        for (var ruleId in ruleSet) {
          // Remove placeholder for when no rules exist and show rule table
          document.getElementById("no-rules-placeholder").style.display = "none";
          document.getElementById("rule-table").style.display = "block";

          var rule = ruleSet[ruleId];
          var ruleRow = ruleTableBody.insertRow(-1);
          var ruleIdentifier = getRuleIdentifier(ruleSetId, ruleId);

          var checkboxAdder = createCheckboxAdder(ruleSetId, ruleId, rule, ruleRow);
          chrome.storage.sync.get(ruleIdentifier, checkboxAdder);
        }
      }
    });
  });
});
