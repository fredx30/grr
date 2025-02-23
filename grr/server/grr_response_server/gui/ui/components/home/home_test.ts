import {Location} from '@angular/common';
import {Component} from '@angular/core';
import {fakeAsync, TestBed, tick, waitForAsync} from '@angular/core/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {RouterTestingModule} from '@angular/router/testing';

import {newClientApproval} from '../../lib/models/model_test_util';
import {HomePageGlobalStore} from '../../store/home_page_global_store';
import {injectMockStore, STORE_PROVIDERS} from '../../store/store_test_providers';
import {initTestEnvironment} from '../../testing';

import {Home} from './home';
import {HomeModule} from './module';


initTestEnvironment();

@Component({template: ''})
class TestComponent {
}

describe('Home Component', () => {
  beforeEach(waitForAsync(() => {
    TestBed
        .configureTestingModule({
          imports: [
            RouterTestingModule.withRoutes(
                [{path: 'clients', component: TestComponent}]),
            HomeModule,
            NoopAnimationsModule,
          ],
          declarations: [
            TestComponent,
          ],
          providers: [
            ...STORE_PROVIDERS,
          ],
          teardown: {destroyAfterEach: false}
        })
        .compileComponents();
  }));

  it('creates the component', () => {
    const fixture = TestBed.createComponent(Home);
    const componentInstance = fixture.componentInstance;
    expect(componentInstance).toBeTruthy();
  });

  it('changes the route when query is submitted', fakeAsync(() => {
       const fixture = TestBed.createComponent(Home);
       const componentInstance = fixture.componentInstance;
       componentInstance.onQuerySubmitted('foo');
       tick();

       const location = TestBed.inject(Location);
       expect(location.path()).toEqual('/clients?q=foo');
     }));

  it('displays recently accessed clients', () => {
    const fixture = TestBed.createComponent(Home);
    injectMockStore(HomePageGlobalStore)
        .mockedObservables.recentClientApprovals$.next([
          newClientApproval({clientId: 'C.1111', status: {type: 'valid'}}),
          newClientApproval({clientId: 'C.2222', status: {type: 'valid'}}),
        ]);
    fixture.detectChanges();

    const text = fixture.debugElement.nativeElement.textContent;
    expect(text).toContain('C.1111');
    expect(text).toContain('C.2222');
  });
});
