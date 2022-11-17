const abulknames={
    dn1:'^ak#dn(長部)',
    mn1:'^bk#mn(中部)',
}
const booknames={
    dn1:'^bk#dn1(長部一)',
    dn2:'^bk#dn2(長部二)',
    dn3:'^bk#dn3(長部三)',
    mn1:'^bk#mn1(中部一)',
    mn2:'^bk#mn2(中部二)',
    mn3:'^bk#mn3(中部三)',
}
export const cleanMarkdown=(rawcontent,fn,bkid,firstfile=false)=>{
    const lines=rawcontent.split('\n');
    const suttaid=fn.match(/(\d+).md$/)[1].replace(/^0+/,'');
    const out=[];
    let header='^ck#'+bkid[0]+suttaid;
    const ak= abulknames[bkid]||'';
    const bk= booknames[bkid];
    if (firstfile) header=ak+bk+header;
    for (let i=0;i<lines.length;i++) {
        let line=lines[i];
        const first=line.charAt(0);
        if (first==='>') { //intro
            continue;
        } else if (first==='#') {//header
            let at=1;
            while (at<line.length&&line[at]=='#') at++;
            const h=line.substr(at).trim().replace(/\([^\)]+\)/,'');//remove pali 
	//at ==1 , chunk name
            header+= (at>1?'^z'+at:'')+'('+h+')';
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