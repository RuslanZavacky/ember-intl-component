import Component from '@glimmer/component';
import { dasherize } from '@ember/string';
import { getOwner } from '@ember/application';
import { inject as service } from '@ember/service';
import { cached } from '@glimmer/tracking';
import { getTemplateLocals } from '@glimmer/syntax';
import { assert } from '@ember/debug';
import { compileHBS } from 'ember-repl';
import { setComponentTemplate } from '@ember/component';
import { hbs } from 'ember-cli-htmlbars';

class I18nComponent extends Component {
  @service intl;

  @cached
  get componentName() {
    const { args } = this;
    const { i18nid, htmlSafe } = args;

    assert('i18nid is a required attribute', i18nid !== undefined);

    const i18nArgs = { ...args };

    delete i18nArgs.i18id;
    delete i18nArgs.htmlSafe;

    const i18nString = this.intl.t(i18nid, i18nArgs);

    if (htmlSafe === true) {
      return this.htmlComponent(i18nString);
    }

    return this.plainComponent(i18nString);
  }

  htmlComponent(i18nString) {
    // TODO: ideally think about sanitization of some sort, to at least
    // prevent some form of script tag and other properties where JS
    // can get in

    i18nString = i18nString.replace(/\[\[\[(.*?)\]\]\]/g, '{{yield to="$1"}}');

    let owner = getOwner(this);
    let locals = getTemplateLocals(i18nString);
    let scope = {};

    for (let local of locals) {
      // Try to find in the registry
      let kebabName = dasherize(local);
      // Try components
      let componentFactory = owner.factoryFor(`component:${kebabName}`);

      scope[local] = componentFactory.class;
    }

    return compileHBS(i18nString, { scope });
  }

  plainComponent(i18nString) {
    const parts = i18nString.split(/(\[\[\[.*?\]\]\])/g).map((part) => {
      const matches = part.match(/\[\[\[.*?\]\]\]/);
      const value = matches !== null ? part.replace(/\[|\]/g, '') : null;
      return value ? [part, value] : [part];
    });

    const hbsContent = parts.reduce((hbs, part, idx) => {
      if (part.length === 2) {
        hbs = `${hbs}{{yield to="${part[1]}"}}`;
      } else {
        hbs = `${hbs}{{get (get parts ${idx}) "0"}}`;
      }

      return hbs;
    }, '');

    return compileHBS(hbsContent, {
      scope: {
        parts,
      },
    });
  }
}

export default setComponentTemplate(
  hbs`
    {{#if (has-block)}}
      {{yield this.componentName.component}}
    {{else}}
      {{#let this.componentName.component as |NoBlock|}}
        <NoBlock />
      {{/let}}
    {{/if}}
  `,
  I18nComponent
);
