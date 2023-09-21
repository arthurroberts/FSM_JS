var gui_mode = 0; // 0 - nothing;
                  // 1 - waiting for state postion click;
                  // 2 - moving transition
                  // 3 - moving state ; 4 - delete tarnsition ; 5 - delete state

var selected_state_name:string; 
var selected_transition:Transition|null;

 // drawing part - create svg area
 var svg_width = 900; var svg_height = 1200; 
 var svg_fsm:SVG = new SVG(svg_width,svg_height);
 document.getElementById('svg_anchor')?.appendChild(svg_fsm.svg);
 svg_fsm.drawRect(0,0,svg_height,svg_width,0,0,0,255,255,255);

/**  SAVE_READ FUNCTIONS */
// Get the input and output elements
let picker = document.getElementById("picker")  as HTMLInputElement;
//let output = document.getElementById("output");

// Add a change event listener to the input element "picker"
if (picker){
   picker.addEventListener("change", function() {
     // Get the selected file
     if (picker.files != null){
        fsm.clear_fsm();
        svg_fsm.clear()
        let selected_file = picker.files[0];
        console.log('Loadin. selected='+selected_file);
        load_from_file(selected_file);
     }
  });
}

/*
if (picker){
    picker.addEventListener("change", function() {
      // Get the selected file
      if (picker.files != null){
        let selected_file = picker.files[0];
        console.log('Loadin. selected='+selected_file);
        load_from_file(selected_file);
      }
   });
 }
*/

// loas json from hdd file
function load_from_file(file:File){
    console.log('file='+file);
    if (file){  

       let reader = new FileReader();
       // Read the file as text
       reader.readAsText(file);
       // Handle the load event
        reader.onload = function(event) {
           // Get the file data
           let text1 = reader.result;
           //console.log(' text1 = '+ text1);
           if (text1) fsm_from_json(text1.toString());
           draw_fsm();
        }
    } else {
        console.log(' can not open file');
    }
}

// load json from server
async function load_server_local(file_name:string){
    console.log('loading file '+file_name);
    let response = await fetch('./'+file_name);
    console.log('status='+response.status);
    if (response.status == 200){
       let data = await response.text();
       fsm_from_json(data);
       draw_fsm();
    }
}

// save json to hdd file
function save_fsm(){
    // Create a blob object with some text content
//    let json_fsm = JSON.stringify(fsm,replacer);
    let json_fsm = JSON.stringify(fsm);
    let blob = new Blob([json_fsm], {type: "text/plain"});
    // Create a URL for the blob object
    let url = URL.createObjectURL(blob);
    // Create an <a> element with the download attribute
    let link = document.createElement("a");
    link.href = url;
    link.download = "fsm.json";
    // Append the link to the document body
    document.body.appendChild(link);
    // Click the link programmatically
    link.click();
    // Remove the link from the document body
    document.body.removeChild(link);

    // show image as svg in new tab
    let svg_str:string ='<?xml version="1.0" standalone="no"?>';
    svg_str += '<svg version="1.1" width="900px" height="1200px" viewBox="0 0 900 1200" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">';
    for (let i = 0 ; i < svg_fsm.svg.children.length;i++){
        svg_str+=svg_fsm.svg.children[i].outerHTML;
    }
    svg_str+='</svg>';
    //console.log(svg_str);

    let tab = window.open('about:blank','_blank');
    if (tab!=null){
        //let img = tab.document.createElement('img');
        //img.src = 'data:image/svg+xml;base64,' + btoa(svg_str);
        //img.setAttribute('src','data:image/svg+xml;base64,' + btoa(svg_str));
        //img.setAttribute('alt', 'no image');
        //img.setAttribute('height', '1200px'); // 👈️ height in px
        //img.setAttribute('width', '900px'); // 👈️ width in px
        //tab.document.body.appendChild(img);
        //tab.location.reload();

        let svgBlob = new Blob([svg_str], {type: 'image/svg+xml'});
        let url = URL.createObjectURL(svgBlob);
        let img = tab.document.createElement('img');
        img.src = url;

        const para = document.createElement("p");
        para.innerText = "svg image.";

        document.body.appendChild(para);
        tab.document.body.appendChild(img);
    }


}


