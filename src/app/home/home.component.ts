import { HttpClient } from '@angular/common/http';
import { AfterViewChecked, Component, OnInit } from '@angular/core';
import 'bootstrap';
declare var $: any;
import { environment } from 'src/env/environment';

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
  baseUrl: string = environment.baseUrl
  currentPath: string = "";

  constructor(private http: HttpClient) {
    if (environment.production) {
      console.log(`[Bottomhalf]: Service.Manager Running on ${environment.env}`);
    } else {
      console.log("[Bottomhalf]: Service.Manager Running on localhost");
    }
  }

  ngAfterViewChecked(): void {
    $('[data-bs-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });

    $('[data-bs-toggle="tooltip"]').on('click', function () {
      $(this).tooltip('dispose');
    });
  }

  checkServiceStatus() {
    this.http.post(this.baseUrl + "Action/CheckStatus", { Command: "" }).subscribe(res => {
      if (res) {
        console.log(res);
      }
    });
  }

  ngOnInit(): void {
    this.loadData(this.folderDiscovery.RootDirectory);
  }

  loadData(directory: string) {
    this.isLoading = true;
    this.http.post(this.baseUrl + "FolderDiscovery/GetFolder", {TargetDirectory: directory}).subscribe((res: any) => {
      if (res) {
        this.folderDiscovery = res;
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

}

interface Pipeline {
  Status : number,
  PipelineId: string,
  Trigger: string,
  Commit: string,
  Stages: Array<number>,
  UpdatedOn: Date,
  RunTime: string
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
