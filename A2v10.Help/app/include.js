/* Copyright © 2017-2019 Alex Kukhtin. All rights reserved.*/

(function () {

	function doNavigate(event) {
		event.preventDefault();
		let route = this.getAttribute('data-route');
		window.vm.$emit('navigate', route);
	}

	function tokenize(text, opts, callback) {
		let ch = '.', /* first while */
			pos = 0,
			len = text.length,
			delims = opts.delims,
			keywords = opts.keywords,
			numbers = /^[-+]?\d*\.?\d*([eE][-+]\d*)?$/,
			instr = opts.instr,
			token = '';

		const TAB_REPLACE = '  '; /* 2 spaces */
		let xml = opts && opts.lang === 'xml';

		function nextChar() {
			if (pos >= len)
				return null;
			let ch = text[pos];
			pos += 1;
			return ch;
		}

		const backChar = (ch) => { if (ch && (pos <= len)) pos--; };
		const normalizeTab = ch => ch === '\t' ? TAB_REPLACE : ch;
		const isDelimiter = ch => delims.indexOf(ch) !== -1;
		const isStartString = ch => ch === '"' || ch === '`' || ch === "'";
		const isWhiteSpace = ch => ch === ' ' || ch === '\t' || ch === "\r" || ch === '\n';
		const isDigit = ch => ch >= '0' && ch <= '9';

		function readString(arg, toktype) {
			token += arg;
			let sc = nextChar();
			while (sc && sc !== arg) {
				token += normalizeTab(sc);
				sc = nextChar();
			}
			token += arg;
			addToken(toktype || 'string');
		}

		function readMultiLineComment() {
			token = '/*';
			let nch = nextChar();
			while (nch) {
				if (nch === '*') {
					token += nch;
					let nnch = nextChar();
					if (nnch === '/') {
						token += nnch;
						return addToken('comment');
					}
					else {
						backChar(nnch);
					}
				} else {
					token += normalizeTab(nch);
				}
				nch = nextChar();
			}
		}

		function readSingleLineComment() {
			while (ch && ch !== '\n' && ch !== '\r') {
				token += ch;
				ch = nextChar();
			}
			addToken('comment');
			backChar(ch);
		}

		function readWhiteSpace(ch) {
			do {
				token += normalizeTab(ch);
				ch = nextChar();
			} while (ch && isWhiteSpace(ch));
			addToken('ws');
			backChar(ch);
		}

		function skipWhiteSpace(ch) {
			while (ch && isWhiteSpace(ch)) {
				token += normalizeTab(ch);
				ch = nextChar();
			}
			addToken('ws');
			return ch;
		}

		function nextChars(n) {
			let str = '';
			for (let i = 0; i < n; i++)
				str += nextChar();
			return str;
		}

		function readName(ch, toktype) {
			do {
				token += ch;
				ch = nextChar();
			} while (ch && !isWhiteSpace(ch) && !isDelimiter(ch));
			addToken(toktype || 'name');
			backChar(ch);
		}

		function addToken(type) {
			if (!token)
				return;
			if (type === 'name') {
				if (keywords && keywords.test(token)) {
					type = 'keyword';
				} else if (numbers && numbers.test(token)) {
					type = 'number';
				} else if (instr && instr.test(token)) {
					type = 'instr';
				}
			}
			callback(type, token);
			token = '';
		}

		function readXmlAttribute(ch) {
			let close = false;
			while (ch && ch !== '/' && ch !== '>') {
				ch = skipWhiteSpace(ch);
				readName(ch, 'attrname');
				ch = nextChar();
				ch = skipWhiteSpace(ch);
				if (ch === '=') {
					token = ch;
					addToken('delim');
					ch = nextChar();
				}
				ch = skipWhiteSpace(ch);
				if (ch === '"') {
					readString(ch, 'attrval');
					ch = nextChar();
					ch = skipWhiteSpace(ch);
				}
			}
			ch = skipWhiteSpace(ch);
			if (ch === '/') {
				ch = nextChar();
				if (ch === '>') {
					token = '/>';
					addToken('tag');
					close = true;
					return close;
				}
				else
					backChar(ch);
			} else if (ch === '>') {
				token = ch;
				addToken('tag');
				ch = nextChar();
				close = true;
			}
			ch = skipWhiteSpace(ch);
			backChar(ch);
			return close;
		}

		function readXmlElement(ch) {
			token += ch;
			while (ch) {
				ch = nextChar();
				if (ch === '>') {
					token += ch;
					addToken('tag');
					return;
				}
				if (ch === '.')
					token += ch;
				else if (ch === '/')
					token += ch;
				else if (isWhiteSpace(ch)) {
					addToken('tag');
					if (readXmlAttribute(ch)) {
						return;
					}
				} else {
					token += ch;
				}
			}
		}

		function readXmlComment(ch) {
			token = '<!--';
			while (ch) {
				if (ch === '-') {
					let savePos = pos;
					let tail = nextChars(2);
					if (tail === '->') {
						token += '-->';
						addToken('comment');
						return;
					} else {
						pos = savePos;
					}
				}
				token += normalizeTab(ch);
				ch = nextChar();
			}
			addToken('comment');
		}

		function readCData(ch) {
			token = '<![CDATA[';
			while (ch) {
				if (ch === ']') {
					let savePos = pos;
					let tail = nextChars(2);
					if (tail === ']>') {
						token += ']]>';
						addToken('cdata');
						return;
					} else {
						pos = savePos;
					}
				}
				token += normalizeTab(ch);
				ch = nextChar();
			}
			addToken('cdata');
		}

		while (ch) {
			ch = nextChar();
			if (!ch)
				break;
			else if (isWhiteSpace(ch))
				readWhiteSpace(ch);
			else if (isStartString(ch))
				readString(ch);
			else if (ch === '/') {
				let nch = nextChar();
				if (nch === '/') {
					token += '/';
					readSingleLineComment();
					continue;
				}
				else if (nch === '*') {
					readMultiLineComment();
					continue;
				}
				else {
					backChar(ch);
				}
				token = ch;
				addToken('delim');
			} else if (xml && ch === '<') {
				let savePos = pos;
				let nstr = nextChars(3);
				if (nstr === '!--') {
					readXmlComment(nextChar(ch));
					ch = nextChar();
					ch = skipWhiteSpace(ch);
				} else if (nstr === '![C') {
					let tail = nextChars(5);
					if (tail === 'DATA[') {
						readCData(nextChar(ch));
						ch = nextChar();
						ch = skipWhiteSpace(ch);
					}
				} else {
					pos = savePos;
				}
				readXmlElement(ch);
			}
			else if (isDelimiter(ch)) {
				token = ch;
				addToken('delim');
			} else {
				readName(ch);
			}
		}
	}

	function highlight(body) {

		/*console.dir(body);*/
		const jsDelims = ' ,()[]{}\\/*:=;,+-<>';
		const jsKeywords = /^(a(wait|sync|rguments)|b(reak)|c(onst|ase|atch|lass|ontinue)|do|de(lete|bugger|fault)|e(lse|val)|f(or|unction|alse|inally)|i(f|n)|n(ew|ull)|v(ar|oid)|let|switch|t(his|hrow|ry|ypeof|rue)|return|w(hile|ith)|yield)$/;
		const instr = /^(Array|Boolean|Date|Infinity|Error|Symbol|Function|String|RegExp|N(umber|aN)|Object|Math|is(Finite|PrototypeOf|NaN)|toString|undefined|valueOf|hasOwnProperty)$/;

		let jsOpts = {
			lang: 'js',
			delims: jsDelims,
			keywords: jsKeywords,
			instr: instr
		};

		const xmlOpts = {
			lang: 'xml',
			delims: '<>=',
			jsKeywords: null
		};

		let elems = document.getElementsByClassName('code-highlight');


		for (var tag of elems) {
			let lang = tag.getAttribute('data-lang');
			if (!lang) {
				if (tag.classList.contains('js'))
					lang = 'js';
				else if (tag.classList.contains('xml'))
					lang = 'xml';
			}
			let text = tag.textContent.trim();
			tag.innerHTML = '';
			/*console.dir(text);*/
			if (lang === 'js') {
				tokenize(text, jsOpts, function (type, text) {
					let textNode = document.createTextNode(text);
					if (type === 'ws' || type === 'delim' || type === 'name')
						tag.appendChild(textNode);
					else {
						let node = document.createElement('span');
						node.appendChild(textNode);
						node.classList.add(type);
						tag.appendChild(node);
					}
				});
			} else if (lang === 'xml') {
				tokenize(text, xmlOpts, function (type, text) {
					let textNode = document.createTextNode(text);
					if (type !== 'tag' && type !== 'attrname' && type !== 'attrval' && type !== 'comment' && type !== 'cdata')
						tag.appendChild(textNode);
					else {
						let node = document.createElement('span');
						node.appendChild(textNode);
						node.classList.add(type);
						tag.appendChild(node);
					}
				});
			} else {
				throw new Error('invalid lang:' + lang);
			}
		}
	}

	function setHrefs(body) {
		let a = body.querySelectorAll('a');
		a.forEach(function (an) {
			let href = an.getAttribute('href');
			if (href.startsWith('http')) return; /* external link */
			an.setAttribute('href', '');
			an.setAttribute('data-route', href);
			an.addEventListener('click', doNavigate);
		});
		let img = body.querySelectorAll('img');
		img.forEach(function (im) {
			let src = im.getAttribute('src');
			im.setAttribute('src', '/html/' + src);
		});
	}

	function loadHtml(url) {
		return new Promise(function (resolve, reject) {
			let xhr = new XMLHttpRequest();
			xhr.onload = function () {
				if (xhr.responseText.startsWith('<!DOCTYPE')) {
					let body = document.createElement("body");
					let elem = document.createElement("div");
					body.appendChild(elem);
					elem.innerText = 'Not found';
					resolve(body);
				}
				else {
					let prs = new DOMParser();
					let doc = prs.parseFromString(xhr.responseText, 'text/html');
					let body = doc.body;
					setHrefs(body);
					resolve(body);
				}
			};
			xhr.open('GET', url, true);
			xhr.send();
		});
	}

	Vue.component('a2-include', {
		template: '<div class="help-content-view"></div>',
		props: {
			source: String
		},
		watch: {
			source: function (newSource, oldSource) {
				this.navigateTo(newSource);
			}
		},
		methods: {
			navigateTo(url) {
				let me = this;
				if (url === '/')
					url += 'index';
				/*console.warn(url);*/
				loadHtml('/html' + url + '.html').then(function (elem) {
					me.$el.innerHTML = '';
					let div = document.createElement('div');
					let ch = elem.children;
					let cha = [];
					/* for..of does not not for HtmlCollection in EDGE */
					let esrc = elem.children;
					for (let i = 0; i < esrc.length; i++) {
						cha.push(esrc[i]);
					}
					for (ch of cha)
						me.$el.appendChild(ch);
					highlight(div);
				});
			}
		}
	});

})();