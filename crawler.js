var cheerio = require('cheerio');
var superagent = require('superagent');
var url = require('url');
var async = require('async');
var fs = require('fs');
var path = require('path');
var express = require('express');

var app = express();

var cnodeUrl = 'https://cnodejs.org/';

//并发数
var count = 0;

app.get('/', function (req, res, next) {
  superagent.get(cnodeUrl).end(function (err, sres) {
    if (err) {
      next(err);
    }
    var $ = cheerio.load(sres.text);
    var topicUrls = [];
    $('#topic_list .topic_title').each(function (idx, element) {
      console.log($(element), '$(element)===');
      var $element = $(element);
      var href = url.resolve(cnodeUrl, $element.attr('href'));
      console.log($element.attr('href'), 'href===');
      topicUrls.push(href);
    });

    //此时已经得到了所有文章的url
    //console.log(topicUrls);

    //设置最大并发数为5
    async.mapLimit(
      topicUrls,
      5,
      function (url, resolve) {
        count++;
        //获取每一个对应的网址的html字符串
        superagent.get(url).end(function (err, content) {
          count--;
          console.log('现在的并发数是：' + count);
          resolve(null, [url, content.text]);
        });
      },
      function (err, result) {
        result = result.map(function (topic) {
          var url = topic[0];
          var html = topic[1];
          var $ = cheerio.load(html);
          return {
            title: $('.topic_full_title').text().trim(),
            href: url,
            comment: $('.reply_content').eq(0).text().trim(),
          };
        });

        //到这里已经得到了所有想要的json信息
        //console.log(result);

        //开始写入文件
        fs.writeFile(
          path.join('./', 'data.js'),
          JSON.stringify(result),
          function (err) {
            if (err) throw err;
            console.log('Export Account Success!');
          },
        );
        //读文件并输出内容
        fs.readFile(
          path.join('./', 'data.js'),
          'utf-8',
          function (err, content) {
            // 触发结果事件
            console.log(content);
          },
        );
      },
    );
  });
});

app.listen(3000, function () {
  console.log('listen to port 3000');
});
