'use strict';

const program = require('commander');
const crawler = require('crawler');
const fs = require('fs');
const path = require('path');
let numberOfLinks  = 0;

program
    .version('1.0.0')
    .option('-v --verbose','Whether verbose output is wanted')
    .option('-w --write-output','Write Output to a File')
    .option('-s --site <site>','The Website to crawl')
    .parse(process.argv);

//now we can begin the crawl.
let c = new crawler({
    skipDuplicates: true,
    rateLimit: 500,
    callback: function(error,res,done){
        let $ = res.$;
        let newUrlArrayToCrawl = [];
        //here we are going to follow all of the 'a' links to 
        //other pages within the site.
        try{
            $('a').each(function(){
                let hrefPart = $(this).attr('href');
                //determine if this is a non http url or an external link
                let hrefParts = hrefPart.split('/');
                if(hrefParts[0].indexOf('mailto:') < 0 && 
                hrefParts[0].indexOf('javascript') < 0 &&
                hrefParts[0].indexOf('http') < 0 && hrefPart != '#'){
                    newUrlArrayToCrawl.push(program.site + hrefPart);
                }
                if(program.verbose){
                    for(var i=0;i<newUrlArrayToCrawl.length;i++){
                        console.log('Adding to crawl: ' + newUrlArrayToCrawl[i]);
                    }
                }
            });
        }catch(e){
            if(program.verbose){
                console.log('Non HTML link hit... Moving on...');
            }
        }
        //now we will attempt to get any login forms out of the page
        try{
            let formAction;
            $("form[action*='login']").each(function(){
                $(this).find('#fieldemail').val();
                formAction = $(this).attr('action');
            });
        }catch(e){

        }

        //if other links are found, add them to the crawler.
        if(newUrlArrayToCrawl.length > 0){
            //c.queue(newUrlArrayToCrawl);
        }
        
        let outputString = 'Page Count: ' + numberOfLinks + ' - ' + res.request.uri.format();
        console.log(outputString);
        if(program.writeOutput){
            fs.appendFile(path.join(__dirname,'linkoutput.txt'),outputString + "\r\n",{encoding:'utf8'},function(err){
                if(err)console.log('There was a problem creating the file. It was : ' + JSON.stringify(err));
                console.log('Logged.');
            });
        }
        numberOfLinks++;
        done();
    }
});
c.queue(program.site);