module.exports = {
    template: require('./template.html'),
    data: function() {
        return {
            content: null,
            editor: null
        };
    },
    props: ['file'],
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
            console.log("saving file to github...");
        },
        initEditor: function(){
            switch (this.ext){
                case "md":
                    console.log("loading md editor");
                    break;
                case "html":
                    console.log("loading html editor");
                    break;
                default:
                    console.log("loading text editor");
            }
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
