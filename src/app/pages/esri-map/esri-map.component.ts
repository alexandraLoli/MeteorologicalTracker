import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
  OnDestroy
} from "@angular/core";

import esri = __esri; // Esri TypeScript Types

import Config from '@arcgis/core/config';
import WebMap from '@arcgis/core/WebMap';
import MapView from '@arcgis/core/views/MapView';
import Locate from '@arcgis/core/widgets/Locate';

import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';

import FeatureSet from '@arcgis/core/rest/support/FeatureSet';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';

import Search from "@arcgis/core/widgets/Search";
import { timestamp } from "rxjs";

import RouteParameters from '@arcgis/core/rest/support/RouteParameters';
import * as route from "@arcgis/core/rest/route.js";
import { Database, list, push } from '@angular/fire/database';

import { WeatherResponse, Bulk, Location, Current, Condition, Query} from "../../services/weather.service";

import { WeatherService } from '../../services/weather.service';
import { onValue, ref } from "firebase/database";

@Component({
  selector: "app-esri-map",
  templateUrl: "./esri-map.component.html",
  styleUrls: ["./esri-map.component.scss"]
})

export class EsriMapComponent implements OnInit, OnDestroy {
  @Output() mapLoadedEvent = new EventEmitter<boolean>();

  @ViewChild("mapViewNode", { static: true }) private mapViewEl!: ElementRef;

  public weatherData!: WeatherResponse;
  map!: esri.Map;
  view!: esri.MapView;
  graphicsLayer!: esri.GraphicsLayer;
  graphicsLayerUserPoints!: esri.GraphicsLayer;
  graphicsLayerRoutes!: esri.GraphicsLayer;
  trailheadsLayer!: esri.FeatureLayer;

  zoom = 6;
  center: Array<number> = [25.3333, 45.75];
  basemap = "streets-vector";
  loaded = false;
  directionsElement: any;
  showForm: boolean = false;

  constructor(private weatherService: WeatherService, private db: Database) { }

  ngOnInit() {
    this.initializeMap().then(() => {
      this.loaded = this.view.ready;
      this.mapLoadedEvent.emit(true);
    });
    this.getWeather();
    this.getIncidents();
  }

  toggleForm() { 
    this.showForm = !this.showForm;
    const divForm = document.querySelector(".incident-form") as HTMLElement;
    const overlay = document.querySelector(".overlay") as HTMLElement;
    if (divForm && overlay) {
      divForm.style.display = this.showForm ? "block" : "none";
      overlay.style.display = this.showForm ? "block" : "none";
    }
    console.log(this.showForm);
  }

  // Functie care ia datele din formular
  submitForm(event: Event) {

    event.preventDefault();

    const incidentName = (document.getElementById("name") as HTMLInputElement)?.value;
    const incidentTemperature = (document.getElementById("temperature") as HTMLInputElement)?.value;
    const incidentHumidity = (document.getElementById("humidity") as HTMLInputElement)?.value;
    const incidentWindSpeed= (document.getElementById("wind_speed") as HTMLInputElement)?.value;
    const incidentConditions= (document.getElementById("conditions") as HTMLSelectElement)?.value;
    const incidentType= (document.getElementById("type") as HTMLSelectElement)?.value;
    const incidentSeverity= (document.getElementById("severity") as HTMLSelectElement)?.value;
    const incidentDescription= (document.getElementById("description") as HTMLTextAreaElement)?.value;


    const locateWidget = new Locate({
      view: this.view,
      goToOverride: (view, options) => { },
    });
    
    locateWidget.locate().then((result) => {
      const { latitude, longitude } = result.coords;
      const location = {
        latitude: latitude,
        longitude: longitude
      }

      const weather_conditions = {
        temperature: incidentTemperature,
        humidity: incidentHumidity,
        wind_speed: incidentWindSpeed,
        conditions: incidentConditions
      }

      const incident_details = {
        type: incidentType,
        severity: incidentSeverity,
        description: incidentDescription
      }

      const incident = {
        name: incidentName,
        timestamp: new Date().toISOString(),
        location: location,
        weather_conditions: weather_conditions,
        incident_details: incident_details
      }

      console.log(incident);
      this.addIncident(incident)

    })
    .catch((error) => {
      console.error('Error getting location:', error);
    });

  }

