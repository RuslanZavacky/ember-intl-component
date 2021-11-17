import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

const TRANSLATIONS = {
  'dynamic.dummy.welcome': 'Welcome, {name}!',
  'dynamic.dummy.paragraph': '<p><script>console.log("should fail")</script> Lets test {count, plural, =1 {# complex part} other {# complex parts}}  with {type}. [[[link]]] to the outer world. Or [[[component]]].</p>',
};

export default class ApplicationRoute extends Route {
  @service intl;

  async model() {
    const translations = await new Promise((resolve) => {
      setTimeout(() => {
        resolve(TRANSLATIONS);
      }, 500);
    });

    this.intl.addTranslations('en-US', translations);
  }

  setupController(controller) {
    controller.set('translations', JSON.stringify(TRANSLATIONS, null, 2));
  }
}
