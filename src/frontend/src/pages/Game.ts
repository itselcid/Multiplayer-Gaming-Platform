/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Game.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/27 01:44:47 by ckhater           #+#    #+#             */
/*   Updated: 2026/01/12 03:03:19 by kez-zoub         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


import { addElement, Component } from "../core/Component";
import { Engine,Scene,HemisphericLight,Vector3,MeshBuilder, StandardMaterial, Color3,Color4,UniversalCamera, DirectionalLight} from "@babylonjs/core";
import "@babylonjs/inspector";
import * as GUI from "@babylonjs/gui";
import { io , Socket } from 'socket.io-client'
import { userState } from "../core/appStore";


export class Game extends Component {
	private socket: Socket;
	private mode: string;
	private scoreL!: HTMLDivElement;
	private scoreR!: HTMLDivElement;
	private	scene!: Scene ;
	private engine!: Engine ;
	private camera!: UniversalCamera;
	private user1?: string;
	private user2!:string;
	private input = { leftUp: false, leftDown: false,rightUp: false , rightDown:false, 
		left:0, right:0 ,min:1, sec:30 , timeout: true, spot:0};
	
	constructor(flag: string) {
		super('div', 'px-25 py-20');
		// Connect through nginx proxy - use relative path for WebSocket
		this.socket = io(window.location.origin, {
			path: '/socket.io/',
			transports: ['websocket', 'polling']
		});
		this.mode = flag;
		const u = userState.get();
		this.user1 = u?.username ;
		this.user2 = "bot";
		if(flag === "local")
				this.user2 = "Guest";
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
		const canvas = addElement('canvas','w-3/4 h-full',container) as HTMLCanvasElement;
		canvas.style.outline = "none" ;
        canvas.id = "renderCanvas";
		canvas.style.marginTop = "10px";
		canvas.width = 1200;
		canvas.height = 540;

		this.engine = new Engine(canvas, true, { preserveDrawingBuffer: false, stencil: false });
		this.scene = new Scene(this.engine);
		this.scene.skipPointerMovePicking = true;
		this.scene.autoClear = false;
		this.scene.clearColor = new Color4(0,0,0,0);
		const	setCamera = new Vector3(0,0,0);
		this.camera = new UniversalCamera("camera", new Vector3(0,0,-30), this.scene);
		this.camera.setTarget(setCamera);
		this.camera.inputs.clear();
		this.camera.fov = 0.785;
        var lightd = new HemisphericLight("light", new Vector3(0, 0, -40), this.scene);
		lightd.intensity = 0.7
		
		var light = new DirectionalLight("light",new Vector3(0,0,0),this.scene);
		light.intensity = 0.3;

		var ball = MeshBuilder.CreateSphere("ball",{diameter:0.8, segments: 16});
		ball.position = Vector3.Zero();
		ball.material = new StandardMaterial("matball",this.scene);
		(ball.material as StandardMaterial).diffuseColor = new Color3(0.75,0.75,0.75);
		(ball.material as StandardMaterial).specularColor = new Color3(0.85,0.85,0.85);

		var paddleLeft = MeshBuilder.CreateBox("paddLeft",{width:0.20,height:2.4,size:0.35},this.scene);
		paddleLeft.position = new Vector3(-18,0,0);
		paddleLeft.material = new StandardMaterial("matLeft",this.scene);
		(paddleLeft.material as StandardMaterial).diffuseColor = new Color3(0.3, 0.485, 0.678);
		// (paddleLeft.material as StandardMaterial).specularColor = new Color3(0.7,0.7,0.7);
		// var paddleRight = MeshBuilder.CreateCapsule("paddleRight",{ height: 2.4,radius: 0.15,tessellation: 120},this.scene)
		var paddleRight = MeshBuilder.CreateBox("paddRight",{width:0.20,height:2.4,size:0.35},this.scene);
		paddleRight.position = new Vector3(18,0,0);
		
		paddleRight.material = new StandardMaterial("matRight",this.scene);
		(paddleRight.material as StandardMaterial).diffuseColor = new Color3(0.85, 0.023, 0.395);
		// (paddleRight.material as StandardMaterial).specularColor = new Color3(0.7, 0.7, 0.7);

			// const ground = MeshBuilder.CreatePlane("ground",{width:36.83,height:16.3},this.scene);
			const ground = MeshBuilder.CreateGround("ground",{width:36.83,height:16.3, subdivisions:1},this.scene);
			ground.position = new Vector3(0,0,0.45);
			ground.material = new StandardMaterial("mground",this.scene);
			(ground.material as StandardMaterial).diffuseColor = new Color3(0, 0.133, 0.371);
			(ground.material as StandardMaterial).backFaceCulling = false;
			ground.rotation.x = -Math.PI / 2;
			(ground.material as StandardMaterial).specularColor = new Color3(0.15,0.15,0.15);
			// ground.parent = someNode;
			const line1 = MeshBuilder.CreateBox("line1",{width:36.83,height:0.2,size:0.5},this.scene);
			line1.position = new Vector3(0,8.1,0);
			line1.material = new StandardMaterial("mtest",this.scene);
			(line1.material as StandardMaterial).diffuseColor = new Color3(0, 0.133, 0.371);
			const line2 = MeshBuilder.CreateBox("line2",{width:36.83,height:0.2,size:0.5},this.scene);
			line2.position = new Vector3(0,-8.1,0);
			line2.material = new StandardMaterial("mtest",this.scene);
			(line2.material as StandardMaterial).diffuseColor = new Color3(0, 0.133, 0.371);
			const line3  = MeshBuilder.CreateBox("line3",{width:0.2,height:16,size:0.5},this.scene);
			line3.position = new Vector3(18.32,0,0);
			line3.material = new StandardMaterial("mtest",this.scene);
			(line3.material as StandardMaterial).diffuseColor = new Color3(0, 0.133, 0.371);
			const line4  = MeshBuilder.CreateBox("line4",{width:0.2,height:16,size:0.5},this.scene);
			line4.position = new Vector3(-18.32,0,0);
			line4.material = new StandardMaterial("mtest",this.scene);
			(line4.material as StandardMaterial).diffuseColor = new Color3(0, 0.133, 0.371);
		const handlekeycahnge = (event : KeyboardEvent , isDown: boolean)=>{
			const key = event.key;
			if(this.mode === "local"){
				if (key == "W" || key == "w") this.input.leftUp = isDown;
				if (key === "s" || key === "S") this.input.leftDown = isDown;
			}
			if (key === "ArrowUp") this.input.rightUp = isDown;
			if (key === "ArrowDown") this.input.rightDown = isDown;
			// event.preventDefault()
			
		};
		window.addEventListener('keydown', (event)=>{
			handlekeycahnge(event,true);
			this.socket.emit('input', this.input);
		});
		window.addEventListener('keyup', (event)=>{
			handlekeycahnge(event,false);
			this.socket.emit('input', this.input);
		});
		this.socket.emit(this.mode);
		if(this.mode === "remote"){

		}
		else{
			
			const id = setInterval(() => {
				this.socket.emit(this.mode);
			}, 1000 / 60)
		
			this.socket.on('state', (state) => {
			  paddleLeft.position.y = state.paddleLeftY
			  paddleRight.position.y = state.paddleRightY
			  ball.position.x = state.ballx;
			  ball.position.y = state.bally;
			  if(state.spot === 1)
				light.direction = new Vector3(-19,-11,30);
			  else if (state.spot === 2)
				light.direction = new Vector3(19,-11,30);
			  else
				light.direction = Vector3.Zero();
			  this.scoreL.innerText = `${this.user2}- ${state.left}`
			  this.scoreR.innerText = `${state.right} -${this.user1}`;
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
		// const temp = this.scoreL.innerText;
		// this.scoreL.innerText = this.scoreR.innerText;
		// this.scoreR.innerText = temp;

// if (this.camera.position._z == -22) {
// 	this.socket.emit("pause"); 
//         const targetZ = 22;
// 		// const targetY = 0;
//         const step = 0.1;
// 		// this.camera.position.y = 10;
//         const intervalId = setInterval(() => {
//             if (this.camera.position._z < targetZ) {
//                 this.camera.position.z += step; 
// 				this.camera.setTarget(Vector3.Zero());
//             }
// 			//    if (this.camera.position._y > targetY) {
//             //     this.camera.position.y -= step; 
// 			// 	this.camera.setTarget(Vector3.Zero());
//             // }
// 			 else{
//                 clearInterval(intervalId);
//                 // this.camera.setTarget(Vector3.Zero());
//                 this.startCountdown(() => {
//                     this.socket.emit("resume");
//                 });
//             }
//         }, 100); 
//     }
		
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
