var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
Backbone.$ = $;

var SupportsPagination = Backbone.View.extend({
    pageNumber: 0,
    pageCount: 10,
    getPaginator: function () {
        var self = this;
        var total = 0;
        var totalPages = 1;

        if (this.model.has('total')) {
            total = this.model.get('total');
        }
        if (total > this.pageCount) {
            totalPages = Math.ceil(total / this.pageCount);
        }

        var list = $('<ul class="pagination" />');
        if (this.pageNumber > 0) {
            list.append($('<li><a href="#">&laquo;</a></li>').click(function () { return self.previousPage(); }));
        } else {
            list.append('<li class="disabled"><a href="#">&laquo;</a></li>')
        }
        var start = 0;
        if (self.pageNumber > 5 && totalPages > 10) {
            if (self.pageNumber > (totalPages - 5)) {
                start = totalPages - 10;
            } else {
                start = self.pageNumber - 5;
            }
        }

        var start = self.pageNumber < 5
            ? 0
            : self.pageNumber > (totalPages - 5) ? totalPages - 10 : self.pageNumber - 5;
        for (var i = start, j = 0; i < totalPages && j < 10; i++, j++) {
            if (this.pageNumber !== i) {
                list.append($('<li><a href="#">' + (i + 1) + '</a></li>').click(function () {
                    var pageNum = parseInt($(this).text()) - 1;
                    self.pageNumber = pageNum;
                    return self.setPage();

                }));
            } else {
                list.append($('<li class="active"><span>' + (i + 1) + ' <span class="sr-only">(current)</span></span></li>'));
            }
        }
        if ((this.pageNumber < (totalPages - 1))) {
            list.append($('<li><a href="#">&raquo;</a></li>').click(function () { return self.nextPage(); }));
        } else {
            list.append('<li class="disabled"><a href="#">&raquo;</a></li>')
        }
        _.bindAll(this, 'nextPage', 'previousPage', 'setPage');
        return list;
    },
    firstPage: function () {
        var self = this;
        this.pageNumber = 0;
        this.model.fetch({
            data: self.extendPostData({
                pageSize: self.pageCount,
                pageNumber: self.pageNumber
            })
            , type: 'POST'
        });
    }
    ,  nextPage: function () {
        var self = this;
        this.pageNumber++;
        this.model.fetch({
            data: self.extendPostData({
                pageSize: self.pageCount,
                pageNumber: self.pageNumber
            })
            , type: 'POST'
        });
        return false;
    },
    previousPage: function () {
        var self = this;
        this.pageNumber--;
        this.model.fetch({
            data: self.extendPostData({
                pageSize: self.pageCount,
                pageNumber: self.pageNumber
            })
            , type: 'POST'
        });
        return false;
    },
    setPage: function () {
        var self = this;
        this.model.fetch({
            data: self.extendPostData( { 
                pageSize: self.pageCount, 
                pageNumber: self.pageNumber
            })
            , type: 'POST'
        });

        return false;
    },
    extendPostData: function (data) {
        if (this.setPostData) {
            this.setPostData(data);
        }
        return data;
    }
});

module.exports = SupportsPagination;
