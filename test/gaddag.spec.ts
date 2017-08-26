import { Gaddag, GaddagNode } from '../src/gaddag';
import { expect } from 'chai';

const wordList = [
  'all',
  'call',
  'caller',
  'calls',
  'fall',
  'onomatopoeia',
  'retains',
  'retinas',
];

describe('Gaddag', () => {
  let gaddag: Gaddag;
  beforeEach(() => {
    gaddag = undefined;
  }) ;

  it('creates', () => {
    expect(gaddag).to.be.undefined;
    gaddag = new Gaddag();
    expect(gaddag).to.not.be.undefined;
  });

  describe('when empty', () => {
    beforeEach(() => {
      gaddag = new Gaddag();
    });

    it('computes empty size', () => {
      expect(gaddag.size()).to.be.equal(1);
    });

    it('computes raw size', () => {
      expect(gaddag.rawSize()).to.be.equal(1);
    });

    it('addWord adds single word', () => {
      expect(gaddag.allWords().length).to.be.equal(0);
      gaddag.addWord('all');
      expect(gaddag.allWords().length).to.be.equal(1);
    });
  });

  describe('when a single word (call) is loaded', () => {
    beforeEach(() => {
      gaddag = new Gaddag();
      gaddag.addWord('call');
    });

    it('size returns expected number of nodes', () => {
      expect(gaddag.size()).to.be.equal(16);
    });

    it('getEdges returns the correct number of edges', () => {
      expect(gaddag.getEdges().length).to.be.equal(17);
    });

    it('rawSize estimates the unminized number of nodes', () => {
      expect(gaddag.rawSize()).to.be.equal(18);
    });

    it('compressionRate computes compression rate by comparing rawSize and actual size', () => {
      expect(gaddag.compressionRate()).to.be.equal(16/18);
    })

  });

  describe('when loaded with wordList', () => {
    beforeEach(() => {
      gaddag = new Gaddag();
      wordList.forEach(w => gaddag.addWord(w));
    });

    it('allWords returns all words', () => {
      let words = gaddag.allWords();
      expect(words.length).to.be.equal(wordList.length);
      words.forEach(w => expect(wordList.indexOf(w)).to.be.greaterThan(-1));
    });

    describe('wordsForHand', () => {
      it('finds exact matches', () => {
        let matches = gaddag.wordsForHand('all');
        expect(matches.length).to.be.equal(1);
        expect(matches[0]).to.be.equal('all');
      });

      it('finds sub-matches', () => {
        let matches = gaddag.wordsForHand('call', false);
        expect(matches.length).to.be.equal(2);
        expect(matches).to.contain('call');
        expect(matches).to.contain('all');
      });

      it('ensures all non-blank letters used if mustUseAllNonBlanks', () => {
        let matches = gaddag.wordsForHand('c?ll', true);
        expect(matches.length).to.be.equal(1)
        expect(matches[0]).to.be.equal('call');
      });

      it('uses ? as a blank tile', () => {
        let matches = gaddag.wordsForHand('cll?');
        expect(matches.length).to.be.equal(2);
        expect(matches).to.contain('call');
        expect(matches).to.contain('all');
      });

      it('returns an empty array when no matches', () => {
        let matches = gaddag.wordsForHand('zyzzyva', true);
        expect(matches).to.be.an('array').that.is.empty;
      });

      it('sets step information on node metadata', () => {
        gaddag.wordsForHand('cll?');
        let nodes = gaddag.getNodesByDepth();
        expect(nodes['0'][0].meta['step']).to.be.equal(0);
        nodes['1'].forEach(node => expect(node.meta['step']).to.be.equal(1));
        expect(nodes['2'].every(node => node.meta['step'] == undefined || node.meta['step'] === 2)).to.be.true;
        expect(nodes['3'].every(node => node.meta['step'] == undefined || node.meta['step'] === 3)).to.be.true;
        expect(nodes['4'].every(node => node.meta['step'] == undefined || node.meta['step'] === 4)).to.be.true;
        expect(nodes['5'].every(node => node.meta['step'] == undefined)).to.be.true;
      });

      it('sets result information on node metadata', () => {
        gaddag.wordsForHand('cll?');
        let nodes = gaddag.getNodesByDepth();
        expect(nodes['0'][0].meta['result']).to.be.equal('step');
        
        let levelOne = nodes['1'].map(node => node.meta['result']);
        expect(levelOne).to.be.lengthOf(13);
        expect(levelOne.filter(r => r === 'step')).to.be.lengthOf(4);
        expect(levelOne.filter(r => r === 'halt')).to.be.lengthOf(9);

        let levelTwo = nodes['2'].map(node => node.meta['result']);
        expect(levelTwo).to.be.lengthOf(32);
        expect(levelTwo.filter(r => r === undefined)).to.be.lengthOf(27);
        expect(levelTwo.filter(r => r === 'step')).to.be.lengthOf(4);
        expect(levelTwo.filter(r => r === 'halt')).to.be.lengthOf(1);

        let levelThree = nodes['3'].map(node => node.meta['result']);
        expect(levelThree).to.be.lengthOf(35);
        expect(levelThree.filter(r => r === undefined)).to.be.lengthOf(31);
        expect(levelThree.filter(r => r === 'success')).to.be.lengthOf(1);
        expect(levelThree.filter(r => r === 'halt')).to.be.lengthOf(3);

        let levelFour = nodes['4'].map(node => node.meta['result']);
        expect(levelFour).to.be.lengthOf(31);
        expect(levelFour.filter(r => r === undefined)).to.be.lengthOf(30);
        expect(levelFour.filter(r => r === 'success')).to.be.lengthOf(1);

        // All others should be undefined
        Object.keys(nodes).filter(k => parseInt(k) > 4)
          .forEach(k => nodes[k]
            .forEach(node => expect(node.meta['result']).to.be.undefined));
      });

      it('clears information between calls', () => {
        gaddag.wordsForHand('cll?');
        let nodes = gaddag.getNodesByDepth();
        expect(nodes['4'].filter(node => node.meta['result'] === 'success' )).to.not.be.empty;
        gaddag.wordsForHand('zz');
        nodes = gaddag.getNodesByDepth();
        expect(nodes['4'].filter(node => node.meta['result'] === 'success' )).to.be.empty;
      });
    });

    describe('wordsContaining', () => {
      it('finds words by prefix', () => {
        let wordsPrefixedByAll = wordList.filter(w => w.match(/^all/));
        let matches = gaddag.wordsContaining('all');
        wordsPrefixedByAll.forEach(w => expect(matches.indexOf(w)).to.be.greaterThan(-1));
      });

      it('finds words by suffix', () => {
        let wordsSuffixedByAll = wordList.filter(w => w.match(/all$/));
        let matches = gaddag.wordsContaining('all');
        wordsSuffixedByAll.forEach(w => expect(matches.indexOf(w)).to.be.greaterThan(-1));
      });

      it('finds words by substring', () => {
        let wordsContainingAll = wordList.filter(w => w.match(/all/));
        let matches = gaddag.wordsContaining('all');
        expect(matches.length).to.be.equal(5);
        expect(matches.length).to.be.equal(wordsContainingAll.length);
        wordsContainingAll.forEach(w => expect(matches.indexOf(w)).to.be.greaterThan(-1));
      });

      it('returns an empty array when no matches', () => {
        let matches = gaddag.wordsContaining('zyzzyva');
        expect(matches).to.be.an('array').that.is.empty;
      });

      it('sets result metadata', () => { throw 'not implemented' });
      
      it('sets step metadata', () => { throw 'not implemented' });

      it('clears metadata between calls', () => { throw 'not implemented' });

    });

    describe('getNodes', () => {
      it('returns same number of nodes reported by size', () => {
        let size = gaddag.size();
        let nodes = gaddag.getNodes();
        expect(size).to.be.equal(nodes.length);
      });
    });

    describe('getNodesByDepth', () => {
      it('returns same number of nodes as getNodes', () => {
        let nodes = gaddag.getNodes();
        let nodesByDepth = gaddag.getNodesByDepth();
        let totalNodes = Object.keys(nodesByDepth).map(k => nodesByDepth[k].length).reduce((a,b) => a + b, 0);
        expect(totalNodes).to.be.equal(nodes.length);
      });

      it('returns same nodes as getNodes', () => {
        let nodes = gaddag.getNodes();
        let nodesByDepth = gaddag.getNodesByDepth();
        Object.keys(nodesByDepth)
          .forEach(k =>
            nodesByDepth[k].forEach(node =>
              expect(nodes.indexOf(node)).to.be.greaterThan(-1)));
      });
    });

    describe('wordsForPrefix', () => {
      it('finds single words', () => {
        let matches = gaddag.wordsForPrefix('ono');
        expect(matches.length).to.be.equal(1);
        expect(matches[0]).to.be.equal('onomatopoeia');
      });

      it('finds all matching words', () => {
        let matches = gaddag.wordsForPrefix('cal');
        expect(matches.length).to.be.equal(3)
      });

      it('finds exact match when match has suffixes', () => {
        let matches = gaddag.wordsForPrefix('call');
        expect(matches.length).to.be.equal(3);
        expect(matches.indexOf('call')).to.be.greaterThan(-1);
      });

      it('returns an empty array when no matches', () => {
        let matches = gaddag.wordsForPrefix('zyzzyva');
        expect(matches).to.be.an('array').that.is.empty;
      });

      it('sets result metadata', () => { throw 'not implemented' });
      
      it('sets step metadata', () => { throw 'not implemented' });

      it('clears metadata between calls', () => { throw 'not implemented' });
    });

    describe('wordsForSuffix', () => {
      it('finds single words', () => {
        let matches = gaddag.wordsForSuffix('eia');
        expect(matches.length).to.be.equal(1);
        expect(matches[0]).to.be.equal('onomatopoeia');
      });

      it('finds all matching words', () => {
        let matches = gaddag.wordsForSuffix('ll');
        expect(matches.length).to.be.equal(3)
      });

      it('finds exact match when match has suffixes', () => {
        let matches = gaddag.wordsForSuffix('all');
        expect(matches.length).to.be.equal(3);
        expect(matches.indexOf('all')).to.be.greaterThan(-1);
      });

      it('returns an empty array when no matches', () => {
        let matches = gaddag.wordsForSuffix('zyzzyva');
        expect(matches).to.be.an('array').that.is.empty;
      });

      it('sets result metadata', () => { throw 'not implemented' });
      
      it('sets step metadata', () => { throw 'not implemented' });

      it('clears metadata between calls', () => { throw 'not implemented' });
    });

    describe('checkWord', () => {
      it('returns false when gaddag does not contains word', () => {
        let result = gaddag.checkWord('zyzzyva');
        expect(result).to.be.false;
      });

      it('returns false when gaddag does not explicitly contain complete word', () => {
        // Gaddag contains `retains` but not `retain`
        let result = gaddag.checkWord('retains');
        let subwordResult = gaddag.checkWord('retain');
        expect(result).to.be.true;
        expect(subwordResult).to.be.false;
      });

      it('returns true when gaddag contains standalone word', () => {
        let result = gaddag.checkWord('retains');
        expect(result).to.be.true;
      });

      it('returns true when gaddag contains word with prefix', () => {
        let overlappingWordResult = gaddag.checkWord('call');
        let result = gaddag.checkWord('all');
        expect(overlappingWordResult).to.be.true;
        expect(result).to.be.true;
      });

      it('returns true when gaddag contains word with suffix', () => {
        let overlappingWordResult = gaddag.checkWord('caller');
        let result = gaddag.checkWord('call');
        expect(overlappingWordResult).to.be.true;
        expect(result).to.be.true;
      });

      it('sets result metadata', () => { throw 'not implemented' });
      
      it('sets step metadata', () => { throw 'not implemented' });

      it('clears metadata between calls', () => { throw 'not implemented' });
    });

    describe('wordsForHandByPermutation', () => {
      let result: {[permutation: string]: string[]};

      // Somewhat expensive - compute once and share for tests
      before(() => {
        result = gaddag.wordsForHandByPermutation('aeinrst');
      });

      it('returns a result for every hand permutation', () => {
        expect(Object.keys(result).length).to.be.equal(5040 /* 7! */);
      });

      it('finds all matches for hand', () => {
        let totalResults = Object.keys(result)
          .map(k => result[k].length)
          .reduce((a, b) => a+b);
        expect(totalResults).to.be.equal(2);
      });

      it('finds matches for each permutation', () => {
        expect(result['retains'].length).to.be.equal(1);
        expect(result['retains']).to.contain('retains');
        expect(result['retinas'].length).to.be.equal(1);
        expect(result['retinas']).to.contain('retinas');
      });
    });

    describe('wordsOfLength', () => {
      it('returns an empty array when no words of given length', () => {
        let result = gaddag.wordsOfLength(500);
        expect(result).to.be.an('array').that.is.empty;
      });

      it('returns an empty array when passed length less than 1', () => {
        expect(gaddag.wordsOfLength(0)).to.be.an('array').that.is.empty;
      });

      it('finds matching words', () => {
        let result = gaddag.wordsOfLength(4);
        expect(result.length).to.be.equal(2);
        expect(result).to.contain('call');
        expect(result).to.contain('fall');
      });
    });
  })

});