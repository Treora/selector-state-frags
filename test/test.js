import assert from 'assert'

import { specificResourceToUri, uriToSpecificResource } from '../src'

// Examples from the spec:
// https://www.w3.org/TR/selectors-states/#json-examples-converted-to-fragment-identifiers
const pairs = {

    'Example 2 <=> 16: Fragment selector': {
        uri: 'http://example.org/video1#selector(type=FragmentSelector,conformsTo=http://www.w3.org/TR/media-frags/,value=t%3D30%2C60)',
        obj: {
            "source": "http://example.org/video1",
            "selector": {
              "type": "FragmentSelector",
              "conformsTo": "http://www.w3.org/TR/media-frags/",
              "value": "t=30,60"
            }
        }
    },

    'Example 3 <=> 17: CSS selector': {
        uri: 'http://example.org/page1.html#selector(type=CssSelector,value=%23elemid%20>%20.elemclass%20+%20p)',
        obj: {
            "source": "http://example.org/page1.html",
            "selector": {
              "type": "CssSelector",
              "value": "#elemid > .elemclass + p"
            }
        }
    },

    'Example 4 <=> 18: XPath selector': {
        uri: 'http://example.org/page1.html#selector(type=XPathSelector,value=/html/body/p[2]/table/tr[2]/td[3]/span)',
        obj: {
            "source": "http://example.org/page1.html",
            "selector": {
              "type": "XPathSelector",
              "value": "/html/body/p[2]/table/tr[2]/td[3]/span"
            }
        }
    },

    'Example 5 <=> 19: TextQuote selector': {
        uri: 'http://example.org/page1#selector(type=TextQuoteSelector,exact=annotation,prefix=this%20is%20an%20,suffix=%20that%20has%20some)',
        obj: {
            "source": "http://example.org/page1",
            "selector": {
              "type": "TextQuoteSelector",
              "exact": "annotation",
              "prefix": "this is an ",
              "suffix": " that has some"
            }
        }
    },

    'Example 6 <=> 20: TextPosition selector': {
        uri: 'http://example.org/ebook1#selector(type=TextPositionSelector,start=412,end=795)',
        obj: {
            "source": "http://example.org/ebook1",
            "selector": {
              "type": "TextPositionSelector",
              "start": 412,
              "end": 795
            }
        }
    },

    'Example 7 <=> 21: Data position selector': {
        uri: 'http://example.org/diskimg1#selector(type=DataPositionSelector,start=4096,end=4104)',
        obj: {
            "source": "http://example.org/diskimg1",
            "selector": {
              "type": "DataPositionSelector",
              "start": 4096,
              "end": 4104
            }
        }
    },

    'Example 8 <=> 22: SVG selector; external SVG': {
        uri: 'http://example.org/map1#selector(type=SvgSelector,id=http://example.org/svg1)',
        obj: {
            "source": "http://example.org/map1",
            "selector": {
              "type": "SvgSelector",
              "id": "http://example.org/svg1"
            }
        }
    },

    'Example 9 <=> 23: SVG selector; embedded SVG': {
        uri: 'http://example.org/map1#selector(type=SvgSelector,value=<svg:svg>%20...%20</svg:svg>)',
        obj: {
            "source": "http://example.org/map1",
            "selector": {
              "type": "SvgSelector",
              "value": "<svg:svg> ... </svg:svg>"
            }
        }
    },

    'Example 10 <=> 24: Range selector': {
        uri: 'http://example.org/page1.html#selector(type=RangeSelector,startSelector=selector(type=XPathSelector,value=//table[1]/tr[1]/td[2]),endSelector=selector(type=XPathSelector,value=//table[1]/tr[1]/td[4]))',
        obj: {
            "source": "http://example.org/page1.html",
            "selector": {
              "type": "RangeSelector",
              "startSelector": {
                "type": "XPathSelector",
                "value": "//table[1]/tr[1]/td[2]"
              },
              "endSelector": {
                "type": "XPathSelector",
                "value": "//table[1]/tr[1]/td[4]"
              }
            }
        }
    },

    'Example 11 <=> 25: Selector refinement': {
        uri: 'http://example.org/page1#selector(type=FragmentSelector,value=para5,refinedBy=selector(type=TextQuoteSelector,exact=Selected%20Text,prefix=text%20before%20the%20,suffix=%20and%20text%20after%20it))',
        obj: {
            "source": "http://example.org/page1",
            "selector": {
              "type": "FragmentSelector",
              "value": "para5",
              "refinedBy": {
                "type": "TextQuoteSelector",
                "exact": "Selected Text",
                "prefix": "text before the ",
                "suffix": " and text after it"
              }
            }
        }
    },

    'Example 13 <=> 26: Time state': {
        uri: 'http://example.org/page1#state(type=TimeState,cached=http://archive.example.org/copy1,sourceDate=2015-07-20T13:30:00Z)',
        obj: {
            "source": "http://example.org/page1",
            "state": {
              "type": "TimeState",
              "cached": "http://archive.example.org/copy1",
              "sourceDate": "2015-07-20T13:30:00Z"
            }
        }
    },

    'Example 14 <=> 27: HTTP request state': {
        uri: 'http://example.org/resource1#state(type=HttpRequestState,value=Accept:%20application/pdf)',
        obj: {
            "source": "http://example.org/resource1",
            "state": {
              "type": "HttpRequestState",
              "value": "Accept: application/pdf"
            }
        }
    },

    'Example 15 <=> 28: Refinement of states': {
        uri: 'http://example.org/ebook1#state(type=TimeState,sourceDate=2016-02-01T12:05:23Z,refinedBy=state(type=HttpRequestState,value=Accept:%20application/epub+zip))',
        obj: {
            "source": "http://example.org/ebook1",
            "state": {
              "type": "TimeState",
              "sourceDate": "2016-02-01T12:05:23Z",
              "refinedBy": {
                "type": "HttpRequestState",
                "value": "Accept: application/epub+zip"
              }
            }
        }
    },

    'Example 29: Serializing IRI to URL (and vice versa)': {
        uri: 'http://jp.example.org/page1#selector(type=TextQuoteSelector,exact=%E3%83%9A%E3%83%B3%E3%82%92,prefix=%E7%A7%81%E3%81%AF%E3%80%81,suffix=%E6%8C%81%E3%81%A3%E3%81%A6%E3%81%84%E3%81%BE%E3%81%99)',
        obj: {
            selector: {
                type: 'TextQuoteSelector',
                exact: 'ペンを',
                prefix: '私は、',
                suffix: '持っています',
            },
            source: "http://jp.example.org/page1",
        }
    },

    'Fragment identifier without URI': {
        uri: '#selector(type=TextQuoteSelector,start=12,end=795)',
        obj: {
            "selector": {
                "type": "TextQuoteSelector",
                "start": 12,
                "end": 795
            },
            "source": ""
        }
    },

    'URI without fragment identifier': {
        uri: 'https://example.org',
        obj: {
            "source": "https://example.org"
        }
    },

    'One closing parenthesis inside a value': {
        uri: '#selector(type=TextQuoteSelector,exact=(not)%20a%20problem)',
        obj: {
            source: '',
            selector: {
                type: 'TextQuoteSelector',
                exact: '(not) a problem',
            },
        },
    },
}

