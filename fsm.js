"use strict";
class Transition {
    constructor(sig, dest, sou, out) {
        this.signal = sig;
        this.destination = dest;
        this.source = sou;
        this.output = out;
        this.arc = new Arc(new Point2D(0, 0), new Point2D(0, 0), "id", "lab");
    }
    set(sig, dest, sou) {
        this.signal = sig;
        this.destination = dest;
        this.source = sou;
    }
    get_label() {
        let trimmed_str_length = this.output.trim().length;
        if ((this.output !== null) && (trimmed_str_length > 0)) {
            return (this.signal + '->' + this.output);
        }
        return this.signal;
    }
}
;
class State {
    constructor(n) {
        this.name = n;
        this.transitions = new Array(); // maps input signal to transition
        this.position = new Point2D(0, 0);
        this.output = ' ';
    }
    add_transition(tr) {
        let p1 = this.position;
        let dest_state = fsm.find_state_by_name(tr.destination);
        if (dest_state != undefined) {
            let p2 = dest_state.position;
            tr.arc.p1 = p1;
            tr.arc.p2 = p2;
            this.transitions.push(tr);
        }
    }
    set_position(pos) {
        this.position.x = pos.x;
        this.position.y = pos.y;
    }
    // specific input is processed by this state
    has_signal(inp) {
        for (let i = 0; i < this.transitions.length; i++) {
            if (this.transitions[i].signal.includes(inp)) {
                return this.transitions[i];
            }
        }
        return null;
    }
    get_label() {
        let trimmed_str_length = this.output.trim().length;
        if ((this.output !== null) && (trimmed_str_length > 0)) {
            return (this.name + "->" + this.output);
        }
        return this.name;
    }
}
;
class FSM {
    constructor() {
        //self = this;
        this.states = new Array();
        this.initial_state = " ";
        this.current_state = " ";
        this.accepting_states = new Array();
        this.current_output = " ";
        this.current_state_output = " ";
    }
    // create new state from name and position, add to array
    add_state(name, pos, output) {
        let new_state = new State(name);
        new_state.position.x = pos.x;
        new_state.position.y = pos.y;
        new_state.output = output;
        this.states.push(new_state); // add to map 
    }
    delete_state(name) {
        //delete state itself, also deletes outgoing transitions
        for (let i = 0; i < this.states.length; i++) {
            if (this.states[i].name == name) {
                this.states.splice(i, 1);
                i--;
            }
        }
        // delete all transitions with this state as destination
        for (let i = 0; i < this.states.length; i++) {
            for (let j = 0; j < this.states[i].transitions.length; j++) {
                if (this.states[i].transitions[j].destination == name) {
                    this.states[i].transitions.splice(j, 1);
                }
            }
        }
    }
    // adds transition - staight line between states
    add_transition(sou, tra, arc) {
        var _a, _b;
        let st1 = this.find_state_by_name(sou);
        let st2 = this.find_state_by_name(tra.destination);
        if ((st1) && (st2)) { // states exist
            let p1end = st1.position;
            let p2end = st2.position;
            //create arc/line 
            if (((_a = this.find_state_by_name(sou)) === null || _a === void 0 ? void 0 : _a.name) == ((_b = this.find_state_by_name(tra.destination)) === null || _b === void 0 ? void 0 : _b.name)) {
                // same state - create loop
                tra.arc = new Arc(new Point2D(p1end.x - 10, p1end.y), p1end, "id", tra.signal);
                let xmp = (tra.arc.p1.x + tra.arc.p2.x) / 2;
                let ymp = (tra.arc.p1.y + 40);
                tra.arc.setArcBy3Points(tra.arc.p1, tra.arc.p2, new Point2D(xmp, ymp));
                tra.arc.is_line = false;
                if ((tra.output != '') && (tra.output !== undefined)) {
                    tra.arc.label = arc.label;
                }
            }
            else {
                tra.arc = new Arc(p1end, p2end, "id", tra.signal); // line
                if (arc != null) {
                    tra.arc.midpoint = arc.midpoint;
                    tra.arc.setArcBy3Points(tra.arc.p1, tra.arc.p2, arc.midpoint);
                    tra.arc.is_line = arc.is_line;
                    if ((tra.output != ' ') && (tra.output !== undefined)) {
                        tra.arc.label = arc.label;
                    }
                }
            }
            st1.transitions.push(tra);
            //if (this.states.get(sou) != undefined){
            //   this.states.get(sou)?.transitions.push(tra); 
            //}
        }
    }
    delete_transition(source_name, signal) {
        let state = this.find_state_by_name(source_name);
        if (state !== null) {
            for (let i = 0; i < state.transitions.length; i++) {
                if (state.transitions[i].signal == signal) {
                    state.transitions.splice(i, 1);
                    i--;
                }
            }
        }
        else {
            console.log('delete_transition(): ' + source_name + ' not found');
        }
    }
    find_state_by_name(name) {
        for (let i = 0; i < this.states.length; i++) {
            if (this.states[i].name == name) {
                return this.states[i];
            }
        }
        return null;
    }
    /*
        run(inp_sting){
            this.current_state = this.initial_state;
            for (let i=0;i<inp_sting.length;i++){
               console.log('input='+inp_sting[i]+ ' current state before='+this.states.get(this.current_state).name);
               //this.current_state = this.states.get(this.current_state).name;
               this.current_state = this.states.get(this.current_state).transitions.get(inp_sting[i]);
               
               console.log(' current state after='+this.states.get(this.current_state).name);
               console.log('******');
            }
        }
    */
    step(input) {
        var _a;
        this.current_output = ''; //Mealy
        let cs = this.find_state_by_name(this.current_state);
        if (cs !== null) {
            let poss_tran = cs.has_signal(input); //input is in one of trs?
            if (poss_tran !== null) {
                // yes - input exists in transition
                this.current_state = poss_tran.destination;
                // Mealy
                if (this.current_output != ' ') {
                    if (poss_tran.output !== undefined)
                        this.current_output = poss_tran.output;
                }
                //Moore
                let moore = (_a = this.find_state_by_name(this.current_state)) === null || _a === void 0 ? void 0 : _a.output;
                if ((moore !== undefined) && (moore != ' ')) {
                    this.current_output += moore;
                }
            }
            else {
                alert(' undefined transition for input \'' + input + '\' in state ' + this.current_state);
            }
        }
    }
    clear_fsm() {
        fsm.states.length = 0;
        fsm.accepting_states = [];
        fsm.initial_state = '';
        fsm.current_state = '';
    }
}
;
var fsm = new FSM();
// still can be useful somehow
function init_fsm() {
    let json_data = '{"states":[{"name":"s1","transitions":[{"signal":"on","destination":"s2","source":"s1","arc":{"p1":{"x":100,"y":100},"p2":{"x":200,"y":100},"is_line":false,"center":{"x":150,"y":116.83271104482499},"radius":52.7573706804895,"sweepflag":1,"large_small":0,"midpoint":{"x":150,"y":64.07534036433549},"id":" ","label":"on"}},{"signal":"off","destination":"s1","source":"s1","arc":{"p1":{"x":90,"y":100},"p2":{"x":100,"y":100},"is_line":false,"center":{"x":95,"y":119.6875},"radius":20.3125,"sweepflag":0,"large_small":1,"midpoint":{"x":95,"y":140},"id":" ","label":"off"}}],"position":{"x":100,"y":100},"output":" "},{"name":"s2","transitions":[{"signal":"on","destination":"s1","source":"s2","arc":{"p1":{"x":200,"y":100},"p2":{"x":100,"y":100},"is_line":false,"center":{"x":150,"y":35.768661261263745},"radius":81.39818717987693,"sweepflag":1,"large_small":0,"midpoint":{"x":150,"y":117.16684844114067},"id":" ","label":"on"}},{"signal":"off","destination":"s3","source":"s2","arc":{"p1":{"x":200,"y":100},"p2":{"x":150,"y":200},"is_line":false,"center":{"x":186.54862193354916,"y":155.77431096677458},"radius":57.37345497444847,"sweepflag":1,"large_small":1,"midpoint":{"x":237.86500010430524,"y":181.43250005215262},"id":" ","label":"off"}}],"position":{"x":200,"y":100},"output":" "},{"name":"s3","transitions":[{"signal":"off","destination":"s1","source":"s3","arc":{"p1":{"x":150,"y":200},"p2":{"x":100,"y":100},"is_line":false,"center":{"x":150.64468416622282,"y":137.1776579168886},"radius":62.825649877113484,"sweepflag":1,"large_small":0,"midpoint":{"x":94.45171462389199,"y":165.274142688054},"id":" ","label":"off"}},{"signal":"on","destination":"s2","source":"s3","output":"ss","arc":{"p1":{"x":150,"y":200},"p2":{"x":200,"y":100},"is_line":false,"center":{"x":130.79822476191737,"y":127.89911238095868},"radius":74.61398104743822,"sweepflag":0,"large_small":0,"midpoint":{"x":197.5349982394985,"y":161.26749911974923},"id":" ","label":"on->ss"}}],"position":{"x":150,"y":200},"output":" "}],"initial_state":"s1","current_state":"s1","accepting_states":["s2"],"current_output":" ","current_state_output":" "}';
    fsm_from_json(json_data); // fsm.ts line 233, draws fsm
}
/*
//required to convert Map into array
function replacer(key:string, value:any):any {
    // check if the value is a map
    if (value instanceof Map) {
      // convert the map to an array of key-value pairs
      return [...value];
    } else {
      // return the value as it is
      return value;
    }
  }

// produce json specification of this FSM
// any maps are butchered by replacer
function stream_fsm(fsm:FSM){
//    let json_fsm = JSON.stringify(fsm,replacer);
    let json_fsm = JSON.stringify(fsm);
   // console.log(json_fsm);
    //console.log(' streaming fsm=' + json_fsm);
    let tab = window.open('about:blank','_blank');
    if (tab!=null){
      tab.document.write(json_fsm);
      tab.document.close();
    }
}
*/
// takes string produced by stream_fsm (see above)
// and restores FSM from it
function fsm_from_json(data) {
    fsm.states.length = 0;
    //fsm = new FSM();
    let json_inp = data;
    let json_parsed = JSON.parse(json_inp);
    //   console.log('json_parsed='+json_parsed);
    // console.log('there are '+json_parsed.states.length+' states');
    // create states only first
    for (let i = 0; i < json_parsed.states.length; i++) {
        //console.log(json_parsed.states[i]);
        let state_name = json_parsed.states[i].name;
        let x = json_parsed.states[i].position.x;
        let y = json_parsed.states[i].position.y;
        let output = json_parsed.states[i].output;
        //console.log('name='+state_name);
        //console.log('position:='+ trs.position.x+ ' '+trs.position.y);
        fsm.add_state(state_name, new Point2D(parseFloat(x), parseFloat(y)), output);
        //let st = fsm.find                                      
    }
    ;
    // now add transitions to all states
    for (let i = 0; i < json_parsed.states.length; i++) {
        //   console.log('json_parsed.states[i] = '+json_parsed.states[i]);
        // json_parsed.states[i] 
        let state_name = json_parsed.states[i].name;
        let trs = json_parsed.states[i].transitions;
        // console.log('name='+state_name);
        // console.log('  trs.position='+ trs.position.x+ ' '+trs.position.y);
        // console.log('position:='+ trs.position.x+ ' '+trs.position.y);
        for (let j = 0; j < trs.length; j++) {
            //  console.log('j='+j+' trs.transitions='+trs.transitions[j]);
            let signal = trs[j].signal;
            let tr = trs[j];
            //  console.log(' signal = '+signal+ '  tr='+tr);
            let dest = trs[j].destination;
            let out = trs[j].output;
            let arc_n = trs[j].arc;
            let new_transition = new Transition(signal, dest, state_name, out);
            new_transition.arc = arc_n;
            if (out !== undefined) {
                new_transition.arc.label = new_transition.get_label();
            }
            fsm.add_transition(state_name, new_transition, arc_n);
            //fsm.add_transition_arc(state_name, new_transition);
        }
    }
    ;
    fsm.initial_state = json_parsed.initial_state;
    fsm.current_state = fsm.initial_state;
    for (let k = 0; k < json_parsed.accepting_states.length; k++) {
        fsm.accepting_states.push(json_parsed.accepting_states[k]);
    }
    draw_fsm();
    //return fsm;
}
function read_fsm_json() {
    let picker = document.getElementById("picker");
    if (picker.files != null) {
        let selected = picker.files[0];
        console.log('selected=' + selected);
        // Create a FileReader object
        let reader = new FileReader();
        reader.readAsText(selected);
        // Handle the load event
        reader.onload = function () {
            // Get the file data
            let data = reader.result;
            // Do something with the data
            console.log("data =" + data);
        };
    }
    //let selected:HTMLElement = document.getElementById("picker").files[0];
    //console.log('selected='+selected);
    // Create a FileReader object
    //let reader = new FileReader();
    // Read the file as text
    //reader.readAsText(selected);
    // Handle the load event
    //reader.onload = function() {
    // Get the file data
    //let data = reader.result;
    // Do something with the data
    // console.log("data =" +  data);
    //};  
    return;
}
