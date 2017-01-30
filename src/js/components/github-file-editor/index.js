module.exports = {
    template: require('./template.html'),
    data: function() {
        return {
            content: null,
            editor: null,
            editorElt: null,
	    msg: null,
	    errorMsg: null
        };
    },
    props: ['file', 'token', 'repo', 'username'],
    computed: {
        ext: function(){
         var re = /(?:\.([^.]+))?$/;
         return re.exec(this.file.path)[1];   
        }
    },
    methods: {
        getFile: function(){
            vm = this;
            console.log("getting file from github");
            this.$http.get(this.file.url,
                function(data) {
                    this.content = data;
                    this.initEditor();
                },
                { headers: {'Accept': 'application/vnd.github.v3.raw'}});
        },
        close: function(){
            console.log("closing editor");
            this.file = null;
        },
        save: function(){
            this.content = this.editor.getContent();
	    
	    var uri =  'https://api.github.com/repos/'
		+ this.username + '/'
		+ this.repo + '/contents/'
		+ this.file.path + '?access_token=' + this.token;

	    console.log("Saving file to github...: " + uri);

	    var vm = this;
	 
	    this.$http.put(uri,
			   {
			       "message": "Edited in cm*edit.",
			       "path": vm.file.path,
			       "content": btoa(unescape(encodeURIComponent(vm.content))),
			       "sha": vm.file.sha
			   })
		.then(function(response){
		    vm.msg = response;
		    console.log(response);
		},
		      function(response){
			  vm.errorMsg = response.data.message;
			  console.log(response);
		      });
	},
	initEditor: function(){
            this.editorElt = document.querySelector('#editor-content'); 
            switch (this.ext){
            case "md":
		console.log("loading md editor");
		
            this.$nextTick(function(){
                this.editor = this.initMdEditor();
            });
            break;
        case "html":
        case "yaml":
        case "yml":
            console.log("loading html editor");
            break;
        default:
            console.log("loading text editor");
        }
    },
    initMdEditor: function(){
        var editor = window.cledit(this.editorElt);
        
        var prismGrammar = window.mdGrammar({
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
        return editor;        
    }
},
watch: {
        file: function(){
            console.log("get file");
            if(this.file)
                this.getFile();
            else
                this.content = null;
        }
    }
 };  
