/** @format */

"use strict"
;(self.webpackChunkaction_masterminds =
	self.webpackChunkaction_masterminds || []).push([
	[4035],
	{
		3905: function (e, t, r) {
			r.d(t, {
				Zo: function () {
					return s
				},
				kt: function () {
					return d
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
			function i(e) {
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
			function u(e, t) {
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
				l = function (e) {
					var t = n.useContext(c),
						r = t
					return e && (r = "function" == typeof e ? e(t) : i(i({}, t), e)), r
				},
				s = function (e) {
					var t = l(e.components)
					return n.createElement(c.Provider, { value: t }, e.children)
				},
				m = {
					inlineCode: "code",
					wrapper: function (e) {
						var t = e.children
						return n.createElement(n.Fragment, {}, t)
					}
				},
				p = n.forwardRef(function (e, t) {
					var r = e.components,
						o = e.mdxType,
						a = e.originalType,
						c = e.parentName,
						s = u(e, ["components", "mdxType", "originalType", "parentName"]),
						p = l(r),
						d = o,
						f = p["".concat(c, ".").concat(d)] || p[d] || m[d] || a
					return r
						? n.createElement(f, i(i({ ref: t }, s), {}, { components: r }))
						: n.createElement(f, i({ ref: t }, s))
				})
			function d(e, t) {
				var r = arguments,
					o = t && t.mdxType
				if ("string" == typeof e || o) {
					var a = r.length,
						i = new Array(a)
					i[0] = p
					var u = {}
					for (var c in t) hasOwnProperty.call(t, c) && (u[c] = t[c])
					;(u.originalType = e),
						(u.mdxType = "string" == typeof e ? e : o),
						(i[1] = u)
					for (var l = 2; l < a; l++) i[l] = r[l]
					return n.createElement.apply(null, i)
				}
				return n.createElement.apply(null, r)
			}
			p.displayName = "MDXCreateElement"
		},
		9143: function (e, t, r) {
			r.r(t),
				r.d(t, {
					frontMatter: function () {
						return u
					},
					contentTitle: function () {
						return c
					},
					metadata: function () {
						return l
					},
					toc: function () {
						return s
					},
					default: function () {
						return p
					}
				})
			var n = r(7462),
				o = r(3366),
				a = (r(7294), r(3905)),
				i = ["components"],
				u = {
					slug: "hola",
					title: "Hola",
					author: "Gao Wei",
					author_title: "Docusaurus Core Team",
					author_url: "https://github.com/wgao19",
					author_image_url:
						"https://avatars1.githubusercontent.com/u/2055384?v=4",
					tags: ["hola", "docusaurus"]
				},
				c = void 0,
				l = {
					permalink: "/action-masterminds/es/blog/hola",
					editUrl:
						"https://github.com/videndum/action-masterminds/edit/develop/docs/blog/blog/2019-05-28-hola.md",
					source: "@site/blog/2019-05-28-hola.md",
					title: "Hola",
					description:
						"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque elementum dignissim ultricies. Fusce rhoncus ipsum tempor eros aliquam consequat. Lorem ipsum dolor sit amet",
					date: "2019-05-28T00:00:00.000Z",
					formattedDate: "28 de mayo de 2019",
					tags: [
						{
							label: "hola",
							permalink: "/action-masterminds/es/blog/tags/hola"
						},
						{
							label: "docusaurus",
							permalink: "/action-masterminds/es/blog/tags/docusaurus"
						}
					],
					readingTime: 0.12,
					truncated: !1,
					prevItem: {
						title: "Hello",
						permalink: "/action-masterminds/es/blog/hello-world"
					}
				},
				s = [],
				m = { toc: s }
			function p(e) {
				var t = e.components,
					r = (0, o.Z)(e, i)
				return (0, a.kt)(
					"wrapper",
					(0, n.Z)({}, m, r, { components: t, mdxType: "MDXLayout" }),
					(0, a.kt)(
						"p",
						null,
						"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque elementum dignissim ultricies. Fusce rhoncus ipsum tempor eros aliquam consequat. Lorem ipsum dolor sit amet"
					)
				)
			}
			p.isMDXComponent = !0
		}
	}
])
