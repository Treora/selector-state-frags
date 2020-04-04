# Selector State Fragments

Converts between Web Annotation
[Selectors and States as Fragment Identifiers][]
and [Web Annotation Data Model][] [Selectors][] and [States][] (or [SpecificResource][]s containing those).

[Selectors and States as Fragment Identifiers]: https://www.w3.org/TR/2017/NOTE-selectors-states-20170223/#frags
[Web Annotation Data Model]: https://www.w3.org/TR/2017/REC-annotation-model-20170223/
[Selectors]: https://www.w3.org/TR/2017/REC-annotation-model-20170223/#selectors
[States]: https://www.w3.org/TR/2017/REC-annotation-model-20170223/#states
[SpecificResource]: https://www.w3.org/TR/2017/REC-annotation-model-20170223/#specific-resources


## Install

    npm install selector-state-frags

…or equivalent.


## Use

Convert between fragment identifier and Selector or State object:

    // for fragment identifiers of the form `selector(…)`
    const { selector } = parse(fragmentIdentifier)

    // for fragment identifiers of the form `state(…)`
    const { state } = parse(fragmentIdentifier)

    const fragmentIdentifier = stringify(selectorOrState)

A SpecificResource is simply treated as a pair of `{ source, selector }`, or `{ source, state }`. To convert between this object and a URI with the Selector/State as its fragment identifier:

    const specificResource = uriToSpecificResource(uri)

    const uri = specificResourceToUri(specificResource)

With `uriToSpecificResource`, if the given URI contains any other type of fragment identifier (neither selector nor state), it will be converted to its equivalent [FragmentSelector](https://www.w3.org/TR/2017/REC-annotation-model-20170223/#fragment-selector):

    uriToSpecificResource('https://example.com/page#section4')
    // {
    //     source: 'https://example.com/page',
    //     selector: {
    //         type: 'FragmentSelector',
    //         value: 'section4',
    //     }
    // }

With `specificResourceToUri`, note that if the SpecificResource contains both a Selector and a State, only the Selector will be put in the fragment identifier.


## Example

    const selector = {
      "type": "TextPositionSelector",
      "start": 412,
      "end": 795
    }
    stringify(selector) === 'selector(type=TextPositionSelector,start=412,end=795)'
    // And `parse('selector(…)')` would do the reverse conversion.

    const specificResource = {
        "source": "http://example.org/ebook1",
        "selector": {
          "type": "TextPositionSelector",
          "start": 412,
          "end": 795
        }
    }
    specificResourceToUri(specificResource) === 'http://example.org/ebook1#selector(type=TextPositionSelector,start=412,end=795)'
    // And uriToSpecificResource('http://…') would do the reverse conversion.


## License

Apache License 2.0
