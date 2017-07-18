import { Gaddag, GaddagNode, permute, unique, values } from './gaddag';
// import { bingosSample } from './data/bingos-sample';
// import { bingos } from './data/bingos';
import { words } from './data/words';
import * as d3 from 'd3';

let wordList = words.words;
var timestart = new Date().getTime();

function diagonal(d: d3.HierarchyPointNode<{}>) {
  return "M" + d.y + "," + d.x
      + "C" + (d.parent.y + 100) + "," + d.x
      + " " + (d.parent.y + 100) + "," + d.parent.x
      + " " + d.parent.y + "," + d.parent.x;
}

let dag = new Gaddag();
let dagSample = new Gaddag();
wordList.slice(50,75).forEach(w => dagSample.addWord(w));
wordList.forEach(w => dag.addWord(w));
console.log(`Time: ${new Date().getTime() - timestart}ms`);
console.log("\n------------------------\n");

timestart = new Date().getTime();
let dagNodes = dagSample.getNodes();
let dagEdges = dagSample.getEdges();

// let svg = d3.select("svg"),
//   rawWidth = 1875,
//   rawHeight = 950,
//   margin = { top: 20, right: 120, bottom: 20, left: 120 },
//   width = rawWidth - margin.right - margin.left,
//   height = rawHeight - margin.top - margin.bottom;

// svg
//   .attr('height', rawHeight)
//   .attr('width', rawWidth);

// let frame = svg
//   .append('g')
//     .attr('transform', `translate(${margin.left},${margin.top})`) ;

//  let hierarchyRoot = d3.hierarchy(dagSample.root, n => values(n.children));
//  let tree = d3.tree<GaddagNode>()
//   .size([height, width - 160]);
//  let treeRoot = tree(hierarchyRoot);

//  let links = frame.selectAll('.link')
//   .data(treeRoot.descendants().slice(1))
//   .enter().append('path')
//     .attr('class', 'link')
//     .attr('d', diagonal);
  
// let nodes = frame.selectAll('.node')
//     .data(treeRoot.descendants())
//   .enter().append('g')
//     .attr('class', d => `node ${d.children ? 'node--internal' : 'node--leaf'} ${d.data.isCompleteWord ? 'node--complete-word' : ''}` )
//     .attr('transform', d => `translate(${d.y},${d.x})`);

// nodes.append('circle')
//   .attr('r', 2.5);

// nodes.append('text')
//   .attr('dy', 3)
//   .attr('x', d => d.children ? -8 : 8)
//   .style('text-anchor', d => d.children ? 'end' : 'start')
//   .text(d => d.data.token);

// console.log(wordList.reduce( (p: {[length: number]: number}, n) => {
//   p[n.length] = p[n.length] || 0;
//   p[n.length] = p[n.length] + 1;
//   return p;
// }, {} ));

// let anyWindow: any = window;
// anyWindow['dag'] = dag;

// console.log(dag.wordsForHandByPermutation('tion'));
