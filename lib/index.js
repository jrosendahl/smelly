'use strict';
function DomElement (childNodes){
	var preJS = '';
	var postJS = '';
	var jsLnks = [];
	var cssLnks = [];

	this.attributes = {};

	this.__defineGetter__('scriptPre', function() {
		var jsString = preJS;
		if(preJS.length > 0) {
			jsString += '\n';
		}

		for(var i =0; i < childNodes.length; i++) {
			jsString += childNodes[i].scriptPre;
		}
		return jsString;
	});
	this.__defineSetter__('scriptPre', function(jsString) {
		preJS = jsString;
	});

	this.__defineGetter__('scriptPost', function() {
		var jsString = postJS;
		if(postJS.length > 0) {
			jsString += '\n';
		}
		for(var i =0; i < childNodes.length; i++) {
			jsString += childNodes[i].scriptPost;
		}
		return jsString;
	});
	this.__defineSetter__('scriptPost', function(jsString) {
		postJS += jsString;
	});

	this.__defineSetter__('jsLinks', function(file) {
		if(file) {
			if(typeof file  === 'string') {
				file = [file];
			}
			jsLnks = jsLnks.concat(file);
		}
	});
	this.__defineGetter__('jsLinks', function() {
		var files = jsLnks;
		for(var i =0; i < childNodes.length; i++) {
			var lnks = childNodes[i].jsLinks;
			for(var k = 0; k < lnks.length; k++) {
				var duplicate = false;
				for (var j = 0; j < files.length;j++) {
					if(lnks[k] == files[j]) {
						duplicate = true;
					}
				}
				if(! duplicate) {
					files.push(lnks[k]);
				}
			}
		}
		return files;
	});
	this.__defineSetter__('cssLinks', function(file) {
		if(file) {
			if(typeof file  === 'string') {
				file = [file];
			}
			cssLnks = cssLnks.concat(file);
		}
	});
	this.__defineGetter__('cssLinks', function() {
		var files = cssLnks;
		for(var i =0; i < childNodes.length; i++) {
			var lnks = childNodes[i].cssLinks;
			for(var k = 0; k < lnks.length; k++) {
				var duplicate = false;
				for (var j = 0; j < files.length;j++) {
					if(lnks[k] == files[j]) {
						duplicate = true;
					}
				}
				if(! duplicate) {
					files.push(lnks[k]);
				}
			}
		}
		return files;
	});
}

function Doc(type, title) {
	this.type =  type || 'HTML5';
	this.title = title || ':reQreo:';

	this.body = new Body();
	this.meta = [];
	this.style = null;

	this.base = DomElement;

	this.base([this.body]);

	this.addMeta = function(attributes) {
		this.meta.push(new Meta(attributes));
	};

	this.stringifyHTML = function() {
		var documentString = '';
		switch(this.type) {
		case 'HTML5':
			documentString = '<!DOCTYPE html>'; 
			break;
		case 'HTML 4.01 Strict':
			documentString = '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">';
			break;
		case 'HTML 4.01 Transitional':
			documentString = '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">';
			break;
		case 'XHTML 1.0 Strict':
			documentString = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">';
			break; 
		case 'XHTML 1.0 Transitional':
			documentString = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"> ';
			break;
		case 'XHTML 1.1':
			documentString = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">';
			break;
		default:
			documentString = '<!DOCTYPE html>'; 
			break;
		}

		documentString += '\n<html>\n<head>\n';
		for (var i =0; i < this.meta.length; i++) {
			documentString += this.meta[i].stringifyHTML();
		}
		documentString += '<title>' + this.title + '</title>\n';
		documentString += '<!--[if IE 8]><script src="/js/load?script=ie8.js"></script><![endif]-->\n';
		if(this.scriptPre) {
			documentString += '<script>\n' + this.scriptPre + '</script>\n';
		}
		var jsFiles = this.jsLinks;
		for(i = 0; i < jsFiles.length; i++) {
			documentString += '<script src="/js/load?script=' + jsFiles[i] + '"></script>\n';
		}
		if(this.scriptPost) {
			documentString += '<script>\n' + this.scriptPost + '</script>\n';
		}
		var cssFiles = this.cssLinks;
		for(i = 0; i < cssFiles.length; i++) {
			documentString += '<link href="/css/load?cssFile=' + cssFiles[i] + '" rel="stylesheet" type="text/css" />\n';
		}
		documentString += '</head>\n';
		documentString += this.body.stringifyHTML();
		documentString += '</html>\n';
		return documentString;

	};
}

Doc.prototype = new DomElement();
Doc.prototype.constructor = Doc;

