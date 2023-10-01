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
const scfolder='../sc/sc-pli.offtext/'
const desfolder=hz?'cs-hz.offtext/':'cs-pku.offtext/';
const yhfolder='../cb-n/off/';
const brkfolder='brk/';
const books=meta_sc.booksOf(pat);
const buildPTSMap=(fn)=>{
    const lines=readTextLines(fn)
    const out=[];
    for (let i=0;i<lines.length;i++) {
        const line=lines[i];
        const tagm=line.match(/\^m(\d+)/);
        if (tagm) {
            const tagn=line.match(/\^n(\d+)/);
            if (tagn) {
                out.push([tagm[1],tagn[1]]);
            }
        }
    }
    return out;
}
const addN=(book,lines)=>{
    const maps=buildPTSMap(yhfolder+book+'.yh.off');
    let n=0,lastn=0;
    return lines.join('\n').replace(/\^n[\.\d]+/g,(m,m1)=>{
        m=m.slice(2)
        const at=m.indexOf('.');
        if (~at && at<m.length-1) m=m.slice(at+1);
        else if (~at) m=m.slice(0,at) //tailing .

        lastn=n;
        if (n==maps.length) n=0;//rollback
        while (n<maps.length) {
            if (parseInt(m)== maps[n][0]) {
                maps[n][0]='';//clear it;
                return '^n'+maps[n][1]+'^m'+m;
            } 
            n++;
            if (n-lastn>5) { //too far
                n=lastn;
                break;
            }
        }
        return '^m'+m;
    }).split('\n');    
}

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
        //convert to pts paranum, remove n2.1 ==> m1

        outcontent=addN(book,lines);
        /*
        const sccontent=readTextLines(scfolder+book+'.ms.off');

        outcontent=autoAlign(offcontent,sccontent);        
        if (outcontent.length!==sccontent.length) {
            console.log('align failed',book)
        }
        
        linecountwarning=outcontent.length!==sccontent.length?red("!="+sccontent.length):'';
        */
    }

    let outfn=desfolder+book+(hz?'.hz.ori.off':'.pku.ori.off');
    const outbuf=outcontent.join('\n');
    writeChanged(outfn,outbuf,true)
    // console.log('written',outfn,'length',outbuf.length,linecountwarning)
});
