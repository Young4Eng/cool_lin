(function() {
  var e = Object.create, t = Object.defineProperty, n = Object.getOwnPropertyDescriptor, r = Object.getOwnPropertyNames,
  i = Object.getPrototypeOf, a = Object.prototype.hasOwnProperty, o = (e2, t2) => () => (t2 || (e2((t2 = { exports: {} }).
  exports, t2), e2 = null), t2.exports), s = (e2, i2, o2, s2) => {
    if (i2 && typeof i2 == `object` || typeof i2 == `function`) for (var c2 = r(i2), l2 = 0, u2 = c2.length, d2; l2 <
    u2; l2++) d2 = c2[l2], !a.call(e2, d2) && d2 !== o2 && t(e2, d2, { get: ((e3) => i2[e3]).bind(null, d2), enumerable: !(s2 =
    n(i2, d2)) || s2.enumerable });
    return e2;
  }, c = (n2, r2, o2) => (o2 = n2 == null ? {} : e(i(n2)), s(r2 || !n2 || !n2.__esModule || !a.call(n2, `defau\
lt`) ? t(o2, `default`, { value: n2, enumerable: true }) : o2, n2)), l = o(((e2) => {
    function t2(e3, t3) {
      var n3 = e3.length;
      e3.push(t3);
      a: for (; 0 < n3; ) {
        var r3 = n3 - 1 >>> 1, a3 = e3[r3];
        if (0 < i2(a3, t3)) e3[r3] = t3, e3[n3] = a3, n3 = r3;
        else break a;
      }
    }
    function n2(e3) {
      return e3.length === 0 ? null : e3[0];
    }
    function r2(e3) {
      if (e3.length === 0) return null;
      var t3 = e3[0], n3 = e3.pop();
      if (n3 !== t3) {
        e3[0] = n3;
        a: for (var r3 = 0, a3 = e3.length, o3 = a3 >>> 1; r3 < o3; ) {
          var s3 = 2 * (r3 + 1) - 1, c3 = e3[s3], l3 = s3 + 1, u3 = e3[l3];
          if (0 > i2(c3, n3)) l3 < a3 && 0 > i2(u3, c3) ? (e3[r3] = u3, e3[l3] = n3, r3 = l3) : (e3[r3] = c3, e3[s3] =
          n3, r3 = s3);
          else if (l3 < a3 && 0 > i2(u3, n3)) e3[r3] = u3, e3[l3] = n3, r3 = l3;
          else break a;
        }
      }
      return t3;
    }
    function i2(e3, t3) {
      var n3 = e3.sortIndex - t3.sortIndex;
      return n3 === 0 ? e3.id - t3.id : n3;
    }
    if (e2.unstable_now = void 0, typeof performance == `object` && typeof performance.now == `function`) {
      var a2 = performance;
      e2.unstable_now = function() {
        return a2.now();
      };
    } else {
      var o2 = Date, s2 = o2.now();
      e2.unstable_now = function() {
        return o2.now() - s2;
      };
    }
    var c2 = [], l2 = [], u2 = 1, d2 = null, f2 = 3, p2 = false, m2 = false, h2 = false, g2 = false, _2 = typeof setTimeout ==
    `function` ? setTimeout : null, v2 = typeof clearTimeout == `function` ? clearTimeout : null, y2 = typeof setImmediate <
    `u` ? setImmediate : null;
    function b2(e3) {
      for (var i3 = n2(l2); i3 !== null; ) {
        if (i3.callback === null) r2(l2);
        else if (i3.startTime <= e3) r2(l2), i3.sortIndex = i3.expirationTime, t2(c2, i3);
        else break;
        i3 = n2(l2);
      }
    }
    function x2(e3) {
      if (h2 = false, b2(e3), !m2) {
        if (n2(c2) !== null) m2 = true, ee2 || (ee2 = true, T2());
        else {
          var t3 = n2(l2);
          t3 !== null && ae2(x2, t3.startTime - e3);
        }
      }
    }
    var ee2 = false, S2 = -1, C2 = 5, w2 = -1;
    function te2() {
      return g2 ? true : !(e2.unstable_now() - w2 < C2);
    }
    function ne2() {
      if (g2 = false, ee2) {
        var t3 = e2.unstable_now();
        w2 = t3;
        var i3 = true;
        try {
          a: {
            m2 = false, h2 && (h2 = false, v2(S2), S2 = -1), p2 = true;
            var a3 = f2;
            try {
              b: {
                for (b2(t3), d2 = n2(c2); d2 !== null && !(d2.expirationTime > t3 && te2()); ) {
                  var o3 = d2.callback;
                  if (typeof o3 == `function`) {
                    d2.callback = null, f2 = d2.priorityLevel;
                    var s3 = o3(d2.expirationTime <= t3);
                    if (t3 = e2.unstable_now(), typeof s3 == `function`) {
                      d2.callback = s3, b2(t3), i3 = true;
                      break b;
                    }
                    d2 === n2(c2) && r2(c2), b2(t3);
                  } else r2(c2);
                  d2 = n2(c2);
                }
                if (d2 !== null) i3 = true;
                else {
                  var u3 = n2(l2);
                  u3 !== null && ae2(x2, u3.startTime - t3), i3 = false;
                }
              }
              break a;
            } finally {
              d2 = null, f2 = a3, p2 = false;
            }
            i3 = void 0;
          }
        } finally {
          i3 ? T2() : ee2 = false;
        }
      }
    }
    var T2;
    if (typeof y2 == `function`) T2 = function() {
      y2(ne2);
    };
    else if (typeof MessageChannel < `u`) {
      var re2 = new MessageChannel(), ie2 = re2.port2;
      re2.port1.onmessage = ne2, T2 = function() {
        ie2.postMessage(null);
      };
    } else T2 = function() {
      _2(ne2, 0);
    };
    function ae2(t3, n3) {
      S2 = _2(function() {
        t3(e2.unstable_now());
      }, n3);
    }
    e2.unstable_IdlePriority = 5, e2.unstable_ImmediatePriority = 1, e2.unstable_LowPriority = 4, e2.unstable_NormalPriority =
    3, e2.unstable_Profiling = null, e2.unstable_UserBlockingPriority = 2, e2.unstable_cancelCallback = function(e3) {
      e3.callback = null;
    }, e2.unstable_forceFrameRate = function(e3) {
      0 > e3 || 125 < e3 ? console.error(`forceFrameRate takes a positive int between 0 and 125, forcing frame\
 rates higher than 125 fps is not supported`) : C2 = 0 < e3 ? Math.floor(1e3 / e3) : 5;
    }, e2.unstable_getCurrentPriorityLevel = function() {
      return f2;
    }, e2.unstable_next = function(e3) {
      switch (f2) {
        case 1:
        case 2:
        case 3:
          var t3 = 3;
          break;
        default:
          t3 = f2;
      }
      var n3 = f2;
      f2 = t3;
      try {
        return e3();
      } finally {
        f2 = n3;
      }
    }, e2.unstable_requestPaint = function() {
      g2 = true;
    }, e2.unstable_runWithPriority = function(e3, t3) {
      switch (e3) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          break;
        default:
          e3 = 3;
      }
      var n3 = f2;
      f2 = e3;
      try {
        return t3();
      } finally {
        f2 = n3;
      }
    }, e2.unstable_scheduleCallback = function(r3, i3, a3) {
      var o3 = e2.unstable_now();
      switch (typeof a3 == `object` && a3 ? (a3 = a3.delay, a3 = typeof a3 == `number` && 0 < a3 ? o3 + a3 : o3) :
      a3 = o3, r3) {
        case 1:
          var s3 = -1;
          break;
        case 2:
          s3 = 250;
          break;
        case 5:
          s3 = 1073741823;
          break;
        case 4:
          s3 = 1e4;
          break;
        default:
          s3 = 5e3;
      }
      return s3 = a3 + s3, r3 = { id: u2++, callback: i3, priorityLevel: r3, startTime: a3, expirationTime: s3,
      sortIndex: -1 }, a3 > o3 ? (r3.sortIndex = a3, t2(l2, r3), n2(c2) === null && r3 === n2(l2) && (h2 ? (v2(
      S2), S2 = -1) : h2 = true, ae2(x2, a3 - o3))) : (r3.sortIndex = s3, t2(c2, r3), m2 || p2 || (m2 = true, ee2 ||
      (ee2 = true, T2()))), r3;
    }, e2.unstable_shouldYield = te2, e2.unstable_wrapCallback = function(e3) {
      var t3 = f2;
      return function() {
        var n3 = f2;
        f2 = t3;
        try {
          return e3.apply(this, arguments);
        } finally {
          f2 = n3;
        }
      };
    };
  })), u = o(((e2, t2) => {
    t2.exports = l();
  })), d = o(((e2) => {
    var t2 = Symbol.for(`react.transitional.element`), n2 = Symbol.for(`react.portal`), r2 = Symbol.for(`react\
.fragment`), i2 = Symbol.for(`react.strict_mode`), a2 = Symbol.for(`react.profiler`), o2 = Symbol.for(`react.c\
onsumer`), s2 = Symbol.for(`react.context`), c2 = Symbol.for(`react.forward_ref`), l2 = Symbol.for(`react.susp\
ense`), u2 = Symbol.for(`react.memo`), d2 = Symbol.for(`react.lazy`), f2 = Symbol.for(`react.activity`), p2 = Symbol.
    iterator;
    function m2(e3) {
      return typeof e3 != `object` || !e3 ? null : (e3 = p2 && e3[p2] || e3[`@@iterator`], typeof e3 == `funct\
ion` ? e3 : null);
    }
    var h2 = { isMounted: function() {
      return false;
    }, enqueueForceUpdate: function() {
    }, enqueueReplaceState: function() {
    }, enqueueSetState: function() {
    } }, g2 = Object.assign, _2 = {};
    function v2(e3, t3, n3) {
      this.props = e3, this.context = t3, this.refs = _2, this.updater = n3 || h2;
    }
    v2.prototype.isReactComponent = {}, v2.prototype.setState = function(e3, t3) {
      if (typeof e3 != `object` && typeof e3 != `function` && e3 != null) throw Error(`takes an object of stat\
e variables to update or a function which returns an object of state variables.`);
      this.updater.enqueueSetState(this, e3, t3, `setState`);
    }, v2.prototype.forceUpdate = function(e3) {
      this.updater.enqueueForceUpdate(this, e3, `forceUpdate`);
    };
    function y2() {
    }
    y2.prototype = v2.prototype;
    function b2(e3, t3, n3) {
      this.props = e3, this.context = t3, this.refs = _2, this.updater = n3 || h2;
    }
    var x2 = b2.prototype = new y2();
    x2.constructor = b2, g2(x2, v2.prototype), x2.isPureReactComponent = true;
    var ee2 = Array.isArray;
    function S2() {
    }
    var C2 = { H: null, A: null, T: null, S: null }, w2 = Object.prototype.hasOwnProperty;
    function te2(e3, n3, r3) {
      var i3 = r3.ref;
      return { $$typeof: t2, type: e3, key: n3, ref: i3 === void 0 ? null : i3, props: r3 };
    }
    function ne2(e3, t3) {
      return te2(e3.type, t3, e3.props);
    }
    function T2(e3) {
      return typeof e3 == `object` && !!e3 && e3.$$typeof === t2;
    }
    function re2(e3) {
      var t3 = { "=": `=0`, ":": `=2` };
      return `$` + e3.replace(/[=:]/g, function(e4) {
        return t3[e4];
      });
    }
    var ie2 = /\/+/g;
    function ae2(e3, t3) {
      return typeof e3 == `object` && e3 && e3.key != null ? re2(`` + e3.key) : t3.toString(36);
    }
    function oe2(e3) {
      switch (e3.status) {
        case `fulfilled`:
          return e3.value;
        case `rejected`:
          throw e3.reason;
        default:
          switch (typeof e3.status == `string` ? e3.then(S2, S2) : (e3.status = `pending`, e3.then(function(t3) {
            e3.status === `pending` && (e3.status = `fulfilled`, e3.value = t3);
          }, function(t3) {
            e3.status === `pending` && (e3.status = `rejected`, e3.reason = t3);
          })), e3.status) {
            case `fulfilled`:
              return e3.value;
            case `rejected`:
              throw e3.reason;
          }
      }
      throw e3;
    }
    function se2(e3, r3, i3, a3, o3) {
      var s3 = typeof e3;
      (s3 === `undefined` || s3 === `boolean`) && (e3 = null);
      var c3 = false;
      if (e3 === null) c3 = true;
      else switch (s3) {
        case `bigint`:
        case `string`:
        case `number`:
          c3 = true;
          break;
        case `object`:
          switch (e3.$$typeof) {
            case t2:
            case n2:
              c3 = true;
              break;
            case d2:
              return c3 = e3._init, se2(c3(e3._payload), r3, i3, a3, o3);
          }
      }
      if (c3) return o3 = o3(e3), c3 = a3 === `` ? `.` + ae2(e3, 0) : a3, ee2(o3) ? (i3 = ``, c3 != null && (i3 =
      c3.replace(ie2, `$&/`) + `/`), se2(o3, r3, i3, ``, function(e4) {
        return e4;
      })) : o3 != null && (T2(o3) && (o3 = ne2(o3, i3 + (o3.key == null || e3 && e3.key === o3.key ? `` : (`` +
      o3.key).replace(ie2, `$&/`) + `/`) + c3)), r3.push(o3)), 1;
      c3 = 0;
      var l3 = a3 === `` ? `.` : a3 + `:`;
      if (ee2(e3)) for (var u3 = 0; u3 < e3.length; u3++) a3 = e3[u3], s3 = l3 + ae2(a3, u3), c3 += se2(a3, r3,
      i3, s3, o3);
      else if (u3 = m2(e3), typeof u3 == `function`) for (e3 = u3.call(e3), u3 = 0; !(a3 = e3.next()).done; ) a3 =
      a3.value, s3 = l3 + ae2(a3, u3++), c3 += se2(a3, r3, i3, s3, o3);
      else if (s3 === `object`) {
        if (typeof e3.then == `function`) return se2(oe2(e3), r3, i3, a3, o3);
        throw r3 = String(e3), Error(`Objects are not valid as a React child (found: ` + (r3 === `[object Obje\
ct]` ? `object with keys {` + Object.keys(e3).join(`, `) + `}` : r3) + `). If you meant to render a collection\
 of children, use an array instead.`);
      }
      return c3;
    }
    function ce2(e3, t3, n3) {
      if (e3 == null) return e3;
      var r3 = [], i3 = 0;
      return se2(e3, r3, ``, ``, function(e4) {
        return t3.call(n3, e4, i3++);
      }), r3;
    }
    function le2(e3) {
      if (e3._status === -1) {
        var t3 = e3._result;
        t3 = t3(), t3.then(function(t4) {
          (e3._status === 0 || e3._status === -1) && (e3._status = 1, e3._result = t4);
        }, function(t4) {
          (e3._status === 0 || e3._status === -1) && (e3._status = 2, e3._result = t4);
        }), e3._status === -1 && (e3._status = 0, e3._result = t3);
      }
      if (e3._status === 1) return e3._result.default;
      throw e3._result;
    }
    var E2 = typeof reportError == `function` ? reportError : function(e3) {
      if (typeof window == `object` && typeof window.ErrorEvent == `function`) {
        var t3 = new window.ErrorEvent(`error`, { bubbles: true, cancelable: true, message: typeof e3 == `obje\
ct` && e3 && typeof e3.message == `string` ? String(e3.message) : String(e3), error: e3 });
        if (!window.dispatchEvent(t3)) return;
      } else if (typeof process == `object` && typeof process.emit == `function`) {
        process.emit(`uncaughtException`, e3);
        return;
      }
      console.error(e3);
    }, D2 = { map: ce2, forEach: function(e3, t3, n3) {
      ce2(e3, function() {
        t3.apply(this, arguments);
      }, n3);
    }, count: function(e3) {
      var t3 = 0;
      return ce2(e3, function() {
        t3++;
      }), t3;
    }, toArray: function(e3) {
      return ce2(e3, function(e4) {
        return e4;
      }) || [];
    }, only: function(e3) {
      if (!T2(e3)) throw Error(`React.Children.only expected to receive a single React element child.`);
      return e3;
    } };
    e2.Activity = f2, e2.Children = D2, e2.Component = v2, e2.Fragment = r2, e2.Profiler = a2, e2.PureComponent =
    b2, e2.StrictMode = i2, e2.Suspense = l2, e2.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE =
    C2, e2.__COMPILER_RUNTIME = { __proto__: null, c: function(e3) {
      return C2.H.useMemoCache(e3);
    } }, e2.cache = function(e3) {
      return function() {
        return e3.apply(null, arguments);
      };
    }, e2.cacheSignal = function() {
      return null;
    }, e2.cloneElement = function(e3, t3, n3) {
      if (e3 == null) throw Error(`The argument must be a React element, but you passed ` + e3 + `.`);
      var r3 = g2({}, e3.props), i3 = e3.key;
      if (t3 != null) for (a3 in t3.key !== void 0 && (i3 = `` + t3.key), t3) !w2.call(t3, a3) || a3 === `key` ||
      a3 === `__self` || a3 === `__source` || a3 === `ref` && t3.ref === void 0 || (r3[a3] = t3[a3]);
      var a3 = arguments.length - 2;
      if (a3 === 1) r3.children = n3;
      else if (1 < a3) {
        for (var o3 = Array(a3), s3 = 0; s3 < a3; s3++) o3[s3] = arguments[s3 + 2];
        r3.children = o3;
      }
      return te2(e3.type, i3, r3);
    }, e2.createContext = function(e3) {
      return e3 = { $$typeof: s2, _currentValue: e3, _currentValue2: e3, _threadCount: 0, Provider: null, Consumer: null },
      e3.Provider = e3, e3.Consumer = { $$typeof: o2, _context: e3 }, e3;
    }, e2.createElement = function(e3, t3, n3) {
      var r3, i3 = {}, a3 = null;
      if (t3 != null) for (r3 in t3.key !== void 0 && (a3 = `` + t3.key), t3) w2.call(t3, r3) && r3 !== `key` &&
      r3 !== `__self` && r3 !== `__source` && (i3[r3] = t3[r3]);
      var o3 = arguments.length - 2;
      if (o3 === 1) i3.children = n3;
      else if (1 < o3) {
        for (var s3 = Array(o3), c3 = 0; c3 < o3; c3++) s3[c3] = arguments[c3 + 2];
        i3.children = s3;
      }
      if (e3 && e3.defaultProps) for (r3 in o3 = e3.defaultProps, o3) i3[r3] === void 0 && (i3[r3] = o3[r3]);
      return te2(e3, a3, i3);
    }, e2.createRef = function() {
      return { current: null };
    }, e2.forwardRef = function(e3) {
      return { $$typeof: c2, render: e3 };
    }, e2.isValidElement = T2, e2.lazy = function(e3) {
      return { $$typeof: d2, _payload: { _status: -1, _result: e3 }, _init: le2 };
    }, e2.memo = function(e3, t3) {
      return { $$typeof: u2, type: e3, compare: t3 === void 0 ? null : t3 };
    }, e2.startTransition = function(e3) {
      var t3 = C2.T, n3 = {};
      C2.T = n3;
      try {
        var r3 = e3(), i3 = C2.S;
        i3 !== null && i3(n3, r3), typeof r3 == `object` && r3 && typeof r3.then == `function` && r3.then(S2, E2);
      } catch (e4) {
        E2(e4);
      } finally {
        t3 !== null && n3.types !== null && (t3.types = n3.types), C2.T = t3;
      }
    }, e2.unstable_useCacheRefresh = function() {
      return C2.H.useCacheRefresh();
    }, e2.use = function(e3) {
      return C2.H.use(e3);
    }, e2.useActionState = function(e3, t3, n3) {
      return C2.H.useActionState(e3, t3, n3);
    }, e2.useCallback = function(e3, t3) {
      return C2.H.useCallback(e3, t3);
    }, e2.useContext = function(e3) {
      return C2.H.useContext(e3);
    }, e2.useDebugValue = function() {
    }, e2.useDeferredValue = function(e3, t3) {
      return C2.H.useDeferredValue(e3, t3);
    }, e2.useEffect = function(e3, t3) {
      return C2.H.useEffect(e3, t3);
    }, e2.useEffectEvent = function(e3) {
      return C2.H.useEffectEvent(e3);
    }, e2.useId = function() {
      return C2.H.useId();
    }, e2.useImperativeHandle = function(e3, t3, n3) {
      return C2.H.useImperativeHandle(e3, t3, n3);
    }, e2.useInsertionEffect = function(e3, t3) {
      return C2.H.useInsertionEffect(e3, t3);
    }, e2.useLayoutEffect = function(e3, t3) {
      return C2.H.useLayoutEffect(e3, t3);
    }, e2.useMemo = function(e3, t3) {
      return C2.H.useMemo(e3, t3);
    }, e2.useOptimistic = function(e3, t3) {
      return C2.H.useOptimistic(e3, t3);
    }, e2.useReducer = function(e3, t3, n3) {
      return C2.H.useReducer(e3, t3, n3);
    }, e2.useRef = function(e3) {
      return C2.H.useRef(e3);
    }, e2.useState = function(e3) {
      return C2.H.useState(e3);
    }, e2.useSyncExternalStore = function(e3, t3, n3) {
      return C2.H.useSyncExternalStore(e3, t3, n3);
    }, e2.useTransition = function() {
      return C2.H.useTransition();
    }, e2.version = `19.2.8`;
  })), f = o(((e2, t2) => {
    t2.exports = d();
  })), p = o(((e2) => {
    var t2 = f();
    function n2(e3) {
      var t3 = `https://react.dev/errors/` + e3;
      if (1 < arguments.length) {
        t3 += `?args[]=` + encodeURIComponent(arguments[1]);
        for (var n3 = 2; n3 < arguments.length; n3++) t3 += `&args[]=` + encodeURIComponent(arguments[n3]);
      }
      return `Minified React error #` + e3 + `; visit ` + t3 + ` for the full message or use the non-minified \
dev environment for full errors and additional helpful warnings.`;
    }
    function r2() {
    }
    var i2 = { d: { f: r2, r: function() {
      throw Error(n2(522));
    }, D: r2, C: r2, L: r2, m: r2, X: r2, S: r2, M: r2 }, p: 0, findDOMNode: null }, a2 = Symbol.for(`react.po\
rtal`);
    function o2(e3, t3, n3) {
      var r3 = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
      return { $$typeof: a2, key: r3 == null ? null : `` + r3, children: e3, containerInfo: t3, implementation: n3 };
    }
    var s2 = t2.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
    function c2(e3, t3) {
      if (e3 === `font`) return ``;
      if (typeof t3 == `string`) return t3 === `use-credentials` ? t3 : ``;
    }
    e2.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = i2, e2.createPortal = function(e3, t3) {
      var r3 = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
      if (!t3 || t3.nodeType !== 1 && t3.nodeType !== 9 && t3.nodeType !== 11) throw Error(n2(299));
      return o2(e3, t3, null, r3);
    }, e2.flushSync = function(e3) {
      var t3 = s2.T, n3 = i2.p;
      try {
        if (s2.T = null, i2.p = 2, e3) return e3();
      } finally {
        s2.T = t3, i2.p = n3, i2.d.f();
      }
    }, e2.preconnect = function(e3, t3) {
      typeof e3 == `string` && (t3 ? (t3 = t3.crossOrigin, t3 = typeof t3 == `string` ? t3 === `use-credential\
s` ? t3 : `` : void 0) : t3 = null, i2.d.C(e3, t3));
    }, e2.prefetchDNS = function(e3) {
      typeof e3 == `string` && i2.d.D(e3);
    }, e2.preinit = function(e3, t3) {
      if (typeof e3 == `string` && t3 && typeof t3.as == `string`) {
        var n3 = t3.as, r3 = c2(n3, t3.crossOrigin), a3 = typeof t3.integrity == `string` ? t3.integrity : void 0,
        o3 = typeof t3.fetchPriority == `string` ? t3.fetchPriority : void 0;
        n3 === `style` ? i2.d.S(e3, typeof t3.precedence == `string` ? t3.precedence : void 0, { crossOrigin: r3,
        integrity: a3, fetchPriority: o3 }) : n3 === `script` && i2.d.X(e3, { crossOrigin: r3, integrity: a3, fetchPriority: o3,
        nonce: typeof t3.nonce == `string` ? t3.nonce : void 0 });
      }
    }, e2.preinitModule = function(e3, t3) {
      if (typeof e3 == `string`) {
        if (typeof t3 == `object` && t3) {
          if (t3.as == null || t3.as === `script`) {
            var n3 = c2(t3.as, t3.crossOrigin);
            i2.d.M(e3, { crossOrigin: n3, integrity: typeof t3.integrity == `string` ? t3.integrity : void 0, nonce: typeof t3.
            nonce == `string` ? t3.nonce : void 0 });
          }
        } else t3 ?? i2.d.M(e3);
      }
    }, e2.preload = function(e3, t3) {
      if (typeof e3 == `string` && typeof t3 == `object` && t3 && typeof t3.as == `string`) {
        var n3 = t3.as, r3 = c2(n3, t3.crossOrigin);
        i2.d.L(e3, n3, { crossOrigin: r3, integrity: typeof t3.integrity == `string` ? t3.integrity : void 0, nonce: typeof t3.
        nonce == `string` ? t3.nonce : void 0, type: typeof t3.type == `string` ? t3.type : void 0, fetchPriority: typeof t3.
        fetchPriority == `string` ? t3.fetchPriority : void 0, referrerPolicy: typeof t3.referrerPolicy == `st\
ring` ? t3.referrerPolicy : void 0, imageSrcSet: typeof t3.imageSrcSet == `string` ? t3.imageSrcSet : void 0, imageSizes: typeof t3.
        imageSizes == `string` ? t3.imageSizes : void 0, media: typeof t3.media == `string` ? t3.media : void 0 });
      }
    }, e2.preloadModule = function(e3, t3) {
      if (typeof e3 == `string`) {
        if (t3) {
          var n3 = c2(t3.as, t3.crossOrigin);
          i2.d.m(e3, { as: typeof t3.as == `string` && t3.as !== `script` ? t3.as : void 0, crossOrigin: n3, integrity: typeof t3.
          integrity == `string` ? t3.integrity : void 0 });
        } else i2.d.m(e3);
      }
    }, e2.requestFormReset = function(e3) {
      i2.d.r(e3);
    }, e2.unstable_batchedUpdates = function(e3, t3) {
      return e3(t3);
    }, e2.useFormState = function(e3, t3, n3) {
      return s2.H.useFormState(e3, t3, n3);
    }, e2.useFormStatus = function() {
      return s2.H.useHostTransitionStatus();
    }, e2.version = `19.2.8`;
  })), m = o(((e2, t2) => {
    function n2() {
      if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > `u` || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != `\
function`)) try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n2);
      } catch (e3) {
        console.error(e3);
      }
    }
    n2(), t2.exports = p();
  })), h = o(((e2) => {
    var t2 = u(), n2 = f(), r2 = m();
    function i2(e3) {
      var t3 = `https://react.dev/errors/` + e3;
      if (1 < arguments.length) {
        t3 += `?args[]=` + encodeURIComponent(arguments[1]);
        for (var n3 = 2; n3 < arguments.length; n3++) t3 += `&args[]=` + encodeURIComponent(arguments[n3]);
      }
      return `Minified React error #` + e3 + `; visit ` + t3 + ` for the full message or use the non-minified \
dev environment for full errors and additional helpful warnings.`;
    }
    function a2(e3) {
      return !(!e3 || e3.nodeType !== 1 && e3.nodeType !== 9 && e3.nodeType !== 11);
    }
    function o2(e3) {
      var t3 = e3, n3 = e3;
      if (e3.alternate) for (; t3.return; ) t3 = t3.return;
      else {
        e3 = t3;
        do
          t3 = e3, t3.flags & 4098 && (n3 = t3.return), e3 = t3.return;
        while (e3);
      }
      return t3.tag === 3 ? n3 : null;
    }
    function s2(e3) {
      if (e3.tag === 13) {
        var t3 = e3.memoizedState;
        if (t3 === null && (e3 = e3.alternate, e3 !== null && (t3 = e3.memoizedState)), t3 !== null) return t3.
        dehydrated;
      }
      return null;
    }
    function c2(e3) {
      if (e3.tag === 31) {
        var t3 = e3.memoizedState;
        if (t3 === null && (e3 = e3.alternate, e3 !== null && (t3 = e3.memoizedState)), t3 !== null) return t3.
        dehydrated;
      }
      return null;
    }
    function l2(e3) {
      if (o2(e3) !== e3) throw Error(i2(188));
    }
    function d2(e3) {
      var t3 = e3.alternate;
      if (!t3) {
        if (t3 = o2(e3), t3 === null) throw Error(i2(188));
        return t3 === e3 ? e3 : null;
      }
      for (var n3 = e3, r3 = t3; ; ) {
        var a3 = n3.return;
        if (a3 === null) break;
        var s3 = a3.alternate;
        if (s3 === null) {
          if (r3 = a3.return, r3 !== null) {
            n3 = r3;
            continue;
          }
          break;
        }
        if (a3.child === s3.child) {
          for (s3 = a3.child; s3; ) {
            if (s3 === n3) return l2(a3), e3;
            if (s3 === r3) return l2(a3), t3;
            s3 = s3.sibling;
          }
          throw Error(i2(188));
        }
        if (n3.return !== r3.return) n3 = a3, r3 = s3;
        else {
          for (var c3 = false, u2 = a3.child; u2; ) {
            if (u2 === n3) {
              c3 = true, n3 = a3, r3 = s3;
              break;
            }
            if (u2 === r3) {
              c3 = true, r3 = a3, n3 = s3;
              break;
            }
            u2 = u2.sibling;
          }
          if (!c3) {
            for (u2 = s3.child; u2; ) {
              if (u2 === n3) {
                c3 = true, n3 = s3, r3 = a3;
                break;
              }
              if (u2 === r3) {
                c3 = true, r3 = s3, n3 = a3;
                break;
              }
              u2 = u2.sibling;
            }
            if (!c3) throw Error(i2(189));
          }
        }
        if (n3.alternate !== r3) throw Error(i2(190));
      }
      if (n3.tag !== 3) throw Error(i2(188));
      return n3.stateNode.current === n3 ? e3 : t3;
    }
    function p2(e3) {
      var t3 = e3.tag;
      if (t3 === 5 || t3 === 26 || t3 === 27 || t3 === 6) return e3;
      for (e3 = e3.child; e3 !== null; ) {
        if (t3 = p2(e3), t3 !== null) return t3;
        e3 = e3.sibling;
      }
      return null;
    }
    var h2 = Object.assign, g2 = Symbol.for(`react.element`), _2 = Symbol.for(`react.transitional.element`), v2 = Symbol.
    for(`react.portal`), y2 = Symbol.for(`react.fragment`), b2 = Symbol.for(`react.strict_mode`), x2 = Symbol.
    for(`react.profiler`), ee2 = Symbol.for(`react.consumer`), S2 = Symbol.for(`react.context`), C2 = Symbol.for(
    `react.forward_ref`), w2 = Symbol.for(`react.suspense`), te2 = Symbol.for(`react.suspense_list`), ne2 = Symbol.
    for(`react.memo`), T2 = Symbol.for(`react.lazy`), re2 = Symbol.for(`react.activity`), ie2 = Symbol.for(`re\
act.memo_cache_sentinel`), ae2 = Symbol.iterator;
    function oe2(e3) {
      return typeof e3 != `object` || !e3 ? null : (e3 = ae2 && e3[ae2] || e3[`@@iterator`], typeof e3 == `fun\
ction` ? e3 : null);
    }
    var se2 = Symbol.for(`react.client.reference`);
    function ce2(e3) {
      if (e3 == null) return null;
      if (typeof e3 == `function`) return e3.$$typeof === se2 ? null : e3.displayName || e3.name || null;
      if (typeof e3 == `string`) return e3;
      switch (e3) {
        case y2:
          return `Fragment`;
        case x2:
          return `Profiler`;
        case b2:
          return `StrictMode`;
        case w2:
          return `Suspense`;
        case te2:
          return `SuspenseList`;
        case re2:
          return `Activity`;
      }
      if (typeof e3 == `object`) switch (e3.$$typeof) {
        case v2:
          return `Portal`;
        case S2:
          return e3.displayName || `Context`;
        case ee2:
          return (e3._context.displayName || `Context`) + `.Consumer`;
        case C2:
          var t3 = e3.render;
          return e3 = e3.displayName, e3 ||= (e3 = t3.displayName || t3.name || ``, e3 === `` ? `ForwardRef` :
          `ForwardRef(` + e3 + `)`), e3;
        case ne2:
          return t3 = e3.displayName || null, t3 === null ? ce2(e3.type) || `Memo` : t3;
        case T2:
          t3 = e3._payload, e3 = e3._init;
          try {
            return ce2(e3(t3));
          } catch {
          }
      }
      return null;
    }
    var le2 = Array.isArray, E2 = n2.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, D2 = r2.
    __DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, ue2 = { pending: false, data: null, method: null,
    action: null }, de2 = [], fe2 = -1;
    function O2(e3) {
      return { current: e3 };
    }
    function k2(e3) {
      0 > fe2 || (e3.current = de2[fe2], de2[fe2] = null, fe2--);
    }
    function A2(e3, t3) {
      fe2++, de2[fe2] = e3.current, e3.current = t3;
    }
    var pe2 = O2(null), j2 = O2(null), me2 = O2(null), he2 = O2(null);
    function ge2(e3, t3) {
      switch (A2(me2, t3), A2(j2, e3), A2(pe2, null), t3.nodeType) {
        case 9:
        case 11:
          e3 = (e3 = t3.documentElement) && (e3 = e3.namespaceURI) ? Vd(e3) : 0;
          break;
        default:
          if (e3 = t3.tagName, t3 = t3.namespaceURI) t3 = Vd(t3), e3 = Hd(t3, e3);
          else switch (e3) {
            case `svg`:
              e3 = 1;
              break;
            case `math`:
              e3 = 2;
              break;
            default:
              e3 = 0;
          }
      }
      k2(pe2), A2(pe2, e3);
    }
    function _e2() {
      k2(pe2), k2(j2), k2(me2);
    }
    function ve2(e3) {
      e3.memoizedState !== null && A2(he2, e3);
      var t3 = pe2.current, n3 = Hd(t3, e3.type);
      t3 !== n3 && (A2(j2, e3), A2(pe2, n3));
    }
    function ye2(e3) {
      j2.current === e3 && (k2(pe2), k2(j2)), he2.current === e3 && (k2(he2), Qf._currentValue = ue2);
    }
    var be2, xe2;
    function Se2(e3) {
      if (be2 === void 0) try {
        throw Error();
      } catch (e4) {
        var t3 = e4.stack.trim().match(/\n( *(at )?)/);
        be2 = t3 && t3[1] || ``, xe2 = -1 < e4.stack.indexOf(`
    at`) ? ` (<anonymous>)` : -1 < e4.stack.indexOf(`@`) ? `@unknown:0:0` : ``;
      }
      return `
` + be2 + e3 + xe2;
    }
    var Ce2 = false;
    function we2(e3, t3) {
      if (!e3 || Ce2) return ``;
      Ce2 = true;
      var n3 = Error.prepareStackTrace;
      Error.prepareStackTrace = void 0;
      try {
        var r3 = { DetermineComponentFrameRoot: function() {
          try {
            if (t3) {
              var n4 = function() {
                throw Error();
              };
              if (Object.defineProperty(n4.prototype, "props", { set: function() {
                throw Error();
              } }), typeof Reflect == `object` && Reflect.construct) {
                try {
                  Reflect.construct(n4, []);
                } catch (e4) {
                  var r4 = e4;
                }
                Reflect.construct(e3, [], n4);
              } else {
                try {
                  n4.call();
                } catch (e4) {
                  r4 = e4;
                }
                e3.call(n4.prototype);
              }
            } else {
              try {
                throw Error();
              } catch (e4) {
                r4 = e4;
              }
              (n4 = e3()) && typeof n4.catch == `function` && n4.catch(function() {
              });
            }
          } catch (e4) {
            if (e4 && r4 && typeof e4.stack == `string`) return [e4.stack, r4.stack];
          }
          return [null, null];
        } };
        r3.DetermineComponentFrameRoot.displayName = `DetermineComponentFrameRoot`;
        var i3 = Object.getOwnPropertyDescriptor(r3.DetermineComponentFrameRoot, `name`);
        i3 && i3.configurable && Object.defineProperty(r3.DetermineComponentFrameRoot, "name", { value: `Deter\
mineComponentFrameRoot` });
        var a3 = r3.DetermineComponentFrameRoot(), o3 = a3[0], s3 = a3[1];
        if (o3 && s3) {
          var c3 = o3.split(`
`), l3 = s3.split(`
`);
          for (i3 = r3 = 0; r3 < c3.length && !c3[r3].includes(`DetermineComponentFrameRoot`); ) r3++;
          for (; i3 < l3.length && !l3[i3].includes(`DetermineComponentFrameRoot`); ) i3++;
          if (r3 === c3.length || i3 === l3.length) for (r3 = c3.length - 1, i3 = l3.length - 1; 1 <= r3 && 0 <=
          i3 && c3[r3] !== l3[i3]; ) i3--;
          for (; 1 <= r3 && 0 <= i3; r3--, i3--) if (c3[r3] !== l3[i3]) {
            if (r3 !== 1 || i3 !== 1) do
              if (r3--, i3--, 0 > i3 || c3[r3] !== l3[i3]) {
                var u2 = `
` + c3[r3].replace(` at new `, ` at `);
                return e3.displayName && u2.includes(`<anonymous>`) && (u2 = u2.replace(`<anonymous>`, e3.displayName)),
                u2;
              }
            while (1 <= r3 && 0 <= i3);
            break;
          }
        }
      } finally {
        Ce2 = false, Error.prepareStackTrace = n3;
      }
      return (n3 = e3 ? e3.displayName || e3.name : ``) ? Se2(n3) : ``;
    }
    function Te2(e3, t3) {
      switch (e3.tag) {
        case 26:
        case 27:
        case 5:
          return Se2(e3.type);
        case 16:
          return Se2(`Lazy`);
        case 13:
          return e3.child !== t3 && t3 !== null ? Se2(`Suspense Fallback`) : Se2(`Suspense`);
        case 19:
          return Se2(`SuspenseList`);
        case 0:
        case 15:
          return we2(e3.type, false);
        case 11:
          return we2(e3.type.render, false);
        case 1:
          return we2(e3.type, true);
        case 31:
          return Se2(`Activity`);
        default:
          return ``;
      }
    }
    function Ee2(e3) {
      try {
        var t3 = ``, n3 = null;
        do
          t3 += Te2(e3, n3), n3 = e3, e3 = e3.return;
        while (e3);
        return t3;
      } catch (e4) {
        return `
Error generating stack: ` + e4.message + `
` + e4.stack;
      }
    }
    var De2 = Object.prototype.hasOwnProperty, Oe2 = t2.unstable_scheduleCallback, ke2 = t2.unstable_cancelCallback,
    Ae2 = t2.unstable_shouldYield, je2 = t2.unstable_requestPaint, Me2 = t2.unstable_now, Ne2 = t2.unstable_getCurrentPriorityLevel,
    Pe2 = t2.unstable_ImmediatePriority, Fe2 = t2.unstable_UserBlockingPriority, Ie2 = t2.unstable_NormalPriority,
    Le2 = t2.unstable_LowPriority, Re2 = t2.unstable_IdlePriority, ze2 = t2.log, Be2 = t2.unstable_setDisableYieldValue,
    Ve2 = null, He2 = null;
    function Ue2(e3) {
      if (typeof ze2 == `function` && Be2(e3), He2 && typeof He2.setStrictMode == `function`) try {
        He2.setStrictMode(Ve2, e3);
      } catch {
      }
    }
    var We2 = Math.clz32 ? Math.clz32 : qe2, Ge2 = Math.log, Ke2 = Math.LN2;
    function qe2(e3) {
      return e3 >>>= 0, e3 === 0 ? 32 : 31 - (Ge2(e3) / Ke2 | 0) | 0;
    }
    var M2 = 256, Je2 = 262144, Ye2 = 4194304;
    function Xe2(e3) {
      var t3 = e3 & 42;
      if (t3 !== 0) return t3;
      switch (e3 & -e3) {
        case 1:
          return 1;
        case 2:
          return 2;
        case 4:
          return 4;
        case 8:
          return 8;
        case 16:
          return 16;
        case 32:
          return 32;
        case 64:
          return 64;
        case 128:
          return 128;
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
          return e3 & 261888;
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
          return e3 & 3932160;
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
          return e3 & 62914560;
        case 67108864:
          return 67108864;
        case 134217728:
          return 134217728;
        case 268435456:
          return 268435456;
        case 536870912:
          return 536870912;
        case 1073741824:
          return 0;
        default:
          return e3;
      }
    }
    function Ze2(e3, t3, n3) {
      var r3 = e3.pendingLanes;
      if (r3 === 0) return 0;
      var i3 = 0, a3 = e3.suspendedLanes, o3 = e3.pingedLanes;
      e3 = e3.warmLanes;
      var s3 = r3 & 134217727;
      return s3 === 0 ? (s3 = r3 & ~a3, s3 === 0 ? o3 === 0 ? n3 || (n3 = r3 & ~e3, n3 !== 0 && (i3 = Xe2(n3))) :
      i3 = Xe2(o3) : i3 = Xe2(s3)) : (r3 = s3 & ~a3, r3 === 0 ? (o3 &= s3, o3 === 0 ? n3 || (n3 = s3 & ~e3, n3 !==
      0 && (i3 = Xe2(n3))) : i3 = Xe2(o3)) : i3 = Xe2(r3)), i3 === 0 ? 0 : t3 !== 0 && t3 !== i3 && (t3 & a3) ===
      0 && (a3 = i3 & -i3, n3 = t3 & -t3, a3 >= n3 || a3 === 32 && n3 & 4194048) ? t3 : i3;
    }
    function Qe2(e3, t3) {
      return (e3.pendingLanes & ~(e3.suspendedLanes & ~e3.pingedLanes) & t3) === 0;
    }
    function $e2(e3, t3) {
      switch (e3) {
        case 1:
        case 2:
        case 4:
        case 8:
        case 64:
          return t3 + 250;
        case 16:
        case 32:
        case 128:
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
          return t3 + 5e3;
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
          return -1;
        case 67108864:
        case 134217728:
        case 268435456:
        case 536870912:
        case 1073741824:
          return -1;
        default:
          return -1;
      }
    }
    function et2() {
      var e3 = Ye2;
      return Ye2 <<= 1, !(Ye2 & 62914560) && (Ye2 = 4194304), e3;
    }
    function tt2(e3) {
      for (var t3 = [], n3 = 0; 31 > n3; n3++) t3.push(e3);
      return t3;
    }
    function nt2(e3, t3) {
      e3.pendingLanes |= t3, t3 !== 268435456 && (e3.suspendedLanes = 0, e3.pingedLanes = 0, e3.warmLanes = 0);
    }
    function N2(e3, t3, n3, r3, i3, a3) {
      var o3 = e3.pendingLanes;
      e3.pendingLanes = n3, e3.suspendedLanes = 0, e3.pingedLanes = 0, e3.warmLanes = 0, e3.expiredLanes &= n3,
      e3.entangledLanes &= n3, e3.errorRecoveryDisabledLanes &= n3, e3.shellSuspendCounter = 0;
      var s3 = e3.entanglements, c3 = e3.expirationTimes, l3 = e3.hiddenUpdates;
      for (n3 = o3 & ~n3; 0 < n3; ) {
        var u2 = 31 - We2(n3), d3 = 1 << u2;
        s3[u2] = 0, c3[u2] = -1;
        var f2 = l3[u2];
        if (f2 !== null) for (l3[u2] = null, u2 = 0; u2 < f2.length; u2++) {
          var p3 = f2[u2];
          p3 !== null && (p3.lane &= -536870913);
        }
        n3 &= ~d3;
      }
      r3 !== 0 && rt2(e3, r3, 0), a3 !== 0 && i3 === 0 && e3.tag !== 0 && (e3.suspendedLanes |= a3 & ~(o3 & ~t3));
    }
    function rt2(e3, t3, n3) {
      e3.pendingLanes |= t3, e3.suspendedLanes &= ~t3;
      var r3 = 31 - We2(t3);
      e3.entangledLanes |= t3, e3.entanglements[r3] = e3.entanglements[r3] | 1073741824 | n3 & 261930;
    }
    function it2(e3, t3) {
      var n3 = e3.entangledLanes |= t3;
      for (e3 = e3.entanglements; n3; ) {
        var r3 = 31 - We2(n3), i3 = 1 << r3;
        i3 & t3 | e3[r3] & t3 && (e3[r3] |= t3), n3 &= ~i3;
      }
    }
    function at2(e3, t3) {
      var n3 = t3 & -t3;
      return n3 = n3 & 42 ? 1 : ot2(n3), (n3 & (e3.suspendedLanes | t3)) === 0 ? n3 : 0;
    }
    function ot2(e3) {
      switch (e3) {
        case 2:
          e3 = 1;
          break;
        case 8:
          e3 = 4;
          break;
        case 32:
          e3 = 16;
          break;
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
          e3 = 128;
          break;
        case 268435456:
          e3 = 134217728;
          break;
        default:
          e3 = 0;
      }
      return e3;
    }
    function st2(e3) {
      return e3 &= -e3, 2 < e3 ? 8 < e3 ? e3 & 134217727 ? 32 : 268435456 : 8 : 2;
    }
    function ct2() {
      var e3 = D2.p;
      return e3 === 0 ? (e3 = window.event, e3 === void 0 ? 32 : mp(e3.type)) : e3;
    }
    function lt2(e3, t3) {
      var n3 = D2.p;
      try {
        return D2.p = e3, t3();
      } finally {
        D2.p = n3;
      }
    }
    var ut2 = Math.random().toString(36).slice(2), dt2 = `__reactFiber$` + ut2, ft2 = `__reactProps$` + ut2, pt2 = `\
__reactContainer$` + ut2, P2 = `__reactEvents$` + ut2, mt2 = `__reactListeners$` + ut2, ht2 = `__reactHandles$` +
    ut2, gt2 = `__reactResources$` + ut2, _t2 = `__reactMarker$` + ut2;
    function vt2(e3) {
      delete e3[dt2], delete e3[ft2], delete e3[P2], delete e3[mt2], delete e3[ht2];
    }
    function yt2(e3) {
      var t3 = e3[dt2];
      if (t3) return t3;
      for (var n3 = e3.parentNode; n3; ) {
        if (t3 = n3[pt2] || n3[dt2]) {
          if (n3 = t3.alternate, t3.child !== null || n3 !== null && n3.child !== null) for (e3 = df(e3); e3 !==
          null; ) {
            if (n3 = e3[dt2]) return n3;
            e3 = df(e3);
          }
          return t3;
        }
        e3 = n3, n3 = e3.parentNode;
      }
      return null;
    }
    function bt2(e3) {
      if (e3 = e3[dt2] || e3[pt2]) {
        var t3 = e3.tag;
        if (t3 === 5 || t3 === 6 || t3 === 13 || t3 === 31 || t3 === 26 || t3 === 27 || t3 === 3) return e3;
      }
      return null;
    }
    function F2(e3) {
      var t3 = e3.tag;
      if (t3 === 5 || t3 === 26 || t3 === 27 || t3 === 6) return e3.stateNode;
      throw Error(i2(33));
    }
    function xt2(e3) {
      var t3 = e3[gt2];
      return t3 ||= e3[gt2] = { hoistableStyles: /* @__PURE__ */ new Map(), hoistableScripts: /* @__PURE__ */ new Map() },
      t3;
    }
    function St2(e3) {
      e3[_t2] = true;
    }
    var Ct2 = /* @__PURE__ */ new Set(), wt2 = {};
    function Tt2(e3, t3) {
      Et2(e3, t3), Et2(e3 + `Capture`, t3);
    }
    function Et2(e3, t3) {
      for (wt2[e3] = t3, e3 = 0; e3 < t3.length; e3++) Ct2.add(t3[e3]);
    }
    var Dt2 = RegExp(`^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\
\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u\
02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-\
.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$`), Ot2 = {}, kt2 = {};
    function At2(e3) {
      return De2.call(kt2, e3) ? true : De2.call(Ot2, e3) ? false : Dt2.test(e3) ? kt2[e3] = true : (Ot2[e3] =
      true, false);
    }
    function jt2(e3, t3, n3) {
      if (At2(t3)) {
        if (n3 === null) e3.removeAttribute(t3);
        else {
          switch (typeof n3) {
            case `undefined`:
            case `function`:
            case `symbol`:
              e3.removeAttribute(t3);
              return;
            case `boolean`:
              var r3 = t3.toLowerCase().slice(0, 5);
              if (r3 !== `data-` && r3 !== `aria-`) {
                e3.removeAttribute(t3);
                return;
              }
          }
          e3.setAttribute(t3, `` + n3);
        }
      }
    }
    function Mt2(e3, t3, n3) {
      if (n3 === null) e3.removeAttribute(t3);
      else {
        switch (typeof n3) {
          case `undefined`:
          case `function`:
          case `symbol`:
          case `boolean`:
            e3.removeAttribute(t3);
            return;
        }
        e3.setAttribute(t3, `` + n3);
      }
    }
    function Nt2(e3, t3, n3, r3) {
      if (r3 === null) e3.removeAttribute(n3);
      else {
        switch (typeof r3) {
          case `undefined`:
          case `function`:
          case `symbol`:
          case `boolean`:
            e3.removeAttribute(n3);
            return;
        }
        e3.setAttributeNS(t3, n3, `` + r3);
      }
    }
    function Pt2(e3) {
      switch (typeof e3) {
        case `bigint`:
        case `boolean`:
        case `number`:
        case `string`:
        case `undefined`:
          return e3;
        case `object`:
          return e3;
        default:
          return ``;
      }
    }
    function Ft2(e3) {
      var t3 = e3.type;
      return (e3 = e3.nodeName) && e3.toLowerCase() === `input` && (t3 === `checkbox` || t3 === `radio`);
    }
    function It2(e3, t3, n3) {
      var r3 = Object.getOwnPropertyDescriptor(e3.constructor.prototype, t3);
      if (!e3.hasOwnProperty(t3) && r3 !== void 0 && typeof r3.get == `function` && typeof r3.set == `function`) {
        var i3 = r3.get, a3 = r3.set;
        return Object.defineProperty(e3, t3, { configurable: true, get: function() {
          return i3.call(this);
        }, set: function(e4) {
          n3 = `` + e4, a3.call(this, e4);
        } }), Object.defineProperty(e3, t3, { enumerable: r3.enumerable }), { getValue: function() {
          return n3;
        }, setValue: function(e4) {
          n3 = `` + e4;
        }, stopTracking: function() {
          e3._valueTracker = null, delete e3[t3];
        } };
      }
    }
    function Lt2(e3) {
      if (!e3._valueTracker) {
        var t3 = Ft2(e3) ? `checked` : `value`;
        e3._valueTracker = It2(e3, t3, `` + e3[t3]);
      }
    }
    function Rt2(e3) {
      if (!e3) return false;
      var t3 = e3._valueTracker;
      if (!t3) return true;
      var n3 = t3.getValue(), r3 = ``;
      return e3 && (r3 = Ft2(e3) ? e3.checked ? `true` : `false` : e3.value), e3 = r3, e3 !== n3 && (t3.setValue(
      e3), true);
    }
    function zt2(e3) {
      if (e3 ||= typeof document < `u` ? document : void 0, e3 === void 0) return null;
      try {
        return e3.activeElement || e3.body;
      } catch {
        return e3.body;
      }
    }
    var Bt2 = /[\n"\\]/g;
    function Vt2(e3) {
      return e3.replace(Bt2, function(e4) {
        return `\\` + e4.charCodeAt(0).toString(16) + ` `;
      });
    }
    function Ht2(e3, t3, n3, r3, i3, a3, o3, s3) {
      e3.name = ``, o3 != null && typeof o3 != `function` && typeof o3 != `symbol` && typeof o3 != `boolean` ?
      e3.type = o3 : e3.removeAttribute(`type`), t3 == null ? o3 !== `submit` && o3 !== `reset` || e3.removeAttribute(
      `value`) : o3 === `number` ? (t3 === 0 && e3.value === `` || e3.value != t3) && (e3.value = `` + Pt2(t3)) :
      e3.value !== `` + Pt2(t3) && (e3.value = `` + Pt2(t3)), t3 == null ? n3 == null ? r3 != null && e3.removeAttribute(
      `value`) : Wt2(e3, o3, Pt2(n3)) : Wt2(e3, o3, Pt2(t3)), i3 == null && a3 != null && (e3.defaultChecked =
      !!a3), i3 != null && (e3.checked = i3 && typeof i3 != `function` && typeof i3 != `symbol`), s3 != null &&
      typeof s3 != `function` && typeof s3 != `symbol` && typeof s3 != `boolean` ? e3.name = `` + Pt2(s3) : e3.
      removeAttribute(`name`);
    }
    function Ut2(e3, t3, n3, r3, i3, a3, o3, s3) {
      if (a3 != null && typeof a3 != `function` && typeof a3 != `symbol` && typeof a3 != `boolean` && (e3.type =
      a3), t3 != null || n3 != null) {
        if (!(a3 !== `submit` && a3 !== `reset` || t3 != null)) {
          Lt2(e3);
          return;
        }
        n3 = n3 == null ? `` : `` + Pt2(n3), t3 = t3 == null ? n3 : `` + Pt2(t3), s3 || t3 === e3.value || (e3.
        value = t3), e3.defaultValue = t3;
      }
      r3 ??= i3, r3 = typeof r3 != `function` && typeof r3 != `symbol` && !!r3, e3.checked = s3 ? e3.checked :
      !!r3, e3.defaultChecked = !!r3, o3 != null && typeof o3 != `function` && typeof o3 != `symbol` && typeof o3 !=
      `boolean` && (e3.name = o3), Lt2(e3);
    }
    function Wt2(e3, t3, n3) {
      t3 === `number` && zt2(e3.ownerDocument) === e3 || e3.defaultValue === `` + n3 || (e3.defaultValue = `` +
      n3);
    }
    function Gt2(e3, t3, n3, r3) {
      if (e3 = e3.options, t3) {
        t3 = {};
        for (var i3 = 0; i3 < n3.length; i3++) t3[`$` + n3[i3]] = true;
        for (n3 = 0; n3 < e3.length; n3++) i3 = t3.hasOwnProperty(`$` + e3[n3].value), e3[n3].selected !== i3 &&
        (e3[n3].selected = i3), i3 && r3 && (e3[n3].defaultSelected = true);
      } else {
        for (n3 = `` + Pt2(n3), t3 = null, i3 = 0; i3 < e3.length; i3++) {
          if (e3[i3].value === n3) {
            e3[i3].selected = true, r3 && (e3[i3].defaultSelected = true);
            return;
          }
          t3 !== null || e3[i3].disabled || (t3 = e3[i3]);
        }
        t3 !== null && (t3.selected = true);
      }
    }
    function Kt2(e3, t3, n3) {
      if (t3 != null && (t3 = `` + Pt2(t3), t3 !== e3.value && (e3.value = t3), n3 == null)) {
        e3.defaultValue !== t3 && (e3.defaultValue = t3);
        return;
      }
      e3.defaultValue = n3 == null ? `` : `` + Pt2(n3);
    }
    function qt2(e3, t3, n3, r3) {
      if (t3 == null) {
        if (r3 != null) {
          if (n3 != null) throw Error(i2(92));
          if (le2(r3)) {
            if (1 < r3.length) throw Error(i2(93));
            r3 = r3[0];
          }
          n3 = r3;
        }
        n3 ??= ``, t3 = n3;
      }
      n3 = Pt2(t3), e3.defaultValue = n3, r3 = e3.textContent, r3 === n3 && r3 !== `` && r3 !== null && (e3.value =
      r3), Lt2(e3);
    }
    function Jt2(e3, t3) {
      if (t3) {
        var n3 = e3.firstChild;
        if (n3 && n3 === e3.lastChild && n3.nodeType === 3) {
          n3.nodeValue = t3;
          return;
        }
      }
      e3.textContent = t3;
    }
    var Yt2 = new Set(`animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth\
 boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative f\
lexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColu\
mnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity flo\
odOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimation\
IterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFl\
exNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan Webki\
tAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumn\
s WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp`.split(` `));
    function Xt2(e3, t3, n3) {
      var r3 = t3.indexOf(`--`) === 0;
      n3 == null || typeof n3 == `boolean` || n3 === `` ? r3 ? e3.setProperty(t3, ``) : t3 === `float` ? e3.cssFloat =
      `` : e3[t3] = `` : r3 ? e3.setProperty(t3, n3) : typeof n3 != `number` || n3 === 0 || Yt2.has(t3) ? t3 ===
      `float` ? e3.cssFloat = n3 : e3[t3] = (`` + n3).trim() : e3[t3] = n3 + `px`;
    }
    function Zt2(e3, t3, n3) {
      if (t3 != null && typeof t3 != `object`) throw Error(i2(62));
      if (e3 = e3.style, n3 != null) {
        for (var r3 in n3) !n3.hasOwnProperty(r3) || t3 != null && t3.hasOwnProperty(r3) || (r3.indexOf(`--`) ===
        0 ? e3.setProperty(r3, ``) : r3 === `float` ? e3.cssFloat = `` : e3[r3] = ``);
        for (var a3 in t3) r3 = t3[a3], t3.hasOwnProperty(a3) && n3[a3] !== r3 && Xt2(e3, a3, r3);
      } else for (var o3 in t3) t3.hasOwnProperty(o3) && Xt2(e3, o3, t3[o3]);
    }
    function Qt2(e3) {
      if (e3.indexOf(`-`) === -1) return false;
      switch (e3) {
        case `annotation-xml`:
        case `color-profile`:
        case `font-face`:
        case `font-face-src`:
        case `font-face-uri`:
        case `font-face-format`:
        case `font-face-name`:
        case `missing-glyph`:
          return false;
        default:
          return true;
      }
    }
    var $t2 = /* @__PURE__ */ new Map([[`acceptCharset`, `accept-charset`], [`htmlFor`, `for`], [`httpEquiv`, `\
http-equiv`], [`crossOrigin`, `crossorigin`], [`accentHeight`, `accent-height`], [`alignmentBaseline`, `alignm\
ent-baseline`], [`arabicForm`, `arabic-form`], [`baselineShift`, `baseline-shift`], [`capHeight`, `cap-height`],
    [`clipPath`, `clip-path`], [`clipRule`, `clip-rule`], [`colorInterpolation`, `color-interpolation`], [`col\
orInterpolationFilters`, `color-interpolation-filters`], [`colorProfile`, `color-profile`], [`colorRendering`,
    `color-rendering`], [`dominantBaseline`, `dominant-baseline`], [`enableBackground`, `enable-background`], [
    `fillOpacity`, `fill-opacity`], [`fillRule`, `fill-rule`], [`floodColor`, `flood-color`], [`floodOpacity`,
    `flood-opacity`], [`fontFamily`, `font-family`], [`fontSize`, `font-size`], [`fontSizeAdjust`, `font-size-\
adjust`], [`fontStretch`, `font-stretch`], [`fontStyle`, `font-style`], [`fontVariant`, `font-variant`], [`fon\
tWeight`, `font-weight`], [`glyphName`, `glyph-name`], [`glyphOrientationHorizontal`, `glyph-orientation-horiz\
ontal`], [`glyphOrientationVertical`, `glyph-orientation-vertical`], [`horizAdvX`, `horiz-adv-x`], [`horizOrig\
inX`, `horiz-origin-x`], [`imageRendering`, `image-rendering`], [`letterSpacing`, `letter-spacing`], [`lightin\
gColor`, `lighting-color`], [`markerEnd`, `marker-end`], [`markerMid`, `marker-mid`], [`markerStart`, `marker-\
start`], [`overlinePosition`, `overline-position`], [`overlineThickness`, `overline-thickness`], [`paintOrder`,
    `paint-order`], [`panose-1`, `panose-1`], [`pointerEvents`, `pointer-events`], [`renderingIntent`, `render\
ing-intent`], [`shapeRendering`, `shape-rendering`], [`stopColor`, `stop-color`], [`stopOpacity`, `stop-opacit\
y`], [`strikethroughPosition`, `strikethrough-position`], [`strikethroughThickness`, `strikethrough-thickness`],
    [`strokeDasharray`, `stroke-dasharray`], [`strokeDashoffset`, `stroke-dashoffset`], [`strokeLinecap`, `str\
oke-linecap`], [`strokeLinejoin`, `stroke-linejoin`], [`strokeMiterlimit`, `stroke-miterlimit`], [`strokeOpaci\
ty`, `stroke-opacity`], [`strokeWidth`, `stroke-width`], [`textAnchor`, `text-anchor`], [`textDecoration`, `te\
xt-decoration`], [`textRendering`, `text-rendering`], [`transformOrigin`, `transform-origin`], [`underlinePosi\
tion`, `underline-position`], [`underlineThickness`, `underline-thickness`], [`unicodeBidi`, `unicode-bidi`], [
    `unicodeRange`, `unicode-range`], [`unitsPerEm`, `units-per-em`], [`vAlphabetic`, `v-alphabetic`], [`vHang\
ing`, `v-hanging`], [`vIdeographic`, `v-ideographic`], [`vMathematical`, `v-mathematical`], [`vectorEffect`, `\
vector-effect`], [`vertAdvY`, `vert-adv-y`], [`vertOriginX`, `vert-origin-x`], [`vertOriginY`, `vert-origin-y`],
    [`wordSpacing`, `word-spacing`], [`writingMode`, `writing-mode`], [`xmlnsXlink`, `xmlns:xlink`], [`xHeight`,
    `x-height`]]), en2 = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
    function I2(e3) {
      return en2.test(`` + e3) ? `javascript:throw new Error('React has blocked a javascript: URL as a securit\
y precaution.')` : e3;
    }
    function tn2() {
    }
    var nn2 = null;
    function rn2(e3) {
      return e3 = e3.target || e3.srcElement || window, e3.correspondingUseElement && (e3 = e3.correspondingUseElement),
      e3.nodeType === 3 ? e3.parentNode : e3;
    }
    var an2 = null, on2 = null;
    function L2(e3) {
      var t3 = bt2(e3);
      if (t3 && (e3 = t3.stateNode)) {
        var n3 = e3[ft2] || null;
        a: switch (e3 = t3.stateNode, t3.type) {
          case `input`:
            if (Ht2(e3, n3.value, n3.defaultValue, n3.defaultValue, n3.checked, n3.defaultChecked, n3.type, n3.
            name), t3 = n3.name, n3.type === `radio` && t3 != null) {
              for (n3 = e3; n3.parentNode; ) n3 = n3.parentNode;
              for (n3 = n3.querySelectorAll(`input[name="` + Vt2(`` + t3) + `"][type="radio"]`), t3 = 0; t3 < n3.
              length; t3++) {
                var r3 = n3[t3];
                if (r3 !== e3 && r3.form === e3.form) {
                  var a3 = r3[ft2] || null;
                  if (!a3) throw Error(i2(90));
                  Ht2(r3, a3.value, a3.defaultValue, a3.defaultValue, a3.checked, a3.defaultChecked, a3.type, a3.
                  name);
                }
              }
              for (t3 = 0; t3 < n3.length; t3++) r3 = n3[t3], r3.form === e3.form && Rt2(r3);
            }
            break a;
          case `textarea`:
            Kt2(e3, n3.value, n3.defaultValue);
            break a;
          case `select`:
            t3 = n3.value, t3 != null && Gt2(e3, !!n3.multiple, t3, false);
        }
      }
    }
    var sn2 = false;
    function cn2(e3, t3, n3) {
      if (sn2) return e3(t3, n3);
      sn2 = true;
      try {
        return e3(t3);
      } finally {
        if (sn2 = false, (an2 !== null || on2 !== null) && (bu(), an2 && (t3 = an2, e3 = on2, on2 = an2 = null,
        L2(t3), e3))) for (t3 = 0; t3 < e3.length; t3++) L2(e3[t3]);
      }
    }
    function ln2(e3, t3) {
      var n3 = e3.stateNode;
      if (n3 === null) return null;
      var r3 = n3[ft2] || null;
      if (r3 === null) return null;
      n3 = r3[t3];
      a: switch (t3) {
        case `onClick`:
        case `onClickCapture`:
        case `onDoubleClick`:
        case `onDoubleClickCapture`:
        case `onMouseDown`:
        case `onMouseDownCapture`:
        case `onMouseMove`:
        case `onMouseMoveCapture`:
        case `onMouseUp`:
        case `onMouseUpCapture`:
        case `onMouseEnter`:
          (r3 = !r3.disabled) || (e3 = e3.type, r3 = e3 !== `button` && e3 !== `input` && e3 !== `select` && e3 !==
          `textarea`), e3 = !r3;
          break a;
        default:
          e3 = false;
      }
      if (e3) return null;
      if (n3 && typeof n3 != `function`) throw Error(i2(231, t3, typeof n3));
      return n3;
    }
    var un2 = !(typeof window > `u` || window.document === void 0 || window.document.createElement === void 0),
    dn2 = false;
    if (un2) try {
      var fn2 = {};
      Object.defineProperty(fn2, "passive", { get: function() {
        dn2 = true;
      } }), window.addEventListener(`test`, fn2, fn2), window.removeEventListener(`test`, fn2, fn2);
    } catch {
      dn2 = false;
    }
    var pn2 = null, mn2 = null, hn2 = null;
    function gn2() {
      if (hn2) return hn2;
      var e3, t3 = mn2, n3 = t3.length, r3, i3 = `value` in pn2 ? pn2.value : pn2.textContent, a3 = i3.length;
      for (e3 = 0; e3 < n3 && t3[e3] === i3[e3]; e3++) ;
      var o3 = n3 - e3;
      for (r3 = 1; r3 <= o3 && t3[n3 - r3] === i3[a3 - r3]; r3++) ;
      return hn2 = i3.slice(e3, 1 < r3 ? 1 - r3 : void 0);
    }
    function _n2(e3) {
      var t3 = e3.keyCode;
      return `charCode` in e3 ? (e3 = e3.charCode, e3 === 0 && t3 === 13 && (e3 = 13)) : e3 = t3, e3 === 10 &&
      (e3 = 13), 32 <= e3 || e3 === 13 ? e3 : 0;
    }
    function vn2() {
      return true;
    }
    function yn2() {
      return false;
    }
    function bn2(e3) {
      function t3(t4, n3, r3, i3, a3) {
        for (var o3 in this._reactName = t4, this._targetInst = r3, this.type = n3, this.nativeEvent = i3, this.
        target = a3, this.currentTarget = null, e3) e3.hasOwnProperty(o3) && (t4 = e3[o3], this[o3] = t4 ? t4(
        i3) : i3[o3]);
        return this.isDefaultPrevented = (i3.defaultPrevented == null ? false === i3.returnValue : i3.defaultPrevented) ?
        vn2 : yn2, this.isPropagationStopped = yn2, this;
      }
      return h2(t3.prototype, { preventDefault: function() {
        this.defaultPrevented = true;
        var e4 = this.nativeEvent;
        e4 && (e4.preventDefault ? e4.preventDefault() : typeof e4.returnValue != `unknown` && (e4.returnValue =
        false), this.isDefaultPrevented = vn2);
      }, stopPropagation: function() {
        var e4 = this.nativeEvent;
        e4 && (e4.stopPropagation ? e4.stopPropagation() : typeof e4.cancelBubble != `unknown` && (e4.cancelBubble =
        true), this.isPropagationStopped = vn2);
      }, persist: function() {
      }, isPersistent: vn2 }), t3;
    }
    var xn2 = { eventPhase: 0, bubbles: 0, cancelable: 0, timeStamp: function(e3) {
      return e3.timeStamp || Date.now();
    }, defaultPrevented: 0, isTrusted: 0 }, Sn2 = bn2(xn2), Cn2 = h2({}, xn2, { view: 0, detail: 0 }), wn2 = bn2(
    Cn2), Tn2, En2, Dn2, On2 = h2({}, Cn2, { screenX: 0, screenY: 0, clientX: 0, clientY: 0, pageX: 0, pageY: 0,
    ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, getModifierState: Rn2, button: 0, buttons: 0, relatedTarget: function(e3) {
      return e3.relatedTarget === void 0 ? e3.fromElement === e3.srcElement ? e3.toElement : e3.fromElement : e3.
      relatedTarget;
    }, movementX: function(e3) {
      return `movementX` in e3 ? e3.movementX : (e3 !== Dn2 && (Dn2 && e3.type === `mousemove` ? (Tn2 = e3.screenX -
      Dn2.screenX, En2 = e3.screenY - Dn2.screenY) : En2 = Tn2 = 0, Dn2 = e3), Tn2);
    }, movementY: function(e3) {
      return `movementY` in e3 ? e3.movementY : En2;
    } }), kn2 = bn2(On2), An2 = bn2(h2({}, On2, { dataTransfer: 0 })), jn2 = bn2(h2({}, Cn2, { relatedTarget: 0 })),
    Mn2 = bn2(h2({}, xn2, { animationName: 0, elapsedTime: 0, pseudoElement: 0 })), Nn2 = bn2(h2({}, xn2, { clipboardData: function(e3) {
      return `clipboardData` in e3 ? e3.clipboardData : window.clipboardData;
    } })), Pn2 = bn2(h2({}, xn2, { data: 0 })), R2 = { Esc: `Escape`, Spacebar: ` `, Left: `ArrowLeft`, Up: `A\
rrowUp`, Right: `ArrowRight`, Down: `ArrowDown`, Del: `Delete`, Win: `OS`, Menu: `ContextMenu`, Apps: `Context\
Menu`, Scroll: `ScrollLock`, MozPrintableKey: `Unidentified` }, Fn2 = { 8: `Backspace`, 9: `Tab`, 12: `Clear`,
    13: `Enter`, 16: `Shift`, 17: `Control`, 18: `Alt`, 19: `Pause`, 20: `CapsLock`, 27: `Escape`, 32: ` `, 33: `\
PageUp`, 34: `PageDown`, 35: `End`, 36: `Home`, 37: `ArrowLeft`, 38: `ArrowUp`, 39: `ArrowRight`, 40: `ArrowDo\
wn`, 45: `Insert`, 46: `Delete`, 112: `F1`, 113: `F2`, 114: `F3`, 115: `F4`, 116: `F5`, 117: `F6`, 118: `F7`, 119: `\
F8`, 120: `F9`, 121: `F10`, 122: `F11`, 123: `F12`, 144: `NumLock`, 145: `ScrollLock`, 224: `Meta` }, In2 = { Alt: `\
altKey`, Control: `ctrlKey`, Meta: `metaKey`, Shift: `shiftKey` };
    function Ln2(e3) {
      var t3 = this.nativeEvent;
      return t3.getModifierState ? t3.getModifierState(e3) : (e3 = In2[e3]) ? !!t3[e3] : false;
    }
    function Rn2() {
      return Ln2;
    }
    var z2 = bn2(h2({}, Cn2, { key: function(e3) {
      if (e3.key) {
        var t3 = R2[e3.key] || e3.key;
        if (t3 !== `Unidentified`) return t3;
      }
      return e3.type === `keypress` ? (e3 = _n2(e3), e3 === 13 ? `Enter` : String.fromCharCode(e3)) : e3.type ===
      `keydown` || e3.type === `keyup` ? Fn2[e3.keyCode] || `Unidentified` : ``;
    }, code: 0, location: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, repeat: 0, locale: 0, getModifierState: Rn2,
    charCode: function(e3) {
      return e3.type === `keypress` ? _n2(e3) : 0;
    }, keyCode: function(e3) {
      return e3.type === `keydown` || e3.type === `keyup` ? e3.keyCode : 0;
    }, which: function(e3) {
      return e3.type === `keypress` ? _n2(e3) : e3.type === `keydown` || e3.type === `keyup` ? e3.keyCode : 0;
    } })), zn2 = bn2(h2({}, On2, { pointerId: 0, width: 0, height: 0, pressure: 0, tangentialPressure: 0, tiltX: 0,
    tiltY: 0, twist: 0, pointerType: 0, isPrimary: 0 })), Bn2 = bn2(h2({}, Cn2, { touches: 0, targetTouches: 0,
    changedTouches: 0, altKey: 0, metaKey: 0, ctrlKey: 0, shiftKey: 0, getModifierState: Rn2 })), Vn2 = bn2(h2(
    {}, xn2, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 })), Hn2 = bn2(h2({}, On2, { deltaX: function(e3) {
      return `deltaX` in e3 ? e3.deltaX : `wheelDeltaX` in e3 ? -e3.wheelDeltaX : 0;
    }, deltaY: function(e3) {
      return `deltaY` in e3 ? e3.deltaY : `wheelDeltaY` in e3 ? -e3.wheelDeltaY : `wheelDelta` in e3 ? -e3.wheelDelta :
      0;
    }, deltaZ: 0, deltaMode: 0 })), Un2 = bn2(h2({}, xn2, { newState: 0, oldState: 0 })), Wn2 = [9, 13, 27, 32],
    Gn2 = un2 && `CompositionEvent` in window, Kn2 = null;
    un2 && `documentMode` in document && (Kn2 = document.documentMode);
    var qn2 = un2 && `TextEvent` in window && !Kn2, Jn2 = un2 && (!Gn2 || Kn2 && 8 < Kn2 && 11 >= Kn2), Yn2 = `\
 `, Xn2 = false;
    function Zn2(e3, t3) {
      switch (e3) {
        case `keyup`:
          return Wn2.indexOf(t3.keyCode) !== -1;
        case `keydown`:
          return t3.keyCode !== 229;
        case `keypress`:
        case `mousedown`:
        case `focusout`:
          return true;
        default:
          return false;
      }
    }
    function Qn2(e3) {
      return e3 = e3.detail, typeof e3 == `object` && `data` in e3 ? e3.data : null;
    }
    var $n2 = false;
    function er2(e3, t3) {
      switch (e3) {
        case `compositionend`:
          return Qn2(t3);
        case `keypress`:
          return t3.which === 32 ? (Xn2 = true, Yn2) : null;
        case `textInput`:
          return e3 = t3.data, e3 === Yn2 && Xn2 ? null : e3;
        default:
          return null;
      }
    }
    function tr2(e3, t3) {
      if ($n2) return e3 === `compositionend` || !Gn2 && Zn2(e3, t3) ? (e3 = gn2(), hn2 = mn2 = pn2 = null, $n2 =
      false, e3) : null;
      switch (e3) {
        case `paste`:
          return null;
        case `keypress`:
          if (!(t3.ctrlKey || t3.altKey || t3.metaKey) || t3.ctrlKey && t3.altKey) {
            if (t3.char && 1 < t3.char.length) return t3.char;
            if (t3.which) return String.fromCharCode(t3.which);
          }
          return null;
        case `compositionend`:
          return Jn2 && t3.locale !== `ko` ? null : t3.data;
        default:
          return null;
      }
    }
    var nr2 = { color: true, date: true, datetime: true, "datetime-local": true, email: true, month: true, number: true,
    password: true, range: true, search: true, tel: true, text: true, time: true, url: true, week: true };
    function rr2(e3) {
      var t3 = e3 && e3.nodeName && e3.nodeName.toLowerCase();
      return t3 === `input` ? !!nr2[e3.type] : t3 === `textarea`;
    }
    function ir2(e3, t3, n3, r3) {
      an2 ? on2 ? on2.push(r3) : on2 = [r3] : an2 = r3, t3 = Ed(t3, `onChange`), 0 < t3.length && (n3 = new Sn2(
      `onChange`, `change`, null, n3, r3), e3.push({ event: n3, listeners: t3 }));
    }
    var ar2 = null, or2 = null;
    function sr2(e3) {
      yd(e3, 0);
    }
    function cr2(e3) {
      if (Rt2(F2(e3))) return e3;
    }
    function lr2(e3, t3) {
      if (e3 === `change`) return t3;
    }
    var ur2 = false;
    if (un2) {
      var dr2;
      if (un2) {
        var fr2 = `oninput` in document;
        if (!fr2) {
          var pr2 = document.createElement(`div`);
          pr2.setAttribute(`oninput`, `return;`), fr2 = typeof pr2.oninput == `function`;
        }
        dr2 = fr2;
      } else dr2 = false;
      ur2 = dr2 && (!document.documentMode || 9 < document.documentMode);
    }
    function mr2() {
      ar2 && (ar2.detachEvent(`onpropertychange`, hr2), or2 = ar2 = null);
    }
    function hr2(e3) {
      if (e3.propertyName === `value` && cr2(or2)) {
        var t3 = [];
        ir2(t3, or2, e3, rn2(e3)), cn2(sr2, t3);
      }
    }
    function gr2(e3, t3, n3) {
      e3 === `focusin` ? (mr2(), ar2 = t3, or2 = n3, ar2.attachEvent(`onpropertychange`, hr2)) : e3 === `focus\
out` && mr2();
    }
    function _r2(e3) {
      if (e3 === `selectionchange` || e3 === `keyup` || e3 === `keydown`) return cr2(or2);
    }
    function vr2(e3, t3) {
      if (e3 === `click`) return cr2(t3);
    }
    function yr2(e3, t3) {
      if (e3 === `input` || e3 === `change`) return cr2(t3);
    }
    function br2(e3, t3) {
      return e3 === t3 && (e3 !== 0 || 1 / e3 == 1 / t3) || e3 !== e3 && t3 !== t3;
    }
    var xr2 = typeof Object.is == `function` ? Object.is : br2;
    function Sr2(e3, t3) {
      if (xr2(e3, t3)) return true;
      if (typeof e3 != `object` || !e3 || typeof t3 != `object` || !t3) return false;
      var n3 = Object.keys(e3), r3 = Object.keys(t3);
      if (n3.length !== r3.length) return false;
      for (r3 = 0; r3 < n3.length; r3++) {
        var i3 = n3[r3];
        if (!De2.call(t3, i3) || !xr2(e3[i3], t3[i3])) return false;
      }
      return true;
    }
    function Cr2(e3) {
      for (; e3 && e3.firstChild; ) e3 = e3.firstChild;
      return e3;
    }
    function wr2(e3, t3) {
      var n3 = Cr2(e3);
      e3 = 0;
      for (var r3; n3; ) {
        if (n3.nodeType === 3) {
          if (r3 = e3 + n3.textContent.length, e3 <= t3 && r3 >= t3) return { node: n3, offset: t3 - e3 };
          e3 = r3;
        }
        a: {
          for (; n3; ) {
            if (n3.nextSibling) {
              n3 = n3.nextSibling;
              break a;
            }
            n3 = n3.parentNode;
          }
          n3 = void 0;
        }
        n3 = Cr2(n3);
      }
    }
    function Tr2(e3, t3) {
      return e3 && t3 ? e3 === t3 ? true : e3 && e3.nodeType === 3 ? false : t3 && t3.nodeType === 3 ? Tr2(e3,
      t3.parentNode) : `contains` in e3 ? e3.contains(t3) : e3.compareDocumentPosition ? !!(e3.compareDocumentPosition(
      t3) & 16) : false : false;
    }
    function Er2(e3) {
      e3 = e3 != null && e3.ownerDocument != null && e3.ownerDocument.defaultView != null ? e3.ownerDocument.defaultView :
      window;
      for (var t3 = zt2(e3.document); t3 instanceof e3.HTMLIFrameElement; ) {
        try {
          var n3 = typeof t3.contentWindow.location.href == `string`;
        } catch {
          n3 = false;
        }
        if (n3) e3 = t3.contentWindow;
        else break;
        t3 = zt2(e3.document);
      }
      return t3;
    }
    function Dr2(e3) {
      var t3 = e3 && e3.nodeName && e3.nodeName.toLowerCase();
      return t3 && (t3 === `input` && (e3.type === `text` || e3.type === `search` || e3.type === `tel` || e3.type ===
      `url` || e3.type === `password`) || t3 === `textarea` || e3.contentEditable === `true`);
    }
    var Or2 = un2 && `documentMode` in document && 11 >= document.documentMode, kr2 = null, Ar2 = null, jr2 = null,
    Mr2 = false;
    function Nr2(e3, t3, n3) {
      var r3 = n3.window === n3 ? n3.document : n3.nodeType === 9 ? n3 : n3.ownerDocument;
      Mr2 || kr2 == null || kr2 !== zt2(r3) || (r3 = kr2, `selectionStart` in r3 && Dr2(r3) ? r3 = { start: r3.
      selectionStart, end: r3.selectionEnd } : (r3 = (r3.ownerDocument && r3.ownerDocument.defaultView || window).
      getSelection(), r3 = { anchorNode: r3.anchorNode, anchorOffset: r3.anchorOffset, focusNode: r3.focusNode,
      focusOffset: r3.focusOffset }), jr2 && Sr2(jr2, r3) || (jr2 = r3, r3 = Ed(Ar2, `onSelect`), 0 < r3.length &&
      (t3 = new Sn2(`onSelect`, `select`, null, t3, n3), e3.push({ event: t3, listeners: r3 }), t3.target = kr2)));
    }
    function Pr2(e3, t3) {
      var n3 = {};
      return n3[e3.toLowerCase()] = t3.toLowerCase(), n3[`Webkit` + e3] = `webkit` + t3, n3[`Moz` + e3] = `moz` +
      t3, n3;
    }
    var Fr2 = { animationend: Pr2(`Animation`, `AnimationEnd`), animationiteration: Pr2(`Animation`, `Animatio\
nIteration`), animationstart: Pr2(`Animation`, `AnimationStart`), transitionrun: Pr2(`Transition`, `Transition\
Run`), transitionstart: Pr2(`Transition`, `TransitionStart`), transitioncancel: Pr2(`Transition`, `TransitionC\
ancel`), transitionend: Pr2(`Transition`, `TransitionEnd`) }, Ir2 = {}, Lr2 = {};
    un2 && (Lr2 = document.createElement(`div`).style, `AnimationEvent` in window || (delete Fr2.animationend.
    animation, delete Fr2.animationiteration.animation, delete Fr2.animationstart.animation), `TransitionEvent` in
    window || delete Fr2.transitionend.transition);
    function Rr2(e3) {
      if (Ir2[e3]) return Ir2[e3];
      if (!Fr2[e3]) return e3;
      var t3 = Fr2[e3], n3;
      for (n3 in t3) if (t3.hasOwnProperty(n3) && n3 in Lr2) return Ir2[e3] = t3[n3];
      return e3;
    }
    var zr2 = Rr2(`animationend`), Br2 = Rr2(`animationiteration`), Vr2 = Rr2(`animationstart`), Hr2 = Rr2(`tr\
ansitionrun`), Ur2 = Rr2(`transitionstart`), Wr2 = Rr2(`transitioncancel`), Gr2 = Rr2(`transitionend`), Kr2 = /* @__PURE__ */ new Map(),
    qr2 = `abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dra\
gEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPoin\
terCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mo\
useDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove po\
interOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpda\
te touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel`.split(` `);
    qr2.push(`scrollEnd`);
    function Jr2(e3, t3) {
      Kr2.set(e3, t3), Tt2(t3, [e3]);
    }
    var Yr2 = typeof reportError == `function` ? reportError : function(e3) {
      if (typeof window == `object` && typeof window.ErrorEvent == `function`) {
        var t3 = new window.ErrorEvent(`error`, { bubbles: true, cancelable: true, message: typeof e3 == `obje\
ct` && e3 && typeof e3.message == `string` ? String(e3.message) : String(e3), error: e3 });
        if (!window.dispatchEvent(t3)) return;
      } else if (typeof process == `object` && typeof process.emit == `function`) {
        process.emit(`uncaughtException`, e3);
        return;
      }
      console.error(e3);
    }, Xr2 = [], Zr2 = 0, Qr2 = 0;
    function $r2() {
      for (var e3 = Zr2, t3 = Qr2 = Zr2 = 0; t3 < e3; ) {
        var n3 = Xr2[t3];
        Xr2[t3++] = null;
        var r3 = Xr2[t3];
        Xr2[t3++] = null;
        var i3 = Xr2[t3];
        Xr2[t3++] = null;
        var a3 = Xr2[t3];
        if (Xr2[t3++] = null, r3 !== null && i3 !== null) {
          var o3 = r3.pending;
          o3 === null ? i3.next = i3 : (i3.next = o3.next, o3.next = i3), r3.pending = i3;
        }
        a3 !== 0 && ri2(n3, i3, a3);
      }
    }
    function ei2(e3, t3, n3, r3) {
      Xr2[Zr2++] = e3, Xr2[Zr2++] = t3, Xr2[Zr2++] = n3, Xr2[Zr2++] = r3, Qr2 |= r3, e3.lanes |= r3, e3 = e3.alternate,
      e3 !== null && (e3.lanes |= r3);
    }
    function ti2(e3, t3, n3, r3) {
      return ei2(e3, t3, n3, r3), ii2(e3);
    }
    function ni2(e3, t3) {
      return ei2(e3, null, null, t3), ii2(e3);
    }
    function ri2(e3, t3, n3) {
      e3.lanes |= n3;
      var r3 = e3.alternate;
      r3 !== null && (r3.lanes |= n3);
      for (var i3 = false, a3 = e3.return; a3 !== null; ) a3.childLanes |= n3, r3 = a3.alternate, r3 !== null &&
      (r3.childLanes |= n3), a3.tag === 22 && (e3 = a3.stateNode, e3 === null || e3._visibility & 1 || (i3 = true)),
      e3 = a3, a3 = a3.return;
      return e3.tag === 3 ? (a3 = e3.stateNode, i3 && t3 !== null && (i3 = 31 - We2(n3), e3 = a3.hiddenUpdates,
      r3 = e3[i3], r3 === null ? e3[i3] = [t3] : r3.push(t3), t3.lane = n3 | 536870912), a3) : null;
    }
    function ii2(e3) {
      if (50 < du) throw du = 0, fu = null, Error(i2(185));
      for (var t3 = e3.return; t3 !== null; ) e3 = t3, t3 = e3.return;
      return e3.tag === 3 ? e3.stateNode : null;
    }
    var ai2 = {};
    function oi2(e3, t3, n3, r3) {
      this.tag = e3, this.key = n3, this.sibling = this.child = this.return = this.stateNode = this.type = this.
      elementType = null, this.index = 0, this.refCleanup = this.ref = null, this.pendingProps = t3, this.dependencies =
      this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = r3, this.subtreeFlags = this.
      flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
    }
    function si2(e3, t3, n3, r3) {
      return new oi2(e3, t3, n3, r3);
    }
    function ci2(e3) {
      return e3 = e3.prototype, !(!e3 || !e3.isReactComponent);
    }
    function li2(e3, t3) {
      var n3 = e3.alternate;
      return n3 === null ? (n3 = si2(e3.tag, t3, e3.key, e3.mode), n3.elementType = e3.elementType, n3.type = e3.
      type, n3.stateNode = e3.stateNode, n3.alternate = e3, e3.alternate = n3) : (n3.pendingProps = t3, n3.type =
      e3.type, n3.flags = 0, n3.subtreeFlags = 0, n3.deletions = null), n3.flags = e3.flags & 65011712, n3.childLanes =
      e3.childLanes, n3.lanes = e3.lanes, n3.child = e3.child, n3.memoizedProps = e3.memoizedProps, n3.memoizedState =
      e3.memoizedState, n3.updateQueue = e3.updateQueue, t3 = e3.dependencies, n3.dependencies = t3 === null ?
      null : { lanes: t3.lanes, firstContext: t3.firstContext }, n3.sibling = e3.sibling, n3.index = e3.index,
      n3.ref = e3.ref, n3.refCleanup = e3.refCleanup, n3;
    }
    function ui2(e3, t3) {
      e3.flags &= 65011714;
      var n3 = e3.alternate;
      return n3 === null ? (e3.childLanes = 0, e3.lanes = t3, e3.child = null, e3.subtreeFlags = 0, e3.memoizedProps =
      null, e3.memoizedState = null, e3.updateQueue = null, e3.dependencies = null, e3.stateNode = null) : (e3.
      childLanes = n3.childLanes, e3.lanes = n3.lanes, e3.child = n3.child, e3.subtreeFlags = 0, e3.deletions =
      null, e3.memoizedProps = n3.memoizedProps, e3.memoizedState = n3.memoizedState, e3.updateQueue = n3.updateQueue,
      e3.type = n3.type, t3 = n3.dependencies, e3.dependencies = t3 === null ? null : { lanes: t3.lanes, firstContext: t3.
      firstContext }), e3;
    }
    function di2(e3, t3, n3, r3, a3, o3) {
      var s3 = 0;
      if (r3 = e3, typeof e3 == `function`) ci2(e3) && (s3 = 1);
      else if (typeof e3 == `string`) s3 = Uf(e3, n3, pe2.current) ? 26 : e3 === `html` || e3 === `head` || e3 ===
      `body` ? 27 : 5;
      else a: switch (e3) {
        case re2:
          return e3 = si2(31, n3, t3, a3), e3.elementType = re2, e3.lanes = o3, e3;
        case y2:
          return fi2(n3.children, a3, o3, t3);
        case b2:
          s3 = 8, a3 |= 24;
          break;
        case x2:
          return e3 = si2(12, n3, t3, a3 | 2), e3.elementType = x2, e3.lanes = o3, e3;
        case w2:
          return e3 = si2(13, n3, t3, a3), e3.elementType = w2, e3.lanes = o3, e3;
        case te2:
          return e3 = si2(19, n3, t3, a3), e3.elementType = te2, e3.lanes = o3, e3;
        default:
          if (typeof e3 == `object` && e3) switch (e3.$$typeof) {
            case S2:
              s3 = 10;
              break a;
            case ee2:
              s3 = 9;
              break a;
            case C2:
              s3 = 11;
              break a;
            case ne2:
              s3 = 14;
              break a;
            case T2:
              s3 = 16, r3 = null;
              break a;
          }
          s3 = 29, n3 = Error(i2(130, e3 === null ? `null` : typeof e3, ``)), r3 = null;
      }
      return t3 = si2(s3, n3, t3, a3), t3.elementType = e3, t3.type = r3, t3.lanes = o3, t3;
    }
    function fi2(e3, t3, n3, r3) {
      return e3 = si2(7, e3, r3, t3), e3.lanes = n3, e3;
    }
    function pi2(e3, t3, n3) {
      return e3 = si2(6, e3, null, t3), e3.lanes = n3, e3;
    }
    function mi2(e3) {
      var t3 = si2(18, null, null, 0);
      return t3.stateNode = e3, t3;
    }
    function hi(e3, t3, n3) {
      return t3 = si2(4, e3.children === null ? [] : e3.children, e3.key, t3), t3.lanes = n3, t3.stateNode = {
      containerInfo: e3.containerInfo, pendingChildren: null, implementation: e3.implementation }, t3;
    }
    var gi = /* @__PURE__ */ new WeakMap();
    function _i(e3, t3) {
      if (typeof e3 == `object` && e3) {
        var n3 = gi.get(e3);
        return n3 === void 0 ? (t3 = { value: e3, source: t3, stack: Ee2(t3) }, gi.set(e3, t3), t3) : n3;
      }
      return { value: e3, source: t3, stack: Ee2(t3) };
    }
    var vi = [], yi = 0, bi = null, xi = 0, Si = [], Ci = 0, wi = null, Ti = 1, Ei = ``;
    function Di(e3, t3) {
      vi[yi++] = xi, vi[yi++] = bi, bi = e3, xi = t3;
    }
    function Oi(e3, t3, n3) {
      Si[Ci++] = Ti, Si[Ci++] = Ei, Si[Ci++] = wi, wi = e3;
      var r3 = Ti;
      e3 = Ei;
      var i3 = 32 - We2(r3) - 1;
      r3 &= ~(1 << i3), n3 += 1;
      var a3 = 32 - We2(t3) + i3;
      if (30 < a3) {
        var o3 = i3 - i3 % 5;
        a3 = (r3 & (1 << o3) - 1).toString(32), r3 >>= o3, i3 -= o3, Ti = 1 << 32 - We2(t3) + i3 | n3 << i3 | r3,
        Ei = a3 + e3;
      } else Ti = 1 << a3 | n3 << i3 | r3, Ei = e3;
    }
    function ki(e3) {
      e3.return !== null && (Di(e3, 1), Oi(e3, 1, 0));
    }
    function Ai(e3) {
      for (; e3 === bi; ) bi = vi[--yi], vi[yi] = null, xi = vi[--yi], vi[yi] = null;
      for (; e3 === wi; ) wi = Si[--Ci], Si[Ci] = null, Ei = Si[--Ci], Si[Ci] = null, Ti = Si[--Ci], Si[Ci] = null;
    }
    function ji(e3, t3) {
      Si[Ci++] = Ti, Si[Ci++] = Ei, Si[Ci++] = wi, Ti = t3.id, Ei = t3.overflow, wi = e3;
    }
    var Mi = null, B = null, V = false, Ni = null, Pi = false, Fi = Error(i2(519));
    function Ii(e3) {
      throw Hi(_i(Error(i2(418, 1 < arguments.length && arguments[1] !== void 0 && arguments[1] ? `text` : `HT\
ML`, ``)), e3)), Fi;
    }
    function Li(e3) {
      var t3 = e3.stateNode, n3 = e3.type, r3 = e3.memoizedProps;
      switch (t3[dt2] = e3, t3[ft2] = r3, n3) {
        case `dialog`:
          Q(`cancel`, t3), Q(`close`, t3);
          break;
        case `iframe`:
        case `object`:
        case `embed`:
          Q(`load`, t3);
          break;
        case `video`:
        case `audio`:
          for (n3 = 0; n3 < _d.length; n3++) Q(_d[n3], t3);
          break;
        case `source`:
          Q(`error`, t3);
          break;
        case `img`:
        case `image`:
        case `link`:
          Q(`error`, t3), Q(`load`, t3);
          break;
        case `details`:
          Q(`toggle`, t3);
          break;
        case `input`:
          Q(`invalid`, t3), Ut2(t3, r3.value, r3.defaultValue, r3.checked, r3.defaultChecked, r3.type, r3.name,
          true);
          break;
        case `select`:
          Q(`invalid`, t3);
          break;
        case `textarea`:
          Q(`invalid`, t3), qt2(t3, r3.value, r3.defaultValue, r3.children);
      }
      n3 = r3.children, typeof n3 != `string` && typeof n3 != `number` && typeof n3 != `bigint` || t3.textContent ===
      `` + n3 || true === r3.suppressHydrationWarning || Md(t3.textContent, n3) ? (r3.popover != null && (Q(`b\
eforetoggle`, t3), Q(`toggle`, t3)), r3.onScroll != null && Q(`scroll`, t3), r3.onScrollEnd != null && Q(`scro\
llend`, t3), r3.onClick != null && (t3.onclick = tn2), t3 = true) : t3 = false, t3 || Ii(e3, true);
    }
    function Ri(e3) {
      for (Mi = e3.return; Mi; ) switch (Mi.tag) {
        case 5:
        case 31:
        case 13:
          Pi = false;
          return;
        case 27:
        case 3:
          Pi = true;
          return;
        default:
          Mi = Mi.return;
      }
    }
    function zi(e3) {
      if (e3 !== Mi) return false;
      if (!V) return Ri(e3), V = true, false;
      var t3 = e3.tag, n3;
      if ((n3 = t3 !== 3 && t3 !== 27) && ((n3 = t3 === 5) && (n3 = e3.type, n3 = n3 === `form` || n3 === `but\
ton` || Ud(e3.type, e3.memoizedProps)), n3 = !n3), n3 && B && Ii(e3), Ri(e3), t3 === 13) {
        if (e3 = e3.memoizedState, e3 = e3 === null ? null : e3.dehydrated, !e3) throw Error(i2(317));
        B = uf(e3);
      } else if (t3 === 31) {
        if (e3 = e3.memoizedState, e3 = e3 === null ? null : e3.dehydrated, !e3) throw Error(i2(317));
        B = uf(e3);
      } else t3 === 27 ? (t3 = B, Zd(e3.type) ? (e3 = lf, lf = null, B = e3) : B = t3) : B = Mi ? cf(e3.stateNode.
      nextSibling) : null;
      return true;
    }
    function Bi() {
      B = Mi = null, V = false;
    }
    function Vi() {
      var e3 = Ni;
      return e3 !== null && (Zl === null ? Zl = e3 : Zl.push.apply(Zl, e3), Ni = null), e3;
    }
    function Hi(e3) {
      Ni === null ? Ni = [e3] : Ni.push(e3);
    }
    var Ui = O2(null), Wi = null, Gi = null;
    function Ki(e3, t3, n3) {
      A2(Ui, t3._currentValue), t3._currentValue = n3;
    }
    function qi(e3) {
      e3._currentValue = Ui.current, k2(Ui);
    }
    function Ji(e3, t3, n3) {
      for (; e3 !== null; ) {
        var r3 = e3.alternate;
        if ((e3.childLanes & t3) === t3 ? r3 !== null && (r3.childLanes & t3) !== t3 && (r3.childLanes |= t3) :
        (e3.childLanes |= t3, r3 !== null && (r3.childLanes |= t3)), e3 === n3) break;
        e3 = e3.return;
      }
    }
    function Yi(e3, t3, n3, r3) {
      var a3 = e3.child;
      for (a3 !== null && (a3.return = e3); a3 !== null; ) {
        var o3 = a3.dependencies;
        if (o3 !== null) {
          var s3 = a3.child;
          o3 = o3.firstContext;
          a: for (; o3 !== null; ) {
            var c3 = o3;
            o3 = a3;
            for (var l3 = 0; l3 < t3.length; l3++) if (c3.context === t3[l3]) {
              o3.lanes |= n3, c3 = o3.alternate, c3 !== null && (c3.lanes |= n3), Ji(o3.return, n3, e3), r3 ||
              (s3 = null);
              break a;
            }
            o3 = c3.next;
          }
        } else if (a3.tag === 18) {
          if (s3 = a3.return, s3 === null) throw Error(i2(341));
          s3.lanes |= n3, o3 = s3.alternate, o3 !== null && (o3.lanes |= n3), Ji(s3, n3, e3), s3 = null;
        } else s3 = a3.child;
        if (s3 !== null) s3.return = a3;
        else for (s3 = a3; s3 !== null; ) {
          if (s3 === e3) {
            s3 = null;
            break;
          }
          if (a3 = s3.sibling, a3 !== null) {
            a3.return = s3.return, s3 = a3;
            break;
          }
          s3 = s3.return;
        }
        a3 = s3;
      }
    }
    function Xi(e3, t3, n3, r3) {
      e3 = null;
      for (var a3 = t3, o3 = false; a3 !== null; ) {
        if (!o3) {
          if (a3.flags & 524288) o3 = true;
          else if (a3.flags & 262144) break;
        }
        if (a3.tag === 10) {
          var s3 = a3.alternate;
          if (s3 === null) throw Error(i2(387));
          if (s3 = s3.memoizedProps, s3 !== null) {
            var c3 = a3.type;
            xr2(a3.pendingProps.value, s3.value) || (e3 === null ? e3 = [c3] : e3.push(c3));
          }
        } else if (a3 === he2.current) {
          if (s3 = a3.alternate, s3 === null) throw Error(i2(387));
          s3.memoizedState.memoizedState !== a3.memoizedState.memoizedState && (e3 === null ? e3 = [Qf] : e3.push(
          Qf));
        }
        a3 = a3.return;
      }
      e3 !== null && Yi(t3, e3, n3, r3), t3.flags |= 262144;
    }
    function Zi(e3) {
      for (e3 = e3.firstContext; e3 !== null; ) {
        if (!xr2(e3.context._currentValue, e3.memoizedValue)) return true;
        e3 = e3.next;
      }
      return false;
    }
    function Qi(e3) {
      Wi = e3, Gi = null, e3 = e3.dependencies, e3 !== null && (e3.firstContext = null);
    }
    function $i(e3) {
      return ta(Wi, e3);
    }
    function ea(e3, t3) {
      return Wi === null && Qi(e3), ta(e3, t3);
    }
    function ta(e3, t3) {
      var n3 = t3._currentValue;
      if (t3 = { context: t3, memoizedValue: n3, next: null }, Gi === null) {
        if (e3 === null) throw Error(i2(308));
        Gi = t3, e3.dependencies = { lanes: 0, firstContext: t3 }, e3.flags |= 524288;
      } else Gi = Gi.next = t3;
      return n3;
    }
    var na = typeof AbortController < `u` ? AbortController : function() {
      var e3 = [], t3 = this.signal = { aborted: false, addEventListener: function(t4, n3) {
        e3.push(n3);
      } };
      this.abort = function() {
        t3.aborted = true, e3.forEach(function(e4) {
          return e4();
        });
      };
    }, ra = t2.unstable_scheduleCallback, ia = t2.unstable_NormalPriority, aa = { $$typeof: S2, Consumer: null,
    Provider: null, _currentValue: null, _currentValue2: null, _threadCount: 0 };
    function oa() {
      return { controller: new na(), data: /* @__PURE__ */ new Map(), refCount: 0 };
    }
    function sa(e3) {
      e3.refCount--, e3.refCount === 0 && ra(ia, function() {
        e3.controller.abort();
      });
    }
    var ca = null, la = 0, ua = 0, da = null;
    function fa(e3, t3) {
      if (ca === null) {
        var n3 = ca = [];
        la = 0, ua = dd(), da = { status: `pending`, value: void 0, then: function(e4) {
          n3.push(e4);
        } };
      }
      return la++, t3.then(pa, pa), t3;
    }
    function pa() {
      if (--la === 0 && ca !== null) {
        da !== null && (da.status = `fulfilled`);
        var e3 = ca;
        ca = null, ua = 0, da = null;
        for (var t3 = 0; t3 < e3.length; t3++) (0, e3[t3])();
      }
    }
    function ma(e3, t3) {
      var n3 = [], r3 = { status: `pending`, value: null, reason: null, then: function(e4) {
        n3.push(e4);
      } };
      return e3.then(function() {
        r3.status = `fulfilled`, r3.value = t3;
        for (var e4 = 0; e4 < n3.length; e4++) (0, n3[e4])(t3);
      }, function(e4) {
        for (r3.status = `rejected`, r3.reason = e4, e4 = 0; e4 < n3.length; e4++) (0, n3[e4])(void 0);
      }), r3;
    }
    var ha = E2.S;
    E2.S = function(e3, t3) {
      eu = Me2(), typeof t3 == `object` && t3 && typeof t3.then == `function` && fa(e3, t3), ha !== null && ha(
      e3, t3);
    };
    var ga = O2(null);
    function _a() {
      var e3 = ga.current;
      return e3 === null ? q.pooledCache : e3;
    }
    function va(e3, t3) {
      t3 === null ? A2(ga, ga.current) : A2(ga, t3.pool);
    }
    function ya() {
      var e3 = _a();
      return e3 === null ? null : { parent: aa._currentValue, pool: e3 };
    }
    var ba = Error(i2(460)), xa = Error(i2(474)), Sa = Error(i2(542)), Ca = { then: function() {
    } };
    function wa(e3) {
      return e3 = e3.status, e3 === `fulfilled` || e3 === `rejected`;
    }
    function Ta(e3, t3, n3) {
      switch (n3 = e3[n3], n3 === void 0 ? e3.push(t3) : n3 !== t3 && (t3.then(tn2, tn2), t3 = n3), t3.status) {
        case `fulfilled`:
          return t3.value;
        case `rejected`:
          throw e3 = t3.reason, ka(e3), e3;
        default:
          if (typeof t3.status == `string`) t3.then(tn2, tn2);
          else {
            if (e3 = q, e3 !== null && 100 < e3.shellSuspendCounter) throw Error(i2(482));
            e3 = t3, e3.status = `pending`, e3.then(function(e4) {
              if (t3.status === `pending`) {
                var n4 = t3;
                n4.status = `fulfilled`, n4.value = e4;
              }
            }, function(e4) {
              if (t3.status === `pending`) {
                var n4 = t3;
                n4.status = `rejected`, n4.reason = e4;
              }
            });
          }
          switch (t3.status) {
            case `fulfilled`:
              return t3.value;
            case `rejected`:
              throw e3 = t3.reason, ka(e3), e3;
          }
          throw Da = t3, ba;
      }
    }
    function Ea(e3) {
      try {
        var t3 = e3._init;
        return t3(e3._payload);
      } catch (e4) {
        throw typeof e4 == `object` && e4 && typeof e4.then == `function` ? (Da = e4, ba) : e4;
      }
    }
    var Da = null;
    function Oa() {
      if (Da === null) throw Error(i2(459));
      var e3 = Da;
      return Da = null, e3;
    }
    function ka(e3) {
      if (e3 === ba || e3 === Sa) throw Error(i2(483));
    }
    var Aa = null, ja = 0;
    function Ma(e3) {
      var t3 = ja;
      return ja += 1, Aa === null && (Aa = []), Ta(Aa, e3, t3);
    }
    function Na(e3, t3) {
      t3 = t3.props.ref, e3.ref = t3 === void 0 ? null : t3;
    }
    function Pa(e3, t3) {
      throw t3.$$typeof === g2 ? Error(i2(525)) : (e3 = Object.prototype.toString.call(t3), Error(i2(31, e3 ===
      `[object Object]` ? `object with keys {` + Object.keys(t3).join(`, `) + `}` : e3)));
    }
    function Fa(e3) {
      function t3(t4, n4) {
        if (e3) {
          var r4 = t4.deletions;
          r4 === null ? (t4.deletions = [n4], t4.flags |= 16) : r4.push(n4);
        }
      }
      function n3(n4, r4) {
        if (!e3) return null;
        for (; r4 !== null; ) t3(n4, r4), r4 = r4.sibling;
        return null;
      }
      function r3(e4) {
        for (var t4 = /* @__PURE__ */ new Map(); e4 !== null; ) e4.key === null ? t4.set(e4.index, e4) : t4.set(
        e4.key, e4), e4 = e4.sibling;
        return t4;
      }
      function a3(e4, t4) {
        return e4 = li2(e4, t4), e4.index = 0, e4.sibling = null, e4;
      }
      function o3(t4, n4, r4) {
        return t4.index = r4, e3 ? (r4 = t4.alternate, r4 === null ? (t4.flags |= 67108866, n4) : (r4 = r4.index,
        r4 < n4 ? (t4.flags |= 67108866, n4) : r4)) : (t4.flags |= 1048576, n4);
      }
      function s3(t4) {
        return e3 && t4.alternate === null && (t4.flags |= 67108866), t4;
      }
      function c3(e4, t4, n4, r4) {
        return t4 === null || t4.tag !== 6 ? (t4 = pi2(n4, e4.mode, r4), t4.return = e4, t4) : (t4 = a3(t4, n4),
        t4.return = e4, t4);
      }
      function l3(e4, t4, n4, r4) {
        var i3 = n4.type;
        return i3 === y2 ? d3(e4, t4, n4.props.children, r4, n4.key) : t4 !== null && (t4.elementType === i3 ||
        typeof i3 == `object` && i3 && i3.$$typeof === T2 && Ea(i3) === t4.type) ? (t4 = a3(t4, n4.props), Na(
        t4, n4), t4.return = e4, t4) : (t4 = di2(n4.type, n4.key, n4.props, null, e4.mode, r4), Na(t4, n4), t4.
        return = e4, t4);
      }
      function u2(e4, t4, n4, r4) {
        return t4 === null || t4.tag !== 4 || t4.stateNode.containerInfo !== n4.containerInfo || t4.stateNode.
        implementation !== n4.implementation ? (t4 = hi(n4, e4.mode, r4), t4.return = e4, t4) : (t4 = a3(t4, n4.
        children || []), t4.return = e4, t4);
      }
      function d3(e4, t4, n4, r4, i3) {
        return t4 === null || t4.tag !== 7 ? (t4 = fi2(n4, e4.mode, r4, i3), t4.return = e4, t4) : (t4 = a3(t4,
        n4), t4.return = e4, t4);
      }
      function f2(e4, t4, n4) {
        if (typeof t4 == `string` && t4 !== `` || typeof t4 == `number` || typeof t4 == `bigint`) return t4 = pi2(
        `` + t4, e4.mode, n4), t4.return = e4, t4;
        if (typeof t4 == `object` && t4) {
          switch (t4.$$typeof) {
            case _2:
              return n4 = di2(t4.type, t4.key, t4.props, null, e4.mode, n4), Na(n4, t4), n4.return = e4, n4;
            case v2:
              return t4 = hi(t4, e4.mode, n4), t4.return = e4, t4;
            case T2:
              return t4 = Ea(t4), f2(e4, t4, n4);
          }
          if (le2(t4) || oe2(t4)) return t4 = fi2(t4, e4.mode, n4, null), t4.return = e4, t4;
          if (typeof t4.then == `function`) return f2(e4, Ma(t4), n4);
          if (t4.$$typeof === S2) return f2(e4, ea(e4, t4), n4);
          Pa(e4, t4);
        }
        return null;
      }
      function p3(e4, t4, n4, r4) {
        var i3 = t4 === null ? null : t4.key;
        if (typeof n4 == `string` && n4 !== `` || typeof n4 == `number` || typeof n4 == `bigint`) return i3 ===
        null ? c3(e4, t4, `` + n4, r4) : null;
        if (typeof n4 == `object` && n4) {
          switch (n4.$$typeof) {
            case _2:
              return n4.key === i3 ? l3(e4, t4, n4, r4) : null;
            case v2:
              return n4.key === i3 ? u2(e4, t4, n4, r4) : null;
            case T2:
              return n4 = Ea(n4), p3(e4, t4, n4, r4);
          }
          if (le2(n4) || oe2(n4)) return i3 === null ? d3(e4, t4, n4, r4, null) : null;
          if (typeof n4.then == `function`) return p3(e4, t4, Ma(n4), r4);
          if (n4.$$typeof === S2) return p3(e4, t4, ea(e4, n4), r4);
          Pa(e4, n4);
        }
        return null;
      }
      function m2(e4, t4, n4, r4, i3) {
        if (typeof r4 == `string` && r4 !== `` || typeof r4 == `number` || typeof r4 == `bigint`) return e4 = e4.
        get(n4) || null, c3(t4, e4, `` + r4, i3);
        if (typeof r4 == `object` && r4) {
          switch (r4.$$typeof) {
            case _2:
              return e4 = e4.get(r4.key === null ? n4 : r4.key) || null, l3(t4, e4, r4, i3);
            case v2:
              return e4 = e4.get(r4.key === null ? n4 : r4.key) || null, u2(t4, e4, r4, i3);
            case T2:
              return r4 = Ea(r4), m2(e4, t4, n4, r4, i3);
          }
          if (le2(r4) || oe2(r4)) return e4 = e4.get(n4) || null, d3(t4, e4, r4, i3, null);
          if (typeof r4.then == `function`) return m2(e4, t4, n4, Ma(r4), i3);
          if (r4.$$typeof === S2) return m2(e4, t4, n4, ea(t4, r4), i3);
          Pa(t4, r4);
        }
        return null;
      }
      function h3(i3, a4, s4, c4) {
        for (var l4 = null, u3 = null, d4 = a4, h4 = a4 = 0, g4 = null; d4 !== null && h4 < s4.length; h4++) {
          d4.index > h4 ? (g4 = d4, d4 = null) : g4 = d4.sibling;
          var _3 = p3(i3, d4, s4[h4], c4);
          if (_3 === null) {
            d4 === null && (d4 = g4);
            break;
          }
          e3 && d4 && _3.alternate === null && t3(i3, d4), a4 = o3(_3, a4, h4), u3 === null ? l4 = _3 : u3.sibling =
          _3, u3 = _3, d4 = g4;
        }
        if (h4 === s4.length) return n3(i3, d4), V && Di(i3, h4), l4;
        if (d4 === null) {
          for (; h4 < s4.length; h4++) d4 = f2(i3, s4[h4], c4), d4 !== null && (a4 = o3(d4, a4, h4), u3 === null ?
          l4 = d4 : u3.sibling = d4, u3 = d4);
          return V && Di(i3, h4), l4;
        }
        for (d4 = r3(d4); h4 < s4.length; h4++) g4 = m2(d4, i3, h4, s4[h4], c4), g4 !== null && (e3 && g4.alternate !==
        null && d4.delete(g4.key === null ? h4 : g4.key), a4 = o3(g4, a4, h4), u3 === null ? l4 = g4 : u3.sibling =
        g4, u3 = g4);
        return e3 && d4.forEach(function(e4) {
          return t3(i3, e4);
        }), V && Di(i3, h4), l4;
      }
      function g3(a4, s4, c4, l4) {
        if (c4 == null) throw Error(i2(151));
        for (var u3 = null, d4 = null, h4 = s4, g4 = s4 = 0, _3 = null, v3 = c4.next(); h4 !== null && !v3.done; g4++,
        v3 = c4.next()) {
          h4.index > g4 ? (_3 = h4, h4 = null) : _3 = h4.sibling;
          var y3 = p3(a4, h4, v3.value, l4);
          if (y3 === null) {
            h4 === null && (h4 = _3);
            break;
          }
          e3 && h4 && y3.alternate === null && t3(a4, h4), s4 = o3(y3, s4, g4), d4 === null ? u3 = y3 : d4.sibling =
          y3, d4 = y3, h4 = _3;
        }
        if (v3.done) return n3(a4, h4), V && Di(a4, g4), u3;
        if (h4 === null) {
          for (; !v3.done; g4++, v3 = c4.next()) v3 = f2(a4, v3.value, l4), v3 !== null && (s4 = o3(v3, s4, g4),
          d4 === null ? u3 = v3 : d4.sibling = v3, d4 = v3);
          return V && Di(a4, g4), u3;
        }
        for (h4 = r3(h4); !v3.done; g4++, v3 = c4.next()) v3 = m2(h4, a4, g4, v3.value, l4), v3 !== null && (e3 &&
        v3.alternate !== null && h4.delete(v3.key === null ? g4 : v3.key), s4 = o3(v3, s4, g4), d4 === null ? u3 =
        v3 : d4.sibling = v3, d4 = v3);
        return e3 && h4.forEach(function(e4) {
          return t3(a4, e4);
        }), V && Di(a4, g4), u3;
      }
      function b3(e4, r4, o4, c4) {
        if (typeof o4 == `object` && o4 && o4.type === y2 && o4.key === null && (o4 = o4.props.children), typeof o4 ==
        `object` && o4) {
          switch (o4.$$typeof) {
            case _2:
              a: {
                for (var l4 = o4.key; r4 !== null; ) {
                  if (r4.key === l4) {
                    if (l4 = o4.type, l4 === y2) {
                      if (r4.tag === 7) {
                        n3(e4, r4.sibling), c4 = a3(r4, o4.props.children), c4.return = e4, e4 = c4;
                        break a;
                      }
                    } else if (r4.elementType === l4 || typeof l4 == `object` && l4 && l4.$$typeof === T2 && Ea(
                    l4) === r4.type) {
                      n3(e4, r4.sibling), c4 = a3(r4, o4.props), Na(c4, o4), c4.return = e4, e4 = c4;
                      break a;
                    }
                    n3(e4, r4);
                    break;
                  }
                  t3(e4, r4), r4 = r4.sibling;
                }
                o4.type === y2 ? (c4 = fi2(o4.props.children, e4.mode, c4, o4.key), c4.return = e4, e4 = c4) :
                (c4 = di2(o4.type, o4.key, o4.props, null, e4.mode, c4), Na(c4, o4), c4.return = e4, e4 = c4);
              }
              return s3(e4);
            case v2:
              a: {
                for (l4 = o4.key; r4 !== null; ) {
                  if (r4.key === l4) {
                    if (r4.tag === 4 && r4.stateNode.containerInfo === o4.containerInfo && r4.stateNode.implementation ===
                    o4.implementation) {
                      n3(e4, r4.sibling), c4 = a3(r4, o4.children || []), c4.return = e4, e4 = c4;
                      break a;
                    }
                    n3(e4, r4);
                    break;
                  }
                  t3(e4, r4), r4 = r4.sibling;
                }
                c4 = hi(o4, e4.mode, c4), c4.return = e4, e4 = c4;
              }
              return s3(e4);
            case T2:
              return o4 = Ea(o4), b3(e4, r4, o4, c4);
          }
          if (le2(o4)) return h3(e4, r4, o4, c4);
          if (oe2(o4)) {
            if (l4 = oe2(o4), typeof l4 != `function`) throw Error(i2(150));
            return o4 = l4.call(o4), g3(e4, r4, o4, c4);
          }
          if (typeof o4.then == `function`) return b3(e4, r4, Ma(o4), c4);
          if (o4.$$typeof === S2) return b3(e4, r4, ea(e4, o4), c4);
          Pa(e4, o4);
        }
        return typeof o4 == `string` && o4 !== `` || typeof o4 == `number` || typeof o4 == `bigint` ? (o4 = `` +
        o4, r4 !== null && r4.tag === 6 ? (n3(e4, r4.sibling), c4 = a3(r4, o4), c4.return = e4, e4 = c4) : (n3(
        e4, r4), c4 = pi2(o4, e4.mode, c4), c4.return = e4, e4 = c4), s3(e4)) : n3(e4, r4);
      }
      return function(e4, t4, n4, r4) {
        try {
          ja = 0;
          var i3 = b3(e4, t4, n4, r4);
          return Aa = null, i3;
        } catch (t5) {
          if (t5 === ba || t5 === Sa) throw t5;
          var a4 = si2(29, t5, null, e4.mode);
          return a4.lanes = r4, a4.return = e4, a4;
        }
      };
    }
    var Ia = Fa(true), La = Fa(false), Ra = false;
    function za(e3) {
      e3.updateQueue = { baseState: e3.memoizedState, firstBaseUpdate: null, lastBaseUpdate: null, shared: { pending: null,
      lanes: 0, hiddenCallbacks: null }, callbacks: null };
    }
    function Ba(e3, t3) {
      e3 = e3.updateQueue, t3.updateQueue === e3 && (t3.updateQueue = { baseState: e3.baseState, firstBaseUpdate: e3.
      firstBaseUpdate, lastBaseUpdate: e3.lastBaseUpdate, shared: e3.shared, callbacks: null });
    }
    function Va(e3) {
      return { lane: e3, tag: 0, payload: null, callback: null, next: null };
    }
    function Ha(e3, t3, n3) {
      var r3 = e3.updateQueue;
      if (r3 === null) return null;
      if (r3 = r3.shared, K & 2) {
        var i3 = r3.pending;
        return i3 === null ? t3.next = t3 : (t3.next = i3.next, i3.next = t3), r3.pending = t3, t3 = ii2(e3), ri2(
        e3, null, n3), t3;
      }
      return ei2(e3, r3, t3, n3), ii2(e3);
    }
    function Ua(e3, t3, n3) {
      if (t3 = t3.updateQueue, t3 !== null && (t3 = t3.shared, n3 & 4194048)) {
        var r3 = t3.lanes;
        r3 &= e3.pendingLanes, n3 |= r3, t3.lanes = n3, it2(e3, n3);
      }
    }
    function Wa(e3, t3) {
      var n3 = e3.updateQueue, r3 = e3.alternate;
      if (r3 !== null && (r3 = r3.updateQueue, n3 === r3)) {
        var i3 = null, a3 = null;
        if (n3 = n3.firstBaseUpdate, n3 !== null) {
          do {
            var o3 = { lane: n3.lane, tag: n3.tag, payload: n3.payload, callback: null, next: null };
            a3 === null ? i3 = a3 = o3 : a3 = a3.next = o3, n3 = n3.next;
          } while (n3 !== null);
          a3 === null ? i3 = a3 = t3 : a3 = a3.next = t3;
        } else i3 = a3 = t3;
        n3 = { baseState: r3.baseState, firstBaseUpdate: i3, lastBaseUpdate: a3, shared: r3.shared, callbacks: r3.
        callbacks }, e3.updateQueue = n3;
        return;
      }
      e3 = n3.lastBaseUpdate, e3 === null ? n3.firstBaseUpdate = t3 : e3.next = t3, n3.lastBaseUpdate = t3;
    }
    var Ga = false;
    function Ka() {
      if (Ga) {
        var e3 = da;
        if (e3 !== null) throw e3;
      }
    }
    function qa(e3, t3, n3, r3) {
      Ga = false;
      var i3 = e3.updateQueue;
      Ra = false;
      var a3 = i3.firstBaseUpdate, o3 = i3.lastBaseUpdate, s3 = i3.shared.pending;
      if (s3 !== null) {
        i3.shared.pending = null;
        var c3 = s3, l3 = c3.next;
        c3.next = null, o3 === null ? a3 = l3 : o3.next = l3, o3 = c3;
        var u2 = e3.alternate;
        u2 !== null && (u2 = u2.updateQueue, s3 = u2.lastBaseUpdate, s3 !== o3 && (s3 === null ? u2.firstBaseUpdate =
        l3 : s3.next = l3, u2.lastBaseUpdate = c3));
      }
      if (a3 !== null) {
        var d3 = i3.baseState;
        o3 = 0, u2 = l3 = c3 = null, s3 = a3;
        do {
          var f2 = s3.lane & -536870913, p3 = f2 !== s3.lane;
          if (p3 ? (Y & f2) === f2 : (r3 & f2) === f2) {
            f2 !== 0 && f2 === ua && (Ga = true), u2 !== null && (u2 = u2.next = { lane: 0, tag: s3.tag, payload: s3.
            payload, callback: null, next: null });
            a: {
              var m2 = e3, g3 = s3;
              f2 = t3;
              var _3 = n3;
              switch (g3.tag) {
                case 1:
                  if (m2 = g3.payload, typeof m2 == `function`) {
                    d3 = m2.call(_3, d3, f2);
                    break a;
                  }
                  d3 = m2;
                  break a;
                case 3:
                  m2.flags = m2.flags & -65537 | 128;
                case 0:
                  if (m2 = g3.payload, f2 = typeof m2 == `function` ? m2.call(_3, d3, f2) : m2, f2 == null) break a;
                  d3 = h2({}, d3, f2);
                  break a;
                case 2:
                  Ra = true;
              }
            }
            f2 = s3.callback, f2 !== null && (e3.flags |= 64, p3 && (e3.flags |= 8192), p3 = i3.callbacks, p3 ===
            null ? i3.callbacks = [f2] : p3.push(f2));
          } else p3 = { lane: f2, tag: s3.tag, payload: s3.payload, callback: s3.callback, next: null }, u2 ===
          null ? (l3 = u2 = p3, c3 = d3) : u2 = u2.next = p3, o3 |= f2;
          if (s3 = s3.next, s3 === null) {
            if (s3 = i3.shared.pending, s3 === null) break;
            p3 = s3, s3 = p3.next, p3.next = null, i3.lastBaseUpdate = p3, i3.shared.pending = null;
          }
        } while (1);
        u2 === null && (c3 = d3), i3.baseState = c3, i3.firstBaseUpdate = l3, i3.lastBaseUpdate = u2, a3 === null &&
        (i3.shared.lanes = 0), Gl |= o3, e3.lanes = o3, e3.memoizedState = d3;
      }
    }
    function Ja(e3, t3) {
      if (typeof e3 != `function`) throw Error(i2(191, e3));
      e3.call(t3);
    }
    function Ya(e3, t3) {
      var n3 = e3.callbacks;
      if (n3 !== null) for (e3.callbacks = null, e3 = 0; e3 < n3.length; e3++) Ja(n3[e3], t3);
    }
    var Xa = O2(null), Za = O2(0);
    function Qa(e3, t3) {
      e3 = Ul, A2(Za, e3), A2(Xa, t3), Ul = e3 | t3.baseLanes;
    }
    function $a() {
      A2(Za, Ul), A2(Xa, Xa.current);
    }
    function eo() {
      Ul = Za.current, k2(Xa), k2(Za);
    }
    var to = O2(null), no = null;
    function ro(e3) {
      var t3 = e3.alternate;
      A2(co, co.current & 1), A2(to, e3), no === null && (t3 === null || Xa.current !== null || t3.memoizedState !==
      null) && (no = e3);
    }
    function io(e3) {
      A2(co, co.current), A2(to, e3), no === null && (no = e3);
    }
    function ao(e3) {
      e3.tag === 22 ? (A2(co, co.current), A2(to, e3), no === null && (no = e3)) : oo(e3);
    }
    function oo() {
      A2(co, co.current), A2(to, to.current);
    }
    function so(e3) {
      k2(to), no === e3 && (no = null), k2(co);
    }
    var co = O2(0);
    function lo(e3) {
      for (var t3 = e3; t3 !== null; ) {
        if (t3.tag === 13) {
          var n3 = t3.memoizedState;
          if (n3 !== null && (n3 = n3.dehydrated, n3 === null || af(n3) || of(n3))) return t3;
        } else if (t3.tag === 19 && (t3.memoizedProps.revealOrder === `forwards` || t3.memoizedProps.revealOrder ===
        `backwards` || t3.memoizedProps.revealOrder === `unstable_legacy-backwards` || t3.memoizedProps.revealOrder ===
        `together`)) {
          if (t3.flags & 128) return t3;
        } else if (t3.child !== null) {
          t3.child.return = t3, t3 = t3.child;
          continue;
        }
        if (t3 === e3) break;
        for (; t3.sibling === null; ) {
          if (t3.return === null || t3.return === e3) return null;
          t3 = t3.return;
        }
        t3.sibling.return = t3.return, t3 = t3.sibling;
      }
      return null;
    }
    var uo = 0, H = null, U = null, fo = null, po = false, mo = false, ho = false, go = 0, _o = 0, vo = null, yo = 0;
    function bo() {
      throw Error(i2(321));
    }
    function xo(e3, t3) {
      if (t3 === null) return false;
      for (var n3 = 0; n3 < t3.length && n3 < e3.length; n3++) if (!xr2(e3[n3], t3[n3])) return false;
      return true;
    }
    function So(e3, t3, n3, r3, i3, a3) {
      return uo = a3, H = t3, t3.memoizedState = null, t3.updateQueue = null, t3.lanes = 0, E2.H = e3 === null ||
      e3.memoizedState === null ? zs : Bs, ho = false, a3 = n3(r3, i3), ho = false, mo && (a3 = wo(t3, n3, r3,
      i3)), Co(e3), a3;
    }
    function Co(e3) {
      E2.H = Rs;
      var t3 = U !== null && U.next !== null;
      if (uo = 0, fo = U = H = null, po = false, _o = 0, vo = null, t3) throw Error(i2(300));
      e3 === null || rc || (e3 = e3.dependencies, e3 !== null && Zi(e3) && (rc = true));
    }
    function wo(e3, t3, n3, r3) {
      H = e3;
      var a3 = 0;
      do {
        if (mo && (vo = null), _o = 0, mo = false, 25 <= a3) throw Error(i2(301));
        if (a3 += 1, fo = U = null, e3.updateQueue != null) {
          var o3 = e3.updateQueue;
          o3.lastEffect = null, o3.events = null, o3.stores = null, o3.memoCache != null && (o3.memoCache.index =
          0);
        }
        E2.H = Vs, o3 = t3(n3, r3);
      } while (mo);
      return o3;
    }
    function To() {
      var e3 = E2.H, t3 = e3.useState()[0];
      return t3 = typeof t3.then == `function` ? Mo(t3) : t3, e3 = e3.useState()[0], (U === null ? null : U.memoizedState) !==
      e3 && (H.flags |= 1024), t3;
    }
    function Eo() {
      var e3 = go !== 0;
      return go = 0, e3;
    }
    function Do(e3, t3, n3) {
      t3.updateQueue = e3.updateQueue, t3.flags &= -2053, e3.lanes &= ~n3;
    }
    function Oo(e3) {
      if (po) {
        for (e3 = e3.memoizedState; e3 !== null; ) {
          var t3 = e3.queue;
          t3 !== null && (t3.pending = null), e3 = e3.next;
        }
        po = false;
      }
      uo = 0, fo = U = H = null, mo = false, _o = go = 0, vo = null;
    }
    function ko() {
      var e3 = { memoizedState: null, baseState: null, baseQueue: null, queue: null, next: null };
      return fo === null ? H.memoizedState = fo = e3 : fo = fo.next = e3, fo;
    }
    function Ao() {
      if (U === null) {
        var e3 = H.alternate;
        e3 = e3 === null ? null : e3.memoizedState;
      } else e3 = U.next;
      var t3 = fo === null ? H.memoizedState : fo.next;
      if (t3 !== null) fo = t3, U = e3;
      else {
        if (e3 === null) throw H.alternate === null ? Error(i2(467)) : Error(i2(310));
        U = e3, e3 = { memoizedState: U.memoizedState, baseState: U.baseState, baseQueue: U.baseQueue, queue: U.
        queue, next: null }, fo === null ? H.memoizedState = fo = e3 : fo = fo.next = e3;
      }
      return fo;
    }
    function jo() {
      return { lastEffect: null, events: null, stores: null, memoCache: null };
    }
    function Mo(e3) {
      var t3 = _o;
      return _o += 1, vo === null && (vo = []), e3 = Ta(vo, e3, t3), t3 = H, (fo === null ? t3.memoizedState :
      fo.next) === null && (t3 = t3.alternate, E2.H = t3 === null || t3.memoizedState === null ? zs : Bs), e3;
    }
    function No(e3) {
      if (typeof e3 == `object` && e3) {
        if (typeof e3.then == `function`) return Mo(e3);
        if (e3.$$typeof === S2) return $i(e3);
      }
      throw Error(i2(438, String(e3)));
    }
    function Po(e3) {
      var t3 = null, n3 = H.updateQueue;
      if (n3 !== null && (t3 = n3.memoCache), t3 == null) {
        var r3 = H.alternate;
        r3 !== null && (r3 = r3.updateQueue, r3 !== null && (r3 = r3.memoCache, r3 != null && (t3 = { data: r3.
        data.map(function(e4) {
          return e4.slice();
        }), index: 0 })));
      }
      if (t3 ??= { data: [], index: 0 }, n3 === null && (n3 = jo(), H.updateQueue = n3), n3.memoCache = t3, n3 =
      t3.data[t3.index], n3 === void 0) for (n3 = t3.data[t3.index] = Array(e3), r3 = 0; r3 < e3; r3++) n3[r3] =
      ie2;
      return t3.index++, n3;
    }
    function Fo(e3, t3) {
      return typeof t3 == `function` ? t3(e3) : t3;
    }
    function Io(e3) {
      return Lo(Ao(), U, e3);
    }
    function Lo(e3, t3, n3) {
      var r3 = e3.queue;
      if (r3 === null) throw Error(i2(311));
      r3.lastRenderedReducer = n3;
      var a3 = e3.baseQueue, o3 = r3.pending;
      if (o3 !== null) {
        if (a3 !== null) {
          var s3 = a3.next;
          a3.next = o3.next, o3.next = s3;
        }
        t3.baseQueue = a3 = o3, r3.pending = null;
      }
      if (o3 = e3.baseState, a3 === null) e3.memoizedState = o3;
      else {
        t3 = a3.next;
        var c3 = s3 = null, l3 = null, u2 = t3, d3 = false;
        do {
          var f2 = u2.lane & -536870913;
          if (f2 === u2.lane ? (uo & f2) === f2 : (Y & f2) === f2) {
            var p3 = u2.revertLane;
            if (p3 === 0) l3 !== null && (l3 = l3.next = { lane: 0, revertLane: 0, gesture: null, action: u2.action,
            hasEagerState: u2.hasEagerState, eagerState: u2.eagerState, next: null }), f2 === ua && (d3 = true);
            else if ((uo & p3) === p3) {
              u2 = u2.next, p3 === ua && (d3 = true);
              continue;
            } else f2 = { lane: 0, revertLane: u2.revertLane, gesture: null, action: u2.action, hasEagerState: u2.
            hasEagerState, eagerState: u2.eagerState, next: null }, l3 === null ? (c3 = l3 = f2, s3 = o3) : l3 =
            l3.next = f2, H.lanes |= p3, Gl |= p3;
            f2 = u2.action, ho && n3(o3, f2), o3 = u2.hasEagerState ? u2.eagerState : n3(o3, f2);
          } else p3 = { lane: f2, revertLane: u2.revertLane, gesture: u2.gesture, action: u2.action, hasEagerState: u2.
          hasEagerState, eagerState: u2.eagerState, next: null }, l3 === null ? (c3 = l3 = p3, s3 = o3) : l3 =
          l3.next = p3, H.lanes |= f2, Gl |= f2;
          u2 = u2.next;
        } while (u2 !== null && u2 !== t3);
        if (l3 === null ? s3 = o3 : l3.next = c3, !xr2(o3, e3.memoizedState) && (rc = true, d3 && (n3 = da, n3 !==
        null))) throw n3;
        e3.memoizedState = o3, e3.baseState = s3, e3.baseQueue = l3, r3.lastRenderedState = o3;
      }
      return a3 === null && (r3.lanes = 0), [e3.memoizedState, r3.dispatch];
    }
    function Ro(e3) {
      var t3 = Ao(), n3 = t3.queue;
      if (n3 === null) throw Error(i2(311));
      n3.lastRenderedReducer = e3;
      var r3 = n3.dispatch, a3 = n3.pending, o3 = t3.memoizedState;
      if (a3 !== null) {
        n3.pending = null;
        var s3 = a3 = a3.next;
        do
          o3 = e3(o3, s3.action), s3 = s3.next;
        while (s3 !== a3);
        xr2(o3, t3.memoizedState) || (rc = true), t3.memoizedState = o3, t3.baseQueue === null && (t3.baseState =
        o3), n3.lastRenderedState = o3;
      }
      return [o3, r3];
    }
    function zo(e3, t3, n3) {
      var r3 = H, a3 = Ao(), o3 = V;
      if (o3) {
        if (n3 === void 0) throw Error(i2(407));
        n3 = n3();
      } else n3 = t3();
      var s3 = !xr2((U || a3).memoizedState, n3);
      if (s3 && (a3.memoizedState = n3, rc = true), a3 = a3.queue, us(Ho.bind(null, r3, a3, e3), [e3]), a3.getSnapshot !==
      t3 || s3 || fo !== null && fo.memoizedState.tag & 1) {
        if (r3.flags |= 2048, as(9, { destroy: void 0 }, Vo.bind(null, r3, a3, n3, t3), null), q === null) throw Error(
        i2(349));
        o3 || uo & 127 || Bo(r3, t3, n3);
      }
      return n3;
    }
    function Bo(e3, t3, n3) {
      e3.flags |= 16384, e3 = { getSnapshot: t3, value: n3 }, t3 = H.updateQueue, t3 === null ? (t3 = jo(), H.
      updateQueue = t3, t3.stores = [e3]) : (n3 = t3.stores, n3 === null ? t3.stores = [e3] : n3.push(e3));
    }
    function Vo(e3, t3, n3, r3) {
      t3.value = n3, t3.getSnapshot = r3, Uo(t3) && Wo(e3);
    }
    function Ho(e3, t3, n3) {
      return n3(function() {
        Uo(t3) && Wo(e3);
      });
    }
    function Uo(e3) {
      var t3 = e3.getSnapshot;
      e3 = e3.value;
      try {
        var n3 = t3();
        return !xr2(e3, n3);
      } catch {
        return true;
      }
    }
    function Wo(e3) {
      var t3 = ni2(e3, 2);
      t3 !== null && hu(t3, e3, 2);
    }
    function Go(e3) {
      var t3 = ko();
      if (typeof e3 == `function`) {
        var n3 = e3;
        if (e3 = n3(), ho) {
          Ue2(true);
          try {
            n3();
          } finally {
            Ue2(false);
          }
        }
      }
      return t3.memoizedState = t3.baseState = e3, t3.queue = { pending: null, lanes: 0, dispatch: null, lastRenderedReducer: Fo,
      lastRenderedState: e3 }, t3;
    }
    function Ko(e3, t3, n3, r3) {
      return e3.baseState = n3, Lo(e3, U, typeof r3 == `function` ? r3 : Fo);
    }
    function qo(e3, t3, n3, r3, a3) {
      if (Fs(e3)) throw Error(i2(485));
      if (e3 = t3.action, e3 !== null) {
        var o3 = { payload: a3, action: e3, next: null, isTransition: true, status: `pending`, value: null, reason: null,
        listeners: [], then: function(e4) {
          o3.listeners.push(e4);
        } };
        E2.T === null ? o3.isTransition = false : n3(true), r3(o3), n3 = t3.pending, n3 === null ? (o3.next = t3.
        pending = o3, Jo(t3, o3)) : (o3.next = n3.next, t3.pending = n3.next = o3);
      }
    }
    function Jo(e3, t3) {
      var n3 = t3.action, r3 = t3.payload, i3 = e3.state;
      if (t3.isTransition) {
        var a3 = E2.T, o3 = {};
        E2.T = o3;
        try {
          var s3 = n3(i3, r3), c3 = E2.S;
          c3 !== null && c3(o3, s3), Yo(e3, t3, s3);
        } catch (n4) {
          Zo(e3, t3, n4);
        } finally {
          a3 !== null && o3.types !== null && (a3.types = o3.types), E2.T = a3;
        }
      } else try {
        a3 = n3(i3, r3), Yo(e3, t3, a3);
      } catch (n4) {
        Zo(e3, t3, n4);
      }
    }
    function Yo(e3, t3, n3) {
      typeof n3 == `object` && n3 && typeof n3.then == `function` ? n3.then(function(n4) {
        Xo(e3, t3, n4);
      }, function(n4) {
        return Zo(e3, t3, n4);
      }) : Xo(e3, t3, n3);
    }
    function Xo(e3, t3, n3) {
      t3.status = `fulfilled`, t3.value = n3, Qo(t3), e3.state = n3, t3 = e3.pending, t3 !== null && (n3 = t3.
      next, n3 === t3 ? e3.pending = null : (n3 = n3.next, t3.next = n3, Jo(e3, n3)));
    }
    function Zo(e3, t3, n3) {
      var r3 = e3.pending;
      if (e3.pending = null, r3 !== null) {
        r3 = r3.next;
        do
          t3.status = `rejected`, t3.reason = n3, Qo(t3), t3 = t3.next;
        while (t3 !== r3);
      }
      e3.action = null;
    }
    function Qo(e3) {
      e3 = e3.listeners;
      for (var t3 = 0; t3 < e3.length; t3++) (0, e3[t3])();
    }
    function $o(e3, t3) {
      return t3;
    }
    function es(e3, t3) {
      if (V) {
        var n3 = q.formState;
        if (n3 !== null) {
          a: {
            var r3 = H;
            if (V) {
              if (B) {
                b: {
                  for (var i3 = B, a3 = Pi; i3.nodeType !== 8; ) {
                    if (!a3) {
                      i3 = null;
                      break b;
                    }
                    if (i3 = cf(i3.nextSibling), i3 === null) {
                      i3 = null;
                      break b;
                    }
                  }
                  a3 = i3.data, i3 = a3 === `F!` || a3 === `F` ? i3 : null;
                }
                if (i3) {
                  B = cf(i3.nextSibling), r3 = i3.data === `F!`;
                  break a;
                }
              }
              Ii(r3);
            }
            r3 = false;
          }
          r3 && (t3 = n3[0]);
        }
      }
      return n3 = ko(), n3.memoizedState = n3.baseState = t3, r3 = { pending: null, lanes: 0, dispatch: null, lastRenderedReducer: $o,
      lastRenderedState: t3 }, n3.queue = r3, n3 = Ms.bind(null, H, r3), r3.dispatch = n3, r3 = Go(false), a3 =
      Ps.bind(null, H, false, r3.queue), r3 = ko(), i3 = { state: t3, dispatch: null, action: e3, pending: null },
      r3.queue = i3, n3 = qo.bind(null, H, i3, a3, n3), i3.dispatch = n3, r3.memoizedState = e3, [t3, n3, false];
    }
    function ts(e3) {
      return ns(Ao(), U, e3);
    }
    function ns(e3, t3, n3) {
      if (t3 = Lo(e3, t3, $o)[0], e3 = Io(Fo)[0], typeof t3 == `object` && t3 && typeof t3.then == `function`)
       try {
        var r3 = Mo(t3);
      } catch (e4) {
        throw e4 === ba ? Sa : e4;
      }
      else r3 = t3;
      t3 = Ao();
      var i3 = t3.queue, a3 = i3.dispatch;
      return n3 !== t3.memoizedState && (H.flags |= 2048, as(9, { destroy: void 0 }, rs.bind(null, i3, n3), null)),
      [r3, a3, e3];
    }
    function rs(e3, t3) {
      e3.action = t3;
    }
    function is(e3) {
      var t3 = Ao(), n3 = U;
      if (n3 !== null) return ns(t3, n3, e3);
      Ao(), t3 = t3.memoizedState, n3 = Ao();
      var r3 = n3.queue.dispatch;
      return n3.memoizedState = e3, [t3, r3, false];
    }
    function as(e3, t3, n3, r3) {
      return e3 = { tag: e3, create: n3, deps: r3, inst: t3, next: null }, t3 = H.updateQueue, t3 === null && (t3 =
      jo(), H.updateQueue = t3), n3 = t3.lastEffect, n3 === null ? t3.lastEffect = e3.next = e3 : (r3 = n3.next,
      n3.next = e3, e3.next = r3, t3.lastEffect = e3), e3;
    }
    function os() {
      return Ao().memoizedState;
    }
    function ss(e3, t3, n3, r3) {
      var i3 = ko();
      H.flags |= e3, i3.memoizedState = as(1 | t3, { destroy: void 0 }, n3, r3 === void 0 ? null : r3);
    }
    function cs(e3, t3, n3, r3) {
      var i3 = Ao();
      r3 = r3 === void 0 ? null : r3;
      var a3 = i3.memoizedState.inst;
      U !== null && r3 !== null && xo(r3, U.memoizedState.deps) ? i3.memoizedState = as(t3, a3, n3, r3) : (H.flags |=
      e3, i3.memoizedState = as(1 | t3, a3, n3, r3));
    }
    function ls(e3, t3) {
      ss(8390656, 8, e3, t3);
    }
    function us(e3, t3) {
      cs(2048, 8, e3, t3);
    }
    function ds(e3) {
      H.flags |= 4;
      var t3 = H.updateQueue;
      if (t3 === null) t3 = jo(), H.updateQueue = t3, t3.events = [e3];
      else {
        var n3 = t3.events;
        n3 === null ? t3.events = [e3] : n3.push(e3);
      }
    }
    function fs(e3) {
      var t3 = Ao().memoizedState;
      return ds({ ref: t3, nextImpl: e3 }), function() {
        if (K & 2) throw Error(i2(440));
        return t3.impl.apply(void 0, arguments);
      };
    }
    function ps(e3, t3) {
      return cs(4, 2, e3, t3);
    }
    function ms(e3, t3) {
      return cs(4, 4, e3, t3);
    }
    function hs(e3, t3) {
      if (typeof t3 == `function`) {
        e3 = e3();
        var n3 = t3(e3);
        return function() {
          typeof n3 == `function` ? n3() : t3(null);
        };
      }
      if (t3 != null) return e3 = e3(), t3.current = e3, function() {
        t3.current = null;
      };
    }
    function gs(e3, t3, n3) {
      n3 = n3 == null ? null : n3.concat([e3]), cs(4, 4, hs.bind(null, t3, e3), n3);
    }
    function _s() {
    }
    function vs(e3, t3) {
      var n3 = Ao();
      t3 = t3 === void 0 ? null : t3;
      var r3 = n3.memoizedState;
      return t3 !== null && xo(t3, r3[1]) ? r3[0] : (n3.memoizedState = [e3, t3], e3);
    }
    function ys(e3, t3) {
      var n3 = Ao();
      t3 = t3 === void 0 ? null : t3;
      var r3 = n3.memoizedState;
      if (t3 !== null && xo(t3, r3[1])) return r3[0];
      if (r3 = e3(), ho) {
        Ue2(true);
        try {
          e3();
        } finally {
          Ue2(false);
        }
      }
      return n3.memoizedState = [r3, t3], r3;
    }
    function bs(e3, t3, n3) {
      return n3 === void 0 || uo & 1073741824 && !(Y & 261930) ? e3.memoizedState = t3 : (e3.memoizedState = n3,
      e3 = mu(), H.lanes |= e3, Gl |= e3, n3);
    }
    function xs(e3, t3, n3, r3) {
      return xr2(n3, t3) ? n3 : Xa.current === null ? !(uo & 42) || uo & 1073741824 && !(Y & 261930) ? (rc = true,
      e3.memoizedState = n3) : (e3 = mu(), H.lanes |= e3, Gl |= e3, t3) : (e3 = bs(e3, n3, r3), xr2(e3, t3) ||
      (rc = true), e3);
    }
    function Ss(e3, t3, n3, r3, i3) {
      var a3 = D2.p;
      D2.p = a3 !== 0 && 8 > a3 ? a3 : 8;
      var o3 = E2.T, s3 = {};
      E2.T = s3, Ps(e3, false, t3, n3);
      try {
        var c3 = i3(), l3 = E2.S;
        l3 !== null && l3(s3, c3), typeof c3 == `object` && c3 && typeof c3.then == `function` ? Ns(e3, t3, ma(
        c3, r3), pu(e3)) : Ns(e3, t3, r3, pu(e3));
      } catch (n4) {
        Ns(e3, t3, { then: function() {
        }, status: `rejected`, reason: n4 }, pu());
      } finally {
        D2.p = a3, o3 !== null && s3.types !== null && (o3.types = s3.types), E2.T = o3;
      }
    }
    function Cs() {
    }
    function ws(e3, t3, n3, r3) {
      if (e3.tag !== 5) throw Error(i2(476));
      var a3 = Ts(e3).queue;
      Ss(e3, a3, t3, ue2, n3 === null ? Cs : function() {
        return Es(e3), n3(r3);
      });
    }
    function Ts(e3) {
      var t3 = e3.memoizedState;
      if (t3 !== null) return t3;
      t3 = { memoizedState: ue2, baseState: ue2, baseQueue: null, queue: { pending: null, lanes: 0, dispatch: null,
      lastRenderedReducer: Fo, lastRenderedState: ue2 }, next: null };
      var n3 = {};
      return t3.next = { memoizedState: n3, baseState: n3, baseQueue: null, queue: { pending: null, lanes: 0, dispatch: null,
      lastRenderedReducer: Fo, lastRenderedState: n3 }, next: null }, e3.memoizedState = t3, e3 = e3.alternate,
      e3 !== null && (e3.memoizedState = t3), t3;
    }
    function Es(e3) {
      var t3 = Ts(e3);
      t3.next === null && (t3 = e3.alternate.memoizedState), Ns(e3, t3.next.queue, {}, pu());
    }
    function Ds() {
      return $i(Qf);
    }
    function Os() {
      return Ao().memoizedState;
    }
    function ks() {
      return Ao().memoizedState;
    }
    function As(e3) {
      for (var t3 = e3.return; t3 !== null; ) {
        switch (t3.tag) {
          case 24:
          case 3:
            var n3 = pu();
            e3 = Va(n3);
            var r3 = Ha(t3, e3, n3);
            r3 !== null && (hu(r3, t3, n3), Ua(r3, t3, n3)), t3 = { cache: oa() }, e3.payload = t3;
            return;
        }
        t3 = t3.return;
      }
    }
    function js(e3, t3, n3) {
      var r3 = pu();
      n3 = { lane: r3, revertLane: 0, gesture: null, action: n3, hasEagerState: false, eagerState: null, next: null },
      Fs(e3) ? Is(t3, n3) : (n3 = ti2(e3, t3, n3, r3), n3 !== null && (hu(n3, e3, r3), Ls(n3, t3, r3)));
    }
    function Ms(e3, t3, n3) {
      Ns(e3, t3, n3, pu());
    }
    function Ns(e3, t3, n3, r3) {
      var i3 = { lane: r3, revertLane: 0, gesture: null, action: n3, hasEagerState: false, eagerState: null, next: null };
      if (Fs(e3)) Is(t3, i3);
      else {
        var a3 = e3.alternate;
        if (e3.lanes === 0 && (a3 === null || a3.lanes === 0) && (a3 = t3.lastRenderedReducer, a3 !== null)) try {
          var o3 = t3.lastRenderedState, s3 = a3(o3, n3);
          if (i3.hasEagerState = true, i3.eagerState = s3, xr2(s3, o3)) return ei2(e3, t3, i3, 0), q === null &&
          $r2(), false;
        } catch {
        }
        if (n3 = ti2(e3, t3, i3, r3), n3 !== null) return hu(n3, e3, r3), Ls(n3, t3, r3), true;
      }
      return false;
    }
    function Ps(e3, t3, n3, r3) {
      if (r3 = { lane: 2, revertLane: dd(), gesture: null, action: r3, hasEagerState: false, eagerState: null,
      next: null }, Fs(e3)) {
        if (t3) throw Error(i2(479));
      } else t3 = ti2(e3, n3, r3, 2), t3 !== null && hu(t3, e3, 2);
    }
    function Fs(e3) {
      var t3 = e3.alternate;
      return e3 === H || t3 !== null && t3 === H;
    }
    function Is(e3, t3) {
      mo = po = true;
      var n3 = e3.pending;
      n3 === null ? t3.next = t3 : (t3.next = n3.next, n3.next = t3), e3.pending = t3;
    }
    function Ls(e3, t3, n3) {
      if (n3 & 4194048) {
        var r3 = t3.lanes;
        r3 &= e3.pendingLanes, n3 |= r3, t3.lanes = n3, it2(e3, n3);
      }
    }
    var Rs = { readContext: $i, use: No, useCallback: bo, useContext: bo, useEffect: bo, useImperativeHandle: bo,
    useLayoutEffect: bo, useInsertionEffect: bo, useMemo: bo, useReducer: bo, useRef: bo, useState: bo, useDebugValue: bo,
    useDeferredValue: bo, useTransition: bo, useSyncExternalStore: bo, useId: bo, useHostTransitionStatus: bo,
    useFormState: bo, useActionState: bo, useOptimistic: bo, useMemoCache: bo, useCacheRefresh: bo };
    Rs.useEffectEvent = bo;
    var zs = { readContext: $i, use: No, useCallback: function(e3, t3) {
      return ko().memoizedState = [e3, t3 === void 0 ? null : t3], e3;
    }, useContext: $i, useEffect: ls, useImperativeHandle: function(e3, t3, n3) {
      n3 = n3 == null ? null : n3.concat([e3]), ss(4194308, 4, hs.bind(null, t3, e3), n3);
    }, useLayoutEffect: function(e3, t3) {
      return ss(4194308, 4, e3, t3);
    }, useInsertionEffect: function(e3, t3) {
      ss(4, 2, e3, t3);
    }, useMemo: function(e3, t3) {
      var n3 = ko();
      t3 = t3 === void 0 ? null : t3;
      var r3 = e3();
      if (ho) {
        Ue2(true);
        try {
          e3();
        } finally {
          Ue2(false);
        }
      }
      return n3.memoizedState = [r3, t3], r3;
    }, useReducer: function(e3, t3, n3) {
      var r3 = ko();
      if (n3 !== void 0) {
        var i3 = n3(t3);
        if (ho) {
          Ue2(true);
          try {
            n3(t3);
          } finally {
            Ue2(false);
          }
        }
      } else i3 = t3;
      return r3.memoizedState = r3.baseState = i3, e3 = { pending: null, lanes: 0, dispatch: null, lastRenderedReducer: e3,
      lastRenderedState: i3 }, r3.queue = e3, e3 = e3.dispatch = js.bind(null, H, e3), [r3.memoizedState, e3];
    }, useRef: function(e3) {
      var t3 = ko();
      return e3 = { current: e3 }, t3.memoizedState = e3;
    }, useState: function(e3) {
      e3 = Go(e3);
      var t3 = e3.queue, n3 = Ms.bind(null, H, t3);
      return t3.dispatch = n3, [e3.memoizedState, n3];
    }, useDebugValue: _s, useDeferredValue: function(e3, t3) {
      return bs(ko(), e3, t3);
    }, useTransition: function() {
      var e3 = Go(false);
      return e3 = Ss.bind(null, H, e3.queue, true, false), ko().memoizedState = e3, [false, e3];
    }, useSyncExternalStore: function(e3, t3, n3) {
      var r3 = H, a3 = ko();
      if (V) {
        if (n3 === void 0) throw Error(i2(407));
        n3 = n3();
      } else {
        if (n3 = t3(), q === null) throw Error(i2(349));
        Y & 127 || Bo(r3, t3, n3);
      }
      a3.memoizedState = n3;
      var o3 = { value: n3, getSnapshot: t3 };
      return a3.queue = o3, ls(Ho.bind(null, r3, o3, e3), [e3]), r3.flags |= 2048, as(9, { destroy: void 0 }, Vo.
      bind(null, r3, o3, n3, t3), null), n3;
    }, useId: function() {
      var e3 = ko(), t3 = q.identifierPrefix;
      if (V) {
        var n3 = Ei, r3 = Ti;
        n3 = (r3 & ~(1 << 32 - We2(r3) - 1)).toString(32) + n3, t3 = `_` + t3 + `R_` + n3, n3 = go++, 0 < n3 &&
        (t3 += `H` + n3.toString(32)), t3 += `_`;
      } else n3 = yo++, t3 = `_` + t3 + `r_` + n3.toString(32) + `_`;
      return e3.memoizedState = t3;
    }, useHostTransitionStatus: Ds, useFormState: es, useActionState: es, useOptimistic: function(e3) {
      var t3 = ko();
      t3.memoizedState = t3.baseState = e3;
      var n3 = { pending: null, lanes: 0, dispatch: null, lastRenderedReducer: null, lastRenderedState: null };
      return t3.queue = n3, t3 = Ps.bind(null, H, true, n3), n3.dispatch = t3, [e3, t3];
    }, useMemoCache: Po, useCacheRefresh: function() {
      return ko().memoizedState = As.bind(null, H);
    }, useEffectEvent: function(e3) {
      var t3 = ko(), n3 = { impl: e3 };
      return t3.memoizedState = n3, function() {
        if (K & 2) throw Error(i2(440));
        return n3.impl.apply(void 0, arguments);
      };
    } }, Bs = { readContext: $i, use: No, useCallback: vs, useContext: $i, useEffect: us, useImperativeHandle: gs,
    useInsertionEffect: ps, useLayoutEffect: ms, useMemo: ys, useReducer: Io, useRef: os, useState: function() {
      return Io(Fo);
    }, useDebugValue: _s, useDeferredValue: function(e3, t3) {
      return xs(Ao(), U.memoizedState, e3, t3);
    }, useTransition: function() {
      var e3 = Io(Fo)[0], t3 = Ao().memoizedState;
      return [typeof e3 == `boolean` ? e3 : Mo(e3), t3];
    }, useSyncExternalStore: zo, useId: Os, useHostTransitionStatus: Ds, useFormState: ts, useActionState: ts,
    useOptimistic: function(e3, t3) {
      return Ko(Ao(), U, e3, t3);
    }, useMemoCache: Po, useCacheRefresh: ks };
    Bs.useEffectEvent = fs;
    var Vs = { readContext: $i, use: No, useCallback: vs, useContext: $i, useEffect: us, useImperativeHandle: gs,
    useInsertionEffect: ps, useLayoutEffect: ms, useMemo: ys, useReducer: Ro, useRef: os, useState: function() {
      return Ro(Fo);
    }, useDebugValue: _s, useDeferredValue: function(e3, t3) {
      var n3 = Ao();
      return U === null ? bs(n3, e3, t3) : xs(n3, U.memoizedState, e3, t3);
    }, useTransition: function() {
      var e3 = Ro(Fo)[0], t3 = Ao().memoizedState;
      return [typeof e3 == `boolean` ? e3 : Mo(e3), t3];
    }, useSyncExternalStore: zo, useId: Os, useHostTransitionStatus: Ds, useFormState: is, useActionState: is,
    useOptimistic: function(e3, t3) {
      var n3 = Ao();
      return U === null ? (n3.baseState = e3, [e3, n3.queue.dispatch]) : Ko(n3, U, e3, t3);
    }, useMemoCache: Po, useCacheRefresh: ks };
    Vs.useEffectEvent = fs;
    function Hs(e3, t3, n3, r3) {
      t3 = e3.memoizedState, n3 = n3(r3, t3), n3 = n3 == null ? t3 : h2({}, t3, n3), e3.memoizedState = n3, e3.
      lanes === 0 && (e3.updateQueue.baseState = n3);
    }
    var Us = { enqueueSetState: function(e3, t3, n3) {
      e3 = e3._reactInternals;
      var r3 = pu(), i3 = Va(r3);
      i3.payload = t3, n3 != null && (i3.callback = n3), t3 = Ha(e3, i3, r3), t3 !== null && (hu(t3, e3, r3), Ua(
      t3, e3, r3));
    }, enqueueReplaceState: function(e3, t3, n3) {
      e3 = e3._reactInternals;
      var r3 = pu(), i3 = Va(r3);
      i3.tag = 1, i3.payload = t3, n3 != null && (i3.callback = n3), t3 = Ha(e3, i3, r3), t3 !== null && (hu(t3,
      e3, r3), Ua(t3, e3, r3));
    }, enqueueForceUpdate: function(e3, t3) {
      e3 = e3._reactInternals;
      var n3 = pu(), r3 = Va(n3);
      r3.tag = 2, t3 != null && (r3.callback = t3), t3 = Ha(e3, r3, n3), t3 !== null && (hu(t3, e3, n3), Ua(t3,
      e3, n3));
    } };
    function Ws(e3, t3, n3, r3, i3, a3, o3) {
      return e3 = e3.stateNode, typeof e3.shouldComponentUpdate == `function` ? e3.shouldComponentUpdate(r3, a3,
      o3) : t3.prototype && t3.prototype.isPureReactComponent ? !Sr2(n3, r3) || !Sr2(i3, a3) : true;
    }
    function Gs(e3, t3, n3, r3) {
      e3 = t3.state, typeof t3.componentWillReceiveProps == `function` && t3.componentWillReceiveProps(n3, r3),
      typeof t3.UNSAFE_componentWillReceiveProps == `function` && t3.UNSAFE_componentWillReceiveProps(n3, r3),
      t3.state !== e3 && Us.enqueueReplaceState(t3, t3.state, null);
    }
    function Ks(e3, t3) {
      var n3 = t3;
      if (`ref` in t3) for (var r3 in n3 = {}, t3) r3 !== `ref` && (n3[r3] = t3[r3]);
      if (e3 = e3.defaultProps) for (var i3 in n3 === t3 && (n3 = h2({}, n3)), e3) n3[i3] === void 0 && (n3[i3] =
      e3[i3]);
      return n3;
    }
    function qs(e3) {
      Yr2(e3);
    }
    function Js(e3) {
      console.error(e3);
    }
    function Ys(e3) {
      Yr2(e3);
    }
    function Xs(e3, t3) {
      try {
        var n3 = e3.onUncaughtError;
        n3(t3.value, { componentStack: t3.stack });
      } catch (e4) {
        setTimeout(function() {
          throw e4;
        });
      }
    }
    function Zs(e3, t3, n3) {
      try {
        var r3 = e3.onCaughtError;
        r3(n3.value, { componentStack: n3.stack, errorBoundary: t3.tag === 1 ? t3.stateNode : null });
      } catch (e4) {
        setTimeout(function() {
          throw e4;
        });
      }
    }
    function Qs(e3, t3, n3) {
      return n3 = Va(n3), n3.tag = 3, n3.payload = { element: null }, n3.callback = function() {
        Xs(e3, t3);
      }, n3;
    }
    function $s(e3) {
      return e3 = Va(e3), e3.tag = 3, e3;
    }
    function ec(e3, t3, n3, r3) {
      var i3 = n3.type.getDerivedStateFromError;
      if (typeof i3 == `function`) {
        var a3 = r3.value;
        e3.payload = function() {
          return i3(a3);
        }, e3.callback = function() {
          Zs(t3, n3, r3);
        };
      }
      var o3 = n3.stateNode;
      o3 !== null && typeof o3.componentDidCatch == `function` && (e3.callback = function() {
        Zs(t3, n3, r3), typeof i3 != `function` && (ru === null ? ru = /* @__PURE__ */ new Set([this]) : ru.add(
        this));
        var e4 = r3.stack;
        this.componentDidCatch(r3.value, { componentStack: e4 === null ? `` : e4 });
      });
    }
    function tc(e3, t3, n3, r3, a3) {
      if (n3.flags |= 32768, typeof r3 == `object` && r3 && typeof r3.then == `function`) {
        if (t3 = n3.alternate, t3 !== null && Xi(t3, n3, a3, true), n3 = to.current, n3 !== null) {
          switch (n3.tag) {
            case 31:
            case 13:
              return no === null ? Du() : n3.alternate === null && Wl === 0 && (Wl = 3), n3.flags &= -257, n3.
              flags |= 65536, n3.lanes = a3, r3 === Ca ? n3.flags |= 16384 : (t3 = n3.updateQueue, t3 === null ?
              n3.updateQueue = /* @__PURE__ */ new Set([r3]) : t3.add(r3), Gu(e3, r3, a3)), false;
            case 22:
              return n3.flags |= 65536, r3 === Ca ? n3.flags |= 16384 : (t3 = n3.updateQueue, t3 === null ? (t3 =
              { transitions: null, markerInstances: null, retryQueue: /* @__PURE__ */ new Set([r3]) }, n3.updateQueue =
              t3) : (n3 = t3.retryQueue, n3 === null ? t3.retryQueue = /* @__PURE__ */ new Set([r3]) : n3.add(
              r3)), Gu(e3, r3, a3)), false;
          }
          throw Error(i2(435, n3.tag));
        }
        return Gu(e3, r3, a3), Du(), false;
      }
      if (V) return t3 = to.current, t3 === null ? (r3 !== Fi && (t3 = Error(i2(423), { cause: r3 }), Hi(_i(t3,
      n3))), e3 = e3.current.alternate, e3.flags |= 65536, a3 &= -a3, e3.lanes |= a3, r3 = _i(r3, n3), a3 = Qs(
      e3.stateNode, r3, a3), Wa(e3, a3), Wl !== 4 && (Wl = 2)) : (!(t3.flags & 65536) && (t3.flags |= 256), t3.
      flags |= 65536, t3.lanes = a3, r3 !== Fi && (e3 = Error(i2(422), { cause: r3 }), Hi(_i(e3, n3)))), false;
      var o3 = Error(i2(520), { cause: r3 });
      if (o3 = _i(o3, n3), Xl === null ? Xl = [o3] : Xl.push(o3), Wl !== 4 && (Wl = 2), t3 === null) return true;
      r3 = _i(r3, n3), n3 = t3;
      do {
        switch (n3.tag) {
          case 3:
            return n3.flags |= 65536, e3 = a3 & -a3, n3.lanes |= e3, e3 = Qs(n3.stateNode, r3, e3), Wa(n3, e3),
            false;
          case 1:
            if (t3 = n3.type, o3 = n3.stateNode, !(n3.flags & 128) && (typeof t3.getDerivedStateFromError == `\
function` || o3 !== null && typeof o3.componentDidCatch == `function` && (ru === null || !ru.has(o3)))) return n3.
            flags |= 65536, a3 &= -a3, n3.lanes |= a3, a3 = $s(a3), ec(a3, e3, n3, r3), Wa(n3, a3), false;
        }
        n3 = n3.return;
      } while (n3 !== null);
      return false;
    }
    var nc = Error(i2(461)), rc = false;
    function ic(e3, t3, n3, r3) {
      t3.child = e3 === null ? La(t3, null, n3, r3) : Ia(t3, e3.child, n3, r3);
    }
    function ac(e3, t3, n3, r3, i3) {
      n3 = n3.render;
      var a3 = t3.ref;
      if (`ref` in r3) {
        var o3 = {};
        for (var s3 in r3) s3 !== `ref` && (o3[s3] = r3[s3]);
      } else o3 = r3;
      return Qi(t3), r3 = So(e3, t3, n3, o3, a3, i3), s3 = Eo(), e3 !== null && !rc ? (Do(e3, t3, i3), kc(e3, t3,
      i3)) : (V && s3 && ki(t3), t3.flags |= 1, ic(e3, t3, r3, i3), t3.child);
    }
    function oc(e3, t3, n3, r3, i3) {
      if (e3 === null) {
        var a3 = n3.type;
        return typeof a3 == `function` && !ci2(a3) && a3.defaultProps === void 0 && n3.compare === null ? (t3.
        tag = 15, t3.type = a3, sc(e3, t3, a3, r3, i3)) : (e3 = di2(n3.type, null, r3, t3, t3.mode, i3), e3.ref =
        t3.ref, e3.return = t3, t3.child = e3);
      }
      if (a3 = e3.child, !Ac(e3, i3)) {
        var o3 = a3.memoizedProps;
        if (n3 = n3.compare, n3 = n3 === null ? Sr2 : n3, n3(o3, r3) && e3.ref === t3.ref) return kc(e3, t3, i3);
      }
      return t3.flags |= 1, e3 = li2(a3, r3), e3.ref = t3.ref, e3.return = t3, t3.child = e3;
    }
    function sc(e3, t3, n3, r3, i3) {
      if (e3 !== null) {
        var a3 = e3.memoizedProps;
        if (Sr2(a3, r3) && e3.ref === t3.ref) {
          if (rc = false, t3.pendingProps = r3 = a3, Ac(e3, i3)) e3.flags & 131072 && (rc = true);
          else return t3.lanes = e3.lanes, kc(e3, t3, i3);
        }
      }
      return hc(e3, t3, n3, r3, i3);
    }
    function cc(e3, t3, n3, r3) {
      var i3 = r3.children, a3 = e3 === null ? null : e3.memoizedState;
      if (e3 === null && t3.stateNode === null && (t3.stateNode = { _visibility: 1, _pendingMarkers: null, _retryCache: null,
      _transitions: null }), r3.mode === `hidden`) {
        if (t3.flags & 128) {
          if (a3 = a3 === null ? n3 : a3.baseLanes | n3, e3 !== null) {
            for (r3 = t3.child = e3.child, i3 = 0; r3 !== null; ) i3 = i3 | r3.lanes | r3.childLanes, r3 = r3.
            sibling;
            r3 = i3 & ~a3;
          } else r3 = 0, t3.child = null;
          return uc(e3, t3, a3, n3, r3);
        }
        if (n3 & 536870912) t3.memoizedState = { baseLanes: 0, cachePool: null }, e3 !== null && va(t3, a3 ===
        null ? null : a3.cachePool), a3 === null ? $a() : Qa(t3, a3), ao(t3);
        else return r3 = t3.lanes = 536870912, uc(e3, t3, a3 === null ? n3 : a3.baseLanes | n3, n3, r3);
      } else a3 === null ? (e3 !== null && va(t3, null), $a(), oo(t3)) : (va(t3, a3.cachePool), Qa(t3, a3), oo(
      t3), t3.memoizedState = null);
      return ic(e3, t3, i3, n3), t3.child;
    }
    function lc(e3, t3) {
      return e3 !== null && e3.tag === 22 || t3.stateNode !== null || (t3.stateNode = { _visibility: 1, _pendingMarkers: null,
      _retryCache: null, _transitions: null }), t3.sibling;
    }
    function uc(e3, t3, n3, r3, i3) {
      var a3 = _a();
      return a3 = a3 === null ? null : { parent: aa._currentValue, pool: a3 }, t3.memoizedState = { baseLanes: n3,
      cachePool: a3 }, e3 !== null && va(t3, null), $a(), ao(t3), e3 !== null && Xi(e3, t3, r3, true), t3.childLanes =
      i3, null;
    }
    function dc(e3, t3) {
      return t3 = wc({ mode: t3.mode, children: t3.children }, e3.mode), t3.ref = e3.ref, e3.child = t3, t3.return =
      e3, t3;
    }
    function fc(e3, t3, n3) {
      return Ia(t3, e3.child, null, n3), e3 = dc(t3, t3.pendingProps), e3.flags |= 2, so(t3), t3.memoizedState =
      null, e3;
    }
    function pc(e3, t3, n3) {
      var r3 = t3.pendingProps, a3 = !!(t3.flags & 128);
      if (t3.flags &= -129, e3 === null) {
        if (V) {
          if (r3.mode === `hidden`) return e3 = dc(t3, r3), t3.lanes = 536870912, lc(null, e3);
          if (io(t3), (e3 = B) ? (e3 = rf(e3, Pi), e3 = e3 !== null && e3.data === `&` ? e3 : null, e3 !== null &&
          (t3.memoizedState = { dehydrated: e3, treeContext: wi === null ? null : { id: Ti, overflow: Ei }, retryLane: 536870912,
          hydrationErrors: null }, n3 = mi2(e3), n3.return = t3, t3.child = n3, Mi = t3, B = null)) : e3 = null,
          e3 === null) throw Ii(t3);
          return t3.lanes = 536870912, null;
        }
        return dc(t3, r3);
      }
      var o3 = e3.memoizedState;
      if (o3 !== null) {
        var s3 = o3.dehydrated;
        if (io(t3), a3) {
          if (t3.flags & 256) t3.flags &= -257, t3 = fc(e3, t3, n3);
          else if (t3.memoizedState !== null) t3.child = e3.child, t3.flags |= 128, t3 = null;
          else throw Error(i2(558));
        } else if (rc || Xi(e3, t3, n3, false), a3 = (n3 & e3.childLanes) !== 0, rc || a3) {
          if (r3 = q, r3 !== null && (s3 = at2(r3, n3), s3 !== 0 && s3 !== o3.retryLane)) throw o3.retryLane =
          s3, ni2(e3, s3), hu(r3, e3, s3), nc;
          Du(), t3 = fc(e3, t3, n3);
        } else e3 = o3.treeContext, B = cf(s3.nextSibling), Mi = t3, V = true, Ni = null, Pi = false, e3 !== null &&
        ji(t3, e3), t3 = dc(t3, r3), t3.flags |= 4096;
        return t3;
      }
      return e3 = li2(e3.child, { mode: r3.mode, children: r3.children }), e3.ref = t3.ref, t3.child = e3, e3.
      return = t3, e3;
    }
    function mc(e3, t3) {
      var n3 = t3.ref;
      if (n3 === null) e3 !== null && e3.ref !== null && (t3.flags |= 4194816);
      else {
        if (typeof n3 != `function` && typeof n3 != `object`) throw Error(i2(284));
        (e3 === null || e3.ref !== n3) && (t3.flags |= 4194816);
      }
    }
    function hc(e3, t3, n3, r3, i3) {
      return Qi(t3), n3 = So(e3, t3, n3, r3, void 0, i3), r3 = Eo(), e3 !== null && !rc ? (Do(e3, t3, i3), kc(
      e3, t3, i3)) : (V && r3 && ki(t3), t3.flags |= 1, ic(e3, t3, n3, i3), t3.child);
    }
    function gc(e3, t3, n3, r3, i3, a3) {
      return Qi(t3), t3.updateQueue = null, n3 = wo(t3, r3, n3, i3), Co(e3), r3 = Eo(), e3 !== null && !rc ? (Do(
      e3, t3, a3), kc(e3, t3, a3)) : (V && r3 && ki(t3), t3.flags |= 1, ic(e3, t3, n3, a3), t3.child);
    }
    function _c(e3, t3, n3, r3, i3) {
      if (Qi(t3), t3.stateNode === null) {
        var a3 = ai2, o3 = n3.contextType;
        typeof o3 == `object` && o3 && (a3 = $i(o3)), a3 = new n3(r3, a3), t3.memoizedState = a3.state !== null &&
        a3.state !== void 0 ? a3.state : null, a3.updater = Us, t3.stateNode = a3, a3._reactInternals = t3, a3 =
        t3.stateNode, a3.props = r3, a3.state = t3.memoizedState, a3.refs = {}, za(t3), o3 = n3.contextType, a3.
        context = typeof o3 == `object` && o3 ? $i(o3) : ai2, a3.state = t3.memoizedState, o3 = n3.getDerivedStateFromProps,
        typeof o3 == `function` && (Hs(t3, n3, o3, r3), a3.state = t3.memoizedState), typeof n3.getDerivedStateFromProps ==
        `function` || typeof a3.getSnapshotBeforeUpdate == `function` || typeof a3.UNSAFE_componentWillMount !=
        `function` && typeof a3.componentWillMount != `function` || (o3 = a3.state, typeof a3.componentWillMount ==
        `function` && a3.componentWillMount(), typeof a3.UNSAFE_componentWillMount == `function` && a3.UNSAFE_componentWillMount(),
        o3 !== a3.state && Us.enqueueReplaceState(a3, a3.state, null), qa(t3, r3, a3, i3), Ka(), a3.state = t3.
        memoizedState), typeof a3.componentDidMount == `function` && (t3.flags |= 4194308), r3 = true;
      } else if (e3 === null) {
        a3 = t3.stateNode;
        var s3 = t3.memoizedProps, c3 = Ks(n3, s3);
        a3.props = c3;
        var l3 = a3.context, u2 = n3.contextType;
        o3 = ai2, typeof u2 == `object` && u2 && (o3 = $i(u2));
        var d3 = n3.getDerivedStateFromProps;
        u2 = typeof d3 == `function` || typeof a3.getSnapshotBeforeUpdate == `function`, s3 = t3.pendingProps !==
        s3, u2 || typeof a3.UNSAFE_componentWillReceiveProps != `function` && typeof a3.componentWillReceiveProps !=
        `function` || (s3 || l3 !== o3) && Gs(t3, a3, r3, o3), Ra = false;
        var f2 = t3.memoizedState;
        a3.state = f2, qa(t3, r3, a3, i3), Ka(), l3 = t3.memoizedState, s3 || f2 !== l3 || Ra ? (typeof d3 == `\
function` && (Hs(t3, n3, d3, r3), l3 = t3.memoizedState), (c3 = Ra || Ws(t3, n3, c3, r3, f2, l3, o3)) ? (u2 ||
        typeof a3.UNSAFE_componentWillMount != `function` && typeof a3.componentWillMount != `function` || (typeof a3.
        componentWillMount == `function` && a3.componentWillMount(), typeof a3.UNSAFE_componentWillMount == `f\
unction` && a3.UNSAFE_componentWillMount()), typeof a3.componentDidMount == `function` && (t3.flags |= 4194308)) :
        (typeof a3.componentDidMount == `function` && (t3.flags |= 4194308), t3.memoizedProps = r3, t3.memoizedState =
        l3), a3.props = r3, a3.state = l3, a3.context = o3, r3 = c3) : (typeof a3.componentDidMount == `functi\
on` && (t3.flags |= 4194308), r3 = false);
      } else {
        a3 = t3.stateNode, Ba(e3, t3), o3 = t3.memoizedProps, u2 = Ks(n3, o3), a3.props = u2, d3 = t3.pendingProps,
        f2 = a3.context, l3 = n3.contextType, c3 = ai2, typeof l3 == `object` && l3 && (c3 = $i(l3)), s3 = n3.
        getDerivedStateFromProps, (l3 = typeof s3 == `function` || typeof a3.getSnapshotBeforeUpdate == `funct\
ion`) || typeof a3.UNSAFE_componentWillReceiveProps != `function` && typeof a3.componentWillReceiveProps != `f\
unction` || (o3 !== d3 || f2 !== c3) && Gs(t3, a3, r3, c3), Ra = false, f2 = t3.memoizedState, a3.state = f2, qa(
        t3, r3, a3, i3), Ka();
        var p3 = t3.memoizedState;
        o3 !== d3 || f2 !== p3 || Ra || e3 !== null && e3.dependencies !== null && Zi(e3.dependencies) ? (typeof s3 ==
        `function` && (Hs(t3, n3, s3, r3), p3 = t3.memoizedState), (u2 = Ra || Ws(t3, n3, u2, r3, f2, p3, c3) ||
        e3 !== null && e3.dependencies !== null && Zi(e3.dependencies)) ? (l3 || typeof a3.UNSAFE_componentWillUpdate !=
        `function` && typeof a3.componentWillUpdate != `function` || (typeof a3.componentWillUpdate == `functi\
on` && a3.componentWillUpdate(r3, p3, c3), typeof a3.UNSAFE_componentWillUpdate == `function` && a3.UNSAFE_componentWillUpdate(
        r3, p3, c3)), typeof a3.componentDidUpdate == `function` && (t3.flags |= 4), typeof a3.getSnapshotBeforeUpdate ==
        `function` && (t3.flags |= 1024)) : (typeof a3.componentDidUpdate != `function` || o3 === e3.memoizedProps &&
        f2 === e3.memoizedState || (t3.flags |= 4), typeof a3.getSnapshotBeforeUpdate != `function` || o3 === e3.
        memoizedProps && f2 === e3.memoizedState || (t3.flags |= 1024), t3.memoizedProps = r3, t3.memoizedState =
        p3), a3.props = r3, a3.state = p3, a3.context = c3, r3 = u2) : (typeof a3.componentDidUpdate != `funct\
ion` || o3 === e3.memoizedProps && f2 === e3.memoizedState || (t3.flags |= 4), typeof a3.getSnapshotBeforeUpdate !=
        `function` || o3 === e3.memoizedProps && f2 === e3.memoizedState || (t3.flags |= 1024), r3 = false);
      }
      return a3 = r3, mc(e3, t3), r3 = !!(t3.flags & 128), a3 || r3 ? (a3 = t3.stateNode, n3 = r3 && typeof n3.
      getDerivedStateFromError != `function` ? null : a3.render(), t3.flags |= 1, e3 !== null && r3 ? (t3.child =
      Ia(t3, e3.child, null, i3), t3.child = Ia(t3, null, n3, i3)) : ic(e3, t3, n3, i3), t3.memoizedState = a3.
      state, e3 = t3.child) : e3 = kc(e3, t3, i3), e3;
    }
    function vc(e3, t3, n3, r3) {
      return Bi(), t3.flags |= 256, ic(e3, t3, n3, r3), t3.child;
    }
    var yc = { dehydrated: null, treeContext: null, retryLane: 0, hydrationErrors: null };
    function bc(e3) {
      return { baseLanes: e3, cachePool: ya() };
    }
    function xc(e3, t3, n3) {
      return e3 = e3 === null ? 0 : e3.childLanes & ~n3, t3 && (e3 |= Jl), e3;
    }
    function Sc(e3, t3, n3) {
      var r3 = t3.pendingProps, a3 = false, o3 = !!(t3.flags & 128), s3;
      if ((s3 = o3) || (s3 = e3 !== null && e3.memoizedState === null ? false : !!(co.current & 2)), s3 && (a3 =
      true, t3.flags &= -129), s3 = !!(t3.flags & 32), t3.flags &= -33, e3 === null) {
        if (V) {
          if (a3 ? ro(t3) : oo(t3), (e3 = B) ? (e3 = rf(e3, Pi), e3 = e3 !== null && e3.data !== `&` ? e3 : null,
          e3 !== null && (t3.memoizedState = { dehydrated: e3, treeContext: wi === null ? null : { id: Ti, overflow: Ei },
          retryLane: 536870912, hydrationErrors: null }, n3 = mi2(e3), n3.return = t3, t3.child = n3, Mi = t3,
          B = null)) : e3 = null, e3 === null) throw Ii(t3);
          return of(e3) ? t3.lanes = 32 : t3.lanes = 536870912, null;
        }
        var c3 = r3.children;
        return r3 = r3.fallback, a3 ? (oo(t3), a3 = t3.mode, c3 = wc({ mode: `hidden`, children: c3 }, a3), r3 =
        fi2(r3, a3, n3, null), c3.return = t3, r3.return = t3, c3.sibling = r3, t3.child = c3, r3 = t3.child, r3.
        memoizedState = bc(n3), r3.childLanes = xc(e3, s3, n3), t3.memoizedState = yc, lc(null, r3)) : (ro(t3),
        Cc(t3, c3));
      }
      var l3 = e3.memoizedState;
      if (l3 !== null && (c3 = l3.dehydrated, c3 !== null)) {
        if (o3) t3.flags & 256 ? (ro(t3), t3.flags &= -257, t3 = Tc(e3, t3, n3)) : t3.memoizedState === null ?
        (oo(t3), c3 = r3.fallback, a3 = t3.mode, r3 = wc({ mode: `visible`, children: r3.children }, a3), c3 =
        fi2(c3, a3, n3, null), c3.flags |= 2, r3.return = t3, c3.return = t3, r3.sibling = c3, t3.child = r3, Ia(
        t3, e3.child, null, n3), r3 = t3.child, r3.memoizedState = bc(n3), r3.childLanes = xc(e3, s3, n3), t3.
        memoizedState = yc, t3 = lc(null, r3)) : (oo(t3), t3.child = e3.child, t3.flags |= 128, t3 = null);
        else if (ro(t3), of(c3)) {
          if (s3 = c3.nextSibling && c3.nextSibling.dataset, s3) var u2 = s3.dgst;
          s3 = u2, r3 = Error(i2(419)), r3.stack = ``, r3.digest = s3, Hi({ value: r3, source: null, stack: null }),
          t3 = Tc(e3, t3, n3);
        } else if (rc || Xi(e3, t3, n3, false), s3 = (n3 & e3.childLanes) !== 0, rc || s3) {
          if (s3 = q, s3 !== null && (r3 = at2(s3, n3), r3 !== 0 && r3 !== l3.retryLane)) throw l3.retryLane =
          r3, ni2(e3, r3), hu(s3, e3, r3), nc;
          af(c3) || Du(), t3 = Tc(e3, t3, n3);
        } else af(c3) ? (t3.flags |= 192, t3.child = e3.child, t3 = null) : (e3 = l3.treeContext, B = cf(c3.nextSibling),
        Mi = t3, V = true, Ni = null, Pi = false, e3 !== null && ji(t3, e3), t3 = Cc(t3, r3.children), t3.flags |=
        4096);
        return t3;
      }
      return a3 ? (oo(t3), c3 = r3.fallback, a3 = t3.mode, l3 = e3.child, u2 = l3.sibling, r3 = li2(l3, { mode: `\
hidden`, children: r3.children }), r3.subtreeFlags = l3.subtreeFlags & 65011712, u2 === null ? (c3 = fi2(c3, a3,
      n3, null), c3.flags |= 2) : c3 = li2(u2, c3), c3.return = t3, r3.return = t3, r3.sibling = c3, t3.child =
      r3, lc(null, r3), r3 = t3.child, c3 = e3.child.memoizedState, c3 === null ? c3 = bc(n3) : (a3 = c3.cachePool,
      a3 === null ? a3 = ya() : (l3 = aa._currentValue, a3 = a3.parent === l3 ? a3 : { parent: l3, pool: l3 }),
      c3 = { baseLanes: c3.baseLanes | n3, cachePool: a3 }), r3.memoizedState = c3, r3.childLanes = xc(e3, s3,
      n3), t3.memoizedState = yc, lc(e3.child, r3)) : (ro(t3), n3 = e3.child, e3 = n3.sibling, n3 = li2(n3, { mode: `\
visible`, children: r3.children }), n3.return = t3, n3.sibling = null, e3 !== null && (s3 = t3.deletions, s3 ===
      null ? (t3.deletions = [e3], t3.flags |= 16) : s3.push(e3)), t3.child = n3, t3.memoizedState = null, n3);
    }
    function Cc(e3, t3) {
      return t3 = wc({ mode: `visible`, children: t3 }, e3.mode), t3.return = e3, e3.child = t3;
    }
    function wc(e3, t3) {
      return e3 = si2(22, e3, null, t3), e3.lanes = 0, e3;
    }
    function Tc(e3, t3, n3) {
      return Ia(t3, e3.child, null, n3), e3 = Cc(t3, t3.pendingProps.children), e3.flags |= 2, t3.memoizedState =
      null, e3;
    }
    function Ec(e3, t3, n3) {
      e3.lanes |= t3;
      var r3 = e3.alternate;
      r3 !== null && (r3.lanes |= t3), Ji(e3.return, t3, n3);
    }
    function Dc(e3, t3, n3, r3, i3, a3) {
      var o3 = e3.memoizedState;
      o3 === null ? e3.memoizedState = { isBackwards: t3, rendering: null, renderingStartTime: 0, last: r3, tail: n3,
      tailMode: i3, treeForkCount: a3 } : (o3.isBackwards = t3, o3.rendering = null, o3.renderingStartTime = 0,
      o3.last = r3, o3.tail = n3, o3.tailMode = i3, o3.treeForkCount = a3);
    }
    function Oc(e3, t3, n3) {
      var r3 = t3.pendingProps, i3 = r3.revealOrder, a3 = r3.tail;
      r3 = r3.children;
      var o3 = co.current, s3 = !!(o3 & 2);
      if (s3 ? (o3 = o3 & 1 | 2, t3.flags |= 128) : o3 &= 1, A2(co, o3), ic(e3, t3, r3, n3), r3 = V ? xi : 0, !s3 &&
      e3 !== null && e3.flags & 128) a: for (e3 = t3.child; e3 !== null; ) {
        if (e3.tag === 13) e3.memoizedState !== null && Ec(e3, n3, t3);
        else if (e3.tag === 19) Ec(e3, n3, t3);
        else if (e3.child !== null) {
          e3.child.return = e3, e3 = e3.child;
          continue;
        }
        if (e3 === t3) break a;
        for (; e3.sibling === null; ) {
          if (e3.return === null || e3.return === t3) break a;
          e3 = e3.return;
        }
        e3.sibling.return = e3.return, e3 = e3.sibling;
      }
      switch (i3) {
        case `forwards`:
          for (n3 = t3.child, i3 = null; n3 !== null; ) e3 = n3.alternate, e3 !== null && lo(e3) === null && (i3 =
          n3), n3 = n3.sibling;
          n3 = i3, n3 === null ? (i3 = t3.child, t3.child = null) : (i3 = n3.sibling, n3.sibling = null), Dc(t3,
          false, i3, n3, a3, r3);
          break;
        case `backwards`:
        case `unstable_legacy-backwards`:
          for (n3 = null, i3 = t3.child, t3.child = null; i3 !== null; ) {
            if (e3 = i3.alternate, e3 !== null && lo(e3) === null) {
              t3.child = i3;
              break;
            }
            e3 = i3.sibling, i3.sibling = n3, n3 = i3, i3 = e3;
          }
          Dc(t3, true, n3, null, a3, r3);
          break;
        case `together`:
          Dc(t3, false, null, null, void 0, r3);
          break;
        default:
          t3.memoizedState = null;
      }
      return t3.child;
    }
    function kc(e3, t3, n3) {
      if (e3 !== null && (t3.dependencies = e3.dependencies), Gl |= t3.lanes, (n3 & t3.childLanes) === 0) {
        if (e3 !== null) {
          if (Xi(e3, t3, n3, false), (n3 & t3.childLanes) === 0) return null;
        } else return null;
      }
      if (e3 !== null && t3.child !== e3.child) throw Error(i2(153));
      if (t3.child !== null) {
        for (e3 = t3.child, n3 = li2(e3, e3.pendingProps), t3.child = n3, n3.return = t3; e3.sibling !== null; )
         e3 = e3.sibling, n3 = n3.sibling = li2(e3, e3.pendingProps), n3.return = t3;
        n3.sibling = null;
      }
      return t3.child;
    }
    function Ac(e3, t3) {
      return (e3.lanes & t3) !== 0 || (e3 = e3.dependencies, !!(e3 !== null && Zi(e3)));
    }
    function jc(e3, t3, n3) {
      switch (t3.tag) {
        case 3:
          ge2(t3, t3.stateNode.containerInfo), Ki(t3, aa, e3.memoizedState.cache), Bi();
          break;
        case 27:
        case 5:
          ve2(t3);
          break;
        case 4:
          ge2(t3, t3.stateNode.containerInfo);
          break;
        case 10:
          Ki(t3, t3.type, t3.memoizedProps.value);
          break;
        case 31:
          if (t3.memoizedState !== null) return t3.flags |= 128, io(t3), null;
          break;
        case 13:
          var r3 = t3.memoizedState;
          if (r3 !== null) return r3.dehydrated === null ? (n3 & t3.child.childLanes) === 0 ? (ro(t3), e3 = kc(
          e3, t3, n3), e3 === null ? null : e3.sibling) : Sc(e3, t3, n3) : (ro(t3), t3.flags |= 128, null);
          ro(t3);
          break;
        case 19:
          var i3 = !!(e3.flags & 128);
          if (r3 = (n3 & t3.childLanes) !== 0, r3 ||= (Xi(e3, t3, n3, false), (n3 & t3.childLanes) !== 0), i3) {
            if (r3) return Oc(e3, t3, n3);
            t3.flags |= 128;
          }
          if (i3 = t3.memoizedState, i3 !== null && (i3.rendering = null, i3.tail = null, i3.lastEffect = null),
          A2(co, co.current), r3) break;
          return null;
        case 22:
          return t3.lanes = 0, cc(e3, t3, n3, t3.pendingProps);
        case 24:
          Ki(t3, aa, e3.memoizedState.cache);
      }
      return kc(e3, t3, n3);
    }
    function Mc(e3, t3, n3) {
      if (e3 !== null) {
        if (e3.memoizedProps !== t3.pendingProps) rc = true;
        else {
          if (!Ac(e3, n3) && !(t3.flags & 128)) return rc = false, jc(e3, t3, n3);
          rc = !!(e3.flags & 131072);
        }
      } else rc = false, V && t3.flags & 1048576 && Oi(t3, xi, t3.index);
      switch (t3.lanes = 0, t3.tag) {
        case 16:
          a: {
            var r3 = t3.pendingProps;
            if (e3 = Ea(t3.elementType), t3.type = e3, typeof e3 == `function`) ci2(e3) ? (r3 = Ks(e3, r3), t3.
            tag = 1, t3 = _c(null, t3, e3, r3, n3)) : (t3.tag = 0, t3 = hc(null, t3, e3, r3, n3));
            else {
              if (e3 != null) {
                var a3 = e3.$$typeof;
                if (a3 === C2) {
                  t3.tag = 11, t3 = ac(null, t3, e3, r3, n3);
                  break a;
                }
                if (a3 === ne2) {
                  t3.tag = 14, t3 = oc(null, t3, e3, r3, n3);
                  break a;
                }
              }
              throw t3 = ce2(e3) || e3, Error(i2(306, t3, ``));
            }
          }
          return t3;
        case 0:
          return hc(e3, t3, t3.type, t3.pendingProps, n3);
        case 1:
          return r3 = t3.type, a3 = Ks(r3, t3.pendingProps), _c(e3, t3, r3, a3, n3);
        case 3:
          a: {
            if (ge2(t3, t3.stateNode.containerInfo), e3 === null) throw Error(i2(387));
            r3 = t3.pendingProps;
            var o3 = t3.memoizedState;
            a3 = o3.element, Ba(e3, t3), qa(t3, r3, null, n3);
            var s3 = t3.memoizedState;
            if (r3 = s3.cache, Ki(t3, aa, r3), r3 !== o3.cache && Yi(t3, [aa], n3, true), Ka(), r3 = s3.element,
            o3.isDehydrated) {
              if (o3 = { element: r3, isDehydrated: false, cache: s3.cache }, t3.updateQueue.baseState = o3, t3.
              memoizedState = o3, t3.flags & 256) {
                t3 = vc(e3, t3, r3, n3);
                break a;
              }
              if (r3 !== a3) {
                a3 = _i(Error(i2(424)), t3), Hi(a3), t3 = vc(e3, t3, r3, n3);
                break a;
              }
              switch (e3 = t3.stateNode.containerInfo, e3.nodeType) {
                case 9:
                  e3 = e3.body;
                  break;
                default:
                  e3 = e3.nodeName === `HTML` ? e3.ownerDocument.body : e3;
              }
              for (B = cf(e3.firstChild), Mi = t3, V = true, Ni = null, Pi = true, n3 = La(t3, null, r3, n3), t3.
              child = n3; n3; ) n3.flags = n3.flags & -3 | 4096, n3 = n3.sibling;
            } else {
              if (Bi(), r3 === a3) {
                t3 = kc(e3, t3, n3);
                break a;
              }
              ic(e3, t3, r3, n3);
            }
            t3 = t3.child;
          }
          return t3;
        case 26:
          return mc(e3, t3), e3 === null ? (n3 = kf(t3.type, null, t3.pendingProps, null)) ? t3.memoizedState =
          n3 : V || (n3 = t3.type, e3 = t3.pendingProps, r3 = Bd(me2.current).createElement(n3), r3[dt2] = t3,
          r3[ft2] = e3, Pd(r3, n3, e3), St2(r3), t3.stateNode = r3) : t3.memoizedState = kf(t3.type, e3.memoizedProps,
          t3.pendingProps, e3.memoizedState), null;
        case 27:
          return ve2(t3), e3 === null && V && (r3 = t3.stateNode = ff(t3.type, t3.pendingProps, me2.current), Mi =
          t3, Pi = true, a3 = B, Zd(t3.type) ? (lf = a3, B = cf(r3.firstChild)) : B = a3), ic(e3, t3, t3.pendingProps.
          children, n3), mc(e3, t3), e3 === null && (t3.flags |= 4194304), t3.child;
        case 5:
          return e3 === null && V && ((a3 = r3 = B) && (r3 = tf(r3, t3.type, t3.pendingProps, Pi), r3 === null ?
          a3 = false : (t3.stateNode = r3, Mi = t3, B = cf(r3.firstChild), Pi = false, a3 = true)), a3 || Ii(t3)),
          ve2(t3), a3 = t3.type, o3 = t3.pendingProps, s3 = e3 === null ? null : e3.memoizedProps, r3 = o3.children,
          Ud(a3, o3) ? r3 = null : s3 !== null && Ud(a3, s3) && (t3.flags |= 32), t3.memoizedState !== null &&
          (a3 = So(e3, t3, To, null, null, n3), Qf._currentValue = a3), mc(e3, t3), ic(e3, t3, r3, n3), t3.child;
        case 6:
          return e3 === null && V && ((e3 = n3 = B) && (n3 = nf(n3, t3.pendingProps, Pi), n3 === null ? e3 = false :
          (t3.stateNode = n3, Mi = t3, B = null, e3 = true)), e3 || Ii(t3)), null;
        case 13:
          return Sc(e3, t3, n3);
        case 4:
          return ge2(t3, t3.stateNode.containerInfo), r3 = t3.pendingProps, e3 === null ? t3.child = Ia(t3, null,
          r3, n3) : ic(e3, t3, r3, n3), t3.child;
        case 11:
          return ac(e3, t3, t3.type, t3.pendingProps, n3);
        case 7:
          return ic(e3, t3, t3.pendingProps, n3), t3.child;
        case 8:
          return ic(e3, t3, t3.pendingProps.children, n3), t3.child;
        case 12:
          return ic(e3, t3, t3.pendingProps.children, n3), t3.child;
        case 10:
          return r3 = t3.pendingProps, Ki(t3, t3.type, r3.value), ic(e3, t3, r3.children, n3), t3.child;
        case 9:
          return a3 = t3.type._context, r3 = t3.pendingProps.children, Qi(t3), a3 = $i(a3), r3 = r3(a3), t3.flags |=
          1, ic(e3, t3, r3, n3), t3.child;
        case 14:
          return oc(e3, t3, t3.type, t3.pendingProps, n3);
        case 15:
          return sc(e3, t3, t3.type, t3.pendingProps, n3);
        case 19:
          return Oc(e3, t3, n3);
        case 31:
          return pc(e3, t3, n3);
        case 22:
          return cc(e3, t3, n3, t3.pendingProps);
        case 24:
          return Qi(t3), r3 = $i(aa), e3 === null ? (a3 = _a(), a3 === null && (a3 = q, o3 = oa(), a3.pooledCache =
          o3, o3.refCount++, o3 !== null && (a3.pooledCacheLanes |= n3), a3 = o3), t3.memoizedState = { parent: r3,
          cache: a3 }, za(t3), Ki(t3, aa, a3)) : ((e3.lanes & n3) !== 0 && (Ba(e3, t3), qa(t3, null, null, n3),
          Ka()), a3 = e3.memoizedState, o3 = t3.memoizedState, a3.parent === r3 ? (r3 = o3.cache, Ki(t3, aa, r3),
          r3 !== a3.cache && Yi(t3, [aa], n3, true)) : (a3 = { parent: r3, cache: r3 }, t3.memoizedState = a3,
          t3.lanes === 0 && (t3.memoizedState = t3.updateQueue.baseState = a3), Ki(t3, aa, r3))), ic(e3, t3, t3.
          pendingProps.children, n3), t3.child;
        case 29:
          throw t3.pendingProps;
      }
      throw Error(i2(156, t3.tag));
    }
    function Nc(e3) {
      e3.flags |= 4;
    }
    function Pc(e3, t3, n3, r3, i3) {
      if ((t3 = !!(e3.mode & 32)) && (t3 = false), t3) {
        if (e3.flags |= 16777216, (i3 & 335544128) === i3) {
          if (e3.stateNode.complete) e3.flags |= 8192;
          else if (wu()) e3.flags |= 8192;
          else throw Da = Ca, xa;
        }
      } else e3.flags &= -16777217;
    }
    function Fc(e3, t3) {
      if (t3.type !== `stylesheet` || t3.state.loading & 4) e3.flags &= -16777217;
      else if (e3.flags |= 16777216, !Wf(t3)) {
        if (wu()) e3.flags |= 8192;
        else throw Da = Ca, xa;
      }
    }
    function Ic(e3, t3) {
      t3 !== null && (e3.flags |= 4), e3.flags & 16384 && (t3 = e3.tag === 22 ? 536870912 : et2(), e3.lanes |=
      t3, Yl |= t3);
    }
    function Lc(e3, t3) {
      if (!V) switch (e3.tailMode) {
        case `hidden`:
          t3 = e3.tail;
          for (var n3 = null; t3 !== null; ) t3.alternate !== null && (n3 = t3), t3 = t3.sibling;
          n3 === null ? e3.tail = null : n3.sibling = null;
          break;
        case `collapsed`:
          n3 = e3.tail;
          for (var r3 = null; n3 !== null; ) n3.alternate !== null && (r3 = n3), n3 = n3.sibling;
          r3 === null ? t3 || e3.tail === null ? e3.tail = null : e3.tail.sibling = null : r3.sibling = null;
      }
    }
    function W(e3) {
      var t3 = e3.alternate !== null && e3.alternate.child === e3.child, n3 = 0, r3 = 0;
      if (t3) for (var i3 = e3.child; i3 !== null; ) n3 |= i3.lanes | i3.childLanes, r3 |= i3.subtreeFlags & 65011712,
      r3 |= i3.flags & 65011712, i3.return = e3, i3 = i3.sibling;
      else for (i3 = e3.child; i3 !== null; ) n3 |= i3.lanes | i3.childLanes, r3 |= i3.subtreeFlags, r3 |= i3.
      flags, i3.return = e3, i3 = i3.sibling;
      return e3.subtreeFlags |= r3, e3.childLanes = n3, t3;
    }
    function Rc(e3, t3, n3) {
      var r3 = t3.pendingProps;
      switch (Ai(t3), t3.tag) {
        case 16:
        case 15:
        case 0:
        case 11:
        case 7:
        case 8:
        case 12:
        case 9:
        case 14:
          return W(t3), null;
        case 1:
          return W(t3), null;
        case 3:
          return n3 = t3.stateNode, r3 = null, e3 !== null && (r3 = e3.memoizedState.cache), t3.memoizedState.
          cache !== r3 && (t3.flags |= 2048), qi(aa), _e2(), n3.pendingContext && (n3.context = n3.pendingContext,
          n3.pendingContext = null), (e3 === null || e3.child === null) && (zi(t3) ? Nc(t3) : e3 === null || e3.
          memoizedState.isDehydrated && !(t3.flags & 256) || (t3.flags |= 1024, Vi())), W(t3), null;
        case 26:
          var a3 = t3.type, o3 = t3.memoizedState;
          return e3 === null ? (Nc(t3), o3 === null ? (W(t3), Pc(t3, a3, null, r3, n3)) : (W(t3), Fc(t3, o3))) :
          o3 ? o3 === e3.memoizedState ? (W(t3), t3.flags &= -16777217) : (Nc(t3), W(t3), Fc(t3, o3)) : (e3 = e3.
          memoizedProps, e3 !== r3 && Nc(t3), W(t3), Pc(t3, a3, e3, r3, n3)), null;
        case 27:
          if (ye2(t3), n3 = me2.current, a3 = t3.type, e3 !== null && t3.stateNode != null) e3.memoizedProps !==
          r3 && Nc(t3);
          else {
            if (!r3) {
              if (t3.stateNode === null) throw Error(i2(166));
              return W(t3), null;
            }
            e3 = pe2.current, zi(t3) ? Li(t3, e3) : (e3 = ff(a3, r3, n3), t3.stateNode = e3, Nc(t3));
          }
          return W(t3), null;
        case 5:
          if (ye2(t3), a3 = t3.type, e3 !== null && t3.stateNode != null) e3.memoizedProps !== r3 && Nc(t3);
          else {
            if (!r3) {
              if (t3.stateNode === null) throw Error(i2(166));
              return W(t3), null;
            }
            if (o3 = pe2.current, zi(t3)) Li(t3, o3);
            else {
              var s3 = Bd(me2.current);
              switch (o3) {
                case 1:
                  o3 = s3.createElementNS(`http://www.w3.org/2000/svg`, a3);
                  break;
                case 2:
                  o3 = s3.createElementNS(`http://www.w3.org/1998/Math/MathML`, a3);
                  break;
                default:
                  switch (a3) {
                    case `svg`:
                      o3 = s3.createElementNS(`http://www.w3.org/2000/svg`, a3);
                      break;
                    case `math`:
                      o3 = s3.createElementNS(`http://www.w3.org/1998/Math/MathML`, a3);
                      break;
                    case `script`:
                      o3 = s3.createElement(`div`), o3.innerHTML = `<script><\/script>`, o3 = o3.removeChild(o3.
                      firstChild);
                      break;
                    case `select`:
                      o3 = typeof r3.is == `string` ? s3.createElement(`select`, { is: r3.is }) : s3.createElement(
                      `select`), r3.multiple ? o3.multiple = true : r3.size && (o3.size = r3.size);
                      break;
                    default:
                      o3 = typeof r3.is == `string` ? s3.createElement(a3, { is: r3.is }) : s3.createElement(a3);
                  }
              }
              o3[dt2] = t3, o3[ft2] = r3;
              a: for (s3 = t3.child; s3 !== null; ) {
                if (s3.tag === 5 || s3.tag === 6) o3.appendChild(s3.stateNode);
                else if (s3.tag !== 4 && s3.tag !== 27 && s3.child !== null) {
                  s3.child.return = s3, s3 = s3.child;
                  continue;
                }
                if (s3 === t3) break a;
                for (; s3.sibling === null; ) {
                  if (s3.return === null || s3.return === t3) break a;
                  s3 = s3.return;
                }
                s3.sibling.return = s3.return, s3 = s3.sibling;
              }
              t3.stateNode = o3;
              a: switch (Pd(o3, a3, r3), a3) {
                case `button`:
                case `input`:
                case `select`:
                case `textarea`:
                  r3 = !!r3.autoFocus;
                  break a;
                case `img`:
                  r3 = true;
                  break a;
                default:
                  r3 = false;
              }
              r3 && Nc(t3);
            }
          }
          return W(t3), Pc(t3, t3.type, e3 === null ? null : e3.memoizedProps, t3.pendingProps, n3), null;
        case 6:
          if (e3 && t3.stateNode != null) e3.memoizedProps !== r3 && Nc(t3);
          else {
            if (typeof r3 != `string` && t3.stateNode === null) throw Error(i2(166));
            if (e3 = me2.current, zi(t3)) {
              if (e3 = t3.stateNode, n3 = t3.memoizedProps, r3 = null, a3 = Mi, a3 !== null) switch (a3.tag) {
                case 27:
                case 5:
                  r3 = a3.memoizedProps;
              }
              e3[dt2] = t3, e3 = !!(e3.nodeValue === n3 || r3 !== null && true === r3.suppressHydrationWarning ||
              Md(e3.nodeValue, n3)), e3 || Ii(t3, true);
            } else e3 = Bd(e3).createTextNode(r3), e3[dt2] = t3, t3.stateNode = e3;
          }
          return W(t3), null;
        case 31:
          if (n3 = t3.memoizedState, e3 === null || e3.memoizedState !== null) {
            if (r3 = zi(t3), n3 !== null) {
              if (e3 === null) {
                if (!r3) throw Error(i2(318));
                if (e3 = t3.memoizedState, e3 = e3 === null ? null : e3.dehydrated, !e3) throw Error(i2(557));
                e3[dt2] = t3;
              } else Bi(), !(t3.flags & 128) && (t3.memoizedState = null), t3.flags |= 4;
              W(t3), e3 = false;
            } else n3 = Vi(), e3 !== null && e3.memoizedState !== null && (e3.memoizedState.hydrationErrors = n3),
            e3 = true;
            if (!e3) return t3.flags & 256 ? (so(t3), t3) : (so(t3), null);
            if (t3.flags & 128) throw Error(i2(558));
          }
          return W(t3), null;
        case 13:
          if (r3 = t3.memoizedState, e3 === null || e3.memoizedState !== null && e3.memoizedState.dehydrated !==
          null) {
            if (a3 = zi(t3), r3 !== null && r3.dehydrated !== null) {
              if (e3 === null) {
                if (!a3) throw Error(i2(318));
                if (a3 = t3.memoizedState, a3 = a3 === null ? null : a3.dehydrated, !a3) throw Error(i2(317));
                a3[dt2] = t3;
              } else Bi(), !(t3.flags & 128) && (t3.memoizedState = null), t3.flags |= 4;
              W(t3), a3 = false;
            } else a3 = Vi(), e3 !== null && e3.memoizedState !== null && (e3.memoizedState.hydrationErrors = a3),
            a3 = true;
            if (!a3) return t3.flags & 256 ? (so(t3), t3) : (so(t3), null);
          }
          return so(t3), t3.flags & 128 ? (t3.lanes = n3, t3) : (n3 = r3 !== null, e3 = e3 !== null && e3.memoizedState !==
          null, n3 && (r3 = t3.child, a3 = null, r3.alternate !== null && r3.alternate.memoizedState !== null &&
          r3.alternate.memoizedState.cachePool !== null && (a3 = r3.alternate.memoizedState.cachePool.pool), o3 =
          null, r3.memoizedState !== null && r3.memoizedState.cachePool !== null && (o3 = r3.memoizedState.cachePool.
          pool), o3 !== a3 && (r3.flags |= 2048)), n3 !== e3 && n3 && (t3.child.flags |= 8192), Ic(t3, t3.updateQueue),
          W(t3), null);
        case 4:
          return _e2(), e3 === null && Sd(t3.stateNode.containerInfo), W(t3), null;
        case 10:
          return qi(t3.type), W(t3), null;
        case 19:
          if (k2(co), r3 = t3.memoizedState, r3 === null) return W(t3), null;
          if (a3 = !!(t3.flags & 128), o3 = r3.rendering, o3 === null) {
            if (a3) Lc(r3, false);
            else {
              if (Wl !== 0 || e3 !== null && e3.flags & 128) for (e3 = t3.child; e3 !== null; ) {
                if (o3 = lo(e3), o3 !== null) {
                  for (t3.flags |= 128, Lc(r3, false), e3 = o3.updateQueue, t3.updateQueue = e3, Ic(t3, e3), t3.
                  subtreeFlags = 0, e3 = n3, n3 = t3.child; n3 !== null; ) ui2(n3, e3), n3 = n3.sibling;
                  return A2(co, co.current & 1 | 2), V && Di(t3, r3.treeForkCount), t3.child;
                }
                e3 = e3.sibling;
              }
              r3.tail !== null && Me2() > tu && (t3.flags |= 128, a3 = true, Lc(r3, false), t3.lanes = 4194304);
            }
          } else {
            if (!a3) {
              if (e3 = lo(o3), e3 !== null) {
                if (t3.flags |= 128, a3 = true, e3 = e3.updateQueue, t3.updateQueue = e3, Ic(t3, e3), Lc(r3, true),
                r3.tail === null && r3.tailMode === `hidden` && !o3.alternate && !V) return W(t3), null;
              } else 2 * Me2() - r3.renderingStartTime > tu && n3 !== 536870912 && (t3.flags |= 128, a3 = true,
              Lc(r3, false), t3.lanes = 4194304);
            }
            r3.isBackwards ? (o3.sibling = t3.child, t3.child = o3) : (e3 = r3.last, e3 === null ? t3.child = o3 :
            e3.sibling = o3, r3.last = o3);
          }
          return r3.tail === null ? (W(t3), null) : (e3 = r3.tail, r3.rendering = e3, r3.tail = e3.sibling, r3.
          renderingStartTime = Me2(), e3.sibling = null, n3 = co.current, A2(co, a3 ? n3 & 1 | 2 : n3 & 1), V &&
          Di(t3, r3.treeForkCount), e3);
        case 22:
        case 23:
          return so(t3), eo(), r3 = t3.memoizedState !== null, e3 === null ? r3 && (t3.flags |= 8192) : e3.memoizedState !==
          null !== r3 && (t3.flags |= 8192), r3 ? n3 & 536870912 && !(t3.flags & 128) && (W(t3), t3.subtreeFlags &
          6 && (t3.flags |= 8192)) : W(t3), n3 = t3.updateQueue, n3 !== null && Ic(t3, n3.retryQueue), n3 = null,
          e3 !== null && e3.memoizedState !== null && e3.memoizedState.cachePool !== null && (n3 = e3.memoizedState.
          cachePool.pool), r3 = null, t3.memoizedState !== null && t3.memoizedState.cachePool !== null && (r3 =
          t3.memoizedState.cachePool.pool), r3 !== n3 && (t3.flags |= 2048), e3 !== null && k2(ga), null;
        case 24:
          return n3 = null, e3 !== null && (n3 = e3.memoizedState.cache), t3.memoizedState.cache !== n3 && (t3.
          flags |= 2048), qi(aa), W(t3), null;
        case 25:
          return null;
        case 30:
          return null;
      }
      throw Error(i2(156, t3.tag));
    }
    function zc(e3, t3) {
      switch (Ai(t3), t3.tag) {
        case 1:
          return e3 = t3.flags, e3 & 65536 ? (t3.flags = e3 & -65537 | 128, t3) : null;
        case 3:
          return qi(aa), _e2(), e3 = t3.flags, e3 & 65536 && !(e3 & 128) ? (t3.flags = e3 & -65537 | 128, t3) :
          null;
        case 26:
        case 27:
        case 5:
          return ye2(t3), null;
        case 31:
          if (t3.memoizedState !== null) {
            if (so(t3), t3.alternate === null) throw Error(i2(340));
            Bi();
          }
          return e3 = t3.flags, e3 & 65536 ? (t3.flags = e3 & -65537 | 128, t3) : null;
        case 13:
          if (so(t3), e3 = t3.memoizedState, e3 !== null && e3.dehydrated !== null) {
            if (t3.alternate === null) throw Error(i2(340));
            Bi();
          }
          return e3 = t3.flags, e3 & 65536 ? (t3.flags = e3 & -65537 | 128, t3) : null;
        case 19:
          return k2(co), null;
        case 4:
          return _e2(), null;
        case 10:
          return qi(t3.type), null;
        case 22:
        case 23:
          return so(t3), eo(), e3 !== null && k2(ga), e3 = t3.flags, e3 & 65536 ? (t3.flags = e3 & -65537 | 128,
          t3) : null;
        case 24:
          return qi(aa), null;
        case 25:
          return null;
        default:
          return null;
      }
    }
    function Bc(e3, t3) {
      switch (Ai(t3), t3.tag) {
        case 3:
          qi(aa), _e2();
          break;
        case 26:
        case 27:
        case 5:
          ye2(t3);
          break;
        case 4:
          _e2();
          break;
        case 31:
          t3.memoizedState !== null && so(t3);
          break;
        case 13:
          so(t3);
          break;
        case 19:
          k2(co);
          break;
        case 10:
          qi(t3.type);
          break;
        case 22:
        case 23:
          so(t3), eo(), e3 !== null && k2(ga);
          break;
        case 24:
          qi(aa);
      }
    }
    function Vc(e3, t3) {
      try {
        var n3 = t3.updateQueue, r3 = n3 === null ? null : n3.lastEffect;
        if (r3 !== null) {
          var i3 = r3.next;
          n3 = i3;
          do {
            if ((n3.tag & e3) === e3) {
              r3 = void 0;
              var a3 = n3.create, o3 = n3.inst;
              r3 = a3(), o3.destroy = r3;
            }
            n3 = n3.next;
          } while (n3 !== i3);
        }
      } catch (e4) {
        Z(t3, t3.return, e4);
      }
    }
    function Hc(e3, t3, n3) {
      try {
        var r3 = t3.updateQueue, i3 = r3 === null ? null : r3.lastEffect;
        if (i3 !== null) {
          var a3 = i3.next;
          r3 = a3;
          do {
            if ((r3.tag & e3) === e3) {
              var o3 = r3.inst, s3 = o3.destroy;
              if (s3 !== void 0) {
                o3.destroy = void 0, i3 = t3;
                var c3 = n3, l3 = s3;
                try {
                  l3();
                } catch (e4) {
                  Z(i3, c3, e4);
                }
              }
            }
            r3 = r3.next;
          } while (r3 !== a3);
        }
      } catch (e4) {
        Z(t3, t3.return, e4);
      }
    }
    function Uc(e3) {
      var t3 = e3.updateQueue;
      if (t3 !== null) {
        var n3 = e3.stateNode;
        try {
          Ya(t3, n3);
        } catch (t4) {
          Z(e3, e3.return, t4);
        }
      }
    }
    function Wc(e3, t3, n3) {
      n3.props = Ks(e3.type, e3.memoizedProps), n3.state = e3.memoizedState;
      try {
        n3.componentWillUnmount();
      } catch (n4) {
        Z(e3, t3, n4);
      }
    }
    function Gc(e3, t3) {
      try {
        var n3 = e3.ref;
        if (n3 !== null) {
          switch (e3.tag) {
            case 26:
            case 27:
            case 5:
              var r3 = e3.stateNode;
              break;
            case 30:
              r3 = e3.stateNode;
              break;
            default:
              r3 = e3.stateNode;
          }
          typeof n3 == `function` ? e3.refCleanup = n3(r3) : n3.current = r3;
        }
      } catch (n4) {
        Z(e3, t3, n4);
      }
    }
    function Kc(e3, t3) {
      var n3 = e3.ref, r3 = e3.refCleanup;
      if (n3 !== null) {
        if (typeof r3 == `function`) try {
          r3();
        } catch (n4) {
          Z(e3, t3, n4);
        } finally {
          e3.refCleanup = null, e3 = e3.alternate, e3 != null && (e3.refCleanup = null);
        }
        else if (typeof n3 == `function`) try {
          n3(null);
        } catch (n4) {
          Z(e3, t3, n4);
        }
        else n3.current = null;
      }
    }
    function qc(e3) {
      var t3 = e3.type, n3 = e3.memoizedProps, r3 = e3.stateNode;
      try {
        a: switch (t3) {
          case `button`:
          case `input`:
          case `select`:
          case `textarea`:
            n3.autoFocus && r3.focus();
            break a;
          case `img`:
            n3.src ? r3.src = n3.src : n3.srcSet && (r3.srcset = n3.srcSet);
        }
      } catch (t4) {
        Z(e3, e3.return, t4);
      }
    }
    function Jc(e3, t3, n3) {
      try {
        var r3 = e3.stateNode;
        Fd(r3, e3.type, n3, t3), r3[ft2] = t3;
      } catch (t4) {
        Z(e3, e3.return, t4);
      }
    }
    function Yc(e3) {
      return e3.tag === 5 || e3.tag === 3 || e3.tag === 26 || e3.tag === 27 && Zd(e3.type) || e3.tag === 4;
    }
    function Xc(e3) {
      a: for (; ; ) {
        for (; e3.sibling === null; ) {
          if (e3.return === null || Yc(e3.return)) return null;
          e3 = e3.return;
        }
        for (e3.sibling.return = e3.return, e3 = e3.sibling; e3.tag !== 5 && e3.tag !== 6 && e3.tag !== 18; ) {
          if (e3.tag === 27 && Zd(e3.type) || e3.flags & 2 || e3.child === null || e3.tag === 4) continue a;
          e3.child.return = e3, e3 = e3.child;
        }
        if (!(e3.flags & 2)) return e3.stateNode;
      }
    }
    function Zc(e3, t3, n3) {
      var r3 = e3.tag;
      if (r3 === 5 || r3 === 6) e3 = e3.stateNode, t3 ? (n3.nodeType === 9 ? n3.body : n3.nodeName === `HTML` ?
      n3.ownerDocument.body : n3).insertBefore(e3, t3) : (t3 = n3.nodeType === 9 ? n3.body : n3.nodeName === `\
HTML` ? n3.ownerDocument.body : n3, t3.appendChild(e3), n3 = n3._reactRootContainer, n3 != null || t3.onclick !==
      null || (t3.onclick = tn2));
      else if (r3 !== 4 && (r3 === 27 && Zd(e3.type) && (n3 = e3.stateNode, t3 = null), e3 = e3.child, e3 !== null))
       for (Zc(e3, t3, n3), e3 = e3.sibling; e3 !== null; ) Zc(e3, t3, n3), e3 = e3.sibling;
    }
    function Qc(e3, t3, n3) {
      var r3 = e3.tag;
      if (r3 === 5 || r3 === 6) e3 = e3.stateNode, t3 ? n3.insertBefore(e3, t3) : n3.appendChild(e3);
      else if (r3 !== 4 && (r3 === 27 && Zd(e3.type) && (n3 = e3.stateNode), e3 = e3.child, e3 !== null)) for (Qc(
      e3, t3, n3), e3 = e3.sibling; e3 !== null; ) Qc(e3, t3, n3), e3 = e3.sibling;
    }
    function $c(e3) {
      var t3 = e3.stateNode, n3 = e3.memoizedProps;
      try {
        for (var r3 = e3.type, i3 = t3.attributes; i3.length; ) t3.removeAttributeNode(i3[0]);
        Pd(t3, r3, n3), t3[dt2] = e3, t3[ft2] = n3;
      } catch (t4) {
        Z(e3, e3.return, t4);
      }
    }
    var el = false, tl = false, nl = false, rl = typeof WeakSet == `function` ? WeakSet : Set, il = null;
    function al(e3, t3) {
      if (e3 = e3.containerInfo, Rd = sp, e3 = Er2(e3), Dr2(e3)) {
        if (`selectionStart` in e3) var n3 = { start: e3.selectionStart, end: e3.selectionEnd };
        else a: {
          n3 = (n3 = e3.ownerDocument) && n3.defaultView || window;
          var r3 = n3.getSelection && n3.getSelection();
          if (r3 && r3.rangeCount !== 0) {
            n3 = r3.anchorNode;
            var a3 = r3.anchorOffset, o3 = r3.focusNode;
            r3 = r3.focusOffset;
            try {
              n3.nodeType, o3.nodeType;
            } catch {
              n3 = null;
              break a;
            }
            var s3 = 0, c3 = -1, l3 = -1, u2 = 0, d3 = 0, f2 = e3, p3 = null;
            b: for (; ; ) {
              for (var m2; f2 !== n3 || a3 !== 0 && f2.nodeType !== 3 || (c3 = s3 + a3), f2 !== o3 || r3 !== 0 &&
              f2.nodeType !== 3 || (l3 = s3 + r3), f2.nodeType === 3 && (s3 += f2.nodeValue.length), (m2 = f2.
              firstChild) !== null; ) p3 = f2, f2 = m2;
              for (; ; ) {
                if (f2 === e3) break b;
                if (p3 === n3 && ++u2 === a3 && (c3 = s3), p3 === o3 && ++d3 === r3 && (l3 = s3), (m2 = f2.nextSibling) !==
                null) break;
                f2 = p3, p3 = f2.parentNode;
              }
              f2 = m2;
            }
            n3 = c3 === -1 || l3 === -1 ? null : { start: c3, end: l3 };
          } else n3 = null;
        }
        n3 ||= { start: 0, end: 0 };
      } else n3 = null;
      for (zd = { focusedElem: e3, selectionRange: n3 }, sp = false, il = t3; il !== null; ) if (t3 = il, e3 =
      t3.child, t3.subtreeFlags & 1028 && e3 !== null) e3.return = t3, il = e3;
      else for (; il !== null; ) {
        switch (t3 = il, o3 = t3.alternate, e3 = t3.flags, t3.tag) {
          case 0:
            if (e3 & 4 && (e3 = t3.updateQueue, e3 = e3 === null ? null : e3.events, e3 !== null)) for (n3 = 0; n3 <
            e3.length; n3++) a3 = e3[n3], a3.ref.impl = a3.nextImpl;
            break;
          case 11:
          case 15:
            break;
          case 1:
            if (e3 & 1024 && o3 !== null) {
              e3 = void 0, n3 = t3, a3 = o3.memoizedProps, o3 = o3.memoizedState, r3 = n3.stateNode;
              try {
                var h3 = Ks(n3.type, a3);
                e3 = r3.getSnapshotBeforeUpdate(h3, o3), r3.__reactInternalSnapshotBeforeUpdate = e3;
              } catch (e4) {
                Z(n3, n3.return, e4);
              }
            }
            break;
          case 3:
            if (e3 & 1024) {
              if (e3 = t3.stateNode.containerInfo, n3 = e3.nodeType, n3 === 9) ef(e3);
              else if (n3 === 1) switch (e3.nodeName) {
                case `HEAD`:
                case `HTML`:
                case `BODY`:
                  ef(e3);
                  break;
                default:
                  e3.textContent = ``;
              }
            }
            break;
          case 5:
          case 26:
          case 27:
          case 6:
          case 4:
          case 17:
            break;
          default:
            if (e3 & 1024) throw Error(i2(163));
        }
        if (e3 = t3.sibling, e3 !== null) {
          e3.return = t3.return, il = e3;
          break;
        }
        il = t3.return;
      }
    }
    function ol(e3, t3, n3) {
      var r3 = n3.flags;
      switch (n3.tag) {
        case 0:
        case 11:
        case 15:
          bl(e3, n3), r3 & 4 && Vc(5, n3);
          break;
        case 1:
          if (bl(e3, n3), r3 & 4) {
            if (e3 = n3.stateNode, t3 === null) try {
              e3.componentDidMount();
            } catch (e4) {
              Z(n3, n3.return, e4);
            }
            else {
              var i3 = Ks(n3.type, t3.memoizedProps);
              t3 = t3.memoizedState;
              try {
                e3.componentDidUpdate(i3, t3, e3.__reactInternalSnapshotBeforeUpdate);
              } catch (e4) {
                Z(n3, n3.return, e4);
              }
            }
          }
          r3 & 64 && Uc(n3), r3 & 512 && Gc(n3, n3.return);
          break;
        case 3:
          if (bl(e3, n3), r3 & 64 && (e3 = n3.updateQueue, e3 !== null)) {
            if (t3 = null, n3.child !== null) switch (n3.child.tag) {
              case 27:
              case 5:
                t3 = n3.child.stateNode;
                break;
              case 1:
                t3 = n3.child.stateNode;
            }
            try {
              Ya(e3, t3);
            } catch (e4) {
              Z(n3, n3.return, e4);
            }
          }
          break;
        case 27:
          t3 === null && r3 & 4 && $c(n3);
        case 26:
        case 5:
          bl(e3, n3), t3 === null && r3 & 4 && qc(n3), r3 & 512 && Gc(n3, n3.return);
          break;
        case 12:
          bl(e3, n3);
          break;
        case 31:
          bl(e3, n3), r3 & 4 && dl(e3, n3);
          break;
        case 13:
          bl(e3, n3), r3 & 4 && fl(e3, n3), r3 & 64 && (e3 = n3.memoizedState, e3 !== null && (e3 = e3.dehydrated,
          e3 !== null && (n3 = Ju.bind(null, n3), sf(e3, n3))));
          break;
        case 22:
          if (r3 = n3.memoizedState !== null || el, !r3) {
            t3 = t3 !== null && t3.memoizedState !== null || tl, i3 = el;
            var a3 = tl;
            el = r3, (tl = t3) && !a3 ? Sl(e3, n3, !!(n3.subtreeFlags & 8772)) : bl(e3, n3), el = i3, tl = a3;
          }
          break;
        case 30:
          break;
        default:
          bl(e3, n3);
      }
    }
    function sl(e3) {
      var t3 = e3.alternate;
      t3 !== null && (e3.alternate = null, sl(t3)), e3.child = null, e3.deletions = null, e3.sibling = null, e3.
      tag === 5 && (t3 = e3.stateNode, t3 !== null && vt2(t3)), e3.stateNode = null, e3.return = null, e3.dependencies =
      null, e3.memoizedProps = null, e3.memoizedState = null, e3.pendingProps = null, e3.stateNode = null, e3.
      updateQueue = null;
    }
    var G = null, cl = false;
    function ll(e3, t3, n3) {
      for (n3 = n3.child; n3 !== null; ) ul(e3, t3, n3), n3 = n3.sibling;
    }
    function ul(e3, t3, n3) {
      if (He2 && typeof He2.onCommitFiberUnmount == `function`) try {
        He2.onCommitFiberUnmount(Ve2, n3);
      } catch {
      }
      switch (n3.tag) {
        case 26:
          tl || Kc(n3, t3), ll(e3, t3, n3), n3.memoizedState ? n3.memoizedState.count-- : n3.stateNode && (n3 =
          n3.stateNode, n3.parentNode.removeChild(n3));
          break;
        case 27:
          tl || Kc(n3, t3);
          var r3 = G, i3 = cl;
          Zd(n3.type) && (G = n3.stateNode, cl = false), ll(e3, t3, n3), pf(n3.stateNode), G = r3, cl = i3;
          break;
        case 5:
          tl || Kc(n3, t3);
        case 6:
          if (r3 = G, i3 = cl, G = null, ll(e3, t3, n3), G = r3, cl = i3, G !== null) {
            if (cl) try {
              (G.nodeType === 9 ? G.body : G.nodeName === `HTML` ? G.ownerDocument.body : G).removeChild(n3.stateNode);
            } catch (e4) {
              Z(n3, t3, e4);
            }
            else try {
              G.removeChild(n3.stateNode);
            } catch (e4) {
              Z(n3, t3, e4);
            }
          }
          break;
        case 18:
          G !== null && (cl ? (e3 = G, Qd(e3.nodeType === 9 ? e3.body : e3.nodeName === `HTML` ? e3.ownerDocument.
          body : e3, n3.stateNode), Np(e3)) : Qd(G, n3.stateNode));
          break;
        case 4:
          r3 = G, i3 = cl, G = n3.stateNode.containerInfo, cl = true, ll(e3, t3, n3), G = r3, cl = i3;
          break;
        case 0:
        case 11:
        case 14:
        case 15:
          Hc(2, n3, t3), tl || Hc(4, n3, t3), ll(e3, t3, n3);
          break;
        case 1:
          tl || (Kc(n3, t3), r3 = n3.stateNode, typeof r3.componentWillUnmount == `function` && Wc(n3, t3, r3)),
          ll(e3, t3, n3);
          break;
        case 21:
          ll(e3, t3, n3);
          break;
        case 22:
          tl = (r3 = tl) || n3.memoizedState !== null, ll(e3, t3, n3), tl = r3;
          break;
        default:
          ll(e3, t3, n3);
      }
    }
    function dl(e3, t3) {
      if (t3.memoizedState === null && (e3 = t3.alternate, e3 !== null && (e3 = e3.memoizedState, e3 !== null))) {
        e3 = e3.dehydrated;
        try {
          Np(e3);
        } catch (e4) {
          Z(t3, t3.return, e4);
        }
      }
    }
    function fl(e3, t3) {
      if (t3.memoizedState === null && (e3 = t3.alternate, e3 !== null && (e3 = e3.memoizedState, e3 !== null &&
      (e3 = e3.dehydrated, e3 !== null)))) try {
        Np(e3);
      } catch (e4) {
        Z(t3, t3.return, e4);
      }
    }
    function pl(e3) {
      switch (e3.tag) {
        case 31:
        case 13:
        case 19:
          var t3 = e3.stateNode;
          return t3 === null && (t3 = e3.stateNode = new rl()), t3;
        case 22:
          return e3 = e3.stateNode, t3 = e3._retryCache, t3 === null && (t3 = e3._retryCache = new rl()), t3;
        default:
          throw Error(i2(435, e3.tag));
      }
    }
    function ml(e3, t3) {
      var n3 = pl(e3);
      t3.forEach(function(t4) {
        if (!n3.has(t4)) {
          n3.add(t4);
          var r3 = Yu.bind(null, e3, t4);
          t4.then(r3, r3);
        }
      });
    }
    function hl(e3, t3) {
      var n3 = t3.deletions;
      if (n3 !== null) for (var r3 = 0; r3 < n3.length; r3++) {
        var a3 = n3[r3], o3 = e3, s3 = t3, c3 = s3;
        a: for (; c3 !== null; ) {
          switch (c3.tag) {
            case 27:
              if (Zd(c3.type)) {
                G = c3.stateNode, cl = false;
                break a;
              }
              break;
            case 5:
              G = c3.stateNode, cl = false;
              break a;
            case 3:
            case 4:
              G = c3.stateNode.containerInfo, cl = true;
              break a;
          }
          c3 = c3.return;
        }
        if (G === null) throw Error(i2(160));
        ul(o3, s3, a3), G = null, cl = false, o3 = a3.alternate, o3 !== null && (o3.return = null), a3.return =
        null;
      }
      if (t3.subtreeFlags & 13886) for (t3 = t3.child; t3 !== null; ) _l(t3, e3), t3 = t3.sibling;
    }
    var gl = null;
    function _l(e3, t3) {
      var n3 = e3.alternate, r3 = e3.flags;
      switch (e3.tag) {
        case 0:
        case 11:
        case 14:
        case 15:
          hl(t3, e3), vl(e3), r3 & 4 && (Hc(3, e3, e3.return), Vc(3, e3), Hc(5, e3, e3.return));
          break;
        case 1:
          hl(t3, e3), vl(e3), r3 & 512 && (tl || n3 === null || Kc(n3, n3.return)), r3 & 64 && el && (e3 = e3.
          updateQueue, e3 !== null && (r3 = e3.callbacks, r3 !== null && (n3 = e3.shared.hiddenCallbacks, e3.shared.
          hiddenCallbacks = n3 === null ? r3 : n3.concat(r3))));
          break;
        case 26:
          var a3 = gl;
          if (hl(t3, e3), vl(e3), r3 & 512 && (tl || n3 === null || Kc(n3, n3.return)), r3 & 4) {
            var o3 = n3 === null ? null : n3.memoizedState;
            if (r3 = e3.memoizedState, n3 === null) {
              if (r3 === null) {
                if (e3.stateNode === null) {
                  a: {
                    r3 = e3.type, n3 = e3.memoizedProps, a3 = a3.ownerDocument || a3;
                    b: switch (r3) {
                      case `title`:
                        o3 = a3.getElementsByTagName(`title`)[0], (!o3 || o3[_t2] || o3[dt2] || o3.namespaceURI ===
                        `http://www.w3.org/2000/svg` || o3.hasAttribute(`itemprop`)) && (o3 = a3.createElement(
                        r3), a3.head.insertBefore(o3, a3.querySelector(`head > title`))), Pd(o3, r3, n3), o3[dt2] =
                        e3, St2(o3), r3 = o3;
                        break a;
                      case `link`:
                        var s3 = Vf(`link`, `href`, a3).get(r3 + (n3.href || ``));
                        if (s3) {
                          for (var c3 = 0; c3 < s3.length; c3++) if (o3 = s3[c3], o3.getAttribute(`href`) === (n3.
                          href == null || n3.href === `` ? null : n3.href) && o3.getAttribute(`rel`) === (n3.rel ==
                          null ? null : n3.rel) && o3.getAttribute(`title`) === (n3.title == null ? null : n3.
                          title) && o3.getAttribute(`crossorigin`) === (n3.crossOrigin == null ? null : n3.crossOrigin)) {
                            s3.splice(c3, 1);
                            break b;
                          }
                        }
                        o3 = a3.createElement(r3), Pd(o3, r3, n3), a3.head.appendChild(o3);
                        break;
                      case `meta`:
                        if (s3 = Vf(`meta`, `content`, a3).get(r3 + (n3.content || ``))) {
                          for (c3 = 0; c3 < s3.length; c3++) if (o3 = s3[c3], o3.getAttribute(`content`) === (n3.
                          content == null ? null : `` + n3.content) && o3.getAttribute(`name`) === (n3.name ==
                          null ? null : n3.name) && o3.getAttribute(`property`) === (n3.property == null ? null :
                          n3.property) && o3.getAttribute(`http-equiv`) === (n3.httpEquiv == null ? null : n3.
                          httpEquiv) && o3.getAttribute(`charset`) === (n3.charSet == null ? null : n3.charSet)) {
                            s3.splice(c3, 1);
                            break b;
                          }
                        }
                        o3 = a3.createElement(r3), Pd(o3, r3, n3), a3.head.appendChild(o3);
                        break;
                      default:
                        throw Error(i2(468, r3));
                    }
                    o3[dt2] = e3, St2(o3), r3 = o3;
                  }
                  e3.stateNode = r3;
                } else Hf(a3, e3.type, e3.stateNode);
              } else e3.stateNode = If(a3, r3, e3.memoizedProps);
            } else o3 === r3 ? r3 === null && e3.stateNode !== null && Jc(e3, e3.memoizedProps, n3.memoizedProps) :
            (o3 === null ? n3.stateNode !== null && (n3 = n3.stateNode, n3.parentNode.removeChild(n3)) : o3.count--,
            r3 === null ? Hf(a3, e3.type, e3.stateNode) : If(a3, r3, e3.memoizedProps));
          }
          break;
        case 27:
          hl(t3, e3), vl(e3), r3 & 512 && (tl || n3 === null || Kc(n3, n3.return)), n3 !== null && r3 & 4 && Jc(
          e3, e3.memoizedProps, n3.memoizedProps);
          break;
        case 5:
          if (hl(t3, e3), vl(e3), r3 & 512 && (tl || n3 === null || Kc(n3, n3.return)), e3.flags & 32) {
            a3 = e3.stateNode;
            try {
              Jt2(a3, ``);
            } catch (t4) {
              Z(e3, e3.return, t4);
            }
          }
          r3 & 4 && e3.stateNode != null && (a3 = e3.memoizedProps, Jc(e3, a3, n3 === null ? a3 : n3.memoizedProps)),
          r3 & 1024 && (nl = true);
          break;
        case 6:
          if (hl(t3, e3), vl(e3), r3 & 4) {
            if (e3.stateNode === null) throw Error(i2(162));
            r3 = e3.memoizedProps, n3 = e3.stateNode;
            try {
              n3.nodeValue = r3;
            } catch (t4) {
              Z(e3, e3.return, t4);
            }
          }
          break;
        case 3:
          if (Bf = null, a3 = gl, gl = gf(t3.containerInfo), hl(t3, e3), gl = a3, vl(e3), r3 & 4 && n3 !== null &&
          n3.memoizedState.isDehydrated) try {
            Np(t3.containerInfo);
          } catch (t4) {
            Z(e3, e3.return, t4);
          }
          nl && (nl = false, yl(e3));
          break;
        case 4:
          r3 = gl, gl = gf(e3.stateNode.containerInfo), hl(t3, e3), vl(e3), gl = r3;
          break;
        case 12:
          hl(t3, e3), vl(e3);
          break;
        case 31:
          hl(t3, e3), vl(e3), r3 & 4 && (r3 = e3.updateQueue, r3 !== null && (e3.updateQueue = null, ml(e3, r3)));
          break;
        case 13:
          hl(t3, e3), vl(e3), e3.child.flags & 8192 && e3.memoizedState !== null != (n3 !== null && n3.memoizedState !==
          null) && ($l = Me2()), r3 & 4 && (r3 = e3.updateQueue, r3 !== null && (e3.updateQueue = null, ml(e3,
          r3)));
          break;
        case 22:
          a3 = e3.memoizedState !== null;
          var l3 = n3 !== null && n3.memoizedState !== null, u2 = el, d3 = tl;
          if (el = u2 || a3, tl = d3 || l3, hl(t3, e3), tl = d3, el = u2, vl(e3), r3 & 8192) a: for (t3 = e3.stateNode,
          t3._visibility = a3 ? t3._visibility & -2 : t3._visibility | 1, a3 && (n3 === null || l3 || el || tl ||
          xl(e3)), n3 = null, t3 = e3; ; ) {
            if (t3.tag === 5 || t3.tag === 26) {
              if (n3 === null) {
                l3 = n3 = t3;
                try {
                  if (o3 = l3.stateNode, a3) s3 = o3.style, typeof s3.setProperty == `function` ? s3.setProperty(
                  `display`, `none`, `important`) : s3.display = `none`;
                  else {
                    c3 = l3.stateNode;
                    var f2 = l3.memoizedProps.style, p3 = f2 != null && f2.hasOwnProperty(`display`) ? f2.display :
                    null;
                    c3.style.display = p3 == null || typeof p3 == `boolean` ? `` : (`` + p3).trim();
                  }
                } catch (e4) {
                  Z(l3, l3.return, e4);
                }
              }
            } else if (t3.tag === 6) {
              if (n3 === null) {
                l3 = t3;
                try {
                  l3.stateNode.nodeValue = a3 ? `` : l3.memoizedProps;
                } catch (e4) {
                  Z(l3, l3.return, e4);
                }
              }
            } else if (t3.tag === 18) {
              if (n3 === null) {
                l3 = t3;
                try {
                  var m2 = l3.stateNode;
                  a3 ? $d(m2, true) : $d(l3.stateNode, false);
                } catch (e4) {
                  Z(l3, l3.return, e4);
                }
              }
            } else if ((t3.tag !== 22 && t3.tag !== 23 || t3.memoizedState === null || t3 === e3) && t3.child !==
            null) {
              t3.child.return = t3, t3 = t3.child;
              continue;
            }
            if (t3 === e3) break a;
            for (; t3.sibling === null; ) {
              if (t3.return === null || t3.return === e3) break a;
              n3 === t3 && (n3 = null), t3 = t3.return;
            }
            n3 === t3 && (n3 = null), t3.sibling.return = t3.return, t3 = t3.sibling;
          }
          r3 & 4 && (r3 = e3.updateQueue, r3 !== null && (n3 = r3.retryQueue, n3 !== null && (r3.retryQueue = null,
          ml(e3, n3))));
          break;
        case 19:
          hl(t3, e3), vl(e3), r3 & 4 && (r3 = e3.updateQueue, r3 !== null && (e3.updateQueue = null, ml(e3, r3)));
          break;
        case 30:
          break;
        case 21:
          break;
        default:
          hl(t3, e3), vl(e3);
      }
    }
    function vl(e3) {
      var t3 = e3.flags;
      if (t3 & 2) {
        try {
          for (var n3, r3 = e3.return; r3 !== null; ) {
            if (Yc(r3)) {
              n3 = r3;
              break;
            }
            r3 = r3.return;
          }
          if (n3 == null) throw Error(i2(160));
          switch (n3.tag) {
            case 27:
              var a3 = n3.stateNode;
              Qc(e3, Xc(e3), a3);
              break;
            case 5:
              var o3 = n3.stateNode;
              n3.flags & 32 && (Jt2(o3, ``), n3.flags &= -33), Qc(e3, Xc(e3), o3);
              break;
            case 3:
            case 4:
              var s3 = n3.stateNode.containerInfo;
              Zc(e3, Xc(e3), s3);
              break;
            default:
              throw Error(i2(161));
          }
        } catch (t4) {
          Z(e3, e3.return, t4);
        }
        e3.flags &= -3;
      }
      t3 & 4096 && (e3.flags &= -4097);
    }
    function yl(e3) {
      if (e3.subtreeFlags & 1024) for (e3 = e3.child; e3 !== null; ) {
        var t3 = e3;
        yl(t3), t3.tag === 5 && t3.flags & 1024 && t3.stateNode.reset(), e3 = e3.sibling;
      }
    }
    function bl(e3, t3) {
      if (t3.subtreeFlags & 8772) for (t3 = t3.child; t3 !== null; ) ol(e3, t3.alternate, t3), t3 = t3.sibling;
    }
    function xl(e3) {
      for (e3 = e3.child; e3 !== null; ) {
        var t3 = e3;
        switch (t3.tag) {
          case 0:
          case 11:
          case 14:
          case 15:
            Hc(4, t3, t3.return), xl(t3);
            break;
          case 1:
            Kc(t3, t3.return);
            var n3 = t3.stateNode;
            typeof n3.componentWillUnmount == `function` && Wc(t3, t3.return, n3), xl(t3);
            break;
          case 27:
            pf(t3.stateNode);
          case 26:
          case 5:
            Kc(t3, t3.return), xl(t3);
            break;
          case 22:
            t3.memoizedState === null && xl(t3);
            break;
          case 30:
            xl(t3);
            break;
          default:
            xl(t3);
        }
        e3 = e3.sibling;
      }
    }
    function Sl(e3, t3, n3) {
      for (n3 &&= !!(t3.subtreeFlags & 8772), t3 = t3.child; t3 !== null; ) {
        var r3 = t3.alternate, i3 = e3, a3 = t3, o3 = a3.flags;
        switch (a3.tag) {
          case 0:
          case 11:
          case 15:
            Sl(i3, a3, n3), Vc(4, a3);
            break;
          case 1:
            if (Sl(i3, a3, n3), r3 = a3, i3 = r3.stateNode, typeof i3.componentDidMount == `function`) try {
              i3.componentDidMount();
            } catch (e4) {
              Z(r3, r3.return, e4);
            }
            if (r3 = a3, i3 = r3.updateQueue, i3 !== null) {
              var s3 = r3.stateNode;
              try {
                var c3 = i3.shared.hiddenCallbacks;
                if (c3 !== null) for (i3.shared.hiddenCallbacks = null, i3 = 0; i3 < c3.length; i3++) Ja(c3[i3],
                s3);
              } catch (e4) {
                Z(r3, r3.return, e4);
              }
            }
            n3 && o3 & 64 && Uc(a3), Gc(a3, a3.return);
            break;
          case 27:
            $c(a3);
          case 26:
          case 5:
            Sl(i3, a3, n3), n3 && r3 === null && o3 & 4 && qc(a3), Gc(a3, a3.return);
            break;
          case 12:
            Sl(i3, a3, n3);
            break;
          case 31:
            Sl(i3, a3, n3), n3 && o3 & 4 && dl(i3, a3);
            break;
          case 13:
            Sl(i3, a3, n3), n3 && o3 & 4 && fl(i3, a3);
            break;
          case 22:
            a3.memoizedState === null && Sl(i3, a3, n3), Gc(a3, a3.return);
            break;
          case 30:
            break;
          default:
            Sl(i3, a3, n3);
        }
        t3 = t3.sibling;
      }
    }
    function Cl(e3, t3) {
      var n3 = null;
      e3 !== null && e3.memoizedState !== null && e3.memoizedState.cachePool !== null && (n3 = e3.memoizedState.
      cachePool.pool), e3 = null, t3.memoizedState !== null && t3.memoizedState.cachePool !== null && (e3 = t3.
      memoizedState.cachePool.pool), e3 !== n3 && (e3 != null && e3.refCount++, n3 != null && sa(n3));
    }
    function wl(e3, t3) {
      e3 = null, t3.alternate !== null && (e3 = t3.alternate.memoizedState.cache), t3 = t3.memoizedState.cache,
      t3 !== e3 && (t3.refCount++, e3 != null && sa(e3));
    }
    function Tl(e3, t3, n3, r3) {
      if (t3.subtreeFlags & 10256) for (t3 = t3.child; t3 !== null; ) El(e3, t3, n3, r3), t3 = t3.sibling;
    }
    function El(e3, t3, n3, r3) {
      var i3 = t3.flags;
      switch (t3.tag) {
        case 0:
        case 11:
        case 15:
          Tl(e3, t3, n3, r3), i3 & 2048 && Vc(9, t3);
          break;
        case 1:
          Tl(e3, t3, n3, r3);
          break;
        case 3:
          Tl(e3, t3, n3, r3), i3 & 2048 && (e3 = null, t3.alternate !== null && (e3 = t3.alternate.memoizedState.
          cache), t3 = t3.memoizedState.cache, t3 !== e3 && (t3.refCount++, e3 != null && sa(e3)));
          break;
        case 12:
          if (i3 & 2048) {
            Tl(e3, t3, n3, r3), e3 = t3.stateNode;
            try {
              var a3 = t3.memoizedProps, o3 = a3.id, s3 = a3.onPostCommit;
              typeof s3 == `function` && s3(o3, t3.alternate === null ? `mount` : `update`, e3.passiveEffectDuration,
              -0);
            } catch (e4) {
              Z(t3, t3.return, e4);
            }
          } else Tl(e3, t3, n3, r3);
          break;
        case 31:
          Tl(e3, t3, n3, r3);
          break;
        case 13:
          Tl(e3, t3, n3, r3);
          break;
        case 23:
          break;
        case 22:
          a3 = t3.stateNode, o3 = t3.alternate, t3.memoizedState === null ? a3._visibility & 2 ? Tl(e3, t3, n3,
          r3) : (a3._visibility |= 2, Dl(e3, t3, n3, r3, !!(t3.subtreeFlags & 10256) || false)) : a3._visibility &
          2 ? Tl(e3, t3, n3, r3) : Ol(e3, t3), i3 & 2048 && Cl(o3, t3);
          break;
        case 24:
          Tl(e3, t3, n3, r3), i3 & 2048 && wl(t3.alternate, t3);
          break;
        default:
          Tl(e3, t3, n3, r3);
      }
    }
    function Dl(e3, t3, n3, r3, i3) {
      for (i3 &&= !!(t3.subtreeFlags & 10256) || false, t3 = t3.child; t3 !== null; ) {
        var a3 = e3, o3 = t3, s3 = n3, c3 = r3, l3 = o3.flags;
        switch (o3.tag) {
          case 0:
          case 11:
          case 15:
            Dl(a3, o3, s3, c3, i3), Vc(8, o3);
            break;
          case 23:
            break;
          case 22:
            var u2 = o3.stateNode;
            o3.memoizedState === null ? (u2._visibility |= 2, Dl(a3, o3, s3, c3, i3)) : u2._visibility & 2 ? Dl(
            a3, o3, s3, c3, i3) : Ol(a3, o3), i3 && l3 & 2048 && Cl(o3.alternate, o3);
            break;
          case 24:
            Dl(a3, o3, s3, c3, i3), i3 && l3 & 2048 && wl(o3.alternate, o3);
            break;
          default:
            Dl(a3, o3, s3, c3, i3);
        }
        t3 = t3.sibling;
      }
    }
    function Ol(e3, t3) {
      if (t3.subtreeFlags & 10256) for (t3 = t3.child; t3 !== null; ) {
        var n3 = e3, r3 = t3, i3 = r3.flags;
        switch (r3.tag) {
          case 22:
            Ol(n3, r3), i3 & 2048 && Cl(r3.alternate, r3);
            break;
          case 24:
            Ol(n3, r3), i3 & 2048 && wl(r3.alternate, r3);
            break;
          default:
            Ol(n3, r3);
        }
        t3 = t3.sibling;
      }
    }
    var kl = 8192;
    function Al(e3, t3, n3) {
      if (e3.subtreeFlags & kl) for (e3 = e3.child; e3 !== null; ) jl(e3, t3, n3), e3 = e3.sibling;
    }
    function jl(e3, t3, n3) {
      switch (e3.tag) {
        case 26:
          Al(e3, t3, n3), e3.flags & kl && e3.memoizedState !== null && Gf(n3, gl, e3.memoizedState, e3.memoizedProps);
          break;
        case 5:
          Al(e3, t3, n3);
          break;
        case 3:
        case 4:
          var r3 = gl;
          gl = gf(e3.stateNode.containerInfo), Al(e3, t3, n3), gl = r3;
          break;
        case 22:
          e3.memoizedState === null && (r3 = e3.alternate, r3 !== null && r3.memoizedState !== null ? (r3 = kl,
          kl = 16777216, Al(e3, t3, n3), kl = r3) : Al(e3, t3, n3));
          break;
        default:
          Al(e3, t3, n3);
      }
    }
    function Ml(e3) {
      var t3 = e3.alternate;
      if (t3 !== null && (e3 = t3.child, e3 !== null)) {
        t3.child = null;
        do
          t3 = e3.sibling, e3.sibling = null, e3 = t3;
        while (e3 !== null);
      }
    }
    function Nl(e3) {
      var t3 = e3.deletions;
      if (e3.flags & 16) {
        if (t3 !== null) for (var n3 = 0; n3 < t3.length; n3++) {
          var r3 = t3[n3];
          il = r3, Il(r3, e3);
        }
        Ml(e3);
      }
      if (e3.subtreeFlags & 10256) for (e3 = e3.child; e3 !== null; ) Pl(e3), e3 = e3.sibling;
    }
    function Pl(e3) {
      switch (e3.tag) {
        case 0:
        case 11:
        case 15:
          Nl(e3), e3.flags & 2048 && Hc(9, e3, e3.return);
          break;
        case 3:
          Nl(e3);
          break;
        case 12:
          Nl(e3);
          break;
        case 22:
          var t3 = e3.stateNode;
          e3.memoizedState !== null && t3._visibility & 2 && (e3.return === null || e3.return.tag !== 13) ? (t3.
          _visibility &= -3, Fl(e3)) : Nl(e3);
          break;
        default:
          Nl(e3);
      }
    }
    function Fl(e3) {
      var t3 = e3.deletions;
      if (e3.flags & 16) {
        if (t3 !== null) for (var n3 = 0; n3 < t3.length; n3++) {
          var r3 = t3[n3];
          il = r3, Il(r3, e3);
        }
        Ml(e3);
      }
      for (e3 = e3.child; e3 !== null; ) {
        switch (t3 = e3, t3.tag) {
          case 0:
          case 11:
          case 15:
            Hc(8, t3, t3.return), Fl(t3);
            break;
          case 22:
            n3 = t3.stateNode, n3._visibility & 2 && (n3._visibility &= -3, Fl(t3));
            break;
          default:
            Fl(t3);
        }
        e3 = e3.sibling;
      }
    }
    function Il(e3, t3) {
      for (; il !== null; ) {
        var n3 = il;
        switch (n3.tag) {
          case 0:
          case 11:
          case 15:
            Hc(8, n3, t3);
            break;
          case 23:
          case 22:
            if (n3.memoizedState !== null && n3.memoizedState.cachePool !== null) {
              var r3 = n3.memoizedState.cachePool.pool;
              r3 != null && r3.refCount++;
            }
            break;
          case 24:
            sa(n3.memoizedState.cache);
        }
        if (r3 = n3.child, r3 !== null) r3.return = n3, il = r3;
        else a: for (n3 = e3; il !== null; ) {
          r3 = il;
          var i3 = r3.sibling, a3 = r3.return;
          if (sl(r3), r3 === n3) {
            il = null;
            break a;
          }
          if (i3 !== null) {
            i3.return = a3, il = i3;
            break a;
          }
          il = a3;
        }
      }
    }
    var Ll = { getCacheForType: function(e3) {
      var t3 = $i(aa), n3 = t3.data.get(e3);
      return n3 === void 0 && (n3 = e3(), t3.data.set(e3, n3)), n3;
    }, cacheSignal: function() {
      return $i(aa).controller.signal;
    } }, Rl = typeof WeakMap == `function` ? WeakMap : Map, K = 0, q = null, J = null, Y = 0, X = 0, zl = null,
    Bl = false, Vl = false, Hl = false, Ul = 0, Wl = 0, Gl = 0, Kl = 0, ql = 0, Jl = 0, Yl = 0, Xl = null, Zl = null,
    Ql = false, $l = 0, eu = 0, tu = 1 / 0, nu = null, ru = null, iu = 0, au = null, ou = null, su = 0, cu = 0,
    lu = null, uu = null, du = 0, fu = null;
    function pu() {
      return K & 2 && Y !== 0 ? Y & -Y : E2.T === null ? ct2() : dd();
    }
    function mu() {
      if (Jl === 0) {
        if (!(Y & 536870912) || V) {
          var e3 = Je2;
          Je2 <<= 1, !(Je2 & 3932160) && (Je2 = 262144), Jl = e3;
        } else Jl = 536870912;
      }
      return e3 = to.current, e3 !== null && (e3.flags |= 32), Jl;
    }
    function hu(e3, t3, n3) {
      (e3 === q && (X === 2 || X === 9) || e3.cancelPendingCommit !== null) && (Su(e3, 0), yu(e3, Y, Jl, false)),
      nt2(e3, n3), (!(K & 2) || e3 !== q) && (e3 === q && (!(K & 2) && (Kl |= n3), Wl === 4 && yu(e3, Y, Jl, false)),
      rd(e3));
    }
    function gu(e3, t3, n3) {
      if (K & 6) throw Error(i2(327));
      var r3 = !n3 && !(t3 & 127) && (t3 & e3.expiredLanes) === 0 || Qe2(e3, t3), a3 = r3 ? Au(e3, t3) : Ou(e3,
      t3, true), o3 = r3;
      do {
        if (a3 === 0) {
          Vl && !r3 && yu(e3, t3, 0, false);
          break;
        }
        if (n3 = e3.current.alternate, o3 && !vu(n3)) {
          a3 = Ou(e3, t3, false), o3 = false;
          continue;
        }
        if (a3 === 2) {
          if (o3 = t3, e3.errorRecoveryDisabledLanes & o3) var s3 = 0;
          else s3 = e3.pendingLanes & -536870913, s3 = s3 === 0 ? s3 & 536870912 ? 536870912 : 0 : s3;
          if (s3 !== 0) {
            t3 = s3;
            a: {
              var c3 = e3;
              a3 = Xl;
              var l3 = c3.current.memoizedState.isDehydrated;
              if (l3 && (Su(c3, s3).flags |= 256), s3 = Ou(c3, s3, false), s3 !== 2) {
                if (Hl && !l3) {
                  c3.errorRecoveryDisabledLanes |= o3, Kl |= o3, a3 = 4;
                  break a;
                }
                o3 = Zl, Zl = a3, o3 !== null && (Zl === null ? Zl = o3 : Zl.push.apply(Zl, o3));
              }
              a3 = s3;
            }
            if (o3 = false, a3 !== 2) continue;
          }
        }
        if (a3 === 1) {
          Su(e3, 0), yu(e3, t3, 0, true);
          break;
        }
        a: {
          switch (r3 = e3, o3 = a3, o3) {
            case 0:
            case 1:
              throw Error(i2(345));
            case 4:
              if ((t3 & 4194048) !== t3) break;
            case 6:
              yu(r3, t3, Jl, !Bl);
              break a;
            case 2:
              Zl = null;
              break;
            case 3:
            case 5:
              break;
            default:
              throw Error(i2(329));
          }
          if ((t3 & 62914560) === t3 && (a3 = $l + 300 - Me2(), 10 < a3)) {
            if (yu(r3, t3, Jl, !Bl), Ze2(r3, 0, true) !== 0) break a;
            su = t3, r3.timeoutHandle = Kd(_u.bind(null, r3, n3, Zl, nu, Ql, t3, Jl, Kl, Yl, Bl, o3, `Throttle\
d`, -0, 0), a3);
            break a;
          }
          _u(r3, n3, Zl, nu, Ql, t3, Jl, Kl, Yl, Bl, o3, null, -0, 0);
        }
        break;
      } while (1);
      rd(e3);
    }
    function _u(e3, t3, n3, r3, i3, a3, o3, s3, c3, l3, u2, d3, f2, p3) {
      if (e3.timeoutHandle = -1, d3 = t3.subtreeFlags, d3 & 8192 || (d3 & 16785408) == 16785408) {
        d3 = { stylesheets: null, count: 0, imgCount: 0, imgBytes: 0, suspenseyImages: [], waitingForImages: true,
        waitingForViewTransition: false, unsuspend: tn2 }, jl(t3, a3, d3);
        var m2 = (a3 & 62914560) === a3 ? $l - Me2() : (a3 & 4194048) === a3 ? eu - Me2() : 0;
        if (m2 = qf(d3, m2), m2 !== null) {
          su = a3, e3.cancelPendingCommit = m2(Lu.bind(null, e3, t3, a3, n3, r3, i3, o3, s3, c3, u2, d3, null,
          f2, p3)), yu(e3, a3, o3, !l3);
          return;
        }
      }
      Lu(e3, t3, a3, n3, r3, i3, o3, s3, c3);
    }
    function vu(e3) {
      for (var t3 = e3; ; ) {
        var n3 = t3.tag;
        if ((n3 === 0 || n3 === 11 || n3 === 15) && t3.flags & 16384 && (n3 = t3.updateQueue, n3 !== null && (n3 =
        n3.stores, n3 !== null))) for (var r3 = 0; r3 < n3.length; r3++) {
          var i3 = n3[r3], a3 = i3.getSnapshot;
          i3 = i3.value;
          try {
            if (!xr2(a3(), i3)) return false;
          } catch {
            return false;
          }
        }
        if (n3 = t3.child, t3.subtreeFlags & 16384 && n3 !== null) n3.return = t3, t3 = n3;
        else {
          if (t3 === e3) break;
          for (; t3.sibling === null; ) {
            if (t3.return === null || t3.return === e3) return true;
            t3 = t3.return;
          }
          t3.sibling.return = t3.return, t3 = t3.sibling;
        }
      }
      return true;
    }
    function yu(e3, t3, n3, r3) {
      t3 &= ~ql, t3 &= ~Kl, e3.suspendedLanes |= t3, e3.pingedLanes &= ~t3, r3 && (e3.warmLanes |= t3), r3 = e3.
      expirationTimes;
      for (var i3 = t3; 0 < i3; ) {
        var a3 = 31 - We2(i3), o3 = 1 << a3;
        r3[a3] = -1, i3 &= ~o3;
      }
      n3 !== 0 && rt2(e3, n3, t3);
    }
    function bu() {
      return K & 6 ? true : (id(0, false), false);
    }
    function xu() {
      if (J !== null) {
        if (X === 0) var e3 = J.return;
        else e3 = J, Gi = Wi = null, Oo(e3), Aa = null, ja = 0, e3 = J;
        for (; e3 !== null; ) Bc(e3.alternate, e3), e3 = e3.return;
        J = null;
      }
    }
    function Su(e3, t3) {
      var n3 = e3.timeoutHandle;
      n3 !== -1 && (e3.timeoutHandle = -1, qd(n3)), n3 = e3.cancelPendingCommit, n3 !== null && (e3.cancelPendingCommit =
      null, n3()), su = 0, xu(), q = e3, J = n3 = li2(e3.current, null), Y = t3, X = 0, zl = null, Bl = false,
      Vl = Qe2(e3, t3), Hl = false, Yl = Jl = ql = Kl = Gl = Wl = 0, Zl = Xl = null, Ql = false, t3 & 8 && (t3 |=
      t3 & 32);
      var r3 = e3.entangledLanes;
      if (r3 !== 0) for (e3 = e3.entanglements, r3 &= t3; 0 < r3; ) {
        var i3 = 31 - We2(r3), a3 = 1 << i3;
        t3 |= e3[i3], r3 &= ~a3;
      }
      return Ul = t3, $r2(), n3;
    }
    function Cu(e3, t3) {
      H = null, E2.H = Rs, t3 === ba || t3 === Sa ? (t3 = Oa(), X = 3) : t3 === xa ? (t3 = Oa(), X = 4) : X = t3 ===
      nc ? 8 : typeof t3 == `object` && t3 && typeof t3.then == `function` ? 6 : 1, zl = t3, J === null && (Wl =
      1, Xs(e3, _i(t3, e3.current)));
    }
    function wu() {
      var e3 = to.current;
      return e3 === null ? true : (Y & 4194048) === Y ? no === null : (Y & 62914560) === Y || Y & 536870912 ? e3 ===
      no : false;
    }
    function Tu() {
      var e3 = E2.H;
      return E2.H = Rs, e3 === null ? Rs : e3;
    }
    function Eu() {
      var e3 = E2.A;
      return E2.A = Ll, e3;
    }
    function Du() {
      Wl = 4, Bl || (Y & 4194048) !== Y && to.current !== null || (Vl = true), !(Gl & 134217727) && !(Kl & 134217727) ||
      q === null || yu(q, Y, Jl, false);
    }
    function Ou(e3, t3, n3) {
      var r3 = K;
      K |= 2;
      var i3 = Tu(), a3 = Eu();
      (q !== e3 || Y !== t3) && (nu = null, Su(e3, t3)), t3 = false;
      var o3 = Wl;
      a: do
        try {
          if (X !== 0 && J !== null) {
            var s3 = J, c3 = zl;
            switch (X) {
              case 8:
                xu(), o3 = 6;
                break a;
              case 3:
              case 2:
              case 9:
              case 6:
                to.current === null && (t3 = true);
                var l3 = X;
                if (X = 0, zl = null, Pu(e3, s3, c3, l3), n3 && Vl) {
                  o3 = 0;
                  break a;
                }
                break;
              default:
                l3 = X, X = 0, zl = null, Pu(e3, s3, c3, l3);
            }
          }
          ku(), o3 = Wl;
          break;
        } catch (t4) {
          Cu(e3, t4);
        }
      while (1);
      return t3 && e3.shellSuspendCounter++, Gi = Wi = null, K = r3, E2.H = i3, E2.A = a3, J === null && (q = null,
      Y = 0, $r2()), o3;
    }
    function ku() {
      for (; J !== null; ) Mu(J);
    }
    function Au(e3, t3) {
      var n3 = K;
      K |= 2;
      var r3 = Tu(), a3 = Eu();
      q !== e3 || Y !== t3 ? (nu = null, tu = Me2() + 500, Su(e3, t3)) : Vl = Qe2(e3, t3);
      a: do
        try {
          if (X !== 0 && J !== null) {
            t3 = J;
            var o3 = zl;
            b: switch (X) {
              case 1:
                X = 0, zl = null, Pu(e3, t3, o3, 1);
                break;
              case 2:
              case 9:
                if (wa(o3)) {
                  X = 0, zl = null, Nu(t3);
                  break;
                }
                t3 = function() {
                  X !== 2 && X !== 9 || q !== e3 || (X = 7), rd(e3);
                }, o3.then(t3, t3);
                break a;
              case 3:
                X = 7;
                break a;
              case 4:
                X = 5;
                break a;
              case 7:
                wa(o3) ? (X = 0, zl = null, Nu(t3)) : (X = 0, zl = null, Pu(e3, t3, o3, 7));
                break;
              case 5:
                var s3 = null;
                switch (J.tag) {
                  case 26:
                    s3 = J.memoizedState;
                  case 5:
                  case 27:
                    var c3 = J;
                    if (s3 ? Wf(s3) : c3.stateNode.complete) {
                      X = 0, zl = null;
                      var l3 = c3.sibling;
                      if (l3 !== null) J = l3;
                      else {
                        var u2 = c3.return;
                        u2 === null ? J = null : (J = u2, Fu(u2));
                      }
                      break b;
                    }
                }
                X = 0, zl = null, Pu(e3, t3, o3, 5);
                break;
              case 6:
                X = 0, zl = null, Pu(e3, t3, o3, 6);
                break;
              case 8:
                xu(), Wl = 6;
                break a;
              default:
                throw Error(i2(462));
            }
          }
          ju();
          break;
        } catch (t4) {
          Cu(e3, t4);
        }
      while (1);
      return Gi = Wi = null, E2.H = r3, E2.A = a3, K = n3, J === null ? (q = null, Y = 0, $r2(), Wl) : 0;
    }
    function ju() {
      for (; J !== null && !Ae2(); ) Mu(J);
    }
    function Mu(e3) {
      var t3 = Mc(e3.alternate, e3, Ul);
      e3.memoizedProps = e3.pendingProps, t3 === null ? Fu(e3) : J = t3;
    }
    function Nu(e3) {
      var t3 = e3, n3 = t3.alternate;
      switch (t3.tag) {
        case 15:
        case 0:
          t3 = gc(n3, t3, t3.pendingProps, t3.type, void 0, Y);
          break;
        case 11:
          t3 = gc(n3, t3, t3.pendingProps, t3.type.render, t3.ref, Y);
          break;
        case 5:
          Oo(t3);
        default:
          Bc(n3, t3), t3 = J = ui2(t3, Ul), t3 = Mc(n3, t3, Ul);
      }
      e3.memoizedProps = e3.pendingProps, t3 === null ? Fu(e3) : J = t3;
    }
    function Pu(e3, t3, n3, r3) {
      Gi = Wi = null, Oo(t3), Aa = null, ja = 0;
      var i3 = t3.return;
      try {
        if (tc(e3, i3, t3, n3, Y)) {
          Wl = 1, Xs(e3, _i(n3, e3.current)), J = null;
          return;
        }
      } catch (t4) {
        if (i3 !== null) throw J = i3, t4;
        Wl = 1, Xs(e3, _i(n3, e3.current)), J = null;
        return;
      }
      t3.flags & 32768 ? (V || r3 === 1 ? e3 = true : Vl || Y & 536870912 ? e3 = false : (Bl = e3 = true, (r3 ===
      2 || r3 === 9 || r3 === 3 || r3 === 6) && (r3 = to.current, r3 !== null && r3.tag === 13 && (r3.flags |=
      16384))), Iu(t3, e3)) : Fu(t3);
    }
    function Fu(e3) {
      var t3 = e3;
      do {
        if (t3.flags & 32768) {
          Iu(t3, Bl);
          return;
        }
        e3 = t3.return;
        var n3 = Rc(t3.alternate, t3, Ul);
        if (n3 !== null) {
          J = n3;
          return;
        }
        if (t3 = t3.sibling, t3 !== null) {
          J = t3;
          return;
        }
        J = t3 = e3;
      } while (t3 !== null);
      Wl === 0 && (Wl = 5);
    }
    function Iu(e3, t3) {
      do {
        var n3 = zc(e3.alternate, e3);
        if (n3 !== null) {
          n3.flags &= 32767, J = n3;
          return;
        }
        if (n3 = e3.return, n3 !== null && (n3.flags |= 32768, n3.subtreeFlags = 0, n3.deletions = null), !t3 &&
        (e3 = e3.sibling, e3 !== null)) {
          J = e3;
          return;
        }
        J = e3 = n3;
      } while (e3 !== null);
      Wl = 6, J = null;
    }
    function Lu(e3, t3, n3, r3, a3, o3, s3, c3, l3) {
      e3.cancelPendingCommit = null;
      do
        Hu();
      while (iu !== 0);
      if (K & 6) throw Error(i2(327));
      if (t3 !== null) {
        if (t3 === e3.current) throw Error(i2(177));
        if (o3 = t3.lanes | t3.childLanes, o3 |= Qr2, N2(e3, n3, o3, s3, c3, l3), e3 === q && (J = q = null, Y =
        0), ou = t3, au = e3, su = n3, cu = o3, lu = a3, uu = r3, t3.subtreeFlags & 10256 || t3.flags & 10256 ?
        (e3.callbackNode = null, e3.callbackPriority = 0, Xu(Ie2, function() {
          return Uu(), null;
        })) : (e3.callbackNode = null, e3.callbackPriority = 0), r3 = !!(t3.flags & 13878), t3.subtreeFlags & 13878 ||
        r3) {
          r3 = E2.T, E2.T = null, a3 = D2.p, D2.p = 2, s3 = K, K |= 4;
          try {
            al(e3, t3, n3);
          } finally {
            K = s3, D2.p = a3, E2.T = r3;
          }
        }
        iu = 1, Ru(), zu(), Bu();
      }
    }
    function Ru() {
      if (iu === 1) {
        iu = 0;
        var e3 = au, t3 = ou, n3 = !!(t3.flags & 13878);
        if (t3.subtreeFlags & 13878 || n3) {
          n3 = E2.T, E2.T = null;
          var r3 = D2.p;
          D2.p = 2;
          var i3 = K;
          K |= 4;
          try {
            _l(t3, e3);
            var a3 = zd, o3 = Er2(e3.containerInfo), s3 = a3.focusedElem, c3 = a3.selectionRange;
            if (o3 !== s3 && s3 && s3.ownerDocument && Tr2(s3.ownerDocument.documentElement, s3)) {
              if (c3 !== null && Dr2(s3)) {
                var l3 = c3.start, u2 = c3.end;
                if (u2 === void 0 && (u2 = l3), `selectionStart` in s3) s3.selectionStart = l3, s3.selectionEnd =
                Math.min(u2, s3.value.length);
                else {
                  var d3 = s3.ownerDocument || document, f2 = d3 && d3.defaultView || window;
                  if (f2.getSelection) {
                    var p3 = f2.getSelection(), m2 = s3.textContent.length, h3 = Math.min(c3.start, m2), g3 = c3.
                    end === void 0 ? h3 : Math.min(c3.end, m2);
                    !p3.extend && h3 > g3 && (o3 = g3, g3 = h3, h3 = o3);
                    var _3 = wr2(s3, h3), v3 = wr2(s3, g3);
                    if (_3 && v3 && (p3.rangeCount !== 1 || p3.anchorNode !== _3.node || p3.anchorOffset !== _3.
                    offset || p3.focusNode !== v3.node || p3.focusOffset !== v3.offset)) {
                      var y3 = d3.createRange();
                      y3.setStart(_3.node, _3.offset), p3.removeAllRanges(), h3 > g3 ? (p3.addRange(y3), p3.extend(
                      v3.node, v3.offset)) : (y3.setEnd(v3.node, v3.offset), p3.addRange(y3));
                    }
                  }
                }
              }
              for (d3 = [], p3 = s3; p3 = p3.parentNode; ) p3.nodeType === 1 && d3.push({ element: p3, left: p3.
              scrollLeft, top: p3.scrollTop });
              for (typeof s3.focus == `function` && s3.focus(), s3 = 0; s3 < d3.length; s3++) {
                var b3 = d3[s3];
                b3.element.scrollLeft = b3.left, b3.element.scrollTop = b3.top;
              }
            }
            sp = !!Rd, zd = Rd = null;
          } finally {
            K = i3, D2.p = r3, E2.T = n3;
          }
        }
        e3.current = t3, iu = 2;
      }
    }
    function zu() {
      if (iu === 2) {
        iu = 0;
        var e3 = au, t3 = ou, n3 = !!(t3.flags & 8772);
        if (t3.subtreeFlags & 8772 || n3) {
          n3 = E2.T, E2.T = null;
          var r3 = D2.p;
          D2.p = 2;
          var i3 = K;
          K |= 4;
          try {
            ol(e3, t3.alternate, t3);
          } finally {
            K = i3, D2.p = r3, E2.T = n3;
          }
        }
        iu = 3;
      }
    }
    function Bu() {
      if (iu === 4 || iu === 3) {
        iu = 0, je2();
        var e3 = au, t3 = ou, n3 = su, r3 = uu;
        t3.subtreeFlags & 10256 || t3.flags & 10256 ? iu = 5 : (iu = 0, ou = au = null, Vu(e3, e3.pendingLanes));
        var i3 = e3.pendingLanes;
        if (i3 === 0 && (ru = null), st2(n3), t3 = t3.stateNode, He2 && typeof He2.onCommitFiberRoot == `funct\
ion`) try {
          He2.onCommitFiberRoot(Ve2, t3, void 0, (t3.current.flags & 128) == 128);
        } catch {
        }
        if (r3 !== null) {
          t3 = E2.T, i3 = D2.p, D2.p = 2, E2.T = null;
          try {
            for (var a3 = e3.onRecoverableError, o3 = 0; o3 < r3.length; o3++) {
              var s3 = r3[o3];
              a3(s3.value, { componentStack: s3.stack });
            }
          } finally {
            E2.T = t3, D2.p = i3;
          }
        }
        su & 3 && Hu(), rd(e3), i3 = e3.pendingLanes, n3 & 261930 && i3 & 42 ? e3 === fu ? du++ : (du = 0, fu =
        e3) : du = 0, id(0, false);
      }
    }
    function Vu(e3, t3) {
      (e3.pooledCacheLanes &= t3) === 0 && (t3 = e3.pooledCache, t3 != null && (e3.pooledCache = null, sa(t3)));
    }
    function Hu() {
      return Ru(), zu(), Bu(), Uu();
    }
    function Uu() {
      if (iu !== 5) return false;
      var e3 = au, t3 = cu;
      cu = 0;
      var n3 = st2(su), r3 = E2.T, a3 = D2.p;
      try {
        D2.p = 32 > n3 ? 32 : n3, E2.T = null, n3 = lu, lu = null;
        var o3 = au, s3 = su;
        if (iu = 0, ou = au = null, su = 0, K & 6) throw Error(i2(331));
        var c3 = K;
        if (K |= 4, Pl(o3.current), El(o3, o3.current, s3, n3), K = c3, id(0, false), He2 && typeof He2.onPostCommitFiberRoot ==
        `function`) try {
          He2.onPostCommitFiberRoot(Ve2, o3);
        } catch {
        }
        return true;
      } finally {
        D2.p = a3, E2.T = r3, Vu(e3, t3);
      }
    }
    function Wu(e3, t3, n3) {
      t3 = _i(n3, t3), t3 = Qs(e3.stateNode, t3, 2), e3 = Ha(e3, t3, 2), e3 !== null && (nt2(e3, 2), rd(e3));
    }
    function Z(e3, t3, n3) {
      if (e3.tag === 3) Wu(e3, e3, n3);
      else for (; t3 !== null; ) {
        if (t3.tag === 3) {
          Wu(t3, e3, n3);
          break;
        }
        if (t3.tag === 1) {
          var r3 = t3.stateNode;
          if (typeof t3.type.getDerivedStateFromError == `function` || typeof r3.componentDidCatch == `functio\
n` && (ru === null || !ru.has(r3))) {
            e3 = _i(n3, e3), n3 = $s(2), r3 = Ha(t3, n3, 2), r3 !== null && (ec(n3, r3, t3, e3), nt2(r3, 2), rd(
            r3));
            break;
          }
        }
        t3 = t3.return;
      }
    }
    function Gu(e3, t3, n3) {
      var r3 = e3.pingCache;
      if (r3 === null) {
        r3 = e3.pingCache = new Rl();
        var i3 = /* @__PURE__ */ new Set();
        r3.set(t3, i3);
      } else i3 = r3.get(t3), i3 === void 0 && (i3 = /* @__PURE__ */ new Set(), r3.set(t3, i3));
      i3.has(n3) || (Hl = true, i3.add(n3), e3 = Ku.bind(null, e3, t3, n3), t3.then(e3, e3));
    }
    function Ku(e3, t3, n3) {
      var r3 = e3.pingCache;
      r3 !== null && r3.delete(t3), e3.pingedLanes |= e3.suspendedLanes & n3, e3.warmLanes &= ~n3, q === e3 &&
      (Y & n3) === n3 && (Wl === 4 || Wl === 3 && (Y & 62914560) === Y && 300 > Me2() - $l ? !(K & 2) && Su(e3,
      0) : ql |= n3, Yl === Y && (Yl = 0)), rd(e3);
    }
    function qu(e3, t3) {
      t3 === 0 && (t3 = et2()), e3 = ni2(e3, t3), e3 !== null && (nt2(e3, t3), rd(e3));
    }
    function Ju(e3) {
      var t3 = e3.memoizedState, n3 = 0;
      t3 !== null && (n3 = t3.retryLane), qu(e3, n3);
    }
    function Yu(e3, t3) {
      var n3 = 0;
      switch (e3.tag) {
        case 31:
        case 13:
          var r3 = e3.stateNode, a3 = e3.memoizedState;
          a3 !== null && (n3 = a3.retryLane);
          break;
        case 19:
          r3 = e3.stateNode;
          break;
        case 22:
          r3 = e3.stateNode._retryCache;
          break;
        default:
          throw Error(i2(314));
      }
      r3 !== null && r3.delete(t3), qu(e3, n3);
    }
    function Xu(e3, t3) {
      return Oe2(e3, t3);
    }
    var Zu = null, Qu = null, $u = false, ed = false, td = false, nd = 0;
    function rd(e3) {
      e3 !== Qu && e3.next === null && (Qu === null ? Zu = Qu = e3 : Qu = Qu.next = e3), ed = true, $u || ($u =
      true, ud());
    }
    function id(e3, t3) {
      if (!td && ed) {
        td = true;
        do
          for (var n3 = false, r3 = Zu; r3 !== null; ) {
            if (!t3) {
              if (e3 !== 0) {
                var i3 = r3.pendingLanes;
                if (i3 === 0) var a3 = 0;
                else {
                  var o3 = r3.suspendedLanes, s3 = r3.pingedLanes;
                  a3 = (1 << 31 - We2(42 | e3) + 1) - 1, a3 &= i3 & ~(o3 & ~s3), a3 = a3 & 201326741 ? a3 & 201326741 |
                  1 : a3 ? a3 | 2 : 0;
                }
                a3 !== 0 && (n3 = true, ld(r3, a3));
              } else a3 = Y, a3 = Ze2(r3, r3 === q ? a3 : 0, r3.cancelPendingCommit !== null || r3.timeoutHandle !==
              -1), !(a3 & 3) || Qe2(r3, a3) || (n3 = true, ld(r3, a3));
            }
            r3 = r3.next;
          }
        while (n3);
        td = false;
      }
    }
    function ad() {
      od();
    }
    function od() {
      ed = $u = false;
      var e3 = 0;
      nd !== 0 && Gd() && (e3 = nd);
      for (var t3 = Me2(), n3 = null, r3 = Zu; r3 !== null; ) {
        var i3 = r3.next, a3 = sd(r3, t3);
        a3 === 0 ? (r3.next = null, n3 === null ? Zu = i3 : n3.next = i3, i3 === null && (Qu = n3)) : (n3 = r3,
        (e3 !== 0 || a3 & 3) && (ed = true)), r3 = i3;
      }
      iu !== 0 && iu !== 5 || id(e3, false), nd !== 0 && (nd = 0);
    }
    function sd(e3, t3) {
      for (var n3 = e3.suspendedLanes, r3 = e3.pingedLanes, i3 = e3.expirationTimes, a3 = e3.pendingLanes & -62914561; 0 <
      a3; ) {
        var o3 = 31 - We2(a3), s3 = 1 << o3, c3 = i3[o3];
        c3 === -1 ? ((s3 & n3) === 0 || (s3 & r3) !== 0) && (i3[o3] = $e2(s3, t3)) : c3 <= t3 && (e3.expiredLanes |=
        s3), a3 &= ~s3;
      }
      if (t3 = q, n3 = Y, n3 = Ze2(e3, e3 === t3 ? n3 : 0, e3.cancelPendingCommit !== null || e3.timeoutHandle !==
      -1), r3 = e3.callbackNode, n3 === 0 || e3 === t3 && (X === 2 || X === 9) || e3.cancelPendingCommit !== null)
       return r3 !== null && r3 !== null && ke2(r3), e3.callbackNode = null, e3.callbackPriority = 0;
      if (!(n3 & 3) || Qe2(e3, n3)) {
        if (t3 = n3 & -n3, t3 === e3.callbackPriority) return t3;
        switch (r3 !== null && ke2(r3), st2(n3)) {
          case 2:
          case 8:
            n3 = Fe2;
            break;
          case 32:
            n3 = Ie2;
            break;
          case 268435456:
            n3 = Re2;
            break;
          default:
            n3 = Ie2;
        }
        return r3 = cd.bind(null, e3), n3 = Oe2(n3, r3), e3.callbackPriority = t3, e3.callbackNode = n3, t3;
      }
      return r3 !== null && r3 !== null && ke2(r3), e3.callbackPriority = 2, e3.callbackNode = null, 2;
    }
    function cd(e3, t3) {
      if (iu !== 0 && iu !== 5) return e3.callbackNode = null, e3.callbackPriority = 0, null;
      var n3 = e3.callbackNode;
      if (Hu() && e3.callbackNode !== n3) return null;
      var r3 = Y;
      return r3 = Ze2(e3, e3 === q ? r3 : 0, e3.cancelPendingCommit !== null || e3.timeoutHandle !== -1), r3 ===
      0 ? null : (gu(e3, r3, t3), sd(e3, Me2()), e3.callbackNode != null && e3.callbackNode === n3 ? cd.bind(null,
      e3) : null);
    }
    function ld(e3, t3) {
      if (Hu()) return null;
      gu(e3, t3, true);
    }
    function ud() {
      Yd(function() {
        K & 6 ? Oe2(Pe2, ad) : od();
      });
    }
    function dd() {
      if (nd === 0) {
        var e3 = ua;
        e3 === 0 && (e3 = M2, M2 <<= 1, !(M2 & 261888) && (M2 = 256)), nd = e3;
      }
      return nd;
    }
    function fd(e3) {
      return e3 == null || typeof e3 == `symbol` || typeof e3 == `boolean` ? null : typeof e3 == `function` ? e3 :
      I2(`` + e3);
    }
    function pd(e3, t3) {
      var n3 = t3.ownerDocument.createElement(`input`);
      return n3.name = t3.name, n3.value = t3.value, e3.id && n3.setAttribute(`form`, e3.id), t3.parentNode.insertBefore(
      n3, t3), e3 = new FormData(e3), n3.parentNode.removeChild(n3), e3;
    }
    function md(e3, t3, n3, r3, i3) {
      if (t3 === `submit` && n3 && n3.stateNode === i3) {
        var a3 = fd((i3[ft2] || null).action), o3 = r3.submitter;
        o3 && (t3 = (t3 = o3[ft2] || null) ? fd(t3.formAction) : o3.getAttribute(`formAction`), t3 !== null &&
        (a3 = t3, o3 = null));
        var s3 = new Sn2(`action`, `action`, null, r3, i3);
        e3.push({ event: s3, listeners: [{ instance: null, listener: function() {
          if (r3.defaultPrevented) {
            if (nd !== 0) {
              var e4 = o3 ? pd(i3, o3) : new FormData(i3);
              ws(n3, { pending: true, data: e4, method: i3.method, action: a3 }, null, e4);
            }
          } else typeof a3 == `function` && (s3.preventDefault(), e4 = o3 ? pd(i3, o3) : new FormData(i3), ws(
          n3, { pending: true, data: e4, method: i3.method, action: a3 }, a3, e4));
        }, currentTarget: i3 }] });
      }
    }
    for (var hd = 0; hd < qr2.length; hd++) {
      var gd = qr2[hd];
      Jr2(gd.toLowerCase(), `on` + (gd[0].toUpperCase() + gd.slice(1)));
    }
    Jr2(zr2, `onAnimationEnd`), Jr2(Br2, `onAnimationIteration`), Jr2(Vr2, `onAnimationStart`), Jr2(`dblclick`,
    `onDoubleClick`), Jr2(`focusin`, `onFocus`), Jr2(`focusout`, `onBlur`), Jr2(Hr2, `onTransitionRun`), Jr2(Ur2,
    `onTransitionStart`), Jr2(Wr2, `onTransitionCancel`), Jr2(Gr2, `onTransitionEnd`), Et2(`onMouseEnter`, [`m\
ouseout`, `mouseover`]), Et2(`onMouseLeave`, [`mouseout`, `mouseover`]), Et2(`onPointerEnter`, [`pointerout`, `\
pointerover`]), Et2(`onPointerLeave`, [`pointerout`, `pointerover`]), Tt2(`onChange`, `change click focusin fo\
cusout input keydown keyup selectionchange`.split(` `)), Tt2(`onSelect`, `focusout contextmenu dragend focusin\
 keydown keyup mousedown mouseup selectionchange`.split(` `)), Tt2(`onBeforeInput`, [`compositionend`, `keypre\
ss`, `textInput`, `paste`]), Tt2(`onCompositionEnd`, `compositionend focusout keydown keypress keyup mousedown`.
    split(` `)), Tt2(`onCompositionStart`, `compositionstart focusout keydown keypress keyup mousedown`.split(
    ` `)), Tt2(`onCompositionUpdate`, `compositionupdate focusout keydown keypress keyup mousedown`.split(` `));
    var _d = `abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetad\
ata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumech\
ange waiting`.split(` `), vd = new Set(`beforetoggle cancel close invalid load scroll scrollend toggle`.split(
    ` `).concat(_d));
    function yd(e3, t3) {
      t3 = !!(t3 & 4);
      for (var n3 = 0; n3 < e3.length; n3++) {
        var r3 = e3[n3], i3 = r3.event;
        r3 = r3.listeners;
        a: {
          var a3 = void 0;
          if (t3) for (var o3 = r3.length - 1; 0 <= o3; o3--) {
            var s3 = r3[o3], c3 = s3.instance, l3 = s3.currentTarget;
            if (s3 = s3.listener, c3 !== a3 && i3.isPropagationStopped()) break a;
            a3 = s3, i3.currentTarget = l3;
            try {
              a3(i3);
            } catch (e4) {
              Yr2(e4);
            }
            i3.currentTarget = null, a3 = c3;
          }
          else for (o3 = 0; o3 < r3.length; o3++) {
            if (s3 = r3[o3], c3 = s3.instance, l3 = s3.currentTarget, s3 = s3.listener, c3 !== a3 && i3.isPropagationStopped())
             break a;
            a3 = s3, i3.currentTarget = l3;
            try {
              a3(i3);
            } catch (e4) {
              Yr2(e4);
            }
            i3.currentTarget = null, a3 = c3;
          }
        }
      }
    }
    function Q(e3, t3) {
      var n3 = t3[P2];
      n3 === void 0 && (n3 = t3[P2] = /* @__PURE__ */ new Set());
      var r3 = e3 + `__bubble`;
      n3.has(r3) || (Cd(t3, e3, 2, false), n3.add(r3));
    }
    function bd(e3, t3, n3) {
      var r3 = 0;
      t3 && (r3 |= 4), Cd(n3, e3, r3, t3);
    }
    var xd = `_reactListening` + Math.random().toString(36).slice(2);
    function Sd(e3) {
      if (!e3[xd]) {
        e3[xd] = true, Ct2.forEach(function(t4) {
          t4 !== `selectionchange` && (vd.has(t4) || bd(t4, false, e3), bd(t4, true, e3));
        });
        var t3 = e3.nodeType === 9 ? e3 : e3.ownerDocument;
        t3 === null || t3[xd] || (t3[xd] = true, bd(`selectionchange`, false, t3));
      }
    }
    function Cd(e3, t3, n3, r3) {
      switch (mp(t3)) {
        case 2:
          var i3 = cp;
          break;
        case 8:
          i3 = lp;
          break;
        default:
          i3 = up;
      }
      n3 = i3.bind(null, t3, n3, e3), i3 = void 0, !dn2 || t3 !== `touchstart` && t3 !== `touchmove` && t3 !==
      `wheel` || (i3 = true), r3 ? i3 === void 0 ? e3.addEventListener(t3, n3, true) : e3.addEventListener(t3,
      n3, { capture: true, passive: i3 }) : i3 === void 0 ? e3.addEventListener(t3, n3, false) : e3.addEventListener(
      t3, n3, { passive: i3 });
    }
    function wd(e3, t3, n3, r3, i3) {
      var a3 = r3;
      if (!(t3 & 1) && !(t3 & 2) && r3 !== null) a: for (; ; ) {
        if (r3 === null) return;
        var s3 = r3.tag;
        if (s3 === 3 || s3 === 4) {
          var c3 = r3.stateNode.containerInfo;
          if (c3 === i3) break;
          if (s3 === 4) for (s3 = r3.return; s3 !== null; ) {
            var l3 = s3.tag;
            if ((l3 === 3 || l3 === 4) && s3.stateNode.containerInfo === i3) return;
            s3 = s3.return;
          }
          for (; c3 !== null; ) {
            if (s3 = yt2(c3), s3 === null) return;
            if (l3 = s3.tag, l3 === 5 || l3 === 6 || l3 === 26 || l3 === 27) {
              r3 = a3 = s3;
              continue a;
            }
            c3 = c3.parentNode;
          }
        }
        r3 = r3.return;
      }
      cn2(function() {
        var r4 = a3, i4 = rn2(n3), s4 = [];
        a: {
          var c4 = Kr2.get(e3);
          if (c4 !== void 0) {
            var l4 = Sn2, u2 = e3;
            switch (e3) {
              case `keypress`:
                if (_n2(n3) === 0) break a;
              case `keydown`:
              case `keyup`:
                l4 = z2;
                break;
              case `focusin`:
                u2 = `focus`, l4 = jn2;
                break;
              case `focusout`:
                u2 = `blur`, l4 = jn2;
                break;
              case `beforeblur`:
              case `afterblur`:
                l4 = jn2;
                break;
              case `click`:
                if (n3.button === 2) break a;
              case `auxclick`:
              case `dblclick`:
              case `mousedown`:
              case `mousemove`:
              case `mouseup`:
              case `mouseout`:
              case `mouseover`:
              case `contextmenu`:
                l4 = kn2;
                break;
              case `drag`:
              case `dragend`:
              case `dragenter`:
              case `dragexit`:
              case `dragleave`:
              case `dragover`:
              case `dragstart`:
              case `drop`:
                l4 = An2;
                break;
              case `touchcancel`:
              case `touchend`:
              case `touchmove`:
              case `touchstart`:
                l4 = Bn2;
                break;
              case zr2:
              case Br2:
              case Vr2:
                l4 = Mn2;
                break;
              case Gr2:
                l4 = Vn2;
                break;
              case `scroll`:
              case `scrollend`:
                l4 = wn2;
                break;
              case `wheel`:
                l4 = Hn2;
                break;
              case `copy`:
              case `cut`:
              case `paste`:
                l4 = Nn2;
                break;
              case `gotpointercapture`:
              case `lostpointercapture`:
              case `pointercancel`:
              case `pointerdown`:
              case `pointermove`:
              case `pointerout`:
              case `pointerover`:
              case `pointerup`:
                l4 = zn2;
                break;
              case `toggle`:
              case `beforetoggle`:
                l4 = Un2;
            }
            var d3 = !!(t3 & 4), f2 = !d3 && (e3 === `scroll` || e3 === `scrollend`), p3 = d3 ? c4 === null ? null :
            c4 + `Capture` : c4;
            d3 = [];
            for (var m2 = r4, h3; m2 !== null; ) {
              var g3 = m2;
              if (h3 = g3.stateNode, g3 = g3.tag, g3 !== 5 && g3 !== 26 && g3 !== 27 || h3 === null || p3 === null ||
              (g3 = ln2(m2, p3), g3 != null && d3.push(Td(m2, g3, h3))), f2) break;
              m2 = m2.return;
            }
            0 < d3.length && (c4 = new l4(c4, u2, null, n3, i4), s4.push({ event: c4, listeners: d3 }));
          }
        }
        if (!(t3 & 7)) {
          a: {
            if (c4 = e3 === `mouseover` || e3 === `pointerover`, l4 = e3 === `mouseout` || e3 === `pointerout`,
            c4 && n3 !== nn2 && (u2 = n3.relatedTarget || n3.fromElement) && (yt2(u2) || u2[pt2])) break a;
            if ((l4 || c4) && (c4 = i4.window === i4 ? i4 : (c4 = i4.ownerDocument) ? c4.defaultView || c4.parentWindow :
            window, l4 ? (u2 = n3.relatedTarget || n3.toElement, l4 = r4, u2 = u2 ? yt2(u2) : null, u2 !== null &&
            (f2 = o2(u2), d3 = u2.tag, u2 !== f2 || d3 !== 5 && d3 !== 27 && d3 !== 6) && (u2 = null)) : (l4 =
            null, u2 = r4), l4 !== u2)) {
              if (d3 = kn2, g3 = `onMouseLeave`, p3 = `onMouseEnter`, m2 = `mouse`, (e3 === `pointerout` || e3 ===
              `pointerover`) && (d3 = zn2, g3 = `onPointerLeave`, p3 = `onPointerEnter`, m2 = `pointer`), f2 =
              l4 == null ? c4 : F2(l4), h3 = u2 == null ? c4 : F2(u2), c4 = new d3(g3, m2 + `leave`, l4, n3, i4),
              c4.target = f2, c4.relatedTarget = h3, g3 = null, yt2(i4) === r4 && (d3 = new d3(p3, m2 + `enter`,
              u2, n3, i4), d3.target = h3, d3.relatedTarget = f2, g3 = d3), f2 = g3, l4 && u2) b: {
                for (d3 = Dd, p3 = l4, m2 = u2, h3 = 0, g3 = p3; g3; g3 = d3(g3)) h3++;
                g3 = 0;
                for (var _3 = m2; _3; _3 = d3(_3)) g3++;
                for (; 0 < h3 - g3; ) p3 = d3(p3), h3--;
                for (; 0 < g3 - h3; ) m2 = d3(m2), g3--;
                for (; h3--; ) {
                  if (p3 === m2 || m2 !== null && p3 === m2.alternate) {
                    d3 = p3;
                    break b;
                  }
                  p3 = d3(p3), m2 = d3(m2);
                }
                d3 = null;
              }
              else d3 = null;
              l4 !== null && Od(s4, c4, l4, d3, false), u2 !== null && f2 !== null && Od(s4, f2, u2, d3, true);
            }
          }
          a: {
            if (c4 = r4 ? F2(r4) : window, l4 = c4.nodeName && c4.nodeName.toLowerCase(), l4 === `select` || l4 ===
            `input` && c4.type === `file`) var v3 = lr2;
            else if (rr2(c4)) {
              if (ur2) v3 = yr2;
              else {
                v3 = _r2;
                var y3 = gr2;
              }
            } else l4 = c4.nodeName, !l4 || l4.toLowerCase() !== `input` || c4.type !== `checkbox` && c4.type !==
            `radio` ? r4 && Qt2(r4.elementType) && (v3 = lr2) : v3 = vr2;
            if (v3 &&= v3(e3, r4)) {
              ir2(s4, v3, n3, i4);
              break a;
            }
            y3 && y3(e3, c4, r4), e3 === `focusout` && r4 && c4.type === `number` && r4.memoizedProps.value !=
            null && Wt2(c4, `number`, c4.value);
          }
          switch (y3 = r4 ? F2(r4) : window, e3) {
            case `focusin`:
              (rr2(y3) || y3.contentEditable === `true`) && (kr2 = y3, Ar2 = r4, jr2 = null);
              break;
            case `focusout`:
              jr2 = Ar2 = kr2 = null;
              break;
            case `mousedown`:
              Mr2 = true;
              break;
            case `contextmenu`:
            case `mouseup`:
            case `dragend`:
              Mr2 = false, Nr2(s4, n3, i4);
              break;
            case `selectionchange`:
              if (Or2) break;
            case `keydown`:
            case `keyup`:
              Nr2(s4, n3, i4);
          }
          var b3;
          if (Gn2) b: {
            switch (e3) {
              case `compositionstart`:
                var x3 = `onCompositionStart`;
                break b;
              case `compositionend`:
                x3 = `onCompositionEnd`;
                break b;
              case `compositionupdate`:
                x3 = `onCompositionUpdate`;
                break b;
            }
            x3 = void 0;
          }
          else $n2 ? Zn2(e3, n3) && (x3 = `onCompositionEnd`) : e3 === `keydown` && n3.keyCode === 229 && (x3 =
          `onCompositionStart`);
          x3 && (Jn2 && n3.locale !== `ko` && ($n2 || x3 !== `onCompositionStart` ? x3 === `onCompositionEnd` &&
          $n2 && (b3 = gn2()) : (pn2 = i4, mn2 = `value` in pn2 ? pn2.value : pn2.textContent, $n2 = true)), y3 =
          Ed(r4, x3), 0 < y3.length && (x3 = new Pn2(x3, e3, null, n3, i4), s4.push({ event: x3, listeners: y3 }),
          b3 ? x3.data = b3 : (b3 = Qn2(n3), b3 !== null && (x3.data = b3)))), (b3 = qn2 ? er2(e3, n3) : tr2(e3,
          n3)) && (x3 = Ed(r4, `onBeforeInput`), 0 < x3.length && (y3 = new Pn2(`onBeforeInput`, `beforeinput`,
          null, n3, i4), s4.push({ event: y3, listeners: x3 }), y3.data = b3)), md(s4, e3, r4, n3, i4);
        }
        yd(s4, t3);
      });
    }
    function Td(e3, t3, n3) {
      return { instance: e3, listener: t3, currentTarget: n3 };
    }
    function Ed(e3, t3) {
      for (var n3 = t3 + `Capture`, r3 = []; e3 !== null; ) {
        var i3 = e3, a3 = i3.stateNode;
        if (i3 = i3.tag, i3 !== 5 && i3 !== 26 && i3 !== 27 || a3 === null || (i3 = ln2(e3, n3), i3 != null &&
        r3.unshift(Td(e3, i3, a3)), i3 = ln2(e3, t3), i3 != null && r3.push(Td(e3, i3, a3))), e3.tag === 3) return r3;
        e3 = e3.return;
      }
      return [];
    }
    function Dd(e3) {
      if (e3 === null) return null;
      do
        e3 = e3.return;
      while (e3 && e3.tag !== 5 && e3.tag !== 27);
      return e3 || null;
    }
    function Od(e3, t3, n3, r3, i3) {
      for (var a3 = t3._reactName, o3 = []; n3 !== null && n3 !== r3; ) {
        var s3 = n3, c3 = s3.alternate, l3 = s3.stateNode;
        if (s3 = s3.tag, c3 !== null && c3 === r3) break;
        s3 !== 5 && s3 !== 26 && s3 !== 27 || l3 === null || (c3 = l3, i3 ? (l3 = ln2(n3, a3), l3 != null && o3.
        unshift(Td(n3, l3, c3))) : i3 || (l3 = ln2(n3, a3), l3 != null && o3.push(Td(n3, l3, c3)))), n3 = n3.return;
      }
      o3.length !== 0 && e3.push({ event: t3, listeners: o3 });
    }
    var kd = /\r\n?/g, Ad = /\u0000|\uFFFD/g;
    function jd(e3) {
      return (typeof e3 == `string` ? e3 : `` + e3).replace(kd, `
`).replace(Ad, ``);
    }
    function Md(e3, t3) {
      return t3 = jd(t3), jd(e3) === t3;
    }
    function $(e3, t3, n3, r3, a3, o3) {
      switch (n3) {
        case `children`:
          typeof r3 == `string` ? t3 === `body` || t3 === `textarea` && r3 === `` || Jt2(e3, r3) : (typeof r3 ==
          `number` || typeof r3 == `bigint`) && t3 !== `body` && Jt2(e3, `` + r3);
          break;
        case `className`:
          Mt2(e3, `class`, r3);
          break;
        case `tabIndex`:
          Mt2(e3, `tabindex`, r3);
          break;
        case `dir`:
        case `role`:
        case `viewBox`:
        case `width`:
        case `height`:
          Mt2(e3, n3, r3);
          break;
        case `style`:
          Zt2(e3, r3, o3);
          break;
        case `data`:
          if (t3 !== `object`) {
            Mt2(e3, `data`, r3);
            break;
          }
        case `src`:
        case `href`:
          if (r3 === `` && (t3 !== `a` || n3 !== `href`)) {
            e3.removeAttribute(n3);
            break;
          }
          if (r3 == null || typeof r3 == `function` || typeof r3 == `symbol` || typeof r3 == `boolean`) {
            e3.removeAttribute(n3);
            break;
          }
          r3 = I2(`` + r3), e3.setAttribute(n3, r3);
          break;
        case `action`:
        case `formAction`:
          if (typeof r3 == `function`) {
            e3.setAttribute(n3, `javascript:throw new Error('A React form was unexpectedly submitted. If you c\
alled form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stop\
Propagation() in a submit event handler, consider also calling event.preventDefault().')`);
            break;
          }
          if (typeof o3 == `function` && (n3 === `formAction` ? (t3 !== `input` && $(e3, t3, `name`, a3.name, a3,
          null), $(e3, t3, `formEncType`, a3.formEncType, a3, null), $(e3, t3, `formMethod`, a3.formMethod, a3,
          null), $(e3, t3, `formTarget`, a3.formTarget, a3, null)) : ($(e3, t3, `encType`, a3.encType, a3, null),
          $(e3, t3, `method`, a3.method, a3, null), $(e3, t3, `target`, a3.target, a3, null))), r3 == null || typeof r3 ==
          `symbol` || typeof r3 == `boolean`) {
            e3.removeAttribute(n3);
            break;
          }
          r3 = I2(`` + r3), e3.setAttribute(n3, r3);
          break;
        case `onClick`:
          r3 != null && (e3.onclick = tn2);
          break;
        case `onScroll`:
          r3 != null && Q(`scroll`, e3);
          break;
        case `onScrollEnd`:
          r3 != null && Q(`scrollend`, e3);
          break;
        case `dangerouslySetInnerHTML`:
          if (r3 != null) {
            if (typeof r3 != `object` || !(`__html` in r3)) throw Error(i2(61));
            if (n3 = r3.__html, n3 != null) {
              if (a3.children != null) throw Error(i2(60));
              e3.innerHTML = n3;
            }
          }
          break;
        case `multiple`:
          e3.multiple = r3 && typeof r3 != `function` && typeof r3 != `symbol`;
          break;
        case `muted`:
          e3.muted = r3 && typeof r3 != `function` && typeof r3 != `symbol`;
          break;
        case `suppressContentEditableWarning`:
        case `suppressHydrationWarning`:
        case `defaultValue`:
        case `defaultChecked`:
        case `innerHTML`:
        case `ref`:
          break;
        case `autoFocus`:
          break;
        case `xlinkHref`:
          if (r3 == null || typeof r3 == `function` || typeof r3 == `boolean` || typeof r3 == `symbol`) {
            e3.removeAttribute(`xlink:href`);
            break;
          }
          n3 = I2(`` + r3), e3.setAttributeNS(`http://www.w3.org/1999/xlink`, `xlink:href`, n3);
          break;
        case `contentEditable`:
        case `spellCheck`:
        case `draggable`:
        case `value`:
        case `autoReverse`:
        case `externalResourcesRequired`:
        case `focusable`:
        case `preserveAlpha`:
          r3 != null && typeof r3 != `function` && typeof r3 != `symbol` ? e3.setAttribute(n3, `` + r3) : e3.removeAttribute(
          n3);
          break;
        case `inert`:
        case `allowFullScreen`:
        case `async`:
        case `autoPlay`:
        case `controls`:
        case `default`:
        case `defer`:
        case `disabled`:
        case `disablePictureInPicture`:
        case `disableRemotePlayback`:
        case `formNoValidate`:
        case `hidden`:
        case `loop`:
        case `noModule`:
        case `noValidate`:
        case `open`:
        case `playsInline`:
        case `readOnly`:
        case `required`:
        case `reversed`:
        case `scoped`:
        case `seamless`:
        case `itemScope`:
          r3 && typeof r3 != `function` && typeof r3 != `symbol` ? e3.setAttribute(n3, ``) : e3.removeAttribute(
          n3);
          break;
        case `capture`:
        case `download`:
          true === r3 ? e3.setAttribute(n3, ``) : false !== r3 && r3 != null && typeof r3 != `function` && typeof r3 !=
          `symbol` ? e3.setAttribute(n3, r3) : e3.removeAttribute(n3);
          break;
        case `cols`:
        case `rows`:
        case `size`:
        case `span`:
          r3 != null && typeof r3 != `function` && typeof r3 != `symbol` && !isNaN(r3) && 1 <= r3 ? e3.setAttribute(
          n3, r3) : e3.removeAttribute(n3);
          break;
        case `rowSpan`:
        case `start`:
          r3 == null || typeof r3 == `function` || typeof r3 == `symbol` || isNaN(r3) ? e3.removeAttribute(n3) :
          e3.setAttribute(n3, r3);
          break;
        case `popover`:
          Q(`beforetoggle`, e3), Q(`toggle`, e3), jt2(e3, `popover`, r3);
          break;
        case `xlinkActuate`:
          Nt2(e3, `http://www.w3.org/1999/xlink`, `xlink:actuate`, r3);
          break;
        case `xlinkArcrole`:
          Nt2(e3, `http://www.w3.org/1999/xlink`, `xlink:arcrole`, r3);
          break;
        case `xlinkRole`:
          Nt2(e3, `http://www.w3.org/1999/xlink`, `xlink:role`, r3);
          break;
        case `xlinkShow`:
          Nt2(e3, `http://www.w3.org/1999/xlink`, `xlink:show`, r3);
          break;
        case `xlinkTitle`:
          Nt2(e3, `http://www.w3.org/1999/xlink`, `xlink:title`, r3);
          break;
        case `xlinkType`:
          Nt2(e3, `http://www.w3.org/1999/xlink`, `xlink:type`, r3);
          break;
        case `xmlBase`:
          Nt2(e3, `http://www.w3.org/XML/1998/namespace`, `xml:base`, r3);
          break;
        case `xmlLang`:
          Nt2(e3, `http://www.w3.org/XML/1998/namespace`, `xml:lang`, r3);
          break;
        case `xmlSpace`:
          Nt2(e3, `http://www.w3.org/XML/1998/namespace`, `xml:space`, r3);
          break;
        case `is`:
          jt2(e3, `is`, r3);
          break;
        case `innerText`:
        case `textContent`:
          break;
        default:
          (!(2 < n3.length) || n3[0] !== `o` && n3[0] !== `O` || n3[1] !== `n` && n3[1] !== `N`) && (n3 = $t2.
          get(n3) || n3, jt2(e3, n3, r3));
      }
    }
    function Nd(e3, t3, n3, r3, a3, o3) {
      switch (n3) {
        case `style`:
          Zt2(e3, r3, o3);
          break;
        case `dangerouslySetInnerHTML`:
          if (r3 != null) {
            if (typeof r3 != `object` || !(`__html` in r3)) throw Error(i2(61));
            if (n3 = r3.__html, n3 != null) {
              if (a3.children != null) throw Error(i2(60));
              e3.innerHTML = n3;
            }
          }
          break;
        case `children`:
          typeof r3 == `string` ? Jt2(e3, r3) : (typeof r3 == `number` || typeof r3 == `bigint`) && Jt2(e3, `` +
          r3);
          break;
        case `onScroll`:
          r3 != null && Q(`scroll`, e3);
          break;
        case `onScrollEnd`:
          r3 != null && Q(`scrollend`, e3);
          break;
        case `onClick`:
          r3 != null && (e3.onclick = tn2);
          break;
        case `suppressContentEditableWarning`:
        case `suppressHydrationWarning`:
        case `innerHTML`:
        case `ref`:
          break;
        case `innerText`:
        case `textContent`:
          break;
        default:
          if (!wt2.hasOwnProperty(n3)) a: {
            if (n3[0] === `o` && n3[1] === `n` && (a3 = n3.endsWith(`Capture`), t3 = n3.slice(2, a3 ? n3.length -
            7 : void 0), o3 = e3[ft2] || null, o3 = o3 == null ? null : o3[n3], typeof o3 == `function` && e3.
            removeEventListener(t3, o3, a3), typeof r3 == `function`)) {
              typeof o3 != `function` && o3 !== null && (n3 in e3 ? e3[n3] = null : e3.hasAttribute(n3) && e3.
              removeAttribute(n3)), e3.addEventListener(t3, r3, a3);
              break a;
            }
            n3 in e3 ? e3[n3] = r3 : true === r3 ? e3.setAttribute(n3, ``) : jt2(e3, n3, r3);
          }
      }
    }
    function Pd(e3, t3, n3) {
      switch (t3) {
        case `div`:
        case `span`:
        case `svg`:
        case `path`:
        case `a`:
        case `g`:
        case `p`:
        case `li`:
          break;
        case `img`:
          Q(`error`, e3), Q(`load`, e3);
          var r3 = false, a3 = false, o3;
          for (o3 in n3) if (n3.hasOwnProperty(o3)) {
            var s3 = n3[o3];
            if (s3 != null) switch (o3) {
              case `src`:
                r3 = true;
                break;
              case `srcSet`:
                a3 = true;
                break;
              case `children`:
              case `dangerouslySetInnerHTML`:
                throw Error(i2(137, t3));
              default:
                $(e3, t3, o3, s3, n3, null);
            }
          }
          a3 && $(e3, t3, `srcSet`, n3.srcSet, n3, null), r3 && $(e3, t3, `src`, n3.src, n3, null);
          return;
        case `input`:
          Q(`invalid`, e3);
          var c3 = o3 = s3 = a3 = null, l3 = null, u2 = null;
          for (r3 in n3) if (n3.hasOwnProperty(r3)) {
            var d3 = n3[r3];
            if (d3 != null) switch (r3) {
              case `name`:
                a3 = d3;
                break;
              case `type`:
                s3 = d3;
                break;
              case `checked`:
                l3 = d3;
                break;
              case `defaultChecked`:
                u2 = d3;
                break;
              case `value`:
                o3 = d3;
                break;
              case `defaultValue`:
                c3 = d3;
                break;
              case `children`:
              case `dangerouslySetInnerHTML`:
                if (d3 != null) throw Error(i2(137, t3));
                break;
              default:
                $(e3, t3, r3, d3, n3, null);
            }
          }
          Ut2(e3, o3, c3, l3, u2, s3, a3, false);
          return;
        case `select`:
          for (a3 in Q(`invalid`, e3), r3 = s3 = o3 = null, n3) if (n3.hasOwnProperty(a3) && (c3 = n3[a3], c3 !=
          null)) switch (a3) {
            case `value`:
              o3 = c3;
              break;
            case `defaultValue`:
              s3 = c3;
              break;
            case `multiple`:
              r3 = c3;
            default:
              $(e3, t3, a3, c3, n3, null);
          }
          t3 = o3, n3 = s3, e3.multiple = !!r3, t3 == null ? n3 != null && Gt2(e3, !!r3, n3, true) : Gt2(e3, !!r3,
          t3, false);
          return;
        case `textarea`:
          for (s3 in Q(`invalid`, e3), o3 = a3 = r3 = null, n3) if (n3.hasOwnProperty(s3) && (c3 = n3[s3], c3 !=
          null)) switch (s3) {
            case `value`:
              r3 = c3;
              break;
            case `defaultValue`:
              a3 = c3;
              break;
            case `children`:
              o3 = c3;
              break;
            case `dangerouslySetInnerHTML`:
              if (c3 != null) throw Error(i2(91));
              break;
            default:
              $(e3, t3, s3, c3, n3, null);
          }
          qt2(e3, r3, a3, o3);
          return;
        case `option`:
          for (l3 in n3) if (n3.hasOwnProperty(l3) && (r3 = n3[l3], r3 != null)) switch (l3) {
            case `selected`:
              e3.selected = r3 && typeof r3 != `function` && typeof r3 != `symbol`;
              break;
            default:
              $(e3, t3, l3, r3, n3, null);
          }
          return;
        case `dialog`:
          Q(`beforetoggle`, e3), Q(`toggle`, e3), Q(`cancel`, e3), Q(`close`, e3);
          break;
        case `iframe`:
        case `object`:
          Q(`load`, e3);
          break;
        case `video`:
        case `audio`:
          for (r3 = 0; r3 < _d.length; r3++) Q(_d[r3], e3);
          break;
        case `image`:
          Q(`error`, e3), Q(`load`, e3);
          break;
        case `details`:
          Q(`toggle`, e3);
          break;
        case `embed`:
        case `source`:
        case `link`:
          Q(`error`, e3), Q(`load`, e3);
        case `area`:
        case `base`:
        case `br`:
        case `col`:
        case `hr`:
        case `keygen`:
        case `meta`:
        case `param`:
        case `track`:
        case `wbr`:
        case `menuitem`:
          for (u2 in n3) if (n3.hasOwnProperty(u2) && (r3 = n3[u2], r3 != null)) switch (u2) {
            case `children`:
            case `dangerouslySetInnerHTML`:
              throw Error(i2(137, t3));
            default:
              $(e3, t3, u2, r3, n3, null);
          }
          return;
        default:
          if (Qt2(t3)) {
            for (d3 in n3) n3.hasOwnProperty(d3) && (r3 = n3[d3], r3 !== void 0 && Nd(e3, t3, d3, r3, n3, void 0));
            return;
          }
      }
      for (c3 in n3) n3.hasOwnProperty(c3) && (r3 = n3[c3], r3 != null && $(e3, t3, c3, r3, n3, null));
    }
    function Fd(e3, t3, n3, r3) {
      switch (t3) {
        case `div`:
        case `span`:
        case `svg`:
        case `path`:
        case `a`:
        case `g`:
        case `p`:
        case `li`:
          break;
        case `input`:
          var a3 = null, o3 = null, s3 = null, c3 = null, l3 = null, u2 = null, d3 = null;
          for (m2 in n3) {
            var f2 = n3[m2];
            if (n3.hasOwnProperty(m2) && f2 != null) switch (m2) {
              case `checked`:
                break;
              case `value`:
                break;
              case `defaultValue`:
                l3 = f2;
              default:
                r3.hasOwnProperty(m2) || $(e3, t3, m2, null, r3, f2);
            }
          }
          for (var p3 in r3) {
            var m2 = r3[p3];
            if (f2 = n3[p3], r3.hasOwnProperty(p3) && (m2 != null || f2 != null)) switch (p3) {
              case `type`:
                o3 = m2;
                break;
              case `name`:
                a3 = m2;
                break;
              case `checked`:
                u2 = m2;
                break;
              case `defaultChecked`:
                d3 = m2;
                break;
              case `value`:
                s3 = m2;
                break;
              case `defaultValue`:
                c3 = m2;
                break;
              case `children`:
              case `dangerouslySetInnerHTML`:
                if (m2 != null) throw Error(i2(137, t3));
                break;
              default:
                m2 !== f2 && $(e3, t3, p3, m2, r3, f2);
            }
          }
          Ht2(e3, s3, c3, l3, u2, d3, o3, a3);
          return;
        case `select`:
          for (o3 in m2 = s3 = c3 = p3 = null, n3) if (l3 = n3[o3], n3.hasOwnProperty(o3) && l3 != null) switch (o3) {
            case `value`:
              break;
            case `multiple`:
              m2 = l3;
            default:
              r3.hasOwnProperty(o3) || $(e3, t3, o3, null, r3, l3);
          }
          for (a3 in r3) if (o3 = r3[a3], l3 = n3[a3], r3.hasOwnProperty(a3) && (o3 != null || l3 != null)) switch (a3) {
            case `value`:
              p3 = o3;
              break;
            case `defaultValue`:
              c3 = o3;
              break;
            case `multiple`:
              s3 = o3;
            default:
              o3 !== l3 && $(e3, t3, a3, o3, r3, l3);
          }
          t3 = c3, n3 = s3, r3 = m2, p3 == null ? !!r3 != !!n3 && (t3 == null ? Gt2(e3, !!n3, n3 ? [] : ``, false) :
          Gt2(e3, !!n3, t3, true)) : Gt2(e3, !!n3, p3, false);
          return;
        case `textarea`:
          for (c3 in m2 = p3 = null, n3) if (a3 = n3[c3], n3.hasOwnProperty(c3) && a3 != null && !r3.hasOwnProperty(
          c3)) switch (c3) {
            case `value`:
              break;
            case `children`:
              break;
            default:
              $(e3, t3, c3, null, r3, a3);
          }
          for (s3 in r3) if (a3 = r3[s3], o3 = n3[s3], r3.hasOwnProperty(s3) && (a3 != null || o3 != null)) switch (s3) {
            case `value`:
              p3 = a3;
              break;
            case `defaultValue`:
              m2 = a3;
              break;
            case `children`:
              break;
            case `dangerouslySetInnerHTML`:
              if (a3 != null) throw Error(i2(91));
              break;
            default:
              a3 !== o3 && $(e3, t3, s3, a3, r3, o3);
          }
          Kt2(e3, p3, m2);
          return;
        case `option`:
          for (var h3 in n3) if (p3 = n3[h3], n3.hasOwnProperty(h3) && p3 != null && !r3.hasOwnProperty(h3)) switch (h3) {
            case `selected`:
              e3.selected = false;
              break;
            default:
              $(e3, t3, h3, null, r3, p3);
          }
          for (l3 in r3) if (p3 = r3[l3], m2 = n3[l3], r3.hasOwnProperty(l3) && p3 !== m2 && (p3 != null || m2 !=
          null)) switch (l3) {
            case `selected`:
              e3.selected = p3 && typeof p3 != `function` && typeof p3 != `symbol`;
              break;
            default:
              $(e3, t3, l3, p3, r3, m2);
          }
          return;
        case `img`:
        case `link`:
        case `area`:
        case `base`:
        case `br`:
        case `col`:
        case `embed`:
        case `hr`:
        case `keygen`:
        case `meta`:
        case `param`:
        case `source`:
        case `track`:
        case `wbr`:
        case `menuitem`:
          for (var g3 in n3) p3 = n3[g3], n3.hasOwnProperty(g3) && p3 != null && !r3.hasOwnProperty(g3) && $(e3,
          t3, g3, null, r3, p3);
          for (u2 in r3) if (p3 = r3[u2], m2 = n3[u2], r3.hasOwnProperty(u2) && p3 !== m2 && (p3 != null || m2 !=
          null)) switch (u2) {
            case `children`:
            case `dangerouslySetInnerHTML`:
              if (p3 != null) throw Error(i2(137, t3));
              break;
            default:
              $(e3, t3, u2, p3, r3, m2);
          }
          return;
        default:
          if (Qt2(t3)) {
            for (var _3 in n3) p3 = n3[_3], n3.hasOwnProperty(_3) && p3 !== void 0 && !r3.hasOwnProperty(_3) &&
            Nd(e3, t3, _3, void 0, r3, p3);
            for (d3 in r3) p3 = r3[d3], m2 = n3[d3], !r3.hasOwnProperty(d3) || p3 === m2 || p3 === void 0 && m2 ===
            void 0 || Nd(e3, t3, d3, p3, r3, m2);
            return;
          }
      }
      for (var v3 in n3) p3 = n3[v3], n3.hasOwnProperty(v3) && p3 != null && !r3.hasOwnProperty(v3) && $(e3, t3,
      v3, null, r3, p3);
      for (f2 in r3) p3 = r3[f2], m2 = n3[f2], !r3.hasOwnProperty(f2) || p3 === m2 || p3 == null && m2 == null ||
      $(e3, t3, f2, p3, r3, m2);
    }
    function Id(e3) {
      switch (e3) {
        case `css`:
        case `script`:
        case `font`:
        case `img`:
        case `image`:
        case `input`:
        case `link`:
          return true;
        default:
          return false;
      }
    }
    function Ld() {
      if (typeof performance.getEntriesByType == `function`) {
        for (var e3 = 0, t3 = 0, n3 = performance.getEntriesByType(`resource`), r3 = 0; r3 < n3.length; r3++) {
          var i3 = n3[r3], a3 = i3.transferSize, o3 = i3.initiatorType, s3 = i3.duration;
          if (a3 && s3 && Id(o3)) {
            for (o3 = 0, s3 = i3.responseEnd, r3 += 1; r3 < n3.length; r3++) {
              var c3 = n3[r3], l3 = c3.startTime;
              if (l3 > s3) break;
              var u2 = c3.transferSize, d3 = c3.initiatorType;
              u2 && Id(d3) && (c3 = c3.responseEnd, o3 += u2 * (c3 < s3 ? 1 : (s3 - l3) / (c3 - l3)));
            }
            if (--r3, t3 += 8 * (a3 + o3) / (i3.duration / 1e3), e3++, 10 < e3) break;
          }
        }
        if (0 < e3) return t3 / e3 / 1e6;
      }
      return navigator.connection && (e3 = navigator.connection.downlink, typeof e3 == `number`) ? e3 : 5;
    }
    var Rd = null, zd = null;
    function Bd(e3) {
      return e3.nodeType === 9 ? e3 : e3.ownerDocument;
    }
    function Vd(e3) {
      switch (e3) {
        case `http://www.w3.org/2000/svg`:
          return 1;
        case `http://www.w3.org/1998/Math/MathML`:
          return 2;
        default:
          return 0;
      }
    }
    function Hd(e3, t3) {
      if (e3 === 0) switch (t3) {
        case `svg`:
          return 1;
        case `math`:
          return 2;
        default:
          return 0;
      }
      return e3 === 1 && t3 === `foreignObject` ? 0 : e3;
    }
    function Ud(e3, t3) {
      return e3 === `textarea` || e3 === `noscript` || typeof t3.children == `string` || typeof t3.children ==
      `number` || typeof t3.children == `bigint` || typeof t3.dangerouslySetInnerHTML == `object` && t3.dangerouslySetInnerHTML !==
      null && t3.dangerouslySetInnerHTML.__html != null;
    }
    var Wd = null;
    function Gd() {
      var e3 = window.event;
      return e3 && e3.type === `popstate` ? e3 !== Wd && (Wd = e3, true) : (Wd = null, false);
    }
    var Kd = typeof setTimeout == `function` ? setTimeout : void 0, qd = typeof clearTimeout == `function` ? clearTimeout :
    void 0, Jd = typeof Promise == `function` ? Promise : void 0, Yd = typeof queueMicrotask == `function` ? queueMicrotask :
    Jd === void 0 ? Kd : function(e3) {
      return Jd.resolve(null).then(e3).catch(Xd);
    };
    function Xd(e3) {
      setTimeout(function() {
        throw e3;
      });
    }
    function Zd(e3) {
      return e3 === `head`;
    }
    function Qd(e3, t3) {
      var n3 = t3, r3 = 0;
      do {
        var i3 = n3.nextSibling;
        if (e3.removeChild(n3), i3 && i3.nodeType === 8) {
          if (n3 = i3.data, n3 === `/$` || n3 === `/&`) {
            if (r3 === 0) {
              e3.removeChild(i3), Np(t3);
              return;
            }
            r3--;
          } else if (n3 === `$` || n3 === `$?` || n3 === `$~` || n3 === `$!` || n3 === `&`) r3++;
          else if (n3 === `html`) pf(e3.ownerDocument.documentElement);
          else if (n3 === `head`) {
            n3 = e3.ownerDocument.head, pf(n3);
            for (var a3 = n3.firstChild; a3; ) {
              var o3 = a3.nextSibling, s3 = a3.nodeName;
              a3[_t2] || s3 === `SCRIPT` || s3 === `STYLE` || s3 === `LINK` && a3.rel.toLowerCase() === `style\
sheet` || n3.removeChild(a3), a3 = o3;
            }
          } else n3 === `body` && pf(e3.ownerDocument.body);
        }
        n3 = i3;
      } while (n3);
      Np(t3);
    }
    function $d(e3, t3) {
      var n3 = e3;
      e3 = 0;
      do {
        var r3 = n3.nextSibling;
        if (n3.nodeType === 1 ? t3 ? (n3._stashedDisplay = n3.style.display, n3.style.display = `none`) : (n3.
        style.display = n3._stashedDisplay || ``, n3.getAttribute(`style`) === `` && n3.removeAttribute(`style`)) :
        n3.nodeType === 3 && (t3 ? (n3._stashedText = n3.nodeValue, n3.nodeValue = ``) : n3.nodeValue = n3._stashedText ||
        ``), r3 && r3.nodeType === 8) {
          if (n3 = r3.data, n3 === `/$`) {
            if (e3 === 0) break;
            e3--;
          } else n3 !== `$` && n3 !== `$?` && n3 !== `$~` && n3 !== `$!` || e3++;
        }
        n3 = r3;
      } while (n3);
    }
    function ef(e3) {
      var t3 = e3.firstChild;
      for (t3 && t3.nodeType === 10 && (t3 = t3.nextSibling); t3; ) {
        var n3 = t3;
        switch (t3 = t3.nextSibling, n3.nodeName) {
          case `HTML`:
          case `HEAD`:
          case `BODY`:
            ef(n3), vt2(n3);
            continue;
          case `SCRIPT`:
          case `STYLE`:
            continue;
          case `LINK`:
            if (n3.rel.toLowerCase() === `stylesheet`) continue;
        }
        e3.removeChild(n3);
      }
    }
    function tf(e3, t3, n3, r3) {
      for (; e3.nodeType === 1; ) {
        var i3 = n3;
        if (e3.nodeName.toLowerCase() !== t3.toLowerCase()) {
          if (!r3 && (e3.nodeName !== `INPUT` || e3.type !== `hidden`)) break;
        } else if (!r3) {
          if (t3 === `input` && e3.type === `hidden`) {
            var a3 = i3.name == null ? null : `` + i3.name;
            if (i3.type === `hidden` && e3.getAttribute(`name`) === a3) return e3;
          } else return e3;
        } else if (!e3[_t2]) switch (t3) {
          case `meta`:
            if (!e3.hasAttribute(`itemprop`)) break;
            return e3;
          case `link`:
            if (a3 = e3.getAttribute(`rel`), a3 === `stylesheet` && e3.hasAttribute(`data-precedence`) || a3 !==
            i3.rel || e3.getAttribute(`href`) !== (i3.href == null || i3.href === `` ? null : i3.href) || e3.getAttribute(
            `crossorigin`) !== (i3.crossOrigin == null ? null : i3.crossOrigin) || e3.getAttribute(`title`) !==
            (i3.title == null ? null : i3.title)) break;
            return e3;
          case `style`:
            if (e3.hasAttribute(`data-precedence`)) break;
            return e3;
          case `script`:
            if (a3 = e3.getAttribute(`src`), (a3 !== (i3.src == null ? null : i3.src) || e3.getAttribute(`type`) !==
            (i3.type == null ? null : i3.type) || e3.getAttribute(`crossorigin`) !== (i3.crossOrigin == null ?
            null : i3.crossOrigin)) && a3 && e3.hasAttribute(`async`) && !e3.hasAttribute(`itemprop`)) break;
            return e3;
          default:
            return e3;
        }
        if (e3 = cf(e3.nextSibling), e3 === null) break;
      }
      return null;
    }
    function nf(e3, t3, n3) {
      if (t3 === ``) return null;
      for (; e3.nodeType !== 3; ) if ((e3.nodeType !== 1 || e3.nodeName !== `INPUT` || e3.type !== `hidden`) &&
      !n3 || (e3 = cf(e3.nextSibling), e3 === null)) return null;
      return e3;
    }
    function rf(e3, t3) {
      for (; e3.nodeType !== 8; ) if ((e3.nodeType !== 1 || e3.nodeName !== `INPUT` || e3.type !== `hidden`) &&
      !t3 || (e3 = cf(e3.nextSibling), e3 === null)) return null;
      return e3;
    }
    function af(e3) {
      return e3.data === `$?` || e3.data === `$~`;
    }
    function of(e3) {
      return e3.data === `$!` || e3.data === `$?` && e3.ownerDocument.readyState !== `loading`;
    }
    function sf(e3, t3) {
      var n3 = e3.ownerDocument;
      if (e3.data === `$~`) e3._reactRetry = t3;
      else if (e3.data !== `$?` || n3.readyState !== `loading`) t3();
      else {
        var r3 = function() {
          t3(), n3.removeEventListener(`DOMContentLoaded`, r3);
        };
        n3.addEventListener(`DOMContentLoaded`, r3), e3._reactRetry = r3;
      }
    }
    function cf(e3) {
      for (; e3 != null; e3 = e3.nextSibling) {
        var t3 = e3.nodeType;
        if (t3 === 1 || t3 === 3) break;
        if (t3 === 8) {
          if (t3 = e3.data, t3 === `$` || t3 === `$!` || t3 === `$?` || t3 === `$~` || t3 === `&` || t3 === `F\
!` || t3 === `F`) break;
          if (t3 === `/$` || t3 === `/&`) return null;
        }
      }
      return e3;
    }
    var lf = null;
    function uf(e3) {
      e3 = e3.nextSibling;
      for (var t3 = 0; e3; ) {
        if (e3.nodeType === 8) {
          var n3 = e3.data;
          if (n3 === `/$` || n3 === `/&`) {
            if (t3 === 0) return cf(e3.nextSibling);
            t3--;
          } else n3 !== `$` && n3 !== `$!` && n3 !== `$?` && n3 !== `$~` && n3 !== `&` || t3++;
        }
        e3 = e3.nextSibling;
      }
      return null;
    }
    function df(e3) {
      e3 = e3.previousSibling;
      for (var t3 = 0; e3; ) {
        if (e3.nodeType === 8) {
          var n3 = e3.data;
          if (n3 === `$` || n3 === `$!` || n3 === `$?` || n3 === `$~` || n3 === `&`) {
            if (t3 === 0) return e3;
            t3--;
          } else n3 !== `/$` && n3 !== `/&` || t3++;
        }
        e3 = e3.previousSibling;
      }
      return null;
    }
    function ff(e3, t3, n3) {
      switch (t3 = Bd(n3), e3) {
        case `html`:
          if (e3 = t3.documentElement, !e3) throw Error(i2(452));
          return e3;
        case `head`:
          if (e3 = t3.head, !e3) throw Error(i2(453));
          return e3;
        case `body`:
          if (e3 = t3.body, !e3) throw Error(i2(454));
          return e3;
        default:
          throw Error(i2(451));
      }
    }
    function pf(e3) {
      for (var t3 = e3.attributes; t3.length; ) e3.removeAttributeNode(t3[0]);
      vt2(e3);
    }
    var mf = /* @__PURE__ */ new Map(), hf = /* @__PURE__ */ new Set();
    function gf(e3) {
      return typeof e3.getRootNode == `function` ? e3.getRootNode() : e3.nodeType === 9 ? e3 : e3.ownerDocument;
    }
    var _f = D2.d;
    D2.d = { f: vf, r: yf, D: Sf, C: Cf, L: wf, m: Tf, X: Df, S: Ef, M: Of };
    function vf() {
      var e3 = _f.f(), t3 = bu();
      return e3 || t3;
    }
    function yf(e3) {
      var t3 = bt2(e3);
      t3 !== null && t3.tag === 5 && t3.type === `form` ? Es(t3) : _f.r(e3);
    }
    var bf = typeof document > `u` ? null : document;
    function xf(e3, t3, n3) {
      var r3 = bf;
      if (r3 && typeof t3 == `string` && t3) {
        var i3 = Vt2(t3);
        i3 = `link[rel="` + e3 + `"][href="` + i3 + `"]`, typeof n3 == `string` && (i3 += `[crossorigin="` + n3 +
        `"]`), hf.has(i3) || (hf.add(i3), e3 = { rel: e3, crossOrigin: n3, href: t3 }, r3.querySelector(i3) ===
        null && (t3 = r3.createElement(`link`), Pd(t3, `link`, e3), St2(t3), r3.head.appendChild(t3)));
      }
    }
    function Sf(e3) {
      _f.D(e3), xf(`dns-prefetch`, e3, null);
    }
    function Cf(e3, t3) {
      _f.C(e3, t3), xf(`preconnect`, e3, t3);
    }
    function wf(e3, t3, n3) {
      _f.L(e3, t3, n3);
      var r3 = bf;
      if (r3 && e3 && t3) {
        var i3 = `link[rel="preload"][as="` + Vt2(t3) + `"]`;
        t3 === `image` && n3 && n3.imageSrcSet ? (i3 += `[imagesrcset="` + Vt2(n3.imageSrcSet) + `"]`, typeof n3.
        imageSizes == `string` && (i3 += `[imagesizes="` + Vt2(n3.imageSizes) + `"]`)) : i3 += `[href="` + Vt2(
        e3) + `"]`;
        var a3 = i3;
        switch (t3) {
          case `style`:
            a3 = Af(e3);
            break;
          case `script`:
            a3 = Pf(e3);
        }
        mf.has(a3) || (e3 = h2({ rel: `preload`, href: t3 === `image` && n3 && n3.imageSrcSet ? void 0 : e3, as: t3 },
        n3), mf.set(a3, e3), r3.querySelector(i3) !== null || t3 === `style` && r3.querySelector(jf(a3)) || t3 ===
        `script` && r3.querySelector(Ff(a3)) || (t3 = r3.createElement(`link`), Pd(t3, `link`, e3), St2(t3), r3.
        head.appendChild(t3)));
      }
    }
    function Tf(e3, t3) {
      _f.m(e3, t3);
      var n3 = bf;
      if (n3 && e3) {
        var r3 = t3 && typeof t3.as == `string` ? t3.as : `script`, i3 = `link[rel="modulepreload"][as="` + Vt2(
        r3) + `"][href="` + Vt2(e3) + `"]`, a3 = i3;
        switch (r3) {
          case `audioworklet`:
          case `paintworklet`:
          case `serviceworker`:
          case `sharedworker`:
          case `worker`:
          case `script`:
            a3 = Pf(e3);
        }
        if (!mf.has(a3) && (e3 = h2({ rel: `modulepreload`, href: e3 }, t3), mf.set(a3, e3), n3.querySelector(
        i3) === null)) {
          switch (r3) {
            case `audioworklet`:
            case `paintworklet`:
            case `serviceworker`:
            case `sharedworker`:
            case `worker`:
            case `script`:
              if (n3.querySelector(Ff(a3))) return;
          }
          r3 = n3.createElement(`link`), Pd(r3, `link`, e3), St2(r3), n3.head.appendChild(r3);
        }
      }
    }
    function Ef(e3, t3, n3) {
      _f.S(e3, t3, n3);
      var r3 = bf;
      if (r3 && e3) {
        var i3 = xt2(r3).hoistableStyles, a3 = Af(e3);
        t3 ||= `default`;
        var o3 = i3.get(a3);
        if (!o3) {
          var s3 = { loading: 0, preload: null };
          if (o3 = r3.querySelector(jf(a3))) s3.loading = 5;
          else {
            e3 = h2({ rel: `stylesheet`, href: e3, "data-precedence": t3 }, n3), (n3 = mf.get(a3)) && Rf(e3, n3);
            var c3 = o3 = r3.createElement(`link`);
            St2(c3), Pd(c3, `link`, e3), c3._p = new Promise(function(e4, t4) {
              c3.onload = e4, c3.onerror = t4;
            }), c3.addEventListener(`load`, function() {
              s3.loading |= 1;
            }), c3.addEventListener(`error`, function() {
              s3.loading |= 2;
            }), s3.loading |= 4, Lf(o3, t3, r3);
          }
          o3 = { type: `stylesheet`, instance: o3, count: 1, state: s3 }, i3.set(a3, o3);
        }
      }
    }
    function Df(e3, t3) {
      _f.X(e3, t3);
      var n3 = bf;
      if (n3 && e3) {
        var r3 = xt2(n3).hoistableScripts, i3 = Pf(e3), a3 = r3.get(i3);
        a3 || (a3 = n3.querySelector(Ff(i3)), a3 || (e3 = h2({ src: e3, async: true }, t3), (t3 = mf.get(i3)) &&
        zf(e3, t3), a3 = n3.createElement(`script`), St2(a3), Pd(a3, `link`, e3), n3.head.appendChild(a3)), a3 =
        { type: `script`, instance: a3, count: 1, state: null }, r3.set(i3, a3));
      }
    }
    function Of(e3, t3) {
      _f.M(e3, t3);
      var n3 = bf;
      if (n3 && e3) {
        var r3 = xt2(n3).hoistableScripts, i3 = Pf(e3), a3 = r3.get(i3);
        a3 || (a3 = n3.querySelector(Ff(i3)), a3 || (e3 = h2({ src: e3, async: true, type: `module` }, t3), (t3 =
        mf.get(i3)) && zf(e3, t3), a3 = n3.createElement(`script`), St2(a3), Pd(a3, `link`, e3), n3.head.appendChild(
        a3)), a3 = { type: `script`, instance: a3, count: 1, state: null }, r3.set(i3, a3));
      }
    }
    function kf(e3, t3, n3, r3) {
      var a3 = (a3 = me2.current) ? gf(a3) : null;
      if (!a3) throw Error(i2(446));
      switch (e3) {
        case `meta`:
        case `title`:
          return null;
        case `style`:
          return typeof n3.precedence == `string` && typeof n3.href == `string` ? (t3 = Af(n3.href), n3 = xt2(
          a3).hoistableStyles, r3 = n3.get(t3), r3 || (r3 = { type: `style`, instance: null, count: 0, state: null },
          n3.set(t3, r3)), r3) : { type: `void`, instance: null, count: 0, state: null };
        case `link`:
          if (n3.rel === `stylesheet` && typeof n3.href == `string` && typeof n3.precedence == `string`) {
            e3 = Af(n3.href);
            var o3 = xt2(a3).hoistableStyles, s3 = o3.get(e3);
            if (s3 || (a3 = a3.ownerDocument || a3, s3 = { type: `stylesheet`, instance: null, count: 0, state: {
            loading: 0, preload: null } }, o3.set(e3, s3), (o3 = a3.querySelector(jf(e3))) && !o3._p && (s3.instance =
            o3, s3.state.loading = 5), mf.has(e3) || (n3 = { rel: `preload`, as: `style`, href: n3.href, crossOrigin: n3.
            crossOrigin, integrity: n3.integrity, media: n3.media, hrefLang: n3.hrefLang, referrerPolicy: n3.referrerPolicy },
            mf.set(e3, n3), o3 || Nf(a3, e3, n3, s3.state))), t3 && r3 === null) throw Error(i2(528, ``));
            return s3;
          }
          if (t3 && r3 !== null) throw Error(i2(529, ``));
          return null;
        case `script`:
          return t3 = n3.async, n3 = n3.src, typeof n3 == `string` && t3 && typeof t3 != `function` && typeof t3 !=
          `symbol` ? (t3 = Pf(n3), n3 = xt2(a3).hoistableScripts, r3 = n3.get(t3), r3 || (r3 = { type: `script`,
          instance: null, count: 0, state: null }, n3.set(t3, r3)), r3) : { type: `void`, instance: null, count: 0,
          state: null };
        default:
          throw Error(i2(444, e3));
      }
    }
    function Af(e3) {
      return `href="` + Vt2(e3) + `"`;
    }
    function jf(e3) {
      return `link[rel="stylesheet"][` + e3 + `]`;
    }
    function Mf(e3) {
      return h2({}, e3, { "data-precedence": e3.precedence, precedence: null });
    }
    function Nf(e3, t3, n3, r3) {
      e3.querySelector(`link[rel="preload"][as="style"][` + t3 + `]`) ? r3.loading = 1 : (t3 = e3.createElement(
      `link`), r3.preload = t3, t3.addEventListener(`load`, function() {
        return r3.loading |= 1;
      }), t3.addEventListener(`error`, function() {
        return r3.loading |= 2;
      }), Pd(t3, `link`, n3), St2(t3), e3.head.appendChild(t3));
    }
    function Pf(e3) {
      return `[src="` + Vt2(e3) + `"]`;
    }
    function Ff(e3) {
      return `script[async]` + e3;
    }
    function If(e3, t3, n3) {
      if (t3.count++, t3.instance === null) switch (t3.type) {
        case `style`:
          var r3 = e3.querySelector(`style[data-href~="` + Vt2(n3.href) + `"]`);
          if (r3) return t3.instance = r3, St2(r3), r3;
          var a3 = h2({}, n3, { "data-href": n3.href, "data-precedence": n3.precedence, href: null, precedence: null });
          return r3 = (e3.ownerDocument || e3).createElement(`style`), St2(r3), Pd(r3, `style`, a3), Lf(r3, n3.
          precedence, e3), t3.instance = r3;
        case `stylesheet`:
          a3 = Af(n3.href);
          var o3 = e3.querySelector(jf(a3));
          if (o3) return t3.state.loading |= 4, t3.instance = o3, St2(o3), o3;
          r3 = Mf(n3), (a3 = mf.get(a3)) && Rf(r3, a3), o3 = (e3.ownerDocument || e3).createElement(`link`), St2(
          o3);
          var s3 = o3;
          return s3._p = new Promise(function(e4, t4) {
            s3.onload = e4, s3.onerror = t4;
          }), Pd(o3, `link`, r3), t3.state.loading |= 4, Lf(o3, n3.precedence, e3), t3.instance = o3;
        case `script`:
          return o3 = Pf(n3.src), (a3 = e3.querySelector(Ff(o3))) ? (t3.instance = a3, St2(a3), a3) : (r3 = n3,
          (a3 = mf.get(o3)) && (r3 = h2({}, n3), zf(r3, a3)), e3 = e3.ownerDocument || e3, a3 = e3.createElement(
          `script`), St2(a3), Pd(a3, `link`, r3), e3.head.appendChild(a3), t3.instance = a3);
        case `void`:
          return null;
        default:
          throw Error(i2(443, t3.type));
      }
      else t3.type === `stylesheet` && !(t3.state.loading & 4) && (r3 = t3.instance, t3.state.loading |= 4, Lf(
      r3, n3.precedence, e3));
      return t3.instance;
    }
    function Lf(e3, t3, n3) {
      for (var r3 = n3.querySelectorAll(`link[rel="stylesheet"][data-precedence],style[data-precedence]`), i3 = r3.
      length ? r3[r3.length - 1] : null, a3 = i3, o3 = 0; o3 < r3.length; o3++) {
        var s3 = r3[o3];
        if (s3.dataset.precedence === t3) a3 = s3;
        else if (a3 !== i3) break;
      }
      a3 ? a3.parentNode.insertBefore(e3, a3.nextSibling) : (t3 = n3.nodeType === 9 ? n3.head : n3, t3.insertBefore(
      e3, t3.firstChild));
    }
    function Rf(e3, t3) {
      e3.crossOrigin ??= t3.crossOrigin, e3.referrerPolicy ??= t3.referrerPolicy, e3.title ??= t3.title;
    }
    function zf(e3, t3) {
      e3.crossOrigin ??= t3.crossOrigin, e3.referrerPolicy ??= t3.referrerPolicy, e3.integrity ??= t3.integrity;
    }
    var Bf = null;
    function Vf(e3, t3, n3) {
      if (Bf === null) {
        var r3 = /* @__PURE__ */ new Map(), i3 = Bf = /* @__PURE__ */ new Map();
        i3.set(n3, r3);
      } else i3 = Bf, r3 = i3.get(n3), r3 || (r3 = /* @__PURE__ */ new Map(), i3.set(n3, r3));
      if (r3.has(e3)) return r3;
      for (r3.set(e3, null), n3 = n3.getElementsByTagName(e3), i3 = 0; i3 < n3.length; i3++) {
        var a3 = n3[i3];
        if (!(a3[_t2] || a3[dt2] || e3 === `link` && a3.getAttribute(`rel`) === `stylesheet`) && a3.namespaceURI !==
        `http://www.w3.org/2000/svg`) {
          var o3 = a3.getAttribute(t3) || ``;
          o3 = e3 + o3;
          var s3 = r3.get(o3);
          s3 ? s3.push(a3) : r3.set(o3, [a3]);
        }
      }
      return r3;
    }
    function Hf(e3, t3, n3) {
      e3 = e3.ownerDocument || e3, e3.head.insertBefore(n3, t3 === `title` ? e3.querySelector(`head > title`) :
      null);
    }
    function Uf(e3, t3, n3) {
      if (n3 === 1 || t3.itemProp != null) return false;
      switch (e3) {
        case `meta`:
        case `title`:
          return true;
        case `style`:
          if (typeof t3.precedence != `string` || typeof t3.href != `string` || t3.href === ``) break;
          return true;
        case `link`:
          if (typeof t3.rel != `string` || typeof t3.href != `string` || t3.href === `` || t3.onLoad || t3.onError)
           break;
          switch (t3.rel) {
            case `stylesheet`:
              return e3 = t3.disabled, typeof t3.precedence == `string` && e3 == null;
            default:
              return true;
          }
        case `script`:
          if (t3.async && typeof t3.async != `function` && typeof t3.async != `symbol` && !t3.onLoad && !t3.onError &&
          t3.src && typeof t3.src == `string`) return true;
      }
      return false;
    }
    function Wf(e3) {
      return !(e3.type === `stylesheet` && !(e3.state.loading & 3));
    }
    function Gf(e3, t3, n3, r3) {
      if (n3.type === `stylesheet` && (typeof r3.media != `string` || false !== matchMedia(r3.media).matches) &&
      !(n3.state.loading & 4)) {
        if (n3.instance === null) {
          var i3 = Af(r3.href), a3 = t3.querySelector(jf(i3));
          if (a3) {
            t3 = a3._p, typeof t3 == `object` && t3 && typeof t3.then == `function` && (e3.count++, e3 = Jf.bind(
            e3), t3.then(e3, e3)), n3.state.loading |= 4, n3.instance = a3, St2(a3);
            return;
          }
          a3 = t3.ownerDocument || t3, r3 = Mf(r3), (i3 = mf.get(i3)) && Rf(r3, i3), a3 = a3.createElement(`li\
nk`), St2(a3);
          var o3 = a3;
          o3._p = new Promise(function(e4, t4) {
            o3.onload = e4, o3.onerror = t4;
          }), Pd(a3, `link`, r3), n3.instance = a3;
        }
        e3.stylesheets === null && (e3.stylesheets = /* @__PURE__ */ new Map()), e3.stylesheets.set(n3, t3), (t3 =
        n3.state.preload) && !(n3.state.loading & 3) && (e3.count++, n3 = Jf.bind(e3), t3.addEventListener(`lo\
ad`, n3), t3.addEventListener(`error`, n3));
      }
    }
    var Kf = 0;
    function qf(e3, t3) {
      return e3.stylesheets && e3.count === 0 && Xf(e3, e3.stylesheets), 0 < e3.count || 0 < e3.imgCount ? function(n3) {
        var r3 = setTimeout(function() {
          if (e3.stylesheets && Xf(e3, e3.stylesheets), e3.unsuspend) {
            var t4 = e3.unsuspend;
            e3.unsuspend = null, t4();
          }
        }, 6e4 + t3);
        0 < e3.imgBytes && Kf === 0 && (Kf = 62500 * Ld());
        var i3 = setTimeout(function() {
          if (e3.waitingForImages = false, e3.count === 0 && (e3.stylesheets && Xf(e3, e3.stylesheets), e3.unsuspend)) {
            var t4 = e3.unsuspend;
            e3.unsuspend = null, t4();
          }
        }, (e3.imgBytes > Kf ? 50 : 800) + t3);
        return e3.unsuspend = n3, function() {
          e3.unsuspend = null, clearTimeout(r3), clearTimeout(i3);
        };
      } : null;
    }
    function Jf() {
      if (this.count--, this.count === 0 && (this.imgCount === 0 || !this.waitingForImages)) {
        if (this.stylesheets) Xf(this, this.stylesheets);
        else if (this.unsuspend) {
          var e3 = this.unsuspend;
          this.unsuspend = null, e3();
        }
      }
    }
    var Yf = null;
    function Xf(e3, t3) {
      e3.stylesheets = null, e3.unsuspend !== null && (e3.count++, Yf = /* @__PURE__ */ new Map(), t3.forEach(
      Zf, e3), Yf = null, Jf.call(e3));
    }
    function Zf(e3, t3) {
      if (!(t3.state.loading & 4)) {
        var n3 = Yf.get(e3);
        if (n3) var r3 = n3.get(null);
        else {
          n3 = /* @__PURE__ */ new Map(), Yf.set(e3, n3);
          for (var i3 = e3.querySelectorAll(`link[data-precedence],style[data-precedence]`), a3 = 0; a3 < i3.length; a3++) {
            var o3 = i3[a3];
            (o3.nodeName === `LINK` || o3.getAttribute(`media`) !== `not all`) && (n3.set(o3.dataset.precedence,
            o3), r3 = o3);
          }
          r3 && n3.set(null, r3);
        }
        i3 = t3.instance, o3 = i3.getAttribute(`data-precedence`), a3 = n3.get(o3) || r3, a3 === r3 && n3.set(
        null, i3), n3.set(o3, i3), this.count++, r3 = Jf.bind(this), i3.addEventListener(`load`, r3), i3.addEventListener(
        `error`, r3), a3 ? a3.parentNode.insertBefore(i3, a3.nextSibling) : (e3 = e3.nodeType === 9 ? e3.head :
        e3, e3.insertBefore(i3, e3.firstChild)), t3.state.loading |= 4;
      }
    }
    var Qf = { $$typeof: S2, Provider: null, Consumer: null, _currentValue: ue2, _currentValue2: ue2, _threadCount: 0 };
    function $f(e3, t3, n3, r3, i3, a3, o3, s3, c3) {
      this.tag = 1, this.containerInfo = e3, this.pingCache = this.current = this.pendingChildren = null, this.
      timeoutHandle = -1, this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit =
      null, this.callbackPriority = 0, this.expirationTimes = tt2(-1), this.entangledLanes = this.shellSuspendCounter =
      this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes =
      this.pendingLanes = 0, this.entanglements = tt2(0), this.hiddenUpdates = tt2(null), this.identifierPrefix =
      r3, this.onUncaughtError = i3, this.onCaughtError = a3, this.onRecoverableError = o3, this.pooledCache =
      null, this.pooledCacheLanes = 0, this.formState = c3, this.incompleteTransitions = /* @__PURE__ */ new Map();
    }
    function ep(e3, t3, n3, r3, i3, a3, o3, s3, c3, l3, u2, d3) {
      return e3 = new $f(e3, t3, n3, o3, c3, l3, u2, d3, s3), t3 = 1, true === a3 && (t3 |= 24), a3 = si2(3, null,
      null, t3), e3.current = a3, a3.stateNode = e3, t3 = oa(), t3.refCount++, e3.pooledCache = t3, t3.refCount++,
      a3.memoizedState = { element: r3, isDehydrated: n3, cache: t3 }, za(a3), e3;
    }
    function tp(e3) {
      return e3 ? (e3 = ai2, e3) : ai2;
    }
    function np(e3, t3, n3, r3, i3, a3) {
      i3 = tp(i3), r3.context === null ? r3.context = i3 : r3.pendingContext = i3, r3 = Va(t3), r3.payload = {
      element: n3 }, a3 = a3 === void 0 ? null : a3, a3 !== null && (r3.callback = a3), n3 = Ha(e3, r3, t3), n3 !==
      null && (hu(n3, e3, t3), Ua(n3, e3, t3));
    }
    function rp(e3, t3) {
      if (e3 = e3.memoizedState, e3 !== null && e3.dehydrated !== null) {
        var n3 = e3.retryLane;
        e3.retryLane = n3 !== 0 && n3 < t3 ? n3 : t3;
      }
    }
    function ip(e3, t3) {
      rp(e3, t3), (e3 = e3.alternate) && rp(e3, t3);
    }
    function ap(e3) {
      if (e3.tag === 13 || e3.tag === 31) {
        var t3 = ni2(e3, 67108864);
        t3 !== null && hu(t3, e3, 67108864), ip(e3, 67108864);
      }
    }
    function op(e3) {
      if (e3.tag === 13 || e3.tag === 31) {
        var t3 = pu();
        t3 = ot2(t3);
        var n3 = ni2(e3, t3);
        n3 !== null && hu(n3, e3, t3), ip(e3, t3);
      }
    }
    var sp = true;
    function cp(e3, t3, n3, r3) {
      var i3 = E2.T;
      E2.T = null;
      var a3 = D2.p;
      try {
        D2.p = 2, up(e3, t3, n3, r3);
      } finally {
        D2.p = a3, E2.T = i3;
      }
    }
    function lp(e3, t3, n3, r3) {
      var i3 = E2.T;
      E2.T = null;
      var a3 = D2.p;
      try {
        D2.p = 8, up(e3, t3, n3, r3);
      } finally {
        D2.p = a3, E2.T = i3;
      }
    }
    function up(e3, t3, n3, r3) {
      if (sp) {
        var i3 = dp(r3);
        if (i3 === null) wd(e3, t3, r3, fp, n3), Cp(e3, r3);
        else if (Tp(i3, e3, t3, n3, r3)) r3.stopPropagation();
        else if (Cp(e3, r3), t3 & 4 && -1 < Sp.indexOf(e3)) {
          for (; i3 !== null; ) {
            var a3 = bt2(i3);
            if (a3 !== null) switch (a3.tag) {
              case 3:
                if (a3 = a3.stateNode, a3.current.memoizedState.isDehydrated) {
                  var o3 = Xe2(a3.pendingLanes);
                  if (o3 !== 0) {
                    var s3 = a3;
                    for (s3.pendingLanes |= 2, s3.entangledLanes |= 2; o3; ) {
                      var c3 = 1 << 31 - We2(o3);
                      s3.entanglements[1] |= c3, o3 &= ~c3;
                    }
                    rd(a3), !(K & 6) && (tu = Me2() + 500, id(0, false));
                  }
                }
                break;
              case 31:
              case 13:
                s3 = ni2(a3, 2), s3 !== null && hu(s3, a3, 2), bu(), ip(a3, 2);
            }
            if (a3 = dp(r3), a3 === null && wd(e3, t3, r3, fp, n3), a3 === i3) break;
            i3 = a3;
          }
          i3 !== null && r3.stopPropagation();
        } else wd(e3, t3, r3, null, n3);
      }
    }
    function dp(e3) {
      return e3 = rn2(e3), pp(e3);
    }
    var fp = null;
    function pp(e3) {
      if (fp = null, e3 = yt2(e3), e3 !== null) {
        var t3 = o2(e3);
        if (t3 === null) e3 = null;
        else {
          var n3 = t3.tag;
          if (n3 === 13) {
            if (e3 = s2(t3), e3 !== null) return e3;
            e3 = null;
          } else if (n3 === 31) {
            if (e3 = c2(t3), e3 !== null) return e3;
            e3 = null;
          } else if (n3 === 3) {
            if (t3.stateNode.current.memoizedState.isDehydrated) return t3.tag === 3 ? t3.stateNode.containerInfo :
            null;
            e3 = null;
          } else t3 !== e3 && (e3 = null);
        }
      }
      return fp = e3, null;
    }
    function mp(e3) {
      switch (e3) {
        case `beforetoggle`:
        case `cancel`:
        case `click`:
        case `close`:
        case `contextmenu`:
        case `copy`:
        case `cut`:
        case `auxclick`:
        case `dblclick`:
        case `dragend`:
        case `dragstart`:
        case `drop`:
        case `focusin`:
        case `focusout`:
        case `input`:
        case `invalid`:
        case `keydown`:
        case `keypress`:
        case `keyup`:
        case `mousedown`:
        case `mouseup`:
        case `paste`:
        case `pause`:
        case `play`:
        case `pointercancel`:
        case `pointerdown`:
        case `pointerup`:
        case `ratechange`:
        case `reset`:
        case `resize`:
        case `seeked`:
        case `submit`:
        case `toggle`:
        case `touchcancel`:
        case `touchend`:
        case `touchstart`:
        case `volumechange`:
        case `change`:
        case `selectionchange`:
        case `textInput`:
        case `compositionstart`:
        case `compositionend`:
        case `compositionupdate`:
        case `beforeblur`:
        case `afterblur`:
        case `beforeinput`:
        case `blur`:
        case `fullscreenchange`:
        case `focus`:
        case `hashchange`:
        case `popstate`:
        case `select`:
        case `selectstart`:
          return 2;
        case `drag`:
        case `dragenter`:
        case `dragexit`:
        case `dragleave`:
        case `dragover`:
        case `mousemove`:
        case `mouseout`:
        case `mouseover`:
        case `pointermove`:
        case `pointerout`:
        case `pointerover`:
        case `scroll`:
        case `touchmove`:
        case `wheel`:
        case `mouseenter`:
        case `mouseleave`:
        case `pointerenter`:
        case `pointerleave`:
          return 8;
        case `message`:
          switch (Ne2()) {
            case Pe2:
              return 2;
            case Fe2:
              return 8;
            case Ie2:
            case Le2:
              return 32;
            case Re2:
              return 268435456;
            default:
              return 32;
          }
        default:
          return 32;
      }
    }
    var hp = false, gp = null, _p = null, vp = null, yp = /* @__PURE__ */ new Map(), bp = /* @__PURE__ */ new Map(),
    xp = [], Sp = `mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdo\
wn pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput cop\
y cut paste click change contextmenu reset`.split(` `);
    function Cp(e3, t3) {
      switch (e3) {
        case `focusin`:
        case `focusout`:
          gp = null;
          break;
        case `dragenter`:
        case `dragleave`:
          _p = null;
          break;
        case `mouseover`:
        case `mouseout`:
          vp = null;
          break;
        case `pointerover`:
        case `pointerout`:
          yp.delete(t3.pointerId);
          break;
        case `gotpointercapture`:
        case `lostpointercapture`:
          bp.delete(t3.pointerId);
      }
    }
    function wp(e3, t3, n3, r3, i3, a3) {
      return e3 === null || e3.nativeEvent !== a3 ? (e3 = { blockedOn: t3, domEventName: n3, eventSystemFlags: r3,
      nativeEvent: a3, targetContainers: [i3] }, t3 !== null && (t3 = bt2(t3), t3 !== null && ap(t3)), e3) : (e3.
      eventSystemFlags |= r3, t3 = e3.targetContainers, i3 !== null && t3.indexOf(i3) === -1 && t3.push(i3), e3);
    }
    function Tp(e3, t3, n3, r3, i3) {
      switch (t3) {
        case `focusin`:
          return gp = wp(gp, e3, t3, n3, r3, i3), true;
        case `dragenter`:
          return _p = wp(_p, e3, t3, n3, r3, i3), true;
        case `mouseover`:
          return vp = wp(vp, e3, t3, n3, r3, i3), true;
        case `pointerover`:
          var a3 = i3.pointerId;
          return yp.set(a3, wp(yp.get(a3) || null, e3, t3, n3, r3, i3)), true;
        case `gotpointercapture`:
          return a3 = i3.pointerId, bp.set(a3, wp(bp.get(a3) || null, e3, t3, n3, r3, i3)), true;
      }
      return false;
    }
    function Ep(e3) {
      var t3 = yt2(e3.target);
      if (t3 !== null) {
        var n3 = o2(t3);
        if (n3 !== null) {
          if (t3 = n3.tag, t3 === 13) {
            if (t3 = s2(n3), t3 !== null) {
              e3.blockedOn = t3, lt2(e3.priority, function() {
                op(n3);
              });
              return;
            }
          } else if (t3 === 31) {
            if (t3 = c2(n3), t3 !== null) {
              e3.blockedOn = t3, lt2(e3.priority, function() {
                op(n3);
              });
              return;
            }
          } else if (t3 === 3 && n3.stateNode.current.memoizedState.isDehydrated) {
            e3.blockedOn = n3.tag === 3 ? n3.stateNode.containerInfo : null;
            return;
          }
        }
      }
      e3.blockedOn = null;
    }
    function Dp(e3) {
      if (e3.blockedOn !== null) return false;
      for (var t3 = e3.targetContainers; 0 < t3.length; ) {
        var n3 = dp(e3.nativeEvent);
        if (n3 === null) {
          n3 = e3.nativeEvent;
          var r3 = new n3.constructor(n3.type, n3);
          nn2 = r3, n3.target.dispatchEvent(r3), nn2 = null;
        } else return t3 = bt2(n3), t3 !== null && ap(t3), e3.blockedOn = n3, false;
        t3.shift();
      }
      return true;
    }
    function Op(e3, t3, n3) {
      Dp(e3) && n3.delete(t3);
    }
    function kp() {
      hp = false, gp !== null && Dp(gp) && (gp = null), _p !== null && Dp(_p) && (_p = null), vp !== null && Dp(
      vp) && (vp = null), yp.forEach(Op), bp.forEach(Op);
    }
    function Ap(e3, n3) {
      e3.blockedOn === n3 && (e3.blockedOn = null, hp || (hp = true, t2.unstable_scheduleCallback(t2.unstable_NormalPriority,
      kp)));
    }
    var jp = null;
    function Mp(e3) {
      jp !== e3 && (jp = e3, t2.unstable_scheduleCallback(t2.unstable_NormalPriority, function() {
        jp === e3 && (jp = null);
        for (var t3 = 0; t3 < e3.length; t3 += 3) {
          var n3 = e3[t3], r3 = e3[t3 + 1], i3 = e3[t3 + 2];
          if (typeof r3 != `function`) {
            if (pp(r3 || n3) === null) continue;
            break;
          }
          var a3 = bt2(n3);
          a3 !== null && (e3.splice(t3, 3), t3 -= 3, ws(a3, { pending: true, data: i3, method: n3.method, action: r3 },
          r3, i3));
        }
      }));
    }
    function Np(e3) {
      function t3(t4) {
        return Ap(t4, e3);
      }
      gp !== null && Ap(gp, e3), _p !== null && Ap(_p, e3), vp !== null && Ap(vp, e3), yp.forEach(t3), bp.forEach(
      t3);
      for (var n3 = 0; n3 < xp.length; n3++) {
        var r3 = xp[n3];
        r3.blockedOn === e3 && (r3.blockedOn = null);
      }
      for (; 0 < xp.length && (n3 = xp[0], n3.blockedOn === null); ) Ep(n3), n3.blockedOn === null && xp.shift();
      if (n3 = (e3.ownerDocument || e3).$$reactFormReplay, n3 != null) for (r3 = 0; r3 < n3.length; r3 += 3) {
        var i3 = n3[r3], a3 = n3[r3 + 1], o3 = i3[ft2] || null;
        if (typeof a3 == `function`) o3 || Mp(n3);
        else if (o3) {
          var s3 = null;
          if (a3 && a3.hasAttribute(`formAction`)) {
            if (i3 = a3, o3 = a3[ft2] || null) s3 = o3.formAction;
            else if (pp(i3) !== null) continue;
          } else s3 = o3.action;
          typeof s3 == `function` ? n3[r3 + 1] = s3 : (n3.splice(r3, 3), r3 -= 3), Mp(n3);
        }
      }
    }
    function Pp() {
      function e3(e4) {
        e4.canIntercept && e4.info === `react-transition` && e4.intercept({ handler: function() {
          return new Promise(function(e5) {
            return i3 = e5;
          });
        }, focusReset: `manual`, scroll: `manual` });
      }
      function t3() {
        i3 !== null && (i3(), i3 = null), r3 || setTimeout(n3, 20);
      }
      function n3() {
        if (!r3 && !navigation.transition) {
          var e4 = navigation.currentEntry;
          e4 && e4.url != null && navigation.navigate(e4.url, { state: e4.getState(), info: `react-transition`,
          history: `replace` });
        }
      }
      if (typeof navigation == `object`) {
        var r3 = false, i3 = null;
        return navigation.addEventListener(`navigate`, e3), navigation.addEventListener(`navigatesuccess`, t3),
        navigation.addEventListener(`navigateerror`, t3), setTimeout(n3, 100), function() {
          r3 = true, navigation.removeEventListener(`navigate`, e3), navigation.removeEventListener(`navigates\
uccess`, t3), navigation.removeEventListener(`navigateerror`, t3), i3 !== null && (i3(), i3 = null);
        };
      }
    }
    function Fp(e3) {
      this._internalRoot = e3;
    }
    Ip.prototype.render = Fp.prototype.render = function(e3) {
      var t3 = this._internalRoot;
      if (t3 === null) throw Error(i2(409));
      var n3 = t3.current;
      np(n3, pu(), e3, t3, null, null);
    }, Ip.prototype.unmount = Fp.prototype.unmount = function() {
      var e3 = this._internalRoot;
      if (e3 !== null) {
        this._internalRoot = null;
        var t3 = e3.containerInfo;
        np(e3.current, 2, null, e3, null, null), bu(), t3[pt2] = null;
      }
    };
    function Ip(e3) {
      this._internalRoot = e3;
    }
    Ip.prototype.unstable_scheduleHydration = function(e3) {
      if (e3) {
        var t3 = ct2();
        e3 = { blockedOn: null, target: e3, priority: t3 };
        for (var n3 = 0; n3 < xp.length && t3 !== 0 && t3 < xp[n3].priority; n3++) ;
        xp.splice(n3, 0, e3), n3 === 0 && Ep(e3);
      }
    };
    var Lp = n2.version;
    if (Lp !== `19.2.8`) throw Error(i2(527, Lp, `19.2.8`));
    D2.findDOMNode = function(e3) {
      var t3 = e3._reactInternals;
      if (t3 === void 0) throw typeof e3.render == `function` ? Error(i2(188)) : (e3 = Object.keys(e3).join(`,`),
      Error(i2(268, e3)));
      return e3 = d2(t3), e3 = e3 === null ? null : p2(e3), e3 = e3 === null ? null : e3.stateNode, e3;
    };
    var Rp = { bundleType: 0, version: `19.2.8`, rendererPackageName: `react-dom`, currentDispatcherRef: E2, reconcilerVersion: `\
19.2.8` };
    if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < `u`) {
      var zp = __REACT_DEVTOOLS_GLOBAL_HOOK__;
      if (!zp.isDisabled && zp.supportsFiber) try {
        Ve2 = zp.inject(Rp), He2 = zp;
      } catch {
      }
    }
    e2.createRoot = function(e3, t3) {
      if (!a2(e3)) throw Error(i2(299));
      var n3 = false, r3 = ``, o3 = qs, s3 = Js, c3 = Ys;
      return t3 != null && (true === t3.unstable_strictMode && (n3 = true), t3.identifierPrefix !== void 0 && (r3 =
      t3.identifierPrefix), t3.onUncaughtError !== void 0 && (o3 = t3.onUncaughtError), t3.onCaughtError !== void 0 &&
      (s3 = t3.onCaughtError), t3.onRecoverableError !== void 0 && (c3 = t3.onRecoverableError)), t3 = ep(e3, 1,
      false, null, null, n3, r3, null, o3, s3, c3, Pp), e3[pt2] = t3.current, Sd(e3), new Fp(t3);
    };
  })), g = o(((e2, t2) => {
    function n2() {
      if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > `u` || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != `\
function`)) try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n2);
      } catch (e3) {
        console.error(e3);
      }
    }
    n2(), t2.exports = h();
  })), _ = (e2) => e2.replace(/([a-z0-9])([A-Z])/g, `$1-$2`).toLowerCase(), v = (e2) => e2.replace(/^([A-Z])|[\s-_]+(\w)/g,
  (e3, t2, n2) => n2 ? n2.toUpperCase() : t2.toLowerCase()), y = (e2) => {
    let t2 = v(e2);
    return t2.charAt(0).toUpperCase() + t2.slice(1);
  }, b = (...e2) => e2.filter((e3, t2, n2) => !!e3 && e3.trim() !== `` && n2.indexOf(e3) === t2).join(` `).trim(),
  x = (e2) => {
    for (let t2 in e2) if (t2.startsWith(`aria-`) || t2 === `role` || t2 === `title`) return true;
  }, ee = { xmlns: `http://www.w3.org/2000/svg`, width: 24, height: 24, viewBox: `0 0 24 24`, fill: `none`, stroke: `\
currentColor`, strokeWidth: 2, strokeLinecap: `round`, strokeLinejoin: `round` }, S = c(f()), C = (0, S.forwardRef)(
  ({ color: e2 = `currentColor`, size: t2 = 24, strokeWidth: n2 = 2, absoluteStrokeWidth: r2, className: i2 = ``,
  children: a2, iconNode: o2, ...s2 }, c2) => (0, S.createElement)(`svg`, { ref: c2, ...ee, width: t2, height: t2,
  stroke: e2, strokeWidth: r2 ? Number(n2) * 24 / Number(t2) : n2, className: b(`lucide`, i2), ...!a2 && !x(s2) &&
  { "aria-hidden": `true` }, ...s2 }, [...o2.map(([e3, t3]) => (0, S.createElement)(e3, t3)), ...Array.isArray(
  a2) ? a2 : [a2]])), w = (e2, t2) => {
    let n2 = (0, S.forwardRef)(({ className: n3, ...r2 }, i2) => (0, S.createElement)(C, { ref: i2, iconNode: t2,
    className: b(`lucide-${_(y(e2))}`, `lucide-${e2}`, n3), ...r2 }));
    return n2.displayName = y(e2), n2;
  }, te = w(`calendar-days`, [[`path`, { d: `M8 2v4`, key: `1cmpym` }], [`path`, { d: `M16 2v4`, key: `4m81vk` }],
  [`rect`, { width: `18`, height: `18`, x: `3`, y: `4`, rx: `2`, key: `1hopcy` }], [`path`, { d: `M3 10h18`, key: `\
8toen8` }], [`path`, { d: `M8 14h.01`, key: `6423bh` }], [`path`, { d: `M12 14h.01`, key: `1etili` }], [`path`,
  { d: `M16 14h.01`, key: `1gbofw` }], [`path`, { d: `M8 18h.01`, key: `lrp35t` }], [`path`, { d: `M12 18h.01`,
  key: `mhygvu` }], [`path`, { d: `M16 18h.01`, key: `kzsmim` }]]), ne = w(`chevron-down`, [[`path`, { d: `m6 \
9 6 6 6-6`, key: `qrunsl` }]]), T = w(`chevron-right`, [[`path`, { d: `m9 18 6-6-6-6`, key: `mthhwq` }]]), re = w(
  `circle-help`, [[`circle`, { cx: `12`, cy: `12`, r: `10`, key: `1mglay` }], [`path`, { d: `M9.09 9a3 3 0 0 1\
 5.83 1c0 2-3 3-3 3`, key: `1u773s` }], [`path`, { d: `M12 17h.01`, key: `p32p05` }]]), ie = w(`folder`, [[`pa\
th`, { d: `M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 \
2v13a2 2 0 0 0 2 2Z`, key: `1kt360` }]]), ae = w(`info`, [[`circle`, { cx: `12`, cy: `12`, r: `10`, key: `1mgl\
ay` }], [`path`, { d: `M12 16v-4`, key: `1dtifu` }], [`path`, { d: `M12 8h.01`, key: `e9boi3` }]]), oe = w(`mi\
nus`, [[`path`, { d: `M5 12h14`, key: `1ays0h` }]]), se = w(`palette`, [[`path`, { d: `M12 22a1 1 0 0 1 0-20 1\
0 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z`, key: `e79jfc` }], [
  `circle`, { cx: `13.5`, cy: `6.5`, r: `.5`, fill: `currentColor`, key: `1okk4w` }], [`circle`, { cx: `17.5`,
  cy: `10.5`, r: `.5`, fill: `currentColor`, key: `f64h9f` }], [`circle`, { cx: `6.5`, cy: `12.5`, r: `.5`, fill: `\
currentColor`, key: `qy21gx` }], [`circle`, { cx: `8.5`, cy: `7.5`, r: `.5`, fill: `currentColor`, key: `fotxh\
n` }]]), ce = w(`paperclip`, [[`path`, { d: `M13.234 20.252 21 12.3`, key: `1cbrk9` }], [`path`, { d: `m16 6-8\
.414 8.586a2 2 0 0 0 0 2.828 2 2 0 0 0 2.828 0l8.414-8.586a4 4 0 0 0 0-5.656 4 4 0 0 0-5.656 0l-8.415 8.585a6 \
6 0 1 0 8.486 8.486`, key: `1pkts6` }]]), le = w(`printer`, [[`path`, { d: `M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1\
 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2`, key: `143wyd` }], [`path`, { d: `M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 \
1 1v6`, key: `1itne7` }], [`rect`, { x: `6`, y: `14`, width: `12`, height: `8`, rx: `1`, key: `1ue0tg` }]]), E = w(
  `search`, [[`path`, { d: `m21 21-4.34-4.34`, key: `14j7rj` }], [`circle`, { cx: `11`, cy: `11`, r: `8`, key: `\
4ej97u` }]]), D = w(`settings`, [[`path`, { d: `M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0\
 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.1\
5.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 \
2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.7\
3-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-\
.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z`, key: `1qme2f` }], [`circle`, { cx: `12`, cy: `\
12`, r: `3`, key: `1v7zrd` }]]), ue = w(`square`, [[`rect`, { width: `18`, height: `18`, x: `3`, y: `3`, rx: `\
2`, key: `afitv7` }]]), de = w(`star`, [[`path`, { d: `M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123\
 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0\
 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 \
0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z`, key: `r04s7s` }]]),
  fe = w(`trash-2`, [[`path`, { d: `M3 6h18`, key: `d0wm0j` }], [`path`, { d: `M19 6v14c0 1-1 2-2 2H7c-1 0-2-1\
-2-2V6`, key: `4alrt4` }], [`path`, { d: `M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2`, key: `v07s0e` }], [`line`, { x1: `\
10`, x2: `10`, y1: `11`, y2: `17`, key: `1uufr5` }], [`line`, { x1: `14`, x2: `14`, y1: `11`, y2: `17`, key: `\
xtxkd` }]]), O = w(`users`, [[`path`, { d: `M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2`, key: `1yyitq` }], [`pa\
th`, { d: `M16 3.128a4 4 0 0 1 0 7.744`, key: `16gr8j` }], [`path`, { d: `M22 21v-2a4 4 0 0 0-3-3.87`, key: `k\
shegd` }], [`circle`, { cx: `9`, cy: `7`, r: `4`, key: `nufk8` }]]), k = w(`wifi-off`, [[`path`, { d: `M12 20h\
.01`, key: `zekei9` }], [`path`, { d: `M8.5 16.429a5 5 0 0 1 7 0`, key: `1bycff` }], [`path`, { d: `M5 12.859a\
10 10 0 0 1 5.17-2.69`, key: `1dl1wf` }], [`path`, { d: `M19 12.859a10 10 0 0 0-2.007-1.523`, key: `4k23kn` }],
  [`path`, { d: `M2 8.82a15 15 0 0 1 4.177-2.643`, key: `1grhjp` }], [`path`, { d: `M22 8.82a15 15 0 0 0-11.28\
8-3.764`, key: `z3jwby` }], [`path`, { d: `m2 2 20 20`, key: `1ooewy` }]]), A = w(`x`, [[`path`, { d: `M18 6 6\
 18`, key: `1bl5f8` }], [`path`, { d: `m6 6 12 12`, key: `d8bk6v` }]]), pe = g();
  function j(e2) {
    var t2, n2, r2 = ``;
    if (typeof e2 == `string` || typeof e2 == `number`) r2 += e2;
    else if (typeof e2 == `object`) {
      if (Array.isArray(e2)) {
        var i2 = e2.length;
        for (t2 = 0; t2 < i2; t2++) e2[t2] && (n2 = j(e2[t2])) && (r2 && (r2 += ` `), r2 += n2);
      } else for (n2 in e2) e2[n2] && (r2 && (r2 += ` `), r2 += n2);
    }
    return r2;
  }
  function me() {
    for (var e2, t2, n2 = 0, r2 = ``, i2 = arguments.length; n2 < i2; n2++) (e2 = arguments[n2]) && (t2 = j(e2)) &&
    (r2 && (r2 += ` `), r2 += t2);
    return r2;
  }
  var he = (e2, t2) => {
    let n2 = Array(e2.length + t2.length);
    for (let t3 = 0; t3 < e2.length; t3++) n2[t3] = e2[t3];
    for (let r2 = 0; r2 < t2.length; r2++) n2[e2.length + r2] = t2[r2];
    return n2;
  }, ge = (e2, t2) => ({ classGroupId: e2, validator: t2 }), _e = (e2 = /* @__PURE__ */ new Map(), t2 = null, n2) => ({
  nextPart: e2, validators: t2, classGroupId: n2 }), ve = `-`, ye = [], be = `arbitrary..`, xe = (e2) => {
    let t2 = we(e2), { conflictingClassGroups: n2, conflictingClassGroupModifiers: r2 } = e2;
    return { getClassGroupId: (e3) => {
      if (e3.startsWith(`[`) && e3.endsWith(`]`)) return Ce(e3);
      let n3 = e3.split(ve);
      return Se(n3, +(n3[0] === `` && n3.length > 1), t2);
    }, getConflictingClassGroupIds: (e3, t3) => {
      if (t3) {
        let t4 = r2[e3], i2 = n2[e3];
        return t4 ? i2 ? he(i2, t4) : t4 : i2 || ye;
      }
      return n2[e3] || ye;
    } };
  }, Se = (e2, t2, n2) => {
    if (e2.length - t2 === 0) return n2.classGroupId;
    let r2 = e2[t2], i2 = n2.nextPart.get(r2);
    if (i2) {
      let n3 = Se(e2, t2 + 1, i2);
      if (n3) return n3;
    }
    let a2 = n2.validators;
    if (a2 === null) return;
    let o2 = t2 === 0 ? e2.join(ve) : e2.slice(t2).join(ve), s2 = a2.length;
    for (let e3 = 0; e3 < s2; e3++) {
      let t3 = a2[e3];
      if (t3.validator(o2)) return t3.classGroupId;
    }
  }, Ce = (e2) => e2.slice(1, -1).indexOf(`:`) === -1 ? void 0 : (() => {
    let t2 = e2.slice(1, -1), n2 = t2.indexOf(`:`), r2 = t2.slice(0, n2);
    return r2 ? be + r2 : void 0;
  })(), we = (e2) => {
    let { theme: t2, classGroups: n2 } = e2;
    return Te(n2, t2);
  }, Te = (e2, t2) => {
    let n2 = _e();
    for (let r2 in e2) {
      let i2 = e2[r2];
      Ee(i2, n2, r2, t2);
    }
    return n2;
  }, Ee = (e2, t2, n2, r2) => {
    let i2 = e2.length;
    for (let a2 = 0; a2 < i2; a2++) {
      let i3 = e2[a2];
      De(i3, t2, n2, r2);
    }
  }, De = (e2, t2, n2, r2) => {
    if (typeof e2 == `string`) {
      Oe(e2, t2, n2);
      return;
    }
    if (typeof e2 == `function`) {
      ke(e2, t2, n2, r2);
      return;
    }
    Ae(e2, t2, n2, r2);
  }, Oe = (e2, t2, n2) => {
    let r2 = e2 === `` ? t2 : je(t2, e2);
    r2.classGroupId = n2;
  }, ke = (e2, t2, n2, r2) => {
    if (Me(e2)) {
      Ee(e2(r2), t2, n2, r2);
      return;
    }
    t2.validators === null && (t2.validators = []), t2.validators.push(ge(n2, e2));
  }, Ae = (e2, t2, n2, r2) => {
    let i2 = Object.entries(e2), a2 = i2.length;
    for (let e3 = 0; e3 < a2; e3++) {
      let [a3, o2] = i2[e3];
      Ee(o2, je(t2, a3), n2, r2);
    }
  }, je = (e2, t2) => {
    let n2 = e2, r2 = t2.split(ve), i2 = r2.length;
    for (let e3 = 0; e3 < i2; e3++) {
      let t3 = r2[e3], i3 = n2.nextPart.get(t3);
      i3 || (i3 = _e(), n2.nextPart.set(t3, i3)), n2 = i3;
    }
    return n2;
  }, Me = (e2) => `isThemeGetter` in e2 && e2.isThemeGetter === true, Ne = (e2) => {
    if (e2 < 1) return { get: () => void 0, set: () => {
    } };
    let t2 = 0, n2 = /* @__PURE__ */ Object.create(null), r2 = /* @__PURE__ */ Object.create(null), i2 = (i3, a2) => {
      n2[i3] = a2, t2++, t2 > e2 && (t2 = 0, r2 = n2, n2 = /* @__PURE__ */ Object.create(null));
    };
    return { get(e3) {
      let t3 = n2[e3];
      if (t3 !== void 0) return t3;
      if ((t3 = r2[e3]) !== void 0) return i2(e3, t3), t3;
    }, set(e3, t3) {
      e3 in n2 ? n2[e3] = t3 : i2(e3, t3);
    } };
  }, Pe = `!`, Fe = `:`, Ie = [], Le = (e2, t2, n2, r2, i2) => ({ modifiers: e2, hasImportantModifier: t2, baseClassName: n2,
  maybePostfixModifierPosition: r2, isExternal: i2 }), Re = (e2) => {
    let { prefix: t2, experimentalParseClassName: n2 } = e2, r2 = (e3) => {
      let t3 = [], n3 = 0, r3 = 0, i2 = 0, a2, o2 = e3.length;
      for (let s3 = 0; s3 < o2; s3++) {
        let o3 = e3[s3];
        if (n3 === 0 && r3 === 0) {
          if (o3 === Fe) {
            t3.push(e3.slice(i2, s3)), i2 = s3 + 1;
            continue;
          }
          if (o3 === `/`) {
            a2 = s3;
            continue;
          }
        }
        o3 === `[` ? n3++ : o3 === `]` ? n3-- : o3 === `(` ? r3++ : o3 === `)` && r3--;
      }
      let s2 = t3.length === 0 ? e3 : e3.slice(i2), c2 = s2, l2 = false;
      s2.endsWith(Pe) ? (c2 = s2.slice(0, -1), l2 = true) : s2.startsWith(Pe) && (c2 = s2.slice(1), l2 = true);
      let u2 = a2 && a2 > i2 ? a2 - i2 : void 0;
      return Le(t3, l2, c2, u2);
    };
    if (t2) {
      let e3 = t2 + Fe, n3 = r2;
      r2 = (t3) => t3.startsWith(e3) ? n3(t3.slice(e3.length)) : Le(Ie, false, t3, void 0, true);
    }
    if (n2) {
      let e3 = r2;
      r2 = (t3) => n2({ className: t3, parseClassName: e3 });
    }
    return r2;
  }, ze = (e2) => {
    let t2 = /* @__PURE__ */ new Map();
    return e2.orderSensitiveModifiers.forEach((e3, n2) => {
      t2.set(e3, 1e6 + n2);
    }), (e3) => {
      let n2 = [], r2 = [];
      for (let i2 = 0; i2 < e3.length; i2++) {
        let a2 = e3[i2], o2 = a2[0] === `[`, s2 = t2.has(a2);
        o2 || s2 ? (r2.length > 0 && (r2.sort(), n2.push(...r2), r2 = []), n2.push(a2)) : r2.push(a2);
      }
      return r2.length > 0 && (r2.sort(), n2.push(...r2)), n2;
    };
  }, Be = (e2) => ({ cache: Ne(e2.cacheSize), parseClassName: Re(e2), sortModifiers: ze(e2), postfixLookupClassGroupIds: Ve(
  e2), ...xe(e2) }), Ve = (e2) => {
    let t2 = /* @__PURE__ */ Object.create(null), n2 = e2.postfixLookupClassGroups;
    if (n2) for (let e3 = 0; e3 < n2.length; e3++) t2[n2[e3]] = true;
    return t2;
  }, He = /\s+/, Ue = (e2, t2) => {
    let { parseClassName: n2, getClassGroupId: r2, getConflictingClassGroupIds: i2, sortModifiers: a2, postfixLookupClassGroupIds: o2 } = t2,
    s2 = [], c2 = e2.trim().split(He), l2 = ``;
    for (let e3 = c2.length - 1; e3 >= 0; --e3) {
      let t3 = c2[e3], { isExternal: u2, modifiers: d2, hasImportantModifier: f2, baseClassName: p2, maybePostfixModifierPosition: m2 } = n2(
      t3);
      if (u2) {
        l2 = t3 + (l2.length > 0 ? ` ` + l2 : l2);
        continue;
      }
      let h2 = !!m2, g2;
      if (h2) {
        g2 = r2(p2.substring(0, m2));
        let e4 = g2 && o2[g2] ? r2(p2) : void 0;
        e4 && e4 !== g2 && (g2 = e4, h2 = false);
      } else g2 = r2(p2);
      if (!g2) {
        if (!h2) {
          l2 = t3 + (l2.length > 0 ? ` ` + l2 : l2);
          continue;
        }
        if (g2 = r2(p2), !g2) {
          l2 = t3 + (l2.length > 0 ? ` ` + l2 : l2);
          continue;
        }
        h2 = false;
      }
      let _2 = d2.length === 0 ? `` : d2.length === 1 ? d2[0] : a2(d2).join(`:`), v2 = f2 ? _2 + Pe : _2, y2 = v2 +
      g2;
      if (s2.indexOf(y2) > -1) continue;
      s2.push(y2);
      let b2 = i2(g2, h2);
      for (let e4 = 0; e4 < b2.length; ++e4) {
        let t4 = b2[e4];
        s2.push(v2 + t4);
      }
      l2 = t3 + (l2.length > 0 ? ` ` + l2 : l2);
    }
    return l2;
  }, We = (...e2) => {
    let t2 = 0, n2, r2, i2 = ``;
    for (; t2 < e2.length; ) (n2 = e2[t2++]) && (r2 = Ge(n2)) && (i2 && (i2 += ` `), i2 += r2);
    return i2;
  }, Ge = (e2) => {
    if (typeof e2 == `string`) return e2;
    let t2, n2 = ``;
    for (let r2 = 0; r2 < e2.length; r2++) e2[r2] && (t2 = Ge(e2[r2])) && (n2 && (n2 += ` `), n2 += t2);
    return n2;
  }, Ke = (e2, ...t2) => {
    let n2, r2, i2, a2, o2 = (o3) => (n2 = Be(t2.reduce((e3, t3) => t3(e3), e2())), r2 = n2.cache.get, i2 = n2.
    cache.set, a2 = s2, s2(o3)), s2 = (e3) => {
      let t3 = r2(e3);
      if (t3) return t3;
      let a3 = Ue(e3, n2);
      return i2(e3, a3), a3;
    };
    return a2 = o2, (...e3) => a2(We(...e3));
  }, qe = [], M = (e2) => {
    let t2 = (t3) => t3[e2] || qe;
    return t2.isThemeGetter = true, t2;
  }, Je = /^\[(?:(\w[\w-]*):)?(.+)\]$/i, Ye = /^\((?:(\w[\w-]*):)?(.+)\)$/i, Xe = /^\d+(?:\.\d+)?\/\d+(?:\.\d+)?$/,
  Ze = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/, Qe = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/,
  $e = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/, et = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/,
  tt = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/, nt = (e2) => Xe.
  test(e2), N = (e2) => !!e2 && !Number.isNaN(Number(e2)), rt = (e2) => !!e2 && Number.isInteger(Number(e2)), it = (e2) => e2.
  endsWith(`%`) && N(e2.slice(0, -1)), at = (e2) => Ze.test(e2), ot = () => true, st = (e2) => Qe.test(e2) && !$e.
  test(e2), ct = () => false, lt = (e2) => et.test(e2), ut = (e2) => tt.test(e2), dt = (e2) => !P(e2) && !F(e2),
  ft = (e2) => e2.startsWith(`@container`) && (e2[10] === `/` && e2[11] !== void 0 || e2[11] === `s` && e2[16] !==
  void 0 && e2.startsWith(`-size/`, 10) || e2[11] === `n` && e2[18] !== void 0 && e2.startsWith(`-normal/`, 10)),
  pt = (e2) => Ot(e2, Mt, ct), P = (e2) => Je.test(e2), mt = (e2) => Ot(e2, Nt, st), ht = (e2) => Ot(e2, Pt, N),
  gt = (e2) => Ot(e2, It, ot), _t = (e2) => Ot(e2, Ft, ct), vt = (e2) => Ot(e2, At, ct), yt = (e2) => Ot(e2, jt,
  ut), bt = (e2) => Ot(e2, Lt, lt), F = (e2) => Ye.test(e2), xt = (e2) => kt(e2, Nt), St = (e2) => kt(e2, Ft),
  Ct = (e2) => kt(e2, At), wt = (e2) => kt(e2, Mt), Tt = (e2) => kt(e2, jt), Et = (e2) => kt(e2, Lt, true), Dt = (e2) => kt(
  e2, It, true), Ot = (e2, t2, n2) => {
    let r2 = Je.exec(e2);
    return r2 ? r2[1] ? t2(r2[1]) : n2(r2[2]) : false;
  }, kt = (e2, t2, n2 = false) => {
    let r2 = Ye.exec(e2);
    return r2 ? r2[1] ? t2(r2[1]) : n2 : false;
  }, At = (e2) => e2 === `position` || e2 === `percentage`, jt = (e2) => e2 === `image` || e2 === `url`, Mt = (e2) => e2 ===
  `length` || e2 === `size` || e2 === `bg-size`, Nt = (e2) => e2 === `length`, Pt = (e2) => e2 === `number`, Ft = (e2) => e2 ===
  `family-name`, It = (e2) => e2 === `number` || e2 === `weight`, Lt = (e2) => e2 === `shadow`, Rt = Ke(() => {
    let e2 = M(`color`), t2 = M(`font`), n2 = M(`text`), r2 = M(`font-weight`), i2 = M(`tracking`), a2 = M(`le\
ading`), o2 = M(`breakpoint`), s2 = M(`container`), c2 = M(`spacing`), l2 = M(`radius`), u2 = M(`shadow`), d2 = M(
    `inset-shadow`), f2 = M(`text-shadow`), p2 = M(`drop-shadow`), m2 = M(`blur`), h2 = M(`perspective`), g2 = M(
    `aspect`), _2 = M(`ease`), v2 = M(`animate`), y2 = () => [`auto`, `avoid`, `all`, `avoid-page`, `page`, `l\
eft`, `right`, `column`], b2 = () => [`center`, `top`, `bottom`, `left`, `right`, `top-left`, `left-top`, `top\
-right`, `right-top`, `bottom-right`, `right-bottom`, `bottom-left`, `left-bottom`], x2 = () => [...b2(), F, P],
    ee2 = () => [`auto`, `hidden`, `clip`, `visible`, `scroll`], S2 = () => [`auto`, `contain`, `none`], C2 = () => [
    F, P, c2], w2 = () => [nt, `full`, `auto`, ...C2()], te2 = () => [rt, `none`, `subgrid`, F, P], ne2 = () => [
    `auto`, { span: [`full`, rt, F, P] }, rt, F, P], T2 = () => [rt, `auto`, F, P], re2 = () => [`auto`, `min`,
    `max`, `fr`, F, P], ie2 = () => [`start`, `end`, `center`, `between`, `around`, `evenly`, `stretch`, `base\
line`, `center-safe`, `end-safe`], ae2 = () => [`start`, `end`, `center`, `stretch`, `center-safe`, `end-safe`],
    oe2 = () => [`auto`, ...C2()], se2 = () => [nt, `auto`, `full`, `dvw`, `dvh`, `lvw`, `lvh`, `svw`, `svh`, `\
min`, `max`, `fit`, ...C2()], ce2 = () => [nt, `screen`, `full`, `dvw`, `lvw`, `svw`, `min`, `max`, `fit`, ...C2()],
    le2 = () => [nt, `screen`, `full`, `lh`, `dvh`, `lvh`, `svh`, `min`, `max`, `fit`, ...C2()], E2 = () => [e2,
    F, P], D2 = () => [...b2(), Ct, vt, { position: [F, P] }], ue2 = () => [`no-repeat`, { repeat: [``, `x`, `\
y`, `space`, `round`] }], de2 = () => [`auto`, `cover`, `contain`, wt, pt, { size: [F, P] }], fe2 = () => [it,
    xt, mt], O2 = () => [``, `none`, `full`, l2, F, P], k2 = () => [``, N, xt, mt], A2 = () => [`solid`, `dash\
ed`, `dotted`, `double`], pe2 = () => [`normal`, `multiply`, `screen`, `overlay`, `darken`, `lighten`, `color-\
dodge`, `color-burn`, `hard-light`, `soft-light`, `difference`, `exclusion`, `hue`, `saturation`, `color`, `lu\
minosity`], j2 = () => [N, it, Ct, vt], me2 = () => [``, `none`, m2, F, P], he2 = () => [`none`, N, F, P], ge2 = () => [
    `none`, N, F, P], _e2 = () => [N, F, P], ve2 = () => [nt, `full`, ...C2()];
    return { cacheSize: 500, theme: { animate: [`spin`, `ping`, `pulse`, `bounce`], aspect: [`video`], blur: [
    at], breakpoint: [at], color: [ot], container: [at], "drop-shadow": [at], ease: [`in`, `out`, `in-out`], font: [
    dt], "font-weight": [`thin`, `extralight`, `light`, `normal`, `medium`, `semibold`, `bold`, `extrabold`, `\
black`], "inset-shadow": [at], leading: [`none`, `tight`, `snug`, `normal`, `relaxed`, `loose`], perspective: [
    `dramatic`, `near`, `normal`, `midrange`, `distant`, `none`], radius: [at], shadow: [at], spacing: [`px`, N],
    text: [at], "text-shadow": [at], tracking: [`tighter`, `tight`, `normal`, `wide`, `wider`, `widest`] }, classGroups: {
    aspect: [{ aspect: [`auto`, `square`, nt, P, F, g2] }], container: [`container`], "container-type": [{ "@c\
ontainer": [``, `normal`, `size`, F, P] }], "container-named": [ft], columns: [{ columns: [N, P, F, s2] }], "b\
reak-after": [{ "break-after": y2() }], "break-before": [{ "break-before": y2() }], "break-inside": [{ "break-\
inside": [`auto`, `avoid`, `avoid-page`, `avoid-column`] }], "box-decoration": [{ "box-decoration": [`slice`, `\
clone`] }], box: [{ box: [`border`, `content`] }], display: [`block`, `inline-block`, `inline`, `flex`, `inlin\
e-flex`, `table`, `inline-table`, `table-caption`, `table-cell`, `table-column`, `table-column-group`, `table-\
footer-group`, `table-header-group`, `table-row-group`, `table-row`, `flow-root`, `grid`, `inline-grid`, `cont\
ents`, `list-item`, `hidden`], sr: [`sr-only`, `not-sr-only`], float: [{ float: [`right`, `left`, `none`, `sta\
rt`, `end`] }], clear: [{ clear: [`left`, `right`, `both`, `none`, `start`, `end`] }], isolation: [`isolate`, `\
isolation-auto`], "object-fit": [{ object: [`contain`, `cover`, `fill`, `none`, `scale-down`] }], "object-posi\
tion": [{ object: x2() }], overflow: [{ overflow: ee2() }], "overflow-x": [{ "overflow-x": ee2() }], "overflow\
-y": [{ "overflow-y": ee2() }], overscroll: [{ overscroll: S2() }], "overscroll-x": [{ "overscroll-x": S2() }],
    "overscroll-y": [{ "overscroll-y": S2() }], position: [`static`, `fixed`, `absolute`, `relative`, `sticky`],
    inset: [{ inset: w2() }], "inset-x": [{ "inset-x": w2() }], "inset-y": [{ "inset-y": w2() }], start: [{ "i\
nset-s": w2(), start: w2() }], end: [{ "inset-e": w2(), end: w2() }], "inset-bs": [{ "inset-bs": w2() }], "ins\
et-be": [{ "inset-be": w2() }], top: [{ top: w2() }], right: [{ right: w2() }], bottom: [{ bottom: w2() }], left: [
    { left: w2() }], visibility: [`visible`, `invisible`, `collapse`], z: [{ z: [rt, `auto`, F, P] }], basis: [
    { basis: [nt, `full`, `auto`, s2, ...C2()] }], "flex-direction": [{ flex: [`row`, `row-reverse`, `col`, `c\
ol-reverse`] }], "flex-wrap": [{ flex: [`nowrap`, `wrap`, `wrap-reverse`] }], flex: [{ flex: [N, nt, `auto`, `\
initial`, `none`, P] }], grow: [{ grow: [``, N, F, P] }], shrink: [{ shrink: [``, N, F, P] }], order: [{ order: [
    rt, `first`, `last`, `none`, F, P] }], "grid-cols": [{ "grid-cols": te2() }], "col-start-end": [{ col: ne2() }],
    "col-start": [{ "col-start": T2() }], "col-end": [{ "col-end": T2() }], "grid-rows": [{ "grid-rows": te2() }],
    "row-start-end": [{ row: ne2() }], "row-start": [{ "row-start": T2() }], "row-end": [{ "row-end": T2() }],
    "grid-flow": [{ "grid-flow": [`row`, `col`, `dense`, `row-dense`, `col-dense`] }], "auto-cols": [{ "auto-c\
ols": re2() }], "auto-rows": [{ "auto-rows": re2() }], gap: [{ gap: C2() }], "gap-x": [{ "gap-x": C2() }], "ga\
p-y": [{ "gap-y": C2() }], "justify-content": [{ justify: [...ie2(), `normal`] }], "justify-items": [{ "justif\
y-items": [...ae2(), `normal`] }], "justify-self": [{ "justify-self": [`auto`, ...ae2()] }], "align-content": [
    { content: [`normal`, ...ie2()] }], "align-items": [{ items: [...ae2(), { baseline: [``, `last`] }] }], "a\
lign-self": [{ self: [`auto`, ...ae2(), { baseline: [``, `last`] }] }], "place-content": [{ "place-content": ie2() }],
    "place-items": [{ "place-items": [...ae2(), `baseline`] }], "place-self": [{ "place-self": [`auto`, ...ae2()] }],
    p: [{ p: C2() }], px: [{ px: C2() }], py: [{ py: C2() }], ps: [{ ps: C2() }], pe: [{ pe: C2() }], pbs: [{ pbs: C2() }],
    pbe: [{ pbe: C2() }], pt: [{ pt: C2() }], pr: [{ pr: C2() }], pb: [{ pb: C2() }], pl: [{ pl: C2() }], m: [
    { m: oe2() }], mx: [{ mx: oe2() }], my: [{ my: oe2() }], ms: [{ ms: oe2() }], me: [{ me: oe2() }], mbs: [{
    mbs: oe2() }], mbe: [{ mbe: oe2() }], mt: [{ mt: oe2() }], mr: [{ mr: oe2() }], mb: [{ mb: oe2() }], ml: [
    { ml: oe2() }], "space-x": [{ "space-x": C2() }], "space-x-reverse": [`space-x-reverse`], "space-y": [{ "s\
pace-y": C2() }], "space-y-reverse": [`space-y-reverse`], size: [{ size: se2() }], "inline-size": [{ inline: [
    `auto`, ...ce2()] }], "min-inline-size": [{ "min-inline": [`auto`, ...ce2()] }], "max-inline-size": [{ "ma\
x-inline": [`none`, ...ce2()] }], "block-size": [{ block: [`auto`, ...le2()] }], "min-block-size": [{ "min-blo\
ck": [`auto`, ...le2()] }], "max-block-size": [{ "max-block": [`none`, ...le2()] }], w: [{ w: [s2, `screen`, ...se2()] }],
    "min-w": [{ "min-w": [s2, `screen`, `none`, ...se2()] }], "max-w": [{ "max-w": [s2, `screen`, `none`, `pro\
se`, { screen: [o2] }, ...se2()] }], h: [{ h: [`screen`, `lh`, ...se2()] }], "min-h": [{ "min-h": [`screen`, `\
lh`, `none`, ...se2()] }], "max-h": [{ "max-h": [`screen`, `lh`, ...se2()] }], "font-size": [{ text: [`base`, n2,
    xt, mt] }], "font-smoothing": [`antialiased`, `subpixel-antialiased`], "font-style": [`italic`, `not-itali\
c`], "font-weight": [{ font: [r2, Dt, gt] }], "font-stretch": [{ "font-stretch": [`ultra-condensed`, `extra-co\
ndensed`, `condensed`, `semi-condensed`, `normal`, `semi-expanded`, `expanded`, `extra-expanded`, `ultra-expan\
ded`, it, P] }], "font-family": [{ font: [St, _t, t2] }], "font-features": [{ "font-features": [P] }], "fvn-no\
rmal": [`normal-nums`], "fvn-ordinal": [`ordinal`], "fvn-slashed-zero": [`slashed-zero`], "fvn-figure": [`lini\
ng-nums`, `oldstyle-nums`], "fvn-spacing": [`proportional-nums`, `tabular-nums`], "fvn-fraction": [`diagonal-f\
ractions`, `stacked-fractions`], tracking: [{ tracking: [i2, F, P] }], "line-clamp": [{ "line-clamp": [N, `non\
e`, F, ht] }], leading: [{ leading: [a2, ...C2()] }], "list-image": [{ "list-image": [`none`, F, P] }], "list-\
style-position": [{ list: [`inside`, `outside`] }], "list-style-type": [{ list: [`disc`, `decimal`, `none`, F,
    P] }], "text-alignment": [{ text: [`left`, `center`, `right`, `justify`, `start`, `end`] }], "placeholder-\
color": [{ placeholder: E2() }], "text-color": [{ text: E2() }], "text-decoration": [`underline`, `overline`, `\
line-through`, `no-underline`], "text-decoration-style": [{ decoration: [...A2(), `wavy`] }], "text-decoration\
-thickness": [{ decoration: [N, `from-font`, `auto`, F, mt] }], "text-decoration-color": [{ decoration: E2() }],
    "underline-offset": [{ "underline-offset": [N, `auto`, F, P] }], "text-transform": [`uppercase`, `lowercas\
e`, `capitalize`, `normal-case`], "text-overflow": [`truncate`, `text-ellipsis`, `text-clip`], "text-wrap": [{
    text: [`wrap`, `nowrap`, `balance`, `pretty`] }], indent: [{ indent: C2() }], "tab-size": [{ tab: [rt, F, P] }],
    "vertical-align": [{ align: [`baseline`, `top`, `middle`, `bottom`, `text-top`, `text-bottom`, `sub`, `sup\
er`, F, P] }], whitespace: [{ whitespace: [`normal`, `nowrap`, `pre`, `pre-line`, `pre-wrap`, `break-spaces`] }],
    break: [{ break: [`normal`, `words`, `all`, `keep`] }], wrap: [{ wrap: [`break-word`, `anywhere`, `normal`] }],
    hyphens: [{ hyphens: [`none`, `manual`, `auto`] }], content: [{ content: [`none`, F, P] }], "bg-attachment": [
    { bg: [`fixed`, `local`, `scroll`] }], "bg-clip": [{ "bg-clip": [`border`, `padding`, `content`, `text`] }],
    "bg-origin": [{ "bg-origin": [`border`, `padding`, `content`] }], "bg-position": [{ bg: D2() }], "bg-repea\
t": [{ bg: ue2() }], "bg-size": [{ bg: de2() }], "bg-image": [{ bg: [`none`, { linear: [{ to: [`t`, `tr`, `r`,
    `br`, `b`, `bl`, `l`, `tl`] }, rt, F, P], radial: [``, F, P], conic: [rt, F, P] }, Tt, yt] }], "bg-color": [
    { bg: E2() }], "gradient-from-pos": [{ from: fe2() }], "gradient-via-pos": [{ via: fe2() }], "gradient-to-\
pos": [{ to: fe2() }], "gradient-from": [{ from: E2() }], "gradient-via": [{ via: E2() }], "gradient-to": [{ to: E2() }],
    rounded: [{ rounded: O2() }], "rounded-s": [{ "rounded-s": O2() }], "rounded-e": [{ "rounded-e": O2() }], "\
rounded-t": [{ "rounded-t": O2() }], "rounded-r": [{ "rounded-r": O2() }], "rounded-b": [{ "rounded-b": O2() }],
    "rounded-l": [{ "rounded-l": O2() }], "rounded-ss": [{ "rounded-ss": O2() }], "rounded-se": [{ "rounded-se": O2() }],
    "rounded-ee": [{ "rounded-ee": O2() }], "rounded-es": [{ "rounded-es": O2() }], "rounded-tl": [{ "rounded-\
tl": O2() }], "rounded-tr": [{ "rounded-tr": O2() }], "rounded-br": [{ "rounded-br": O2() }], "rounded-bl": [{
    "rounded-bl": O2() }], "border-w": [{ border: k2() }], "border-w-x": [{ "border-x": k2() }], "border-w-y": [
    { "border-y": k2() }], "border-w-s": [{ "border-s": k2() }], "border-w-e": [{ "border-e": k2() }], "border\
-w-bs": [{ "border-bs": k2() }], "border-w-be": [{ "border-be": k2() }], "border-w-t": [{ "border-t": k2() }],
    "border-w-r": [{ "border-r": k2() }], "border-w-b": [{ "border-b": k2() }], "border-w-l": [{ "border-l": k2() }],
    "divide-x": [{ "divide-x": k2() }], "divide-x-reverse": [`divide-x-reverse`], "divide-y": [{ "divide-y": k2() }],
    "divide-y-reverse": [`divide-y-reverse`], "border-style": [{ border: [...A2(), `hidden`, `none`] }], "divi\
de-style": [{ divide: [...A2(), `hidden`, `none`] }], "border-color": [{ border: E2() }], "border-color-x": [{
    "border-x": E2() }], "border-color-y": [{ "border-y": E2() }], "border-color-s": [{ "border-s": E2() }], "\
border-color-e": [{ "border-e": E2() }], "border-color-bs": [{ "border-bs": E2() }], "border-color-be": [{ "bo\
rder-be": E2() }], "border-color-t": [{ "border-t": E2() }], "border-color-r": [{ "border-r": E2() }], "border\
-color-b": [{ "border-b": E2() }], "border-color-l": [{ "border-l": E2() }], "divide-color": [{ divide: E2() }],
    "outline-style": [{ outline: [...A2(), `none`, `hidden`] }], "outline-offset": [{ "outline-offset": [N, F,
    P] }], "outline-w": [{ outline: [``, N, xt, mt] }], "outline-color": [{ outline: E2() }], shadow: [{ shadow: [
    ``, `none`, u2, Et, bt] }], "shadow-color": [{ shadow: E2() }], "inset-shadow": [{ "inset-shadow": [`none`,
    d2, Et, bt] }], "inset-shadow-color": [{ "inset-shadow": E2() }], "ring-w": [{ ring: k2() }], "ring-w-inse\
t": [`ring-inset`], "ring-color": [{ ring: E2() }], "ring-offset-w": [{ "ring-offset": [N, mt] }], "ring-offse\
t-color": [{ "ring-offset": E2() }], "inset-ring-w": [{ "inset-ring": k2() }], "inset-ring-color": [{ "inset-r\
ing": E2() }], "text-shadow": [{ "text-shadow": [`none`, f2, Et, bt] }], "text-shadow-color": [{ "text-shadow": E2() }],
    opacity: [{ opacity: [N, F, P] }], "mix-blend": [{ "mix-blend": [...pe2(), `plus-darker`, `plus-lighter`] }],
    "bg-blend": [{ "bg-blend": pe2() }], "mask-clip": [{ "mask-clip": [`border`, `padding`, `content`, `fill`,
    `stroke`, `view`] }, `mask-no-clip`], "mask-composite": [{ mask: [`add`, `subtract`, `intersect`, `exclude`] }],
    "mask-image-linear-pos": [{ "mask-linear": [N] }], "mask-image-linear-from-pos": [{ "mask-linear-from": j2() }],
    "mask-image-linear-to-pos": [{ "mask-linear-to": j2() }], "mask-image-linear-from-color": [{ "mask-linear-\
from": E2() }], "mask-image-linear-to-color": [{ "mask-linear-to": E2() }], "mask-image-t-from-pos": [{ "mask-\
t-from": j2() }], "mask-image-t-to-pos": [{ "mask-t-to": j2() }], "mask-image-t-from-color": [{ "mask-t-from": E2() }],
    "mask-image-t-to-color": [{ "mask-t-to": E2() }], "mask-image-r-from-pos": [{ "mask-r-from": j2() }], "mas\
k-image-r-to-pos": [{ "mask-r-to": j2() }], "mask-image-r-from-color": [{ "mask-r-from": E2() }], "mask-image-\
r-to-color": [{ "mask-r-to": E2() }], "mask-image-b-from-pos": [{ "mask-b-from": j2() }], "mask-image-b-to-pos": [
    { "mask-b-to": j2() }], "mask-image-b-from-color": [{ "mask-b-from": E2() }], "mask-image-b-to-color": [{ "\
mask-b-to": E2() }], "mask-image-l-from-pos": [{ "mask-l-from": j2() }], "mask-image-l-to-pos": [{ "mask-l-to": j2() }],
    "mask-image-l-from-color": [{ "mask-l-from": E2() }], "mask-image-l-to-color": [{ "mask-l-to": E2() }], "m\
ask-image-x-from-pos": [{ "mask-x-from": j2() }], "mask-image-x-to-pos": [{ "mask-x-to": j2() }], "mask-image-\
x-from-color": [{ "mask-x-from": E2() }], "mask-image-x-to-color": [{ "mask-x-to": E2() }], "mask-image-y-from\
-pos": [{ "mask-y-from": j2() }], "mask-image-y-to-pos": [{ "mask-y-to": j2() }], "mask-image-y-from-color": [
    { "mask-y-from": E2() }], "mask-image-y-to-color": [{ "mask-y-to": E2() }], "mask-image-radial": [{ "mask-\
radial": [F, P] }], "mask-image-radial-from-pos": [{ "mask-radial-from": j2() }], "mask-image-radial-to-pos": [
    { "mask-radial-to": j2() }], "mask-image-radial-from-color": [{ "mask-radial-from": E2() }], "mask-image-r\
adial-to-color": [{ "mask-radial-to": E2() }], "mask-image-radial-shape": [{ "mask-radial": [`circle`, `ellips\
e`] }], "mask-image-radial-size": [{ "mask-radial": [{ closest: [`side`, `corner`], farthest: [`side`, `corner`] }] }],
    "mask-image-radial-pos": [{ "mask-radial-at": b2() }], "mask-image-conic-pos": [{ "mask-conic": [N] }], "m\
ask-image-conic-from-pos": [{ "mask-conic-from": j2() }], "mask-image-conic-to-pos": [{ "mask-conic-to": j2() }],
    "mask-image-conic-from-color": [{ "mask-conic-from": E2() }], "mask-image-conic-to-color": [{ "mask-conic-\
to": E2() }], "mask-mode": [{ mask: [`alpha`, `luminance`, `match`] }], "mask-origin": [{ "mask-origin": [`bor\
der`, `padding`, `content`, `fill`, `stroke`, `view`] }], "mask-position": [{ mask: D2() }], "mask-repeat": [{
    mask: ue2() }], "mask-size": [{ mask: de2() }], "mask-type": [{ "mask-type": [`alpha`, `luminance`] }], "m\
ask-image": [{ mask: [`none`, F, P] }], filter: [{ filter: [``, `none`, F, P] }], blur: [{ blur: me2() }], brightness: [
    { brightness: [N, F, P] }], contrast: [{ contrast: [N, F, P] }], "drop-shadow": [{ "drop-shadow": [``, `no\
ne`, p2, Et, bt] }], "drop-shadow-color": [{ "drop-shadow": E2() }], grayscale: [{ grayscale: [``, N, F, P] }],
    "hue-rotate": [{ "hue-rotate": [N, F, P] }], invert: [{ invert: [``, N, F, P] }], saturate: [{ saturate: [
    N, F, P] }], sepia: [{ sepia: [``, N, F, P] }], "backdrop-filter": [{ "backdrop-filter": [``, `none`, F, P] }],
    "backdrop-blur": [{ "backdrop-blur": me2() }], "backdrop-brightness": [{ "backdrop-brightness": [N, F, P] }],
    "backdrop-contrast": [{ "backdrop-contrast": [N, F, P] }], "backdrop-grayscale": [{ "backdrop-grayscale": [
    ``, N, F, P] }], "backdrop-hue-rotate": [{ "backdrop-hue-rotate": [N, F, P] }], "backdrop-invert": [{ "bac\
kdrop-invert": [``, N, F, P] }], "backdrop-opacity": [{ "backdrop-opacity": [N, F, P] }], "backdrop-saturate": [
    { "backdrop-saturate": [N, F, P] }], "backdrop-sepia": [{ "backdrop-sepia": [``, N, F, P] }], "border-coll\
apse": [{ border: [`collapse`, `separate`] }], "border-spacing": [{ "border-spacing": C2() }], "border-spacing\
-x": [{ "border-spacing-x": C2() }], "border-spacing-y": [{ "border-spacing-y": C2() }], "table-layout": [{ table: [
    `auto`, `fixed`] }], caption: [{ caption: [`top`, `bottom`] }], transition: [{ transition: [``, `all`, `co\
lors`, `opacity`, `shadow`, `transform`, `none`, F, P] }], "transition-behavior": [{ transition: [`normal`, `d\
iscrete`] }], duration: [{ duration: [N, `initial`, F, P] }], ease: [{ ease: [`linear`, `initial`, _2, F, P] }],
    delay: [{ delay: [N, F, P] }], animate: [{ animate: [`none`, v2, F, P] }], backface: [{ backface: [`hidden`,
    `visible`] }], perspective: [{ perspective: [h2, F, P] }], "perspective-origin": [{ "perspective-origin": x2() }],
    rotate: [{ rotate: he2() }], "rotate-x": [{ "rotate-x": he2() }], "rotate-y": [{ "rotate-y": he2() }], "ro\
tate-z": [{ "rotate-z": he2() }], scale: [{ scale: ge2() }], "scale-x": [{ "scale-x": ge2() }], "scale-y": [{ "\
scale-y": ge2() }], "scale-z": [{ "scale-z": ge2() }], "scale-3d": [`scale-3d`], skew: [{ skew: _e2() }], "ske\
w-x": [{ "skew-x": _e2() }], "skew-y": [{ "skew-y": _e2() }], transform: [{ transform: [F, P, ``, `none`, `gpu`,
    `cpu`] }], "transform-origin": [{ origin: x2() }], "transform-style": [{ transform: [`3d`, `flat`] }], translate: [
    { translate: ve2() }], "translate-x": [{ "translate-x": ve2() }], "translate-y": [{ "translate-y": ve2() }],
    "translate-z": [{ "translate-z": ve2() }], "translate-none": [`translate-none`], zoom: [{ zoom: [rt, F, P] }],
    accent: [{ accent: E2() }], appearance: [{ appearance: [`none`, `auto`] }], "caret-color": [{ caret: E2() }],
    "color-scheme": [{ scheme: [`normal`, `dark`, `light`, `light-dark`, `only-dark`, `only-light`] }], cursor: [
    { cursor: [`auto`, `default`, `pointer`, `wait`, `text`, `move`, `help`, `not-allowed`, `none`, `context-m\
enu`, `progress`, `cell`, `crosshair`, `vertical-text`, `alias`, `copy`, `no-drop`, `grab`, `grabbing`, `all-s\
croll`, `col-resize`, `row-resize`, `n-resize`, `e-resize`, `s-resize`, `w-resize`, `ne-resize`, `nw-resize`, `\
se-resize`, `sw-resize`, `ew-resize`, `ns-resize`, `nesw-resize`, `nwse-resize`, `zoom-in`, `zoom-out`, F, P] }],
    "field-sizing": [{ "field-sizing": [`fixed`, `content`] }], "pointer-events": [{ "pointer-events": [`auto`,
    `none`] }], resize: [{ resize: [`none`, ``, `y`, `x`] }], "scroll-behavior": [{ scroll: [`auto`, `smooth`] }],
    "scrollbar-thumb-color": [{ "scrollbar-thumb": E2() }], "scrollbar-track-color": [{ "scrollbar-track": E2() }],
    "scrollbar-gutter": [{ "scrollbar-gutter": [`auto`, `stable`, `both`] }], "scrollbar-w": [{ scrollbar: [`a\
uto`, `thin`, `none`] }], "scroll-m": [{ "scroll-m": C2() }], "scroll-mx": [{ "scroll-mx": C2() }], "scroll-my": [
    { "scroll-my": C2() }], "scroll-ms": [{ "scroll-ms": C2() }], "scroll-me": [{ "scroll-me": C2() }], "scrol\
l-mbs": [{ "scroll-mbs": C2() }], "scroll-mbe": [{ "scroll-mbe": C2() }], "scroll-mt": [{ "scroll-mt": C2() }],
    "scroll-mr": [{ "scroll-mr": C2() }], "scroll-mb": [{ "scroll-mb": C2() }], "scroll-ml": [{ "scroll-ml": C2() }],
    "scroll-p": [{ "scroll-p": C2() }], "scroll-px": [{ "scroll-px": C2() }], "scroll-py": [{ "scroll-py": C2() }],
    "scroll-ps": [{ "scroll-ps": C2() }], "scroll-pe": [{ "scroll-pe": C2() }], "scroll-pbs": [{ "scroll-pbs": C2() }],
    "scroll-pbe": [{ "scroll-pbe": C2() }], "scroll-pt": [{ "scroll-pt": C2() }], "scroll-pr": [{ "scroll-pr": C2() }],
    "scroll-pb": [{ "scroll-pb": C2() }], "scroll-pl": [{ "scroll-pl": C2() }], "snap-align": [{ snap: [`start`,
    `end`, `center`, `align-none`] }], "snap-stop": [{ snap: [`normal`, `always`] }], "snap-type": [{ snap: [`\
none`, `x`, `y`, `both`] }], "snap-strictness": [{ snap: [`mandatory`, `proximity`] }], touch: [{ touch: [`aut\
o`, `none`, `manipulation`] }], "touch-x": [{ "touch-pan": [`x`, `left`, `right`] }], "touch-y": [{ "touch-pan": [
    `y`, `up`, `down`] }], "touch-pz": [`touch-pinch-zoom`], select: [{ select: [`none`, `text`, `all`, `auto`] }],
    "will-change": [{ "will-change": [`auto`, `scroll`, `contents`, `transform`, F, P] }], fill: [{ fill: [`no\
ne`, ...E2()] }], "stroke-w": [{ stroke: [N, xt, mt, ht] }], stroke: [{ stroke: [`none`, ...E2()] }], "forced-\
color-adjust": [{ "forced-color-adjust": [`auto`, `none`] }] }, conflictingClassGroups: { "container-named": [
    `container-type`], overflow: [`overflow-x`, `overflow-y`], overscroll: [`overscroll-x`, `overscroll-y`], inset: [
    `inset-x`, `inset-y`, `inset-bs`, `inset-be`, `start`, `end`, `top`, `right`, `bottom`, `left`], "inset-x": [
    `right`, `left`], "inset-y": [`top`, `bottom`], flex: [`basis`, `grow`, `shrink`], gap: [`gap-x`, `gap-y`],
    p: [`px`, `py`, `ps`, `pe`, `pbs`, `pbe`, `pt`, `pr`, `pb`, `pl`], px: [`pr`, `pl`], py: [`pt`, `pb`], m: [
    `mx`, `my`, `ms`, `me`, `mbs`, `mbe`, `mt`, `mr`, `mb`, `ml`], mx: [`mr`, `ml`], my: [`mt`, `mb`], size: [
    `w`, `h`], "font-size": [`leading`], "fvn-normal": [`fvn-ordinal`, `fvn-slashed-zero`, `fvn-figure`, `fvn-\
spacing`, `fvn-fraction`], "fvn-ordinal": [`fvn-normal`], "fvn-slashed-zero": [`fvn-normal`], "fvn-figure": [`\
fvn-normal`], "fvn-spacing": [`fvn-normal`], "fvn-fraction": [`fvn-normal`], "line-clamp": [`display`, `overfl\
ow`], rounded: [`rounded-s`, `rounded-e`, `rounded-t`, `rounded-r`, `rounded-b`, `rounded-l`, `rounded-ss`, `r\
ounded-se`, `rounded-ee`, `rounded-es`, `rounded-tl`, `rounded-tr`, `rounded-br`, `rounded-bl`], "rounded-s": [
    `rounded-ss`, `rounded-es`], "rounded-e": [`rounded-se`, `rounded-ee`], "rounded-t": [`rounded-tl`, `round\
ed-tr`], "rounded-r": [`rounded-tr`, `rounded-br`], "rounded-b": [`rounded-br`, `rounded-bl`], "rounded-l": [`\
rounded-tl`, `rounded-bl`], "border-spacing": [`border-spacing-x`, `border-spacing-y`], "border-w": [`border-w\
-x`, `border-w-y`, `border-w-s`, `border-w-e`, `border-w-bs`, `border-w-be`, `border-w-t`, `border-w-r`, `bord\
er-w-b`, `border-w-l`], "border-w-x": [`border-w-r`, `border-w-l`], "border-w-y": [`border-w-t`, `border-w-b`],
    "border-color": [`border-color-x`, `border-color-y`, `border-color-s`, `border-color-e`, `border-color-bs`,
    `border-color-be`, `border-color-t`, `border-color-r`, `border-color-b`, `border-color-l`], "border-color-\
x": [`border-color-r`, `border-color-l`], "border-color-y": [`border-color-t`, `border-color-b`], translate: [
    `translate-x`, `translate-y`, `translate-none`], "translate-none": [`translate`, `translate-x`, `translate\
-y`, `translate-z`], "scroll-m": [`scroll-mx`, `scroll-my`, `scroll-ms`, `scroll-me`, `scroll-mbs`, `scroll-mb\
e`, `scroll-mt`, `scroll-mr`, `scroll-mb`, `scroll-ml`], "scroll-mx": [`scroll-mr`, `scroll-ml`], "scroll-my": [
    `scroll-mt`, `scroll-mb`], "scroll-p": [`scroll-px`, `scroll-py`, `scroll-ps`, `scroll-pe`, `scroll-pbs`, `\
scroll-pbe`, `scroll-pt`, `scroll-pr`, `scroll-pb`, `scroll-pl`], "scroll-px": [`scroll-pr`, `scroll-pl`], "sc\
roll-py": [`scroll-pt`, `scroll-pb`], touch: [`touch-x`, `touch-y`, `touch-pz`], "touch-x": [`touch`], "touch-\
y": [`touch`], "touch-pz": [`touch`] }, conflictingClassGroupModifiers: { "font-size": [`leading`] }, postfixLookupClassGroups: [
    `container-type`], orderSensitiveModifiers: [`*`, `**`, `after`, `backdrop`, `before`, `details-content`, `\
file`, `first-letter`, `first-line`, `marker`, `placeholder`, `selection`] };
  });
  function zt(...e2) {
    return Rt(me(e2));
  }
  var Bt = (e2) => {
    let t2, n2 = /* @__PURE__ */ new Set(), r2 = (e3, r3) => {
      let i3 = typeof e3 == `function` ? e3(t2) : e3;
      if (!Object.is(i3, t2)) {
        let e4 = t2;
        t2 = r3 ?? (typeof i3 != `object` || !i3) ? i3 : Object.assign({}, t2, i3), n2.forEach((n3) => n3(t2, e4));
      }
    }, i2 = () => t2, a2 = { setState: r2, getState: i2, getInitialState: () => o2, subscribe: (e3) => (n2.add(
    e3), () => n2.delete(e3)) }, o2 = t2 = e2(r2, i2, a2);
    return a2;
  }, Vt = ((e2) => e2 ? Bt(e2) : Bt), Ht = (e2) => e2;
  function Ut(e2, t2 = Ht) {
    let n2 = S.useSyncExternalStore(e2.subscribe, S.useCallback(() => t2(e2.getState()), [e2, t2]), S.useCallback(
    () => t2(e2.getInitialState()), [e2, t2]));
    return S.useDebugValue(n2), n2;
  }
  var Wt = (e2) => {
    let t2 = Vt(e2), n2 = (e3) => Ut(t2, e3);
    return Object.assign(n2, t2), n2;
  }, Gt = ((e2) => e2 ? Wt(e2) : Wt);
  function Kt(e2, t2) {
    let n2;
    try {
      n2 = e2();
    } catch {
      return;
    }
    return { getItem: (e3) => {
      let r2 = (e4) => e4 === null ? null : JSON.parse(e4, t2?.reviver), i2 = n2.getItem(e3) ?? null;
      return i2 instanceof Promise ? i2.then(r2) : r2(i2);
    }, setItem: (e3, r2) => n2.setItem(e3, JSON.stringify(r2, t2?.replacer)), removeItem: (e3) => n2.removeItem(
    e3) };
  }
  var qt = (e2) => (t2) => {
    try {
      let n2 = e2(t2);
      return n2 instanceof Promise ? n2 : { then(e3) {
        return qt(e3)(n2);
      }, catch(e3) {
        return this;
      } };
    } catch (e3) {
      return { then(e4) {
        return this;
      }, catch(t3) {
        return qt(t3)(e3);
      } };
    }
  }, Jt = (e2, t2) => (n2, r2, i2) => {
    let a2 = { storage: Kt(() => window.localStorage), partialize: (e3) => e3, version: 0, merge: (e3, t3) => ({
    ...t3, ...e3 }), ...t2 }, o2 = false, s2 = 0, c2 = /* @__PURE__ */ new Set(), l2 = /* @__PURE__ */ new Set(),
    u2 = a2.storage;
    if (!u2) return e2((...e3) => {
      console.warn(`[zustand persist middleware] Unable to update item '${a2.name}', the given storage is curr\
ently unavailable.`), n2(...e3);
    }, r2, i2);
    let d2 = () => {
      let e3 = a2.partialize({ ...r2() });
      return u2.setItem(a2.name, { state: e3, version: a2.version });
    }, f2 = i2.setState;
    i2.setState = (e3, t3) => (f2(e3, t3), d2());
    let p2 = e2((...e3) => (n2(...e3), d2()), r2, i2);
    i2.getInitialState = () => p2;
    let m2, h2 = () => {
      if (!u2) return;
      let e3 = ++s2;
      o2 = false, c2.forEach((e4) => e4(r2() ?? p2));
      let t3 = a2.onRehydrateStorage?.call(a2, r2() ?? p2) || void 0;
      return qt(u2.getItem.bind(u2))(a2.name).then((e4) => {
        if (e4) {
          if (typeof e4.version == `number` && e4.version !== a2.version) {
            if (a2.migrate) {
              let t4 = a2.migrate(e4.state, e4.version);
              return t4 instanceof Promise ? t4.then((e5) => [true, e5]) : [true, t4];
            }
            console.error(`State loaded from storage couldn't be migrated since no migrate function was provid\
ed`);
          } else return [false, e4.state];
        }
        return [false, void 0];
      }).then((t4) => {
        if (e3 !== s2) return;
        let [i3, o3] = t4;
        if (m2 = a2.merge(o3, r2() ?? p2), n2(m2, true), i3) return d2();
      }).then(() => {
        e3 === s2 && (t3?.(r2(), void 0), m2 = r2(), o2 = true, l2.forEach((e4) => e4(m2)));
      }).catch((n3) => {
        e3 === s2 && t3?.(void 0, n3);
      });
    };
    return i2.persist = { setOptions: (e3) => {
      a2 = { ...a2, ...e3 }, e3.storage && (u2 = e3.storage);
    }, clearStorage: () => {
      ++s2, u2?.removeItem(a2.name);
    }, getOptions: () => a2, rehydrate: () => h2(), hasHydrated: () => o2, onHydrate: (e3) => (c2.add(e3), () => {
      c2.delete(e3);
    }), onFinishHydration: (e3) => (l2.add(e3), () => {
      l2.delete(e3);
    }) }, a2.skipHydration || h2(), m2 || p2;
  }, Yt = `한빛중학교`, Xt = `5.75.80.2`, Zt = `p-seojun`, Qt = `2-3 (132)`, $t = [{ id: `p-seojun`, name: `\
김서준`, title: `2학년 3반 담임`, ext: `132`, status: `online` }, { id: `p-dohyun`, name: `이도현`,
  title: `교장`, ext: `101`, status: `online` }, { id: `p-seoyeon`, name: `박서연`, title: `교감`, ext: `\
102`, status: `online` }, { id: `p-eunji`, name: `최은지`, title: `교무부장`, ext: `107`, status: `onli\
ne` }, { id: `p-jihun`, name: `한지훈`, title: `연구부장`, ext: `108`, status: `offline` }, { id: `p-se\
oa`, name: `윤서아`, title: `생활교육부장`, ext: `112`, status: `offline` }, { id: `p-minjae`, name: `\
강민재`, title: `인문사회부장`, ext: `118`, status: `offline` }, { id: `p-subin`, name: `오수빈`, title: `\
융합정보부장`, ext: `114`, status: `pc` }, { id: `p-haeun`, name: `신하은`, title: `학생맞춤지원부장`,
  ext: `117`, room: `미술2실,109`, status: `online` }, { id: `p-jaehyuk`, name: `임재혁`, title: `과학환경부장`,
  ext: `115`, status: `offline` }, { id: `p-doyoon`, name: `배도윤`, title: `체육안전부장`, ext: `110`,
  status: `online` }, { id: `p-chaewon`, name: `문채원`, title: `진로교육부장`, ext: `144`, status: `\
online` }, { id: `p-jiho`, name: `서지호`, title: `3학년부장`, ext: `113`, status: `online` }, { id: `p\
-yuna`, name: `남유나`, title: `2학년부장`, ext: `111`, status: `offline` }, { id: `p-siwoo`, name: `홍시\
우`, title: `1학년부장`, ext: `116`, status: `online` }, { id: `p-harin`, name: `정하린`, title: `연구기획`,
  ext: `168`, status: `online` }, { id: `p-taeyang`, name: `유태양`, title: `영재`, ext: `140`, status: `\
pc` }, { id: `p-jimin`, name: `노지민`, title: `과학환경기획`, ext: `143`, status: `offline` }, { id: `\
p-seunga`, name: `백승아`, title: `1학년기획`, ext: `139`, status: `online` }, { id: `p-junhyuk`, name: `\
하준혁`, title: `스포츠클럽`, ext: `183`, status: `pc` }, { id: `p-haeun-plan`, name: `신하은`, title: `\
학생맞춤지원기획`, ext: `121`, status: `online` }, { id: `p-jia`, name: `권지애`, title: `2학년 1반 담임`,
  ext: `201`, status: `online` }, { id: `p-sehun`, name: `안세훈`, title: `2학년 2반 담임`, ext: `202`,
  status: `online` }, { id: `p-yuna-24`, name: `허윤아`, title: `2학년 4반 담임`, ext: `204`, status: `\
offline` }, { id: `p-taemin`, name: `심태민`, title: `2학년 5반 담임`, ext: `205`, status: `online` },
  { id: `p-soyul`, name: `전소율`, title: `2학년 6반 담임`, ext: `206`, status: `pc` }, { id: `p-minse\
ok`, name: `구민석`, title: `1학년 1반 담임`, ext: `221`, status: `online` }, { id: `p-haneul`, name: `\
민하늘`, title: `1학년 2반 담임`, ext: `222`, status: `offline` }, { id: `p-yerin`, name: `손예린`,
  title: `1학년 3반 담임`, ext: `223`, status: `online` }, { id: `p-dokyung`, name: `양도경`, title: `\
1학년 4반 담임`, ext: `224`, status: `online` }, { id: `p-haeun2`, name: `표하은`, title: `1학년 5반 담임`,
  ext: `225`, status: `offline` }, { id: `p-seunghyun`, name: `기승현`, title: `1학년 6반 담임`, ext: `\
226`, status: `online` }, { id: `p-jiwoo`, name: `봉지우`, title: `3학년 1반 담임`, ext: `301`, status: `\
online` }, { id: `p-arin`, name: `설아린`, title: `3학년 2반 담임`, ext: `302`, status: `offline` }, {
  id: `p-junseo`, name: `마준서`, title: `3학년 3반 담임`, ext: `303`, status: `online` }, { id: `p-hy\
ewon`, name: `나혜원`, title: `3학년 4반 담임`, ext: `304`, status: `online` }, { id: `p-ian`, name: `\
도이안`, title: `3학년 5반 담임`, ext: `305`, status: `pc` }, { id: `p-seojin`, name: `라서진`, title: `\
3학년 6반 담임`, ext: `306`, status: `offline` }, { id: `p-sungmin`, name: `변성민`, title: `행정실장`,
  ext: `150`, status: `online` }, { id: `p-jihye`, name: `원지혜`, title: `회계`, ext: `151`, status: `on\
line` }, { id: `p-eunjung`, name: `길은정`, title: `보건`, ext: `160`, status: `online` }, { id: `p-mina`,
  name: `탁민아`, title: `상담`, ext: `161`, status: `offline` }, { id: `p-seungho`, name: `위승호`, title: `\
사서`, ext: `162`, status: `pc` }, { id: `p-sohee`, name: `편소희`, title: `영양`, ext: `163`, status: `\
online` }, { id: `p-ara`, name: `진아라`, title: `특수`, ext: `170`, status: `online` }, { id: `p-council`,
  name: `한빛중 학생회`, title: `학생회`, ext: `180`, status: `offline` }, { id: `p-neis`, name: `나이스\
 안내`, title: `시스템`, ext: `000`, status: `pc` }], en = Object.fromEntries($t.map((e2) => [e2.id, e2]));
  function I(e2) {
    let t2 = en[e2];
    return { id: `n-${e2}`, label: t2 ? `${t2.name}(${t2.title},${t2.ext})` : e2, kind: `person`, personId: e2 };
  }
  var tn = { id: `school`, label: Yt, kind: `group`, children: [{ id: `g-principal`, label: `교장`, kind: `g\
roup`, children: [I(`p-dohyun`)] }, { id: `g-vp`, label: `교감`, kind: `group`, children: [I(`p-seoyeon`)] },
  { id: `g-heads`, label: `부장`, kind: `group`, children: [I(`p-eunji`), I(`p-jihun`), I(`p-seoa`), I(`p-mi\
njae`), I(`p-subin`), I(`p-haeun`), I(`p-jaehyuk`), I(`p-doyoon`), I(`p-chaewon`), I(`p-jiho`), I(`p-yuna`), I(
  `p-siwoo`)] }, { id: `g-plan`, label: `기획`, kind: `group`, children: [I(`p-yuna`), I(`p-haeun-plan`), I(
  `p-harin`), I(`p-jiho`), I(`p-taeyang`), I(`p-jimin`), I(`p-seunga`), I(`p-subin`), I(`p-junhyuk`)] }, { id: `\
g-subject`, label: `교과부장`, kind: `group`, children: [I(`p-yuna`), I(`p-haeun-plan`), I(`p-harin`), I(`\
p-jiho`), I(`p-taeyang`), I(`p-jimin`), I(`p-seunga`), I(`p-subin`), I(`p-junhyuk`)] }, { id: `g-g1`, label: `\
1학년`, kind: `group`, children: [I(`p-siwoo`), I(`p-seunga`), I(`p-minseok`), I(`p-haneul`), I(`p-yerin`), I(
  `p-dokyung`), I(`p-haeun2`), I(`p-seunghyun`)] }, { id: `g-g2`, label: `2학년`, kind: `group`, children: [
  I(`p-yuna`), I(`p-jia`), I(`p-sehun`), I(`p-seojun`), I(`p-yuna-24`), I(`p-taemin`), I(`p-soyul`)] }, { id: `\
g-g3`, label: `3학년`, kind: `group`, children: [I(`p-jiho`), I(`p-jiwoo`), I(`p-arin`), I(`p-junseo`), I(`p\
-hyewon`), I(`p-ian`), I(`p-seojin`)] }, { id: `g-admin`, label: `행정실`, kind: `group`, children: [I(`p-s\
ungmin`), I(`p-jihye`)] }, { id: `g-support`, label: `비교과`, kind: `group`, children: [I(`p-eunjung`), I(
  `p-mina`), I(`p-seungho`), I(`p-sohee`), I(`p-ara`), I(`p-junhyuk`)] }] }, nn = { school: true, "g-heads": true,
  "g-subject": true }, rn = { consentList: { id: `a-list`, name: `(2학기) 2026 행정정보공유 연계 동의서 제출유무 목록표.hwp`,
  sizeLabel: `35 KB`, href: `/files/consent-list.txt`, kind: `hwp` }, consentLetter: { id: `a-letter`, name: `\
2026학년도 2학기 행정정보공유 연계 동의서 가정통신문.hwp`, sizeLabel: `99 KB`, href: `/fi\
les/consent-letter.txt`, kind: `hwp` }, timetable: { id: `a-time`, name: `2026-2학기 확정 시간표.hwp`, sizeLabel: `\
48 KB`, href: `/files/timetable.txt`, kind: `hwp` }, checkup: { id: `a-check`, name: `1학년 건강검진 일정 안내.hwp`,
  sizeLabel: `22 KB`, href: `/files/checkup.txt`, kind: `hwp` }, drill: { id: `a-drill`, name: `2026 을지연습 교직원 \
행동요령.pdf`, sizeLabel: `180 KB`, href: `/files/drill.txt`, kind: `pdf` }, weekly: { id: `a-week`, name: `\
8월 4주 주간교육계획.xlsx`, sizeLabel: `41 KB`, href: `/files/weekly.txt`, kind: `xls` }, meeting: { id: `\
a-meet`, name: `8월 교무회의 안건.hwp`, sizeLabel: `28 KB`, href: `/files/meeting.txt`, kind: `hwp` }, allergy: {
  id: `a-food`, name: `9월 급식 알레르기 조사표.hwp`, sizeLabel: `19 KB`, href: `/files/allergy.txt`,
  kind: `hwp` } }, an = [`p-jia`, `p-sehun`, `p-seojun`, `p-yuna-24`, `p-taemin`, `p-soyul`], on = [...an, `p-\
minseok`, `p-haneul`, `p-yerin`, `p-dokyung`, `p-haeun2`, `p-seunghyun`, `p-jiwoo`, `p-arin`, `p-junseo`, `p-h\
yewon`, `p-ian`, `p-seojin`];
  function L(e2) {
    return Date.parse(e2);
  }
  var sn = [{ id: `m-01`, folder: `inbox`, fromId: `p-eunji`, toIds: on, ccIds: [`p-dohyun`, `p-seoyeon`], subject: `\
안녕하세요 담임선생님, 교무부 최은지입니다. 학급함에`, preview: `학급함에 생활기록부 학생주소 행정정보공유\
 연계시스템 동의서를 넣어두었습니다.`, forwardedNote: `부재중 수신된 내용입니다.`, bodyHtml: `\
<p>안녕하세요 담임선생님, 교무부 최은지입니다.</p>
<p>학급함에 <b class="hl">생활기록부 학생주소 행정정보공유 연계시스템 동의서</b>를 넣어두었습니다.</p>
<p>가정통신문을 학생들에게 배부해주시고<br/>뒷면 사전동의서에 서명해서 제출할 수 있도록 안내 부탁드립니다.</p>
<p>동의서를 제출하지 않는 경우<br/>추후에 주민등록등본과 초본을 제출해야 하는 번거로움이 발생하므로 학생들이<br/>모두 동의서를 제출할 수 있도록 독려 부탁드립니다.</p>
<p class="due">9월 1일(화)까지</p>
<p class="item"><b>1. 제출유무 목록표</b> (담임선생님이 아래 첨부파일 출력하셔서 직접 작성하셔서 가장 첫페이지 )</p>
<p class="item"><b>2. 행정정보 공동이용 사전동의서</b>(각반 번호순대로 걸어서 1번과 함께 제출)</p>
<p>1,2 번을 모두 취합하는 대로 교무부 최은지에게 제출 부탁드립니다.</p>
<p>바쁜 학기 초에 협조해 주셔서 감사합니다.</p>`, dateLabel: `2026/08/28 09:32:21`, ts: L(`20\
26-08-28T09:32:21+09:00`), attachments: [rn.consentList, rn.consentLetter], isGroup: true, unread: false, starred: true },
  { id: `m-02`, folder: `inbox`, fromId: `p-eunji`, toIds: an, ccIds: [`p-yuna`], subject: `안녕하세요 1, 2, 3학년 담임\
선생님께 안내드립니다`, preview: `2학기 학급 환경 구성 점검 체크리스트를 공유합니다.`,
  bodyHtml: `<p>안녕하세요. 교무부입니다.</p>
<p>2학기 학급 환경 구성 점검 체크리스트를 공유합니다. 교실 게시물·사물함 명찰·화재대피도가 부착되어 있는지 확인 부탁드립니다.</p>
<p class="due">8월 28일(금) 종례 전까지</p>
<p>이상입니다.</p>`, dateLabel: `2026/08/28 09:26:40`, ts: L(`2026-08-28T09:26:40+09:00`), attachments: [
  rn.meeting], isGroup: true, unread: false, starred: true }, { id: `m-03`, folder: `inbox`, fromId: `p-jiho`,
  toIds: [`p-seojun`], ccIds: [], subject: `전체메시지 죄송합니다. 3학년 관련 착오 발송이었습니다`,
  preview: `방금 보낸 전체 메시지는 3학년 담임 대상이었습니다. 무시해 주세요.`, bodyHtml: `\
<p>김서준 선생님, 안녕하세요. 3학년부장입니다.</p>
<p>방금 보낸 전체 메시지는 3학년 담임 대상이었습니다. 2학년 선생님께서는 무시해 주시면 됩니다.</p>
<p>불편을 드려 죄송합니다.</p>`, dateLabel: `2026/08/28 08:46:10`, ts: L(`2026-08-28T08:46:10+09:00`),
  attachments: [], isGroup: false, unread: true, starred: false }, { id: `m-04`, folder: `inbox`, fromId: `p-s\
ubin`, toIds: [`p-seojun`], ccIds: [], subject: `네 선생님, 제가 아는 범위에서 답변드립니다`,
  preview: `전자칠판 계정은 융합정보부에서 일괄 초기화했습니다.`, bodyHtml: `<p>김서준 선생님\
 안녕하세요. 융합정보부 오수빈입니다.</p>
<p>문의하신 전자칠판 계정은 오늘 오전에 일괄 초기화했습니다. 비밀번호는 교무실 게시 비밀번호와 동일합니다.</p>
<p>접속이 안 되면 내선 114로 연락 주세요.</p>`, dateLabel: `2026/08/28 08:35:33`, ts: L(`2026-08\
-28T08:35:33+09:00`), attachments: [], isGroup: false, unread: true, starred: false }, { id: `m-05`, folder: `\
inbox`, fromId: `p-eunjung`, toIds: an, ccIds: [`p-yuna`], subject: `1학년 건강검진 및 2학년 추가 검진 안내`,
  preview: `이번 주 목요일 1학년 건강검진이 있습니다. 2학년 미검자 명단도 확인 바랍니다.`,
  bodyHtml: `<p>보건실입니다.</p>
<p>이번 주 목요일 1학년 건강검진이 진행됩니다. 2학년 미검자 명단도 함께 송부하오니 해당 학생 가정에 안내 부탁드립니다.</p>
<p>검진 당일 체육복 착용, 공복 유지 안내 포스터를 학급 게시판에 붙여 주세요.</p>`,
  dateLabel: `2026/08/28 08:35:08`, ts: L(`2026-08-28T08:35:08+09:00`), attachments: [rn.checkup], isGroup: false,
  unread: false, starred: false }, { id: `m-06`, folder: `inbox`, fromId: `p-subin`, toIds: $t.filter((e2) => e2.
  id !== `p-neis` && e2.id !== `p-council`).map((e2) => e2.id), ccIds: [], subject: `*전화기 사용 가능* 교무실 교환 복구 완료`,
  preview: `오전 8시 부로 교무실 교환기가 복구되어 내선·외선 모두 사용 가능합니다.`,
  bodyHtml: `<p>융합정보부입니다.</p>
<p><b>*전화기 사용 가능*</b></p>
<p>오전 8시 부로 교무실 교환기가 복구되어 내선·외선 모두 사용 가능합니다. 불편을 드려 죄송합니다.</p>`,
  dateLabel: `2026/08/28 08:34:29`, ts: L(`2026-08-28T08:34:29+09:00`), attachments: [], isGroup: false, unread: false,
  starred: false }, { id: `m-07`, folder: `inbox`, fromId: `p-arin`, toIds: [`p-seojun`, `p-jia`, `p-sehun`], ccIds: [],
  subject: `2, 3학년 담임선생님, 진로체험 버스 배정 확인 부탁드립니다`, preview: `9월 현장\
체험학습 버스 배정표를 공유합니다.`, bodyHtml: `<p>안녕하세요. 3학년 설아린입니다.</p>
<p>9월 현장체험학습 버스 배정 초안입니다. 2학년 3반 김서준 선생님 학급은 2호차입니다. 인원 변동 있으면 알려 주세요.</p>`,
  dateLabel: `2026/08/28 08:31:06`, ts: L(`2026-08-28T08:31:06+09:00`), attachments: [], isGroup: false, unread: false,
  starred: false }, { id: `m-08`, folder: `inbox`, fromId: `p-subin`, toIds: $t.filter((e2) => e2.id !== `p-ne\
is` && e2.id !== `p-council`).map((e2) => e2.id), ccIds: [], subject: `*전화 사용 불가* 현재 교환기 점검 중입니다`,
  preview: `08:00~08:30 교환기 점검으로 교무실 전화 사용이 불가합니다.`, bodyHtml: `<p>융합정\
보부입니다.</p>
<p><b>*전화 사용 불가*</b></p>
<p>오늘 08:00~08:30 교환기 정기 점검으로 교무실 전화 사용이 잠시 불가합니다. 급하신 연락은 개인 휴대폰을 이용해 주세요.</p>`,
  dateLabel: `2026/08/28 08:23:48`, ts: L(`2026-08-28T08:23:48+09:00`), attachments: [], isGroup: false, unread: false,
  starred: false }, { id: `m-09`, folder: `inbox`, fromId: `p-junhyuk`, toIds: an, ccIds: [`p-doyoon`], subject: `\
1, 2학년 담임선생님 스포츠클럽 출석부 제출 안내`, preview: `8월 스포츠클럽 출석부를 금요일까지 제출해 주세요.`,
  bodyHtml: `<p>스포츠클럽 담당입니다.</p>
<p>8월분 스포츠클럽 출석부를 금요일 점심 전까지 체육관 앞 제출함에 넣어 주세요. 미제출 학급은 시수 인정에 문제가 생길 수 있습니다.</p>`,
  dateLabel: `2026/08/28 08:07:38`, ts: L(`2026-08-28T08:07:38+09:00`), attachments: [], isGroup: false, unread: false,
  starred: false }, { id: `m-10`, folder: `inbox`, fromId: `p-neis`, toIds: on, ccIds: [`p-eunji`], subject: `\
2026-2 (확정)시간표 나이스 반영 완료`, preview: `2학기 확정 시간표가 나이스에 반영되었습니다. 학급 시간표를 출력해 게시해 주세요.`,
  bodyHtml: `<p>나이스 안내입니다.</p>
<p>2026학년도 2학기 확정 시간표가 나이스에 반영되었습니다. 학급 시간표를 출력하여 교실 앞면과 교무실에 게시해 주세요.</p>
<p>오류 발견 시 융합정보부(내선 114)로 연락 바랍니다.</p>`, dateLabel: `2026/08/28 08:00:00`,
  ts: L(`2026-08-28T08:00:00+09:00`), attachments: [rn.timetable], isGroup: true, unread: false, starred: false },
  { id: `m-11`, folder: `inbox`, fromId: `p-yuna`, toIds: an, ccIds: [], subject: `(제목없음)`, preview: `\
오늘 2학년 부서 회의는 16:10 2학년 연구실입니다. #2026학년도 #2학기`, bodyHtml: `<p>2학년 \
선생님들 안녕하세요.</p>
<p>오늘 2학년 부서 회의는 <b>16:10 2학년 연구실</b>입니다. 학급 안전 점검 결과만 짧게 공유하고 끝내겠습니다.</p>
<p>#2026학년도 #2학기</p>`, dateLabel: `2026/08/25 16:37:42`, ts: L(`2026-08-25T16:37:42+09:00`), attachments: [],
  isGroup: false, unread: false, starred: false, tags: [`#2026학년도`, `#2학기`] }, { id: `m-12`, folder: `\
inbox`, fromId: `p-council`, toIds: on, ccIds: [`p-seoa`], subject: `선생님 안녕하세요, 학생회입니다. 개학 행사 협조 부탁드려요`,
  preview: `개학 맞이 로비 전시와 급훈 공모전 안내 포스터를 학급에 붙여 주세요.`, bodyHtml: `\
<p>선생님 안녕하세요, 한빛중 학생회입니다.</p>
<p>개학 맞이 로비 전시와 급훈 공모전 안내 포스터를 각 학급 뒷게시판에 부착해 주시면 감사하겠습니다.</p>
<p>학생 작품은 수요일까지 학생회실로 보내 주세요.</p>`, dateLabel: `2026/08/25 16:31:48`, ts: L(
  `2026-08-25T16:31:48+09:00`), attachments: [], isGroup: false, unread: false, starred: false }, { id: `m-13`,
  folder: `inbox`, fromId: `p-neis`, toIds: an, ccIds: [], subject: `2학년 4반 수업 들어 가시는 선생님께 알립니다`,
  preview: `2-4 교실 프로젝터가 오후 점검 예정입니다. 5, 6교시는 앞 칠판을 이용해 주세요.`,
  bodyHtml: `<p>2학년 4반 교실 프로젝터가 오늘 오후 점검 예정입니다.</p>
<p>5, 6교시 수업 들어가시는 선생님께서는 앞 칠판을 이용해 주세요.</p>`, dateLabel: `2\
026/08/25 16:03:12`, ts: L(`2026-08-25T16:03:12+09:00`), attachments: [], isGroup: false, unread: false, starred: false },
  { id: `m-14`, folder: `inbox`, fromId: `p-eunji`, toIds: on, ccIds: [`p-dohyun`, `p-seoyeon`], subject: `안녕하\
세요, 담임선생님. 8월 교무회의 안건입니다`, preview: `8월 28일(금) 15:20 강당에서 교무회의가 있습니다.`,
  bodyHtml: `<p>안녕하세요, 담임선생님. 교무부입니다.</p>
<p>8월 28일(금) 15:20 강당에서 2학기 교무회의가 있습니다. 첨부 안건을 미리 살펴 봐 주세요.</p>
<p>회의 후 학년 협의회는 각 학년 연구실에서 이어집니다.</p>`, dateLabel: `2026/08/25 15:\
53:47`, ts: L(`2026-08-25T15:53:47+09:00`), attachments: [rn.meeting], isGroup: false, unread: false, starred: false },
  { id: `m-15`, folder: `inbox`, fromId: `p-doyoon`, toIds: on, ccIds: [`p-seoyeon`], subject: `오늘 2026 을지연습 교\
직원 행동요령 재안내`, preview: `14:00 사이렌 후 교실 대기, 학생 인솔 동선은 첨부 파일을 확인해 주세요.`,
  bodyHtml: `<p>체육안전부입니다.</p>
<p>오늘 2026 을지연습이 예정되어 있습니다. 14:00 사이렌 후 교실 대기, 학생 인솔 동선은 첨부 파일을 확인해 주세요.</p>
<p>핸드폰은 무음, 창문은 닫아 주시기 바랍니다.</p>`, dateLabel: `2026/08/25 15:31:57`, ts: L(
  `2026-08-25T15:31:57+09:00`), attachments: [rn.drill], isGroup: false, unread: false, starred: false }, { id: `\
m-16`, folder: `inbox`, fromId: `p-neis`, toIds: on, ccIds: [`p-subin`], subject: `나이스 시스템 긴급 점검 안내 (오늘 18:00~\
20:00)`, preview: `오늘 저녁 나이스 정기 점검이 있습니다. 성적·출결 입력은 점검 전에 저장해 주세요.`,
  bodyHtml: `<p>나이스 안내입니다.</p>
<p>오늘 18:00~20:00 나이스 정기 점검이 있습니다. 성적·출결 입력 중인 자료는 점검 전에 저장해 주세요.</p>
<p>(2026년 6월 나이스 개선 이후 두 번째 정기 점검입니다.)</p>`, dateLabel: `2026/08/25 15:1\
8:55`, ts: L(`2026-08-25T15:18:55+09:00`), attachments: [], isGroup: true, unread: false, starred: false }, { id: `\
m-17`, folder: `inbox`, fromId: `p-harin`, toIds: on, ccIds: [`p-jihun`], subject: `**주간교육계획(8/24~8/28) 송부합니다`,
  preview: `8월 4주 주간교육계획입니다. 창체 시간은 학급 자치로 운영해 주세요.`, bodyHtml: `\
<p>연구부입니다.</p>
<p>8월 4주 주간교육계획을 송부합니다. 창체 시간은 학급 자치로 운영해 주시고, 안전교육 10분은 반드시 포함해 주세요.</p>`,
  dateLabel: `2026/08/25 15:13:12`, ts: L(`2026-08-25T15:13:12+09:00`), attachments: [rn.weekly], isGroup: false,
  unread: false, starred: false }, { id: `m-18`, folder: `inbox`, fromId: `p-doyoon`, toIds: an, ccIds: [], subject: `\
안녕하세요, 체육안전부입니다. 을지연습 사진 촬영 협조`, preview: `을지연습 사진 촬영이 있습니다. 학급 \
문 앞 복도로 학생을 인솔해 주세요.`, bodyHtml: `<p>안녕하세요, 체육안전부입니다.</p>
<p>을지연습 기록 사진 촬영이 있습니다. 사이렌 후 학급 문 앞 복도로 학생을 인솔해 주세요. 마스크는 착용하지 않아도 됩니다.</p>`,
  dateLabel: `2026/08/25 13:36:32`, ts: L(`2026-08-25T13:36:32+09:00`), attachments: [rn.drill], isGroup: false,
  unread: false, starred: false }, { id: `m-19`, folder: `inbox`, fromId: `p-hyewon`, toIds: [`p-seojun`], ccIds: [],
  subject: `**전체 메시지 아닙니다. 2-3 김서준 선생님만 보세요`, preview: `작년 2-3 학생 인수인계 파\
일 위치 문의드립니다.`, bodyHtml: `<p>서준 선생님 안녕하세요. 나혜원입니다.</p>
<p>작년 2-3 학생 인수인계 파일을 공유 폴더에서 못 찾겠어서요. 경로 한번만 알려 주시면 감사하겠습니다.</p>`,
  dateLabel: `2026/08/25 13:15:17`, ts: L(`2026-08-25T13:15:17+09:00`), attachments: [], isGroup: false, unread: false,
  starred: false }, { id: `m-20`, folder: `inbox`, fromId: `p-jihye`, toIds: on, ccIds: [`p-sungmin`], subject: `\
선생님 안녕하세요~ 2학기 급식비 수납 일정 안내`, preview: `2학기 급식비 수납은 9월 4일까지입니다. 가정통신문은 내\
일 배부입니다.`, bodyHtml: `<p>선생님 안녕하세요~ 행정실 회계입니다.</p>
<p>2학기 급식비 수납은 9월 4일까지입니다. 가정통신문은 내일 배부 예정이니 학급 게시와 알림장 안내 부탁드립니다.</p>`,
  dateLabel: `2026/08/25 12:29:59`, ts: L(`2026-08-25T12:29:59+09:00`), attachments: [], isGroup: false, unread: false,
  starred: false }, { id: `m-21`, folder: `inbox`, fromId: `p-sohee`, toIds: on, ccIds: [], subject: `9월 급식 알레\
르기 조사 협조 요청`, preview: `신입·전입생 포함 알레르기 조사표를 수요일까지 영양실로 제출해 주세요.`,
  bodyHtml: `<p>영양실입니다.</p>
<p>9월 급식 알레르기 조사표를 수요일까지 영양실로 제출해 주세요. 신입·전입생도 포함입니다.</p>`,
  dateLabel: `2026/08/25 11:02:11`, ts: L(`2026-08-25T11:02:11+09:00`), attachments: [rn.allergy], isGroup: false,
  unread: true, starred: false }, { id: `m-22`, folder: `inbox`, fromId: `p-mina`, toIds: an, ccIds: [`p-yuna`],
  subject: `2학년 학부모 상담 주간 일정 초안입니다`, preview: `9월 2~3일 학부모 상담 주간 시간표 초안입니다. 불가\
 시간대를 표시해 주세요.`, bodyHtml: `<p>상담실입니다.</p>
<p>9월 2~3일 2학년 학부모 상담 주간 시간표 초안입니다. 수업과 겹치는 불가 시간대를 표시해서 회신해 주세요.</p>`,
  dateLabel: `2026/08/24 17:44:02`, ts: L(`2026-08-24T17:44:02+09:00`), attachments: [], isGroup: false, unread: true,
  starred: false }, { id: `m-23`, folder: `inbox`, fromId: `p-seoyeon`, toIds: on, ccIds: [`p-dohyun`], subject: `\
개학 첫 주 안전 점검 체크리스트 제출 안내`, preview: `교실·특별실 안전 점검 체크리스트를 화요일까지 교무실 앞 제출함에.`,
  bodyHtml: `<p>선생님들 수고 많으십니다. 교감입니다.</p>
<p>개학 첫 주 교실·특별실 안전 점검 체크리스트를 화요일 오후 4시까지 교무실 앞 제출함에 넣어 주세요.</p>
<p>창호·콘센트·소화기 위치 확인이 핵심입니다.</p>`, dateLabel: `2026/08/24 16:10:33`, ts: L(
  `2026-08-24T16:10:33+09:00`), attachments: [], isGroup: false, unread: false, starred: false }, { id: `m-24`,
  folder: `inbox`, fromId: `p-chaewon`, toIds: an, ccIds: [], subject: `2학년 진로검사 일정 및 노트북 대여 안내`,
  preview: `수요일 창체 시간에 진로적성검사를 실시합니다. 노트북은 4층 수레로 배부합니다.`,
  bodyHtml: `<p>진로교육부입니다.</p>
<p>수요일 창체 시간에 2학년 진로적성검사를 실시합니다. 노트북은 4층 수레로 배부하니 종례 후 충전 상태만 확인해 주세요.</p>`,
  dateLabel: `2026/08/24 14:22:08`, ts: L(`2026-08-24T14:22:08+09:00`), attachments: [], isGroup: false, unread: false,
  starred: false }, { id: `m-s1`, folder: `sent`, fromId: `p-seojun`, toIds: an, ccIds: [`p-yuna`], subject: `\
2-3 현장체험학습 학부모 동의 현황입니다`, preview: `현재 28명 중 25명 제출. 미제출 3명은 오늘 중 독려하겠습니다.`,
  bodyHtml: `<p>2학년 선생님들께 공유합니다.</p>
<p>2-3 현장체험학습 학부모 동의 현황: 28명 중 25명 제출. 미제출 3명은 오늘 중 가정에 연락하겠습니다.</p>`,
  dateLabel: `2026/08/28 09:10:02`, ts: L(`2026-08-28T09:10:02+09:00`), attachments: [], isGroup: true, unread: false,
  starred: false }, { id: `m-s2`, folder: `sent`, fromId: `p-seojun`, toIds: [`p-subin`], ccIds: [], subject: `\
전자칠판 로그인 오류 문의드립니다`, preview: `2-3 전자칠판이 오늘 아침부터 로그인이 안 됩니다.`,
  bodyHtml: `<p>오수빈 선생님 안녕하세요. 2-3 김서준입니다.</p>
<p>전자칠판이 오늘 아침부터 로그인이 안 됩니다. 계정 확인 부탁드려요.</p>`, dateLabel: `\
2026/08/28 08:12:44`, ts: L(`2026-08-28T08:12:44+09:00`), attachments: [], isGroup: false, unread: false, starred: false },
  { id: `m-s3`, folder: `sent`, fromId: `p-seojun`, toIds: [`p-eunji`], ccIds: [], subject: `RE: 행정정보공유 동의서 관련\
 확인했습니다`, preview: `학급함 확인했고 오늘 배부하겠습니다.`, bodyHtml: `<p>최은지 선생님 안\
녕하세요.</p>
<p>학급함 확인했습니다. 오늘 종례 때 배부하고 제출 독려하겠습니다.</p>`, dateLabel: `\
2026/08/28 09:40:15`, ts: L(`2026-08-28T09:40:15+09:00`), attachments: [], isGroup: false, unread: false, starred: false },
  { id: `m-s4`, folder: `sent`, fromId: `p-seojun`, toIds: [`p-doyoon`], ccIds: [], subject: `을지연습 2-3 인원 보고`,
  preview: `재적 28, 출석 27, 결석 1(병결).`, bodyHtml: `<p>체육안전부 배도윤 선생님께.</p>
<p>을지연습 2-3 인원: 재적 28, 출석 27, 결석 1(병결)입니다.</p>`, dateLabel: `2026/08/25 14:1\
8:03`, ts: L(`2026-08-25T14:18:03+09:00`), attachments: [], isGroup: false, unread: false, starred: false }], cn = {
  id: `m-live`, folder: `inbox`, fromId: `p-yuna`, toIds: an, ccIds: [], subject: `지금 2학년 연구실로 잠깐 와 주실 수 있나요?`,
  preview: `동의서 양식 관련해서 짧게 공유할 내용이 있습니다.`, bodyHtml: `<p>2학년 선생님들, 남\
유나입니다.</p>
<p>동의서 양식 관련해서 짧게 공유할 내용이 있어 지금 2학년 연구실로 와 주시면 감사하겠습니다. 5분이면 됩니다.</p>`,
  dateLabel: ``, ts: 0, attachments: [], isGroup: true, unread: true, starred: false }, ln = [{ id: `n1`, title: `\
2026학년도 2학기 개학 운영 안내`, fromId: `p-eunji`, dateLabel: `2026/08/20`, pinned: true, body: `\
2학기 개학일은 8월 24일(월)입니다. 1교시부터 정상 수업이며, 아침 등교 지도는 7:40부터입니다. 학급 환경 구성은 금요일까지 완료해 주세요.` },
  { id: `n2`, title: `을지연습 교직원 행동 요령`, fromId: `p-doyoon`, dateLabel: `2026/08/21`, pinned: true,
  body: `8월 21일 14:00 을지연습. 사이렌 후 교실 대기, 학생 인솔은 첨부 동선을 따릅니다. 개인 휴대폰은 무음으로 전환해 주세요.` },
  { id: `n3`, title: `나이스 저녁 점검 (8/21 18:00~20:00)`, fromId: `p-subin`, dateLabel: `2026/08/21`,
  body: `나이스 정기 점검이 예정되어 있습니다. 출결·성적 자료는 점검 전 저장 바랍니다.` },
  { id: `n4`, title: `9월 교직원 워크숍 신청`, fromId: `p-jihun`, dateLabel: `2026/08/19`, body: `9월 \
11일(금) 오후 디지털 교과서 활용 워크숍을 개최합니다. 신청은 융합정보부 게시판에서 받아 주세요.` }],
  un = [{ id: `s1`, title: `9월 월례조회 진행 방식`, fromId: `p-eunji`, due: `8/28`, options: [{ id: `\
o1`, label: `강당 집합`, votes: 18 }, { id: `o2`, label: `방송 조회`, votes: 11 }, { id: `o3`, label: `\
학급 조회`, votes: 7 }] }, { id: `s2`, title: `교직원 휴게실 커피머신 기종`, fromId: `p-sungmi\
n`, due: `8/31`, options: [{ id: `o1`, label: `캡슐`, votes: 14 }, { id: `o2`, label: `드립`, votes: 9 }, {
  id: `o3`, label: `유지(현재)`, votes: 6 }] }], dn = [{ id: `e1`, date: `2026-08-24`, title: `2학기 개학`,
  color: `blue` }, { id: `e2`, date: `2026-08-24`, title: `학급 환경 점검`, color: `green` }, { id: `e3`,
  date: `2026-08-26`, title: `진로적성검사 (2학년)`, color: `blue` }, { id: `e4`, date: `2026-08-27`, title: `\
행정정보공유 동의서 마감`, color: `red` }, { id: `e5`, date: `2026-08-27`, title: `1학년 건강검진`,
  color: `amber` }, { id: `e6`, date: `2026-08-28`, title: `교무회의 15:20 강당`, color: `blue` }, { id: `\
e7`, date: `2026-09-01`, title: `스포츠클럽 출석 마감`, color: `green` }, { id: `e8`, date: `2026-09-\
02`, title: `2학년 학부모 상담 주간`, color: `amber` }, { id: `e9`, date: `2026-09-04`, title: `급식비 수\
납 마감`, color: `red` }, { id: `e10`, date: `2026-09-11`, title: `디지털 교과서 워크숍`, color: `\
blue` }], fn = [{ id: `l1`, label: `나이스`, desc: `NEIS 업무 포털`, href: `https://neis.go.kr` }, { id: `\
l2`, label: `서울시교육청`, desc: `교육청 홈페이지`, href: `https://www.sen.go.kr` }, { id: `l3`,
  label: `에듀넷·티-클리어`, desc: `수업 자료·교육과정`, href: `https://www.edunet.net` }, { id: `\
l4`, label: `위두랑`, desc: `교실 수업 플랫폼`, href: `https://www.wedorang.go.kr` }, { id: `l5`, label: `\
커리어넷`, desc: `진로·직업 정보`, href: `https://www.career.go.kr` }, { id: `l6`, label: `학생건강정보센터`,
  desc: `건강검사·감염병`, href: `https://www.schoolhealth.kr` }], pn = [{ id: `b1`, kicker: `한빛중 연구부`,
  title: `9월 창의활동, 이렇게 준비 끝!`, sub: `선생님들이 선택한 인기 만들기 교구`,
  tone: `market` }, { id: `b2`, kicker: `생활교육부`, title: `학생들이 어떤 생각을 하는지 궁금하다면?`,
  sub: `쿨투표로 확인해 보세요`, tone: `vote` }, { id: `b3`, kicker: `교직원 복지`, title: `교직원\
 전용 연수 숙소 안내`, sub: `2학기 워크숍 숙소 선착순 신청`, tone: `travel` }];
  function mn(e2, t2 = false) {
    let n2 = en[e2];
    if (!n2) return e2;
    let r2 = `${n2.name}(${n2.title},${n2.ext})`;
    return t2 ? `${r2}(${n2.name})` : r2;
  }
  function hn(e2 = /* @__PURE__ */ new Date()) {
    let t2 = (e3) => String(e3).padStart(2, `0`);
    return `${e2.getFullYear()}/${t2(e2.getMonth() + 1)}/${t2(e2.getDate())} ${t2(e2.getHours())}:${t2(e2.getMinutes())}\
:${t2(e2.getSeconds())}`;
  }
  function gn() {
    let e2 = /* @__PURE__ */ new Date(), t2 = e2.getTime() + e2.getTimezoneOffset() * 6e4;
    return new Date(t2 + 324e5);
  }
  function _n() {
    return window.Neutralino;
  }
  function vn() {
    if (typeof window > `u`) return `main`;
    let e2 = new URLSearchParams(window.location.search).get(`view`);
    if (e2 === `inbox` || e2 === `compose`) return e2;
    let t2 = window.location.hash.replace(/^#/, ``);
    return t2 === `inbox` || t2 === `compose` ? t2 : `main`;
  }
  function yn() {
    return !!_n()?.window?.create;
  }
  function bn() {
    try {
      window.close();
    } catch {
    }
    _n()?.app.exit();
  }
  var xn = { inbox: { width: 1100, height: 660, minWidth: 800, minHeight: 520 }, compose: { width: 640, height: 540,
  minWidth: 480, minHeight: 360 } };
  function Sn(e2) {
    try {
      sessionStorage.setItem(`cm-compose-payload`, JSON.stringify(e2 ?? {}));
    } catch {
    }
  }
  function Cn() {
    try {
      return JSON.parse(sessionStorage.getItem(`cm-compose-payload`) || `{}`);
    } catch {
      return {};
    }
  }
  function wn(e2, t2) {
    let n2 = _n();
    if (!n2?.window?.create) return false;
    let r2 = xn[e2];
    return n2.window.create(`/?view=${e2}`, { title: t2, ...r2, resizable: true, maximize: false, hidden: false,
    center: true, exitProcessOnClose: true }), true;
  }
  async function Tn() {
    let e2 = _n();
    e2 && (e2.init(), await Promise.race([new Promise((t2) => {
      e2.events.on(`ready`, () => t2());
    }), new Promise((e3) => {
      window.setTimeout(e3, 900);
    })]), e2.events.on(`windowClose`, () => {
      e2.app.exit();
    }));
  }
  var En = `cm-sync`;
  function Dn() {
    try {
      localStorage.setItem(En, String(Date.now()));
    } catch {
    }
    try {
      new BroadcastChannel(`cm-sync`).postMessage(`sync`);
    } catch {
    }
    try {
      _n()?.events.broadcast?.(`cm-sync`);
    } catch {
    }
  }
  function On(e2) {
    let t2 = (t3) => {
      (t3.key === En || t3.key === `hanbit-coolmessenger-mock`) && e2();
    };
    window.addEventListener(`storage`, t2);
    let n2 = null;
    try {
      n2 = new BroadcastChannel(`cm-sync`), n2.onmessage = () => e2();
    } catch {
    }
    _n()?.events.on(`cm-sync`, e2);
    let r2 = yn() ? window.setInterval(e2, 400) : 0;
    return () => {
      window.removeEventListener(`storage`, t2), n2?.close(), r2 && window.clearInterval(r2);
    };
  }
  var kn = 36, An = { login: { w: 360, h: 420 }, main: { w: 480, h: 420 }, inbox: { w: 800, h: 520 }, compose: {
  w: 480, h: 360 }, about: { w: 360, h: 280 }, settings: { w: 360, h: 280 }, person: { w: 360, h: 280 }, notice: {
  w: 400, h: 300 }, alert: { w: 320, h: 220 } };
  function jn(e2) {
    return `${e2}-${Math.random().toString(36).slice(2, 9)}`;
  }
  function Mn(e2, t2, n2) {
    let r2 = Math.max(120, n2 - kn), i2 = Math.min(Math.max(-e2.w + 80, e2.x), Math.max(0, t2 - 80)), a2 = Math.
    min(Math.max(0, e2.y), Math.max(0, r2 - 32));
    return { ...e2, x: i2, y: a2 };
  }
  function Nn(e2, t2, n2) {
    let r2 = Math.max(280, n2 - kn), i2 = t2 < 720;
    if (e2 === `login`) {
      let e3 = i2 ? Math.min(t2 - 16, 400) : 392, n3 = i2 ? Math.min(r2 - 20, 580) : 488;
      return { x: Math.round((t2 - e3) / 2), y: i2 ? 12 : Math.max(28, Math.round((r2 - n3) / 2) - 36), w: e3,
      h: n3 };
    }
    if (e2 === `main`) {
      let e3 = i2 ? t2 : Math.min(560, t2 - 24), n3 = i2 ? r2 : Math.min(680, r2 - 8);
      return { x: i2 ? 0 : Math.min(t2 - e3 - 48, Math.round(t2 * 0.32)), y: i2 ? 0 : 36, w: e3, h: n3 };
    }
    if (e2 === `inbox`) {
      let e3 = An.inbox, n3 = Math.max(e3.w, Math.min(1100, Math.max(e3.w, t2 - 16))), i3 = Math.max(e3.h, Math.
      min(640, r2 - 8));
      return { x: Math.max(8, Math.round((t2 - n3) / 2)), y: 28, w: n3, h: i3 };
    }
    if (e2 === `compose`) {
      let e3 = Math.min(560, t2 - 16), n3 = Math.min(540, r2 - 8);
      return { x: Math.round((t2 - e3) / 2) + 28, y: 64, w: e3, h: n3 };
    }
    let a2 = Math.min(420, t2 - 24), o2 = Math.min(360, r2 - 24);
    return { x: Math.round((t2 - a2) / 2), y: Math.round((r2 - o2) / 3), w: a2, h: o2 };
  }
  var Pn = { autoLogin: true, serverIp: `10.80.12.50`, userName: `김서준`, starredIds: sn.filter((e2) => e2.
  starred).map((e2) => e2.id), deletedIds: [], readIds: sn.filter((e2) => !e2.unread).map((e2) => e2.id), unreadIds: sn.
  filter((e2) => e2.unread).map((e2) => e2.id), extras: [], memos: [{ id: `memo-1`, title: `2-3 동의서 미제출`,
  body: `5번, 12번, 21번 — 오늘 종례 때 다시 안내.`, updatedAt: Date.now() - 36e5 }], surveyVotes: {},
  presence: `available`, fontScale: 100 }, R = Gt()(Jt((e2, t2) => ({ ...Pn, hydrated: false, loggedIn: false,
  windows: [], zTop: 10, sidebarTab: `org`, orgExpanded: { ...nn }, orgChecked: {}, orgQuery: ``, orgSort: `or\
g`, orgSize: `md`, folder: `inbox`, inboxFilter: `all`, msgQuery: ``, selectedId: `m-01`, toasts: [], liveArrived: false,
  columnWidths: { from: 148, subject: 200, date: 148, attach: 88 }, loginBusy: false, hydrate: () => e2({ hydrated: true }),
  login: () => {
    e2({ loggedIn: true, loginBusy: false, windows: [{ id: `main`, kind: `main`, title: `CoolMessenger GENTOO`,
    ...Nn(`main`, typeof window > `u` ? 1280 : window.innerWidth, typeof window > `u` ? 800 : window.innerHeight),
    z: 20, minimized: false, maximized: true }], zTop: 20, sidebarTab: `org` });
  }, logout: () => {
    e2({ loggedIn: false, windows: [{ id: `login`, kind: `login`, title: `CoolMessenger GENTOO`, ...Nn(`login`,
    typeof window > `u` ? 1280 : window.innerWidth, typeof window > `u` ? 800 : window.innerHeight), z: 12, minimized: false,
    maximized: false }], zTop: 12, toasts: [] });
  }, setAutoLogin: (t3) => e2({ autoLogin: t3 }), setServerIp: (t3) => e2({ serverIp: t3 }), setUserName: (t3) => e2(
  { userName: t3 }), setPresence: (t3) => e2({ presence: t3 }), setFontScale: (t3) => e2({ fontScale: t3 }), setSidebar: (t3) => e2(
  { sidebarTab: t3 }), toggleExpand: (t3) => e2((e3) => ({ orgExpanded: { ...e3.orgExpanded, [t3]: !e3.orgExpanded[t3] } })),
  toggleChecked: (t3, n2) => e2((e3) => {
    let r2 = { ...e3.orgChecked }, i2 = !r2[t3];
    r2[t3] = i2;
    for (let e4 of n2) r2[e4] = i2;
    return { orgChecked: r2 };
  }), clearChecked: () => e2({ orgChecked: {} }), setOrgQuery: (t3) => e2({ orgQuery: t3 }), setOrgSort: (t3) => e2(
  { orgSort: t3 }), setOrgSize: (t3) => e2({ orgSize: t3 }), setFolder: (t3) => e2((e3) => ({ folder: t3, selectedId: Fn(
  e3).filter((e4) => e4.folder === t3)[0]?.id ?? null })), setInboxFilter: (t3) => e2({ inboxFilter: t3 }), setMsgQuery: (t3) => e2(
  { msgQuery: t3 }), selectMessage: (n2) => {
    n2 && t2().markRead(n2), e2({ selectedId: n2 });
  }, toggleStar: (t3) => e2((e3) => ({ starredIds: e3.starredIds.includes(t3) ? e3.starredIds.filter((e4) => e4 !==
  t3) : [...e3.starredIds, t3] })), markRead: (t3) => {
    e2((e3) => ({ readIds: e3.readIds.includes(t3) ? e3.readIds : [...e3.readIds, t3], unreadIds: e3.unreadIds.
    filter((e4) => e4 !== t3) })), Dn();
  }, deleteMessages: (t3) => {
    e2((e3) => ({ deletedIds: [.../* @__PURE__ */ new Set([...e3.deletedIds, ...t3])], unreadIds: e3.unreadIds.
    filter((e4) => !t3.includes(e4)), selectedId: t3.includes(e3.selectedId ?? ``) ? null : e3.selectedId })),
    Dn();
  }, sendMessage: (t3) => {
    let n2 = jn(`m`), r2 = gn(), i2 = { id: n2, folder: `sent`, fromId: Zt, toIds: t3.toIds, ccIds: t3.ccIds, subject: t3.
    subject || `(제목없음)`, preview: t3.body.slice(0, 80), bodyHtml: `<p>${t3.body.replace(/\n/g, `<br/>`)}\
</p>`, dateLabel: hn(r2), ts: r2.getTime(), attachments: [], isGroup: t3.toIds.length > 3, unread: false, starred: false };
    return e2((e3) => ({ extras: [i2, ...e3.extras], folder: `sent`, selectedId: n2 })), n2;
  }, addMemo: (t3, n2) => e2((e3) => ({ memos: [{ id: jn(`memo`), title: t3, body: n2, updatedAt: Date.now() },
  ...e3.memos] })), updateMemo: (t3, n2) => e2((e3) => ({ memos: e3.memos.map((e4) => e4.id === t3 ? { ...e4, ...n2,
  updatedAt: Date.now() } : e4) })), deleteMemo: (t3) => e2((e3) => ({ memos: e3.memos.filter((e4) => e4.id !==
  t3) })), voteSurvey: (t3, n2) => e2((e3) => ({ surveyVotes: { ...e3.surveyVotes, [t3]: n2 } })), openWindow: (n2, r2, i2) => {
    if (n2 === `compose` && Sn(i2), (n2 === `inbox` || n2 === `compose`) && wn(n2, r2)) return n2;
    let a2 = t2().windows.find((e3) => e3.kind === n2 && (n2 === `main` || n2 === `inbox` || n2 === `login` ||
    i2?.id && e3.payload?.id === i2.id || i2?.personId && e3.payload?.personId === i2.personId));
    if (a2) return t2().restoreWindow(a2.id), t2().focusWindow(a2.id), a2.id;
    let o2 = window.innerWidth, s2 = window.innerHeight, c2 = Nn(n2, o2, s2), l2 = t2().zTop + 1, u2 = n2 === `\
main` ? `main` : n2 === `inbox` ? `inbox` : jn(n2), d2 = { id: u2, kind: n2, title: r2, ...c2, z: l2, minimized: false,
    maximized: o2 < 720 && n2 === `main`, payload: i2 };
    return e2((e3) => ({ windows: [...e3.windows, d2], zTop: l2 })), u2;
  }, focusWindow: (t3) => e2((e3) => {
    let n2 = e3.zTop + 1;
    return { zTop: n2, windows: e3.windows.map((e4) => e4.id === t3 ? { ...e4, z: n2, minimized: false } : e4) };
  }), closeWindow: (t3) => {
    if (vn() !== `main`) {
      bn();
      return;
    }
    e2((e3) => e3.windows.find((e4) => e4.id === t3)?.kind === `main` ? { windows: e3.windows.map((e4) => e4.id ===
    t3 ? { ...e4, minimized: true } : e4) } : { windows: e3.windows.filter((e4) => e4.id !== t3) });
  }, minimizeWindow: (t3) => e2((e3) => ({ windows: e3.windows.map((e4) => e4.id === t3 ? { ...e4, minimized: true } :
  e4) })), toggleMaximize: (t3) => e2((e3) => ({ windows: e3.windows.map((e4) => e4.id === t3 ? { ...e4, maximized: !e4.
  maximized, minimized: false } : e4) })), moveWindow: (t3, n2, r2) => e2((e3) => ({ windows: e3.windows.map((e4) => e4.
  id === t3 ? Mn({ ...e4, x: n2, y: r2 }, window.innerWidth, window.innerHeight) : e4) })), resizeWindow: (t3, n2, r2, i2, a2) => e2(
  (e3) => ({ windows: e3.windows.map((e4) => {
    if (e4.id !== t3) return e4;
    let o2 = An[e4.kind], s2 = Math.max(o2.w, i2), c2 = Math.max(o2.h, a2), l2 = n2 !== e4.x && s2 !== i2 ? e4.
    x + e4.w - s2 : n2, u2 = r2 !== e4.y && c2 !== a2 ? e4.y + e4.h - c2 : r2;
    return Mn({ ...e4, x: l2, y: u2, w: s2, h: c2 }, window.innerWidth, window.innerHeight);
  }) })), restoreWindow: (t3) => e2((e3) => ({ windows: e3.windows.map((e4) => e4.id === t3 ? { ...e4, minimized: false } :
  e4) })), pushToast: (n2, r2) => {
    let i2 = jn(`toast`);
    e2((e3) => ({ toasts: [...e3.toasts, { id: i2, title: n2, body: r2, at: Date.now() }] })), setTimeout(() => t2().
    dismissToast(i2), 7e3);
  }, dismissToast: (t3) => e2((e3) => ({ toasts: e3.toasts.filter((e4) => e4.id !== t3) })), arriveDemo: () => {
    if (t2().liveArrived) return;
    let n2 = gn(), r2 = { ...cn, dateLabel: hn(n2), ts: n2.getTime() };
    e2((e3) => ({ extras: [r2, ...e3.extras], unreadIds: [...e3.unreadIds, r2.id], liveArrived: true })), t2().
    pushToast(`${Yt}`, `남유나(2학년부장) — 지금 2학년 연구실로 잠깐 와 주실 수 있나요?`),
    Dn();
  }, setColumnWidth: (t3, n2) => e2((e3) => ({ columnWidths: { ...e3.columnWidths, [t3]: Math.max(64, Math.min(
  320, n2)) } })), resetDemo: () => e2({ ...Pn, extras: [], liveArrived: false, selectedId: `m-01` }) }), { name: `\
hanbit-coolmessenger-mock`, skipHydration: true, partialize: (e2) => ({ autoLogin: e2.autoLogin, serverIp: e2.
  serverIp, userName: e2.userName, starredIds: e2.starredIds, deletedIds: e2.deletedIds, readIds: e2.readIds, unreadIds: e2.
  unreadIds, extras: e2.extras, memos: e2.memos, surveyVotes: e2.surveyVotes, presence: e2.presence, fontScale: e2.
  fontScale }) }));
  function Fn(e2) {
    let t2 = [...e2.extras, ...sn].filter((t3) => !e2.deletedIds.includes(t3.id)), n2 = /* @__PURE__ */ new Set(),
    r2 = [];
    for (let i2 of t2) n2.has(i2.id) || (n2.add(i2.id), r2.push({ ...i2, starred: e2.starredIds.includes(i2.id),
    unread: e2.unreadIds.includes(i2.id) && !e2.readIds.includes(i2.id) }));
    return r2.sort((e3, t3) => t3.ts - e3.ts);
  }
  function In() {
    try {
      let e2 = localStorage.getItem(`hanbit-coolmessenger-mock`);
      if (!e2) return;
      let t2 = JSON.parse(e2), n2 = t2.state ?? t2, r2 = R.getState(), i2 = n2.readIds ?? r2.readIds, a2 = n2.
      unreadIds ?? r2.unreadIds, o2 = n2.deletedIds ?? r2.deletedIds, s2 = n2.extras ?? r2.extras;
      if (JSON.stringify(r2.unreadIds) === JSON.stringify(a2) && JSON.stringify(r2.readIds) === JSON.stringify(
      i2) && JSON.stringify(r2.deletedIds) === JSON.stringify(o2) && (r2.extras?.length ?? 0) === (s2?.length ??
      0)) return;
      R.setState({ readIds: i2, unreadIds: a2, deletedIds: o2, extras: s2 });
    } catch {
    }
  }
  function Ln() {
    if (vn() !== `main`) return;
    let { logout: e2, windows: t2 } = R.getState();
    t2.length === 0 && e2();
  }
  var Rn = o(((e2) => {
    var t2 = Symbol.for(`react.transitional.element`), n2 = Symbol.for(`react.fragment`);
    function r2(e3, n3, r3) {
      var i2 = null;
      if (r3 !== void 0 && (i2 = `` + r3), n3.key !== void 0 && (i2 = `` + n3.key), `key` in n3) for (var a2 in r3 =
      {}, n3) a2 !== `key` && (r3[a2] = n3[a2]);
      else r3 = n3;
      return n3 = r3.ref, { $$typeof: t2, type: e3, key: i2, ref: n3 === void 0 ? null : n3, props: r3 };
    }
    e2.Fragment = n2, e2.jsx = r2, e2.jsxs = r2;
  })), z = o(((e2, t2) => {
    t2.exports = Rn();
  }))(), zn = [{ dir: `n`, className: `left-2 right-2 top-0 h-1.5 cursor-n-resize`, dx: 0, dy: 1, dw: 0, dh: -1 },
  { dir: `s`, className: `left-2 right-2 bottom-0 h-1.5 cursor-s-resize`, dx: 0, dy: 0, dw: 0, dh: 1 }, { dir: `\
e`, className: `top-2 bottom-2 right-0 w-1.5 cursor-e-resize`, dx: 0, dy: 0, dw: 1, dh: 0 }, { dir: `w`, className: `\
top-2 bottom-2 left-0 w-1.5 cursor-w-resize`, dx: 1, dy: 0, dw: -1, dh: 0 }, { dir: `ne`, className: `top-0 ri\
ght-0 h-2.5 w-2.5 cursor-ne-resize`, dx: 0, dy: 1, dw: 1, dh: -1 }, { dir: `nw`, className: `top-0 left-0 h-2.\
5 w-2.5 cursor-nw-resize`, dx: 1, dy: 1, dw: -1, dh: -1 }, { dir: `se`, className: `bottom-0 right-0 h-2.5 w-2\
.5 cursor-se-resize`, dx: 0, dy: 0, dw: 1, dh: 1 }, { dir: `sw`, className: `bottom-0 left-0 h-2.5 w-2.5 curso\
r-sw-resize`, dx: 1, dy: 0, dw: -1, dh: 1 }];
  function Bn({ win: e2, children: t2, header: n2, footer: r2, icon: i2, buttons: a2 = [`help`, `min`, `max`, `\
close`], noResize: o2, onHelp: s2, onGear: c2, onFolder: l2 }) {
    let u2 = R((e3) => e3.focusWindow), d2 = R((e3) => e3.closeWindow), f2 = R((e3) => e3.minimizeWindow), p2 = R(
    (e3) => e3.toggleMaximize), m2 = R((e3) => e3.moveWindow), h2 = R((e3) => e3.resizeWindow), g2 = (0, S.useRef)(
    null);
    if (e2.minimized) return null;
    let _2 = e2.payload?.host === `os`, v2 = e2.maximized ? { left: 0, top: 0, width: `100%`, height: _2 ? `10\
0%` : `calc(100% - 36px)`, zIndex: 40 + e2.z } : { left: e2.x, top: e2.y, width: e2.w, height: e2.h, zIndex: 40 +
    e2.z }, y2 = (t3) => {
      e2.maximized || t3.target.closest(`button`) || (u2(e2.id), g2.current = { x: t3.clientX, y: t3.clientY, ox: e2.
      x, oy: e2.y }, t3.currentTarget.setPointerCapture(t3.pointerId));
    }, b2 = (t3) => {
      if (!g2.current) return;
      let n3 = g2.current;
      m2(e2.id, n3.ox + (t3.clientX - n3.x), n3.oy + (t3.clientY - n3.y));
    }, x2 = () => {
      g2.current = null;
    }, ee2 = (t3, n3) => {
      if (e2.maximized || o2) return;
      t3.stopPropagation(), u2(e2.id);
      let r3 = { x: t3.clientX, y: t3.clientY, ox: e2.x, oy: e2.y, ow: e2.w, oh: e2.h }, i3 = t3.currentTarget;
      i3.setPointerCapture(t3.pointerId);
      let a3 = (t4) => {
        let i4 = t4.clientX - r3.x, a4 = t4.clientY - r3.y;
        h2(e2.id, r3.ox + n3.dx * i4, r3.oy + n3.dy * a4, r3.ow + n3.dw * i4, r3.oh + n3.dh * a4);
      }, s3 = () => {
        i3.releasePointerCapture(t3.pointerId), i3.removeEventListener(`pointermove`, a3), i3.removeEventListener(
        `pointerup`, s3);
      };
      i3.addEventListener(`pointermove`, a3), i3.addEventListener(`pointerup`, s3);
    };
    return (0, z.jsxs)(`section`, { className: zt(`win-frame win-in absolute isolate`, e2.maximized && `rounde\
d-none`), style: v2, onPointerDown: () => u2(e2.id), role: `dialog`, "aria-label": e2.title, children: [(0, z.
    jsxs)(`header`, { className: `win-titlebar`, onPointerDown: y2, onPointerMove: b2, onPointerUp: x2, onDoubleClick: () => {
      o2 || p2(e2.id);
    }, children: [(0, z.jsx)(`div`, { className: `flex min-w-0 flex-1 items-center gap-1.5`, children: e2.kind ===
    `login` ? null : (0, z.jsxs)(z.Fragment, { children: [i2, (0, z.jsx)(`span`, { className: `truncate text-[\
13px] font-medium tracking-tight text-win-ink`, children: e2.title })] }) }), (0, z.jsxs)(`div`, { className: `\
flex items-center`, children: [a2.includes(`folder`) ? (0, z.jsx)(`button`, { type: `button`, className: `win-\
titlebar-btn`, "aria-label": `폴더`, onClick: l2, children: (0, z.jsx)(ie, { className: `size-3.5` }) }) : null,
    a2.includes(`help`) ? (0, z.jsx)(`button`, { type: `button`, className: `win-titlebar-btn`, "aria-label": `\
도움말`, onClick: s2, children: (0, z.jsx)(re, { className: `size-3.5` }) }) : null, a2.includes(`gear`) ? (0,
    z.jsx)(`button`, { type: `button`, className: `win-titlebar-btn`, "aria-label": `설정`, onClick: c2, children: (0,
    z.jsx)(D, { className: `size-3.5` }) }) : null, a2.includes(`min`) ? (0, z.jsx)(`button`, { type: `button`,
    className: `win-titlebar-btn`, "aria-label": `최소화`, onClick: () => {
      if (_2) {
        window.Neutralino?.window.minimize();
        return;
      }
      f2(e2.id);
    }, children: (0, z.jsx)(oe, { className: `size-3.5` }) }) : null, a2.includes(`max`) ? (0, z.jsx)(`button`,
    { type: `button`, className: `win-titlebar-btn`, "aria-label": `최대화`, onClick: () => {
      if (_2) {
        window.Neutralino?.window.maximize();
        return;
      }
      p2(e2.id);
    }, children: (0, z.jsx)(ue, { className: `size-3` }) }) : null, a2.includes(`close`) ? (0, z.jsx)(`button`,
    { type: `button`, className: `win-titlebar-btn close`, "aria-label": `닫기`, onClick: () => {
      _2 ? bn() : d2(e2.id);
    }, children: (0, z.jsx)(A, { className: `size-3.5` }) }) : null] })] }), n2, (0, z.jsx)(`div`, { className: `\
min-h-0 min-w-0 flex-1 overflow-hidden`, children: t2 }), r2, !o2 && !e2.maximized ? zn.map((e3) => (0, z.jsx)(
    `div`, { className: zt(`resize-handle`, e3.className), onPointerDown: (t3) => ee2(t3, e3) }, e3.dir)) : null] });
  }
  function Vn({ size: e2 = 32, className: t2, variant: n2 = `logo` }) {
    let r2 = n2 === `avatar` ? `av` : `lg`;
    return (0, z.jsxs)(`svg`, { width: e2, height: e2, viewBox: `0 0 64 64`, className: zt(`shrink-0`, t2), "a\
ria-hidden": true, children: [(0, z.jsx)(`defs`, { children: (0, z.jsxs)(`radialGradient`, { id: `${r2}-belly`,
    cx: `50%`, cy: `45%`, r: `60%`, children: [(0, z.jsx)(`stop`, { offset: `0%`, stopColor: `#fff` }), (0, z.
    jsx)(`stop`, { offset: `100%`, stopColor: `#e8eef3` })] }) }), n2 === `avatar` ? (0, z.jsx)(`circle`, { cx: `\
32`, cy: `32`, r: `32`, fill: `#4aa8dc` }) : null, (0, z.jsx)(`ellipse`, { cx: `32`, cy: `40`, rx: `16`, ry: `\
18`, fill: `#1c1c1c` }), (0, z.jsx)(`ellipse`, { cx: `32`, cy: `44`, rx: `11`, ry: `13`, fill: `url(#${r2}-bel\
ly)` }), (0, z.jsx)(`circle`, { cx: `32`, cy: `22`, r: `14`, fill: `#1c1c1c` }), (0, z.jsx)(`ellipse`, { cx: `\
25.5`, cy: `23`, rx: `6.2`, ry: `8`, fill: `#f4f6f8` }), (0, z.jsx)(`ellipse`, { cx: `38.5`, cy: `23`, rx: `6.\
2`, ry: `8`, fill: `#f4f6f8` }), (0, z.jsx)(`circle`, { cx: `25.5`, cy: `23.5`, r: `2.15`, fill: `#1a1a1a` }),
    (0, z.jsx)(`circle`, { cx: `38.5`, cy: `23.5`, r: `2.15`, fill: `#1a1a1a` }), (0, z.jsx)(`circle`, { cx: `\
26.2`, cy: `22.8`, r: `0.7`, fill: `#fff` }), (0, z.jsx)(`circle`, { cx: `39.2`, cy: `22.8`, r: `0.7`, fill: `\
#fff` }), (0, z.jsx)(`path`, { d: `M28.2 27.2c1.4 6 3.8 7.6 3.8 7.6s2.4-1.6 3.8-7.6c-2.2 1.2-5.4 1.2-7.6 0z`, fill: `\
#f5a623` }), (0, z.jsx)(`path`, { d: `M30.2 28.4h3.6c0 0-1.2 3.2-1.8 3.2s-1.8-3.2-1.8-3.2z`, fill: `#e8891a` }),
    (0, z.jsx)(`ellipse`, { cx: `24`, cy: `58`, rx: `6`, ry: `2.6`, fill: `#f5a623` }), (0, z.jsx)(`ellipse`, {
    cx: `40`, cy: `58`, rx: `6`, ry: `2.6`, fill: `#f5a623` })] });
  }
  function Hn({ status: e2, size: t2 = 16 }) {
    return e2 === `pc` ? (0, z.jsxs)(`svg`, { width: t2, height: t2, viewBox: `0 0 16 16`, "aria-hidden": true,
    children: [(0, z.jsx)(`rect`, { x: `2`, y: `3`, width: `12`, height: `8`, rx: `1`, fill: `#6b8cae` }), (0,
    z.jsx)(`rect`, { x: `3`, y: `4.2`, width: `10`, height: `5.5`, fill: `#d9e6f2` }), (0, z.jsx)(`rect`, { x: `\
6`, y: `11`, width: `4`, height: `1.2`, fill: `#6b8cae` }), (0, z.jsx)(`rect`, { x: `4.5`, y: `12.2`, width: `\
7`, height: `1.2`, fill: `#6b8cae` })] }) : (0, z.jsxs)(`svg`, { width: t2, height: t2, viewBox: `0 0 16 16`, "\
aria-hidden": true, children: [(0, z.jsx)(`circle`, { cx: `8`, cy: `5`, r: `3.1`, fill: `#3d8eda` }), (0, z.jsx)(
    `path`, { d: `M3 14c.4-3.2 2.4-4.6 5-4.6S12.6 10.8 13 14`, fill: `#3d8eda` }), e2 === `offline` ? (0, z.jsxs)(
    z.Fragment, { children: [(0, z.jsx)(`circle`, { cx: `12`, cy: `12`, r: `3.4`, fill: `#fff` }), (0, z.jsx)(
    `path`, { d: `M10.4 10.4l3.2 3.2M13.6 10.4l-3.2 3.2`, stroke: `#d45454`, strokeWidth: `1.4`, strokeLinecap: `\
round` })] }) : null] });
  }
  function Un({ win: e2 }) {
    let t2 = R((e3) => e3.serverIp), n2 = R((e3) => e3.userName), r2 = R((e3) => e3.autoLogin), i2 = R((e3) => e3.
    setServerIp), a2 = R((e3) => e3.setUserName), o2 = R((e3) => e3.setAutoLogin), s2 = R((e3) => e3.login), c2 = R(
    (e3) => e3.openWindow), [l2, u2] = (0, S.useState)(`••••••••`), [d2, f2] = (0, S.useState)(
    false), [p2, m2] = (0, S.useState)(null), h2 = () => {
      d2 || (f2(true), m2(`서버에 연결하는 중…`), window.setTimeout(() => {
        s2();
      }, 420));
    };
    return (0, z.jsx)(Bn, { win: e2, icon: (0, z.jsx)(Vn, { size: 18 }), buttons: [`folder`, `help`, `close`],
    noResize: true, onHelp: () => c2(`about`, `쿨메신저 모의 — 정보`), onFolder: () => c2(`alert`, `\
저장 위치`, { text: `모의 환경입니다. 대화와 별표는 이 브라우저에만 저장됩니다.` }),
    children: (0, z.jsxs)(`div`, { className: `flex h-full flex-col bg-white px-8 pt-6 pb-4`, children: [(0, z.
    jsxs)(`div`, { className: `flex items-center gap-2`, children: [(0, z.jsx)(Vn, { size: 40 }), (0, z.jsxs)(
    `div`, { children: [(0, z.jsxs)(`div`, { className: `flex items-baseline gap-1 leading-none`, children: [(0,
    z.jsx)(`span`, { className: `text-[20px] font-bold text-win-ink`, children: `CoolMessenger` }), (0, z.jsx)(
    `span`, { className: `text-[20px] font-bold text-cm-red`, children: `GENTOO` })] }), (0, z.jsxs)(`p`, { className: `\
mt-1 whitespace-nowrap text-[11px] text-win-muted`, children: [`(ver. `, Xt, ` 모의)`] })] })] }), (0, z.jsxs)(
    `form`, { className: `mt-6 flex flex-col gap-2`, onSubmit: (e3) => {
      e3.preventDefault(), h2();
    }, children: [(0, z.jsx)(Wn, { value: t2, onChange: i2, label: `서버 IP`, icon: `search`, tip: `학내 서버 주소\
입니다. 모의 환경에서는 연결하지 않습니다.` }), (0, z.jsx)(Wn, { value: n2, onChange: a2, label: `\
이름`, autoComplete: `username`, tip: `학내 계정 이름은 익명 처리되어 있습니다.` }), (0, z.
    jsx)(Wn, { value: l2, onChange: u2, label: `비밀번호`, type: `password`, autoComplete: `current-passwo\
rd`, tip: `모의 환경에서는 어떤 비밀번호든 로그인됩니다.` }), (0, z.jsx)(`button`, { type: `\
submit`, className: `cm-login-btn mt-3`, disabled: d2, children: d2 ? `연결 중…` : `로그인` })] }), (0,
    z.jsxs)(`div`, { className: `mt-3 flex items-start justify-between gap-3`, children: [(0, z.jsxs)(`label`,
    { className: `flex items-center gap-1.5 text-[12px] text-win-ink`, children: [(0, z.jsx)(`input`, { type: `\
checkbox`, checked: r2, onChange: (e3) => o2(e3.target.checked) }), `자동로그인`] }), (0, z.jsxs)(`div`, {
    className: `flex w-[148px] flex-col gap-1`, children: [(0, z.jsx)(`button`, { type: `button`, className: `\
win-toolbar-btn w-full`, onClick: () => c2(`alert`, `쿨메신저 통신 검사`, { text: `${t2} 서버 응답 정상 (지연 \
12ms)
학내망 모의 구간입니다.` }), children: `쿨메신저 통신 검사` }), (0, z.jsx)(`button`, { type: `\
button`, className: `win-toolbar-btn w-full`, onClick: () => c2(`alert`, `절전 모드 확인`, { text: `현재 절\
전 모드는 해제되어 있습니다.` }), children: `절전 모드 확인` })] })] }), p2 ? (0, z.jsx)(`p`,
    { className: `mt-3 text-center text-[12px] text-cm-blue`, children: p2 }) : (0, z.jsx)(`div`, { className: `\
mt-3 h-5` }), (0, z.jsxs)(`div`, { className: `mt-auto flex flex-col items-center gap-1 pt-2`, children: [(0, z.
    jsx)(`p`, { className: `text-[10px] tracking-wide text-cm-star`, children: `해커톤 모의환경 · 개인정보 익명 처리` }),
    (0, z.jsx)(`p`, { className: `flex items-center gap-1 text-[11px] font-medium text-[#b8860b]`, children: `\
HANBIT LAB` })] })] }) });
  }
  function Wn({ value: e2, onChange: t2, label: n2, tip: r2, type: i2 = `text`, autoComplete: a2, icon: o2 }) {
    return (0, z.jsxs)(`div`, { className: `flex items-center gap-1`, children: [(0, z.jsxs)(`div`, { className: `\
relative min-w-0 flex-1`, children: [(0, z.jsx)(`span`, { className: `sr-only`, children: n2 }), (0, z.jsx)(`i\
nput`, { className: `cm-login-input`, value: e2, type: i2, onChange: (e3) => t2(e3.target.value), autoComplete: a2 }),
    o2 === `search` ? (0, z.jsx)(E, { className: `pointer-events-none absolute top-2 right-2 size-4 text-win-m\
uted` }) : null] }), (0, z.jsx)(`span`, { title: r2, className: `grid size-4 shrink-0 place-items-center text-\
win-muted`, children: (0, z.jsx)(ae, { className: `size-4` }) })] });
  }
  function Gn(e2) {
    return e2.kind === `person` && e2.personId ? [e2.personId] : (e2.children ?? []).flatMap(Gn);
  }
  function Kn(e2, t2) {
    if (!t2) return true;
    let n2 = t2.toLowerCase();
    if (e2.label.toLowerCase().includes(n2)) return true;
    if (e2.personId) {
      let t3 = en[e2.personId];
      if (t3 && `${t3.name}${t3.title}${t3.ext}${t3.room ?? ``}`.toLowerCase().includes(n2)) return true;
    }
    return (e2.children ?? []).some((e3) => Kn(e3, t2));
  }
  function qn({ node: e2, depth: t2 }) {
    let n2 = R((t3) => t3.orgExpanded[e2.id] ?? false), r2 = R((t3) => !!(t3.orgChecked[e2.id] || e2.personId &&
    t3.orgChecked[e2.personId])), i2 = R((e3) => e3.orgQuery), a2 = R((e3) => e3.orgSize), o2 = R((e3) => e3.toggleExpand),
    s2 = R((e3) => e3.toggleChecked), c2 = R((e3) => e3.openWindow);
    if (i2 && !Kn(e2, i2)) return null;
    let l2 = e2.personId ? en[e2.personId] : void 0, u2 = (e2.children?.length ?? 0) > 0, d2 = Gn(e2), f2 = a2 ===
    `sm` ? `text-[11px]` : a2 === `lg` ? `text-[14px]` : `text-[12px]`, p2 = l2 ? `${l2.name}(${l2.title},${l2.
    ext})${l2.room ? `)${l2.room}` : ``}` : e2.label;
    return (0, z.jsxs)(`div`, { children: [(0, z.jsxs)(`div`, { className: zt(`org-row`, f2, e2.id === `school` &&
    `selected font-semibold`), style: { paddingLeft: 6 + t2 * 14 }, onDoubleClick: () => {
      l2 ? c2(`compose`, `쪽지 보내기`, { to: l2.id }) : o2(e2.id);
    }, onContextMenu: (e3) => {
      e3.preventDefault(), l2 && c2(`person`, l2.name, { personId: l2.id });
    }, children: [u2 ? (0, z.jsx)(`button`, { type: `button`, className: `grid size-4 place-items-center text-\
win-muted`, onClick: () => o2(e2.id), "aria-label": n2 ? `접기` : `펼치기`, children: n2 ? (0, z.jsx)(ne,
    { className: `size-3` }) : (0, z.jsx)(T, { className: `size-3` }) }) : (0, z.jsx)(`span`, { className: `in\
line-block w-4` }), (0, z.jsx)(`input`, { type: `checkbox`, className: `size-3.5 accent-cm-blue`, checked: r2,
    onChange: () => s2(e2.personId ?? e2.id, e2.personId ? [e2.personId] : d2) }), l2 ? (0, z.jsx)(Hn, { status: l2.
    status }) : null, (0, z.jsx)(`span`, { className: zt(`truncate`, e2.kind === `group` && t2 === 0 && `font-\
bold`), children: p2 })] }), u2 && (n2 || i2) ? (0, z.jsx)(`div`, { children: e2.children.map((e3) => (0, z.jsx)(
    qn, { node: e3, depth: t2 + 1 }, e3.id + (e3.personId ?? ``))) }) : null] });
  }
  function Jn() {
    let e2 = R((e3) => e3.orgQuery), t2 = R((e3) => e3.orgSort), n2 = R((e3) => e3.orgChecked), r2 = R((e3) => e3.
    openWindow), i2 = Object.entries(n2).filter(([e3, t3]) => t3 && e3.startsWith(`p-`)).map(([e3]) => e3), a2 = tn;
    if (t2 !== `org` && e2 === ``) {
      let e3 = Gn(tn).filter((e4, t3, n3) => n3.indexOf(e4) === t3).map((e4) => en[e4]).filter(Boolean).sort((e4, n3) => t2 ===
      `name` ? e4.name.localeCompare(n3.name, `ko`) : e4.ext.localeCompare(n3.ext, `ko`));
      a2 = { ...tn, children: e3.map((e4) => ({ id: `s-${e4.id}`, label: `${e4.name}(${e4.title},${e4.ext})`, kind: `\
person`, personId: e4.id })) };
    }
    return (0, z.jsxs)(`div`, { className: `flex h-full min-h-0 flex-col`, children: [(0, z.jsx)(`div`, { className: `\
min-h-0 flex-1 overflow-auto py-1`, children: (0, z.jsx)(qn, { node: a2, depth: 0 }) }), i2.length > 0 ? (0, z.
    jsxs)(`div`, { className: `flex items-center justify-between gap-2 border-t border-win-line bg-win-soft px\
-2 py-1.5`, children: [(0, z.jsxs)(`span`, { className: `text-[11px] text-win-muted`, children: [i2.length, `명\
 선택`] }), (0, z.jsx)(`button`, { type: `button`, className: `win-toolbar-btn primary`, onClick: () => r2(`\
compose`, `쪽지 보내기`, { to: i2.join(`,`) }), children: `쪽지 보내기` })] }) : null] });
  }
  var Yn = { fill: `none`, stroke: `currentColor`, strokeWidth: 2.2, strokeLinecap: `round`, strokeLinejoin: `\
round` };
  function Xn({ className: e2 }) {
    return (0, z.jsxs)(`svg`, { viewBox: `0 0 24 24`, className: e2, "aria-hidden": true, children: [(0, z.jsx)(
    `path`, { ...Yn, d: `M12 3.1 20.3 7.5v9.2L12 21 3.7 16.7V7.5Z` }), (0, z.jsx)(`path`, { ...Yn, d: `M3.7 7.\
5 12 12.1l8.3-4.6` }), (0, z.jsx)(`path`, { ...Yn, d: `M12 12.1V21` })] });
  }
  function Zn({ className: e2 }) {
    return (0, z.jsxs)(`svg`, { viewBox: `0 0 24 24`, className: e2, "aria-hidden": true, children: [(0, z.jsx)(
    `rect`, { ...Yn, x: `3`, y: `5`, width: `18`, height: `16.4`, rx: `3.1` }), (0, z.jsx)(`path`, { ...Yn, d: `\
M3 9.45h18` }), (0, z.jsx)(`path`, { ...Yn, d: `M7.2 5.1V3.4c0-.8.66-1.45 1.5-1.45s1.5.65 1.5 1.45V5.1` }), (0,
    z.jsx)(`path`, { ...Yn, d: `M13.8 5.1V3.4c0-.8.66-1.45 1.5-1.45s1.5.65 1.5 1.45V5.1` }), (0, z.jsx)(`path`,
    { ...Yn, strokeWidth: 2.25, d: `M7.2 12.2c.55-.8 1.55-1.25 2.65-1.25 1.55 0 2.65.95 2.65 2.2 0 1-.65 1.6-1\
.65 1.88 1.25.3 2 1.05 2 2.2 0 1.45-1.35 2.42-3.2 2.42-1.2 0-2.25-.5-2.75-1.28` }), (0, z.jsx)(`path`, { ...Yn,
    strokeWidth: 2.25, d: `M14.2 11.45 16.95 10.05V19.2` })] });
  }
  function Qn({ className: e2 }) {
    return (0, z.jsxs)(`svg`, { viewBox: `0 0 24 24`, className: e2, "aria-hidden": true, children: [(0, z.jsx)(
    `path`, { ...Yn, d: `M4.3 3.7h15.4c1.35 0 2.4 1.05 2.4 2.4v8.9c0 1.35-1.05 2.4-2.4 2.4h-3.35l1.15 3.35-4.8\
5-3.35H4.3c-1.35 0-2.4-1.05-2.4-2.4V6.1c0-1.35 1.05-2.4 2.4-2.4Z` }), (0, z.jsx)(`circle`, { cx: `8.15`, cy: `\
10.4`, r: `1.28`, fill: `currentColor` }), (0, z.jsx)(`circle`, { cx: `12`, cy: `10.4`, r: `1.28`, fill: `curr\
entColor` }), (0, z.jsx)(`circle`, { cx: `15.85`, cy: `10.4`, r: `1.28`, fill: `currentColor` })] });
  }
  function $n({ className: e2 }) {
    return (0, z.jsxs)(`svg`, { viewBox: `0 0 24 24`, className: e2, "aria-hidden": true, children: [(0, z.jsx)(
    `rect`, { ...Yn, x: `3.25`, y: `3.25`, width: `17.5`, height: `17.5`, rx: `2.15` }), (0, z.jsx)(`rect`, { ...Yn,
    strokeWidth: 1.95, x: `8.1`, y: `3.25`, width: `7.15`, height: `5.2`, rx: `0.55` }), (0, z.jsx)(`rect`, { ...Yn,
    strokeWidth: 1.6, x: `12.95`, y: `4.45`, width: `1.35`, height: `2.55`, rx: `0.25` }), (0, z.jsx)(`rect`, {
    ...Yn, x: `6.15`, y: `12.85`, width: `11.7`, height: `7.9`, rx: `1.15` })] });
  }
  function er() {
    let e2 = R((e3) => e3.openWindow);
    return (0, z.jsx)(`div`, { className: `h-full overflow-auto p-2`, children: ln.map((t2) => (0, z.jsxs)(`bu\
tton`, { type: `button`, className: `mb-1.5 w-full rounded-sm border border-win-line bg-white px-3 py-2 text-l\
eft hover:bg-win-soft`, onClick: () => e2(`notice`, t2.title, { id: t2.id }), children: [(0, z.jsxs)(`div`, { className: `\
flex items-center gap-2`, children: [t2.pinned ? (0, z.jsx)(`span`, { className: `text-[10px] font-bold text-c\
m-red`, children: `공지` }) : null, (0, z.jsx)(`span`, { className: `truncate text-[12px] font-medium`, children: t2.
    title })] }), (0, z.jsxs)(`p`, { className: `mt-0.5 text-[11px] text-win-muted`, children: [en[t2.fromId]?.
    name, ` · `, t2.dateLabel] })] }, t2.id)) });
  }
  function tr() {
    let e2 = R((e3) => e3.surveyVotes), t2 = R((e3) => e3.voteSurvey);
    return (0, z.jsx)(`div`, { className: `h-full overflow-auto p-2`, children: un.map((n2) => {
      let r2 = n2.options.reduce((e3, t3) => e3 + t3.votes, 0) + +!!e2[n2.id];
      return (0, z.jsxs)(`div`, { className: `mb-3 border border-win-line bg-white p-3`, children: [(0, z.jsx)(
      `p`, { className: `text-[12px] font-semibold`, children: n2.title }), (0, z.jsxs)(`p`, { className: `mb-\
2 text-[11px] text-win-muted`, children: [en[n2.fromId]?.name, ` · 마감 `, n2.due] }), (0, z.jsx)(`div`, { className: `\
flex flex-col gap-1.5`, children: n2.options.map((i2) => {
        let a2 = e2[n2.id] === i2.id, o2 = i2.votes + +!!a2, s2 = r2 ? Math.round(o2 / r2 * 100) : 0;
        return (0, z.jsxs)(`button`, { type: `button`, disabled: !!e2[n2.id], onClick: () => t2(n2.id, i2.id),
        className: `relative overflow-hidden border border-win-line px-2 py-1.5 text-left text-[12px] disabled\
:cursor-default`, children: [(0, z.jsx)(`span`, { className: `absolute inset-y-0 left-0 bg-cm-header/20`, style: {
        width: `${s2}%` } }), (0, z.jsxs)(`span`, { className: `relative flex justify-between`, children: [(0,
        z.jsx)(`span`, { className: zt(a2 && `font-semibold`), children: i2.label }), (0, z.jsxs)(`span`, { className: `\
text-win-muted`, children: [s2, `%`] })] })] }, i2.id);
      }) })] }, n2.id);
    }) });
  }
  function nr() {
    let e2 = R((e3) => e3.memos), t2 = R((e3) => e3.addMemo), n2 = R((e3) => e3.updateMemo), r2 = R((e3) => e3.
    deleteMemo), [i2, a2] = (0, S.useState)(``), [o2, s2] = (0, S.useState)(``), [c2, l2] = (0, S.useState)(e2[0]?.
    id ?? null), u2 = e2.find((e3) => e3.id === c2);
    return (0, z.jsxs)(`div`, { className: `flex h-full min-h-0`, children: [(0, z.jsxs)(`div`, { className: `\
w-[38%] overflow-auto border-r border-win-line`, children: [e2.map((e3) => (0, z.jsx)(`button`, { type: `butto\
n`, onClick: () => l2(e3.id), className: zt(`block w-full truncate border-b border-win-line px-2 py-2 text-lef\
t text-[12px]`, c2 === e3.id && `bg-cm-select text-white`), children: e3.title }, e3.id)), (0, z.jsxs)(`form`,
    { className: `p-2`, onSubmit: (e3) => {
      e3.preventDefault(), i2.trim() && (t2(i2.trim(), o2), a2(``), s2(``));
    }, children: [(0, z.jsx)(`input`, { className: `cm-login-input mb-1`, placeholder: `새 메모 제목`, value: i2,
    onChange: (e3) => a2(e3.target.value) }), (0, z.jsx)(`textarea`, { className: `mb-1 h-16 w-full border bor\
der-[#c5c5c5] p-1.5 text-[12px]`, placeholder: `내용`, value: o2, onChange: (e3) => s2(e3.target.value) }), (0,
    z.jsx)(`button`, { type: `submit`, className: `win-toolbar-btn primary w-full`, children: `메모 추가` })] })] }),
    (0, z.jsx)(`div`, { className: `min-w-0 flex-1 p-2`, children: u2 ? (0, z.jsxs)(z.Fragment, { children: [(0,
    z.jsx)(`input`, { className: `mb-2 w-full border-b border-win-line py-1 text-[13px] font-semibold outline-\
none`, value: u2.title, onChange: (e3) => n2(u2.id, { title: e3.target.value }) }), (0, z.jsx)(`textarea`, { className: `\
h-[calc(100%-64px)] w-full resize-none text-[12px] leading-relaxed outline-none`, value: u2.body, onChange: (e3) => n2(
    u2.id, { body: e3.target.value }) }), (0, z.jsx)(`button`, { type: `button`, className: `win-toolbar-btn m\
t-1`, onClick: () => r2(u2.id), children: `삭제` })] }) : (0, z.jsx)(`p`, { className: `p-4 text-[12px] text\
-win-muted`, children: `메모를 선택하거나 추가하세요.` }) })] });
  }
  function rr() {
    return (0, z.jsx)(`div`, { className: `h-full overflow-auto p-2`, children: fn.map((e2) => (0, z.jsxs)(`a`,
    { href: e2.href, target: `_blank`, rel: `noreferrer`, className: `mb-1.5 flex items-center justify-between\
 border border-win-line bg-white px-3 py-2 hover:bg-win-soft`, children: [(0, z.jsxs)(`span`, { children: [(0,
    z.jsx)(`span`, { className: `block text-[12px] font-medium text-link-blue`, children: e2.label }), (0, z.jsx)(
    `span`, { className: `text-[11px] text-win-muted`, children: e2.desc })] }), (0, z.jsx)(`span`, { className: `\
text-[11px] text-win-muted`, children: `열기` })] }, e2.id)) });
  }
  function ir() {
    let e2 = Array.from({ length: 31 }, (e3, t3) => t3 + 1), t2 = /* @__PURE__ */ new Map();
    for (let e3 of dn) {
      let n3 = Number(e3.date.slice(-2)), r2 = t2.get(n3) ?? [];
      r2.push(e3), t2.set(n3, r2);
    }
    let n2 = { blue: `bg-cm-header`, red: `bg-cm-red`, green: `bg-banner-green`, amber: `bg-cm-star` };
    return (0, z.jsxs)(`div`, { className: `flex h-full min-h-0 flex-col`, children: [(0, z.jsx)(`p`, { className: `\
border-b border-win-line px-3 py-2 text-[13px] font-semibold`, children: `2026년 8월 · 학사일정` }), (0,
    z.jsx)(`div`, { className: `grid grid-cols-7 border-b border-win-line text-center text-[11px] text-win-mut\
ed`, children: [`일`, `월`, `화`, `수`, `목`, `금`, `토`].map((e3) => (0, z.jsx)(`div`, { className: `p\
y-1`, children: e3 }, e3)) }), (0, z.jsxs)(`div`, { className: `grid min-h-0 flex-1 grid-cols-7 grid-rows-6 te\
xt-[11px]`, children: [Array.from({ length: 6 }).map((e3, t3) => (0, z.jsx)(`div`, {}, `pad-${t3}`)), e2.map((e3) => {
      let r2 = t2.get(e3) ?? [], i2 = e3 === 24;
      return (0, z.jsxs)(`div`, { className: zt(`border-r border-b border-win-line p-1`, i2 && `bg-[#e8f4fc]`),
      children: [(0, z.jsx)(`div`, { className: zt(`mb-0.5 font-medium`, i2 && `text-cm-blue`), children: e3 }),
      r2.slice(0, 2).map((e4) => (0, z.jsxs)(`div`, { className: `flex items-center gap-1 truncate`, children: [
      (0, z.jsx)(`span`, { className: zt(`size-1.5 shrink-0 rounded-full`, n2[e4.color]) }), (0, z.jsx)(`span`,
      { className: `truncate`, children: e4.title })] }, e4.id))] }, e3);
    })] })] });
  }
  function ar() {
    return (0, z.jsxs)(`div`, { className: `flex h-full flex-col items-center justify-center gap-2 p-6 text-ce\
nter`, children: [(0, z.jsx)(`p`, { className: `text-[13px] font-semibold`, children: `콜알림톡` }), (0, z.
    jsx)(`p`, { className: `max-w-xs text-[12px] leading-relaxed text-win-muted`, children: `부재중 전화 알림은 학내 교환기\
와 연동됩니다. 모의 환경에서는 교환기 복구 메시지가 받은메시지로 도착합니다.` })] });
  }
  function or() {
    let [e2, t2] = (0, S.useState)(``), [n2, r2] = (0, S.useState)(``), [i2, a2] = (0, S.useState)(false);
    return (0, z.jsxs)(`form`, { className: `flex h-full flex-col gap-2 p-3`, onSubmit: (e3) => {
      e3.preventDefault(), a2(true);
    }, children: [(0, z.jsx)(`p`, { className: `text-[13px] font-semibold`, children: `문자 보내기 (모의)` }),
    (0, z.jsx)(`input`, { className: `cm-login-input`, placeholder: `받는 사람 (학부모 연락처는 저장되지 않습니다)`,
    value: e2, onChange: (e3) => t2(e3.target.value) }), (0, z.jsx)(`textarea`, { className: `min-h-0 flex-1 b\
order border-[#c5c5c5] p-2 text-[12px]`, placeholder: `내용`, value: n2, onChange: (e3) => r2(e3.target.value),
    maxLength: 90 }), (0, z.jsxs)(`div`, { className: `flex items-center justify-between`, children: [(0, z.jsxs)(
    `span`, { className: `text-[11px] text-win-muted`, children: [n2.length, `/90`] }), (0, z.jsx)(`button`, {
    type: `submit`, className: `win-toolbar-btn primary`, children: `전송` })] }), i2 ? (0, z.jsx)(`p`, { className: `\
text-[12px] text-cm-status`, children: `모의 전송되었습니다. 실제 문자는 발송되지 않습니다.` }) :
    null] });
  }
  var sr = [{ id: `org`, label: `조직도` }, { id: `notice`, label: `공지` }, { id: `survey`, label: `설문` },
  { id: `memo`, label: `메모` }, { id: `link`, label: `링크` }, { id: `calendar`, label: `학사일정` },
  { id: `call`, label: `콜알림톡` }, { id: `sms`, label: `문자` }], cr = { available: `수신가능`, away: `\
자리비움`, busy: `다른 용무 중`, offline: `수신거부` };
  function lr({ win: e2 }) {
    let t2 = R((e3) => e3.sidebarTab), n2 = R((e3) => e3.setSidebar), r2 = R((e3) => e3.presence), i2 = R((e3) => e3.
    setPresence), a2 = R((e3) => e3.orgQuery), o2 = R((e3) => e3.setOrgQuery), s2 = R((e3) => e3.orgSort), c2 = R(
    (e3) => e3.setOrgSort), l2 = R((e3) => e3.orgSize), u2 = R((e3) => e3.setOrgSize), d2 = R((e3) => e3.openWindow),
    f2 = R((e3) => e3.extras), p2 = R((e3) => e3.deletedIds), m2 = R((e3) => e3.unreadIds), h2 = R((e3) => e3.
    readIds), [g2, _2] = (0, S.useState)(false), [v2, y2] = (0, S.useState)(0), b2 = Fn({ extras: f2, deletedIds: p2,
    starredIds: [], readIds: h2, unreadIds: m2 }).filter((e3) => e3.folder === `inbox` && e3.unread).length;
    (0, S.useEffect)(() => {
      let e3 = window.setInterval(() => y2((e4) => (e4 + 1) % pn.length), 6e3);
      return () => window.clearInterval(e3);
    }, []);
    let x2 = pn[v2];
    return (0, z.jsx)(Bn, { win: e2, icon: (0, z.jsx)(Vn, { size: 16 }), buttons: [`help`, `gear`, `min`, `max`,
    `close`], onHelp: () => d2(`about`, `쿨메신저 모의 — 정보`), onGear: () => d2(`settings`, `환경설정`),
    header: (0, z.jsxs)(`div`, { className: `cm-header flex items-center gap-3 px-3 py-2`, children: [(0, z.jsx)(
    Vn, { size: 56, variant: `avatar` }), (0, z.jsxs)(`div`, { className: `min-w-0 flex-1`, children: [(0, z.jsx)(
    `p`, { className: `text-[18px] font-bold leading-tight`, children: Qt }), (0, z.jsxs)(`div`, { className: `\
relative mt-1 inline-block`, children: [(0, z.jsxs)(`button`, { type: `button`, className: `flex items-center \
gap-1 rounded-sm bg-cm-status px-2 py-0.5 text-[11px] font-medium`, onClick: () => _2((e3) => !e3), children: [
    cr[r2], (0, z.jsx)(ne, { className: `size-3` })] }), g2 ? (0, z.jsx)(`div`, { className: `absolute top-ful\
l left-0 z-10 mt-1 min-w-[120px] border border-win-border bg-white py-1 text-win-ink shadow-win`, children: Object.
    entries(cr).map(([e3, t3]) => (0, z.jsx)(`button`, { type: `button`, className: `block w-full px-3 py-1.5 \
text-left text-[12px] hover:bg-win-soft`, onClick: () => {
      i2(e3), _2(false);
    }, children: t3 }, e3)) }) : null] })] }), (0, z.jsxs)(`div`, { className: `flex items-center gap-0.5 self\
-center`, children: [(0, z.jsx)(ur, { label: `자료실`, onClick: () => n2(`link`), children: (0, z.jsx)(Xn, {
    className: `size-7` }) }), (0, z.jsx)(ur, { label: `학사일정`, onClick: () => n2(`calendar`), children: (0,
    z.jsx)(Zn, { className: `size-7` }) }), (0, z.jsx)(ur, { label: b2 > 0 ? `메시지 관리함, 안 읽은 메시지 ${b2}\
건` : `메시지 관리함`, onClick: () => d2(`inbox`, `메시지 관리함`), badge: b2, children: (0, z.jsx)(
    Qn, { className: `size-7` }) }), (0, z.jsx)(ur, { label: `저장`, onClick: () => n2(`memo`), children: (0,
    z.jsx)($n, { className: `size-7` }) })] }), (0, z.jsx)(`button`, { type: `button`, title: `색상 테마`,
    "aria-label": `색상 테마`, className: `mb-auto grid size-7 place-items-center rounded-sm text-white/90\
 hover:bg-white/15`, onClick: () => d2(`settings`, `환경설정`), children: (0, z.jsx)(se, { className: `siz\
e-4` }) })] }), footer: (0, z.jsx)(dr, { ad: x2, onClick: () => y2((e3) => (e3 + 1) % pn.length) }), children: (0,
    z.jsxs)(`div`, { className: `flex h-full min-h-0 flex-col`, children: [(0, z.jsxs)(`div`, { className: `fl\
ex items-center gap-1 border-b border-win-line bg-win-chrome px-2 py-1`, children: [(0, z.jsxs)(`button`, { type: `\
button`, className: `win-toolbar-btn flex items-center gap-1`, children: [`조직도 `, (0, z.jsx)(ne, { className: `\
size-3` })] }), (0, z.jsxs)(`div`, { className: `relative min-w-0 flex-1`, children: [(0, z.jsx)(`input`, { className: `\
h-7 w-full border border-[#c5c5c5] bg-white pr-7 pl-2 text-[12px] outline-none`, placeholder: `이름(아이디) 또는 그룹명 \
검색`, value: a2, onChange: (e3) => o2(e3.target.value) }), (0, z.jsx)(E, { className: `pointer-events-none \
absolute top-1.5 right-2 size-3.5 text-win-muted` })] }), (0, z.jsx)(`button`, { type: `button`, className: `w\
in-toolbar-btn px-1.5`, title: `조직도`, children: (0, z.jsx)(O, { className: `size-3.5` }) }), (0, z.jsxs)(
    `select`, { className: `win-toolbar-btn`, value: s2, onChange: (e3) => c2(e3.target.value), children: [(0,
    z.jsx)(`option`, { value: `org`, children: `정렬` }), (0, z.jsx)(`option`, { value: `name`, children: `이\
름순` }), (0, z.jsx)(`option`, { value: `ext`, children: `내선순` })] }), (0, z.jsxs)(`select`, { className: `\
win-toolbar-btn`, value: l2, onChange: (e3) => u2(e3.target.value), children: [(0, z.jsx)(`option`, { value: `\
sm`, children: `작게` }), (0, z.jsx)(`option`, { value: `md`, children: `크기` }), (0, z.jsx)(`option`, { value: `\
lg`, children: `크게` })] })] }), (0, z.jsxs)(`div`, { className: `flex min-h-0 flex-1 overflow-hidden`, children: [
    (0, z.jsx)(`nav`, { className: `cm-side flex w-[78px] shrink-0 flex-col overflow-auto`, children: sr.map((e3) => (0,
    z.jsx)(`button`, { type: `button`, className: zt(`cm-side-item`, t2 === e3.id && `active`), onClick: () => n2(
    e3.id), children: e3.label }, e3.id)) }), (0, z.jsxs)(`div`, { className: `min-w-0 flex-1 bg-white`, children: [
    t2 === `org` ? (0, z.jsx)(Jn, {}) : null, t2 === `notice` ? (0, z.jsx)(er, {}) : null, t2 === `survey` ? (0,
    z.jsx)(tr, {}) : null, t2 === `memo` ? (0, z.jsx)(nr, {}) : null, t2 === `link` ? (0, z.jsx)(rr, {}) : null,
    t2 === `calendar` ? (0, z.jsx)(ir, {}) : null, t2 === `call` ? (0, z.jsx)(ar, {}) : null, t2 === `sms` ? (0,
    z.jsx)(or, {}) : null] })] })] }) });
  }
  function ur({ children: e2, label: t2, onClick: n2, badge: r2 }) {
    return (0, z.jsxs)(`button`, { type: `button`, title: t2, "aria-label": t2, onClick: n2, className: `relat\
ive grid size-9 place-items-center rounded-sm text-[#eef6fc] hover:bg-white/15`, children: [e2, r2 && r2 > 0 ?
    (0, z.jsx)(`span`, { className: `absolute top-0 right-0 min-w-[15px] rounded-[3px] bg-[#e53935] px-[4px] t\
ext-center text-[10px] font-bold leading-[15px] text-white`, children: r2 > 99 ? `99` : r2 }) : null] });
  }
  function dr({ ad: e2, onClick: t2 }) {
    let n2 = e2.tone === `market` ? `banner-market` : e2.tone === `vote` ? `banner-vote` : `banner-travel`;
    return (0, z.jsxs)(`button`, { type: `button`, onClick: t2, className: zt(`flex h-[54px] w-full items-cent\
er justify-between border-t border-win-line px-3 text-left`, n2), children: [(0, z.jsxs)(`div`, { children: [(0,
    z.jsx)(`p`, { className: `text-[10px] font-bold text-banner-green`, children: e2.kicker }), (0, z.jsx)(`p`,
    { className: `text-[13px] font-extrabold text-win-ink`, children: e2.title }), (0, z.jsx)(`p`, { className: `\
text-[11px] text-cm-red`, children: e2.sub })] }), (0, z.jsx)(`span`, { className: `text-[11px] text-win-muted`,
    children: `광고 · 모의` })] });
  }
  function fr({ children: e2, defaultPrimary: t2 = 42 }) {
    let n2 = Array.isArray(e2) ? e2 : [e2], r2 = n2[0], i2 = n2[1], a2 = (0, S.useRef)(t2), o2 = (0, S.useRef)(
    null), s2 = (0, S.useRef)(null);
    return (0, z.jsxs)(`div`, { ref: o2, className: `flex min-h-0 min-w-0 flex-1 flex-row`, children: [(0, z.jsx)(
    `div`, { ref: s2, className: `min-h-0 min-w-0 overflow-hidden`, style: { width: `${t2}%` }, children: r2 }),
    (0, z.jsx)(`div`, { role: `separator`, "aria-orientation": `vertical`, "aria-label": `목록 너비 조절`,
    className: `w-1.5 shrink-0 cursor-col-resize bg-win-sidebar hover:bg-cm-header`, onPointerDown: (e3) => {
      let t3 = o2.current, n3 = s2.current;
      if (!t3 || !n3) return;
      let r3 = t3.getBoundingClientRect(), i3 = e3.clientX, c2 = a2.current, l2 = (e4) => {
        let t4 = Math.min(62, Math.max(28, c2 + (e4.clientX - i3) / r3.width * 100));
        a2.current = t4, n3.style.width = `${t4}%`;
      }, u2 = () => {
        window.removeEventListener(`pointermove`, l2), window.removeEventListener(`pointerup`, u2);
      };
      window.addEventListener(`pointermove`, l2), window.addEventListener(`pointerup`, u2);
    } }), (0, z.jsx)(`div`, { className: `min-h-0 min-w-0 flex-1 overflow-hidden`, children: i2 })] });
  }
  var pr = [`일`, `월`, `화`, `수`, `목`, `금`, `토`], mr = `&`;
  function hr(e2) {
    return String(e2).padStart(2, `0`);
  }
  function gr(e2 = /* @__PURE__ */ new Date()) {
    return `coolmsg_${e2.getFullYear()}_${hr(e2.getMonth() + 1)}_${hr(e2.getDate())}.${hr(e2.getHours())}.${hr(
    e2.getMinutes())}.${hr(e2.getSeconds())}`;
  }
  function _r(e2) {
    return e2.replace(/&/g, `${mr}amp;`).replace(/</g, `${mr}lt;`).replace(/>/g, `${mr}gt;`).replace(/"/g, `${mr}\
quot;`);
  }
  function vr(e2) {
    return e2.replace(/<br\s*\/?>/gi, `
`).replace(/<\/p>/gi, `
`).replace(/<\/div>/gi, `
`).replace(/<[^>]+>/g, ``).replace(RegExp(`${mr}nbsp;`, `g`), ` `).replace(RegExp(`${mr}lt;`, `g`), `<`).replace(
    RegExp(`${mr}gt;`, `g`), `>`).replace(RegExp(`${mr}quot;`, `g`), `"`).replace(RegExp(`${mr}amp;`, `g`), `&`).
    replace(/\r/g, ``).replace(/\n{3,}/g, `

`).trim();
  }
  function yr(e2) {
    return e2.starred ? `중요 메시지` : `일반 메시지`;
  }
  function br(e2) {
    let t2 = new Date(e2.ts);
    return Number.isNaN(t2.getTime()) ? e2.dateLabel || `` : `${t2.getFullYear()}/${hr(t2.getMonth() + 1)}/${hr(
    t2.getDate())} ${hr(t2.getHours())}:${hr(t2.getMinutes())}:${hr(t2.getSeconds())} (${pr[t2.getDay()]})`;
  }
  function xr(e2) {
    return e2.attachments.map((e3) => e3.name).join(` `);
  }
  function Sr(e2) {
    return vr(e2.bodyHtml || e2.preview || ``);
  }
  function Cr(e2) {
    return `<Row>${e2.map((e3) => `<Cell ss:StyleID="txt"><Data ss:Type="String">${_r(e3)}</Data></Cell>`).join(
    ``)}</Row>`;
  }
  function wr(e2, t2, n2) {
    let r2 = `<Row>${t2.map((e3) => `<Cell ss:StyleID="hdr"><Data ss:Type="String">${_r(e3)}</Data></Cell>`).join(
    ``)}</Row>`, i2 = n2.map((e3) => Cr(e3)).join(``);
    return `<Worksheet ss:Name="${_r(e2)}"><Table>${r2}${i2}</Table></Worksheet>`;
  }
  function Tr(e2, t2, n2) {
    let r2 = t2.getTime(), i2 = n2.getTime() + 864e5 - 1, a2 = e2.filter((e3) => e3.ts >= r2 && e3.ts <= i2).sort(
    (e3, t3) => t3.ts - e3.ts), o2 = a2.filter((e3) => e3.folder === `inbox`), s2 = a2.filter((e3) => e3.folder ===
    `sent`), c2 = o2.map((e3) => [yr(e3), mn(e3.fromId, true), e3.subject, br(e3), Sr(e3), xr(e3)]), l2 = s2.map(
    (e3) => [yr(e3), e3.toIds.map((e4) => mn(e4, true)).join(`; `), e3.subject, br(e3), Sr(e3), xr(e3)]);
    return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="hdr"><Font ss:Bold="1"/><NumberFormat ss:Format="@"/></Style>
  <Style ss:ID="txt"><NumberFormat ss:Format="@"/></Style>
 </Styles>
 ${wr(`받은메시지`, [`구분`, `보낸사람`, `제목`, `날짜/시간`, `내용`, `첨부파일`], c2)}\

 ${wr(`보낸메시지`, [`구분`, `받은사람`, `제목`, `날짜/시간`, `내용`, `첨부파일`], l2)}\

</Workbook>`;
  }
  function Er(e2, t2) {
    let n2 = new Blob([`\uFEFF` + t2], { type: `application/vnd.ms-excel;charset=utf-8` }), r2 = URL.createObjectURL(
    n2), i2 = document.createElement(`a`);
    i2.href = r2, i2.download = e2, i2.click(), URL.revokeObjectURL(r2);
  }
  async function Dr(e2, t2, n2) {
    let r2 = `${t2}.xls`, i2 = window.Neutralino, a2 = e2.replace(/[\\/]$/, ``) + `\\` + r2;
    if (i2?.filesystem?.writeFile) try {
      await i2.filesystem.writeFile(a2, `\uFEFF` + n2), await i2.os?.showMessageBox?.(`메시지 다운로드`,
      `저장했습니다.
${a2}`);
      return;
    } catch {
    }
    Er(r2, n2);
  }
  async function Or() {
    let e2 = window.Neutralino;
    try {
      let t2 = await e2?.os?.getPath?.(`desktop`);
      if (t2) return t2.replace(/\//g, `\\`);
    } catch {
    }
    return `C:\\Users\\김서준\\Desktop`;
  }
  async function kr(e2) {
    let t2 = window.Neutralino;
    try {
      let e3 = await t2?.os?.showFolderDialog?.(`저장 폴더 선택`);
      if (e3) return e3.replace(/\//g, `\\`);
    } catch {
    }
    return e2;
  }
  function Ar(e2) {
    return `${e2.getFullYear()}-${hr(e2.getMonth() + 1)}-${hr(e2.getDate())}`;
  }
  function jr(e2) {
    let t2 = e2.replace(/\D/g, ``).slice(0, 8);
    return t2.length <= 4 ? t2 : t2.length <= 6 ? `${t2.slice(0, 4)}-${t2.slice(4)}` : `${t2.slice(0, 4)}-${t2.
    slice(4, 6)}-${t2.slice(6)}`;
  }
  function Mr(e2) {
    let t2 = e2.replace(/\D/g, ``).slice(0, 8);
    if (t2.length === 8) {
      let e3 = Number(t2.slice(0, 4)), n3 = Number(t2.slice(4, 6)), r2 = Number(t2.slice(6, 8));
      if (e3 >= 2e3 && e3 <= 2099 && n3 >= 1 && n3 <= 12 && r2 >= 1 && r2 <= 31) return new Date(e3, n3 - 1, r2);
    }
    let n2 = /* @__PURE__ */ new Date();
    return new Date(n2.getFullYear(), n2.getMonth(), n2.getDate());
  }
  function Nr({ messages: e2, onClose: t2 }) {
    let n2 = gn(), r2 = new Date(n2.getFullYear(), n2.getMonth() - 1, 1), [i2, a2] = (0, S.useState)(Ar(r2)), [
    o2, s2] = (0, S.useState)(Ar(n2)), [c2, l2] = (0, S.useState)(`C:\\Users\\김서준\\Desktop`), [u2, d2] = (0,
    S.useState)(gr(n2)), [f2, p2] = (0, S.useState)(false);
    (0, S.useEffect)(() => {
      Or().then(l2);
    }, []);
    let m2 = `${c2}\\${u2}`, h2 = async () => {
      if (f2) return;
      p2(true);
      let n3 = Tr(e2, Mr(i2), Mr(o2));
      await Dr(c2, u2, n3), d2(gr(gn())), p2(false), t2();
    };
    return (0, z.jsx)(`div`, { className: `absolute inset-0 z-[80] grid place-items-center bg-black/25 p-3`, children: (0,
    z.jsxs)(`div`, { className: `w-[520px] max-w-full overflow-hidden rounded-sm border border-[#8aa0b4] bg-wh\
ite shadow-win`, children: [(0, z.jsxs)(`div`, { className: `flex h-8 items-center gap-1.5 border-b border-win\
-line bg-win-chrome px-2`, children: [(0, z.jsx)(Vn, { size: 18 }), (0, z.jsx)(`span`, { className: `text-[13p\
x] font-medium`, children: `메시지 다운로드` }), (0, z.jsx)(`button`, { type: `button`, className: `win\
-titlebar-btn close ml-auto`, "aria-label": `닫기`, onClick: t2, children: (0, z.jsx)(A, { className: `size-\
3.5` }) })] }), (0, z.jsxs)(`div`, { className: `px-6 pt-5 pb-4`, children: [(0, z.jsxs)(Pr, { label: `기 간`,
    children: [(0, z.jsx)(Fr, { value: i2, onChange: a2 }), (0, z.jsx)(`span`, { className: `px-1 text-[12px] \
text-win-muted`, children: `~` }), (0, z.jsx)(Fr, { value: o2, onChange: s2 })] }), (0, z.jsxs)(Pr, { label: `\
저장 폴더`, children: [(0, z.jsx)(`input`, { className: `h-7 min-w-0 flex-1 border border-win-line bg-whit\
e px-2 text-[12px] outline-none`, value: m2, readOnly: true, title: m2 }), (0, z.jsx)(`button`, { type: `butto\
n`, className: `win-toolbar-btn shrink-0`, onClick: () => {
      kr(c2).then(l2);
    }, children: `폴더변경` })] }), (0, z.jsx)(`p`, { className: `mt-6 text-center text-[13px]`, children: `\
해당 기간의 메시지를 다운로드 하시겠습니까?` }), (0, z.jsx)(`p`, { className: `mt-2 text-ce\
nter text-[12px] font-medium text-[#d32f2f]`, children: `메시지 양에 따라 다운로드 시간이 길어질 수 있습니다.` })] }),
    (0, z.jsxs)(`div`, { className: `flex justify-end gap-2 border-t border-win-line bg-win-chrome px-4 py-2.5`,
    children: [(0, z.jsx)(`button`, { type: `button`, className: `win-toolbar-btn min-w-[72px]`, disabled: f2,
    onClick: () => void h2(), children: f2 ? `저장 중…` : `다운로드` }), (0, z.jsx)(`button`, { type: `\
button`, className: `win-toolbar-btn min-w-[72px]`, onClick: t2, children: `닫기` })] })] }) });
  }
  function Pr({ label: e2, children: t2 }) {
    return (0, z.jsxs)(`div`, { className: `mb-2 flex items-center gap-2`, children: [(0, z.jsx)(`span`, { className: `\
w-[72px] shrink-0 text-right text-[12px]`, children: e2 }), (0, z.jsx)(`div`, { className: `flex min-w-0 flex-\
1 items-center gap-1`, children: t2 })] });
  }
  function Fr({ value: e2, onChange: t2 }) {
    let n2 = (0, S.useRef)(true), r2 = jr(e2);
    return (0, z.jsxs)(`label`, { className: `relative flex h-7 min-w-0 flex-1 items-center border border-win-\
line bg-white`, children: [(0, z.jsx)(`input`, { type: `text`, inputMode: `numeric`, placeholder: `2026-08-28`,
    className: `h-full w-full bg-transparent pr-7 pl-2 text-[12px] tabular-nums outline-none`, value: r2, onFocus: (e3) => {
      n2.current = true, e3.currentTarget.select();
    }, onClick: (e3) => {
      n2.current = true, e3.currentTarget.select();
    }, onKeyDown: (r3) => {
      if (r3.key >= `0` && r3.key <= `9`) {
        r3.preventDefault();
        let i2 = n2.current ? `` : e2.replace(/\D/g, ``);
        n2.current = false, t2(jr((i2 + r3.key).slice(0, 8)));
        return;
      }
      r3.key === `Backspace` && (r3.preventDefault(), n2.current = false, t2(jr(e2.replace(/\D/g, ``).slice(0,
      -1))));
    }, onChange: () => {
    } }), (0, z.jsx)(te, { className: `pointer-events-none absolute right-1.5 size-3.5 text-win-muted` })] });
  }
  function Ir({ win: e2 }) {
    let t2 = R((e3) => e3.folder), n2 = R((e3) => e3.setFolder), r2 = R((e3) => e3.inboxFilter), i2 = R((e3) => e3.
    setInboxFilter), a2 = R((e3) => e3.msgQuery), o2 = R((e3) => e3.setMsgQuery), s2 = R((e3) => e3.selectedId),
    c2 = R((e3) => e3.extras), l2 = R((e3) => e3.deletedIds), u2 = R((e3) => e3.starredIds), d2 = R((e3) => e3.
    readIds), f2 = R((e3) => e3.unreadIds), p2 = R((e3) => e3.columnWidths), m2 = R((e3) => e3.fontScale);
    R((e3) => e3.openWindow);
    let h2 = R((e3) => e3.closeWindow), [g2, _2] = (0, S.useState)(false), [v2, y2] = (0, S.useState)(100), [b2,
    x2] = (0, S.useState)(false), [ee2, C2] = (0, S.useState)(false), w2 = R((e3) => e3.markRead);
    (0, S.useEffect)(() => {
      s2 && w2(s2);
    }, [s2, w2]);
    let te2 = Fn({ extras: c2, deletedIds: l2, starredIds: u2, readIds: d2, unreadIds: f2 }), T2 = (0, S.useMemo)(
    () => {
      let e3 = te2.filter((e4) => e4.folder === t2);
      if (r2 === `unread` && (e3 = e3.filter((e4) => e4.unread)), r2 === `starred` && (e3 = e3.filter((e4) => e4.
      starred)), r2 === `attach` && (e3 = e3.filter((e4) => e4.attachments.length > 0)), a2.trim()) {
        let t3 = a2.toLowerCase();
        e3 = e3.filter((e4) => {
          let n3 = en[e4.fromId];
          return e4.subject.toLowerCase().includes(t3) || e4.preview.toLowerCase().includes(t3) || n3?.name.includes(
          a2) || e4.toIds.some((e5) => en[e5]?.name.includes(a2));
        });
      }
      return e3;
    }, [te2, t2, r2, a2]), re2 = T2.find((e3) => e3.id === s2) ?? T2[0] ?? null, ie2 = te2.filter((e3) => e3.folder ===
    `inbox`).length;
    return (0, z.jsx)(Bn, { win: { ...e2, title: `메시지 관리함 (${ie2}개의 받은 메시지)` }, icon: (0,
    z.jsx)(Vn, { size: 16 }), buttons: [`min`, `max`, `close`], children: (0, z.jsxs)(`div`, { className: `rel\
ative flex h-full min-h-0 flex-col bg-white`, children: [(0, z.jsxs)(`div`, { className: `flex items-center ga\
p-1 bg-cm-header px-2 py-1.5`, children: [(0, z.jsx)(Rr, { active: t2 === `inbox`, onClick: () => n2(`inbox`),
    children: `받은메시지` }), (0, z.jsx)(Rr, { active: t2 === `sent`, onClick: () => n2(`sent`), children: `\
보낸메시지` }), (0, z.jsxs)(`div`, { className: `relative`, children: [(0, z.jsxs)(`button`, { type: `but\
ton`, className: `flex h-8 items-center gap-1 rounded-sm px-2 text-[12px] text-white hover:bg-white/15`, onClick: () => x2(
    (e3) => !e3), children: [`전체 메시지 `, (0, z.jsx)(ne, { className: `size-3` })] }), b2 ? (0, z.jsx)(
    `div`, { className: `absolute top-full left-0 z-20 mt-1 w-40 border border-win-border bg-white py-1 shadow\
-win`, children: [[`all`, `전체 메시지`], [`unread`, `안 읽은 메시지`], [`starred`, `별표 메시지`],
    [`attach`, `첨부 있는 메시지`]].map(([e3, t3]) => (0, z.jsx)(`button`, { type: `button`, className: `\
block w-full px-3 py-1.5 text-left text-[12px] text-win-ink hover:bg-win-soft`, onClick: () => {
      i2(e3), x2(false);
    }, children: t3 }, e3)) }) : null] }), (0, z.jsxs)(`div`, { className: `ml-auto flex items-center gap-1`, children: [
    (0, z.jsxs)(`select`, { className: `h-7 border border-[#c5d4e0] bg-white px-1.5 text-[12px] text-win-ink`,
    children: [(0, z.jsx)(`option`, { children: `내용` }), (0, z.jsx)(`option`, { children: `이름` }), (0,
    z.jsx)(`option`, { children: `제목` })] }), (0, z.jsxs)(`div`, { className: `relative`, children: [(0, z.
    jsx)(`input`, { className: `h-7 w-[168px] border border-[#c5d4e0] bg-white pr-7 pl-2 text-[12px] text-win-\
ink outline-none`, value: a2, onChange: (e3) => o2(e3.target.value) }), (0, z.jsx)(E, { className: `pointer-ev\
ents-none absolute top-1.5 right-2 size-3.5 text-win-muted` })] }), (0, z.jsx)(`button`, { type: `button`, className: `\
win-toolbar-btn`, children: `상세검색` }), (0, z.jsx)(`button`, { type: `button`, className: `win-toolbar-\
btn !h-7 !w-7 !p-0`, title: `메시지 다운로드`, "aria-label": `메시지 다운로드`, onClick: () => C2(
    true), children: (0, z.jsx)(Lr, {}) }), (0, z.jsx)(`button`, { type: `button`, className: `win-toolbar-btn\
 !h-7 !w-7 !p-0`, title: `삭제`, onClick: () => re2 && R.getState().deleteMessages([re2.id]), children: (0, z.
    jsx)(fe, { className: `size-3.5` }) })] })] }), (0, z.jsxs)(fr, { defaultPrimary: 42, children: [(0, z.jsx)(
    zr, { list: T2, selectedId: re2?.id ?? null, widths: p2 }), re2 ? (0, z.jsx)(Ur, { message: re2, showMore: g2,
    setShowMore: _2, zoom: v2 * m2 / 100, setZoom: y2, onReply: (e3) => qr(re2, e3 ? `all` : `reply`), onForward: () => qr(
    re2, `forward`), onClose: () => h2(e2.id) }) : (0, z.jsx)(Kr, {})] }), ee2 ? (0, z.jsx)(Nr, { messages: te2,
    onClose: () => C2(false) }) : null] }) });
  }
  function Lr() {
    return (0, z.jsxs)(`svg`, { viewBox: `0 0 16 16`, className: `size-3.5 text-win-ink`, "aria-hidden": true,
    children: [(0, z.jsx)(`path`, { d: `M8 2.2v7.3`, fill: `none`, stroke: `currentColor`, strokeWidth: `1.7`,
    strokeLinecap: `round` }), (0, z.jsx)(`path`, { d: `M4.6 6.6 8 10.6l3.4-4`, fill: `none`, stroke: `current\
Color`, strokeWidth: `1.7`, strokeLinecap: `round`, strokeLinejoin: `round` }), (0, z.jsx)(`path`, { d: `M3 13\
.2h10`, stroke: `currentColor`, strokeWidth: `1.7`, strokeLinecap: `round` })] });
  }
  function Rr({ active: e2, children: t2, onClick: n2 }) {
    return (0, z.jsx)(`button`, { type: `button`, onClick: n2, className: zt(`h-8 rounded-t-sm px-4 text-[13px\
] font-medium`, e2 ? `bg-white text-win-ink` : `text-white hover:bg-white/15`), children: t2 });
  }
  function zr({ list: e2, selectedId: t2, widths: n2, compact: r2 }) {
    let i2 = R((e3) => e3.selectMessage), a2 = R((e3) => e3.toggleStar), o2 = R((e3) => e3.setColumnWidth);
    return (0, z.jsxs)(`div`, { className: `flex h-full min-h-0 flex-col overflow-hidden border-r border-win-l\
ine`, children: [r2 ? null : (0, z.jsxs)(`div`, { className: `grid items-center border-b border-win-line bg-wi\
n-chrome text-[11px] font-medium text-win-muted`, style: Hr(n2), children: [(0, z.jsx)(`div`, { className: `gr\
id place-items-center py-1.5`, children: (0, z.jsx)(de, { className: `size-3` }) }), (0, z.jsx)(Vr, { label: `\
보낸사람`, wKey: `from`, width: n2.from, onResize: o2 }), (0, z.jsx)(Vr, { label: `제목`, wKey: `subject`,
    width: n2.subject, onResize: o2 }), (0, z.jsx)(Vr, { label: `날짜/시간`, wKey: `date`, width: n2.date,
    onResize: o2, sort: true }), (0, z.jsx)(Vr, { label: `첨부파일`, wKey: `attach`, width: n2.attach, onResize: o2 })] }),
    (0, z.jsx)(`div`, { className: `min-h-0 flex-1 overflow-auto`, children: e2.length === 0 ? (0, z.jsx)(`p`,
    { className: `p-6 text-center text-[12px] text-win-muted`, children: `메시지가 없습니다.` }) : e2.
    map((e3) => {
      let o3 = e3.id === t2, s2 = en[e3.fromId];
      return (0, z.jsx)(`button`, { type: `button`, onClick: () => i2(e3.id), className: zt(`msg-row w-full te\
xt-left`, o3 && `active`, e3.unread && `unread`), style: r2 ? void 0 : Hr(n2), children: r2 ? (0, z.jsxs)(`div`,
      { className: `flex items-start gap-2 px-2 py-2`, children: [(0, z.jsx)(Br, { starred: e3.starred, active: o3,
      onClick: () => a2(e3.id) }), (0, z.jsxs)(`div`, { className: `min-w-0 flex-1`, children: [(0, z.jsxs)(`d\
iv`, { className: `flex justify-between gap-2`, children: [(0, z.jsx)(`span`, { className: `truncate`, children: s2?.
      name }), (0, z.jsx)(`span`, { className: `shrink-0 text-[10px] opacity-80`, children: e3.dateLabel.slice(
      5, 16) })] }), (0, z.jsx)(`p`, { className: `truncate opacity-90`, children: e3.subject })] })] }) : (0,
      z.jsxs)(z.Fragment, { children: [(0, z.jsx)(`div`, { className: `grid place-items-center`, children: (0,
      z.jsx)(Br, { starred: e3.starred, active: o3, onClick: () => a2(e3.id) }) }), (0, z.jsx)(`div`, { className: `\
truncate px-1`, children: s2 ? `${s2.name}(${s2.title}` : `` }), (0, z.jsx)(`div`, { className: `truncate px-1`,
      children: e3.subject }), (0, z.jsx)(`div`, { className: `truncate px-1 tabular-nums`, children: e3.dateLabel }),
      (0, z.jsx)(`div`, { className: `flex items-center gap-1 truncate px-1 text-[11px]`, children: e3.attachments.
      length ? (0, z.jsxs)(z.Fragment, { children: [(0, z.jsx)(ce, { className: `size-3 shrink-0` }), e3.isGroup ?
      `그룹파일` : e3.attachments[0]?.name.slice(0, 10)] }) : e3.tags?.length ? e3.tags[0] : null })] }) },
      e3.id);
    }) })] });
  }
  function Br({ starred: e2, active: t2, onClick: n2 }) {
    return (0, z.jsx)(`span`, { role: `button`, tabIndex: 0, onClick: (e3) => {
      e3.stopPropagation(), n2();
    }, onKeyDown: (e3) => {
      e3.key === `Enter` && n2();
    }, className: `grid place-items-center p-1`, "aria-label": `별표`, children: (0, z.jsx)(de, { className: `\
size-3.5`, fill: e2 ? `#f5a623` : `transparent`, stroke: e2 ? `#f5a623` : t2 ? `#fff` : `#c4c4c4` }) });
  }
  function Vr({ label: e2, wKey: t2, width: n2, onResize: r2, sort: i2 }) {
    let a2 = (0, S.useRef)(null);
    return (0, z.jsxs)(`div`, { className: `relative flex items-center px-1 py-1.5`, children: [(0, z.jsxs)(`s\
pan`, { className: `truncate`, children: [e2, i2 ? ` ▾` : ``] }), (0, z.jsx)(`div`, { className: `col-resize\
r`, onPointerDown: (e3) => {
      e3.preventDefault(), a2.current = { x: e3.clientX, w: n2 };
      let i3 = (e4) => {
        a2.current && r2(t2, a2.current.w + (e4.clientX - a2.current.x));
      }, o2 = () => {
        a2.current = null, window.removeEventListener(`pointermove`, i3), window.removeEventListener(`pointeru\
p`, o2);
      };
      window.addEventListener(`pointermove`, i3), window.addEventListener(`pointerup`, o2);
    } })] });
  }
  function Hr(e2) {
    return { gridTemplateColumns: `28px ${e2.from}px minmax(80px,1fr) ${e2.date}px ${e2.attach}px` };
  }
  function Ur({ message: e2, showMore: t2, setShowMore: n2, zoom: r2, setZoom: i2, onReply: a2, onForward: o2,
  onClose: s2 }) {
    let c2 = R((e3) => e3.addMemo), l2 = R((e3) => e3.deleteMessages), u2 = en[e2.fromId], d2 = t2 ? e2.toIds :
    e2.toIds.slice(0, 4), f2 = t2 ? e2.ccIds : e2.ccIds.slice(0, 3);
    return (0, z.jsxs)(`div`, { className: `flex h-full min-h-0 flex-col`, children: [(0, z.jsxs)(`div`, { className: `\
border-b border-win-line`, children: [(0, z.jsx)(Wr, { label: `제 목`, children: (0, z.jsx)(`span`, { className: `\
text-[13px] font-semibold`, children: e2.subject }) }), (0, z.jsx)(Wr, { label: `보낸사람`, children: (0, z.
    jsx)(`span`, { className: `text-[12px] font-medium`, children: u2 ? mn(u2.id, true) : `` }) }), (0, z.jsx)(
    Wr, { label: `받는사람
(${e2.toIds.length})`, children: (0, z.jsxs)(`div`, { className: `flex min-w-0 flex-wrap items-center`, children: [
    d2.map((e3) => (0, z.jsx)(`span`, { className: `chip`, children: mn(e3, true) }, e3)), e2.toIds.length > 4 ?
    (0, z.jsx)(`button`, { type: `button`, className: `chip`, onClick: () => n2(!t2), children: `more` }) : null] }) }),
    (0, z.jsx)(Wr, { label: `참 조`, children: (0, z.jsxs)(`div`, { className: `flex min-w-0 flex-wrap`, children: [
    f2.map((e3) => (0, z.jsx)(`span`, { className: `chip`, children: mn(e3, true) }, e3)), e2.ccIds.length ===
    0 ? (0, z.jsx)(`span`, { className: `text-[12px] text-win-muted`, children: `없음` }) : null] }) })] }),
    (0, z.jsxs)(`div`, { className: `flex items-center justify-between border-b border-win-line bg-win-chrome \
px-3 py-1`, children: [(0, z.jsx)(`span`, { className: `text-[12px] font-medium`, children: `본문내용 (크롬에디터)` }),
    (0, z.jsxs)(`div`, { className: `flex items-center gap-2 text-[11px]`, children: [(0, z.jsxs)(`label`, { className: `\
flex items-center gap-1`, children: [(0, z.jsx)(`input`, { type: `checkbox`, defaultChecked: true }), ` 기본 (`,
    r2, `%)`] }), (0, z.jsxs)(`select`, { className: `win-toolbar-btn`, value: r2, onChange: (e3) => i2(Number(
    e3.target.value)), children: [(0, z.jsx)(`option`, { value: 90, children: `90%` }), (0, z.jsx)(`option`, {
    value: 100, children: `100%` }), (0, z.jsx)(`option`, { value: 125, children: `125%` }), (0, z.jsx)(`optio\
n`, { value: 150, children: `150%` })] })] })] }), (0, z.jsxs)(`div`, { className: `min-h-0 flex-1 overflow-au\
to px-4 py-3`, children: [e2.forwardedNote ? (0, z.jsx)(`p`, { className: `mb-2 text-[12px] text-win-muted`, children: e2.
    forwardedNote }) : null, (0, z.jsx)(`div`, { className: `msg-body`, style: { fontSize: `${Math.round(r2 / 100 *
    13)}px` }, dangerouslySetInnerHTML: { __html: e2.bodyHtml } })] }), e2.attachments.length ? (0, z.jsx)(`di\
v`, { className: `flex flex-wrap items-center gap-2 border-t border-win-line bg-win-soft px-3 py-1.5`, children: e2.
    attachments.map((e3) => (0, z.jsx)(Gr, { file: e3 }, e3.id)) }) : null, (0, z.jsxs)(`div`, { className: `f\
lex flex-wrap items-center justify-between gap-2 border-t border-win-line bg-win-chrome px-2 py-1.5`, children: [
    (0, z.jsx)(`button`, { type: `button`, className: `win-toolbar-btn`, onClick: () => window.print(), children: (0,
    z.jsxs)(`span`, { className: `inline-flex items-center gap-1`, children: [(0, z.jsx)(le, { className: `siz\
e-3.5` }), ` 인쇄`] }) }), (0, z.jsxs)(`div`, { className: `flex flex-wrap gap-1`, children: [(0, z.jsx)(`bu\
tton`, { type: `button`, className: `win-toolbar-btn`, onClick: () => a2(false), children: `회신` }), (0, z.
    jsx)(`button`, { type: `button`, className: `win-toolbar-btn`, onClick: () => a2(true), children: `전체 회신` }),
    (0, z.jsx)(`button`, { type: `button`, className: `win-toolbar-btn`, onClick: o2, children: `전달` }), (0,
    z.jsx)(`button`, { type: `button`, className: `win-toolbar-btn primary`, onClick: () => Jr(e2), children: `\
저장` }), (0, z.jsx)(`button`, { type: `button`, className: `win-toolbar-btn`, onClick: () => l2([e2.id]), children: `\
삭제` }), (0, z.jsx)(`button`, { type: `button`, className: `win-toolbar-btn`, onClick: () => c2(e2.subject,
    e2.preview), children: `메모저장` }), (0, z.jsx)(`button`, { type: `button`, className: `win-toolbar-b\
tn`, onClick: s2, children: `닫기` })] })] })] });
  }
  function Wr({ label: e2, children: t2 }) {
    return (0, z.jsxs)(`div`, { className: `flex items-start border-b border-win-line/80`, children: [(0, z.jsx)(
    `div`, { className: `w-[72px] shrink-0 bg-win-chrome px-2 py-1.5 text-center text-[11px] font-medium white\
space-pre-line text-win-muted`, children: e2 }), (0, z.jsx)(`div`, { className: `min-w-0 flex-1 px-2 py-1`, children: t2 })] });
  }
  function Gr({ file: e2 }) {
    let t2 = e2.href.startsWith(`/`) && typeof location < `u` && location.protocol === `file:` ? `.${e2.href}` :
    e2.href;
    return (0, z.jsxs)(`a`, { href: t2, download: e2.name, className: `inline-flex items-center gap-1 rounded-\
sm border border-win-line bg-white px-2 py-1 text-[11px] text-link-blue hover:bg-win-soft`, children: [(0, z.jsx)(
    `span`, { className: `grid size-4 place-items-center bg-emerald-700 text-[9px] font-bold text-white`, children: e2.
    kind === `xls` ? `X` : e2.kind === `pdf` ? `P` : `H` }), e2.name, (0, z.jsxs)(`span`, { className: `text-w\
in-muted`, children: [`(`, e2.sizeLabel, `)`] })] });
  }
  function Kr() {
    return (0, z.jsx)(`div`, { className: `grid h-full place-items-center text-[12px] text-win-muted`, children: `\
메시지를 선택하세요.` });
  }
  function qr(e2, t2) {
    let n2 = t2 === `forward` ? `` : t2 === `all` ? [e2.fromId, ...e2.toIds].join(`,`) : e2.fromId, r2 = t2 ===
    `all` ? e2.ccIds.join(`,`) : ``, i2 = t2 === `forward` ? `FW: ` : `RE: `;
    R.getState().openWindow(`compose`, t2 === `forward` ? `전달` : `회신`, { to: n2, cc: r2, subject: e2.subject.
    startsWith(`RE:`) || e2.subject.startsWith(`FW:`) ? e2.subject : i2 + e2.subject, quote: e2.id });
  }
  function Jr(e2) {
    let t2 = en[e2.fromId], n2 = new Blob([`제목: ${e2.subject}
보낸사람: ${t2?.name}
날짜: ${e2.dateLabel}

${e2.preview}
`], { type: `text/plain;charset=utf-8` }), r2 = URL.createObjectURL(n2), i2 = document.createElement(`a`);
    i2.href = r2, i2.download = `${e2.subject.slice(0, 24)}.txt`, i2.click(), URL.revokeObjectURL(r2);
  }
  function Yr(e2) {
    return e2 ? e2.split(`,`).map((e3) => e3.trim()).filter(Boolean) : [];
  }
  function Xr({ win: e2 }) {
    let t2 = R((e3) => e3.extras), n2 = R((e3) => e3.sendMessage), r2 = R((e3) => e3.closeWindow), i2 = R((e3) => e3.
    pushToast), a2 = R((e3) => e3.openWindow), o2 = { ...Cn(), ...e2.payload }, s2 = Yr(o2.to), c2 = Yr(o2.cc),
    l2 = o2.quote, u2 = [...t2, ...sn].find((e3) => e3.id === l2), [d2, f2] = (0, S.useState)(s2), [p2, m2] = (0,
    S.useState)(c2), [h2, g2] = (0, S.useState)(o2.subject ?? ``), [_2, v2] = (0, S.useState)(() => u2 ? `

----- 원문 -----
보낸사람: ${en[u2.fromId]?.name}
제목: ${u2.subject}

${u2.preview}` : ``), [y2, b2] = (0, S.useState)(``), [x2, ee2] = (0, S.useState)(`to`), C2 = (0, S.useMemo)(() => {
      let e3 = y2.trim();
      return e3 ? $t.filter((t3) => t3.id !== `p-seojun` && (t3.name.includes(e3) || t3.title.includes(e3) || t3.
      ext.includes(e3))).slice(0, 8) : [];
    }, [y2]), w2 = (e3) => {
      x2 === `to` ? f2((t3) => t3.includes(e3) ? t3 : [...t3, e3]) : m2((t3) => t3.includes(e3) ? t3 : [...t3,
      e3]), b2(``);
    }, te2 = () => {
      if (d2.length === 0) {
        a2(`alert`, `받는 사람`, { text: `받는 사람을 한 명 이상 선택하세요.` });
        return;
      }
      n2({ toIds: d2, ccIds: p2, subject: h2, body: _2 }), i2(`전송 완료`, h2 || `(제목없음)`), r2(e2.
      id), a2(`inbox`, `메시지 관리함`);
    };
    return (0, z.jsx)(Bn, { win: e2, icon: (0, z.jsx)(Vn, { size: 16 }), buttons: [`min`, `max`, `close`], children: (0,
    z.jsxs)(`div`, { className: `flex h-full min-h-0 flex-col bg-white`, children: [(0, z.jsx)(Zr, { label: `받\
는사람`, children: (0, z.jsx)(Qr, { ids: d2, onRemove: (e3) => f2((t3) => t3.filter((t4) => t4 !== e3)), pick: x2 ===
    `to` ? y2 : ``, onPick: (e3) => {
      ee2(`to`), b2(e3);
    }, onAdd: w2, suggestions: x2 === `to` ? C2 : [] }) }), (0, z.jsx)(Zr, { label: `참조`, children: (0, z.
    jsx)(Qr, { ids: p2, onRemove: (e3) => m2((t3) => t3.filter((t4) => t4 !== e3)), pick: x2 === `cc` ? y2 : ``,
    onPick: (e3) => {
      ee2(`cc`), b2(e3);
    }, onAdd: w2, suggestions: x2 === `cc` ? C2 : [] }) }), (0, z.jsx)(Zr, { label: `제목`, children: (0, z.
    jsx)(`input`, { className: `h-7 w-full bg-transparent text-[13px] outline-none`, value: h2, onChange: (e3) => g2(
    e3.target.value) }) }), (0, z.jsx)(`textarea`, { className: `min-h-0 flex-1 resize-none p-3 text-[13px] le\
ading-relaxed outline-none`, value: _2, onChange: (e3) => v2(e3.target.value), placeholder: `내용을 입력하세요. Ctrl+E\
nter로 전송`, onKeyDown: (e3) => {
      e3.key === `Enter` && (e3.ctrlKey || e3.metaKey) && te2();
    } }), (0, z.jsxs)(`div`, { className: `flex justify-end gap-1 border-t border-win-line bg-win-chrome px-2 \
py-1.5`, children: [(0, z.jsx)(`button`, { type: `button`, className: `win-toolbar-btn`, onClick: () => r2(e2.
    id), children: `취소` }), (0, z.jsx)(`button`, { type: `button`, className: `win-toolbar-btn primary`, onClick: te2,
    children: `보내기` })] })] }) });
  }
  function Zr({ label: e2, children: t2 }) {
    return (0, z.jsxs)(`div`, { className: `flex items-start border-b border-win-line`, children: [(0, z.jsx)(
    `div`, { className: `w-[72px] shrink-0 bg-win-chrome px-2 py-1.5 text-center text-[11px] text-win-muted`, children: e2 }),
    (0, z.jsx)(`div`, { className: `min-w-0 flex-1 px-2 py-1`, children: t2 })] });
  }
  function Qr({ ids: e2, onRemove: t2, pick: n2, onPick: r2, onAdd: i2, suggestions: a2 }) {
    return (0, z.jsxs)(`div`, { className: `relative flex flex-wrap items-center gap-1`, children: [e2.map((e3) => (0,
    z.jsxs)(`button`, { type: `button`, className: `chip`, onClick: () => t2(e3), title: `제거`, children: [
    mn(e3), ` ×`] }, e3)), (0, z.jsx)(`input`, { className: `h-6 min-w-[120px] flex-1 text-[12px] outline-non\
e`, placeholder: `이름 검색`, value: n2, onChange: (e3) => r2(e3.target.value) }), a2.length > 0 ? (0, z.jsx)(
    `div`, { className: `absolute top-full left-0 z-10 mt-1 max-h-40 w-64 overflow-auto border border-win-bord\
er bg-white shadow-win`, children: a2.map((e3) => (0, z.jsxs)(`button`, { type: `button`, className: `block w-\
full px-2 py-1.5 text-left text-[12px] hover:bg-win-soft`, onClick: () => i2(e3.id), children: [e3.name, ` (`,
    e3.title, `, `, e3.ext, `)`] }, e3.id)) }) : null] });
  }
  function $r({ win: e2 }) {
    let t2 = R((e3) => e3.closeWindow);
    return (0, z.jsx)(Bn, { win: e2, icon: (0, z.jsx)(Vn, { size: 16 }), buttons: [`close`], noResize: true, children: (0,
    z.jsxs)(`div`, { className: `flex h-full flex-col items-center justify-center gap-3 bg-white p-6 text-cent\
er`, children: [(0, z.jsx)(Vn, { size: 64 }), (0, z.jsxs)(`p`, { className: `text-[18px] font-bold`, children: [
    `CoolMessenger `, (0, z.jsx)(`span`, { className: `text-cm-red`, children: `GENTOO` })] }), (0, z.jsxs)(`p`,
    { className: `text-[12px] text-win-muted`, children: [`ver. `, Xt, ` · 해커톤 모의환경`] }), (0, z.
    jsxs)(`p`, { className: `max-w-sm text-[12px] leading-relaxed text-win-ink`, children: [Yt, ` 학내 메신저를 외부에서\
 시험할 수 있도록 만든 복제 화면입니다. 실제 교직원·학생 이름은 모두 가명 처리되어 있으며, 서버에 연결되지 않습니다.`] }),
    (0, z.jsx)(`button`, { type: `button`, className: `win-toolbar-btn primary px-6`, onClick: () => t2(e2.id),
    children: `확인` })] }) });
  }
  function ei({ win: e2 }) {
    let t2 = R((e3) => e3.fontScale), n2 = R((e3) => e3.setFontScale), r2 = R((e3) => e3.logout), i2 = R((e3) => e3.
    resetDemo), a2 = R((e3) => e3.closeWindow);
    return (0, z.jsx)(Bn, { win: e2, icon: (0, z.jsx)(Vn, { size: 16 }), buttons: [`close`], noResize: true, children: (0,
    z.jsxs)(`div`, { className: `flex h-full flex-col gap-4 bg-white p-5`, children: [(0, z.jsx)(`p`, { className: `\
text-[14px] font-semibold`, children: `환경설정` }), (0, z.jsxs)(`label`, { className: `text-[12px]`, children: [
    `글자 크기 `, t2, `%`, (0, z.jsx)(`input`, { type: `range`, min: 90, max: 130, value: t2, onChange: (e3) => n2(
    Number(e3.target.value)), className: `mt-1 block w-full` })] }), (0, z.jsxs)(`div`, { className: `mt-auto \
flex flex-wrap gap-2`, children: [(0, z.jsx)(`button`, { type: `button`, className: `win-toolbar-btn`, onClick: () => {
      i2(), a2(e2.id);
    }, children: `데모 초기화` }), (0, z.jsx)(`button`, { type: `button`, className: `win-toolbar-btn`, onClick: () => {
      r2();
    }, children: `로그아웃` })] })] }) });
  }
  function ti({ win: e2 }) {
    let t2 = en[e2.payload?.personId ?? ``], n2 = R((e3) => e3.openWindow), r2 = R((e3) => e3.closeWindow);
    return t2 ? (0, z.jsx)(Bn, { win: e2, icon: (0, z.jsx)(Vn, { size: 16 }), buttons: [`close`], noResize: true,
    children: (0, z.jsxs)(`div`, { className: `flex h-full flex-col gap-3 bg-white p-5`, children: [(0, z.jsxs)(
    `div`, { className: `flex items-center gap-3`, children: [(0, z.jsx)(Vn, { size: 56, variant: `avatar` }),
    (0, z.jsxs)(`div`, { children: [(0, z.jsx)(`p`, { className: `text-[16px] font-bold`, children: t2.name }),
    (0, z.jsxs)(`p`, { className: `text-[12px] text-win-muted`, children: [t2.title, ` · 내선 `, t2.ext, t2.
    room ? ` · ${t2.room}` : ``] })] })] }), (0, z.jsxs)(`dl`, { className: `grid grid-cols-[72px_1fr] gap-y-\
1 text-[12px]`, children: [(0, z.jsx)(`dt`, { className: `text-win-muted`, children: `상태` }), (0, z.jsx)(`\
dd`, { children: t2.status === `online` ? `온라인` : t2.status === `offline` ? `오프라인` : `PC` }), (0,
    z.jsx)(`dt`, { className: `text-win-muted`, children: `소속` }), (0, z.jsx)(`dd`, { children: Yt })] }),
    (0, z.jsx)(`button`, { type: `button`, className: `win-toolbar-btn primary mt-auto`, onClick: () => {
      r2(e2.id), n2(`compose`, `쪽지 보내기`, { to: t2.id });
    }, children: `쪽지 보내기` })] }) }) : null;
  }
  function ni({ win: e2 }) {
    let t2 = ln.find((t3) => t3.id === e2.payload?.id), n2 = R((e3) => e3.closeWindow);
    return t2 ? (0, z.jsx)(Bn, { win: e2, icon: (0, z.jsx)(Vn, { size: 16 }), buttons: [`close`], children: (0,
    z.jsxs)(`div`, { className: `flex h-full flex-col bg-white p-5`, children: [(0, z.jsx)(`p`, { className: `\
text-[15px] font-semibold`, children: t2.title }), (0, z.jsxs)(`p`, { className: `mt-1 text-[11px] text-win-mu\
ted`, children: [en[t2.fromId]?.name, ` · `, t2.dateLabel] }), (0, z.jsx)(`p`, { className: `mt-4 flex-1 text\
-[13px] leading-relaxed`, children: t2.body }), (0, z.jsx)(`button`, { type: `button`, className: `win-toolbar\
-btn self-end`, onClick: () => n2(e2.id), children: `닫기` })] }) }) : null;
  }
  function ri({ win: e2 }) {
    let t2 = R((e3) => e3.closeWindow);
    return (0, z.jsx)(Bn, { win: e2, icon: (0, z.jsx)(Vn, { size: 16 }), buttons: [`close`], noResize: true, children: (0,
    z.jsxs)(`div`, { className: `flex h-full flex-col items-center justify-center gap-4 bg-white p-6 text-cent\
er`, children: [(0, z.jsx)(Vn, { size: 40 }), (0, z.jsx)(`p`, { className: `whitespace-pre-line text-[13px] le\
ading-relaxed`, children: e2.payload?.text ?? e2.title }), (0, z.jsx)(`button`, { type: `button`, className: `\
win-toolbar-btn primary px-8`, onClick: () => t2(e2.id), children: `확인` })] }) });
  }
  var ii = null, ai = /* @__PURE__ */ new Set();
  function oi() {
    ai.forEach((e2) => e2());
  }
  function si() {
    return typeof navigator > `u` ? false : /iphone|ipad|ipod/i.test(navigator.userAgent);
  }
  function ci() {
    return typeof window > `u` ? false : window.matchMedia(`(display-mode: standalone)`).matches || `standalon\
e` in navigator && !!navigator.standalone;
  }
  function li() {
    let [, e2] = (0, S.useState)(0), [t2, n2] = (0, S.useState)(false), [r2, i2] = (0, S.useState)(false);
    (0, S.useEffect)(() => {
      n2(true), i2(!navigator.onLine);
      let t3 = () => e2((e3) => e3 + 1);
      ai.add(t3);
      let r3 = () => i2(!navigator.onLine);
      return window.addEventListener(`online`, r3), window.addEventListener(`offline`, r3), () => {
        ai.delete(t3), window.removeEventListener(`online`, r3), window.removeEventListener(`offline`, r3);
      };
    }, []);
    let a2 = t2 && ci();
    return { ready: t2, offline: r2, installed: a2, ios: t2 && si(), canInstall: t2 && !!ii && !a2, install: async () => {
      if (!ii) return false;
      await ii.prompt();
      let e3 = await ii.userChoice;
      return ii = null, oi(), e3.outcome === `accepted`;
    } };
  }
  function ui(e2, t2) {
    return { id: e2, kind: e2, title: t2, x: 0, y: 0, w: window.innerWidth, h: window.innerHeight, z: 1, minimized: false,
    maximized: true, payload: { host: `os` } };
  }
  function di() {
    let e2 = R((e3) => e3.windows), t2 = R((e3) => e3.toasts), n2 = R((e3) => e3.dismissToast), r2 = R((e3) => e3.
    loggedIn), i2 = R((e3) => e3.arriveDemo), a2 = R((e3) => e3.openWindow), o2 = R((e3) => e3.focusWindow), s2 = R(
    (e3) => e3.restoreWindow), c2 = li();
    (0, S.useEffect)(() => {
      let e3 = () => {
        R.getState().hydrate(), Ln();
      }, t3 = R.persist.rehydrate();
      t3 && typeof t3.then == `function` ? t3.then(e3) : e3();
    }, []), (0, S.useEffect)(() => {
      if (!r2 || vn() !== `main`) return;
      let e3 = window.setTimeout(() => i2(), 7e3);
      return () => window.clearTimeout(e3);
    }, [r2, i2]), (0, S.useEffect)(() => On(() => In()), []);
    let l2 = vn();
    if (l2 === `inbox`) return (0, z.jsx)(`div`, { className: `relative h-dvh w-full overflow-hidden bg-white`,
    children: (0, z.jsx)(Ir, { win: ui(`inbox`, `메시지 관리함`) }) });
    if (l2 === `compose`) return (0, z.jsx)(`div`, { className: `relative h-dvh w-full overflow-hidden bg-whit\
e`, children: (0, z.jsx)(Xr, { win: ui(`compose`, `메시지 보내기`) }) });
    let u2 = [...yn() ? e2.filter((e3) => e3.kind !== `inbox` && e3.kind !== `compose`) : e2].sort((e3, t3) => e3.
    z - t3.z);
    return (0, z.jsxs)(`div`, { className: `relative h-dvh w-full overflow-hidden bg-[#6eafd4]`, children: [(0,
    z.jsx)(`div`, { className: `pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#8bc4\
e0,_transparent_55%)]` }), u2.map((e3) => (0, z.jsx)(pi, { win: e3 }, e3.id)), (0, z.jsx)(`div`, { className: `\
absolute right-3 bottom-12 z-[90] flex w-[300px] max-w-[calc(100%-24px)] flex-col gap-2`, children: t2.map((e3) => (0,
    z.jsxs)(`button`, { type: `button`, className: `toast-in flex items-start gap-2 rounded-lg border border-w\
hite/40 bg-white/95 p-3 text-left shadow-win`, onClick: () => {
      n2(e3.id), a2(`inbox`, `메시지 관리함`);
    }, children: [(0, z.jsx)(Vn, { size: 28 }), (0, z.jsxs)(`span`, { className: `min-w-0`, children: [(0, z.jsx)(
    `span`, { className: `block text-[12px] font-semibold text-win-ink`, children: e3.title }), (0, z.jsx)(`sp\
an`, { className: `block text-[11px] leading-snug text-win-muted`, children: e3.body })] })] }, e3.id)) }), (0,
    z.jsxs)(`footer`, { className: `absolute inset-x-0 bottom-0 z-[80] flex h-9 items-center gap-2 border-t bo\
rder-white/30 bg-[#3b97cb] px-2 text-white`, children: [(0, z.jsx)(Vn, { size: 16 }), (0, z.jsx)(`span`, { className: `\
hidden text-[12px] font-semibold sm:inline`, children: `CoolMessenger GENTOO` }), (0, z.jsx)(`div`, { className: `\
flex min-w-0 flex-1 items-center gap-1 overflow-x-auto`, children: e2.filter((e3) => e3.kind !== `login`).map(
    (e3) => (0, z.jsx)(`button`, { type: `button`, className: zt(`h-6 shrink-0 rounded-sm px-2 text-[11px] hov\
er:bg-white/15`, !e3.minimized && `bg-white/20`), onClick: () => {
      s2(e3.id), o2(e3.id);
    }, children: e3.kind === `main` ? `메신저` : e3.kind === `inbox` ? `메시지` : e3.title }, e3.id)) }),
    c2.ready && c2.offline ? (0, z.jsxs)(`span`, { className: `flex items-center gap-1 text-[11px]`, children: [
    (0, z.jsx)(k, { className: `size-3.5` }), ` 오프라인`] }) : null, (0, z.jsx)(fi, {})] })] });
  }
  function fi() {
    return null;
  }
  function pi({ win: e2 }) {
    switch (e2.kind) {
      case `login`:
        return (0, z.jsx)(Un, { win: e2 });
      case `main`:
        return (0, z.jsx)(lr, { win: e2 });
      case `inbox`:
        return (0, z.jsx)(Ir, { win: e2 });
      case `compose`:
        return (0, z.jsx)(Xr, { win: e2 });
      case `about`:
        return (0, z.jsx)($r, { win: e2 });
      case `settings`:
        return (0, z.jsx)(ei, { win: e2 });
      case `person`:
        return (0, z.jsx)(ti, { win: e2 });
      case `notice`:
        return (0, z.jsx)(ni, { win: e2 });
      case `alert`:
        return (0, z.jsx)(ri, { win: e2 });
      default:
        return null;
    }
  }
  async function mi() {
    await Tn();
    let e2 = document.getElementById(`root`);
    e2 && (0, pe.createRoot)(e2).render((0, z.jsx)(di, {}));
  }
  mi();
})();