const specialCasesToParse = {
    'Two closing parentheses inside a value': {
        uri: '#selector(type=TextQuoteSelector,exact=Hey))%20this%20breaks)',
        obj: {
            source: '',
            selector: {
                type: 'TextQuoteSelector',
                exact: 'Hey)) this breaks',
            },
        },
    },

    'Two closing parentheses: one of value, one of selector': {
        uri: '#selector(type=TextQuoteSelector,exact=example%20(that%20fails))',
        obj: {
            source: '',
            selector: {
                type: 'TextQuoteSelector',
                exact: 'example (that fails)',
            },
        },
    },

    'Three closing parentheses: one of the value, two of nested selectors': {
        uri: `
            #selector(
                type=RangeSelector,
                startSelector=selector(type=TextQuoteSelector,exact=(but),
                endSelector=selector(type=TextQuoteSelector,exact=crazy))
            )
            `.replace(/\s/g, ''),
        obj: {
            source: '',
            selector: {
                type: 'RangeSelector',
                startSelector: {
                    type: 'TextQuoteSelector',
                    exact: '(but',
                },
                endSelector: {
                    type: 'TextQuoteSelector',
                    exact: 'crazy)',
                },
            },
        },
    },
};

describe('specificResourceToUri', () => {
    for (let name in pairs) {
        it(`should properly convert: '${name}'`, () => {
            let uri = specificResourceToUri(pairs[name].obj)
            assert.equal(uri, pairs[name].uri)
        })
    }
})

describe('uriToSpecificResource', () => {
    for (let name in pairs) {
        it(`should properly convert: '${name}'`, () => {
            let obj = uriToSpecificResource(pairs[name].uri)
            assert.deepEqual(obj, pairs[name].obj)
        })
    }

    it('should cleanly handle other types of fragment identifiers', () => {
        const obj = uriToSpecificResource('https://example.com/page#section4')
        const expected = {
            source: 'https://example.com/page',
            selector: {
                type: 'FragmentSelector',
                value: 'section4',
            }
        }
        assert.deepEqual(obj, expected)
    })

    // FIXME These tests are known to fail. Seems impossible to parse
    // them with PEG.js. See <https://github.com/w3c/web-annotation/issues/443>
    for (const [name, example] of Object.entries(specialCasesToParse)) {
        it.skip(`should parse special case: '${name}'`, () => {
            let obj = uriToSpecificResource(example.uri)
            assert.deepEqual(obj, example.obj)
        })
    }
})
