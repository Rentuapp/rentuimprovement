import React from 'react';
import '@testing-library/jest-dom';

import { renderWithProviders as render } from '../util/testHelpers';

import {
  zwspAroundSpecialCharsSplit,
  linkifyOrWrapLinkSplit,
  wrapLongWord,
  richText,
} from './richText';

describe('richText', () => {
  // There variables contain zero-width-space on both sides of the visible character.
  const slashWithZWSP = '​/​';
  const commaWithZWSP = '​,​';
  const dollarSignWithZWSP = '​$​';
  const backslashWithZWSP = '​\\​';

  describe('zwspAroundSpecialChars(word, optionalBreakingChars)', () => {
    it('should not add anything to strings withouth word boundary', () => {
      expect(zwspAroundSpecialCharsSplit('word')).toEqual(['word']);
    });
    it('should add zwsp to a word with slash', () => {
      expect(zwspAroundSpecialCharsSplit('word/another')).toEqual([
        'word',
        slashWithZWSP,
        'another',
      ]);
    });
    it('should add zwsp to strings with spaces and slashes', () => {
      expect(zwspAroundSpecialCharsSplit('word one/another/third word')).toEqual([
        'word one',
        slashWithZWSP,
        'another',
        slashWithZWSP,
        'third word',
      ]);
    });
    it('should add zwsp to strings with spaces and slashes when "/" is given', () => {
      expect(zwspAroundSpecialCharsSplit('word one/another/third word', '/')).toEqual([
        'word one',
        slashWithZWSP,
        'another',
        slashWithZWSP,
        'third word',
      ]);
    });

    it('should add zwsp to strings with given char (","), no char', () => {
      expect(zwspAroundSpecialCharsSplit('word/another', ',')).toEqual(['word/another']);
    });
    it('should add zwsp to strings with given char (","), single char', () => {
      expect(zwspAroundSpecialCharsSplit('word,another', ',')).toEqual([
        'word',
        commaWithZWSP,
        'another',
      ]);
    });
    it('should add zwsp to strings with given chars (","), single char and spaces', () => {
      expect(zwspAroundSpecialCharsSplit('word,another/third forth', ',')).toEqual([
        'word',
        commaWithZWSP,
        'another/third forth',
      ]);
    });

    it('should add zwsp to strings with given chars (",/"): multiple occurrences', () => {
      expect(
        zwspAroundSpecialCharsSplit('word/another/third,fourth and fifth,sixth', ',/')
      ).toEqual([
        'word',
        slashWithZWSP,
        'another',
        slashWithZWSP,
        'third',
        commaWithZWSP,
        'fourth and fifth',
        commaWithZWSP,
        'sixth',
      ]);
    });
    it('should add zwsp to strings with given chars (",/:"), when not-found-chars are included', () => {
      expect(zwspAroundSpecialCharsSplit('word/another,third', '.,/:')).toEqual([
        'word',
        slashWithZWSP,
        'another',
        commaWithZWSP,
        'third',
      ]);
    });

    it('should add zwsp to strings with given chars ("?\\$") escapable chars not found', () => {
      expect(zwspAroundSpecialCharsSplit('word/another,third', '?\\$')).toEqual([
        'word/another,third',
      ]);
    });
    it('should add zwsp to strings with given chars ("?\\$") escapable chars $ found', () => {
      expect(zwspAroundSpecialCharsSplit('word/another$third', '?\\$')).toEqual([
        'word/another',
        dollarSignWithZWSP,
        'third',
      ]);
    });
    it('should add zwsp to strings with given chars ("?\\$") escapable chars backslash found', () => {
      expect(zwspAroundSpecialCharsSplit('word/another\\third', '?\\$')).toEqual([
        'word/another',
        backslashWithZWSP,
        'third',
      ]);
    });
  });

  describe('wrapLongWord(word, key, longWordMinLength, longWordClass)', () => {
    it('should not add anything to short word', () => {
      const wrapper = render(
        <span>
          {wrapLongWord('word', 'key', { longWordMinLength: 10, longWordClass: 'longWord' })}
        </span>
      );
      const htmlString = wrapper.asFragment().firstChild.outerHTML;
      expect(htmlString).toEqual('<span>word</span>');
    });
    it('should add span around long word', () => {
      const wrapper = render(
        <span>
          {wrapLongWord('Pneumonoultramicroscopicsilicovolcanoconiosis', 'key', {
            longWordMinLength: 10,
            longWordClass: 'longWord',
          })}
        </span>
      );
      const htmlString = wrapper.asFragment().firstChild.outerHTML;
      expect(htmlString).toEqual(
        '<span><span class="longWord">Pneumonoultramicroscopicsilicovolcanoconiosis</span></span>'
      );
    });
  });

  describe('linkifyOrWrapLinkSplit(word, key, linkClass)', () => {
    it('should not add anything to words without links', () => {
      const wrapper = render(
        <span>
          {linkifyOrWrapLinkSplit('word', 'key', { linkify: true, linkClass: 'linkClass' })}
        </span>
      );
      const htmlString = wrapper.asFragment().firstChild.outerHTML;
      expect(htmlString).toEqual('<span>word</span>');
    });
    it('should add link around words that are links', () => {
      const wrapper = render(
        <span>
          {linkifyOrWrapLinkSplit('http://www.example.com', 'key', {
            linkify: true,
            linkClass: 'linkClass',
          })}
        </span>
      );
      const htmlString = wrapper.asFragment().firstChild.outerHTML;
      expect(htmlString).toEqual(
        '<span><a href="http://www.example.com" class="linkClass" target="_blank" rel="noopener noreferrer">http://www.example.com</a></span>'
      );
    });
    it('should add link around words that are links even inside parenthesis', () => {
      const wrapper = render(
        <span>
          {linkifyOrWrapLinkSplit('(http://www.example.com)', 'key', {
            linkify: true,
            linkClass: 'linkClass',
          })}
        </span>
      );
      const htmlString = wrapper.asFragment().firstChild.outerHTML;
      expect(htmlString).toEqual(
        '<span>(<a href="http://www.example.com" class="linkClass" target="_blank" rel="noopener noreferrer">http://www.example.com</a>)</span>'
      );
    });
    it('should add link around words that are links even inside brackets', () => {
      const wrapper = render(
        <span>
          {linkifyOrWrapLinkSplit('[http://www.example.com]', 'key', {
            linkify: true,
            linkClass: 'linkClass',
          })}
        </span>
      );
      const htmlString = wrapper.asFragment().firstChild.outerHTML;
      expect(htmlString).toEqual(
        '<span>[<a href="http://www.example.com" class="linkClass" target="_blank" rel="noopener noreferrer">http://www.example.com</a>]</span>'
      );
    });
  });

  describe('richText(text, { longWordMinLength, longWordClass })', () => {
    const options = { longWordMinLength: 10, longWordClass: 'longWord' };

    it('should not add anything to strings with short words', () => {
      const wrapper = render(<span>{richText('word word word', options)}</span>);

      const htmlString = wrapper.asFragment().firstChild.outerHTML;
      expect(htmlString).toEqual('<span>word word word</span>');
    });
    it('should add span around a string with a single long word', () => {
      const wrapper = render(
        <span>
          {richText(
            'word Pneumonoultramicroscopicsilicovolcanoconiosis is the longest word',
            options
          )}
        </span>
      );
      const htmlString = wrapper.asFragment().firstChild.outerHTML;
      expect(htmlString).toEqual(
        '<span>word <span class="longWord">Pneumonoultramicroscopicsilicovolcanoconiosis</span> is the longest word</span>'
      );
    });
    it('should add span around a string with multiple long words', () => {
      const wrapper = render(
        <span>
          {richText(
            'word Pneumonoultramicroscopicsilicovolcanoconiosis is the longest word - Pseudopseudohypoparathyroidism is shorter',
            options
          )}
        </span>
      );
      const htmlString = wrapper.asFragment().firstChild.outerHTML;
      expect(htmlString).toEqual(
        '<span>word <span class="longWord">Pneumonoultramicroscopicsilicovolcanoconiosis</span> is the longest word - <span class="longWord">Pseudopseudohypoparathyroidism</span> is shorter</span>'
      );
    });

    it('should add span around a string with multiple long words and containing slashes', () => {
      const wrapper = render(
        <span>{richText('Chars one/two/three - count until exhaustion…', options)}</span>
      );
      // <span>
      //   Chars one​/​two​/​three - count until <span class=\"classX\">exhaustion…</span>
      // </span>
      const htmlString = wrapper.asFragment().firstChild.outerHTML;
      expect(htmlString).toEqual(
        `<span>Chars one${slashWithZWSP}two${slashWithZWSP}three - count until <span class="longWord">exhaustion…</span></span>`
      );
    });

    it('should add span around a string with a long word and containing slashes and commas', () => {
      const wrapper = render(
        <span>{richText('Chars one/two/three, count until exhaustion…', options)}</span>
      );
      // <span>
      //   Chars one​/​two​/​three​,​ count until <span class=\"classX\">exhaustion…</span>
      // </span>
      const htmlString = wrapper.asFragment().firstChild.outerHTML;
      expect(htmlString).toEqual(
        `<span>Chars one${slashWithZWSP}two${slashWithZWSP}three${commaWithZWSP} count until <span class="longWord">exhaustion…</span></span>`
      );
    });

    it('should add span around a string with a long word, containing slashes and a link', () => {
      const wrapper = render(
        <span>
          {richText(
            'Chars one/two/three - count until exhaustion… and a random link: http://www.example.com',
            { ...options, linkify: true, linkClass: 'link' }
          )}
        </span>
      );
      // <span>
      //   Chars one​/​two​/​three - count until <span class=\"classX\">exhaustion…</span> and a random link: <a href=\"http://www.example.com\" target=\"_blank\" rel=\"noopener noreferrer\">http://www.example.com</a>
      // </span>
      const htmlString = wrapper.asFragment().firstChild.outerHTML;
      expect(htmlString).toEqual(
        `<span>Chars one${slashWithZWSP}two${slashWithZWSP}three - count until <span class="longWord">exhaustion…</span> and a random link: <a href="http://www.example.com" class="link" target="_blank" rel="noopener noreferrer">http://www.example.com</a></span>`
      );
    });
    it('should add link inside non-whitespace-sequence (http://example.com)', () => {
      const wrapper = render(
        <span>{richText('Link: (http://example.com)', { ...options, linkify: true })}</span>
      );
      // <span>
      //   Link: (<a href=\"http://example.com\" target=\"_blank\" rel=\"noopener noreferrer\">http://example.com</a>)
      // </span>
      const htmlString = wrapper.asFragment().firstChild.outerHTML;
      expect(htmlString).toEqual(
        `<span>Link: (<a href="http://example.com" class="longWord" target="_blank" rel="noopener noreferrer">http://example.com</a>)</span>`
      );
    });

    it('should add link inside non-whitespace-sequence ((http://example.com/path_(etc)))', () => {
      const wrapper = render(
        <span>
          {richText('Link: ((http://example.com/path_(etc))) asdf', { ...options, linkify: true })}
        </span>
      );
      // <span>
      //   Link: (<a href=\"http://example.com\" target=\"_blank\" rel=\"noopener noreferrer\">http://example.com</a>)
      // </span>
      const htmlString = wrapper.asFragment().firstChild.outerHTML;
      expect(htmlString).toEqual(
        `<span>Link: ((<a href="http://example.com/path_(etc)" class="longWord" target="_blank" rel="noopener noreferrer">http://example.com/path_(etc)</a>)) asdf</span>`
      );
    });

    it('should add link inside non-whitespace-sequence: ((http://example.com/path_(etc)', () => {
      const wrapper = render(
        <span>
          {richText('Link: ((http://example.com/path_(etc) asdf', { ...options, linkify: true })}
        </span>
      );
      // <span>
      //   Link: (<a href=\"http://example.com\" target=\"_blank\" rel=\"noopener noreferrer\">http://example.com</a>)
      // </span>
      const htmlString = wrapper.asFragment().firstChild.outerHTML;
      expect(htmlString).toEqual(
        `<span>Link: ((<a href="http://example.com/path_(etc)" class="longWord" target="_blank" rel="noopener noreferrer">http://example.com/path_(etc)</a> asdf</span>`
      );
    });

    it('should add link inside non-whitespace-sequence: ((http://example.com/path_(etc', () => {
      const wrapper = render(
        <span>
          {richText('Link: ((http://example.com/path_(etc asdf', { ...options, linkify: true })}
        </span>
      );
      // <span>
      //   Link: (<a href=\"http://example.com\" target=\"_blank\" rel=\"noopener noreferrer\">http://example.com</a>)
      // </span>
      const htmlString = wrapper.asFragment().firstChild.outerHTML;
      expect(htmlString).toEqual(
        `<span>Link: ((<a href="http://example.com/path_(etc" class="longWord" target="_blank" rel="noopener noreferrer">http://example.com/path_(etc</a> asdf</span>`
      );
    });

    it('should add link inside non-whitespace-sequence: ((http://example.com/path_etc)', () => {
      const wrapper = render(
        <span>
          {richText('Link: ((http://example.com/path_etc) asdf', { ...options, linkify: true })}
        </span>
      );
      // <span>
      //   Link: (<a href=\"http://example.com\" target=\"_blank\" rel=\"noopener noreferrer\">http://example.com</a>)
      // </span>
      const htmlString = wrapper.asFragment().firstChild.outerHTML;
      expect(htmlString).toEqual(
        `<span>Link: ((<a href="http://example.com/path_etc" class="longWord" target="_blank" rel="noopener noreferrer">http://example.com/path_etc</a>) asdf</span>`
      );
    });

    it('should add link inside non-whitespace-sequence: ((http://example.com/path_(etc))', () => {
      const wrapper = render(
        <span>
          {richText('Link: ((http://example.com/path_(etc)) asdf', { ...options, linkify: true })}
        </span>
      );
      // <span>
      //   Link: (<a href=\"http://example.com\" target=\"_blank\" rel=\"noopener noreferrer\">http://example.com</a>)
      // </span>
      const htmlString = wrapper.asFragment().firstChild.outerHTML;
      expect(htmlString).toEqual(
        `<span>Link: ((<a href="http://example.com/path_(etc)" class="longWord" target="_blank" rel="noopener noreferrer">http://example.com/path_(etc)</a>) asdf</span>`
      );
    });

    it('should add link inside non-whitespace-sequence: ((http://example.com/path(_(etc))', () => {
      const wrapper = render(
        <span>
          {richText('Link: ((http://example.com/path(_(etc)) asdf', { ...options, linkify: true })}
        </span>
      );
      // <span>
      //   Link: (<a href=\"http://example.com\" target=\"_blank\" rel=\"noopener noreferrer\">http://example.com</a>)
      // </span>
      const htmlString = wrapper.asFragment().firstChild.outerHTML;
      expect(htmlString).toEqual(
        `<span>Link: ((<a href="http://example.com/path(_(etc))" class="longWord" target="_blank" rel="noopener noreferrer">http://example.com/path(_(etc))</a> asdf</span>`
      );
    });

    it('should add link inside non-whitespace-sequence that ends to common puctuation (!:,.;)', () => {
      // !
      const wrapper = render(
        <span>{richText('Check this http://example.com!', { ...options, linkify: true })}</span>
      );
      // <span>
      //   Check this <a href=\"http://example.com\" target=\"_blank\" rel=\"noopener noreferrer\">http://example.com</a>!
      // </span>
      const htmlString = wrapper.asFragment().firstChild.outerHTML;
      expect(htmlString).toEqual(
        `<span>Check this <a href="http://example.com" class="longWord" target="_blank" rel="noopener noreferrer">http://example.com</a>!</span>`
      );

      // :
      const colon = render(
        <span>
          {richText('Check this http://example.com: asdf', { ...options, linkify: true })}
        </span>
      );
      expect(colon.asFragment().firstChild.outerHTML).toEqual(
        `<span>Check this <a href="http://example.com" class="longWord" target="_blank" rel="noopener noreferrer">http://example.com</a>: asdf</span>`
      );

      // ,
      // Note: comma is part of break chars by default, therefore zero-width-space is added there
      const comma = render(
        <span>
          {richText('Check this http://example.com, asdf', { ...options, linkify: true })}
        </span>
      );
      expect(comma.asFragment().firstChild.outerHTML).toEqual(
        `<span>Check this <a href=\"http://example.com\" class=\"longWord\" target=\"_blank\" rel=\"noopener noreferrer\">http://example.com</a>​,​ asdf</span>`
      );

      // .
      const dot = render(
        <span>
          {richText('Check this http://example.com. Asdf', { ...options, linkify: true })}
        </span>
      );
      expect(dot.asFragment().firstChild.outerHTML).toEqual(
        `<span>Check this <a href="http://example.com" class="longWord" target="_blank" rel="noopener noreferrer">http://example.com</a>. Asdf</span>`
      );

      // ;
      const semicolon = render(
        <span>
          {richText('Check this http://example.com; and this http://example.com', {
            ...options,
            linkify: true,
          })}
        </span>
      );
      expect(semicolon.asFragment().firstChild.outerHTML).toEqual(
        `<span>Check this <a href=\"http://example.com\" class=\"longWord\" target=\"_blank\" rel=\"noopener noreferrer\">http://example.com</a>; and this <a href=\"http://example.com\" class=\"longWord\" target=\"_blank\" rel=\"noopener noreferrer\">http://example.com</a></span>`
      );
    });

    it('should not include quote chars to link (http://example.com")', () => {
      const wrapper = render(
        <span>{richText('Link: (http://example.com")', { ...options, linkify: true })}</span>
      );
      // <span>
      //   Link: (<a href=\"http://example.com\" target=\"_blank\" rel=\"noopener noreferrer\">http://example.com</a>)
      // </span>
      const htmlString = wrapper.asFragment().firstChild.outerHTML;
      expect(htmlString).toEqual(
        `<span>Link: (<a href="http://example.com" class="longWord" target="_blank" rel="noopener noreferrer">http://example.com</a>\")</span>`
      );

      const singleQuote = render(
        <span>{richText("Link: (http://example.com')", { ...options, linkify: true })}</span>
      );
      expect(singleQuote.asFragment().firstChild.outerHTML).toEqual(
        `<span>Link: (<a href="http://example.com" class="longWord" target="_blank" rel="noopener noreferrer">http://example.com</a>\')</span>`
      );

      const singleQuote2 = render(
        <span>{richText("Link: (http://example.com')", { ...options, linkify: true })}</span>
      );
      expect(singleQuote2.asFragment().firstChild.outerHTML).toEqual(
        `<span>Link: (<a href="http://example.com" class="longWord" target="_blank" rel="noopener noreferrer">http://example.com</a>\')</span>`
      );
    });
    it('should not include closing anchor tag to a link (http://example.com</a>")', () => {
      // Note: the slash ('/') is part of break chars by default, therefore zero-width-space is added there
      const wrapper = render(
        <span>{richText('Link: (http://example.com</a>)', { ...options, linkify: true })}</span>
      );
      const htmlString = wrapper.asFragment().firstChild.outerHTML;
      expect(htmlString).toEqual(
        `<span>Link: (<a href="http://example.com" class="longWord" target="_blank" rel="noopener noreferrer">http://example.com</a>&lt;​/​a&gt;)</span>`
      );
    });

    it('should not add span around a string if no linkify option is given', () => {
      const wrapper = render(
        <span>
          {richText(
            'Chars one/two/three - count until exhaustion… and a random link: http://www.example.com',
            options
          )}
        </span>
      );
      // <span>
      //   Chars one​/​two​/​three - count until <span class=\"classX\">exhaustion…</span> and a random link: http:​/​​/​<span class=\"longWord\">www.example.com</span>
      // </span>
      const htmlString = wrapper.asFragment().firstChild.outerHTML;
      expect(htmlString).toEqual(
        `<span>Chars one${slashWithZWSP}two${slashWithZWSP}three - count until <span class="longWord">exhaustion…</span> and a random link: <span class="longWord">http://www.example.com</span></span>`
      );
    });
  });
});
