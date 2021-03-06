window.voi = (function (_w, _d) {
    'use strict';
    function randomInt() {
        return parseInt(Math.random() * 100000);
    }

    _w._ = function (d) {
        if ((new RegExp(/#/g)).test(d)) {
            //id
            return _d.getElementById(d.replace('#')) || null;
        } else if ((new RegExp(/@/g)).test(d)) {
            //tag
            return _d.getElementsByTagName(d.replace('@')) || null;
        } else if ((new RegExp(/$/g)).test(d)) {
            //class
            return _d.getElementsByTagName(d.replace('$')) || null;
        } else {
            return _d.getElementsByTagName(d) || null;
        }
    };
    _w._log = function (d) {
        console.log(d);
    };
    _w.getJsonData = function (schema, data) {
        var temp = data;
        schema.split('.').forEach(function (t, m, n) {
            if (t.indexOf('[') !== -1) {
                var res = t.split(/\[|\]/);
                if (res.length) {
                    var d = res[0], i = parseInt(res[1]);
                    temp = temp[d][i]
                }
            } else {
                temp = temp[t];
            }
            //console.log(temp);
        });
        return temp;
    }
    var Voi = Voi || {};
    Voi = function () {

    };
    Voi.Http = (function () {
        function Http(options) {
            this.headers = [];
        }

        Http.prototype = {
            request: function (method, url, data, callback, failure) {
                var xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function () {
                    if (this.readyState === 4 && this.status === 200) {
                        var resp = this.responseText;
                        if (callback !== undefined) {
                            if (typeof resp === 'object') {
                                callback(resp);
                            } else {
                                try {
                                    resp = JSON.parse(resp)

                                }catch (e){
                                    console.log(e);
                                }
                                callback(resp);
                            }
                        }

                    } else {
                        if (failure !== undefined)
                            failure(this.responseText);
                    }
                };
                var httpMethod = method.toLowerCase() === 'post' ? 'POST' : 'GET';
                xhttp.open(httpMethod, url, true);
                xhttp.setRequestHeader("AJAX-FORWORD-BASEPHP", "ENCODED-FOR-BASE");
                this.headers.forEach(function (k) {
                    for (var i in k) {
                        xhttp.setRequestHeader(i, k[i]);
                    }
                });
                xhttp.send(data);
            }
        };
        return Http;
    })();

    Voi.Ajax = (function () {
        function Ajax(options) {
            this.http = new Voi.Http();
            this.options = options || {};
            if (!options['url'])
                throw("Url must be set!");

            this.handleResponse = function (resp) {
                var alert = alert_sys_call || alert;
                var callback = options['callback']||function(){};
                var cmd = resp.cmd;
                if (cmd === 'alert'){
                    alert(resp.msg)
                }
                callback(resp);
            }

        }


        Ajax.prototype = {
            get: function (param) {
                this.http.request('GET', this.options['url'], null, this.handleResponse);
            },
            post: function (data) {
                this.http.request('POST', this.options['url'], data, this.handleResponse);
            },
            setContentType: function (k) {
                if (k === 'form')
                    this.http.headers.push({
                        "Content-type": "application/x-www-form-urlencoded"
                    })
                return this;
            }
        }
        return Ajax;
    })();
    Voi.AjaxRender = (function () {
        function AjaxRender(options) {
            this.parser = new DOMParser();
            this.ajax = new Voi.Ajax(options);
            this.options = options;
            this.id = 'ajaxrender_' + randomInt();
            this.pagerid = 'pager_' + randomInt();
        }

        AjaxRender.prototype = {
            render: function () {
                var $this = this;
                var respSchema = this.options['schema'] || 'result';
                $this.options.element.style.display = 'none';
                this.ajax.options.callback = function (resp) {
                    var r = resp, rev_r = null;
                    respSchema.split('.').forEach(function (t, m, n) {
                        r = r[t];
                        if (m + 1 === n.length - 1)
                            rev_r = r;
                    });

                    if (!r || !Array.isArray(r)) {
                        //
                    }
                    var dom = $this.options.element, doms = [], layer = 1;
                    var html = dom.outerHTML, output = '';
                    var reg = new RegExp('\\[\\[([a-z|A-Z|0-9|-|_]+)\\]\\]', 'ig');
                    var res = html.match(reg);
                    r.forEach(function (rr) {
                        var fn = _w[$this.options['beforeeach']];
                        if (typeof fn === 'function') {
                            rr = fn(r, rr);
                        }

                        var tmp = html, ele, child;
                        tmp = tmp.replace(/\\[\\[layer\\]\\]/g, layer);
                        res.forEach(function (rss) {
                            var v = rr[rss.replace(/\[|\]/g, '')];
                            if (v)
                                tmp = tmp.replace(rss, v);
                        });
                        ele = $this.parser.parseFromString(tmp, "text/html");
                        child = ele.documentElement.querySelector('body').firstChild;
                        child.setAttribute('layer', layer++);
                        child.removeAttribute('beforeeach');
                        child.removeAttribute('datasource');
                        child.removeAttribute('schema');
                        child.removeAttribute('method');
                        child.removeAttribute('iterator');
                        doms.push(child);
                    });
                    doms.forEach(function (t) {
                        t.style.display = 'block';
                        dom.parentNode.appendChild(t);
                    });
                    //dom.style.display = 'none';
                    var pager = rev_r.page;
                    if (pager && $this.options.pager) {
                        var d = _d.getElementById($this.pagerid)
                        if (!d)
                            d = _d.createElement('div');
                        while (d.hasChildNodes()) {
                            d.removeChild(d.lastChild);
                        }
                        var page = pager.page, all = pager.all, pagesize = pager.size, pagecount = pager.pagecount,
                            html = '';
                        for (var i = 0; i < pagecount; i++) {
                            var a = _d.createElement('a');
                            a.onclick = function () {
                                $this.ajax.get()
                            };
                            a.text = i;
                            a.href = 'javascript: void(0);'
                            d.appendChild(a);
                        }
                        d.id = $this.pagerid;
                        d.className = 'pager'
                        dom.parentNode.appendChild(d);

                    }
                };
                this.ajax.get()
            }
        };
        return AjaxRender;
    })();
    Voi.Iterator = (function (_d) {
        function Iterator(voi, ele) {
            this.voi = voi;
            this.ele = ele;
            this.id = 'iterator_' + randomInt();
        }

        Iterator.prototype.init = function () {
            var datasource = this.ele.getAttribute('datasource');
            var datamethod = this.ele.getAttribute('method');
            var schema = this.ele.getAttribute('schema');
            var beforeeach = this.ele.getAttribute('beforeeach');
            var pager = this.ele.getAttribute('pager') !== null;
            var jr = new Voi.AjaxRender({
                element: this.ele,
                url: datasource,
                method: datamethod,
                schema: schema,
                beforeeach: beforeeach,
                pager: pager
            });
            jr.render();
        };
        return Iterator;
    })(_d);
    Voi.XForm = (function () {
        function XForm(voi, ele) {
            this.voi = voi;
            this.ele = ele;
            this.id = 'form_' + randomInt();
            this.complete = function(){};
        }

        XForm.prototype.init = function () {
            //this.voi.log(this.ele);
            var self = this;
            var ds = this.ele.getAttribute('datasource'), $this = this;
            this.sc = this.ele.getAttribute('schema') || 'result';
            this.complete = this.ele.getAttribute('complete') || 'complete';
            this.action = this.ele.getAttribute('action');
            if (ds) {
                (new Voi.Ajax({
                    'url': ds,
                    'callback': function (resp) {
                        var r = resp;
                        /*$this.sc.split('.').forEach(function (t) {
                            r = r[t];
                        });
                        if (Array.isArray(r)) {
                            r = r[0];
                        }
                        */
                        r = _w.getJsonData($this.sc, resp);
                        window[self.complete](r);
                        var keys = Object.keys(r);
                        keys.forEach(function (k) {
                            var v = r[k], f;
                            f = $this.ele.querySelector('input[name=' + k + ']');
                            if (f)
                                f.setAttribute('value', v);

                            f = $this.ele.querySelector('textarea[name=' + k + ']');
                            if (f){
                                if (f.className.indexOf('richedit') > -1 && f.nextElementSibling && f.nextElementSibling.tagName === 'iframe'){
                                    var iframe = f.nextElementSibling;
                                    iframe.contentWindow.document.write(v);

                                }
                                f.value = v;
                            }

                        })

                    }
                })).get();
            }
            $this.ele.onsubmit = function (e) {
                e.preventDefault();
                if (!$this.action) {
                    $this.voi.err('form action is not set')
                    return;
                }
                var elementvalues = [], postdata = '';
                this.querySelectorAll('input,textarea, select, radio, checkbox').forEach(function (t) {
                    if (t.type == 'submit' || t.type == 'button')
                        return;
                    elementvalues.push(t.name + '=' + t.value);
                });
                postdata = elementvalues.join('&');
                console.log($this.action);
                (new Voi.Ajax({
                    'url': $this.action
                })).setContentType('form').post(postdata);


            };
        };
        return XForm;
    })();
    Voi.XBind = (function () {
        function XBind(voi, ele) {
            this.voi = voi;
            this.ele = ele;
            this.parser = new DOMParser();
            this.datasource = this.ele.getAttribute('datasource');
            this.schema = this.ele.getAttribute('schema') || 'result';
        }

        XBind.prototype.parseHtml = function (html) {
            var ele = this.parser.parseFromString(html, "text/html");
            var child = ele.documentElement.querySelector('body').firstChild;
            return child;
        };
        XBind.prototype.getJsonValue = function (schema, data) {
            var temp = data;
            schema.split('.').forEach(function (t, m, n) {
                if (t.indexOf('[') !== -1) {
                    var res = t.split(/\[|\]/);
                    if (res.length) {
                        var d = res[0], i = parseInt(res[1]);
                        temp = temp[d][i]
                    }
                } else {
                    temp = temp[t];
                }
                //console.log(temp);
            });
            return temp;
        };
        XBind.prototype.init = function () {
            var $this = this;
            if (this.ele.length) {
                this.ele = this.ele[0];
            }
            this.ele.style.display = 'none';
            (new Voi.Ajax({
                'url': this.datasource,
                'callback': function (d) {
                    var xbindData = $this.getJsonValue($this.schema, d);
                    var rps = $this.ele.querySelectorAll('[repeater]');
                    rps.forEach(function (p1, p2, p3) {
                        var schema = p1.getAttribute('schema');
                        var data = $this.getJsonValue(schema, xbindData);
                        $this.parseRepeater(p1, data);
                    });
                    var html = $this.ele.outerHTML;
                    var regs = html.match(new RegExp('\\[\\[([a-z|A-Z|0-9|-|_]+)\\]\\]', 'ig'))
                    regs.forEach(function (t1, t2, t3) {
                        var key = t1.replace(/\[|\]/g, '');
                        var val = xbindData[key];
                        html = html.replace(t1, val)
                    });
                    var dom = $this.parseHtml(html);
                    dom.style.display = 'block';
                    $this.ele.replaceWith(dom);
                    console.log(dom);

                }
            })).get()

        };
        XBind.prototype.parseRepeater = function (ele, data) {
            //console.log(ele, data)
            var html = ele.outerHTML, $this = this;
            var regs = html.match(new RegExp('\\[\\[([a-z|A-Z|0-9|-|_]+)\\]\\]', 'ig'));
            ele.style.display = 'none';
            if (data) {
                data.forEach(function (p1, p2, p3) {
                    var tmpHtml = html, dom;
                    regs.forEach(function (t1, t2, t3) {
                        var key = t1.replace(/\[|\]/g, ''), val = '';
                        if (key === 'key')
                            val = key;
                        else
                            val = p1[key];
                        tmpHtml = tmpHtml.replace(t1, val)
                    });
                    dom = $this.parseHtml(tmpHtml);
                    //ele.parentNode.appendChild(dom)
                    ele.parentNode.insertBefore(dom, ele)
                })
            }
        }
        return XBind;
    })();
    Voi.prototype = {
        render: function (__) {
            var $this = this;
            if (!__.isvoi)return;
            var iterators = __.body.querySelectorAll('iterator') || [];
            //var iterators = iterators1.length ? Array.prototype.concat.call(iterators1,iterators2): iterators2;
            Array.from(iterators).forEach(function (t) {
                (new Voi.Iterator(__, t)).init();
            });
            this.iterators = iterators;
            var forms = __.body.querySelectorAll('[xform]');
            Array.from(forms).forEach(function (t) {
                (new Voi.XForm(__, t)).init();
            });
            this.forms = forms;
            var xbinds = __.body.querySelectorAll('[xbind]');
            Array.from(xbinds).forEach(function (t) {
                (new Voi.XBind(__, t)).init();
            });
            this.xbinds = xbinds;
        },
        init: function () {
            var __ = this;
            __.body = _('body')[0];
            __.isvoi = __.body.hasAttribute('voi');
            __.render(__);
        },
        log: function (d) {
            console.log(d);
        },
        err: function (d) {
            console.error(d);
        },


    };
    var v = new Voi();
    v.init();
    return v;
})(window, document);