function Meta(attributes){
	this.attributes = attributes || {};

	this.stringifyHTML = function () {
		// start tag
		var htmlString = '<meta' ;
		// add attributes
		for(var attribute in this.attributes) {
			htmlString += ' ' + attribute + '="' + this.attributes[attribute] + '"';
		}
		//close tag
		htmlString += ' />\n';
		
		// return string
		return htmlString;
	};
}


function Body() {
	this.base = DomElement;

	this.childern = [];
	this.base(this.childern);

	this.appendChild = function(child) {
		if(child.stringifyHTML) {
			this.childern.push(child);
		}
		else {
			throw(new Error('[BODY]- Failed to append non element:' + child));
		}
		
	};
	this.stringifyHTML = function() {
		// start tag
		var htmlString = '<body';
		// add attributes
		for(var attribute in this.attributes) {
			htmlString += ' ' + attribute + '="' + this.attributes[attribute] + '"';
		}
		//close tag
		htmlString += '>\n';
		for(var i=0; i < this.childern.length; i++) {
			htmlString += this.childern[i].stringifyHTML();
		}
		// recurse through childern
		
		// end tag
		htmlString += '</body>\n';
		// return string
		return htmlString;
	};
}

Body.prototype = new DomElement();
Body.prototype.constructor = Body;





function Div(id, style) {
	this.base = DomElement;
	this.childern = [];
	this.base(this.childern);

	this.attributes.id = id || '';
	this.attributes.class = style || '';
	this.appendChild = function(child) {
		if(child.stringifyHTML) {
			this.childern.push(child);
		}
		else {
			throw(new Error('[DIV] - Failed to append non element:' + child));
		}
	};

	this.stringifyHTML = function() {
		// start tag
		var htmlString = '<div ';
		// add attributes
		for(var attribute in this.attributes) {
			htmlString += attribute + '="' + this.attributes[attribute] + '" ';
		}
		//close tag
		htmlString += '>\n';
		for(var i=0; i < this.childern.length; i++) {
			htmlString += this.childern[i].stringifyHTML();
		}
		// recurse through childern
		
		// end tag
		htmlString += '</div>\n';
		// return string
		return htmlString;
	};
}
Div.prototype = new DomElement();
Div.prototype.constructor = Div;


function Span(id, style) {
	this.base = DomElement;
	this.childern = [];
	this.base(this.childern);

	this.attributes.id = id || '';
	this.attributes.class = style || '';
	this.appendChild = function(child) {
		if(child.stringifyHTML) {
			this.childern.push(child);
		}
		else {
			throw(new Error('[SPAN] - Failed to append non element:' + child));
		}
	};
	this.stringifyHTML = function() {
		// start tag
		var htmlString = '<span ';
		// add attributes
		for(var attribute in this.attributes) {
			htmlString += attribute + '="' + this.attributes[attribute] + '" ';
		}
		//close tag
		htmlString += '>\n';
		for(var i=0; i < this.childern.length; i++) {
			htmlString += this.childern[i].stringifyHTML();
		}
		// recurse through childern
		
		// end tag
		htmlString += '</span>\n';
		// return string
		return htmlString;
	};
}
Span.prototype = new DomElement();
Span.prototype.constructor = Span;

function P (id,style){
	this.base = DomElement;
	this.childern = [];
	this.base(this.childern);

	this.attributes.id = id || '';
	this.attributes.class = style || '';
	this.appendChild = function(child) {
		if(child.stringifyHTML) {
			this.childern.push(child);
		}
		else {
			throw(new Error('[DIV] - Failed to append non element:' + child));
		}
	};
	this.stringifyHTML = function() {
		// start tag
		var htmlString = '<p ';
		// add attributes
		for(var attribute in this.attributes) {
			htmlString += attribute + '="' + this.attributes[attribute] + '" ';
		}
		//close tag
		htmlString += '>\n';
		for(var i=0; i < this.childern.length; i++) {
			htmlString += this.childern[i].stringifyHTML();
		}
		// recurse through childern
		
		// end tag
		htmlString += '</p>\n';
		// return string
		return htmlString;
	};
}
P.prototype = new DomElement();
P.prototype.constructor = P;

function H(level,id, style) {
	if(typeof(level) != 'number') {
		throw(new Error('Header Level (first attribute) must be numeric'));
	}
	else {
		var hname = 'h' + level; 
		this.base = DomElement;
		this.childern = [];
		this.base(this.childern);

		this.attributes.id = id || '';
		this.attributes.class = style || '';
		this.appendChild = function(child) {
			if(child.stringifyHTML) {
				this.childern.push(child);
			}
			else {
				throw(new Error('[H] - Failed to append non element:' + child));
			}
		};
		this.stringifyHTML = function() {
			// start tag
			var htmlString = '<' + hname + ' ' ;
			// add attributes
			for(var attribute in this.attributes) {
				htmlString += attribute + '="' + this.attributes[attribute] + '" ';
			}
			//close tag
			htmlString += '>\n';
			for(var i=0; i < this.childern.length; i++) {
				htmlString += this.childern[i].stringifyHTML();
			}
			// recurse through childern
			
			// end tag
			htmlString += '</' + hname + '>\n';
			// return string
			return htmlString;
		};
	}
}
H.prototype = new DomElement();
H.prototype.constructor = H;

