import {meta_sc,nodefs, patchBuf,writeChanged, readTextLines,
 autoAlign, autoChineseBreak ,guidedBreakLines,toParagraphs} from 'ptk/nodebundle.cjs';
import {yellow,red} from 'ptk/cli/colors.cjs'
import {filesOfBook,combineMarkdown} from './folders.js'
import {zconvert_fix} from './zconvert-fix.js' // fix sim to tradition conversion error

await nodefs; //export fs to global

const pat=process.argv[2] || 'dn1';
const source=process.argv[3] || 'hzfxy';
const hz=source=='hzfxy'
console.log('node gen bkid');
const srcfolder='nikaya/$/'.replace('$',source);
const scfolder='../sc/pli/'
const desfolder=hz?'cs-hz.offtext/':'cs-pku.offtext/';
const brkfolder='brk/';
const books=meta_sc.booksOf(pat);

books.forEach(book=>{
    let files=filesOfBook(book,srcfolder);
    let lines=combineMarkdown(files,srcfolder,book,source);
    let offcontent='',outcontent='',linecountwarning='';
    const brkfn=brkfolder+book+(hz?'.hz.txt':'.pku.txt')
    lines=patchBuf( lines.join('\n') , zconvert_fix ,book).split('\n');

    if (fs.existsSync(brkfn)) {
        lines=toParagraphs(lines).map(it=>it[1].join(''))
        const pins=readTextLines(brkfn);
        outcontent=guidedBreakLines(lines.join('\n'),pins,book).split('\n');
    } else {
        console.log(red('missing pin, use auto break'));
        // writeChanged('temp.txt',lines.join('\n'));
        lines=lines.map(line=>autoChineseBreak(line));
        offcontent=lines.join('\n').split('\n');
        const sccontent=readTextLines(scfolder+book+'.ms.off');

        outcontent=autoAlign(offcontent,sccontent);        
        if (outcontent.length!==sccontent.length) {
            console.log('align failed',book)
        }
        linecountwarning=outcontent.length!==sccontent.length?red("!="+sccontent.length):'';
    }

    let outfn=desfolder+book+(hz?'.hz.off':'.pku.off');
    const outbuf=outcontent.join('\n');
    if (fs.existsSync(outfn)) {
        outfn+='.gen';
        if (writeChanged(outfn,outbuf)) {
            console.log(red('file exists') ,'written',outfn,'length',outbuf.length,linecountwarning)
        }
    }  else  if (writeChanged(outfn,outbuf)) {
        console.log('written',outfn,'length',outbuf.length,linecountwarning)
    }
});
