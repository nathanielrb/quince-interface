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
                    this.editor = this.initMdEditor();
                    break;
                case "html":
                    console.log("loading html editor");
                    break;
                default:
                    console.log("loading text editor");
            }
        },
        initMdEditor: function(){
            var editor = window.cledit(document.querySelector('.content'));
            
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