function A(href, id,style) {
	this.base = DomElement;
	this.childern = [];
	this.base(this.childern);

	this.href = href || '#';
	this.attributes.id = id || '';
	this.attributes.class = style || '';
	this.appendChild = function(child) {
		if(child.stringifyHTML) {
			this.childern.push(child);
		}
		else {
			throw(new Error('[A] - Failed to append non element:' + child));
		}
	};
	this.stringifyHTML = function() {
		// start tag
		var htmlString = '<a href="' + this.href + '"';
		// add attributes

		for(var attribute in this.attributes) {
			htmlString += ' ' + attribute + '="' + this.attributes[attribute] + '"';
		}
		//close tag
		htmlString += '>\n';
		// recurse through childern
		for(var i=0; i < this.childern.length; i++) {
			htmlString += this.childern[i].stringifyHTML();
		}
		// end tag
		htmlString += '</a>\n';
		// return string
		return htmlString;
	};
}
A.prototype = new DomElement();
A.prototype.constructor = A;

function Li (id,style) {
	this.base = DomElement;
	this.childern = [];
	this.base(this.childern);
	
	this.attributes.id = id || '';
	this.attributes.class = style || '';
	this.appendChild = function(child) {
		if(child.stringifyHTML) {
			this.childern.push(child);
		}
		else {
			throw(new Error('[LI] - Failed to append non element:' + child));
		}
	};
	this.stringifyHTML = function() {
		// start tag
		var htmlString = '<li ';
		// add attributes
		for(var attribute in this.attributes) {
			htmlString += attribute + '="' + this.attributes[attribute] + '" ';
		}
		//close tag
		htmlString += '>\n';
		for(var i=0; i < this.childern.length; i++) {
			htmlString += this.childern[i].stringifyHTML();
		}
		// recurse through childern
		
		// end tag
		htmlString += '</li>\n';
		// return string
		return htmlString;
	};
}

Li.prototype = new DomElement();
Li.prototype.constructor = Li;

function Ul (id,style) {
	this.base = DomElement;
	this.childern = [];
	this.base(this.childern);

	this.attributes.id = id || '';
	this.attributes.class = style || '';
	this.appendChild = function(child) {
		if(child instanceof Li) {
			this.childern.push(child);
		}
		else {
			throw(new Error('[UL] - Failed to append only LI elements can be appended to ULs:' + child));
		}
	};
	this.stringifyHTML = function() {
		// start tag
		var htmlString = '<ul ';
		// add attributes
		for(var attribute in this.attributes) {
			htmlString += attribute + '="' + this.attributes[attribute] + '" ';
		}
		//close tag
		htmlString += '>\n';
		for(var i=0; i < this.childern.length; i++) {
			htmlString += this.childern[i].stringifyHTML();
		}
		// recurse through childern
		
		// end tag
		htmlString += '</ul>\n';
		// return string
		return htmlString;
	};
}

Ul.prototype = new DomElement();
Ul.prototype.constructor = Ul;

function Ol (id,style) {
	this.base = DomElement;
	this.childern = [];
	this.base(this.childern);

	this.attributes.id = id || '';
	this.attributes.class = style || '';
	this.appendChild = function(child) {
		if(child instanceof Li) {
			this.childern.push(child);
		}
		else {
			throw(new Error('[UL] - Failed to append only LI elements can be appended to OLs:' + child));
		}
	};
	this.stringifyHTML = function() {
		// start tag
		var htmlString = '<ol ';
		// add attributes
		for(var attribute in this.attributes) {
			htmlString += attribute + '="' + this.attributes[attribute] + '" ';
		}
		//close tag
		htmlString += '>\n';
		for(var i=0; i < this.childern.length; i++) {
			htmlString += this.childern[i].stringifyHTML();
		}
		// recurse through childern
		
		// end tag
		htmlString += '</ol>\n';
		// return string
		return htmlString;
	};
}
Ol.prototype = new DomElement();
Ol.prototype.constructor = Ol;

