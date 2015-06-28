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
          {expand: true, dest: 'dist/', cwd: 'src/', src: 'popup.html'},
          {expand: true, dest: 'dist/', cwd: 'src/', src: 'style_blocks.js'}
        ]
      }
    }
  });


  grunt.registerTask('build-content-scripts', 'Create content scripts from rule files', function() {

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

    var contentScriptTemplate = grunt.file.read('src/templates/content_script.js');
    var contentScriptConfigs = [];

    grunt.file.recurse('rules/', function (abspath, rootdir, subdir, filename) {
      var config = grunt.file.readYAML(abspath);

      var ruleSet = {};
      for (var i = 0; i < config.rules.length; i++) {
        var rule = config.rules[i];
        var ruleId = generateRuleId(rule.description);
        if (ruleId in ruleSet)
          throw grunt.util.error("Duplicate rule ids: '" + ruleId + "' (" + abspath + ")");
        ruleSet[ruleId] = rule;
      }

      var templateData = {
        ruleSetId: generateRuleSetId(subdir, filename),
        ruleSet: JSON.stringify(ruleSet, null, 2)
      }

      var contentScript = grunt.template.process(contentScriptTemplate, {data: templateData});
      var contentScriptPath =
        "content_scripts/"
        + (subdir ? subdir + "/" : "")
        + filename.replace(/\.[^/.]+$/, ".js");

      contentScriptConfigs.push({
        matches: config.matches,
        run_at: 'document_start',
        js: ['style_blocks.js', contentScriptPath]
      });

      grunt.file.write('dist/' + contentScriptPath, contentScript);
    });

    grunt.file.write('temp/manifest_contentscripts.json', JSON.stringify(contentScriptConfigs));
  });

  grunt.registerTask('build-manifest', 'Create manifest.json with content scripts', function () {
    var manifest = grunt.file.readJSON('src/manifest.json');

    var contentScripts = grunt.file.readJSON('temp/manifest_contentscripts.json');
    manifest.content_scripts = contentScripts;

    var manifestJson = JSON.stringify(manifest, null, 2);
    grunt.file.write('dist/manifest.json', manifestJson);
  });


  grunt.registerTask('build', [
    'clean:dist',
    'build-content-scripts',
    'build-manifest',
    'copy:dist',
    'clean:temp'
  ]);

  grunt.registerTask('default', [
    'build'
  ]);

};
