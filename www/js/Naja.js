/*
 * Naja.js
 * 2.3.0
 *
 * by Jiří Pudil <https://jiripudil.cz>
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.naja = factory());
})(this, (function () { 'use strict';

    // ready
    const onDomReady = (callback) => {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        }
        else {
            callback();
        }
    };
    // assert
    class AssertionError extends Error {
    }
    const assert = (condition, description) => {
        if (!condition) {
            const message = `Assertion failed${description !== undefined ? `: ${description}` : '.'}`;
            throw new AssertionError(message);
        }
    };

    class UIHandler extends EventTarget {
        constructor(naja) {
            super();
            this.naja = naja;
            this.selector = '.ajax';
            this.allowedOrigins = [window.location.origin];
            this.handler = this.handleUI.bind(this);
            naja.addEventListener('init', this.initialize.bind(this));
        }
        initialize() {
            onDomReady(() => this.bindUI(window.document.body));
            this.naja.snippetHandler.addEventListener('afterUpdate', (event) => {
                const { snippet } = event.detail;
                this.bindUI(snippet);
            });
        }
        bindUI(element) {
            const selectors = [
                `a${this.selector}`,
                `input[type="submit"]${this.selector}`,
                `input[type="image"]${this.selector}`,
                `button[type="submit"]${this.selector}`,
                `form${this.selector} input[type="submit"]`,
                `form${this.selector} input[type="image"]`,
                `form${this.selector} button[type="submit"]`,
            ].join(', ');
            const bindElement = (element) => {
                element.removeEventListener('click', this.handler);
                element.addEventListener('click', this.handler);
            };
            const elements = element.querySelectorAll(selectors);
            for (let i = 0; i < elements.length; i++) {
                bindElement(elements.item(i));
            }
            if (element.matches(selectors)) {
                bindElement(element);
            }
            const bindForm = (form) => {
                form.removeEventListener('submit', this.handler);
                form.addEventListener('submit', this.handler);
            };
            if (element.matches(`form${this.selector}`)) {
                bindForm(element);
            }
            const forms = element.querySelectorAll(`form${this.selector}`);
            for (let i = 0; i < forms.length; i++) {
                bindForm(forms.item(i));
            }
        }
        handleUI(event) {
            console.log(event);
            const mouseEvent = event;
            if (mouseEvent.altKey || mouseEvent.ctrlKey || mouseEvent.shiftKey || mouseEvent.metaKey || mouseEvent.button) {
                return;
            }
            const element = event.currentTarget;
            const options = {};
            const ignoreErrors = () => {
                // don't reject the promise in case of an error as developers have no way of handling the rejection
                // in this situation; errors should be handled in `naja.addEventListener('error', errorHandler)`
            };
            if (event.type === 'submit') {
                this.submitForm(element, options, event).catch(ignoreErrors);
            }
            else if (event.type === 'click') {
                this.clickElement(element, options, mouseEvent).catch(ignoreErrors);
            }
        }
        async clickElement(element, options = {}, event) {
            console.log(element);
            var _a, _b, _c, _d, _e, _f;
            let method = 'GET', url = '', data;
            if (!this.dispatchEvent(new CustomEvent('interaction', { cancelable: true, detail: { element, originalEvent: event, options } }))) {
                event === null || event === void 0 ? void 0 : event.preventDefault();
                return {};
            }
            if (element.tagName === 'A') {
                assert(element instanceof HTMLAnchorElement);
                method = 'GET';
                url = element.href;
                data = null;
            }
            else if (element.tagName === 'INPUT' || element.tagName === 'BUTTON') {
                assert(element instanceof HTMLInputElement || element instanceof HTMLButtonElement);
                const { form } = element;
                // eslint-disable-next-line no-nested-ternary,no-extra-parens
                method = (_d = (_b = (_a = element.getAttribute('formmethod')) === null || _a === void 0 ? void 0 : _a.toUpperCase()) !== null && _b !== void 0 ? _b : (_c = form === null || form === void 0 ? void 0 : form.getAttribute('method')) === null || _c === void 0 ? void 0 : _c.toUpperCase()) !== null && _d !== void 0 ? _d : 'GET';
                url = (_f = (_e = element.getAttribute('formaction')) !== null && _e !== void 0 ? _e : form === null || form === void 0 ? void 0 : form.getAttribute('action')) !== null && _f !== void 0 ? _f : window.location.pathname + window.location.search;
                data = new FormData(form !== null && form !== void 0 ? form : undefined);
                if (element.type === 'submit' && element.name !== '') {
                    data.append(element.name, element.value || '');
                }
                else if (element.type === 'image') {
                    const coords = element.getBoundingClientRect();
                    const prefix = element.name !== '' ? `${element.name}.` : '';
                    data.append(`${prefix}x`, Math.max(0, Math.floor(event !== undefined ? event.pageX - coords.left : 0)));
                    data.append(`${prefix}y`, Math.max(0, Math.floor(event !== undefined ? event.pageY - coords.top : 0)));
                }
            }
            if (!this.isUrlAllowed(url)) {
                throw new Error(`Cannot dispatch async request, URL is not allowed: ${url}`);
            }
            event === null || event === void 0 ? void 0 : event.preventDefault();
            return this.naja.makeRequest(method, url, data, options);
        }
        async submitForm(form, options = {}, event) {
            var _a, _b, _c;
            if (!this.dispatchEvent(new CustomEvent('interaction', { cancelable: true, detail: { element: form, originalEvent: event, options } }))) {
                event === null || event === void 0 ? void 0 : event.preventDefault();
                return {};
            }
            const method = (_b = (_a = form.getAttribute('method')) === null || _a === void 0 ? void 0 : _a.toUpperCase()) !== null && _b !== void 0 ? _b : 'GET';
            const url = (_c = form.getAttribute('action')) !== null && _c !== void 0 ? _c : window.location.pathname + window.location.search;
            const data = new FormData(form);
            if (!this.isUrlAllowed(url)) {
                throw new Error(`Cannot dispatch async request, URL is not allowed: ${url}`);
            }
            event === null || event === void 0 ? void 0 : event.preventDefault();
            return this.naja.makeRequest(method, url, data, options);
        }
        isUrlAllowed(url) {
            const urlObject = new URL(url, location.href);
            // ignore non-URL URIs (javascript:, data:, mailto:, ...)
            if (urlObject.origin === 'null') {
                return false;
            }
            return this.allowedOrigins.includes(urlObject.origin);
        }
    }

    class FormsHandler {
        constructor(naja) {
            this.naja = naja;
            naja.addEventListener('init', this.initialize.bind(this));
            naja.uiHandler.addEventListener('interaction', this.processForm.bind(this));
        }
        initialize() {
            onDomReady(() => this.initForms(window.document.body));
            this.naja.snippetHandler.addEventListener('afterUpdate', (event) => {
                const { snippet } = event.detail;
                this.initForms(snippet);
            });
        }
        initForms(element) {
            const netteForms = this.netteForms || window.Nette;
            if (netteForms) {
                if (element.tagName === 'form') {
                    netteForms.initForm(element);
                }
                const forms = element.querySelectorAll('form');
                for (let i = 0; i < forms.length; i++) {
                    netteForms.initForm(forms.item(i));
                }
            }
        }
        processForm(event) {
            const { element, originalEvent } = event.detail;
            const inputElement = element;
            if (inputElement.form !== undefined && inputElement.form !== null) {
                inputElement.form['nette-submittedBy'] = element;
            }
            const netteForms = this.netteForms || window.Nette;
            if ((element.tagName === 'FORM' || element.form) && netteForms && !netteForms.validateForm(element)) {
                if (originalEvent) {
                    originalEvent.stopImmediatePropagation();
                    originalEvent.preventDefault();
                }
                event.preventDefault();
            }
        }
    }

    class RedirectHandler extends EventTarget {
        constructor(naja) {
            super();
            this.naja = naja;
            naja.uiHandler.addEventListener('interaction', (event) => {
                var _a, _b, _c;
                const { element, options } = event.detail;
                if (!element) {
                    return;
                }
                if (element.hasAttribute('data-naja-force-redirect') || ((_a = element.form) === null || _a === void 0 ? void 0 : _a.hasAttribute('data-naja-force-redirect'))) {
                    const value = (_b = element.getAttribute('data-naja-force-redirect')) !== null && _b !== void 0 ? _b : (_c = element.form) === null || _c === void 0 ? void 0 : _c.getAttribute('data-naja-force-redirect');
                    options.forceRedirect = value !== 'off';
                }
            });
            naja.addEventListener('success', (event) => {
                var _a;
                const { payload, options } = event.detail;
                if (payload.redirect) {
                    this.makeRedirect(payload.redirect, (_a = options.forceRedirect) !== null && _a !== void 0 ? _a : false, options);
                    event.stopImmediatePropagation();
                }
            });
            this.locationAdapter = {
                assign: (url) => window.location.assign(url),
            };
        }
        makeRedirect(url, force, options = {}) {
            if (url instanceof URL) {
                url = url.href;
            }
            let isHardRedirect = force || !this.naja.uiHandler.isUrlAllowed(url);
            const canRedirect = this.dispatchEvent(new CustomEvent('redirect', {
                cancelable: true,
                detail: {
                    url,
                    isHardRedirect,
                    setHardRedirect(value) {
                        isHardRedirect = !!value;
                    },
                    options,
                },
            }));
            if (!canRedirect) {
                return;
            }
            if (isHardRedirect) {
                this.locationAdapter.assign(url);
            }
            else {
                this.naja.makeRequest('GET', url, null, options);
            }
        }
    }

    class SnippetHandler extends EventTarget {
        constructor(naja) {
            super();
            this.naja = naja;
            this.op = {
                replace: (snippet, content) => {
                    snippet.innerHTML = content;
                },
                prepend: (snippet, content) => snippet.insertAdjacentHTML('afterbegin', content),
                append: (snippet, content) => snippet.insertAdjacentHTML('beforeend', content),
            };
            naja.addEventListener('success', (event) => {
                const { options, payload } = event.detail;
                if (payload.snippets) {
                    this.updateSnippets(payload.snippets, false, options);
                }
            });
        }
        static findSnippets(predicate) {
            var _a;
            const result = {};
            const snippets = window.document.querySelectorAll('[id^="snippet-"]');
            for (let i = 0; i < snippets.length; i++) {
                const snippet = snippets.item(i);
                if ((_a = predicate === null || predicate === void 0 ? void 0 : predicate(snippet)) !== null && _a !== void 0 ? _a : true) {
                    result[snippet.id] = snippet.innerHTML;
                }
            }
            return result;
        }
        updateSnippets(snippets, fromCache = false, options = {}) {
            Object.keys(snippets).forEach((id) => {
                const snippet = document.getElementById(id);
                if (snippet) {
                    this.updateSnippet(snippet, snippets[id], fromCache, options);
                }
            });
        }
        updateSnippet(snippet, content, fromCache, options) {
            let operation = this.op.replace;
            if ((snippet.hasAttribute('data-naja-snippet-prepend') || snippet.hasAttribute('data-ajax-prepend')) && !fromCache) {
                operation = this.op.prepend;
            }
            else if ((snippet.hasAttribute('data-naja-snippet-append') || snippet.hasAttribute('data-ajax-append')) && !fromCache) {
                operation = this.op.append;
            }
            const canUpdate = this.dispatchEvent(new CustomEvent('beforeUpdate', {
                cancelable: true,
                detail: {
                    snippet,
                    content,
                    fromCache,
                    operation,
                    changeOperation(value) {
                        operation = value;
                    },
                    options,
                },
            }));
            if (!canUpdate) {
                return;
            }
            if (snippet.tagName.toLowerCase() === 'title') {
                document.title = content;
            }
            else {
                operation(snippet, content);
            }
            this.dispatchEvent(new CustomEvent('afterUpdate', {
                cancelable: true,
                detail: {
                    snippet,
                    content,
                    fromCache,
                    operation,
                    options,
                },
            }));
        }
    }

    class HistoryHandler extends EventTarget {
        constructor(naja) {
            super();
            this.naja = naja;
            this.href = null;
            this.popStateHandler = this.handlePopState.bind(this);
            naja.addEventListener('init', this.initialize.bind(this));
            naja.addEventListener('before', this.saveUrl.bind(this));
            naja.addEventListener('success', this.pushNewState.bind(this));
            naja.uiHandler.addEventListener('interaction', this.configureMode.bind(this));
            this.historyAdapter = {
                replaceState: (state, title, url) => window.history.replaceState(state, title, url),
                pushState: (state, title, url) => window.history.pushState(state, title, url),
            };
        }
        set uiCache(value) {
            console.warn('Naja: HistoryHandler.uiCache is deprecated, use options.snippetCache instead.');
            this.naja.defaultOptions.snippetCache = value;
        }
        initialize(event) {
            const { defaultOptions } = event.detail;
            window.addEventListener('popstate', this.popStateHandler);
            onDomReady(() => this.historyAdapter.replaceState(this.buildState(window.location.href, defaultOptions), window.document.title, window.location.href));
        }
        handlePopState(event) {
            const { state } = event;
            if (!state) {
                return;
            }
            const options = this.naja.prepareOptions();
            this.dispatchEvent(new CustomEvent('restoreState', { detail: { state, options } }));
        }
        saveUrl(event) {
            const { url } = event.detail;
            this.href = url;
        }
        configureMode(event) {
            var _a, _b, _c;
            const { element, options } = event.detail;
            // propagate mode to options
            if (!element) {
                return;
            }
            if (element.hasAttribute('data-naja-history') || ((_a = element.form) === null || _a === void 0 ? void 0 : _a.hasAttribute('data-naja-history'))) {
                const value = (_b = element.getAttribute('data-naja-history')) !== null && _b !== void 0 ? _b : (_c = element.form) === null || _c === void 0 ? void 0 : _c.getAttribute('data-naja-history');
                options.history = HistoryHandler.normalizeMode(value);
            }
        }
        static normalizeMode(mode) {
            if (mode === 'off' || mode === false) {
                return false;
            }
            else if (mode === 'replace') {
                return 'replace';
            }
            return true;
        }
        pushNewState(event) {
            const { payload, options } = event.detail;
            const mode = HistoryHandler.normalizeMode(options.history);
            if (mode === false) {
                return;
            }
            if (payload.postGet && payload.url) {
                this.href = payload.url;
            }
            const method = mode === 'replace' ? 'replaceState' : 'pushState';
            this.historyAdapter[method](this.buildState(this.href, options), window.document.title, this.href);
            this.href = null;
        }
        buildState(href, options) {
            const state = { href };
            this.dispatchEvent(new CustomEvent('buildState', { detail: { state, options } }));
            return state;
        }
    }

    class SnippetCache extends EventTarget {
        constructor(naja) {
            super();
            this.naja = naja;
            this.storages = {
                off: new OffCacheStorage(naja),
                history: new HistoryCacheStorage(),
                session: new SessionCacheStorage(),
            };
            naja.uiHandler.addEventListener('interaction', this.configureCache.bind(this));
            naja.historyHandler.addEventListener('buildState', this.buildHistoryState.bind(this));
            naja.historyHandler.addEventListener('restoreState', this.restoreHistoryState.bind(this));
        }
        resolveStorage(option) {
            let storageType;
            if (option === true || option === undefined) {
                storageType = 'history';
            }
            else if (option === false) {
                storageType = 'off';
            }
            else {
                storageType = option;
            }
            return this.storages[storageType];
        }
        configureCache(event) {
            var _a, _b, _c, _d, _e, _f, _g;
            const { element, options } = event.detail;
            if (!element) {
                return;
            }
            if (element.hasAttribute('data-naja-snippet-cache') || ((_a = element.form) === null || _a === void 0 ? void 0 : _a.hasAttribute('data-naja-snippet-cache'))
                || element.hasAttribute('data-naja-history-cache') || ((_b = element.form) === null || _b === void 0 ? void 0 : _b.hasAttribute('data-naja-history-cache'))) {
                const value = (_f = (_e = (_c = element.getAttribute('data-naja-snippet-cache')) !== null && _c !== void 0 ? _c : (_d = element.form) === null || _d === void 0 ? void 0 : _d.getAttribute('data-naja-snippet-cache')) !== null && _e !== void 0 ? _e : element.getAttribute('data-naja-history-cache')) !== null && _f !== void 0 ? _f : (_g = element.form) === null || _g === void 0 ? void 0 : _g.getAttribute('data-naja-history-cache');
                options.snippetCache = value;
            }
        }
        buildHistoryState(event) {
            const { state, options } = event.detail;
            if ('historyUiCache' in options) {
                console.warn('Naja: options.historyUiCache is deprecated, use options.snippetCache instead.');
                options.snippetCache = options.historyUiCache;
            }
            const snippets = SnippetHandler.findSnippets((snippet) => !snippet.hasAttribute('data-naja-history-nocache')
                && !snippet.hasAttribute('data-history-nocache')
                && (!snippet.hasAttribute('data-naja-snippet-cache')
                    || snippet.getAttribute('data-naja-snippet-cache') !== 'off'));
            if (!this.dispatchEvent(new CustomEvent('store', { cancelable: true, detail: { snippets, state, options } }))) {
                return;
            }
            const storage = this.resolveStorage(options.snippetCache);
            state.snippets = {
                storage: storage.type,
                key: storage.store(snippets),
            };
        }
        restoreHistoryState(event) {
            const { state, options } = event.detail;
            if (state.snippets === undefined) {
                return;
            }
            options.snippetCache = state.snippets.storage;
            if (!this.dispatchEvent(new CustomEvent('fetch', { cancelable: true, detail: { state, options } }))) {
                return;
            }
            const storage = this.resolveStorage(options.snippetCache);
            const snippets = storage.fetch(state.snippets.key, state, options);
            if (snippets === null) {
                return;
            }
            if (!this.dispatchEvent(new CustomEvent('restore', { cancelable: true, detail: { snippets, state, options } }))) {
                return;
            }
            this.naja.snippetHandler.updateSnippets(snippets, true, options);
            this.naja.scriptLoader.loadScripts(snippets);
        }
    }
    class OffCacheStorage {
        constructor(naja) {
            this.naja = naja;
            this.type = 'off';
        } // eslint-disable-line no-empty-function
        store() {
            return null;
        }
        fetch(key, state, options) {
            this.naja.makeRequest('GET', state.href, null, Object.assign(Object.assign({}, options), { history: false, snippetCache: false }));
            return null;
        }
    }
    class HistoryCacheStorage {
        constructor() {
            this.type = 'history';
        }
        store(data) {
            return data;
        }
        fetch(key) {
            return key;
        }
    }
    class SessionCacheStorage {
        constructor() {
            this.type = 'session';
        }
        store(data) {
            const key = Math.random().toString(36).substr(2, 6);
            window.sessionStorage.setItem(key, JSON.stringify(data));
            return key;
        }
        fetch(key) {
            const data = window.sessionStorage.getItem(key);
            if (data === null) {
                return null;
            }
            return JSON.parse(data);
        }
    }

    class ScriptLoader {
        constructor(naja) {
            this.loadedScripts = new Set();
            naja.addEventListener('init', () => {
                onDomReady(() => {
                    document.querySelectorAll('script[data-naja-script-id]').forEach((script) => {
                        const scriptId = script.getAttribute('data-naja-script-id');
                        if (scriptId !== null && scriptId !== '') {
                            this.loadedScripts.add(scriptId);
                        }
                    });
                });
                naja.addEventListener('success', (event) => {
                    const { payload } = event.detail;
                    if (payload.snippets) {
                        this.loadScripts(payload.snippets);
                    }
                });
            });
        }
        loadScripts(snippets) {
            Object.keys(snippets).forEach((id) => {
                const content = snippets[id];
                if (!/<script/i.test(content)) {
                    return;
                }
                const el = window.document.createElement('div');
                el.innerHTML = content;
                const scripts = el.querySelectorAll('script');
                for (let i = 0; i < scripts.length; i++) {
                    const script = scripts.item(i);
                    const scriptId = script.getAttribute('data-naja-script-id');
                    if (scriptId !== null && scriptId !== '' && this.loadedScripts.has(scriptId)) {
                        continue;
                    }
                    const scriptEl = window.document.createElement('script');
                    scriptEl.innerHTML = script.innerHTML;
                    if (script.hasAttributes()) {
                        const attrs = script.attributes;
                        for (let j = 0; j < attrs.length; j++) {
                            const attrName = attrs[j].name;
                            scriptEl.setAttribute(attrName, attrs[j].value);
                        }
                    }
                    window.document.head.appendChild(scriptEl)
                        .parentNode.removeChild(scriptEl);
                    if (scriptId !== null && scriptId !== '') {
                        this.loadedScripts.add(scriptId);
                    }
                }
            });
        }
    }

    class Naja extends EventTarget {
        constructor(uiHandler, redirectHandler, snippetHandler, formsHandler, historyHandler, snippetCache, scriptLoader) {
            super();
            this.VERSION = 2;
            this.initialized = false;
            this.extensions = [];
            this.defaultOptions = {};
            this.uiHandler = new (uiHandler !== null && uiHandler !== void 0 ? uiHandler : UIHandler)(this);
            this.redirectHandler = new (redirectHandler !== null && redirectHandler !== void 0 ? redirectHandler : RedirectHandler)(this);
            this.snippetHandler = new (snippetHandler !== null && snippetHandler !== void 0 ? snippetHandler : SnippetHandler)(this);
            this.formsHandler = new (formsHandler !== null && formsHandler !== void 0 ? formsHandler : FormsHandler)(this);
            this.historyHandler = new (historyHandler !== null && historyHandler !== void 0 ? historyHandler : HistoryHandler)(this);
            this.snippetCache = new (snippetCache !== null && snippetCache !== void 0 ? snippetCache : SnippetCache)(this);
            this.scriptLoader = new (scriptLoader !== null && scriptLoader !== void 0 ? scriptLoader : ScriptLoader)(this);
        }
        registerExtension(extension) {
            if (this.initialized) {
                extension.initialize(this);
            }
            this.extensions.push(extension);
        }
        initialize(defaultOptions = {}) {
            if (this.initialized) {
                throw new Error('Cannot initialize Naja, it is already initialized.');
            }
            this.defaultOptions = this.prepareOptions(defaultOptions);
            this.extensions.forEach((extension) => extension.initialize(this));
            this.dispatchEvent(new CustomEvent('init', { detail: { defaultOptions: this.defaultOptions } }));
            this.initialized = true;
        }
        prepareOptions(options) {
            return Object.assign(Object.assign(Object.assign({}, this.defaultOptions), options), { fetch: Object.assign(Object.assign({}, this.defaultOptions.fetch), options === null || options === void 0 ? void 0 : options.fetch) });
        }
        async makeRequest(method, url, data = null, options = {}) {
            // normalize url to instanceof URL
            if (typeof url === 'string') {
                url = new URL(url, location.href);
            }
            options = this.prepareOptions(options);
            const headers = new Headers(options.fetch.headers || {});
            const body = this.transformData(url, method, data);
            const abortController = new AbortController();
            const request = new Request(url.toString(), Object.assign(Object.assign({ credentials: 'same-origin' }, options.fetch), { method,
                headers,
                body, signal: abortController.signal }));
            // impersonate XHR so that Nette can detect isAjax()
            request.headers.set('X-Requested-With', 'XMLHttpRequest');
            // hint the server that Naja expects response to be JSON
            request.headers.set('Accept', 'application/json');
            if (!this.dispatchEvent(new CustomEvent('before', { cancelable: true, detail: { request, method, url: url.toString(), data, options } }))) {
                return {};
            }
            const promise = window.fetch(request);
            this.dispatchEvent(new CustomEvent('start', { detail: { request, promise, abortController, options } }));
            let response, payload;
            try {
                response = await promise;
                if (!response.ok) {
                    throw new HttpError(response);
                }
                payload = await response.json();
            }
            catch (error) {
                if (error.name === 'AbortError') {
                    this.dispatchEvent(new CustomEvent('abort', { detail: { request, error, options } }));
                    this.dispatchEvent(new CustomEvent('complete', { detail: { request, response, payload: undefined, error, options } }));
                    return {};
                }
                this.dispatchEvent(new CustomEvent('error', { detail: { request, response, error, options } }));
                this.dispatchEvent(new CustomEvent('complete', { detail: { request, response, payload: undefined, error, options } }));
                throw error;
            }
            this.dispatchEvent(new CustomEvent('success', { detail: { request, response, payload, options } }));
            this.dispatchEvent(new CustomEvent('complete', { detail: { request, response, payload, error: undefined, options } }));
            return payload;
        }
        appendToQueryString(searchParams, key, value) {
            if (value === null || value === undefined) {
                return;
            }
            if (Array.isArray(value) || Object.getPrototypeOf(value) === Object.prototype) {
                for (const [subkey, subvalue] of Object.entries(value)) {
                    this.appendToQueryString(searchParams, `${key}[${subkey}]`, subvalue);
                }
            }
            else {
                searchParams.append(key, String(value));
            }
        }
        transformData(url, method, data) {
            const isGet = ['GET', 'HEAD'].includes(method.toUpperCase());
            // sending a form via GET -> serialize FormData into URL and return empty request body
            if (isGet && data instanceof FormData) {
                for (const [key, value] of data) {
                    if (value !== null && value !== undefined) {
                        url.searchParams.append(key, String(value));
                    }
                }
                return null;
            }
            // sending a POJO -> serialize it recursively into URLSearchParams
            const isDataPojo = data !== null && Object.getPrototypeOf(data) === Object.prototype;
            if (isDataPojo || Array.isArray(data)) {
                // for GET requests, append values to URL and return empty request body
                // otherwise build `new URLSearchParams()` to act as the request body
                const transformedData = isGet ? url.searchParams : new URLSearchParams();
                for (const [key, value] of Object.entries(data)) {
                    this.appendToQueryString(transformedData, key, value);
                }
                return isGet
                    ? null
                    : transformedData;
            }
            return data;
        }
    }
    class HttpError extends Error {
        constructor(response) {
            const message = `HTTP ${response.status}: ${response.statusText}`;
            super(message);
            this.name = this.constructor.name;
            this.stack = new Error(message).stack;
            this.response = response;
        }
    }

    class AbortExtension {
        constructor() {
            this.abortable = true;
            this.abortController = null;
        }
        initialize(naja) {
            naja.uiHandler.addEventListener('interaction', this.checkAbortable.bind(this));
            naja.addEventListener('init', this.onInitialize.bind(this));
            naja.addEventListener('before', this.checkAbortable.bind(this));
            naja.addEventListener('start', this.saveAbortController.bind(this));
            naja.addEventListener('complete', this.clearAbortController.bind(this));
        }
        onInitialize() {
            document.addEventListener('keydown', (event) => {
                if (this.abortController !== null
                    && event.key === 'Escape'
                    && !(event.ctrlKey || event.shiftKey || event.altKey || event.metaKey)
                    && this.abortable) {
                    this.abortController.abort();
                    this.abortController = null;
                }
            });
        }
        checkAbortable(event) {
            var _a, _b;
            const { options } = event.detail;
            this.abortable = 'element' in event.detail
                ? ((_a = event.detail.element.getAttribute('data-naja-abort')) !== null && _a !== void 0 ? _a : (_b = event.detail.element.form) === null || _b === void 0 ? void 0 : _b.getAttribute('data-naja-abort')) !== 'off' // eslint-disable-line no-extra-parens
                : options.abort !== false;
            // propagate to options if called in interaction event
            options.abort = this.abortable;
        }
        saveAbortController(event) {
            const { abortController } = event.detail;
            this.abortController = abortController;
        }
        clearAbortController() {
            this.abortController = null;
            this.abortable = true;
        }
    }

    class UniqueExtension {
        constructor() {
            this.abortControllers = new Map();
        }
        initialize(naja) {
            naja.uiHandler.addEventListener('interaction', this.checkUniqueness.bind(this));
            naja.addEventListener('start', this.abortPreviousRequest.bind(this));
            naja.addEventListener('complete', this.clearRequest.bind(this));
        }
        checkUniqueness(event) {
            var _a, _b;
            const { element, options } = event.detail;
            const unique = (_a = element.getAttribute('data-naja-unique')) !== null && _a !== void 0 ? _a : (_b = element.form) === null || _b === void 0 ? void 0 : _b.getAttribute('data-naja-unique');
            options.unique = unique === 'off' ? false : unique !== null && unique !== void 0 ? unique : 'default';
        }
        abortPreviousRequest(event) {
            var _a, _b, _c;
            const { abortController, options } = event.detail;
            if (options.unique !== false) {
                (_b = this.abortControllers.get((_a = options.unique) !== null && _a !== void 0 ? _a : 'default')) === null || _b === void 0 ? void 0 : _b.abort();
                this.abortControllers.set((_c = options.unique) !== null && _c !== void 0 ? _c : 'default', abortController);
            }
        }
        clearRequest(event) {
            var _a;
            const { request, options } = event.detail;
            if (!request.signal.aborted && options.unique !== false) {
                this.abortControllers.delete((_a = options.unique) !== null && _a !== void 0 ? _a : 'default');
            }
        }
    }

    const naja = new Naja();
    naja.registerExtension(new AbortExtension());
    naja.registerExtension(new UniqueExtension());
    naja.Naja = Naja;
    naja.HttpError = HttpError;

    return naja;

}));
//# sourceMappingURL=Naja.js.map
