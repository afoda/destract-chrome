var defaultAction = "remove"


// Basic add/remove for styleblocks

function addStyleBlock(blockId, rule) {
  var styleBlock = document.createElement('style');
  styleBlock.id = blockId;

  var cssRules = {
    remove: "display: none;",
    hide: "visibility: hidden;"
  };
  var action = rule.action ? rule.action : defaultAction
  var css = rule.selector + " { " + cssRules[action] + " }\n";
  styleBlock.appendChild(document.createTextNode(css));

  document.documentElement.appendChild(styleBlock);
}

function removeStyleBlock(blockId) {
  var styleBlock = document.getElementById(blockId);

  if (styleBlock != null) {
    styleBlock.parentNode.removeChild(styleBlock);
  }
}


// Initial styleblock setup

var ruleSets = matchingRuleSets(window.location.hostname);

for (var ruleSetId in ruleSets) {
  var ruleSet = ruleSets[ruleSetId];
  for (ruleId in ruleSet) {
    var rule = ruleSet[ruleId];
    var blockId = getRuleIdentifier(ruleSetId, ruleId);
    // Enable all style blocks initially to prevent content flashes.
    addStyleBlock(blockId, rule);
  }
}


// Update style blocks to user preferences

function refreshStyleBlockStates() {

  function createStyleBlockUpdater(rule, blockId) {
    return function(result) {
      var state = rule.default != "disabled";
      if (blockId in result)
        state = result[blockId];

      if (state) {
        if (document.getElementById(blockId) == null)
          addStyleBlock(blockId, rule);
      }
      else {
        removeStyleBlock(blockId);
      }
    };
  }

  for (var ruleSetId in ruleSets) {
    var ruleSet = ruleSets[ruleSetId];

    for (ruleId in ruleSet) {
      var rule = ruleSet[ruleId];
      var blockId = getRuleIdentifier(ruleSetId, ruleId);

      var updater = createStyleBlockUpdater(rule, blockId);
      chrome.storage.sync.get(blockId, updater);
    }
  }
}

chrome.runtime.onMessage.addListener(function(request) {
  if (request.action == "refresh_styleblock_states") {
    refreshStyleBlockStates();
  }
});

refreshStyleBlockStates();
