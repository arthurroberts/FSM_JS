"use strict";
/**implement modal dialogs */
function removeWhitespace(str) {
    return str.replace(/\s+/g, '');
}
function make_new_state_dlg(point_to_inser) {
    let element = document.getElementById("new_state_dlg_anchor");
    if (element) { // svg anchor exists. Is it needed - dialogs are not
        // pinned to the document
        // if dialog is there - destroy it            
        let myElement = document.getElementById("new_state_dlg_id");
        if (myElement) {
            myElement.remove();
        }
        let new_state_dlg = document.createElement("dialog"); //document.createElement("dialog") as HTMLDialogElement;
        new_state_dlg.id = 'new_state_dlg_id';
        //let title = document.createTextNode("New state name");
        let new_state_name_txt = document.createElement("input");
        new_state_name_txt.setAttribute("id", "myInput");
        new_state_name_txt.setAttribute("type", "text");
        new_state_name_txt.setAttribute("size", "5");
        new_state_name_txt.value = ' ';
        let state_label = document.createElement("label");
        state_label.setAttribute("for", "new_state_name_txt");
        state_label.textContent = "State name:";
        let new_state_out_txt = document.createElement("input");
        new_state_out_txt.setAttribute("id", "myInput");
        new_state_out_txt.setAttribute("type", "text");
        new_state_out_txt.setAttribute("size", "5");
        new_state_out_txt.value = '';
        let out_label = document.createElement("label");
        out_label.setAttribute("for", "new_state_out_txt");
        out_label.textContent = "Output:";
        let okButton = document.createElement("button");
        okButton.setAttribute("id", "okButton");
        okButton.innerHTML = "OK";
        let cancelButton = document.createElement("button");
        cancelButton.setAttribute("id", "cancelButton");
        cancelButton.innerHTML = "Cancel";
        let myBr = document.createElement("br");
        // Add an event listener to the buttons
        okButton.addEventListener("click", () => {
            let new_name = removeWhitespace(new_state_name_txt.value);
            let new_output = removeWhitespace(new_state_out_txt.value);
            console.log("New state name=" + new_name + 'at x=' + point_to_inser.x + ' y=' + point_to_inser.y);
            if (new_name) {
                fsm.add_state(new_name, point_to_inser, new_output);
                let new_st = fsm.find_state_by_name(new_name);
                if (new_st !== null)
                    new_st.output = new_output;
                draw_fsm();
                gui_mode = 0;
                new_state_dlg.close();
            }
        });
        cancelButton.addEventListener("click", () => {
            new_state_dlg.close();
            gui_mode = 0;
        });
        //new_state_dlg.appendChild(title); 
        //new_state_dlg.appendChild(myBr); 
        new_state_dlg.appendChild(state_label);
        new_state_dlg.appendChild(new_state_name_txt);
        new_state_dlg.appendChild(out_label);
        new_state_dlg.appendChild(new_state_out_txt);
        new_state_dlg.appendChild(myBr);
        new_state_dlg.appendChild(cancelButton);
        new_state_dlg.appendChild(okButton);
        document.body.appendChild(new_state_dlg);
        new_state_dlg.showModal();
    }
}
function make_edit_state_dlg(sel_state) {
    var _a;
    let element = document.getElementById('edit_state_dlg_anchor'); // find anchor
    if (element) {
        // delete if exists
        let myElement = document.getElementById("edit_state_dlg_id");
        if (myElement) {
            myElement.remove();
        }
        let edit_state_dlg = document.createElement("dialog");
        edit_state_dlg.id = 'edit_state_dlg_id';
        // state name text box
        let state_name_txt = document.createElement("input");
        state_name_txt.setAttribute("id", "edit_state_dlg_state_name");
        state_name_txt.setAttribute("type", "text");
        state_name_txt.setAttribute("size", "5");
        state_name_txt.value = sel_state;
        let state_label = document.createElement("label");
        state_label.setAttribute("for", "state_name_txt");
        state_label.textContent = "State:";
        let state_out_txt = document.createElement("input");
        state_out_txt.setAttribute("id", "myInput");
        state_out_txt.setAttribute("type", "text");
        state_out_txt.setAttribute("size", "5");
        let outp = (_a = fsm.find_state_by_name(sel_state)) === null || _a === void 0 ? void 0 : _a.output;
        if (outp !== undefined)
            state_out_txt.value = outp;
        let out_label = document.createElement("label");
        out_label.setAttribute("for", "new_state_out_txt");
        out_label.textContent = "Output:";
        // cancel button
        let cancelButton = document.createElement("button");
        cancelButton.setAttribute("id", "cancelButton");
        cancelButton.innerHTML = "Cancel";
        cancelButton.addEventListener("click", () => {
            gui_mode = 0;
            edit_state_dlg.close();
        });
        let okButton = document.createElement("button");
        okButton.setAttribute("id", "okButton");
        okButton.innerHTML = "OK";
        okButton.addEventListener("click", () => {
            let st = fsm.find_state_by_name(sel_state);
            if (st) {
                st.output = removeWhitespace(state_out_txt.value);
                gui_mode = 0;
                svg_fsm.clear();
                draw_fsm();
                edit_state_dlg.close();
            }
            //edit_state_dlg.close();
        });
        //delete state button
        let deleteButton = document.createElement("button");
        deleteButton.setAttribute("id", "deleteButton");
        deleteButton.innerHTML = "Delete state";
        deleteButton.addEventListener("click", () => {
            let state_to_delete_name = ' ';
            fsm.delete_state(sel_state);
            gui_mode = 0;
            svg_fsm.clear();
            draw_fsm();
            edit_state_dlg.close();
        });
        //move state button
        let moveButton = document.createElement("button");
        moveButton.setAttribute("id", "moveButton");
        moveButton.innerHTML = "Move state";
        moveButton.addEventListener("click", () => {
            console.log(' moveButton click');
            gui_mode = 11;
        });
        //make it accepting state button
        let accepButton = document.createElement("button");
        accepButton.setAttribute("id", "moveButton");
        accepButton.innerHTML = "Make accepting";
        accepButton.addEventListener("click", () => {
            fsm.accepting_states.push(sel_state);
            gui_mode = 0;
            svg_fsm.clear();
            draw_fsm();
        });
        //make initial state button
        let initButton = document.createElement("button");
        initButton.setAttribute("id", "moveButton");
        initButton.innerHTML = "Make initial";
        initButton.addEventListener("click", () => {
            fsm.initial_state = sel_state;
            fsm.current_state = sel_state;
            gui_mode = 0;
            svg_fsm.clear();
            draw_fsm();
        });
        let myBr = document.createElement("br");
        edit_state_dlg.appendChild(state_label);
        edit_state_dlg.appendChild(state_name_txt);
        edit_state_dlg.appendChild(out_label);
        edit_state_dlg.appendChild(state_out_txt);
        edit_state_dlg.appendChild(myBr);
        edit_state_dlg.appendChild(deleteButton);
        edit_state_dlg.appendChild(moveButton);
        edit_state_dlg.appendChild(accepButton);
        edit_state_dlg.appendChild(initButton);
        edit_state_dlg.appendChild(okButton);
        edit_state_dlg.appendChild(cancelButton);
        document.body.appendChild(edit_state_dlg);
        edit_state_dlg.showModal();
    }
}
function make_new_tran_dlg(selected_state_name) {
    let element = document.getElementById('new_tran_dlg_anchor');
    if (element) {
        let myElement = document.getElementById("new_tran_dlg_id");
        if (myElement) {
            myElement.remove();
        }
        var new_tran_dlg = document.createElement("dialog");
        new_tran_dlg.id = 'new_tran_dlg_id';
        let sou_state_name_txt = document.createElement("input");
        sou_state_name_txt.setAttribute("id", "mySou");
        sou_state_name_txt.setAttribute("type", "text");
        sou_state_name_txt.setAttribute("size", "5");
        sou_state_name_txt.value = selected_state_name;
        let sou_label = document.createElement("label");
        sou_label.setAttribute("for", "mySou");
        sou_label.textContent = "Source:";
        let input_txt = document.createElement("input");
        input_txt.setAttribute("id", "myInput");
        input_txt.setAttribute("type", "text");
        input_txt.setAttribute("size", "5");
        input_txt.value = '';
        let input_label = document.createElement("label");
        input_label.setAttribute("for", "myInput");
        input_label.textContent = "Input signal:";
        let dest_state_name_txt = document.createElement("input");
        dest_state_name_txt.setAttribute("id", "dest");
        dest_state_name_txt.setAttribute("type", "text");
        dest_state_name_txt.setAttribute("size", "5");
        dest_state_name_txt.value = selected_state_name;
        let dest_label = document.createElement("label");
        dest_label.setAttribute("for", "dest");
        dest_label.textContent = "Destination:";
        let out_mealy = document.createElement("input");
        out_mealy.setAttribute("id", "outm");
        out_mealy.setAttribute("type", "text");
        out_mealy.setAttribute("size", "5");
        out_mealy.value = ' ';
        let out_label = document.createElement("label");
        out_label.setAttribute("for", "out_me");
        out_label.textContent = "Output:";
        let cancelButton = document.createElement("button");
        cancelButton.setAttribute("id", "cancelButton");
        cancelButton.innerHTML = "Cancel";
        let okButton = document.createElement("button");
        okButton.setAttribute("id", "okButton");
        okButton.innerHTML = "OK";
        let myBr = document.createElement("br");
        cancelButton.addEventListener("click", () => {
            gui_mode = 0;
            new_tran_dlg.close();
        });
        okButton.addEventListener("click", () => {
            var _a, _b;
            // clear inputs from all whitespaces
            input_txt.value = removeWhitespace(input_txt.value);
            dest_state_name_txt.value = removeWhitespace(dest_state_name_txt.value);
            sou_state_name_txt.value = removeWhitespace(sou_state_name_txt.value);
            out_mealy.value = removeWhitespace(out_mealy.value);
            let new_tr = new Transition(removeWhitespace(input_txt.value), dest_state_name_txt.value, sou_state_name_txt.value, out_mealy.value);
            let p1 = new Point2D(0, 0);
            let p1_pos = (_a = fsm.find_state_by_name(sou_state_name_txt.value)) === null || _a === void 0 ? void 0 : _a.position;
            if (p1_pos !== undefined) {
                p1 = p1_pos;
            }
            let p2 = new Point2D(0, 0);
            let p2_pos = (_b = fsm.find_state_by_name(dest_state_name_txt.value)) === null || _b === void 0 ? void 0 : _b.position;
            if (p2_pos !== undefined) {
                p2 = p2_pos;
            }
            //        let new_arc = new Arc(p1,p2,"id", input_txt.value+'->'+out_mealy.value);
            let new_arc = new Arc(p1, p2, "id", input_txt.value);
            if ((out_mealy.value !== undefined) && (out_mealy.value.length > 0)) {
                new_arc.label += '->' + out_mealy.value;
            }
            fsm.add_transition(sou_state_name_txt.value, new_tr, new_arc);
            gui_mode = 0;
            draw_fsm();
            new_tran_dlg.close();
        });
        new_tran_dlg.appendChild(sou_label);
        new_tran_dlg.appendChild(sou_state_name_txt);
        new_tran_dlg.appendChild(input_label);
        new_tran_dlg.appendChild(input_txt);
        new_tran_dlg.appendChild(dest_label);
        new_tran_dlg.appendChild(dest_state_name_txt);
        new_tran_dlg.appendChild(out_label);
        new_tran_dlg.appendChild(out_mealy);
        new_tran_dlg.appendChild(myBr);
        new_tran_dlg.appendChild(cancelButton);
        new_tran_dlg.appendChild(okButton);
        document.body.appendChild(new_tran_dlg);
        new_tran_dlg.showModal();
    }
}
function make_edit_tran_dlg(sel_tran) {
    let element = document.getElementById('new_tran_dlg_anchor');
    if (element) { // anchor exists
        let myElement = document.getElementById("edit_tran_dlg_id");
        if (myElement) {
            myElement.remove();
        }
        var edit_tran_dlg = document.createElement("dialog");
        edit_tran_dlg.id = 'edit_tran_dlg_id';
        // text fields
        let sou_state_name_txt = document.createElement("input");
        sou_state_name_txt.setAttribute("id", "myInput");
        sou_state_name_txt.setAttribute("type", "text");
        sou_state_name_txt.setAttribute("size", "5");
        sou_state_name_txt.value = sel_tran.source;
        let sou_label = document.createElement("label");
        sou_label.setAttribute("for", "sou_state_name");
        sou_label.textContent = "Source state:";
        let input_txt = document.createElement("input");
        input_txt.setAttribute("id", "myInput");
        input_txt.setAttribute("type", "text");
        input_txt.setAttribute("size", "5");
        input_txt.value = sel_tran.signal;
        let input_label = document.createElement("label");
        input_label.setAttribute("for", "myInput");
        input_label.textContent = "Input signal:";
        let dest_state_name_txt = document.createElement("input");
        dest_state_name_txt.setAttribute("id", "dest");
        dest_state_name_txt.setAttribute("type", "text");
        dest_state_name_txt.setAttribute("size", "5");
        dest_state_name_txt.value = sel_tran.destination;
        let dest_label = document.createElement("label");
        dest_label.setAttribute("for", "dest");
        dest_label.textContent = "Destination:";
        let output_m = document.createElement("input");
        output_m.setAttribute("id", "output_m");
        output_m.setAttribute("type", "text");
        output_m.setAttribute("size", "5");
        if (sel_tran.output !== undefined) {
            output_m.value = sel_tran.output;
        }
        else {
            output_m.value = '';
        }
        let output_m_label = document.createElement("label");
        output_m_label.setAttribute("for", "output_m");
        output_m_label.textContent = "Output:";
        // buttons
        let cancelButton = document.createElement("button");
        cancelButton.setAttribute("id", "cancelButton");
        cancelButton.innerHTML = "Cancel";
        let deleteButton = document.createElement("button");
        deleteButton.setAttribute("id", "okButton");
        deleteButton.innerHTML = "Delete";
        let moveButton = document.createElement("button");
        moveButton.setAttribute("id", "moveButton");
        moveButton.innerHTML = "Move";
        let okButton = document.createElement("button");
        okButton.setAttribute("id", "okButton");
        okButton.innerHTML = "OK";
        cancelButton.addEventListener("click", () => { edit_tran_dlg.close(); });
        moveButton.addEventListener("click", () => {
            gui_mode = 12;
            // draw_fsm();
            //edit_tran_dlg.close();
        });
        deleteButton.addEventListener("click", () => {
            let sou = sou_state_name_txt.value;
            let sig = input_txt.value;
            fsm.delete_transition(sou, sig);
            //let dialog = document.getElementById("edit_tran_dlg") as HTMLDialogElement;
            //if (dialog.open){ dialog.close();}
            gui_mode = 0;
            svg_fsm.clear();
            draw_fsm();
            edit_tran_dlg.close();
        });
        okButton.addEventListener("click", () => {
            var _a, _b;
            fsm.delete_transition(sou_state_name_txt.value, input_txt.value);
            sou_state_name_txt.value = removeWhitespace(sou_state_name_txt.value);
            dest_state_name_txt.value = removeWhitespace(dest_state_name_txt.value);
            output_m.value = removeWhitespace(output_m.value);
            let p1 = (_a = fsm.find_state_by_name(sou_state_name_txt.value)) === null || _a === void 0 ? void 0 : _a.position;
            let p2 = (_b = fsm.find_state_by_name(dest_state_name_txt.value)) === null || _b === void 0 ? void 0 : _b.position;
            //let int = 
            if ((p1) && (p2)) {
                let str = input_txt.value;
                sel_tran.destination = dest_state_name_txt.value;
                if (output_m.value !== undefined) {
                    str = str + "->" + output_m.value;
                    sel_tran.output = output_m.value;
                }
                let new_arc = new Arc(p1, p2, "id", str);
                fsm.add_transition(sou_state_name_txt.value, sel_tran, new_arc);
                gui_mode = 0;
                svg_fsm.clear();
                draw_fsm();
                edit_tran_dlg.close();
            }
        });
        let myBr = document.createElement("br");
        edit_tran_dlg.appendChild(sou_label);
        edit_tran_dlg.appendChild(sou_state_name_txt);
        edit_tran_dlg.appendChild(input_label);
        edit_tran_dlg.appendChild(input_txt);
        edit_tran_dlg.appendChild(dest_label);
        edit_tran_dlg.appendChild(dest_state_name_txt);
        edit_tran_dlg.appendChild(output_m_label);
        edit_tran_dlg.appendChild(output_m);
        edit_tran_dlg.appendChild(myBr);
        edit_tran_dlg.appendChild(moveButton);
        edit_tran_dlg.appendChild(deleteButton);
        edit_tran_dlg.appendChild(okButton);
        edit_tran_dlg.appendChild(cancelButton);
        document.body.appendChild(edit_tran_dlg);
        edit_tran_dlg.showModal();
    }
}
