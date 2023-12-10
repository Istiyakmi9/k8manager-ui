import { AfterContentChecked, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { AjaxService } from '../services/ajax.service';
import { RouteDatahandler } from '../services/RouteDatahandler';
import { Router } from '@angular/router';

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
  fileDetail: any = { FileContent: "" };
  isReady: boolean = false;

  constructor(
    private http: AjaxService,
    private router: Router,
    private routeData: RouteDatahandler
  ) {}

  ngOnDestroy(): void {
    if (this.textarea)
      this.textarea.removeEventListener('keyup');

    if (this.lineNumbers)
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
  
  ngOnInit(): void {
    this.fileDetail = this.routeData.getData();

    if (this.fileDetail) {
      this.loadFileData();
    }
  }

  loadFileData() {
    this.isReady = false; 

    this.http.post("Editor/getfile", this.fileDetail).subscribe(res => {
      this.bindData(res);
    });
  }

  bindData(res: any) {
    if (res) {
      let data = res;
      if(data && data.FileContent != "") {
        this.fileDetail.FileContent = data.FileContent;
        // let textarea = document.getElementById('editor');
        // textarea.innerHTML = this.fileDetail.FileContent;
        if (this.fileDetail.FileContent) {
          let totalLine = this.fileDetail.FileContent.split('\n').length;
          const lineNumbers = document.querySelector('.line-numbers')
          lineNumbers.innerHTML = Array(totalLine)
          .fill('<span></span>')
          .join('')
        }
        this.isReady = true;
      }
    }
  }

  saveChanges() {
    this.http.post("Editor/updatefile", this.fileDetail).subscribe(res => {
      this.bindData(res);
    });
  }

  backToFolder() {
    let currentPath;
    let folder;
    if (this.fileDetail.FullPath.includes("/")) {
      let parts = this.fileDetail.FullPath.split('/');

      // Remove the last two items
      parts.splice(-1);

      // Join the remaining parts back into a string
      currentPath = parts.join('/');
      folder = parts.slice(-1)[0];
    } else {
      let parts = this.fileDetail.FullPath.split('\\');
      parts.splice(-1);
      currentPath = parts.join("\\");
      folder = parts.slice(-1)[0];
    }
    this.routeData.setData({
      FullPath: currentPath,
      FolderName: folder
    })
    this.router.navigateByUrl("home");
    //this.getFileList(currentPath, folder);
  }
}
