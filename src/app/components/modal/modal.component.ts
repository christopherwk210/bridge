import { Component, ViewChild, ElementRef, Input, AfterViewInit, OnDestroy } from '@angular/core';

import { $ } from '../../shared/globals';

interface ActionButtonList {
  class: string;
  text: string;
}

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements AfterViewInit, OnDestroy {
  @Input() basic = false;
  @Input() title: string;
  @Input() icon: string;
  @Input() size: 'mini' | 'tiny' | 'small' | 'large';
  @Input() closable = true;
  @ViewChild('modal') modal: ElementRef;

  actionList: ActionButtonList[];
  remoteResolve: (value?: {} | PromiseLike<{}>) => void;

  constructor() {}

  ngAfterViewInit() {
  }

  ngOnDestroy() {
    if (this.isShowing()) this.hideModal();
    $('.ui.dimmer.modals').remove();
  }

  showModal(actions: ActionButtonList[]): Promise<number> {
    return new Promise(resolve => {
      this.actionList = actions;

      if (this.closable) {
        $(this.modal.nativeElement)
        .modal('setting', 'keyboardShortcuts', false)
        .modal('show');
      } else {
        $(this.modal.nativeElement)
        .modal('setting', 'keyboardShortcuts', false)
        .modal('setting', 'closable', false)
        .modal('show');
      }

      this.remoteResolve = resolve;
    });
  }

  isShowing() {
    return $(this.modal.nativeElement).modal('is active');
  }

  hideModal() {
    return $(this.modal.nativeElement).modal('hide');
  }

  selectResponse(answerIndex: number) {
    if (this.remoteResolve) this.remoteResolve(answerIndex);
    this.remoteResolve = undefined;
  }
}
