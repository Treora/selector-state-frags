import Parser from './fragment.js'
import map from 'lodash.map'

export function uriToSelector(the_uri) {
    var splitted = the_uri.split('#')
    if ( splitted.length === 1 ) {
        // No fragment identifier => no selector/state object
        return undefined
    }
    var uri      = splitted[0]
    var fragment = splitted[1]
    var obj = Parser.parse(fragment)
    if (uri !== '') {
        obj.source = uri
    }
    return obj
}

export function selectorToUri(obj) {

    function state_or_selector(obj) {
        // Deciding whether the object is a selector or a state...
        return (obj.type === 'TimeState' || obj.type === 'HttpRequestState') ? 'state' : 'selector'
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

    function frag(fname, obj) {
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

        if( typeof(obj) === 'string' ) {
            // in practice: this is a uri
            return fname + '=' + encode_value(obj)
        } else {
            return fname + '(' + map(obj, key_val) + ')'
        }
    }

    var uri = obj.source
    var fragment
    if ( obj.selector !== undefined ) {
        fragment = frag('selector', obj.selector)
    } else if ( obj.state !== undefined ) {
        fragment = frag('state', obj.state)
    }

    return (uri || '') + '#' + fragment

}
