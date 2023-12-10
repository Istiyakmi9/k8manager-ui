import { Injectable } from "@angular/core";

@Injectable({
    providedIn: "root"
})

export class RouteDatahandler {

    public setData(data: any) {
        localStorage.setItem("routeData", JSON.stringify(data));
    }

    public getData() {
        let data = localStorage.getItem("routeData");
        let result = null;
        try{
            result = JSON.parse(data)
        } catch {
            result = null;
        }

        return result;
    }

    public removeData() {
        localStorage.removeItem("routeData");
    }
}