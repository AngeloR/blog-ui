function APIClient(opts) {
    var self = this,
        defaultOpts = {
            root: 'http://localhost:3000'
        };


    this.options = $.extend({}, defaultOpts, opts);
    this.months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    this.reverseMonths = ['Dec','Nove','Oct','Sep','Aug','Jul','Jun','May','Apr','Mar','Feb','Jan'];
    
    this.getAllArticles = function(year, callback) {
        $.ajax({
            url: self.options.root + '/articles/' + year,
            success: callback
        });
    };

    this.getArticles = function(year, month, callback) {
        month = this.months[month];
        $.ajax({
            url: self.options.root + '/articles/' + year + '/' + month, 
            success: callback
        });
    };

    this.getArticle = function(year, month, id, callback) {
        month = this.months[month];
        $.ajax({
            url: self.options.root + '/articles/' + year + '/' + month + '/' + id, 
            success: callback
        });
    };
}
