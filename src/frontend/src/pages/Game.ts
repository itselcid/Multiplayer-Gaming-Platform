/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Game.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ckhater <ckhater@student.42.fr>            +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/27 01:44:47 by ckhater           #+#    #+#             */
/*   Updated: 2026/01/06 08:32:13 by ckhater          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


import { addElement, Component } from "../core/Component";
import { Engine,Scene,HemisphericLight,Vector3,MeshBuilder, StandardMaterial, Color3,Color4,UniversalCamera} from "@babylonjs/core";
import "@babylonjs/inspector";
import * as GUI from "@babylonjs/gui";
import { io , Socket } from 'socket.io-client'


export class Game extends Component {
	private socket: Socket;
	private mode: string;
	private scoreL!: HTMLDivElement;
	private scoreR!: HTMLDivElement;
	private	scene!: Scene ;
	private engine!: Engine ;
	private camera!: UniversalCamera;
	private input = { leftUp: false, leftDown: false,rightUp: false , rightDown:false, 
		left:0, right:0 ,min:1, sec:30 , timeout: true};
	
	constructor(flag: string) {
		super('div', 'px-25 py-20');
		this.socket = io('http://localhost:3500');
		this.mode = flag;
	}

	render() {
		const container = document.createElement("div");
		container.classList.add("flex","flex-col" ,"items-center");
		const	timer = document.createElement("div");
		timer.classList.add("mb-2", "text-center");
		const scoreRow = document.createElement("div");
		scoreRow.classList.add("flex", "justify-between","w-full");
		this.scoreL =document.createElement("div");
		this.scoreL.classList.add("w-1/2", "text-center");
		this.scoreR =document.createElement("div");
		this.scoreR.classList.add("w-1/2","text-center");
		scoreRow.appendChild(this.scoreL);
		scoreRow.appendChild(this.scoreR);
		container.appendChild(timer);
		container.appendChild(scoreRow)	
		this.el.appendChild(container);
		const canvas = addElement('canvas','w-1/2 h-1/2',container) as HTMLCanvasElement;
		canvas.style.outline = "none" ;
        canvas.id = "renderCanvas";
		canvas.style.marginTop = "10px";
		canvas.width = 2000;
		canvas.height = 900;

		this.engine = new Engine(canvas, true);
		this.scene = new Scene(this.engine);
		this.scene.clearColor = new Color4(0,0.1,0.25,0.625);
		const	setCamera = new Vector3(0,0,0);
		this.camera = new UniversalCamera("camera", new Vector3(0,0,-22), this.scene);
		this.camera.setTarget(setCamera);
		this.camera.inputs.clear();
		this.camera.fov = 0.785;
        var light = new HemisphericLight("light", new Vector3(0, 0, -5), this.scene);
		light.intensity = 0.82;
		var path: Vector3[] = [
			new Vector3(0,-1.3,0),
			new Vector3(0,1.3,0),
		];
		var ball = MeshBuilder.CreateSphere("ball",{diameter:0.8});
		ball.position = Vector3.Zero();
		ball.material = new StandardMaterial("matball",this.scene);
		(ball.material as StandardMaterial).diffuseColor = new Color3(0.95,0.35,1);
		var paddleLeft = MeshBuilder.CreateTube("paddleLeft",{path: path, radius: 0.15},this.scene);
		paddleLeft.position = new Vector3(-20,0,0);
		paddleLeft.material = new StandardMaterial("matLeft",this.scene);
		(paddleLeft.material as StandardMaterial).diffuseColor = new Color3(0, 0.795, 1);
		var paddleRight = MeshBuilder.CreateTube("paddleRight",{path: path, radius: 0.15},this.scene);
		paddleRight.position = new Vector3(20,0,0);
		paddleRight.material = new StandardMaterial("matRight",this.scene);
		(paddleRight.material as StandardMaterial).diffuseColor = new Color3(0, 0.795, 1);
		
		
		const handlekeycahnge = (event : KeyboardEvent , isDown: boolean)=>{
			const key = event.key;
			if(this.mode === "local"){
				if (key == "W" || key == "w") this.input.leftUp = isDown;
				if (key === "s" || key === "S") this.input.leftDown = isDown;
			}
			if (key === "ArrowUp") this.input.rightUp = isDown;
			if (key === "ArrowDown") this.input.rightDown = isDown;
			event.preventDefault()
			
		};
		window.addEventListener('keydown', (event)=>handlekeycahnge(event,true));
		window.addEventListener('keyup', (event)=>handlekeycahnge(event,false));
		this.socket.emit(this.mode);
		if(this.mode === "remote"){

		}
		else{
			
			const id = setInterval(() => {
				this.socket.emit(this.mode);
				this.socket.emit('input', this.input)
			}, 1000 / 64)
		
			this.socket.on('state', (state) => {
			  paddleLeft.position.y = state.paddleLeftY
			  paddleRight.position.y = state.paddleRightY
			  ball.position.x = state.ballx;
			  ball.position.y = state.bally
			
			  this.scoreL.innerText = `Player- ${state.left}`
			  this.scoreR.innerText = `${state.right} -Player`;
			  timer.innerText = `${String(Math.max(0,state.min)).padStart(2,"0")}:${String(Math.max(0,state.sec)).padStart(2,"0")}`
			  if(state.min == 0 && state.sec == 10)
				timer.classList.add("text-red-600");
			  if(state.min == 0 && state.sec == 0)
				this.input.timeout = false;
			  if(state.min <= 0 && state.sec <= 0 && state.right != state.left){this.cleardata(id);return;}
			  if(state.min <= 0 && state.sec <= 0 && this.input.right == this.input.left){
				if(this.roundtwo(state)){
					this.cleardata(id);return;}}
			  
			})
			//  if(state.min <= 0 && state.sec <= 0 && state.right != state.left){
			// 	if(this.roundtwo(state)){
			// 		this.cleardata(id);return;}}
			  
			// })
				this.engine.runRenderLoop(() => {
					this.scene.render();
				});
		}
	}

	cleardata(id : number){
		clearInterval(id);
		this.socket.off('state');
		  this.socket.disconnect();
		  this.engine.stopRenderLoop();
		  this.scene.dispose();
		  this.engine.dispose();
		  this.el.classList.remove("container");
		  this.el.classList.add("text-4xl","text-center");
		  this.el.textContent = "GAME OVER";
	}

	roundtwo(state:any){
		const temp = this.scoreL.innerText;
		this.scoreL.innerText = this.scoreR.innerText;
		this.scoreR.innerText = temp;

if (this.camera.position._z == -22) {
	this.socket.emit("pause"); 
        const targetZ = 22;
		// const targetY = 0;
        const step = 0.1;
		// this.camera.position.y = 10;
        const intervalId = setInterval(() => {
            if (this.camera.position._z < targetZ) {
                this.camera.position.z += step; 
				this.camera.setTarget(Vector3.Zero());
            }
			//    if (this.camera.position._y > targetY) {
            //     this.camera.position.y -= step; 
			// 	this.camera.setTarget(Vector3.Zero());
            // }
			 else{
                clearInterval(intervalId);
                // this.camera.setTarget(Vector3.Zero());
                this.startCountdown(() => {
                    this.socket.emit("resume");
                });
            }
        }, 100); 
    }
		
		if(state.right != state.left)
			return true;
		return false;
	}

	
startCountdown(onFinish: () => void) {
  const ui = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, this.scene);

  const text = new GUI.TextBlock();
  text.color = "white";
  text.fontSize = 120;
  ui.addControl(text);

  let count = 3;
  text.text = count.toString();

  const interval = setInterval(() => {
    count--;
    text.text = count.toString();

    if (count === 0) {
      clearInterval(interval);
      ui.dispose();
      onFinish();
    }
  }, 2000);
	// this.input.stop = false;
}
	
}
