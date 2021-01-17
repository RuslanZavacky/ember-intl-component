import Route from '@ember/routing/route';
import { setComponentTemplate } from '@ember/component';
import TComponent from 'ember-intl-named-blocks/components/t';
import { inject as service } from '@ember/service';
import Ember from 'ember';
import Babel from '@babel/core';
import HbsPlugin from 'ember-intl-named-blocks/plugins/hbs-plugin';

const hbsPlugin = new HbsPlugin(Babel);

const TRANSLATIONS = {
  'dynamic.dummy.welcome': '[Dynamic] Welcome, {name}!',
  'dynamic.dummy.paragraph': '[Dynamic] <p>Lets test more complex parts with HTML. {link} to the outer world. Or {component}.</p>',
};

export default class ApplicationRoute extends Route {
  @service intl;

  async model() {
    const translations = await new Promise((resolve) => {
      setTimeout(() => {
        resolve(TRANSLATIONS);
      }, 1000);
    });

    let middle = ``;
    for (const [key, value] of Object.entries(translations)) {
      let result = value.replace(/{(.*?)}/g, (match, contents, offset, inputString) => {
        return `{{yield to="${contents}"}}`;
      });

      middle += `{{else if (eq @id "${key}")}}${result}`;
    }

    const hbsResult = `{{#if (eq 1 2)}}${middle}{{/if}}`;

    /**
     {
        "id": "DAeCkfwx",
        "block": "{\"symbols\":[\"&default\",\"@id\"],\"statements\":[[6,[37,2],[[30,[36,1],[1,2],null]],null,[[\"default\",\"else\"],[{\"statements\":[],\"parameters\":[]},{\"statements\":[[6,[37,2],[[30,[36,1],[[32,2],\"dummy.welcome\"],null]],null,[[\"default\",\"else\"],[{\"statements\":[[2,\"Welcome, \"],[18,1,[[30,[36,0],[\"name\"],null]]],[2,\"!\"]],\"parameters\":[]},{\"statements\":[[6,[37,2],[[30,[36,1],[[32,2],\"dummy.paragraph\"],null]],null,[[\"default\"],[{\"statements\":[[10,\"p\"],[12],[2,\"Lets test more complex parts with HTML. \"],[18,1,[[30,[36,0],[\"link\"],null]]],[2,\" to the outer world. Or \"],[18,1,[[30,[36,0],[\"component\"],null]]],[2,\".\"],[13]],\"parameters\":[]}]]]],\"parameters\":[]}]]]],\"parameters\":[]}]]]],\"hasEval\":false,\"upvars\":[\"-named-block-invocation\",\"eq\",\"if\"]}",
        "meta": {
            "moduleName": "ember-intl-named-blocks/components/t/index.hbs"
        }
    }
     */

    let code = `export default Ember.HTMLBars.compile('will it work?', { moduleName: 'ember-intl-named-blocks/components/t/index.hbs' }); console.log('did it run?');`;
    let output = Babel.transform(code, babelOpts('ember-intl-named-blocks/components/t/index.hbs')).code;

    const newScript = document.createElement('script');
    newScript.textContent = output;

    document.head.appendChild(newScript);

    console.log('OUTPUT', output);

    // setComponentTemplate(
    //   Ember.HTMLBars.compile('will it work?', { 'moduleName': 'ember-intl-named-blocks/components/t/index.hbs' }),
    //   TComponent,
    // );

    // setComponentTemplate(hbs`${hbsResult}`, TComponent);

    console.log('model', translations, hbsResult);
  }
}

function babelOpts(moduleName) {
  return {
    presets: [['env', {
      targets: {
        browsers: [
          'last 2 chrome versions',
          'last 2 firefox versions',
          'last 2 safari versions',
          'last 2 edge versions'
        ]
      }
    }]],
    moduleIds: true,
    moduleId: moduleName,
    plugins: [
      ['transform-modules-amd', {
        loose: true,
        noInterop: true
      }],
      ['proposal-decorators', {
        legacy: true
      }],
      'proposal-class-properties',
      'proposal-object-rest-spread',
      hbsPlugin,
    ]
  };
}