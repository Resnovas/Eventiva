/** @format */

"use strict"
;(self.webpackChunkaction_masterminds =
	self.webpackChunkaction_masterminds || []).push([
	[4061],
	{
		3905: function (e, t, r) {
			r.d(t, {
				Zo: function () {
					return s
				},
				kt: function () {
					return f
				}
			})
			var n = r(7294)
			function o(e, t, r) {
				return (
					t in e
						? Object.defineProperty(e, t, {
								value: r,
								enumerable: !0,
								configurable: !0,
								writable: !0
						  })
						: (e[t] = r),
					e
				)
			}
			function a(e, t) {
				var r = Object.keys(e)
				if (Object.getOwnPropertySymbols) {
					var n = Object.getOwnPropertySymbols(e)
					t &&
						(n = n.filter(function (t) {
							return Object.getOwnPropertyDescriptor(e, t).enumerable
						})),
						r.push.apply(r, n)
				}
				return r
			}
			function l(e) {
				for (var t = 1; t < arguments.length; t++) {
					var r = null != arguments[t] ? arguments[t] : {}
					t % 2
						? a(Object(r), !0).forEach(function (t) {
								o(e, t, r[t])
						  })
						: Object.getOwnPropertyDescriptors
						? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
						: a(Object(r)).forEach(function (t) {
								Object.defineProperty(
									e,
									t,
									Object.getOwnPropertyDescriptor(r, t)
								)
						  })
				}
				return e
			}
			function i(e, t) {
				if (null == e) return {}
				var r,
					n,
					o = (function (e, t) {
						if (null == e) return {}
						var r,
							n,
							o = {},
							a = Object.keys(e)
						for (n = 0; n < a.length; n++)
							(r = a[n]), t.indexOf(r) >= 0 || (o[r] = e[r])
						return o
					})(e, t)
				if (Object.getOwnPropertySymbols) {
					var a = Object.getOwnPropertySymbols(e)
					for (n = 0; n < a.length; n++)
						(r = a[n]),
							t.indexOf(r) >= 0 ||
								(Object.prototype.propertyIsEnumerable.call(e, r) &&
									(o[r] = e[r]))
				}
				return o
			}
			var c = n.createContext({}),
				u = function (e) {
					var t = n.useContext(c),
						r = t
					return e && (r = "function" == typeof e ? e(t) : l(l({}, t), e)), r
				},
				s = function (e) {
					var t = u(e.components)
					return n.createElement(c.Provider, { value: t }, e.children)
				},
				p = {
					inlineCode: "code",
					wrapper: function (e) {
						var t = e.children
						return n.createElement(n.Fragment, {}, t)
					}
				},
				m = n.forwardRef(function (e, t) {
					var r = e.components,
						o = e.mdxType,
						a = e.originalType,
						c = e.parentName,
						s = i(e, ["components", "mdxType", "originalType", "parentName"]),
						m = u(r),
						f = o,
						d = m["".concat(c, ".").concat(f)] || m[f] || p[f] || a
					return r
						? n.createElement(d, l(l({ ref: t }, s), {}, { components: r }))
						: n.createElement(d, l({ ref: t }, s))
				})
			function f(e, t) {
				var r = arguments,
					o = t && t.mdxType
				if ("string" == typeof e || o) {
					var a = r.length,
						l = new Array(a)
					l[0] = m
					var i = {}
					for (var c in t) hasOwnProperty.call(t, c) && (i[c] = t[c])
					;(i.originalType = e),
						(i.mdxType = "string" == typeof e ? e : o),
						(l[1] = i)
					for (var u = 2; u < a; u++) l[u] = r[u]
					return n.createElement.apply(null, l)
				}
				return n.createElement.apply(null, r)
			}
			m.displayName = "MDXCreateElement"
		},
		9842: function (e, t, r) {
			r.r(t),
				r.d(t, {
					frontMatter: function () {
						return i
					},
					contentTitle: function () {
						return c
					},
					metadata: function () {
						return u
					},
					toc: function () {
						return s
					},
					default: function () {
						return m
					}
				})
			var n = r(7462),
				o = r(3366),
				a = (r(7294), r(3905)),
				l = ["components"],
				i = {
					slug: "welcome",
					title: "Welcome",
					author: "Yangshun Tay",
					author_title: "Front End Engineer @ Facebook",
					author_url: "https://github.com/yangshun",
					author_image_url:
						"https://avatars0.githubusercontent.com/u/1315101?s=400&v=4",
					tags: ["facebook", "hello", "docusaurus"]
				},
				c = void 0,
				u = {
					permalink: "/action-masterminds/fr/blog/welcome",
					editUrl:
						"https://github.com/videndum/action-masterminds/edit/develop/docs/blog/blog/2019-05-30-welcome.md",
					source: "@site/blog/2019-05-30-welcome.md",
					title: "Welcome",
					description:
						"Blog features are powered by the blog plugin. Simply add files to the blog directory. It supports tags as well!",
					date: "2019-05-30T00:00:00.000Z",
					formattedDate: "30 mai 2019",
					tags: [
						{
							label: "facebook",
							permalink: "/action-masterminds/fr/blog/tags/facebook"
						},
						{
							label: "hello",
							permalink: "/action-masterminds/fr/blog/tags/hello"
						},
						{
							label: "docusaurus",
							permalink: "/action-masterminds/fr/blog/tags/docusaurus"
						}
					],
					readingTime: 0.175,
					truncated: !1,
					prevItem: {
						title: "Blog Plugin",
						permalink: "/action-masterminds/fr/blog/2020/04/14/blog-plugin"
					},
					nextItem: {
						title: "Hello",
						permalink: "/action-masterminds/fr/blog/hello-world"
					}
				},
				s = [],
				p = { toc: s }
			function m(e) {
				var t = e.components,
					r = (0, o.Z)(e, l)
				return (0, a.kt)(
					"wrapper",
					(0, n.Z)({}, p, r, { components: t, mdxType: "MDXLayout" }),
					(0, a.kt)(
						"p",
						null,
						"Blog features are powered by the blog plugin. Simply add files to the ",
						(0, a.kt)("inlineCode", { parentName: "p" }, "blog"),
						" directory. It supports tags as well!"
					),
					(0, a.kt)(
						"p",
						null,
						"Delete the whole directory if you don't want the blog features. As simple as that!"
					)
				)
			}
			m.isMDXComponent = !0
		}
	}
])