// clear all states
function new_fsm(){
    //fsm = null;
    fsm.clear_fsm(); // delete fsm
    svg_fsm.clear();
    // clear interface
    let element = document.getElementById('input_seq') as HTMLInputElement;
    element.value='';
    element = document.getElementById('output_seq') as HTMLInputElement;
    element.value='';
    draw_fsm();
 }


/**MOUSE PROCESSING */

var click_xy = new Point2D(0,0); // late click coordinates
var anchor_xy = new Point2D(0,0); // late click coordinates

function get_click(event:MouseEvent){
    let element = document.getElementById('svg_anchor') as HTMLElement;
    let rect = element.getBoundingClientRect();
    click_xy.x = event.clientX-rect.left;
    click_xy.y = event.clientY-rect.top;
}

function ms_click(event:MouseEvent) {

    switch(gui_mode){
        case 0:
            get_click(event);
           if (event.ctrlKey){
            selected_state_name = find_state_clicked(click_xy);
            if (selected_state_name=='none'){
                gui_mode = 4;
                make_new_state_dlg(click_xy);
              } else {
                gui_mode = 4;
                make_edit_state_dlg(selected_state_name);
              }
           }
           if (event.shiftKey) { 
               // clicked inside the state - new transition
               // clicked on transition midpoint - edit existing transition         
               selected_state_name = find_state_clicked(click_xy);
               selected_transition = find_transition_clicked(click_xy);
               if (selected_state_name != 'none'){
                  gui_mode = 4;
                  make_new_tran_dlg(selected_state_name);
                  return;
                }

                if (selected_transition == null)  {
                    console.log(' no transition clicked');
                    window.alert('Click inside state circle to start new transition');
                    //   return;
                } else {
                    gui_mode = 4; 
                    make_edit_tran_dlg(selected_transition);
                }
            }

        break;
        case 1:
            get_click(event);
            change_state_position(selected_state_name,click_xy);
            svg_fsm.clear();
            draw_fsm();
            gui_mode = 0;
        break;
        case 2:
            get_click(event);
//            console.log('On click selected_transition='+selected_transition);
            if (selected_transition!==null) change_transition(selected_transition , click_xy );
     
            svg_fsm.clear();
            draw_fsm();
            gui_mode = 0;
        break;
        case 4: // do nothing
        break;    
        case 11:
            gui_mode = 1;
        break;
        case 12:
            gui_mode = 2;
        break;                
    }
    return;
}

             
document.addEventListener("click", ms_click);


// check that mouse click happened inside some state
// does it have to take fsm argument (fsm is global variable)
function find_state_clicked(clickp:Point2D):string{
    for (let i:number = 0 ; i < fsm.states.length; i++){
        if(  dist(fsm.states[i].position ,clickp ) <= 15.0 ){ 
            return  fsm.states[i].name; 
        }
    }
    return 'none';
}

// was any transition clicked?
function find_transition_clicked (clickp:Point2D): Transition | null {
    //let to_return = 'none'; 
    //console.log('  Checking transition clicked there are '+ fsm.states.size);
    //console.log(' click.x='+clickp.x+' click.y='+clickp.y);
    for (let i:number = 0 ; i < fsm.states.length; i++){
        for (let j:number = 0 ; j<fsm.states[i].transitions.length; j++){
            if (dist(clickp,fsm.states[i].transitions[j].arc.midpoint) < 10){
                //console.log(' midpoint found');
                return fsm.states[i].transitions[j];
            }
        }
    }
    return null;
}



