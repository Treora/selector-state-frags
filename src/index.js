/**
 * This software or document includes material copied from or derived from the
 * [JSON <=> URI selector converter](http://w3c.github.io/web-annotation/selector-note/converter/)
 * built for demoing the
 * [Selectors and States](http://w3c.github.io/web-annotation/selector-note/index-respec.html#media_selector)
 * Note. Copyright © 2017 W3C® (MIT, ERCIM, Keio, Beihang).
 **/

import Parser from './fragment.js'
import map from 'lodash.map'


function isSelector(selectorOrState) {
    return /Selector$/.test(selectorOrState.type)
}

function isState(selectorOrState) {
    return /State$/.test(selectorOrState.type)
}

export function uriToSpecificResource(the_uri) {
    var splitted = the_uri.split('#')
    var uri = splitted[0]
    var fragmentIdentifier = splitted[1]

    const specificResource = {
        source: uri,
    }
    if (fragmentIdentifier) {
        var selectorOrState = parse(fragmentIdentifier)
        if (isSelector(selectorOrState)) specificResource.selector = selectorOrState
        if (isState(selectorOrState)) specificResource.state = selectorOrState
    }
    return specificResource
}

export function specificResourceToUri(specificResource) {
    const uri = specificResource.source
    let fragmentIdentifier
    if ( specificResource.selector !== undefined ) {
        fragmentIdentifier = stringify(specificResource.selector)
    } else if ( specificResource.state !== undefined ) {
        fragmentIdentifier = stringify(specificResource.state)
    }
    return (uri || '') + (fragmentIdentifier ? '#' + fragmentIdentifier : '')
}

// Parse a fragment identifier, return a selector or state object.
export function parse(fragmentIdentifier) {
    const specificResource = Parser.parse(fragmentIdentifier)
    // The selector/state identity is discarded here. The object's type is
    // relied upon to convey this knowledge.
    const selectorOrState = specificResource.selector || specificResource.state
    return selectorOrState
}

// Turn a selector or state object into a fragment identifier.
export function stringify(selectorOrState) {
    function state_or_selector(selectorOrState) {
        // Deciding whether the object is a selector or a state...
        return (isState(selectorOrState)) ? 'state' : 'selector'
    }

    function encode_value( val ) {
        return encodeURI(val)
            .replace(/#/g,'%23')
            .replace(/,/g,'%2C')
            .replace(/=/g,'%3D')
            .replace(/%5B/gi,'[')
            .replace(/%5D/gi,']')
            .replace(/%3E/gi,'>')
            .replace(/%3C/gi,'<')
    }

    function frag(fname, selectorOrState) {
        function key_val(val, key) {
            // Create either a key=val string or, for some specific key values
            // calls recursively the fragment generator with that key.
            // The only mini-complication is that the 'function' name for the recursion should
            // be derived from the object (which is either a state for refinement, or a range selector)
            // The unusual order of the arguments is because the function is to be used in _.map, which imposes
            // this order
            if( key === 'refinedBy' || key === 'startSelector' || key === 'endSelector' ) {
                return key + '=' + frag(state_or_selector(val), val)
            } else {
                return key + '=' + encode_value(val)
            }
        }

        if( typeof(selectorOrState) === 'string' ) {
            // in practice: this is a uri
            return fname + '=' + encode_value(selectorOrState)
        } else {
            return fname + '(' + map(selectorOrState, key_val) + ')'
        }
    }

    if (isSelector(selectorOrState)) return frag('selector', selectorOrState)
    if (isState(selectorOrState)) return frag('state', selectorOrState)
}
