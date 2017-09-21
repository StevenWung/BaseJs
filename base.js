var BaseJs = BaseJs || {};
BaseJs.Http = function (options) {
};
BaseJs.Http.prototype = {
    request: function (method, url, data, callback, failure) {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                var resp = this.responseText;
                if (callback != undefined) {
                    if (typeof resp == 'object') {
                        callback(resp);
                    } else {
                        callback(JSON.parse(resp));
                    }
                }

            } else {
                if (failure != undefined)
                    failure(this.responseText);
            }
        };
        var httpMethod = method.toLowerCase() == 'POST' ? 'POST' : 'GET';
        xhttp.open(httpMethod, url, true);
        xhttp.send();
    }
};
BaseJs.Ajax = function (options) {
    this.http = new BaseJs.Http();
    this.options = options || {};
    if (!options['url'])
        throw("Url must be set!");

};
BaseJs.Ajax.prototype = {
    get: function (param) {
        this.http.request('GET', this.options['url'], null, this.options['callback'] || function () {
        });
    },
    post: function (url, data) {
        this.http.request('POST', this.options['url'], data, this.options['callback'] || function () {
        });
    }
};
BaseJs.AjaxRender = function (options) {
    if (!options['id'])
        throw("Id must be set!");
    this.parser = new DOMParser();
    this.ajax = new BaseJs.Ajax(options);
    this.options = options;
};
BaseJs.AjaxRender.prototype = {
    render: function () {
        var $this = this;
        var respSchema = this.options['schema'] || 'result';
        this.ajax.options.callback = function (resp) {
            var r = resp;
            respSchema.split('.').forEach(function (t) {
                r = r[t];
            });
            if (!r || !Array.isArray(r)) {
                //
            }
            var dom = document.getElementById($this.options['id']), doms = [];
            var html = dom.outerHTML, output = '';
            var reg = new RegExp('##([a-z|A-Z|0-9|-|_]+)##', 'ig');
            var res = html.match(reg);
            r.forEach(function (rr) {
                var tmp = html, ele, child;
                res.forEach(function (rss) {
                    var v = rr[rss.replace(/#/g, '')];
                    tmp = tmp.replace(rss, v);
                });
                ele = $this.parser.parseFromString(tmp, "text/html");
                child = ele.documentElement.querySelector('body').firstChild;
                doms.push(child);
            });
            doms.forEach(function (t) { dom.parentNode.appendChild(t); })
            dom.style.display = 'none';


        };
        this.ajax.get()
    }
};
BaseJs.Form = function () {

};
BaseJs.Form.prototype = {};