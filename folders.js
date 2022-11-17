/* ccc files by book code*/
import { readTextContent,patchBuf, meta_sc} from 'ptk/nodebundle.cjs'
import {cleanMarkdown} from './cleanmd.js'
import { Errata_pku,Errata_hz } from './errata.js';
export const FilesOfBook={
        dn1:["chang/content-tc/{1-13}.md"], 
        dn2:["chang/content-tc/{14-23}.md"],
        dn3:["chang/content-tc/{24-34}.md"],
        mn1:["zhong/content-tc/{1-50}.md"],
        mn2:["zhong/content-tc/{51-100}.md"],
        mn3:["zhong/content-tc/{101-152}.md"],
}

export const filesOfBook=(pat,rootfolder)=>{   
    const files=meta_sc.getFilesOfBook(pat,FilesOfBook,rootfolder);
    let len=2;
    if (pat[0]=='m') len=3;
    return files.filter(fn=>{
        const m=fn.match(/(\d+)\.md$/);
        return m[1].length===len; //filter out the intro text
    })
}

export const combineMarkdown=(files=[],rootfolder,bkid,source)=>{
    const out=[];
    const Errata=source=='pku'?Errata_pku:Errata_hz;
    files.forEach((fn,idx)=>{
        let rawcontent=patchBuf(readTextContent(rootfolder+fn), Errata[fn],fn);
        if (bkid=='mn1' && fn.endsWith('010.md')) {
            const from=rawcontent.indexOf('(第一誦分完)');
            const to=rawcontent.indexOf('\n136');
            rawcontent=rawcontent.slice(0,from)+rawcontent.slice(to);
        }
        let lines=cleanMarkdown(rawcontent,fn,bkid,idx==0);
        out.push(...lines);
    })
    return out;
}