import {build as bundle} from 'esbuild';
import {mkdtemp,realpath,readFile,writeFile,copyFile,rm,stat} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const keep=process.argv.includes('--keep');
const root=fileURLToPath(new URL('../',import.meta.url)),temporary=await realpath(await mkdtemp(path.join(tmpdir(),'ordarc-consumer-')));
function run(command,args,cwd){const result=spawnSync(command,args,{cwd,encoding:'utf8',maxBuffer:2*1024*1024,stdio:['ignore','pipe','pipe']});if(result.error||result.status!==0)throw new Error('Consumer check failed: '+(result.stderr||result.stdout||result.error?.message||`exit ${result.status}`));return result.stdout;}
try{
  const locked=JSON.parse(await readFile(path.join(root,'package-lock.json'),'utf8'));
  const packed=JSON.parse(run('npm',['pack','--json','--pack-destination',temporary],root))[0];
  const dependencies={'@ordarc/experience-shell':'file:./'+packed.filename};
  for(const name of ['react','react-dom','@types/react','@types/react-dom'])dependencies[name]=locked.packages['node_modules/'+name].version;
  await writeFile(path.join(temporary,'package.json'),JSON.stringify({name:'isolated-package-consumer',private:true,type:'module',dependencies},null,2));
  await copyFile(path.join(root,'examples/consumer.tsx'),path.join(temporary,'consumer.tsx'));
  await copyFile(path.join(root,'examples/consumer.html'),path.join(temporary,'index.html'));
  run('npm',['install','--no-audit','--no-fund'],temporary);
  run(process.execPath,[path.join(root,'node_modules/typescript/bin/tsc'),'--noEmit','--strict','--skipLibCheck','--jsx','react-jsx','--module','esnext','--moduleResolution','bundler','--target','es2022','--types','react,react-dom','consumer.tsx'],temporary);
  run(process.execPath,[path.join(root,'node_modules/vite/bin/vite.js'),'build',temporary],temporary);
  if(!(await stat(path.join(temporary,'dist/index.html'))).isFile())throw new Error('Consumer build missing');
  const ssrFile=path.join(temporary,'tabs-ssr.cjs');
  const probe=`import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';import assert from 'node:assert/strict';import {ProductTabs} from '@ordarc/experience-shell';
    const items=[{id:'first',label:'First',panel:<input defaultValue="KEPT"/>},{id:'notes',label:'Notes',panel:<p>Notes</p>}];
    const html=renderToStaticMarkup(<><ProductTabs items={items} defaultTabId="notes"/><ProductTabs items={items} defaultTabId="missing"/></>);
    const controls=[...html.matchAll(/aria-controls="([^"]+)"/g)].map(row=>row[1]);assert.equal(controls.length,4);assert.equal(new Set(controls).size,4);for(const id of controls)assert(html.includes('id="'+id+'"'));
    assert.equal((html.match(/aria-selected="true"/g)||[]).length,2);assert.equal((html.match(/role="tabpanel"/g)||[]).length,4);assert.equal((html.match(/hidden=""/g)||[]).length,2);
    assert.equal(renderToStaticMarkup(<ProductTabs items={[]}/>),'');assert.throws(()=>renderToStaticMarkup(<ProductTabs items={[items[0],items[0]]}/>));assert(!html.includes('<style'));console.log('SSR tabs: unique associations, selection, retained panels, empty/invalid roster and headless rendering passed.');`;
  await bundle({stdin:{contents:probe,loader:'tsx',resolveDir:temporary},bundle:true,platform:'node',format:'cjs',outfile:ssrFile,logLevel:'silent'});
  run(process.execPath,[ssrFile],temporary);
  console.log(JSON.stringify({packedFiles:packed.files.length,independentTypecheck:true,independentBuild:true,ssrTabs:true,usesProductApi:false,consumerDirectory:keep?temporary:undefined}));
}finally{if(!keep)await rm(temporary,{recursive:true,force:true});}
