import { AfterViewChecked, Component, OnInit } from '@angular/core';
import 'bootstrap';
import { AjaxService } from '../services/ajax.service';
declare var $: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewChecked {
  isLoading: boolean = false;
  folderDiscovery: FolderDiscover = {
    Files: [],
    Folders: [],
    RootDirectory: ""
  };
  currentPath: string = "";
  command: string = null;
  cmdType: string = "linux";

  constructor(private http: AjaxService) { }

  ngAfterViewChecked(): void {
    $('[data-bs-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });

    $('[data-bs-toggle="tooltip"]').on('click', function () {
      $(this).tooltip('dispose');
    });
  }

  checkServiceStatus() {
    this.http.post("Action/CheckStatus", { Command: "test" }).subscribe(res => {
      if (res.ResponseBody) {
        console.log(res.ResponseBody);
      }
    });
  }

  ngOnInit(): void {
    this.loadData(this.folderDiscovery.RootDirectory);
  }

  loadData(directory: string) {
    this.isLoading = true;
    this.http.post("FolderDiscovery/GetFolder", {TargetDirectory: directory}).subscribe((res: any) => {
      if (res.ResponseBody) {
        this.folderDiscovery = res.ResponseBody;
        if (this.currentPath === "")
          this.currentPath = this.folderDiscovery.RootDirectory;

        this.isLoading = false;
      }
    }, (err) => {
      this.isLoading = false;
      alert(err.message);
    })
  }

  viewFolder(item: string) {
    if (item) {
      this.currentPath = item;
      this.loadData(item);
    }
  }

  backToFolder() {
    let parts = this.currentPath.split('\\');

    // Remove the last two items
    parts.splice(-1);

    // Join the remaining parts back into a string
    this.currentPath = parts.join('\\');
    this.loadData(this.currentPath);
  }

  runFile(fileDetail: any) {
    if (fileDetail) {
      this.isLoading = true;
      this.http.post("Action/RunFile", fileDetail).subscribe((res: any) => {
        if (res.ResponseBody) {
          this.isLoading = false;
        }
      }, (err) => {
        this.isLoading = false;

      })
    }
  }

  reRunFile(fileDetail: any) {
    this.isLoading = true;
    this.http.post("Action/ReRunFile", fileDetail).subscribe((res: any) => {
      if (res.ResponseBody) {
        this.isLoading = false;
      }
    }, (err) => {
      this.isLoading = false;

    })
  }

  stopFile(fileDetail: any) {
    this.isLoading = true;
    this.http.post("Action/StopFile", fileDetail).subscribe((res: any) => {
      if (res.ResponseBody) {
        this.isLoading = false;
      }
    }, (err) => {
      this.isLoading = false;

    })
  }

  checkStatus(fileDetail: any) {
    this.isLoading = true;
    fileDetail.Command = "test"
    this.http.post("Action/CheckStatus", fileDetail).subscribe((res: any) => {
      if (res.ResponseBody) {
        this.isLoading = false;
      }
    }, (err) => {
      this.isLoading = false;

    })
  }

  runCustomCommand() {
    if (this.command) {
      this.isLoading = true;
      let value = {
        Command: this.command,
        isWindow: this.cmdType.toLowerCase() === "window" ? true : false,
        isMicroK8: this.cmdType.toLowerCase() === "mickrok8" ? true : false,
        isLinux: this.cmdType.toLowerCase() === "linux" ? true : false,
        FilePath: ""
      }
      this.http.post("FolderDiscovery/RunCommand", value).subscribe((res: any) => {
        if (res.ResponseBody) {
          alert(res.ResponseBody);
        }
        this.isLoading = false;
      }, (err) => {
        this.isLoading = false;
        console.log(err)
      })
    }
  }

}


enum Status {
  Passed= 1,
  Failed= 2,
  Running = 3,
  Warning = 4
}

interface FolderDiscover {
  Folders: Array<string>,
  Files: Array<any>,
  RootDirectory: string
}
