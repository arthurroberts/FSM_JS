class Point2D{
    x:number;
    y:number;
    constructor(x:number,y:number){
      this.x = x; this.y = y;
    }
    rotate(p_origin:Point2D,angle:number){
      let xp = this.x - p_origin.x;
      let yp = this.y - p_origin.y;
      this.x = xp*Math.cos(angle) - yp*Math.sin(angle);
      this.y = yp*Math.cos(angle) + xp*Math.sin(angle);
      this.x = this.x + p_origin.x;
      this.y = this.y + p_origin.y;
    }

    move(dx:number,dy:number){
      this.x = this.x + dx;
      this.y = this.y + dy;
    }
};

// distance between points
function dist(p1:Point2D,p2:Point2D){
  let dx = p1.x - p2.x;
  let dy = p1.y - p2.y;
  return Math.sqrt(dx*dx+dy*dy);
};

// distance between point and line
// line specified by p1->p2
function dist_point_line(p1:Point2D,p2:Point2D,p3:Point2D){
   let dx21 = p2.x - p1.x;
   let dy21 = p2.y - p1.y;
   let dx31 = p3.x - p1.x;
   let dy31 = p3.y - p1.y;
   return Math.abs(dx21*dy31 - dx31*dy21)/Math.sqrt(dx21*dx21+dy21*dy21);
}

// determine which side of the line p1->p3 point p3 is
function side(p1:Point2D,p2:Point2D,p3:Point2D){
   let dx = p2.x - p1.x;
   let dy = p2.y - p1.y;
   let s = p3.x * dy - p3.y*dx -p1.x*dy+p2.y*dx;
   return (s>0);
}

class RGB{
    r:number;
    g:number;
    b:number;
    constructor(ri:number,gi:number,bi:number){
       this.r = ri; this.g = gi; this.b = bi;
    }
};
function rgb_to_str(col:RGB){
  return 'rgb('+col.r.toString()+', '+col.g.toString() +','+col.b.toString()+') ';
}

// return svg polyline string to draw the arrow at "poi" with "angle"
function arrow_str(poi:Point2D,angle:number,id:string){
  let arr = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
  // make triangle: length 15, height 10
  let pa1 = new Point2D(poi.x, poi.y+5);
  let pa2 = new Point2D(poi.x, poi.y-5);
  let pa3 = new Point2D(poi.x+15,poi.y);
  // rotate it
  pa1.rotate(poi,angle);
  pa2.rotate(poi,angle);
  pa3.rotate(poi,angle);
  // make output string as polyline
  let xy_str = pa1.x.toString()+ ' '+ pa1.y.toString()+' '+
               pa2.x.toString()+ ' '+ pa2.y.toString()+' '+
               pa3.x.toString()+ ' '+ pa3.y.toString();
  arr.setAttribute('points', xy_str);
  arr.setAttribute('stroke', rgb_to_str({r:200,g:200,b:200}) );
  arr.setAttribute('stroke-width', '2');
  arr.setAttribute('fill', rgb_to_str({r:200,g:200,b:200}) );
  arr.setAttribute('id', id+'_arr' );
  return arr; // string
}

class Circle{
  center:Point2D;
  radius:number;
  constructor(cent_in:Point2D, rad_in:number){
    this.center = cent_in;
    this.radius = rad_in;
  }
};

// calculate circle centre and radius from 3 points
//https://stackoverflow.com/questions/4103405/what-is-the-algorithm-for-finding-the-center-of-a-circle-from-three-points
// returns "false" if points are colinear
function circle_from_points(p1:Point2D,p2:Point2D,p3:Point2D,c:Circle){
//  console.log('p1.x='+p1.x+' p1.y='+p1.y);
//  console.log('p2.x='+p2.x+' p2.y='+p2.y);
//  console.log('p3.x='+p3.x+' p3.y='+p3.y);
  let ax = (p1.x + p2.x) / 2;
  let ay = (p1.y + p2.y) / 2;
  let ux = (p1.y - p2.y);
  let uy = (p2.x - p1.x);
  let bx = (p2.x + p3.x) / 2;
  let by = (p2.y + p3.y) / 2;
  let vx = (p2.y - p3.y);
  let vy = (p3.x - p2.x);
  let dx = ax - bx;
  let dy = ay - by;
  let vu = vx * uy - vy * ux;
  if (vu == 0)
       return false; // Points are collinear, so no unique solution
  let g = (dx * uy - dy * ux) / vu;
  let center_x = bx + g * vx;
  let center_y = by + g * vy;
  let center = new Point2D(center_x, center_y);
  c.center.x =center_x;
  c.center.y =center_y;
  c.radius = dist(center,p1);
   
  //out = new Circle(center,dist(center,p1));
  //console.log('center_x='+ center_x+' center_y='+center_y+' r='+out.radius);
  //return out;
}