// draw whole lot
function draw_fsm(){
    let r = 20; // state circle radius

    // draw all transitions 
    fsm.states.forEach((state) => { // for all states is key coming second
       // console.log('  Drawing states cycle: state='+ state);
        state.transitions.forEach((tran) => {
         //   console.log('    Drawing transition  tran='+ tran);
         //   console.log('    Drawing transition  arc='+ tran.arc);
            
            tran.arc.drawArc(svg_fsm.svg);
        });
    });
    // draw states
    fsm.states.forEach((state) => {
        if (state.name == fsm.initial_state) {
            svg_fsm.drawLine( new Point2D(state.position.x-50,state.position.y), 
                          state.position,  150,120,120,'ini',true);
        } 
        if (state.name == fsm.current_state){
            svg_fsm.drawCircle(state.position, r,144,44,44,250,20,20); //draw red
        } else {
            svg_fsm.drawCircle(state.position,r,144,44,44,250,250,250);
        };
        // all accepting states - double circle
        //console.log(' drawing accepting states '+ fsm.accepting_states.length);
        fsm.accepting_states.forEach(acc_state_name=>{
            if (state.name == acc_state_name) {//fsm.accepting_states[k]) { // check for accepting
                svg_fsm.drawCircle(state.position , r-3,44,44,44,250,250,250);
            }
        });
        // drw state name  

        svg_fsm.drawText(new Point2D(state.position.x-r*0.9, state.position.y+0.2*r), 
                                     state.get_label());
    });

    // if  state in Moore machine contains output - draw it
    let ini_st = fsm.find_state_by_name(fsm.initial_state);
    if (ini_st){
       if ((ini_st)&&(ini_st.output!=' ')){
         //document.getElementById('output_seq').value
         let outdisp = document.getElementById("output_seq") as HTMLInputElement; 
         if (outdisp) {
            if (outdisp.value==='') outdisp.value= ini_st.output;
         }
         //document.getElementById("output_seq").value = 
       }
    }
}

function change_state_position(state_name_to_move:string , new_position:Point2D){
    console.log(" move state "+ state_name_to_move+' to '+click_xy.x+' '+click_xy.y);
    // change state position
    let st = fsm.find_state_by_name(state_name_to_move);
    if (st!==null){ 
            st.position.x = new_position.x;
            st.position.y = new_position.y;
    }

    // change all transitions to this state
    fsm.states.forEach((state:State) => { // for all states is key coming second
        console.log('  Changing transitions routing: state.name='+ state.name + ' st_name='+state.name);
        state.transitions.forEach(( tran ) => { //key comes second in forEach
            //console.log('    transition destination is '+ tran.destination+ ' sou='+ tran.source);
            //console.log(' tran.arc.p1.x='+tran.arc.p1.x+ ' tran.arc.p1.y'+tran.arc.p1.y);
            //console.log(' tran.arc.p2.x='+tran.arc.p2.x+ ' tran.arc.p2.y'+tran.arc.p2.y);
            if ((tran.destination == state_name_to_move)&&(tran.source == state_name_to_move)){
                tran.arc.p2.x = new_position.x; // it is loop
                tran.arc.p2.y = new_position.y; 
                tran.arc.p1.x = new_position.x-10;
                tran.arc.p1.y = new_position.y; 
                let xm =  (tran.arc.p1.x + tran.arc.p2.x)/2;
                let ym =  tran.arc.p1.y +40;
                console.log(' xm='+xm+ ' ym='+ym);
                tran.arc.setArcBy3Points(tran.arc.p1,tran.arc.p2,new Point2D(xm,ym));  
             } else
             if (tran.destination == state_name_to_move){ //incoming arc
               tran.arc.p2.x = new_position.x;
               tran.arc.p2.y = new_position.y; 
               let xm =  (tran.arc.p1.x + tran.arc.p2.x)/2;
               let ym =  (tran.arc.p1.y + tran.arc.p2.y)/2;
               console.log(' xm='+xm+ ' ym='+ym);
               tran.arc.setArcBy3Points(tran.arc.p1,tran.arc.p2,new Point2D(xm,ym));  
            } else
            if (tran.source == state_name_to_move){ // outgoing arc
                tran.arc.p1.x = new_position.x;    
                tran.arc.p1.y = new_position.y;    
                let xm =  (tran.arc.p1.x + tran.arc.p2.x)/2;
                let ym =  (tran.arc.p1.y + tran.arc.p2.y)/2;
                console.log(' xm='+xm+ ' ym='+ym);
                tran.arc.setArcBy3Points(tran.arc.p1,tran.arc.p2,new Point2D(xm,ym));  
            }
 
        });
    });
}

// move transition - move its middle point
function change_transition(selected_transition:Transition,clickp:Point2D){
    console.log(' moving_transition ' + selected_transition);
    selected_transition.arc.setArcBy3Points(selected_transition.arc.p1,
                                            selected_transition.arc.p2,
                                            clickp); 
} 
