import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';

function cleanOutput(html) {
  return html.trim().replace(/\n/g, '').replace(/\s+/g, ' ');
}

module('Integration | Component | i18n', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  hooks.beforeEach(function () {
    const intl = this.owner.lookup('service:intl');

    intl.addTranslations('en-US', {
      'test.welcome': 'Welcome, {name}!',
      'test.plural':
        '{count, plural, =1 {# complex part} other {# complex parts}}',
      'test.paragraph':
        '<p>Lets test {count, plural, =1 {# complex part} other {# complex parts}}  with {type}. [[[link]]] to the outer world. Or [[[component]]].</p>',
      'test.component': 'Welcome, <TestComponent @text="Zoe" />!',
    });
  });

  test('it renders simple parameters', async function (assert) {
    await render(hbs`<I18n @i18nid="test.welcome" @name="Zoe" />`);
    assert.equal(this.element.textContent.trim(), 'Welcome, Zoe!');
  });

  test('it renders plural case', async function (assert) {
    await render(hbs`<I18n @i18nid="test.plural" @count="1" />`);
    assert.equal(this.element.textContent.trim(), '1 complex part');

    await render(hbs`<I18n @i18nid="test.plural" @count="2" />`);
    assert.equal(this.element.textContent.trim(), '2 complex parts');
  });

  test('it renders complex string without HTML', async function (assert) {
    await render(hbs`
      <I18n @i18nid="test.paragraph" @count="1" @type="HTML" as |Blocks|>
        <Blocks>
          <:link>
            <a href="https://www.emberjs.com">ember.js</a>
          </:link>
          <:component>
            <TestComponent @text="testing" />
          </:component>
        </Blocks>
      </I18n>
    `);

    assert.equal(
      cleanOutput(this.element.innerHTML),
      `&lt;p&gt;Lets test 1 complex part with HTML. <a href="https://www.emberjs.com">ember.js</a> to the outer world. Or <b>testing</b> .&lt;/p&gt;`
    );
  });

  test('it renders complex string with htmlSafe=true', async function (assert) {
    await render(hbs`
       <I18n @i18nid="test.paragraph" @count="1" @type="HTML" @htmlSafe={{true}} as |blocks|>
         {{#if (eq blocks "link")}}
           <a href="https://www.emberjs.com">ember.js</a>
         {{else if (eq blocks "component")}}
           <TestComponent @text="testing" />
         {{/if}}
       </I18n>
     `);

    assert.equal(
      cleanOutput(this.element.innerHTML),
      `<p>Lets test 1 complex part with HTML. <a href="https://www.emberjs.com">ember.js</a> to the outer world. Or <b>testing</b> .</p>`
    );
  });

  test('it renders component with htmlSafe=true', async function (assert) {
    await render(hbs`
      <I18n @i18nid="test.component" @htmlSafe={{true}} />
    `);


    assert.equal(cleanOutput(this.element.innerHTML), `Welcome, <b>Zoe</b>!`);
  });
});
