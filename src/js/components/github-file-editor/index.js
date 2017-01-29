module.exports = {
    template: require('./template.html'),
    data: function() {
        return {
            content: null,
            editor: null
        };
    },
    props: ['path'],
    computed: {
        ext: function(){
         var re = /(?:\.([^.]+))?$/;
         return re.exec(file.path)[1];   
        }
    },
    methods: {
        getFile: function(){
            vm = this;
            console.log("getting file from github");
            this.$http.get(this.path,
                function(data) {
                    this.content = data;
                    this.initEditor();
                }
            );
        },
        close: function(){
            this.path = null;
        },
        save: function(){},
        initEditor: function(){
            switch (ext){
                case "md":
                    console.log("loading md editor");
                    break;
            }
        }
    },
    watch: {
        path: function(){
            if(this.path)
                this.getFile();
            else
                this.content = null;
        }
    }
 };  
