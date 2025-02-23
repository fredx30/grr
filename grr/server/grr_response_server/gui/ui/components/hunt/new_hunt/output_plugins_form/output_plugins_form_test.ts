import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {TestBed, waitForAsync} from '@angular/core/testing';
import {MatInputHarness} from '@angular/material/input/testing';
import {By} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

import {ConfigGlobalStore} from '../../../../store/config_global_store';
import {ConfigGlobalStoreMock, mockConfigGlobalStore} from '../../../../store/config_global_store_test_util';
import {initTestEnvironment} from '../../../../testing';

import {OutputPluginsFormModule} from './module';
import {OutputPluginsForm} from './output_plugins_form';

initTestEnvironment();

describe('output plugins form test', () => {
  let configGlobalStoreMock: ConfigGlobalStoreMock;
  beforeEach(waitForAsync(() => {
    configGlobalStoreMock = mockConfigGlobalStore();
    TestBed
        .configureTestingModule({
          imports: [
            NoopAnimationsModule,
            OutputPluginsFormModule,
          ],
          providers: [{
            provide: ConfigGlobalStore,
            useFactory: () => configGlobalStoreMock
          }],
          teardown: {destroyAfterEach: false}
        })
        .compileComponents();
  }));

  it('toggles contents on click on toggle button', () => {
    const fixture = TestBed.createComponent(OutputPluginsForm);
    const button =
        fixture.debugElement.query(By.css('#output-plugins-form-toggle'));
    fixture.detectChanges();

    expect(fixture.componentInstance.hideContent).toBeTrue();

    button.triggerEventHandler('click', new MouseEvent('click'));
    fixture.detectChanges();
    expect(fixture.componentInstance.hideContent).toBeFalse();

    button.triggerEventHandler('click', new MouseEvent('click'));
    fixture.detectChanges();
    expect(fixture.componentInstance.hideContent).toBeTrue();
  });

  it('opens contents on click on header', () => {
    const fixture = TestBed.createComponent(OutputPluginsForm);
    fixture.detectChanges();

    expect(fixture.componentInstance.hideContent).toBeTrue();

    const header = fixture.debugElement.query(By.css('.header'));
    header.triggerEventHandler('click', new MouseEvent('click'));
    fixture.detectChanges();
    expect(fixture.componentInstance.hideContent).toBeFalse();
  });
});
