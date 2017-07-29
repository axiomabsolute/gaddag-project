import * as d3 from 'd3';
import { Dictionary, flatten, Gaddag, GaddagEdge, GaddagNode, values } from '../gaddag';
import { Fix } from '../browser';

function diagonal(source: VisualNode, target: VisualNode) {
  return "M" + target.x + "," + target.y
      + "C" + (source.x + 100) + "," + target.y
      + " " + (source.x + 100) + "," + source.y
      + " " + source.x + "," + source.y;
}

class VisualNode {
  public meta: Dictionary<any>;
  constructor(public node: GaddagNode, public x: number, public y: number) {
    this.meta = {};
  }
}

function update(
  frame: d3.Selection<Element | d3.EnterElement | Document | Window, {}, null, undefined>,
  width: number,
  height: number,
  dag: Gaddag,
  pattern: string
) {
    let dagEdges = dag.getEdges();
    let root = dag.root;

    let nodesByDepth = [[root]].concat(values(dag.getNodesByDepth()));
    let depth = nodesByDepth.length;
    let breadth = d3.max(nodesByDepth.map(t => t.length));

    let xScale = d3.scaleLinear()
      .domain([0, depth])
      .range([0, width]);
    
    let yScale = d3.scaleLinear()
      .domain([0, breadth])
      .range([height, 0]);

    let nodeData = flatten(nodesByDepth.map( (tier, i) => tier.map((node, j) => new VisualNode(node, xScale(i), yScale(j)))));
    let nodeLookup = Dictionary.ToLookup<VisualNode, VisualNode>(nodeData, vn => '' + vn.node.id, vn => vn);

    let links = frame.selectAll('.link')
      .data(dagEdges);
    
    links
      .enter().append('path')
      .merge(links)
      .attr('class', 'link')
      .attr('d', d => diagonal( nodeLookup[''+d.source], nodeLookup[''+d.target] ));

    let nodes = frame.selectAll('.node')
      .data(nodeData);
    
    let newNodeGroups = nodes.enter().append('g');

    let nodeGroups = newNodeGroups
      .merge(nodes)
        .attr('class', d => {
          if (d.node === dag.root) {
            return 'node dag-root';
          }
          if (d.node.token === Gaddag.TurnToken) {
            return 'node dag-node node--turn';
          }
          if (d.node.isCompleteWord) {
            return 'node dag-node node--complete-word'
          }
          return 'node dag-node';
        })
        .attr('transform', d => `translate(${d.x},${d.y})`);
    
    newNodeGroups
      .append('circle')
        .attr('r', '8')
        .attr('fill', (d) => {
          if (d.node === dag.root) {
            return 'black';
          }
          if (d.node.token === Gaddag.TurnToken) {
            return d3.schemeCategory10[1];
          }
          if (d.node.isCompleteWord) {
            return d3.schemeCategory10[2];
          }
          return d3.schemeCategory10[0];
        });
    
    newNodeGroups
      .append('text')
      .attr('dy', 3)
      .attr('x', d => d.node.children ? -12 : 12)
      .style('text-anchor', d => d.node.children ? 'end' : 'start')
      .text(d => d.node.token);
      

    let anyWindow: any = window;
    anyWindow['dag'] = dag;
}

export class InitialState{
  constructor( public dataLoaded: Promise<[string[], Fix[]]>, public dag: Gaddag, public expanded: boolean = false) {}
}

export function bootstrap(host: Element, initialState: InitialState) {

  let svg = d3.select(host).select("svg"),
    d3Host = d3.select(host),
    rawWidth = +svg.attr('width'),
    rawHeight = +svg.attr('height'),
    margin = { top: 60, right: 120, bottom: 120, left: 120 },
    width = rawWidth - margin.right - margin.left,
    height = rawHeight - margin.top - margin.bottom;

  svg
    .attr('height', rawHeight)
    .attr('width', rawWidth);

  let frame = svg
    .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`) ;

  initialState.dataLoaded.then(() => {
    d3.select(document.querySelector('.add-word-button'))
      .on('click', function() {
        let wordToAdd = (<HTMLInputElement>document.querySelector('#add-word')).value;
        if (!wordToAdd) { return; }
        initialState.dag.addWord(wordToAdd);
        update(frame, width, height, initialState.dag, '')
      });

    update(frame, width, height, initialState.dag, '')
  })
}