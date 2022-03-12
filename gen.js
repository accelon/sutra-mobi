import {nodefs, kluer,patchBuf,writeChanged, readTextLines} from 'pitaka/cli';
import {filesOfBook,combineMarkdown} from './folders.js'
import { autoAlign, autoChineseBreak } from 'pitaka/align';
import {zconvert_fix} from './zconvert-fix.js'
import {sc} from 'pitaka/meta'
const {yellow,red} =kluer;
await nodefs; //export fs to global

const pat=process.argv[2] || 'dn1';
const source=process.argv[3] || 'hzfxy';
console.log('node gen bkid ?pku');
const srcfolder='nikaya/$/'.replace('$',source);
const scfolder='../sc/pli/'
const desfolder='off/';
const books=sc.booksOf(pat);
books.forEach(book=>{
    let files=filesOfBook(book,srcfolder);
    let lines=combineMarkdown(files,srcfolder,book,source);
    lines=lines.map(line=>autoChineseBreak(line));
    const sccontent=readTextLines(scfolder+book+'.ms.off');
    const outcontent=autoAlign(lines.join('\n').split('\n'),sccontent);
    if (outcontent.length!==sccontent.length) {
        console.log('align failed',book)
    } else {
        const linecountwarning=outcontent.length!==sccontent.length?red("!="+sccontent.length):'';
        const outbuf=patchBuf( outcontent.join('\n') , zconvert_fix ,book);
        const outfn=desfolder+book+'.hz.off';
        if (writeChanged(outfn,outbuf)) {
            console.log('written',outfn,'length',outbuf.length,linecountwarning)
        }    
    }
});
