import { HitangularPage } from './app.po';

describe('hitangular App', function() {
  let page: HitangularPage;

  beforeEach(() => {
    page = new HitangularPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
