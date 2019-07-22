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
    this.xAxisTicks = this.xSeed.split("");
    this._buildGridMap();
    this.dinoService.dinoFeed.subscribe((data) => {
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
}
