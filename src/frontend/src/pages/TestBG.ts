import { addElement, Component } from "../core/Component";

export class TestBG extends Component {
	constructor() {
		super('div', 'fixed inset-0 z-0');
	}

	render(): void {
		addElement('div', 'absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-purple-950', this.el);

		const	animation1 = addElement('div', 'absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse', this.el);
		animation1.style = 'animation-duration: 4s;';
		const	animation2 = addElement('div', 'absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse', this.el);
		animation2.style = 'animation-duration: 6s; animation-delay: 1s;';
const	animation3 = addElement('div', 'absolute top-1/2 left-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse', this.el);
		animation3.style = 'animation-duration: 8s; animation-delay: 2s;';

		const	particles = addElement('div', 'absolute inset-0', this.el);
		[...Array(50)].map(() => (
			addElement('div', 'absolute w-1 h-1 bg-cyan-400/40 rounded-full', particles).style = `
			left: ${Math.random() * 100}%;
			top: ${Math.random() * 100}%;
			animation: float ${10 + Math.random() * 20}s linear infinite;
			animation-delay: 0s;
		`))

		const	style = addElement('style', '', this.el);
		style.textContent = `
		@keyframes float {
          0%, 100% { transform: translate(0, 0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translate(${Math.random() * 200 - 100}px, -100vh); opacity: 0; }
        }

		`
	}
}
