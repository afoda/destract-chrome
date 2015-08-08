function messageAllTabs(message) {
  chrome.tabs.query({}, function(tabs) {
      for (var i = 0; i < tabs.length; i++) {
          chrome.tabs.sendMessage(tabs[i].id, message);
      }
  });
}

function createRuleToggle(ruleSetId, ruleId, rule, initialState) {
  var checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = initialState;

  checkbox.addEventListener('change', function() {
    var state = !checkbox.checked;

    var message = {
      action: "set_styleblock_state",
      ruleSetId: ruleSetId,
      ruleId: ruleId,
      rule: rule,
      state: state
    };
    messageAllTabs(message);

    var setter = {};
    var ruleIdentifier = getRuleIdentifier(ruleSetId, ruleId);
    setter[ruleIdentifier] = state;
    chrome.storage.sync.set(setter);
  });

  return checkbox;
}

function createCheckboxAdder(ruleSetId, ruleId, rule, ruleRow) {
  return function (result) {
    var checkboxCell = ruleRow.insertCell();
    checkboxCell.classList.add("checkbox-column");

    var ruleIdentifier = getRuleIdentifier(ruleSetId, ruleId);
    var state = rule.default != "disabled";
    if (ruleIdentifier in result)
      state = result[ruleIdentifier];

    var checkbox = createRuleToggle(ruleSetId, ruleId, rule, state);
    checkboxCell.appendChild(checkbox);

    var ruleNameCell = ruleRow.insertCell();
    ruleNameCell.classList.add("rulename-column");
    var ruleNameText = document.createTextNode(rule.description);
    ruleNameCell.appendChild(ruleNameText);

    checkbox.checked = !state;
  }
};

document.addEventListener('DOMContentLoaded', function () {

  chrome.tabs.query({'active': true, 'currentWindow': true}, function(tabArray) {
    var activeTabId = tabArray[0].id;

    chrome.runtime.sendMessage({action: "get_registered_rules", tabId: activeTabId}, function(ruleSets) {
      var ruleTable = document.getElementById("rule-table");
      var ruleTableBody = ruleTable.getElementsByTagName("tbody")[0];

      for (var ruleSetId in ruleSets) {
        ruleSet = ruleSets[ruleSetId];

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
