class TransitInfo {
    constructor(transit, date, airport, route, airplaneid, airplanename, seatsLeft, distance, cost, luggage, seat_type, costlist, rating) {
        this.transit = transit;
        this.date = date;
        this.airport = airport;
        this.route = route;
        this.airplaneid = airplaneid;
        this.airplanename = airplanename;
        this.seatsLeft = seatsLeft;
        this.distance = distance;
        this.cost = cost;
        this.luggage = luggage;
        this.seat_type = seat_type;
        this.costlist = costlist;
        this.rating = rating;
    }
  }

export default TransitInfo;
