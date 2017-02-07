window.diff_match_patch = require('googlediff'); ///javascript/diff_match_patch_uncompressed');

require('clunderscore/clunderscore');
require('prismjs/components/prism-core');
require('../../node_modules/cledit/scripts/cleditCore.js');
require('../../node_modules/cledit/scripts/cleditHighlighter.js');
require('../../node_modules/cledit/scripts/cleditKeystroke.js');
require('../../node_modules/cledit/scripts/cleditMarker.js');
require('../../node_modules/cledit/scripts/cleditSelectionMgr.js');
require('../../node_modules/cledit/scripts/cleditUndoMgr.js');
require('../../node_modules/cledit/scripts/cleditUtils.js');
require('../../node_modules/cledit/scripts/cleditWatcher.js');

var Pagedown = require('./cledit/pagedown.js');
var buttonBar = require('./cledit/buttonBar.js');
var mdGrammar = require('./cledit/mdGrammar.js');

module.exports = {
    md: function(elt){
        var editor = window.cledit(elt);
	    
        var prismGrammar = mdGrammar({
	    fences: true,
	    tables: true,
	    footnotes: true,
	    abbrs: true,
	    deflists: true,
	    tocs: true,
	    dels: true,
	    subs: true,
	    sups: true
        })
	    
            editor.init({
		sectionHighlighter: function (section) {
                    return window.Prism.highlight(section.text, prismGrammar)
		},
		
		// Optional (increases performance on large documents)
		sectionParser: function (text) {
                    var offset = 0
                    var sectionList = []
                    ;(text + '\n\n').replace(/^.+[ \t]*\n=+[ \t]*\n+|^.+[ \t]*\n-+[ \t]*\n+|^\#{1,6}[ \t]*.+?[ \t]*\#*\n+/gm, function (match, matchOffset) {
			sectionList.push(text.substring(offset, matchOffset))
			offset = matchOffset
                    })
                    sectionList.push(text.substring(offset))
                    return sectionList
		}
            })


	    var pd = new Pagedown({input: editor});
	    pd.run();
	    
	    var buttons = new buttonBar({ cledit: editor, pagedownEditor: pd });

	    return {
		cledit: editor,
		pagedownEditor: pd,
		buttons: buttons
	    }
    }
}
	
