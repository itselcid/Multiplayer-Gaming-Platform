/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Game.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ckhater <ckhater@student.42.fr>            +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/27 01:44:47 by ckhater           #+#    #+#             */
/*   Updated: 2026/01/12 04:20:03 by ckhater          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


import { addElement, Component } from "../core/Component";
import { Engine,Scene,ShadowGenerator,Vector3,MeshBuilder, StandardMaterial, 
	Color3,Color4,UniversalCamera,SpotLight} from "@babylonjs/core";
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
	private vision!:number;
	private input = { leftUp: false, leftDown: false,rightUp: false , rightDown:false, 
		left:0, right:0 ,min:1, sec:30 , timeout: true};
	
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
		const canvas = addElement('canvas','w-full h-full',container) as HTMLCanvasElement;
		canvas.style.outline = "none" ;
        canvas.id = "renderCanvas";
		canvas.style.marginTop = "10px";
		canvas.width = 2000;
		canvas.height = 900;

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
		
		var light = new SpotLight("light",new Vector3(0,25,-40),new Vector3(1,-1,1),Math.PI/2,1,this.scene);
		light.setDirectionToTarget(Vector3.Zero());
		light.intensity = 1.4;
		
		var ball = MeshBuilder.CreateSphere("ball",{diameter:0.8, segments:64});
		ball.position = new Vector3(0,0,0.04);
		ball.material = new StandardMaterial("matball",this.scene);
		(ball.material as StandardMaterial).diffuseColor = new Color3(0.75,0.75,0.75);
		(ball.material as StandardMaterial).specularColor = new Color3(0.5,0.5,0.5);
		
		
		var paddleLeft = MeshBuilder.CreateBox("paddLeft",{width:0.20,height:2.4,size:0.4},this.scene);
		paddleLeft.position = new Vector3(-18.1,0,0.2);
		paddleLeft.material = new StandardMaterial("matLeft",this.scene);
		(paddleLeft.material as StandardMaterial).diffuseColor = new Color3(0.3, 0.485, 0.678);
		
		
		
		
		var paddleRight = MeshBuilder.CreateBox("paddRight",{width:0.20,height:2.4,size:0.4},this.scene);
		paddleRight.position = new Vector3(18.1,0,0.2);
		paddleRight.material = new StandardMaterial("matRight",this.scene);
		(paddleRight.material as StandardMaterial).diffuseColor = new Color3(0.85, 0.023, 0.395);
		
		const shadowGenerator = new ShadowGenerator(1024, light);
		shadowGenerator.addShadowCaster(ball);
		shadowGenerator.addShadowCaster(paddleLeft);
		shadowGenerator.addShadowCaster(paddleRight);
		shadowGenerator.blurKernel = 64;
		shadowGenerator.useBlurExponentialShadowMap = true;		
		shadowGenerator.setDarkness(0.35);

		const ground = MeshBuilder.CreatePlane("ground",{width:36.83,height:16.3},this.scene);
		ground.position = new Vector3(0,0,0.4);
		ground.material = new StandardMaterial("mground",this.scene);
		(ground.material as StandardMaterial).diffuseColor = new Color3(0, 0.133, 0.371);
		(ground.material as StandardMaterial).backFaceCulling = false;
		(ground.material as StandardMaterial).specularColor = new Color3(0.3,0.3,0.3);
		ground.receiveShadows = true;
		
		const line1 = MeshBuilder.CreateBox("line1",{width:36.83,height:0.2,size:0.4},this.scene);
		line1.position = new Vector3(0,8.1,0.2);
		line1.material = new StandardMaterial("mtest",this.scene);
		(line1.material as StandardMaterial).diffuseColor = new Color3(0, 0.133, 0.371);
		(line1.material as StandardMaterial).specularColor = new Color3(0.5,0.5,0.5);
		const line2 = MeshBuilder.CreateBox("line2",{width:36.83,height:0.2,size:0.4},this.scene);
		line2.position = new Vector3(0,-8.1,0.2);
		line2.material = new StandardMaterial("mtest",this.scene);
		(line2.material as StandardMaterial).diffuseColor = new Color3(0, 0.133, 0.371);
		(line2.material as StandardMaterial).specularColor = new Color3(0.5,0.5,0.5);
		const line3  = MeshBuilder.CreateBox("line3",{width:0.2,height:16,size:0.4},this.scene);
		line3.position = new Vector3(18.32,0,0.2);
		line3.material = new StandardMaterial("mtest",this.scene);
		(line3.material as StandardMaterial).diffuseColor = new Color3(0, 0.133, 0.371);
		(line3.material as StandardMaterial).specularColor = new Color3(0.5,0.5,0.5);
		const line4  = MeshBuilder.CreateBox("line4",{width:0.2,height:16,size:0.4},this.scene);
		line4.position = new Vector3(-18.32,0,0.2);
		line4.material = new StandardMaterial("mtest",this.scene);
		(line4.material as StandardMaterial).diffuseColor = new Color3(0, 0.133, 0.371);
		(line4.material as StandardMaterial).specularColor = new Color3(0.5,0.5,0.5);


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
		const handlevision = (event : KeyboardEvent)=>{
			const key = event.key;
			if (key === "v" || key === "V"){
				this.vision++;
				if (this.vision % 3 == 0){
					this.camera.position = new Vector3(0,0,-30);
					light.position = new Vector3(0,0,-40);
				}
				else if (this.vision % 3 == 1){
					this.camera.position = new Vector3(0,-10,-25);
					light.position = new Vector3(0,10,-40);
				}
				else if (this.vision % 3 == 2){
					this.camera.position = new Vector3(0,-25,-15);
					light.position = new Vector3(0,25,-40);
					
				}
				this.camera.setTarget(Vector3.Zero());
				light.setDirectionToTarget(Vector3.Zero());
			};
			event.preventDefault()
			// if (key === "ArrowLeft"){if(this.camera.position._x < 14){this.camera.position.x += 1; this.camera.setTarget(Vector3.Zero());}};
			// if (key === "ArrowRight"){if(this.camera.position._x > -14){this.camera.position.x -= 1; this.camera.setTarget(Vector3.Zero());}};
			// if (key === '-'){if(this.camera.position._z > -50){this.camera.position.z -= 1; this.camera.setTarget(Vector3.Zero());}};
			// if (key === '+'){if(this.camera.position._z < -25){this.camera.position.z += 1; this.camera.setTarget(Vector3.Zero());}};
		};
		window.addEventListener('keydown', (event)=>handlekeycahnge(event,true));
		window.addEventListener('keydown', (event)=>handlevision(event));
		window.addEventListener('keyup', (event)=>handlekeycahnge(event,false));

		
		
		this.socket.emit(this.mode);
		   this.startCountdown(() => {this.socket.emit("resume")});
		if(this.mode === "remote"){

		}
		else{
			
			const id = window.setInterval(() => {
				// this.socket.emit(this.mode);
				this.socket.emit('input', this.input)
			}, 1000 / 60)
		
			this.socket.on('state', (state) => {
			  paddleLeft.position.y = state.paddleLeftY
			  paddleRight.position.y = state.paddleRightY
			  ball.position.x = state.ballx;
			  ball.position.y = state.bally;
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
				this.engine.runRenderLoop(() => {
					this.scene.render();
				});
		}
	}

	cleardata(id : number){
		window.clearInterval(id);
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
		if(state.right != state.left)
			return true;
		return false;
	}

	
startCountdown(onFinish: () => void) {
	this.socket.emit("pause"); 
  const ui = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, this.scene);

  const text = new GUI.TextBlock();
  text.color = "white";
  text.fontSize = 120;
  ui.addControl(text);

  let count = 3;
  text.text = count.toString();

  const interval = window.setInterval(()  => {
    count--;
    text.text = count.toString();

    if (count === 0) {
      window.clearInterval(interval);
      ui.dispose();
      onFinish();
    }
  }, 2000);
}
	
}


//docker network create gateway
