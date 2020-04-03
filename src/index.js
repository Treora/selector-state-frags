/**
 * This software or document includes material copied from or derived from the
 * [JSON <=> URI selector converter](http://w3c.github.io/web-annotation/selector-note/converter/)
 * built for demoing the
 * [Selectors and States](http://w3c.github.io/web-annotation/selector-note/index-respec.html#media_selector)
 * Note. Copyright © 2017 W3C® (MIT, ERCIM, Keio, Beihang).
 **/

import { parse } from './fragment.js'

export { parse }

export function uriToSpecificResource(uri) {
    const [source, fragmentIdentifier] = uri.split('#')
    const specificResource = { source }
    if (fragmentIdentifier) {
        try {
            Object.assign(specificResource, parse(fragmentIdentifier))
        } catch (err) {
            // Apparently, the fragment identifier was not a serialised selector or state object.
            // We convert the fragment identifier string to its equivalent selector object.
            // (https://www.w3.org/TR/2017/NOTE-selectors-states-20170223/#FragmentSelector_def)
            specificResource.selector = {
                type: 'FragmentSelector',
                value: fragmentIdentifier,
                // According to the spec, we _should_ specify a 'conformsTo' link, but we cannot
                // know the semantics of this fragmentIdentifier, so we have to omit this relation.
            }
        }
    }
    return specificResource
}

export function specificResourceToUri(specificResource) {
    const uri = specificResource.source
    const selectorOrState = specificResource.selector || specificResource.state
    const fragmentIdentifier = selectorOrState && `#${stringify(selectorOrState)}`
    return (uri || '') + (fragmentIdentifier || '')
}

// Turn a selector or state object into a fragment identifier.
export function stringify(selectorOrState) {
    const parameters = Object.entries(selectorOrState)
        .map(([key, value]) => {
            if (
                key === 'refinedBy' ||
                key === 'startSelector' ||
                key === 'endSelector'
            ) {
                return `${encode(key)}=${stringify(value)}`
            } else {
                return `${encode(key)}=${encode(value)}`
            }
        })
    const type = (/State$/.test(selectorOrState.type)) ? 'state' : 'selector'
    return `${type}(${parameters.join(',')})`
}

function encode(string) {
    return encodeURI(string)
        .replace(/#/g,'%23')
        .replace(/,/g,'%2C')
        .replace(/=/g,'%3D')
        .replace(/\(/g,'%28')
        .replace(/\)/g,'%29')
}
