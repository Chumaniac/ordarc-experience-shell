import {readFile,writeFile,lstat,readdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const root=fileURLToPath(new URL('../',import.meta.url));
const sources=['docs/PRODUCT_EXPERIENCE.md','.gitignore','.github/workflows/check.yml','LICENSE','README.md','package.json','package-lock.json','index.html','demo.tsx','demo.css','vite.config.ts','tsconfig.json','src/index.tsx','src/styles.css','examples/consumer.html','examples/consumer.tsx','scripts/verify-consumer.mjs','scripts/provenance.mjs'].sort();
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
async function inventory(directory,paths){const rows=[];for(const relative of paths){const file=path.join(directory,relative),info=await lstat(file);if(!info.isFile()||info.isSymbolicLink()||info.size>2*1024*1024)throw new Error('Expected a bounded regular source/build file');const bytes=await readFile(file);if(bytes.length!==info.size)throw new Error('File changed during provenance read');rows.push({path:relative,bytes:bytes.length,sha256:hash(bytes)});}return rows;}
const tree=files=>hash(files.map(x=>x.path+'\0'+x.sha256+'\n').join(''));
const head=()=>execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
const dirty=()=>!!execFileSync('git',['status','--porcelain'],{cwd:root,encoding:'utf8'}).trim();
const manifestFile=path.join(root,'SHOWCASE-MANIFEST.json'),mode=process.argv[2];
const files=await inventory(root,sources),sourceTreeSha256=tree(files);
if(mode==='source-write'){
  if(dirty())throw new Error('Commit the source before preparing its manifest');
  await writeFile(manifestFile,JSON.stringify({version:1,product:'Ordarc experience shell',scope:'presentation-only',license:'MIT',sourceCommit:head(),includesWorkingTreeChanges:false,manifestSelfExcluded:true,sourceTreeSha256,files},null,2)+'\n');
  console.log(JSON.stringify({sourceCommit:head(),sourceTreeSha256,files:files.length}));
}else if(mode==='source-verify'){
  const manifest=JSON.parse(await readFile(manifestFile,'utf8'));
  if(manifest.version!==1||manifest.scope!=='presentation-only'||manifest.license!=='MIT'||manifest.includesWorkingTreeChanges!==false||manifest.manifestSelfExcluded!==true||manifest.sourceTreeSha256!==sourceTreeSha256||JSON.stringify(manifest.files)!==JSON.stringify(files)||!/^[a-f0-9]{40}$/.test(manifest.sourceCommit))throw new Error('Source manifest does not match current source');
  execFileSync('git',['merge-base','--is-ancestor',manifest.sourceCommit,'HEAD'],{cwd:root,stdio:'ignore'});
  console.log(JSON.stringify({verified:true,sourceCommit:manifest.sourceCommit,sourceTreeSha256,files:files.length}));
}else if(mode==='build'){
  const dist=path.join(root,'dist'),paths=[];
  async function walk(prefix=''){for(const entry of await readdir(path.join(dist,prefix),{withFileTypes:true})){const relative=prefix?prefix+'/'+entry.name:entry.name;if(relative==='BUILD-PROVENANCE.json')continue;if(entry.isDirectory())await walk(relative);else if(entry.isFile())paths.push(relative);else throw new Error('Build contains an unsafe entry');}}
  await walk();paths.sort();
  const dependencyVersion=async name=>JSON.parse(await readFile(path.join(root,'node_modules',name,'package.json'),'utf8')).version;
  const receipt={version:1,scope:'static-demo-build',sourceCommit:head(),includesWorkingTreeChanges:dirty(),sourceTreeSha256,dependencyLockSha256:hash(await readFile(path.join(root,'package-lock.json'))),license:'MIT',node:process.version,npm:execFileSync('npm',['--version'],{encoding:'utf8'}).trim(),vite:await dependencyVersion('vite'),typescript:await dependencyVersion('typescript'),buildReceiptSelfExcluded:true,files:await inventory(dist,paths)};
  await writeFile(path.join(dist,'BUILD-PROVENANCE.json'),JSON.stringify(receipt,null,2)+'\n');
  console.log(JSON.stringify({buildRecorded:true,sourceCommit:receipt.sourceCommit,includesWorkingTreeChanges:receipt.includesWorkingTreeChanges,files:receipt.files.length}));
}else throw new Error('Use source-write, source-verify or build');