// describes transition's arc, label is input, drawn at midpoint
// draws arrow at midpoint
// this specified by 2 points and radius. Goes from p1 to p2
class Arc{
    p1:Point2D; // origin of the this
    p2:Point2D; // destination
    is_line:boolean;
    center:Point2D;
    radius:number;
    sweepflag:number; // clockwise or opposite
    large_small:number; // which part of the this to draw
    midpoint:Point2D; // place to draw the arrow and label
    id:string;   // str - for uick modifications
    label:string;
    //this_id:string;
    constructor(p1in:Point2D,p2in:Point2D,id_in:string,label:string){
        this.p1 = p1in;
        this.p2 = p2in;
        this.is_line = true;
        this.center = new Point2D(0 , 0);
        this.radius = 10000;
        this.sweepflag = 0;
        this.large_small = 1;
        this.midpoint = new Point2D( (this.p1.x+this.p2.x)/2 ,
                                     (this.p1.y+this.p2.y)/2);
        this.id = " ";                               
        this.label = label;
    }

  // p1 - start point, p2 - finish point
  drawArc(svg:SVGSVGElement){
    if (this.is_line){ //it is line, draw a such
       let line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
       //line1.setAttribute('id',id); 
       line1.setAttribute('x1', this.p1.x.toString() );
       line1.setAttribute('y1', this.p1.y.toString() );
      line1.setAttribute('x2', this.p2.x.toString()  );
      line1.setAttribute('y2', this.p2.y.toString() );
      line1.setAttribute('fill', '#000');
      line1.setAttribute('stroke-width', '1');
      //line1.setAttribute('stroke','rgb(0,0,0)');
      line1.setAttribute('stroke', rgb_to_str({r:200,g:200,b:200})); 
      //line1.setAttribute('id',id); // mark as temporary
      //if (vis) line1.setAttribute('visibility', 'visible'); else  line1.setAttribute('visibility', 'hidden');
      svg.appendChild(line1);

      let angle = Math.atan2(this.p2.y-this.p1.y, this.p2.x-this.p1.x);
      svg.appendChild(arrow_str(this.midpoint,angle,this.label));

      const text1 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text1.setAttribute('x', this.midpoint.x.toString());
      text1.setAttribute('y', this.midpoint.y.toString());
      text1.setAttribute('fill', '#000'); //black
      text1.textContent = this.label;
      svg.appendChild(text1);  //text1.textContent = t
      return;
   }
    // svg specification of the arc is A command
    /**
     * rx: The x radius of the ellipse.
      ry: The y radius of the ellipse.
      x-axis-rotation: The rotation of the ellipse in degrees.
      large-this-flag: A boolean value indicating whether to use the larger or smaller this.
      sweep-flag: A boolean value indicating whether to sweep the this in a positive or negative direction.
      x: The x coordinate of the end point of the this.
      y: The y coordinate of the end point of the this.
      // M - move to 
     */
    let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    //console.log();
   // let angle = Math.atan2(this_in.p2.y-this_in.center.y , this_in.p2.x-this_in.center.x);
   // console.log('  drawing this angle='+angle);
    path.setAttribute('d', 'M '+ this.p1.x.toString()+' '+  this.p1.y.toString()  + 
                           ' A '+ this.radius.toString()+ ' '+this.radius.toString()+
                           ' 0 '+ this.large_small.toString()+' ' +
                           this.sweepflag.toString()+' '+
                           this.p2.x.toString()+' '+  this.p2.y.toString());
    path.setAttribute('stroke', rgb_to_str({r:200,g:200,b:200}));
    path.setAttribute('fill', 'none');
    path.setAttribute('id',this.id)
    svg.appendChild(path);
   
    // find direction of arrow
    let gamma = Math.atan2(this.midpoint.y - this.center.y , this.midpoint.x - this.center.x);
    //console.log(' gamma='+gamma*180/Math.PI);
    if ( this.sweepflag == 1){
      gamma = Math.PI/2 - gamma;
    }
    // should point towards p2
    let s = side(this.center,this.midpoint, this.p2);
    //console.log(' gamma='+gamma*180/Math.PI + '  s='+s);
    let angle =0.0;
    if (s){ 
       angle = gamma - Math.PI/2; //,  {r:155,g:155,b:155});
    } else {
       angle = Math.PI - gamma; // ,  {r:155,g:155,b:155});
    }
    // draw arrow
    svg.appendChild(arrow_str(this.midpoint,angle,this.label));

    //draw label
   // svg.drawText(this.midpoint,this.label);
    const text1 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text1.setAttribute('x', this.midpoint.x.toString());
    text1.setAttribute('y', this.midpoint.y.toString());
    text1.setAttribute('fill', '#000'); //black
    text1.textContent = this.label;
    svg.appendChild(text1);  //text1.textContent = t
    
    
  }


