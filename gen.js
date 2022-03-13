import {nodefs, kluer,patchBuf,writeChanged, readTextLines} from 'pitaka/cli';
import {filesOfBook,combineMarkdown} from './folders.js'
import { autoAlign, autoChineseBreak ,guidedBreakLines,toParagraphs} from 'pitaka/align';
import {zconvert_fix} from './zconvert-fix.js'
import {sc} from 'pitaka/meta'
const {yellow,red} =kluer;
await nodefs; //export fs to global

const pat=process.argv[2] || 'dn1';
const source=process.argv[3] || 'hzfxy';
console.log('node gen bkid');
const srcfolder='nikaya/$/'.replace('$',source);
const scfolder='../sc/pli/'
const desfolder='off/';
const brkfolder='brk/';
const books=sc.booksOf(pat);
books.forEach(book=>{
    let files=filesOfBook(book,srcfolder);
    let lines=combineMarkdown(files,srcfolder,book,source);
    let offcontent='',outcontent='',linecountwarning='';
    const brkfn=brkfolder+book+'.hz.txt'
    lines=patchBuf( lines.join('\n') , zconvert_fix ,book).split('\n');

    if (fs.existsSync(brkfn)) {
        console.log('pin break')
        lines=toParagraphs(lines).map(it=>it[1].join(''))
        const pins=readTextLines(brkfn);
        outcontent=guidedBreakLines(lines.join('\n'),pins,book).split('\n');

    } else {
        console.log('auto break')
        lines=lines.map(line=>autoChineseBreak(line));
        offcontent=lines.join('\n').split('\n');
        const sccontent=readTextLines(scfolder+book+'.ms.off');
        outcontent=autoAlign(offcontent,sccontent);        
        if (outcontent.length!==sccontent.length) {
            console.log('align failed',book)
        }
        linecountwarning=outcontent.length!==sccontent.length?red("!="+sccontent.length):'';
    }
    
    const outfn=desfolder+book+'.hz.off';
    const outbuf=outcontent.join('\n');
    if (writeChanged(outfn,outbuf)) {
        console.log('written',outfn,'length',outbuf.length,linecountwarning)
    }
});
