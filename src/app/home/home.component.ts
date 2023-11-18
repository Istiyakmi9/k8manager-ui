import { AfterViewChecked, Component, OnInit } from '@angular/core';
import 'bootstrap';
import { AjaxService } from '../services/ajax.service';
import { Subject, interval, switchMap, takeUntil } from 'rxjs';
declare var $: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewChecked {
  isLoading: boolean = false;
  isReady: boolean = false;
  folderDiscovery: FolderDiscover = {
    Files: [],
    Folders: [],
    RootDirectory: ""
  };
  currentPath: string = "";
  command: string = null;
  cmdType: string = "linux";
  fileDetail: Array<any> = [];
  allFolders: Array<any> = [];
  selectedFolder: any = null;
  private destroy$ = new Subject<void>();

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

  runFile(fileDetail: any) {
    if (fileDetail) {
      this.isLoading = true;
      this.runAndRetryForStatus(fileDetail, "Action/RunFile"); 
    }
  }

  runAndRetryForStatus(fileDetail: any, url: string): void {
    const timer$ = interval(2000); // Adjust the interval as needed
    let counter = 0;
    let i = 1;

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

          let currentFile = this.fileDetail.find(x => x.FileName == detail.FileName);
          currentFile.Status = detail.Status;
          this.isLoading = false;
        }

        // Check if it's the 5th request, then stop the timer
        counter++;
        if (counter === 5 || res.HttpStatusCode == 200) {
          this.stopTimer();
        }
      },
        (error) => {
          console.error('Error fetching data:', error);
          this.isLoading = false;
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


  loadData(directory: string) {
    this.isLoading = true;
    this.isReady = false;
    this.http.post("FolderDiscovery/GetAllFolder", { TargetDirectory: directory }).subscribe((res: any) => {
      if (res.ResponseBody) {
        this.folderDiscovery = res.ResponseBody;
        this.allFolders = res.ResponseBody.Folders
        if (this.currentPath === "")
          this.currentPath = this.folderDiscovery.RootDirectory;
      }

      this.isLoading = false;
      this.isReady = true;
    }, (err) => {
      this.isLoading = false;
      this.isReady = true;
      alert(err.message);
    })
  }

  getFileList(folder: any) {
    if (folder && folder.FullPath != "") {
      this.isLoading = true;
      this.http.post("FolderDiscovery/GetAllFile", { TargetDirectory: folder.FullPath })
        .subscribe((res: any) => {
          if (res.ResponseBody) {
            this.selectedFolder = folder.FolderName;
            this.fileDetail = res.ResponseBody;
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
    let parts = this.currentPath.split('\\');

    // Remove the last two items
    parts.splice(-1);

    // Join the remaining parts back into a string
    this.currentPath = parts.join('\\');
    this.loadData(this.currentPath);
  }

  reRunFile(fileDetail: any) {
    this.isLoading = true;
    this.http.post("Action/ReRunFile", fileDetail).subscribe((res: any) => {
      if (res.ResponseBody) {
        alert(res.ResponseBody);
        this.isLoading = false;
      }
    }, (err) => {
      this.isLoading = false;
      console.log(err);
    })
  }

  stopFile(fileDetail: any) {
    this.isLoading = true;
    this.http.post("Action/StopFile", fileDetail).subscribe((res: any) => {
      if (res.ResponseBody) {
        alert(res.ResponseBody);
        this.isLoading = false;
      }
    }, (err) => {
      this.isLoading = false;
      console.log(err);
    })
  }

  checkStatus(fileDetail: any) {
    this.isLoading = true;
    fileDetail.Command = "test"
    this.http.post("Action/CheckStatus", fileDetail).subscribe((res: any) => {
      if (res.ResponseBody) {
        alert(res.ResponseBody);
        this.isLoading = false;
      }
    }, (err) => {
      this.isLoading = false;
      console.log(err);
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

  searchFolder(e: any) {
    let value = e.target.value;
    if (value && value != "") {
      this.folderDiscovery.Folders = this.allFolders.filter(x => x.FolderName.includes(value));
    } else {
      this.folderDiscovery.Folders = this.allFolders;
    }
  }

  resetSearch(e: any) {
    e.target.value = "";
    this.folderDiscovery.Folders = this.allFolders;
  }

}


enum Status {
  Passed = 1,
  Failed = 2,
  Running = 3,
  Warning = 4
}

interface FolderDiscover {
  Folders: Array<string>,
  Files: Array<any>,
  RootDirectory: string
}
