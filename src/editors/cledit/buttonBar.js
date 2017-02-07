module.exports =
    function(clEditorSvc) {
      var btns = [{
        icon: 'fa-header',
        label: 'Heading',
        keystroke: 'Ctrl/Cmd+H',
        click: function () {
          clEditorSvc.pagedownEditor.uiManager.doClick('heading')
        }
      }, {
        icon: 'fa-bold',
        label: 'Bold',
        keystroke: 'Ctrl/Cmd+B',
        click: function () {
          clEditorSvc.pagedownEditor.uiManager.doClick('bold')
        }
      }, {
        icon: 'fa-italic',
        label: 'Italic',
        keystroke: 'Ctrl/Cmd+I',
        click: function () {
          clEditorSvc.pagedownEditor.uiManager.doClick('italic')
        }
      }, {
        separator: true,
        icon: 'fa-quote-left',
        label: 'Blockquote',
        keystroke: 'Ctrl/Cmd+Q',
        click: function () {
          clEditorSvc.pagedownEditor.uiManager.doClick('quote')
        }
      }, {
        icon: 'fa-indent',
        label: 'Code',
        keystroke: 'Ctrl/Cmd+K',
        click: function () {
          clEditorSvc.pagedownEditor.uiManager.doClick('code')
        }
      }, {
        icon: 'fa-link',
        label: 'Link',
        keystroke: 'Ctrl/Cmd+L',
        click: function () {
          clEditorSvc.pagedownEditor.uiManager.doClick('link')
        }
      }, {
        icon: 'fa-image',
        label: 'Image',
        keystroke: 'Ctrl/Cmd+G',
        click: function () {
          clEditorSvc.pagedownEditor.uiManager.doClick('image')
        }
      }, {
        icon: 'fa-table',
        label: 'Table',
        keystroke: 'Ctrl/Cmd+T',
        click: function () {
          clEditorSvc.pagedownEditor.uiManager.doClick('table')
        }
      }, {
        icon: 'fa-list-ol',
        label: 'Numbered list',
        keystroke: 'Ctrl/Cmd+O',
        click: function () {
          clEditorSvc.pagedownEditor.uiManager.doClick('olist')
        }
      }, {
        icon: 'fa-list-ul',
        label: 'Bullet list',
        keystroke: 'Ctrl/Cmd+U',
        click: function () {
          clEditorSvc.pagedownEditor.uiManager.doClick('ulist')
        }
      }, {
        icon: 'fa-asterisk',
        label: 'Horizontal rule',
        keystroke: 'Ctrl/Cmd+R',
        click: function () {
          clEditorSvc.pagedownEditor.uiManager.doClick('hr')
        }
      }]

      var undoButton = {
        separator: true,
        icon: 'fa-undo',
        label: 'Undo',
        keystroke: 'Ctrl/Cmd+Z',
        disabled: true,
        click: function () {
          clEditorSvc.cledit.undoMgr.undo()
        }
      }

      var redoButton = {
        icon: 'fa-undo',
        label: 'Redo',
        keystroke: 'Ctrl/Cmd+Y',
        disabled: true,
        click: function () {
          clEditorSvc.cledit.undoMgr.redo()
        }
      }

      btns.push(undoButton)
      btns.push(redoButton)

      var props = {
        margin: 20,
        btnWidth: 26,
        btnHeight: 28,
        height: 60,
        visibleHeight: 36
      }

      var offset = props.margin
      btns.cl_each(function (btn) {
        if (btn.separator) {
          offset += 15
        }
        btn.offset = offset
        var click = btn.click
        btn.click = function () {
            // clEditorLayoutSvc.currentControl = undefined
          setTimeout(click, 10)
        }
        offset += props.btnWidth
      })
      props.width = offset + props.margin

      function link (scope, element) {
        scope.btns = btns
        scope.btnWidth = props.btnWidth
        scope.btnHeight = props.btnHeight
        scope.editor = clEditorSvc

        var isOpen
        var openOffsetY = props.visibleHeight - props.height
        var closedOffsetY = -props.height - 10

        var buttonBarElt = element[0].querySelector('.button-bar').clanim
          .width(props.width)
          .height(props.height)
          .top(2000)
          .translateX(-props.width / 2)
          .translateY(closedOffsetY)
          .start()

        function checkBtnActive () {
          undoButton.disabled = !clEditorSvc.cledit.undoMgr.canUndo()
          redoButton.disabled = !clEditorSvc.cledit.undoMgr.canRedo()
          scope.$evalAsync()
        }

        checkBtnActive()
        clEditorSvc.cledit.undoMgr.on('undoStateChange', checkBtnActive)
        scope.$on('$destroy', function () {
          clEditorSvc.cledit.undoMgr.off('undoStateChange', checkBtnActive)
        })


      }

	return btns;
    }
