import * as nconf from "nconf"
import {createClient, terminalClient} from "../common";

terminalClient().then(client => {
    console.log(client.userdata)
}).catch(err => {
    console.log(err)
})