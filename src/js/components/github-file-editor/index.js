module.exports = {
    template: require('./template.html'),
    data: function() {
        return {
            content: null,
            editor: null,
            editorElt: null,
	    msg: null,
	    errorMsg: null,
	    file: null,
	    filename: null,
        };
    },
    props: ['fileUrl', 'token', 'repo', 'username'],
    computed: {
        ext: function(){
	    if(this.file){
		var re = /(?:\.([^.]+))?$/;
		return re.exec(this.file.path)[1];
	    }
        },
	isMarkdown: function(){
	    return this.ext === "md";
	},
	isHtml: function(){
	    return this.ext === "html";
	},
	isMeta: function(){
	    return this.ext === "yml" || this.ext === "yaml";
	}
    },
    methods: {
        getFile: function(){
            vm = this;
	    this.file = null;
	    this.content = null;
	    this.msg = null;
	    this.errorMsg = null;

            console.log("getting file from github");
            this.$http.get(this.fileUrl,
			   function(data) {
			       vm.file = data;
			       vm.content = decodeURIComponent(escape(atob(data.content)));
			       this.$nextTick(function(){
				   vm.initEditor();
			       });
                }); //,
            //{ headers: {'Accept': 'application/vnd.github.v3.raw'}});
        },
        close: function(){
	    this.$emit('close');
	    this.fileUrl = null;
            this.file = null;
	    this.msg = null;
	    this.errorMsg = null;
        },
	clearMsg: function(){
	    this.msg = null;
	},
	clearErrorMsg: function(){
	    this.errorMsg = null;
	},
	deleteFile: function(callback){
	    var uri =  'https://api.github.com/repos/'
		+ this.username + '/'
		+ this.repo + '/contents/'
		+ this.file.path + '?access_token=' + this.token;
	    
	    var params = {
		"message": "Deleted from Quince.",
		"path": this.file.path,
		"sha": this.file.sha
	    }
	    
	    var vm = this;
	    vm.$http.delete(uri,params)
		.then(function(response){
		    vm.msg = response.data.message;
		    console.log(response);

		    vm.$emit('remove',vm.file)
			
		    if(callback)
			callback();
		},
		      function(response){
			  vm.errorMsg = response.data.message;
			  console.log(response);
		      });
	},
        save: function(){
	    var callback = null;
            this.content = this.editor.getContent();
	    console.log(this.content);

	    var newpath = this.filename != this.file.name
		? this.file.path.substr(0,this.file.path.lastIndexOf('/'))
		+ '/' + this.filename
		: null;

	    var uri =  'https://api.github.com/repos/'
		+ this.username + '/'
		+ this.repo + '/contents/'
		+ (newpath ? newpath : this.file.path) + '?access_token=' + this.token;

	    var params = {
		"message": "Edited from Quince.",
		"path": this.file.path,
		"content": btoa(unescape(encodeURIComponent(this.content)))
	    }

	    if(!newpath)
		params["sha"] = this.file.sha;
		
	    var callback =
		newpath
		? this.deleteFile
		: null;

	    var vm = this;
	    this.$http.put(uri,params)
		.then(
		    function(response){
			vm.msg = "Saved. Updated sha: " + response.data.content.sha;
			vm.file.sha = response.data.content.sha;
			console.log(response);

			if(newpath)
			    vm.deleteFile(
				function(){
				    vm.file = response.data.content;
				    vm.$emit('add', vm.file);
				    vm.$emit('change', vm.file.url);
				});
		    },
		    function(response){
			vm.errorMsg = response.data.message;
			console.log(response);
		    });
	},
	initEditor: function(){
            this.editorElt = document.querySelector('#editor-content');
	    console.log(this.editorElt);
	    
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
	fileUrl: function(){
            console.log("get file: " + this.fileUrl);
	    
            if(this.fileUrl){
                this.getFile();
	    }
            else
                this.content = null;
        }
    }
 };  
