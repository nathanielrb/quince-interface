module.exports = {
    template: require('./template.html'),
    data: function() {
        return {
            content: null,
            editorElt: null,
	    file: null,
	    filename: null,
	    buttons: null
        };
    },
    props: ['fileUrl', 'token', 'repo', 'username', 'editor'],
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
        },
	deleteFile: function(callback){
	    var uri =  'https://api.github.com/repos/'
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
		    vm.$emit('msg', response.data.message);
		    vm.$parent.$emit('remove-file', vm.file)
			
		    if(callback)
			callback();
		},
		      function(response){
			  vm.$emit('error', response.data.message, response.data);
			  
		      });
	},
        save: function(){
	    var callback = null;
	    console.log(this.editorSvc);
            this.content = this.editorSvc.cledit.getContent();

	    var newpath = this.filename != this.file.name
		? this.file.path.substr(0,this.file.path.lastIndexOf('/'))
		+ '/' + this.filename
		: null;

	    var uri =  'https://api.github.com/repos/'
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

	    this.$emit('loading');
	    var vm = this;
	    this.$http.put(uri,params)
		.then(
		    function(response){
			vm.$emit('loaded');
			vm.$emit('msg', "Saved.");
			vm.file.sha = response.data.content.sha;

			if(newpath)
			    vm.deleteFile(
				function(){
				    vm.file = response.data.content;
				    vm.$parent.$emit('add-file', vm.file);
				    vm.$emit('change', vm.file.url);
				});
		    },
		    function(response){
			vm.$emit('loaded');
			vm.$emit('error', response.data.message, response.data);
		    });
	},
	initEditor: function(){
            this.editorElt = document.querySelector('#editor-content');

	    this.$nextTick(function(){
                this.editorSvc = this.editor(this.editorElt);
	    });
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
