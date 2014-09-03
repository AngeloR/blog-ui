// This is what you call a "hack". Basically, github in all its programming 
// wisdom has decided that the best way to inject content into your website is 
// via document.write. Which severely futzes up any kind of dynamic browser-side 
// loading. 
//
// This script overwrites document.write and provides a basic gist parser, which 
// injects the right codes where necessary (css + code)
document.write = function(thing) {
    if(thing === undefined) {
        return;
    }
    if(thing.indexOf('https://gist-assets.github.com/assets/') > 0) {
        $('head').append(thing);
    }
    else {
        var id = 'script[data-gist=' + $(thing).attr('id') + ']';
        if(id !== undefined) {
            $(id).after(thing);
            $(id).remove();
        }
    }
}

function App(env) {
    var self = this,
        defaultOpts = {
            env: 'dev'
        };

    this.options = $.extend({}, defaultOpts, {env: env});
    this.client = undefined;
    this.baseURL = window.location.protocol + '//' + window.location.host + window.location.pathname;

    function url() {
        var str = '';
        $.each(arguments, function(i, arg){
            str += '/' + arg;
        });
        return self.baseURL + '#!' + str;
    };

    function loadArticle(path) {
        path = path.split('#!/')[1];
        path = path.split('/');

        self.client.getArticle(path[0], path[1], path[2], function(article){
            var $content = $('#content');
            $content.html(article);
            $('body').animate({scrollTop: 0}, 'slow');
        });
    }

    function loadArticlesForYear(year, callback) {
        var data = [],
            date = undefined,
            writtenMonths = [];

        self.client.getAllArticles(year, function(articles){
            // sort reverse cron sort every article
            $.each(articles, function(i, month){
                articles[i] = articles[i].reverse();
            });


            $.each(self.client.reverseMonths, function(i, month){
                if(articles[month]) {
                    // get a header in for the month
                    if(writtenMonths.indexOf(month) < 0) {
                        data.push('<li class="pub-month">' + month + '</li>');
                        writtenMonths.push(month);
                    }

                    // write out the articles
                    $.each(articles[month], function(i2, article){
                        date = new Date(article.pubdate);
                        data.push('<li><a href="'+url(date.getFullYear(), date.getMonth(), article.slug)+'" class="article-link">' + article.name +'</a></li>');
                    });
                }
            });

            $('#archive-year').html(year);
            $('#yearnav').html(data.join("\r\n"));

            callback();
        });
    }

    function setDefaultDoc() {
        var hash = window.location.hash,
            d = new Date();

        loadArticlesForYear(d.getFullYear(), function(){
            // lets set the color of the links on the sidebar
            colors = gradientTween([toDec('ff'), toDec('9c'), toDec('4a')], [toDec('8c'), toDec('00'), toDec('7b')], $('#yearnav .article-link').length);

            $('#yearnav .article-link').each(function(i, el) {
                var $el = $(el);
                $el.css('background-color', 'rgb(' + colors[i][0] + ',' + colors[i][1] + ',' + colors[i][2] + ')');
            });
            
            $first = $('#yearnav .article-link').first();
            if(hash) {
                var $el = $('#yearnav a[href$="' + hash + '"]');
                if($el.length > 0) {
                    $el.click();
                }
                else {
                    $first.click();
                }

            }
            else {
                // click the first article
                $first.click();
            }
        });

    }

    function toHex(c) {
        var hex = c.toString(16);
        return hex.length === 1 ? "0" + hex:hex;
    }

    function toDec(h) {
        return parseInt(h, 16);
    }

    function gradientTween(start, end, steps) {
        /*
        var start = [toDec('aa'), 0, 0],
            end = [toDec('ff'), toDec('ff'), toDec('cc')],
            items = 8;
        */

        var rDiff, gDiff, bDiff,
            rOffset, gOffset, bOffset,
            colors;

        if(end[0] >= start[0]) {
            rDiff = end[0] - start[0];
        }
        else {
            rDiff = start[0] - end[0];
            rDiff *= -1;
        }

        if(end[1] >= start[1]) {
            gDiff = end[1] - start[1];
        }
        else {
            gDiff = start[1] - end[1];
            gDiff *= -1;
        }

        if(end[2] >= start[2]) {
            bDiff = end[2] - start[2];
        }
        else {
            bDiff = start[2] - end[2];
            bDiff *= -1;
        }

        rOffset = rDiff/steps;
        gOffset = gDiff/steps;
        bOffset = bDiff/steps;


        colors = [start];
        for(var i = 1; i < steps; ++i) {
            var prev = colors[i-1];
            colors.push([parseInt(prev[0] + rOffset), parseInt(prev[1] + gOffset), parseInt(prev[2] + bOffset)]);
        }

        return colors;
    }

    function constructor() {
        
        $('#yearnav').on('click', '.article-link', function(e) {
            var $this = $(this),
                $content = $('#content');

            $this.closest('#yearnav').find('a').removeClass('current');
            $this.addClass('current');
            loadArticle($this.attr('href'));
        });

        self.client = new APIClient({});

        setDefaultDoc();
    }
    constructor();
}
