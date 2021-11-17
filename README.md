ember-intl-component-string
==============================================================================

Allows using component to render i18n strings and substitute attributes with
components.

```yaml
translation.key: '<p>Lets test {count, plural, =1 {# complex part} other {# complex parts}} with {type}. [[[link]]] to the outer world. Or [[[component]]].</p>',
```

```handlebars
<I18n @i18nid="translation.key" @type="XML" @count="2" as |MessageScope|>
  <MessageScope>
    <:link>
      <a href="https://ember-intl.github.io/ember-intl/">ember-intl</a>
    </:link>
    <:component>
      <TestComponent @text="Explore ember-intl"/>
    </:component>
  </MessageScope>
</I18n>
```

Compatibility
------------------------------------------------------------------------------

* Ember.js v3.20 or above
* Ember CLI v3.20 or above
* Node.js v12 or above


Installation
------------------------------------------------------------------------------

```
ember install ember-intl-component-string
```

Usage
------------------------------------------------------------------------------

### How does it work?

`i18n` component creates new components dynamically in runtime
for each individual translation key. As a first step, translation
will be passed through ember-intl `t` helper, then processed with
withing i18n component.

### Using

**Simple case**

```yaml
welcome: 'Welcome, {name}!',
```

```handlebars
<I18n @i18nid="welcome" @name="Zoe" />
```

P.S in cases like that, it's better to use just `{{t}}` helper.

**With component usage**

```yaml
translation.key: 'With component: [[[welcome]]]',
```

```handlebars
<I18n @i18nid="translation.key" as |MessageScope|>
  <MessageScope>
    <:welcome>
      <WelcomeComponent />
    </:welcome>
  </MessageScope>
</I18n>
```

**Inline component in translation**

```yaml
translation.key: 'Welcome, <WelcomeComponent @name="Zoe" />!',
```

```handlebars
// WelcomeComponent

to Ember {{@name}} and Tomster
```

```handlebars
<I18n @i18nid="translation.key" @htmlSafe={{true}} />
```

Output will be 
```handlebars
Welcome, to Ember Zoe and Tomster!
```

P.S Keep in mind, as it will render _any_ html passed to it, even `<script>` tags.
Only use that where you are 100% sure that content is safe.

Contributing
------------------------------------------------------------------------------

See the [Contributing](CONTRIBUTING.md) guide for details.


License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
