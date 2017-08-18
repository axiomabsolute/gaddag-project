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
      gaddag.addWord('anything');
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

    });

  })

});