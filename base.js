var BaseJs = BaseJs || {};
BaseJs.Http = function (options) {
};
BaseJs.Http.prototype = {
    request: function (method, url, data, callback, failure) {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                var resp = this.responseText;
                if (callback != undefined)
                    callback(resp);
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

};
BaseJs.Ajax.prototype = {
    get: function (url, callback) {
        this.http.request('GET', url, null, this.options['callback'] || function () {
        });
    },
    post: function (url, data, callback) {
        this.http.request('POST', url, data, this.options['callback'] || function () {
        });
    }
};
BaseJs.AjaxRender = function (options) {
    if (!options['url'])
        throw("Url must be set!");
    if (!options['id'])
        throw("Id must be set!");
    this.ajax = new BaseJs.Ajax({
        'url': options
    });
    this.options = options;
};
BaseJs.AjaxRender.prototype = {
    render: function () {
        this.ajax.
    }
};
BaseJs.Form = function () {

};
BaseJs.Form.prototype = {};