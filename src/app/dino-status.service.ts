import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as Rx from "rxjs";

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

@Injectable({
  providedIn: 'root'
})
export class DinoStatusService {

  private feed = 'https://dinoparks.net/nudls/feed';
  public dinoFeed:Rx.Subject<IDinoEvent[]> = new Rx.Subject();

  constructor(private http: HttpClient) {
    this.getFeed();
  }

  private async getFeed() {
    return this.http.get(this.feed).toPromise().then((data:IDinoEvent[]) => {
      this.dinoFeed.next(data);
      return data;
    });
  }
}
