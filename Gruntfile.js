module.exports = function(grunt) {

  require('jit-grunt')(grunt);

  grunt.initConfig({
    clean: {
      dist: ['dist'],
      temp: ['temp']
    },
    copy: {
      dist: {
        files: [
          {expand: true, dest: 'dist/', cwd: 'src/popup/', src: '*'},
          {expand: true, dest: 'dist/', cwd: 'src/', src: 'manifest.json'},
          {expand: true, dest: 'dist/', cwd: 'src/', src: 'style_blocks.js'},
          {expand: true, dest: 'dist/', cwd: 'temp/', src: 'rule_registry.js'}
        ]
      }
    }
  });


  grunt.registerTask('build-rule-registry', 'Create rule registry from rule files', function() {

    function generateRuleId(description) {
      return description
             .replace(/[^ 0-9a-zA-Z_\-]/g, "")
             .replace(/\s(.)/g, function(c) { return c.toUpperCase(); })
             .replace(/\s/g, '')
             .replace(/^(.)/, function(c) { return c.toLowerCase(); });
    }

    function generateRuleSetId(subdir, filename) {
      var ruleSetId = filename.replace(/\.[^/.]+$/, "");
      if (subdir)
        ruleSetId = subdir.replace(/\//g, "-") + "-" + ruleSetId;
      return ruleSetId;
    }

    var ruleSets = {};

    grunt.file.recurse('rules/rules/', function (abspath, rootdir, subdir, filename) {
      var config = grunt.file.readYAML(abspath);

      var ruleSetId = generateRuleSetId(subdir, filename);
      var ruleSet = {
        matches: config.matches,
        rules: {}
      };
      for (var i = 0; i < config.rules.length; i++) {
        var rule = config.rules[i];
        var ruleId = generateRuleId(rule.description);
        if (ruleId in ruleSet.rules)
          throw grunt.util.error("Duplicate rule ids: '" + ruleId + "' (" + abspath + ")");
        ruleSet.rules[ruleId] = rule;
      }

      ruleSets[ruleSetId] = ruleSet;
    });

    var ruleRegistryTemplate = grunt.file.read('src/templates/rule_registry.js');
    var templateData = {ruleSets: JSON.stringify(ruleSets)};
    var ruleRegistry = grunt.template.process(ruleRegistryTemplate, {data: templateData});

    grunt.file.write('temp/rule_registry.js', ruleRegistry);
  });


  grunt.registerTask('build', [
    'clean:dist',
    'build-rule-registry',
    'copy:dist',
    'clean:temp'
  ]);

  grunt.registerTask('default', [
    'build'
  ]);

};