  setArcBy3Points(p1:Point2D,p2:Point2D,p3:Point2D){
    // wrong function - should distance between point and line
    // not distance between points
    if ( dist_point_line(p1,p2,p3) < 10){
      this.is_line =true;
      this.midpoint.x = (p1.x+p2.x)/2;
      this.midpoint.y = (p1.y+p2.y)/2;
      return;
    }
    this.is_line = false;
    let cir = new Circle(new Point2D(0,0),0);
    circle_from_points(p1,p2,p3,cir); // for radius
    this.center = cir.center; //xcll; this.center.y = ycll;
    // calculate arc sweep
    // shift and rotate p3 so that p1 is at (0,0) and p2.y=0 , p3->xcl,ycl 
    let alpha = -Math.atan2(p2.y-p1.y,p2.x-p1.x); 
    let xcl = (p3.x-p1.x)*Math.cos(alpha) - (p3.y-p1.y)*Math.sin(alpha);
    let ycl = (p3.y-p1.y)*Math.cos(alpha) + (p3.x-p1.x)*Math.sin(alpha);

    // circle center position - shifted and rotated same way
    let xcll = (cir.center.x-p1.x)*Math.cos(alpha) - (cir.center.y-p1.y)*Math.sin(alpha);
    let ycll = (cir.center.y-p1.y)*Math.cos(alpha) + (cir.center.x-p1.x)*Math.sin(alpha);

    this.radius = dist(p1,this.center);
    // set sweep and large_small selector
    let sw = 0; let ls =0;
    if (ycl < 0) {sw = 1; } // 
    if (sw ==1) {
         ls = 0;
         if (ycll < 0) {ls = 1; }
    } else {
        ls = 1;
         if (ycll < 0) {ls = 0; }
    }
    this.large_small = ls;
    this.sweepflag = sw;
    // arc midpoint coordinates
  //    console.log(' xcl='+xcl+' ycl='+xcl);
  //    console.log(' xcll='+xcll+' ycll='+xcll);
    let xmpconv = xcll;
    let ympconv = 0.0;
    if (sw==1){
         ympconv = ycll - this.radius;
    } else{
        ympconv = ycll + this.radius;
    }
      // rotatw
    let xmp = xmpconv*Math.cos(-alpha) - ympconv*Math.sin(-alpha);
    let ymp = ympconv*Math.cos(-alpha) + xmpconv*Math.sin(-alpha);
    this.midpoint.x = xmp + p1.x;
    this.midpoint.y = ymp + p1.y;
        
  }

  
}; // end of Arc class



class SVG {
    width:number;
    height:number;
    arcs: Arc[];
    svg:SVGSVGElement;

  constructor(width:number, height:number) {
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('width', width.toString());
    this.svg.setAttribute('height', height.toString());
    this.width = width;
    this.height = height;
    this.arcs = new Array();
  }

