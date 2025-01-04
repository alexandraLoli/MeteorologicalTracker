  import {
      Component,
      OnInit,
      ViewChild,
      ElementRef,
      Output,
      EventEmitter,
      NgModule,
      OnDestroy
    } from "@angular/core";



    import esri = __esri; // Esri TypeScript Types
    
    import Config from '@arcgis/core/config';
    import WebMap from '@arcgis/core/WebMap';
    import MapView from '@arcgis/core/views/MapView';
    import { CommonModule } from '@angular/common';
    
    import Search from "@arcgis/core/widgets/Search";
    
    @Component({
      selector: "app-esri-map",
      templateUrl: "./esri-map.component.html",
      styleUrls: ["./esri-map.component.scss"]
    })

    export class EsriMapComponent implements OnInit, OnDestroy {
      @Output() mapLoadedEvent = new EventEmitter<boolean>();
    
      @ViewChild("mapViewNode", { static: true }) private mapViewEl!: ElementRef;

      map!: esri.Map;
      view!: esri.MapView;
      graphicsLayer!: esri.GraphicsLayer;
      graphicsLayerUserPoints!: esri.GraphicsLayer;
      graphicsLayerRoutes!: esri.GraphicsLayer;
      trailheadsLayer!: esri.FeatureLayer;

    
      zoom = 10;
      center: Array<number> = [26.05682450024377, 44.43817583063242];
      basemap = "streets-vector";
      loaded = false;
      directionsElement: any;
      showForm: boolean = false;
    
      constructor() { }
    
      ngOnInit() {
        this.initializeMap().then(() => {
          this.loaded = this.view.ready;
          this.mapLoadedEvent.emit(true);
        });
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
      async initializeMap() {
        try {
          Config.apiKey = "AAPTxy8BH1VEsoebNVZXo8HurJslmK0OQqJ65Xkr2heL5V2iqhPRl1gkDz_KUVf39ij7ktHW_1qHKpSaAHtODrSnSX4KIuar88YsxR-5bQ0iPjtI6cfgypohkTIE-k0f0fUYkmQkeFTVWQ_5Rf_hM_zATGo0Rbibw3FiGkKBXy5OOF0qRw_VRkJ8ScfyCPOPAAp2rGmJje7fKR5MP-P6RGAWE30qzcMwbYajgyL6nRYM1wI.AT1_FakVI4L1";
    
          const mapProperties: esri.WebMapProperties = {
            basemap: this.basemap
          };
          this.map = new WebMap(mapProperties);
    
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

      ngOnDestroy() {
          if (this.view) {
            this.view.container = null as unknown as HTMLDivElement; // Forțează conversia tipului
          }
        }
      }
