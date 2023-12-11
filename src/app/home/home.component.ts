import { AfterViewChecked, Component, OnInit } from '@angular/core';
import 'bootstrap';
import { AjaxService } from '../services/ajax.service';
import { Subject, interval, switchMap, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { RouteDatahandler } from '../services/RouteDatahandler';
declare var $: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewChecked {
  isLoading: boolean = false;
  isReady: boolean = false;
  gitHubContent: GitHubContent = {
    Name: "",
    Url: "",
    DownloadUrl: "",
    Type: "",
    GitUrl: "",
    Path: ""
  };
  currentPath: string = "";
  command: string = null;
  cmdType: string = "linux";
  fileDetail: Array<any> = [];
  allFolders: Array<any> = [];
  selectedFolder: any = null;
  private destroy$ = new Subject<void>();
  isBackBtnEnable: boolean = false;

  constructor(
    private http: AjaxService,
    private router: Router,
    private routeData: RouteDatahandler
    ) { }

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

  reRunFile(fileDetail: any) {
    if (fileDetail) {
      this.isLoading = true;
      this.runAndRetryForStatus(fileDetail, "Action/ReRunFile");
    }
  }

  stopFile(fileDetail: any) {
    if (fileDetail) {
      this.isLoading = true;
      this.runAndRetryForStatus(fileDetail, "Action/StopFile");
    }
  }

  checkStatus(fileDetail: any) {
    if (fileDetail) {
      this.isLoading = true;
      this.runAndRetryForStatus(fileDetail, "Action/CheckStatus");
    }
  }

  runFile(fileDetail: any) {
    if (fileDetail) {
      this.isLoading = true;
      this.runAndRetryForStatus(fileDetail, "Action/RunFile");
    }
  }

  runAndRetryForStatus(fileDetail: any, url: string): void {
    const timer$ = interval(1000); // Adjust the interval as needed
    let counter = 0;
    let i = 1;
    fileDetail.IsLoading = true;
    timer$
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.http.post(url, {
          FullPath: fileDetail.FullPath,
          FileName: fileDetail.FileName,
          PVSize: `${i++}`
        }))
      )
      .subscribe((res: any) => {
        if (res && res.HttpStatusCode == 200) {
          let detail = res.ResponseBody;
          console.log('Received data:', detail.FileName);
          fileDetail.IsLoading = false;
          let currentFile = this.fileDetail.find(x => x.FileName == detail.FileName);
          currentFile.Status = detail.Status;
          this.isLoading = false;
        }

        // Check if it's the 5th request, then stop the timer
        counter++;
        this.stopTimer();
        if (counter === 1 || res.HttpStatusCode == 200) {
          fileDetail.IsLoading = false;
          this.stopTimer();
        }
      },
        (error) => {
          console.error('Error...');
          this.isLoading = false;
          fileDetail.IsLoading = false;
          this.stopTimer();
        }
      );
  }

  private stopTimer(): void {
    console.log('Stopping timer.');
    this.destroy$.next();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.loadData(this.gitHubContent.GitUrl);
    let data = this.routeData.getData();
    if (data) {
      this.getFileList(data.FullPath , data.FolderName);
    }
  }

  loadData(directory: string) {
    this.isLoading = true;
    this.isReady = false;
    this.http.post("FolderDiscovery/GetAllFolder", { TargetDirectory: directory }).subscribe((res: any) => {
      if (res.ResponseBody) {
        this.gitHubContent = res.ResponseBody;
        this.allFolders = res.ResponseBody.Folders
        if (this.currentPath === "")
          this.currentPath = this.gitHubContent.GitUrl;
      }

      this.isLoading = false;
      this.isReady = true;
    }, (err) => {
      this.isLoading = false;
      this.isReady = true;
      alert(err.message);
    })
  }

  getFileList(FullPath: string, FolderName: string) {
    if (FullPath && FullPath != "" && FolderName && FolderName != "") {
      this.isLoading = true;
      this.http.post("FolderDiscovery/GetAllFile", { TargetDirectory: FullPath })
        .subscribe((res: any) => {
          if (res.ResponseBody) {
            this.selectedFolder = {
              FolderName: FolderName,
              FullPath: FullPath
            }
            
            this.isBackBtnEnable = false;
            this.fileDetail = res.ResponseBody;
            this.fileDetail.forEach(x => {
              x.IsLoading = false;
            })
            let data = this.routeData.getData();
            if (data) {
              this.routeData.removeData();
            }
            this.isLoading = false;
          }
        }, (err) => {
          this.isLoading = false;
          alert(err.message);
        })
    } else {

    }
  }

  viewFolder(item: string) {
    if (item) {
      this.currentPath = item;
      this.loadData(item);
    }
  }

  backToFolder() {
    let currentPath;
    let folder;
    if (this.selectedFolder.FullPath.includes("/")) {
      let parts = this.selectedFolder.FullPath.split('/');

      // Remove the last two items
      parts.splice(-1);

      // Join the remaining parts back into a string
      currentPath = parts.join('/');
      folder = parts.slice(-1)[0];
    } else {
      let parts = this.selectedFolder.FullPath.split('\\');
      parts.splice(-1);
      currentPath = parts.join("\\");
    }
    console.log(currentPath);
    this.getFileList(currentPath, folder);
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

  searchFolder(e: any) {
    let value = e.target.value;
  }

  resetSearch(e: any) {
    e.target.value = "";
  }

  loadFileEditor(file: any) {
    this.routeData.setData(file);
    this.router.navigateByUrl("editor");
  }
}


enum Status {
  Passed = 1,
  Failed = 2,
  Running = 3,
  Warning = 4
}

interface GitHubContent {
  Name: string,
  Url: string,
  DownloadUrl: string,
  Type: string,
  GitUrl: string,
  Path: string
}
