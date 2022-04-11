/** @format */

;(self.webpackChunkaction_masterminds =
	self.webpackChunkaction_masterminds || []).push([
	[2904],
	{
		3905: function (t, e, i) {
			"use strict"
			i.d(e, {
				Zo: function () {
					return c
				},
				kt: function () {
					return d
				}
			})
			var r = i(7294)
			function n(t, e, i) {
				return (
					e in t
						? Object.defineProperty(t, e, {
								value: i,
								enumerable: !0,
								configurable: !0,
								writable: !0
						  })
						: (t[e] = i),
					t
				)
			}
			function s(t, e) {
				var i = Object.keys(t)
				if (Object.getOwnPropertySymbols) {
					var r = Object.getOwnPropertySymbols(t)
					e &&
						(r = r.filter(function (e) {
							return Object.getOwnPropertyDescriptor(t, e).enumerable
						})),
						i.push.apply(i, r)
				}
				return i
			}
			function a(t) {
				for (var e = 1; e < arguments.length; e++) {
					var i = null != arguments[e] ? arguments[e] : {}
					e % 2
						? s(Object(i), !0).forEach(function (e) {
								n(t, e, i[e])
						  })
						: Object.getOwnPropertyDescriptors
						? Object.defineProperties(t, Object.getOwnPropertyDescriptors(i))
						: s(Object(i)).forEach(function (e) {
								Object.defineProperty(
									t,
									e,
									Object.getOwnPropertyDescriptor(i, e)
								)
						  })
				}
				return t
			}
			function o(t, e) {
				if (null == t) return {}
				var i,
					r,
					n = (function (t, e) {
						if (null == t) return {}
						var i,
							r,
							n = {},
							s = Object.keys(t)
						for (r = 0; r < s.length; r++)
							(i = s[r]), e.indexOf(i) >= 0 || (n[i] = t[i])
						return n
					})(t, e)
				if (Object.getOwnPropertySymbols) {
					var s = Object.getOwnPropertySymbols(t)
					for (r = 0; r < s.length; r++)
						(i = s[r]),
							e.indexOf(i) >= 0 ||
								(Object.prototype.propertyIsEnumerable.call(t, i) &&
									(n[i] = t[i]))
				}
				return n
			}
			var p = r.createContext({}),
				h = function (t) {
					var e = r.useContext(p),
						i = e
					return t && (i = "function" == typeof t ? t(e) : a(a({}, e), t)), i
				},
				c = function (t) {
					var e = h(t.components)
					return r.createElement(p.Provider, { value: e }, t.children)
				},
				l = {
					inlineCode: "code",
					wrapper: function (t) {
						var e = t.children
						return r.createElement(r.Fragment, {}, e)
					}
				},
				u = r.forwardRef(function (t, e) {
					var i = t.components,
						n = t.mdxType,
						s = t.originalType,
						p = t.parentName,
						c = o(t, ["components", "mdxType", "originalType", "parentName"]),
						u = h(i),
						d = n,
						f = u["".concat(p, ".").concat(d)] || u[d] || l[d] || s
					return i
						? r.createElement(f, a(a({ ref: e }, c), {}, { components: i }))
						: r.createElement(f, a({ ref: e }, c))
				})
			function d(t, e) {
				var i = arguments,
					n = e && e.mdxType
				if ("string" == typeof t || n) {
					var s = i.length,
						a = new Array(s)
					a[0] = u
					var o = {}
					for (var p in e) hasOwnProperty.call(e, p) && (o[p] = e[p])
					;(o.originalType = t),
						(o.mdxType = "string" == typeof t ? t : n),
						(a[1] = o)
					for (var h = 2; h < s; h++) a[h] = i[h]
					return r.createElement.apply(null, a)
				}
				return r.createElement.apply(null, i)
			}
			u.displayName = "MDXCreateElement"
		},
		6591: function (t, e, i) {
			"use strict"
			i.r(e),
				i.d(e, {
					features: function () {
						return vi
					},
					transform: function () {
						return bi
					}
				})
			var r = {
					3: "abstract boolean byte char class double enum export extends final float goto implements import int interface long native package private protected public short static super synchronized throws transient volatile",
					5: "class enum extends super const export import",
					6: "enum",
					strict:
						"implements interface let package private protected public static yield",
					strictBind: "eval arguments"
				},
				n =
					"break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this",
				s = { 5: n, 6: n + " const class extends export import super" },
				a = /^in(stanceof)?$/,
				o =
					"\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u037f\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u052f\u0531-\u0556\u0559\u0560-\u0588\u05d0-\u05ea\u05ef-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u0860-\u086a\u08a0-\u08b4\u08b6-\u08bd\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u09fc\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0af9\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c39\u0c3d\u0c58-\u0c5a\u0c60\u0c61\u0c80\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d54-\u0d56\u0d5f-\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f5\u13f8-\u13fd\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f8\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1878\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191e\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1c80-\u1c88\u1c90-\u1cba\u1cbd-\u1cbf\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2118-\u211d\u2124\u2126\u2128\u212a-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309b-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312f\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fef\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua69d\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua7b9\ua7f7-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua8fd\ua8fe\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\ua9e0-\ua9e4\ua9e6-\ua9ef\ua9fa-\ua9fe\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa7e-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uab30-\uab5a\uab5c-\uab65\uab70-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc",
				p =
					"\u200c\u200d\xb7\u0300-\u036f\u0387\u0483-\u0487\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u064b-\u0669\u0670\u06d6-\u06dc\u06df-\u06e4\u06e7\u06e8\u06ea-\u06ed\u06f0-\u06f9\u0711\u0730-\u074a\u07a6-\u07b0\u07c0-\u07c9\u07eb-\u07f3\u07fd\u0816-\u0819\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0859-\u085b\u08d3-\u08e1\u08e3-\u0903\u093a-\u093c\u093e-\u094f\u0951-\u0957\u0962\u0963\u0966-\u096f\u0981-\u0983\u09bc\u09be-\u09c4\u09c7\u09c8\u09cb-\u09cd\u09d7\u09e2\u09e3\u09e6-\u09ef\u09fe\u0a01-\u0a03\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a66-\u0a71\u0a75\u0a81-\u0a83\u0abc\u0abe-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ae2\u0ae3\u0ae6-\u0aef\u0afa-\u0aff\u0b01-\u0b03\u0b3c\u0b3e-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b62\u0b63\u0b66-\u0b6f\u0b82\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd7\u0be6-\u0bef\u0c00-\u0c04\u0c3e-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62\u0c63\u0c66-\u0c6f\u0c81-\u0c83\u0cbc\u0cbe-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0ce2\u0ce3\u0ce6-\u0cef\u0d00-\u0d03\u0d3b\u0d3c\u0d3e-\u0d44\u0d46-\u0d48\u0d4a-\u0d4d\u0d57\u0d62\u0d63\u0d66-\u0d6f\u0d82\u0d83\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0de6-\u0def\u0df2\u0df3\u0e31\u0e34-\u0e3a\u0e47-\u0e4e\u0e50-\u0e59\u0eb1\u0eb4-\u0eb9\u0ebb\u0ebc\u0ec8-\u0ecd\u0ed0-\u0ed9\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e\u0f3f\u0f71-\u0f84\u0f86\u0f87\u0f8d-\u0f97\u0f99-\u0fbc\u0fc6\u102b-\u103e\u1040-\u1049\u1056-\u1059\u105e-\u1060\u1062-\u1064\u1067-\u106d\u1071-\u1074\u1082-\u108d\u108f-\u109d\u135d-\u135f\u1369-\u1371\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17b4-\u17d3\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u18a9\u1920-\u192b\u1930-\u193b\u1946-\u194f\u19d0-\u19da\u1a17-\u1a1b\u1a55-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1ab0-\u1abd\u1b00-\u1b04\u1b34-\u1b44\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1b82\u1ba1-\u1bad\u1bb0-\u1bb9\u1be6-\u1bf3\u1c24-\u1c37\u1c40-\u1c49\u1c50-\u1c59\u1cd0-\u1cd2\u1cd4-\u1ce8\u1ced\u1cf2-\u1cf4\u1cf7-\u1cf9\u1dc0-\u1df9\u1dfb-\u1dff\u203f\u2040\u2054\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2cef-\u2cf1\u2d7f\u2de0-\u2dff\u302a-\u302f\u3099\u309a\ua620-\ua629\ua66f\ua674-\ua67d\ua69e\ua69f\ua6f0\ua6f1\ua802\ua806\ua80b\ua823-\ua827\ua880\ua881\ua8b4-\ua8c5\ua8d0-\ua8d9\ua8e0-\ua8f1\ua8ff-\ua909\ua926-\ua92d\ua947-\ua953\ua980-\ua983\ua9b3-\ua9c0\ua9d0-\ua9d9\ua9e5\ua9f0-\ua9f9\uaa29-\uaa36\uaa43\uaa4c\uaa4d\uaa50-\uaa59\uaa7b-\uaa7d\uaab0\uaab2-\uaab4\uaab7\uaab8\uaabe\uaabf\uaac1\uaaeb-\uaaef\uaaf5\uaaf6\uabe3-\uabea\uabec\uabed\uabf0-\uabf9\ufb1e\ufe00-\ufe0f\ufe20-\ufe2f\ufe33\ufe34\ufe4d-\ufe4f\uff10-\uff19\uff3f",
				h = new RegExp("[" + o + "]"),
				c = new RegExp("[" + o + p + "]")
			o = p = null
			var l = [
					0,
					11,
					2,
					25,
					2,
					18,
					2,
					1,
					2,
					14,
					3,
					13,
					35,
					122,
					70,
					52,
					268,
					28,
					4,
					48,
					48,
					31,
					14,
					29,
					6,
					37,
					11,
					29,
					3,
					35,
					5,
					7,
					2,
					4,
					43,
					157,
					19,
					35,
					5,
					35,
					5,
					39,
					9,
					51,
					157,
					310,
					10,
					21,
					11,
					7,
					153,
					5,
					3,
					0,
					2,
					43,
					2,
					1,
					4,
					0,
					3,
					22,
					11,
					22,
					10,
					30,
					66,
					18,
					2,
					1,
					11,
					21,
					11,
					25,
					71,
					55,
					7,
					1,
					65,
					0,
					16,
					3,
					2,
					2,
					2,
					28,
					43,
					28,
					4,
					28,
					36,
					7,
					2,
					27,
					28,
					53,
					11,
					21,
					11,
					18,
					14,
					17,
					111,
					72,
					56,
					50,
					14,
					50,
					14,
					35,
					477,
					28,
					11,
					0,
					9,
					21,
					190,
					52,
					76,
					44,
					33,
					24,
					27,
					35,
					30,
					0,
					12,
					34,
					4,
					0,
					13,
					47,
					15,
					3,
					22,
					0,
					2,
					0,
					36,
					17,
					2,
					24,
					85,
					6,
					2,
					0,
					2,
					3,
					2,
					14,
					2,
					9,
					8,
					46,
					39,
					7,
					3,
					1,
					3,
					21,
					2,
					6,
					2,
					1,
					2,
					4,
					4,
					0,
					19,
					0,
					13,
					4,
					159,
					52,
					19,
					3,
					54,
					47,
					21,
					1,
					2,
					0,
					185,
					46,
					42,
					3,
					37,
					47,
					21,
					0,
					60,
					42,
					86,
					26,
					230,
					43,
					117,
					63,
					32,
					0,
					257,
					0,
					11,
					39,
					8,
					0,
					22,
					0,
					12,
					39,
					3,
					3,
					20,
					0,
					35,
					56,
					264,
					8,
					2,
					36,
					18,
					0,
					50,
					29,
					113,
					6,
					2,
					1,
					2,
					37,
					22,
					0,
					26,
					5,
					2,
					1,
					2,
					31,
					15,
					0,
					328,
					18,
					270,
					921,
					103,
					110,
					18,
					195,
					2749,
					1070,
					4050,
					582,
					8634,
					568,
					8,
					30,
					114,
					29,
					19,
					47,
					17,
					3,
					32,
					20,
					6,
					18,
					689,
					63,
					129,
					68,
					12,
					0,
					67,
					12,
					65,
					1,
					31,
					6129,
					15,
					754,
					9486,
					286,
					82,
					395,
					2309,
					106,
					6,
					12,
					4,
					8,
					8,
					9,
					5991,
					84,
					2,
					70,
					2,
					1,
					3,
					0,
					3,
					1,
					3,
					3,
					2,
					11,
					2,
					0,
					2,
					6,
					2,
					64,
					2,
					3,
					3,
					7,
					2,
					6,
					2,
					27,
					2,
					3,
					2,
					4,
					2,
					0,
					4,
					6,
					2,
					339,
					3,
					24,
					2,
					24,
					2,
					30,
					2,
					24,
					2,
					30,
					2,
					24,
					2,
					30,
					2,
					24,
					2,
					30,
					2,
					24,
					2,
					7,
					4149,
					196,
					60,
					67,
					1213,
					3,
					2,
					26,
					2,
					1,
					2,
					0,
					3,
					0,
					2,
					9,
					2,
					3,
					2,
					0,
					2,
					0,
					7,
					0,
					5,
					0,
					2,
					0,
					2,
					0,
					2,
					2,
					2,
					1,
					2,
					0,
					3,
					0,
					2,
					0,
					2,
					0,
					2,
					0,
					2,
					0,
					2,
					1,
					2,
					0,
					3,
					3,
					2,
					6,
					2,
					3,
					2,
					3,
					2,
					0,
					2,
					9,
					2,
					16,
					6,
					2,
					2,
					4,
					2,
					16,
					4421,
					42710,
					42,
					4148,
					12,
					221,
					3,
					5761,
					15,
					7472,
					3104,
					541
				],
				u = [
					509,
					0,
					227,
					0,
					150,
					4,
					294,
					9,
					1368,
					2,
					2,
					1,
					6,
					3,
					41,
					2,
					5,
					0,
					166,
					1,
					574,
					3,
					9,
					9,
					525,
					10,
					176,
					2,
					54,
					14,
					32,
					9,
					16,
					3,
					46,
					10,
					54,
					9,
					7,
					2,
					37,
					13,
					2,
					9,
					6,
					1,
					45,
					0,
					13,
					2,
					49,
					13,
					9,
					3,
					4,
					9,
					83,
					11,
					7,
					0,
					161,
					11,
					6,
					9,
					7,
					3,
					56,
					1,
					2,
					6,
					3,
					1,
					3,
					2,
					10,
					0,
					11,
					1,
					3,
					6,
					4,
					4,
					193,
					17,
					10,
					9,
					5,
					0,
					82,
					19,
					13,
					9,
					214,
					6,
					3,
					8,
					28,
					1,
					83,
					16,
					16,
					9,
					82,
					12,
					9,
					9,
					84,
					14,
					5,
					9,
					243,
					14,
					166,
					9,
					280,
					9,
					41,
					6,
					2,
					3,
					9,
					0,
					10,
					10,
					47,
					15,
					406,
					7,
					2,
					7,
					17,
					9,
					57,
					21,
					2,
					13,
					123,
					5,
					4,
					0,
					2,
					1,
					2,
					6,
					2,
					0,
					9,
					9,
					49,
					4,
					2,
					1,
					2,
					4,
					9,
					9,
					330,
					3,
					19306,
					9,
					135,
					4,
					60,
					6,
					26,
					9,
					1016,
					45,
					17,
					3,
					19723,
					1,
					5319,
					4,
					4,
					5,
					9,
					7,
					3,
					6,
					31,
					3,
					149,
					2,
					1418,
					49,
					513,
					54,
					5,
					49,
					9,
					0,
					15,
					0,
					23,
					4,
					2,
					14,
					1361,
					6,
					2,
					16,
					3,
					6,
					2,
					1,
					2,
					4,
					2214,
					6,
					110,
					6,
					6,
					9,
					792487,
					239
				]
			function d(t, e) {
				for (var i = 65536, r = 0; r < e.length; r += 2) {
					if ((i += e[r]) > t) return !1
					if ((i += e[r + 1]) >= t) return !0
				}
			}
			function f(t, e) {
				return t < 65
					? 36 === t
					: t < 91 ||
							(t < 97
								? 95 === t
								: t < 123 ||
								  (t <= 65535
										? t >= 170 && h.test(String.fromCharCode(t))
										: !1 !== e && d(t, l)))
			}
			function m(t, e) {
				return t < 48
					? 36 === t
					: t < 58 ||
							(!(t < 65) &&
								(t < 91 ||
									(t < 97
										? 95 === t
										: t < 123 ||
										  (t <= 65535
												? t >= 170 && c.test(String.fromCharCode(t))
												: !1 !== e && (d(t, l) || d(t, u))))))
			}
			var y = function (t, e) {
				void 0 === e && (e = {}),
					(this.label = t),
					(this.keyword = e.keyword),
					(this.beforeExpr = !!e.beforeExpr),
					(this.startsExpr = !!e.startsExpr),
					(this.isLoop = !!e.isLoop),
					(this.isAssign = !!e.isAssign),
					(this.prefix = !!e.prefix),
					(this.postfix = !!e.postfix),
					(this.binop = e.binop || null),
					(this.updateContext = null)
			}
			function g(t, e) {
				return new y(t, { beforeExpr: !0, binop: e })
			}
			var v = { beforeExpr: !0 },
				x = { startsExpr: !0 },
				b = {}
			function _(t, e) {
				return void 0 === e && (e = {}), (e.keyword = t), (b[t] = new y(t, e))
			}
			var k = {
					num: new y("num", x),
					regexp: new y("regexp", x),
					string: new y("string", x),
					name: new y("name", x),
					eof: new y("eof"),
					bracketL: new y("[", { beforeExpr: !0, startsExpr: !0 }),
					bracketR: new y("]"),
					braceL: new y("{", { beforeExpr: !0, startsExpr: !0 }),
					braceR: new y("}"),
					parenL: new y("(", { beforeExpr: !0, startsExpr: !0 }),
					parenR: new y(")"),
					comma: new y(",", v),
					semi: new y(";", v),
					colon: new y(":", v),
					dot: new y("."),
					question: new y("?", v),
					arrow: new y("=>", v),
					template: new y("template"),
					invalidTemplate: new y("invalidTemplate"),
					ellipsis: new y("...", v),
					backQuote: new y("`", x),
					dollarBraceL: new y("${", { beforeExpr: !0, startsExpr: !0 }),
					eq: new y("=", { beforeExpr: !0, isAssign: !0 }),
					assign: new y("_=", { beforeExpr: !0, isAssign: !0 }),
					incDec: new y("++/--", { prefix: !0, postfix: !0, startsExpr: !0 }),
					prefix: new y("!/~", { beforeExpr: !0, prefix: !0, startsExpr: !0 }),
					logicalOR: g("||", 1),
					logicalAND: g("&&", 2),
					bitwiseOR: g("|", 3),
					bitwiseXOR: g("^", 4),
					bitwiseAND: g("&", 5),
					equality: g("==/!=/===/!==", 6),
					relational: g("</>/<=/>=", 7),
					bitShift: g("<</>>/>>>", 8),
					plusMin: new y("+/-", {
						beforeExpr: !0,
						binop: 9,
						prefix: !0,
						startsExpr: !0
					}),
					modulo: g("%", 10),
					star: g("*", 10),
					slash: g("/", 10),
					starstar: new y("**", { beforeExpr: !0 }),
					_break: _("break"),
					_case: _("case", v),
					_catch: _("catch"),
					_continue: _("continue"),
					_debugger: _("debugger"),
					_default: _("default", v),
					_do: _("do", { isLoop: !0, beforeExpr: !0 }),
					_else: _("else", v),
					_finally: _("finally"),
					_for: _("for", { isLoop: !0 }),
					_function: _("function", x),
					_if: _("if"),
					_return: _("return", v),
					_switch: _("switch"),
					_throw: _("throw", v),
					_try: _("try"),
					_var: _("var"),
					_const: _("const"),
					_while: _("while", { isLoop: !0 }),
					_with: _("with"),
					_new: _("new", { beforeExpr: !0, startsExpr: !0 }),
					_this: _("this", x),
					_super: _("super", x),
					_class: _("class", x),
					_extends: _("extends", v),
					_export: _("export"),
					_import: _("import"),
					_null: _("null", x),
					_true: _("true", x),
					_false: _("false", x),
					_in: _("in", { beforeExpr: !0, binop: 7 }),
					_instanceof: _("instanceof", { beforeExpr: !0, binop: 7 }),
					_typeof: _("typeof", { beforeExpr: !0, prefix: !0, startsExpr: !0 }),
					_void: _("void", { beforeExpr: !0, prefix: !0, startsExpr: !0 }),
					_delete: _("delete", { beforeExpr: !0, prefix: !0, startsExpr: !0 })
				},
				S = /\r\n?|\n|\u2028|\u2029/,
				w = new RegExp(S.source, "g")
			function E(t, e) {
				return 10 === t || 13 === t || (!e && (8232 === t || 8233 === t))
			}
			var C = /[\u1680\u2000-\u200a\u202f\u205f\u3000\ufeff]/,
				A = /(?:\s|\/\/.*|\/\*[^]*?\*\/)*/g,
				I = Object.prototype,
				P = I.hasOwnProperty,
				L = I.toString
			function O(t, e) {
				return P.call(t, e)
			}
			var N =
				Array.isArray ||
				function (t) {
					return "[object Array]" === L.call(t)
				}
			function j(t) {
				return new RegExp("^(?:" + t.replace(/ /g, "|") + ")$")
			}
			var T = function (t, e) {
				;(this.line = t), (this.column = e)
			}
			T.prototype.offset = function (t) {
				return new T(this.line, this.column + t)
			}
			var R = function (t, e, i) {
				;(this.start = e),
					(this.end = i),
					null !== t.sourceFile && (this.source = t.sourceFile)
			}
			function V(t, e) {
				for (var i = 1, r = 0; ; ) {
					w.lastIndex = r
					var n = w.exec(t)
					if (!(n && n.index < e)) return new T(i, e - r)
					++i, (r = n.index + n[0].length)
				}
			}
			var D = {
				ecmaVersion: 9,
				sourceType: "script",
				onInsertedSemicolon: null,
				onTrailingComma: null,
				allowReserved: null,
				allowReturnOutsideFunction: !1,
				allowImportExportEverywhere: !1,
				allowAwaitOutsideFunction: !1,
				allowHashBang: !1,
				locations: !1,
				onToken: null,
				onComment: null,
				ranges: !1,
				program: null,
				sourceFile: null,
				directSourceFile: null,
				preserveParens: !1
			}
			function F(t, e) {
				return 2 | (t ? 4 : 0) | (e ? 8 : 0)
			}
			var B = function (t, e, i) {
					;(this.options = t = (function (t) {
						var e = {}
						for (var i in D) e[i] = t && O(t, i) ? t[i] : D[i]
						if (
							(e.ecmaVersion >= 2015 && (e.ecmaVersion -= 2009),
							null == e.allowReserved && (e.allowReserved = e.ecmaVersion < 5),
							N(e.onToken))
						) {
							var r = e.onToken
							e.onToken = function (t) {
								return r.push(t)
							}
						}
						return (
							N(e.onComment) &&
								(e.onComment = (function (t, e) {
									return function (i, r, n, s, a, o) {
										var p = {
											type: i ? "Block" : "Line",
											value: r,
											start: n,
											end: s
										}
										t.locations && (p.loc = new R(this, a, o)),
											t.ranges && (p.range = [n, s]),
											e.push(p)
									}
								})(e, e.onComment)),
							e
						)
					})(t)),
						(this.sourceFile = t.sourceFile),
						(this.keywords = j(s[t.ecmaVersion >= 6 ? 6 : 5]))
					var n = ""
					if (!t.allowReserved) {
						for (var a = t.ecmaVersion; !(n = r[a]); a--);
						"module" === t.sourceType && (n += " await")
					}
					this.reservedWords = j(n)
					var o = (n ? n + " " : "") + r.strict
					;(this.reservedWordsStrict = j(o)),
						(this.reservedWordsStrictBind = j(o + " " + r.strictBind)),
						(this.input = String(e)),
						(this.containsEsc = !1),
						i
							? ((this.pos = i),
							  (this.lineStart = this.input.lastIndexOf("\n", i - 1) + 1),
							  (this.curLine = this.input
									.slice(0, this.lineStart)
									.split(S).length))
							: ((this.pos = this.lineStart = 0), (this.curLine = 1)),
						(this.type = k.eof),
						(this.value = null),
						(this.start = this.end = this.pos),
						(this.startLoc = this.endLoc = this.curPosition()),
						(this.lastTokEndLoc = this.lastTokStartLoc = null),
						(this.lastTokStart = this.lastTokEnd = this.pos),
						(this.context = this.initialContext()),
						(this.exprAllowed = !0),
						(this.inModule = "module" === t.sourceType),
						(this.strict = this.inModule || this.strictDirective(this.pos)),
						(this.potentialArrowAt = -1),
						(this.yieldPos = this.awaitPos = this.awaitIdentPos = 0),
						(this.labels = []),
						(this.undefinedExports = {}),
						0 === this.pos &&
							t.allowHashBang &&
							"#!" === this.input.slice(0, 2) &&
							this.skipLineComment(2),
						(this.scopeStack = []),
						this.enterScope(1),
						(this.regexpState = null)
				},
				M = {
					inFunction: { configurable: !0 },
					inGenerator: { configurable: !0 },
					inAsync: { configurable: !0 },
					allowSuper: { configurable: !0 },
					allowDirectSuper: { configurable: !0 },
					treatFunctionsAsVar: { configurable: !0 }
				}
			;(B.prototype.parse = function () {
				var t = this.options.program || this.startNode()
				return this.nextToken(), this.parseTopLevel(t)
			}),
				(M.inFunction.get = function () {
					return (2 & this.currentVarScope().flags) > 0
				}),
				(M.inGenerator.get = function () {
					return (8 & this.currentVarScope().flags) > 0
				}),
				(M.inAsync.get = function () {
					return (4 & this.currentVarScope().flags) > 0
				}),
				(M.allowSuper.get = function () {
					return (64 & this.currentThisScope().flags) > 0
				}),
				(M.allowDirectSuper.get = function () {
					return (128 & this.currentThisScope().flags) > 0
				}),
				(M.treatFunctionsAsVar.get = function () {
					return this.treatFunctionsAsVarInScope(this.currentScope())
				}),
				(B.prototype.inNonArrowFunction = function () {
					return (2 & this.currentThisScope().flags) > 0
				}),
				(B.extend = function () {
					for (var t = [], e = arguments.length; e--; ) t[e] = arguments[e]
					for (var i = this, r = 0; r < t.length; r++) i = t[r](i)
					return i
				}),
				(B.parse = function (t, e) {
					return new this(e, t).parse()
				}),
				(B.parseExpressionAt = function (t, e, i) {
					var r = new this(i, t, e)
					return r.nextToken(), r.parseExpression()
				}),
				(B.tokenizer = function (t, e) {
					return new this(e, t)
				}),
				Object.defineProperties(B.prototype, M)
			var U = B.prototype,
				q = /^(?:'((?:\\.|[^'])*?)'|"((?:\\.|[^"])*?)")/
			function z() {
				this.shorthandAssign = this.trailingComma = this.parenthesizedAssign = this.parenthesizedBind = this.doubleProto = -1
			}
			;(U.strictDirective = function (t) {
				for (;;) {
					;(A.lastIndex = t), (t += A.exec(this.input)[0].length)
					var e = q.exec(this.input.slice(t))
					if (!e) return !1
					if ("use strict" === (e[1] || e[2])) return !0
					;(A.lastIndex = t += e[0].length),
						(t += A.exec(this.input)[0].length),
						";" === this.input[t] && t++
				}
			}),
				(U.eat = function (t) {
					return this.type === t && (this.next(), !0)
				}),
				(U.isContextual = function (t) {
					return this.type === k.name && this.value === t && !this.containsEsc
				}),
				(U.eatContextual = function (t) {
					return !!this.isContextual(t) && (this.next(), !0)
				}),
				(U.expectContextual = function (t) {
					this.eatContextual(t) || this.unexpected()
				}),
				(U.canInsertSemicolon = function () {
					return (
						this.type === k.eof ||
						this.type === k.braceR ||
						S.test(this.input.slice(this.lastTokEnd, this.start))
					)
				}),
				(U.insertSemicolon = function () {
					if (this.canInsertSemicolon())
						return (
							this.options.onInsertedSemicolon &&
								this.options.onInsertedSemicolon(
									this.lastTokEnd,
									this.lastTokEndLoc
								),
							!0
						)
				}),
				(U.semicolon = function () {
					this.eat(k.semi) || this.insertSemicolon() || this.unexpected()
				}),
				(U.afterTrailingComma = function (t, e) {
					if (this.type === t)
						return (
							this.options.onTrailingComma &&
								this.options.onTrailingComma(
									this.lastTokStart,
									this.lastTokStartLoc
								),
							e || this.next(),
							!0
						)
				}),
				(U.expect = function (t) {
					this.eat(t) || this.unexpected()
				}),
				(U.unexpected = function (t) {
					this.raise(null != t ? t : this.start, "Unexpected token")
				}),
				(U.checkPatternErrors = function (t, e) {
					if (t) {
						t.trailingComma > -1 &&
							this.raiseRecoverable(
								t.trailingComma,
								"Comma is not permitted after the rest element"
							)
						var i = e ? t.parenthesizedAssign : t.parenthesizedBind
						i > -1 && this.raiseRecoverable(i, "Parenthesized pattern")
					}
				}),
				(U.checkExpressionErrors = function (t, e) {
					if (!t) return !1
					var i = t.shorthandAssign,
						r = t.doubleProto
					if (!e) return i >= 0 || r >= 0
					i >= 0 &&
						this.raise(
							i,
							"Shorthand property assignments are valid only in destructuring patterns"
						),
						r >= 0 &&
							this.raiseRecoverable(r, "Redefinition of __proto__ property")
				}),
				(U.checkYieldAwaitInDefaultParams = function () {
					this.yieldPos &&
						(!this.awaitPos || this.yieldPos < this.awaitPos) &&
						this.raise(
							this.yieldPos,
							"Yield expression cannot be a default value"
						),
						this.awaitPos &&
							this.raise(
								this.awaitPos,
								"Await expression cannot be a default value"
							)
				}),
				(U.isSimpleAssignTarget = function (t) {
					return "ParenthesizedExpression" === t.type
						? this.isSimpleAssignTarget(t.expression)
						: "Identifier" === t.type || "MemberExpression" === t.type
				})
			var W = B.prototype
			W.parseTopLevel = function (t) {
				var e = {}
				for (t.body || (t.body = []); this.type !== k.eof; ) {
					var i = this.parseStatement(null, !0, e)
					t.body.push(i)
				}
				if (this.inModule)
					for (
						var r = 0, n = Object.keys(this.undefinedExports);
						r < n.length;
						r += 1
					) {
						var s = n[r]
						this.raiseRecoverable(
							this.undefinedExports[s].start,
							"Export '" + s + "' is not defined"
						)
					}
				return (
					this.adaptDirectivePrologue(t.body),
					this.next(),
					this.options.ecmaVersion >= 6 &&
						(t.sourceType = this.options.sourceType),
					this.finishNode(t, "Program")
				)
			}
			var X = { kind: "loop" },
				J = { kind: "switch" }
			;(W.isLet = function (t) {
				if (this.options.ecmaVersion < 6 || !this.isContextual("let")) return !1
				A.lastIndex = this.pos
				var e = A.exec(this.input),
					i = this.pos + e[0].length,
					r = this.input.charCodeAt(i)
				if (91 === r) return !0
				if (t) return !1
				if (123 === r) return !0
				if (f(r, !0)) {
					for (var n = i + 1; m(this.input.charCodeAt(n), !0); ) ++n
					var s = this.input.slice(i, n)
					if (!a.test(s)) return !0
				}
				return !1
			}),
				(W.isAsyncFunction = function () {
					if (this.options.ecmaVersion < 8 || !this.isContextual("async"))
						return !1
					A.lastIndex = this.pos
					var t = A.exec(this.input),
						e = this.pos + t[0].length
					return !(
						S.test(this.input.slice(this.pos, e)) ||
						"function" !== this.input.slice(e, e + 8) ||
						(e + 8 !== this.input.length && m(this.input.charAt(e + 8)))
					)
				}),
				(W.parseStatement = function (t, e, i) {
					var r,
						n = this.type,
						s = this.startNode()
					switch ((this.isLet(t) && ((n = k._var), (r = "let")), n)) {
						case k._break:
						case k._continue:
							return this.parseBreakContinueStatement(s, n.keyword)
						case k._debugger:
							return this.parseDebuggerStatement(s)
						case k._do:
							return this.parseDoStatement(s)
						case k._for:
							return this.parseForStatement(s)
						case k._function:
							return (
								t &&
									(this.strict || ("if" !== t && "label" !== t)) &&
									this.options.ecmaVersion >= 6 &&
									this.unexpected(),
								this.parseFunctionStatement(s, !1, !t)
							)
						case k._class:
							return t && this.unexpected(), this.parseClass(s, !0)
						case k._if:
							return this.parseIfStatement(s)
						case k._return:
							return this.parseReturnStatement(s)
						case k._switch:
							return this.parseSwitchStatement(s)
						case k._throw:
							return this.parseThrowStatement(s)
						case k._try:
							return this.parseTryStatement(s)
						case k._const:
						case k._var:
							return (
								(r = r || this.value),
								t && "var" !== r && this.unexpected(),
								this.parseVarStatement(s, r)
							)
						case k._while:
							return this.parseWhileStatement(s)
						case k._with:
							return this.parseWithStatement(s)
						case k.braceL:
							return this.parseBlock(!0, s)
						case k.semi:
							return this.parseEmptyStatement(s)
						case k._export:
						case k._import:
							return (
								this.options.allowImportExportEverywhere ||
									(e ||
										this.raise(
											this.start,
											"'import' and 'export' may only appear at the top level"
										),
									this.inModule ||
										this.raise(
											this.start,
											"'import' and 'export' may appear only with 'sourceType: module'"
										)),
								n === k._import ? this.parseImport(s) : this.parseExport(s, i)
							)
						default:
							if (this.isAsyncFunction())
								return (
									t && this.unexpected(),
									this.next(),
									this.parseFunctionStatement(s, !0, !t)
								)
							var a = this.value,
								o = this.parseExpression()
							return n === k.name &&
								"Identifier" === o.type &&
								this.eat(k.colon)
								? this.parseLabeledStatement(s, a, o, t)
								: this.parseExpressionStatement(s, o)
					}
				}),
				(W.parseBreakContinueStatement = function (t, e) {
					var i = "break" === e
					this.next(),
						this.eat(k.semi) || this.insertSemicolon()
							? (t.label = null)
							: this.type !== k.name
							? this.unexpected()
							: ((t.label = this.parseIdent()), this.semicolon())
					for (var r = 0; r < this.labels.length; ++r) {
						var n = this.labels[r]
						if (null == t.label || n.name === t.label.name) {
							if (null != n.kind && (i || "loop" === n.kind)) break
							if (t.label && i) break
						}
					}
					return (
						r === this.labels.length && this.raise(t.start, "Unsyntactic " + e),
						this.finishNode(t, i ? "BreakStatement" : "ContinueStatement")
					)
				}),
				(W.parseDebuggerStatement = function (t) {
					return (
						this.next(),
						this.semicolon(),
						this.finishNode(t, "DebuggerStatement")
					)
				}),
				(W.parseDoStatement = function (t) {
					return (
						this.next(),
						this.labels.push(X),
						(t.body = this.parseStatement("do")),
						this.labels.pop(),
						this.expect(k._while),
						(t.test = this.parseParenExpression()),
						this.options.ecmaVersion >= 6 ? this.eat(k.semi) : this.semicolon(),
						this.finishNode(t, "DoWhileStatement")
					)
				}),
				(W.parseForStatement = function (t) {
					this.next()
					var e =
						this.options.ecmaVersion >= 9 &&
						(this.inAsync ||
							(!this.inFunction && this.options.allowAwaitOutsideFunction)) &&
						this.eatContextual("await")
							? this.lastTokStart
							: -1
					if (
						(this.labels.push(X),
						this.enterScope(0),
						this.expect(k.parenL),
						this.type === k.semi)
					)
						return e > -1 && this.unexpected(e), this.parseFor(t, null)
					var i = this.isLet()
					if (this.type === k._var || this.type === k._const || i) {
						var r = this.startNode(),
							n = i ? "let" : this.value
						return (
							this.next(),
							this.parseVar(r, !0, n),
							this.finishNode(r, "VariableDeclaration"),
							!(
								this.type === k._in ||
								(this.options.ecmaVersion >= 6 && this.isContextual("of"))
							) ||
							1 !== r.declarations.length ||
							("var" !== n && r.declarations[0].init)
								? (e > -1 && this.unexpected(e), this.parseFor(t, r))
								: (this.options.ecmaVersion >= 9 &&
										(this.type === k._in
											? e > -1 && this.unexpected(e)
											: (t.await = e > -1)),
								  this.parseForIn(t, r))
						)
					}
					var s = new z(),
						a = this.parseExpression(!0, s)
					return this.type === k._in ||
						(this.options.ecmaVersion >= 6 && this.isContextual("of"))
						? (this.options.ecmaVersion >= 9 &&
								(this.type === k._in
									? e > -1 && this.unexpected(e)
									: (t.await = e > -1)),
						  this.toAssignable(a, !1, s),
						  this.checkLVal(a),
						  this.parseForIn(t, a))
						: (this.checkExpressionErrors(s, !0),
						  e > -1 && this.unexpected(e),
						  this.parseFor(t, a))
				}),
				(W.parseFunctionStatement = function (t, e, i) {
					return this.next(), this.parseFunction(t, K | (i ? 0 : Z), !1, e)
				}),
				(W.parseIfStatement = function (t) {
					return (
						this.next(),
						(t.test = this.parseParenExpression()),
						(t.consequent = this.parseStatement("if")),
						(t.alternate = this.eat(k._else)
							? this.parseStatement("if")
							: null),
						this.finishNode(t, "IfStatement")
					)
				}),
				(W.parseReturnStatement = function (t) {
					return (
						this.inFunction ||
							this.options.allowReturnOutsideFunction ||
							this.raise(this.start, "'return' outside of function"),
						this.next(),
						this.eat(k.semi) || this.insertSemicolon()
							? (t.argument = null)
							: ((t.argument = this.parseExpression()), this.semicolon()),
						this.finishNode(t, "ReturnStatement")
					)
				}),
				(W.parseSwitchStatement = function (t) {
					var e
					this.next(),
						(t.discriminant = this.parseParenExpression()),
						(t.cases = []),
						this.expect(k.braceL),
						this.labels.push(J),
						this.enterScope(0)
					for (var i = !1; this.type !== k.braceR; )
						if (this.type === k._case || this.type === k._default) {
							var r = this.type === k._case
							e && this.finishNode(e, "SwitchCase"),
								t.cases.push((e = this.startNode())),
								(e.consequent = []),
								this.next(),
								r
									? (e.test = this.parseExpression())
									: (i &&
											this.raiseRecoverable(
												this.lastTokStart,
												"Multiple default clauses"
											),
									  (i = !0),
									  (e.test = null)),
								this.expect(k.colon)
						} else
							e || this.unexpected(),
								e.consequent.push(this.parseStatement(null))
					return (
						this.exitScope(),
						e && this.finishNode(e, "SwitchCase"),
						this.next(),
						this.labels.pop(),
						this.finishNode(t, "SwitchStatement")
					)
				}),
				(W.parseThrowStatement = function (t) {
					return (
						this.next(),
						S.test(this.input.slice(this.lastTokEnd, this.start)) &&
							this.raise(this.lastTokEnd, "Illegal newline after throw"),
						(t.argument = this.parseExpression()),
						this.semicolon(),
						this.finishNode(t, "ThrowStatement")
					)
				})
			var H = []
			;(W.parseTryStatement = function (t) {
				if (
					(this.next(),
					(t.block = this.parseBlock()),
					(t.handler = null),
					this.type === k._catch)
				) {
					var e = this.startNode()
					if ((this.next(), this.eat(k.parenL))) {
						e.param = this.parseBindingAtom()
						var i = "Identifier" === e.param.type
						this.enterScope(i ? 32 : 0),
							this.checkLVal(e.param, i ? 4 : 2),
							this.expect(k.parenR)
					} else
						this.options.ecmaVersion < 10 && this.unexpected(),
							(e.param = null),
							this.enterScope(0)
					;(e.body = this.parseBlock(!1)),
						this.exitScope(),
						(t.handler = this.finishNode(e, "CatchClause"))
				}
				return (
					(t.finalizer = this.eat(k._finally) ? this.parseBlock() : null),
					t.handler ||
						t.finalizer ||
						this.raise(t.start, "Missing catch or finally clause"),
					this.finishNode(t, "TryStatement")
				)
			}),
				(W.parseVarStatement = function (t, e) {
					return (
						this.next(),
						this.parseVar(t, !1, e),
						this.semicolon(),
						this.finishNode(t, "VariableDeclaration")
					)
				}),
				(W.parseWhileStatement = function (t) {
					return (
						this.next(),
						(t.test = this.parseParenExpression()),
						this.labels.push(X),
						(t.body = this.parseStatement("while")),
						this.labels.pop(),
						this.finishNode(t, "WhileStatement")
					)
				}),
				(W.parseWithStatement = function (t) {
					return (
						this.strict && this.raise(this.start, "'with' in strict mode"),
						this.next(),
						(t.object = this.parseParenExpression()),
						(t.body = this.parseStatement("with")),
						this.finishNode(t, "WithStatement")
					)
				}),
				(W.parseEmptyStatement = function (t) {
					return this.next(), this.finishNode(t, "EmptyStatement")
				}),
				(W.parseLabeledStatement = function (t, e, i, r) {
					for (var n = 0, s = this.labels; n < s.length; n += 1)
						s[n].name === e &&
							this.raise(i.start, "Label '" + e + "' is already declared")
					for (
						var a = this.type.isLoop
								? "loop"
								: this.type === k._switch
								? "switch"
								: null,
							o = this.labels.length - 1;
						o >= 0;
						o--
					) {
						var p = this.labels[o]
						if (p.statementStart !== t.start) break
						;(p.statementStart = this.start), (p.kind = a)
					}
					return (
						this.labels.push({ name: e, kind: a, statementStart: this.start }),
						(t.body = this.parseStatement(
							r ? (-1 === r.indexOf("label") ? r + "label" : r) : "label"
						)),
						this.labels.pop(),
						(t.label = i),
						this.finishNode(t, "LabeledStatement")
					)
				}),
				(W.parseExpressionStatement = function (t, e) {
					return (
						(t.expression = e),
						this.semicolon(),
						this.finishNode(t, "ExpressionStatement")
					)
				}),
				(W.parseBlock = function (t, e) {
					for (
						void 0 === t && (t = !0),
							void 0 === e && (e = this.startNode()),
							e.body = [],
							this.expect(k.braceL),
							t && this.enterScope(0);
						!this.eat(k.braceR);

					) {
						var i = this.parseStatement(null)
						e.body.push(i)
					}
					return t && this.exitScope(), this.finishNode(e, "BlockStatement")
				}),
				(W.parseFor = function (t, e) {
					return (
						(t.init = e),
						this.expect(k.semi),
						(t.test = this.type === k.semi ? null : this.parseExpression()),
						this.expect(k.semi),
						(t.update = this.type === k.parenR ? null : this.parseExpression()),
						this.expect(k.parenR),
						(t.body = this.parseStatement("for")),
						this.exitScope(),
						this.labels.pop(),
						this.finishNode(t, "ForStatement")
					)
				}),
				(W.parseForIn = function (t, e) {
					var i = this.type === k._in ? "ForInStatement" : "ForOfStatement"
					return (
						this.next(),
						"ForInStatement" === i &&
							("AssignmentPattern" === e.type ||
								("VariableDeclaration" === e.type &&
									null != e.declarations[0].init &&
									(this.strict ||
										"Identifier" !== e.declarations[0].id.type))) &&
							this.raise(e.start, "Invalid assignment in for-in loop head"),
						(t.left = e),
						(t.right =
							"ForInStatement" === i
								? this.parseExpression()
								: this.parseMaybeAssign()),
						this.expect(k.parenR),
						(t.body = this.parseStatement("for")),
						this.exitScope(),
						this.labels.pop(),
						this.finishNode(t, i)
					)
				}),
				(W.parseVar = function (t, e, i) {
					for (t.declarations = [], t.kind = i; ; ) {
						var r = this.startNode()
						if (
							(this.parseVarId(r, i),
							this.eat(k.eq)
								? (r.init = this.parseMaybeAssign(e))
								: "const" !== i ||
								  this.type === k._in ||
								  (this.options.ecmaVersion >= 6 && this.isContextual("of"))
								? "Identifier" === r.id.type ||
								  (e && (this.type === k._in || this.isContextual("of")))
									? (r.init = null)
									: this.raise(
											this.lastTokEnd,
											"Complex binding patterns require an initialization value"
									  )
								: this.unexpected(),
							t.declarations.push(this.finishNode(r, "VariableDeclarator")),
							!this.eat(k.comma))
						)
							break
					}
					return t
				}),
				(W.parseVarId = function (t, e) {
					;("const" !== e && "let" !== e) ||
						!this.isContextual("let") ||
						this.raiseRecoverable(
							this.start,
							"let is disallowed as a lexically bound name"
						),
						(t.id = this.parseBindingAtom()),
						this.checkLVal(t.id, "var" === e ? 1 : 2, !1)
				})
			var K = 1,
				Z = 2
			;(W.parseFunction = function (t, e, i, r) {
				this.initFunction(t),
					(this.options.ecmaVersion >= 9 ||
						(this.options.ecmaVersion >= 6 && !r)) &&
						(this.type === k.star && e & Z && this.unexpected(),
						(t.generator = this.eat(k.star))),
					this.options.ecmaVersion >= 8 && (t.async = !!r),
					e & K &&
						((t.id = 4 & e && this.type !== k.name ? null : this.parseIdent()),
						!t.id ||
							e & Z ||
							this.checkLVal(
								t.id,
								this.strict || t.generator || t.async
									? this.treatFunctionsAsVar
										? 1
										: 2
									: 3
							))
				var n = this.yieldPos,
					s = this.awaitPos,
					a = this.awaitIdentPos
				return (
					(this.yieldPos = 0),
					(this.awaitPos = 0),
					(this.awaitIdentPos = 0),
					this.enterScope(F(t.async, t.generator)),
					e & K || (t.id = this.type === k.name ? this.parseIdent() : null),
					this.parseFunctionParams(t),
					this.parseFunctionBody(t, i, !1),
					(this.yieldPos = n),
					(this.awaitPos = s),
					(this.awaitIdentPos = a),
					this.finishNode(
						t,
						e & K ? "FunctionDeclaration" : "FunctionExpression"
					)
				)
			}),
				(W.parseFunctionParams = function (t) {
					this.expect(k.parenL),
						(t.params = this.parseBindingList(
							k.parenR,
							!1,
							this.options.ecmaVersion >= 8
						)),
						this.checkYieldAwaitInDefaultParams()
				}),
				(W.parseClass = function (t, e) {
					this.next()
					var i = this.strict
					;(this.strict = !0), this.parseClassId(t, e), this.parseClassSuper(t)
					var r = this.startNode(),
						n = !1
					for (r.body = [], this.expect(k.braceL); !this.eat(k.braceR); ) {
						var s = this.parseClassElement(null !== t.superClass)
						s &&
							(r.body.push(s),
							"MethodDefinition" === s.type &&
								"constructor" === s.kind &&
								(n &&
									this.raise(
										s.start,
										"Duplicate constructor in the same class"
									),
								(n = !0)))
					}
					return (
						(t.body = this.finishNode(r, "ClassBody")),
						(this.strict = i),
						this.finishNode(t, e ? "ClassDeclaration" : "ClassExpression")
					)
				}),
				(W.parseClassElement = function (t) {
					var e = this
					if (this.eat(k.semi)) return null
					var i = this.startNode(),
						r = function (t, r) {
							void 0 === r && (r = !1)
							var n = e.start,
								s = e.startLoc
							return !(
								!e.eatContextual(t) ||
								((e.type === k.parenL || (r && e.canInsertSemicolon())) &&
									(i.key && e.unexpected(),
									(i.computed = !1),
									(i.key = e.startNodeAt(n, s)),
									(i.key.name = t),
									e.finishNode(i.key, "Identifier"),
									1))
							)
						}
					;(i.kind = "method"), (i.static = r("static"))
					var n = this.eat(k.star),
						s = !1
					n ||
						(this.options.ecmaVersion >= 8 && r("async", !0)
							? ((s = !0),
							  (n = this.options.ecmaVersion >= 9 && this.eat(k.star)))
							: r("get")
							? (i.kind = "get")
							: r("set") && (i.kind = "set")),
						i.key || this.parsePropertyName(i)
					var a = i.key,
						o = !1
					return (
						i.computed ||
						i.static ||
						!(
							("Identifier" === a.type && "constructor" === a.name) ||
							("Literal" === a.type && "constructor" === a.value)
						)
							? i.static &&
							  "Identifier" === a.type &&
							  "prototype" === a.name &&
							  this.raise(
									a.start,
									"Classes may not have a static property named prototype"
							  )
							: ("method" !== i.kind &&
									this.raise(
										a.start,
										"Constructor can't have get/set modifier"
									),
							  n && this.raise(a.start, "Constructor can't be a generator"),
							  s &&
									this.raise(a.start, "Constructor can't be an async method"),
							  (i.kind = "constructor"),
							  (o = t)),
						this.parseClassMethod(i, n, s, o),
						"get" === i.kind &&
							0 !== i.value.params.length &&
							this.raiseRecoverable(
								i.value.start,
								"getter should have no params"
							),
						"set" === i.kind &&
							1 !== i.value.params.length &&
							this.raiseRecoverable(
								i.value.start,
								"setter should have exactly one param"
							),
						"set" === i.kind &&
							"RestElement" === i.value.params[0].type &&
							this.raiseRecoverable(
								i.value.params[0].start,
								"Setter cannot use rest params"
							),
						i
					)
				}),
				(W.parseClassMethod = function (t, e, i, r) {
					return (
						(t.value = this.parseMethod(e, i, r)),
						this.finishNode(t, "MethodDefinition")
					)
				}),
				(W.parseClassId = function (t, e) {
					this.type === k.name
						? ((t.id = this.parseIdent()), e && this.checkLVal(t.id, 2, !1))
						: (!0 === e && this.unexpected(), (t.id = null))
				}),
				(W.parseClassSuper = function (t) {
					t.superClass = this.eat(k._extends)
						? this.parseExprSubscripts()
						: null
				}),
				(W.parseExport = function (t, e) {
					if ((this.next(), this.eat(k.star)))
						return (
							this.expectContextual("from"),
							this.type !== k.string && this.unexpected(),
							(t.source = this.parseExprAtom()),
							this.semicolon(),
							this.finishNode(t, "ExportAllDeclaration")
						)
					if (this.eat(k._default)) {
						var i
						if (
							(this.checkExport(e, "default", this.lastTokStart),
							this.type === k._function || (i = this.isAsyncFunction()))
						) {
							var r = this.startNode()
							this.next(),
								i && this.next(),
								(t.declaration = this.parseFunction(r, 4 | K, !1, i))
						} else if (this.type === k._class) {
							var n = this.startNode()
							t.declaration = this.parseClass(n, "nullableID")
						} else (t.declaration = this.parseMaybeAssign()), this.semicolon()
						return this.finishNode(t, "ExportDefaultDeclaration")
					}
					if (this.shouldParseExportStatement())
						(t.declaration = this.parseStatement(null)),
							"VariableDeclaration" === t.declaration.type
								? this.checkVariableExport(e, t.declaration.declarations)
								: this.checkExport(
										e,
										t.declaration.id.name,
										t.declaration.id.start
								  ),
							(t.specifiers = []),
							(t.source = null)
					else {
						if (
							((t.declaration = null),
							(t.specifiers = this.parseExportSpecifiers(e)),
							this.eatContextual("from"))
						)
							this.type !== k.string && this.unexpected(),
								(t.source = this.parseExprAtom())
						else {
							for (var s = 0, a = t.specifiers; s < a.length; s += 1) {
								var o = a[s]
								this.checkUnreserved(o.local), this.checkLocalExport(o.local)
							}
							t.source = null
						}
						this.semicolon()
					}
					return this.finishNode(t, "ExportNamedDeclaration")
				}),
				(W.checkExport = function (t, e, i) {
					t &&
						(O(t, e) &&
							this.raiseRecoverable(i, "Duplicate export '" + e + "'"),
						(t[e] = !0))
				}),
				(W.checkPatternExport = function (t, e) {
					var i = e.type
					if ("Identifier" === i) this.checkExport(t, e.name, e.start)
					else if ("ObjectPattern" === i)
						for (var r = 0, n = e.properties; r < n.length; r += 1)
							this.checkPatternExport(t, n[r])
					else if ("ArrayPattern" === i)
						for (var s = 0, a = e.elements; s < a.length; s += 1) {
							var o = a[s]
							o && this.checkPatternExport(t, o)
						}
					else
						"Property" === i
							? this.checkPatternExport(t, e.value)
							: "AssignmentPattern" === i
							? this.checkPatternExport(t, e.left)
							: "RestElement" === i
							? this.checkPatternExport(t, e.argument)
							: "ParenthesizedExpression" === i &&
							  this.checkPatternExport(t, e.expression)
				}),
				(W.checkVariableExport = function (t, e) {
					if (t)
						for (var i = 0, r = e; i < r.length; i += 1)
							this.checkPatternExport(t, r[i].id)
				}),
				(W.shouldParseExportStatement = function () {
					return (
						"var" === this.type.keyword ||
						"const" === this.type.keyword ||
						"class" === this.type.keyword ||
						"function" === this.type.keyword ||
						this.isLet() ||
						this.isAsyncFunction()
					)
				}),
				(W.parseExportSpecifiers = function (t) {
					var e = [],
						i = !0
					for (this.expect(k.braceL); !this.eat(k.braceR); ) {
						if (i) i = !1
						else if ((this.expect(k.comma), this.afterTrailingComma(k.braceR)))
							break
						var r = this.startNode()
						;(r.local = this.parseIdent(!0)),
							(r.exported = this.eatContextual("as")
								? this.parseIdent(!0)
								: r.local),
							this.checkExport(t, r.exported.name, r.exported.start),
							e.push(this.finishNode(r, "ExportSpecifier"))
					}
					return e
				}),
				(W.parseImport = function (t) {
					return (
						this.next(),
						this.type === k.string
							? ((t.specifiers = H), (t.source = this.parseExprAtom()))
							: ((t.specifiers = this.parseImportSpecifiers()),
							  this.expectContextual("from"),
							  (t.source =
									this.type === k.string
										? this.parseExprAtom()
										: this.unexpected())),
						this.semicolon(),
						this.finishNode(t, "ImportDeclaration")
					)
				}),
				(W.parseImportSpecifiers = function () {
					var t = [],
						e = !0
					if (this.type === k.name) {
						var i = this.startNode()
						if (
							((i.local = this.parseIdent()),
							this.checkLVal(i.local, 2),
							t.push(this.finishNode(i, "ImportDefaultSpecifier")),
							!this.eat(k.comma))
						)
							return t
					}
					if (this.type === k.star) {
						var r = this.startNode()
						return (
							this.next(),
							this.expectContextual("as"),
							(r.local = this.parseIdent()),
							this.checkLVal(r.local, 2),
							t.push(this.finishNode(r, "ImportNamespaceSpecifier")),
							t
						)
					}
					for (this.expect(k.braceL); !this.eat(k.braceR); ) {
						if (e) e = !1
						else if ((this.expect(k.comma), this.afterTrailingComma(k.braceR)))
							break
						var n = this.startNode()
						;(n.imported = this.parseIdent(!0)),
							this.eatContextual("as")
								? (n.local = this.parseIdent())
								: (this.checkUnreserved(n.imported), (n.local = n.imported)),
							this.checkLVal(n.local, 2),
							t.push(this.finishNode(n, "ImportSpecifier"))
					}
					return t
				}),
				(W.adaptDirectivePrologue = function (t) {
					for (var e = 0; e < t.length && this.isDirectiveCandidate(t[e]); ++e)
						t[e].directive = t[e].expression.raw.slice(1, -1)
				}),
				(W.isDirectiveCandidate = function (t) {
					return (
						"ExpressionStatement" === t.type &&
						"Literal" === t.expression.type &&
						"string" == typeof t.expression.value &&
						('"' === this.input[t.start] || "'" === this.input[t.start])
					)
				})
			var G = B.prototype
			;(G.toAssignable = function (t, e, i) {
				if (this.options.ecmaVersion >= 6 && t)
					switch (t.type) {
						case "Identifier":
							this.inAsync &&
								"await" === t.name &&
								this.raise(
									t.start,
									"Cannot use 'await' as identifier inside an async function"
								)
							break
						case "ObjectPattern":
						case "ArrayPattern":
						case "RestElement":
							break
						case "ObjectExpression":
							;(t.type = "ObjectPattern"), i && this.checkPatternErrors(i, !0)
							for (var r = 0, n = t.properties; r < n.length; r += 1) {
								var s = n[r]
								this.toAssignable(s, e),
									"RestElement" !== s.type ||
										("ArrayPattern" !== s.argument.type &&
											"ObjectPattern" !== s.argument.type) ||
										this.raise(s.argument.start, "Unexpected token")
							}
							break
						case "Property":
							"init" !== t.kind &&
								this.raise(
									t.key.start,
									"Object pattern can't contain getter or setter"
								),
								this.toAssignable(t.value, e)
							break
						case "ArrayExpression":
							;(t.type = "ArrayPattern"),
								i && this.checkPatternErrors(i, !0),
								this.toAssignableList(t.elements, e)
							break
						case "SpreadElement":
							;(t.type = "RestElement"),
								this.toAssignable(t.argument, e),
								"AssignmentPattern" === t.argument.type &&
									this.raise(
										t.argument.start,
										"Rest elements cannot have a default value"
									)
							break
						case "AssignmentExpression":
							"=" !== t.operator &&
								this.raise(
									t.left.end,
									"Only '=' operator can be used for specifying default value."
								),
								(t.type = "AssignmentPattern"),
								delete t.operator,
								this.toAssignable(t.left, e)
						case "AssignmentPattern":
							break
						case "ParenthesizedExpression":
							this.toAssignable(t.expression, e, i)
							break
						case "MemberExpression":
							if (!e) break
						default:
							this.raise(t.start, "Assigning to rvalue")
					}
				else i && this.checkPatternErrors(i, !0)
				return t
			}),
				(G.toAssignableList = function (t, e) {
					for (var i = t.length, r = 0; r < i; r++) {
						var n = t[r]
						n && this.toAssignable(n, e)
					}
					if (i) {
						var s = t[i - 1]
						6 === this.options.ecmaVersion &&
							e &&
							s &&
							"RestElement" === s.type &&
							"Identifier" !== s.argument.type &&
							this.unexpected(s.argument.start)
					}
					return t
				}),
				(G.parseSpread = function (t) {
					var e = this.startNode()
					return (
						this.next(),
						(e.argument = this.parseMaybeAssign(!1, t)),
						this.finishNode(e, "SpreadElement")
					)
				}),
				(G.parseRestBinding = function () {
					var t = this.startNode()
					return (
						this.next(),
						6 === this.options.ecmaVersion &&
							this.type !== k.name &&
							this.unexpected(),
						(t.argument = this.parseBindingAtom()),
						this.finishNode(t, "RestElement")
					)
				}),
				(G.parseBindingAtom = function () {
					if (this.options.ecmaVersion >= 6)
						switch (this.type) {
							case k.bracketL:
								var t = this.startNode()
								return (
									this.next(),
									(t.elements = this.parseBindingList(k.bracketR, !0, !0)),
									this.finishNode(t, "ArrayPattern")
								)
							case k.braceL:
								return this.parseObj(!0)
						}
					return this.parseIdent()
				}),
				(G.parseBindingList = function (t, e, i) {
					for (var r = [], n = !0; !this.eat(t); )
						if (
							(n ? (n = !1) : this.expect(k.comma), e && this.type === k.comma)
						)
							r.push(null)
						else {
							if (i && this.afterTrailingComma(t)) break
							if (this.type === k.ellipsis) {
								var s = this.parseRestBinding()
								this.parseBindingListItem(s),
									r.push(s),
									this.type === k.comma &&
										this.raise(
											this.start,
											"Comma is not permitted after the rest element"
										),
									this.expect(t)
								break
							}
							var a = this.parseMaybeDefault(this.start, this.startLoc)
							this.parseBindingListItem(a), r.push(a)
						}
					return r
				}),
				(G.parseBindingListItem = function (t) {
					return t
				}),
				(G.parseMaybeDefault = function (t, e, i) {
					if (
						((i = i || this.parseBindingAtom()),
						this.options.ecmaVersion < 6 || !this.eat(k.eq))
					)
						return i
					var r = this.startNodeAt(t, e)
					return (
						(r.left = i),
						(r.right = this.parseMaybeAssign()),
						this.finishNode(r, "AssignmentPattern")
					)
				}),
				(G.checkLVal = function (t, e, i) {
					switch ((void 0 === e && (e = 0), t.type)) {
						case "Identifier":
							this.strict &&
								this.reservedWordsStrictBind.test(t.name) &&
								this.raiseRecoverable(
									t.start,
									(e ? "Binding " : "Assigning to ") +
										t.name +
										" in strict mode"
								),
								i &&
									(O(i, t.name) &&
										this.raiseRecoverable(t.start, "Argument name clash"),
									(i[t.name] = !0)),
								0 !== e && 5 !== e && this.declareName(t.name, e, t.start)
							break
						case "MemberExpression":
							e && this.raiseRecoverable(t.start, "Binding member expression")
							break
						case "ObjectPattern":
							for (var r = 0, n = t.properties; r < n.length; r += 1)
								this.checkLVal(n[r], e, i)
							break
						case "Property":
							this.checkLVal(t.value, e, i)
							break
						case "ArrayPattern":
							for (var s = 0, a = t.elements; s < a.length; s += 1) {
								var o = a[s]
								o && this.checkLVal(o, e, i)
							}
							break
						case "AssignmentPattern":
							this.checkLVal(t.left, e, i)
							break
						case "RestElement":
							this.checkLVal(t.argument, e, i)
							break
						case "ParenthesizedExpression":
							this.checkLVal(t.expression, e, i)
							break
						default:
							this.raise(t.start, (e ? "Binding" : "Assigning to") + " rvalue")
					}
				})
			var Q = B.prototype
			;(Q.checkPropClash = function (t, e, i) {
				if (
					!(
						(this.options.ecmaVersion >= 9 && "SpreadElement" === t.type) ||
						(this.options.ecmaVersion >= 6 &&
							(t.computed || t.method || t.shorthand))
					)
				) {
					var r,
						n = t.key
					switch (n.type) {
						case "Identifier":
							r = n.name
							break
						case "Literal":
							r = String(n.value)
							break
						default:
							return
					}
					var s = t.kind
					if (this.options.ecmaVersion >= 6)
						"__proto__" === r &&
							"init" === s &&
							(e.proto &&
								(i && i.doubleProto < 0
									? (i.doubleProto = n.start)
									: this.raiseRecoverable(
											n.start,
											"Redefinition of __proto__ property"
									  )),
							(e.proto = !0))
					else {
						var a = e[(r = "$" + r)]
						a
							? ("init" === s
									? (this.strict && a.init) || a.get || a.set
									: a.init || a[s]) &&
							  this.raiseRecoverable(n.start, "Redefinition of property")
							: (a = e[r] = { init: !1, get: !1, set: !1 }),
							(a[s] = !0)
					}
				}
			}),
				(Q.parseExpression = function (t, e) {
					var i = this.start,
						r = this.startLoc,
						n = this.parseMaybeAssign(t, e)
					if (this.type === k.comma) {
						var s = this.startNodeAt(i, r)
						for (s.expressions = [n]; this.eat(k.comma); )
							s.expressions.push(this.parseMaybeAssign(t, e))
						return this.finishNode(s, "SequenceExpression")
					}
					return n
				}),
				(Q.parseMaybeAssign = function (t, e, i) {
					if (this.isContextual("yield")) {
						if (this.inGenerator) return this.parseYield(t)
						this.exprAllowed = !1
					}
					var r = !1,
						n = -1,
						s = -1,
						a = -1
					e
						? ((n = e.parenthesizedAssign),
						  (s = e.trailingComma),
						  (a = e.shorthandAssign),
						  (e.parenthesizedAssign = e.trailingComma = e.shorthandAssign = -1))
						: ((e = new z()), (r = !0))
					var o = this.start,
						p = this.startLoc
					;(this.type !== k.parenL && this.type !== k.name) ||
						(this.potentialArrowAt = this.start)
					var h = this.parseMaybeConditional(t, e)
					if ((i && (h = i.call(this, h, o, p)), this.type.isAssign)) {
						var c = this.startNodeAt(o, p)
						return (
							(c.operator = this.value),
							(c.left = this.type === k.eq ? this.toAssignable(h, !1, e) : h),
							r || z.call(e),
							(e.shorthandAssign = -1),
							this.checkLVal(h),
							this.next(),
							(c.right = this.parseMaybeAssign(t)),
							this.finishNode(c, "AssignmentExpression")
						)
					}
					return (
						r && this.checkExpressionErrors(e, !0),
						n > -1 && (e.parenthesizedAssign = n),
						s > -1 && (e.trailingComma = s),
						a > -1 && (e.shorthandAssign = a),
						h
					)
				}),
				(Q.parseMaybeConditional = function (t, e) {
					var i = this.start,
						r = this.startLoc,
						n = this.parseExprOps(t, e)
					if (this.checkExpressionErrors(e)) return n
					if (this.eat(k.question)) {
						var s = this.startNodeAt(i, r)
						return (
							(s.test = n),
							(s.consequent = this.parseMaybeAssign()),
							this.expect(k.colon),
							(s.alternate = this.parseMaybeAssign(t)),
							this.finishNode(s, "ConditionalExpression")
						)
					}
					return n
				}),
				(Q.parseExprOps = function (t, e) {
					var i = this.start,
						r = this.startLoc,
						n = this.parseMaybeUnary(e, !1)
					return this.checkExpressionErrors(e) ||
						(n.start === i && "ArrowFunctionExpression" === n.type)
						? n
						: this.parseExprOp(n, i, r, -1, t)
				}),
				(Q.parseExprOp = function (t, e, i, r, n) {
					var s = this.type.binop
					if (null != s && (!n || this.type !== k._in) && s > r) {
						var a = this.type === k.logicalOR || this.type === k.logicalAND,
							o = this.value
						this.next()
						var p = this.start,
							h = this.startLoc,
							c = this.parseExprOp(this.parseMaybeUnary(null, !1), p, h, s, n),
							l = this.buildBinary(e, i, t, c, o, a)
						return this.parseExprOp(l, e, i, r, n)
					}
					return t
				}),
				(Q.buildBinary = function (t, e, i, r, n, s) {
					var a = this.startNodeAt(t, e)
					return (
						(a.left = i),
						(a.operator = n),
						(a.right = r),
						this.finishNode(a, s ? "LogicalExpression" : "BinaryExpression")
					)
				}),
				(Q.parseMaybeUnary = function (t, e) {
					var i,
						r = this.start,
						n = this.startLoc
					if (
						this.isContextual("await") &&
						(this.inAsync ||
							(!this.inFunction && this.options.allowAwaitOutsideFunction))
					)
						(i = this.parseAwait()), (e = !0)
					else if (this.type.prefix) {
						var s = this.startNode(),
							a = this.type === k.incDec
						;(s.operator = this.value),
							(s.prefix = !0),
							this.next(),
							(s.argument = this.parseMaybeUnary(null, !0)),
							this.checkExpressionErrors(t, !0),
							a
								? this.checkLVal(s.argument)
								: this.strict &&
								  "delete" === s.operator &&
								  "Identifier" === s.argument.type
								? this.raiseRecoverable(
										s.start,
										"Deleting local variable in strict mode"
								  )
								: (e = !0),
							(i = this.finishNode(
								s,
								a ? "UpdateExpression" : "UnaryExpression"
							))
					} else {
						if (
							((i = this.parseExprSubscripts(t)), this.checkExpressionErrors(t))
						)
							return i
						for (; this.type.postfix && !this.canInsertSemicolon(); ) {
							var o = this.startNodeAt(r, n)
							;(o.operator = this.value),
								(o.prefix = !1),
								(o.argument = i),
								this.checkLVal(i),
								this.next(),
								(i = this.finishNode(o, "UpdateExpression"))
						}
					}
					return !e && this.eat(k.starstar)
						? this.buildBinary(
								r,
								n,
								i,
								this.parseMaybeUnary(null, !1),
								"**",
								!1
						  )
						: i
				}),
				(Q.parseExprSubscripts = function (t) {
					var e = this.start,
						i = this.startLoc,
						r = this.parseExprAtom(t),
						n =
							"ArrowFunctionExpression" === r.type &&
							")" !== this.input.slice(this.lastTokStart, this.lastTokEnd)
					if (this.checkExpressionErrors(t) || n) return r
					var s = this.parseSubscripts(r, e, i)
					return (
						t &&
							"MemberExpression" === s.type &&
							(t.parenthesizedAssign >= s.start && (t.parenthesizedAssign = -1),
							t.parenthesizedBind >= s.start && (t.parenthesizedBind = -1)),
						s
					)
				}),
				(Q.parseSubscripts = function (t, e, i, r) {
					for (
						var n =
							this.options.ecmaVersion >= 8 &&
							"Identifier" === t.type &&
							"async" === t.name &&
							this.lastTokEnd === t.end &&
							!this.canInsertSemicolon() &&
							"async" === this.input.slice(t.start, t.end);
						;

					) {
						var s = this.parseSubscript(t, e, i, r, n)
						if (s === t || "ArrowFunctionExpression" === s.type) return s
						t = s
					}
				}),
				(Q.parseSubscript = function (t, e, i, r, n) {
					var s = this.eat(k.bracketL)
					if (s || this.eat(k.dot)) {
						var a = this.startNodeAt(e, i)
						;(a.object = t),
							(a.property = s ? this.parseExpression() : this.parseIdent(!0)),
							(a.computed = !!s),
							s && this.expect(k.bracketR),
							(t = this.finishNode(a, "MemberExpression"))
					} else if (!r && this.eat(k.parenL)) {
						var o = new z(),
							p = this.yieldPos,
							h = this.awaitPos,
							c = this.awaitIdentPos
						;(this.yieldPos = 0), (this.awaitPos = 0), (this.awaitIdentPos = 0)
						var l = this.parseExprList(
							k.parenR,
							this.options.ecmaVersion >= 8,
							!1,
							o
						)
						if (n && !this.canInsertSemicolon() && this.eat(k.arrow))
							return (
								this.checkPatternErrors(o, !1),
								this.checkYieldAwaitInDefaultParams(),
								this.awaitIdentPos > 0 &&
									this.raise(
										this.awaitIdentPos,
										"Cannot use 'await' as identifier inside an async function"
									),
								(this.yieldPos = p),
								(this.awaitPos = h),
								(this.awaitIdentPos = c),
								this.parseArrowExpression(this.startNodeAt(e, i), l, !0)
							)
						this.checkExpressionErrors(o, !0),
							(this.yieldPos = p || this.yieldPos),
							(this.awaitPos = h || this.awaitPos),
							(this.awaitIdentPos = c || this.awaitIdentPos)
						var u = this.startNodeAt(e, i)
						;(u.callee = t),
							(u.arguments = l),
							(t = this.finishNode(u, "CallExpression"))
					} else if (this.type === k.backQuote) {
						var d = this.startNodeAt(e, i)
						;(d.tag = t),
							(d.quasi = this.parseTemplate({ isTagged: !0 })),
							(t = this.finishNode(d, "TaggedTemplateExpression"))
					}
					return t
				}),
				(Q.parseExprAtom = function (t) {
					this.type === k.slash && this.readRegexp()
					var e,
						i = this.potentialArrowAt === this.start
					switch (this.type) {
						case k._super:
							return (
								this.allowSuper ||
									this.raise(this.start, "'super' keyword outside a method"),
								(e = this.startNode()),
								this.next(),
								this.type !== k.parenL ||
									this.allowDirectSuper ||
									this.raise(
										e.start,
										"super() call outside constructor of a subclass"
									),
								this.type !== k.dot &&
									this.type !== k.bracketL &&
									this.type !== k.parenL &&
									this.unexpected(),
								this.finishNode(e, "Super")
							)
						case k._this:
							return (
								(e = this.startNode()),
								this.next(),
								this.finishNode(e, "ThisExpression")
							)
						case k.name:
							var r = this.start,
								n = this.startLoc,
								s = this.containsEsc,
								a = this.parseIdent(!1)
							if (
								this.options.ecmaVersion >= 8 &&
								!s &&
								"async" === a.name &&
								!this.canInsertSemicolon() &&
								this.eat(k._function)
							)
								return this.parseFunction(this.startNodeAt(r, n), 0, !1, !0)
							if (i && !this.canInsertSemicolon()) {
								if (this.eat(k.arrow))
									return this.parseArrowExpression(
										this.startNodeAt(r, n),
										[a],
										!1
									)
								if (
									this.options.ecmaVersion >= 8 &&
									"async" === a.name &&
									this.type === k.name &&
									!s
								)
									return (
										(a = this.parseIdent(!1)),
										(!this.canInsertSemicolon() && this.eat(k.arrow)) ||
											this.unexpected(),
										this.parseArrowExpression(this.startNodeAt(r, n), [a], !0)
									)
							}
							return a
						case k.regexp:
							var o = this.value
							return (
								((e = this.parseLiteral(o.value)).regex = {
									pattern: o.pattern,
									flags: o.flags
								}),
								e
							)
						case k.num:
						case k.string:
							return this.parseLiteral(this.value)
						case k._null:
						case k._true:
						case k._false:
							return (
								((e = this.startNode()).value =
									this.type === k._null ? null : this.type === k._true),
								(e.raw = this.type.keyword),
								this.next(),
								this.finishNode(e, "Literal")
							)
						case k.parenL:
							var p = this.start,
								h = this.parseParenAndDistinguishExpression(i)
							return (
								t &&
									(t.parenthesizedAssign < 0 &&
										!this.isSimpleAssignTarget(h) &&
										(t.parenthesizedAssign = p),
									t.parenthesizedBind < 0 && (t.parenthesizedBind = p)),
								h
							)
						case k.bracketL:
							return (
								(e = this.startNode()),
								this.next(),
								(e.elements = this.parseExprList(k.bracketR, !0, !0, t)),
								this.finishNode(e, "ArrayExpression")
							)
						case k.braceL:
							return this.parseObj(!1, t)
						case k._function:
							return (
								(e = this.startNode()), this.next(), this.parseFunction(e, 0)
							)
						case k._class:
							return this.parseClass(this.startNode(), !1)
						case k._new:
							return this.parseNew()
						case k.backQuote:
							return this.parseTemplate()
						default:
							this.unexpected()
					}
				}),
				(Q.parseLiteral = function (t) {
					var e = this.startNode()
					return (
						(e.value = t),
						(e.raw = this.input.slice(this.start, this.end)),
						this.next(),
						this.finishNode(e, "Literal")
					)
				}),
				(Q.parseParenExpression = function () {
					this.expect(k.parenL)
					var t = this.parseExpression()
					return this.expect(k.parenR), t
				}),
				(Q.parseParenAndDistinguishExpression = function (t) {
					var e,
						i = this.start,
						r = this.startLoc,
						n = this.options.ecmaVersion >= 8
					if (this.options.ecmaVersion >= 6) {
						this.next()
						var s,
							a = this.start,
							o = this.startLoc,
							p = [],
							h = !0,
							c = !1,
							l = new z(),
							u = this.yieldPos,
							d = this.awaitPos
						for (
							this.yieldPos = 0, this.awaitPos = 0;
							this.type !== k.parenR;

						) {
							if (
								(h ? (h = !1) : this.expect(k.comma),
								n && this.afterTrailingComma(k.parenR, !0))
							) {
								c = !0
								break
							}
							if (this.type === k.ellipsis) {
								;(s = this.start),
									p.push(this.parseParenItem(this.parseRestBinding())),
									this.type === k.comma &&
										this.raise(
											this.start,
											"Comma is not permitted after the rest element"
										)
								break
							}
							p.push(this.parseMaybeAssign(!1, l, this.parseParenItem))
						}
						var f = this.start,
							m = this.startLoc
						if (
							(this.expect(k.parenR),
							t && !this.canInsertSemicolon() && this.eat(k.arrow))
						)
							return (
								this.checkPatternErrors(l, !1),
								this.checkYieldAwaitInDefaultParams(),
								(this.yieldPos = u),
								(this.awaitPos = d),
								this.parseParenArrowList(i, r, p)
							)
						;(p.length && !c) || this.unexpected(this.lastTokStart),
							s && this.unexpected(s),
							this.checkExpressionErrors(l, !0),
							(this.yieldPos = u || this.yieldPos),
							(this.awaitPos = d || this.awaitPos),
							p.length > 1
								? (((e = this.startNodeAt(a, o)).expressions = p),
								  this.finishNodeAt(e, "SequenceExpression", f, m))
								: (e = p[0])
					} else e = this.parseParenExpression()
					if (this.options.preserveParens) {
						var y = this.startNodeAt(i, r)
						return (
							(y.expression = e), this.finishNode(y, "ParenthesizedExpression")
						)
					}
					return e
				}),
				(Q.parseParenItem = function (t) {
					return t
				}),
				(Q.parseParenArrowList = function (t, e, i) {
					return this.parseArrowExpression(this.startNodeAt(t, e), i)
				})
			var $ = []
			;(Q.parseNew = function () {
				var t = this.startNode(),
					e = this.parseIdent(!0)
				if (this.options.ecmaVersion >= 6 && this.eat(k.dot)) {
					t.meta = e
					var i = this.containsEsc
					return (
						(t.property = this.parseIdent(!0)),
						("target" !== t.property.name || i) &&
							this.raiseRecoverable(
								t.property.start,
								"The only valid meta property for new is new.target"
							),
						this.inNonArrowFunction() ||
							this.raiseRecoverable(
								t.start,
								"new.target can only be used in functions"
							),
						this.finishNode(t, "MetaProperty")
					)
				}
				var r = this.start,
					n = this.startLoc
				return (
					(t.callee = this.parseSubscripts(this.parseExprAtom(), r, n, !0)),
					(t.arguments = this.eat(k.parenL)
						? this.parseExprList(k.parenR, this.options.ecmaVersion >= 8, !1)
						: $),
					this.finishNode(t, "NewExpression")
				)
			}),
				(Q.parseTemplateElement = function (t) {
					var e = t.isTagged,
						i = this.startNode()
					return (
						this.type === k.invalidTemplate
							? (e ||
									this.raiseRecoverable(
										this.start,
										"Bad escape sequence in untagged template literal"
									),
							  (i.value = { raw: this.value, cooked: null }))
							: (i.value = {
									raw: this.input
										.slice(this.start, this.end)
										.replace(/\r\n?/g, "\n"),
									cooked: this.value
							  }),
						this.next(),
						(i.tail = this.type === k.backQuote),
						this.finishNode(i, "TemplateElement")
					)
				}),
				(Q.parseTemplate = function (t) {
					void 0 === t && (t = {})
					var e = t.isTagged
					void 0 === e && (e = !1)
					var i = this.startNode()
					this.next(), (i.expressions = [])
					var r = this.parseTemplateElement({ isTagged: e })
					for (i.quasis = [r]; !r.tail; )
						this.type === k.eof &&
							this.raise(this.pos, "Unterminated template literal"),
							this.expect(k.dollarBraceL),
							i.expressions.push(this.parseExpression()),
							this.expect(k.braceR),
							i.quasis.push((r = this.parseTemplateElement({ isTagged: e })))
					return this.next(), this.finishNode(i, "TemplateLiteral")
				}),
				(Q.isAsyncProp = function (t) {
					return (
						!t.computed &&
						"Identifier" === t.key.type &&
						"async" === t.key.name &&
						(this.type === k.name ||
							this.type === k.num ||
							this.type === k.string ||
							this.type === k.bracketL ||
							this.type.keyword ||
							(this.options.ecmaVersion >= 9 && this.type === k.star)) &&
						!S.test(this.input.slice(this.lastTokEnd, this.start))
					)
				}),
				(Q.parseObj = function (t, e) {
					var i = this.startNode(),
						r = !0,
						n = {}
					for (i.properties = [], this.next(); !this.eat(k.braceR); ) {
						if (r) r = !1
						else if ((this.expect(k.comma), this.afterTrailingComma(k.braceR)))
							break
						var s = this.parseProperty(t, e)
						t || this.checkPropClash(s, n, e), i.properties.push(s)
					}
					return this.finishNode(i, t ? "ObjectPattern" : "ObjectExpression")
				}),
				(Q.parseProperty = function (t, e) {
					var i,
						r,
						n,
						s,
						a = this.startNode()
					if (this.options.ecmaVersion >= 9 && this.eat(k.ellipsis))
						return t
							? ((a.argument = this.parseIdent(!1)),
							  this.type === k.comma &&
									this.raise(
										this.start,
										"Comma is not permitted after the rest element"
									),
							  this.finishNode(a, "RestElement"))
							: (this.type === k.parenL &&
									e &&
									(e.parenthesizedAssign < 0 &&
										(e.parenthesizedAssign = this.start),
									e.parenthesizedBind < 0 &&
										(e.parenthesizedBind = this.start)),
							  (a.argument = this.parseMaybeAssign(!1, e)),
							  this.type === k.comma &&
									e &&
									e.trailingComma < 0 &&
									(e.trailingComma = this.start),
							  this.finishNode(a, "SpreadElement"))
					this.options.ecmaVersion >= 6 &&
						((a.method = !1),
						(a.shorthand = !1),
						(t || e) && ((n = this.start), (s = this.startLoc)),
						t || (i = this.eat(k.star)))
					var o = this.containsEsc
					return (
						this.parsePropertyName(a),
						!t &&
						!o &&
						this.options.ecmaVersion >= 8 &&
						!i &&
						this.isAsyncProp(a)
							? ((r = !0),
							  (i = this.options.ecmaVersion >= 9 && this.eat(k.star)),
							  this.parsePropertyName(a, e))
							: (r = !1),
						this.parsePropertyValue(a, t, i, r, n, s, e, o),
						this.finishNode(a, "Property")
					)
				}),
				(Q.parsePropertyValue = function (t, e, i, r, n, s, a, o) {
					;(i || r) && this.type === k.colon && this.unexpected(),
						this.eat(k.colon)
							? ((t.value = e
									? this.parseMaybeDefault(this.start, this.startLoc)
									: this.parseMaybeAssign(!1, a)),
							  (t.kind = "init"))
							: this.options.ecmaVersion >= 6 && this.type === k.parenL
							? (e && this.unexpected(),
							  (t.kind = "init"),
							  (t.method = !0),
							  (t.value = this.parseMethod(i, r)))
							: e ||
							  o ||
							  !(this.options.ecmaVersion >= 5) ||
							  t.computed ||
							  "Identifier" !== t.key.type ||
							  ("get" !== t.key.name && "set" !== t.key.name) ||
							  this.type === k.comma ||
							  this.type === k.braceR
							? this.options.ecmaVersion >= 6 &&
							  !t.computed &&
							  "Identifier" === t.key.type
								? ((i || r) && this.unexpected(),
								  this.checkUnreserved(t.key),
								  "await" !== t.key.name ||
										this.awaitIdentPos ||
										(this.awaitIdentPos = n),
								  (t.kind = "init"),
								  e
										? (t.value = this.parseMaybeDefault(n, s, t.key))
										: this.type === k.eq && a
										? (a.shorthandAssign < 0 &&
												(a.shorthandAssign = this.start),
										  (t.value = this.parseMaybeDefault(n, s, t.key)))
										: (t.value = t.key),
								  (t.shorthand = !0))
								: this.unexpected()
							: ((i || r) && this.unexpected(),
							  (t.kind = t.key.name),
							  this.parsePropertyName(t),
							  (t.value = this.parseMethod(!1)),
							  t.value.params.length !== ("get" === t.kind ? 0 : 1)
									? this.raiseRecoverable(
											t.value.start,
											"get" === t.kind
												? "getter should have no params"
												: "setter should have exactly one param"
									  )
									: "set" === t.kind &&
									  "RestElement" === t.value.params[0].type &&
									  this.raiseRecoverable(
											t.value.params[0].start,
											"Setter cannot use rest params"
									  ))
				}),
				(Q.parsePropertyName = function (t) {
					if (this.options.ecmaVersion >= 6) {
						if (this.eat(k.bracketL))
							return (
								(t.computed = !0),
								(t.key = this.parseMaybeAssign()),
								this.expect(k.bracketR),
								t.key
							)
						t.computed = !1
					}
					return (t.key =
						this.type === k.num || this.type === k.string
							? this.parseExprAtom()
							: this.parseIdent(!0))
				}),
				(Q.initFunction = function (t) {
					;(t.id = null),
						this.options.ecmaVersion >= 6 && (t.generator = t.expression = !1),
						this.options.ecmaVersion >= 8 && (t.async = !1)
				}),
				(Q.parseMethod = function (t, e, i) {
					var r = this.startNode(),
						n = this.yieldPos,
						s = this.awaitPos,
						a = this.awaitIdentPos
					return (
						this.initFunction(r),
						this.options.ecmaVersion >= 6 && (r.generator = t),
						this.options.ecmaVersion >= 8 && (r.async = !!e),
						(this.yieldPos = 0),
						(this.awaitPos = 0),
						(this.awaitIdentPos = 0),
						this.enterScope(64 | F(e, r.generator) | (i ? 128 : 0)),
						this.expect(k.parenL),
						(r.params = this.parseBindingList(
							k.parenR,
							!1,
							this.options.ecmaVersion >= 8
						)),
						this.checkYieldAwaitInDefaultParams(),
						this.parseFunctionBody(r, !1, !0),
						(this.yieldPos = n),
						(this.awaitPos = s),
						(this.awaitIdentPos = a),
						this.finishNode(r, "FunctionExpression")
					)
				}),
				(Q.parseArrowExpression = function (t, e, i) {
					var r = this.yieldPos,
						n = this.awaitPos,
						s = this.awaitIdentPos
					return (
						this.enterScope(16 | F(i, !1)),
						this.initFunction(t),
						this.options.ecmaVersion >= 8 && (t.async = !!i),
						(this.yieldPos = 0),
						(this.awaitPos = 0),
						(this.awaitIdentPos = 0),
						(t.params = this.toAssignableList(e, !0)),
						this.parseFunctionBody(t, !0, !1),
						(this.yieldPos = r),
						(this.awaitPos = n),
						(this.awaitIdentPos = s),
						this.finishNode(t, "ArrowFunctionExpression")
					)
				}),
				(Q.parseFunctionBody = function (t, e, i) {
					var r = this.strict,
						n = !1
					if (e && this.type !== k.braceL)
						(t.body = this.parseMaybeAssign()),
							(t.expression = !0),
							this.checkParams(t, !1)
					else {
						var s =
							this.options.ecmaVersion >= 7 && !this.isSimpleParamList(t.params)
						;(r && !s) ||
							((n = this.strictDirective(this.end)) &&
								s &&
								this.raiseRecoverable(
									t.start,
									"Illegal 'use strict' directive in function with non-simple parameter list"
								))
						var a = this.labels
						;(this.labels = []),
							n && (this.strict = !0),
							this.checkParams(
								t,
								!r && !n && !e && !i && this.isSimpleParamList(t.params)
							),
							(t.body = this.parseBlock(!1)),
							(t.expression = !1),
							this.adaptDirectivePrologue(t.body.body),
							(this.labels = a)
					}
					this.exitScope(),
						this.strict && t.id && this.checkLVal(t.id, 5),
						(this.strict = r)
				}),
				(Q.isSimpleParamList = function (t) {
					for (var e = 0, i = t; e < i.length; e += 1)
						if ("Identifier" !== i[e].type) return !1
					return !0
				}),
				(Q.checkParams = function (t, e) {
					for (var i = {}, r = 0, n = t.params; r < n.length; r += 1)
						this.checkLVal(n[r], 1, e ? null : i)
				}),
				(Q.parseExprList = function (t, e, i, r) {
					for (var n = [], s = !0; !this.eat(t); ) {
						if (s) s = !1
						else if ((this.expect(k.comma), e && this.afterTrailingComma(t)))
							break
						var a = void 0
						i && this.type === k.comma
							? (a = null)
							: this.type === k.ellipsis
							? ((a = this.parseSpread(r)),
							  r &&
									this.type === k.comma &&
									r.trailingComma < 0 &&
									(r.trailingComma = this.start))
							: (a = this.parseMaybeAssign(!1, r)),
							n.push(a)
					}
					return n
				}),
				(Q.checkUnreserved = function (t) {
					var e = t.start,
						i = t.end,
						r = t.name
					this.inGenerator &&
						"yield" === r &&
						this.raiseRecoverable(
							e,
							"Cannot use 'yield' as identifier inside a generator"
						),
						this.inAsync &&
							"await" === r &&
							this.raiseRecoverable(
								e,
								"Cannot use 'await' as identifier inside an async function"
							),
						this.keywords.test(r) &&
							this.raise(e, "Unexpected keyword '" + r + "'"),
						(this.options.ecmaVersion < 6 &&
							-1 !== this.input.slice(e, i).indexOf("\\")) ||
							((this.strict
								? this.reservedWordsStrict
								: this.reservedWords
							).test(r) &&
								(this.inAsync ||
									"await" !== r ||
									this.raiseRecoverable(
										e,
										"Cannot use keyword 'await' outside an async function"
									),
								this.raiseRecoverable(
									e,
									"The keyword '" + r + "' is reserved"
								)))
				}),
				(Q.parseIdent = function (t, e) {
					var i = this.startNode()
					return (
						t && "never" === this.options.allowReserved && (t = !1),
						this.type === k.name
							? (i.name = this.value)
							: this.type.keyword
							? ((i.name = this.type.keyword),
							  ("class" !== i.name && "function" !== i.name) ||
									(this.lastTokEnd === this.lastTokStart + 1 &&
										46 === this.input.charCodeAt(this.lastTokStart)) ||
									this.context.pop())
							: this.unexpected(),
						this.next(),
						this.finishNode(i, "Identifier"),
						t ||
							(this.checkUnreserved(i),
							"await" !== i.name ||
								this.awaitIdentPos ||
								(this.awaitIdentPos = i.start)),
						i
					)
				}),
				(Q.parseYield = function (t) {
					this.yieldPos || (this.yieldPos = this.start)
					var e = this.startNode()
					return (
						this.next(),
						this.type === k.semi ||
						this.canInsertSemicolon() ||
						(this.type !== k.star && !this.type.startsExpr)
							? ((e.delegate = !1), (e.argument = null))
							: ((e.delegate = this.eat(k.star)),
							  (e.argument = this.parseMaybeAssign(t))),
						this.finishNode(e, "YieldExpression")
					)
				}),
				(Q.parseAwait = function () {
					this.awaitPos || (this.awaitPos = this.start)
					var t = this.startNode()
					return (
						this.next(),
						(t.argument = this.parseMaybeUnary(null, !0)),
						this.finishNode(t, "AwaitExpression")
					)
				})
			var Y = B.prototype
			;(Y.raise = function (t, e) {
				var i = V(this.input, t),
					r = new SyntaxError((e += " (" + i.line + ":" + i.column + ")"))
				throw ((r.pos = t), (r.loc = i), (r.raisedAt = this.pos), r)
			}),
				(Y.raiseRecoverable = Y.raise),
				(Y.curPosition = function () {
					if (this.options.locations)
						return new T(this.curLine, this.pos - this.lineStart)
				})
			var tt = B.prototype,
				et = function (t) {
					;(this.flags = t),
						(this.var = []),
						(this.lexical = []),
						(this.functions = [])
				}
			;(tt.enterScope = function (t) {
				this.scopeStack.push(new et(t))
			}),
				(tt.exitScope = function () {
					this.scopeStack.pop()
				}),
				(tt.treatFunctionsAsVarInScope = function (t) {
					return 2 & t.flags || (!this.inModule && 1 & t.flags)
				}),
				(tt.declareName = function (t, e, i) {
					var r = !1
					if (2 === e) {
						var n = this.currentScope()
						;(r =
							n.lexical.indexOf(t) > -1 ||
							n.functions.indexOf(t) > -1 ||
							n.var.indexOf(t) > -1),
							n.lexical.push(t),
							this.inModule && 1 & n.flags && delete this.undefinedExports[t]
					} else if (4 === e) this.currentScope().lexical.push(t)
					else if (3 === e) {
						var s = this.currentScope()
						;(r = this.treatFunctionsAsVar
							? s.lexical.indexOf(t) > -1
							: s.lexical.indexOf(t) > -1 || s.var.indexOf(t) > -1),
							s.functions.push(t)
					} else
						for (var a = this.scopeStack.length - 1; a >= 0; --a) {
							var o = this.scopeStack[a]
							if (
								(o.lexical.indexOf(t) > -1 &&
									!(32 & o.flags && o.lexical[0] === t)) ||
								(!this.treatFunctionsAsVarInScope(o) &&
									o.functions.indexOf(t) > -1)
							) {
								r = !0
								break
							}
							if (
								(o.var.push(t),
								this.inModule && 1 & o.flags && delete this.undefinedExports[t],
								3 & o.flags)
							)
								break
						}
					r &&
						this.raiseRecoverable(
							i,
							"Identifier '" + t + "' has already been declared"
						)
				}),
				(tt.checkLocalExport = function (t) {
					;-1 === this.scopeStack[0].lexical.indexOf(t.name) &&
						-1 === this.scopeStack[0].var.indexOf(t.name) &&
						(this.undefinedExports[t.name] = t)
				}),
				(tt.currentScope = function () {
					return this.scopeStack[this.scopeStack.length - 1]
				}),
				(tt.currentVarScope = function () {
					for (var t = this.scopeStack.length - 1; ; t--) {
						var e = this.scopeStack[t]
						if (3 & e.flags) return e
					}
				}),
				(tt.currentThisScope = function () {
					for (var t = this.scopeStack.length - 1; ; t--) {
						var e = this.scopeStack[t]
						if (3 & e.flags && !(16 & e.flags)) return e
					}
				})
			var it = function (t, e, i) {
					;(this.type = ""),
						(this.start = e),
						(this.end = 0),
						t.options.locations && (this.loc = new R(t, i)),
						t.options.directSourceFile &&
							(this.sourceFile = t.options.directSourceFile),
						t.options.ranges && (this.range = [e, 0])
				},
				rt = B.prototype
			function nt(t, e, i, r) {
				return (
					(t.type = e),
					(t.end = i),
					this.options.locations && (t.loc.end = r),
					this.options.ranges && (t.range[1] = i),
					t
				)
			}
			;(rt.startNode = function () {
				return new it(this, this.start, this.startLoc)
			}),
				(rt.startNodeAt = function (t, e) {
					return new it(this, t, e)
				}),
				(rt.finishNode = function (t, e) {
					return nt.call(this, t, e, this.lastTokEnd, this.lastTokEndLoc)
				}),
				(rt.finishNodeAt = function (t, e, i, r) {
					return nt.call(this, t, e, i, r)
				})
			var st = function (t, e, i, r, n) {
					;(this.token = t),
						(this.isExpr = !!e),
						(this.preserveSpace = !!i),
						(this.override = r),
						(this.generator = !!n)
				},
				at = {
					b_stat: new st("{", !1),
					b_expr: new st("{", !0),
					b_tmpl: new st("${", !1),
					p_stat: new st("(", !1),
					p_expr: new st("(", !0),
					q_tmpl: new st("`", !0, !0, function (t) {
						return t.tryReadTemplateToken()
					}),
					f_stat: new st("function", !1),
					f_expr: new st("function", !0),
					f_expr_gen: new st("function", !0, !1, null, !0),
					f_gen: new st("function", !1, !1, null, !0)
				},
				ot = B.prototype
			;(ot.initialContext = function () {
				return [at.b_stat]
			}),
				(ot.braceIsBlock = function (t) {
					var e = this.curContext()
					return (
						e === at.f_expr ||
						e === at.f_stat ||
						(t !== k.colon || (e !== at.b_stat && e !== at.b_expr)
							? t === k._return || (t === k.name && this.exprAllowed)
								? S.test(this.input.slice(this.lastTokEnd, this.start))
								: t === k._else ||
								  t === k.semi ||
								  t === k.eof ||
								  t === k.parenR ||
								  t === k.arrow ||
								  (t === k.braceL
										? e === at.b_stat
										: t !== k._var &&
										  t !== k._const &&
										  t !== k.name &&
										  !this.exprAllowed)
							: !e.isExpr)
					)
				}),
				(ot.inGeneratorContext = function () {
					for (var t = this.context.length - 1; t >= 1; t--) {
						var e = this.context[t]
						if ("function" === e.token) return e.generator
					}
					return !1
				}),
				(ot.updateContext = function (t) {
					var e,
						i = this.type
					i.keyword && t === k.dot
						? (this.exprAllowed = !1)
						: (e = i.updateContext)
						? e.call(this, t)
						: (this.exprAllowed = i.beforeExpr)
				}),
				(k.parenR.updateContext = k.braceR.updateContext = function () {
					if (1 !== this.context.length) {
						var t = this.context.pop()
						t === at.b_stat &&
							"function" === this.curContext().token &&
							(t = this.context.pop()),
							(this.exprAllowed = !t.isExpr)
					} else this.exprAllowed = !0
				}),
				(k.braceL.updateContext = function (t) {
					this.context.push(this.braceIsBlock(t) ? at.b_stat : at.b_expr),
						(this.exprAllowed = !0)
				}),
				(k.dollarBraceL.updateContext = function () {
					this.context.push(at.b_tmpl), (this.exprAllowed = !0)
				}),
				(k.parenL.updateContext = function (t) {
					this.context.push(
						t === k._if || t === k._for || t === k._with || t === k._while
							? at.p_stat
							: at.p_expr
					),
						(this.exprAllowed = !0)
				}),
				(k.incDec.updateContext = function () {}),
				(k._function.updateContext = k._class.updateContext = function (t) {
					!t.beforeExpr ||
					t === k.semi ||
					t === k._else ||
					(t === k._return &&
						S.test(this.input.slice(this.lastTokEnd, this.start))) ||
					((t === k.colon || t === k.braceL) && this.curContext() === at.b_stat)
						? this.context.push(at.f_stat)
						: this.context.push(at.f_expr),
						(this.exprAllowed = !1)
				}),
				(k.backQuote.updateContext = function () {
					this.curContext() === at.q_tmpl
						? this.context.pop()
						: this.context.push(at.q_tmpl),
						(this.exprAllowed = !1)
				}),
				(k.star.updateContext = function (t) {
					if (t === k._function) {
						var e = this.context.length - 1
						this.context[e] =
							this.context[e] === at.f_expr ? at.f_expr_gen : at.f_gen
					}
					this.exprAllowed = !0
				}),
				(k.name.updateContext = function (t) {
					var e = !1
					this.options.ecmaVersion >= 6 &&
						t !== k.dot &&
						(("of" === this.value && !this.exprAllowed) ||
							("yield" === this.value && this.inGeneratorContext())) &&
						(e = !0),
						(this.exprAllowed = e)
				})
			var pt =
					"ASCII ASCII_Hex_Digit AHex Alphabetic Alpha Any Assigned Bidi_Control Bidi_C Bidi_Mirrored Bidi_M Case_Ignorable CI Cased Changes_When_Casefolded CWCF Changes_When_Casemapped CWCM Changes_When_Lowercased CWL Changes_When_NFKC_Casefolded CWKCF Changes_When_Titlecased CWT Changes_When_Uppercased CWU Dash Default_Ignorable_Code_Point DI Deprecated Dep Diacritic Dia Emoji Emoji_Component Emoji_Modifier Emoji_Modifier_Base Emoji_Presentation Extender Ext Grapheme_Base Gr_Base Grapheme_Extend Gr_Ext Hex_Digit Hex IDS_Binary_Operator IDSB IDS_Trinary_Operator IDST ID_Continue IDC ID_Start IDS Ideographic Ideo Join_Control Join_C Logical_Order_Exception LOE Lowercase Lower Math Noncharacter_Code_Point NChar Pattern_Syntax Pat_Syn Pattern_White_Space Pat_WS Quotation_Mark QMark Radical Regional_Indicator RI Sentence_Terminal STerm Soft_Dotted SD Terminal_Punctuation Term Unified_Ideograph UIdeo Uppercase Upper Variation_Selector VS White_Space space XID_Continue XIDC XID_Start XIDS",
				ht = { 9: pt, 10: pt + " Extended_Pictographic" },
				ct =
					"Cased_Letter LC Close_Punctuation Pe Connector_Punctuation Pc Control Cc cntrl Currency_Symbol Sc Dash_Punctuation Pd Decimal_Number Nd digit Enclosing_Mark Me Final_Punctuation Pf Format Cf Initial_Punctuation Pi Letter L Letter_Number Nl Line_Separator Zl Lowercase_Letter Ll Mark M Combining_Mark Math_Symbol Sm Modifier_Letter Lm Modifier_Symbol Sk Nonspacing_Mark Mn Number N Open_Punctuation Ps Other C Other_Letter Lo Other_Number No Other_Punctuation Po Other_Symbol So Paragraph_Separator Zp Private_Use Co Punctuation P punct Separator Z Space_Separator Zs Spacing_Mark Mc Surrogate Cs Symbol S Titlecase_Letter Lt Unassigned Cn Uppercase_Letter Lu",
				lt =
					"Adlam Adlm Ahom Ahom Anatolian_Hieroglyphs Hluw Arabic Arab Armenian Armn Avestan Avst Balinese Bali Bamum Bamu Bassa_Vah Bass Batak Batk Bengali Beng Bhaiksuki Bhks Bopomofo Bopo Brahmi Brah Braille Brai Buginese Bugi Buhid Buhd Canadian_Aboriginal Cans Carian Cari Caucasian_Albanian Aghb Chakma Cakm Cham Cham Cherokee Cher Common Zyyy Coptic Copt Qaac Cuneiform Xsux Cypriot Cprt Cyrillic Cyrl Deseret Dsrt Devanagari Deva Duployan Dupl Egyptian_Hieroglyphs Egyp Elbasan Elba Ethiopic Ethi Georgian Geor Glagolitic Glag Gothic Goth Grantha Gran Greek Grek Gujarati Gujr Gurmukhi Guru Han Hani Hangul Hang Hanunoo Hano Hatran Hatr Hebrew Hebr Hiragana Hira Imperial_Aramaic Armi Inherited Zinh Qaai Inscriptional_Pahlavi Phli Inscriptional_Parthian Prti Javanese Java Kaithi Kthi Kannada Knda Katakana Kana Kayah_Li Kali Kharoshthi Khar Khmer Khmr Khojki Khoj Khudawadi Sind Lao Laoo Latin Latn Lepcha Lepc Limbu Limb Linear_A Lina Linear_B Linb Lisu Lisu Lycian Lyci Lydian Lydi Mahajani Mahj Malayalam Mlym Mandaic Mand Manichaean Mani Marchen Marc Masaram_Gondi Gonm Meetei_Mayek Mtei Mende_Kikakui Mend Meroitic_Cursive Merc Meroitic_Hieroglyphs Mero Miao Plrd Modi Modi Mongolian Mong Mro Mroo Multani Mult Myanmar Mymr Nabataean Nbat New_Tai_Lue Talu Newa Newa Nko Nkoo Nushu Nshu Ogham Ogam Ol_Chiki Olck Old_Hungarian Hung Old_Italic Ital Old_North_Arabian Narb Old_Permic Perm Old_Persian Xpeo Old_South_Arabian Sarb Old_Turkic Orkh Oriya Orya Osage Osge Osmanya Osma Pahawh_Hmong Hmng Palmyrene Palm Pau_Cin_Hau Pauc Phags_Pa Phag Phoenician Phnx Psalter_Pahlavi Phlp Rejang Rjng Runic Runr Samaritan Samr Saurashtra Saur Sharada Shrd Shavian Shaw Siddham Sidd SignWriting Sgnw Sinhala Sinh Sora_Sompeng Sora Soyombo Soyo Sundanese Sund Syloti_Nagri Sylo Syriac Syrc Tagalog Tglg Tagbanwa Tagb Tai_Le Tale Tai_Tham Lana Tai_Viet Tavt Takri Takr Tamil Taml Tangut Tang Telugu Telu Thaana Thaa Thai Thai Tibetan Tibt Tifinagh Tfng Tirhuta Tirh Ugaritic Ugar Vai Vaii Warang_Citi Wara Yi Yiii Zanabazar_Square Zanb",
				ut = {
					9: lt,
					10:
						lt +
						" Dogra Dogr Gunjala_Gondi Gong Hanifi_Rohingya Rohg Makasar Maka Medefaidrin Medf Old_Sogdian Sogo Sogdian Sogd"
				},
				dt = {}
			function ft(t) {
				var e = (dt[t] = {
					binary: j(ht[t] + " " + ct),
					nonBinary: { General_Category: j(ct), Script: j(ut[t]) }
				})
				;(e.nonBinary.Script_Extensions = e.nonBinary.Script),
					(e.nonBinary.gc = e.nonBinary.General_Category),
					(e.nonBinary.sc = e.nonBinary.Script),
					(e.nonBinary.scx = e.nonBinary.Script_Extensions)
			}
			ft(9), ft(10)
			var mt = B.prototype,
				yt = function (t) {
					;(this.parser = t),
						(this.validFlags =
							"gim" +
							(t.options.ecmaVersion >= 6 ? "uy" : "") +
							(t.options.ecmaVersion >= 9 ? "s" : "")),
						(this.unicodeProperties =
							dt[t.options.ecmaVersion >= 10 ? 10 : t.options.ecmaVersion]),
						(this.source = ""),
						(this.flags = ""),
						(this.start = 0),
						(this.switchU = !1),
						(this.switchN = !1),
						(this.pos = 0),
						(this.lastIntValue = 0),
						(this.lastStringValue = ""),
						(this.lastAssertionIsQuantifiable = !1),
						(this.numCapturingParens = 0),
						(this.maxBackReference = 0),
						(this.groupNames = []),
						(this.backReferenceNames = [])
				}
			function gt(t) {
				return t <= 65535
					? String.fromCharCode(t)
					: ((t -= 65536),
					  String.fromCharCode(55296 + (t >> 10), 56320 + (1023 & t)))
			}
			function vt(t) {
				return (
					36 === t ||
					(t >= 40 && t <= 43) ||
					46 === t ||
					63 === t ||
					(t >= 91 && t <= 94) ||
					(t >= 123 && t <= 125)
				)
			}
			function xt(t) {
				return (t >= 65 && t <= 90) || (t >= 97 && t <= 122)
			}
			function bt(t) {
				return xt(t) || 95 === t
			}
			function _t(t) {
				return bt(t) || kt(t)
			}
			function kt(t) {
				return t >= 48 && t <= 57
			}
			function St(t) {
				return (
					(t >= 48 && t <= 57) || (t >= 65 && t <= 70) || (t >= 97 && t <= 102)
				)
			}
			function wt(t) {
				return t >= 65 && t <= 70
					? t - 65 + 10
					: t >= 97 && t <= 102
					? t - 97 + 10
					: t - 48
			}
			function Et(t) {
				return t >= 48 && t <= 55
			}
			;(yt.prototype.reset = function (t, e, i) {
				var r = -1 !== i.indexOf("u")
				;(this.start = 0 | t),
					(this.source = e + ""),
					(this.flags = i),
					(this.switchU = r && this.parser.options.ecmaVersion >= 6),
					(this.switchN = r && this.parser.options.ecmaVersion >= 9)
			}),
				(yt.prototype.raise = function (t) {
					this.parser.raiseRecoverable(
						this.start,
						"Invalid regular expression: /" + this.source + "/: " + t
					)
				}),
				(yt.prototype.at = function (t) {
					var e = this.source,
						i = e.length
					if (t >= i) return -1
					var r = e.charCodeAt(t)
					return !this.switchU || r <= 55295 || r >= 57344 || t + 1 >= i
						? r
						: (r << 10) + e.charCodeAt(t + 1) - 56613888
				}),
				(yt.prototype.nextIndex = function (t) {
					var e = this.source,
						i = e.length
					if (t >= i) return i
					var r = e.charCodeAt(t)
					return !this.switchU || r <= 55295 || r >= 57344 || t + 1 >= i
						? t + 1
						: t + 2
				}),
				(yt.prototype.current = function () {
					return this.at(this.pos)
				}),
				(yt.prototype.lookahead = function () {
					return this.at(this.nextIndex(this.pos))
				}),
				(yt.prototype.advance = function () {
					this.pos = this.nextIndex(this.pos)
				}),
				(yt.prototype.eat = function (t) {
					return this.current() === t && (this.advance(), !0)
				}),
				(mt.validateRegExpFlags = function (t) {
					for (var e = t.validFlags, i = t.flags, r = 0; r < i.length; r++) {
						var n = i.charAt(r)
						;-1 === e.indexOf(n) &&
							this.raise(t.start, "Invalid regular expression flag"),
							i.indexOf(n, r + 1) > -1 &&
								this.raise(t.start, "Duplicate regular expression flag")
					}
				}),
				(mt.validateRegExpPattern = function (t) {
					this.regexp_pattern(t),
						!t.switchN &&
							this.options.ecmaVersion >= 9 &&
							t.groupNames.length > 0 &&
							((t.switchN = !0), this.regexp_pattern(t))
				}),
				(mt.regexp_pattern = function (t) {
					;(t.pos = 0),
						(t.lastIntValue = 0),
						(t.lastStringValue = ""),
						(t.lastAssertionIsQuantifiable = !1),
						(t.numCapturingParens = 0),
						(t.maxBackReference = 0),
						(t.groupNames.length = 0),
						(t.backReferenceNames.length = 0),
						this.regexp_disjunction(t),
						t.pos !== t.source.length &&
							(t.eat(41) && t.raise("Unmatched ')'"),
							(t.eat(93) || t.eat(125)) && t.raise("Lone quantifier brackets")),
						t.maxBackReference > t.numCapturingParens &&
							t.raise("Invalid escape")
					for (var e = 0, i = t.backReferenceNames; e < i.length; e += 1)
						-1 === t.groupNames.indexOf(i[e]) &&
							t.raise("Invalid named capture referenced")
				}),
				(mt.regexp_disjunction = function (t) {
					for (this.regexp_alternative(t); t.eat(124); )
						this.regexp_alternative(t)
					this.regexp_eatQuantifier(t, !0) && t.raise("Nothing to repeat"),
						t.eat(123) && t.raise("Lone quantifier brackets")
				}),
				(mt.regexp_alternative = function (t) {
					for (; t.pos < t.source.length && this.regexp_eatTerm(t); );
				}),
				(mt.regexp_eatTerm = function (t) {
					return this.regexp_eatAssertion(t)
						? (t.lastAssertionIsQuantifiable &&
								this.regexp_eatQuantifier(t) &&
								t.switchU &&
								t.raise("Invalid quantifier"),
						  !0)
						: !(t.switchU
								? !this.regexp_eatAtom(t)
								: !this.regexp_eatExtendedAtom(t)) &&
								(this.regexp_eatQuantifier(t), !0)
				}),
				(mt.regexp_eatAssertion = function (t) {
					var e = t.pos
					if (((t.lastAssertionIsQuantifiable = !1), t.eat(94) || t.eat(36)))
						return !0
					if (t.eat(92)) {
						if (t.eat(66) || t.eat(98)) return !0
						t.pos = e
					}
					if (t.eat(40) && t.eat(63)) {
						var i = !1
						if (
							(this.options.ecmaVersion >= 9 && (i = t.eat(60)),
							t.eat(61) || t.eat(33))
						)
							return (
								this.regexp_disjunction(t),
								t.eat(41) || t.raise("Unterminated group"),
								(t.lastAssertionIsQuantifiable = !i),
								!0
							)
					}
					return (t.pos = e), !1
				}),
				(mt.regexp_eatQuantifier = function (t, e) {
					return (
						void 0 === e && (e = !1),
						!!this.regexp_eatQuantifierPrefix(t, e) && (t.eat(63), !0)
					)
				}),
				(mt.regexp_eatQuantifierPrefix = function (t, e) {
					return (
						t.eat(42) ||
						t.eat(43) ||
						t.eat(63) ||
						this.regexp_eatBracedQuantifier(t, e)
					)
				}),
				(mt.regexp_eatBracedQuantifier = function (t, e) {
					var i = t.pos
					if (t.eat(123)) {
						var r = 0,
							n = -1
						if (
							this.regexp_eatDecimalDigits(t) &&
							((r = t.lastIntValue),
							t.eat(44) &&
								this.regexp_eatDecimalDigits(t) &&
								(n = t.lastIntValue),
							t.eat(125))
						)
							return (
								-1 !== n &&
									n < r &&
									!e &&
									t.raise("numbers out of order in {} quantifier"),
								!0
							)
						t.switchU && !e && t.raise("Incomplete quantifier"), (t.pos = i)
					}
					return !1
				}),
				(mt.regexp_eatAtom = function (t) {
					return (
						this.regexp_eatPatternCharacters(t) ||
						t.eat(46) ||
						this.regexp_eatReverseSolidusAtomEscape(t) ||
						this.regexp_eatCharacterClass(t) ||
						this.regexp_eatUncapturingGroup(t) ||
						this.regexp_eatCapturingGroup(t)
					)
				}),
				(mt.regexp_eatReverseSolidusAtomEscape = function (t) {
					var e = t.pos
					if (t.eat(92)) {
						if (this.regexp_eatAtomEscape(t)) return !0
						t.pos = e
					}
					return !1
				}),
				(mt.regexp_eatUncapturingGroup = function (t) {
					var e = t.pos
					if (t.eat(40)) {
						if (t.eat(63) && t.eat(58)) {
							if ((this.regexp_disjunction(t), t.eat(41))) return !0
							t.raise("Unterminated group")
						}
						t.pos = e
					}
					return !1
				}),
				(mt.regexp_eatCapturingGroup = function (t) {
					if (t.eat(40)) {
						if (
							(this.options.ecmaVersion >= 9
								? this.regexp_groupSpecifier(t)
								: 63 === t.current() && t.raise("Invalid group"),
							this.regexp_disjunction(t),
							t.eat(41))
						)
							return (t.numCapturingParens += 1), !0
						t.raise("Unterminated group")
					}
					return !1
				}),
				(mt.regexp_eatExtendedAtom = function (t) {
					return (
						t.eat(46) ||
						this.regexp_eatReverseSolidusAtomEscape(t) ||
						this.regexp_eatCharacterClass(t) ||
						this.regexp_eatUncapturingGroup(t) ||
						this.regexp_eatCapturingGroup(t) ||
						this.regexp_eatInvalidBracedQuantifier(t) ||
						this.regexp_eatExtendedPatternCharacter(t)
					)
				}),
				(mt.regexp_eatInvalidBracedQuantifier = function (t) {
					return (
						this.regexp_eatBracedQuantifier(t, !0) &&
							t.raise("Nothing to repeat"),
						!1
					)
				}),
				(mt.regexp_eatSyntaxCharacter = function (t) {
					var e = t.current()
					return !!vt(e) && ((t.lastIntValue = e), t.advance(), !0)
				}),
				(mt.regexp_eatPatternCharacters = function (t) {
					for (var e = t.pos, i = 0; -1 !== (i = t.current()) && !vt(i); )
						t.advance()
					return t.pos !== e
				}),
				(mt.regexp_eatExtendedPatternCharacter = function (t) {
					var e = t.current()
					return !(
						-1 === e ||
						36 === e ||
						(e >= 40 && e <= 43) ||
						46 === e ||
						63 === e ||
						91 === e ||
						94 === e ||
						124 === e ||
						(t.advance(), 0)
					)
				}),
				(mt.regexp_groupSpecifier = function (t) {
					if (t.eat(63)) {
						if (this.regexp_eatGroupName(t))
							return (
								-1 !== t.groupNames.indexOf(t.lastStringValue) &&
									t.raise("Duplicate capture group name"),
								void t.groupNames.push(t.lastStringValue)
							)
						t.raise("Invalid group")
					}
				}),
				(mt.regexp_eatGroupName = function (t) {
					if (((t.lastStringValue = ""), t.eat(60))) {
						if (this.regexp_eatRegExpIdentifierName(t) && t.eat(62)) return !0
						t.raise("Invalid capture group name")
					}
					return !1
				}),
				(mt.regexp_eatRegExpIdentifierName = function (t) {
					if (
						((t.lastStringValue = ""), this.regexp_eatRegExpIdentifierStart(t))
					) {
						for (
							t.lastStringValue += gt(t.lastIntValue);
							this.regexp_eatRegExpIdentifierPart(t);

						)
							t.lastStringValue += gt(t.lastIntValue)
						return !0
					}
					return !1
				}),
				(mt.regexp_eatRegExpIdentifierStart = function (t) {
					var e = t.pos,
						i = t.current()
					return (
						t.advance(),
						92 === i &&
							this.regexp_eatRegExpUnicodeEscapeSequence(t) &&
							(i = t.lastIntValue),
						(function (t) {
							return f(t, !0) || 36 === t || 95 === t
						})(i)
							? ((t.lastIntValue = i), !0)
							: ((t.pos = e), !1)
					)
				}),
				(mt.regexp_eatRegExpIdentifierPart = function (t) {
					var e = t.pos,
						i = t.current()
					return (
						t.advance(),
						92 === i &&
							this.regexp_eatRegExpUnicodeEscapeSequence(t) &&
							(i = t.lastIntValue),
						(function (t) {
							return (
								m(t, !0) || 36 === t || 95 === t || 8204 === t || 8205 === t
							)
						})(i)
							? ((t.lastIntValue = i), !0)
							: ((t.pos = e), !1)
					)
				}),
				(mt.regexp_eatAtomEscape = function (t) {
					return (
						!!(
							this.regexp_eatBackReference(t) ||
							this.regexp_eatCharacterClassEscape(t) ||
							this.regexp_eatCharacterEscape(t) ||
							(t.switchN && this.regexp_eatKGroupName(t))
						) ||
						(t.switchU &&
							(99 === t.current() && t.raise("Invalid unicode escape"),
							t.raise("Invalid escape")),
						!1)
					)
				}),
				(mt.regexp_eatBackReference = function (t) {
					var e = t.pos
					if (this.regexp_eatDecimalEscape(t)) {
						var i = t.lastIntValue
						if (t.switchU)
							return i > t.maxBackReference && (t.maxBackReference = i), !0
						if (i <= t.numCapturingParens) return !0
						t.pos = e
					}
					return !1
				}),
				(mt.regexp_eatKGroupName = function (t) {
					if (t.eat(107)) {
						if (this.regexp_eatGroupName(t))
							return t.backReferenceNames.push(t.lastStringValue), !0
						t.raise("Invalid named reference")
					}
					return !1
				}),
				(mt.regexp_eatCharacterEscape = function (t) {
					return (
						this.regexp_eatControlEscape(t) ||
						this.regexp_eatCControlLetter(t) ||
						this.regexp_eatZero(t) ||
						this.regexp_eatHexEscapeSequence(t) ||
						this.regexp_eatRegExpUnicodeEscapeSequence(t) ||
						(!t.switchU && this.regexp_eatLegacyOctalEscapeSequence(t)) ||
						this.regexp_eatIdentityEscape(t)
					)
				}),
				(mt.regexp_eatCControlLetter = function (t) {
					var e = t.pos
					if (t.eat(99)) {
						if (this.regexp_eatControlLetter(t)) return !0
						t.pos = e
					}
					return !1
				}),
				(mt.regexp_eatZero = function (t) {
					return (
						48 === t.current() &&
						!kt(t.lookahead()) &&
						((t.lastIntValue = 0), t.advance(), !0)
					)
				}),
				(mt.regexp_eatControlEscape = function (t) {
					var e = t.current()
					return 116 === e
						? ((t.lastIntValue = 9), t.advance(), !0)
						: 110 === e
						? ((t.lastIntValue = 10), t.advance(), !0)
						: 118 === e
						? ((t.lastIntValue = 11), t.advance(), !0)
						: 102 === e
						? ((t.lastIntValue = 12), t.advance(), !0)
						: 114 === e && ((t.lastIntValue = 13), t.advance(), !0)
				}),
				(mt.regexp_eatControlLetter = function (t) {
					var e = t.current()
					return !!xt(e) && ((t.lastIntValue = e % 32), t.advance(), !0)
				}),
				(mt.regexp_eatRegExpUnicodeEscapeSequence = function (t) {
					var e,
						i = t.pos
					if (t.eat(117)) {
						if (this.regexp_eatFixedHexDigits(t, 4)) {
							var r = t.lastIntValue
							if (t.switchU && r >= 55296 && r <= 56319) {
								var n = t.pos
								if (
									t.eat(92) &&
									t.eat(117) &&
									this.regexp_eatFixedHexDigits(t, 4)
								) {
									var s = t.lastIntValue
									if (s >= 56320 && s <= 57343)
										return (
											(t.lastIntValue =
												1024 * (r - 55296) + (s - 56320) + 65536),
											!0
										)
								}
								;(t.pos = n), (t.lastIntValue = r)
							}
							return !0
						}
						if (
							t.switchU &&
							t.eat(123) &&
							this.regexp_eatHexDigits(t) &&
							t.eat(125) &&
							(e = t.lastIntValue) >= 0 &&
							e <= 1114111
						)
							return !0
						t.switchU && t.raise("Invalid unicode escape"), (t.pos = i)
					}
					return !1
				}),
				(mt.regexp_eatIdentityEscape = function (t) {
					if (t.switchU)
						return (
							!!this.regexp_eatSyntaxCharacter(t) ||
							(!!t.eat(47) && ((t.lastIntValue = 47), !0))
						)
					var e = t.current()
					return !(
						99 === e ||
						(t.switchN && 107 === e) ||
						((t.lastIntValue = e), t.advance(), 0)
					)
				}),
				(mt.regexp_eatDecimalEscape = function (t) {
					t.lastIntValue = 0
					var e = t.current()
					if (e >= 49 && e <= 57) {
						do {
							;(t.lastIntValue = 10 * t.lastIntValue + (e - 48)), t.advance()
						} while ((e = t.current()) >= 48 && e <= 57)
						return !0
					}
					return !1
				}),
				(mt.regexp_eatCharacterClassEscape = function (t) {
					var e = t.current()
					if (
						(function (t) {
							return (
								100 === t ||
								68 === t ||
								115 === t ||
								83 === t ||
								119 === t ||
								87 === t
							)
						})(e)
					)
						return (t.lastIntValue = -1), t.advance(), !0
					if (
						t.switchU &&
						this.options.ecmaVersion >= 9 &&
						(80 === e || 112 === e)
					) {
						if (
							((t.lastIntValue = -1),
							t.advance(),
							t.eat(123) &&
								this.regexp_eatUnicodePropertyValueExpression(t) &&
								t.eat(125))
						)
							return !0
						t.raise("Invalid property name")
					}
					return !1
				}),
				(mt.regexp_eatUnicodePropertyValueExpression = function (t) {
					var e = t.pos
					if (this.regexp_eatUnicodePropertyName(t) && t.eat(61)) {
						var i = t.lastStringValue
						if (this.regexp_eatUnicodePropertyValue(t))
							return (
								this.regexp_validateUnicodePropertyNameAndValue(
									t,
									i,
									t.lastStringValue
								),
								!0
							)
					}
					return (
						(t.pos = e),
						!!this.regexp_eatLoneUnicodePropertyNameOrValue(t) &&
							(this.regexp_validateUnicodePropertyNameOrValue(
								t,
								t.lastStringValue
							),
							!0)
					)
				}),
				(mt.regexp_validateUnicodePropertyNameAndValue = function (t, e, i) {
					O(t.unicodeProperties.nonBinary, e) ||
						t.raise("Invalid property name"),
						t.unicodeProperties.nonBinary[e].test(i) ||
							t.raise("Invalid property value")
				}),
				(mt.regexp_validateUnicodePropertyNameOrValue = function (t, e) {
					t.unicodeProperties.binary.test(e) || t.raise("Invalid property name")
				}),
				(mt.regexp_eatUnicodePropertyName = function (t) {
					var e = 0
					for (t.lastStringValue = ""; bt((e = t.current())); )
						(t.lastStringValue += gt(e)), t.advance()
					return "" !== t.lastStringValue
				}),
				(mt.regexp_eatUnicodePropertyValue = function (t) {
					var e = 0
					for (t.lastStringValue = ""; _t((e = t.current())); )
						(t.lastStringValue += gt(e)), t.advance()
					return "" !== t.lastStringValue
				}),
				(mt.regexp_eatLoneUnicodePropertyNameOrValue = function (t) {
					return this.regexp_eatUnicodePropertyValue(t)
				}),
				(mt.regexp_eatCharacterClass = function (t) {
					if (t.eat(91)) {
						if ((t.eat(94), this.regexp_classRanges(t), t.eat(93))) return !0
						t.raise("Unterminated character class")
					}
					return !1
				}),
				(mt.regexp_classRanges = function (t) {
					for (; this.regexp_eatClassAtom(t); ) {
						var e = t.lastIntValue
						if (t.eat(45) && this.regexp_eatClassAtom(t)) {
							var i = t.lastIntValue
							!t.switchU ||
								(-1 !== e && -1 !== i) ||
								t.raise("Invalid character class"),
								-1 !== e &&
									-1 !== i &&
									e > i &&
									t.raise("Range out of order in character class")
						}
					}
				}),
				(mt.regexp_eatClassAtom = function (t) {
					var e = t.pos
					if (t.eat(92)) {
						if (this.regexp_eatClassEscape(t)) return !0
						if (t.switchU) {
							var i = t.current()
							;(99 === i || Et(i)) && t.raise("Invalid class escape"),
								t.raise("Invalid escape")
						}
						t.pos = e
					}
					var r = t.current()
					return 93 !== r && ((t.lastIntValue = r), t.advance(), !0)
				}),
				(mt.regexp_eatClassEscape = function (t) {
					var e = t.pos
					if (t.eat(98)) return (t.lastIntValue = 8), !0
					if (t.switchU && t.eat(45)) return (t.lastIntValue = 45), !0
					if (!t.switchU && t.eat(99)) {
						if (this.regexp_eatClassControlLetter(t)) return !0
						t.pos = e
					}
					return (
						this.regexp_eatCharacterClassEscape(t) ||
						this.regexp_eatCharacterEscape(t)
					)
				}),
				(mt.regexp_eatClassControlLetter = function (t) {
					var e = t.current()
					return !(
						(!kt(e) && 95 !== e) ||
						((t.lastIntValue = e % 32), t.advance(), 0)
					)
				}),
				(mt.regexp_eatHexEscapeSequence = function (t) {
					var e = t.pos
					if (t.eat(120)) {
						if (this.regexp_eatFixedHexDigits(t, 2)) return !0
						t.switchU && t.raise("Invalid escape"), (t.pos = e)
					}
					return !1
				}),
				(mt.regexp_eatDecimalDigits = function (t) {
					var e = t.pos,
						i = 0
					for (t.lastIntValue = 0; kt((i = t.current())); )
						(t.lastIntValue = 10 * t.lastIntValue + (i - 48)), t.advance()
					return t.pos !== e
				}),
				(mt.regexp_eatHexDigits = function (t) {
					var e = t.pos,
						i = 0
					for (t.lastIntValue = 0; St((i = t.current())); )
						(t.lastIntValue = 16 * t.lastIntValue + wt(i)), t.advance()
					return t.pos !== e
				}),
				(mt.regexp_eatLegacyOctalEscapeSequence = function (t) {
					if (this.regexp_eatOctalDigit(t)) {
						var e = t.lastIntValue
						if (this.regexp_eatOctalDigit(t)) {
							var i = t.lastIntValue
							t.lastIntValue =
								e <= 3 && this.regexp_eatOctalDigit(t)
									? 64 * e + 8 * i + t.lastIntValue
									: 8 * e + i
						} else t.lastIntValue = e
						return !0
					}
					return !1
				}),
				(mt.regexp_eatOctalDigit = function (t) {
					var e = t.current()
					return Et(e)
						? ((t.lastIntValue = e - 48), t.advance(), !0)
						: ((t.lastIntValue = 0), !1)
				}),
				(mt.regexp_eatFixedHexDigits = function (t, e) {
					var i = t.pos
					t.lastIntValue = 0
					for (var r = 0; r < e; ++r) {
						var n = t.current()
						if (!St(n)) return (t.pos = i), !1
						;(t.lastIntValue = 16 * t.lastIntValue + wt(n)), t.advance()
					}
					return !0
				})
			var Ct = function (t) {
					;(this.type = t.type),
						(this.value = t.value),
						(this.start = t.start),
						(this.end = t.end),
						t.options.locations && (this.loc = new R(t, t.startLoc, t.endLoc)),
						t.options.ranges && (this.range = [t.start, t.end])
				},
				At = B.prototype
			function It(t) {
				return t <= 65535
					? String.fromCharCode(t)
					: ((t -= 65536),
					  String.fromCharCode(55296 + (t >> 10), 56320 + (1023 & t)))
			}
			;(At.next = function () {
				this.options.onToken && this.options.onToken(new Ct(this)),
					(this.lastTokEnd = this.end),
					(this.lastTokStart = this.start),
					(this.lastTokEndLoc = this.endLoc),
					(this.lastTokStartLoc = this.startLoc),
					this.nextToken()
			}),
				(At.getToken = function () {
					return this.next(), new Ct(this)
				}),
				"undefined" != typeof Symbol &&
					(At[Symbol.iterator] = function () {
						var t = this
						return {
							next: function () {
								var e = t.getToken()
								return { done: e.type === k.eof, value: e }
							}
						}
					}),
				(At.curContext = function () {
					return this.context[this.context.length - 1]
				}),
				(At.nextToken = function () {
					var t = this.curContext()
					return (
						(t && t.preserveSpace) || this.skipSpace(),
						(this.start = this.pos),
						this.options.locations && (this.startLoc = this.curPosition()),
						this.pos >= this.input.length
							? this.finishToken(k.eof)
							: t.override
							? t.override(this)
							: void this.readToken(this.fullCharCodeAtPos())
					)
				}),
				(At.readToken = function (t) {
					return f(t, this.options.ecmaVersion >= 6) || 92 === t
						? this.readWord()
						: this.getTokenFromCode(t)
				}),
				(At.fullCharCodeAtPos = function () {
					var t = this.input.charCodeAt(this.pos)
					return t <= 55295 || t >= 57344
						? t
						: (t << 10) + this.input.charCodeAt(this.pos + 1) - 56613888
				}),
				(At.skipBlockComment = function () {
					var t,
						e = this.options.onComment && this.curPosition(),
						i = this.pos,
						r = this.input.indexOf("*/", (this.pos += 2))
					if (
						(-1 === r && this.raise(this.pos - 2, "Unterminated comment"),
						(this.pos = r + 2),
						this.options.locations)
					)
						for (
							w.lastIndex = i;
							(t = w.exec(this.input)) && t.index < this.pos;

						)
							++this.curLine, (this.lineStart = t.index + t[0].length)
					this.options.onComment &&
						this.options.onComment(
							!0,
							this.input.slice(i + 2, r),
							i,
							this.pos,
							e,
							this.curPosition()
						)
				}),
				(At.skipLineComment = function (t) {
					for (
						var e = this.pos,
							i = this.options.onComment && this.curPosition(),
							r = this.input.charCodeAt((this.pos += t));
						this.pos < this.input.length && !E(r);

					)
						r = this.input.charCodeAt(++this.pos)
					this.options.onComment &&
						this.options.onComment(
							!1,
							this.input.slice(e + t, this.pos),
							e,
							this.pos,
							i,
							this.curPosition()
						)
				}),
				(At.skipSpace = function () {
					t: for (; this.pos < this.input.length; ) {
						var t = this.input.charCodeAt(this.pos)
						switch (t) {
							case 32:
							case 160:
								++this.pos
								break
							case 13:
								10 === this.input.charCodeAt(this.pos + 1) && ++this.pos
							case 10:
							case 8232:
							case 8233:
								++this.pos,
									this.options.locations &&
										(++this.curLine, (this.lineStart = this.pos))
								break
							case 47:
								switch (this.input.charCodeAt(this.pos + 1)) {
									case 42:
										this.skipBlockComment()
										break
									case 47:
										this.skipLineComment(2)
										break
									default:
										break t
								}
								break
							default:
								if (
									!(
										(t > 8 && t < 14) ||
										(t >= 5760 && C.test(String.fromCharCode(t)))
									)
								)
									break t
								++this.pos
						}
					}
				}),
				(At.finishToken = function (t, e) {
					;(this.end = this.pos),
						this.options.locations && (this.endLoc = this.curPosition())
					var i = this.type
					;(this.type = t), (this.value = e), this.updateContext(i)
				}),
				(At.readToken_dot = function () {
					var t = this.input.charCodeAt(this.pos + 1)
					if (t >= 48 && t <= 57) return this.readNumber(!0)
					var e = this.input.charCodeAt(this.pos + 2)
					return this.options.ecmaVersion >= 6 && 46 === t && 46 === e
						? ((this.pos += 3), this.finishToken(k.ellipsis))
						: (++this.pos, this.finishToken(k.dot))
				}),
				(At.readToken_slash = function () {
					var t = this.input.charCodeAt(this.pos + 1)
					return this.exprAllowed
						? (++this.pos, this.readRegexp())
						: 61 === t
						? this.finishOp(k.assign, 2)
						: this.finishOp(k.slash, 1)
				}),
				(At.readToken_mult_modulo_exp = function (t) {
					var e = this.input.charCodeAt(this.pos + 1),
						i = 1,
						r = 42 === t ? k.star : k.modulo
					return (
						this.options.ecmaVersion >= 7 &&
							42 === t &&
							42 === e &&
							(++i,
							(r = k.starstar),
							(e = this.input.charCodeAt(this.pos + 2))),
						61 === e ? this.finishOp(k.assign, i + 1) : this.finishOp(r, i)
					)
				}),
				(At.readToken_pipe_amp = function (t) {
					var e = this.input.charCodeAt(this.pos + 1)
					return e === t
						? this.finishOp(124 === t ? k.logicalOR : k.logicalAND, 2)
						: 61 === e
						? this.finishOp(k.assign, 2)
						: this.finishOp(124 === t ? k.bitwiseOR : k.bitwiseAND, 1)
				}),
				(At.readToken_caret = function () {
					return 61 === this.input.charCodeAt(this.pos + 1)
						? this.finishOp(k.assign, 2)
						: this.finishOp(k.bitwiseXOR, 1)
				}),
				(At.readToken_plus_min = function (t) {
					var e = this.input.charCodeAt(this.pos + 1)
					return e === t
						? 45 !== e ||
						  this.inModule ||
						  62 !== this.input.charCodeAt(this.pos + 2) ||
						  (0 !== this.lastTokEnd &&
								!S.test(this.input.slice(this.lastTokEnd, this.pos)))
							? this.finishOp(k.incDec, 2)
							: (this.skipLineComment(3), this.skipSpace(), this.nextToken())
						: 61 === e
						? this.finishOp(k.assign, 2)
						: this.finishOp(k.plusMin, 1)
				}),
				(At.readToken_lt_gt = function (t) {
					var e = this.input.charCodeAt(this.pos + 1),
						i = 1
					return e === t
						? ((i =
								62 === t && 62 === this.input.charCodeAt(this.pos + 2) ? 3 : 2),
						  61 === this.input.charCodeAt(this.pos + i)
								? this.finishOp(k.assign, i + 1)
								: this.finishOp(k.bitShift, i))
						: 33 !== e ||
						  60 !== t ||
						  this.inModule ||
						  45 !== this.input.charCodeAt(this.pos + 2) ||
						  45 !== this.input.charCodeAt(this.pos + 3)
						? (61 === e && (i = 2), this.finishOp(k.relational, i))
						: (this.skipLineComment(4), this.skipSpace(), this.nextToken())
				}),
				(At.readToken_eq_excl = function (t) {
					var e = this.input.charCodeAt(this.pos + 1)
					return 61 === e
						? this.finishOp(
								k.equality,
								61 === this.input.charCodeAt(this.pos + 2) ? 3 : 2
						  )
						: 61 === t && 62 === e && this.options.ecmaVersion >= 6
						? ((this.pos += 2), this.finishToken(k.arrow))
						: this.finishOp(61 === t ? k.eq : k.prefix, 1)
				}),
				(At.getTokenFromCode = function (t) {
					switch (t) {
						case 46:
							return this.readToken_dot()
						case 40:
							return ++this.pos, this.finishToken(k.parenL)
						case 41:
							return ++this.pos, this.finishToken(k.parenR)
						case 59:
							return ++this.pos, this.finishToken(k.semi)
						case 44:
							return ++this.pos, this.finishToken(k.comma)
						case 91:
							return ++this.pos, this.finishToken(k.bracketL)
						case 93:
							return ++this.pos, this.finishToken(k.bracketR)
						case 123:
							return ++this.pos, this.finishToken(k.braceL)
						case 125:
							return ++this.pos, this.finishToken(k.braceR)
						case 58:
							return ++this.pos, this.finishToken(k.colon)
						case 63:
							return ++this.pos, this.finishToken(k.question)
						case 96:
							if (this.options.ecmaVersion < 6) break
							return ++this.pos, this.finishToken(k.backQuote)
						case 48:
							var e = this.input.charCodeAt(this.pos + 1)
							if (120 === e || 88 === e) return this.readRadixNumber(16)
							if (this.options.ecmaVersion >= 6) {
								if (111 === e || 79 === e) return this.readRadixNumber(8)
								if (98 === e || 66 === e) return this.readRadixNumber(2)
							}
						case 49:
						case 50:
						case 51:
						case 52:
						case 53:
						case 54:
						case 55:
						case 56:
						case 57:
							return this.readNumber(!1)
						case 34:
						case 39:
							return this.readString(t)
						case 47:
							return this.readToken_slash()
						case 37:
						case 42:
							return this.readToken_mult_modulo_exp(t)
						case 124:
						case 38:
							return this.readToken_pipe_amp(t)
						case 94:
							return this.readToken_caret()
						case 43:
						case 45:
							return this.readToken_plus_min(t)
						case 60:
						case 62:
							return this.readToken_lt_gt(t)
						case 61:
						case 33:
							return this.readToken_eq_excl(t)
						case 126:
							return this.finishOp(k.prefix, 1)
					}
					this.raise(this.pos, "Unexpected character '" + It(t) + "'")
				}),
				(At.finishOp = function (t, e) {
					var i = this.input.slice(this.pos, this.pos + e)
					return (this.pos += e), this.finishToken(t, i)
				}),
				(At.readRegexp = function () {
					for (var t, e, i = this.pos; ; ) {
						this.pos >= this.input.length &&
							this.raise(i, "Unterminated regular expression")
						var r = this.input.charAt(this.pos)
						if (
							(S.test(r) && this.raise(i, "Unterminated regular expression"), t)
						)
							t = !1
						else {
							if ("[" === r) e = !0
							else if ("]" === r && e) e = !1
							else if ("/" === r && !e) break
							t = "\\" === r
						}
						++this.pos
					}
					var n = this.input.slice(i, this.pos)
					++this.pos
					var s = this.pos,
						a = this.readWord1()
					this.containsEsc && this.unexpected(s)
					var o = this.regexpState || (this.regexpState = new yt(this))
					o.reset(i, n, a),
						this.validateRegExpFlags(o),
						this.validateRegExpPattern(o)
					var p = null
					try {
						p = new RegExp(n, a)
					} catch (t) {}
					return this.finishToken(k.regexp, { pattern: n, flags: a, value: p })
				}),
				(At.readInt = function (t, e) {
					for (
						var i = this.pos, r = 0, n = 0, s = null == e ? 1 / 0 : e;
						n < s;
						++n
					) {
						var a,
							o = this.input.charCodeAt(this.pos)
						if (
							(a =
								o >= 97
									? o - 97 + 10
									: o >= 65
									? o - 65 + 10
									: o >= 48 && o <= 57
									? o - 48
									: 1 / 0) >= t
						)
							break
						++this.pos, (r = r * t + a)
					}
					return this.pos === i || (null != e && this.pos - i !== e) ? null : r
				}),
				(At.readRadixNumber = function (t) {
					this.pos += 2
					var e = this.readInt(t)
					return (
						null == e &&
							this.raise(this.start + 2, "Expected number in radix " + t),
						f(this.fullCharCodeAtPos()) &&
							this.raise(this.pos, "Identifier directly after number"),
						this.finishToken(k.num, e)
					)
				}),
				(At.readNumber = function (t) {
					var e = this.pos
					t || null !== this.readInt(10) || this.raise(e, "Invalid number")
					var i = this.pos - e >= 2 && 48 === this.input.charCodeAt(e)
					i && this.strict && this.raise(e, "Invalid number"),
						i && /[89]/.test(this.input.slice(e, this.pos)) && (i = !1)
					var r = this.input.charCodeAt(this.pos)
					46 !== r ||
						i ||
						(++this.pos,
						this.readInt(10),
						(r = this.input.charCodeAt(this.pos))),
						(69 !== r && 101 !== r) ||
							i ||
							((43 !== (r = this.input.charCodeAt(++this.pos)) && 45 !== r) ||
								++this.pos,
							null === this.readInt(10) && this.raise(e, "Invalid number")),
						f(this.fullCharCodeAtPos()) &&
							this.raise(this.pos, "Identifier directly after number")
					var n = this.input.slice(e, this.pos),
						s = i ? parseInt(n, 8) : parseFloat(n)
					return this.finishToken(k.num, s)
				}),
				(At.readCodePoint = function () {
					var t
					if (123 === this.input.charCodeAt(this.pos)) {
						this.options.ecmaVersion < 6 && this.unexpected()
						var e = ++this.pos
						;(t = this.readHexChar(
							this.input.indexOf("}", this.pos) - this.pos
						)),
							++this.pos,
							t > 1114111 &&
								this.invalidStringToken(e, "Code point out of bounds")
					} else t = this.readHexChar(4)
					return t
				}),
				(At.readString = function (t) {
					for (var e = "", i = ++this.pos; ; ) {
						this.pos >= this.input.length &&
							this.raise(this.start, "Unterminated string constant")
						var r = this.input.charCodeAt(this.pos)
						if (r === t) break
						92 === r
							? ((e += this.input.slice(i, this.pos)),
							  (e += this.readEscapedChar(!1)),
							  (i = this.pos))
							: (E(r, this.options.ecmaVersion >= 10) &&
									this.raise(this.start, "Unterminated string constant"),
							  ++this.pos)
					}
					return (
						(e += this.input.slice(i, this.pos++)),
						this.finishToken(k.string, e)
					)
				})
			var Pt = {}
			;(At.tryReadTemplateToken = function () {
				this.inTemplateElement = !0
				try {
					this.readTmplToken()
				} catch (r) {
					if (r !== Pt) throw r
					this.readInvalidTemplateToken()
				}
				this.inTemplateElement = !1
			}),
				(At.invalidStringToken = function (t, e) {
					if (this.inTemplateElement && this.options.ecmaVersion >= 9) throw Pt
					this.raise(t, e)
				}),
				(At.readTmplToken = function () {
					for (var t = "", e = this.pos; ; ) {
						this.pos >= this.input.length &&
							this.raise(this.start, "Unterminated template")
						var i = this.input.charCodeAt(this.pos)
						if (
							96 === i ||
							(36 === i && 123 === this.input.charCodeAt(this.pos + 1))
						)
							return this.pos !== this.start ||
								(this.type !== k.template && this.type !== k.invalidTemplate)
								? ((t += this.input.slice(e, this.pos)),
								  this.finishToken(k.template, t))
								: 36 === i
								? ((this.pos += 2), this.finishToken(k.dollarBraceL))
								: (++this.pos, this.finishToken(k.backQuote))
						if (92 === i)
							(t += this.input.slice(e, this.pos)),
								(t += this.readEscapedChar(!0)),
								(e = this.pos)
						else if (E(i)) {
							switch (((t += this.input.slice(e, this.pos)), ++this.pos, i)) {
								case 13:
									10 === this.input.charCodeAt(this.pos) && ++this.pos
								case 10:
									t += "\n"
									break
								default:
									t += String.fromCharCode(i)
							}
							this.options.locations &&
								(++this.curLine, (this.lineStart = this.pos)),
								(e = this.pos)
						} else ++this.pos
					}
				}),
				(At.readInvalidTemplateToken = function () {
					for (; this.pos < this.input.length; this.pos++)
						switch (this.input[this.pos]) {
							case "\\":
								++this.pos
								break
							case "$":
								if ("{" !== this.input[this.pos + 1]) break
							case "`":
								return this.finishToken(
									k.invalidTemplate,
									this.input.slice(this.start, this.pos)
								)
						}
					this.raise(this.start, "Unterminated template")
				}),
				(At.readEscapedChar = function (t) {
					var e = this.input.charCodeAt(++this.pos)
					switch ((++this.pos, e)) {
						case 110:
							return "\n"
						case 114:
							return "\r"
						case 120:
							return String.fromCharCode(this.readHexChar(2))
						case 117:
							return It(this.readCodePoint())
						case 116:
							return "\t"
						case 98:
							return "\b"
						case 118:
							return "\v"
						case 102:
							return "\f"
						case 13:
							10 === this.input.charCodeAt(this.pos) && ++this.pos
						case 10:
							return (
								this.options.locations &&
									((this.lineStart = this.pos), ++this.curLine),
								""
							)
						default:
							if (e >= 48 && e <= 55) {
								var i = this.input.substr(this.pos - 1, 3).match(/^[0-7]+/)[0],
									r = parseInt(i, 8)
								return (
									r > 255 && ((i = i.slice(0, -1)), (r = parseInt(i, 8))),
									(this.pos += i.length - 1),
									(e = this.input.charCodeAt(this.pos)),
									("0" === i && 56 !== e && 57 !== e) ||
										(!this.strict && !t) ||
										this.invalidStringToken(
											this.pos - 1 - i.length,
											t
												? "Octal literal in template string"
												: "Octal literal in strict mode"
										),
									String.fromCharCode(r)
								)
							}
							return E(e) ? "" : String.fromCharCode(e)
					}
				}),
				(At.readHexChar = function (t) {
					var e = this.pos,
						i = this.readInt(16, t)
					return (
						null === i &&
							this.invalidStringToken(e, "Bad character escape sequence"),
						i
					)
				}),
				(At.readWord1 = function () {
					this.containsEsc = !1
					for (
						var t = "", e = !0, i = this.pos, r = this.options.ecmaVersion >= 6;
						this.pos < this.input.length;

					) {
						var n = this.fullCharCodeAtPos()
						if (m(n, r)) this.pos += n <= 65535 ? 1 : 2
						else {
							if (92 !== n) break
							;(this.containsEsc = !0), (t += this.input.slice(i, this.pos))
							var s = this.pos
							117 !== this.input.charCodeAt(++this.pos) &&
								this.invalidStringToken(
									this.pos,
									"Expecting Unicode escape sequence \\uXXXX"
								),
								++this.pos
							var a = this.readCodePoint()
							;(e ? f : m)(a, r) ||
								this.invalidStringToken(s, "Invalid Unicode escape"),
								(t += It(a)),
								(i = this.pos)
						}
						e = !1
					}
					return t + this.input.slice(i, this.pos)
				}),
				(At.readWord = function () {
					var t = this.readWord1(),
						e = k.name
					return (
						this.keywords.test(t) &&
							(this.containsEsc &&
								this.raiseRecoverable(
									this.start,
									"Escape sequence in keyword " + t
								),
							(e = b[t])),
						this.finishToken(e, t)
					)
				})
			var Lt = {
					quot: '"',
					amp: "&",
					apos: "'",
					lt: "<",
					gt: ">",
					nbsp: "\xa0",
					iexcl: "\xa1",
					cent: "\xa2",
					pound: "\xa3",
					curren: "\xa4",
					yen: "\xa5",
					brvbar: "\xa6",
					sect: "\xa7",
					uml: "\xa8",
					copy: "\xa9",
					ordf: "\xaa",
					laquo: "\xab",
					not: "\xac",
					shy: "\xad",
					reg: "\xae",
					macr: "\xaf",
					deg: "\xb0",
					plusmn: "\xb1",
					sup2: "\xb2",
					sup3: "\xb3",
					acute: "\xb4",
					micro: "\xb5",
					para: "\xb6",
					middot: "\xb7",
					cedil: "\xb8",
					sup1: "\xb9",
					ordm: "\xba",
					raquo: "\xbb",
					frac14: "\xbc",
					frac12: "\xbd",
					frac34: "\xbe",
					iquest: "\xbf",
					Agrave: "\xc0",
					Aacute: "\xc1",
					Acirc: "\xc2",
					Atilde: "\xc3",
					Auml: "\xc4",
					Aring: "\xc5",
					AElig: "\xc6",
					Ccedil: "\xc7",
					Egrave: "\xc8",
					Eacute: "\xc9",
					Ecirc: "\xca",
					Euml: "\xcb",
					Igrave: "\xcc",
					Iacute: "\xcd",
					Icirc: "\xce",
					Iuml: "\xcf",
					ETH: "\xd0",
					Ntilde: "\xd1",
					Ograve: "\xd2",
					Oacute: "\xd3",
					Ocirc: "\xd4",
					Otilde: "\xd5",
					Ouml: "\xd6",
					times: "\xd7",
					Oslash: "\xd8",
					Ugrave: "\xd9",
					Uacute: "\xda",
					Ucirc: "\xdb",
					Uuml: "\xdc",
					Yacute: "\xdd",
					THORN: "\xde",
					szlig: "\xdf",
					agrave: "\xe0",
					aacute: "\xe1",
					acirc: "\xe2",
					atilde: "\xe3",
					auml: "\xe4",
					aring: "\xe5",
					aelig: "\xe6",
					ccedil: "\xe7",
					egrave: "\xe8",
					eacute: "\xe9",
					ecirc: "\xea",
					euml: "\xeb",
					igrave: "\xec",
					iacute: "\xed",
					icirc: "\xee",
					iuml: "\xef",
					eth: "\xf0",
					ntilde: "\xf1",
					ograve: "\xf2",
					oacute: "\xf3",
					ocirc: "\xf4",
					otilde: "\xf5",
					ouml: "\xf6",
					divide: "\xf7",
					oslash: "\xf8",
					ugrave: "\xf9",
					uacute: "\xfa",
					ucirc: "\xfb",
					uuml: "\xfc",
					yacute: "\xfd",
					thorn: "\xfe",
					yuml: "\xff",
					OElig: "\u0152",
					oelig: "\u0153",
					Scaron: "\u0160",
					scaron: "\u0161",
					Yuml: "\u0178",
					fnof: "\u0192",
					circ: "\u02c6",
					tilde: "\u02dc",
					Alpha: "\u0391",
					Beta: "\u0392",
					Gamma: "\u0393",
					Delta: "\u0394",
					Epsilon: "\u0395",
					Zeta: "\u0396",
					Eta: "\u0397",
					Theta: "\u0398",
					Iota: "\u0399",
					Kappa: "\u039a",
					Lambda: "\u039b",
					Mu: "\u039c",
					Nu: "\u039d",
					Xi: "\u039e",
					Omicron: "\u039f",
					Pi: "\u03a0",
					Rho: "\u03a1",
					Sigma: "\u03a3",
					Tau: "\u03a4",
					Upsilon: "\u03a5",
					Phi: "\u03a6",
					Chi: "\u03a7",
					Psi: "\u03a8",
					Omega: "\u03a9",
					alpha: "\u03b1",
					beta: "\u03b2",
					gamma: "\u03b3",
					delta: "\u03b4",
					epsilon: "\u03b5",
					zeta: "\u03b6",
					eta: "\u03b7",
					theta: "\u03b8",
					iota: "\u03b9",
					kappa: "\u03ba",
					lambda: "\u03bb",
					mu: "\u03bc",
					nu: "\u03bd",
					xi: "\u03be",
					omicron: "\u03bf",
					pi: "\u03c0",
					rho: "\u03c1",
					sigmaf: "\u03c2",
					sigma: "\u03c3",
					tau: "\u03c4",
					upsilon: "\u03c5",
					phi: "\u03c6",
					chi: "\u03c7",
					psi: "\u03c8",
					omega: "\u03c9",
					thetasym: "\u03d1",
					upsih: "\u03d2",
					piv: "\u03d6",
					ensp: "\u2002",
					emsp: "\u2003",
					thinsp: "\u2009",
					zwnj: "\u200c",
					zwj: "\u200d",
					lrm: "\u200e",
					rlm: "\u200f",
					ndash: "\u2013",
					mdash: "\u2014",
					lsquo: "\u2018",
					rsquo: "\u2019",
					sbquo: "\u201a",
					ldquo: "\u201c",
					rdquo: "\u201d",
					bdquo: "\u201e",
					dagger: "\u2020",
					Dagger: "\u2021",
					bull: "\u2022",
					hellip: "\u2026",
					permil: "\u2030",
					prime: "\u2032",
					Prime: "\u2033",
					lsaquo: "\u2039",
					rsaquo: "\u203a",
					oline: "\u203e",
					frasl: "\u2044",
					euro: "\u20ac",
					image: "\u2111",
					weierp: "\u2118",
					real: "\u211c",
					trade: "\u2122",
					alefsym: "\u2135",
					larr: "\u2190",
					uarr: "\u2191",
					rarr: "\u2192",
					darr: "\u2193",
					harr: "\u2194",
					crarr: "\u21b5",
					lArr: "\u21d0",
					uArr: "\u21d1",
					rArr: "\u21d2",
					dArr: "\u21d3",
					hArr: "\u21d4",
					forall: "\u2200",
					part: "\u2202",
					exist: "\u2203",
					empty: "\u2205",
					nabla: "\u2207",
					isin: "\u2208",
					notin: "\u2209",
					ni: "\u220b",
					prod: "\u220f",
					sum: "\u2211",
					minus: "\u2212",
					lowast: "\u2217",
					radic: "\u221a",
					prop: "\u221d",
					infin: "\u221e",
					ang: "\u2220",
					and: "\u2227",
					or: "\u2228",
					cap: "\u2229",
					cup: "\u222a",
					int: "\u222b",
					there4: "\u2234",
					sim: "\u223c",
					cong: "\u2245",
					asymp: "\u2248",
					ne: "\u2260",
					equiv: "\u2261",
					le: "\u2264",
					ge: "\u2265",
					sub: "\u2282",
					sup: "\u2283",
					nsub: "\u2284",
					sube: "\u2286",
					supe: "\u2287",
					oplus: "\u2295",
					otimes: "\u2297",
					perp: "\u22a5",
					sdot: "\u22c5",
					lceil: "\u2308",
					rceil: "\u2309",
					lfloor: "\u230a",
					rfloor: "\u230b",
					lang: "\u2329",
					rang: "\u232a",
					loz: "\u25ca",
					spades: "\u2660",
					clubs: "\u2663",
					hearts: "\u2665",
					diams: "\u2666"
				},
				Ot = {
					version: "6.1.1",
					parse: function (t, e) {
						return B.parse(t, e)
					},
					parseExpressionAt: function (t, e, i) {
						return B.parseExpressionAt(t, e, i)
					},
					tokenizer: function (t, e) {
						return B.tokenizer(t, e)
					},
					Parser: B,
					defaultOptions: D,
					Position: T,
					SourceLocation: R,
					getLineInfo: V,
					Node: it,
					TokenType: y,
					tokTypes: k,
					keywordTypes: b,
					TokContext: st,
					tokContexts: at,
					isIdentifierChar: m,
					isIdentifierStart: f,
					Token: Ct,
					isNewLine: E,
					lineBreak: S,
					lineBreakG: w,
					nonASCIIwhitespace: C
				}
			const Nt = /^[\da-fA-F]+$/,
				jt = /^\d+$/,
				Tt = Ot.tokTypes,
				Rt = Ot.TokContext,
				Vt = Ot.tokContexts,
				Dt = Ot.TokenType,
				Ft = Ot.isNewLine,
				Bt = Ot.isIdentifierStart,
				Mt = Ot.isIdentifierChar,
				Ut = new Rt("<tag", !1),
				qt = new Rt("</tag", !1),
				zt = new Rt("<tag>...</tag>", !0, !0),
				Wt = {
					jsxName: new Dt("jsxName"),
					jsxText: new Dt("jsxText", { beforeExpr: !0 }),
					jsxTagStart: new Dt("jsxTagStart"),
					jsxTagEnd: new Dt("jsxTagEnd")
				}
			function Xt(t) {
				return t
					? "JSXIdentifier" === t.type
						? t.name
						: "JSXNamespacedName" === t.type
						? t.namespace.name + ":" + t.name.name
						: "JSXMemberExpression" === t.type
						? Xt(t.object) + "." + Xt(t.property)
						: void 0
					: t
			}
			;(Wt.jsxTagStart.updateContext = function () {
				this.context.push(zt), this.context.push(Ut), (this.exprAllowed = !1)
			}),
				(Wt.jsxTagEnd.updateContext = function (t) {
					let e = this.context.pop()
					;(e === Ut && t === Tt.slash) || e === qt
						? (this.context.pop(),
						  (this.exprAllowed = this.curContext() === zt))
						: (this.exprAllowed = !0)
				})
			var Jt = function (t) {
				return (
					(t = t || {}),
					function (e) {
						return (function (t, e) {
							return class extends e {
								jsx_readToken() {
									let t = "",
										e = this.pos
									for (;;) {
										this.pos >= this.input.length &&
											this.raise(this.start, "Unterminated JSX contents")
										let i = this.input.charCodeAt(this.pos)
										switch (i) {
											case 60:
											case 123:
												return this.pos === this.start
													? 60 === i && this.exprAllowed
														? (++this.pos, this.finishToken(Wt.jsxTagStart))
														: this.getTokenFromCode(i)
													: ((t += this.input.slice(e, this.pos)),
													  this.finishToken(Wt.jsxText, t))
											case 38:
												;(t += this.input.slice(e, this.pos)),
													(t += this.jsx_readEntity()),
													(e = this.pos)
												break
											default:
												Ft(i)
													? ((t += this.input.slice(e, this.pos)),
													  (t += this.jsx_readNewLine(!0)),
													  (e = this.pos))
													: ++this.pos
										}
									}
								}
								jsx_readNewLine(t) {
									let e,
										i = this.input.charCodeAt(this.pos)
									return (
										++this.pos,
										13 === i && 10 === this.input.charCodeAt(this.pos)
											? (++this.pos, (e = t ? "\n" : "\r\n"))
											: (e = String.fromCharCode(i)),
										this.options.locations &&
											(++this.curLine, (this.lineStart = this.pos)),
										e
									)
								}
								jsx_readString(t) {
									let e = "",
										i = ++this.pos
									for (;;) {
										this.pos >= this.input.length &&
											this.raise(this.start, "Unterminated string constant")
										let r = this.input.charCodeAt(this.pos)
										if (r === t) break
										38 === r
											? ((e += this.input.slice(i, this.pos)),
											  (e += this.jsx_readEntity()),
											  (i = this.pos))
											: Ft(r)
											? ((e += this.input.slice(i, this.pos)),
											  (e += this.jsx_readNewLine(!1)),
											  (i = this.pos))
											: ++this.pos
									}
									return (
										(e += this.input.slice(i, this.pos++)),
										this.finishToken(Tt.string, e)
									)
								}
								jsx_readEntity() {
									let t,
										e = "",
										i = 0,
										r = this.input[this.pos]
									"&" !== r &&
										this.raise(this.pos, "Entity must start with an ampersand")
									let n = ++this.pos
									for (; this.pos < this.input.length && i++ < 10; ) {
										if (";" === (r = this.input[this.pos++])) {
											"#" === e[0]
												? "x" === e[1]
													? ((e = e.substr(2)),
													  Nt.test(e) &&
															(t = String.fromCharCode(parseInt(e, 16))))
													: ((e = e.substr(1)),
													  jt.test(e) &&
															(t = String.fromCharCode(parseInt(e, 10))))
												: (t = Lt[e])
											break
										}
										e += r
									}
									return t || ((this.pos = n), "&")
								}
								jsx_readWord() {
									let t,
										e = this.pos
									do {
										t = this.input.charCodeAt(++this.pos)
									} while (Mt(t) || 45 === t)
									return this.finishToken(
										Wt.jsxName,
										this.input.slice(e, this.pos)
									)
								}
								jsx_parseIdentifier() {
									let t = this.startNode()
									return (
										this.type === Wt.jsxName
											? (t.name = this.value)
											: this.type.keyword
											? (t.name = this.type.keyword)
											: this.unexpected(),
										this.next(),
										this.finishNode(t, "JSXIdentifier")
									)
								}
								jsx_parseNamespacedName() {
									let e = this.start,
										i = this.startLoc,
										r = this.jsx_parseIdentifier()
									if (!t.allowNamespaces || !this.eat(Tt.colon)) return r
									var n = this.startNodeAt(e, i)
									return (
										(n.namespace = r),
										(n.name = this.jsx_parseIdentifier()),
										this.finishNode(n, "JSXNamespacedName")
									)
								}
								jsx_parseElementName() {
									if (this.type === Wt.jsxTagEnd) return ""
									let e = this.start,
										i = this.startLoc,
										r = this.jsx_parseNamespacedName()
									for (
										this.type !== Tt.dot ||
										"JSXNamespacedName" !== r.type ||
										t.allowNamespacedObjects ||
										this.unexpected();
										this.eat(Tt.dot);

									) {
										let t = this.startNodeAt(e, i)
										;(t.object = r),
											(t.property = this.jsx_parseIdentifier()),
											(r = this.finishNode(t, "JSXMemberExpression"))
									}
									return r
								}
								jsx_parseAttributeValue() {
									switch (this.type) {
										case Tt.braceL:
											let t = this.jsx_parseExpressionContainer()
											return (
												"JSXEmptyExpression" === t.expression.type &&
													this.raise(
														t.start,
														"JSX attributes must only be assigned a non-empty expression"
													),
												t
											)
										case Wt.jsxTagStart:
										case Tt.string:
											return this.parseExprAtom()
										default:
											this.raise(
												this.start,
												"JSX value should be either an expression or a quoted JSX text"
											)
									}
								}
								jsx_parseEmptyExpression() {
									let t = this.startNodeAt(this.lastTokEnd, this.lastTokEndLoc)
									return this.finishNodeAt(
										t,
										"JSXEmptyExpression",
										this.start,
										this.startLoc
									)
								}
								jsx_parseExpressionContainer() {
									let t = this.startNode()
									return (
										this.next(),
										(t.expression =
											this.type === Tt.braceR
												? this.jsx_parseEmptyExpression()
												: this.parseExpression()),
										this.expect(Tt.braceR),
										this.finishNode(t, "JSXExpressionContainer")
									)
								}
								jsx_parseAttribute() {
									let t = this.startNode()
									return this.eat(Tt.braceL)
										? (this.expect(Tt.ellipsis),
										  (t.argument = this.parseMaybeAssign()),
										  this.expect(Tt.braceR),
										  this.finishNode(t, "JSXSpreadAttribute"))
										: ((t.name = this.jsx_parseNamespacedName()),
										  (t.value = this.eat(Tt.eq)
												? this.jsx_parseAttributeValue()
												: null),
										  this.finishNode(t, "JSXAttribute"))
								}
								jsx_parseOpeningElementAt(t, e) {
									let i = this.startNodeAt(t, e)
									i.attributes = []
									let r = this.jsx_parseElementName()
									for (
										r && (i.name = r);
										this.type !== Tt.slash && this.type !== Wt.jsxTagEnd;

									)
										i.attributes.push(this.jsx_parseAttribute())
									return (
										(i.selfClosing = this.eat(Tt.slash)),
										this.expect(Wt.jsxTagEnd),
										this.finishNode(
											i,
											r ? "JSXOpeningElement" : "JSXOpeningFragment"
										)
									)
								}
								jsx_parseClosingElementAt(t, e) {
									let i = this.startNodeAt(t, e),
										r = this.jsx_parseElementName()
									return (
										r && (i.name = r),
										this.expect(Wt.jsxTagEnd),
										this.finishNode(
											i,
											r ? "JSXClosingElement" : "JSXClosingFragment"
										)
									)
								}
								jsx_parseElementAt(t, e) {
									let i = this.startNodeAt(t, e),
										r = [],
										n = this.jsx_parseOpeningElementAt(t, e),
										s = null
									if (!n.selfClosing) {
										t: for (;;)
											switch (this.type) {
												case Wt.jsxTagStart:
													if (
														((t = this.start),
														(e = this.startLoc),
														this.next(),
														this.eat(Tt.slash))
													) {
														s = this.jsx_parseClosingElementAt(t, e)
														break t
													}
													r.push(this.jsx_parseElementAt(t, e))
													break
												case Wt.jsxText:
													r.push(this.parseExprAtom())
													break
												case Tt.braceL:
													r.push(this.jsx_parseExpressionContainer())
													break
												default:
													this.unexpected()
											}
										Xt(s.name) !== Xt(n.name) &&
											this.raise(
												s.start,
												"Expected corresponding JSX closing tag for <" +
													Xt(n.name) +
													">"
											)
									}
									let a = n.name ? "Element" : "Fragment"
									return (
										(i["opening" + a] = n),
										(i["closing" + a] = s),
										(i.children = r),
										this.type === Tt.relational &&
											"<" === this.value &&
											this.raise(
												this.start,
												"Adjacent JSX elements must be wrapped in an enclosing tag"
											),
										this.finishNode(i, "JSX" + a)
									)
								}
								jsx_parseText(t) {
									let e = this.parseLiteral(t)
									return (e.type = "JSXText"), e
								}
								jsx_parseElement() {
									let t = this.start,
										e = this.startLoc
									return this.next(), this.jsx_parseElementAt(t, e)
								}
								parseExprAtom(t) {
									return this.type === Wt.jsxText
										? this.jsx_parseText(this.value)
										: this.type === Wt.jsxTagStart
										? this.jsx_parseElement()
										: super.parseExprAtom(t)
								}
								readToken(t) {
									let e = this.curContext()
									if (e === zt) return this.jsx_readToken()
									if (e === Ut || e === qt) {
										if (Bt(t)) return this.jsx_readWord()
										if (62 == t)
											return ++this.pos, this.finishToken(Wt.jsxTagEnd)
										if ((34 === t || 39 === t) && e == Ut)
											return this.jsx_readString(t)
									}
									return 60 === t &&
										this.exprAllowed &&
										33 !== this.input.charCodeAt(this.pos + 1)
										? (++this.pos, this.finishToken(Wt.jsxTagStart))
										: super.readToken(t)
								}
								updateContext(t) {
									if (this.type == Tt.braceL) {
										var e = this.curContext()
										e == Ut
											? this.context.push(Vt.b_expr)
											: e == zt
											? this.context.push(Vt.b_tmpl)
											: super.updateContext(t),
											(this.exprAllowed = !0)
									} else {
										if (this.type !== Tt.slash || t !== Wt.jsxTagStart)
											return super.updateContext(t)
										;(this.context.length -= 2),
											this.context.push(qt),
											(this.exprAllowed = !1)
									}
								}
							}
						})(
							{
								allowNamespaces: !1 !== t.allowNamespaces,
								allowNamespacedObjects: !!t.allowNamespacedObjects
							},
							e
						)
					}
				)
			}
			Jt.tokTypes = Wt
			var Ht,
				Kt,
				Zt =
					((function (t, e) {
						Object.defineProperty(e, "__esModule", { value: !0 }),
							(e.DynamicImportKey = void 0)
						var i = (function () {
								function t(t, e) {
									for (var i = 0; i < e.length; i++) {
										var r = e[i]
										;(r.enumerable = r.enumerable || !1),
											(r.configurable = !0),
											"value" in r && (r.writable = !0),
											Object.defineProperty(t, r.key, r)
									}
								}
								return function (e, i, r) {
									return i && t(e.prototype, i), r && t(e, r), e
								}
							})(),
							r = function t(e, i, r) {
								null === e && (e = Function.prototype)
								var n = Object.getOwnPropertyDescriptor(e, i)
								if (void 0 === n) {
									var s = Object.getPrototypeOf(e)
									return null === s ? void 0 : t(s, i, r)
								}
								if ("value" in n) return n.value
								var a = n.get
								return void 0 !== a ? a.call(r) : void 0
							}
						e.default = function (t) {
							return (function (e) {
								function s() {
									return (
										(function (t, e) {
											if (!(t instanceof s))
												throw new TypeError("Cannot call a class as a function")
										})(this),
										(function (t, e) {
											if (!t)
												throw new ReferenceError(
													"this hasn't been initialised - super() hasn't been called"
												)
											return !e ||
												("object" != typeof e && "function" != typeof e)
												? t
												: e
										})(
											this,
											(s.__proto__ || Object.getPrototypeOf(s)).apply(
												this,
												arguments
											)
										)
									)
								}
								return (
									(function (t, e) {
										if ("function" != typeof e && null !== e)
											throw new TypeError(
												"Super expression must either be null or a function, not " +
													typeof e
											)
										;(t.prototype = Object.create(e && e.prototype, {
											constructor: {
												value: t,
												enumerable: !1,
												writable: !0,
												configurable: !0
											}
										})),
											e &&
												(Object.setPrototypeOf
													? Object.setPrototypeOf(t, e)
													: (t.__proto__ = e))
									})(s, t),
									i(s, [
										{
											key: "parseStatement",
											value: function (t, e, i) {
												return this.type === Ot.tokTypes._import &&
													function () {
														return /^(\s|\/\/.*|\/\*[^]*?\*\/)*\(/.test(
															this.input.slice(this.pos)
														)
													}.call(this)
													? this.parseExpressionStatement(
															this.startNode(),
															this.parseExpression()
													  )
													: r(
															s.prototype.__proto__ ||
																Object.getPrototypeOf(s.prototype),
															"parseStatement",
															this
													  ).call(this, t, e, i)
											}
										},
										{
											key: "parseExprAtom",
											value: function (t) {
												return this.type === Ot.tokTypes._import
													? function () {
															var t = this.startNode()
															return (
																this.next(),
																this.type !== Ot.tokTypes.parenL &&
																	this.unexpected(),
																this.finishNode(t, n)
															)
													  }.call(this)
													: r(
															s.prototype.__proto__ ||
																Object.getPrototypeOf(s.prototype),
															"parseExprAtom",
															this
													  ).call(this, t)
											}
										}
									]),
									s
								)
							})()
						}
						var n = (e.DynamicImportKey = "Import")
						Ot.tokTypes._import.startsExpr = !0
					})((Ht = { exports: {} }), Ht.exports),
					(Kt = Ht.exports) &&
					Kt.__esModule &&
					Object.prototype.hasOwnProperty.call(Kt, "default")
						? Kt.default
						: Kt)
			const Gt = /(?:\s|\/\/.*|\/\*[^]*?\*\/)*/g,
				Qt = Ot.tokTypes
			function $t(t) {
				if (this.eat(Qt.eq)) {
					const e = this._inFieldValue
					;(this._inFieldValue = !0),
						(t.value = this.parseExpression()),
						(this._inFieldValue = e)
				} else t.value = null
			}
			function Yt() {
				const t = this.startNode()
				return (
					(t.name = this.value),
					this.next(),
					this.finishNode(t, "PrivateName"),
					"never" == this.options.allowReserved && this.checkUnreserved(t),
					t
				)
			}
			const te = new (0, Ot.TokenType)("privateName")
			function ee(t) {
				var e = ""
				t = t < 0 ? (-t << 1) | 1 : t << 1
				do {
					var i = 31 & t
					;(t >>= 5) > 0 && (i |= 32),
						(e += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="[
							i
						])
				} while (t > 0)
				return e
			}
			var ie = function (t, e, i) {
				;(this.start = t),
					(this.end = e),
					(this.original = i),
					(this.intro = ""),
					(this.outro = ""),
					(this.content = i),
					(this.storeName = !1),
					(this.edited = !1),
					Object.defineProperties(this, {
						previous: { writable: !0, value: null },
						next: { writable: !0, value: null }
					})
			}
			;(ie.prototype.appendLeft = function (t) {
				this.outro += t
			}),
				(ie.prototype.appendRight = function (t) {
					this.intro = this.intro + t
				}),
				(ie.prototype.clone = function () {
					var t = new ie(this.start, this.end, this.original)
					return (
						(t.intro = this.intro),
						(t.outro = this.outro),
						(t.content = this.content),
						(t.storeName = this.storeName),
						(t.edited = this.edited),
						t
					)
				}),
				(ie.prototype.contains = function (t) {
					return this.start < t && t < this.end
				}),
				(ie.prototype.eachNext = function (t) {
					for (var e = this; e; ) t(e), (e = e.next)
				}),
				(ie.prototype.eachPrevious = function (t) {
					for (var e = this; e; ) t(e), (e = e.previous)
				}),
				(ie.prototype.edit = function (t, e, i) {
					return (
						(this.content = t),
						i || ((this.intro = ""), (this.outro = "")),
						(this.storeName = e),
						(this.edited = !0),
						this
					)
				}),
				(ie.prototype.prependLeft = function (t) {
					this.outro = t + this.outro
				}),
				(ie.prototype.prependRight = function (t) {
					this.intro = t + this.intro
				}),
				(ie.prototype.split = function (t) {
					var e = t - this.start,
						i = this.original.slice(0, e),
						r = this.original.slice(e)
					this.original = i
					var n = new ie(t, this.end, r)
					return (
						(n.outro = this.outro),
						(this.outro = ""),
						(this.end = t),
						this.edited
							? (n.edit("", !1), (this.content = ""))
							: (this.content = i),
						(n.next = this.next),
						n.next && (n.next.previous = n),
						(n.previous = this),
						(this.next = n),
						n
					)
				}),
				(ie.prototype.toString = function () {
					return this.intro + this.content + this.outro
				}),
				(ie.prototype.trimEnd = function (t) {
					if (((this.outro = this.outro.replace(t, "")), this.outro.length))
						return !0
					var e = this.content.replace(t, "")
					return e.length
						? (e !== this.content &&
								this.split(this.start + e.length).edit("", void 0, !0),
						  !0)
						: (this.edit("", void 0, !0),
						  (this.intro = this.intro.replace(t, "")),
						  !!this.intro.length || void 0)
				}),
				(ie.prototype.trimStart = function (t) {
					if (((this.intro = this.intro.replace(t, "")), this.intro.length))
						return !0
					var e = this.content.replace(t, "")
					return e.length
						? (e !== this.content &&
								(this.split(this.end - e.length), this.edit("", void 0, !0)),
						  !0)
						: (this.edit("", void 0, !0),
						  (this.outro = this.outro.replace(t, "")),
						  !!this.outro.length || void 0)
				})
			var re = function () {
				throw new Error(
					"Unsupported environment: `window.btoa` or `Buffer` should be supported."
				)
			}
			"undefined" != typeof window && "function" == typeof window.btoa
				? (re = function (t) {
						return window.btoa(unescape(encodeURIComponent(t)))
				  })
				: "function" == typeof Buffer &&
				  (re = function (t) {
						return Buffer.from(t, "utf-8").toString("base64")
				  })
			var ne = function (t) {
				;(this.version = 3),
					(this.file = t.file),
					(this.sources = t.sources),
					(this.sourcesContent = t.sourcesContent),
					(this.names = t.names),
					(this.mappings = (function (t) {
						for (
							var e = 0, i = 0, r = 0, n = 0, s = "", a = 0;
							a < t.length;
							a++
						) {
							var o = t[a]
							if ((a > 0 && (s += ";"), 0 !== o.length)) {
								for (var p = 0, h = [], c = 0, l = o; c < l.length; c++) {
									var u = l[c],
										d = ee(u[0] - p)
									;(p = u[0]),
										u.length > 1 &&
											((d += ee(u[1] - e) + ee(u[2] - i) + ee(u[3] - r)),
											(e = u[1]),
											(i = u[2]),
											(r = u[3])),
										5 === u.length && ((d += ee(u[4] - n)), (n = u[4])),
										h.push(d)
								}
								s += h.join(",")
							}
						}
						return s
					})(t.mappings))
			}
			function se(t) {
				var e = t.split("\n"),
					i = e.filter(function (t) {
						return /^\t+/.test(t)
					}),
					r = e.filter(function (t) {
						return /^ {2,}/.test(t)
					})
				if (0 === i.length && 0 === r.length) return null
				if (i.length >= r.length) return "\t"
				var n = r.reduce(function (t, e) {
					var i = /^ +/.exec(e)[0].length
					return Math.min(i, t)
				}, 1 / 0)
				return new Array(n + 1).join(" ")
			}
			function ae(t, e) {
				var i = t.split(/[\/\\]/),
					r = e.split(/[\/\\]/)
				for (i.pop(); i[0] === r[0]; ) i.shift(), r.shift()
				if (i.length) for (var n = i.length; n--; ) i[n] = ".."
				return i.concat(r).join("/")
			}
			;(ne.prototype.toString = function () {
				return JSON.stringify(this)
			}),
				(ne.prototype.toUrl = function () {
					return (
						"data:application/json;charset=utf-8;base64," + re(this.toString())
					)
				})
			var oe = Object.prototype.toString
			function pe(t) {
				for (var e = t.split("\n"), i = [], r = 0, n = 0; r < e.length; r++)
					i.push(n), (n += e[r].length + 1)
				return function (t) {
					for (var e = 0, r = i.length; e < r; ) {
						var n = (e + r) >> 1
						t < i[n] ? (r = n) : (e = n + 1)
					}
					var s = e - 1
					return { line: s, column: t - i[s] }
				}
			}
			var he = function (t) {
				;(this.hires = t),
					(this.generatedCodeLine = 0),
					(this.generatedCodeColumn = 0),
					(this.raw = []),
					(this.rawSegments = this.raw[this.generatedCodeLine] = []),
					(this.pending = null)
			}
			;(he.prototype.addEdit = function (t, e, i, r) {
				if (e.length) {
					var n = [this.generatedCodeColumn, t, i.line, i.column]
					r >= 0 && n.push(r), this.rawSegments.push(n)
				} else this.pending && this.rawSegments.push(this.pending)
				this.advance(e), (this.pending = null)
			}),
				(he.prototype.addUneditedChunk = function (t, e, i, r, n) {
					for (var s = e.start, a = !0; s < e.end; )
						(this.hires || a || n[s]) &&
							this.rawSegments.push([
								this.generatedCodeColumn,
								t,
								r.line,
								r.column
							]),
							"\n" === i[s]
								? ((r.line += 1),
								  (r.column = 0),
								  (this.generatedCodeLine += 1),
								  (this.raw[this.generatedCodeLine] = this.rawSegments = []),
								  (this.generatedCodeColumn = 0))
								: ((r.column += 1), (this.generatedCodeColumn += 1)),
							(s += 1),
							(a = !1)
					this.pending = [this.generatedCodeColumn, t, r.line, r.column]
				}),
				(he.prototype.advance = function (t) {
					if (t) {
						var e = t.split("\n")
						if (e.length > 1) {
							for (var i = 0; i < e.length - 1; i++)
								this.generatedCodeLine++,
									(this.raw[this.generatedCodeLine] = this.rawSegments = [])
							this.generatedCodeColumn = 0
						}
						this.generatedCodeColumn += e[e.length - 1].length
					}
				})
			var ce = "\n",
				le = { insertLeft: !1, insertRight: !1, storeName: !1 },
				ue = function (t, e) {
					void 0 === e && (e = {})
					var i = new ie(0, t.length, t)
					Object.defineProperties(this, {
						original: { writable: !0, value: t },
						outro: { writable: !0, value: "" },
						intro: { writable: !0, value: "" },
						firstChunk: { writable: !0, value: i },
						lastChunk: { writable: !0, value: i },
						lastSearchedChunk: { writable: !0, value: i },
						byStart: { writable: !0, value: {} },
						byEnd: { writable: !0, value: {} },
						filename: { writable: !0, value: e.filename },
						indentExclusionRanges: {
							writable: !0,
							value: e.indentExclusionRanges
						},
						sourcemapLocations: { writable: !0, value: {} },
						storedNames: { writable: !0, value: {} },
						indentStr: { writable: !0, value: se(t) }
					}),
						(this.byStart[0] = i),
						(this.byEnd[t.length] = i)
				}
			function de(t) {
				var e = {}
				return (
					Object.keys(t).forEach(function (i) {
						"parent" !== i &&
							"program" !== i &&
							"keys" !== i &&
							"__wrapped" !== i &&
							(e[i] = Array.isArray(t[i])
								? t[i].map(de)
								: t[i] && t[i].toJSON
								? t[i].toJSON()
								: t[i])
					}),
					e
				)
			}
			;(ue.prototype.addSourcemapLocation = function (t) {
				this.sourcemapLocations[t] = !0
			}),
				(ue.prototype.append = function (t) {
					if ("string" != typeof t)
						throw new TypeError("outro content must be a string")
					return (this.outro += t), this
				}),
				(ue.prototype.appendLeft = function (t, e) {
					if ("string" != typeof e)
						throw new TypeError("inserted content must be a string")
					this._split(t)
					var i = this.byEnd[t]
					return i ? i.appendLeft(e) : (this.intro += e), this
				}),
				(ue.prototype.appendRight = function (t, e) {
					if ("string" != typeof e)
						throw new TypeError("inserted content must be a string")
					this._split(t)
					var i = this.byStart[t]
					return i ? i.appendRight(e) : (this.outro += e), this
				}),
				(ue.prototype.clone = function () {
					for (
						var t = new ue(this.original, { filename: this.filename }),
							e = this.firstChunk,
							i = (t.firstChunk = t.lastSearchedChunk = e.clone());
						e;

					) {
						;(t.byStart[i.start] = i), (t.byEnd[i.end] = i)
						var r = e.next,
							n = r && r.clone()
						n && ((i.next = n), (n.previous = i), (i = n)), (e = r)
					}
					return (
						(t.lastChunk = i),
						this.indentExclusionRanges &&
							(t.indentExclusionRanges = this.indentExclusionRanges.slice()),
						Object.keys(this.sourcemapLocations).forEach(function (e) {
							t.sourcemapLocations[e] = !0
						}),
						t
					)
				}),
				(ue.prototype.generateDecodedMap = function (t) {
					var e = this
					t = t || {}
					var i = Object.keys(this.storedNames),
						r = new he(t.hires),
						n = pe(this.original)
					return (
						this.intro && r.advance(this.intro),
						this.firstChunk.eachNext(function (t) {
							var s = n(t.start)
							t.intro.length && r.advance(t.intro),
								t.edited
									? r.addEdit(
											0,
											t.content,
											s,
											t.storeName ? i.indexOf(t.original) : -1
									  )
									: r.addUneditedChunk(
											0,
											t,
											e.original,
											s,
											e.sourcemapLocations
									  ),
								t.outro.length && r.advance(t.outro)
						}),
						{
							file: t.file ? t.file.split(/[\/\\]/).pop() : null,
							sources: [t.source ? ae(t.file || "", t.source) : null],
							sourcesContent: t.includeContent ? [this.original] : [null],
							names: i,
							mappings: r.raw
						}
					)
				}),
				(ue.prototype.generateMap = function (t) {
					return new ne(this.generateDecodedMap(t))
				}),
				(ue.prototype.getIndentString = function () {
					return null === this.indentStr ? "\t" : this.indentStr
				}),
				(ue.prototype.indent = function (t, e) {
					var i = /^[^\r\n]/gm
					if (
						("[object Object]" === oe.call(t) && ((e = t), (t = void 0)),
						"" === (t = void 0 !== t ? t : this.indentStr || "\t"))
					)
						return this
					var r = {}
					;(e = e || {}).exclude &&
						("number" == typeof e.exclude[0] ? [e.exclude] : e.exclude).forEach(
							function (t) {
								for (var e = t[0]; e < t[1]; e += 1) r[e] = !0
							}
						)
					var n = !1 !== e.indentStart,
						s = function (e) {
							return n ? "" + t + e : ((n = !0), e)
						}
					this.intro = this.intro.replace(i, s)
					for (var a = 0, o = this.firstChunk; o; ) {
						var p = o.end
						if (o.edited)
							r[a] ||
								((o.content = o.content.replace(i, s)),
								o.content.length &&
									(n = "\n" === o.content[o.content.length - 1]))
						else
							for (a = o.start; a < p; ) {
								if (!r[a]) {
									var h = this.original[a]
									"\n" === h
										? (n = !0)
										: "\r" !== h &&
										  n &&
										  ((n = !1),
										  a === o.start
												? o.prependRight(t)
												: (this._splitChunk(o, a),
												  (o = o.next).prependRight(t)))
								}
								a += 1
							}
						;(a = o.end), (o = o.next)
					}
					return (this.outro = this.outro.replace(i, s)), this
				}),
				(ue.prototype.insert = function () {
					throw new Error(
						"magicString.insert(...) is deprecated. Use prependRight(...) or appendLeft(...)"
					)
				}),
				(ue.prototype.insertLeft = function (t, e) {
					return (
						le.insertLeft ||
							(console.warn(
								"magicString.insertLeft(...) is deprecated. Use magicString.appendLeft(...) instead"
							),
							(le.insertLeft = !0)),
						this.appendLeft(t, e)
					)
				}),
				(ue.prototype.insertRight = function (t, e) {
					return (
						le.insertRight ||
							(console.warn(
								"magicString.insertRight(...) is deprecated. Use magicString.prependRight(...) instead"
							),
							(le.insertRight = !0)),
						this.prependRight(t, e)
					)
				}),
				(ue.prototype.move = function (t, e, i) {
					if (i >= t && i <= e)
						throw new Error("Cannot move a selection inside itself")
					this._split(t), this._split(e), this._split(i)
					var r = this.byStart[t],
						n = this.byEnd[e],
						s = r.previous,
						a = n.next,
						o = this.byStart[i]
					if (!o && n === this.lastChunk) return this
					var p = o ? o.previous : this.lastChunk
					return (
						s && (s.next = a),
						a && (a.previous = s),
						p && (p.next = r),
						o && (o.previous = n),
						r.previous || (this.firstChunk = n.next),
						n.next ||
							((this.lastChunk = r.previous), (this.lastChunk.next = null)),
						(r.previous = p),
						(n.next = o || null),
						p || (this.firstChunk = r),
						o || (this.lastChunk = n),
						this
					)
				}),
				(ue.prototype.overwrite = function (t, e, i, r) {
					if ("string" != typeof i)
						throw new TypeError("replacement content must be a string")
					for (; t < 0; ) t += this.original.length
					for (; e < 0; ) e += this.original.length
					if (e > this.original.length) throw new Error("end is out of bounds")
					if (t === e)
						throw new Error(
							"Cannot overwrite a zero-length range \u2013 use appendLeft or prependRight instead"
						)
					this._split(t),
						this._split(e),
						!0 === r &&
							(le.storeName ||
								(console.warn(
									"The final argument to magicString.overwrite(...) should be an options object. See https://github.com/rich-harris/magic-string"
								),
								(le.storeName = !0)),
							(r = { storeName: !0 }))
					var n = void 0 !== r && r.storeName,
						s = void 0 !== r && r.contentOnly
					if (n) {
						var a = this.original.slice(t, e)
						this.storedNames[a] = !0
					}
					var o = this.byStart[t],
						p = this.byEnd[e]
					if (o) {
						if (e > o.end && o.next !== this.byStart[o.end])
							throw new Error("Cannot overwrite across a split point")
						if ((o.edit(i, n, s), o !== p)) {
							for (var h = o.next; h !== p; ) h.edit("", !1), (h = h.next)
							h.edit("", !1)
						}
					} else {
						var c = new ie(t, e, "").edit(i, n)
						;(p.next = c), (c.previous = p)
					}
					return this
				}),
				(ue.prototype.prepend = function (t) {
					if ("string" != typeof t)
						throw new TypeError("outro content must be a string")
					return (this.intro = t + this.intro), this
				}),
				(ue.prototype.prependLeft = function (t, e) {
					if ("string" != typeof e)
						throw new TypeError("inserted content must be a string")
					this._split(t)
					var i = this.byEnd[t]
					return i ? i.prependLeft(e) : (this.intro = e + this.intro), this
				}),
				(ue.prototype.prependRight = function (t, e) {
					if ("string" != typeof e)
						throw new TypeError("inserted content must be a string")
					this._split(t)
					var i = this.byStart[t]
					return i ? i.prependRight(e) : (this.outro = e + this.outro), this
				}),
				(ue.prototype.remove = function (t, e) {
					for (; t < 0; ) t += this.original.length
					for (; e < 0; ) e += this.original.length
					if (t === e) return this
					if (t < 0 || e > this.original.length)
						throw new Error("Character is out of bounds")
					if (t > e) throw new Error("end must be greater than start")
					this._split(t), this._split(e)
					for (var i = this.byStart[t]; i; )
						(i.intro = ""),
							(i.outro = ""),
							i.edit(""),
							(i = e > i.end ? this.byStart[i.end] : null)
					return this
				}),
				(ue.prototype.lastChar = function () {
					if (this.outro.length) return this.outro[this.outro.length - 1]
					var t = this.lastChunk
					do {
						if (t.outro.length) return t.outro[t.outro.length - 1]
						if (t.content.length) return t.content[t.content.length - 1]
						if (t.intro.length) return t.intro[t.intro.length - 1]
					} while ((t = t.previous))
					return this.intro.length ? this.intro[this.intro.length - 1] : ""
				}),
				(ue.prototype.lastLine = function () {
					var t = this.outro.lastIndexOf(ce)
					if (-1 !== t) return this.outro.substr(t + 1)
					var e = this.outro,
						i = this.lastChunk
					do {
						if (i.outro.length > 0) {
							if (-1 !== (t = i.outro.lastIndexOf(ce)))
								return i.outro.substr(t + 1) + e
							e = i.outro + e
						}
						if (i.content.length > 0) {
							if (-1 !== (t = i.content.lastIndexOf(ce)))
								return i.content.substr(t + 1) + e
							e = i.content + e
						}
						if (i.intro.length > 0) {
							if (-1 !== (t = i.intro.lastIndexOf(ce)))
								return i.intro.substr(t + 1) + e
							e = i.intro + e
						}
					} while ((i = i.previous))
					return -1 !== (t = this.intro.lastIndexOf(ce))
						? this.intro.substr(t + 1) + e
						: this.intro + e
				}),
				(ue.prototype.slice = function (t, e) {
					for (
						void 0 === t && (t = 0), void 0 === e && (e = this.original.length);
						t < 0;

					)
						t += this.original.length
					for (; e < 0; ) e += this.original.length
					for (
						var i = "", r = this.firstChunk;
						r && (r.start > t || r.end <= t);

					) {
						if (r.start < e && r.end >= e) return i
						r = r.next
					}
					if (r && r.edited && r.start !== t)
						throw new Error(
							"Cannot use replaced character " + t + " as slice start anchor."
						)
					for (var n = r; r; ) {
						!r.intro || (n === r && r.start !== t) || (i += r.intro)
						var s = r.start < e && r.end >= e
						if (s && r.edited && r.end !== e)
							throw new Error(
								"Cannot use replaced character " + e + " as slice end anchor."
							)
						if (
							((i += r.content.slice(
								n === r ? t - r.start : 0,
								s ? r.content.length + e - r.end : r.content.length
							)),
							!r.outro || (s && r.end !== e) || (i += r.outro),
							s)
						)
							break
						r = r.next
					}
					return i
				}),
				(ue.prototype.snip = function (t, e) {
					var i = this.clone()
					return i.remove(0, t), i.remove(e, i.original.length), i
				}),
				(ue.prototype._split = function (t) {
					if (!this.byStart[t] && !this.byEnd[t])
						for (var e = this.lastSearchedChunk, i = t > e.end; e; ) {
							if (e.contains(t)) return this._splitChunk(e, t)
							e = i ? this.byStart[e.end] : this.byEnd[e.start]
						}
				}),
				(ue.prototype._splitChunk = function (t, e) {
					if (t.edited && t.content.length) {
						var i = pe(this.original)(e)
						throw new Error(
							"Cannot split a chunk that has already been edited (" +
								i.line +
								":" +
								i.column +
								' \u2013 "' +
								t.original +
								'")'
						)
					}
					var r = t.split(e)
					return (
						(this.byEnd[e] = t),
						(this.byStart[e] = r),
						(this.byEnd[r.end] = r),
						t === this.lastChunk && (this.lastChunk = r),
						(this.lastSearchedChunk = t),
						!0
					)
				}),
				(ue.prototype.toString = function () {
					for (var t = this.intro, e = this.firstChunk; e; )
						(t += e.toString()), (e = e.next)
					return t + this.outro
				}),
				(ue.prototype.isEmpty = function () {
					var t = this.firstChunk
					do {
						if (
							(t.intro.length && t.intro.trim()) ||
							(t.content.length && t.content.trim()) ||
							(t.outro.length && t.outro.trim())
						)
							return !1
					} while ((t = t.next))
					return !0
				}),
				(ue.prototype.length = function () {
					var t = this.firstChunk,
						e = 0
					do {
						e += t.intro.length + t.content.length + t.outro.length
					} while ((t = t.next))
					return e
				}),
				(ue.prototype.trimLines = function () {
					return this.trim("[\\r\\n]")
				}),
				(ue.prototype.trim = function (t) {
					return this.trimStart(t).trimEnd(t)
				}),
				(ue.prototype.trimEndAborted = function (t) {
					var e = new RegExp((t || "\\s") + "+$")
					if (((this.outro = this.outro.replace(e, "")), this.outro.length))
						return !0
					var i = this.lastChunk
					do {
						var r = i.end,
							n = i.trimEnd(e)
						if (
							(i.end !== r &&
								(this.lastChunk === i && (this.lastChunk = i.next),
								(this.byEnd[i.end] = i),
								(this.byStart[i.next.start] = i.next),
								(this.byEnd[i.next.end] = i.next)),
							n)
						)
							return !0
						i = i.previous
					} while (i)
					return !1
				}),
				(ue.prototype.trimEnd = function (t) {
					return this.trimEndAborted(t), this
				}),
				(ue.prototype.trimStartAborted = function (t) {
					var e = new RegExp("^" + (t || "\\s") + "+")
					if (((this.intro = this.intro.replace(e, "")), this.intro.length))
						return !0
					var i = this.firstChunk
					do {
						var r = i.end,
							n = i.trimStart(e)
						if (
							(i.end !== r &&
								(i === this.lastChunk && (this.lastChunk = i.next),
								(this.byEnd[i.end] = i),
								(this.byStart[i.next.start] = i.next),
								(this.byEnd[i.next.end] = i.next)),
							n)
						)
							return !0
						i = i.next
					} while (i)
					return !1
				}),
				(ue.prototype.trimStart = function (t) {
					return this.trimStartAborted(t), this
				})
			var fe = function () {}
			function me(t) {
				var e = []
				return ye[t.type](e, t), e
			}
			;(fe.prototype.ancestor = function (t) {
				for (var e = this; t--; ) if (!(e = e.parent)) return null
				return e
			}),
				(fe.prototype.contains = function (t) {
					for (; t; ) {
						if (t === this) return !0
						t = t.parent
					}
					return !1
				}),
				(fe.prototype.findLexicalBoundary = function () {
					return this.parent.findLexicalBoundary()
				}),
				(fe.prototype.findNearest = function (t) {
					return (
						"string" == typeof t && (t = new RegExp("^" + t + "$")),
						t.test(this.type) ? this : this.parent.findNearest(t)
					)
				}),
				(fe.prototype.unparenthesizedParent = function () {
					for (var t = this.parent; t && "ParenthesizedExpression" === t.type; )
						t = t.parent
					return t
				}),
				(fe.prototype.unparenthesize = function () {
					for (var t = this; "ParenthesizedExpression" === t.type; )
						t = t.expression
					return t
				}),
				(fe.prototype.findScope = function (t) {
					return this.parent.findScope(t)
				}),
				(fe.prototype.getIndentation = function () {
					return this.parent.getIndentation()
				}),
				(fe.prototype.initialise = function (t) {
					for (var e = 0, i = this.keys; e < i.length; e += 1) {
						var r = this[i[e]]
						Array.isArray(r)
							? r.forEach(function (e) {
									return e && e.initialise(t)
							  })
							: r && "object" == typeof r && r.initialise(t)
					}
				}),
				(fe.prototype.toJSON = function () {
					return de(this)
				}),
				(fe.prototype.toString = function () {
					return this.program.magicString.original.slice(this.start, this.end)
				}),
				(fe.prototype.transpile = function (t, e) {
					for (var i = 0, r = this.keys; i < r.length; i += 1) {
						var n = this[r[i]]
						Array.isArray(n)
							? n.forEach(function (i) {
									return i && i.transpile(t, e)
							  })
							: n && "object" == typeof n && n.transpile(t, e)
					}
				})
			var ye = {
					Identifier: function (t, e) {
						t.push(e)
					},
					ObjectPattern: function (t, e) {
						for (var i = 0, r = e.properties; i < r.length; i += 1) {
							var n = r[i]
							ye[n.type](t, n)
						}
					},
					Property: function (t, e) {
						ye[e.value.type](t, e.value)
					},
					ArrayPattern: function (t, e) {
						for (var i = 0, r = e.elements; i < r.length; i += 1) {
							var n = r[i]
							n && ye[n.type](t, n)
						}
					},
					RestElement: function (t, e) {
						ye[e.argument.type](t, e.argument)
					},
					AssignmentPattern: function (t, e) {
						ye[e.left.type](t, e.left)
					}
				},
				ge = Object.create(null)
			function ve(t) {
				;(this.parent = (t = t || {}).parent),
					(this.isBlockScope = !!t.block),
					(this.createDeclarationCallback = t.declare)
				for (var e = this; e.isBlockScope; ) e = e.parent
				;(this.functionScope = e),
					(this.identifiers = []),
					(this.declarations = Object.create(null)),
					(this.references = Object.create(null)),
					(this.blockScopedDeclarations = this.isBlockScope
						? null
						: Object.create(null)),
					(this.aliases = Object.create(null))
			}
			function xe(t, e) {
				for (var i = ""; e--; ) i += t
				return i
			}
			function be(t, e, i) {
				void 0 === i && (i = 1)
				var r = Math.max(e.line - 5, 0),
					n = e.line,
					s = String(n).length,
					a = t.split("\n").slice(r, n),
					o = a[a.length - 1].slice(0, e.column).replace(/\t/g, "  ").length
				return (
					a
						.map(function (t, e) {
							return (
								(i = s),
								(n = String(e + r + 1)) +
									xe(" ", i - n.length) +
									" : " +
									t.replace(/\t/g, "  ")
							)
							var i, n
						})
						.join("\n") +
					"\n" +
					xe(" ", s + 3 + o) +
					xe("^", i)
				)
			}
			"do if in for let new try var case else enum eval null this true void with await break catch class const false super throw while yield delete export import public return static switch typeof default extends finally package private continue debugger function arguments interface protected implements instanceof"
				.split(" ")
				.forEach(function (t) {
					return (ge[t] = !0)
				}),
				(ve.prototype = {
					addDeclaration: function (t, e) {
						for (var i = 0, r = me(t); i < r.length; i += 1) {
							var n = r[i],
								s = n.name,
								a = { name: s, node: n, kind: e, instances: [] }
							;(this.declarations[s] = a),
								this.isBlockScope &&
									(this.functionScope.blockScopedDeclarations[s] ||
										(this.functionScope.blockScopedDeclarations[s] = []),
									this.functionScope.blockScopedDeclarations[s].push(a))
						}
					},
					addReference: function (t) {
						this.consolidated
							? this.consolidateReference(t)
							: this.identifiers.push(t)
					},
					consolidate: function () {
						for (var t = 0; t < this.identifiers.length; t += 1)
							this.consolidateReference(this.identifiers[t])
						this.consolidated = !0
					},
					consolidateReference: function (t) {
						var e = this.declarations[t.name]
						e
							? e.instances.push(t)
							: ((this.references[t.name] = !0),
							  this.parent && this.parent.addReference(t))
					},
					contains: function (t) {
						return (
							this.declarations[t] || (!!this.parent && this.parent.contains(t))
						)
					},
					createIdentifier: function (t) {
						"number" == typeof t && (t = t.toString())
						for (
							var e = (t = t
									.replace(/\s/g, "")
									.replace(/\[([^\]]+)\]/g, "_$1")
									.replace(/[^a-zA-Z0-9_$]/g, "_")
									.replace(/_{2,}/, "_")),
								i = 1;
							this.declarations[e] ||
							this.references[e] ||
							this.aliases[e] ||
							e in ge;

						)
							e = t + "$" + i++
						return (this.aliases[e] = !0), e
					},
					createDeclaration: function (t) {
						var e = this.createIdentifier(t)
						return this.createDeclarationCallback(e), e
					},
					findDeclaration: function (t) {
						return (
							this.declarations[t] ||
							(this.parent && this.parent.findDeclaration(t))
						)
					},
					resolveName: function (t) {
						var e = this.findDeclaration(t)
						return e ? e.name : t
					}
				})
			var _e = (function (t) {
				function e(e, i) {
					if ((t.call(this, e), (this.name = "CompileError"), i)) {
						var r = i.program.magicString.original,
							n = (function (t, e) {
								var i,
									r = t.split("\n"),
									n = r.length,
									s = 0
								for (i = 0; i < n; i += 1) {
									var a = s + r[i].length + 1
									if (a > e) return { line: i + 1, column: e - s, char: i }
									s = a
								}
								throw new Error("Could not determine location of character")
							})(r, i.start)
						;(this.message = e + " (" + n.line + ":" + n.column + ")"),
							(this.stack = new t().stack.replace(
								new RegExp(".+new " + this.name + ".+\\n", "m"),
								""
							)),
							(this.loc = n),
							(this.snippet = be(r, n, i.end - i.start))
					}
				}
				return (
					t && (e.__proto__ = t),
					((e.prototype = Object.create(t && t.prototype)).constructor = e),
					(e.prototype.toString = function () {
						return this.name + ": " + this.message + "\n" + this.snippet
					}),
					(e.missingTransform = function (t, i, r, n) {
						throw (
							(void 0 === n && (n = null),
							new e(
								"Transforming " +
									t +
									" is not " +
									(n ? "fully supported" : "implemented") +
									". Use `transforms: { " +
									i +
									": false }` to skip transformation and disable this error" +
									(n
										? ", or `transforms: { " +
										  n +
										  ": true }` if you know what you're doing"
										: "") +
									".",
								r
							))
						)
					}),
					e
				)
			})(Error)
			function ke(t, e) {
				for (var i = 0; i < t.length; i += 1) if (e(t[i], i)) return i
				return -1
			}
			var Se = {
				Identifier: Ee,
				AssignmentPattern: function (t, e, i, r, n, s, a) {
					var o = "Identifier" === r.left.type,
						p = o ? r.left.name : n
					s ||
						a.push(function (e, i, n) {
							t.prependRight(
								r.left.end,
								i + "if ( " + p + " === void 0 ) " + p
							),
								t.move(r.left.end, r.right.end, e),
								t.appendLeft(r.right.end, n)
						}),
						o || we(t, e, i, r.left, n, s, a)
				},
				ArrayPattern: function (t, e, i, r, n, s, a) {
					var o = r.start
					r.elements.forEach(function (r, p) {
						r &&
							("RestElement" === r.type
								? Ae(t, e, i, o, r.argument, n + ".slice(" + p + ")", s, a)
								: Ae(t, e, i, o, r, n + "[" + p + "]", s, a),
							(o = r.end))
					}),
						t.remove(o, r.end)
				},
				ObjectPattern: Ce
			}
			function we(t, e, i, r, n, s, a) {
				Se[r.type](t, e, i, r, n, s, a)
			}
			function Ee(t, e, i, r, n, s, a) {
				a.push(function (e, a, o) {
					t.overwrite(
						r.start,
						r.end,
						(s ? a : a + "var ") + i(r) + " = " + n + o
					),
						t.move(r.start, r.end, e)
				})
			}
			function Ce(t, e, i, r, n, s, a) {
				var o = this,
					p = r.start,
					h = []
				r.properties.forEach(function (r) {
					var c, l
					if ("Property" === r.type)
						if (((l = r.value), r.computed || "Identifier" !== r.key.type))
							if (r.computed || "Literal" !== r.key.type) {
								var u = t.slice(r.key.start, r.key.end)
								;(c = n + "[" + u + "]"), h.push("String(" + u + ")")
							} else
								(c = n + "[" + r.key.raw + "]"),
									h.push(JSON.stringify(String(r.key.value)))
						else (c = n + "." + r.key.name), h.push('"' + r.key.name + '"')
					else {
						if ("RestElement" !== r.type)
							throw new _e(
								o,
								"Unexpected node of type " + r.type + " in object pattern"
							)
						;(l = r.argument),
							(c = e("rest")),
							a.push(function (e, i, a) {
								var o = r.program.getObjectWithoutPropertiesHelper(t)
								t.overwrite(
									r.start,
									(p = r.argument.start),
									(s ? i : i + "var ") +
										c +
										" = " +
										o +
										"( " +
										n +
										", [" +
										h.join(", ") +
										"] )" +
										a
								),
									t.move(r.start, p, e)
							})
					}
					Ae(t, e, i, p, l, c, s, a), (p = r.end)
				}),
					t.remove(p, r.end)
			}
			function Ae(t, e, i, r, n, s, a, o) {
				switch (n.type) {
					case "Identifier":
						t.remove(r, n.start), Ee(t, 0, i, n, s, a, o)
						break
					case "MemberExpression":
						t.remove(r, n.start),
							(function (t, e, i, r, n, s, a) {
								a.push(function (e, i, s) {
									t.prependRight(r.start, i),
										t.appendLeft(r.end, " = " + n + s),
										t.move(r.start, r.end, e)
								})
							})(t, 0, 0, n, s, 0, o)
						break
					case "AssignmentPattern":
						var p,
							h = "Identifier" === n.left.type
						;(p = h ? i(n.left) : e(s)),
							o.push(function (e, i, r) {
								a
									? (t.prependRight(
											n.right.start,
											p + " = " + s + ", " + p + " = " + p + " === void 0 ? "
									  ),
									  t.appendLeft(n.right.end, " : " + p + r))
									: (t.prependRight(
											n.right.start,
											i +
												"var " +
												p +
												" = " +
												s +
												"; if ( " +
												p +
												" === void 0 ) " +
												p +
												" = "
									  ),
									  t.appendLeft(n.right.end, r)),
									t.move(n.right.start, n.right.end, e)
							}),
							h
								? t.remove(r, n.right.start)
								: (t.remove(r, n.left.start),
								  t.remove(n.left.end, n.right.start),
								  Ae(t, e, i, r, n.left, p, a, o))
						break
					case "ObjectPattern":
						t.remove(r, (r = n.start))
						var c = s
						n.properties.length > 1 &&
							((c = e(s)),
							o.push(function (e, i, o) {
								t.prependRight(n.start, (a ? "" : i + "var ") + c + " = "),
									t.overwrite(n.start, (r = n.start + 1), s),
									t.appendLeft(r, o),
									t.overwrite(
										n.start,
										(r = n.start + 1),
										(a ? "" : i + "var ") + c + " = " + s + o
									),
									t.move(n.start, r, e)
							})),
							Ce(t, e, i, n, c, a, o)
						break
					case "ArrayPattern":
						if (
							(t.remove(r, (r = n.start)),
							n.elements.filter(Boolean).length > 1)
						) {
							var l = e(s)
							o.push(function (e, i, o) {
								t.prependRight(n.start, (a ? "" : i + "var ") + l + " = "),
									t.overwrite(n.start, (r = n.start + 1), s, {
										contentOnly: !0
									}),
									t.appendLeft(r, o),
									t.move(n.start, r, e)
							}),
								n.elements.forEach(function (n, s) {
									n &&
										("RestElement" === n.type
											? Ae(
													t,
													e,
													i,
													r,
													n.argument,
													l + ".slice(" + s + ")",
													a,
													o
											  )
											: Ae(t, e, i, r, n, l + "[" + s + "]", a, o),
										(r = n.end))
								})
						} else {
							var u = ke(n.elements, Boolean),
								d = n.elements[u]
							"RestElement" === d.type
								? Ae(t, e, i, r, d.argument, s + ".slice(" + u + ")", a, o)
								: Ae(t, e, i, r, d, s + "[" + u + "]", a, o),
								(r = d.end)
						}
						t.remove(r, n.end)
						break
					default:
						throw new Error(
							"Unexpected node type in destructuring (" + n.type + ")"
						)
				}
			}
			var Ie = (function (t) {
				function e() {
					t.apply(this, arguments)
				}
				return (
					t && (e.__proto__ = t),
					((e.prototype = Object.create(t && t.prototype)).constructor = e),
					(e.prototype.createScope = function () {
						var t = this
						;(this.parentIsFunction = /Function/.test(this.parent.type)),
							(this.isFunctionBlock =
								this.parentIsFunction || "Root" === this.parent.type),
							(this.scope = new ve({
								block: !this.isFunctionBlock,
								parent: this.parent.findScope(!1),
								declare: function (e) {
									return t.createdDeclarations.push(e)
								}
							})),
							this.parentIsFunction &&
								this.parent.params.forEach(function (e) {
									t.scope.addDeclaration(e, "param")
								})
					}),
					(e.prototype.initialise = function (t) {
						;(this.thisAlias = null),
							(this.argumentsAlias = null),
							(this.defaultParameters = []),
							(this.createdDeclarations = []),
							this.scope || this.createScope(),
							this.body.forEach(function (e) {
								return e.initialise(t)
							}),
							this.scope.consolidate()
					}),
					(e.prototype.findLexicalBoundary = function () {
						return "Program" === this.type || /^Function/.test(this.parent.type)
							? this
							: this.parent.findLexicalBoundary()
					}),
					(e.prototype.findScope = function (t) {
						return t && !this.isFunctionBlock
							? this.parent.findScope(t)
							: this.scope
					}),
					(e.prototype.getArgumentsAlias = function () {
						return (
							this.argumentsAlias ||
								(this.argumentsAlias = this.scope.createIdentifier(
									"arguments"
								)),
							this.argumentsAlias
						)
					}),
					(e.prototype.getArgumentsArrayAlias = function () {
						return (
							this.argumentsArrayAlias ||
								(this.argumentsArrayAlias = this.scope.createIdentifier(
									"argsArray"
								)),
							this.argumentsArrayAlias
						)
					}),
					(e.prototype.getThisAlias = function () {
						return (
							this.thisAlias ||
								(this.thisAlias = this.scope.createIdentifier("this")),
							this.thisAlias
						)
					}),
					(e.prototype.getIndentation = function () {
						if (void 0 === this.indentation) {
							for (
								var t = this.program.magicString.original,
									e = this.synthetic || !this.body.length,
									i = e ? this.start : this.body[0].start;
								i && "\n" !== t[i];

							)
								i -= 1
							for (this.indentation = ""; ; ) {
								var r = t[(i += 1)]
								if (" " !== r && "\t" !== r) break
								this.indentation += r
							}
							for (
								var n = this.program.magicString.getIndentString(),
									s = this.parent;
								s;

							)
								"constructor" !== s.kind ||
									s.parent.parent.superClass ||
									(this.indentation = this.indentation.replace(n, "")),
									(s = s.parent)
							e && (this.indentation += n)
						}
						return this.indentation
					}),
					(e.prototype.transpile = function (e, i) {
						var r,
							n,
							s = this,
							a = this.getIndentation(),
							o = []
						if (
							(this.argumentsAlias &&
								o.push(function (t, i, r) {
									e.appendLeft(
										t,
										i + "var " + s.argumentsAlias + " = arguments" + r
									)
								}),
							this.thisAlias &&
								o.push(function (t, i, r) {
									e.appendLeft(t, i + "var " + s.thisAlias + " = this" + r)
								}),
							this.argumentsArrayAlias &&
								o.push(function (t, i, r) {
									var n = s.scope.createIdentifier("i")
									e.appendLeft(
										t,
										i +
											"var " +
											n +
											" = arguments.length, " +
											s.argumentsArrayAlias +
											" = Array(" +
											n +
											");\n" +
											a +
											"while ( " +
											n +
											"-- ) " +
											s.argumentsArrayAlias +
											"[" +
											n +
											"] = arguments[" +
											n +
											"]" +
											r
									)
								}),
							/Function/.test(this.parent.type)
								? this.transpileParameters(this.parent.params, e, i, a, o)
								: "CatchClause" === this.parent.type &&
								  this.transpileParameters([this.parent.param], e, i, a, o),
							i.letConst &&
								this.isFunctionBlock &&
								this.transpileBlockScopedIdentifiers(e),
							t.prototype.transpile.call(this, e, i),
							this.createdDeclarations.length &&
								o.push(function (t, i, r) {
									var n = i + "var " + s.createdDeclarations.join(", ") + r
									e.appendLeft(t, n)
								}),
							this.synthetic)
						)
							if ("ArrowFunctionExpression" === this.parent.type) {
								var p = this.body[0]
								o.length
									? (e
											.appendLeft(this.start, "{")
											.prependRight(
												this.end,
												this.parent.getIndentation() + "}"
											),
									  e.prependRight(p.start, "\n" + a + "return "),
									  e.appendLeft(p.end, ";\n"))
									: i.arrow &&
									  (e.prependRight(p.start, "{ return "),
									  e.appendLeft(p.end, "; }"))
							} else
								o.length &&
									e.prependRight(this.start, "{").appendLeft(this.end, "}")
						r =
							(n = this.body[0]) &&
							"ExpressionStatement" === n.type &&
							"Literal" === n.expression.type &&
							"use strict" === n.expression.value
								? this.body[0].end
								: this.synthetic || "Root" === this.parent.type
								? this.start
								: this.start + 1
						var h = "\n" + a,
							c = ";"
						o.forEach(function (t, e) {
							e === o.length - 1 && (c = ";\n"), t(r, h, c)
						})
					}),
					(e.prototype.transpileParameters = function (t, e, i, r, n) {
						var s = this
						t.forEach(function (a) {
							if (
								"AssignmentPattern" === a.type &&
								"Identifier" === a.left.type
							)
								i.defaultParameter &&
									n.push(function (t, i, r) {
										e.prependRight(
											a.left.end,
											i + "if ( " + a.left.name + " === void 0 ) " + a.left.name
										)
											.move(a.left.end, a.right.end, t)
											.appendLeft(a.right.end, r)
									})
							else if ("RestElement" === a.type)
								i.spreadRest &&
									n.push(function (i, n, o) {
										var p = t[t.length - 2]
										if (p) e.remove(p ? p.end : a.start, a.end)
										else {
											for (
												var h = a.start, c = a.end;
												/\s/.test(e.original[h - 1]);

											)
												h -= 1
											for (; /\s/.test(e.original[c]); ) c += 1
											e.remove(h, c)
										}
										var l = a.argument.name,
											u = s.scope.createIdentifier("len"),
											d = t.length - 1
										e.prependRight(
											i,
											d
												? n +
														"var " +
														l +
														" = [], " +
														u +
														" = arguments.length - " +
														d +
														";\n" +
														r +
														"while ( " +
														u +
														"-- > 0 ) " +
														l +
														"[ " +
														u +
														" ] = arguments[ " +
														u +
														" + " +
														d +
														" ]" +
														o
												: n +
														"var " +
														l +
														" = [], " +
														u +
														" = arguments.length;\n" +
														r +
														"while ( " +
														u +
														"-- ) " +
														l +
														"[ " +
														u +
														" ] = arguments[ " +
														u +
														" ]" +
														o
										)
									})
							else if ("Identifier" !== a.type && i.parameterDestructuring) {
								var o = s.scope.createIdentifier("ref")
								we(
									e,
									function (t) {
										return s.scope.createIdentifier(t)
									},
									function (t) {
										return s.scope.resolveName(t.name)
									},
									a,
									o,
									!1,
									n
								),
									e.prependRight(a.start, o)
							}
						})
					}),
					(e.prototype.transpileBlockScopedIdentifiers = function (t) {
						var e = this
						Object.keys(this.scope.blockScopedDeclarations).forEach(function (
							i
						) {
							for (
								var r = 0, n = e.scope.blockScopedDeclarations[i];
								r < n.length;
								r += 1
							) {
								var s = n[r],
									a = !1
								if ("for.let" === s.kind) {
									var o = s.node.findNearest("ForStatement")
									if (o.shouldRewriteAsFunction) {
										var p = e.scope.createIdentifier(i),
											h = o.reassigned[i] ? e.scope.createIdentifier(i) : i
										;(s.name = p),
											t.overwrite(s.node.start, s.node.end, p, {
												storeName: !0
											}),
											(o.aliases[i] = { outer: p, inner: h })
										for (var c = 0, l = s.instances; c < l.length; c += 1) {
											var u = l[c],
												d = o.body.contains(u) ? h : p
											i !== d &&
												t.overwrite(u.start, u.end, d, { storeName: !0 })
										}
										a = !0
									}
								}
								if (!a) {
									var f = e.scope.createIdentifier(i)
									if (i !== f) {
										;(s.name = f),
											t.overwrite(s.node.start, s.node.end, f, {
												storeName: !0
											})
										for (var m = 0, y = s.instances; m < y.length; m += 1) {
											var g = y[m]
											;(g.rewritten = !0),
												t.overwrite(g.start, g.end, f, { storeName: !0 })
										}
									}
								}
							}
						})
					}),
					e
				)
			})(fe)
			function Pe(t) {
				return "Identifier" === t.type && "arguments" === t.name
			}
			function Le(t, e, i) {
				for (var r = i.length; r--; ) {
					var n = i[r]
					if (n && "SpreadElement" === n.type) {
						var s = n.argument
						if ("ArrayExpression" === s.type) {
							var a = s.elements
							if (
								!a.some(function (t) {
									return null === t
								})
							) {
								var o = r === i.length - 1
								0 === a.length
									? t.remove(
											o && 0 !== r ? i[r - 1].end : n.start,
											o ? e.end - 1 : i[r + 1].start
									  )
									: (t.remove(n.start, a[0].start),
									  t.remove(a[a.length - 1].end, o ? e.end - 1 : n.end)),
									i.splice.apply(i, [r, 1].concat(a)),
									(r += a.length)
							}
						}
					}
				}
			}
			function Oe(t) {
				switch (t.type) {
					case "ArrayExpression":
					case "CallExpression":
					case "Identifier":
					case "ParenthesizedExpression":
					case "ThisExpression":
						return !1
					default:
						return !0
				}
			}
			function Ne(t, e, i, r, n) {
				for (var s = e.length, a = -1; s--; ) {
					var o = e[s]
					o &&
						"SpreadElement" === o.type &&
						(Pe(o.argument) && t.overwrite(o.argument.start, o.argument.end, r),
						(a = s))
				}
				if (-1 === a) return !1
				if (n) {
					for (s = 0; s < e.length; s += 1) {
						var p = e[s]
						"SpreadElement" === p.type
							? t.remove(p.start, p.argument.start)
							: (t.prependRight(p.start, "["), t.prependRight(p.end, "]"))
					}
					return !0
				}
				var h = e[a],
					c = e[a - 1]
				if (c) t.overwrite(c.end, h.start, " ].concat( ")
				else {
					var l
					if (i !== h.start)
						(l = Oe(h.argument))
							? t.overwrite(i, h.start, "( ")
							: t.remove(i, h.start)
					else {
						if ("CallExpression" !== h.parent.type)
							throw new _e(
								"Unsupported spread construct, please raise an issue at https://github.com/bublejs/buble/issues",
								h
							)
						l = Oe(h.argument)
					}
					t.overwrite(h.end, e[1].start, l ? " ).concat( " : ".concat( ")
				}
				for (s = a; s < e.length; s += 1)
					(h = e[s]) &&
						("SpreadElement" === h.type
							? t.remove(h.start, h.argument.start)
							: (t.appendLeft(h.start, "["), t.appendLeft(h.end, "]")))
				return !0
			}
			var je = (function (t) {
				function e() {
					t.apply(this, arguments)
				}
				return (
					t && (e.__proto__ = t),
					((e.prototype = Object.create(t && t.prototype)).constructor = e),
					(e.prototype.initialise = function (e) {
						if (e.spreadRest && this.elements.length)
							for (
								var i = this.findLexicalBoundary(), r = this.elements.length;
								r--;

							) {
								var n = this.elements[r]
								n &&
									"SpreadElement" === n.type &&
									Pe(n.argument) &&
									(this.argumentsArrayAlias = i.getArgumentsArrayAlias())
							}
						t.prototype.initialise.call(this, e)
					}),
					(e.prototype.transpile = function (e, i) {
						if ((t.prototype.transpile.call(this, e, i), i.spreadRest)) {
							if ((Le(e, this, this.elements), this.elements.length)) {
								var r = this.elements[this.elements.length - 1]
								r &&
									/\s*,/.test(e.original.slice(r.end, this.end)) &&
									e.overwrite(r.end, this.end - 1, " ")
							}
							if (1 === this.elements.length) {
								var n = this.elements[0]
								n &&
									"SpreadElement" === n.type &&
									(Pe(n.argument)
										? e.overwrite(
												this.start,
												this.end,
												"[].concat( " + this.argumentsArrayAlias + " )"
										  )
										: (e.overwrite(this.start, n.argument.start, "[].concat( "),
										  e.overwrite(n.end, this.end, " )")))
							} else
								Ne(e, this.elements, this.start, this.argumentsArrayAlias) &&
									e.overwrite(this.end - 1, this.end, ")")
						}
					}),
					e
				)
			})(fe)
			function Te(t, e) {
				for (; ")" !== t.original[e]; ) {
					if ("," === t.original[e]) return void t.remove(e, e + 1)
					"/" === t.original[e] &&
						(e =
							"/" === t.original[e + 1]
								? t.original.indexOf("\n", e)
								: t.original.indexOf("*/", e) + 1),
						(e += 1)
				}
			}
			var Re = (function (t) {
				function e() {
					t.apply(this, arguments)
				}
				return (
					t && (e.__proto__ = t),
					((e.prototype = Object.create(t && t.prototype)).constructor = e),
					(e.prototype.initialise = function (e) {
						this.async &&
							e.asyncAwait &&
							_e.missingTransform("async arrow functions", "asyncAwait", this),
							this.body.createScope(),
							t.prototype.initialise.call(this, e)
					}),
					(e.prototype.transpile = function (e, i) {
						for (
							var r = this.start, n = (this.body || this.params[0]).start - 1;
							"(" !== e.original[r] && r < n;

						)
							++r
						"(" !== e.original[r] && (r = -1)
						var s = -1 === r
						if (i.arrow || this.needsArguments(i)) {
							for (var a = this.body.start; "=" !== e.original[a]; ) a -= 1
							e.remove(a, this.body.start),
								t.prototype.transpile.call(this, e, i),
								s &&
									(e.prependRight(this.params[0].start, "("),
									e.appendLeft(this.params[0].end, ")"))
							var o,
								p = this.parent && "ExpressionStatement" === this.parent.type,
								h = p ? "!" : ""
							this.async && (h += "async "),
								(h += "function"),
								p || (h += " "),
								(o = s ? this.params[0].start : r) > this.start
									? e.overwrite(this.start, o, h)
									: e.prependRight(this.start, h)
						} else t.prototype.transpile.call(this, e, i)
						i.trailingFunctionCommas &&
							this.params.length &&
							!s &&
							Te(e, this.params[this.params.length - 1].end)
					}),
					(e.prototype.needsArguments = function (t) {
						return (
							t.spreadRest &&
							this.params.filter(function (t) {
								return "RestElement" === t.type
							}).length > 0
						)
					}),
					e
				)
			})(fe)
			function Ve(t, e) {
				var i = e.findDeclaration(t.name)
				if (i && "const" === i.kind) throw new _e(t.name + " is read-only", t)
			}
			var De = (function (t) {
					function e() {
						t.apply(this, arguments)
					}
					return (
						t && (e.__proto__ = t),
						((e.prototype = Object.create(t && t.prototype)).constructor = e),
						(e.prototype.initialise = function (e) {
							if ("Identifier" === this.left.type) {
								var i = this.findScope(!1).findDeclaration(this.left.name),
									r = i && i.node.ancestor(3)
								r &&
									"ForStatement" === r.type &&
									r.body.contains(this) &&
									(r.reassigned[this.left.name] = !0)
							}
							t.prototype.initialise.call(this, e)
						}),
						(e.prototype.transpile = function (e, i) {
							"Identifier" === this.left.type &&
								Ve(this.left, this.findScope(!1)),
								"**=" === this.operator && i.exponentiation
									? this.transpileExponentiation(e, i)
									: /Pattern/.test(this.left.type) &&
									  i.destructuring &&
									  this.transpileDestructuring(e),
								t.prototype.transpile.call(this, e, i)
						}),
						(e.prototype.transpileDestructuring = function (t) {
							var e = this,
								i = this.findScope(!0),
								r = this.findScope(!1),
								n = i.createDeclaration("assign")
							t.appendRight(this.left.end, "(" + n),
								t.appendLeft(this.right.end, ", ")
							var s = []
							we(
								t,
								function (t) {
									return i.createDeclaration(t)
								},
								function (t) {
									var e = r.resolveName(t.name)
									return Ve(t, r), e
								},
								this.left,
								n,
								!0,
								s
							)
							var a = ", "
							s.forEach(function (t, i) {
								i === s.length - 1 && (a = ""), t(e.end, "", a)
							}),
								"ExpressionStatement" === this.unparenthesizedParent().type
									? t.prependRight(this.end, ")")
									: t.appendRight(this.end, ", " + n + ")")
						}),
						(e.prototype.transpileExponentiation = function (t) {
							for (
								var e, i = this.findScope(!1), r = this.left.end;
								"*" !== t.original[r];

							)
								r += 1
							t.remove(r, r + 2)
							var n = this.left.unparenthesize()
							if ("Identifier" === n.type) e = i.resolveName(n.name)
							else if ("MemberExpression" === n.type) {
								var s,
									a,
									o = !1,
									p = !1,
									h = this.findNearest(/(?:Statement|Declaration)$/),
									c = h.getIndentation()
								"Identifier" === n.property.type
									? (a = n.computed
											? i.resolveName(n.property.name)
											: n.property.name)
									: ((a = i.createDeclaration("property")), (p = !0)),
									"Identifier" === n.object.type
										? (s = i.resolveName(n.object.name))
										: ((s = i.createDeclaration("object")), (o = !0)),
									n.start === h.start
										? o && p
											? (t.prependRight(h.start, s + " = "),
											  t.overwrite(
													n.object.end,
													n.property.start,
													";\n" + c + a + " = "
											  ),
											  t.overwrite(
													n.property.end,
													n.end,
													";\n" + c + s + "[" + a + "]"
											  ))
											: o
											? (t.prependRight(h.start, s + " = "),
											  t.appendLeft(n.object.end, ";\n" + c),
											  t.appendLeft(n.object.end, s))
											: p &&
											  (t.prependRight(n.property.start, a + " = "),
											  t.appendLeft(n.property.end, ";\n" + c),
											  t.move(n.property.start, n.property.end, this.start),
											  t.appendLeft(n.object.end, "[" + a + "]"),
											  t.remove(n.object.end, n.property.start),
											  t.remove(n.property.end, n.end))
										: (o && p
												? (t.prependRight(n.start, "( " + s + " = "),
												  t.overwrite(
														n.object.end,
														n.property.start,
														", " + a + " = "
												  ),
												  t.overwrite(
														n.property.end,
														n.end,
														", " + s + "[" + a + "]"
												  ))
												: o
												? (t.prependRight(n.start, "( " + s + " = "),
												  t.appendLeft(n.object.end, ", " + s))
												: p &&
												  (t.prependRight(n.property.start, "( " + a + " = "),
												  t.appendLeft(n.property.end, ", "),
												  t.move(n.property.start, n.property.end, n.start),
												  t.overwrite(
														n.object.end,
														n.property.start,
														"[" + a + "]"
												  ),
												  t.remove(n.property.end, n.end)),
										  p && t.appendLeft(this.end, " )")),
									(e = s + (n.computed || p ? "[" + a + "]" : "." + a))
							}
							t.prependRight(this.right.start, "Math.pow( " + e + ", "),
								t.appendLeft(this.right.end, " )")
						}),
						e
					)
				})(fe),
				Fe = (function (t) {
					function e() {
						t.apply(this, arguments)
					}
					return (
						t && (e.__proto__ = t),
						((e.prototype = Object.create(t && t.prototype)).constructor = e),
						(e.prototype.initialise = function (e) {
							e.asyncAwait && _e.missingTransform("await", "asyncAwait", this),
								t.prototype.initialise.call(this, e)
						}),
						e
					)
				})(fe),
				Be = (function (t) {
					function e() {
						t.apply(this, arguments)
					}
					return (
						t && (e.__proto__ = t),
						((e.prototype = Object.create(t && t.prototype)).constructor = e),
						(e.prototype.transpile = function (e, i) {
							"**" === this.operator &&
								i.exponentiation &&
								(e.prependRight(this.start, "Math.pow( "),
								e.overwrite(this.left.end, this.right.start, ", "),
								e.appendLeft(this.end, " )")),
								t.prototype.transpile.call(this, e, i)
						}),
						e
					)
				})(fe),
				Me = /(?:For(?:In|Of)?|While)Statement/,
				Ue = (function (t) {
					function e() {
						t.apply(this, arguments)
					}
					return (
						t && (e.__proto__ = t),
						((e.prototype = Object.create(t && t.prototype)).constructor = e),
						(e.prototype.initialise = function () {
							var t = this.findNearest(Me),
								e = this.findNearest("SwitchCase")
							t &&
								(!e || t.depth > e.depth) &&
								((t.canBreak = !0), (this.loop = t))
						}),
						(e.prototype.transpile = function (t) {
							if (this.loop && this.loop.shouldRewriteAsFunction) {
								if (this.label)
									throw new _e(
										"Labels are not currently supported in a loop with locally-scoped variables",
										this
									)
								t.overwrite(this.start, this.start + 5, "return 'break'")
							}
						}),
						e
					)
				})(fe),
				qe = (function (t) {
					function e() {
						t.apply(this, arguments)
					}
					return (
						t && (e.__proto__ = t),
						((e.prototype = Object.create(t && t.prototype)).constructor = e),
						(e.prototype.initialise = function (e) {
							if (e.spreadRest && this.arguments.length > 1)
								for (
									var i = this.findLexicalBoundary(), r = this.arguments.length;
									r--;

								) {
									var n = this.arguments[r]
									"SpreadElement" === n.type &&
										Pe(n.argument) &&
										(this.argumentsArrayAlias = i.getArgumentsArrayAlias())
								}
							t.prototype.initialise.call(this, e)
						}),
						(e.prototype.transpile = function (e, i) {
							if (
								(i.spreadRest &&
									this.arguments.length &&
									Le(e, this, this.arguments),
								i.spreadRest && this.arguments.length)
							) {
								var r,
									n = !1,
									s = this.arguments[0]
								if (
									(1 === this.arguments.length
										? "SpreadElement" === s.type &&
										  (e.remove(s.start, s.argument.start), (n = !0))
										: (n = Ne(
												e,
												this.arguments,
												s.start,
												this.argumentsArrayAlias
										  )),
									n)
								) {
									var a = null
									if (
										("Super" === this.callee.type
											? (a = this.callee)
											: "MemberExpression" === this.callee.type &&
											  "Super" === this.callee.object.type &&
											  (a = this.callee.object),
										a || "MemberExpression" !== this.callee.type)
									)
										r = "void 0"
									else if ("Identifier" === this.callee.object.type)
										r = this.callee.object.name
									else {
										r = this.findScope(!0).createDeclaration("ref")
										var o = this.callee.object
										e.prependRight(o.start, "(" + r + " = "),
											e.appendLeft(o.end, ")")
									}
									e.appendLeft(this.callee.end, ".apply"),
										a
											? ((a.noCall = !0),
											  this.arguments.length > 1 &&
													("SpreadElement" === s.type
														? Oe(s.argument) && e.prependRight(s.start, "( ")
														: e.prependRight(s.start, "[ "),
													e.appendLeft(
														this.arguments[this.arguments.length - 1].end,
														" )"
													)))
											: 1 === this.arguments.length
											? e.prependRight(s.start, r + ", ")
											: ("SpreadElement" === s.type
													? Oe(s.argument)
														? e.appendLeft(s.start, r + ", ( ")
														: e.appendLeft(s.start, r + ", ")
													: e.appendLeft(s.start, r + ", [ "),
											  e.appendLeft(
													this.arguments[this.arguments.length - 1].end,
													" )"
											  ))
								}
							}
							i.trailingFunctionCommas &&
								this.arguments.length &&
								Te(e, this.arguments[this.arguments.length - 1].end),
								t.prototype.transpile.call(this, e, i)
						}),
						e
					)
				})(fe),
				ze = (function (t) {
					function e() {
						t.apply(this, arguments)
					}
					return (
						t && (e.__proto__ = t),
						((e.prototype = Object.create(t && t.prototype)).constructor = e),
						(e.prototype.transpile = function (e, i, r, n) {
							var s = this
							if (i.classes) {
								var a = this.parent.name,
									o = e.getIndentString(),
									p = this.getIndentation() + (r ? o : ""),
									h = p + o,
									c = ke(this.body, function (t) {
										return "constructor" === t.kind
									}),
									l = this.body[c],
									u = "",
									d = ""
								if (
									(this.body.length
										? (e.remove(this.start, this.body[0].start),
										  e.remove(this.body[this.body.length - 1].end, this.end))
										: e.remove(this.start, this.end),
									l)
								) {
									l.value.body.isConstructorBody = !0
									var f = this.body[c + 1]
									c > 0 &&
										(e.remove(this.body[c - 1].end, l.start),
										e.move(
											l.start,
											f ? f.start : this.end - 1,
											this.body[0].start
										)),
										r || e.appendLeft(l.end, ";")
								}
								var m = []
								this.body.forEach(function (t) {
									if (
										"FieldDefinition" === t.type &&
										(m.push(
											t.computed
												? "this" + e.slice(t.start, t.end) + ";"
												: "this." + e.slice(t.start, t.end) + ";"
										),
										e.remove(t.start, t.end),
										"" !== e.byStart[t.end].content)
									) {
										for (
											var i = 0;
											i < e.byStart[t.end].content.length &&
											-1 === e.byStart[t.end].content.slice(0, i).indexOf(";");
											i++
										);
										i > 0 && e.remove(t.end, t.end + i)
									}
								})
								var y = !1 !== this.program.options.namedFunctionExpressions,
									g =
										y ||
										this.parent.superClass ||
										"ClassDeclaration" !== this.parent.type
								if (this.parent.superClass) {
									var v =
										"if ( " +
										n +
										" ) " +
										a +
										".__proto__ = " +
										n +
										";\n" +
										p +
										a +
										".prototype = Object.create( " +
										n +
										" && " +
										n +
										".prototype );\n" +
										p +
										a +
										".prototype.constructor = " +
										a +
										";"
									u += l
										? "\n\n" + p + v
										: (v =
												"function " +
												a +
												" () {" +
												(m.length
													? "\n" + h + m.join("\n" + h) + "\n" + h
													: "") +
												(n
													? "\n" +
													  h +
													  n +
													  ".apply(this, arguments);\n" +
													  p +
													  "}"
													: "}") +
												(r ? "" : ";") +
												(this.body.length ? "\n\n" + p : "") +
												v) +
										  "\n\n" +
										  p
								} else if (!l) {
									var x =
										"function " +
										(g ? a + " " : "") +
										"() {" +
										(m.length ? "\n" + h + m.join("\n" + h) + "\n" + p : "") +
										"}"
									"ClassDeclaration" === this.parent.type && (x += ";"),
										this.body.length && (x += "\n\n" + p),
										(u += x)
								}
								l &&
									m.length &&
									e.appendLeft(
										l.value.body.start + 1,
										"\n" + h + m.join("\n" + h)
									)
								var b,
									_,
									k = this.findScope(!1),
									S = [],
									w = []
								if (
									(this.body.forEach(function (t, r) {
										if (
											(("get" !== t.kind && "set" !== t.kind) ||
												!i.getterSetter ||
												_e.missingTransform(
													"getters and setters",
													"getterSetter",
													t
												),
											"FieldDefinition" !== t.type)
										)
											if ("constructor" !== t.kind) {
												t.static &&
													e.remove(
														t.start,
														t.start + (" " == e.original[t.start + 6] ? 7 : 6)
													)
												var n,
													o = "method" !== t.kind,
													h = t.key.name
												;(ge[h] || t.value.body.scope.references[h]) &&
													(h = k.createIdentifier(h))
												var l = !1
												if (
													(t.computed ||
														"Literal" !== t.key.type ||
														((l = !0), (t.computed = !0)),
													o)
												) {
													if (t.computed)
														throw new Error(
															"Computed accessor properties are not currently supported"
														)
													e.remove(t.start, t.key.start),
														t.static
															? (~w.indexOf(t.key.name) || w.push(t.key.name),
															  _ ||
																	(_ = k.createIdentifier("staticAccessors")),
															  (n = "" + _))
															: (~S.indexOf(t.key.name) || S.push(t.key.name),
															  b ||
																	(b = k.createIdentifier(
																		"prototypeAccessors"
																	)),
															  (n = "" + b))
												} else n = t.static ? "" + a : a + ".prototype"
												t.computed || (n += "."),
													((c > 0 && r === c + 1) ||
														(0 === r && c === s.body.length - 1)) &&
														(n = "\n\n" + p + n)
												var u = t.key.end
												if (t.computed)
													if (l)
														e.prependRight(t.key.start, "["),
															e.appendLeft(t.key.end, "]")
													else {
														for (; "]" !== e.original[u]; ) u += 1
														u += 1
													}
												var d =
													(o ? "." + t.kind : "") +
													" = " +
													(t.value.async ? "async " : "") +
													"function" +
													(t.value.generator ? "* " : " ") +
													(t.computed || o || !y ? "" : h + " ")
												e.remove(u, t.value.start),
													e.prependRight(t.value.start, d),
													e.appendLeft(t.end, ";"),
													t.value.generator && e.remove(t.start, t.key.start)
												var f = t.key.start
												if (t.computed && !l) for (; "[" != e.original[f]; ) --f
												t.start < f
													? e.overwrite(t.start, f, n)
													: e.prependRight(t.start, n)
											} else
												e.overwrite(
													t.key.start,
													t.key.end,
													"function" + (g ? " " + a : "")
												)
									}),
									S.length || w.length)
								) {
									var E = [],
										C = []
									S.length &&
										(E.push(
											"var " +
												b +
												" = { " +
												S.map(function (t) {
													return t + ": { configurable: true }"
												}).join(",") +
												" };"
										),
										C.push(
											"Object.defineProperties( " +
												a +
												".prototype, " +
												b +
												" );"
										)),
										w.length &&
											(E.push(
												"var " +
													_ +
													" = { " +
													w
														.map(function (t) {
															return t + ": { configurable: true }"
														})
														.join(",") +
													" };"
											),
											C.push(
												"Object.defineProperties( " + a + ", " + _ + " );"
											)),
										l && (u += "\n\n" + p),
										(u += E.join("\n" + p)),
										l || (u += "\n\n" + p),
										(d += "\n\n" + p + C.join("\n" + p))
								}
								l ? e.appendLeft(l.end, u) : e.prependRight(this.start, u),
									e.appendLeft(this.end, d)
							}
							t.prototype.transpile.call(this, e, i)
						}),
						e
					)
				})(fe),
				We = (function (t) {
					function e() {
						t.apply(this, arguments)
					}
					return (
						t && (e.__proto__ = t),
						((e.prototype = Object.create(t && t.prototype)).constructor = e),
						(e.prototype.initialise = function (e) {
							this.id
								? ((this.name = this.id.name),
								  this.findScope(!0).addDeclaration(this.id, "class"))
								: (this.name = this.findScope(!0).createIdentifier(
										"defaultExport"
								  )),
								t.prototype.initialise.call(this, e)
						}),
						(e.prototype.transpile = function (t, e) {
							if (e.classes) {
								this.superClass ||
									(function (t, e) {
										var i = t.start,
											r = t.end,
											n = e.getIndentString(),
											s = n.length,
											a = i - s
										t.program.indentExclusions[a] ||
											e.original.slice(a, i) !== n ||
											e.remove(a, i)
										for (
											var o,
												p = new RegExp(n + "\\S", "g"),
												h = e.original.slice(i, r);
											(o = p.exec(h));

										) {
											var c = i + o.index
											t.program.indentExclusions[c] || e.remove(c, c + s)
										}
									})(this.body, t)
								var i =
										this.superClass && (this.superClass.name || "superclass"),
									r = this.getIndentation(),
									n = r + t.getIndentString(),
									s = "ExportDefaultDeclaration" === this.parent.type
								s && t.remove(this.parent.start, this.start)
								var a = this.start
								this.id
									? (t.overwrite(a, this.id.start, "var "), (a = this.id.end))
									: t.prependLeft(a, "var " + this.name),
									this.superClass
										? this.superClass.end === this.body.start
											? (t.remove(a, this.superClass.start),
											  t.appendLeft(
													a,
													" = /*@__PURE__*/(function (" + i + ") {\n" + n
											  ))
											: (t.overwrite(a, this.superClass.start, " = "),
											  t.overwrite(
													this.superClass.end,
													this.body.start,
													"/*@__PURE__*/(function (" + i + ") {\n" + n
											  ))
										: a === this.body.start
										? t.appendLeft(a, " = ")
										: t.overwrite(a, this.body.start, " = "),
									this.body.transpile(t, e, !!this.superClass, i)
								var o = s
									? "\n\n" + r + "export default " + this.name + ";"
									: ""
								this.superClass
									? (t.appendLeft(
											this.end,
											"\n\n" + n + "return " + this.name + ";\n" + r + "}("
									  ),
									  t.move(
											this.superClass.start,
											this.superClass.end,
											this.end
									  ),
									  t.prependRight(this.end, "));" + o))
									: o && t.prependRight(this.end, o)
							} else this.body.transpile(t, e, !1, null)
						}),
						e
					)
				})(fe),
				Xe = (function (t) {
					function e() {
						t.apply(this, arguments)
					}
					return (
						t && (e.__proto__ = t),
						((e.prototype = Object.create(t && t.prototype)).constructor = e),
						(e.prototype.initialise = function (e) {
							;(this.name =
								(this.id
									? this.id.name
									: "VariableDeclarator" === this.parent.type
									? this.parent.id.name
									: "AssignmentExpression" !== this.parent.type
									? null
									: "Identifier" === this.parent.left.type
									? this.parent.left.name
									: "MemberExpression" === this.parent.left.type
									? this.parent.left.property.name
									: null) || this.findScope(!0).createIdentifier("anonymous")),
								t.prototype.initialise.call(this, e)
						}),
						(e.prototype.transpile = function (t, e) {
							if (e.classes) {
								var i =
										this.superClass && (this.superClass.name || "superclass"),
									r = this.getIndentation(),
									n = r + t.getIndentString()
								this.superClass
									? (t.remove(this.start, this.superClass.start),
									  t.remove(this.superClass.end, this.body.start),
									  t.appendRight(
											this.start,
											"/*@__PURE__*/(function (" + i + ") {\n" + n
									  ))
									: t.overwrite(
											this.start,
											this.body.start,
											"/*@__PURE__*/(function () {\n" + n
									  ),
									this.body.transpile(t, e, !0, i)
								var s = ""
								this.superClass &&
									((s = t.slice(this.superClass.start, this.superClass.end)),
									t.remove(this.superClass.start, this.superClass.end)),
									t.appendLeft(
										this.end,
										"\n\n" +
											n +
											"return " +
											this.name +
											";\n" +
											r +
											"}(" +
											s +
											"))"
									)
							} else this.body.transpile(t, e, !1)
						}),
						e
					)
				})(fe),
				Je = (function (t) {
					function e() {
						t.apply(this, arguments)
					}
					return (
						t && (e.__proto__ = t),
						((e.prototype = Object.create(t && t.prototype)).constructor = e),
						(e.prototype.transpile = function (t) {
							if (this.findNearest(Me).shouldRewriteAsFunction) {
								if (this.label)
									throw new _e(
										"Labels are not currently supported in a loop with locally-scoped variables",
										this
									)
								t.overwrite(this.start, this.start + 8, "return")
							}
						}),
						e
					)
				})(fe),
				He = (function (t) {
					function e() {
						t.apply(this, arguments)
					}
					return (
						t && (e.__proto__ = t),
						((e.prototype = Object.create(t && t.prototype)).constructor = e),
						(e.prototype.initialise = function (e) {
							e.moduleExport &&
								_e.missingTransform("export", "moduleExport", this),
								t.prototype.initialise.call(this, e)
						}),
						e
					)
				})(fe),
				Ke = (function (t) {
					function e() {
						t.apply(this, arguments)
					}
					return (
						t && (e.__proto__ = t),
						((e.prototype = Object.create(t && t.prototype)).constructor = e),
						(e.prototype.initialise = function (e) {
							e.moduleExport &&
								_e.missingTransform("export", "moduleExport", this),
								t.prototype.initialise.call(this, e)
						}),
						e
					)
				})(fe),
				Ze = (function (t) {
					function e() {
						t.apply(this, arguments)
					}
					return (
						t && (e.__proto__ = t),
						((e.prototype = Object.create(t && t.prototype)).constructor = e),
						(e.prototype.findScope = function (t) {
							return t || !this.createdScope
								? this.parent.findScope(t)
								: this.body.scope
						}),
						(e.prototype.initialise = function (e) {
							if (
								(this.body.createScope(),
								(this.createdScope = !0),
								(this.reassigned = Object.create(null)),
								(this.aliases = Object.create(null)),
								(this.thisRefs = []),
								t.prototype.initialise.call(this, e),
								e.letConst)
							)
								for (
									var i = Object.keys(this.body.scope.declarations),
										r = i.length;
									r--;

								) {
									for (
										var n = this.body.scope.declarations[i[r]],
											s = n.instances.length;
										s--;

									) {
										var a = n.instances[s].findNearest(/Function/)
										if (a && a.depth > this.depth) {
											this.shouldRewriteAsFunction = !0
											for (var o = 0, p = this.thisRefs; o < p.length; o += 1) {
												var h = p[o]
												h.alias =
													h.alias || h.findLexicalBoundary().getThisAlias()
											}
											break
										}
									}
									if (this.shouldRewriteAsFunction) break
								}
						}),
						(e.prototype.transpile = function (e, i) {
							var r =
								"ForOfStatement" != this.type &&
								("BlockStatement" !== this.body.type ||
									("BlockStatement" === this.body.type && this.body.synthetic))
							if (this.shouldRewriteAsFunction) {
								var n = this.getIndentation(),
									s = n + e.getIndentString(),
									a = this.args ? " " + this.args.join(", ") + " " : "",
									o = this.params ? " " + this.params.join(", ") + " " : "",
									p = this.findScope(!0),
									h = p.createIdentifier("loop"),
									c =
										"var " +
										h +
										" = function (" +
										o +
										") " +
										(this.body.synthetic
											? "{\n" + n + e.getIndentString()
											: ""),
									l = (this.body.synthetic ? "\n" + n + "}" : "") + ";\n\n" + n
								if (
									(e.prependRight(this.body.start, c),
									e.appendLeft(this.body.end, l),
									e.move(this.start, this.body.start, this.body.end),
									this.canBreak || this.canReturn)
								) {
									var u = p.createIdentifier("returned"),
										d = "{\n" + s + "var " + u + " = " + h + "(" + a + ");\n"
									this.canBreak &&
										(d += "\n" + s + "if ( " + u + " === 'break' ) break;"),
										this.canReturn &&
											(d += "\n" + s + "if ( " + u + " ) return " + u + ".v;"),
										e.prependRight(this.body.end, (d += "\n" + n + "}"))
								} else {
									var f = h + "(" + a + ");"
									"DoWhileStatement" === this.type
										? e.overwrite(
												this.start,
												this.body.start,
												"do {\n" + s + f + "\n" + n + "}"
										  )
										: e.prependRight(this.body.end, f)
								}
							} else
								r &&
									(e.appendLeft(this.body.start, "{ "),
									e.prependRight(this.body.end, " }"))
							t.prototype.transpile.call(this, e, i)
						}),
						e
					)
				})(fe),
				Ge = (function (t) {
					function e() {
						t.apply(this, arguments)
					}
					return (
						t && (e.__proto__ = t),
						((e.prototype = Object.create(t && t.prototype)).constructor = e),
						(e.prototype.findScope = function (t) {
							return t || !this.createdScope
								? this.parent.findScope(t)
								: this.body.scope
						}),
						(e.prototype.transpile = function (e, i) {
							var r = this,
								n = this.getIndentation() + e.getIndentString()
							if (this.shouldRewriteAsFunction) {
								var s =
										"VariableDeclaration" === this.init.type
											? this.init.declarations.map(function (t) {
													return me(t.id)
											  })
											: [],
									a = this.aliases
								;(this.args = s.map(function (t) {
									return t in r.aliases ? r.aliases[t].outer : t
								})),
									(this.params = s.map(function (t) {
										return t in r.aliases ? r.aliases[t].inner : t
									}))
								var o = Object.keys(this.reassigned).map(function (t) {
									return a[t].outer + " = " + a[t].inner + ";"
								})
								o.length &&
									(this.body.synthetic
										? e.appendLeft(this.body.body[0].end, "; " + o.join(" "))
										: e.appendLeft(
												this.body.body[this.body.body.length - 1].end,
												"\n\n" + n + o.join("\n" + n)
										  ))
							}
							t.prototype.transpile.call(this, e, i)
						}),
						e
					)
				})(Ze),
				Qe = (function (t) {
					function e() {
						t.apply(this, arguments)
					}
					return (
						t && (e.__proto__ = t),
						((e.prototype = Object.create(t && t.prototype)).constructor = e),
						(e.prototype.findScope = function (t) {
							return t || !this.createdScope
								? this.parent.findScope(t)
								: this.body.scope
						}),
						(e.prototype.transpile = function (e, i) {
							var r = this,
								n = "VariableDeclaration" === this.left.type
							if (this.shouldRewriteAsFunction) {
								var s = n
									? this.left.declarations.map(function (t) {
											return me(t.id)
									  })
									: []
								;(this.args = s.map(function (t) {
									return t in r.aliases ? r.aliases[t].outer : t
								})),
									(this.params = s.map(function (t) {
										return t in r.aliases ? r.aliases[t].inner : t
									}))
							}
							t.prototype.transpile.call(this, e, i)
							var a = n ? this.left.declarations[0].id : this.left
							"Identifier" !== a.type && this.destructurePattern(e, a, n)
						}),
						(e.prototype.destructurePattern = function (t, e, i) {
							var r = this.findScope(!0),
								n = this.getIndentation() + t.getIndentString(),
								s = r.createIdentifier("ref"),
								a = this.body.body.length
									? this.body.body[0].start
									: this.body.start + 1
							t.move(e.start, e.end, a),
								t.prependRight(e.end, i ? s : "var " + s)
							var o = []
							we(
								t,
								function (t) {
									return r.createIdentifier(t)
								},
								function (t) {
									return r.resolveName(t.name)
								},
								e,
								s,
								!1,
								o
							)
							var p = ";\n" + n
							o.forEach(function (t, e) {
								e === o.length - 1 && (p = ";\n\n" + n), t(a, "", p)
							})
						}),
						e
					)
				})(Ze),
				$e = (function (t) {
					function e() {
						t.apply(this, arguments)
					}
					return (
						t && (e.__proto__ = t),
						((e.prototype = Object.create(t && t.prototype)).constructor = e),
						(e.prototype.initialise = function (e) {
							e.forOf &&
								!e.dangerousForOf &&
								_e.missingTransform(
									"for-of statements",
									"forOf",
									this,
									"dangerousForOf"
								),
								this.await &&
									e.asyncAwait &&
									_e.missingTransform(
										"for-await-of statements",
										"asyncAwait",
										this
									),
								t.prototype.initialise.call(this, e)
						}),
						(e.prototype.transpile = function (e, i) {
							if ((t.prototype.transpile.call(this, e, i), i.dangerousForOf))
								if (this.body.body[0]) {
									var r = this.findScope(!0),
										n = this.getIndentation(),
										s = n + e.getIndentString(),
										a = r.createIdentifier("i"),
										o = r.createIdentifier("list")
									this.body.synthetic &&
										(e.prependRight(this.left.start, "{\n" + s),
										e.appendLeft(this.body.body[0].end, "\n" + n + "}"))
									var p = this.body.body[0].start
									e.remove(this.left.end, this.right.start),
										e.move(this.left.start, this.left.end, p),
										e.prependRight(
											this.right.start,
											"var " + a + " = 0, " + o + " = "
										),
										e.appendLeft(
											this.right.end,
											"; " + a + " < " + o + ".length; " + a + " += 1"
										)
									var h = "VariableDeclaration" === this.left.type,
										c = h ? this.left.declarations[0].id : this.left
									if ("Identifier" !== c.type) {
										var l = [],
											u = r.createIdentifier("ref")
										we(
											e,
											function (t) {
												return r.createIdentifier(t)
											},
											function (t) {
												return r.resolveName(t.name)
											},
											c,
											u,
											!h,
											l
										)
										var d = ";\n" + s
										l.forEach(function (t, e) {
											e === l.length - 1 && (d = ";\n\n" + s), t(p, "", d)
										}),
											h
												? (e.appendLeft(
														this.left.start + this.left.kind.length + 1,
														u
												  ),
												  e.appendLeft(
														this.left.end,
														" = " + o + "[" + a + "];\n" + s
												  ))
												: e.appendLeft(
														this.left.end,
														"var " + u + " = " + o + "[" + a + "];\n" + s
												  )
									} else
										e.appendLeft(
											this.left.end,
											" = " + o + "[" + a + "];\n\n" + s
										)
								} else
									"VariableDeclaration" === this.left.type &&
									"var" === this.left.kind
										? (e.remove(this.start, this.left.start),
										  e.appendLeft(this.left.end, ";"),
										  e.remove(this.left.end, this.end))
										: e.remove(this.start, this.end)
						}),
						e
					)
				})(Ze),
				Ye = (function (t) {
					function e() {
						t.apply(this, arguments)
					}
					return (
						t && (e.__proto__ = t),
						((e.prototype = Object.create(t && t.prototype)).constructor = e),
						(e.prototype.initialise = function (e) {
							this.generator &&
								e.generator &&
								_e.missingTransform("generators", "generator", this),
								this.async &&
									e.asyncAwait &&
									_e.missingTransform("async functions", "asyncAwait", this),
								this.body.createScope(),
								this.id &&
									this.findScope(!0).addDeclaration(this.id, "function"),
								t.prototype.initialise.call(this, e)
						}),
						(e.prototype.transpile = function (e, i) {
							t.prototype.transpile.call(this, e, i),
								i.trailingFunctionCommas &&
									this.params.length &&
									Te(e, this.params[this.params.length - 1].end)
						}),
						e
					)
				})(fe),
				ti = (function (t) {
					function e() {
						t.apply(this, arguments)
					}
					return (
						t && (e.__proto__ = t),
						((e.prototype = Object.create(t && t.prototype)).constructor = e),
						(e.prototype.initialise = function (e) {
							this.generator &&
								e.generator &&
								_e.missingTransform("generators", "generator", this),
								this.async &&
									e.asyncAwait &&
									_e.missingTransform("async functions", "asyncAwait", this),
								this.body.createScope(),
								this.id && this.body.scope.addDeclaration(this.id, "function"),
								t.prototype.initialise.call(this, e)
							var i,
								r = this.parent
							if (
								((e.conciseMethodProperty &&
									"Property" === r.type &&
									"init" === r.kind &&
									r.method &&
									"Identifier" === r.key.type) ||
								(e.classes &&
									"MethodDefinition" === r.type &&
									"method" === r.kind &&
									"Identifier" === r.key.type)
									? (i = r.key.name)
									: this.id &&
									  "Identifier" === this.id.type &&
									  (i = this.id.alias || this.id.name),
								i)
							)
								for (var n = 0, s = this.params; n < s.length; n += 1) {
									var a = s[n]
									if ("Identifier" === a.type && i === a.name) {
										var o = this.body.scope,
											p = o.declarations[i],
											h = o.createIdentifier(i)
										a.alias = h
										for (var c = 0, l = p.instances; c < l.length; c += 1)
											l[c].alias = h
										break
									}
								}
						}),
						(e.prototype.transpile = function (e, i) {
							t.prototype.transpile.call(this, e, i),
								i.trailingFunctionCommas &&
									this.params.length &&
									Te(e, this.params[this.params.length - 1].end)
						}),
						e
					)
				})(fe),
				ei = (function (t) {
					function e() {
						t.apply(this, arguments)
					}
					return (
						t && (e.__proto__ = t),
						((e.prototype = Object.create(t && t.prototype)).constructor = e),
						(e.prototype.findScope = function (t) {
							return (this.parent.params &&
								~this.parent.params.indexOf(this)) ||
								("FunctionExpression" === this.parent.type &&
									this === this.parent.id)
								? this.parent.body.scope
								: this.parent.findScope(t)
						}),
						(e.prototype.initialise = function (t) {
							if (
								(function t(e, i) {
									return "MemberExpression" === e.type
										? !e.computed && t(e.object, e)
										: "Identifier" === e.type
										? !i ||
										  (!/(Function|Class)Expression/.test(i.type) &&
												("VariableDeclarator" === i.type
													? e === i.init
													: "MemberExpression" === i.type ||
													  "MethodDefinition" === i.type
													? i.computed || e === i.object
													: "ArrayPattern" !== i.type &&
													  ("Property" === i.type
															? "ObjectPattern" !== i.parent.type &&
															  (i.computed || e === i.value)
															: "MethodDefinition" !== i.type &&
															  ("ExportSpecifier" !== i.type ||
																	e === i.local))))
										: void 0
								})(this, this.parent)
							) {
								if (
									t.arrow &&
									"arguments" === this.name &&
									!this.findScope(!1).contains(this.name)
								) {
									var e = this.findLexicalBoundary(),
										i = this.findNearest("ArrowFunctionExpression"),
										r = this.findNearest(Me)
									i &&
										i.depth > e.depth &&
										(this.alias = e.getArgumentsAlias()),
										r &&
											r.body.contains(this) &&
											r.depth > e.depth &&
											(this.alias = e.getArgumentsAlias())
								}
								this.findScope(!1).addReference(this)
							}
						}),
						(e.prototype.transpile = function (t) {
							this.alias &&
								t.overwrite(this.start, this.end, this.alias, {
									storeName: !0,
									contentOnly: !0
								})
						}),
						e
					)
				})(fe),
				ii = (function (t) {
					function e() {
						t.apply(this, arguments)
					}
					return (
						t && (e.__proto__ = t),
						((e.prototype = Object.create(t && t.prototype)).constructor = e),
						(e.prototype.initialise = function (e) {
							t.prototype.initialise.call(this, e)
						}),
						(e.prototype.transpile = function (e, i) {
							;("BlockStatement" !== this.consequent.type ||
								("BlockStatement" === this.consequent.type &&
									this.consequent.synthetic)) &&
								(e.appendLeft(this.consequent.start, "{ "),
								e.prependRight(this.consequent.end, " }")),
								this.alternate &&
									"IfStatement" !== this.alternate.type &&
									("BlockStatement" !== this.alternate.type ||
										("BlockStatement" === this.alternate.type &&
											this.alternate.synthetic)) &&
									(e.appendLeft(this.alternate.start, "{ "),
									e.prependRight(this.alternate.end, " }")),
								t.prototype.transpile.call(this, e, i)
						}),
						e
					)
				})(fe),
				ri = (function (t) {
					function e() {
						t.apply(this, arguments)
					}
					return (
						t && (e.__proto__ = t),
						((e.prototype = Object.create(t && t.prototype)).constructor = e),
						(e.prototype.initialise = function (e) {
							e.moduleImport &&
								_e.missingTransform(
									"dynamic import expressions",
									"moduleImport",
									this
								),
								t.prototype.initialise.call(this, e)
						}),
						e
					)
				})(fe),
				ni = (function (t) {
					function e() {
						t.apply(this, arguments)
					}
					return (
						t && (e.__proto__ = t),
						((e.prototype = Object.create(t && t.prototype)).constructor = e),
						(e.prototype.initialise = function (e) {
							e.moduleImport &&
								_e.missingTransform("import", "moduleImport", this),
								t.prototype.initialise.call(this, e)
						}),
						e
					)
				})(fe),
				si = (function (t) {
					function e() {
						t.apply(this, arguments)
					}
					return (
						t && (e.__proto__ = t),
						((e.prototype = Object.create(t && t.prototype)).constructor = e),
						(e.prototype.initialise = function (e) {
							this.findScope(!0).addDeclaration(this.local, "import"),
								t.prototype.initialise.call(this, e)
						}),
						e
					)
				})(fe),
				ai = (function (t) {
					function e() {
						t.apply(this, arguments)
					}
					return (
						t && (e.__proto__ = t),
						((e.prototype = Object.create(t && t.prototype)).constructor = e),
						(e.prototype.initialise = function (e) {
							this.findScope(!0).addDeclaration(this.local, "import"),
								t.prototype.initialise.call(this, e)
						}),
						e
					)
				})(fe),
				oi = (function (t) {
					function e() {
						t.apply(this, arguments)
					}
					return (
						t && (e.__proto__ = t),
						((e.prototype = Object.create(t && t.prototype)).constructor = e),
						(e.prototype.transpile = function (e, i) {
							var r,
								n = this.name
							e.overwrite(
								n.start,
								this.value ? this.value.start : this.name.end,
								(/-/.test((r = n.name)) ? "'" + r + "'" : r) +
									": " +
									(this.value ? "" : "true")
							),
								t.prototype.transpile.call(this, e, i)
						}),
						e
					)
				})(fe),
				pi = (function (t) {
					function e() {
						t.apply(this, arguments)
					}
					return (
						t && (e.__proto__ = t),
						((e.prototype = Object.create(t && t.prototype)).constructor = e),
						(e.prototype.transpile = function (t) {
							var e,
								i = !0,
								r = this.parent.children[this.parent.children.length - 1]
							;((r &&
								"JSXText" === (e = r).type &&
								!/\S/.test(e.value) &&
								/\n/.test(e.value)) ||
								this.parent.openingElement.attributes.length) &&
								(i = !1),
								t.overwrite(this.start, this.end, i ? " )" : ")")
						}),
						e
					)
				})(fe),
				hi = (function (t) {
					function e() {
						t.apply(this, arguments)
					}
					return (
						t && (e.__proto__ = t),
						((e.prototype = Object.create(t && t.prototype)).constructor = e),
						(e.prototype.transpile = function (t) {
							var e,
								i = !0,
								r = this.parent.children[this.parent.children.length - 1]
							r &&
								"JSXText" === (e = r).type &&
								!/\S/.test(e.value) &&
								/\n/.test(e.value) &&
								(i = !1),
								t.overwrite(this.start, this.end, i ? " )" : ")")
						}),
						e
					)
				})(fe)
			function ci(t, e) {
				return (
					(t = t.replace(/\u00a0/g, "&nbsp;")),
					e && /\n/.test(t) && (t = t.replace(/\s+$/, "")),
					(t = t.replace(/^\n\r?\s+/, "").replace(/\s*\n\r?\s*/gm, " ")),
					JSON.stringify(t)
				)
			}
			var li = (function (t) {
					function e() {
						t.apply(this, arguments)
					}
					return (
						t && (e.__proto__ = t),
						((e.prototype = Object.create(t && t.prototype)).constructor = e),
						(e.prototype.transpile = function (e, i) {
							t.prototype.transpile.call(this, e, i)
							var r = this.children.filter(function (t) {
								return (
									"JSXText" !== t.type || /\S/.test(t.raw) || !/\n/.test(t.raw)
								)
							})
							if (r.length) {
								var n,
									s = (this.openingElement || this.openingFragment).end
								for (n = 0; n < r.length; n += 1) {
									var a = r[n]
									if (
										(("JSXExpressionContainer" === a.type &&
											"JSXEmptyExpression" === a.expression.type) ||
											e.appendLeft(
												s,
												"," +
													("\n" === e.original[s] && "JSXText" !== a.type
														? ""
														: " ")
											),
										"JSXText" === a.type)
									) {
										var o = ci(a.value, n === r.length - 1)
										e.overwrite(a.start, a.end, o)
									}
									s = a.end
								}
							}
						}),
						e
					)
				})(fe),
				ui = /[\u2028-\u2029]/g,
				di = {
					ArrayExpression: je,
					ArrowFunctionExpression: Re,
					AssignmentExpression: De,
					AwaitExpression: Fe,
					BinaryExpression: Be,
					BreakStatement: Ue,
					CallExpression: qe,
					ClassBody: ze,
					ClassDeclaration: We,
					ClassExpression: Xe,
					ContinueStatement: Je,
					DoWhileStatement: Ze,
					ExportNamedDeclaration: Ke,
					ExportDefaultDeclaration: He,
					ForStatement: Ge,
					ForInStatement: Qe,
					ForOfStatement: $e,
					FunctionDeclaration: Ye,
					FunctionExpression: ti,
					Identifier: ei,
					IfStatement: ii,
					Import: ri,
					ImportDeclaration: ni,
					ImportDefaultSpecifier: si,
					ImportSpecifier: ai,
					JSXAttribute: oi,
					JSXClosingElement: pi,
					JSXClosingFragment: hi,
					JSXElement: li,
					JSXExpressionContainer: (function (t) {
						function e() {
							t.apply(this, arguments)
						}
						return (
							t && (e.__proto__ = t),
							((e.prototype = Object.create(t && t.prototype)).constructor = e),
							(e.prototype.transpile = function (e, i) {
								e.remove(this.start, this.expression.start),
									e.remove(this.expression.end, this.end),
									t.prototype.transpile.call(this, e, i)
							}),
							e
						)
					})(fe),
					JSXFragment: (function (t) {
						function e() {
							t.apply(this, arguments)
						}
						return (
							t && (e.__proto__ = t),
							((e.prototype = Object.create(t && t.prototype)).constructor = e),
							e
						)
					})(li),
					JSXOpeningElement: (function (t) {
						function e() {
							t.apply(this, arguments)
						}
						return (
							t && (e.__proto__ = t),
							((e.prototype = Object.create(t && t.prototype)).constructor = e),
							(e.prototype.transpile = function (e, i) {
								t.prototype.transpile.call(this, e, i),
									e.overwrite(
										this.start,
										this.name.start,
										this.program.jsx + "( "
									)
								var r =
									"JSXIdentifier" === this.name.type &&
									this.name.name[0] === this.name.name[0].toLowerCase()
								r && e.prependRight(this.name.start, "'")
								var n = this.attributes.length,
									s = this.name.end
								if (n) {
									var a,
										o,
										p,
										h = !1
									for (a = 0; a < n; a += 1)
										if ("JSXSpreadAttribute" === this.attributes[a].type) {
											h = !0
											break
										}
									for (s = this.attributes[0].end, a = 0; a < n; a += 1) {
										var c = this.attributes[a]
										if (
											(a > 0 &&
												(c.start === s
													? e.prependRight(s, ", ")
													: e.overwrite(s, c.start, ", ")),
											h && "JSXSpreadAttribute" !== c.type)
										) {
											var l = this.attributes[a - 1],
												u = this.attributes[a + 1]
											;(l && "JSXSpreadAttribute" !== l.type) ||
												e.prependRight(c.start, "{ "),
												(u && "JSXSpreadAttribute" !== u.type) ||
													e.appendLeft(c.end, " }")
										}
										s = c.end
									}
									if (h)
										if (1 === n) p = r ? "'," : ","
										else {
											if (!this.program.options.objectAssign)
												throw new _e(
													"Mixed JSX attributes ending in spread requires specified objectAssign option with 'Object.assign' or polyfill helper.",
													this
												)
											;(p = r
												? "', " + this.program.options.objectAssign + "({},"
												: ", " + this.program.options.objectAssign + "({},"),
												(o = ")")
										}
									else (p = r ? "', {" : ", {"), (o = " }")
									e.prependRight(this.name.end, p),
										o && e.appendLeft(this.attributes[n - 1].end, o)
								} else
									e.appendLeft(this.name.end, r ? "', null" : ", null"),
										(s = this.name.end)
								this.selfClosing
									? e.overwrite(
											s,
											this.end,
											this.attributes.length ? ")" : " )"
									  )
									: e.remove(s, this.end)
							}),
							e
						)
					})(fe),
					JSXOpeningFragment: (function (t) {
						function e() {
							t.apply(this, arguments)
						}
						return (
							t && (e.__proto__ = t),
							((e.prototype = Object.create(t && t.prototype)).constructor = e),
							(e.prototype.transpile = function (t) {
								t.overwrite(
									this.start,
									this.end,
									this.program.jsx + "( React.Fragment, null"
								)
							}),
							e
						)
					})(fe),
					JSXSpreadAttribute: (function (t) {
						function e() {
							t.apply(this, arguments)
						}
						return (
							t && (e.__proto__ = t),
							((e.prototype = Object.create(t && t.prototype)).constructor = e),
							(e.prototype.transpile = function (e, i) {
								e.remove(this.start, this.argument.start),
									e.remove(this.argument.end, this.end),
									t.prototype.transpile.call(this, e, i)
							}),
							e
						)
					})(fe),
					Literal: (function (t) {
						function e() {
							t.apply(this, arguments)
						}
						return (
							t && (e.__proto__ = t),
							((e.prototype = Object.create(t && t.prototype)).constructor = e),
							(e.prototype.initialise = function () {
								"string" == typeof this.value &&
									this.program.indentExclusionElements.push(this)
							}),
							(e.prototype.transpile = function (t, e) {
								e.numericLiteral &&
									this.raw.match(/^0[bo]/i) &&
									t.overwrite(this.start, this.end, String(this.value), {
										storeName: !0,
										contentOnly: !0
									}),
									"string" == typeof this.value &&
										this.value.match(ui) &&
										t.overwrite(
											this.start,
											this.end,
											this.raw.replace(ui, function (t) {
												return "\u2028" == t ? "\\u2028" : "\\u2029"
											}),
											{ contentOnly: !0 }
										)
							}),
							e
						)
					})(fe),
					MemberExpression: (function (t) {
						function e() {
							t.apply(this, arguments)
						}
						return (
							t && (e.__proto__ = t),
							((e.prototype = Object.create(t && t.prototype)).constructor = e),
							(e.prototype.transpile = function (e, i) {
								i.reservedProperties &&
									ge[this.property.name] &&
									(e.overwrite(this.object.end, this.property.start, "['"),
									e.appendLeft(this.property.end, "']")),
									t.prototype.transpile.call(this, e, i)
							}),
							e
						)
					})(fe),
					NewExpression: (function (t) {
						function e() {
							t.apply(this, arguments)
						}
						return (
							t && (e.__proto__ = t),
							((e.prototype = Object.create(t && t.prototype)).constructor = e),
							(e.prototype.initialise = function (e) {
								if (e.spreadRest && this.arguments.length)
									for (
										var i = this.findLexicalBoundary(),
											r = this.arguments.length;
										r--;

									) {
										var n = this.arguments[r]
										if ("SpreadElement" === n.type && Pe(n.argument)) {
											this.argumentsArrayAlias = i.getArgumentsArrayAlias()
											break
										}
									}
								t.prototype.initialise.call(this, e)
							}),
							(e.prototype.transpile = function (e, i) {
								if (
									(t.prototype.transpile.call(this, e, i),
									i.spreadRest &&
										this.arguments.length &&
										Le(e, this, this.arguments),
									i.spreadRest && this.arguments.length)
								) {
									var r = this.arguments[0]
									Ne(
										e,
										this.arguments,
										r.start,
										this.argumentsArrayAlias,
										!0
									) &&
										(e.prependRight(
											this.start + "new".length,
											" (Function.prototype.bind.apply("
										),
										e.overwrite(
											this.callee.end,
											r.start,
											", [ null ].concat( "
										),
										e.appendLeft(this.end, " ))"))
								}
								this.arguments.length &&
									Te(e, this.arguments[this.arguments.length - 1].end)
							}),
							e
						)
					})(fe),
					ObjectExpression: (function (t) {
						function e() {
							t.apply(this, arguments)
						}
						return (
							t && (e.__proto__ = t),
							((e.prototype = Object.create(t && t.prototype)).constructor = e),
							(e.prototype.transpile = function (e, i) {
								var r
								t.prototype.transpile.call(this, e, i)
								for (
									var n = this.start + 1,
										s = 0,
										a = 0,
										o = null,
										p = null,
										h = 0;
									h < this.properties.length;
									++h
								) {
									var c = this.properties[h]
									if ("SpreadElement" === c.type) {
										var l = c.argument
										"ObjectExpression" === l.type ||
										("Literal" === l.type && "string" != typeof l.value)
											? "ObjectExpression" === l.type && l.properties.length > 0
												? (e.remove(c.start, l.properties[0].start),
												  e.remove(
														l.properties[l.properties.length - 1].end,
														c.end
												  ),
												  (r = this.properties).splice.apply(
														r,
														[h, 1].concat(l.properties)
												  ),
												  h--)
												: (e.remove(
														c.start,
														h === this.properties.length - 1
															? c.end
															: this.properties[h + 1].start
												  ),
												  this.properties.splice(h, 1),
												  h--)
											: ((s += 1), null === o && (o = h))
									} else
										c.computed &&
											i.computedProperty &&
											((a += 1), null === p && (p = h))
								}
								if (!s || i.objectRestSpread || (a && i.computedProperty)) {
									if (s) {
										if (!this.program.options.objectAssign)
											throw new _e(
												"Object spread operator requires specified objectAssign option with 'Object.assign' or polyfill helper.",
												this
											)
										for (var u = this.properties.length; u--; ) {
											var d = this.properties[u]
											if ("Property" === d.type && !a) {
												var f = this.properties[u - 1],
													m = this.properties[u + 1]
												;(f && "Property" === f.type) ||
													e.prependRight(d.start, "{"),
													(m && "Property" === m.type) ||
														e.appendLeft(d.end, "}")
											}
											"SpreadElement" === d.type &&
												(e.remove(d.start, d.argument.start),
												e.remove(d.argument.end, d.end))
										}
										;(n = this.properties[0].start),
											a
												? "SpreadElement" === this.properties[0].type
													? (e.overwrite(
															this.start,
															n,
															this.program.options.objectAssign + "({}, "
													  ),
													  e.remove(this.end - 1, this.end),
													  e.appendRight(this.end, ")"))
													: (e.prependLeft(
															this.start,
															this.program.options.objectAssign + "("
													  ),
													  e.appendRight(this.end, ")"))
												: (e.overwrite(
														this.start,
														n,
														this.program.options.objectAssign + "({}, "
												  ),
												  e.overwrite(
														this.properties[this.properties.length - 1].end,
														this.end,
														")"
												  ))
									}
								} else (s = 0), (o = null)
								if (a && i.computedProperty) {
									var y,
										g,
										v = this.getIndentation()
									"VariableDeclarator" === this.parent.type &&
									1 === this.parent.parent.declarations.length &&
									"Identifier" === this.parent.id.type
										? ((y = !0),
										  (g = this.parent.id.alias || this.parent.id.name))
										: (("AssignmentExpression" === this.parent.type &&
												"ExpressionStatement" === this.parent.parent.type &&
												"Identifier" === this.parent.left.type) ||
												("AssignmentPattern" === this.parent.type &&
													"Identifier" === this.parent.left.type)) &&
										  ((y = !0),
										  (g = this.parent.left.alias || this.parent.left.name)),
										s && (y = !1),
										(g = this.findScope(!1).resolveName(g))
									var x = n,
										b = this.end
									y ||
										(null === o || p < o
											? ((g = this.findScope(!0).createDeclaration("obj")),
											  e.prependRight(this.start, "( " + g + " = "))
											: (g = null))
									for (
										var _, k = this.properties.length, S = !1, w = !0, E = 0;
										E < k;
										E += 1
									) {
										var C = this.properties[E],
											A = E > 0 ? this.properties[E - 1].end : x
										if ("Property" === C.type && (C.computed || (_ && !s))) {
											if ((0 === E && (A = this.start + 1), (_ = C), g)) {
												var I =
													(y ? ";\n" + v + g : ", " + g) +
													("Literal" === C.key.type || C.computed ? "" : ".")
												A < C.start
													? e.overwrite(A, C.start, I)
													: e.prependRight(C.start, I)
											} else
												(g = this.findScope(!0).createDeclaration("obj")),
													e.appendRight(
														C.start,
														"( " + g + " = {}, " + g + (C.computed ? "" : ".")
													)
											var P = C.key.end
											if (C.computed) {
												for (; "]" !== e.original[P]; ) P += 1
												P += 1
											}
											"Literal" !== C.key.type || C.computed
												? C.shorthand ||
												  (C.method && !C.computed && i.conciseMethodProperty)
													? e.overwrite(
															C.key.start,
															C.key.end,
															e.slice(C.key.start, C.key.end).replace(/:/, " =")
													  )
													: (C.value.start > P && e.remove(P, C.value.start),
													  e.prependLeft(P, " = "))
												: e.overwrite(
														C.start,
														C.key.end + 1,
														"[" + e.slice(C.start, C.key.end) + "] = "
												  ),
												!C.method ||
													(!C.computed && i.conciseMethodProperty) ||
													(C.value.generator && e.remove(C.start, C.key.start),
													e.prependRight(
														C.value.start,
														"function" + (C.value.generator ? "*" : "") + " "
													))
										} else
											"SpreadElement" === C.type
												? g &&
												  E > 0 &&
												  (_ || (_ = this.properties[E - 1]),
												  e.appendLeft(_.end, ", " + g + " )"),
												  (_ = null),
												  (g = null))
												: (!w &&
														s &&
														(e.prependRight(C.start, "{"),
														e.appendLeft(C.end, "}")),
												  (S = !0))
										if (w && ("SpreadElement" === C.type || C.computed)) {
											var L = S
												? this.properties[this.properties.length - 1].end
												: this.end - 1
											"," == e.original[L] && ++L
											var O = e.slice(L, b)
											e.prependLeft(A, O), e.remove(L, b), (w = !1)
										}
										var N = C.end
										if (E < k - 1 && !S) for (; "," !== e.original[N]; ) N += 1
										else E == k - 1 && (N = this.end)
										C.end != N && e.overwrite(C.end, N, "", { contentOnly: !0 })
									}
									!y && g && e.appendLeft(_.end, ", " + g + " )")
								}
							}),
							e
						)
					})(fe),
					Property: (function (t) {
						function e() {
							t.apply(this, arguments)
						}
						return (
							t && (e.__proto__ = t),
							((e.prototype = Object.create(t && t.prototype)).constructor = e),
							(e.prototype.initialise = function (e) {
								;("get" !== this.kind && "set" !== this.kind) ||
									!e.getterSetter ||
									_e.missingTransform(
										"getters and setters",
										"getterSetter",
										this
									),
									t.prototype.initialise.call(this, e)
							}),
							(e.prototype.transpile = function (e, i) {
								if (
									(t.prototype.transpile.call(this, e, i),
									i.conciseMethodProperty &&
										!this.computed &&
										"ObjectPattern" !== this.parent.type)
								)
									if (this.shorthand)
										e.prependRight(this.start, this.key.name + ": ")
									else if (this.method) {
										var r = ""
										!1 !== this.program.options.namedFunctionExpressions &&
											(r =
												" " +
												(r =
													"Literal" === this.key.type &&
													"number" == typeof this.key.value
														? ""
														: "Identifier" === this.key.type
														? ge[this.key.name] ||
														  !/^[a-z_$][a-z0-9_$]*$/i.test(this.key.name) ||
														  this.value.body.scope.references[this.key.name]
															? this.findScope(!0).createIdentifier(
																	this.key.name
															  )
															: this.key.name
														: this.findScope(!0).createIdentifier(
																this.key.value
														  ))),
											this.start < this.key.start &&
												e.remove(this.start, this.key.start),
											e.appendLeft(
												this.key.end,
												": " +
													(this.value.async ? "async " : "") +
													"function" +
													(this.value.generator ? "*" : "") +
													r
											)
									}
								i.reservedProperties &&
									ge[this.key.name] &&
									(e.prependRight(this.key.start, "'"),
									e.appendLeft(this.key.end, "'"))
							}),
							e
						)
					})(fe),
					ReturnStatement: (function (t) {
						function e() {
							t.apply(this, arguments)
						}
						return (
							t && (e.__proto__ = t),
							((e.prototype = Object.create(t && t.prototype)).constructor = e),
							(e.prototype.initialise = function (t) {
								;(this.loop = this.findNearest(Me)),
									(this.nearestFunction = this.findNearest(/Function/)),
									this.loop &&
										(!this.nearestFunction ||
											this.loop.depth > this.nearestFunction.depth) &&
										((this.loop.canReturn = !0), (this.shouldWrap = !0)),
									this.argument && this.argument.initialise(t)
							}),
							(e.prototype.transpile = function (t, e) {
								var i =
									this.shouldWrap &&
									this.loop &&
									this.loop.shouldRewriteAsFunction
								this.argument
									? (i && t.prependRight(this.argument.start, "{ v: "),
									  this.argument.transpile(t, e),
									  i && t.appendLeft(this.argument.end, " }"))
									: i && t.appendLeft(this.start + 6, " {}")
							}),
							e
						)
					})(fe),
					Super: (function (t) {
						function e() {
							t.apply(this, arguments)
						}
						return (
							t && (e.__proto__ = t),
							((e.prototype = Object.create(t && t.prototype)).constructor = e),
							(e.prototype.initialise = function (t) {
								if (t.classes) {
									if (
										((this.method = this.findNearest("MethodDefinition")),
										!this.method)
									)
										throw new _e("use of super outside class method", this)
									var e = this.findNearest("ClassBody").parent
									if (
										((this.superClassName =
											e.superClass && (e.superClass.name || "superclass")),
										!this.superClassName)
									)
										throw new _e("super used in base class", this)
									if (
										((this.isCalled =
											"CallExpression" === this.parent.type &&
											this === this.parent.callee),
										"constructor" !== this.method.kind && this.isCalled)
									)
										throw new _e(
											"super() not allowed outside class constructor",
											this
										)
									if (
										((this.isMember = "MemberExpression" === this.parent.type),
										!this.isCalled && !this.isMember)
									)
										throw new _e(
											"Unexpected use of `super` (expected `super(...)` or `super.*`)",
											this
										)
								}
								if (t.arrow) {
									var i = this.findLexicalBoundary(),
										r = this.findNearest("ArrowFunctionExpression"),
										n = this.findNearest(Me)
									r && r.depth > i.depth && (this.thisAlias = i.getThisAlias()),
										n &&
											n.body.contains(this) &&
											n.depth > i.depth &&
											(this.thisAlias = i.getThisAlias())
								}
							}),
							(e.prototype.transpile = function (t, e) {
								if (e.classes) {
									t.overwrite(
										this.start,
										this.end,
										this.isCalled || this.method.static
											? this.superClassName
											: this.superClassName + ".prototype",
										{ storeName: !0, contentOnly: !0 }
									)
									var i = this.isCalled ? this.parent : this.parent.parent
									if (i && "CallExpression" === i.type) {
										this.noCall || t.appendLeft(i.callee.end, ".call")
										var r = this.thisAlias || "this"
										i.arguments.length
											? t.appendLeft(i.arguments[0].start, r + ", ")
											: t.appendLeft(i.end - 1, "" + r)
									}
								}
							}),
							e
						)
					})(fe),
					TaggedTemplateExpression: (function (t) {
						function e() {
							t.apply(this, arguments)
						}
						return (
							t && (e.__proto__ = t),
							((e.prototype = Object.create(t && t.prototype)).constructor = e),
							(e.prototype.initialise = function (e) {
								e.templateString &&
									!e.dangerousTaggedTemplateString &&
									_e.missingTransform(
										"tagged template strings",
										"templateString",
										this,
										"dangerousTaggedTemplateString"
									),
									t.prototype.initialise.call(this, e)
							}),
							(e.prototype.transpile = function (e, i) {
								if (i.templateString && i.dangerousTaggedTemplateString) {
									var r = this.quasi.expressions
											.concat(this.quasi.quasis)
											.sort(function (t, e) {
												return t.start - e.start
											}),
										n = this.program.body.scope,
										s = this.quasi.quasis
											.map(function (t) {
												return JSON.stringify(t.value.cooked)
											})
											.join(", "),
										a = this.program.templateLiteralQuasis[s]
									a ||
										((a = n.createIdentifier("templateObject")),
										e.prependLeft(
											this.program.prependAt,
											"var " + a + " = Object.freeze([" + s + "]);\n"
										),
										(this.program.templateLiteralQuasis[s] = a)),
										e.overwrite(this.tag.end, r[0].start, "(" + a)
									var o = r[0].start
									r.forEach(function (t) {
										"TemplateElement" === t.type
											? e.remove(o, t.end)
											: e.overwrite(o, t.start, ", "),
											(o = t.end)
									}),
										e.overwrite(o, this.end, ")")
								}
								t.prototype.transpile.call(this, e, i)
							}),
							e
						)
					})(fe),
					TemplateElement: (function (t) {
						function e() {
							t.apply(this, arguments)
						}
						return (
							t && (e.__proto__ = t),
							((e.prototype = Object.create(t && t.prototype)).constructor = e),
							(e.prototype.initialise = function () {
								this.program.indentExclusionElements.push(this)
							}),
							e
						)
					})(fe),
					TemplateLiteral: (function (t) {
						function e() {
							t.apply(this, arguments)
						}
						return (
							t && (e.__proto__ = t),
							((e.prototype = Object.create(t && t.prototype)).constructor = e),
							(e.prototype.transpile = function (e, i) {
								if (
									(t.prototype.transpile.call(this, e, i),
									i.templateString &&
										"TaggedTemplateExpression" !== this.parent.type)
								) {
									var r = this.expressions
										.concat(this.quasis)
										.sort(function (t, e) {
											return t.start - e.start || t.end - e.end
										})
										.filter(function (t, e) {
											return "TemplateElement" !== t.type || !!t.value.raw || !e
										})
									if (r.length >= 3) {
										var n = r[0]
										"TemplateElement" === n.type &&
											"" === n.value.raw &&
											"TemplateElement" === r[2].type &&
											r.shift()
									}
									var s = !(
										(1 === this.quasis.length &&
											0 === this.expressions.length) ||
										"TemplateLiteral" === this.parent.type ||
										"AssignmentExpression" === this.parent.type ||
										"AssignmentPattern" === this.parent.type ||
										"VariableDeclarator" === this.parent.type ||
										("BinaryExpression" === this.parent.type &&
											"+" === this.parent.operator)
									)
									s && e.appendRight(this.start, "(")
									var a = this.start
									r.forEach(function (t, i) {
										var r = 0 === i ? (s ? "(" : "") : " + "
										if ("TemplateElement" === t.type)
											e.overwrite(a, t.end, r + JSON.stringify(t.value.cooked))
										else {
											var n = "Identifier" !== t.type
											n && (r += "("),
												e.remove(a, t.start),
												r && e.prependRight(t.start, r),
												n && e.appendLeft(t.end, ")")
										}
										a = t.end
									}),
										s && e.appendLeft(a, ")"),
										e.overwrite(a, this.end, "", { contentOnly: !0 })
								}
							}),
							e
						)
					})(fe),
					ThisExpression: (function (t) {
						function e() {
							t.apply(this, arguments)
						}
						return (
							t && (e.__proto__ = t),
							((e.prototype = Object.create(t && t.prototype)).constructor = e),
							(e.prototype.initialise = function (t) {
								var e = this.findLexicalBoundary()
								if (t.letConst)
									for (var i = this.findNearest(Me); i && i.depth > e.depth; )
										i.thisRefs.push(this), (i = i.parent.findNearest(Me))
								if (t.arrow) {
									var r = this.findNearest("ArrowFunctionExpression")
									r && r.depth > e.depth && (this.alias = e.getThisAlias())
								}
							}),
							(e.prototype.transpile = function (t) {
								this.alias &&
									t.overwrite(this.start, this.end, this.alias, {
										storeName: !0,
										contentOnly: !0
									})
							}),
							e
						)
					})(fe),
					UpdateExpression: (function (t) {
						function e() {
							t.apply(this, arguments)
						}
						return (
							t && (e.__proto__ = t),
							((e.prototype = Object.create(t && t.prototype)).constructor = e),
							(e.prototype.initialise = function (e) {
								if ("Identifier" === this.argument.type) {
									var i = this.findScope(!1).findDeclaration(
											this.argument.name
										),
										r = i && i.node.ancestor(3)
									r &&
										"ForStatement" === r.type &&
										r.body.contains(this) &&
										(r.reassigned[this.argument.name] = !0)
								}
								t.prototype.initialise.call(this, e)
							}),
							(e.prototype.transpile = function (e, i) {
								"Identifier" === this.argument.type &&
									Ve(this.argument, this.findScope(!1)),
									t.prototype.transpile.call(this, e, i)
							}),
							e
						)
					})(fe),
					VariableDeclaration: (function (t) {
						function e() {
							t.apply(this, arguments)
						}
						return (
							t && (e.__proto__ = t),
							((e.prototype = Object.create(t && t.prototype)).constructor = e),
							(e.prototype.initialise = function (t) {
								;(this.scope = this.findScope("var" === this.kind)),
									this.declarations.forEach(function (e) {
										return e.initialise(t)
									})
							}),
							(e.prototype.transpile = function (t, e) {
								var i = this,
									r = this.getIndentation(),
									n = this.kind
								if (
									(e.letConst &&
										"var" !== n &&
										t.overwrite(
											this.start,
											this.start + this.kind.length,
											(n = "var"),
											{ contentOnly: !0, storeName: !0 }
										),
									e.destructuring &&
										"ForOfStatement" !== this.parent.type &&
										"ForInStatement" !== this.parent.type)
								) {
									var s,
										a = this.start
									this.declarations.forEach(function (n, o) {
										if ((n.transpile(t, e), "Identifier" === n.id.type))
											o > 0 &&
												"Identifier" !== i.declarations[o - 1].id.type &&
												t.overwrite(a, n.id.start, "var ")
										else {
											var p = Me.test(i.parent.type)
											0 === o
												? t.remove(a, n.id.start)
												: t.overwrite(a, n.id.start, ";\n" + r)
											var h = "Identifier" === n.init.type && !n.init.rewritten,
												c = h
													? n.init.alias || n.init.name
													: n.findScope(!0).createIdentifier("ref")
											a = n.start
											var l = []
											h
												? t.remove(n.id.end, n.end)
												: l.push(function (e, i, r) {
														t.prependRight(n.id.end, "var " + c),
															t.appendLeft(n.init.end, "" + r),
															t.move(n.id.end, n.end, e)
												  })
											var u = n.findScope(!1)
											we(
												t,
												function (t) {
													return u.createIdentifier(t)
												},
												function (t) {
													return u.resolveName(t.name)
												},
												n.id,
												c,
												p,
												l
											)
											var d = p ? "var " : "",
												f = p ? ", " : ";\n" + r
											l.forEach(function (t, e) {
												o === i.declarations.length - 1 &&
													e === l.length - 1 &&
													(f = p ? "" : ";"),
													t(n.start, 0 === e ? d : "", f)
											})
										}
										;(a = n.end), (s = "Identifier" !== n.id.type)
									}),
										s &&
											this.end > a &&
											t.overwrite(a, this.end, "", { contentOnly: !0 })
								} else
									this.declarations.forEach(function (i) {
										i.transpile(t, e)
									})
							}),
							e
						)
					})(fe),
					VariableDeclarator: (function (t) {
						function e() {
							t.apply(this, arguments)
						}
						return (
							t && (e.__proto__ = t),
							((e.prototype = Object.create(t && t.prototype)).constructor = e),
							(e.prototype.initialise = function (e) {
								var i = this.parent.kind
								"let" === i &&
									"ForStatement" === this.parent.parent.type &&
									(i = "for.let"),
									this.parent.scope.addDeclaration(this.id, i),
									t.prototype.initialise.call(this, e)
							}),
							(e.prototype.transpile = function (t, e) {
								if (!this.init && e.letConst && "var" !== this.parent.kind) {
									var i = this.findNearest(
										/Function|^For(In|Of)?Statement|^(?:Do)?WhileStatement/
									)
									!i ||
										/Function/.test(i.type) ||
										this.isLeftDeclaratorOfLoop() ||
										t.appendLeft(this.id.end, " = (void 0)")
								}
								this.id && this.id.transpile(t, e),
									this.init && this.init.transpile(t, e)
							}),
							(e.prototype.isLeftDeclaratorOfLoop = function () {
								return (
									this.parent &&
									"VariableDeclaration" === this.parent.type &&
									this.parent.parent &&
									("ForInStatement" === this.parent.parent.type ||
										"ForOfStatement" === this.parent.parent.type) &&
									this.parent.parent.left &&
									this.parent.parent.left.declarations[0] === this
								)
							}),
							e
						)
					})(fe),
					WhileStatement: Ze
				},
				fi = { Program: ["body"], Literal: [] },
				mi = {
					IfStatement: "consequent",
					ForStatement: "body",
					ForInStatement: "body",
					ForOfStatement: "body",
					WhileStatement: "body",
					DoWhileStatement: "body",
					ArrowFunctionExpression: "body"
				}
			function yi(t, e, i, r) {
				;(this.type = "Root"),
					(this.jsx = r.jsx || "React.createElement"),
					(this.options = r),
					(this.source = t),
					(this.magicString = new ue(t)),
					(this.ast = e),
					(this.depth = 0),
					(function t(e, i) {
						if (e)
							if ("length" in e) for (var r = e.length; r--; ) t(e[r], i)
							else if (!e.__wrapped) {
								;(e.__wrapped = !0),
									fi[e.type] ||
										(fi[e.type] = Object.keys(e).filter(function (t) {
											return "object" == typeof e[t]
										}))
								var n = mi[e.type]
								if (n && "BlockStatement" !== e[n].type) {
									var s = e[n]
									e[n] = {
										start: s.start,
										end: s.end,
										type: "BlockStatement",
										body: [s],
										synthetic: !0
									}
								}
								;(e.parent = i),
									(e.program = i.program || i),
									(e.depth = i.depth + 1),
									(e.keys = fi[e.type]),
									(e.indentation = void 0)
								for (var a = 0, o = fi[e.type]; a < o.length; a += 1)
									t(e[o[a]], e)
								e.program.magicString.addSourcemapLocation(e.start),
									e.program.magicString.addSourcemapLocation(e.end),
									(e.__proto__ = (
										("BlockStatement" === e.type ? Ie : di[e.type]) || fe
									).prototype)
							}
					})((this.body = e), this),
					(this.body.__proto__ = Ie.prototype),
					(this.templateLiteralQuasis = Object.create(null))
				for (var n = 0; n < this.body.body.length; ++n)
					if (!this.body.body[n].directive) {
						this.prependAt = this.body.body[n].start
						break
					}
				;(this.objectWithoutPropertiesHelper = null),
					(this.indentExclusionElements = []),
					this.body.initialise(i),
					(this.indentExclusions = Object.create(null))
				for (var s = 0, a = this.indentExclusionElements; s < a.length; s += 1)
					for (var o = a[s], p = o.start; p < o.end; p += 1)
						this.indentExclusions[p] = !0
				this.body.transpile(this.magicString, i)
			}
			yi.prototype = {
				export: function (t) {
					return (
						void 0 === t && (t = {}),
						{
							code: this.magicString.toString(),
							map: this.magicString.generateMap({
								file: t.file,
								source: t.source,
								includeContent: !1 !== t.includeContent
							})
						}
					)
				},
				findNearest: function () {
					return null
				},
				findScope: function () {
					return null
				},
				getObjectWithoutPropertiesHelper: function (t) {
					return (
						this.objectWithoutPropertiesHelper ||
							((this.objectWithoutPropertiesHelper = this.body.scope.createIdentifier(
								"objectWithoutProperties"
							)),
							t.prependLeft(
								this.prependAt,
								"function " +
									this.objectWithoutPropertiesHelper +
									" (obj, exclude) { var target = {}; for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k) && exclude.indexOf(k) === -1) target[k] = obj[k]; return target; }\n"
							)),
						this.objectWithoutPropertiesHelper
					)
				}
			}
			var gi = B.extend(Zt, Jt(), function (t) {
					return class extends t {
						getTokenFromCode(t) {
							if (35 === t) {
								++this.pos
								const t = this.readWord1()
								return this.finishToken(te, t)
							}
							return super.getTokenFromCode(t)
						}
						parseClass(t, e) {
							this._privateBoundNamesStack = this._privateBoundNamesStack || []
							const i = Object.create(
								this._privateBoundNamesStack[
									this._privateBoundNamesStack.length - 1
								] || null
							)
							this._privateBoundNamesStack.push(i),
								(this._unresolvedPrivateNamesStack =
									this._unresolvedPrivateNamesStack || [])
							const r = Object.create(null)
							this._unresolvedPrivateNamesStack.push(r)
							const n = super.parseClass(t, e)
							if (
								(this._privateBoundNamesStack.pop(),
								this._unresolvedPrivateNamesStack.pop(),
								this._unresolvedPrivateNamesStack.length)
							)
								Object.assign(
									this._unresolvedPrivateNamesStack[
										this._unresolvedPrivateNamesStack.length - 1
									],
									r
								)
							else {
								const t = Object.keys(r)
								t.length &&
									(t.sort((t, e) => r[t] - r[e]),
									this.raise(r[t[0]], "Usage of undeclared private name"))
							}
							return n
						}
						parseClassElement(t) {
							if (this.eat(Qt.semi)) return null
							const e = this.startNode()
							if (!(this.options.ecmaVersion >= 8) || this.type != te) {
								if (this.isContextual("async")) {
									Gt.lastIndex = this.pos
									let t = Gt.exec(this.input),
										i = this.input.charAt(this.pos + t[0].length)
									if (";" === i || "=" === i)
										return (
											(e.key = this.parseIdent(!0)),
											(e.computed = !1),
											$t.call(this, e),
											this.finishNode(e, "FieldDefinition"),
											this.semicolon(),
											e
										)
								}
								return super.parseClassElement.apply(this, arguments)
							}
							return (
								(e.key = Yt.call(this)),
								(e.computed = !1),
								"constructor" == e.key.name &&
									this.raise(
										e.start,
										"Classes may not have a field named constructor"
									),
								Object.prototype.hasOwnProperty.call(
									this._privateBoundNamesStack[
										this._privateBoundNamesStack.length - 1
									],
									e.key.name
								) && this.raise(e.start, "Duplicate private element"),
								(this._privateBoundNamesStack[
									this._privateBoundNamesStack.length - 1
								][e.key.name] = !0),
								delete this._unresolvedPrivateNamesStack[
									this._unresolvedPrivateNamesStack.length - 1
								][e.key.name],
								$t.call(this, e),
								this.finishNode(e, "FieldDefinition"),
								this.semicolon(),
								e
							)
						}
						parseClassMethod(t, e, i, r) {
							return e ||
								i ||
								"method" != t.kind ||
								t.static ||
								this.options.ecmaVersion < 8 ||
								this.type == Qt.parenL
								? super.parseClassMethod.apply(this, arguments)
								: ($t.call(this, t),
								  delete t.kind,
								  delete t.static,
								  (t = this.finishNode(t, "FieldDefinition")),
								  this.semicolon(),
								  t)
						}
						parseSubscripts(t, e, i, r) {
							for (let n; ; ) {
								if (!(n = this.eat(Qt.bracketL)) && !this.eat(Qt.dot))
									return super.parseSubscripts(t, e, i, r)
								{
									let r = this.startNodeAt(e, i)
									;(r.object = t),
										n
											? (r.property = this.parseExpression())
											: this.type == te
											? ((r.property = Yt.call(this)),
											  (this._privateBoundNamesStack.length &&
													this._privateBoundNamesStack[
														this._privateBoundNamesStack.length - 1
													][r.property.name]) ||
													(this._unresolvedPrivateNamesStack[
														this._unresolvedPrivateNamesStack.length - 1
													][r.property.name] = r.property.start))
											: (r.property = this.parseIdent(!0)),
										(r.computed = Boolean(n)),
										n && this.expect(Qt.bracketR),
										(t = this.finishNode(r, "MemberExpression"))
								}
							}
						}
						parseMaybeUnary(t, e) {
							const i = super.parseMaybeUnary(t, e)
							return (
								"delete" == i.operator &&
									"MemberExpression" == i.argument.type &&
									"PrivateName" == i.argument.property.type &&
									this.raise(i.start, "Private elements may not be deleted"),
								i
							)
						}
						parseIdent(t, e) {
							const i = super.parseIdent(t, e)
							return (
								this._inFieldValue &&
									"arguments" == i.name &&
									this.raise(
										i.start,
										"A class field initializer may not contain arguments"
									),
								i
							)
						}
						parseExprAtom(t) {
							const e = super.parseExprAtom(t)
							return (
								this._inFieldValue &&
									"Super" == e.type &&
									this.raise(
										e.start,
										"A class field initializer may not contain super"
									),
								e
							)
						}
					}
				}),
				vi = [
					"getterSetter",
					"arrow",
					"classes",
					"computedProperty",
					"conciseMethodProperty",
					"defaultParameter",
					"destructuring",
					"forOf",
					"generator",
					"letConst",
					"moduleExport",
					"moduleImport",
					"numericLiteral",
					"parameterDestructuring",
					"spreadRest",
					"stickyRegExp",
					"templateString",
					"exponentiation",
					"reservedProperties",
					"trailingFunctionCommas",
					"asyncAwait",
					"objectRestSpread"
				],
				xi = ["dangerousTaggedTemplateString", "dangerousForOf"]
			function bi(t, e) {
				var i
				void 0 === e && (e = {})
				var r = null
				try {
					;(i = gi.parse(t, {
						ecmaVersion: 10,
						preserveParens: !0,
						sourceType: "module",
						allowAwaitOutsideFunction: !0,
						allowReturnOutsideFunction: !0,
						allowHashBang: !0,
						onComment: function (t, e) {
							if (!r) {
								var i = /@jsx\s+([^\s]+)/.exec(e)
								i && (r = i[1])
							}
						}
					})),
						(e.jsx = r || e.jsx)
				} catch (e) {
					throw (
						((e.snippet = be(t, e.loc)),
						(e.toString = function () {
							return e.name + ": " + e.message + "\n" + e.snippet
						}),
						e)
					)
				}
				var n = Object.create(null)
				return (
					vi.forEach(function (t) {
						n[t] = !0
					}),
					xi.forEach(function (t) {
						n[t] = !0
					}),
					Object.keys(e.transforms || {}).forEach(function (t) {
						if ("modules" === t)
							return (
								"moduleImport" in e.transforms ||
									(n.moduleImport = e.transforms.modules),
								void (
									"moduleExport" in e.transforms ||
									(n.moduleExport = e.transforms.modules)
								)
							)
						if (!(t in n)) throw new Error("Unknown transform '" + t + "'")
						n[t] = e.transforms[t]
					}),
					!0 === e.objectAssign && (e.objectAssign = "Object.assign"),
					new yi(t, i, n, e).export(e)
				)
			}
		},
		6159: function (t, e, i) {
			"use strict"
			i.d(e, {
				N: function () {
					return u
				},
				Z: function () {
					return d
				}
			})
			var r = i(3366),
				n = i(7462),
				s = i(7294),
				a = i(6010),
				o = i(4973),
				p = i(3018),
				h = "enhancedAnchor_2LWZ",
				c = "h1Heading_27L5",
				l = ["id"],
				u = function (t) {
					var e = Object.assign({}, t)
					return s.createElement(
						"header",
						null,
						s.createElement(
							"h1",
							(0, n.Z)({}, e, { id: void 0, className: c }),
							e.children
						)
					)
				},
				d = function (t) {
					return "h1" === t
						? u
						: ((e = t),
						  function (t) {
								var i,
									n = t.id,
									c = (0, r.Z)(t, l),
									u = (0, p.LU)().navbar.hideOnScroll
								return n
									? s.createElement(
											e,
											c,
											s.createElement("a", {
												"aria-hidden": "true",
												tabIndex: -1,
												className: (0, a.Z)(
													"anchor",
													((i = {}), (i[h] = !u), i)
												),
												id: n
											}),
											c.children,
											s.createElement(
												"a",
												{
													className: "hash-link",
													href: "#" + n,
													title: (0, o.I)({
														id: "theme.common.headingLinkTitle",
														message: "Direct link to heading",
														description: "Title for link to heading"
													})
												},
												"#"
											)
									  )
									: s.createElement(e, c)
						  })
					var e
				}
		},
		6684: function (t, e, i) {
			"use strict"
			i.d(e, {
				Z: function () {
					return yt
				}
			})
			var r = i(7462),
				n = i(7294),
				s = i(6742),
				a = i(3366),
				o = (i(5697), i(460)),
				p = i(7410),
				h = {
					plain: { backgroundColor: "#2a2734", color: "#9a86fd" },
					styles: [
						{
							types: ["comment", "prolog", "doctype", "cdata", "punctuation"],
							style: { color: "#6c6783" }
						},
						{ types: ["namespace"], style: { opacity: 0.7 } },
						{
							types: ["tag", "operator", "number"],
							style: { color: "#e09142" }
						},
						{ types: ["property", "function"], style: { color: "#9a86fd" } },
						{
							types: ["tag-id", "selector", "atrule-id"],
							style: { color: "#eeebff" }
						},
						{ types: ["attr-name"], style: { color: "#c4b9fe" } },
						{
							types: [
								"boolean",
								"string",
								"entity",
								"url",
								"attr-value",
								"keyword",
								"control",
								"directive",
								"unit",
								"statement",
								"regex",
								"at-rule",
								"placeholder",
								"variable"
							],
							style: { color: "#ffcc99" }
						},
						{
							types: ["deleted"],
							style: { textDecorationLine: "line-through" }
						},
						{ types: ["inserted"], style: { textDecorationLine: "underline" } },
						{ types: ["italic"], style: { fontStyle: "italic" } },
						{ types: ["important", "bold"], style: { fontWeight: "bold" } },
						{ types: ["important"], style: { color: "#c4b9fe" } }
					]
				},
				c = { Prism: p.Z, theme: h }
			function l(t, e, i) {
				return (
					e in t
						? Object.defineProperty(t, e, {
								value: i,
								enumerable: !0,
								configurable: !0,
								writable: !0
						  })
						: (t[e] = i),
					t
				)
			}
			function u() {
				return (u =
					Object.assign ||
					function (t) {
						for (var e = 1; e < arguments.length; e++) {
							var i = arguments[e]
							for (var r in i)
								Object.prototype.hasOwnProperty.call(i, r) && (t[r] = i[r])
						}
						return t
					}).apply(this, arguments)
			}
			var d = /\r\n|\r|\n/,
				f = function (t) {
					0 === t.length
						? t.push({ types: ["plain"], content: "\n", empty: !0 })
						: 1 === t.length &&
						  "" === t[0].content &&
						  ((t[0].content = "\n"), (t[0].empty = !0))
				},
				m = function (t, e) {
					var i = t.length
					return i > 0 && t[i - 1] === e ? t : t.concat(e)
				},
				y = function (t, e) {
					var i = t.plain,
						r = Object.create(null),
						n = t.styles.reduce(function (t, i) {
							var r = i.languages,
								n = i.style
							return (
								(r && !r.includes(e)) ||
									i.types.forEach(function (e) {
										var i = u({}, t[e], n)
										t[e] = i
									}),
								t
							)
						}, r)
					return (
						(n.root = i), (n.plain = u({}, i, { backgroundColor: null })), n
					)
				}
			function g(t, e) {
				var i = {}
				for (var r in t)
					Object.prototype.hasOwnProperty.call(t, r) &&
						-1 === e.indexOf(r) &&
						(i[r] = t[r])
				return i
			}
			var v = (function (t) {
					function e() {
						for (var e = this, i = [], r = arguments.length; r--; )
							i[r] = arguments[r]
						t.apply(this, i),
							l(this, "getThemeDict", function (t) {
								if (
									void 0 !== e.themeDict &&
									t.theme === e.prevTheme &&
									t.language === e.prevLanguage
								)
									return e.themeDict
								;(e.prevTheme = t.theme), (e.prevLanguage = t.language)
								var i = t.theme ? y(t.theme, t.language) : void 0
								return (e.themeDict = i)
							}),
							l(this, "getLineProps", function (t) {
								var i = t.key,
									r = t.className,
									n = t.style,
									s = u({}, g(t, ["key", "className", "style", "line"]), {
										className: "token-line",
										style: void 0,
										key: void 0
									}),
									a = e.getThemeDict(e.props)
								return (
									void 0 !== a && (s.style = a.plain),
									void 0 !== n &&
										(s.style = void 0 !== s.style ? u({}, s.style, n) : n),
									void 0 !== i && (s.key = i),
									r && (s.className += " " + r),
									s
								)
							}),
							l(this, "getStyleForToken", function (t) {
								var i = t.types,
									r = t.empty,
									n = i.length,
									s = e.getThemeDict(e.props)
								if (void 0 !== s) {
									if (1 === n && "plain" === i[0])
										return r ? { display: "inline-block" } : void 0
									if (1 === n && !r) return s[i[0]]
									var a = r ? { display: "inline-block" } : {},
										o = i.map(function (t) {
											return s[t]
										})
									return Object.assign.apply(Object, [a].concat(o))
								}
							}),
							l(this, "getTokenProps", function (t) {
								var i = t.key,
									r = t.className,
									n = t.style,
									s = t.token,
									a = u({}, g(t, ["key", "className", "style", "token"]), {
										className: "token " + s.types.join(" "),
										children: s.content,
										style: e.getStyleForToken(s),
										key: void 0
									})
								return (
									void 0 !== n &&
										(a.style = void 0 !== a.style ? u({}, a.style, n) : n),
									void 0 !== i && (a.key = i),
									r && (a.className += " " + r),
									a
								)
							}),
							l(this, "tokenize", function (t, e, i, r) {
								var n = { code: e, grammar: i, language: r, tokens: [] }
								t.hooks.run("before-tokenize", n)
								var s = (n.tokens = t.tokenize(n.code, n.grammar, n.language))
								return t.hooks.run("after-tokenize", n), s
							})
					}
					return (
						t && (e.__proto__ = t),
						(e.prototype = Object.create(t && t.prototype)),
						(e.prototype.constructor = e),
						(e.prototype.render = function () {
							var t = this.props,
								e = t.Prism,
								i = t.language,
								r = t.code,
								n = t.children,
								s = this.getThemeDict(this.props),
								a = e.languages[i]
							return n({
								tokens: (function (t) {
									for (
										var e = [[]],
											i = [t],
											r = [0],
											n = [t.length],
											s = 0,
											a = 0,
											o = [],
											p = [o];
										a > -1;

									) {
										for (; (s = r[a]++) < n[a]; ) {
											var h = void 0,
												c = e[a],
												l = i[a][s]
											if (
												("string" == typeof l
													? ((c = a > 0 ? c : ["plain"]), (h = l))
													: ((c = m(c, l.type)),
													  l.alias && (c = m(c, l.alias)),
													  (h = l.content)),
												"string" == typeof h)
											) {
												var u = h.split(d),
													y = u.length
												o.push({ types: c, content: u[0] })
												for (var g = 1; g < y; g++)
													f(o),
														p.push((o = [])),
														o.push({ types: c, content: u[g] })
											} else
												a++, e.push(c), i.push(h), r.push(0), n.push(h.length)
										}
										a--, e.pop(), i.pop(), r.pop(), n.pop()
									}
									return f(o), p
								})(void 0 !== a ? this.tokenize(e, r, a, i) : [r]),
								className: "prism-code language-" + i,
								style: void 0 !== s ? s.root : {},
								getLineProps: this.getLineProps,
								getTokenProps: this.getTokenProps
							})
						}),
						e
					)
				})(n.Component),
				x = i(5420),
				b = i(7671),
				_ = i.n(b),
				k = {
					plain: { color: "#C5C8C6", backgroundColor: "#1D1F21" },
					styles: [
						{
							types: ["prolog", "comment", "doctype", "cdata"],
							style: { color: "hsl(30, 20%, 50%)" }
						},
						{
							types: [
								"property",
								"tag",
								"boolean",
								"number",
								"constant",
								"symbol"
							],
							style: { color: "hsl(350, 40%, 70%)" }
						},
						{
							types: ["attr-name", "string", "char", "builtin", "insterted"],
							style: { color: "hsl(75, 70%, 60%)" }
						},
						{
							types: [
								"operator",
								"entity",
								"url",
								"string",
								"variable",
								"language-css"
							],
							style: { color: "hsl(40, 90%, 60%)" }
						},
						{ types: ["deleted"], style: { color: "rgb(255, 85, 85)" } },
						{ types: ["italic"], style: { fontStyle: "italic" } },
						{ types: ["important", "bold"], style: { fontWeight: "bold" } },
						{ types: ["regex", "important"], style: { color: "#e90" } },
						{
							types: ["atrule", "attr-value", "keyword"],
							style: { color: "hsl(350, 40%, 70%)" }
						},
						{ types: ["punctuation", "symbol"], style: { opacity: "0.7" } }
					]
				},
				S =
					"function" == typeof Symbol && "symbol" == typeof Symbol.iterator
						? function (t) {
								return typeof t
						  }
						: function (t) {
								return t &&
									"function" == typeof Symbol &&
									t.constructor === Symbol &&
									t !== Symbol.prototype
									? "symbol"
									: typeof t
						  },
				w = function (t, e) {
					if (!(t instanceof e))
						throw new TypeError("Cannot call a class as a function")
				},
				E =
					Object.assign ||
					function (t) {
						for (var e = 1; e < arguments.length; e++) {
							var i = arguments[e]
							for (var r in i)
								Object.prototype.hasOwnProperty.call(i, r) && (t[r] = i[r])
						}
						return t
					},
				C = function (t, e) {
					if ("function" != typeof e && null !== e)
						throw new TypeError(
							"Super expression must either be null or a function, not " +
								typeof e
						)
					;(t.prototype = Object.create(e && e.prototype, {
						constructor: {
							value: t,
							enumerable: !1,
							writable: !0,
							configurable: !0
						}
					})),
						e &&
							(Object.setPrototypeOf
								? Object.setPrototypeOf(t, e)
								: (t.__proto__ = e))
				},
				A = function (t, e) {
					var i = {}
					for (var r in t)
						e.indexOf(r) >= 0 ||
							(Object.prototype.hasOwnProperty.call(t, r) && (i[r] = t[r]))
					return i
				},
				I = function (t, e) {
					if (!t)
						throw new ReferenceError(
							"this hasn't been initialised - super() hasn't been called"
						)
					return !e || ("object" != typeof e && "function" != typeof e) ? t : e
				},
				P = function (t) {
					var e = (0, n.useState)({ code: t.code || "" }),
						i = e[0],
						r = e[1]
					;(0, n.useEffect)(
						function () {
							i.prevCodeProp &&
								t.code !== i.prevCodeProp &&
								r({ code: t.code, prevCodeProp: t.code })
						},
						[t.code]
					)
					;(0, n.useEffect)(
						function () {
							t.onChange && t.onChange(i.code)
						},
						[i.code]
					)
					var s = t.style,
						a = t.theme,
						h = (t.onChange, A(t, ["style", "theme", "onChange"])),
						c = i.code,
						l = a && "object" === S(a.plain) ? a.plain : {}
					return n.createElement(
						o.Z,
						E(
							{
								value: c,
								padding: 10,
								highlight: function (e) {
									return n.createElement(
										v,
										{
											Prism: p.Z,
											code: e,
											theme: t.theme || k,
											language: t.language
										},
										function (t) {
											var e = t.tokens,
												i = t.getLineProps,
												r = t.getTokenProps
											return n.createElement(
												n.Fragment,
												null,
												e.map(function (t, e) {
													return n.createElement(
														"div",
														i({ line: t, key: e }),
														t.map(function (t, e) {
															return n.createElement(
																"span",
																r({ token: t, key: e })
															)
														})
													)
												})
											)
										}
									)
								},
								onValueChange: function (t) {
									r({ code: t })
								},
								style: E({ whiteSpace: "pre", fontFamily: "monospace" }, l, s)
							},
							h
						)
					)
				},
				L = (0, n.createContext)({}),
				O = { assign: _() },
				N = function (t) {
					var e =
							arguments.length > 1 && void 0 !== arguments[1]
								? arguments[1]
								: {},
						i = E({}, e, {
							objectAssign: "_poly.assign",
							transforms: E(
								{ dangerousForOf: !0, dangerousTaggedTemplateString: !0 },
								e.transforms
							)
						})
					return (0, x.v)(t, i).code
				},
				j = function (t, e) {
					return (function (i) {
						function r() {
							return w(this, r), I(this, i.apply(this, arguments))
						}
						return (
							C(r, i),
							(r.prototype.componentDidCatch = function (t) {
								e(t)
							}),
							(r.prototype.render = function () {
								return "function" == typeof t ? n.createElement(t, null) : t
							}),
							r
						)
					})(n.Component)
				},
				T = function (t, e) {
					var i = Object.keys(e),
						r = i.map(function (t) {
							return e[t]
						})
					return new (Function.prototype.bind.apply(
						Function,
						[null].concat(["_poly", "React"], i, [t])
					))().apply(void 0, [O, n].concat(r))
				}
			function R(t) {
				var e = t.children,
					i = t.code,
					r = t.language,
					s = t.theme,
					a = t.disabled,
					o = t.scope,
					p = t.transformCode,
					h = t.transpileOptions,
					c = t.noInline,
					l = void 0 !== c && c,
					u = (0, n.useState)({ error: void 0, element: void 0 }),
					d = u[0],
					f = u[1]
				function m(t) {
					var e = { code: p ? p(t) : t, scope: o, transpileOptions: h },
						i = function (t) {
							return f({ error: t.toString(), element: void 0 })
						},
						r = function (t) {
							return f({ error: void 0, element: t })
						}
					try {
						l
							? (f({ error: void 0, element: null }),
							  (function (t, e, i) {
									var r = t.code,
										n = void 0 === r ? "" : r,
										s = t.scope,
										a = void 0 === s ? {} : s,
										o = t.transpileOptions
									if (!/render\s*\(/.test(n))
										return i(
											new SyntaxError(
												"No-Inline evaluations must call `render`."
											)
										)
									T(
										N(n, o),
										E({}, a, {
											render: function (t) {
												void 0 === t
													? i(
															new SyntaxError(
																"`render` must be called with valid JSX."
															)
													  )
													: e(j(t, i))
											}
										})
									)
							  })(e, r, i))
							: r(
									(function (t, e) {
										var i = t.code,
											r = void 0 === i ? "" : i,
											n = t.scope,
											s = void 0 === n ? {} : n,
											a = t.transpileOptions,
											o = r.trim().replace(/;$/, ""),
											p = N("return (" + o + ")", a).trim()
										return j(T(p, s), e)
									})(e, i)
							  )
					} catch (n) {
						i(n)
					}
				}
				;(0, n.useEffect)(
					function () {
						m(i)
					},
					[i, o, l, p, h]
				)
				return n.createElement(
					L.Provider,
					{
						value: E({}, d, {
							code: i,
							language: r,
							theme: s,
							disabled: a,
							onError: function (t) {
								return f({ error: t.toString() })
							},
							onChange: function (t) {
								return m(t)
							}
						})
					},
					e
				)
			}
			function V(t) {
				var e = (0, n.useContext)(L),
					i = e.code,
					r = e.language,
					s = e.theme,
					a = e.disabled,
					o = e.onChange
				return n.createElement(
					P,
					E({ theme: s, code: i, language: r, disabled: a, onChange: o }, t)
				)
			}
			function D(t) {
				var e = (0, n.useContext)(L).error
				return e ? n.createElement("pre", t, e) : null
			}
			function F(t) {
				var e = t.Component,
					i = A(t, ["Component"]),
					r = (0, n.useContext)(L).element
				return n.createElement(e, i, r ? n.createElement(r, null) : null)
			}
			;(R.defaultProps = {
				code: "",
				noInline: !1,
				language: "jsx",
				disabled: !1
			}),
				(F.defaultProps = { Component: "div" })
			var B = i(6010),
				M = i(4973),
				U = i(2263),
				q = {
					plain: { color: "#bfc7d5", backgroundColor: "#292d3e" },
					styles: [
						{
							types: ["comment"],
							style: { color: "rgb(105, 112, 152)", fontStyle: "italic" }
						},
						{
							types: ["string", "inserted"],
							style: { color: "rgb(195, 232, 141)" }
						},
						{ types: ["number"], style: { color: "rgb(247, 140, 108)" } },
						{
							types: ["builtin", "char", "constant", "function"],
							style: { color: "rgb(130, 170, 255)" }
						},
						{
							types: ["punctuation", "selector"],
							style: { color: "rgb(199, 146, 234)" }
						},
						{ types: ["variable"], style: { color: "rgb(191, 199, 213)" } },
						{
							types: ["class-name", "attr-name"],
							style: { color: "rgb(255, 203, 107)" }
						},
						{
							types: ["tag", "deleted"],
							style: { color: "rgb(255, 85, 114)" }
						},
						{ types: ["operator"], style: { color: "rgb(137, 221, 255)" } },
						{ types: ["boolean"], style: { color: "rgb(255, 88, 116)" } },
						{ types: ["keyword"], style: { fontStyle: "italic" } },
						{
							types: ["doctype"],
							style: { color: "rgb(199, 146, 234)", fontStyle: "italic" }
						},
						{ types: ["namespace"], style: { color: "rgb(178, 204, 214)" } },
						{ types: ["url"], style: { color: "rgb(221, 221, 221)" } }
					]
				},
				z = i(5350),
				W = i(3018),
				X = function () {
					var t = (0, W.LU)().prism,
						e = (0, z.Z)().isDarkTheme,
						i = t.theme || q,
						r = t.darkTheme || i
					return e ? r : i
				},
				J = "playgroundContainer_8J8b",
				H = "playgroundHeader_1YWI",
				K = "playgroundEditor_1LOQ",
				Z = "playgroundPreview_3I2O",
				G = ["children", "transformCode"]
			function Q(t) {
				var e = t.children
				return n.createElement("div", { className: (0, B.Z)(H) }, e)
			}
			function $() {
				return n.createElement(
					n.Fragment,
					null,
					n.createElement(
						Q,
						null,
						n.createElement(
							M.Z,
							{
								id: "theme.Playground.result",
								description: "The result label of the live codeblocks"
							},
							"Result"
						)
					),
					n.createElement(
						"div",
						{ className: Z },
						n.createElement(F, null),
						n.createElement(D, null)
					)
				)
			}
			function Y() {
				return n.createElement(
					n.Fragment,
					null,
					n.createElement(
						Q,
						null,
						n.createElement(
							M.Z,
							{
								id: "theme.Playground.liveEditor",
								description: "The live editor label of the live codeblocks"
							},
							"Live Editor"
						)
					),
					n.createElement(V, { className: K })
				)
			}
			function tt(t) {
				var e = t.children,
					i = t.transformCode,
					s = (0, a.Z)(t, G),
					o = (0, U.Z)(),
					p = o.isClient,
					h = o.siteConfig.themeConfig.liveCodeBlock.playgroundPosition,
					c = X()
				return n.createElement(
					"div",
					{ className: J },
					n.createElement(
						R,
						(0, r.Z)(
							{
								key: p,
								code: p ? e.replace(/\n$/, "") : "",
								transformCode:
									i ||
									function (t) {
										return t + ";"
									},
								theme: c
							},
							s
						),
						"top" === h
							? n.createElement(
									n.Fragment,
									null,
									n.createElement($, null),
									n.createElement(Y, null)
							  )
							: n.createElement(
									n.Fragment,
									null,
									n.createElement(Y, null),
									n.createElement($, null)
							  )
					)
				)
			}
			var et = Object.assign({ React: n }, n)
			var it = i(7594),
				rt = i.n(it),
				nt = "codeBlockContainer_K1bP",
				st = "codeBlockContent_hGly",
				at = "codeBlockTitle_eoMF",
				ot = "codeBlock_23N8",
				pt = "copyButton_Ue-o",
				ht = "codeBlockLines_39YC",
				ct = /{([\d,-]+)}/,
				lt = function (t) {
					void 0 === t && (t = ["js", "jsBlock", "jsx", "python", "html"])
					var e = {
							js: { start: "\\/\\/", end: "" },
							jsBlock: { start: "\\/\\*", end: "\\*\\/" },
							jsx: { start: "\\{\\s*\\/\\*", end: "\\*\\/\\s*\\}" },
							python: { start: "#", end: "" },
							html: { start: "\x3c!--", end: "--\x3e" }
						},
						i = [
							"highlight-next-line",
							"highlight-start",
							"highlight-end"
						].join("|"),
						r = t
							.map(function (t) {
								return (
									"(?:" + e[t].start + "\\s*(" + i + ")\\s*" + e[t].end + ")"
								)
							})
							.join("|")
					return new RegExp("^\\s*(?:" + r + ")\\s*$")
				}
			var ut = (function (t) {
					return function (e) {
						return e.live
							? n.createElement(tt, (0, r.Z)({ scope: et }, e))
							: n.createElement(t, e)
					}
				})(function (t) {
					var e = t.children,
						i = t.className,
						s = t.metastring,
						a = t.title,
						o = (0, W.LU)().prism,
						p = (0, n.useState)(!1),
						h = p[0],
						l = p[1],
						u = (0, n.useState)(!1),
						d = u[0],
						f = u[1]
					;(0, n.useEffect)(function () {
						f(!0)
					}, [])
					var m = (0, W.bc)(s) || a,
						y = (0, n.useRef)(null),
						g = [],
						x = X(),
						b = Array.isArray(e) ? e.join("") : e
					if (s && ct.test(s)) {
						var _ = s.match(ct)[1]
						g = rt()(_).filter(function (t) {
							return t > 0
						})
					}
					var k = i && i.replace(/language-/, "")
					!k && o.defaultLanguage && (k = o.defaultLanguage)
					var S = b.replace(/\n$/, "")
					if (0 === g.length && void 0 !== k) {
						for (
							var w,
								E = "",
								C = (function (t) {
									switch (t) {
										case "js":
										case "javascript":
										case "ts":
										case "typescript":
											return lt(["js", "jsBlock"])
										case "jsx":
										case "tsx":
											return lt(["js", "jsBlock", "jsx"])
										case "html":
											return lt(["js", "jsBlock", "html"])
										case "python":
										case "py":
											return lt(["python"])
										default:
											return lt()
									}
								})(k),
								A = b.replace(/\n$/, "").split("\n"),
								I = 0;
							I < A.length;

						) {
							var P = I + 1,
								L = A[I].match(C)
							if (null !== L) {
								switch (
									L.slice(1).reduce(function (t, e) {
										return t || e
									}, void 0)
								) {
									case "highlight-next-line":
										E += P + ","
										break
									case "highlight-start":
										w = P
										break
									case "highlight-end":
										E += w + "-" + (P - 1) + ","
								}
								A.splice(I, 1)
							} else I += 1
						}
						;(g = rt()(E)), (S = A.join("\n"))
					}
					var O = function () {
						!(function (t, { target: e = document.body } = {}) {
							const i = document.createElement("textarea"),
								r = document.activeElement
							;(i.value = t),
								i.setAttribute("readonly", ""),
								(i.style.contain = "strict"),
								(i.style.position = "absolute"),
								(i.style.left = "-9999px"),
								(i.style.fontSize = "12pt")
							const n = document.getSelection()
							let s = !1
							n.rangeCount > 0 && (s = n.getRangeAt(0)),
								e.append(i),
								i.select(),
								(i.selectionStart = 0),
								(i.selectionEnd = t.length)
							let a = !1
							try {
								a = document.execCommand("copy")
							} catch {}
							i.remove(),
								s && (n.removeAllRanges(), n.addRange(s)),
								r && r.focus()
						})(S),
							l(!0),
							setTimeout(function () {
								return l(!1)
							}, 2e3)
					}
					return n.createElement(
						v,
						(0, r.Z)({}, c, { key: String(d), theme: x, code: S, language: k }),
						function (t) {
							var e = t.className,
								i = t.style,
								s = t.tokens,
								a = t.getLineProps,
								o = t.getTokenProps
							return n.createElement(
								"div",
								{ className: nt },
								m && n.createElement("div", { style: i, className: at }, m),
								n.createElement(
									"div",
									{ className: (0, B.Z)(st, k) },
									n.createElement(
										"pre",
										{
											tabIndex: 0,
											className: (0, B.Z)(e, ot, "thin-scrollbar"),
											style: i
										},
										n.createElement(
											"code",
											{ className: ht },
											s.map(function (t, e) {
												1 === t.length &&
													"" === t[0].content &&
													(t[0].content = "\n")
												var i = a({ line: t, key: e })
												return (
													g.includes(e + 1) &&
														(i.className += " docusaurus-highlight-code-line"),
													n.createElement(
														"span",
														(0, r.Z)({ key: e }, i),
														t.map(function (t, e) {
															return n.createElement(
																"span",
																(0, r.Z)({ key: e }, o({ token: t, key: e }))
															)
														})
													)
												)
											})
										)
									),
									n.createElement(
										"button",
										{
											ref: y,
											type: "button",
											"aria-label": (0, M.I)({
												id: "theme.CodeBlock.copyButtonAriaLabel",
												message: "Copy code to clipboard",
												description:
													"The ARIA label for copy code blocks button"
											}),
											className: (0, B.Z)(pt, "clean-btn"),
											onClick: O
										},
										h
											? n.createElement(
													M.Z,
													{
														id: "theme.CodeBlock.copied",
														description:
															"The copied button label on code blocks"
													},
													"Copied"
											  )
											: n.createElement(
													M.Z,
													{
														id: "theme.CodeBlock.copy",
														description: "The copy button label on code blocks"
													},
													"Copy"
											  )
									)
								)
							)
						}
					)
				}),
				dt = i(6159),
				ft = "details_1VDD"
			function mt(t) {
				var e = Object.assign({}, t)
				return n.createElement(
					W.PO,
					(0, r.Z)({}, e, {
						className: (0, B.Z)("alert alert--info", ft, e.className)
					})
				)
			}
			var yt = {
				code: function (t) {
					var e = t.children
					return (0, n.isValidElement)(e)
						? e
						: e.includes("\n")
						? n.createElement(ut, t)
						: n.createElement("code", t)
				},
				a: function (t) {
					return n.createElement(s.Z, t)
				},
				pre: function (t) {
					var e,
						i = t.children
					return (0, n.isValidElement)(
						null == i || null == (e = i.props) ? void 0 : e.children
					)
						? null == i
							? void 0
							: i.props.children
						: n.createElement(
								ut,
								(0, n.isValidElement)(i)
									? null == i
										? void 0
										: i.props
									: Object.assign({}, t)
						  )
				},
				details: function (t) {
					var e = n.Children.toArray(t.children),
						i = e.find(function (t) {
							var e
							return (
								"summary" ===
								(null == t || null == (e = t.props) ? void 0 : e.mdxType)
							)
						}),
						s = n.createElement(
							n.Fragment,
							null,
							e.filter(function (t) {
								return t !== i
							})
						)
					return n.createElement(mt, (0, r.Z)({}, t, { summary: i }), s)
				},
				h1: (0, dt.Z)("h1"),
				h2: (0, dt.Z)("h2"),
				h3: (0, dt.Z)("h3"),
				h4: (0, dt.Z)("h4"),
				h5: (0, dt.Z)("h5"),
				h6: (0, dt.Z)("h6")
			}
		},
		5420: function (t, e, i) {
			var r = i(6591),
				n = r.transform
			r.features,
				(e.v = function (t, e) {
					return n(t, Object.assign({}, e, { transforms: { asyncAwait: !1 } }))
				})
		},
		9116: function (t, e, i) {
			i(9601)
			var r = i(857)
			t.exports = r.Object.assign
		},
		7671: function (t, e, i) {
			var r = i(9116)
			t.exports = r
		},
		9670: function (t, e, i) {
			var r = i(111)
			t.exports = function (t) {
				if (!r(t)) throw TypeError(String(t) + " is not an object")
				return t
			}
		},
		1318: function (t, e, i) {
			var r = i(5656),
				n = i(7466),
				s = i(1400),
				a = function (t) {
					return function (e, i, a) {
						var o,
							p = r(e),
							h = n(p.length),
							c = s(a, h)
						if (t && i != i) {
							for (; h > c; ) if ((o = p[c++]) != o) return !0
						} else
							for (; h > c; c++)
								if ((t || c in p) && p[c] === i) return t || c || 0
						return !t && -1
					}
				}
			t.exports = { includes: a(!0), indexOf: a(!1) }
		},
		4326: function (t) {
			var e = {}.toString
			t.exports = function (t) {
				return e.call(t).slice(8, -1)
			}
		},
		9920: function (t, e, i) {
			var r = i(6656),
				n = i(3887),
				s = i(1236),
				a = i(3070)
			t.exports = function (t, e) {
				for (var i = n(e), o = a.f, p = s.f, h = 0; h < i.length; h++) {
					var c = i[h]
					r(t, c) || o(t, c, p(e, c))
				}
			}
		},
		8880: function (t, e, i) {
			var r = i(9781),
				n = i(3070),
				s = i(9114)
			t.exports = r
				? function (t, e, i) {
						return n.f(t, e, s(1, i))
				  }
				: function (t, e, i) {
						return (t[e] = i), t
				  }
		},
		9114: function (t) {
			t.exports = function (t, e) {
				return {
					enumerable: !(1 & t),
					configurable: !(2 & t),
					writable: !(4 & t),
					value: e
				}
			}
		},
		9781: function (t, e, i) {
			var r = i(7293)
			t.exports = !r(function () {
				return (
					7 !=
					Object.defineProperty({}, 1, {
						get: function () {
							return 7
						}
					})[1]
				)
			})
		},
		317: function (t, e, i) {
			var r = i(7854),
				n = i(111),
				s = r.document,
				a = n(s) && n(s.createElement)
			t.exports = function (t) {
				return a ? s.createElement(t) : {}
			}
		},
		8113: function (t, e, i) {
			var r = i(5005)
			t.exports = r("navigator", "userAgent") || ""
		},
		7392: function (t, e, i) {
			var r,
				n,
				s = i(7854),
				a = i(8113),
				o = s.process,
				p = s.Deno,
				h = (o && o.versions) || (p && p.version),
				c = h && h.v8
			c
				? (n = (r = c.split("."))[0] < 4 ? 1 : r[0] + r[1])
				: a &&
				  (!(r = a.match(/Edge\/(\d+)/)) || r[1] >= 74) &&
				  (r = a.match(/Chrome\/(\d+)/)) &&
				  (n = r[1]),
				(t.exports = n && +n)
		},
		748: function (t) {
			t.exports = [
				"constructor",
				"hasOwnProperty",
				"isPrototypeOf",
				"propertyIsEnumerable",
				"toLocaleString",
				"toString",
				"valueOf"
			]
		},
		2109: function (t, e, i) {
			var r = i(7854),
				n = i(1236).f,
				s = i(8880),
				a = i(1320),
				o = i(3505),
				p = i(9920),
				h = i(4705)
			t.exports = function (t, e) {
				var i,
					c,
					l,
					u,
					d,
					f = t.target,
					m = t.global,
					y = t.stat
				if ((i = m ? r : y ? r[f] || o(f, {}) : (r[f] || {}).prototype))
					for (c in e) {
						if (
							((u = e[c]),
							(l = t.noTargetGet ? (d = n(i, c)) && d.value : i[c]),
							!h(m ? c : f + (y ? "." : "#") + c, t.forced) && void 0 !== l)
						) {
							if (typeof u == typeof l) continue
							p(u, l)
						}
						;(t.sham || (l && l.sham)) && s(u, "sham", !0), a(i, c, u, t)
					}
			}
		},
		7293: function (t) {
			t.exports = function (t) {
				try {
					return !!t()
				} catch (e) {
					return !0
				}
			}
		},
		5005: function (t, e, i) {
			var r = i(7854),
				n = function (t) {
					return "function" == typeof t ? t : void 0
				}
			t.exports = function (t, e) {
				return arguments.length < 2 ? n(r[t]) : r[t] && r[t][e]
			}
		},
		7854: function (t, e, i) {
			var r = function (t) {
				return t && t.Math == Math && t
			}
			t.exports =
				r("object" == typeof globalThis && globalThis) ||
				r("object" == typeof window && window) ||
				r("object" == typeof self && self) ||
				r("object" == typeof i.g && i.g) ||
				(function () {
					return this
				})() ||
				Function("return this")()
		},
		6656: function (t, e, i) {
			var r = i(7908),
				n = {}.hasOwnProperty
			t.exports =
				Object.hasOwn ||
				function (t, e) {
					return n.call(r(t), e)
				}
		},
		3501: function (t) {
			t.exports = {}
		},
		4664: function (t, e, i) {
			var r = i(9781),
				n = i(7293),
				s = i(317)
			t.exports =
				!r &&
				!n(function () {
					return (
						7 !=
						Object.defineProperty(s("div"), "a", {
							get: function () {
								return 7
							}
						}).a
					)
				})
		},
		8361: function (t, e, i) {
			var r = i(7293),
				n = i(4326),
				s = "".split
			t.exports = r(function () {
				return !Object("z").propertyIsEnumerable(0)
			})
				? function (t) {
						return "String" == n(t) ? s.call(t, "") : Object(t)
				  }
				: Object
		},
		2788: function (t, e, i) {
			var r = i(5465),
				n = Function.toString
			"function" != typeof r.inspectSource &&
				(r.inspectSource = function (t) {
					return n.call(t)
				}),
				(t.exports = r.inspectSource)
		},
		9909: function (t, e, i) {
			var r,
				n,
				s,
				a = i(8536),
				o = i(7854),
				p = i(111),
				h = i(8880),
				c = i(6656),
				l = i(5465),
				u = i(6200),
				d = i(3501),
				f = "Object already initialized",
				m = o.WeakMap
			if (a || l.state) {
				var y = l.state || (l.state = new m()),
					g = y.get,
					v = y.has,
					x = y.set
				;(r = function (t, e) {
					if (v.call(y, t)) throw new TypeError(f)
					return (e.facade = t), x.call(y, t, e), e
				}),
					(n = function (t) {
						return g.call(y, t) || {}
					}),
					(s = function (t) {
						return v.call(y, t)
					})
			} else {
				var b = u("state")
				;(d[b] = !0),
					(r = function (t, e) {
						if (c(t, b)) throw new TypeError(f)
						return (e.facade = t), h(t, b, e), e
					}),
					(n = function (t) {
						return c(t, b) ? t[b] : {}
					}),
					(s = function (t) {
						return c(t, b)
					})
			}
			t.exports = {
				set: r,
				get: n,
				has: s,
				enforce: function (t) {
					return s(t) ? n(t) : r(t, {})
				},
				getterFor: function (t) {
					return function (e) {
						var i
						if (!p(e) || (i = n(e)).type !== t)
							throw TypeError("Incompatible receiver, " + t + " required")
						return i
					}
				}
			}
		},
		4705: function (t, e, i) {
			var r = i(7293),
				n = /#|\.prototype\./,
				s = function (t, e) {
					var i = o[a(t)]
					return i == h || (i != p && ("function" == typeof e ? r(e) : !!e))
				},
				a = (s.normalize = function (t) {
					return String(t).replace(n, ".").toLowerCase()
				}),
				o = (s.data = {}),
				p = (s.NATIVE = "N"),
				h = (s.POLYFILL = "P")
			t.exports = s
		},
		111: function (t) {
			t.exports = function (t) {
				return "object" == typeof t ? null !== t : "function" == typeof t
			}
		},
		1913: function (t) {
			t.exports = !1
		},
		2190: function (t, e, i) {
			var r = i(5005),
				n = i(3307)
			t.exports = n
				? function (t) {
						return "symbol" == typeof t
				  }
				: function (t) {
						var e = r("Symbol")
						return "function" == typeof e && Object(t) instanceof e
				  }
		},
		133: function (t, e, i) {
			var r = i(7392),
				n = i(7293)
			t.exports =
				!!Object.getOwnPropertySymbols &&
				!n(function () {
					var t = Symbol()
					return (
						!String(t) ||
						!(Object(t) instanceof Symbol) ||
						(!Symbol.sham && r && r < 41)
					)
				})
		},
		8536: function (t, e, i) {
			var r = i(7854),
				n = i(2788),
				s = r.WeakMap
			t.exports = "function" == typeof s && /native code/.test(n(s))
		},
		1574: function (t, e, i) {
			"use strict"
			var r = i(9781),
				n = i(7293),
				s = i(1956),
				a = i(5181),
				o = i(5296),
				p = i(7908),
				h = i(8361),
				c = Object.assign,
				l = Object.defineProperty
			t.exports =
				!c ||
				n(function () {
					if (
						r &&
						1 !==
							c(
								{ b: 1 },
								c(
									l({}, "a", {
										enumerable: !0,
										get: function () {
											l(this, "b", { value: 3, enumerable: !1 })
										}
									}),
									{ b: 2 }
								)
							).b
					)
						return !0
					var t = {},
						e = {},
						i = Symbol(),
						n = "abcdefghijklmnopqrst"
					return (
						(t[i] = 7),
						n.split("").forEach(function (t) {
							e[t] = t
						}),
						7 != c({}, t)[i] || s(c({}, e)).join("") != n
					)
				})
					? function (t, e) {
							for (
								var i = p(t), n = arguments.length, c = 1, l = a.f, u = o.f;
								n > c;

							)
								for (
									var d,
										f = h(arguments[c++]),
										m = l ? s(f).concat(l(f)) : s(f),
										y = m.length,
										g = 0;
									y > g;

								)
									(d = m[g++]), (r && !u.call(f, d)) || (i[d] = f[d])
							return i
					  }
					: c
		},
		3070: function (t, e, i) {
			var r = i(9781),
				n = i(4664),
				s = i(9670),
				a = i(4948),
				o = Object.defineProperty
			e.f = r
				? o
				: function (t, e, i) {
						if ((s(t), (e = a(e)), s(i), n))
							try {
								return o(t, e, i)
							} catch (r) {}
						if ("get" in i || "set" in i)
							throw TypeError("Accessors not supported")
						return "value" in i && (t[e] = i.value), t
				  }
		},
		1236: function (t, e, i) {
			var r = i(9781),
				n = i(5296),
				s = i(9114),
				a = i(5656),
				o = i(4948),
				p = i(6656),
				h = i(4664),
				c = Object.getOwnPropertyDescriptor
			e.f = r
				? c
				: function (t, e) {
						if (((t = a(t)), (e = o(e)), h))
							try {
								return c(t, e)
							} catch (i) {}
						if (p(t, e)) return s(!n.f.call(t, e), t[e])
				  }
		},
		8006: function (t, e, i) {
			var r = i(6324),
				n = i(748).concat("length", "prototype")
			e.f =
				Object.getOwnPropertyNames ||
				function (t) {
					return r(t, n)
				}
		},
		5181: function (t, e) {
			e.f = Object.getOwnPropertySymbols
		},
		6324: function (t, e, i) {
			var r = i(6656),
				n = i(5656),
				s = i(1318).indexOf,
				a = i(3501)
			t.exports = function (t, e) {
				var i,
					o = n(t),
					p = 0,
					h = []
				for (i in o) !r(a, i) && r(o, i) && h.push(i)
				for (; e.length > p; ) r(o, (i = e[p++])) && (~s(h, i) || h.push(i))
				return h
			}
		},
		1956: function (t, e, i) {
			var r = i(6324),
				n = i(748)
			t.exports =
				Object.keys ||
				function (t) {
					return r(t, n)
				}
		},
		5296: function (t, e) {
			"use strict"
			var i = {}.propertyIsEnumerable,
				r = Object.getOwnPropertyDescriptor,
				n = r && !i.call({ 1: 2 }, 1)
			e.f = n
				? function (t) {
						var e = r(this, t)
						return !!e && e.enumerable
				  }
				: i
		},
		2140: function (t, e, i) {
			var r = i(111)
			t.exports = function (t, e) {
				var i, n
				if (
					"string" === e &&
					"function" == typeof (i = t.toString) &&
					!r((n = i.call(t)))
				)
					return n
				if ("function" == typeof (i = t.valueOf) && !r((n = i.call(t))))
					return n
				if (
					"string" !== e &&
					"function" == typeof (i = t.toString) &&
					!r((n = i.call(t)))
				)
					return n
				throw TypeError("Can't convert object to primitive value")
			}
		},
		3887: function (t, e, i) {
			var r = i(5005),
				n = i(8006),
				s = i(5181),
				a = i(9670)
			t.exports =
				r("Reflect", "ownKeys") ||
				function (t) {
					var e = n.f(a(t)),
						i = s.f
					return i ? e.concat(i(t)) : e
				}
		},
		857: function (t, e, i) {
			var r = i(7854)
			t.exports = r
		},
		1320: function (t, e, i) {
			var r = i(7854),
				n = i(8880),
				s = i(6656),
				a = i(3505),
				o = i(2788),
				p = i(9909),
				h = p.get,
				c = p.enforce,
				l = String(String).split("String")
			;(t.exports = function (t, e, i, o) {
				var p,
					h = !!o && !!o.unsafe,
					u = !!o && !!o.enumerable,
					d = !!o && !!o.noTargetGet
				"function" == typeof i &&
					("string" != typeof e || s(i, "name") || n(i, "name", e),
					(p = c(i)).source ||
						(p.source = l.join("string" == typeof e ? e : ""))),
					t !== r
						? (h ? !d && t[e] && (u = !0) : delete t[e],
						  u ? (t[e] = i) : n(t, e, i))
						: u
						? (t[e] = i)
						: a(e, i)
			})(Function.prototype, "toString", function () {
				return ("function" == typeof this && h(this).source) || o(this)
			})
		},
		4488: function (t) {
			t.exports = function (t) {
				if (null == t) throw TypeError("Can't call method on " + t)
				return t
			}
		},
		3505: function (t, e, i) {
			var r = i(7854)
			t.exports = function (t, e) {
				try {
					Object.defineProperty(r, t, {
						value: e,
						configurable: !0,
						writable: !0
					})
				} catch (i) {
					r[t] = e
				}
				return e
			}
		},
		6200: function (t, e, i) {
			var r = i(2309),
				n = i(9711),
				s = r("keys")
			t.exports = function (t) {
				return s[t] || (s[t] = n(t))
			}
		},
		5465: function (t, e, i) {
			var r = i(7854),
				n = i(3505),
				s = "__core-js_shared__",
				a = r[s] || n(s, {})
			t.exports = a
		},
		2309: function (t, e, i) {
			var r = i(1913),
				n = i(5465)
			;(t.exports = function (t, e) {
				return n[t] || (n[t] = void 0 !== e ? e : {})
			})("versions", []).push({
				version: "3.16.0",
				mode: r ? "pure" : "global",
				copyright: "\xa9 2021 Denis Pushkarev (zloirock.ru)"
			})
		},
		1400: function (t, e, i) {
			var r = i(9958),
				n = Math.max,
				s = Math.min
			t.exports = function (t, e) {
				var i = r(t)
				return i < 0 ? n(i + e, 0) : s(i, e)
			}
		},
		5656: function (t, e, i) {
			var r = i(8361),
				n = i(4488)
			t.exports = function (t) {
				return r(n(t))
			}
		},
		9958: function (t) {
			var e = Math.ceil,
				i = Math.floor
			t.exports = function (t) {
				return isNaN((t = +t)) ? 0 : (t > 0 ? i : e)(t)
			}
		},
		7466: function (t, e, i) {
			var r = i(9958),
				n = Math.min
			t.exports = function (t) {
				return t > 0 ? n(r(t), 9007199254740991) : 0
			}
		},
		7908: function (t, e, i) {
			var r = i(4488)
			t.exports = function (t) {
				return Object(r(t))
			}
		},
		7593: function (t, e, i) {
			var r = i(111),
				n = i(2190),
				s = i(2140),
				a = i(5112)("toPrimitive")
			t.exports = function (t, e) {
				if (!r(t) || n(t)) return t
				var i,
					o = t[a]
				if (void 0 !== o) {
					if (
						(void 0 === e && (e = "default"), (i = o.call(t, e)), !r(i) || n(i))
					)
						return i
					throw TypeError("Can't convert object to primitive value")
				}
				return void 0 === e && (e = "number"), s(t, e)
			}
		},
		4948: function (t, e, i) {
			var r = i(7593),
				n = i(2190)
			t.exports = function (t) {
				var e = r(t, "string")
				return n(e) ? e : String(e)
			}
		},
		9711: function (t) {
			var e = 0,
				i = Math.random()
			t.exports = function (t) {
				return (
					"Symbol(" +
					String(void 0 === t ? "" : t) +
					")_" +
					(++e + i).toString(36)
				)
			}
		},
		3307: function (t, e, i) {
			var r = i(133)
			t.exports = r && !Symbol.sham && "symbol" == typeof Symbol.iterator
		},
		5112: function (t, e, i) {
			var r = i(7854),
				n = i(2309),
				s = i(6656),
				a = i(9711),
				o = i(133),
				p = i(3307),
				h = n("wks"),
				c = r.Symbol,
				l = p ? c : (c && c.withoutSetter) || a
			t.exports = function (t) {
				return (
					(s(h, t) && (o || "string" == typeof h[t])) ||
						(o && s(c, t) ? (h[t] = c[t]) : (h[t] = l("Symbol." + t))),
					h[t]
				)
			}
		},
		9601: function (t, e, i) {
			var r = i(2109),
				n = i(1574)
			r(
				{ target: "Object", stat: !0, forced: Object.assign !== n },
				{ assign: n }
			)
		},
		7594: function (t, e) {
			function i(t) {
				let e,
					i = []
				for (let r of t.split(",").map((t) => t.trim()))
					if (/^-?\d+$/.test(r)) i.push(parseInt(r, 10))
					else if (
						(e = r.match(/^(-?\d+)(-|\.\.\.?|\u2025|\u2026|\u22EF)(-?\d+)$/))
					) {
						let [t, r, n, s] = e
						if (r && s) {
							;(r = parseInt(r)), (s = parseInt(s))
							const t = r < s ? 1 : -1
							;("-" !== n && ".." !== n && "\u2025" !== n) || (s += t)
							for (let e = r; e !== s; e += t) i.push(e)
						}
					}
				return i
			}
			;(e.default = i), (t.exports = i)
		},
		460: function (t, e, i) {
			"use strict"
			var r =
					Object.assign ||
					function (t) {
						for (var e = 1; e < arguments.length; e++) {
							var i = arguments[e]
							for (var r in i)
								Object.prototype.hasOwnProperty.call(i, r) && (t[r] = i[r])
						}
						return t
					},
				n = (function () {
					function t(t, e) {
						for (var i = 0; i < e.length; i++) {
							var r = e[i]
							;(r.enumerable = r.enumerable || !1),
								(r.configurable = !0),
								"value" in r && (r.writable = !0),
								Object.defineProperty(t, r.key, r)
						}
					}
					return function (e, i, r) {
						return i && t(e.prototype, i), r && t(e, r), e
					}
				})(),
				s = (function (t) {
					if (t && t.__esModule) return t
					var e = {}
					if (null != t)
						for (var i in t)
							Object.prototype.hasOwnProperty.call(t, i) && (e[i] = t[i])
					return (e.default = t), e
				})(i(7294))
			function a(t, e) {
				if (!(t instanceof e))
					throw new TypeError("Cannot call a class as a function")
			}
			function o(t, e) {
				if (!t)
					throw new ReferenceError(
						"this hasn't been initialised - super() hasn't been called"
					)
				return !e || ("object" != typeof e && "function" != typeof e) ? t : e
			}
			var p = 90,
				h = 219,
				c = 222,
				l = 192,
				u = 100,
				d = 3e3,
				f = "navigator" in i.g && /Win/i.test(navigator.platform),
				m =
					"navigator" in i.g &&
					/(Mac|iPhone|iPod|iPad)/i.test(navigator.platform),
				y = "npm__react-simple-code-editor__textarea",
				g = (function (t) {
					function e() {
						var t, i, n
						a(this, e)
						for (var s = arguments.length, y = Array(s), g = 0; g < s; g++)
							y[g] = arguments[g]
						return (
							(i = n = o(
								this,
								(t = e.__proto__ || Object.getPrototypeOf(e)).call.apply(
									t,
									[this].concat(y)
								)
							)),
							(n.state = { capture: !0 }),
							(n._recordCurrentState = function () {
								var t = n._input
								if (t) {
									var e = t.value,
										i = t.selectionStart,
										r = t.selectionEnd
									n._recordChange({
										value: e,
										selectionStart: i,
										selectionEnd: r
									})
								}
							}),
							(n._getLines = function (t, e) {
								return t.substring(0, e).split("\n")
							}),
							(n._recordChange = function (t) {
								var e =
										arguments.length > 1 &&
										void 0 !== arguments[1] &&
										arguments[1],
									i = n._history,
									s = i.stack,
									a = i.offset
								if (s.length && a > -1) {
									n._history.stack = s.slice(0, a + 1)
									var o = n._history.stack.length
									if (o > u) {
										var p = o - u
										;(n._history.stack = s.slice(p, o)),
											(n._history.offset = Math.max(n._history.offset - p, 0))
									}
								}
								var h = Date.now()
								if (e) {
									var c = n._history.stack[n._history.offset]
									if (c && h - c.timestamp < d) {
										var l = /[^a-z0-9]([a-z0-9]+)$/i,
											f = n._getLines(c.value, c.selectionStart).pop().match(l),
											m = n._getLines(t.value, t.selectionStart).pop().match(l)
										if (f && m && m[1].startsWith(f[1]))
											return void (n._history.stack[n._history.offset] = r(
												{},
												t,
												{ timestamp: h }
											))
									}
								}
								n._history.stack.push(r({}, t, { timestamp: h })),
									n._history.offset++
							}),
							(n._updateInput = function (t) {
								var e = n._input
								e &&
									((e.value = t.value),
									(e.selectionStart = t.selectionStart),
									(e.selectionEnd = t.selectionEnd),
									n.props.onValueChange(t.value))
							}),
							(n._applyEdits = function (t) {
								var e = n._input,
									i = n._history.stack[n._history.offset]
								i &&
									e &&
									(n._history.stack[n._history.offset] = r({}, i, {
										selectionStart: e.selectionStart,
										selectionEnd: e.selectionEnd
									})),
									n._recordChange(t),
									n._updateInput(t)
							}),
							(n._undoEdit = function () {
								var t = n._history,
									e = t.stack,
									i = t.offset,
									r = e[i - 1]
								r &&
									(n._updateInput(r), (n._history.offset = Math.max(i - 1, 0)))
							}),
							(n._redoEdit = function () {
								var t = n._history,
									e = t.stack,
									i = t.offset,
									r = e[i + 1]
								r &&
									(n._updateInput(r),
									(n._history.offset = Math.min(i + 1, e.length - 1)))
							}),
							(n._handleKeyDown = function (t) {
								var e = n.props,
									i = e.tabSize,
									r = e.insertSpaces,
									s = e.ignoreTabKey,
									a = e.onKeyDown
								if (!a || (a(t), !t.defaultPrevented)) {
									27 === t.keyCode && t.target.blur()
									var o = t.target,
										u = o.value,
										d = o.selectionStart,
										y = o.selectionEnd,
										g = (r ? " " : "\t").repeat(i)
									if (9 === t.keyCode && !s && n.state.capture)
										if ((t.preventDefault(), t.shiftKey)) {
											var v = n._getLines(u, d),
												x = v.length - 1,
												b = n._getLines(u, y).length - 1,
												_ = u
													.split("\n")
													.map(function (t, e) {
														return e >= x && e <= b && t.startsWith(g)
															? t.substring(g.length)
															: t
													})
													.join("\n")
											if (u !== _) {
												var k = v[x]
												n._applyEdits({
													value: _,
													selectionStart: k.startsWith(g) ? d - g.length : d,
													selectionEnd: y - (u.length - _.length)
												})
											}
										} else if (d !== y) {
											var S = n._getLines(u, d),
												w = S.length - 1,
												E = n._getLines(u, y).length - 1,
												C = S[w]
											n._applyEdits({
												value: u
													.split("\n")
													.map(function (t, e) {
														return e >= w && e <= E ? g + t : t
													})
													.join("\n"),
												selectionStart: /\S/.test(C) ? d + g.length : d,
												selectionEnd: y + g.length * (E - w + 1)
											})
										} else {
											var A = d + g.length
											n._applyEdits({
												value: u.substring(0, d) + g + u.substring(y),
												selectionStart: A,
												selectionEnd: A
											})
										}
									else if (8 === t.keyCode) {
										var I = d !== y
										if (u.substring(0, d).endsWith(g) && !I) {
											t.preventDefault()
											var P = d - g.length
											n._applyEdits({
												value: u.substring(0, d - g.length) + u.substring(y),
												selectionStart: P,
												selectionEnd: P
											})
										}
									} else if (13 === t.keyCode) {
										if (d === y) {
											var L = n._getLines(u, d).pop().match(/^\s+/)
											if (L && L[0]) {
												t.preventDefault()
												var O = "\n" + L[0],
													N = d + O.length
												n._applyEdits({
													value: u.substring(0, d) + O + u.substring(y),
													selectionStart: N,
													selectionEnd: N
												})
											}
										}
									} else if (
										57 === t.keyCode ||
										t.keyCode === h ||
										t.keyCode === c ||
										t.keyCode === l
									) {
										var j = void 0
										57 === t.keyCode && t.shiftKey
											? (j = ["(", ")"])
											: t.keyCode === h
											? (j = t.shiftKey ? ["{", "}"] : ["[", "]"])
											: t.keyCode === c
											? (j = t.shiftKey ? ['"', '"'] : ["'", "'"])
											: t.keyCode !== l || t.shiftKey || (j = ["`", "`"]),
											d !== y &&
												j &&
												(t.preventDefault(),
												n._applyEdits({
													value:
														u.substring(0, d) +
														j[0] +
														u.substring(d, y) +
														j[1] +
														u.substring(y),
													selectionStart: d,
													selectionEnd: y + 2
												}))
									} else
										!(m
											? t.metaKey && t.keyCode === p
											: t.ctrlKey && t.keyCode === p) ||
										t.shiftKey ||
										t.altKey
											? (m
													? t.metaKey && t.keyCode === p && t.shiftKey
													: f
													? t.ctrlKey && 89 === t.keyCode
													: t.ctrlKey && t.keyCode === p && t.shiftKey) &&
											  !t.altKey
												? (t.preventDefault(), n._redoEdit())
												: 77 !== t.keyCode ||
												  !t.ctrlKey ||
												  (m && !t.shiftKey) ||
												  (t.preventDefault(),
												  n.setState(function (t) {
														return { capture: !t.capture }
												  }))
											: (t.preventDefault(), n._undoEdit())
								}
							}),
							(n._handleChange = function (t) {
								var e = t.target,
									i = e.value,
									r = e.selectionStart,
									s = e.selectionEnd
								n._recordChange(
									{ value: i, selectionStart: r, selectionEnd: s },
									!0
								),
									n.props.onValueChange(i)
							}),
							(n._history = { stack: [], offset: -1 }),
							o(n, i)
						)
					}
					return (
						(function (t, e) {
							if ("function" != typeof e && null !== e)
								throw new TypeError(
									"Super expression must either be null or a function, not " +
										typeof e
								)
							;(t.prototype = Object.create(e && e.prototype, {
								constructor: {
									value: t,
									enumerable: !1,
									writable: !0,
									configurable: !0
								}
							})),
								e &&
									(Object.setPrototypeOf
										? Object.setPrototypeOf(t, e)
										: (t.__proto__ = e))
						})(e, t),
						n(e, [
							{
								key: "componentDidMount",
								value: function () {
									this._recordCurrentState()
								}
							},
							{
								key: "render",
								value: function () {
									var t = this,
										e = this.props,
										i = e.value,
										n = e.style,
										a = e.padding,
										o = e.highlight,
										p = e.textareaId,
										h = e.textareaClassName,
										c = e.autoFocus,
										l = e.disabled,
										u = e.form,
										d = e.maxLength,
										f = e.minLength,
										m = e.name,
										g = e.placeholder,
										x = e.readOnly,
										b = e.required,
										_ = e.onClick,
										k = e.onFocus,
										S = e.onBlur,
										w = e.onKeyUp,
										E =
											(e.onKeyDown,
											e.onValueChange,
											e.tabSize,
											e.insertSpaces,
											e.ignoreTabKey,
											e.preClassName),
										C = (function (t, e) {
											var i = {}
											for (var r in t)
												e.indexOf(r) >= 0 ||
													(Object.prototype.hasOwnProperty.call(t, r) &&
														(i[r] = t[r]))
											return i
										})(e, [
											"value",
											"style",
											"padding",
											"highlight",
											"textareaId",
											"textareaClassName",
											"autoFocus",
											"disabled",
											"form",
											"maxLength",
											"minLength",
											"name",
											"placeholder",
											"readOnly",
											"required",
											"onClick",
											"onFocus",
											"onBlur",
											"onKeyUp",
											"onKeyDown",
											"onValueChange",
											"tabSize",
											"insertSpaces",
											"ignoreTabKey",
											"preClassName"
										]),
										A = {
											paddingTop: a,
											paddingRight: a,
											paddingBottom: a,
											paddingLeft: a
										},
										I = o(i)
									return s.createElement(
										"div",
										r({}, C, { style: r({}, v.container, n) }),
										s.createElement("textarea", {
											ref: function (e) {
												return (t._input = e)
											},
											style: r({}, v.editor, v.textarea, A),
											className: y + (h ? " " + h : ""),
											id: p,
											value: i,
											onChange: this._handleChange,
											onKeyDown: this._handleKeyDown,
											onClick: _,
											onKeyUp: w,
											onFocus: k,
											onBlur: S,
											disabled: l,
											form: u,
											maxLength: d,
											minLength: f,
											name: m,
											placeholder: g,
											readOnly: x,
											required: b,
											autoFocus: c,
											autoCapitalize: "off",
											autoComplete: "off",
											autoCorrect: "off",
											spellCheck: !1,
											"data-gramm": !1
										}),
										s.createElement(
											"pre",
											r(
												{
													className: E,
													"aria-hidden": "true",
													style: r({}, v.editor, v.highlight, A)
												},
												"string" == typeof I
													? {
															dangerouslySetInnerHTML: { __html: I + "<br />" }
													  }
													: { children: I }
											)
										),
										s.createElement("style", {
											type: "text/css",
											dangerouslySetInnerHTML: {
												__html:
													"\n/**\n * Reset the text fill color so that placeholder is visible\n */\n.npm__react-simple-code-editor__textarea:empty {\n  -webkit-text-fill-color: inherit !important;\n}\n\n/**\n * Hack to apply on some CSS on IE10 and IE11\n */\n@media all and (-ms-high-contrast: none), (-ms-high-contrast: active) {\n  /**\n    * IE doesn't support '-webkit-text-fill-color'\n    * So we use 'color: transparent' to make the text transparent on IE\n    * Unlike other browsers, it doesn't affect caret color in IE\n    */\n  .npm__react-simple-code-editor__textarea {\n    color: transparent !important;\n  }\n\n  .npm__react-simple-code-editor__textarea::selection {\n    background-color: #accef7 !important;\n    color: transparent !important;\n  }\n}\n"
											}
										})
									)
								}
							},
							{
								key: "session",
								get: function () {
									return { history: this._history }
								},
								set: function (t) {
									this._history = t.history
								}
							}
						]),
						e
					)
				})(s.Component)
			;(g.defaultProps = {
				tabSize: 2,
				insertSpaces: !0,
				ignoreTabKey: !1,
				padding: 0
			}),
				(e.Z = g)
			var v = {
				container: {
					position: "relative",
					textAlign: "left",
					boxSizing: "border-box",
					padding: 0,
					overflow: "hidden"
				},
				textarea: {
					position: "absolute",
					top: 0,
					left: 0,
					height: "100%",
					width: "100%",
					resize: "none",
					color: "inherit",
					overflow: "hidden",
					MozOsxFontSmoothing: "grayscale",
					WebkitFontSmoothing: "antialiased",
					WebkitTextFillColor: "transparent"
				},
				highlight: { position: "relative", pointerEvents: "none" },
				editor: {
					margin: 0,
					border: 0,
					background: "none",
					boxSizing: "inherit",
					display: "inherit",
					fontFamily: "inherit",
					fontSize: "inherit",
					fontStyle: "inherit",
					fontVariantLigatures: "inherit",
					fontWeight: "inherit",
					letterSpacing: "inherit",
					lineHeight: "inherit",
					tabSize: "inherit",
					textIndent: "inherit",
					textRendering: "inherit",
					textTransform: "inherit",
					whiteSpace: "pre-wrap",
					wordBreak: "keep-all",
					overflowWrap: "break-word"
				}
			}
		}
	}
])