  async initializeMap() {
    try {
      Config.apiKey = "AAPTxy8BH1VEsoebNVZXo8HurJslmK0OQqJ65Xkr2heL5V2iqhPRl1gkDz_KUVf39ij7ktHW_1qHKpSaAHtODrSnSX4KIuar88YsxR-5bQ0iPjtI6cfgypohkTIE-k0f0fUYkmQkeFTVWQ_5Rf_hM_zATGo0Rbibw3FiGkKBXy5OOF0qRw_VRkJ8ScfyCPOPAAp2rGmJje7fKR5MP-P6RGAWE30qzcMwbYajgyL6nRYM1wI.AT1_FakVI4L1";

      const mapProperties: esri.WebMapProperties = {
        basemap: this.basemap
      };
      this.map = new WebMap(mapProperties);

      this.addFeatureLayers();
      this.addGraphicsLayer();

      const mapViewProperties = {
        container: this.mapViewEl.nativeElement,
        center: this.center,
        zoom: this.zoom,
        map: this.map
      };
      this.view = new MapView(mapViewProperties);

      this.view.on('pointer-move', ["Shift"], (event) => {
        const point = this.view.toMap({ x: event.x, y: event.y });
        console.log("Map pointer moved: ", point.longitude, point.latitude);
      });

      await this.view.when();
      console.log("ArcGIS map loaded");
      // this.addRouting();
      this.addSearchWidget();
      return this.view;
    } catch (error) {
      console.error("Error loading the map: ", error);
      alert("Error loading the map");
      return null;
    }
  }

  addSearchWidget() {
    const searchWidget = new Search({
        view: this.view
    });
    this.view.ui.add(searchWidget, "top-right");
}

addFeatureLayers() {
  this.trailheadsLayer = new FeatureLayer({
    url: "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trailheads/FeatureServer/0",
    outFields: ['*']
  });
  this.map.add(this.trailheadsLayer);

  const trailsLayer = new FeatureLayer({
    url: "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trails/FeatureServer/0"
  });
  this.map.add(trailsLayer, 0);

  const parksLayer = new FeatureLayer({
    url: "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Parks_and_Open_Space/FeatureServer/0"
  });
  this.map.add(parksLayer, 0);

  console.log("Feature layers added");
}

addGraphicsLayer() {
  this.graphicsLayer = new GraphicsLayer();
  this.map.add(this.graphicsLayer);
  this.graphicsLayerUserPoints = new GraphicsLayer();
  this.map.add(this.graphicsLayerUserPoints);
  this.graphicsLayerRoutes = new GraphicsLayer();
  this.map.add(this.graphicsLayerRoutes);
}

addWeatherLocations() {
this.weatherData.bulk.map((item: Bulk) => {
  let point = new Point({
    longitude: item.query.location.lon,
    latitude: item.query.location.lat
  });

const simpleMarkerSymbol = {
  type: "simple-marker",
  color: [0, 0, 0],  // Orange
  outline: {
    color: [255, 255, 255], // White
    width: 2
  }
};

const pointGraphic: esri.Graphic = new Graphic({
  geometry: point,
  symbol: simpleMarkerSymbol,
  attributes: {
    LocationName: item.query.location.name,
    Temperature: item.query.current.temp_c + " °C", 
    Conditions: item.query.current.condition.text,
    WindSpeed: item.query.current.wind_kph + " km/h",
    WindDirection: item.query.current.wind_dir,
    Humidity: item.query.current.humidity + " %"
  },
  popupTemplate: {
    title: "{LocationName}",
    content: [
      {
        type: "media", // Define a media content block
        mediaInfos: [
          {
            title: item.query.current.condition.text,
            type: "image",
            value: {
              sourceURL: "https:" + item.query.current.condition.icon
            },
          }
        ]
      },
      {
        type: "fields",
        fieldInfos: [
          {
            fieldName: "Temperature",
            label: "Temperature",
            visible: true,
            format: {
              places: 1,
              digitSeparator: true
            }
          },
          {
            fieldName: "Humidity", // The field in the dataset for humidity
            label: "Humidity",
            visible: true
          },
          {
            fieldName: "WindSpeed",
            label: "Wind Speed",
            visible: true
          },
          {
            fieldName: "WindDirection",
            label: "Wind Direction",
            visible: true
          }
        ]
      }
    ]
  }
});
this.graphicsLayerUserPoints.add(pointGraphic);
});
}

// addRouting() {
//   const routeUrl = "https://route-api.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World";
//   this.view.on("click", (event) => {
//     this.view.hitTest(event).then((elem: esri.HitTestResult) => {
//       if (elem && elem.results && elem.results.length > 0) {
//         let point: esri.Point | undefined = elem.results.find(e => e.layer === this.trailheadsLayer)?.mapPoint;
//         if (point) {
//           console.log("get selected point: ", elem, point);
//           if (this.graphicsLayerUserPoints.graphics.length === 0) {
//             this.addPoint(point.latitude, point.longitude);
//           } else if (this.graphicsLayerUserPoints.graphics.length === 1) {
//             this.addPoint(point.latitude, point.longitude);
//             this.calculateRoute(routeUrl);
//           } else {
//             this.removePoints();
//           }
//         }
//       }
//     });
//   });
// }

addPoint(lat: number, lng: number) {
  let point = new Point({
    longitude: lng,
    latitude: lat
  });

  const simpleMarkerSymbol = {
    type: "simple-marker",
    color: [226, 119, 40],  // Orange
    outline: {
      color: [255, 255, 255], // White
      width: 1
    }
  };

  let pointGraphic: esri.Graphic = new Graphic({
    geometry: point,
    symbol: simpleMarkerSymbol
  });

  this.graphicsLayerUserPoints.add(pointGraphic);
}

removePoints() {
  this.graphicsLayerUserPoints.removeAll();
}

removeRoutes() {
  this.graphicsLayerRoutes.removeAll();
}

async calculateRoute(routeUrl: string) {
  const routeParams = new RouteParameters({
    stops: new FeatureSet({
      features: this.graphicsLayerUserPoints.graphics.toArray()
    }),
    returnDirections: true
  });

  try {
    const data = await route.solve(routeUrl, routeParams);
    this.displayRoute(data);
  } catch (error) {
    console.error("Error calculating route: ", error);
    alert("Error calculating route");
  }
}

displayRoute(data: any) {
  for (const result of data.routeResults) {
    result.route.symbol = {
      type: "simple-line",
      color: [5, 150, 255],
      width: 3
    };
    this.graphicsLayerRoutes.graphics.add(result.route);
  }
  if (data.routeResults.length > 0) {
    this.showDirections(data.routeResults[0].directions.features);
  } else {
    alert("No directions found");
  }
}

clearRouter() {
  if (this.view) {
    // Remove all graphics related to routes
    this.removeRoutes();
    this.removePoints();
    console.log("Route cleared");
    this.view.ui.remove(this.directionsElement);
    this.view.ui.empty("top-right");
    console.log("Directions cleared");
  }
}

showDirections(features: any[]) {
  this.directionsElement = document.createElement("ol");
  this.directionsElement.classList.add("esri-widget", "esri-widget--panel", "esri-directions__scroller");
  this.directionsElement.style.marginTop = "0";
  this.directionsElement.style.padding = "15px 15px 15px 30px";

  features.forEach((result, i) => {
    const direction = document.createElement("li");
    direction.innerHTML = `${result.attributes.text} (${result.attributes.length} miles)`;
    this.directionsElement.appendChild(direction);
  });

  this.view.ui.empty("top-right");
  this.view.ui.add(this.directionsElement, "top-right");
}

getWeather(): void {
  const locations = ['Bucharest', 'Timisoara', 'Oradea', 'Craiova', 'Brasov', 'Sibiu', 'Iasi', 'Constanta', 'Galati', 'Cluj-Napoca', 'Baia Mare', 'Bacau', 'Pitesti', 'Targu Mures', 'Suceava', 'Miercurea Ciuc', 'Arad'];
  this.weatherService.getCitiesWeather(locations).subscribe({
    next: (data) => {
      this.weatherData = data;
      this.addWeatherLocations()
      console.log(this.weatherData);
    },
    error: (error) => {
      console.error('There was an error with Weather API Service', error);
    }
  });
}

addIncident(incident: any) {
  const itemsRef = ref(this.db, 'incidents');
  push(itemsRef, incident).then(() => {
    console.log('Incident added!');
  }).catch((error) => {
    console.error('Error adding incident: ', error);
  });
}

getIncidents() {
  const incidentsRef = ref(this.db, 'incidents');
  onValue(incidentsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const incidents = Object.values(data); // Transformăm obiectul în array
      console.log('Incidents retrieved:', incidents);
      this.displayIncidentsOnMap(incidents); // Afișează incidentele pe hartă
    } else {
      console.log('No incidents found.');
    }
  });
}

