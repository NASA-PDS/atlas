/*
 * Lucene Query Grammar for PEG.js
 * From https://github.com/thoward/lucene-query-parser.js
 * Modified for PDS-IMG and ES Query String by tariqksoliman
 * ========================================
 *
 * This grammar supports many of the constructs contained in the Lucene Query Syntax.
 *
 * Supported features:
 * - conjunction operators (AND, OR, ||, &&, NOT, !)
 * - prefix operators (+, -)
 * - quoted values ("foo bar")
 * - named fields (foo:bar)
 * - range expressions (foo:[bar TO baz], foo:{bar TO baz})
 * - proximity search expressions ("foo bar"~5)
 * - boost expressions (foo^5, "foo bar"^5)
 * - fuzzy search expressions (foo~, foo~0.5)
 * - parentheses grouping ( (foo OR bar) AND baz )
 * - field groups ( foo:(bar OR baz) )
 * - JS syntax comments
 *
 * The grammar will create a parser which returns an AST for the query in the form of a tree
 * of nodes, which are dictionaries. There are three basic types of expression dictionaries:
 *
 * A node expression generally has the following structure:
 *
 * {
 *     'left' : dictionary,     // field expression or node
 *     'operator': string,      // operator value
 *     'right': dictionary,     // field expression OR node
 *     'field': string          // field name (for field group syntax) [OPTIONAL]
 * }
 *
 *
 * A field expression has the following structure:
 *
 * {
 *     'field': string,         // field name
 *     'term': string,          // term value
 *     'prefix': string         // prefix operator (+/-) [OPTIONAL]
 *     'boost': float           // boost value, (value > 1 must be integer) [OPTIONAL]
 *     'similarity': float      // similarity value, (value must be > 0 and < 1) [OPTIONAL]
 *     'proximity': integer     // proximity value [OPTIONAL]
 * }
 *
 *
 * A range expression has the following structure:
 *
 * {
 *     'field': string,         // field name
 *     'term_min': string,      // minimum value (left side) of range
 *     'term_max': string,      // maximum value (right side) of range
 *     'inclusive': boolean     // inclusive ([...]) or exclusive ({...})
 * }
 *
 * Other Notes:
 *
 * - For any field name, unnamed/default fields will have the value "<implicit>".
 * - Wildcards (fo*, f?o) and fuzzy search modifiers (foo~.8) will be part of the term value.
 * - Escaping is not supported and generally speaking, will break the parser.
 * - Conjunction operators that appear at the beginning of the query violate the logic of the
 *   syntax, and are currently "mostly" ignored. The last element will be returned.
 *
 *   For example:
 *       Query: OR
 *       Return: { "operator": "OR" }
 *
 *       Query: OR AND
 *       Return: { "operator": "AND" }
 *
 *       Query: OR AND foo
 *       Return: { "left": { "field": "<implicit>", "term": "foo" } }
 *
 *  To test the grammar, use the online parser generator at https://pegjs.org/online
 *
 */

start
  = _ node:node+
    {
        return node[0];
    }
  / _
    {
        return {};
    }
  / EOF
    {
        return {};
    }

node
  = operator:operator_exp EOF
    {
        return {
            'operator': operator
        };
    }
  / operator:operator_exp right:node
    {
        return right;
    }
  / left:group_exp operator:operator_exp* right:node*
    {
        var node= {
            'left':left
            };

        var right =
                right.length == 0
                ? null
                : right[0]['right'] == null
                    ? right[0]['left']
                    : right[0];

        if (right != null)
        {
            node['operator'] = operator=='' || operator==undefined ? '<implicit>' : operator[0];
            node['right'] = right;
        }

        return node;
    }

group_exp
  = field_exp:field_exp _
    {
        return field_exp;
    }
  / paren_exp

paren_exp
  = "(" node:node+ ")" _
    {
        return node[0];
    }

field_exp
  = fieldname:fieldname? range:range_operator_exp
    {
        range['field'] =
            fieldname == '' || fieldname == undefined
                ? "<implicit>"
                : fieldname;

        return range;
    }
  / fieldname:fieldname node:paren_exp
    {
        node['field']= fieldname;
        return node;
    }
  / fieldname:fieldname? term:term
    {
        var fieldexp = {
            'field':
                fieldname == '' || fieldname == undefined
                    ? "<implicit>"
                    : fieldname
            };

        for(var key in term)
            fieldexp[key] = term[key];

        return fieldexp;
    }

fieldname
  = fieldname:unquoted_term _ [:] _
    {
        return fieldname;
    }

