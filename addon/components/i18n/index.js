import Component from '@glimmer/component';
import { setComponentTemplate } from '@ember/component';
import { compileTemplate } from '@ember/template-compilation';
import { getOwner } from '@ember/application';
import { inject as service } from '@ember/service';
import templateOnlyComponent from "@ember/component/template-only";
import { guidFor } from '@ember/object/internals';
import { cached } from '@glimmer/tracking';
import { assert } from '@ember/debug';

export default class I18nComponent extends Component {
  @service intl;

  @cached
  get componentName() {
    const { args } = this;
    const { i18nid, htmlSafe } = args;

    assert('i18nid is a required attribute', i18nid !== undefined);

    const componentName = this.getComponentName(args);

    const i18nArgs = { ...args };

    delete i18nArgs.i18id;
    delete i18nArgs.htmlSafe;

    const i18nString = this.intl.t(i18nid, i18nArgs);

    if (htmlSafe === true) {
      this.htmlComponent(componentName, i18nString);
    } else {
      this.plainComponent(componentName, i18nString);
    }

    return componentName;
  }

  getComponentName(args) {
    return `translated/${guidFor(args)}`;
  }

  htmlComponent(componentName, i18nString) {
    i18nString = i18nString.replace(/\[\[\[(.*?)\]\]\]/g, '{{yield "$1"}}');

    getOwner(this).register(`component:${componentName}`, setComponentTemplate(
      compileTemplate(i18nString),
      templateOnlyComponent()
    ));
  }

  plainComponent(componentName, i18nString) {
    const hbsContent = `{{#each this.parts as |part|}}
    {{#if (eq part.length 2)}}
      {{yield (get part "1")}}
    {{else}}
      {{get part "0"}}
    {{/if}}
{{/each}}`;

    const parts = i18nString.split(/(\[\[\[.*?\]\]\])/g);

    const componentClass = class Foo extends Component {
      parameterRegex = /\[\[\[.*?\]\]\]/;

      get parts() {
        return parts.map((part) => {
          const matches = part.match(this.parameterRegex);
          const value = matches !== null ? part.replace(/\[|\]/g, '') : null;

          return value ? [part, value] : [part];
        });
      }
    };

    getOwner(this).register(`component:${componentName}`, setComponentTemplate(
      compileTemplate(hbsContent),
      componentClass,
    ));
  }
}
