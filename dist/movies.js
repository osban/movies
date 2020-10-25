(function () {
	'use strict';

	function Vnode(tag, key, attrs, children, text, dom) {
		return {tag: tag, key: key, attrs: attrs, children: children, text: text, dom: dom, domSize: undefined, state: undefined, events: undefined, instance: undefined}
	}
	Vnode.normalize = function(node) {
		if (Array.isArray(node)) return Vnode("[", undefined, undefined, Vnode.normalizeChildren(node), undefined, undefined)
		if (node == null || typeof node === "boolean") return null
		if (typeof node === "object") return node
		return Vnode("#", undefined, undefined, String(node), undefined, undefined)
	};
	Vnode.normalizeChildren = function(input) {
		var children = [];
		if (input.length) {
			var isKeyed = input[0] != null && input[0].key != null;
			// Note: this is a *very* perf-sensitive check.
			// Fun fact: merging the loop like this is somehow faster than splitting
			// it, noticeably so.
			for (var i = 1; i < input.length; i++) {
				if ((input[i] != null && input[i].key != null) !== isKeyed) {
					throw new TypeError("Vnodes must either always have keys or never have keys!")
				}
			}
			for (var i = 0; i < input.length; i++) {
				children[i] = Vnode.normalize(input[i]);
			}
		}
		return children
	};

	var vnode = Vnode;

	// Call via `hyperscriptVnode.apply(startOffset, arguments)`
	//
	// The reason I do it this way, forwarding the arguments and passing the start
	// offset in `this`, is so I don't have to create a temporary array in a
	// performance-critical path.
	//
	// In native ES6, I'd instead add a final `...args` parameter to the
	// `hyperscript` and `fragment` factories and define this as
	// `hyperscriptVnode(...args)`, since modern engines do optimize that away. But
	// ES5 (what Mithril requires thanks to IE support) doesn't give me that luxury,
	// and engines aren't nearly intelligent enough to do either of these:
	//
	// 1. Elide the allocation for `[].slice.call(arguments, 1)` when it's passed to
	//    another function only to be indexed.
	// 2. Elide an `arguments` allocation when it's passed to any function other
	//    than `Function.prototype.apply` or `Reflect.apply`.
	//
	// In ES6, it'd probably look closer to this (I'd need to profile it, though):
	// module.exports = function(attrs, ...children) {
	//     if (attrs == null || typeof attrs === "object" && attrs.tag == null && !Array.isArray(attrs)) {
	//         if (children.length === 1 && Array.isArray(children[0])) children = children[0]
	//     } else {
	//         children = children.length === 0 && Array.isArray(attrs) ? attrs : [attrs, ...children]
	//         attrs = undefined
	//     }
	//
	//     if (attrs == null) attrs = {}
	//     return Vnode("", attrs.key, attrs, children)
	// }
	var hyperscriptVnode = function() {
		var attrs = arguments[this], start = this + 1, children;

		if (attrs == null) {
			attrs = {};
		} else if (typeof attrs !== "object" || attrs.tag != null || Array.isArray(attrs)) {
			attrs = {};
			start = this;
		}

		if (arguments.length === start + 1) {
			children = arguments[start];
			if (!Array.isArray(children)) children = [children];
		} else {
			children = [];
			while (start < arguments.length) children.push(arguments[start++]);
		}

		return vnode("", attrs.key, attrs, children)
	};

	var selectorParser = /(?:(^|#|\.)([^#\.\[\]]+))|(\[(.+?)(?:\s*=\s*("|'|)((?:\\["'\]]|.)*?)\5)?\])/g;
	var selectorCache = {};
	var hasOwn = {}.hasOwnProperty;

	function isEmpty(object) {
		for (var key in object) if (hasOwn.call(object, key)) return false
		return true
	}

	function compileSelector(selector) {
		var match, tag = "div", classes = [], attrs = {};
		while (match = selectorParser.exec(selector)) {
			var type = match[1], value = match[2];
			if (type === "" && value !== "") tag = value;
			else if (type === "#") attrs.id = value;
			else if (type === ".") classes.push(value);
			else if (match[3][0] === "[") {
				var attrValue = match[6];
				if (attrValue) attrValue = attrValue.replace(/\\(["'])/g, "$1").replace(/\\\\/g, "\\");
				if (match[4] === "class") classes.push(attrValue);
				else attrs[match[4]] = attrValue === "" ? attrValue : attrValue || true;
			}
		}
		if (classes.length > 0) attrs.className = classes.join(" ");
		return selectorCache[selector] = {tag: tag, attrs: attrs}
	}

	function execSelector(state, vnode$1) {
		var attrs = vnode$1.attrs;
		var children = vnode.normalizeChildren(vnode$1.children);
		var hasClass = hasOwn.call(attrs, "class");
		var className = hasClass ? attrs.class : attrs.className;

		vnode$1.tag = state.tag;
		vnode$1.attrs = null;
		vnode$1.children = undefined;

		if (!isEmpty(state.attrs) && !isEmpty(attrs)) {
			var newAttrs = {};

			for (var key in attrs) {
				if (hasOwn.call(attrs, key)) newAttrs[key] = attrs[key];
			}

			attrs = newAttrs;
		}

		for (var key in state.attrs) {
			if (hasOwn.call(state.attrs, key) && key !== "className" && !hasOwn.call(attrs, key)){
				attrs[key] = state.attrs[key];
			}
		}
		if (className != null || state.attrs.className != null) attrs.className =
			className != null
				? state.attrs.className != null
					? String(state.attrs.className) + " " + String(className)
					: className
				: state.attrs.className != null
					? state.attrs.className
					: null;

		if (hasClass) attrs.class = null;

		for (var key in attrs) {
			if (hasOwn.call(attrs, key) && key !== "key") {
				vnode$1.attrs = attrs;
				break
			}
		}

		if (Array.isArray(children) && children.length === 1 && children[0] != null && children[0].tag === "#") {
			vnode$1.text = children[0].children;
		} else {
			vnode$1.children = children;
		}

		return vnode$1
	}

	function hyperscript(selector) {
		if (selector == null || typeof selector !== "string" && typeof selector !== "function" && typeof selector.view !== "function") {
			throw Error("The selector must be either a string or a component.");
		}

		var vnode$1 = hyperscriptVnode.apply(1, arguments);

		if (typeof selector === "string") {
			vnode$1.children = vnode.normalizeChildren(vnode$1.children);
			if (selector !== "[") return execSelector(selectorCache[selector] || compileSelector(selector), vnode$1)
		}

		vnode$1.tag = selector;
		return vnode$1
	}

	var hyperscript_1 = hyperscript;

	var trust = function(html) {
		if (html == null) html = "";
		return vnode("<", undefined, undefined, html, undefined, undefined)
	};

	var fragment = function() {
		var vnode$1 = hyperscriptVnode.apply(0, arguments);

		vnode$1.tag = "[";
		vnode$1.children = vnode.normalizeChildren(vnode$1.children);
		return vnode$1
	};

	hyperscript_1.trust = trust;
	hyperscript_1.fragment = fragment;

	var hyperscript_1$1 = hyperscript_1;

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function createCommonjsModule(fn, basedir, module) {
		return module = {
			path: basedir,
			exports: {},
			require: function (path, base) {
				return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
			}
		}, fn(module, module.exports), module.exports;
	}

	function commonjsRequire () {
		throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
	}

	/** @constructor */
	var PromisePolyfill = function(executor) {
		if (!(this instanceof PromisePolyfill)) throw new Error("Promise must be called with `new`")
		if (typeof executor !== "function") throw new TypeError("executor must be a function")

		var self = this, resolvers = [], rejectors = [], resolveCurrent = handler(resolvers, true), rejectCurrent = handler(rejectors, false);
		var instance = self._instance = {resolvers: resolvers, rejectors: rejectors};
		var callAsync = typeof setImmediate === "function" ? setImmediate : setTimeout;
		function handler(list, shouldAbsorb) {
			return function execute(value) {
				var then;
				try {
					if (shouldAbsorb && value != null && (typeof value === "object" || typeof value === "function") && typeof (then = value.then) === "function") {
						if (value === self) throw new TypeError("Promise can't be resolved w/ itself")
						executeOnce(then.bind(value));
					}
					else {
						callAsync(function() {
							if (!shouldAbsorb && list.length === 0) console.error("Possible unhandled promise rejection:", value);
							for (var i = 0; i < list.length; i++) list[i](value);
							resolvers.length = 0, rejectors.length = 0;
							instance.state = shouldAbsorb;
							instance.retry = function() {execute(value);};
						});
					}
				}
				catch (e) {
					rejectCurrent(e);
				}
			}
		}
		function executeOnce(then) {
			var runs = 0;
			function run(fn) {
				return function(value) {
					if (runs++ > 0) return
					fn(value);
				}
			}
			var onerror = run(rejectCurrent);
			try {then(run(resolveCurrent), onerror);} catch (e) {onerror(e);}
		}

		executeOnce(executor);
	};
	PromisePolyfill.prototype.then = function(onFulfilled, onRejection) {
		var self = this, instance = self._instance;
		function handle(callback, list, next, state) {
			list.push(function(value) {
				if (typeof callback !== "function") next(value);
				else try {resolveNext(callback(value));} catch (e) {if (rejectNext) rejectNext(e);}
			});
			if (typeof instance.retry === "function" && state === instance.state) instance.retry();
		}
		var resolveNext, rejectNext;
		var promise = new PromisePolyfill(function(resolve, reject) {resolveNext = resolve, rejectNext = reject;});
		handle(onFulfilled, instance.resolvers, resolveNext, true), handle(onRejection, instance.rejectors, rejectNext, false);
		return promise
	};
	PromisePolyfill.prototype.catch = function(onRejection) {
		return this.then(null, onRejection)
	};
	PromisePolyfill.prototype.finally = function(callback) {
		return this.then(
			function(value) {
				return PromisePolyfill.resolve(callback()).then(function() {
					return value
				})
			},
			function(reason) {
				return PromisePolyfill.resolve(callback()).then(function() {
					return PromisePolyfill.reject(reason);
				})
			}
		)
	};
	PromisePolyfill.resolve = function(value) {
		if (value instanceof PromisePolyfill) return value
		return new PromisePolyfill(function(resolve) {resolve(value);})
	};
	PromisePolyfill.reject = function(value) {
		return new PromisePolyfill(function(resolve, reject) {reject(value);})
	};
	PromisePolyfill.all = function(list) {
		return new PromisePolyfill(function(resolve, reject) {
			var total = list.length, count = 0, values = [];
			if (list.length === 0) resolve([]);
			else for (var i = 0; i < list.length; i++) {
				(function(i) {
					function consume(value) {
						count++;
						values[i] = value;
						if (count === total) resolve(values);
					}
					if (list[i] != null && (typeof list[i] === "object" || typeof list[i] === "function") && typeof list[i].then === "function") {
						list[i].then(consume, reject);
					}
					else consume(list[i]);
				})(i);
			}
		})
	};
	PromisePolyfill.race = function(list) {
		return new PromisePolyfill(function(resolve, reject) {
			for (var i = 0; i < list.length; i++) {
				list[i].then(resolve, reject);
			}
		})
	};

	var polyfill = PromisePolyfill;

	var promise = createCommonjsModule(function (module) {



	if (typeof window !== "undefined") {
		if (typeof window.Promise === "undefined") {
			window.Promise = polyfill;
		} else if (!window.Promise.prototype.finally) {
			window.Promise.prototype.finally = polyfill.prototype.finally;
		}
		module.exports = window.Promise;
	} else if (typeof commonjsGlobal !== "undefined") {
		if (typeof commonjsGlobal.Promise === "undefined") {
			commonjsGlobal.Promise = polyfill;
		} else if (!commonjsGlobal.Promise.prototype.finally) {
			commonjsGlobal.Promise.prototype.finally = polyfill.prototype.finally;
		}
		module.exports = commonjsGlobal.Promise;
	} else {
		module.exports = polyfill;
	}
	});

	var render = function($window) {
		var $doc = $window && $window.document;
		var currentRedraw;

		var nameSpace = {
			svg: "http://www.w3.org/2000/svg",
			math: "http://www.w3.org/1998/Math/MathML"
		};

		function getNameSpace(vnode) {
			return vnode.attrs && vnode.attrs.xmlns || nameSpace[vnode.tag]
		}

		//sanity check to discourage people from doing `vnode.state = ...`
		function checkState(vnode, original) {
			if (vnode.state !== original) throw new Error("`vnode.state` must not be modified")
		}

		//Note: the hook is passed as the `this` argument to allow proxying the
		//arguments without requiring a full array allocation to do so. It also
		//takes advantage of the fact the current `vnode` is the first argument in
		//all lifecycle methods.
		function callHook(vnode) {
			var original = vnode.state;
			try {
				return this.apply(original, arguments)
			} finally {
				checkState(vnode, original);
			}
		}

		// IE11 (at least) throws an UnspecifiedError when accessing document.activeElement when
		// inside an iframe. Catch and swallow this error, and heavy-handidly return null.
		function activeElement() {
			try {
				return $doc.activeElement
			} catch (e) {
				return null
			}
		}
		//create
		function createNodes(parent, vnodes, start, end, hooks, nextSibling, ns) {
			for (var i = start; i < end; i++) {
				var vnode = vnodes[i];
				if (vnode != null) {
					createNode(parent, vnode, hooks, ns, nextSibling);
				}
			}
		}
		function createNode(parent, vnode, hooks, ns, nextSibling) {
			var tag = vnode.tag;
			if (typeof tag === "string") {
				vnode.state = {};
				if (vnode.attrs != null) initLifecycle(vnode.attrs, vnode, hooks);
				switch (tag) {
					case "#": createText(parent, vnode, nextSibling); break
					case "<": createHTML(parent, vnode, ns, nextSibling); break
					case "[": createFragment(parent, vnode, hooks, ns, nextSibling); break
					default: createElement(parent, vnode, hooks, ns, nextSibling);
				}
			}
			else createComponent(parent, vnode, hooks, ns, nextSibling);
		}
		function createText(parent, vnode, nextSibling) {
			vnode.dom = $doc.createTextNode(vnode.children);
			insertNode(parent, vnode.dom, nextSibling);
		}
		var possibleParents = {caption: "table", thead: "table", tbody: "table", tfoot: "table", tr: "tbody", th: "tr", td: "tr", colgroup: "table", col: "colgroup"};
		function createHTML(parent, vnode, ns, nextSibling) {
			var match = vnode.children.match(/^\s*?<(\w+)/im) || [];
			// not using the proper parent makes the child element(s) vanish.
			//     var div = document.createElement("div")
			//     div.innerHTML = "<td>i</td><td>j</td>"
			//     console.log(div.innerHTML)
			// --> "ij", no <td> in sight.
			var temp = $doc.createElement(possibleParents[match[1]] || "div");
			if (ns === "http://www.w3.org/2000/svg") {
				temp.innerHTML = "<svg xmlns=\"http://www.w3.org/2000/svg\">" + vnode.children + "</svg>";
				temp = temp.firstChild;
			} else {
				temp.innerHTML = vnode.children;
			}
			vnode.dom = temp.firstChild;
			vnode.domSize = temp.childNodes.length;
			// Capture nodes to remove, so we don't confuse them.
			vnode.instance = [];
			var fragment = $doc.createDocumentFragment();
			var child;
			while (child = temp.firstChild) {
				vnode.instance.push(child);
				fragment.appendChild(child);
			}
			insertNode(parent, fragment, nextSibling);
		}
		function createFragment(parent, vnode, hooks, ns, nextSibling) {
			var fragment = $doc.createDocumentFragment();
			if (vnode.children != null) {
				var children = vnode.children;
				createNodes(fragment, children, 0, children.length, hooks, null, ns);
			}
			vnode.dom = fragment.firstChild;
			vnode.domSize = fragment.childNodes.length;
			insertNode(parent, fragment, nextSibling);
		}
		function createElement(parent, vnode$1, hooks, ns, nextSibling) {
			var tag = vnode$1.tag;
			var attrs = vnode$1.attrs;
			var is = attrs && attrs.is;

			ns = getNameSpace(vnode$1) || ns;

			var element = ns ?
				is ? $doc.createElementNS(ns, tag, {is: is}) : $doc.createElementNS(ns, tag) :
				is ? $doc.createElement(tag, {is: is}) : $doc.createElement(tag);
			vnode$1.dom = element;

			if (attrs != null) {
				setAttrs(vnode$1, attrs, ns);
			}

			insertNode(parent, element, nextSibling);

			if (!maybeSetContentEditable(vnode$1)) {
				if (vnode$1.text != null) {
					if (vnode$1.text !== "") element.textContent = vnode$1.text;
					else vnode$1.children = [vnode("#", undefined, undefined, vnode$1.text, undefined, undefined)];
				}
				if (vnode$1.children != null) {
					var children = vnode$1.children;
					createNodes(element, children, 0, children.length, hooks, null, ns);
					if (vnode$1.tag === "select" && attrs != null) setLateSelectAttrs(vnode$1, attrs);
				}
			}
		}
		function initComponent(vnode$1, hooks) {
			var sentinel;
			if (typeof vnode$1.tag.view === "function") {
				vnode$1.state = Object.create(vnode$1.tag);
				sentinel = vnode$1.state.view;
				if (sentinel.$$reentrantLock$$ != null) return
				sentinel.$$reentrantLock$$ = true;
			} else {
				vnode$1.state = void 0;
				sentinel = vnode$1.tag;
				if (sentinel.$$reentrantLock$$ != null) return
				sentinel.$$reentrantLock$$ = true;
				vnode$1.state = (vnode$1.tag.prototype != null && typeof vnode$1.tag.prototype.view === "function") ? new vnode$1.tag(vnode$1) : vnode$1.tag(vnode$1);
			}
			initLifecycle(vnode$1.state, vnode$1, hooks);
			if (vnode$1.attrs != null) initLifecycle(vnode$1.attrs, vnode$1, hooks);
			vnode$1.instance = vnode.normalize(callHook.call(vnode$1.state.view, vnode$1));
			if (vnode$1.instance === vnode$1) throw Error("A view cannot return the vnode it received as argument")
			sentinel.$$reentrantLock$$ = null;
		}
		function createComponent(parent, vnode, hooks, ns, nextSibling) {
			initComponent(vnode, hooks);
			if (vnode.instance != null) {
				createNode(parent, vnode.instance, hooks, ns, nextSibling);
				vnode.dom = vnode.instance.dom;
				vnode.domSize = vnode.dom != null ? vnode.instance.domSize : 0;
			}
			else {
				vnode.domSize = 0;
			}
		}

		//update
		/**
		 * @param {Element|Fragment} parent - the parent element
		 * @param {Vnode[] | null} old - the list of vnodes of the last `render()` call for
		 *                               this part of the tree
		 * @param {Vnode[] | null} vnodes - as above, but for the current `render()` call.
		 * @param {Function[]} hooks - an accumulator of post-render hooks (oncreate/onupdate)
		 * @param {Element | null} nextSibling - the next DOM node if we're dealing with a
		 *                                       fragment that is not the last item in its
		 *                                       parent
		 * @param {'svg' | 'math' | String | null} ns) - the current XML namespace, if any
		 * @returns void
		 */
		// This function diffs and patches lists of vnodes, both keyed and unkeyed.
		//
		// We will:
		//
		// 1. describe its general structure
		// 2. focus on the diff algorithm optimizations
		// 3. discuss DOM node operations.

		// ## Overview:
		//
		// The updateNodes() function:
		// - deals with trivial cases
		// - determines whether the lists are keyed or unkeyed based on the first non-null node
		//   of each list.
		// - diffs them and patches the DOM if needed (that's the brunt of the code)
		// - manages the leftovers: after diffing, are there:
		//   - old nodes left to remove?
		// 	 - new nodes to insert?
		// 	 deal with them!
		//
		// The lists are only iterated over once, with an exception for the nodes in `old` that
		// are visited in the fourth part of the diff and in the `removeNodes` loop.

		// ## Diffing
		//
		// Reading https://github.com/localvoid/ivi/blob/ddc09d06abaef45248e6133f7040d00d3c6be853/packages/ivi/src/vdom/implementation.ts#L617-L837
		// may be good for context on longest increasing subsequence-based logic for moving nodes.
		//
		// In order to diff keyed lists, one has to
		//
		// 1) match nodes in both lists, per key, and update them accordingly
		// 2) create the nodes present in the new list, but absent in the old one
		// 3) remove the nodes present in the old list, but absent in the new one
		// 4) figure out what nodes in 1) to move in order to minimize the DOM operations.
		//
		// To achieve 1) one can create a dictionary of keys => index (for the old list), then iterate
		// over the new list and for each new vnode, find the corresponding vnode in the old list using
		// the map.
		// 2) is achieved in the same step: if a new node has no corresponding entry in the map, it is new
		// and must be created.
		// For the removals, we actually remove the nodes that have been updated from the old list.
		// The nodes that remain in that list after 1) and 2) have been performed can be safely removed.
		// The fourth step is a bit more complex and relies on the longest increasing subsequence (LIS)
		// algorithm.
		//
		// the longest increasing subsequence is the list of nodes that can remain in place. Imagine going
		// from `1,2,3,4,5` to `4,5,1,2,3` where the numbers are not necessarily the keys, but the indices
		// corresponding to the keyed nodes in the old list (keyed nodes `e,d,c,b,a` => `b,a,e,d,c` would
		//  match the above lists, for example).
		//
		// In there are two increasing subsequences: `4,5` and `1,2,3`, the latter being the longest. We
		// can update those nodes without moving them, and only call `insertNode` on `4` and `5`.
		//
		// @localvoid adapted the algo to also support node deletions and insertions (the `lis` is actually
		// the longest increasing subsequence *of old nodes still present in the new list*).
		//
		// It is a general algorithm that is fireproof in all circumstances, but it requires the allocation
		// and the construction of a `key => oldIndex` map, and three arrays (one with `newIndex => oldIndex`,
		// the `LIS` and a temporary one to create the LIS).
		//
		// So we cheat where we can: if the tails of the lists are identical, they are guaranteed to be part of
		// the LIS and can be updated without moving them.
		//
		// If two nodes are swapped, they are guaranteed not to be part of the LIS, and must be moved (with
		// the exception of the last node if the list is fully reversed).
		//
		// ## Finding the next sibling.
		//
		// `updateNode()` and `createNode()` expect a nextSibling parameter to perform DOM operations.
		// When the list is being traversed top-down, at any index, the DOM nodes up to the previous
		// vnode reflect the content of the new list, whereas the rest of the DOM nodes reflect the old
		// list. The next sibling must be looked for in the old list using `getNextSibling(... oldStart + 1 ...)`.
		//
		// In the other scenarios (swaps, upwards traversal, map-based diff),
		// the new vnodes list is traversed upwards. The DOM nodes at the bottom of the list reflect the
		// bottom part of the new vnodes list, and we can use the `v.dom`  value of the previous node
		// as the next sibling (cached in the `nextSibling` variable).


		// ## DOM node moves
		//
		// In most scenarios `updateNode()` and `createNode()` perform the DOM operations. However,
		// this is not the case if the node moved (second and fourth part of the diff algo). We move
		// the old DOM nodes before updateNode runs because it enables us to use the cached `nextSibling`
		// variable rather than fetching it using `getNextSibling()`.
		//
		// The fourth part of the diff currently inserts nodes unconditionally, leading to issues
		// like #1791 and #1999. We need to be smarter about those situations where adjascent old
		// nodes remain together in the new list in a way that isn't covered by parts one and
		// three of the diff algo.

		function updateNodes(parent, old, vnodes, hooks, nextSibling, ns) {
			if (old === vnodes || old == null && vnodes == null) return
			else if (old == null || old.length === 0) createNodes(parent, vnodes, 0, vnodes.length, hooks, nextSibling, ns);
			else if (vnodes == null || vnodes.length === 0) removeNodes(parent, old, 0, old.length);
			else {
				var isOldKeyed = old[0] != null && old[0].key != null;
				var isKeyed = vnodes[0] != null && vnodes[0].key != null;
				var start = 0, oldStart = 0;
				if (!isOldKeyed) while (oldStart < old.length && old[oldStart] == null) oldStart++;
				if (!isKeyed) while (start < vnodes.length && vnodes[start] == null) start++;
				if (isKeyed === null && isOldKeyed == null) return // both lists are full of nulls
				if (isOldKeyed !== isKeyed) {
					removeNodes(parent, old, oldStart, old.length);
					createNodes(parent, vnodes, start, vnodes.length, hooks, nextSibling, ns);
				} else if (!isKeyed) {
					// Don't index past the end of either list (causes deopts).
					var commonLength = old.length < vnodes.length ? old.length : vnodes.length;
					// Rewind if necessary to the first non-null index on either side.
					// We could alternatively either explicitly create or remove nodes when `start !== oldStart`
					// but that would be optimizing for sparse lists which are more rare than dense ones.
					start = start < oldStart ? start : oldStart;
					for (; start < commonLength; start++) {
						o = old[start];
						v = vnodes[start];
						if (o === v || o == null && v == null) continue
						else if (o == null) createNode(parent, v, hooks, ns, getNextSibling(old, start + 1, nextSibling));
						else if (v == null) removeNode(parent, o);
						else updateNode(parent, o, v, hooks, getNextSibling(old, start + 1, nextSibling), ns);
					}
					if (old.length > commonLength) removeNodes(parent, old, start, old.length);
					if (vnodes.length > commonLength) createNodes(parent, vnodes, start, vnodes.length, hooks, nextSibling, ns);
				} else {
					// keyed diff
					var oldEnd = old.length - 1, end = vnodes.length - 1, map, o, v, oe, ve, topSibling;

					// bottom-up
					while (oldEnd >= oldStart && end >= start) {
						oe = old[oldEnd];
						ve = vnodes[end];
						if (oe.key !== ve.key) break
						if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns);
						if (ve.dom != null) nextSibling = ve.dom;
						oldEnd--, end--;
					}
					// top-down
					while (oldEnd >= oldStart && end >= start) {
						o = old[oldStart];
						v = vnodes[start];
						if (o.key !== v.key) break
						oldStart++, start++;
						if (o !== v) updateNode(parent, o, v, hooks, getNextSibling(old, oldStart, nextSibling), ns);
					}
					// swaps and list reversals
					while (oldEnd >= oldStart && end >= start) {
						if (start === end) break
						if (o.key !== ve.key || oe.key !== v.key) break
						topSibling = getNextSibling(old, oldStart, nextSibling);
						moveNodes(parent, oe, topSibling);
						if (oe !== v) updateNode(parent, oe, v, hooks, topSibling, ns);
						if (++start <= --end) moveNodes(parent, o, nextSibling);
						if (o !== ve) updateNode(parent, o, ve, hooks, nextSibling, ns);
						if (ve.dom != null) nextSibling = ve.dom;
						oldStart++; oldEnd--;
						oe = old[oldEnd];
						ve = vnodes[end];
						o = old[oldStart];
						v = vnodes[start];
					}
					// bottom up once again
					while (oldEnd >= oldStart && end >= start) {
						if (oe.key !== ve.key) break
						if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns);
						if (ve.dom != null) nextSibling = ve.dom;
						oldEnd--, end--;
						oe = old[oldEnd];
						ve = vnodes[end];
					}
					if (start > end) removeNodes(parent, old, oldStart, oldEnd + 1);
					else if (oldStart > oldEnd) createNodes(parent, vnodes, start, end + 1, hooks, nextSibling, ns);
					else {
						// inspired by ivi https://github.com/ivijs/ivi/ by Boris Kaul
						var originalNextSibling = nextSibling, vnodesLength = end - start + 1, oldIndices = new Array(vnodesLength), li=0, i=0, pos = 2147483647, matched = 0, map, lisIndices;
						for (i = 0; i < vnodesLength; i++) oldIndices[i] = -1;
						for (i = end; i >= start; i--) {
							if (map == null) map = getKeyMap(old, oldStart, oldEnd + 1);
							ve = vnodes[i];
							var oldIndex = map[ve.key];
							if (oldIndex != null) {
								pos = (oldIndex < pos) ? oldIndex : -1; // becomes -1 if nodes were re-ordered
								oldIndices[i-start] = oldIndex;
								oe = old[oldIndex];
								old[oldIndex] = null;
								if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns);
								if (ve.dom != null) nextSibling = ve.dom;
								matched++;
							}
						}
						nextSibling = originalNextSibling;
						if (matched !== oldEnd - oldStart + 1) removeNodes(parent, old, oldStart, oldEnd + 1);
						if (matched === 0) createNodes(parent, vnodes, start, end + 1, hooks, nextSibling, ns);
						else {
							if (pos === -1) {
								// the indices of the indices of the items that are part of the
								// longest increasing subsequence in the oldIndices list
								lisIndices = makeLisIndices(oldIndices);
								li = lisIndices.length - 1;
								for (i = end; i >= start; i--) {
									v = vnodes[i];
									if (oldIndices[i-start] === -1) createNode(parent, v, hooks, ns, nextSibling);
									else {
										if (lisIndices[li] === i - start) li--;
										else moveNodes(parent, v, nextSibling);
									}
									if (v.dom != null) nextSibling = vnodes[i].dom;
								}
							} else {
								for (i = end; i >= start; i--) {
									v = vnodes[i];
									if (oldIndices[i-start] === -1) createNode(parent, v, hooks, ns, nextSibling);
									if (v.dom != null) nextSibling = vnodes[i].dom;
								}
							}
						}
					}
				}
			}
		}
		function updateNode(parent, old, vnode, hooks, nextSibling, ns) {
			var oldTag = old.tag, tag = vnode.tag;
			if (oldTag === tag) {
				vnode.state = old.state;
				vnode.events = old.events;
				if (shouldNotUpdate(vnode, old)) return
				if (typeof oldTag === "string") {
					if (vnode.attrs != null) {
						updateLifecycle(vnode.attrs, vnode, hooks);
					}
					switch (oldTag) {
						case "#": updateText(old, vnode); break
						case "<": updateHTML(parent, old, vnode, ns, nextSibling); break
						case "[": updateFragment(parent, old, vnode, hooks, nextSibling, ns); break
						default: updateElement(old, vnode, hooks, ns);
					}
				}
				else updateComponent(parent, old, vnode, hooks, nextSibling, ns);
			}
			else {
				removeNode(parent, old);
				createNode(parent, vnode, hooks, ns, nextSibling);
			}
		}
		function updateText(old, vnode) {
			if (old.children.toString() !== vnode.children.toString()) {
				old.dom.nodeValue = vnode.children;
			}
			vnode.dom = old.dom;
		}
		function updateHTML(parent, old, vnode, ns, nextSibling) {
			if (old.children !== vnode.children) {
				removeHTML(parent, old);
				createHTML(parent, vnode, ns, nextSibling);
			}
			else {
				vnode.dom = old.dom;
				vnode.domSize = old.domSize;
				vnode.instance = old.instance;
			}
		}
		function updateFragment(parent, old, vnode, hooks, nextSibling, ns) {
			updateNodes(parent, old.children, vnode.children, hooks, nextSibling, ns);
			var domSize = 0, children = vnode.children;
			vnode.dom = null;
			if (children != null) {
				for (var i = 0; i < children.length; i++) {
					var child = children[i];
					if (child != null && child.dom != null) {
						if (vnode.dom == null) vnode.dom = child.dom;
						domSize += child.domSize || 1;
					}
				}
				if (domSize !== 1) vnode.domSize = domSize;
			}
		}
		function updateElement(old, vnode$1, hooks, ns) {
			var element = vnode$1.dom = old.dom;
			ns = getNameSpace(vnode$1) || ns;

			if (vnode$1.tag === "textarea") {
				if (vnode$1.attrs == null) vnode$1.attrs = {};
				if (vnode$1.text != null) {
					vnode$1.attrs.value = vnode$1.text; //FIXME handle multiple children
					vnode$1.text = undefined;
				}
			}
			updateAttrs(vnode$1, old.attrs, vnode$1.attrs, ns);
			if (!maybeSetContentEditable(vnode$1)) {
				if (old.text != null && vnode$1.text != null && vnode$1.text !== "") {
					if (old.text.toString() !== vnode$1.text.toString()) old.dom.firstChild.nodeValue = vnode$1.text;
				}
				else {
					if (old.text != null) old.children = [vnode("#", undefined, undefined, old.text, undefined, old.dom.firstChild)];
					if (vnode$1.text != null) vnode$1.children = [vnode("#", undefined, undefined, vnode$1.text, undefined, undefined)];
					updateNodes(element, old.children, vnode$1.children, hooks, null, ns);
				}
			}
		}
		function updateComponent(parent, old, vnode$1, hooks, nextSibling, ns) {
			vnode$1.instance = vnode.normalize(callHook.call(vnode$1.state.view, vnode$1));
			if (vnode$1.instance === vnode$1) throw Error("A view cannot return the vnode it received as argument")
			updateLifecycle(vnode$1.state, vnode$1, hooks);
			if (vnode$1.attrs != null) updateLifecycle(vnode$1.attrs, vnode$1, hooks);
			if (vnode$1.instance != null) {
				if (old.instance == null) createNode(parent, vnode$1.instance, hooks, ns, nextSibling);
				else updateNode(parent, old.instance, vnode$1.instance, hooks, nextSibling, ns);
				vnode$1.dom = vnode$1.instance.dom;
				vnode$1.domSize = vnode$1.instance.domSize;
			}
			else if (old.instance != null) {
				removeNode(parent, old.instance);
				vnode$1.dom = undefined;
				vnode$1.domSize = 0;
			}
			else {
				vnode$1.dom = old.dom;
				vnode$1.domSize = old.domSize;
			}
		}
		function getKeyMap(vnodes, start, end) {
			var map = Object.create(null);
			for (; start < end; start++) {
				var vnode = vnodes[start];
				if (vnode != null) {
					var key = vnode.key;
					if (key != null) map[key] = start;
				}
			}
			return map
		}
		// Lifted from ivi https://github.com/ivijs/ivi/
		// takes a list of unique numbers (-1 is special and can
		// occur multiple times) and returns an array with the indices
		// of the items that are part of the longest increasing
		// subsequece
		var lisTemp = [];
		function makeLisIndices(a) {
			var result = [0];
			var u = 0, v = 0, i = 0;
			var il = lisTemp.length = a.length;
			for (var i = 0; i < il; i++) lisTemp[i] = a[i];
			for (var i = 0; i < il; ++i) {
				if (a[i] === -1) continue
				var j = result[result.length - 1];
				if (a[j] < a[i]) {
					lisTemp[i] = j;
					result.push(i);
					continue
				}
				u = 0;
				v = result.length - 1;
				while (u < v) {
					// Fast integer average without overflow.
					// eslint-disable-next-line no-bitwise
					var c = (u >>> 1) + (v >>> 1) + (u & v & 1);
					if (a[result[c]] < a[i]) {
						u = c + 1;
					}
					else {
						v = c;
					}
				}
				if (a[i] < a[result[u]]) {
					if (u > 0) lisTemp[i] = result[u - 1];
					result[u] = i;
				}
			}
			u = result.length;
			v = result[u - 1];
			while (u-- > 0) {
				result[u] = v;
				v = lisTemp[v];
			}
			lisTemp.length = 0;
			return result
		}

		function getNextSibling(vnodes, i, nextSibling) {
			for (; i < vnodes.length; i++) {
				if (vnodes[i] != null && vnodes[i].dom != null) return vnodes[i].dom
			}
			return nextSibling
		}

		// This covers a really specific edge case:
		// - Parent node is keyed and contains child
		// - Child is removed, returns unresolved promise in `onbeforeremove`
		// - Parent node is moved in keyed diff
		// - Remaining children still need moved appropriately
		//
		// Ideally, I'd track removed nodes as well, but that introduces a lot more
		// complexity and I'm not exactly interested in doing that.
		function moveNodes(parent, vnode, nextSibling) {
			var frag = $doc.createDocumentFragment();
			moveChildToFrag(parent, frag, vnode);
			insertNode(parent, frag, nextSibling);
		}
		function moveChildToFrag(parent, frag, vnode) {
			// Dodge the recursion overhead in a few of the most common cases.
			while (vnode.dom != null && vnode.dom.parentNode === parent) {
				if (typeof vnode.tag !== "string") {
					vnode = vnode.instance;
					if (vnode != null) continue
				} else if (vnode.tag === "<") {
					for (var i = 0; i < vnode.instance.length; i++) {
						frag.appendChild(vnode.instance[i]);
					}
				} else if (vnode.tag !== "[") {
					// Don't recurse for text nodes *or* elements, just fragments
					frag.appendChild(vnode.dom);
				} else if (vnode.children.length === 1) {
					vnode = vnode.children[0];
					if (vnode != null) continue
				} else {
					for (var i = 0; i < vnode.children.length; i++) {
						var child = vnode.children[i];
						if (child != null) moveChildToFrag(parent, frag, child);
					}
				}
				break
			}
		}

		function insertNode(parent, dom, nextSibling) {
			if (nextSibling != null) parent.insertBefore(dom, nextSibling);
			else parent.appendChild(dom);
		}

		function maybeSetContentEditable(vnode) {
			if (vnode.attrs == null || (
				vnode.attrs.contenteditable == null && // attribute
				vnode.attrs.contentEditable == null // property
			)) return false
			var children = vnode.children;
			if (children != null && children.length === 1 && children[0].tag === "<") {
				var content = children[0].children;
				if (vnode.dom.innerHTML !== content) vnode.dom.innerHTML = content;
			}
			else if (vnode.text != null || children != null && children.length !== 0) throw new Error("Child node of a contenteditable must be trusted")
			return true
		}

		//remove
		function removeNodes(parent, vnodes, start, end) {
			for (var i = start; i < end; i++) {
				var vnode = vnodes[i];
				if (vnode != null) removeNode(parent, vnode);
			}
		}
		function removeNode(parent, vnode) {
			var mask = 0;
			var original = vnode.state;
			var stateResult, attrsResult;
			if (typeof vnode.tag !== "string" && typeof vnode.state.onbeforeremove === "function") {
				var result = callHook.call(vnode.state.onbeforeremove, vnode);
				if (result != null && typeof result.then === "function") {
					mask = 1;
					stateResult = result;
				}
			}
			if (vnode.attrs && typeof vnode.attrs.onbeforeremove === "function") {
				var result = callHook.call(vnode.attrs.onbeforeremove, vnode);
				if (result != null && typeof result.then === "function") {
					// eslint-disable-next-line no-bitwise
					mask |= 2;
					attrsResult = result;
				}
			}
			checkState(vnode, original);

			// If we can, try to fast-path it and avoid all the overhead of awaiting
			if (!mask) {
				onremove(vnode);
				removeChild(parent, vnode);
			} else {
				if (stateResult != null) {
					var next = function () {
						// eslint-disable-next-line no-bitwise
						if (mask & 1) { mask &= 2; if (!mask) reallyRemove(); }
					};
					stateResult.then(next, next);
				}
				if (attrsResult != null) {
					var next = function () {
						// eslint-disable-next-line no-bitwise
						if (mask & 2) { mask &= 1; if (!mask) reallyRemove(); }
					};
					attrsResult.then(next, next);
				}
			}

			function reallyRemove() {
				checkState(vnode, original);
				onremove(vnode);
				removeChild(parent, vnode);
			}
		}
		function removeHTML(parent, vnode) {
			for (var i = 0; i < vnode.instance.length; i++) {
				parent.removeChild(vnode.instance[i]);
			}
		}
		function removeChild(parent, vnode) {
			// Dodge the recursion overhead in a few of the most common cases.
			while (vnode.dom != null && vnode.dom.parentNode === parent) {
				if (typeof vnode.tag !== "string") {
					vnode = vnode.instance;
					if (vnode != null) continue
				} else if (vnode.tag === "<") {
					removeHTML(parent, vnode);
				} else {
					if (vnode.tag !== "[") {
						parent.removeChild(vnode.dom);
						if (!Array.isArray(vnode.children)) break
					}
					if (vnode.children.length === 1) {
						vnode = vnode.children[0];
						if (vnode != null) continue
					} else {
						for (var i = 0; i < vnode.children.length; i++) {
							var child = vnode.children[i];
							if (child != null) removeChild(parent, child);
						}
					}
				}
				break
			}
		}
		function onremove(vnode) {
			if (typeof vnode.tag !== "string" && typeof vnode.state.onremove === "function") callHook.call(vnode.state.onremove, vnode);
			if (vnode.attrs && typeof vnode.attrs.onremove === "function") callHook.call(vnode.attrs.onremove, vnode);
			if (typeof vnode.tag !== "string") {
				if (vnode.instance != null) onremove(vnode.instance);
			} else {
				var children = vnode.children;
				if (Array.isArray(children)) {
					for (var i = 0; i < children.length; i++) {
						var child = children[i];
						if (child != null) onremove(child);
					}
				}
			}
		}

		//attrs
		function setAttrs(vnode, attrs, ns) {
			for (var key in attrs) {
				setAttr(vnode, key, null, attrs[key], ns);
			}
		}
		function setAttr(vnode, key, old, value, ns) {
			if (key === "key" || key === "is" || value == null || isLifecycleMethod(key) || (old === value && !isFormAttribute(vnode, key)) && typeof value !== "object") return
			if (key[0] === "o" && key[1] === "n") return updateEvent(vnode, key, value)
			if (key.slice(0, 6) === "xlink:") vnode.dom.setAttributeNS("http://www.w3.org/1999/xlink", key.slice(6), value);
			else if (key === "style") updateStyle(vnode.dom, old, value);
			else if (hasPropertyKey(vnode, key, ns)) {
				if (key === "value") {
					// Only do the coercion if we're actually going to check the value.
					/* eslint-disable no-implicit-coercion */
					//setting input[value] to same value by typing on focused element moves cursor to end in Chrome
					if ((vnode.tag === "input" || vnode.tag === "textarea") && vnode.dom.value === "" + value && vnode.dom === activeElement()) return
					//setting select[value] to same value while having select open blinks select dropdown in Chrome
					if (vnode.tag === "select" && old !== null && vnode.dom.value === "" + value) return
					//setting option[value] to same value while having select open blinks select dropdown in Chrome
					if (vnode.tag === "option" && old !== null && vnode.dom.value === "" + value) return
					/* eslint-enable no-implicit-coercion */
				}
				// If you assign an input type that is not supported by IE 11 with an assignment expression, an error will occur.
				if (vnode.tag === "input" && key === "type") vnode.dom.setAttribute(key, value);
				else vnode.dom[key] = value;
			} else {
				if (typeof value === "boolean") {
					if (value) vnode.dom.setAttribute(key, "");
					else vnode.dom.removeAttribute(key);
				}
				else vnode.dom.setAttribute(key === "className" ? "class" : key, value);
			}
		}
		function removeAttr(vnode, key, old, ns) {
			if (key === "key" || key === "is" || old == null || isLifecycleMethod(key)) return
			if (key[0] === "o" && key[1] === "n" && !isLifecycleMethod(key)) updateEvent(vnode, key, undefined);
			else if (key === "style") updateStyle(vnode.dom, old, null);
			else if (
				hasPropertyKey(vnode, key, ns)
				&& key !== "className"
				&& !(key === "value" && (
					vnode.tag === "option"
					|| vnode.tag === "select" && vnode.dom.selectedIndex === -1 && vnode.dom === activeElement()
				))
				&& !(vnode.tag === "input" && key === "type")
			) {
				vnode.dom[key] = null;
			} else {
				var nsLastIndex = key.indexOf(":");
				if (nsLastIndex !== -1) key = key.slice(nsLastIndex + 1);
				if (old !== false) vnode.dom.removeAttribute(key === "className" ? "class" : key);
			}
		}
		function setLateSelectAttrs(vnode, attrs) {
			if ("value" in attrs) {
				if(attrs.value === null) {
					if (vnode.dom.selectedIndex !== -1) vnode.dom.value = null;
				} else {
					var normalized = "" + attrs.value; // eslint-disable-line no-implicit-coercion
					if (vnode.dom.value !== normalized || vnode.dom.selectedIndex === -1) {
						vnode.dom.value = normalized;
					}
				}
			}
			if ("selectedIndex" in attrs) setAttr(vnode, "selectedIndex", null, attrs.selectedIndex, undefined);
		}
		function updateAttrs(vnode, old, attrs, ns) {
			if (attrs != null) {
				for (var key in attrs) {
					setAttr(vnode, key, old && old[key], attrs[key], ns);
				}
			}
			var val;
			if (old != null) {
				for (var key in old) {
					if (((val = old[key]) != null) && (attrs == null || attrs[key] == null)) {
						removeAttr(vnode, key, val, ns);
					}
				}
			}
		}
		function isFormAttribute(vnode, attr) {
			return attr === "value" || attr === "checked" || attr === "selectedIndex" || attr === "selected" && vnode.dom === activeElement() || vnode.tag === "option" && vnode.dom.parentNode === $doc.activeElement
		}
		function isLifecycleMethod(attr) {
			return attr === "oninit" || attr === "oncreate" || attr === "onupdate" || attr === "onremove" || attr === "onbeforeremove" || attr === "onbeforeupdate"
		}
		function hasPropertyKey(vnode, key, ns) {
			// Filter out namespaced keys
			return ns === undefined && (
				// If it's a custom element, just keep it.
				vnode.tag.indexOf("-") > -1 || vnode.attrs != null && vnode.attrs.is ||
				// If it's a normal element, let's try to avoid a few browser bugs.
				key !== "href" && key !== "list" && key !== "form" && key !== "width" && key !== "height"// && key !== "type"
				// Defer the property check until *after* we check everything.
			) && key in vnode.dom
		}

		//style
		var uppercaseRegex = /[A-Z]/g;
		function toLowerCase(capital) { return "-" + capital.toLowerCase() }
		function normalizeKey(key) {
			return key[0] === "-" && key[1] === "-" ? key :
				key === "cssFloat" ? "float" :
					key.replace(uppercaseRegex, toLowerCase)
		}
		function updateStyle(element, old, style) {
			if (old === style) ; else if (style == null) {
				// New style is missing, just clear it.
				element.style.cssText = "";
			} else if (typeof style !== "object") {
				// New style is a string, let engine deal with patching.
				element.style.cssText = style;
			} else if (old == null || typeof old !== "object") {
				// `old` is missing or a string, `style` is an object.
				element.style.cssText = "";
				// Add new style properties
				for (var key in style) {
					var value = style[key];
					if (value != null) element.style.setProperty(normalizeKey(key), String(value));
				}
			} else {
				// Both old & new are (different) objects.
				// Update style properties that have changed
				for (var key in style) {
					var value = style[key];
					if (value != null && (value = String(value)) !== String(old[key])) {
						element.style.setProperty(normalizeKey(key), value);
					}
				}
				// Remove style properties that no longer exist
				for (var key in old) {
					if (old[key] != null && style[key] == null) {
						element.style.removeProperty(normalizeKey(key));
					}
				}
			}
		}

		// Here's an explanation of how this works:
		// 1. The event names are always (by design) prefixed by `on`.
		// 2. The EventListener interface accepts either a function or an object
		//    with a `handleEvent` method.
		// 3. The object does not inherit from `Object.prototype`, to avoid
		//    any potential interference with that (e.g. setters).
		// 4. The event name is remapped to the handler before calling it.
		// 5. In function-based event handlers, `ev.target === this`. We replicate
		//    that below.
		// 6. In function-based event handlers, `return false` prevents the default
		//    action and stops event propagation. We replicate that below.
		function EventDict() {
			// Save this, so the current redraw is correctly tracked.
			this._ = currentRedraw;
		}
		EventDict.prototype = Object.create(null);
		EventDict.prototype.handleEvent = function (ev) {
			var handler = this["on" + ev.type];
			var result;
			if (typeof handler === "function") result = handler.call(ev.currentTarget, ev);
			else if (typeof handler.handleEvent === "function") handler.handleEvent(ev);
			if (this._ && ev.redraw !== false) (0, this._)();
			if (result === false) {
				ev.preventDefault();
				ev.stopPropagation();
			}
		};

		//event
		function updateEvent(vnode, key, value) {
			if (vnode.events != null) {
				if (vnode.events[key] === value) return
				if (value != null && (typeof value === "function" || typeof value === "object")) {
					if (vnode.events[key] == null) vnode.dom.addEventListener(key.slice(2), vnode.events, false);
					vnode.events[key] = value;
				} else {
					if (vnode.events[key] != null) vnode.dom.removeEventListener(key.slice(2), vnode.events, false);
					vnode.events[key] = undefined;
				}
			} else if (value != null && (typeof value === "function" || typeof value === "object")) {
				vnode.events = new EventDict();
				vnode.dom.addEventListener(key.slice(2), vnode.events, false);
				vnode.events[key] = value;
			}
		}

		//lifecycle
		function initLifecycle(source, vnode, hooks) {
			if (typeof source.oninit === "function") callHook.call(source.oninit, vnode);
			if (typeof source.oncreate === "function") hooks.push(callHook.bind(source.oncreate, vnode));
		}
		function updateLifecycle(source, vnode, hooks) {
			if (typeof source.onupdate === "function") hooks.push(callHook.bind(source.onupdate, vnode));
		}
		function shouldNotUpdate(vnode, old) {
			do {
				if (vnode.attrs != null && typeof vnode.attrs.onbeforeupdate === "function") {
					var force = callHook.call(vnode.attrs.onbeforeupdate, vnode, old);
					if (force !== undefined && !force) break
				}
				if (typeof vnode.tag !== "string" && typeof vnode.state.onbeforeupdate === "function") {
					var force = callHook.call(vnode.state.onbeforeupdate, vnode, old);
					if (force !== undefined && !force) break
				}
				return false
			} while (false); // eslint-disable-line no-constant-condition
			vnode.dom = old.dom;
			vnode.domSize = old.domSize;
			vnode.instance = old.instance;
			// One would think having the actual latest attributes would be ideal,
			// but it doesn't let us properly diff based on our current internal
			// representation. We have to save not only the old DOM info, but also
			// the attributes used to create it, as we diff *that*, not against the
			// DOM directly (with a few exceptions in `setAttr`). And, of course, we
			// need to save the children and text as they are conceptually not
			// unlike special "attributes" internally.
			vnode.attrs = old.attrs;
			vnode.children = old.children;
			vnode.text = old.text;
			return true
		}

		return function(dom, vnodes, redraw) {
			if (!dom) throw new TypeError("Ensure the DOM element being passed to m.route/m.mount/m.render is not undefined.")
			var hooks = [];
			var active = activeElement();
			var namespace = dom.namespaceURI;

			// First time rendering into a node clears it out
			if (dom.vnodes == null) dom.textContent = "";

			vnodes = vnode.normalizeChildren(Array.isArray(vnodes) ? vnodes : [vnodes]);
			var prevRedraw = currentRedraw;
			try {
				currentRedraw = typeof redraw === "function" ? redraw : undefined;
				updateNodes(dom, dom.vnodes, vnodes, hooks, null, namespace === "http://www.w3.org/1999/xhtml" ? undefined : namespace);
			} finally {
				currentRedraw = prevRedraw;
			}
			dom.vnodes = vnodes;
			// `document.activeElement` can return null: https://html.spec.whatwg.org/multipage/interaction.html#dom-document-activeelement
			if (active != null && activeElement() !== active && typeof active.focus === "function") active.focus();
			for (var i = 0; i < hooks.length; i++) hooks[i]();
		}
	};

	var render$1 = render(window);

	var mountRedraw = function(render, schedule, console) {
		var subscriptions = [];
		var rendering = false;
		var pending = false;

		function sync() {
			if (rendering) throw new Error("Nested m.redraw.sync() call")
			rendering = true;
			for (var i = 0; i < subscriptions.length; i += 2) {
				try { render(subscriptions[i], vnode(subscriptions[i + 1]), redraw); }
				catch (e) { console.error(e); }
			}
			rendering = false;
		}

		function redraw() {
			if (!pending) {
				pending = true;
				schedule(function() {
					pending = false;
					sync();
				});
			}
		}

		redraw.sync = sync;

		function mount(root, component) {
			if (component != null && component.view == null && typeof component !== "function") {
				throw new TypeError("m.mount(element, component) expects a component, not a vnode")
			}

			var index = subscriptions.indexOf(root);
			if (index >= 0) {
				subscriptions.splice(index, 2);
				render(root, [], redraw);
			}

			if (component != null) {
				subscriptions.push(root, component);
				render(root, vnode(component), redraw);
			}
		}

		return {mount: mount, redraw: redraw}
	};

	var mountRedraw$1 = mountRedraw(render$1, requestAnimationFrame, console);

	var build = function(object) {
		if (Object.prototype.toString.call(object) !== "[object Object]") return ""

		var args = [];
		for (var key in object) {
			destructure(key, object[key]);
		}

		return args.join("&")

		function destructure(key, value) {
			if (Array.isArray(value)) {
				for (var i = 0; i < value.length; i++) {
					destructure(key + "[" + i + "]", value[i]);
				}
			}
			else if (Object.prototype.toString.call(value) === "[object Object]") {
				for (var i in value) {
					destructure(key + "[" + i + "]", value[i]);
				}
			}
			else args.push(encodeURIComponent(key) + (value != null && value !== "" ? "=" + encodeURIComponent(value) : ""));
		}
	};

	var assign = Object.assign || function(target, source) {
		if(source) Object.keys(source).forEach(function(key) { target[key] = source[key]; });
	};

	// Returns `path` from `template` + `params`
	var build$1 = function(template, params) {
		if ((/:([^\/\.-]+)(\.{3})?:/).test(template)) {
			throw new SyntaxError("Template parameter names *must* be separated")
		}
		if (params == null) return template
		var queryIndex = template.indexOf("?");
		var hashIndex = template.indexOf("#");
		var queryEnd = hashIndex < 0 ? template.length : hashIndex;
		var pathEnd = queryIndex < 0 ? queryEnd : queryIndex;
		var path = template.slice(0, pathEnd);
		var query = {};

		assign(query, params);

		var resolved = path.replace(/:([^\/\.-]+)(\.{3})?/g, function(m, key, variadic) {
			delete query[key];
			// If no such parameter exists, don't interpolate it.
			if (params[key] == null) return m
			// Escape normal parameters, but not variadic ones.
			return variadic ? params[key] : encodeURIComponent(String(params[key]))
		});

		// In case the template substitution adds new query/hash parameters.
		var newQueryIndex = resolved.indexOf("?");
		var newHashIndex = resolved.indexOf("#");
		var newQueryEnd = newHashIndex < 0 ? resolved.length : newHashIndex;
		var newPathEnd = newQueryIndex < 0 ? newQueryEnd : newQueryIndex;
		var result = resolved.slice(0, newPathEnd);

		if (queryIndex >= 0) result += template.slice(queryIndex, queryEnd);
		if (newQueryIndex >= 0) result += (queryIndex < 0 ? "?" : "&") + resolved.slice(newQueryIndex, newQueryEnd);
		var querystring = build(query);
		if (querystring) result += (queryIndex < 0 && newQueryIndex < 0 ? "?" : "&") + querystring;
		if (hashIndex >= 0) result += template.slice(hashIndex);
		if (newHashIndex >= 0) result += (hashIndex < 0 ? "" : "&") + resolved.slice(newHashIndex);
		return result
	};

	var request = function($window, Promise, oncompletion) {
		var callbackCount = 0;

		function PromiseProxy(executor) {
			return new Promise(executor)
		}

		// In case the global Promise is some userland library's where they rely on
		// `foo instanceof this.constructor`, `this.constructor.resolve(value)`, or
		// similar. Let's *not* break them.
		PromiseProxy.prototype = Promise.prototype;
		PromiseProxy.__proto__ = Promise; // eslint-disable-line no-proto

		function makeRequest(factory) {
			return function(url, args) {
				if (typeof url !== "string") { args = url; url = url.url; }
				else if (args == null) args = {};
				var promise = new Promise(function(resolve, reject) {
					factory(build$1(url, args.params), args, function (data) {
						if (typeof args.type === "function") {
							if (Array.isArray(data)) {
								for (var i = 0; i < data.length; i++) {
									data[i] = new args.type(data[i]);
								}
							}
							else data = new args.type(data);
						}
						resolve(data);
					}, reject);
				});
				if (args.background === true) return promise
				var count = 0;
				function complete() {
					if (--count === 0 && typeof oncompletion === "function") oncompletion();
				}

				return wrap(promise)

				function wrap(promise) {
					var then = promise.then;
					// Set the constructor, so engines know to not await or resolve
					// this as a native promise. At the time of writing, this is
					// only necessary for V8, but their behavior is the correct
					// behavior per spec. See this spec issue for more details:
					// https://github.com/tc39/ecma262/issues/1577. Also, see the
					// corresponding comment in `request/tests/test-request.js` for
					// a bit more background on the issue at hand.
					promise.constructor = PromiseProxy;
					promise.then = function() {
						count++;
						var next = then.apply(promise, arguments);
						next.then(complete, function(e) {
							complete();
							if (count === 0) throw e
						});
						return wrap(next)
					};
					return promise
				}
			}
		}

		function hasHeader(args, name) {
			for (var key in args.headers) {
				if ({}.hasOwnProperty.call(args.headers, key) && name.test(key)) return true
			}
			return false
		}

		return {
			request: makeRequest(function(url, args, resolve, reject) {
				var method = args.method != null ? args.method.toUpperCase() : "GET";
				var body = args.body;
				var assumeJSON = (args.serialize == null || args.serialize === JSON.serialize) && !(body instanceof $window.FormData);
				var responseType = args.responseType || (typeof args.extract === "function" ? "" : "json");

				var xhr = new $window.XMLHttpRequest(), aborted = false;
				var original = xhr, replacedAbort;
				var abort = xhr.abort;

				xhr.abort = function() {
					aborted = true;
					abort.call(this);
				};

				xhr.open(method, url, args.async !== false, typeof args.user === "string" ? args.user : undefined, typeof args.password === "string" ? args.password : undefined);

				if (assumeJSON && body != null && !hasHeader(args, /^content-type$/i)) {
					xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
				}
				if (typeof args.deserialize !== "function" && !hasHeader(args, /^accept$/i)) {
					xhr.setRequestHeader("Accept", "application/json, text/*");
				}
				if (args.withCredentials) xhr.withCredentials = args.withCredentials;
				if (args.timeout) xhr.timeout = args.timeout;
				xhr.responseType = responseType;

				for (var key in args.headers) {
					if ({}.hasOwnProperty.call(args.headers, key)) {
						xhr.setRequestHeader(key, args.headers[key]);
					}
				}

				xhr.onreadystatechange = function(ev) {
					// Don't throw errors on xhr.abort().
					if (aborted) return

					if (ev.target.readyState === 4) {
						try {
							var success = (ev.target.status >= 200 && ev.target.status < 300) || ev.target.status === 304 || (/^file:\/\//i).test(url);
							// When the response type isn't "" or "text",
							// `xhr.responseText` is the wrong thing to use.
							// Browsers do the right thing and throw here, and we
							// should honor that and do the right thing by
							// preferring `xhr.response` where possible/practical.
							var response = ev.target.response, message;

							if (responseType === "json") {
								// For IE and Edge, which don't implement
								// `responseType: "json"`.
								if (!ev.target.responseType && typeof args.extract !== "function") response = JSON.parse(ev.target.responseText);
							} else if (!responseType || responseType === "text") {
								// Only use this default if it's text. If a parsed
								// document is needed on old IE and friends (all
								// unsupported), the user should use a custom
								// `config` instead. They're already using this at
								// their own risk.
								if (response == null) response = ev.target.responseText;
							}

							if (typeof args.extract === "function") {
								response = args.extract(ev.target, args);
								success = true;
							} else if (typeof args.deserialize === "function") {
								response = args.deserialize(response);
							}
							if (success) resolve(response);
							else {
								try { message = ev.target.responseText; }
								catch (e) { message = response; }
								var error = new Error(message);
								error.code = ev.target.status;
								error.response = response;
								reject(error);
							}
						}
						catch (e) {
							reject(e);
						}
					}
				};

				if (typeof args.config === "function") {
					xhr = args.config(xhr, args, url) || xhr;

					// Propagate the `abort` to any replacement XHR as well.
					if (xhr !== original) {
						replacedAbort = xhr.abort;
						xhr.abort = function() {
							aborted = true;
							replacedAbort.call(this);
						};
					}
				}

				if (body == null) xhr.send();
				else if (typeof args.serialize === "function") xhr.send(args.serialize(body));
				else if (body instanceof $window.FormData) xhr.send(body);
				else xhr.send(JSON.stringify(body));
			}),
			jsonp: makeRequest(function(url, args, resolve, reject) {
				var callbackName = args.callbackName || "_mithril_" + Math.round(Math.random() * 1e16) + "_" + callbackCount++;
				var script = $window.document.createElement("script");
				$window[callbackName] = function(data) {
					delete $window[callbackName];
					script.parentNode.removeChild(script);
					resolve(data);
				};
				script.onerror = function() {
					delete $window[callbackName];
					script.parentNode.removeChild(script);
					reject(new Error("JSONP request failed"));
				};
				script.src = url + (url.indexOf("?") < 0 ? "?" : "&") +
					encodeURIComponent(args.callbackKey || "callback") + "=" +
					encodeURIComponent(callbackName);
				$window.document.documentElement.appendChild(script);
			}),
		}
	};

	var request$1 = request(window, promise, mountRedraw$1.redraw);

	var parse = function(string) {
		if (string === "" || string == null) return {}
		if (string.charAt(0) === "?") string = string.slice(1);

		var entries = string.split("&"), counters = {}, data = {};
		for (var i = 0; i < entries.length; i++) {
			var entry = entries[i].split("=");
			var key = decodeURIComponent(entry[0]);
			var value = entry.length === 2 ? decodeURIComponent(entry[1]) : "";

			if (value === "true") value = true;
			else if (value === "false") value = false;

			var levels = key.split(/\]\[?|\[/);
			var cursor = data;
			if (key.indexOf("[") > -1) levels.pop();
			for (var j = 0; j < levels.length; j++) {
				var level = levels[j], nextLevel = levels[j + 1];
				var isNumber = nextLevel == "" || !isNaN(parseInt(nextLevel, 10));
				if (level === "") {
					var key = levels.slice(0, j).join();
					if (counters[key] == null) {
						counters[key] = Array.isArray(cursor) ? cursor.length : 0;
					}
					level = counters[key]++;
				}
				// Disallow direct prototype pollution
				else if (level === "__proto__") break
				if (j === levels.length - 1) cursor[level] = value;
				else {
					// Read own properties exclusively to disallow indirect
					// prototype pollution
					var desc = Object.getOwnPropertyDescriptor(cursor, level);
					if (desc != null) desc = desc.value;
					if (desc == null) cursor[level] = desc = isNumber ? [] : {};
					cursor = desc;
				}
			}
		}
		return data
	};

	// Returns `{path, params}` from `url`
	var parse$1 = function(url) {
		var queryIndex = url.indexOf("?");
		var hashIndex = url.indexOf("#");
		var queryEnd = hashIndex < 0 ? url.length : hashIndex;
		var pathEnd = queryIndex < 0 ? queryEnd : queryIndex;
		var path = url.slice(0, pathEnd).replace(/\/{2,}/g, "/");

		if (!path) path = "/";
		else {
			if (path[0] !== "/") path = "/" + path;
			if (path.length > 1 && path[path.length - 1] === "/") path = path.slice(0, -1);
		}
		return {
			path: path,
			params: queryIndex < 0
				? {}
				: parse(url.slice(queryIndex + 1, queryEnd)),
		}
	};

	// Compiles a template into a function that takes a resolved path (without query
	// strings) and returns an object containing the template parameters with their
	// parsed values. This expects the input of the compiled template to be the
	// output of `parsePathname`. Note that it does *not* remove query parameters
	// specified in the template.
	var compileTemplate = function(template) {
		var templateData = parse$1(template);
		var templateKeys = Object.keys(templateData.params);
		var keys = [];
		var regexp = new RegExp("^" + templateData.path.replace(
			// I escape literal text so people can use things like `:file.:ext` or
			// `:lang-:locale` in routes. This is all merged into one pass so I
			// don't also accidentally escape `-` and make it harder to detect it to
			// ban it from template parameters.
			/:([^\/.-]+)(\.{3}|\.(?!\.)|-)?|[\\^$*+.()|\[\]{}]/g,
			function(m, key, extra) {
				if (key == null) return "\\" + m
				keys.push({k: key, r: extra === "..."});
				if (extra === "...") return "(.*)"
				if (extra === ".") return "([^/]+)\\."
				return "([^/]+)" + (extra || "")
			}
		) + "$");
		return function(data) {
			// First, check the params. Usually, there isn't any, and it's just
			// checking a static set.
			for (var i = 0; i < templateKeys.length; i++) {
				if (templateData.params[templateKeys[i]] !== data.params[templateKeys[i]]) return false
			}
			// If no interpolations exist, let's skip all the ceremony
			if (!keys.length) return regexp.test(data.path)
			var values = regexp.exec(data.path);
			if (values == null) return false
			for (var i = 0; i < keys.length; i++) {
				data.params[keys[i].k] = keys[i].r ? values[i + 1] : decodeURIComponent(values[i + 1]);
			}
			return true
		}
	};

	var sentinel = {};

	var router = function($window, mountRedraw) {
		var fireAsync;

		function setPath(path, data, options) {
			path = build$1(path, data);
			if (fireAsync != null) {
				fireAsync();
				var state = options ? options.state : null;
				var title = options ? options.title : null;
				if (options && options.replace) $window.history.replaceState(state, title, route.prefix + path);
				else $window.history.pushState(state, title, route.prefix + path);
			}
			else {
				$window.location.href = route.prefix + path;
			}
		}

		var currentResolver = sentinel, component, attrs, currentPath, lastUpdate;

		var SKIP = route.SKIP = {};

		function route(root, defaultRoute, routes) {
			if (root == null) throw new Error("Ensure the DOM element that was passed to `m.route` is not undefined")
			// 0 = start
			// 1 = init
			// 2 = ready
			var state = 0;

			var compiled = Object.keys(routes).map(function(route) {
				if (route[0] !== "/") throw new SyntaxError("Routes must start with a `/`")
				if ((/:([^\/\.-]+)(\.{3})?:/).test(route)) {
					throw new SyntaxError("Route parameter names must be separated with either `/`, `.`, or `-`")
				}
				return {
					route: route,
					component: routes[route],
					check: compileTemplate(route),
				}
			});
			var callAsync = typeof setImmediate === "function" ? setImmediate : setTimeout;
			var p = promise.resolve();
			var scheduled = false;
			var onremove;

			fireAsync = null;

			if (defaultRoute != null) {
				var defaultData = parse$1(defaultRoute);

				if (!compiled.some(function (i) { return i.check(defaultData) })) {
					throw new ReferenceError("Default route doesn't match any known routes")
				}
			}

			function resolveRoute() {
				scheduled = false;
				// Consider the pathname holistically. The prefix might even be invalid,
				// but that's not our problem.
				var prefix = $window.location.hash;
				if (route.prefix[0] !== "#") {
					prefix = $window.location.search + prefix;
					if (route.prefix[0] !== "?") {
						prefix = $window.location.pathname + prefix;
						if (prefix[0] !== "/") prefix = "/" + prefix;
					}
				}
				// This seemingly useless `.concat()` speeds up the tests quite a bit,
				// since the representation is consistently a relatively poorly
				// optimized cons string.
				var path = prefix.concat()
					.replace(/(?:%[a-f89][a-f0-9])+/gim, decodeURIComponent)
					.slice(route.prefix.length);
				var data = parse$1(path);

				assign(data.params, $window.history.state);

				function fail() {
					if (path === defaultRoute) throw new Error("Could not resolve default route " + defaultRoute)
					setPath(defaultRoute, null, {replace: true});
				}

				loop(0);
				function loop(i) {
					// 0 = init
					// 1 = scheduled
					// 2 = done
					for (; i < compiled.length; i++) {
						if (compiled[i].check(data)) {
							var payload = compiled[i].component;
							var matchedRoute = compiled[i].route;
							var localComp = payload;
							var update = lastUpdate = function(comp) {
								if (update !== lastUpdate) return
								if (comp === SKIP) return loop(i + 1)
								component = comp != null && (typeof comp.view === "function" || typeof comp === "function")? comp : "div";
								attrs = data.params, currentPath = path, lastUpdate = null;
								currentResolver = payload.render ? payload : null;
								if (state === 2) mountRedraw.redraw();
								else {
									state = 2;
									mountRedraw.redraw.sync();
								}
							};
							// There's no understating how much I *wish* I could
							// use `async`/`await` here...
							if (payload.view || typeof payload === "function") {
								payload = {};
								update(localComp);
							}
							else if (payload.onmatch) {
								p.then(function () {
									return payload.onmatch(data.params, path, matchedRoute)
								}).then(update, fail);
							}
							else update("div");
							return
						}
					}
					fail();
				}
			}

			// Set it unconditionally so `m.route.set` and `m.route.Link` both work,
			// even if neither `pushState` nor `hashchange` are supported. It's
			// cleared if `hashchange` is used, since that makes it automatically
			// async.
			fireAsync = function() {
				if (!scheduled) {
					scheduled = true;
					callAsync(resolveRoute);
				}
			};

			if (typeof $window.history.pushState === "function") {
				onremove = function() {
					$window.removeEventListener("popstate", fireAsync, false);
				};
				$window.addEventListener("popstate", fireAsync, false);
			} else if (route.prefix[0] === "#") {
				fireAsync = null;
				onremove = function() {
					$window.removeEventListener("hashchange", resolveRoute, false);
				};
				$window.addEventListener("hashchange", resolveRoute, false);
			}

			return mountRedraw.mount(root, {
				onbeforeupdate: function() {
					state = state ? 2 : 1;
					return !(!state || sentinel === currentResolver)
				},
				oncreate: resolveRoute,
				onremove: onremove,
				view: function() {
					if (!state || sentinel === currentResolver) return
					// Wrap in a fragment to preserve existing key semantics
					var vnode$1 = [vnode(component, attrs.key, attrs)];
					if (currentResolver) vnode$1 = currentResolver.render(vnode$1[0]);
					return vnode$1
				},
			})
		}
		route.set = function(path, data, options) {
			if (lastUpdate != null) {
				options = options || {};
				options.replace = true;
			}
			lastUpdate = null;
			setPath(path, data, options);
		};
		route.get = function() {return currentPath};
		route.prefix = "#!";
		route.Link = {
			view: function(vnode) {
				var options = vnode.attrs.options;
				// Remove these so they don't get overwritten
				var attrs = {}, onclick, href;
				assign(attrs, vnode.attrs);
				// The first two are internal, but the rest are magic attributes
				// that need censored to not screw up rendering.
				attrs.selector = attrs.options = attrs.key = attrs.oninit =
				attrs.oncreate = attrs.onbeforeupdate = attrs.onupdate =
				attrs.onbeforeremove = attrs.onremove = null;

				// Do this now so we can get the most current `href` and `disabled`.
				// Those attributes may also be specified in the selector, and we
				// should honor that.
				var child = hyperscript_1(vnode.attrs.selector || "a", attrs, vnode.children);

				// Let's provide a *right* way to disable a route link, rather than
				// letting people screw up accessibility on accident.
				//
				// The attribute is coerced so users don't get surprised over
				// `disabled: 0` resulting in a button that's somehow routable
				// despite being visibly disabled.
				if (child.attrs.disabled = Boolean(child.attrs.disabled)) {
					child.attrs.href = null;
					child.attrs["aria-disabled"] = "true";
					// If you *really* do want to do this on a disabled link, use
					// an `oncreate` hook to add it.
					child.attrs.onclick = null;
				} else {
					onclick = child.attrs.onclick;
					href = child.attrs.href;
					child.attrs.href = route.prefix + href;
					child.attrs.onclick = function(e) {
						var result;
						if (typeof onclick === "function") {
							result = onclick.call(e.currentTarget, e);
						} else if (onclick == null || typeof onclick !== "object") ; else if (typeof onclick.handleEvent === "function") {
							onclick.handleEvent(e);
						}

						// Adapted from React Router's implementation:
						// https://github.com/ReactTraining/react-router/blob/520a0acd48ae1b066eb0b07d6d4d1790a1d02482/packages/react-router-dom/modules/Link.js
						//
						// Try to be flexible and intuitive in how we handle links.
						// Fun fact: links aren't as obvious to get right as you
						// would expect. There's a lot more valid ways to click a
						// link than this, and one might want to not simply click a
						// link, but right click or command-click it to copy the
						// link target, etc. Nope, this isn't just for blind people.
						if (
							// Skip if `onclick` prevented default
							result !== false && !e.defaultPrevented &&
							// Ignore everything but left clicks
							(e.button === 0 || e.which === 0 || e.which === 1) &&
							// Let the browser handle `target=_blank`, etc.
							(!e.currentTarget.target || e.currentTarget.target === "_self") &&
							// No modifier keys
							!e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey
						) {
							e.preventDefault();
							e.redraw = false;
							route.set(href, null, options);
						}
					};
				}
				return child
			},
		};
		route.param = function(key) {
			return attrs && key != null ? attrs[key] : attrs
		};

		return route
	};

	var route = router(window, mountRedraw$1);

	var m = function m() { return hyperscript_1$1.apply(this, arguments) };
	m.m = hyperscript_1$1;
	m.trust = hyperscript_1$1.trust;
	m.fragment = hyperscript_1$1.fragment;
	m.mount = mountRedraw$1.mount;
	m.route = route;
	m.render = render$1;
	m.redraw = mountRedraw$1.redraw;
	m.request = request$1.request;
	m.jsonp = request$1.jsonp;
	m.parseQueryString = parse;
	m.buildQueryString = build;
	m.parsePathname = parse$1;
	m.buildPathname = build$1;
	m.vnode = vnode;
	m.PromisePolyfill = polyfill;

	var mithril = m;

	const State$1 = () => ({
	  // model
	  list: [],
	  movie: {},

	  // state
	  page: 'list',
	  omdb: '',
	  modal: null,
	  snackbar: null,

	  // list
	  sort: 'alphabetic',
	  filter: {},
	  filters: {
	    time:  ['< Time', '1:30', '1:45', '2:00', '2:15', '2:30', '3:00', '5:00'],
	    yrgt:  ['> Year', '1920', '1930', '1940', '1950', '1960', '1970', '1980', '1990', '2000', '2010', '2015'],
	    yrlt:  ['< Year', '1920', '1930', '1940', '1950', '1960', '1970', '1980', '1990', '2000', '2010', '2015'],
	    type:  ['Type', 'movie', 'series'],
	    genre: ['Genre', 'Action', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime', 'Documentary',
	            'Drama', 'Family', 'Fantasy', 'Film-Noir', 'History', 'Horror', 'Music', 'Musical', 'Mystery',
	            'Romance', 'Sci-Fi', 'Sport', 'Thriller', 'War', 'Western'],
	    disk:  ['Disk'],
	    seen:  ['Seen', 'Yes', 'No']
	  },
	  search: '',
	  checks: {},

	  // info
	  eps: [],

	  // add
	  find: '',
	  show: '',
	  qres: {},
	  qpage: 0
	});

	const clone   = item => JSON.parse(JSON.stringify(item));
	const omdbapi = (t, q, omdb) => 'https://private.omdbapi.com/?' + t + '=' + q + '&apikey=' + omdb;

	const api = {
	  opts: (base = {}) => {
	    base.headers = base.headers || {movtok: sessionStorage.getItem('movtok')};
	    return base
	  },
	  req : (what, url, opts) => mithril.request({method: what, url, ...api.opts(opts)}),
	  get : (url, opts) => api.req('get', url, opts),
	  post: (url, opts) => api.req('post', url, opts),
	  put : (url, opts) => api.req('put', url, opts),
	  del : (url, opts) => api.req('delete', url, opts)
	};

	const postprep = (qone, obj = {}) => {
	  const props = [
	    'Actors','Country','Director','Genre','Language','Metascore',
	    'Plot','Poster','Runtime','Title','Type','Writer','Year','imdbID',
	    'imdbRating','seasonsowned','seasonsseen','disk','seen'
	  ];
	  Object.keys(qone)
	  .filter(x => props.includes(x))
	  .forEach(x => {
	    const actions = {
	      Actors:     () => {obj['cast']    = qone[x];},
	      Runtime:    () => {obj['runtime'] = qone[x] !== 'N/A' ? qone[x].split(' ')[0] : '';},
	      imdbID:     () => {obj['imdbid']  = qone[x];},
	      imdbRating: () => {obj['rating']  = qone[x];}
	    };
	    if (x in actions) actions[x]();
	    else obj[x.toLowerCase()] = qone[x];
	  });
	  obj['originaltitle'] = '';
	  obj['notes']         = '';

	  qone = clone(obj);
	  return obj
	};

	const update = (movie, res) => new Promise((rs,rj) => {
	  if (movie.rating !== res.imdbRating || movie.metascore !== res.Metascore || movie.poster !== res.Poster ||
	      (movie.type === 'series' && +res.totalSeasons > movie.seasonsowned.length)) {
	    movie.rating    = res.imdbRating;
	    movie.metascore = res.Metascore;
	    movie.poster    = res.Poster;
	    if (movie.type === 'series' && +res.totalSeasons > movie.seasonsowned.length) {
	      for (let i=0; i < +res.totalSeasons - movie.seasonsowned.length + 1; i++) {
	        movie.seasonsowned.push(false);
	        movie.seasonsseen.push(false);
	      }
	    }

	    api.put('/' + movie._id + '?update=true', {body: movie})
	    .then(rs)
	    .catch(rj);
	  }
	  else rs();
	});

	const Actions = (S, A = {
	  error: err => {
	    const header = err.code === 403 ? 'Well, what did you expect?' : 'Error';
	    
	    S.modal = {
	      type: 'error',
	      content: {
	        header,
	        text: `(${err.code}) ${err.response.message}`
	      }
	    };
	  },

	  filtdisk: () => {
	    const disks = [...new Set(S.list.map(x => x.disk))].sort((a,b) => a-b);
	    S.filters.disk = [...['Disk'], ...disks];
	    // if the last movie on a disk has been deleted
	    if (!S.filters.disk.includes(S.filter.disk)) S.filter.disk = 'Disk';
	  },

	  login: pass => api.post('/login', {headers: {movtok: 'notok'}, body: {pass}}),

	  get: () =>
	    api.get('/all')
	    .then(res => {
	      S.list = res.list;
	      S.omdb = res.omdb;
	      // init disk filter array
	      A.filtdisk();
	      // init checks
	      S.list.forEach(x => S.checks[x._id] = false);
	      S.checks['all'] = false;
	    })
	    .catch(A.error),
	  post: () =>
	    api.post('/', {body: postprep(S.qone)})
	    .then(res => {
	      S.list.push(res);
	      // re-init disk filter
	      A.filtdisk();
	      S.snackbar = {
	        text: 'Movie/series added.',
	        atext: 'view',
	        action: () => {
	          S.movie = res;
	          S.page  = 'info';
	          mithril.route.set('/movie');
	          S.snackbar = null;
	        }
	      };
	    })
	    .catch(A.error),
	  put: () =>
	    api.put('/' + S.movie._id, {body: S.movie})
	    .then(() => {
	      const index = S.list.findIndex(x => x._id === S.movie._id);
	      S.list[index] = clone(S.movie);
	      // re-init disk filter
	      A.filtdisk();
	      S.snackbar = {text: 'Movie(s)/series updated.'};
	    })
	    .catch(A.error),
	  del: solo => {
	    if (solo) S.checks[S.movie._id] = true;

	    const delone = (id, title) =>
	      api.del('/' + id + '/' + title)
	      .then(() => {
	        S.list = S.list.filter(x => x._id !== id);
	        S.checks[id] = false;
	        // re-init disk filter
	        A.filtdisk();
	      })
	      .catch(A.error);

	    Promise.all(
	      Object.keys(S.checks)
	      .filter(x => S.checks[x])
	      .map(x => {
	        const movie = S.list.find(y => y._id === x);
	        delone(x, movie.title);
	      })
	    )
	    .then(() => {
	      S.page = 'list';
	      mithril.route.set('/list');
	      S.snackbar = {text: 'Movie(s)/series deleted.'};
	    });
	  },

	  mm2hm: mins => {
	    let time = '';
	    if (+mins !== 0) {
	      const hh = +mins / 60 | 0;
	      const mm = ('0' + (+mins % 60)).slice(-2);
	      time = `${hh}:${mm}`;
	    }
	    return time
	  },

	  checkit: which => {
	    if (which === 'all') {
	      Object.keys(S.checks).forEach(x => S.checks[x] = !S.checks[x]);
	    }
	    else S.checks[which] = !S.checks[which];
	  },

	  selmovie: id => {
	    const index = S.list.findIndex(x => x._id === id);
	    // update data if needed
	    mithril.request(omdbapi('i', S.list[index].imdbid, S.omdb))
	    .then(res => {
	      update(S.list[index], res)
	      .then(() => {
	        S.movie  = clone(S.list[index]);
	        S.page   = 'info';
	        mithril.route.set('/movie');
	        S.season = 0;
	      })
	      .catch(A.error);
	    });
	  },

	  setfilter: (which, value) => {
	    S.filter[which] = 
	      value === 'Yes' ? true  :
	      value === 'No'  ? false :
	      value;
	  },
	  selclear: () => Object.keys(S.filters).forEach(x => S.filter[x] = S.filters[x][0]),

	  seen: () => {
	    const seenone = id => {
	      S.list[S.list.findIndex(x => x._id === id)].seen = true;

	      return api.put('/' + id, {body: S.list[S.list.findIndex(x => x._id === id)]})
	      .then(() => {
	        S.checks[id] = false;
	        S.snackbar = {text: 'Movie(s)/series updated.'};
	      })
	      .catch(A.error)
	    };

	    Promise.all(
	      Object.keys(S.checks)
	      .filter(x => S.checks[x] === true)
	      .map(x => seenone(x))
	    );
	  },

	  geteps: nr =>
	    mithril.request(omdbapi('i', S.movie.imdbid + '&Season=' + nr, S.omdb))
	    .then(result => {
	      S.eps = result;
	      S.season = nr;
	    })
	    .catch(A.error),

	  query: () =>
	    mithril.request(omdbapi('s', S.find, S.omdb))
	    .then(result => {
	      S.qres = result;
	      if (S.qres.Response === 'False') S.show = 'No results.';
	      else {
	        if (S.qres.totalResults !== '1') {
	          S.qpage = 1;
	          S.show  = 'list';
	        }
	        else {
	          mithril.request(omdbapi('i', S.qres.Search[0].imdbID, S.omdb))
	          .then(res => {
	            S.qone = res;
	            S.qone.seen = false;
	            S.show = 'one';
	          });
	        }
	      }
	    })
	    .catch(A.error),

	  queryid: id =>
	    mithril.request(omdbapi('i', id, S.omdb))
	    .then(res => {
	      S.qone = res;
	      S.qone.seen = false;
	      if (S.qone.totalSeasons) {
	        S.qone.seasonsowned = [...new Array(+S.qone.totalSeasons).fill(false)];
	        S.qone.seasonsseen  = [...new Array(+S.qone.totalSeasons).fill(false)];
	      }
	    })
	    .catch(A.error),
	  
	  isprev: p => (((+p - 1) * 10) + 1) !== 1,
	  isnext: (p, tot) => !(+p * 10 >= tot || +p * 10 > 1000),
	  isporn: porn =>
	    porn === 'prev'
	    ? A.isprev(S.qpage)
	    : A.isnext(S.qpage, +S.qres.totalResults),

	  querypage: porn => {
	    const page = '&page=' + (porn === 'next' ? ++S.qpage : --S.qpage);
	    return mithril.request(omdbapi('s', S.find + page, S.omdb))
	    .then(result => {S.qres = result;})
	    .catch(A.error)
	  }
	}) => A;

	const{isArray:t}=Array,{hasOwnProperty:r,getPrototypeOf:e}=Object,o=(...t)=>console.error("zaftig:",...t),n=(t,r={})=>e=>e in r?r[e]:r[e]=t(e),i=document.documentMode||/Edge\//.test(navigator.userAgent)?"ms":navigator.vendor?"webkit":"moz",s=t=>r.call(t,"width")?t:s(e(t)),a=Object.keys(s(document.documentElement.style)).filter(t=>t.indexOf("-")<0&&"length"!=t),c={},d={};a.concat(["backgroundColor","borderBottom","borderRadius","bottom","boxShadow","color","display","flexDirection","float","fontFamily","fontSize","height","margin","marginTop","marginBottom","opacity","padding","paddingBottom","right","textAlign","textDecoration","top","whiteSpace","width"].filter(t=>a.indexOf(t)>=0)).forEach(t=>{let r=t.replace(/[A-Z]/g,t=>"-"+t.toLowerCase());let e=(o=t)[0]+o.slice(1).replace(/[a-z]/g,"").toLowerCase();var o;0==t.toLowerCase().indexOf(i)?(e=e.slice(1),r="-"==r[0]?r:"-"+r,d[e]||(d[e]=r)):d[e]=r,c[r]=!0;});const u=document.createElement("div"),l=n(t=>["0","0 0"].some(r=>(u.style.cssText=`${t}: ${r};`,"px;"==u.style.cssText.slice(-3))),{flex:!1,border:!0,"border-left":!0,"border-right":!0,"border-top":!0,"border-bottom":!0}),f=/\s*,\s*/;class m$1{constructor(t){this.class=t,this.className=t;}toString(){return this.class}valueOf(){return "."+this.class}}const g=(t,r)=>t&&r?`\n${t} {\n${r}}\n`:"",h=r=>(e,...n)=>{try{return "string"==typeof e?r(e):t(e)?r(((t,r)=>t.reduce((t,e,o)=>t+e+(null==r[o]?"":String(r[o])),""))(e,n)):""}catch(t){return o("error `",e,"`",n,"\n",t),""}},p=()=>document.head.appendChild(document.createElement("style")),y=p(),b=(t,r="")=>{try{y.sheet.insertRule(`${t}{${r}}`,0);const e=r&&y.sheet.cssRules[0].cssText.replace(/\s/g,"");return y.sheet.deleteRule(0),!e||e.length>t.length+2}catch(t){return !1}},$=(t={})=>{const{helpers:r={},unit:e="px",id:s="z"+Math.random().toString(36).slice(2)}=t;let{style:a,debug:u=!1}=t,y=0;const v=(t,r,e)=>{const n=g(e?(t=>t.replace(/(::?)([a-z-]+)(\()?/gi,(t,r,e,o)=>("placeholder"==e&&"moz"!=i?e="input-"+e:"matches"==e&&(e="any"),"-"==e[0]||b(o?t+".f)":t)?t:r+"-"+i+"-"+e+(o||""))))(t):t,r);if(n){a||(a=p(),a.id=s);try{a.sheet.insertRule(n,a.sheet.cssRules.length),u&&(a.textContent+=n);}catch(n){!e&&t.indexOf(":")>=0?v(t,r,!0):o("insert failed",t,r,n);}}},_=t=>{t.t&&(t.o.forEach(r=>r.t&&(r.i=t.i+" and "+r.i)),t.i="@media "+t.i),t.s&&v(t.i,t.s.replace(/^/gm,"  ")+"\n"),t.o&&t.o.forEach(_);},x=(t,r,e="",o)=>{if(/^@(media|keyframes)/.test(t))return ((t,r,e="",o)=>{const n=0==t.indexOf("@media"),i={i:n?t.slice(t.indexOf(" ")+1):t,t:n,o:[],s:n?g(e,r.s):""};r.o.forEach(t=>x(t.i,t,":root"==e?"":e,i)),o?o.o.push(i):_(i);})(t,r,""==e?":root":e,o);!e||o&&!o.t||(t=((t,r)=>r.split(f).reduce((r,e)=>r.concat(t.split(f).map(t=>t.indexOf("&")>=0?t.replace(/&/g,e):e+(":"==t[0]||"["==t[0]?"":" ")+t)),[]).join(",\n"))(t,e)),o?o.s+=g(t,r.s):v(t,r.s),r.o.forEach(r=>x(r.i,r,":root"==t?"":t,o));},z=(t,e)=>{const o=r[t];return "function"==typeof o?o(...e?e.split(" "):[]):o&&o+" "+e},w=(t,r,n)=>{if(n&&!r&&(r=n,n=""),!r)return;if("$"==r[0]){if("$name"==r)return t.u=n;if("$compose"==r)return t.l=n;r="--"+r.slice(1);}const a=z(r,n);if(a){const r=O(a);return t.s+=r.s,void(t.o=t.o.concat(r.o))}if(!n)return u&&o("no value for",r);if(r=d[r]||r,!c[r]){const t=`-${i}-${r}`;c[t]&&(r=t);}n.indexOf("$")>=0&&(n=n.replace(/\$([a-z0-9-]+)/gi,"var(--$1)")),l(r)&&(n=n.split(" ").map(t=>isNaN(t)?t:t+e).join(" "));const f=`  ${r}: ${n};\n`;u&&!b(s,f)&&o("invalid css",f),t.s+=f;},O=n(t=>{const r=[{s:"",o:[]}];if(!(t=t&&t.trim()))return r[0];t+=";";let e=1,o="",n=0,i="",s="";for(let a=0;a<t.length;a++){const c=t[a];"\n"!=c&&(";"!=c&&"}"!=c||i)?"{"!=c||i?1==e?" "==c?(s=o.trim())&&(e=2,o=""):o+=c:2==e&&(i?c==i&&"\\"!=t[a-1]&&(i=""):"'"!=c&&'"'!=c||(i=c),o+=c):(r[++n]={i:z(s,o.trim())||(s+" "+o).trim(),s:"",o:[]},e=1,s=o=""):(w(r[n],s,o.trim()+i),"}"==c&&r[--n].o.push(r.pop()),e=1,s=o=i="");}return r[0]}),S=n(t=>{const r="anim-"+s+"-"+(y+=1);return x("@keyframes "+r,O(t)),r}),k=n(t=>{const r=O(t),e=(r.u?r.u.replace(/\s+/,"-")+"-":"")+s+"-"+(y+=1);return x("."+e,r),new m$1(e+(r.l?" "+r.l:""))}),A=h(k);return A.global=h(t=>x(":root",O(t))),A.anim=h(S),A.style=h(t=>O(t).s),A.getSheet=()=>a,A.helper=t=>Object.assign(r,t),A.setDebug=t=>u=t,A.new=$,A};var z = $();

	const Content = {
	  // error
	  error: {
	    view: ({attrs: {S, content: {header, text}}}) =>
	      mithril('div' +z`m auto; bsi; size 600 300; bc #fff; p 20 16 16 16; rel; shadow; tal; ofy auto`,
	        mithril('div' +z`fs 18; fw 500; pb 13; c #3c3c3c`, header || 'Error'),
	        mithril('div' +z`fs 14`, mithril.trust(text)),
	        mithril('div' +z`abs; prb 24 16`,
	          mithril('span.material-icons' +z`c #616161; pointer; :hover {c #33b679}`, {
	            onclick: () => S.modal = null
	          }, 'thumb_up')
	        )
	      )
	  },

	  // delete confirmation
	  delok: {
	    view: ({attrs: {S, content: {text, click}}}) =>
	      mithril('div' +z`m auto; bsi; size 500 140; bc #fff; p 20 16 16 16; shadow; tal`,
	        mithril('div' +z`fs 18; fw 500; pb 13; c #3c3c3c`, 'Are you sure?'),
	        mithril('div' +z`fs 14`, text),
	        mithril('div' +z`f right`,
	          mithril('span.material-icons' +z`m 16 24 0 0; c #616161; pointer; :hover {c #33b679}`, {
	            onclick: () => {S.modal = null; click();}
	          }, 'thumb_up'),
	          mithril('span.material-icons' +z`mr 8; c #616161; pointer; :hover {c #ed2024}`, {
	            onclick: () => S.modal = null
	          }, 'cancel')
	        )
	      )
	  }
	};

	const Modal = {
	  view: ({attrs: {S}}) =>
	    mithril('div',
	      mithril('div' +z`dt; abs; plt 0; size 100%; zi 99`,
	        mithril('div' +z`d table-cell; va middle`,
	          mithril(Content[S.modal.type], {S, content: S.modal.content})
	        )
	      ),
	      mithril('.overlay' +z`db; zi 90; bc #000; fix; plt 0; size 100%; o .3`)
	    )
	};

	const Snackbar = () => {
	  let open = false;

	  setTimeout(() => {open = true;  mithril.redraw();}, 50);
	  setTimeout(() => {open = false; mithril.redraw();}, 5000);
	  setTimeout(() => {State.snackbar = null; mithril.redraw();}, 6000);

	  return {
	    view: ({attrs: {text, atext, action}}) =>
	      mithril('div' +z`zi 99; rel; plb -50% -100; tra all 1s ease-out`, {
	          style: open
	            ? z.style`b 36`
	            : z.style`b -100`
	        },
	        mithril('div' +z`bsi; size 344 48; bc #323232; c #dedede; fs 14;
          bo 1 solid transparent; shadow; bor 4`,
	          mithril('div' +z`p 8 0 8 16; h 36; m 6 0; default`, text),
	          atext &&
	          mithril('div' +z`bsi; h 36; m 6 16; fw 500; tt uppercase;
            rel; prt -4 -59; pt 9; c #349cfb; tar; pointer`, {
	            onclick: action
	          }, atext)
	        )
	      )
	  }
	};

	const Layout = ({attrs: {A}}) => {
	  A.get();
	  A.selclear();

	  return {
	    view: ({attrs: {S}, children}) =>
	      mithril('div' +z`size 100vw 100vh; center; m 0 auto; bc #2f5dab; of hidden`,
	        mithril('div' +z`m auto; bc #fff; prb 0; tac; rel; w 80%; h calc(100vh - 32px)`,
	          mithril('img', {src: 'images/movies.png'}),
	          children,
	          S.modal && mithril(Modal, {S}),
	          S.snackbar &&
	          mithril('div' +z`abs; plb 50% 0; w 344`,
	            mithril(Snackbar, S.snackbar)
	          )
	        )
	      )
	  }
	};

	const Login = ({attrs: {A}}) => {
	  sessionStorage.removeItem('movtok');

	  const texts = [
	    'Who disabled an unmarked unit, with a banana?',
	    'Shall we play a game?',
	    `Aren't you a little short for a stormtrooper?`,
	    'Is it safe?',
	    'Why so serious?',
	    'What is the air speed velocity of an unladen swallow?',
	    `What's in the box?`,
	    'You know what they call a Quarter Pounder with cheese in France?',
	    'Who is Keyser Söze?',
	    'Wanna know how I got these scars?'
	  ];
	  
	  const errors = [
	    `I can't do that, Dave.`,
	    `Frankly, my dear, I don't give a damn.`,
	    'Just keep swimming...just keep swimming...',
	    `What we've got here is failure to communicate.`,
	    `Fasten your seatbelts. It's going to be a bumpy night.`,
	    'Rosebud.',
	    `You can't handle the truth!`,
	    `Well, nobody's perfect.`,
	    'Houston, we have a problem.',
	    'Hasta la vista, baby.'
	  ];
	  
	  const ran = nr => (Math.random() * nr) | 0;

	  let pass;
	  let text = texts[ran(10)];
	  let show = false;
	  let emsg = '';

	  // wait with showing the prompt
	  setTimeout(() => {show = true; mithril.redraw();}, (text.length*100) + 200);

	  const engage = () => {
	    A.login(pass)
	    .then(res => {
	      try {sessionStorage.setItem('movtok', res.token);}
	      catch(err) {A.error(err);}

	      mithril.route.set('/');
	    })
	    .catch(err => {
	      if (err.code === 401) {
	        emsg = errors[ran(10)];
	        mithril.redraw();
	      }
	      else A.error(err);
	    });
	  };

	  return {
	    view: () => [
	      mithril('div' +z`abs; plt 0; size 100vw 100vh; bc #000; ff VT323; fs 24; c #44ff00; center`,
	        mithril('div' +z`w ${text.length * 10}; tal`,
	          mithril('span', {
	            oncreate: ({dom}) => {
	              for (let i=0; i < text.length; i++) setTimeout(() => dom.innerHTML += text[i], (i+1)*90);
	            }
	          }),
	          mithril('br'),
	          mithril('div',
	            show && mithril('span', '>'),
	            show && mithril('span#blink', {
	              oncreate: () => setInterval(() => blink.style.visibility = (blink.style.visibility== 'hidden' ? 'visible' : 'hidden'), 500),
	              onremove: () => clearInterval()
	            }, '_'),
	            mithril('input' +z`rel; bc #000; c transparent; bo 0; caret-color transparent; size 0; :focus {outline 0}; zi -1`, {
	              type: 'password',
	              oncreate: ({dom}) => dom.focus(),
	              onupdate: ({dom}) => dom.focus(),
	              oninput: e => pass = e.target.value,
	              onkeydown: e => {if (e.key === 'Enter') engage();},
	              value: pass
	            })
	          )
	        ),
	        emsg &&
	        mithril('div' +z`abs; m 0 auto; pt 120; w ${emsg.length * 10}; tal; zi 1`, {
	          oncreate: ({dom}) => {
	            for (let i=0; i < emsg.length; i++) setTimeout(() => dom.innerHTML += emsg[i], (i+1)*90);
	            setTimeout(() => {emsg = ''; mithril.redraw();}, (emsg.length*100) + 500);
	          },
	          onremove: () => clearTimeout()
	        })
	      )
	    ]
	  }
	};

	const Checkbox = {
	  view: ({attrs: {checked, onchange}}) =>
	    mithril('label' +z`db; pointer; us none`, {
	        onclick: e => e.stopPropagation()
	      },
	      mithril('input' +z`dn; :checked ~ div {bc #fff; :after {db}}`, {
	          type: 'checkbox',
	          checked,
	          onchange
	        }
	      ),
	      mithril('div' +z`size 18; bc #f5f5f5; bo 1 solid #d2d2d2;
        :hover {bo 1 solid #616161};
        :after {dn; rel; content ''; plt 5 -4; size 6 15; bo solid #008000; bow 0 3.4 3.4 0; transform rotate(35deg)}`
	      )
	    )
	};

	const List = {
	  view: ({attrs: {S,A}}) =>
	    mithril('div',
	      mithril('div' +z`tal; mb 12`,
	        mithril('span' +z`rel`,
	          mithril('input' +z`bsi; size 300 36; ml 16; pl 40; bo 1 solid #d2d2d2; fs 13`, {
	            placeholder: 'Search title...',
	            oninput: e => S.search = e.target.value,
	            value: S.search
	          }),
	          mithril('span.material-icons' +z`abs; plt 22 -1; c #acacac`, 'search'),
	          mithril('span.material-icons' +z`abs; plt 285 -2; c #616161; pointer; :hover{c #349cfb}`, {
	            onclick: () => S.search = ''
	          }, 'close')
	        ),
	        mithril('span',
	          mithril('a.material-icons' +z`m 0 24 0 12; va -7; c #616161; pointer; :hover {c #349cfb}`, {
	            onclick: () => {S.page = 'add'; mithril.route.set('/add');}
	          }, 'add'),
	          mithril('span' +z`va -8; tra o 0.2s ease-in`, {
	              style: Object.keys(S.checks).some(x => S.checks[x] === true)
	                ? z.style`o 1; default`
	                : z.style`o 0; default`
	            },
	            mithril('a.material-icons' +z`mr 24; c #616161; pointer; :hover {c #33b679}`, {
	              onclick: () => A.seen()
	            }, 'check_circle'),
	            mithril('a.material-icons' +z`mr 24; c #616161; pointer; :hover {c #ed2024}`, {
	              onclick: () => S.modal = {
	                type: 'delok',
	                content: {
	                  text: `You are about to delete ${Object.keys(S.checks).filter(x => S.checks[x]).length} movie(s)...continue?`,
	                  click: () => A.del(false)
	                }
	              }
	            }, 'delete')
	          )
	        ),
	        mithril('span' +z`nowrap`,
	          Object.keys(S.filters).map(x =>
	            mithril('select' +z`p 4 8`, {
	                onchange: e => {
	                  A.setfilter(x, e.target.value);
	                  e.target.blur();
	                }
	              },
	              S.filters[x].map(y =>
	                mithril('option' +z`p 4 0`, {selected: y === S.filter[x]}, y)
	              )
	            )
	          ),
	          mithril('a.material-icons' +z`m 0 24; va -7; c #616161; pointer; :hover {c #349cfb}`, {
	            onclick: () => A.selclear()
	          }, 'cancel')
	        ),
	        mithril('span' +z`f right; mt 8`,
	          ['alphabetic','id ascending','id descending'].map(x =>
	            mithril('span.material-icons' +z`mr 16; ${S.sort === x && 'c #349cfb'}; pointer; :hover {c #349cfb}`, {
	              onclick: () => S.sort = x
	            }, x === 'alphabetic' ? 'sort_by_alpha' : x === 'id ascending' ? 'arrow_upward' : 'arrow_downward')
	          )
	        )
	      ),
	      mithril('div' +z`dg gtc auto; gtr auto; gta 'table'; bt 1 solid #d2d2d2`,
	        mithril('div' +z`ga 'table'; h calc(100vh - 193px); of auto`,
	          mithril('table' +z`w 100%; ofy auto; coll`,
	            mithril('thead' +z`w 100%; rel; zi 10; th {p 8 16; bc #f5f5f5; position sticky; t 0; pr 1em; bs 0 1 0 0 #d2d2d2}`,
	              mithril('tr',
	                mithril('th', ''),
	                mithril('th' +z`tac`, '#'),
	                mithril('th' +z`tal`, 'Title'),
	                mithril('th' +z`tal`, 'Time'),
	                mithril('th' +z`tal`, 'Year'),
	                mithril('th' +z`tal`, 'Type'),
	                mithril('th' +z`tal`, 'Genre'),
	                mithril('th' +z`tar`, 'Disk'),
	                mithril('th', 'Seen')
	              )
	            ),
	            mithril('tbody' +z`td {bsi; p 8 16; h 36; bb 1 solid #f5f5f5}`,
	              S.list
	              .filter(x =>
	                (S.filter.time  !== '< Time' && A.mm2hm(x.runtime) > S.filter.time)     ||
	                (S.filter.yrgt  !== '> Year' && x.year < S.filter.yrgt)                 ||
	                (S.filter.yrlt  !== '< Year' && x.year > S.filter.yrlt)                 ||
	                (S.filter.type  !== 'Type'   && x.type !== S.filter.type)               ||
	                (S.filter.genre !== 'Genre'  && x.genre.indexOf(S.filter.genre) === -1) ||
	                (S.filter.disk  !== 'Disk'   && x.disk !== S.filter.disk)               ||
	                (S.filter.seen  !== 'Seen'   && x.seen !== S.filter.seen)               ||
	                (x.title.toLowerCase().indexOf(S.search.toLowerCase()) === -1)
	                ? false
	                : true
	              )
	              .sort((a,b) =>
	                S.sort === 'alphabetic'
	                ? (a.title.toLowerCase() > b.title.toLowerCase() ? 1 : -1)
	                : S.sort === 'id ascending'
	                  ? (a._id > b._id ? 1 : -1)
	                  : (a._id < b._id ? 1 : -1)
	              )
	              .map((x,i) =>
	                mithril('tr' +z`nowrap; pointer; :hover {bc #efefef}`, {onclick: () => A.selmovie(x._id)},
	                  mithril('td',
	                    mithril(Checkbox, {checked: S.checks[x._id], onchange: () => A.checkit(x._id)})
	                  ),
	                  mithril('td', i+1),
	                  mithril('td' +z`tal`, x.title),
	                  mithril('td' +z`tal`, A.mm2hm(x.runtime)),
	                  mithril('td' +z`tal`, x.year),
	                  mithril('td' +z`tal`, x.type),
	                  mithril('td' +z`tal`, x.genre),
	                  mithril('td' +z`tar`, x.disk),
	                  mithril('td' +z`tac`,
	                    x.seen
	                    ? mithril('img' +z`va -2`, {src: 'images/checkmark-16.png'})
	                    : mithril('img' +z`va -2`, {src: 'images/xmark-16.png'})
	                  )
	                )
	              )
	            )
	          )
	        )
	      )
	    )
	};

	const Info = {
	  view: ({attrs: {S,A}}) =>
	    mithril('div',
	      mithril('h1',
	        S.movie.year
	        ? `${S.movie.title} (${S.movie.year})`
	        : S.movie.title
	      ),
	      ['plot','director','writer','cast'].map(x =>
	        mithril('div' +z`${x === 'writer' && 'mb 12'}`,
	          x === 'plot'
	          ? mithril('div' +z`fw bold`, 'plot:')
	          : mithril('b' +z`mr 6`, `${x}: `),
	          mithril('span', S.movie[x])
	        )
	      ),
	      mithril('div' +z`dg; gtc 50% 50%; gtr auto; gta 'left right'`,
	        mithril('div' +z`ga left`,
	          ['country','language','originaltitle','runtime','genre','type'].map(x =>
	            mithril('div',
	              x === 'originaltitle'
	              ? mithril('b' +z`mr 6`, 'original title: ')
	              : mithril('b' +z`mr 6`, `${x}: `),
	              x === 'runtime'
	              ? mithril('span', A.mm2hm(S.movie.runtime))
	              : mithril('span', S.movie[x])
	            )
	          )
	        ),
	        mithril('div' +z`ga right`,
	          ['rating','metascore','imdb','disk','seen','notes'].map(x =>
	            mithril('div',
	              mithril('b' +z`mr 6`, `${x}: `),
	              x === 'imdb'
	              ? mithril('a', {
	                  href: `https://www.imdb.com/title/${S.movie.imdbid}`,
	                  target: '_blank'
	                }, `https://www.imdb.com/title/${S.movie.imdbid}`)
	              : x === 'seen'
	                ? S.movie.seen
	                  ? mithril('img' +z`va -2`, {src: 'images/checkmark-16.png'})
	                  : mithril('img' +z`va -4`, {src: 'images/xmark-16.png'})
	                : mithril('span', S.movie[x])
	            )
	          )
	        )
	      )
	    )
	};

	const Infos = {
	  view: ({attrs: {S,A}}) =>
	    mithril('div' +z`dg; gtc 50% 50%; gtr auto; gta 'left right'; mt 24`,
	      mithril('div' +z`ga left`,
	        mithril('table' +z`coll`,
	          mithril('thead',
	            mithril('th' +z`dib; w 95; fw bold; pt 4`, 'seasons:'),
	            mithril('th' +z`p 4 16 4 1`, 'O'),
	            mithril('th' +z`p 4 16 4 1`, 'S')
	          ),
	          mithril('tbody' +z`td {p 4 16 4 0}; img {va -2}`,
	            Object.values(S.movie.seasonsowned).map((s,i) => [
	              mithril('tr',
	                mithril('td' +z`pl 1`,
	                  mithril('a', {
	                    onclick: () => A.geteps(i+1)
	                  }, 'season ' + (i+1))
	                ),
	                mithril('td',
	                  mithril('span', s
	                    ? mithril('img', {src: 'images/checkmark-16.png'})
	                    : mithril('img', {src: 'images/xmark-16.png'})
	                  )
	                ),
	                mithril('td',
	                  mithril('span', S.movie.seasonsseen[i]
	                    ? mithril('img', {src: 'images/checkmark-16.png'})
	                    : mithril('img', {src: 'images/xmark-16.png'})
	                  )
	                )
	              )
	            ])
	          )
	        )
	      ),
	      S.season > 0 &&
	      mithril('div' +z`ga right`,
	        mithril('table',
	          mithril('thead' +z`th {p 4 16 4 1}`,
	            mithril('th'),
	            mithril('th', 'Season ' + S.season)
	          ),
	          mithril('tbody' +z`td {p 4 16 4 0}`,
	            S.eps.Episodes.map(ep => [
	              mithril('tr',
	                mithril('td', ep.Episode + '.'),
	                mithril('td',
	                  mithril('a', {href: 'https://www.imdb.com/title/' + ep.imdbID, target: '_blank'}, ep.Title)
	                )
	              )
	            ])
	          )
	        )
	      )
	    )
	};

	const Edit = {
	  view: ({attrs: {S}}) =>
	    mithril('div' +z`bsi; p 36 36 0 0; label {dib; w 120; fw bold}`,
	      mithril('div' +z`mb 20`,
	        mithril('label', 'title'),
	        mithril('input' +z`bsi; size 460 32`, {
	          oninput: e => S.movie.title = e.target.value,
	          value: S.movie.title
	        })
	      ),
	      mithril('div' +z`mb 20`,
	        mithril('label', 'original title'),
	        mithril('input' +z`bsi; size 460 32`, {
	          oninput: e => S.movie.originaltitle = e.target.value,
	          value: S.movie.originaltitle
	        })
	      ),
	      mithril('div' +z`mb 20`,
	        mithril('label' +z`va top; mt 8`, 'notes'),
	        mithril('textarea' +z`dib; bsi; size 460 64; p 8 8 8 14; ff Open Sans; fs 14; c #616161; resize none; ofy auto`, {
	          oninput: e => S.movie.notes = e.target.value,
	          value: S.movie.notes
	        })
	      ),
	      mithril('div' +z`mb 20`,
	        mithril('label', 'disk'),
	        mithril('input' +z`bsi; size 32; pl 0; tac`, {
	          oninput: e => S.movie.disk = e.target.value,
	          value: S.movie.disk
	        })
	      ),
	      mithril('div',
	        mithril('label', 'seen'),
	        mithril('span' +z`dib; va -4`,
	          mithril(Checkbox, {checked: S.movie.seen, onchange: () => S.movie.seen = !S.movie.seen})
	        )
	      )
	    )
	};

	const Edits = {
	  view: ({attrs: {S}}) =>
	    mithril('div' +z`m 36 36 24 0`,
	      mithril('table' +z`coll`,
	        mithril('thead',
	          mithril('th' +z`dib; w 95; fw bold; pt 4`, 'seasons:'),
	          mithril('th' +z`p 4 16 4 5`, 'O'),
	          mithril('th' +z`p 4 16 4 5`, 'S')
	        ),
	        mithril('tbody' +z`td {p 4 16 4 0}; span {dib; va -4}`,
	          Object.keys(S.movie.seasonsowned).map((s,i) => [
	            mithril('tr',
	              mithril('td' +z`dib; w 97; pl 1`, 'season ' + (i+1)),
	              mithril('td',
	                mithril('span',
	                  mithril(Checkbox, {
	                    checked: S.movie.seasonsowned[i],
	                    onchange: () => S.movie.seasonsowned[i] = !S.movie.seasonsowned[i]
	                  })
	                )
	              ),
	              mithril('td',
	                mithril('span',
	                  mithril(Checkbox, {
	                    checked: S.movie.seasonsseen[i],
	                    onchange: () => S.movie.seasonsseen[i] = !S.movie.seasonsseen[i]
	                  })
	                )
	              )
	            )
	          ])
	        )
	      )
	    )
	};

	const Movie = {
	  view: ({attrs: {S,A}}) =>
	    mithril('div' +z`tal`,
	      mithril('div' +z`h 36; pl 36; mb 36; bb 1 solid #d2d2d2; a {mr 24; c #616161; pointer; :hover {c #349cfb}}`,
	        mithril('span',
	          mithril('a.material-icons', {
	            onclick: () => {S.page = 'list'; mithril.route.set('/list');}
	          }, 'home')
	        ),
	        S.page === 'info'
	        ? mithril('span',
	            mithril('a.material-icons', {
	              onclick: () => S.page = 'edit'
	            }, 'edit')
	          )
	        : mithril('span',
	            mithril('a.material-icons', {
	              onclick: () => {S.page = 'info'; mithril.route.set('/movie');}
	            }, 'visibility')
	          ),
	        mithril('span',
	          mithril('a.material-icons' +z`:hover {c #ed2024}`, {
	            onclick: () => S.modal = {
	              type: 'delok',
	              content: {
	                text: `Delete ${S.movie.title}?`,
	                click: () => A.del(true)
	              }
	            }
	          }, 'delete')
	        ),
	        S.page === 'info'
	        ? mithril('span',
	            mithril('a.material-icons', {
	              onclick: () => {S.page = 'add'; mithril.route.set('/add');}
	            }, 'add')
	          )
	        : mithril('span',
	            mithril('a.material-icons', {
	              onclick: () => A.put().then(() => {S.page = 'info'; mithril.route.set('/movie');})
	            }, 'save')
	          )
	      ),
	      mithril('div' +z`dg; gtc 67% 33%; gtr auto; gta 'info poster'; ofy auto; h calc(100vh - 217px)`,
	        mithril('div' +z`ga info; bsi; p 0 36`,
	          S.page === 'info' && mithril(Info, {S,A}),
	          S.page === 'edit' && mithril(Edit, {S}),
	          mithril('div',
	            S.page === 'info' && S.movie.type === 'series'  ? mithril(Infos, {S,A}) :
	            S.page === 'edit' && S.movie.type === 'series' && mithril(Edits, {S,A})
	          )
	        ),
	        mithril('div' +z`ga poster; tac; pt 20`,
	          mithril('img' +z`bs 0 1 5 1 rgba(0,0,0,0.5)`, {src: S.movie.poster})
	        )
	      )
	    )
	};

	const Adds = {
	  view: ({attrs: {S}}) =>
	    mithril('div' +z`m 18 36 24 0`,
	      mithril('table' +z`coll`,
	        mithril('thead',
	          mithril('th' +z`dib; w 95; pt 4`, 'seasons:'),
	          mithril('th' +z`p 4 16 4 4`, 'O'),
	          mithril('th' +z`p 4 16 4 5`, 'S')
	        ),
	        mithril('tbody' +z`td {p 4 16 4 0}`,
	          [...new Array(+S.qone.totalSeasons).keys()].map(i =>
	            mithril('tr' +z`span {dib; va -4}`,
	              mithril('td' +z`dib; w 97; pl 1`, 'season ' + (i+1)),
	              mithril('td',
	                mithril('span',
	                  mithril(Checkbox, {
	                    checked: S.qone.seasonsowned[i],
	                    onchange: () => S.qone.seasonsowned[i] = !S.qone.seasonsowned[i]
	                  })
	                )
	              ),
	              mithril('td',
	                mithril('span',
	                  mithril(Checkbox, {
	                    checked: S.qone.seasonsseen[i],
	                    onchange: () => S.qone.seasonsseen[i] = !S.qone.seasonsseen[i]
	                  })
	                )
	              )
	            )
	          )
	        )
	      )
	    )
	};

	const Addone = {
	  view: ({attrs: {S,A}}) =>
	    mithril('div' +z`ofy auto; h calc(100vh - 242px)`,
	      mithril('div' +z`bsi; p 0 36`,
	        mithril('div' +z`dg; gtc 50% 50%; gtr auto; gta 'left right'`,
	          mithril('div' +z`ga left`,
	            mithril('h2',
	              S.qone.Year
	              ? `${S.qone.Title} (${S.qone.Year})`
	              : S.qone.Title
	            ),
	            ['Plot','Director','Writer','Cast'].map(x =>
	              mithril('div' +z`mb 12`,
	                x === 'Plot'
	                ? mithril('div' +z`fw bold`, 'plot:')
	                : mithril('b' +z`mr 6`, `${x.toLowerCase()}: `),
	                x === 'Cast'
	                ? mithril('span', S.qone.Actors)
	                : mithril('span', S.qone[x])
	              )
	            ),
	            ['Country','Language','Runtime','Genre','Type'].map(x =>
	              mithril('div' +z`${x === 'Genre' ? 'mb 12' : ''}`,
	                mithril('b' +z`mr 6`, `${x.toLowerCase()}: `),
	                x === 'Runtime'
	                ? mithril('span', A.mm2hm(S.qone.Runtime.split(' ')[0] || 0))
	                : mithril('span', S.qone[x])
	              )
	            ),
	            ['Rating','Metascore','imdb'].map(x =>
	              mithril('div',
	                mithril('b' +z`mr 6`, `${x.toLowerCase()}: `),
	                x === 'imdb'
	                ? mithril('a', {
	                    href: `https://www.imdb.com/title/${S.qone.imdbID}`,
	                    target: '_blank'
	                  }, `https://www.imdb.com/title/${S.qone.imdbID}`)
	                : x === 'Rating'
	                  ? mithril('span', S.qone.imdbRating)
	                  : mithril('span', S.qone[x])
	              )
	            ),
	            mithril('div', S.qone.Type === 'series' && mithril(Adds, {S}))
	          ),
	          mithril('div' +z`ga right`,
	            mithril('div' +z`tar; mt 20`,
	              mithril('img' +z`bs 0 1 5 1 rgba(0,0,0,0.5)`, {src: S.qone.Poster}),
	              mithril('div' +z`tal; m 24 0 0 68`,
	                mithril('label' +z`dib; w 60; fw bold`, 'disk'),
	                mithril('input' +z`bsi; size 32; pl 0; tac`, {
	                  oninput: e => S.qone.disk = e.target.value,
	                  value: S.qone.disk
	                }),
	                mithril('span' +z`f right; m 10 24 0 0`,
	                  mithril('a.material-icons' +z`fs 48; c #616161; pointer; :hover {c #349cfb}`, {
	                    onclick: () => A.post()
	                  }, 'save')
	                )
	              ),
	              mithril('div' +z`tal; m 10 0 0 68`,
	                mithril('label' +z`dib; w 60; fw bold`, 'seen'),
	                mithril('span' +z`dib; va -4`,
	                  mithril(Checkbox, {checked: S.qone.seen, onchange: () => S.qone.seen = !S.qone.seen})
	                )
	              )
	            )
	          )
	        )
	      )
	    )
	};

	const Addlist = {
	  view: ({attrs: {S,A}}) =>
	    mithril('div' +z`p 0 36; ofy auto; h calc(100vh - 242px)`,
	      mithril('h4', `Found: ${S.qres.totalResults}`,
	        mithril('span' +z`ml ${(((+S.qpage - 1) * 10) + 1) < 10 ? 108 : 100}`,
	          (((+S.qpage - 1) * 10) + 1)
	          + ' - '
	          + (+S.qpage * 10 > S.qres.totalResults ? S.qres.totalResults : +S.qpage * 10)
	        ),
	        mithril('span' +z`ml 100`,
	          mithril('span.material-icons' +z`mr 20; va -7; us none; v ${A.isporn('prev') ? 'visible' : 'hidden'}; pointer; :hover {c #349cfb}`, {
	            onclick: () => {
	              if (A.isporn('prev')) A.querypage('prev');
	            }
	          }, 'keyboard_arrow_left'),
	          mithril('span.material-icons' +z`va -7; us none; v ${A.isporn('next') ? 'visible' : 'hidden'}; pointer; :hover {c #349cfb}`, {
	            onclick: () => {
	              if (A.isporn('next')) A.querypage('next');
	            }
	          }, 'keyboard_arrow_right')
	        )
	      ),
	      mithril('div',
	        S.qres.Search.map((x,i) =>
	          mithril('div' +z`bsi; h 24; lh 24; mb 5; ${S.qres.Search[i].imdbID === S.qone.imdbID && 'c #349cfb'};
            :hover {${S.qres.Search[i].imdbID === S.qone.imdbID ? 'default' : 'c #349cfb; pointer'}}`, {
	              onclick: () => A.queryid(S.qres.Search[i].imdbID)
	            },
	            mithril('span' +z`mr 8; ml ${i < 9 ? 8 : 0}`, `${i+1}.`),
	            mithril('span', x.Title),
	            mithril('span', ` (${x.Year})`),
	            mithril('span', ` - ${x.Type}`)
	          )
	        )
	      )
	    )
	};

	const Add = {
	  view: ({attrs: {S,A}}) =>
	    mithril('div' +z`tal`,
	      mithril('div' +z`h 36; pl 36; mb 24; bb 1 solid #d2d2d2`,
	        mithril('span',
	          mithril('a.material-icons' +z`mr 24; c #616161; pointer; :hover {c #349cfb}`, {
	            onclick: () => {S.page = 'list'; mithril.route.set('/list');}
	          }, 'home')
	        )
	      ),
	      mithril('span' +z`rel`,
	        mithril('input' +z`bsi; size 300 36; ml 36; pl 40; bo 1 solid #d2d2d2; fs 13`, {
	          placeholder: 'Search title...',
	          onfocus: () => {
	            S.show = '';
	            S.qres = {};
	            S.qone = {};
	          },
	          oninput: e => S.find = e.target.value,
	          onkeyup: e => {
	            S.find = e.target.value;
	            if (e.keyCode === 13) e.target.blur();
	          },
	          onblur: e => {
	            if (e.target.value) {
	              S.show = 'searching';
	              A.query();
	            }
	          },
	          value: S.find
	        }),
	        mithril('span.material-icons' +z`abs; plt 42 -1; c #acacac`, 'search'),
	        mithril('span.material-icons' +z`abs; plt 305 -2; c #616161; pointer; :hover {c #349cfb}`, {
	          onclick: () => S.find = ''
	        }, 'close')
	      ),
	      mithril('div' +z`dg; gtc 50% 50%; gtr auto; gta 'left right'`,
	        mithril('div' +z`ga left`,
	          S.show === 'one'  ? mithril(Addone, {S,A})  :
	          S.show === 'list' ? mithril(Addlist, {S,A}) :
	          S.show === 'Searching...' || S.show === 'No results.' &&
	          mithril('h3' +z`pl 36; mt 24`, S.show)
	        ),
	        mithril('div' +z`ga right`,
	          S.show === 'list' && Object.keys(S.qone).length > 0 &&
	          mithril(Addone, {S,A})
	        )
	      )
	    )
	};

	// z.setDebug(true)
	z.helper({
	  f :  `float`, //Edge translates f to font
	  bo:  `border`, //bo = backgroundOrigin
	  bl:  `border-left`,
	  br:  `border-right`, //use br, and bor for borderRadius
	  bt:  `border-top`,
	  bb:  `border-bottom`,
	  boc: `border-color`,
	  bow: `border-width`,
	  bor: `border-radius`,
	  boh: (...x) => `border-top ${x.join(' ')}; border-bottom ${x.join(' ')}`,
	  bov: (...x) => `border-left ${x.join(' ')}; border-right ${x.join(' ')}`,

	  coll: `border-collapse collapse`,

	  db : `d block`,
	  df : `d flex`,
	  dg : `d grid`,
	  di : `d inline`, //default
	  dn : `d none`,
	  ds : `d subgrid`,
	  dt : `d table`,
	  dib: `d inline-block`,

	  tac: `ta center`,
	  tal: `ta left`,
	  tar: `ta right`,

	  lh : x => `line-height ${x}px`,
	  lhn: `line-height normal`,

	  abs: `position absolute`,
	  rel: `position relative`,
	  fix: `position fixed`,

	  mb : `margin-bottom`,
	  ml : `margin-left`,
	  mr : `margin-right`,
	  mt : `margin-top`,
	  pb : `padding-bottom`,
	  pl : `padding-left`,
	  pr : `padding-right`,
	  pt : `padding-top`,

	  fw : `font-weight`,
	  
	  of : `overflow`,
	  ofx: `overflow-x`,
	  ofy: `overflow-y`,

	  bsi: `box-sizing border-box`,
	  cur: `cursor`,
	  lis: `list-style`, //ls = letterSpacing
	  mah: `max-height`, //mh
	  mih: `min-height`,
	  maw: `max-width`,
	  miw: `min-width`,
	  tes: `text-shadow`, // ts = tabsize => tes
	  tra: `transition`,

	  plt: (l, t=l) => `l ${l}; t ${t}`,
	  prt: (r, t=r) => `r ${r}; t ${t}`,
	  plb: (l, b=l) => `l ${l}; b ${b}`,
	  prb: (r, b=r) => `r ${r}; b ${b}`,

	  size: (w, h=w) => `w ${w}; h ${h}`,

	  default: `cursor default`,
	  pointer: `cursor pointer`,
	  text   : `cursor text`,

	  shadow : `box-shadow 0 2 5 0 rgba(0,0,0,0.4)`,

	  center: `d flex; jc center; ai center`,
	  nowrap: `ws nowrap`
	});

	z.global`
  html, body {m 0; p 0; ff Open Sans, sans-serif; fs 14; c #616161; bc #fff}
  a          {c #349cfb; td none; pointer}
  input      {bsi; pl 14; ff Open Sans, sans-serif; fs 14;
              c #616161; bc #fff; bo 1 solid #d2d2d2; outline none;
              :hover        {bo 1 solid #616161}
              :focus        {bo 1 solid #349cfb}
              ::placeholder {c #acacac}
             }
`;

	const S = State$1();
	const A = Actions(S);

	const routes = {
	  '/'     : {
	    onmatch: () => {
	      if (sessionStorage.getItem('movtok')) mithril.route.set('/list');
	      else mithril.route.set('/login');
	    }
	  },
	  '/login': {render: () => mithril(Login, {A})},
	  '/list' : {render: () => mithril(Layout, {S,A}, mithril(List,  {S,A}))},
	  '/movie': {render: () => mithril(Layout, {S,A}, mithril(Movie, {S,A}))},
	  '/add'  : {render: () => mithril(Layout, {S,A}, mithril(Add,   {S,A}))}
	};

	const check = () => {
	  if (!sessionStorage.getItem('movtok')) mithril.route.set('/login');
	};

	const skip = ['/', '/login'];
	Object.keys(routes).forEach(x => {
	  if (!skip.includes(x)) routes[x].onmatch = check;
	});

	mithril.route(document.body, '/', routes);

}());
