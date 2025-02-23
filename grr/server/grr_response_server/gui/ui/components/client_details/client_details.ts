import {ChangeDetectionStrategy, Component, OnDestroy, ViewChild} from '@angular/core';
import {MatSelectionList} from '@angular/material/list';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ActivatedRoute} from '@angular/router';
import {combineLatest, Observable} from 'rxjs';
import {filter, map, startWith, take, takeUntil} from 'rxjs/operators';

import {Client} from '../../lib/models/client';
import {isNonNull} from '../../lib/preconditions';
import {observeOnDestroy} from '../../lib/reactive';
import {ClientVersion} from '../../store/client_details_diff';
import {ClientDetailsGlobalStore} from '../../store/client_details_global_store';
import {ClientPageGlobalStore} from '../../store/client_page_global_store';
import {SelectedClientGlobalStore} from '../../store/selected_client_global_store';
import {ErrorSnackbar} from '../helpers/error_snackbar/error_snackbar';

declare interface ClientDetailsRouteParams {
  sourceFlowId?: string;
}

/**
 * Component displaying the details for a single Client.
 */
@Component({
  selector: 'client-details',
  templateUrl: './client_details.ng.html',
  styleUrls: ['./client_details.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientDetails implements OnDestroy {
  readonly ngOnDestroy = observeOnDestroy(this);

  // Not static & private because is referenced in the template
  readonly INITIAL_NUM_USERS_SHOWN = 1;
  readonly INITIAL_NUM_INTERFACES_SHOWN = 3;
  readonly INITIAL_NUM_VOLUMES_SHOWN = 2;

  readonly clientVersions$ =
      this.clientDetailsGlobalStore.selectedClientVersions$;

  currentNumUsersShown = this.INITIAL_NUM_USERS_SHOWN;
  currentNumInterfacesShown = this.INITIAL_NUM_INTERFACES_SHOWN;
  currentNumVolumesShown = this.INITIAL_NUM_VOLUMES_SHOWN;

  @ViewChild('timeline') timeline!: MatSelectionList;

  readonly canStartFlow$ = this.clientPageGlobalStore.hasAccess$;

  readonly selectedIndex$ =
      combineLatest([
        this.clientVersions$,
        this.activatedRoute.params as Observable<ClientDetailsRouteParams>,
      ])
          .pipe(
              take(1),
              map(([versions, params]) =>
                      this.findVersionOrShowError(versions, params)),
              startWith(0),
          );

  constructor(
      private readonly clientDetailsGlobalStore: ClientDetailsGlobalStore,
      private readonly selectedClientGlobalStore: SelectedClientGlobalStore,
      private readonly clientPageGlobalStore: ClientPageGlobalStore,
      private readonly activatedRoute: ActivatedRoute,
      private readonly snackBar: MatSnackBar,

  ) {
    this.selectedClientGlobalStore.clientId$
        .pipe(
            takeUntil(this.ngOnDestroy.triggered$),
            filter(isNonNull),
            )
        .subscribe(clientId => {
          this.clientDetailsGlobalStore.selectClient(clientId);
        });
  }

  findVersionOrShowError(
      versions: ReadonlyArray<ClientVersion>,
      {sourceFlowId}: ClientDetailsRouteParams) {
    if (!sourceFlowId) {
      return 0;
    }

    const version =
        versions.findIndex(v => v.client.sourceFlowId === sourceFlowId);

    if (version === -1) {
      this.snackBar.openFromComponent(ErrorSnackbar, {
        data: `Did not find client history entry from flow ${sourceFlowId}.`
      });
      return 0;
    }

    return version;
  }

  triggerInterrogate() {
    this.clientPageGlobalStore.startFlowConfiguration('Interrogate', {});
    this.clientPageGlobalStore.startFlow({});
  }

  get selectedClient(): Client|undefined {
    return this.timeline?.selectedOptions.selected[0]?.value;
  }

  getAccordionButtonState(
      totalNumElements: number, currentMaxNumElementsShown: number,
      initialMaxNumElementsShown: number): string {
    if (totalNumElements > currentMaxNumElementsShown) {
      return 'show-more';
    } else if (totalNumElements <= initialMaxNumElementsShown) {
      return 'no-button';
    }
    return 'show-less';
  }
}