displayIncidentsOnMap(incidents: any[]) {
  // Eliminăm toate punctele existente înainte de a adăuga altele noi

  incidents.forEach((incident) => {
    const { latitude, longitude } = incident.location;

    // Adăugăm punctul pe hartă
    this.addPoint(latitude, longitude);

    // Dacă dorești să adaugi și pop-up-uri, adaptează `addPoint` pentru a le include
    const popupTemplate = {
      title: incident.name,
      content: `
        <b>Temperature:</b> ${incident.weather_conditions.temperature}°C<br>
        <b>Humidity:</b> ${incident.weather_conditions.humidity}%<br>
        <b>Wind Speed:</b> ${incident.weather_conditions.wind_speed} km/h<br>
        <b>Conditions:</b> ${incident.weather_conditions.conditions}<br>
        <b>Type:</b> ${incident.incident_details.type}<br>
        <b>Severity:</b> ${incident.incident_details.severity}<br>
        <b>Description:</b> ${incident.incident_details.description}
      `
    };

    // Creează un `Graphic` cu pop-up dacă este necesar
    const graphicWithPopup: esri.Graphic = new Graphic({
      geometry: new Point({ latitude, longitude }),
      symbol: new SimpleMarkerSymbol({
        color: [226, 119, 40],  // Orange
        outline: {
          color: [255, 255, 255], // White
          width: 1
        }
      }),
      popupTemplate: popupTemplate
    });
    

    this.graphicsLayerUserPoints.add(graphicWithPopup);
  });
}


  ngOnDestroy() {
      if (this.view) {
        this.view.container = null as unknown as HTMLDivElement; // Forțează conversia tipului
      }
    }
  }