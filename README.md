# sutra-mobi
sutra-mobi markdown to offtext

## todo
產生brk 功能未port，先把 mn*.hz 放到github

## prerequisite
    clone repo github.com/sutra-mobi/nikaya
    convert *.md in content to traditional Chinese and save to content-tc (details in folders.js)

## generate off/*.off
    node gen dn
    node gen mn

## building database
    ptk js
    
## link pitaka to accelon21
   mklink/j ../accelon21/public/hz hz

   add "hz" to html front page , e.g, 
   accelon21/public/cs巴hz.html      //巴中
   accelon21/public/cs巴sc英hz.html  //巴英中
   
## todo
  convert pku pts numbering to cs