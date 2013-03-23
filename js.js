var widget=(function(baseClassName){
	var root = null,
		classes = {//baseClassName + arrowClass
			'arrows' : {
				'top'    : '-top-arrow',
				'bottom' : '-bottom-arrow',
				'left'   : '-left-arrow',
				'right'  : '-right-arrow'
				},
			'caption' : '-caption',
			'text' : '-text',
			'word' : '-word-wrap' ,
			'main' : '-main-block'
		},
		arrowPosCompensator = 2;//rotate(45deg) => width(7)*sqrt(2)=9 =>9-7=2
		widget = {
			selection : null,
			blocks : {},
			baseClassName : '',
			updatePosition : function(){
				with (widget) {
					if (selection) {
						var r = selection.getBoundingClientRect()
						//console.log(r)
						//hack for normal width of block (no collpased text)
					_(blocks.main).css({'left': '0px','top': '0px','width':'','height':''})
					var w = blocks.main.offsetWidth;
					var wDelta = parseInt(_(blocks.main).css('padding-left')) + parseInt(_(blocks.main).css('padding-right'))//or just box-sizing:border-box;
					var h = blocks.main.offsetHeight;
						//end of hack
						xoff = window.pageXOffset
						yoff = window.pageYOffset
					    var top = (yoff + r.top - h);
					   	var left = (xoff + r.left + (r.width-w)/2);					    
					   /* for (var key in arrows)
					    	_(arrows[key]).hide();*/
					    var arrowName = ''
					    var hideArrowName = ''
					    if (top < yoff) {
					    	top = (yoff + r.bottom)
					    	arrowName = 'top'
					    } else {
					    	arrowName = 'bottom'	
					    } 
					    if (left + w > window.innerWidth + xoff) {
					    		left = window.innerWidth - w + xoff
					    	} else if (left < xoff) {
					    			left = xoff
					    		} 
			    		if (left + w/2 < xoff + r.left) {
			    				left = xoff + r.left - w
			    				top += (h+r.height)/2
			    				arrowName = 'right'
			    			} else if (left > xoff + r.left + r.width/2) {
			    						left = xoff + r.left + r.width
			    						top += (h+r.height)/2
			    						arrowName = 'left'
			    					}
					    _(blocks.main).css({
					    	'top' : top + 'px',
					    	'left' : left + 'px',
					    	'width' : (w - wDelta) + 'px'/*,
					    	'height' : h + 'px'*/
					    })
					    with(blocks.arrows)	_([left,right,top,bottom]).css({'position':'absolute','display':'none'})
					    _(blocks.word).css({
					    	'top' : (yoff + r.top) + 'px',
					    	'left' : (xoff + r.left) + 'px',
					    	'width' : r.width + 'px',
					    	'height' : r.height + 'px'
					    })
					    _(blocks.arrows[arrowName]).css('display','block')
					    if (arrowName=='top' || arrowName=='bottom') {
						    var arl = r.left + xoff + (r.width-blocks.arrows[arrowName].offsetWidth)/2-blocks.main.offsetLeft+arrowPosCompensator;
						    _(blocks.arrows[arrowName]).css('left',parseInt(arl+'')+'px')
					    } else {
					    	var art = (h - blocks.arrows[arrowName].offsetHeight + arrowPosCompensator)/2
							_(blocks.arrows[arrowName]).css('top',parseInt(art+'')+'px')
					    }
					    
					    _(blocks.arrows[arrowName]).css('left',parseInt(arl+'')+'px')
					}
				}
			}, 
			showByEvent : function(e){
				var parent = e.target;
				if (parent) {
					while (parent!==document.body && parent!==widget.blocks.main && parent!==widget.blocks.word && (parent)) {
						parent = parent.parentNode;
					}
					if (parent===widget.blocks.main || parent===widget.blocks.word) return;
					with (widget) {
						if (e.target == blocks.main || e.target == blocks.word) return;
						if (selection) selection.detach()
						if (selection = getWordAtPoint(e.target, e.x, e.y)){
							//_(textBlock).html(selection.toString())
							_(blocks.text).html('rand '+parseInt(Math.random()*100+'')/10)
							_(blocks.caption).html(selection.toString())
							show()
							updatePosition()
						} else {
							hide()
						}
					}			
				}	
			},
			hideByEvent : function(e){
				var parent = e.target;
				if (parent) {
					while (parent!==document.body && parent!==widget.blocks.main && parent!==widget.blocks.word && (parent)) {
						parent = parent.parentNode;
					}
					if (parent===widget.blocks.main || parent===widget.blocks.word) return;
					with (widget) {
							hide()
					}			
				}	
			},

			show : function(){
				with (widget.blocks)
					_([main,word]).css('display','block')
			},

			hide : function(){
				with (widget.blocks) 
					_([main,word]).css('display','none')
			}
		}

	function init(){
		if (window === this) return new init();
		widget.baseClassName = baseClassName
		with (widget) {
			for (var key in classes){
				if (typeof classes[key] == "object")
				{
					blocks[key] = {}
					for (var key2 in classes[key])
						blocks[key][key2] = _(document.createElement('div')).addClass(baseClassName + classes[key][key2])[0]
					//blocks[key] = _(document.createElement('div')).addClass(baseClassName + classes[key])[0]
				} else 
					blocks[key] = _(document.createElement('div')).addClass(baseClassName + classes[key])[0]
			}
			with (blocks) _(document.body).append([_(word).css({'position':'absolute','display':'none'}),_(main).css({'position':'absolute','display':'none'}).append([_([arrows.left,arrows.right,arrows.top,arrows.bottom]).css({'position':'absolute','display':'none'}),caption,text])])
			hide()
		}
		return widget;
	}

	function testChar(c){
		return (('a'<=c && c<='z') || ('A'<=c && c<='Z')) ? true : false;
	}

	function deleteLRSpaceInRange(range) {
		while(range.toString()[0]==" ")
			range.setStart(range.startContainer, range.startOffset+1)
		while(range.toString()[range.toString().length-1]==" ")
			range.setEnd(range.endContainer, range.endOffset-1)
	}

	function expandRangeToWord(range) {
		/*if (range.toString().length<2)
			range.setEnd(range.endContainer, range.endOffset+1)*/
	  	while(testChar(range.toString()[0]) && range.startOffset!=0)
			range.setStart(range.startContainer, range.startOffset-1)
		while(testChar(range.toString()[range.toString().length-1]) && (range.endContainer.length)!=range.endOffset)
			range.setEnd(range.endContainer, range.endOffset+1)
	}

	function getWordAtPoint(elem, x, y) {
		//console.log(elem)
		try {
			var selection = null;
		    if (selection = window.getSelection) 
		    {// Not IE, используем метод getSelection
			    selection = window.getSelection()
			    var range = selection.getRangeAt(0)
				var txt = range.toString()
				if (txt.charAt(txt.length-1)==" ")
				{
					range.setEnd(range.endContainer, range.endOffset-1)
				}
				selection.removeAllRanges()
				return (txt=='' || txt==' ') ? null : range
			}
		} catch(err) {
		  console.log('some thing is bad',err)
		}
		/*
		if(elem.nodeType == elem.TEXT_NODE) {
			console.log("TExt_NODE")
		    var range = elem.ownerDocument.createRange()
		    range.selectNodeContents(elem)
		    var currentPos = 0
		    var endPos = range.endOffset
		    while(currentPos < endPos) {
		    	range.setStart(elem, currentPos)
		    	range.setEnd(elem, currentPos+1)
		    	var r = range.getBoundingClientRect()
		    	console.log(r.left,r.right,r.top,r.bottom,'|',x,y,"'"+range.toString()+"'")
		    	if (r.left <= x && x <= r.right   && r.top  <= y && y <= r.bottom) {
		    		console.log("'"+range.toString()+"'")
			        range.expand("word");
			        console.log("'"+range.toString()+"'")
			        //expandRangeToWord(range)
			        //deleteLRSpaceInRange(range)
			        var txt = range.toString()
			        return (txt !="" && txt !=" ") ? range : null
		      	}
		      	currentPos++
		    }
		} else {
		    for(var i = 0; i < elem.childNodes.length; i++) {
		      	var range = elem.childNodes[i].ownerDocument.createRange()
		      	range.selectNodeContents(elem.childNodes[i])
		      	var r = range.getBoundingClientRect()
		      	if (r.left <= x && x <= r.right   && r.top  <= y && y <= r.bottom) {
		        	range.detach()
		        	return getWordAtPoint(elem.childNodes[i], x, y)
		      	} else {
		        	range.detach()
		    	}
		    }
		}
		return null
		*/
	}    

	function getWordFromClick(e){
		//remove selection
		//window.getSelection().removeAllRanges();
		if (e.target.id!="wtf")
		{
		//console.log(e.target)
		var rect = getWordAtPoint(e.target,e.x,e.y)
			if (rect) {
				//console.log(rect)
				mainDiv.style.display = 'block';
			    mainDiv.innerHTML=rect.text+'<span class="down-arrow"></span>';		    
			    mainDiv.style.top=(window.pageYOffset + rect.top - mainDiv.offsetHeight) + 'px';
			    mainDiv.style.left=(window.pageXOffset + rect.left + (rect.width-mainDiv.offsetWidth)/2) + 'px';
			    mainDiv.querySelector('.down-arrow').style.left = (mainDiv.offsetWidth-mainDiv.querySelector('.down-arrow').offsetWidth)/2 + 'px';
			}
		}
	}

	//easy way only for doubleClick with enabled text selection
	/*function getWordFromEvent (e) {
	    var selection = null;
	    if (selection = window.getSelection) 
	    {// Not IE, используем метод getSelection
		    selection = window.getSelection()
		    console.log(selection)
		    var range = selection.getRangeAt(0)
			var txt = range.toString()
			console.log(range.endOffset)
			if (txt.charAt(txt.length-1)==" ")
			{
				range.setEnd(range.endContainer, range.endOffset-1)
			}
			console.log(range);
		    var rect = range.getClientRects()[0];
		    var div =document.createElement('div');
		    div.style.position="absolute";
		    div.innerHTML="asdasd";
		    div.style.top=(window.pageYOffset + rect.top) + 'px';
		    div.style.height=rect.height + 'px';
		    div.style.left=(window.pageXOffset + rect.left) + 'px';
		    div.style.width = rect.width + 'px';
		    div.style.background = 'red';
		    document.body.appendChild(div)
			selection.removeAllRanges()
		}
	}*/
	return init();
})

var w = null

window.addEventListener("load",function(){
	//console.clear();
	//document.addEventListener("click",getWordFromClick)
	w = new widget('widget')
	document.addEventListener("dblclick",w.showByEvent)
	document.addEventListener("click",w.hideByEvent)
	document.addEventListener("scroll",w.updatePosition)
},false)

window.addEventListener("resize",function(){
	w.updatePosition()
},false)