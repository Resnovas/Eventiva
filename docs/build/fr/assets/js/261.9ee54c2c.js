/** @format */

"use strict"
;(self.webpackChunkaction_masterminds =
	self.webpackChunkaction_masterminds || []).push([
	[261],
	{
		1875: function (e, t) {
			t.Z = function () {
				return null
			}
		},
		8617: function (e, t, n) {
			n.d(t, {
				Z: function () {
					return l
				}
			})
			var a = n(7294),
				r = "iconExternalLink_3J9K",
				l = function (e) {
					var t = e.width,
						n = void 0 === t ? 13.5 : t,
						l = e.height,
						o = void 0 === l ? 13.5 : l
					return a.createElement(
						"svg",
						{
							width: n,
							height: o,
							"aria-hidden": "true",
							viewBox: "0 0 24 24",
							className: r
						},
						a.createElement("path", {
							fill: "currentColor",
							d:
								"M21 13v10h-21v-19h12v2h-10v15h17v-8h2zm3-12h-10.988l4.035 4-6.977 7.07 2.828 2.828 6.977-7.07 4.125 4.172v-11z"
						})
					)
				}
		},
		261: function (e, t, n) {
			n.d(t, {
				Z: function () {
					return pe
				}
			})
			var a = n(7294),
				r = n(6010),
				l = n(5977),
				o = n(4973),
				i = n(3018),
				c = "skipToContent_1oUP"
			function s(e) {
				e.setAttribute("tabindex", "-1"),
					e.focus(),
					e.removeAttribute("tabindex")
			}
			var u = function () {
					var e = (0, a.useRef)(null),
						t = (0, l.k6)().action
					return (
						(0, i.SL)(function (n) {
							var a = n.location
							e.current && !a.hash && "PUSH" === t && s(e.current)
						}),
						a.createElement(
							"div",
							{ ref: e },
							a.createElement(
								"a",
								{
									href: "#",
									className: c,
									onClick: function (e) {
										e.preventDefault()
										var t =
											document.querySelector("main:first-of-type") ||
											document.querySelector(".main-wrapper")
										t && s(t)
									}
								},
								a.createElement(
									o.Z,
									{
										id: "theme.common.skipToMainContent",
										description:
											"The skip to content label used for accessibility, allowing to rapidly navigate to main content with keyboard tab/enter navigation"
									},
									"Skip to main content"
								)
							)
						)
					)
				},
				m = "announcementBar_3WsW",
				d = "announcementBarClose_38nx",
				f = "announcementBarContent_3EUC",
				v = "announcementBarCloseable_3myR"
			var h = function () {
					var e,
						t = (0, i.nT)(),
						n = t.isClosed,
						l = t.close,
						c = (0, i.LU)().announcementBar
					if (!c) return null
					var s = c.content,
						u = c.backgroundColor,
						h = c.textColor,
						b = c.isCloseable
					return !s || (b && n)
						? null
						: a.createElement(
								"div",
								{
									className: m,
									style: { backgroundColor: u, color: h },
									role: "banner"
								},
								a.createElement("div", {
									className: (0, r.Z)(f, ((e = {}), (e[v] = b), e)),
									dangerouslySetInnerHTML: { __html: s }
								}),
								b
									? a.createElement(
											"button",
											{
												type: "button",
												className: (0, r.Z)(d, "clean-btn"),
												onClick: l,
												"aria-label": (0, o.I)({
													id: "theme.AnnouncementBar.closeButtonAriaLabel",
													message: "Close",
													description:
														"The ARIA label for close button of announcement bar"
												})
											},
											a.createElement("span", { "aria-hidden": "true" }, "\xd7")
									  )
									: null
						  )
				},
				b = n(7462),
				g = n(1875),
				E = n(2263),
				p = { toggle: "toggle_71bT" },
				Z = function (e) {
					var t = e.icon,
						n = e.style
					return a.createElement(
						"span",
						{ className: (0, r.Z)(p.toggle, p.dark), style: n },
						t
					)
				},
				k = function (e) {
					var t = e.icon,
						n = e.style
					return a.createElement(
						"span",
						{ className: (0, r.Z)(p.toggle, p.light), style: n },
						t
					)
				},
				_ = (0, a.memo)(function (e) {
					var t = e.className,
						n = e.icons,
						l = e.checked,
						o = e.disabled,
						i = e.onChange,
						c = (0, a.useState)(l),
						s = c[0],
						u = c[1],
						m = (0, a.useState)(!1),
						d = m[0],
						f = m[1],
						v = (0, a.useRef)(null)
					return a.createElement(
						"div",
						{
							className: (0, r.Z)("react-toggle", t, {
								"react-toggle--checked": s,
								"react-toggle--focus": d,
								"react-toggle--disabled": o
							})
						},
						a.createElement(
							"div",
							{
								className: "react-toggle-track",
								role: "button",
								tabIndex: -1,
								onClick: function () {
									var e
									return null == (e = v.current) ? void 0 : e.click()
								}
							},
							a.createElement(
								"div",
								{ className: "react-toggle-track-check" },
								n.checked
							),
							a.createElement(
								"div",
								{ className: "react-toggle-track-x" },
								n.unchecked
							),
							a.createElement("div", { className: "react-toggle-thumb" })
						),
						a.createElement("input", {
							ref: v,
							checked: s,
							type: "checkbox",
							className: "react-toggle-screenreader-only",
							"aria-label": "Switch between dark and light mode",
							onChange: i,
							onClick: function () {
								return u(!s)
							},
							onFocus: function () {
								return f(!0)
							},
							onBlur: function () {
								return f(!1)
							}
						})
					)
				})
			function w(e) {
				var t = (0, i.LU)().colorMode.switchConfig,
					n = t.darkIcon,
					r = t.darkIconStyle,
					l = t.lightIcon,
					o = t.lightIconStyle,
					c = (0, E.Z)().isClient
				return a.createElement(
					_,
					(0, b.Z)(
						{
							disabled: !c,
							icons: {
								checked: a.createElement(Z, { icon: n, style: r }),
								unchecked: a.createElement(k, { icon: l, style: o })
							}
						},
						e
					)
				)
			}
			var N = n(5350),
				y = n(7898),
				C = function (e) {
					var t = (0, l.TH)(),
						n = (0, a.useState)(e),
						r = n[0],
						o = n[1],
						c = (0, a.useRef)(!1),
						s = (0, a.useState)(0),
						u = s[0],
						m = s[1],
						d = (0, a.useCallback)(function (e) {
							null !== e && m(e.getBoundingClientRect().height)
						}, [])
					return (
						(0, y.Z)(
							function (t, n) {
								var a = t.scrollY,
									r = null == n ? void 0 : n.scrollY
								if (e)
									if (a < u) o(!0)
									else {
										if (c.current) return (c.current = !1), void o(!1)
										r && 0 === a && o(!0)
										var l = document.documentElement.scrollHeight - u,
											i = window.innerHeight
										r && a >= r ? o(!1) : a + i < l && o(!0)
									}
							},
							[u, c]
						),
						(0, i.SL)(function (t) {
							e && !t.location.hash && o(!0)
						}),
						(0, a.useEffect)(
							function () {
								e && t.hash && (c.current = !0)
							},
							[t.hash]
						),
						{ navbarRef: d, isNavbarVisible: r }
					)
				}
			var I = function (e) {
					void 0 === e && (e = !0),
						(0, a.useEffect)(
							function () {
								return (
									(document.body.style.overflow = e ? "hidden" : "visible"),
									function () {
										document.body.style.overflow = "visible"
									}
								)
							},
							[e]
						)
				},
				L = n(3783),
				D = n(4201),
				S = n(5537),
				T = n(3366),
				B = ["width", "height", "className"],
				x = function (e) {
					var t = e.width,
						n = void 0 === t ? 30 : t,
						r = e.height,
						l = void 0 === r ? 30 : r,
						o = e.className,
						i = (0, T.Z)(e, B)
					return a.createElement(
						"svg",
						(0, b.Z)(
							{
								className: o,
								width: n,
								height: l,
								viewBox: "0 0 30 30",
								"aria-hidden": "true"
							},
							i
						),
						a.createElement("path", {
							stroke: "currentColor",
							strokeLinecap: "round",
							strokeMiterlimit: "10",
							strokeWidth: "2",
							d: "M4 7h22M4 15h22M4 23h22"
						})
					)
				},
				A = "toggle_3Zt9",
				M = "navbarHideable_2qcr",
				U = "navbarHidden_3yey",
				R = "right"
			function P() {
				return (0, i.LU)().navbar.items
			}
			function H() {
				var e = (0, i.LU)().colorMode.disableSwitch,
					t = (0, N.Z)(),
					n = t.isDarkTheme,
					r = t.setLightTheme,
					l = t.setDarkTheme
				return {
					isDarkTheme: n,
					toggle: (0, a.useCallback)(
						function (e) {
							return e.target.checked ? l() : r()
						},
						[r, l]
					),
					disabled: e
				}
			}
			function V(e) {
				var t = e.sidebarShown,
					n = e.toggleSidebar
				I(t)
				var l = P(),
					c = H(),
					s = (function (e) {
						var t,
							n = e.sidebarShown,
							r = e.toggleSidebar,
							l = null == (t = (0, i.g8)()) ? void 0 : t({ toggleSidebar: r }),
							o = (0, i.D9)(l),
							c = (0, a.useState)(function () {
								return !1
							}),
							s = c[0],
							u = c[1]
						;(0, a.useEffect)(
							function () {
								l && !o && u(!0)
							},
							[l, o]
						)
						var m = !!l
						return (
							(0, a.useEffect)(
								function () {
									m ? n || u(!0) : u(!1)
								},
								[n, m]
							),
							{
								shown: s,
								hide: (0, a.useCallback)(function () {
									u(!1)
								}, []),
								content: l
							}
						)
					})({ sidebarShown: t, toggleSidebar: n })
				return a.createElement(
					"div",
					{ className: "navbar-sidebar" },
					a.createElement(
						"div",
						{ className: "navbar-sidebar__brand" },
						a.createElement(S.Z, {
							className: "navbar__brand",
							imageClassName: "navbar__logo",
							titleClassName: "navbar__title"
						}),
						!c.disabled &&
							t &&
							a.createElement(w, { checked: c.isDarkTheme, onChange: c.toggle })
					),
					a.createElement(
						"div",
						{
							className: (0, r.Z)("navbar-sidebar__items", {
								"navbar-sidebar__items--show-secondary": s.shown
							})
						},
						a.createElement(
							"div",
							{ className: "navbar-sidebar__item menu" },
							a.createElement(
								"ul",
								{ className: "menu__list" },
								l.map(function (e, t) {
									return a.createElement(
										D.Z,
										(0, b.Z)({ mobile: !0 }, e, { onClick: n, key: t })
									)
								})
							)
						),
						a.createElement(
							"div",
							{
								className:
									"navbar-sidebar__item navbar-sidebar__item--secondary menu"
							},
							a.createElement(
								"button",
								{
									type: "button",
									className: "clean-btn navbar-sidebar__back",
									onClick: s.hide
								},
								a.createElement(
									o.Z,
									{
										id:
											"theme.navbar.mobileSidebarSecondaryMenu.backButtonLabel",
										description:
											"The label of the back button to return to main menu, inside the mobile navbar sidebar secondary menu (notably used to display the docs sidebar)"
									},
									"\u2190 Back to main menu"
								)
							),
							s.content
						)
					)
				)
			}
			var W = function () {
					var e,
						t,
						n,
						l,
						o,
						c,
						s,
						u = (0, i.LU)().navbar,
						m = u.hideOnScroll,
						d = u.style,
						f =
							((t = (0, L.Z)()),
							(n = "mobile" === t),
							(l = (0, a.useState)(!1)),
							(o = l[0]),
							(c = l[1]),
							(s = (0, a.useCallback)(function () {
								c(function (e) {
									return !e
								})
							}, [])),
							(0, a.useEffect)(
								function () {
									"desktop" === t && c(!1)
								},
								[t]
							),
							{ shouldRender: n, toggle: s, shown: o }),
						v = H(),
						h = C(m),
						E = h.navbarRef,
						p = h.isNavbarVisible,
						Z = P(),
						k = Z.some(function (e) {
							return "search" === e.type
						}),
						_ = (function (e) {
							return {
								leftItems: e.filter(function (e) {
									var t
									return "left" === (null != (t = e.position) ? t : R)
								}),
								rightItems: e.filter(function (e) {
									var t
									return "right" === (null != (t = e.position) ? t : R)
								})
							}
						})(Z),
						N = _.leftItems,
						y = _.rightItems
					return a.createElement(
						"nav",
						{
							ref: E,
							className: (0, r.Z)(
								"navbar",
								"navbar--fixed-top",
								((e = {
									"navbar--dark": "dark" === d,
									"navbar--primary": "primary" === d,
									"navbar-sidebar--show": f.shown
								}),
								(e[M] = m),
								(e[U] = m && !p),
								e)
							)
						},
						a.createElement(
							"div",
							{ className: "navbar__inner" },
							a.createElement(
								"div",
								{ className: "navbar__items" },
								(null == Z ? void 0 : Z.length) > 0 &&
									a.createElement(
										"button",
										{
											"aria-label": "Navigation bar toggle",
											className: "navbar__toggle clean-btn",
											type: "button",
											tabIndex: 0,
											onClick: f.toggle,
											onKeyDown: f.toggle
										},
										a.createElement(x, null)
									),
								a.createElement(S.Z, {
									className: "navbar__brand",
									imageClassName: "navbar__logo",
									titleClassName: "navbar__title"
								}),
								N.map(function (e, t) {
									return a.createElement(D.Z, (0, b.Z)({}, e, { key: t }))
								})
							),
							a.createElement(
								"div",
								{ className: "navbar__items navbar__items--right" },
								y.map(function (e, t) {
									return a.createElement(D.Z, (0, b.Z)({}, e, { key: t }))
								}),
								!v.disabled &&
									a.createElement(w, {
										className: A,
										checked: v.isDarkTheme,
										onChange: v.toggle
									}),
								!k && a.createElement(g.Z, null)
							)
						),
						a.createElement("div", {
							role: "presentation",
							className: "navbar-sidebar__backdrop",
							onClick: f.toggle
						}),
						f.shouldRender &&
							a.createElement(V, {
								sidebarShown: f.shown,
								toggleSidebar: f.toggle
							})
					)
				},
				z = n(6742),
				O = n(4996),
				F = n(3919),
				G = "footerLogoLink_MyFc",
				q = n(8465),
				j = n(8617),
				J = ["to", "href", "label", "prependBaseUrlToHref"]
			function K(e) {
				var t = e.to,
					n = e.href,
					r = e.label,
					l = e.prependBaseUrlToHref,
					o = (0, T.Z)(e, J),
					i = (0, O.Z)(t),
					c = (0, O.Z)(n, { forcePrependBaseUrl: !0 })
				return a.createElement(
					z.Z,
					(0, b.Z)(
						{ className: "footer__link-item" },
						n ? { href: l ? c : n } : { to: i },
						o
					),
					n && !(0, F.Z)(n)
						? a.createElement("span", null, r, a.createElement(j.Z, null))
						: r
				)
			}
			var Q = function (e) {
				var t = e.sources,
					n = e.alt
				return a.createElement(q.Z, {
					className: "footer__logo",
					alt: n,
					sources: t
				})
			}
			var Y = function () {
					var e = (0, i.LU)().footer,
						t = e || {},
						n = t.copyright,
						l = t.links,
						o = void 0 === l ? [] : l,
						c = t.logo,
						s = void 0 === c ? {} : c,
						u = { light: (0, O.Z)(s.src), dark: (0, O.Z)(s.srcDark || s.src) }
					return e
						? a.createElement(
								"footer",
								{
									className: (0, r.Z)("footer", {
										"footer--dark": "dark" === e.style
									})
								},
								a.createElement(
									"div",
									{ className: "container" },
									o &&
										o.length > 0 &&
										a.createElement(
											"div",
											{ className: "row footer__links" },
											o.map(function (e, t) {
												return a.createElement(
													"div",
													{ key: t, className: "col footer__col" },
													null != e.title
														? a.createElement(
																"div",
																{ className: "footer__title" },
																e.title
														  )
														: null,
													null != e.items &&
														Array.isArray(e.items) &&
														e.items.length > 0
														? a.createElement(
																"ul",
																{ className: "footer__items" },
																e.items.map(function (e, t) {
																	return e.html
																		? a.createElement("li", {
																				key: t,
																				className: "footer__item",
																				dangerouslySetInnerHTML: {
																					__html: e.html
																				}
																		  })
																		: a.createElement(
																				"li",
																				{
																					key: e.href || e.to,
																					className: "footer__item"
																				},
																				a.createElement(K, e)
																		  )
																})
														  )
														: null
												)
											})
										),
									(s || n) &&
										a.createElement(
											"div",
											{ className: "footer__bottom text--center" },
											s &&
												(s.src || s.srcDark) &&
												a.createElement(
													"div",
													{ className: "margin-bottom--sm" },
													s.href
														? a.createElement(
																z.Z,
																{ href: s.href, className: G },
																a.createElement(Q, { alt: s.alt, sources: u })
														  )
														: a.createElement(Q, { alt: s.alt, sources: u })
												),
											n
												? a.createElement("div", {
														className: "footer__copyright",
														dangerouslySetInnerHTML: { __html: n }
												  })
												: null
										)
								)
						  )
						: null
				},
				X = n(412),
				$ = (0, i.WA)("theme"),
				ee = "light",
				te = "dark",
				ne = function (e) {
					return e === te ? te : ee
				},
				ae = function (e) {
					;(0, i.WA)("theme").set(ne(e))
				},
				re = function () {
					var e = (0, i.LU)().colorMode,
						t = e.defaultMode,
						n = e.disableSwitch,
						r = e.respectPrefersColorScheme,
						l = (0, a.useState)(
							(function (e) {
								return X.Z.canUseDOM
									? ne(document.documentElement.getAttribute("data-theme"))
									: ne(e)
							})(t)
						),
						o = l[0],
						c = l[1],
						s = (0, a.useCallback)(function () {
							c(ee), ae(ee)
						}, []),
						u = (0, a.useCallback)(function () {
							c(te), ae(te)
						}, [])
					return (
						(0, a.useEffect)(
							function () {
								document.documentElement.setAttribute("data-theme", ne(o))
							},
							[o]
						),
						(0, a.useEffect)(
							function () {
								if (!n)
									try {
										var e = $.get()
										null !== e && c(ne(e))
									} catch (t) {
										console.error(t)
									}
							},
							[c]
						),
						(0, a.useEffect)(function () {
							;(n && !r) ||
								window
									.matchMedia("(prefers-color-scheme: dark)")
									.addListener(function (e) {
										var t = e.matches
										c(t ? te : ee)
									})
						}, []),
						{ isDarkTheme: o === te, setLightTheme: s, setDarkTheme: u }
					)
				},
				le = n(2924)
			var oe = function (e) {
					var t = re(),
						n = t.isDarkTheme,
						r = t.setLightTheme,
						l = t.setDarkTheme
					return a.createElement(
						le.Z.Provider,
						{ value: { isDarkTheme: n, setLightTheme: r, setDarkTheme: l } },
						e.children
					)
				},
				ie = "docusaurus.tab.",
				ce = function () {
					var e = (0, a.useState)({}),
						t = e[0],
						n = e[1],
						r = (0, a.useCallback)(function (e, t) {
							;(0, i.WA)("docusaurus.tab." + e).set(t)
						}, [])
					return (
						(0, a.useEffect)(function () {
							try {
								var e = {}
								;(0, i._f)().forEach(function (t) {
									if (t.startsWith(ie)) {
										var n = t.substring(ie.length)
										e[n] = (0, i.WA)(t).get()
									}
								}),
									n(e)
							} catch (t) {
								console.error(t)
							}
						}, []),
						{
							tabGroupChoices: t,
							setTabGroupChoices: function (e, t) {
								n(function (n) {
									var a
									return Object.assign({}, n, (((a = {})[e] = t), a))
								}),
									r(e, t)
							}
						}
					)
				},
				se = (0, a.createContext)(void 0)
			var ue = function (e) {
				var t = ce(),
					n = t.tabGroupChoices,
					r = t.setTabGroupChoices
				return a.createElement(
					se.Provider,
					{ value: { tabGroupChoices: n, setTabGroupChoices: r } },
					e.children
				)
			}
			function me(e) {
				var t = e.children
				return a.createElement(
					oe,
					null,
					a.createElement(
						i.pl,
						null,
						a.createElement(
							ue,
							null,
							a.createElement(i.L5, null, a.createElement(i.Cn, null, t))
						)
					)
				)
			}
			var de = n(9105)
			function fe(e) {
				var t = e.locale,
					n = e.version,
					r = e.tag
				return a.createElement(
					de.Z,
					null,
					t &&
						a.createElement("meta", { name: "docusaurus_locale", content: t }),
					n &&
						a.createElement("meta", { name: "docusaurus_version", content: n }),
					r && a.createElement("meta", { name: "docusaurus_tag", content: r })
				)
			}
			var ve = n(1217)
			function he() {
				var e = (0, E.Z)().i18n,
					t = e.defaultLocale,
					n = e.locales,
					r = (0, i.l5)()
				return a.createElement(
					de.Z,
					null,
					n.map(function (e) {
						return a.createElement("link", {
							key: e,
							rel: "alternate",
							href: r.createUrl({ locale: e, fullyQualified: !0 }),
							hrefLang: e
						})
					}),
					a.createElement("link", {
						rel: "alternate",
						href: r.createUrl({ locale: t, fullyQualified: !0 }),
						hrefLang: "x-default"
					})
				)
			}
			function be(e) {
				var t = e.permalink,
					n = (0, E.Z)().siteConfig.url,
					r = (function () {
						var e = (0, E.Z)().siteConfig.url,
							t = (0, l.TH)().pathname
						return e + (0, O.Z)(t)
					})(),
					o = t ? "" + n + t : r
				return a.createElement(
					de.Z,
					null,
					a.createElement("meta", { property: "og:url", content: o }),
					a.createElement("link", { rel: "canonical", href: o })
				)
			}
			function ge(e) {
				var t = (0, E.Z)(),
					n = t.siteConfig,
					r = n.favicon,
					l = n.themeConfig,
					o = l.metadatas,
					c = l.image,
					s = t.i18n,
					u = s.currentLocale,
					m = s.localeConfigs,
					d = e.title,
					f = e.description,
					v = e.image,
					h = e.keywords,
					g = e.searchMetadatas,
					p = (0, O.Z)(r),
					Z = (0, i.pe)(d),
					k = u,
					_ = m[u].direction
				return a.createElement(
					a.Fragment,
					null,
					a.createElement(
						de.Z,
						null,
						a.createElement("html", { lang: k, dir: _ }),
						r && a.createElement("link", { rel: "shortcut icon", href: p }),
						a.createElement("title", null, Z),
						a.createElement("meta", { property: "og:title", content: Z }),
						v ||
							(c &&
								a.createElement("meta", {
									name: "twitter:card",
									content: "summary_large_image"
								}))
					),
					a.createElement(ve.Z, { description: f, keywords: h, image: v }),
					a.createElement(be, null),
					a.createElement(he, null),
					a.createElement(fe, (0, b.Z)({ tag: i.HX, locale: u }, g)),
					a.createElement(
						de.Z,
						null,
						o.map(function (e, t) {
							return a.createElement(
								"meta",
								(0, b.Z)({ key: "metadata_" + t }, e)
							)
						})
					)
				)
			}
			var Ee = function () {
				;(0, a.useEffect)(function () {
					var e = "navigation-with-keyboard"
					function t(t) {
						"keydown" === t.type &&
							"Tab" === t.key &&
							document.body.classList.add(e),
							"mousedown" === t.type && document.body.classList.remove(e)
					}
					return (
						document.addEventListener("keydown", t),
						document.addEventListener("mousedown", t),
						function () {
							document.body.classList.remove(e),
								document.removeEventListener("keydown", t),
								document.removeEventListener("mousedown", t)
						}
					)
				}, [])
			}
			var pe = function (e) {
				var t = e.children,
					n = e.noFooter,
					l = e.wrapperClassName,
					o = e.pageClassName
				return (
					Ee(),
					a.createElement(
						me,
						null,
						a.createElement(ge, e),
						a.createElement(u, null),
						a.createElement(h, null),
						a.createElement(W, null),
						a.createElement(
							"div",
							{ className: (0, r.Z)(i.kM.wrapper.main, l, o) },
							t
						),
						!n && a.createElement(Y, null)
					)
				)
			}
		},
		5537: function (e, t, n) {
			var a = n(7462),
				r = n(3366),
				l = n(7294),
				o = n(6742),
				i = n(8465),
				c = n(4996),
				s = n(2263),
				u = ["imageClassName", "titleClassName"]
			t.Z = function (e) {
				var t = (0, s.Z)(),
					n = t.siteConfig,
					m = n.title,
					d = n.themeConfig.navbar,
					f = d.title,
					v = d.logo,
					h = void 0 === v ? { src: "" } : v,
					b = t.isClient,
					g = e.imageClassName,
					E = e.titleClassName,
					p = (0, r.Z)(e, u),
					Z = (0, c.Z)(h.href || "/"),
					k = { light: (0, c.Z)(h.src), dark: (0, c.Z)(h.srcDark || h.src) }
				return l.createElement(
					o.Z,
					(0, a.Z)({ to: Z }, p, h.target && { target: h.target }),
					h.src &&
						l.createElement(i.Z, {
							key: b,
							className: g,
							sources: k,
							alt: h.alt || f || m
						}),
					null != f && l.createElement("b", { className: E }, f)
				)
			}
		},
		5525: function (e, t, n) {
			n.d(t, {
				O: function () {
					return h
				}
			})
			var a = n(7462),
				r = n(3366),
				l = n(7294),
				o = n(6010),
				i = n(6742),
				c = n(4996),
				s = n(8617),
				u = n(3919),
				m = [
					"activeBasePath",
					"activeBaseRegex",
					"to",
					"href",
					"label",
					"activeClassName",
					"prependBaseUrlToHref"
				],
				d = ["className", "isDropdownItem"],
				f = ["className", "isDropdownItem"],
				v = ["mobile", "position"]
			function h(e) {
				var t = e.activeBasePath,
					n = e.activeBaseRegex,
					o = e.to,
					d = e.href,
					f = e.label,
					v = e.activeClassName,
					h = void 0 === v ? "navbar__link--active" : v,
					b = e.prependBaseUrlToHref,
					g = (0, r.Z)(e, m),
					E = (0, c.Z)(o),
					p = (0, c.Z)(t),
					Z = (0, c.Z)(d, { forcePrependBaseUrl: !0 }),
					k = f && d && !(0, u.Z)(d),
					_ = "dropdown__link--active" === h
				return l.createElement(
					i.Z,
					(0, a.Z)(
						{},
						d
							? { href: b ? Z : d }
							: Object.assign(
									{ isNavLink: !0, activeClassName: h, to: E },
									t || n
										? {
												isActive: function (e, t) {
													return n
														? new RegExp(n).test(t.pathname)
														: t.pathname.startsWith(p)
												}
										  }
										: null
							  ),
						g
					),
					k
						? l.createElement(
								"span",
								null,
								f,
								l.createElement(s.Z, _ && { width: 12, height: 12 })
						  )
						: f
				)
			}
			function b(e) {
				var t = e.className,
					n = e.isDropdownItem,
					i = void 0 !== n && n,
					c = (0, r.Z)(e, d),
					s = l.createElement(
						h,
						(0, a.Z)(
							{
								className: (0, o.Z)(
									i ? "dropdown__link" : "navbar__item navbar__link",
									t
								)
							},
							c
						)
					)
				return i ? l.createElement("li", null, s) : s
			}
			function g(e) {
				var t = e.className,
					n = (e.isDropdownItem, (0, r.Z)(e, f))
				return l.createElement(
					"li",
					{ className: "menu__list-item" },
					l.createElement(
						h,
						(0, a.Z)({ className: (0, o.Z)("menu__link", t) }, n)
					)
				)
			}
			t.Z = function (e) {
				var t = e.mobile,
					n = void 0 !== t && t,
					a = (e.position, (0, r.Z)(e, v)),
					o = n ? g : b
				return l.createElement(o, a)
			}
		},
		6400: function (e, t, n) {
			n.d(t, {
				Z: function () {
					return d
				}
			})
			var a = n(7462),
				r = n(3366),
				l = n(7294),
				o = n(5525),
				i = n(907),
				c = n(6010),
				s = n(3018),
				u = n(8780),
				m = ["docId", "activeSidebarClassName", "label", "docsPluginId"]
			function d(e) {
				var t,
					n = e.docId,
					d = e.activeSidebarClassName,
					f = e.label,
					v = e.docsPluginId,
					h = (0, r.Z)(e, m),
					b = (0, i.Iw)(v),
					g = b.activeVersion,
					E = b.activeDoc,
					p = (0, s.J)(v).preferredVersion,
					Z = (0, i.yW)(v),
					k = (function (e, t) {
						var n = e.flatMap(function (e) {
								return e.docs
							}),
							a = n.find(function (e) {
								return e.id === t
							})
						if (!a) {
							var r = n
								.map(function (e) {
									return e.id
								})
								.join("\n- ")
							throw new Error(
								"DocNavbarItem: couldn't find any doc with id \"" +
									t +
									'" in version' +
									(e.length ? "s" : "") +
									" " +
									e
										.map(function (e) {
											return e.name
										})
										.join(", ") +
									'".\nAvailable doc ids are:\n- ' +
									r
							)
						}
						return a
					})((0, u.uniq)([g, p, Z].filter(Boolean)), n)
				return l.createElement(
					o.Z,
					(0, a.Z)({ exact: !0 }, h, {
						className: (0, c.Z)(
							h.className,
							((t = {}), (t[d] = E && E.sidebar === k.sidebar), t)
						),
						label: null != f ? f : k.id,
						to: k.path
					})
				)
			}
		},
		9308: function (e, t, n) {
			n.d(t, {
				Z: function () {
					return d
				}
			})
			var a = n(7462),
				r = n(3366),
				l = n(7294),
				o = n(5525),
				i = n(3154),
				c = n(907),
				s = n(3018),
				u = [
					"mobile",
					"docsPluginId",
					"dropdownActiveClassDisabled",
					"dropdownItemsBefore",
					"dropdownItemsAfter"
				],
				m = function (e) {
					return e.docs.find(function (t) {
						return t.id === e.mainDocId
					})
				}
			function d(e) {
				var t,
					n,
					d = e.mobile,
					f = e.docsPluginId,
					v = e.dropdownActiveClassDisabled,
					h = e.dropdownItemsBefore,
					b = e.dropdownItemsAfter,
					g = (0, r.Z)(e, u),
					E = (0, c.Iw)(f),
					p = (0, c.gB)(f),
					Z = (0, c.yW)(f),
					k = (0, s.J)(f),
					_ = k.preferredVersion,
					w = k.savePreferredVersionName
				var N,
					y =
						((N = p.map(function (e) {
							var t =
								(null == E ? void 0 : E.alternateDocVersions[e.name]) || m(e)
							return {
								isNavLink: !0,
								label: e.label,
								to: t.path,
								isActive: function () {
									return e === (null == E ? void 0 : E.activeVersion)
								},
								onClick: function () {
									w(e.name)
								}
							}
						})),
						[].concat(h, N, b)),
					C = null != (t = null != (n = E.activeVersion) ? n : _) ? t : Z,
					I = d && y ? "Versions" : C.label,
					L = d && y ? void 0 : m(C).path
				return y.length <= 1
					? l.createElement(
							o.Z,
							(0, a.Z)({}, g, {
								mobile: d,
								label: I,
								to: L,
								isActive: v
									? function () {
											return !1
									  }
									: void 0
							})
					  )
					: l.createElement(
							i.Z,
							(0, a.Z)({}, g, {
								mobile: d,
								label: I,
								to: L,
								items: y,
								isActive: v
									? function () {
											return !1
									  }
									: void 0
							})
					  )
			}
		},
		7250: function (e, t, n) {
			n.d(t, {
				Z: function () {
					return u
				}
			})
			var a = n(7462),
				r = n(3366),
				l = n(7294),
				o = n(5525),
				i = n(907),
				c = n(3018),
				s = ["label", "to", "docsPluginId"]
			function u(e) {
				var t,
					n = e.label,
					u = e.to,
					m = e.docsPluginId,
					d = (0, r.Z)(e, s),
					f = (0, i.zu)(m),
					v = (0, c.J)(m).preferredVersion,
					h = (0, i.yW)(m),
					b = null != (t = null != f ? f : v) ? t : h,
					g = null != n ? n : b.label,
					E =
						null != u
							? u
							: (function (e) {
									return e.docs.find(function (t) {
										return t.id === e.mainDocId
									})
							  })(b).path
				return l.createElement(o.Z, (0, a.Z)({}, d, { label: g, to: E }))
			}
		},
		3154: function (e, t, n) {
			var a = n(7462),
				r = n(3366),
				l = n(7294),
				o = n(6010),
				i = n(3018),
				c = n(5525),
				s = n(4201),
				u = ["items", "position", "className"],
				m = ["items", "className", "position"],
				d = ["mobile"]
			function f(e, t) {
				return e.some(function (e) {
					return (function (e, t) {
						return (
							!!(0, i.Mg)(e.to, t) ||
							!(!e.activeBaseRegex || !new RegExp(e.activeBaseRegex).test(t)) ||
							!(!e.activeBasePath || !t.startsWith(e.activeBasePath))
						)
					})(e, t)
				})
			}
			function v(e) {
				var t,
					n = e.items,
					i = e.position,
					m = e.className,
					d = (0, r.Z)(e, u),
					f = (0, l.useRef)(null),
					v = (0, l.useRef)(null),
					h = (0, l.useState)(!1),
					b = h[0],
					g = h[1]
				return (
					(0, l.useEffect)(
						function () {
							var e = function (e) {
								f.current && !f.current.contains(e.target) && g(!1)
							}
							return (
								document.addEventListener("mousedown", e),
								document.addEventListener("touchstart", e),
								function () {
									document.removeEventListener("mousedown", e),
										document.removeEventListener("touchstart", e)
								}
							)
						},
						[f]
					),
					l.createElement(
						"div",
						{
							ref: f,
							className: (0, o.Z)(
								"navbar__item",
								"dropdown",
								"dropdown--hoverable",
								{ "dropdown--right": "right" === i, "dropdown--show": b }
							)
						},
						l.createElement(
							c.O,
							(0, a.Z)(
								{ className: (0, o.Z)("navbar__item navbar__link", m) },
								d,
								{
									onClick: d.to
										? void 0
										: function (e) {
												return e.preventDefault()
										  },
									onKeyDown: function (e) {
										"Enter" === e.key && (e.preventDefault(), g(!b))
									}
								}
							),
							null != (t = d.children) ? t : d.label
						),
						l.createElement(
							"ul",
							{ ref: v, className: "dropdown__menu" },
							n.map(function (e, t) {
								return l.createElement(
									s.Z,
									(0, a.Z)(
										{
											isDropdownItem: !0,
											onKeyDown: function (e) {
												if (t === n.length - 1 && "Tab" === e.key) {
													e.preventDefault(), g(!1)
													var a = f.current.nextElementSibling
													a && a.focus()
												}
											},
											activeClassName: "dropdown__link--active"
										},
										e,
										{ key: t }
									)
								)
							})
						)
					)
				)
			}
			function h(e) {
				var t,
					n = e.items,
					u = e.className,
					d = (e.position, (0, r.Z)(e, m)),
					v = (0, i.be)(),
					h = f(n, v),
					b = (0, i.uR)({
						initialState: function () {
							return !h
						}
					}),
					g = b.collapsed,
					E = b.toggleCollapsed,
					p = b.setCollapsed
				return (
					(0, l.useEffect)(
						function () {
							h && p(!h)
						},
						[v, h]
					),
					l.createElement(
						"li",
						{
							className: (0, o.Z)("menu__list-item", {
								"menu__list-item--collapsed": g
							})
						},
						l.createElement(
							c.O,
							(0, a.Z)(
								{
									role: "button",
									className: (0, o.Z)("menu__link menu__link--sublist", u)
								},
								d,
								{
									onClick: function (e) {
										e.preventDefault(), E()
									}
								}
							),
							null != (t = d.children) ? t : d.label
						),
						l.createElement(
							i.zF,
							{ lazy: !0, as: "ul", className: "menu__list", collapsed: g },
							n.map(function (e, t) {
								return l.createElement(
									s.Z,
									(0, a.Z)(
										{
											mobile: !0,
											isDropdownItem: !0,
											onClick: d.onClick,
											activeClassName: "menu__link--active"
										},
										e,
										{ key: t }
									)
								)
							})
						)
					)
				)
			}
			t.Z = function (e) {
				var t = e.mobile,
					n = void 0 !== t && t,
					a = (0, r.Z)(e, d),
					o = n ? h : v
				return l.createElement(o, a)
			}
		},
		4201: function (e, t, n) {
			n.d(t, {
				Z: function () {
					return E
				}
			})
			var a = n(3366),
				r = n(7294),
				l = n(5525),
				o = n(3154),
				i = n(7462),
				c = ["width", "height"],
				s = function (e) {
					var t = e.width,
						n = void 0 === t ? 20 : t,
						l = e.height,
						o = void 0 === l ? 20 : l,
						s = (0, a.Z)(e, c)
					return r.createElement(
						"svg",
						(0, i.Z)(
							{
								viewBox: "0 0 20 20",
								width: n,
								height: o,
								"aria-hidden": "true"
							},
							s
						),
						r.createElement("path", {
							fill: "currentColor",
							d:
								"M19.753 10.909c-.624-1.707-2.366-2.726-4.661-2.726-.09 0-.176.002-.262.006l-.016-2.063 3.525-.607c.115-.019.133-.119.109-.231-.023-.111-.167-.883-.188-.976-.027-.131-.102-.127-.207-.109-.104.018-3.25.461-3.25.461l-.013-2.078c-.001-.125-.069-.158-.194-.156l-1.025.016c-.105.002-.164.049-.162.148l.033 2.307s-3.061.527-3.144.543c-.084.014-.17.053-.151.143.019.09.19 1.094.208 1.172.018.08.072.129.188.107l2.924-.504.035 2.018c-1.077.281-1.801.824-2.256 1.303-.768.807-1.207 1.887-1.207 2.963 0 1.586.971 2.529 2.328 2.695 3.162.387 5.119-3.06 5.769-4.715 1.097 1.506.256 4.354-2.094 5.98-.043.029-.098.129-.033.207l.619.756c.08.096.206.059.256.023 2.51-1.73 3.661-4.515 2.869-6.683zm-7.386 3.188c-.966-.121-.944-.914-.944-1.453 0-.773.327-1.58.876-2.156a3.21 3.21 0 011.229-.799l.082 4.277a2.773 2.773 0 01-1.243.131zm2.427-.553l.046-4.109c.084-.004.166-.01.252-.01.773 0 1.494.145 1.885.361.391.217-1.023 2.713-2.183 3.758zm-8.95-7.668a.196.196 0 00-.196-.145h-1.95a.194.194 0 00-.194.144L.008 16.916c-.017.051-.011.076.062.076h1.733c.075 0 .099-.023.114-.072l1.008-3.318h3.496l1.008 3.318c.016.049.039.072.113.072h1.734c.072 0 .078-.025.062-.076-.014-.05-3.083-9.741-3.494-11.04zm-2.618 6.318l1.447-5.25 1.447 5.25H3.226z"
						})
					)
				},
				u = n(2263),
				m = n(3018),
				d = ["mobile", "dropdownItemsBefore", "dropdownItemsAfter"]
			function f(e) {
				var t = e.mobile,
					n = e.dropdownItemsBefore,
					l = e.dropdownItemsAfter,
					c = (0, a.Z)(e, d),
					f = (0, u.Z)().i18n,
					v = f.currentLocale,
					h = f.locales,
					b = f.localeConfigs,
					g = (0, m.l5)()
				function E(e) {
					return b[e].label
				}
				var p = h.map(function (e) {
						var t =
							"pathname://" + g.createUrl({ locale: e, fullyQualified: !1 })
						return {
							isNavLink: !0,
							label: E(e),
							to: t,
							target: "_self",
							autoAddBaseUrl: !1,
							className: e === v ? "dropdown__link--active" : "",
							style: { textTransform: "capitalize" }
						}
					}),
					Z = [].concat(n, p, l),
					k = t ? "Languages" : E(v)
				return r.createElement(
					o.Z,
					(0, i.Z)({}, c, {
						href: "#",
						mobile: t,
						label: r.createElement(
							"span",
							null,
							r.createElement(s, {
								style: { verticalAlign: "text-bottom", marginRight: 5 }
							}),
							r.createElement("span", null, k)
						),
						items: Z
					})
				)
			}
			var v = n(1875)
			function h(e) {
				return e.mobile ? null : r.createElement(v.Z, null)
			}
			var b = ["type"],
				g = {
					default: function () {
						return l.Z
					},
					localeDropdown: function () {
						return f
					},
					search: function () {
						return h
					},
					dropdown: function () {
						return o.Z
					},
					docsVersion: function () {
						return n(7250).Z
					},
					docsVersionDropdown: function () {
						return n(9308).Z
					},
					doc: function () {
						return n(6400).Z
					}
				}
			function E(e) {
				var t = e.type,
					n = (0, a.Z)(e, b),
					l = (function (e) {
						var t = g[e]
						if (!t)
							throw new Error(
								'No NavbarItem component found for type "' + e + '".'
							)
						return t()
					})(
						(function (e, t) {
							return e && "default" !== e ? e : t ? "dropdown" : "default"
						})(t, void 0 !== n.items)
					)
				return r.createElement(l, n)
			}
		},
		2924: function (e, t, n) {
			var a = n(7294).createContext(void 0)
			t.Z = a
		},
		8465: function (e, t, n) {
			n.d(t, {
				Z: function () {
					return m
				}
			})
			var a = n(7462),
				r = n(3366),
				l = n(7294),
				o = n(6010),
				i = n(2263),
				c = n(5350),
				s = {
					themedImage: "themedImage_1VuW",
					"themedImage--light": "themedImage--light_3UqQ",
					"themedImage--dark": "themedImage--dark_hz6m"
				},
				u = ["sources", "className", "alt"],
				m = function (e) {
					var t = (0, i.Z)().isClient,
						n = (0, c.Z)().isDarkTheme,
						m = e.sources,
						d = e.className,
						f = e.alt,
						v = void 0 === f ? "" : f,
						h = (0, r.Z)(e, u),
						b = t ? (n ? ["dark"] : ["light"]) : ["light", "dark"]
					return l.createElement(
						l.Fragment,
						null,
						b.map(function (e) {
							return l.createElement(
								"img",
								(0, a.Z)(
									{
										key: e,
										src: m[e],
										alt: v,
										className: (0, o.Z)(
											s.themedImage,
											s["themedImage--" + e],
											d
										)
									},
									h
								)
							)
						})
					)
				}
		},
		7898: function (e, t, n) {
			var a = n(7294),
				r = n(412),
				l = function () {
					return r.Z.canUseDOM
						? { scrollX: window.pageXOffset, scrollY: window.pageYOffset }
						: null
				}
			t.Z = function (e, t) {
				void 0 === t && (t = [])
				var n = (0, a.useRef)(l()),
					r = function () {
						var t = l()
						e && e(t, n.current), (n.current = t)
					}
				;(0, a.useEffect)(function () {
					var e = { passive: !0 }
					return (
						r(),
						window.addEventListener("scroll", r, e),
						function () {
							return window.removeEventListener("scroll", r, e)
						}
					)
				}, t)
			}
		},
		5350: function (e, t, n) {
			var a = n(7294),
				r = n(2924)
			t.Z = function () {
				var e = (0, a.useContext)(r.Z)
				if (null == e)
					throw new Error(
						'"useThemeContext" is used outside of "Layout" component. Please see https://docusaurus.io/docs/api/themes/configuration#usethemecontext.'
					)
				return e
			}
		}
	}
])
