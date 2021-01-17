import Route from '@ember/routing/route';
import { setComponentTemplate } from '@ember/component';
import TComponent from 'ember-intl-named-blocks/components/t';
import { hbs } from 'ember-cli-htmlbars';
import { inject as service } from '@ember/service';

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

    // setComponentTemplate(
    //   Ember.HTMLBars.template({
    //     "id": "v5w0Ek0H",
    //     "block": "{\"symbols\":[],\"statements\":[[2,\"-\"]],\"hasEval\":false,\"upvars\":[]}",
    //     "meta": {
    //       "moduleName": "ember-intl-named-blocks/components/t/index.hbs"
    //     }
    //   }),
    //   TComponent
    // );

    // setComponentTemplate(hbs`${hbsResult}`, TComponent);

    console.log('model', translations, hbsResult);
  }
}
