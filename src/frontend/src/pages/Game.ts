/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Game.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ckhater <ckhater@student.42.fr>            +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/27 01:44:47 by ckhater           #+#    #+#             */
/*   Updated: 2026/01/19 18:39:31 by ckhater          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


import { addElement, Component } from "../core/Component";
import { Engine,Scene,ShadowGenerator,Vector3,MeshBuilder, StandardMaterial, 
	Color3,Color4,UniversalCamera,SpotLight} from "@babylonjs/core";
import "@babylonjs/inspector";
import * as GUI from "@babylonjs/gui";
import { io , Socket } from 'socket.io-client'
import { userState } from "../core/appStore";
import { navigate } from "../core/router";


interface Friend {
  id: number;
  username: string;
  avatar: string;
}

interface Room{
  id?:string;
  player1?:string;
  pid1?:number;
  player2?:string;
  pid2?:number;
}


export class Game extends Component {
	private socket: Socket;
	private scoreL!: HTMLDivElement;
	private scoreR!: HTMLDivElement;
	private nscoL!:number;
	private	nscoR!:number;
	private	scene!: Scene ;
	private engine!: Engine ;
	private camera!: UniversalCamera;
	private user1?: string;
	private user2?:string;
	private vision!:number;
	private	id?:string;
	private role!:string;
	private	room!:Room;
	private input = { leftUp: false, mode: "bot",leftDown: false,rightUp: false , rightDown:false, timeout: true};
	private state = {paddleLeftY: 0, paddleRightY:0, ballx:0, bally:0, left:0, right:0, min:1, sec:30,
		move:false , start:false};
	
	constructor(flag: string, id: string) {
		super('div', 'px-25 py-20');
		this.nscoL = 0;
		this.nscoR = 0;
		this.socket = io(window.location.origin, {
			path: '/socket.io/',
			transports: ['websocket', 'polling']
		});
		this.role = "playerR";
		this.input.mode = flag;
		this.id = id;
		const u = userState.get();
		this.user1 = u?.username ;
		this.user2 = "bot";
		this.vision = 0;
		if(flag === "local")
				this.user2 = "Guest";
	}
	
	async remotehandler(){
			this.room = await new Promise<Room>((resolve) => {
				this.socket.emit('getroom', this.id, resolve);
			});
			this.user2 = this.room.player2;
			if(this.user1 === this.room.player2){
				this.role = "playerL";
			this.user1 = this.room.player1;
			this.user2 = this.room.player2; 
			}
			else if(this.user1 !== this.room.player1 && this.user1 !== this.room.player2){
				this.role = "viewer";
			}
			this.socket.emit('joinroom',this.id,userState.get()?.id);
		
	}
	
	async verify():Promise<boolean>{
	
		const l:boolean = await  new Promise((resolve)=>{
			this.socket.emit('verifyroom',this.id, resolve);
		});
			this.socket.off('verified');
			if(!l)
				this.socket.disconnect();
		return l;
	}
	
	async createroom(friend:Friend):Promise<string>{
		const room : Room = { player1:userState.get()?.username, pid1:userState.get()?.id, 
			player2:friend.username,pid2:friend.id};
			
			this.id = await new Promise((resolve)=>{
				this.socket.emit("setroom",room,resolve);
			});
			this.socket.off('id');	
			this.socket.disconnect();
		return `/game?mode=remote&id=${this.id}`;
	}
	
	async render() {
		if(this.input.mode === "remote")
			await this.remotehandler();
		else
			this.socket.emit("logame");
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
		canvas.width *= 6;
		canvas.height *= 5;

		this.engine = new Engine(canvas, true, {stencil: true,adaptToDeviceRatio: false});
		
		this.scene = new Scene(this.engine);
		this.scene.clearColor = new Color4(0,0,0,0);
		
		const	setCamera = new Vector3(0,0,0);
		this.camera = new UniversalCamera("camera", new Vector3(0,-25,-15), this.scene);
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
		
		
		var paddleLeft = MeshBuilder.CreateBox("paddLeft",{width:0.20,height:2.3,size:0.4},this.scene);
		paddleLeft.position = new Vector3(-18.1,0,0.2);
		paddleLeft.material = new StandardMaterial("matLeft",this.scene);
		(paddleLeft.material as StandardMaterial).diffuseColor = new Color3(0.3, 0.485, 0.678);
		
		
		
		
		var paddleRight = MeshBuilder.CreateBox("paddRight",{width:0.20,height:2.3,size:0.4},this.scene);
		paddleRight.position = new Vector3(18.1,0,0.2);
		paddleRight.material = new StandardMaterial("matRight",this.scene);
		(paddleRight.material as StandardMaterial).diffuseColor = new Color3(0.85, 0.023, 0.395);
		
		const shadowGenerator = new ShadowGenerator(1024, light);
		shadowGenerator.addShadowCaster(ball);
		shadowGenerator.addShadowCaster(paddleLeft);
		shadowGenerator.addShadowCaster(paddleRight);
		shadowGenerator.blurKernel = 16;
		shadowGenerator.useBlurExponentialShadowMap = true;		
		shadowGenerator.setDarkness(0.45);

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
			event.preventDefault();
			if(this.role === "viewer") return;
			const key = event.key.toLowerCase();
			if(this.input.mode === "local"){
				if (key == "w") this.input.leftUp = isDown;
				if (key === "s") this.input.leftDown = isDown;
			}
			if(key === "arrowup"){
				if(this.role === "playerR"){this.input.rightUp = isDown;};
				if(this.role === "playerL")this.input.leftUp = isDown;
			}

			if(key === "arrowdown"){
				if(this.role === "playerR")this.input.rightDown = isDown;
				if(this.role === "playerL")this.input.leftDown = isDown;
			}
    };
		const handlevision = (event : KeyboardEvent)=>{
			if (event.repeat) return;
			const key = event.key.toLowerCase();
			if( key !== "v") return;
			
			this.vision = (this.vision + 1 ) %3;
			if (this.vision  == 0){
				this.camera.position = new Vector3(0,0,-30);
				light.position = new Vector3(0,0,-40);
			}
			else if (this.vision == 1){
				this.camera.position = new Vector3(0,-10,-25);
				light.position = new Vector3(0,10,-40);
			}
			else if (this.vision == 2){
				this.camera.position = new Vector3(0,-25,-15);
				light.position = new Vector3(0,25,-40);
				
			}
			this.camera.setTarget(Vector3.Zero());
			light.setDirectionToTarget(Vector3.Zero());
		};
		
		window.addEventListener('keydown', (event)=>{handlekeycahnge(event,true);handlevision(event);});
		window.addEventListener('keyup', (event)=>handlekeycahnge(event,false));

		const id = window.setInterval(async () => {
			this.state = await new Promise((resolve)=>{this.socket.emit('input', this.input, resolve)})
		if(this.input.mode === "remote" && !this.state.start){
			this.startWaiting();
		}
		paddleLeft.position.y = this.state.paddleLeftY
		paddleRight.position.y = this.state.paddleRightY
		ball.position.x = this.state.ballx;
		ball.position.y = this.state.bally;
		this.scoreL.innerText = `${this.user2}- ${this.state.left}`
		this.scoreR.innerText = `${this.state.right} -${this.user1}`;
		timer.innerText = `${String(Math.max(0,this.state.min)).padStart(2,"0")}:${String(Math.max(0,this.state.sec)).padStart(2,"0")}`;
		if(this.state.min == 0 && this.state.sec <= 10 && !timer.classList.contains("text-red-400"))
			timer.classList.add("text-red-400");
		if(this.state.min == 0 && this.state.sec == 0)
			this.input.timeout = false;
		if(this.state.min == 0 && this.state.sec <= 0 && this.state.right != this.state.left){this.cleardata(id);return;}
		if(this.roundtwo()){
			if(this.state.min == 0 && this.state.sec <= 0 && this.state.right == this.state.left){
			this.cleardata(id);return;}
		}
	}, 1000/30);

		this.engine.runRenderLoop(() => {
			this.scene.render();
		});
	}

	gameOver(){
		const container = document.createElement("div");
		container.className = "fixed inset-0 flex items-center justify-center bg-space-blue/40 backdrop-blur-sm z-50 p-4";	
		container.innerHTML = `
		<div class="bg-white/5 backdrop-blur-xl rounded-2xl flex flex-col gap-6 p-8 border border-white/20 max-w-lg w-full">
		    <h1 class="text-5xl font-bold text-center text-ctex">Game Over</h1>
		    <div class="flex flex-row justify-around items-center gap-8 py-4">
		        <div class="flex flex-col items-center">
		            <h2 class="text-xl opacity-80 text-ctex uppercase tracking-wider">${this.user2}</h2>
		            <span class="text-4xl font-mono font-bold text-ctex">${this.state.left}</span>
		        </div>
			
		        <div class="text-3xl font-light text-white/30">VS</div>
			
		        <div class="flex flex-col items-center">
		            <h2 class="text-xl opacity-80 text-ctex uppercase tracking-wider">${this.user1}</h2>
		            <span class="text-4xl font-mono font-bold text-ctex">${this.state.right}</span>
		        </div>
		    </div>
			
		    <button id="home" class="w-full bg-neon-cyan/20 border border-neon-cyan/50 py-3 rounded-lg text-white font-semibold hover:bg-neon-cyan/40 transition-all duration-300">
		        Return Home
		    </button>
		</div>`;
			
		this.el.append(container);
			
		container.querySelector("#home")?.addEventListener("click", () => { navigate("/home")});
	}
	
	cleardata(id : number){
		window.clearInterval(id);
		this.gameOver();
		this.socket.emit("gameOver");
		this.socket.disconnect();
		this.engine.stopRenderLoop();
		this.scene.dispose();
		this.engine.dispose();
	}

	roundtwo(){
		if(this.state.right != this.state.left)
			return true;
		return false;
	}

	
	startWaiting() {
	  const ui= GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, this.scene);
	  const text = new GUI.TextBlock();
	  text.color = "white";
	  text.fontFamily = "orbitron, sans-serif";
	  text.fontSize = 100;
	  text.width = "500px";
	  text.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
	  text.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
	  text.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
	  text.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
	  ui.addControl(text);
	
	  let i = 0;
	  let count = ["Waiting.", "Waiting..", "Waiting..."];
	  text.text = count[i % 3];
	
	  const id = window.setInterval(()  => {
	    i++;
	    text.text = count[i % 3];
	}, 500);
	this.socket.on('resume', () => {
		window.clearInterval(id);
		ui.dispose();
	});
	}
}


//docker network create gateway