function Label (For,style){
	this.base = DomElement;
	this.childern = [];
	this.base(this.childern);

	this.attributes.for = For || '';
	this.attributes.class = style || '';
	this.appendChild = function(child) {
		if(child.stringifyHTML) {
			this.childern.push(child);
		}
		else {
			throw(new Error('[LABEL] - Failed to append non element:' + child));
		}
	};
	this.stringifyHTML = function() {
		// start tag
		var htmlString = '<label ';
		// add attributes
		for(var attribute in this.attributes) {
			htmlString += attribute + '="' + this.attributes[attribute] + '" ';
		}
		//close tag
		htmlString += '>\n';
		for(var i=0; i < this.childern.length; i++) {
			htmlString += this.childern[i].stringifyHTML();
		}
		// recurse through childern
		
		// end tag
		htmlString += '</label>\n';
		// return string
		return htmlString;
	};
}
Span.prototype = new DomElement();
Span.prototype.constructor = Span;

function Select(name,id,cssClass) {
	this.base = DomElement;
	this.base([]);

	this.attributes.name = name || '';
	this.attributes.id = id || '';
	this.attributes.class = cssClass || '';
	//this.multi = false;
	var Multi = false;
	this.selectedIndex = undefined;
	this.options = [];
	this.selectOptionAt = function(index){
		if(this.multi === false) {
			if(index instanceof Array) {
				throw(new Error('Can not set multiple selections for single select'));
			}
			else{
				for(var i=0; i < this.options.length; i++) {
					this.options[i].selected = false;
				}
				if(typeof(this.options[index]) != 'undefined') {
					this.options[index].selected = true;
				}
			}
		}
		else {
			for(var i=0; i < this.options.length; i++) {
				this.options[i].selected = false;
			}
			if(index instanceof Array) {
				for(i = 0; i < index.length; i++){
					if(typeof(this.options[i]) != 'undefined') {
						this.options[i].selected = true;
					}	
				}
			}
			else {
				if(typeof(this.options[index]) != 'undefined') {
					this.options[index].selected = true;
				}
			}
		}
	};
	this.selectOptionValue = function(value) {
		if(this.multi === false) {
			if(value instanceof Array) {
				throw('Can not set multiple selections for single select');
			}
			else{
				for(var i=0; i < this.options.length; i++) {
					this.options[i].selected = false;
					if(this.options[i].value == value) {
						this.options[i].selected = true;
					}
				}
			}
		}
		else {
			if(value instanceof Array) {
				for(var i=0; i < this.options.length; i++) {
					this.options[i].selected = false;
					for(var j = 0; j < value.length; j++){
						if(this.options[i].value == value[j]) {
							this.options[i].selected = true;
						}
					}	
				}
			}
			else {
				for(var i=0; i < this.options.length; i++) {
					this.options[i].selected = false;
					if(this.options[i].value == value) {
						this.options[i].selected = true;
					}
				}
			}
		}
	};
	this.__defineSetter__('selectedIndex', this.selectOptionAt);
	this.__defineGetter__('selectedIndex', function() {
		var selectedList = [];
		for(var i=0; i < this.options.length; i++) {
			if(this.options[i].selected === true) {
				selectedList.push(i);
			}
		}
		if(this.multi) {
			if(selectedList.length > 0) {
				return selectedList;
			}
			else {
				return 'undefined';
			}
		}
		else {
			return selectedList[0];
		}
	});
	this.__defineSetter__('multi', function(value) {
		if(value === false && this.selectedIndex instanceof Array) {
			throw new Error('Can not set select to single with multiple options selected');
		}
		else {
			Multi = value;
		}
	});
	this.__defineGetter__('multi', function() {return Multi;});
	this.addOption = function(value,display,selected) {
		this.options.push(new Option(value,display,selected));

	};
	this.stringifyHTML = function() {
		// start tag
		var htmlString = '<select ';
		// add attributes
		for(var attribute in this.attributes) {
			htmlString += attribute + '="' + this.attributes[attribute] + '" ';
		}
		if(this.multi === true) {
			htmlString += 'multiple="true"';
		}
		//close tag
		htmlString += '>\n';
		for(var i=0; i < this.options.length; i++) {
			htmlString += this.options[i].stringifyHTML();
		}
		// recurse through childern
		
		// end tag
		htmlString += '</select>\n';
		// return string
		return htmlString;
	};
}

Select.prototype = new DomElement();
Select.prototype.constructor = Select;

function Option (value, display, selected) {
	this.value = value || '';
	this.display = display || '';
	this.attributes = {};
	this.selected = selected || false;
	this.scriptPre = function () {throw new Error('You can not add a pre-script to a option element');};
	this.scriptPost = function () {throw new Error('You can not add a post-script to a option element');};
	this.jsLinks = function () {throw new Error('You can not add a JS link to a option element');};
	this.cssLinks = function () {throw new Error('You can not add a CSS link to a option element');};
	this.stringifyHTML = function() {
		// start tag
		var htmlString = '<option ';
		// add attributes
		for(var attribute in this.attributes) {
			htmlString += attribute + '="' + this.attributes[attribute] + '" ';
		}
		htmlString += 'value="' + this.value + '"';
		if(this.selected === true) {
			htmlString += ' selected="true"';
		}
		//close tag
		htmlString += '>';
		htmlString += this.display;
		
		// end tag
		htmlString += '</option>\n';
		// return string
		return htmlString;
	};
}

