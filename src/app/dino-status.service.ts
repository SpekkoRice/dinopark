import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as Rx from "rxjs";
import * as moment from "moment";
import * as _ from "lodash";

export interface IDinoEvent {
  id?: number;
  dinosaur_id?: number;
  kind?: "maintenance_performed" | "dino_added" | "dino_location_updated" | "dino_fed" | "dino_removed";
  location?: string;
  park_id?: 1;
  time?: string;
  digestion_period_in_hours?: number;
  herbivore?: boolean;
  gender?: "male" | "female";
  species?: string;
  name?: string;
}

export interface IMaintenancePerformed {
  kind: "maintenance_performed";
  location: string;
  park_id: number;
  time: string;
}

export interface IDinoAdded {
  digestion_period_in_hours: number;
  gender: string;
  herbivore: boolean;
  id: number;
  kind: "dino_added"
  name: string;
  park_id: number;
  species: string;
  time: string;
}

export interface IDinoLocationUpdated {
  dinosaur_id: number;
  kind: "dino_location_updated";
  location: string;
  park_id: number;
  time: string;
}

export interface IDinoFed {
  dinosaur_id: number;
  kind: "dino_fed"
  park_id: number;
  time: string;
}

export interface IDinoRemoved {
  dinosaur_id: number;
  kind: "dino_removed"
  park_id: number;
  time: string;
}

@Injectable({
  providedIn: 'root'
})
export class DinoStatusService {

  private feedUrl = 'https://dinoparks.net/nudls/feed';
  private cachedFeed:Array<IDinoEvent> = [];

  public dinoFeed:Rx.Subject<IDinoEvent[]> = new Rx.Subject();
  public maintenancePerformed:Rx.Subject<IMaintenancePerformed> = new Rx.Subject();
  public dinoAdded:Rx.Subject<IDinoAdded> = new Rx.Subject();
  public dinoLocationUpdated:Rx.Subject<IDinoLocationUpdated> = new Rx.Subject();
  public dinoFed:Rx.Subject<IDinoFed> = new Rx.Subject();
  public dinoRemoved:Rx.Subject<IDinoRemoved> = new Rx.Subject();

  constructor(private http: HttpClient) {
    // this.getFeed();
    this.diffCache();
  }

  private async getFeed(): Promise<IDinoEvent[]> {
    return this.http.get(this.feedUrl).toPromise().then((data:IDinoEvent[]) => {
      const dataAsc = data.sort((e1, e2) =>  moment(e1.time).valueOf() - moment(e2.time).valueOf());
      this.dinoFeed.next(dataAsc);
      return dataAsc;
    });
  }

  private async diffCache() {
    const feed = await this.getFeed();
    const diff = _.difference(feed, this.cachedFeed);
    _.forEach(diff, (entry: IDinoEvent) => {
      if (entry.kind == "dino_added") this.dinoAdded.next(<IDinoAdded>entry); 
      if (entry.kind == "dino_fed") this.dinoFed.next(<IDinoFed>entry);
      if (entry.kind == "dino_location_updated") this.dinoLocationUpdated.next(<IDinoLocationUpdated>entry);
      if (entry.kind == "dino_removed") this.dinoRemoved.next(<IDinoRemoved>entry);
      if (entry.kind == "maintenance_performed") this.maintenancePerformed.next(<IMaintenancePerformed>entry);
    });
    this.cachedFeed = _.clone(feed);
  }
}