  // very slow!
  clear(){
	  //this.parentNode.removeChild(this);
	   while(this.svg.lastChild){
		   this.svg.removeChild(this.svg.lastChild); 
	   }
  }

  add_arc(arc:Arc){
     this.arcs.push(arc);
  }

  // find arc with this id and change its midpoint
  changeArcById(id:string, cursor_point:Point2D){
  for (let i = 0 ; i < this.arcs.length ; i++){
      console.log("i="+i + '  this.arcs.id'+this.arcs[i].id); 
      
      if (this.arcs[i].id == id){
        console.log("arc found");
        this.arcs[i].setArcBy3Points(this.arcs[i].p1,
                                     this.arcs[i].p2,
                                        cursor_point);
        this.arcs[i].drawArc(this.svg);
      }
    }
  }
  

  // draws oriented rectangle
  drawArrow(p:Point2D,angle:number,color:RGB,id1:string){
	  var arr = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');

    let p1 = new Point2D(p.x, p.y+5);
    let p2 = new Point2D(p.x, p.y-5);
    let p3 = new Point2D(p.x+15,p.y);
    p1.rotate(p,angle);
    p2.rotate(p,angle);
    p3.rotate(p,angle);
    // 
    let xy_str = p1.x.toString()+ ' '+ p1.y.toString()+' '+
                 p2.x.toString()+ ' '+ p2.y.toString()+' '+
                 p3.x.toString()+ ' '+ p3.y.toString();
    arr.setAttribute('points', xy_str);
    arr.setAttribute('stroke', rgb_to_str(color) );
    arr.setAttribute('stroke-width', '2');
    arr.setAttribute('fill', rgb_to_str(color) );
    arr.setAttribute('id', id1 );
    
    this.svg.appendChild(arr);
  }

  changeArrowById(p_new:Point2D,angle_new:number,id:string){
    for (let i = 0 ; i < this.svg.children.length ; i++){
      if (this.svg.children[i].id == id){
        this.svg.children[i].setAttribute('id',id);
        // arrow?
      }
    }


  }

  drawLine(p1:Point2D,p2:Point2D,red:number,green:number,blue:number,id:string,vis:boolean){
	  var line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line1.setAttribute('id',id); 
    line1.setAttribute('x1', p1.x.toString() );
    line1.setAttribute('y1', p1.y.toString() );
    line1.setAttribute('x2', p2.x.toString()  );
    line1.setAttribute('y2', p2.y.toString() );
    line1.setAttribute('fill', '#000');
    line1.setAttribute('stroke-width', '1');
    line1.setAttribute('stroke','rgb(0,0,0)');
    line1.setAttribute('stroke', 'rgb('+red.toString()+', '+green.toString() +','+blue.toString()+') '); 
    line1.setAttribute('id',id); // mark as temporary
    if (vis) line1.setAttribute('visibility', 'visible'); else  line1.setAttribute('visibility', 'hidden');
    this.svg.appendChild(line1);
  }
  
  setLineById(id:string,p1:Point2D,p2:Point2D){
    for (let i = 0 ;  i < this.svg.children.length ; i++){
       if (this.svg.children[i].id == id){
          this.svg.children[i].setAttribute('x1', p1.x.toString());
          this.svg.children[i].setAttribute('y1', p1.y.toString());
          this.svg.children[i].setAttribute('x2', p2.x.toString());
          this.svg.children[i].setAttribute('y2', p2.y.toString());
       }
    }
  }

  drawText(p:Point2D, t:string) {
    const text1 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text1.setAttribute('x', p.x.toString());
    text1.setAttribute('y', p.y.toString());
    text1.setAttribute('fill', '#000'); //black
    text1.textContent = t;
    this.svg.appendChild(text1);  //text1.textContent = t;  	
  }

  drawCircle(cent:Point2D, r:number,sred:number,sgreen:number,sblue:number,fred:number,fgreen:number,fblue:number) {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', cent.x.toString());
    circle.setAttribute('cy', cent.y.toString());
    circle.setAttribute('r', r.toString());
    circle.setAttribute('stroke', `rgb(${sred}, ${sgreen}, ${sblue})`);
    circle.setAttribute('fill', `rgb(${fred}, ${fgreen}, ${fblue})`);
    this.svg.appendChild(circle);
  }
  