function Input (type, name, id, cssClass, value) {
	this.base = DomElement;
	this.base([]);

	this.type = type || 'text';
	this.value = value || '';
	this.attributes.name = name || '';
	this.attributes.id = id || '';
	this.attributes.class = cssClass || '';
	this.stringifyHTML = function() {
		// start tag
		var htmlString = '<input type="' + this.type + '"';
		htmlString += ' value="' + this.value + '"';

		// add attributes
		for(var attribute in this.attributes) {
			htmlString += ' ' + attribute + '="' + this.attributes[attribute] + '"';
		}
		
		htmlString += ' />\n';
	
		return htmlString;
	};
}
Input.prototype = new DomElement();
Input.prototype.constructor = Input;


function Textarea(name, id, cssClass, value) {
	this.base = DomElement;
	this.base([]);

	this.value = value || '';
	this.attributes.name = name || '';
	this.attributes.id = id || '';
	this.attributes.class = cssClass || '';
	this.stringifyHTML = function() {
		// start tag
		var htmlString = '<textarea';

		// add attributes
		for(var attribute in this.attributes) {
			htmlString += ' ' + attribute + '="' + this.attributes[attribute] + '"';
		}
		htmlString += '>\n';
		htmlString += this.value;
		htmlString += '\n</textarea>\n';
	
		return htmlString;
	};
}
Textarea.prototype = new DomElement();
Textarea.prototype.constructor = Textarea;


function TextNode(value) {
	this.value = value || '';
	this.jsLinks = '';
	this.cssLinks = '';
	this.scriptPost = '';
	this.scriptPre = '';
	this.stringifyHTML = function() {
		return this.value;
	};
}

function Img(src,id,cssClass) {
	this.src = src || '';
	this.base = DomElement;
	this.base([]);

	this.attributes.id = id || '';
	this.attributes.class = cssClass || '';
	this.stringifyHTML = function() {
		var htmlString = '<img src="' + this.src + '"';
		// add attributes
		for(var attribute in this.attributes) {
			htmlString += ' ' + attribute + '="' + this.attributes[attribute] + '"';
		}
		htmlString += ' />\n';
		return htmlString;

	};
}

Img.prototype = new DomElement();
Img.prototype.constructor = Img;

function Form(id, action, method, uploadFile, target){
	this.base = DomElement;
	this.childern = [];
	this.base(this.childern);

	this.action = action || '';
	this.method = method || '';
	if(uploadFile) {
		this.encType = 'multipart/form-data';
	}
	else {
		this.encType = 'application/x-www-form-urlencoded' ;
	}
	this.target = target || '_self';
	this.attributes.id = id || '';
	this.appendChild = function(child) {
		if(child.stringifyHTML) {
			this.childern.push(child);
		}
		else {
			throw(new Error('[FORM] - Failed to append non element:' + child));
		}
	};
	this.stringifyHTML = function() {
		// start tag
		var htmlString = '<form action="' + this.action + '" method="' + this.method + '" target="' + this.target + '" enctype="' + this.encType + '"';
		// add attributes
		for(var attribute in this.attributes) {
			htmlString += ' ' + attribute + '="' + this.attributes[attribute] + '"';
		}
		//close tag
		htmlString += '>\n';

		// recurse through childern
		for(var i=0; i < this.childern.length; i++) {
			htmlString += this.childern[i].stringifyHTML();
		}
		// end tag
		htmlString += '</form>\n';
		// return string
		return htmlString;
	};
}

Form.prototype = new DomElement();
Form.prototype.constructor = Form;

function Table(id, style) {
	this.base = DomElement;

	this.header = new Thead();
	this.footer = new Tfoot();
	this.body = new Tbody();

	this.base([this.header, this.footer, this.body]);

	this.attributes.id = id || ''; 
	this.attributes.class = style || '';
	this.__defineGetter__('colCount',function() {
		var count = 0;
		for(var i =0; i < this.header.rows.length; i++) {
			if(this.header.rows[i].cells.length > count) {
				count = this.header.rows[i].cells.length; 
			}
		}
		for(var i =0; i < this.footer.rows.length; i++) {
			if(this.footer.rows[i].cells.length > count) {
				count = this.footer.rows[i].cells.length; 
			}
		}
		for(var i =0; i < this.body.rows.length; i++) {
			if(this.body.rows[i].cells.length > count) {
				count = this.body.rows.cells.length; 
			}
		}
		return count;
	});
	this.stringifyHTML = function() {
		// start tag
		var htmlString = '<table';
		// add attributes
		for(var attribute in this.attributes) {
			htmlString += ' ' + attribute + '="' + this.attributes[attribute] + '"';
		}
		//close tag
		htmlString += '>\n';
		htmlString += this.header.stringifyHTML();
		htmlString += this.footer.stringifyHTML();
		htmlString += this.body.stringifyHTML();
		// recurse through childern
		
		// end tag
		htmlString += '</table>\n';
		// return string
		return htmlString;
	};
}

