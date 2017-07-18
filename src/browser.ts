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

type TemplateIds = '#template-exploration-slide' | '#template-message-slide';
type Slide = { templateId: TemplateIds, bootstrap: (host: Element) => void };

class SlideShow {
  private host: Element;
  private _slideNumber: number;
  public get slideNumber(): number {
    return this._slideNumber;
  }
  public get slide(): Slide {
    return this.slides[this._slideNumber];
  }

  public next(): void {
    if (this._slideNumber < this.slides.length) {
      this._slideNumber = this._slideNumber + 1;
    }
  }

  public previous(): void {
    if (this._slideNumber > 0) {
      this._slideNumber = this._slideNumber - 1;
    }
  }

  private render() {
    let currentSlide = this.host.querySelector('.show');
    currentSlide.innerHTML = '';

    let newTemplate: any = document.querySelector(this.slide.templateId);
    let clone: Element = document.importNode(newTemplate.content, true);
    this.slide.bootstrap(clone);
    currentSlide.appendChild(clone);
  }

  constructor(public slides: Slide[], initialSlide: number = 0, hostSelector: string = ".slide-show") {
    this._slideNumber = slides[initialSlide] ? initialSlide : 0;

    this.host = document.querySelector(hostSelector);

    this.render();

    d3.select('.next-slide').on('click', () => { this.next(); this.render(); });
    d3.select('.prev-slide').on('click', () => { this.previous(); this.render(); });
  }
}

function clabbersSlide(host: Element) {
  let data = [
    { token: 'C', end: 1 },
    { token: 'L', end: 6 },
    { token: 'A', end: 3 },
    { token: 'B', end: 5 },
    { token: 'B', end: 4 },
    { token: 'E', end: 7 },
    { token: 'R', end: 2 },
    { token: 'S', end: 0 }
  ]
  var colorScale = d3.schemeCategory20;

  let svg = d3.select(host).select("svg"),
    rawWidth = +svg.attr('width'),
    rawHeight = +svg.attr('height'),
    margin = { top: 20, right: 120, bottom: 20, left: 120 },
    width = rawWidth - margin.right - margin.left,
    height = rawHeight - margin.top - margin.bottom;

  let frame = svg
    .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`) ;

  let introNodes = frame
    .selectAll('.intro-node')
    .data(data)
    .enter()
    .append('g')
    .attr('class', 'intro-node')
    .attr('transform', (d, i) => `translate(${200 + (i*50)},${200})`);
  
  introNodes
    .append('circle')
    .attr('r', 20)
    .style('fill', (d,i) => colorScale[i] );
  
  introNodes
    .append('text')
    .style('text-anchor', 'middle')
    .attr('dy', 3)
    .text(d => d.token);
  
  function anagram(){
    frame.selectAll('.intro-node')
      .sort((a,b) => d3.ascending(Math.random(), Math.random()))
      .transition().duration(700)
      .attr('transform', (d, i) => `translate(${200 + (i*50)},${200})`);
  }

 svg.on('click', anagram);

  setTimeout(() => {
    frame.selectAll('.intro-node')
      .data(data)
      .transition().duration(700)
      .attr('transform', (d, i) => `translate(${200 + (d.end*50)},${200})`)
  }, 3000);
}

function helloWorldSlide(host: Element) {
  d3.select(host).select('.slide-title').text("Hello");
  d3.select(host).select('.slide-text').text("World!");
}

let slides: Slide[] = [
  { templateId: '#template-message-slide', bootstrap: helloWorldSlide},
  { templateId: '#template-exploration-slide', bootstrap: clabbersSlide },
];

let show = new SlideShow(slides);