  /*
  // ps - start point, pf - finish point
  drawthis(this_in){
    //This will draw an this from (10,10) to (90,90) with a radius of 90.
    // A command
    // rx: The x radius of the ellipse.
    //ry: The y radius of the ellipse.
    //x-axis-rotation: The rotation of the ellipse in degrees.
    //large-this-flag: A boolean value indicating whether to use the larger or smaller this.
    //sweep-flag: A boolean value indicating whether to sweep the this in a positive or negative direction.
    //x: The x coordinate of the end point of the this.
    //y: The y coordinate of the end point of the this.
    // M - move to 
     
    let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    console.log(this_in);
   // let angle = Math.atan2(this_in.p2.y-this_in.center.y , this_in.p2.x-this_in.center.x);
   // console.log('  drawing this angle='+angle);
    path.setAttribute('d', 'M '+ this_in.p1.x.toString()+' '+  this_in.p1.y.toString()  + 
                           ' A '+ this_in.radius.toString()+ ' '+this_in.radius.toString()+
                           ' 0 '+this_in.large_small.toString()+' ' + this_in.sweepflag+' '+
                           this_in.p2.x.toString()+' '+  this_in.p2.y.toString());
    path.setAttribute('stroke', 'black');
    path.setAttribute('fill', 'none');
    path.setAttribute('id',this_in.id)
    this.svg.appendChild(path);

    // find direction of arrow
    let gamma = Math.atan2(this_in.midpoint.y - this_in.center.y , this_in.midpoint.x - this_in.center.x);
    //console.log(' gamma='+gamma*180/Math.PI);
    if ( this_in.sweepflag == 1){
      gamma = Math.PI/2 - gamma;
    }
    // should point towards p2
    let s = side(this_in.center,this_in.midpoint, this_in.p2);
    //console.log(' gamma='+gamma*180/Math.PI + '  s='+s);
    if (s>0){ 
       this.drawArrow(this_in.midpoint,  gamma - Math.PI/2,  {r:155,g:155,b:155});
    } else {
      this.drawArrow(this_in.midpoint, Math.PI - gamma,  {r:155,g:155,b:155});
    }
  }

  changethisById(id,new_this){
    let new_d = 'M '+ new_this.p1.x.toString()+' '+  new_this.p1.y.toString()  + 
                ' A '+ new_this.radius.toString()+ ' '+ new_this.radius.toString()+
                ' 0 ' + new_this.large_small.toString()+' ' + new_this.sweepflag+' '+
                 new_this.p2.x.toString()+' '+  new_this.p2.y.toString();

    for (let i = 0 ; i < this.svg.children.length ; i++){
      if (this.svg.children[i].id == id){
        this.svg.children[i].setAttribute('d',new_d);
        // arrow?
      }
    }
  }
  */
  
  drawRect(xc:number,yc:number,h:number,w:number,s_r:number,s_g:number,s_b:number,f_r:number,f_g:number,f_b:number){
   var r1 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
   r1.setAttribute('x', xc.toString());
   r1.setAttribute('y', yc.toString());
   r1.setAttribute('height', h.toString());
   r1.setAttribute('width', w.toString());
   r1.setAttribute('fill',  'rgb('+f_r.toString()+', '+f_g.toString() +','+f_b.toString()+') ');
   r1.setAttribute('stroke-width', '1');
   r1.setAttribute('stroke', 'rgb('+s_r.toString()+', '+s_g.toString() +','+s_b.toString()+') '); 
   this.svg.appendChild(r1);
}
  
  drawPolyline(xy_str:string,color:RGB){
	  const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    //let xy_str = neuron_output_graph( weight, bias, -10.0, 10.0 );
    poly.setAttribute('points', xy_str);
    poly.setAttribute('stroke', 'rgb('+color.r.toString()+', '+color.g.toString() +','+color.b.toString()+') ');
    poly.setAttribute('stroke-width', '2');
    poly.setAttribute('fill', 'none');
    this.svg.appendChild(poly);
  }