Table.prototype = new DomElement();
Table.prototype.constructor = Table;

function Thead() {
	this.base = DomElement;
	this.rows = [];
	this.base(this.rows);
	
	this.addRow = function(id, elements) {
		this.rows.push(new Thr(id, elements));
	};
	this.stringifyHTML = function() {
		// start tag
		var htmlString = '<thead ';
		// add attributes
		for(var attribute in this.attributes) {
			htmlString += attribute + '="' + this.attributes[attribute] + '" ';
		}
		//close tag
		htmlString += '>\n';
		for(var i=0; i < this.rows.length; i++) {
			htmlString += this.rows[i].stringifyHTML();
		}
		// recurse through childern
		
		// end tag
		htmlString += '</thead>\n';
		// return string
		return htmlString;
	};
}

Thead.prototype = new DomElement();
Thead.prototype.constructor = Thead;


function Tbody(id, style) {
	this.base = DomElement;
	this.rows = [];
	this.base(this.rows);

	this.attributes.id = id || '';
	this.attributes.class = style || '';

	this.addRow = function(id, elements) {
		if(elements instanceof Tr) {
			this.rows.push(elements);
		}
		else {
			this.rows.push(new Tr(id, elements));
		}
		
	};
	this.applyColumnStyle = function(col,style) {
		for(var i = 0; i < this.rows.length; i++) {
			this.rows[i].cells[col].attributes.class = style;
		}
	};
	this.stringifyHTML = function() {
		// start tag
		var htmlString = '<tbody ';
		// add attributes
		for(var attribute in this.attributes) {
			htmlString += attribute + '="' + this.attributes[attribute] + '" ';
		}
		//close tag
		htmlString += '>\n';
		for(var i=0; i < this.rows.length; i++) {
			htmlString += this.rows[i].stringifyHTML();
		}
		// recurse through childern
		
		// end tag
		htmlString += '</tbody>\n';
		// return string
		return htmlString;
	};
}
Tbody.prototype = new DomElement();
Tbody.prototype.constructor = Tbody;

function Tfoot(id, style) {
	this.base = DomElement;
	this.rows = [];
	this.base(this.rows);

	this.attributes.id = id || '';
	this.attributes.class = style || '';

	this.addRow = function(id, elements) {
		this.rows.push(new Tr(id, elements));
	};
	this.stringifyHTML = function() {
		// start tag
		var htmlString = '<tfoot ';
		// add attributes
		for(var attribute in this.attributes) {
			htmlString += attribute + '="' + this.attributes[attribute] + '" ';
		}
		//close tag
		htmlString += '>\n';
		for(var i=0; i < this.rows.length; i++) {
			htmlString += this.rows[i].stringifyHTML();
		}
		// recurse through childern
		
		// end tag
		htmlString += '</tfoot>\n';
		// return string
		return htmlString;
	};
}

Tfoot.prototype = new DomElement();
Tfoot.prototype.constructor = Tfoot;

function Tr(id, elements) {
	// if id is an array then it is really the elements variable and should be moved
	this.base = DomElement;
	this.cells = [];
	this.base(this.cells);

	this.addCell = function(id,style) {
		this.cells.push(new Td(id,style));
	};
	
	if(id instanceof Array) {
		this.attributes.id = '';
		elements = id;
	}
	else {
		this.attributes.id = id || '';
	}
	if(elements instanceof Array) {
		for(var i=0; i < elements.length; i++) {
			this.addCell();
			if(elements[i] instanceof DomElement) {
				this.cells[i].appendChild(elements[i]);
			}
			else {
				this.cells[i].appendChild(new TextNode(elements[i]));
			}
		}
	}
	
	

	this.stringifyHTML = function() {
		// start tag
		var htmlString = '<tr ';
		// add attributes
		for(var attribute in this.attributes) {
			htmlString += attribute + '="' + this.attributes[attribute] + '" ';
		}
		//close tag
		htmlString += '>\n';
		for(var i=0; i < this.cells.length; i++) {
			htmlString += this.cells[i].stringifyHTML();
		}
		// recurse through childern
		
		// end tag
		htmlString += '</tr>\n';
		// return string
		return htmlString;
	};
}

Tr.prototype = new DomElement();
Tr.prototype.constructor = Tr;

