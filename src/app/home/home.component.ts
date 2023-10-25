import { AfterViewChecked, Component, OnInit } from '@angular/core';
import 'bootstrap';
declare var $: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewChecked {
  allPipeLine: Array<Pipeline> = [];

  constructor() {}

  ngAfterViewChecked(): void {
    $('[data-bs-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });

    $('[data-bs-toggle="tooltip"]').on('click', function () {
      $(this).tooltip('dispose');
    });
  }

  ngOnInit(): void {
    this.allPipeLine = [{
      Status: Status.Running,
      PipelineId: "#123456789",
      Trigger: "Developer",
      Commit: "Message",
      Stages: [1, 1, 1, 2, 2, 1, 1, 3, 4, 3, 2, 1, 4, 4, 4],
      UpdatedOn: new Date(),
      RunTime: new Date().getTime().toString()
    }, {
      Status: Status.Failed,
      PipelineId: "#123456789",
      Trigger: "Developer",
      Commit: "Message",
      Stages: [1, 1, 1, 2, 2, 1, 1, 3],
      UpdatedOn: new Date(),
      RunTime: new Date().getTime().toString()
    }, {
      Status: Status.Passed,
      PipelineId: "#123456789",
      Trigger: "Developer",
      Commit: "Message",
      Stages: [1, 1, 1, 2, 2, 1, 1, 3],
      UpdatedOn: new Date(),
      RunTime: new Date().getTime().toString()
    }, {
      Status: Status.Running,
      PipelineId: "#123456789",
      Trigger: "Developer",
      Commit: "Message",
      Stages: [1, 1, 1, 2, 2, 1, 1, 3],
      UpdatedOn: new Date(),
      RunTime: new Date().getTime().toString()
    }, {
      Status: Status.Running,
      PipelineId: "#123456789",
      Trigger: "Developer",
      Commit: "Message",
      Stages: [1, 1, 1, 2, 2, 1, 1, 3],
      UpdatedOn: new Date(),
      RunTime: new Date().getTime().toString()
    }, {
      Status: Status.Warning,
      PipelineId: "#123456789",
      Trigger: "Developer",
      Commit: "Message",
      Stages: [1, 1, 1, 2, 2, 1, 1, 3],
      UpdatedOn: new Date(),
      RunTime: new Date().getTime().toString()
    }]
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