  /*
  drawGraphs(graphs){
    let margin = 30;
    this.drawRect(0,0,this.width,this.height,0,0,0,255,255,255); //outer
    this.drawRect(margin,margin,this.width-2*margin,this.height-2*margin,0,0,0,255,255,255);
    //console.log('graphs_length='+graphs.length);
    let x_min = 10000.0;
    let y_min = 10000.0;
    let x_max = 0.0;
    let y_max = 0.0;
    
    for ( let i = 0; i< graphs.length ; i++){
      //console.log('x= '+graphs[i].x);
      //console.log('y= '+graphs[i].y);

      let x_min0 = Math.min( ...graphs[i].x);
      let x_max0 = Math.max( ...graphs[i].x);
      let y_min0 = Math.min( ...graphs[i].y);
      let y_max0 = Math.max( ...graphs[i].y);

      if (x_min0<x_min) x_min = x_min0;
      if (y_min0<y_min) y_min = y_min0;
      if (x_max0>x_max) x_max = x_max0;
      if (y_max0>y_max) y_max = y_max0;
    }
    //console.log('min_max='+x_min+' '+x_max+' '+y_min+' '+y_max );
    this.drawText(0,margin,y_max.toFixed(2).toString());
    this.drawText(0, this.height - margin,y_min.toFixed(2).toString());

    this.drawText(margin, this.height-margin/2,x_min.toFixed(2).toString());
    this.drawText(this.width -margin, this.height-margin/2, x_max.toFixed(2).toString());
 
       
    let x_scale = (this.width-2*margin) / (x_max-x_min);
    let y_scale = (this.height-2*margin)/(y_max-y_min);
    for ( let i = 0; i< graphs.length ; i++){
      let plot_str = '';
      for (let j = 0; j < graphs[i].x.length ; j++){
        let x1 = margin + graphs[i].x[j]*x_scale;
        let y1 = this.height- margin -(graphs[i].y[j]-y_min)*y_scale;
        //console.log(' i='+i+' x= '+ graphs[i].x[j]+' y= '+ graphs[i].y[j] +' x1= '+ x1+' y1= '+ y1 );
        plot_str = plot_str+x1.toString()+" "+y1.toString()+' ';
     }
     //console.log('plot_str:'+plot_str);
     this.drawPolyline(plot_str,graphs[i].color);
    }
                  
  }
*/
  drawSurface(x0:number,x1:number,dx:number,y0:number,y1:number,dy:number,z_arr:number[]){
    //let svg_width  = this.svg.width;
    //let svg_height = this.svg.height;
    let svg_width:number  = Number(this.svg.getAttribute('width'));
    let svg_height:number = Number(this.svg.getAttribute('height'));
    let margin = 30;

    // draw border rectangle
    this.drawRect(0,0,svg_height,svg_width,0,0,0,255,255,255);
    // axes text
    this.drawText(new Point2D(svg_width/2 , svg_height-margin/2), "x1")
    this.drawText(new Point2D(0 , svg_height/2), "x2")
    
    // draw surface
    let x_scale = (svg_width-2*margin)/(x1-x0);
    let y_scale = (svg_height-2*margin)/(y1-y0);
    let w = (svg_width -2*margin)/ ((x1-x0)/dx); 
    let count = 0;
    for (let x = x0 ; x < x1 ; x = x + dx){
      for (let y = y0 ; y < y1 ; y = y + dy){
          let z = z_arr[count];
          let xc = margin + x*x_scale;
          let yc = svg_height - 1.5*margin - y*y_scale;
         
          let red = z*255;
          let blue = 255*(1-z);
          //console.log(xc+" "+yc+" "+ z.toString())
          let colour  = 'rgb('+red.toString()+',0,'+blue.toString()+')';
          this.drawRect(xc,yc,w,w,red,0,blue,red,0,blue);
          count++;        
      }
    }
 }  


  
} // class end 
/*
const mySVG = new SVG(200, 200);
mySVG.drawCircle(100, 100, 50, 255, 0, 0);

const svgDiv = document.getElementById('mySVGDiv');
svgDiv.appendChild(mySVG.svg);
*/