function Thr(id, elements) {
	// if id is an array then it is really the elements variable and should be moved
	this.base = DomElement;
	this.cells = [];
	this.base(this.cells);

	if(id instanceof Array) {
		this.attributes.id = '';
		elements = id;
	}
	else {
		this.attributes.id = id || '';
	}
	this.addCell = function(id,style) {
		this.cells.push(new Th(id,style));
	};
	if(elements instanceof Array) {
		for(var i=0; i < elements.length; i++) {
			this.addCell();
			if(elements[i] instanceof DomElement) {
				this.cells[i].appendChild(elements[i]);
			}
			else {
				this.cells[i].appendChild(new TextNode(elements[i]));
			}
		}
	}
	this.stringifyHTML = function() {
		// start tag
		var htmlString = '<tr ';
		// add attributes
		for(var attribute in this.attributes) {
			htmlString += attribute + '="' + this.attributes[attribute] + '" ';
		}
		//close tag
		htmlString += '>\n';
		for(var i=0; i < this.cells.length; i++) {
			htmlString += this.cells[i].stringifyHTML();
		}
		// recurse through childern
		
		// end tag
		htmlString += '</tr>\n';
		// return string
		return htmlString;
	};
}

Thr.prototype = new DomElement();
Thr.prototype.constructor = Thr;

function Td(id, style) {
	this.base = DomElement;
	this.childern = [];
	this.base(this.childern);

	this.attributes.id = id || '';
	this.attributes.class = style || '';
	this.appendChild = function(child) {
		if(child.stringifyHTML) {
			this.childern.push(child);
		}
		else {
			throw(new Error('[TD] - Failed to append non element:' + child));
		}
	};
	this.stringifyHTML = function() {
		// start tag
		var htmlString = '<td ';
		// add attributes
		for(var attribute in this.attributes) {
			htmlString += attribute + '="' + this.attributes[attribute] + '" ';
		}
		//close tag
		htmlString += '>\n';
		for(var i=0; i < this.childern.length; i++) {
			htmlString += this.childern[i].stringifyHTML();
		}
		// recurse through childern
		
		// end tag
		htmlString += '</td>\n';
		// return string
		return htmlString;
	};
}

Td.prototype = new DomElement();
Td.prototype.constructor = Td;

function Th(id, style) {
	this.base = DomElement;
	this.childern = [];
	this.base(this.childern);

	this.attributes.id = id || '';
	this.attributes.class = style || '';
	this.appendChild = function(child) {
		if(child.stringifyHTML) {
			this.childern.push(child);
		}
		else {
			throw(new Error('[TH] - Failed to append non element:' + child));
		}
	};
	this.stringifyHTML = function() {
		// start tag
		var htmlString = '<th ';
		// add attributes
		for(var attribute in this.attributes) {
			htmlString += attribute + '="' + this.attributes[attribute] + '" ';
		}
		//close tag
		htmlString += '>\n';
		for(var i=0; i < this.childern.length; i++) {
			htmlString += this.childern[i].stringifyHTML();
		}
		// recurse through childern
		
		// end tag
		htmlString += '</th>\n';
		// return string
		return htmlString;
	};
}

Th.prototype = new DomElement();
Th.prototype.constructor = Th;

function Element(tag) {
    this.tag = tag;
    this.base = DomElement;
	this.childern = [];
	this.base(this.childern);

    this.appendChild = function(child) {
        if(child.deserialize) {
            this.childern.push(child);
        }
        else {
            throw(new Error('[ELEMENT] - Failed to append non element:' + child));
        }
    };
    this.deserialize = function () {
        // start tag
        var htmlString = '<' + this.tag;
        // add attributes
        for(var attribute in this.attributes) {
            htmlString += ' ' + attribute + '="' + this.attributes[attribute] + '"';
        }
        //close tag
        htmlString += '>\n';
        for(var i=0; i < this.childern.length; i++) {
            htmlString += this.childern[i].deserialize();
        }
        // recurse through childern

        // end tag
        htmlString += '</' + this.tag + '>\n';
        // return string
        return htmlString;
    };
}
Element.prototype = new DomElement();
Element.prototype.constructor = Element;




/*-------------------------Special Purpose Elements ---------------------------------*/


function MonthSelect(name,id,cssClass) {
	this.base = Select;
	this.base(name,id,cssClass);

	this.addOption('', 'Month');
	this.addOption('0','January');
	this.addOption(1,'February');
	this.addOption(2,'March');
	this.addOption(3,'April');
	this.addOption(4,'May');
	this.addOption(5,'June');
	this.addOption(6,'July');
	this.addOption(7,'August');
	this.addOption(8,'September');
	this.addOption(9,'October');
	this.addOption(10,'November');
	this.addOption(11,'December');


}
MonthSelect.prototype = new Select();

function DaySelect(name,id,cssClass) {
	this.base = Select;
	this.base(name,id,cssClass);

	this.addOption('','Day');
	for(var i = 1; i <= 31; i++) {
		this.addOption(i,i);
	}
}

