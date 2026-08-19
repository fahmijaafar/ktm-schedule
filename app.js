const stations = {
    "batuCaves": { "id": 1, "fullName": "Batu Caves", "shortName": "batuCaves" },
    "tamanWahyu": { "id": 2, "fullName": "Taman Wahyu", "shortName": "tamanWahyu" },
    "kampungBatu": { "id": 3, "fullName": "Kampung Batu", "shortName": "kampungBatu" },
    "batuKentonmen": { "id": 4, "fullName": "Batu Kentonmen", "shortName": "batuKentonmen" },
    "sentul": { "id": 5, "fullName": "Sentul", "shortName": "sentul" },
    "putra": { "id": 6, "fullName": "Putra", "shortName": "putra" },
    "bankNegara": { "id": 7, "fullName": "Bank Negara", "shortName": "bankNegara" },
    "kualaLumpur": { "id": 8, "fullName": "Kuala Lumpur", "shortName": "kualaLumpur" },
    "klSentral": { "id": 9, "fullName": "KL Sentral", "shortName": "klSentral" },
    "midvalley": { "id": 10, "fullName": "Mid Valley", "shortName": "midvalley" },
    "seputeh": { "id": 11, "fullName": "Seputeh", "shortName": "seputeh" },
    "salakSelatan": { "id": 12, "fullName": "Salak Selatan", "shortName": "salakSelatan" },
    "bandarTasekSelatan": { "id": 13, "fullName": "Bandar Tasek Selatan", "shortName": "bandarTasekSelatan" },
    "serdang": { "id": 14, "fullName": "Serdang", "shortName": "serdang" },
    "kajang": { "id": 15, "fullName": "Kajang", "shortName": "kajang" },
    "kajang2": { "id": 16, "fullName": "Kajang 2", "shortName": "kajang2" },
    "ukm": { "id": 17, "fullName": "UKM", "shortName": "ukm" },
    "bangi": { "id": 18, "fullName": "Bangi", "shortName": "bangi" },
    "batangBenar": { "id": 19, "fullName": "Batang Benar", "shortName": "batangBenar" },
    "nilai": { "id": 20, "fullName": "Nilai", "shortName": "nilai" },
    "labu": { "id": 21, "fullName": "Labu", "shortName": "labu" },
    "tiroi": { "id": 22, "fullName": "Tiroi", "shortName": "tiroi" },
    "seremban": { "id": 23, "fullName": "Seremban", "shortName": "seremban" },
    "senawang": { "id": 24, "fullName": "Senawang", "shortName": "senawang" },
    "sungaiGadut": { "id": 25, "fullName": "Sungai Gadut", "shortName": "sungaiGadut" },
    "rembau": { "id": 26, "fullName": "Rembau", "shortName": "rembau" },
    "pulauSebang": { "id": 27, "fullName": "Pulau Sebang", "shortName": "pulauSebang" }
}

let schedule = {
    "batucaves-pulausebang-weekday": [],
    "pulausebang-batucaves-weekday": [],
    "batucaves-pulausebang-weekend": [],
    "pulausebang-batucaves-weekend": []
}
const all_stations = Object.values(stations).map(station => station.fullName)
const getCurrentDateTime = () => new Date().toLocaleString('ms-MY', {hour12: false})
const current_day = new Date().getDay()

const get_station_obj = (station) => {
    let station_obj = null
    for (const key in stations) {
        if (stations[key].fullName === station) {
            station_obj = stations[key];
            break;
        }
    }
    return station_obj
}

const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
};

const app = Vue.createApp({
    components: {
        vSelect: window["vue-select"]
      },
    data(){
        return{
            current_datetime: getCurrentDateTime(),
            timetable: false,
            all_stations: all_stations,
            selected_departing: null,
            selected_arriving: null,
            selected_route: null,
            scheduleReady: false
        }
    },
    async mounted() {
        this.clockInterval = setInterval(() => {
            this.current_datetime = getCurrentDateTime()
        }, 1000)
        await this.loadSchedule()
    },
    beforeUnmount() {
        if (this.clockInterval) {
            clearInterval(this.clockInterval)
        }
    },
    methods:{
        swapStations() {
            const temp = this.selected_departing
            this.selected_departing = this.selected_arriving
            this.selected_arriving = temp
            if (this.selected_departing && this.selected_arriving && this.scheduleReady) {
                this.checkRoute()
            } else {
                this.timetable = false
            }
        },
        async loadSchedule() {
            try {
                const response = await fetch('./extracted_data.json')
                const extracted = await response.json()

                const weekdayForward = extracted.find(item => item.table_desc === "batucaves-pulausebang-weekday")?.data || []
                const weekdayReverse = extracted.find(item => item.table_desc === "pulausebang-batucaves-weekday")?.data || []
                const weekendForward = extracted.find(item => item.table_desc === "batucaves-pulausebang-weekend")?.data || []
                const weekendReverse = extracted.find(item => item.table_desc === "pulausebang-batucaves-weekend")?.data || []

                schedule = {
                    "batucaves-pulausebang-weekday": weekdayForward,
                    "pulausebang-batucaves-weekday": weekdayReverse,
                    "batucaves-pulausebang-weekend": weekendForward,
                    "pulausebang-batucaves-weekend": weekendReverse
                }

                this.scheduleReady = true
            } catch (error) {
                console.error('Failed to load extracted_data.json', error)
                alert('Unable to load extracted_data.json. Please run from a local server.')
            }
        },
        checkRoute(){
            if (!this.scheduleReady) {
                alert("Schedule data is not loaded yet.")
                return
            }

            if(this.selected_departing == null){
                alert("Kindly select the departing station.")
            }
            else if(this.selected_arriving == null){
                alert("Kindly select the arriving station.")
            }
            else if(this.selected_arriving == this.selected_departing){
                alert("the departing and arriving station cannot be the same. Kindly reselect.")
            }
            else{
                var departing_station_obj = get_station_obj(this.selected_departing)
                var arriving_station_obj = get_station_obj(this.selected_arriving)
                var route
                if(departing_station_obj.id<arriving_station_obj.id){
                    if(current_day>0 && current_day<6){
                        route = "batucaves-pulausebang-weekday"
                    }
                    else{
                        route = "batucaves-pulausebang-weekend"
                    }
                }else if(departing_station_obj.id>arriving_station_obj.id){
                    if(current_day>0 && current_day<6){
                        route = "pulausebang-batucaves-weekday"
                    }
                    else{
                        route = "pulausebang-batucaves-weekend"
                    }
                    
                }
                this.selected_route = route
                var timetable = {}
                var no = 1
                var dt = 0
                //Get nearest departure time
                const current_time = new Date().toLocaleTimeString('ms-MY', {hour12: false, hour: '2-digit',
                minute: '2-digit'})
                const currentTimeInMinutes = timeToMinutes(current_time)

                for(let i of schedule[route]){
                    let l1 = []
                    const departValue = i[departing_station_obj.shortName]
                    const arriveValue = i[arriving_station_obj.shortName]

                    if(departValue && arriveValue && departValue != "0" && arriveValue != "0"){
                        l1.push(departValue)
                        l1.push(arriveValue)
                        var departureTimeInMinutes = timeToMinutes(departValue)
                        if(departureTimeInMinutes>currentTimeInMinutes){
                            l1.push(dt)
                            dt++
                        }
                        timetable[no] = l1
                    }
                    no++
                }
                this.timetable = timetable
            }
        }
    }
})

app.mount('#app')
