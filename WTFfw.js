/*WTF FrameWork
copy pasta

  function deserializeValue(value) {
    var num
    try {
      return value ?
        value == "true" ||
        ( value == "false" ? false :
          value == "null" ? null :
          !isNaN(num = Number(value)) ? num :
          /^[\[\{]/.test(value) ? $.parseJSON(value) :
          value )
        : value
    } catch(e) {
      return value
    }
  }

  $.HS = function (c) {
    function f(a, b) {
      c.push([])
      return d(a, b)
    }
    function d(a, b) {
      b = "" + (b || "")
      a && e("<", a, ">")
      b && e(b)
      a && e("</", a.split(" ")[0], ">")
      return d
    }
    d.toString = function () {
      return c.pop().join("")
    }

    function e() {
      c[c.length - 1].push(c.join.call(arguments, ""))
    }
    return f
  }([])
*/

var _=(function(){
  function isArray(value) { return value instanceof Array }
  function likeArray(obj) { return typeof obj.length == 'number' }
  camelize = function(str){ return str.replace(/-+(.)?/g, function(match, chr){ return chr ? chr.toUpperCase() : '' }) }//backround-color => backgroundCOLOR

  /*function getFirst(vector) {
    if(vector) {
      if(likeArray(vector)) {
          for(var i = 0; i < vector.length;i++)
            return vector[i];
      } else return vector;
    }
  }*/

  function forEach(vector, callback) {
    if (likeArray(vector)) {
      for(var i = 0; i < vector.length;i++)
        callback(vector[i], i);
    } else {
        callback(vector)            
    }
    return vector
  }

  function _(selector, root) {//init wtf framework for current selector or element
    if (window === this) return new _(selector);//set "this" 
    var elements = [];
    elements.__proto__ = _.fn//framework is extension of array, so outside additional properties(function) is invisible but avaible
    if (!selector) return elements;
    if (typeof selector == "string") {
      if (selector) {
        if (root === undefined) {
          elements = document.querySelectorAll(selector) || []
        } else {
          elements = root.querySelectorAll(selector) || []
        }
        elements.__proto__ = _.fn
        /*forEach(elements, function(e, i){ 
          for (var func in _.fn)
            elements[i][func] = _.fn[func] 
        })*/     
        return elements
      }
    } else if (isArray(selector)){
      for (var i=0;i<selector.length;i++)
        elements[i] = selector[i];
      return elements;
    } else {
      elements = [selector] || []//if selector is htmlElement
      elements.__proto__ = _.fn
      return elements;
    }
  }

  //_.functionality = {
  _.fn = {
      each: function (callback) {//call callback for every element (in callback function "this" is element[i] (this[i]))
          if (likeArray(this)) {
            for(var i = 0; i < this.length;i++)
              callback.call(this[i], i);
          } else {
            /*
            var flag=false;
            for (var key in this) {
              flag = true;
              callback.call(this[key])
            }
            if (!flag) */              
              callback.call(this, 0)            
          }
          return this
        },

    html: function(html) {//set html for all, or get html of all in array
          if(html !== undefined){
            this.each(function(){
                    this.innerHTML = html
                  })
            return this
          } else {
            var result = []
            this.each(function(i){
                    result[i] = this.innerHTML
                  })
            return result
          }
        },

    css: function(property, value){
      //if property unset then return cssText of all in array
      //if value unset then if property is object {'param': 'value'}
      // set params for all elements , if value='' (empty string) then remove propery
          if (property === undefined){
            var result = []
            this.each(function(i){              
              result[i] = this.style.cssText
            })
            return (likeArray(this)) ? result : result[0];
          } else {
            if (value === undefined) {
              if (typeof property === "string") {
                var result = []
                this.each(function(i){              
                  result[i] = this.style[camelize(property)] || window.getComputedStyle(this, null).getPropertyValue(property)
                })
                return (likeArray(this)) ? result : result[0];
              } else {//object
                for (var key in property) {
                  this.each(function(){
                    if (property[key]) {
                      this.style[camelize(key)] = property[key]
                    } else {
                      this.style.removeProperty(key)
                    }
                  })
                }
                return this
              }
            } else {
                if (value) {
                  this.each(function(){              
                    this.style[camelize(property)] = value
                  })
                } else {
                  this.each(function(){              
                    this.style.removeProperty(property)
                  })
                }
                return this
            }
          }   
          return this        
        },

    appendHtml: function(html) {//add html at end
          if(html !== undefined)
            this.each(function(){
                    this.innerHTML += html
                  })
          return this
        },

    prependHtml: function(html) {//add html at top
          if(html !== undefined)
            this.each(function(){
                    this.innerHTML = html + this.innerHTML
                  })
          return this
        },

    append: function(elem) {//add html block at end
          if(elem !== undefined)
            if (!likeArray(elem)){
              this.each(function(){
                    this.appendChild(elem)
                    })
            } else {
              for (var i=0;i<elem.length;i++) {
                if (likeArray(elem[i])) {
                  this.append(elem[i])
                } else this.each(function(){
                    this.appendChild(elem[i])
                    })
              }
            }
          return this
        },

    prepend: function(elem) {//add html block at top
          if(elem !== undefined)
            this.each(function(){
                    this.insertBefore(elem,this.firstChild)
                  })
          return this
        },

    addClass: function (name) {//add class
          if (name) {
            var names = name.split(' ');
            if (names.length) { 
              for (var i=0;i<names.length;i++) {
                if (names[i])//check for empty string
                  this.each(function(){
                    if (!_(this).hasClass(names[i]))
                      this.className += (this.className ? ' ' : '') + names[i]; 
                  })
              }
            }
          }
          return this;
        },

          /*if (name) this.each(function(){
            if (!this.hasClass(name))
              this.className += (this.className ? ' ' : '') + name; 
          })
          return this;*/

    hasClass: function (name) {//return true if all elements have all classes from name
          var flag = false;
          if (name) {
            var names = name.split(' ');
            if (names.length) { 
              flag = true
              for (var i=0;i<names.length;i++) {
                if (names[i])
                  this.each(function(){
                    if (!(new RegExp('(\\s|^)'+names[i]+'(\\s|$)').test(this.className)))
                      flag = false
                  })
              }
            }
          }
          return flag
        },

    removeClass: function (name) {//remove classes
          if (name) {
            var names = name.split(' ');
            if (names.length) { 
              for (var i=0;i<names.length;i++) {
                if (names[i])
                  this.each(function(){
                    if (this.hasClass(names[i]))
                      this.className = this.className.replace(new RegExp('(\\s|^)'+names[i]+'(\\s|$)'),' ').replace(/^\s+|\s+$/g, '');
                  })
              }
            }
          }
          return this;
        },

    attr: function(name, value){//set atribute(if value unset return atribute in array)
          if (value !== undefined) {
            this.each(function(){
              this.setAttribute(name,value)
            })
            return this;
          } else {
            if (typeof name === "object") {
              for (var key in name) {
                this.each(function(){
                  this.setAttribute(key,name[key])
                })
              }
              return this;
            } else {
              if (likeArray(this)) {
                var result = [];
                this.each(function(i){
                  result[i] = this.getAttribute(name)
                })
                return result
              } else {
                var result = "";
                this.each(function(){
                  result = this.getAttribute(name)
                })
                return result
              }
            }
          } 
          return this
        },

    removeAttr: function(name){//remove attribute
          if (name instanceof Array) {
            for (var i=0;i<name.length;i++) {
              this.each(function(){
                this.removeAttribute(name[i])
              })
            }
            return this;
          } else {
              this.each(function(){
                this.removeAttribute(name)
              })
              return this
          }
          return this
        },

    bind: function(eventName, handler) {
          this.each(function(i){
            if (this.addEventListener) {
              this.addEventListener(eventName, handler, false);
            } else if (this.attachEvent) {
              this.attachEvent('onpropertychange', function(event) {
                if (event.propertyName === eventName) {
                  return handler()
                }
              })
            } else {
              throw new Error("Attempt to attach custom event " + eventName + " to something which isn't a DOMElement");
            }
          })
          return this
        },

    unbind: function(eventName, handler) {
          this.each(function(i){
            if (this.removeEventListener) {
              this.removeEventListener(eventName, handler, false);
            } else if (this.detachEvent) {
              this.detachEvent('onpropertychange', function(event) {
                if (event.propertyName === eventName) {
                  return handler()
                }
              })
            } else {
              throw new Error("Attempt to attach custom event " + eventName + " to something which isn't a DOMElement");
            }
          })
          return this
        },

    clippingRect: function(rect) {//set html for all, or get html of all in array
            if (rect === undefined) {
              var result = []
              this.each(function(i){
                      console.log('hi')
                      result[i] = {
                        'left' : 0,
                        'top' : 0,
                        'width' : 0,
                        'height' : 0,
                        'right' : 0,
                        'bottom' : 0
                      }
                      with(result[i]) {
                      left = this.offsetLeft
                      top = this.offsetTop
                      width = this.offsetWidth
                      height = this.offsetHeight
                      right = left + width
                      bottom = top + height
                      }
                    })
              return result
            } else {
              this.each(function(){
                        var r = {}
                        for (var key in rect)
                          if (key=='left' || key=="top" || key=="width" || key=="height")
                          {
                            r[key]=parseInt(rect[key])+'px'
                          }
                        _(this).css(r)
                    })
              return this;
            }
        },
	//hide and show used for tests
    hide: function () {//hide element
          return this.css('display','none');
        },

    show: function () {//shiw element
          return this.css('display','inherit');
        }
    }
    return _;
  })();