function YearSelect(start,finish,name,id,cssClass) {
	this.base = Select;
	this.base(name,id,cssClass);

	this.addOption('', 'Year');

	if(start < finish) {
		for(var i = finish; i > start; i--) {
			this.addOption(i,i);
		}
	}
	else{
		for(var i = finish; i < start; i++) {
			this.addOption(i,i);
		}
	}
}


function DayOfWeekSelect(name,id,cssClass) {
	this.base = Select;
	this.base(name,id,cssClass);
	this.addOption('', 'Day of Week');
	this.addOption('0','Sundays');
	this.addOption('1', 'Mondays');
	this.addOption('2', 'Tuesdays');
	this.addOption('3', 'Wednesdays');
	this.addOption('4', 'Thursdays');
	this.addOption('5', 'Fridays');
	this.addOption('6', 'Saturdays');
}

function StateSelect(name,id,cssClass) {
	this.base = Select;
	this.base(name,id,cssClass);
	this.addOption('', 'Select State');
	this.addOption('AL', 'Alabama');
    this.addOption('AK', 'Alaska');
    this.addOption('AZ', 'Arizona');
    this.addOption('AR', 'Arkansas');
    this.addOption('CA', 'California');
    this.addOption('CO', 'Colorado');
    this.addOption('CT', 'Connecticut');
    this.addOption('DE', 'Delaware');
    this.addOption('DC', 'District of Columbia');
    this.addOption('FL', 'Florida');
    this.addOption('GA', 'Georgia');
    this.addOption('HI', 'Hawaii');
    this.addOption('ID', 'Idaho');
    this.addOption('IL', 'Illinois');
    this.addOption('IN', 'Indiana');
    this.addOption('IA', 'Iowa');
    this.addOption('KS', 'Kansas');
    this.addOption('KY', 'Kentucky');
    this.addOption('LA', 'Louisiana');
    this.addOption('ME', 'Maine');
    this.addOption('MD', 'Maryland');
    this.addOption('MA', 'Massachusetts');
    this.addOption('MI', 'Michigan');
    this.addOption('MN', 'Minnesota');
    this.addOption('MS', 'Mississippi');
    this.addOption('MO', 'Missouri');
    this.addOption('MT', 'Montana');
    this.addOption('NE', 'Nebraska');
    this.addOption('NV', 'Nevada');
    this.addOption('NH', 'New Hampshire');
    this.addOption('NJ', 'New Jersey');
    this.addOption('NM', 'New Mexico');
    this.addOption('NY', 'New York');
    this.addOption('NC', 'North Carolina');
    this.addOption('ND', 'North Dakota');
    this.addOption('OH', 'Ohio');
    this.addOption('OK', 'Oklahoma');
    this.addOption('OR', 'Oregon');
    this.addOption('PA', 'Pennsylvania');
    this.addOption('PR', 'Puerto Rico');
    this.addOption('RI', 'Rhode Island');
    this.addOption('SC', 'South Carolina');
    this.addOption('SD', 'South Dakota');
    this.addOption('TN', 'Tennessee');
    this.addOption('TX', 'Texas');
    this.addOption('UT', 'Utah');
    this.addOption('VT', ' Vermont');
    this.addOption('VA', 'Virginia');
    this.addOption('WA', 'Washington');
    this.addOption('WV', 'West Virginia');
    this.addOption('WI', 'Wisconsin');
    this.addOption('WY', 'Wyoming');

}


exports.doc = Doc;
exports.body = Body;
exports.div = Div;
exports.span = Span;
exports.p = P;
exports.h = H;
exports.a = A;
exports.li = Li;
exports.ul = Ul;
exports.ol = Ol;
exports.label = Label;
exports.select = Select;
exports.option = Option;
exports.input = Input;
exports.textarea = Textarea;
exports.img = Img;
exports.textNode = TextNode;
exports.form = Form;
exports.table = Table;
exports.element = Element;

//Caps version of Same
exports.Doc = Doc;
exports.Body = Body;
exports.Div = Div;
exports.Span = Span;
exports.P = P;
exports.H = H;
exports.A = A;
exports.Li = Li;
exports.Ul = Ul;
exports.Ol = Ol;
exports.Label = Label;
exports.Select = Select;
exports.Option = Option;
exports.Input = Input;
exports.Textarea = Textarea;
exports.Img = Img;
exports.TextNode = TextNode;
exports.Form = Form;
exports.Table = Table;
exports.Element = Element;

exports.monthSelect = MonthSelect;
exports.daySelect = DaySelect;
exports.yearSelect = YearSelect;
exports.monthSelect = MonthSelect;
exports.stateSelect = StateSelect;
exports.dayOfWeekSelect = DayOfWeekSelect;