term
  = op:prefix_operator_exp? term:quoted_term proximity:proximity_modifier? boost:boost_modifier? _
      {
        var result = { 'term': term };

        if('' != proximity)
        {
            result['proximity'] = proximity;
        }
        if('' != boost)
        {
            result['boost'] = boost;
        }
        if('' != op)
        {
            result['prefix'] = op;
        }

        return result;
    }
  / op:prefix_operator_exp? term:unquoted_term similarity:fuzzy_modifier? boost:boost_modifier? _
    {
        var result = { 'term': term };
        if('' != similarity)
        {
            result['similarity'] = similarity;
        }
        if('' != boost)
        {
            result['boost'] = boost;
        }
        if('' != op)
        {
            result['prefix'] = op;
        }
        return result;
    }
  / op:prefix_operator_exp? term:regexpr_term boost:boost_modifier? _
      {
          var result = { 'term': term, 'regexpr': true };
          if('' != boost)
          {
              result['boost'] = boost;
          }
          if('' != op)
          {
              result['prefix'] = op;
          }
          return result;
      }


unquoted_term
  = term_start:term_start_char term:term_char*
    {
        var res = term_start + term.join('');
        if (/^(?:AND|OR|NOT|\|\||&&)$/.test(res)) {
          var e = new Error('Term can not be AND, OR, NOT, ||, &&')
          e.name = 'SyntaxError'
          e.column = location
          throw e
        }
        return res
    }

term_start_char
  = '.' / term_escaping_char / [^: \t\r\n\f\{\}()"+-/^~\[\]]

term_escaping_char
  = '\\' escaping_char:[: \t\r\n\f\{\}()"/^~\[\]]
    {
        return '\\' + escaping_char;
    }

term_char
  = '+' / '-' / term_escaping_char / term_start_char

regexpr_term
  = '/' term:regexpr_char+ '/'
    {
        return term.join('').replace('\\/', '/');
    }

regexpr_char
  = '.' / '\\/' / [^/]


quoted_term
  = '"' term:[^"]+ '"'
    {
        return term.join('');
    }

proximity_modifier
  = '~' proximity:int_exp
    {
        return proximity;
    }

boost_modifier
  = '^' boost:decimal_or_int_exp
    {
        return boost;
    }

fuzzy_modifier
  = '~' fuzziness:decimal_exp?
    {
        return fuzziness == '' || fuzziness == undefined ? 0.5 : fuzziness;
    }

decimal_or_int_exp
 = decimal_exp
 / int_exp

decimal_exp
 = '0.' val:[0-9]+
    {
        return parseFloat("0." + val.join(''));
    }

int_exp
  = val:[0-9]+
    {
        return parseInt(val.join(''));
    }

range_operator_exp
  = '[' term_min:unquoted_term _ 'TO' __ term_max:unquoted_term ']'
    {
        return {
            'term_min': term_min,
            'term_max': term_max,
            'inclusive': true,
            'inclusive_min': true,
            'inclusive_max': true
        };
    }
  / '{' term_min:unquoted_term _ 'TO' __ term_max:unquoted_term '}'
    {
        return {
            'term_min': term_min,
            'term_max': term_max,
            'inclusive': false,
            'inclusive_min': false,
            'inclusive_max': false
        };
    }
  / '{' term_min:unquoted_term _ 'TO' __ term_max:unquoted_term ']'
    {
        return {
            'term_min': term_min,
            'term_max': term_max,
            'inclusive': false,
            'inclusive_min': false,
            'inclusive_max': true
        };
    }
  / '[' term_min:unquoted_term _ 'TO' __ term_max:unquoted_term '}'
    {
        return {
            'term_min': term_min,
            'term_max': term_max,
            'inclusive': false,
            'inclusive_min': true,
            'inclusive_max': false
        };
    }

operator_exp
  = _ operator:operator __
    {
        return operator;
    }
  / _ operator:operator EOF
    {
        return operator;
    }

operator
  = 'OR'
  / 'AND'
  / 'NOT'
  / '||' { return 'OR'; }
  / '&&' { return 'AND'; }
  / '!' { return 'NOT'}

prefix_operator_exp
  = _ operator:prefix_operator
    {
        return operator;
    }

prefix_operator
  = '+'
  / '-'

_ "whitespace"
  = (WhiteSpace / LineTerminatorSequence / Comment)*
  
__ "whitespace"
  = (WhiteSpace / LineTerminatorSequence / Comment)+
  
EOF
  = !.

// Separator, Space
Zs = [\u0020\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]

WhiteSpace "whitespace"
  = "\t"
  / "\v"
  / "\f"
  / " "
  / "\u00A0"
  / "\uFEFF"
  / Zs
  
SourceCharacter
  = .
  
LineTerminator
  = [\n\r\u2028\u2029]

LineTerminatorSequence "end of line"
  = "\n"
  / "\r\n"
  / "\r"
  / "\u2028"
  / "\u2029"
  
Comment "comment"
  = MultiLineComment
  / SingleLineComment

MultiLineComment
  = "/*" (!"*/" SourceCharacter)* "*/"

MultiLineCommentNoLineTerminator
  = "/*" (!("*/" / LineTerminator) SourceCharacter)* "*/"

SingleLineComment
  = "//" (!LineTerminator SourceCharacter)*
  / "#" (!LineTerminator SourceCharacter)*