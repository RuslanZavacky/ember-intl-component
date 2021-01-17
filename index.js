'use strict';

const NamedBlocksPolyfillPluginBuilder = require('ember-named-blocks-polyfill/lib/named-blocks-polyfill-plugin');

function buildConditional(b, cond, truthyValue, falsyValue) {
  let mustacheArgs = [cond];

  mustacheArgs.push(b.string(truthyValue));

  if (falsyValue) {
    mustacheArgs.push(b.string(falsyValue));
  }
  return b.mustache(b.path('if'), mustacheArgs);
}

class TComponent {
  toElement() {
    this.syntax.parse(args[0]);
  }
}

const TRANSLATIONS = {
  'dummy.welcome': 'Welcome, {name}!',
  'dummy.paragraph': '<p>Lets test more complex parts with HTML. {link} to the outer world. Or {component}.</p>',
};

class IntlNamedBlocksTransformer {
  constructor(env) {
    this.env = env;
  }

  transform(ast) {
    var walker = new this.syntax.Walker();

    let translations = {};

    walker.visit(ast, (node) => {
      if (!this.validate(node)) {
        return;
      }

      const { value: { chars: id } } = node.attributes.find((attr) => attr.name === '@id');

      translations[id] = true;
    });

    walker.visit(ast, (node) => {
      const isTComponent = node.type === 'Template'
        && node.loc
        && node.loc.source === 'ember-intl-named-blocks/components/t/index.hbs';

      if (!isTComponent) {
        return;
      }

      let middle = ``;
      for (const [key, value] of Object.entries(TRANSLATIONS)) {
        let result = value.replace(/{(.*?)}/g, (match, contents, offset, inputString) => {
          return `{{yield to="${contents}"}}`;
        });

        middle += `{{else if (eq @id "${key}")}}${result}`;
      }

      const hbsResult = `{{#if (eq 1 2)}}${middle}{{/if}}`;

      const parsed = this.syntax.parse(hbsResult);

      node.body = parsed.body;
    });

    this.syntax.traverse(ast, NamedBlocksPolyfillPluginBuilder(this.env).visitor);

    return ast;
  }

  validate(node) {
    return node.type === 'ElementNode' && node.tag === 'T';
  }
}

module.exports = {
  name: require('./package').name,

  isDevelopingAddon() {
    return true;
  },

  options: {
    // nodeAssets: {
    //   '@babel/standalone': {
    //     import: ['babel.js']
    //   }
    // },
    // autoImport: {
    //   exclude: [
    //     'babel-plugin-ember-modules-api-polyfill',
    //     'babel-plugin-debug-macros'
    //   ]
    // },
    // 'ember-cli-babel': {
    //   includePolyfill: true
    // },
  },

  included() {
    this._super.included.apply(this, arguments);

    let app = this._findHost(this);

    app.options['ember-cli-babel'] = {
      includePolyfill: true,
    };

    app.options['nodeAssets'] = {
      '@babel/standalone': {
        import: ['babel.js'],
      },
    };

    app.import('vendor/shims/babel.js');
    app.import('vendor/shims/path.js');
  },

  setupPreprocessorRegistry(type, registry) {
    const plugin = this._buildPlugin();

    plugin.parallelBabel = {
      requireFile: __filename,
      buildUsing: '_buildPlugin',
      params: {},
    };

    registry.add('htmlbars-ast-plugin', plugin);
  },

  _buildPlugin() {
    return {
      name: 'ember-intl-named-blocks-ast-transformer',
      plugin: IntlNamedBlocksTransformer,
      baseDir() {
        return __dirname;
      },
    };
  },
};
