/** @format */

"use strict"
;(self.webpackChunkaction_masterminds =
	self.webpackChunkaction_masterminds || []).push([
	[6792],
	{
		3905: function (e, t, n) {
			n.d(t, {
				Zo: function () {
					return u
				},
				kt: function () {
					return d
				}
			})
			var r = n(7294)
			function a(e, t, n) {
				return (
					t in e
						? Object.defineProperty(e, t, {
								value: n,
								enumerable: !0,
								configurable: !0,
								writable: !0
						  })
						: (e[t] = n),
					e
				)
			}
			function i(e, t) {
				var n = Object.keys(e)
				if (Object.getOwnPropertySymbols) {
					var r = Object.getOwnPropertySymbols(e)
					t &&
						(r = r.filter(function (t) {
							return Object.getOwnPropertyDescriptor(e, t).enumerable
						})),
						n.push.apply(n, r)
				}
				return n
			}
			function o(e) {
				for (var t = 1; t < arguments.length; t++) {
					var n = null != arguments[t] ? arguments[t] : {}
					t % 2
						? i(Object(n), !0).forEach(function (t) {
								a(e, t, n[t])
						  })
						: Object.getOwnPropertyDescriptors
						? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
						: i(Object(n)).forEach(function (t) {
								Object.defineProperty(
									e,
									t,
									Object.getOwnPropertyDescriptor(n, t)
								)
						  })
				}
				return e
			}
			function l(e, t) {
				if (null == e) return {}
				var n,
					r,
					a = (function (e, t) {
						if (null == e) return {}
						var n,
							r,
							a = {},
							i = Object.keys(e)
						for (r = 0; r < i.length; r++)
							(n = i[r]), t.indexOf(n) >= 0 || (a[n] = e[n])
						return a
					})(e, t)
				if (Object.getOwnPropertySymbols) {
					var i = Object.getOwnPropertySymbols(e)
					for (r = 0; r < i.length; r++)
						(n = i[r]),
							t.indexOf(n) >= 0 ||
								(Object.prototype.propertyIsEnumerable.call(e, n) &&
									(a[n] = e[n]))
				}
				return a
			}
			var s = r.createContext({}),
				c = function (e) {
					var t = r.useContext(s),
						n = t
					return e && (n = "function" == typeof e ? e(t) : o(o({}, t), e)), n
				},
				u = function (e) {
					var t = c(e.components)
					return r.createElement(s.Provider, { value: t }, e.children)
				},
				p = {
					inlineCode: "code",
					wrapper: function (e) {
						var t = e.children
						return r.createElement(r.Fragment, {}, t)
					}
				},
				m = r.forwardRef(function (e, t) {
					var n = e.components,
						a = e.mdxType,
						i = e.originalType,
						s = e.parentName,
						u = l(e, ["components", "mdxType", "originalType", "parentName"]),
						m = c(n),
						d = a,
						f = m["".concat(s, ".").concat(d)] || m[d] || p[d] || i
					return n
						? r.createElement(f, o(o({ ref: t }, u), {}, { components: n }))
						: r.createElement(f, o({ ref: t }, u))
				})
			function d(e, t) {
				var n = arguments,
					a = t && t.mdxType
				if ("string" == typeof e || a) {
					var i = n.length,
						o = new Array(i)
					o[0] = m
					var l = {}
					for (var s in t) hasOwnProperty.call(t, s) && (l[s] = t[s])
					;(l.originalType = e),
						(l.mdxType = "string" == typeof e ? e : a),
						(o[1] = l)
					for (var c = 2; c < i; c++) o[c] = n[c]
					return r.createElement.apply(null, o)
				}
				return r.createElement.apply(null, n)
			}
			m.displayName = "MDXCreateElement"
		},
		8622: function (e, t, n) {
			n.r(t),
				n.d(t, {
					frontMatter: function () {
						return l
					},
					contentTitle: function () {
						return s
					},
					metadata: function () {
						return c
					},
					toc: function () {
						return u
					},
					default: function () {
						return m
					}
				})
			var r = n(7462),
				a = n(3366),
				i = (n(7294), n(3905)),
				o = ["components"],
				l = {
					id: "Labels",
					title: "Interface: Labels",
					sidebar_label: "Labels",
					sidebar_position: 0,
					custom_edit_url: null
				},
				s = void 0,
				c = {
					unversionedId: "release-mastermind/interfaces/Labels",
					id: "release-mastermind/interfaces/Labels",
					isDocsHomePage: !1,
					title: "Interface: Labels",
					description: "An array of labels.",
					source: "@site/docs/release-mastermind/interfaces/Labels.md",
					sourceDirName: "release-mastermind/interfaces",
					slug: "/release-mastermind/interfaces/Labels",
					permalink:
						"/action-masterminds/docs/release-mastermind/interfaces/Labels",
					editUrl: null,
					version: "current",
					sidebarPosition: 0,
					frontMatter: {
						id: "Labels",
						title: "Interface: Labels",
						sidebar_label: "Labels",
						sidebar_position: 0,
						custom_edit_url: null
					},
					sidebar: "release",
					previous: {
						title: "Label",
						permalink:
							"/action-masterminds/docs/release-mastermind/interfaces/Label"
					},
					next: {
						title: "Options",
						permalink:
							"/action-masterminds/docs/release-mastermind/interfaces/Options"
					}
				},
				u = [{ value: "Indexable", id: "indexable", children: [] }],
				p = { toc: u }
			function m(e) {
				var t = e.components,
					n = (0, a.Z)(e, o)
				return (0, i.kt)(
					"wrapper",
					(0, r.Z)({}, p, n, { components: t, mdxType: "MDXLayout" }),
					(0, i.kt)("p", null, "An array of labels."),
					(0, i.kt)("h2", { id: "indexable" }, "Indexable"),
					(0, i.kt)(
						"p",
						null,
						"\u25aa ",
						"[key: ",
						(0, i.kt)("inlineCode", { parentName: "p" }, "string"),
						"]",
						": ",
						(0, i.kt)(
							"a",
							{
								parentName: "p",
								href: "/action-masterminds/docs/release-mastermind/interfaces/Label"
							},
							(0, i.kt)("inlineCode", { parentName: "a" }, "Label")
						)
					),
					(0, i.kt)(
						"p",
						null,
						"And identifiable label name as the key, followed by the label configuration."
					),
					(0, i.kt)(
						"p",
						null,
						(0, i.kt)(
							"strong",
							{ parentName: "p" },
							(0, i.kt)("inlineCode", { parentName: "strong" }, "example")
						),
						' "bug": {name: "bug", description: "A bug has been found", color: "red"'
					)
				)
			}
			m.isMDXComponent = !0
		}
	}
])
