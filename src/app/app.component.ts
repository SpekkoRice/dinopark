import { Component } from '@angular/core';
import * as _ from "lodash";
import { DinoStatusService, IDinoEvent } from "./dino-status.service";
import * as moment from "moment";

interface IGridEntry {
  coordinate: string;
  dinoId?: number;
  maintenance: boolean;
  dino?: Partial<IDinoEvent>;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  public title = 'Dinopark Maintanence Grid';
  public xSeed = 'abcdefghijklmnopqrstuvwxyz'.toUpperCase();
  public xAxisTicks = [];
  public yAxisTicks = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16];
  public currentDate: string;

  public gridMap: Array<IGridEntry> = [];
  public dinosaurs:IDinoEvent[] = [];

  constructor(private dinoService:DinoStatusService) {
    // this.xTicks = this.xSeed.split("");
    // this.currentDate = moment().format("D MMMM YYYY");
    this.xAxisTicks = this.xSeed.split("");
    // this.buildGridModel();
    this._buildGridMap();
    this.dinoService.dinoFeed.subscribe((data) => {
      // this.processLog(data)
      this._process(data);
    });
  }

  public requiresMaintenance(coordinate: string): boolean {
    const gridEntry = _.find(this.gridMap, (entry: IGridEntry) => entry.coordinate == coordinate);
    if (gridEntry.maintanence) return true;
    return false;
  }

  public safetyFeasability(coordinate: string): 'safe' | 'unsafe' | 'meh' {
    const gridEntry = _.find(this.gridMap, (entry: IGridEntry) => entry.coordinate == coordinate);
    if (!gridEntry.dino) return 'meh';
    if (gridEntry.dino.herbivore) return 'safe';
    if (gridEntry.dino.isDigesting) return 'safe';
    return 'unsafe';
  }

  private _buildGridMap(): void {
    _.forEach(this.xAxisTicks, (alpha) => {
      _.forEach(this.yAxisTicks, (num) => {
        this.gridMap.push({
          coordinate: `${alpha}${num}`,
          maintenance: false,
        });
      })
    })
  }

  private _process(data: Array<IDinoEvent>): void {
    this.dinosaurs = data.map((event) => {
      if(event.kind == "dino_added") return event;
    }).filter((event) => event != null);

    const dataAsc = data.sort((e1, e2) =>  moment(e1.time).valueOf() - moment(e2.time).valueOf());
    _.forEach(dataAsc, (event: IDinoEvent) => {
      if (event.kind == "dino_location_updated") this.__locactionUpdate(event.location, event.dinosaur_id);
      if (event.kind == "dino_removed") this.__dinoRemove(event.dinosaur_id);
      if (event.kind == "dino_fed") this.__dinoFed(event);
      if (event.kind == "maintenance_performed") this.__maintanencePerformed(event);
    });
  }

  private __maintanencePerformed(event:IDinoEvent): void {
    const daysPass = moment().diff(moment(event.time), 'days');
    const gridEntry = _.find(this.gridMap, (entry: IGridEntry) => entry.coordinate == event.location);
    if (daysPass > 30) {
      gridEntry.maintanence = false;
    } else {
      gridEntry.maintanence = true;
    }
  }

  private __dinoFed(event: IDinoEvent): void {
    const hoursPass = moment().diff(moment(event.time), 'hours');
    const gridEntry = _.find(this.gridMap, (gridEntry: IGridEntry) => gridEntry.dinoId == event.dinosaur_id);
    if (hoursPass > gridEntry.dino.digestion_period_in_hours) {
      gridEntry.dino.isDigesting = false;
    } else {
      gridEntry.dino.isDigesting = true;
    }
  }

  private __dinoRemove(dinoId: number): void {
    _.remove(this.dinosaurs, (dino:IDinoEvent) => dino.dinosaur_id == dinoId);
    this.___removeFromGrid(dinoId);
  }

  private __locactionUpdate(coordinate: string, dinoId: number): void {
    const dino = _.find(this.dinosaurs, (dinosaur:IDinoEvent) => dinosaur.id == dinoId);
    this.___removeFromGrid(dinoId);
    const toUpdateGridEntry = _.find(this.gridMap, (gridEntry: IGridEntry) => gridEntry.coordinate == coordinate);
    toUpdateGridEntry.dino = dino;
    toUpdateGridEntry.dinoId = dinoId;
  }

  private ___removeFromGrid(dinoId: number) {
    const gridEntry = _.find(this.gridMap, (gridEntry: IGridEntry) => gridEntry.dinoId == dinoId);
    if (gridEntry) {
      delete gridEntry.dinoId;
      delete gridEntry.dino;
    }
  }

  // Below is wrong way of doing it.
  // public xSeed = 'abcdefghijklmnopqrstuvwxyz';
  // public ySeed = 16;
  // public dinos:IDinoEvent[] = [];

  // public modelFlatMap: Partial<{
  //   [name: string]: {
  //     safe: "safe" | "unsafe" | "meh",
  //     maintanence: boolean;
  //     dinoId?: number;
  //   };
  // }> = {};

  

  // public buildGridModel = () => {
  //   _.forEach(this.xAxisTicks, (alpha) => {
  //     _.forEach(this.yAxisTicks, (num) => {
  //       this.modelFlatMap[`${alpha}${num}`] = {
  //         safe: "meh",
  //         maintanence: null,
  //       }
  //     })
  //   })
  // }

  // public processLog = (data:IDinoEvent[]) => {
  //   this.dinos = data.map((e) => {if(e.kind == "dino_added") return e;}).filter((e) => e != null);
  //   const sorted = data.sort((e1, e2) =>  moment(e1.time).valueOf() - moment(e2.time).valueOf());

  //   _.forEach(sorted, (event: IDinoEvent) => {
  //     if (event.kind == "dino_location_updated") this._dinoLocationHandler(event);
  //     if (event.kind == "dino_removed") this._dinoRemovedHandler(event);
  //     if (event.kind == "dino_fed") this._dinoFedHandler(event);
  //     if (event.kind == "maintenance_performed") this._maintenanceHandler(event);
  //   });
  // }

  // private _dinoLocationHandler(event: IDinoEvent) {
  //   _.forEach(this.modelFlatMap, (map, i) => {
  //     if (map.dinoId == event.dinosaur_id) {
  //       delete map.dinoId;
  //       map.safe = "meh";
  //     }
  //     if (i == event.location.toLocaleLowerCase()) {
  //       map.dinoId = event.dinosaur_id;
  //       map.safe = "unsafe";
  //     }
  //   });
  //   this.modelFlatMap[event.location.toLocaleLowerCase()].dinoId = event.dinosaur_id;
  // }

  // private _dinoRemovedHandler(event: IDinoEvent) {
  //   _.forEach(this.modelFlatMap, (map) => {
  //     if (map.dinoId == event.dinosaur_id) {
  //       delete map.dinoId;
  //       map.safe = "meh";
  //     }
  //   });
  // }
  
  // private _dinoFedHandler(event: IDinoEvent) {
  //   const hoursPastFed = moment().diff(moment(event.time), 'hours');
  //   const dino:IDinoEvent = _.find(this.dinos, (o) => o.id == event.dinosaur_id);
  //   _.forEach(this.modelFlatMap, (map, i) => {
  //     if (map.dinoId == event.dinosaur_id) {
  //       if (hoursPastFed < dino.digestion_period_in_hours || dino.herbivore) {
  //         map.safe = "safe";
  //         return;
  //       }
  //       if (hoursPastFed > dino.digestion_period_in_hours || !dino.herbivore) {
  //         map.safe = "unsafe";
  //         return;
  //       }
  //       map.safe = "meh";
  //     }
  //   });
  // }

  // private _maintenanceHandler(event: IDinoEvent) {
  //   const daysPastMaint = moment().diff(moment(event.time), 'days');
  //   if (daysPastMaint >= 30) {
  //     this.modelFlatMap[event.location.toLocaleLowerCase()].maintanence = true;
  //   } else {
  //     this.modelFlatMap[event.location.toLocaleLowerCase()].maintanence = false;
  //   }
  // }
}
