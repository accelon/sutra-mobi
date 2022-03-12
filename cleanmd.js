export const cleanMarkdown=(rawcontent,fn,bkid,firstfile=false)=>{
    const lines=rawcontent.split('\n');
    const suttaid=fn.match(/(\d+).md$/)[1].replace(/^0+/,'');
    const out=[];
    let header='^ck#'+bkid[0]+suttaid;
    if (firstfile) header='^bk#'+bkid+header;
    for (let i=0;i<lines.length;i++) {
        let line=lines[i];
        const first=line.charAt(0);
        if (first==='>') { //intro
            continue;
        } else if (first==='#') {//header
            let at=1;
            while (at<line.length&&line[at]=='#') at++;
            const h=line.substr(at).trim().replace(/\([^\)]+\)/,'');//remove pali 
            header+='^z'+at+'['+h+']';
            continue;
        } else {
            const m=line.match(/^([\d+\-]+)/);
            if (m) {
                const n=parseInt(m[1]);
                line='^n'+m[1]+line.substring(m[1].length);
            }
        }
        if (!line.trim()) continue;
        if (header) {
            line=header+line;
            header='';
        }
        out.push(line);
    }
    return out;
}