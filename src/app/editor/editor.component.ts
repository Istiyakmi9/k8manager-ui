import { AfterContentChecked, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EditorComponent implements OnInit, AfterContentChecked, OnDestroy {
  textarea: any = null;
  lineNumbers: any = null;
  isBinded: boolean = false;

  ngOnDestroy(): void {
    this.textarea.removeEventListener('keyup');
    this.lineNumbers.removeEventListener('keyup');
  }

  ngAfterContentChecked(): void {
    if (!this.isBinded) {
      const textarea = document.querySelector('textarea')
      const lineNumbers = document.querySelector('.line-numbers')

      textarea.addEventListener('keyup', (event: any) => {
        const numberOfLines = event.target.value.split('\n').length

        lineNumbers.innerHTML = Array(numberOfLines)
          .fill('<span></span>')
          .join('')
      })

      textarea.addEventListener('keydown', event => {
        if (event.key === 'Tab') {
          const start = textarea.selectionStart
          const end = textarea.selectionEnd

          textarea.value = textarea.value.substring(0, start) + '\t' + textarea.value.substring(end)
          textarea.focus()      

          event.preventDefault()
        }
      })

      this.isBinded = true;
    }
  }

  // keyUpEvent(e: any) {
  //   const numberOfLines = e.target.value.split('\n').length

  //   this.lineNumbers.innerHTML = Array(numberOfLines)
  //     .fill('<span></span>')
  //     .join('')
  // }

  // editorKeyUpEvent(event: any) {
  //   if (event.key === 'Tab') {
  //     const start = this.textarea.selectionStart
  //     const end = this.textarea.selectionEnd

  //     this.textarea.value = this.textarea.value.substring(0, start) + '\t' + this.textarea.value.substring(end)
  //     this.textarea.focus()

  //     event.preventDefault()
  //   }
  // }

  ngOnInit(): void {

  }
}
